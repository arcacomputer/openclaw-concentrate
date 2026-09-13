import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createConcentrateProvider } from '../src/provider.mjs';
const cost = { input: 1, output: 2, cacheRead: 1, cacheWrite: 2 };
const ctx = { resolveProviderApiKey: () => ({ apiKey: 'fixture-only' }) };
const sdk = rows => ({ createProviderApiKeyAuthMethod: x => x, getCachedLiveProviderModelRows: async () => rows });
const config = { acknowledgeEstimatedCosts: true, costOverrides: { 'gpt-4.1-mini': cost, 'unlisted-model': cost } };

for (const [label, rows] of [['empty', []], ['unusable', [{}]]]) {
  test(`runtime retains the configured bundled model on ${label} live metadata`, async () => {
    const warnings = [];
    const p = createConcentrateProvider(sdk(rows), x => warnings.push(x), config);
    const result = await p.catalog.run(ctx);
    assert.deepEqual(result?.provider.models.map(m => m.id), ['gpt-4.1-mini']);
    assert.ok(warnings.some(x => x.includes('metadata unavailable')));
  });
}

test('valid metadata does not resurrect an absent model or invent a requested ID', async () => {
  const row = JSON.parse(readFileSync(new URL('../src/seed.json', import.meta.url)))[0];
  row.id = 'actual-live-model';
  const p = createConcentrateProvider(sdk([row]), undefined, config);
  assert.equal(await p.catalog.run(ctx), null);
});

test('cancellation is not converted into bundled metadata fallback', async () => {
  const c = new AbortController();
  const s = sdk([]);
  s.getCachedLiveProviderModelRows = async () => { c.abort(); return []; };
  const p = createConcentrateProvider(s, undefined, config);
  await assert.rejects(p.catalog.run({ ...ctx, signal: c.signal }), { name: 'AbortError' });
});

test('configuration can cover a full 185-model catalog and up to 256 explicit estimates', () => {
  for (const count of [33, 185, 256]) {
    const overrides = Object.fromEntries(Array.from({ length: count }, (_, n) => [`model-${n}`, cost]));
    assert.doesNotThrow(() => createConcentrateProvider(sdk([]), undefined, { acknowledgeEstimatedCosts: true, costOverrides: overrides }));
  }
  const tooMany = Object.fromEntries(Array.from({ length: 257 }, (_, n) => [`model-${n}`, cost]));
  assert.throws(() => createConcentrateProvider(sdk([]), undefined, { acknowledgeEstimatedCosts: true, costOverrides: tooMany }), /256/);
});

test('manifest and runtime share the 256-model configuration boundary', () => {
  const manifest = JSON.parse(readFileSync(new URL('../openclaw.plugin.json', import.meta.url)));
  assert.equal(manifest.configSchema.properties.costOverrides.maxProperties, 256);
});

test('published metadata and README remain registry-ready', () => {
  const manifest = JSON.parse(readFileSync(new URL('../openclaw.plugin.json', import.meta.url)));
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  assert.equal(manifest.description, pkg.description);
  assert.ok(readme.includes(`**Version ${pkg.version}.**`));
  assert.match(readme, /openclaw plugins install clawhub:openclaw-concentrate --accept-capabilities/);
  for (const [, href] of readme.matchAll(/\]\(([^)]+)\)/g)) {
    assert.match(href, /^(https:\/\/|#)/, `Registry README has a relative link: ${href}`);
  }
});
