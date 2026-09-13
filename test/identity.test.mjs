import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = name => readFileSync(new URL('../' + name, import.meta.url), 'utf8');

test('new package has a distinct plugin identity but retains the Concentrate provider', () => {
  const pkg = JSON.parse(read('package.json'));
  const manifest = JSON.parse(read('openclaw.plugin.json'));
  assert.equal(pkg.name, 'concentrate-provider');
  assert.equal(manifest.id, 'concentrate-provider');
  assert.equal(manifest.name, 'Concentrate AI Provider');
  assert.deepEqual(pkg.openclaw.providers, ['concentrate']);
  assert.deepEqual(manifest.providers, ['concentrate']);
  assert.equal(manifest.setup.providers[0].id, 'concentrate');
  assert.deepEqual(manifest.setup.providers[0].envVars, ['CONCENTRATE_API_KEY']);
  assert.equal(manifest.providerAuthChoices[0].provider, 'concentrate');
  assert.match(read('index.mjs'), /id: 'concentrate-provider', name: 'Concentrate AI Provider'/);
  assert.deepEqual(manifest.categories, ['models']);
});

test('new distribution documentation preserves explicit migration and canonical identity', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.repository.url, 'https://github.com/arcacomputer/openclaw-concentrateai.git');
  const readme = read('README.md');
  assert.ok(readme.includes('clawhub:concentrate-provider'));
  assert.ok(readme.includes('plugins.entries["concentrate-provider"].config'));
  assert.ok(readme.includes('concentrate/gpt-4.1-mini'));
  assert.ok(readme.includes('Do not enable both plugins'));
  assert.ok(readme.includes('MIGRATING.md'));
  assert.ok(!readme.includes('github.com/arcacomputer/openclaw-concentrate/'));
});
