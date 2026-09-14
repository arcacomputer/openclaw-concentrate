import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('setup CLI is declared and available as a lazy native registrar', async () => {
  const manifest = JSON.parse(readFileSync(new URL('../openclaw.plugin.json', import.meta.url)));
  assert.deepEqual(manifest.cliCommands, [{ name: 'concentrate', description: 'Browse Concentrate models and review setup estimates', hasSubcommands: true }]);
  const cli = await import('../src/cli.mjs');
  const calls = [];
  const command = name => ({ description() { return this; }, option() { return this; }, action(fn) { calls.push({ name, fn }); return this; }, command: suffix => command(`${name} ${suffix}`) });
  cli.registerConcentrateCli(command('openclaw'), { readSnapshot: async () => {}, mutate: async () => {} });
  assert.deepEqual(calls.map(x => x.name), ['openclaw concentrate models', 'openclaw concentrate setup']);
});

test('pricing rejects non-string IDs and pre-abort before any network access', async () => {
  const { fetchPricing } = await import('../src/pricing.mjs');
  let calls = 0;
  const fetchImpl = async () => { calls++; return new Response('{}'); };
  for (const id of [null, undefined, {}, 12]) await assert.rejects(fetchPricing(id, { fetchImpl }));
  const controller = new AbortController(); controller.abort();
  await assert.rejects(fetchPricing('gpt-4.1-mini', { signal: controller.signal, fetchImpl }), { name: 'AbortError' });
  assert.equal(calls, 0);
});
