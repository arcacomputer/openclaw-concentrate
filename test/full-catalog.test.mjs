import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projectRows } from '../src/catalog.mjs';
import { createConcentrateProvider, createConcentrateModelCatalog } from '../src/provider.mjs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url)));
const historic = read('./fixtures/catalog.json');
const cost = { input: 1, output: 2, cacheRead: 1, cacheWrite: 2 };
const ctx = { resolveProviderApiKey: () => ({ apiKey: 'synthetic-only' }) };
const sdk = rows => ({ createProviderApiKeyAuthMethod: x => x, getCachedLiveProviderModelRows: async () => rows });

test('full fallback covers all eligible IDs and live metadata still wins for configured models', async () => {
  const seed = read('../src/seed.json');
  const expected = projectRows(historic.data).map(x => x.id).sort();
  const rows = await createConcentrateModelCatalog(sdk([])).staticCatalog({});
  assert.deepEqual(rows.map(x => x.model).sort(), expected);
  assert.equal(rows.some(x => x.model === 'redact-v1'), false);
  assert.equal(rows.every(x => x.source === 'static' && !('cost' in x)), true);
  const original = seed.find(x => x.id === 'gpt-4.1-mini');
  const changed = { ...original, max_tokens: 12345 };
  const config = { acknowledgeEstimatedCosts: true, costOverrides: { [changed.id]: cost } };
  const result = await createConcentrateProvider(sdk([changed]), undefined, config).catalog.run(ctx);
  assert.equal(result.provider.models[0].maxTokens, 12345, 'snapshot must not short-circuit live refresh');
  assert.equal(await createConcentrateProvider(sdk([{ ...changed, id: 'different-live-model' }]), undefined, config).catalog.run(ctx), null);
});
