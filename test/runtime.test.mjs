import test from 'node:test';
import assert from 'node:assert/strict';
import { createConcentrateProvider } from '../src/provider.mjs';
const costs = { input: 11, output: 22, cacheRead: 3, cacheWrite: 4 };
const config = { acknowledgeEstimatedCosts: true, costOverrides: { 'gpt-4.1-mini': costs } };
const sdk = { createProviderApiKeyAuthMethod: x => x, getCachedLiveProviderModelRows: async () => [] };
const ctx = { resolveProviderApiKey: () => ({ apiKey: 'synthetic-not-a-credential' }) };
test('explicit estimates produce runnable Responses models, not catalog-only null', async () => {
  const warnings = [];
  const p = createConcentrateProvider(sdk, x => warnings.push(x), config);
  const result = await p.catalog.run(ctx);
  assert.equal(result.provider.baseUrl, 'https://api.concentrate.ai/v1');
  assert.equal(result.provider.api, 'openai-responses');
  assert.equal(result.provider.models[0].id, 'gpt-4.1-mini');
  assert.match(result.provider.models[0].name, /user cost estimate/);
  assert.deepEqual(result.provider.models[0].cost, costs);
  assert.ok(warnings.some(x => x.includes('not vendor prices')));
  result.provider.models[0].cost.input = 0;
  assert.equal((await p.staticCatalog.run({})).provider.models[0].cost.input, 11);
});
test('estimates require acknowledgement and all four finite nonnegative fields', () => {
  assert.throws(() => createConcentrateProvider(sdk, undefined, { costOverrides: config.costOverrides }), /acknowledge/);
  for (const cost of [{ ...costs, cacheWrite: undefined }, { ...costs, input: NaN }, { ...costs, output: -1 }, { ...costs, cacheRead: null }, { ...costs, input: Infinity }]) {
    assert.throws(() => createConcentrateProvider(sdk, undefined, { ...config, costOverrides: { 'gpt-4.1-mini': cost } }), /cost/);
  }
});
test('explicit user cache zero is allowed, never inferred from omission', async () => {
  const p = createConcentrateProvider(sdk, undefined, { ...config, costOverrides: { 'gpt-4.1-mini': { ...costs, cacheWrite: 0 } } });
  assert.equal((await p.catalog.run(ctx)).provider.models[0].cost.cacheWrite, 0);
});
test('out-of-scope, missing credentials, and cancellation preserve runtime boundaries', async () => {
  const p = createConcentrateProvider(sdk, undefined, config);
  assert.equal(await p.catalog.run({ ...ctx, providerIds: [] }), null);
  assert.equal(await p.catalog.run({ resolveProviderApiKey: () => ({}) }), null);
  assert.equal(await p.staticCatalog.run({ providerIds: [] }), null);
  const c = new AbortController(); c.abort();
  await assert.rejects(p.staticCatalog.run({ signal: c.signal }), { name: 'AbortError' });
});
