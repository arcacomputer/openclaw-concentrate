import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readJson = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));

test('manifest and package agree on provider, onboarding and local-only packaging', async () => {
  const pkg = await readJson('../package.json');
  const manifest = await readJson('../openclaw.plugin.json');
  assert.equal(pkg.private, true);
  assert.deepEqual(pkg.openclaw.providers, [manifest.id]);
  assert.deepEqual(manifest.providers, ['concentrate']);
  assert.deepEqual(manifest.setup.providers[0].envVars, ['CONCENTRATE_API_KEY']);
  assert.equal(manifest.providerAuthChoices[0].cliFlag, '--concentrate-api-key');
  assert.equal(manifest.configSchema.additionalProperties, false);
  assert.equal(pkg.peerDependencies.openclaw, '2026.9.4');
});

test('all entry SDK subpaths exist in the verified published package export map', async () => {
  const pkg = await readJson('./fixtures/openclaw-package.json');
  const entry = await readFile(new URL('../index.mjs', import.meta.url), 'utf8');
  const imports = [...entry.matchAll(/from 'openclaw(\/plugin-sdk\/[^']+)'/g)];
  assert.equal(imports.length, 3);
  for (const [, subpath] of imports) assert.ok(pkg.exports[`.${subpath}`]);
});

test('ClawHub build provenance matches the tested OpenClaw peer', async () => {
  const pkg = await readJson('../package.json');
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.openclaw.build.openclawVersion, pkg.peerDependencies.openclaw);
  assert.ok(pkg.openclaw.compat.pluginApi);
  assert.equal(pkg.openclaw.compat.minGatewayVersion, pkg.peerDependencies.openclaw);
  assert.ok(pkg.files.includes('LICENSE'));
});
