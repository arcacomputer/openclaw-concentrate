// Run on the approved remote proof worker; no network or credentials used.
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { projectRows } from '../src/catalog.mjs';

const raw = await readFile(new URL('../test/fixtures/catalog.json', import.meta.url));
const catalog = JSON.parse(raw);
assert.equal(catalog.has_more, false, 'Incomplete catalog snapshot');
assert.ok(Array.isArray(catalog.data));
assert.equal(new Set(catalog.data.map(row => row.id)).size, catalog.data.length, 'Duplicate IDs');
const projected = new Set(projectRows(catalog.data).map(row => row.id));
const reason = 'No inference performed; runnable registration requires explicit acknowledged user estimates; account entitlement and authoritative billing remain unverified.';
function capabilityChecks(value, prefix = '') {
  const checks = [];
  for (const [key, child] of Object.entries(value ?? {})) {
    if (!child || typeof child !== 'object') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child.supported === 'boolean') checks.push({
      feature: path, documentedSupported: child.supported,
      status: child.supported ? 'pending' : 'not-applicable',
      reason: child.supported ? reason : 'Vendor snapshot explicitly reports unsupported; not runtime-tested.',
    });
    checks.push(...capabilityChecks(child, path));
  }
  return checks;
}
const models = catalog.data.map(row => {
  const included = projected.has(row.id);
  return {
    id: row.id, catalogProjection: included ? 'included' : 'excluded',
    exclusionReason: included ? null : row.id === 'redact-v1' ? 'Redaction utility, not a chat model.' : 'Rejected by strict projection; inspect saved source row.',
    runtimeStatus: included ? 'pending' : 'not-applicable',
    runtimeReason: included ? reason : 'Not registered as a chat inference model.',
    capabilities: structuredClone(row.capabilities ?? {}),
    checks: [
      ...['responses', 'streaming', 'tools', 'cancellation', 'error-handling', 'usage-accounting'].map(feature => ({
        feature, status: included ? 'pending' : 'not-applicable',
        reason: included ? reason : 'Outside chat-provider scope.',
      })),
      ...capabilityChecks(row.capabilities).map(check => included ? check : ({ ...check, status: 'not-applicable', reason: 'Outside chat-provider scope.' })),
    ],
  };
});
const counts = {};
for (const model of models) for (const check of model.checks) counts[check.status] = (counts[check.status] ?? 0) + 1;
const manifest = {
  generatedAt: new Date().toISOString(), source: 'https://api.concentrate.ai/v1/models',
  snapshotSha256: createHash('sha256').update(raw).digest('hex'), hostVersion: '2026.9.4',
  inferenceRequests: 0, inferenceSpendUsd: 0,
  summary: { rows: catalog.data.length, uniqueIds: models.length, projected: projected.size, excluded: models.filter(row => row.catalogProjection === 'excluded').map(row => row.id), checks: counts },
  limitations: ['Pending is a test plan, not a compatibility claim.', 'Public model metadata does not prove account entitlement.', 'No runtime cost rates are fabricated.'],
  models,
};
const out = new URL('../evidence/2026-09-12/catalog-test-manifest.json', import.meta.url);
await mkdir(new URL('.', out), { recursive: true });
await writeFile(out, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest.summary));
