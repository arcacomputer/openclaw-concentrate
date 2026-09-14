import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchPublicJson, CATALOG_URL, buildCatalog } from '../src/catalog-maintenance.mjs';
import { suggestRates, selectModels, parseRate, createSetupPlan, runSetup } from '../src/setup.mjs';
import { readFileSync } from 'node:fs';
const rows = JSON.parse(readFileSync(new URL('../src/seed.json', import.meta.url)));

test('public metadata rejects alternate origins, credentials and pre-abort without dispatch', async () => {
  let calls = 0; const fetchImpl = async () => { calls++; return new Response('{}'); };
  for (const url of ['http://api.concentrate.ai/v1/models', 'https://other.example/v1/models', 'https://secret@api.concentrate.ai/v1/models', CATALOG_URL + '?key=value']) await assert.rejects(fetchPublicJson(url, { fetchImpl }));
  const controller = new AbortController(); controller.abort();
  await assert.rejects(fetchPublicJson(CATALOG_URL, { signal: controller.signal, fetchImpl }), { name: 'AbortError' });
  assert.equal(calls, 0);
});

test('public metadata has a body bound, redirect refusal and no credential headers', async () => {
  await assert.rejects(fetchPublicJson(CATALOG_URL, { fetchImpl: async (url, options) => {
    assert.equal(options.headers.Authorization, undefined); assert.equal(options.redirect, 'error'); assert.ok(options.signal);
    return new Response('x'.repeat(1024 * 1024 + 1));
  } }), /1 MiB/);
  await assert.rejects(fetchPublicJson(CATALOG_URL, { fetchImpl: async () => new Response('private failure text', { status: 500 }) }), /Public metadata unavailable/);
});

test('unknown route rates never become free or silently select a cheaper route', () => {
  assert.deepEqual(suggestRates({ routes: {} }), { input: null, output: null, cacheRead: null, cacheWrite: null });
  const a = { normalizedBase: { input: 1, output: 2, cacheRead: 0, cacheWriteByTTL: { a: 3 } } };
  const b = { normalizedBase: { input: 4, output: 5, cacheRead: 1, cacheWriteByTTL: { a: 6, b: 7 } } };
  assert.deepEqual(suggestRates({ routes: { a, b } }), { input: 4, output: 5, cacheRead: 1, cacheWrite: 7 });
  assert.equal(suggestRates({ routes: { a, b: { normalizedBase: { input: null } } } }).input, null);
  for (const x of ['', null, undefined, NaN, Infinity, -1, false, ' 1', '0x10']) assert.throws(() => parseRate(x));
  assert.equal(parseRate('0'), 0);
  assert.throws(() => selectModels(['gpt-4.1-mini', 'gpt-4.1-mini'], rows));
});

test('legacy-active setup is refused and missing estimates never reach mutation', async () => {
  const rates = { input: 1, output: 2, cacheRead: 0, cacheWrite: 3 };
  assert.throws(() => createSetupPlan({ config: { plugins: { entries: { concentrate: { enabled: true } } } }, sourceHash: 's', selections: [{ id: 'gpt-4.1-mini', rates }], rows }), /historical/);
  let writes = 0;
  const io = { rows, interactive: false, readSnapshot: async () => ({ valid: true, hash: 's', sourceConfig: {} }), pricing: async () => ({ routes: {} }), mutate: async () => { writes++; } };
  const preview = await runSetup({ model: ['gpt-4.1-mini'], dryRun: true }, io);
  assert.equal(preview.canApply, false); assert.equal(preview.missingRates.length, 4); assert.equal(writes, 0);
  await assert.rejects(runSetup({ model: ['gpt-4.1-mini'], apply: true, acknowledgeEstimates: true }, io), /Missing cost/);
  assert.equal(writes, 0);
});

test('interactive cancellation leaves configuration unchanged and never calls the writer', async () => {
  let writes = 0; let rateQuestions = 0;
  const io = { rows, interactive: true, readSnapshot: async () => ({ valid: true, hash: 's', sourceConfig: {} }), pricing: async () => ({ routes: {} }), chooseModels: async () => ['gpt-4.1-mini'], askRate: async () => { rateQuestions++; return '1'; }, confirm: async () => false, mutate: async () => { writes++; } };
  const result = await runSetup({}, io);
  assert.equal(result.cancelled, true); assert.equal(rateQuestions, 4); assert.equal(writes, 0);
});
