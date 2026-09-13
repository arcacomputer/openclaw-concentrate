import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const body = JSON.parse(readFileSync(new URL('../docs/catalog.json', import.meta.url)));
const historical = JSON.parse(readFileSync(new URL('../docs/compatibility.json', import.meta.url)));

test('catalog refresh validates full snapshots and generates every directory row deterministically', async () => {
  const module = await import('../src/catalog-maintenance.mjs');
  const built = module.buildCatalog(body, { fetchedAt: '2026-09-13T23:00:00.000Z', historical });
  assert.equal(built.meta.sourceCount, body.data.length);
  assert.equal(built.meta.eligibleCount, body.data.length - 1);
  assert.deepEqual(built.meta.exclusions, [{ id: 'redact-v1', reason: 'redaction utility, not a chat model' }]);
  assert.deepEqual(built.directory.models.map(x => x.id).sort(), body.data.map(x => x.id).sort());
  assert.deepEqual(built.directory.models.find(x => x.id === 'gpt-4.1-mini').basicResponse, historical.models.find(x => x.model === 'gpt-4.1-mini'));
  assert.match(built.markdown, /not feature certification/);
  assert.equal(built.markdown, module.buildCatalog(body, { fetchedAt: '2026-09-13T23:00:00.000Z', historical }).markdown);
  for (const bad of [{ ...body, has_more: true }, { ...body, last_id: 'wrong' }, { ...body, data: [...body.data, body.data[0]] }]) assert.throws(() => module.buildCatalog(bad, { historical }), /catalog|snapshot/i);
  const changed = structuredClone(body); changed.data[0].max_tokens += 1;
  assert.deepEqual(module.catalogDiff(body, changed).changed, [body.data[0].id]);
  assert.equal(module.catalogDiff(body, body).hasChanges, false);
  assert.equal(module.snapshotAge({ fetchedAt: '2026-08-01T00:00:00.000Z' }, Date.parse('2026-09-13T00:00:00.000Z')).stale, true);
});
