import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createConcentrateProvider, createConcentrateModelCatalog } from '../src/provider.mjs';

const fixture = JSON.parse(await readFile(new URL('./fixtures/catalog.json', import.meta.url)));
const sdkDouble = loadRows => ({ createProviderApiKeyAuthMethod: options => ({ options }), getCachedLiveProviderModelRows: loadRows });
const context = { resolveProviderApiKey: () => ({ apiKey: 'test-only-not-a-secret' }) };

test('API-key onboarding preserves primary and does not select an unpriced model', () => {
  const p = createConcentrateProvider(sdkDouble(() => { throw Error('must not load'); }));
  assert.equal(p.auth[0].options.envVar, 'CONCENTRATE_API_KEY');
  assert.equal(p.auth[0].options.preserveExistingPrimary, true);
  assert.equal(p.auth[0].options.defaultModel, undefined);
  assert.equal('wrapStreamFn' in p, false);
  assert.equal('resolveDynamicModel' in p, false);
});

test('discovery is scoped and auth-gated; metadata request has no inference credentials', async () => {
  let calls = 0;
  const p = createConcentrateModelCatalog(sdkDouble(async options => {
    calls++;
    assert.equal(options.endpoint, 'https://api.concentrate.ai/v1/models');
    assert.equal(options.requireHttps, true);
    assert.equal(options.apiKey, undefined);
    assert.equal(options.discoveryApiKey, undefined);
    assert.equal(options.profileId, undefined);
    assert.equal(options.timeoutMs, 5000);
    assert.equal(options.ttlMs, 60000);
    assert.equal(options.shouldCacheRows(null), false);
    assert.equal(options.shouldCacheRows([]), false);
    assert.equal(options.shouldCacheRows(fixture.data), true);
    return fixture.data;
  }));
  const neverResolve = { resolveProviderApiKey: () => { throw Error('out of scope'); } };
  for (const providerIds of [[], ['unrelated']]) {
    assert.equal(await p.liveCatalog({ ...neverResolve, providerIds }), null);
    assert.equal(await p.staticCatalog({ ...neverResolve, providerIds }), null);
  }
  assert.equal(await p.liveCatalog({ resolveProviderApiKey: () => ({}) }), null);
  assert.equal(calls, 0);
  const rows = await p.liveCatalog(context);
  assert.ok(rows.length > 1);
  assert.ok(rows.every(r => r.source === 'live' && !('cost' in r) && !('apiKey' in r)));
  assert.equal(calls, 1);
});

test('offline fallback is network-free, fresh, and logs only a fixed safe warning', async () => {
  const warnings = [];
  let calls = 0;
  const p = createConcentrateModelCatalog(sdkDouble(async () => { calls++; throw Error('sensitive upstream body'); }), msg => warnings.push(msg));
  const offline = await p.staticCatalog({});
  assert.equal(calls, 0);
  assert.equal(offline[0].model, 'gpt-4.1-mini');
  const fallback = await p.liveCatalog(context);
  assert.deepEqual(fallback, offline);
  fallback[0].capabilities.input.push('mutated');
  fallback[0].warnings.push('mutated');
  assert.deepEqual(await p.staticCatalog({}), offline);
  assert.equal(warnings.length, 1);
  assert.ok(!warnings[0].includes('sensitive'));
});

test('empty and malformed metadata fall back to explicitly static rows', async () => {
  for (const rows of [[], null, undefined, {}, [{ id: 'broken' }]]) {
    const p = createConcentrateModelCatalog(sdkDouble(async () => rows));
    assert.deepEqual(await p.liveCatalog(context), await p.staticCatalog({}));
  }
});

test('pre-aborted catalogs do not resolve credentials or fetch', async () => {
  const controller = new AbortController(); controller.abort();
  const p = createConcentrateModelCatalog(sdkDouble(() => { throw Error('must not fetch'); }));
  const ctx = { signal: controller.signal, resolveProviderApiKey: () => { throw Error('must not resolve'); } };
  await assert.rejects(p.liveCatalog(ctx), { name: 'AbortError' });
  await assert.rejects(p.staticCatalog(ctx), { name: 'AbortError' });
});

test('abort during successful or failed acquisition propagates without fallback warning', async () => {
  for (const fails of [false, true]) {
    const controller = new AbortController();
    const warnings = [];
    const p = createConcentrateModelCatalog(sdkDouble(async () => {
      controller.abort();
      if (fails) throw Error('upstream');
      return fixture.data;
    }), msg => warnings.push(msg));
    await assert.rejects(p.liveCatalog({ ...context, signal: controller.signal }), { name: 'AbortError' });
    assert.deepEqual(warnings, []);
  }
});

test('runtime pricing gate never fetches and observes auth, scope and cancellation', async () => {
  let warnings = 0;
  const p = createConcentrateProvider(sdkDouble(() => { throw Error('must not fetch'); }), () => warnings++);
  assert.equal(await p.catalog.run({ ...context, providerIds: [] }), null);
  assert.equal(await p.catalog.run({ resolveProviderApiKey: () => ({}) }), null);
  assert.equal(warnings, 0);
  assert.equal(await p.catalog.run(context), null);
  assert.equal(warnings, 1);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(p.catalog.run({ ...context, signal: controller.signal }), { name: 'AbortError' });
});
