import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projectRows } from '../src/catalog.mjs';
import { createConcentrateProvider } from '../src/provider.mjs';

const body = JSON.parse(await readFile(new URL('./fixtures/catalog.json', import.meta.url)));
const sdk = loader => ({ createProviderApiKeyAuthMethod: options => ({ options }), getCachedLiveProviderModelRows: loader });
const ctx = { resolveProviderApiKey: () => ({ apiKey: 'unit-test-only' }) };

test('unknown-cost metadata is not submitted as a runtime model', async () => {
  const warnings = [];
  const p = createConcentrateProvider(sdk(async () => body.data), msg => warnings.push(msg));
  assert.equal(await p.staticCatalog.run({}), null);
  assert.equal(await p.catalog.run(ctx), null);
  assert.equal(p.auth[0].options.defaultModel, undefined);
  assert.ok(warnings.some(w => w.includes('pricing')));
});

test('malformed catalog containers and names cannot break projection', () => {
  for (const rows of [null, undefined, {}, 'invalid']) assert.deepEqual(projectRows(rows), []);
  const good = body.data.find(r => r.id === 'gpt-4.1-mini');
  for (const display_name of [{}, [], 123, '', '  ']) {
    assert.equal(projectRows([{ ...good, display_name }])[0].name, good.id);
  }
});

test('control-plane catalog retains exact metadata with optional costs absent', async () => {
  const { createConcentrateModelCatalog } = await import('../src/provider.mjs');
  let calls = 0;
  const p = createConcentrateModelCatalog(sdk(async options => {
    calls++;
    assert.equal(options.apiKey, undefined);
    assert.equal(options.discoveryApiKey, undefined);
    assert.equal(options.authentication, undefined); // direct row helper takes no mode selector
    return body.data;
  }));
  const offline = await p.staticCatalog({});
  assert.equal(calls, 0);
  assert.ok(offline.length > 0);
  const rows = await p.liveCatalog(ctx);
  assert.equal(rows.length, projectRows(body.data).length);
  assert.equal(calls, 1);
  for (const r of rows) {
    assert.equal(r.kind, 'text');
    assert.equal(r.provider, 'concentrate');
    assert.equal('cost' in r, false);
    assert.ok(r.warnings.some(w => w.includes('unknown')));
  }
});
