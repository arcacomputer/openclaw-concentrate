import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const rows = JSON.parse(readFileSync(new URL('../src/seed.json', import.meta.url)));
const rates = { input: 1, output: 5, cacheRead: 0.1, cacheWrite: 2 };
const config = {
  env: { KEEP_SECRET: '${UNCHANGED}' },
  agents: { defaults: { model: { primary: 'other/primary' }, models: { 'other/primary': {}, 'concentrate/claude-haiku-4-5': { params: { maxTokens: 777 } } } } },
  plugins: { allow: ['other', 'concentrate-provider'], entries: { other: { config: { sentinel: 'keep' } }, 'concentrate-provider': { enabled: true, config: { acknowledgeEstimatedCosts: true, costOverrides: { 'gpt-4.1-mini': { input: 11, output: 22, cacheRead: 3, cacheWrite: 4 } } } } } },
};
const pricing = { routes: { route: { pricing: { tokens: {} }, normalizedBase: { input: 1, output: 5, cacheRead: 0.1, cacheWriteByTTL: { '5m': 1.25, '1h': 2 } } } } };

test('reviewed setup changes selected estimates only and preserves existing configuration', async () => {
  const m = await import('../src/setup.mjs');
  assert.deepEqual(m.selectModels(['claude-haiku-4-5'], rows).map(x => x.id), ['claude-haiku-4-5']);
  assert.deepEqual(m.suggestRates(pricing), rates);
  const plan = m.createSetupPlan({ config, sourceHash: 'snapshot-one', selections: [{ id: 'claude-haiku-4-5', rates }], rows });
  assert.equal(JSON.stringify(plan).includes('UNCHANGED'), false);
  assert.match(plan.reviewToken, /^[a-f0-9]{64}$/);
  const next = structuredClone(config);
  m.applySetupPlan(next, plan);
  assert.deepEqual(next.agents, config.agents);
  assert.deepEqual(next.env, config.env);
  assert.deepEqual(next.plugins.entries.other, config.plugins.entries.other);
  assert.deepEqual(next.plugins.allow, config.plugins.allow);
  assert.deepEqual(next.plugins.entries['concentrate-provider'].config.costOverrides['gpt-4.1-mini'], config.plugins.entries['concentrate-provider'].config.costOverrides['gpt-4.1-mini']);
  assert.deepEqual(next.plugins.entries['concentrate-provider'].config.costOverrides['claude-haiku-4-5'], rates);
  assert.throws(() => m.selectModels([' claude-haiku-4-5'], rows), /exact|model/i);
  assert.throws(() => m.selectModels(['redact-v1'], rows), /eligible|model/i);
  assert.throws(() => m.createSetupPlan({ config, sourceHash: 'snapshot-one', selections: [{ id: 'claude-haiku-4-5', rates: { ...rates, cacheWrite: null } }], rows }), /rate|estimate|cost/i);
  const unrestricted = { plugins: structuredClone(config.plugins) };
  m.applySetupPlan(unrestricted, plan);
  assert.equal(unrestricted.agents, undefined, 'do not turn an unrestricted model catalog into a selected-only allowlist');
});

test('setup preview never writes and headless apply requires the exact reviewed plan', async () => {
  const m = await import('../src/setup.mjs');
  let writes = 0; let snapshot = structuredClone(config);
  const io = { rows, interactive: false, readSnapshot: async () => ({ valid: true, sourceConfig: structuredClone(snapshot), hash: 'snapshot-one' }), pricing: async () => pricing, emit: () => {},
    mutate: async options => { writes++; assert.equal(options.base, 'source'); assert.equal(options.baseHash, 'snapshot-one'); assert.equal(options.afterWrite.mode, 'none'); options.mutate(snapshot); return { persistedHash: 'snapshot-two' }; } };
  const preview = await m.runSetup({ model: ['claude-haiku-4-5'], dryRun: true }, io);
  assert.equal(writes, 0);
  assert.equal(preview.applied, false);
  await assert.rejects(m.runSetup({ model: ['claude-haiku-4-5'], apply: true, acknowledgeEstimates: true, review: 'wrong' }, io), /review/i);
  assert.equal(writes, 0);
  const applied = await m.runSetup({ model: ['claude-haiku-4-5'], apply: true, acknowledgeEstimates: true, review: preview.plan.reviewToken }, io);
  assert.equal(applied.applied, true);
  assert.equal(writes, 1);
  assert.deepEqual(snapshot.plugins.entries['concentrate-provider'].config.costOverrides['claude-haiku-4-5'], rates);
});
