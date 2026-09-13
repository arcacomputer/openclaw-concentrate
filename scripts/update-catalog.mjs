import { readFile, writeFile, rename } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { buildCatalog, catalogDiff, fetchPublicJson, CATALOG_URL, snapshotAge } from '../src/catalog-maintenance.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const { values } = parseArgs({ options: { write: { type: 'boolean' }, check: { type: 'boolean' }, verify: { type: 'boolean' }, from: { type: 'string' }, 'fetched-at': { type: 'string' } }, allowPositionals: false });
if ([values.write, values.check, values.verify].filter(Boolean).length !== 1) throw Error('Choose exactly one: --check (live, read-only), --write (refresh), or --verify (offline generated files)');
if (values.from && (!values.write || !values['fetched-at'])) throw Error('--from requires --write and the source acquisition --fetched-at timestamp');
if (values['fetched-at'] && !values.from) throw Error('--fetched-at is only valid with --from');
const read = async name => JSON.parse(await readFile(join(root, name), 'utf8'));
const historical = await read('docs/compatibility.json');
const old = await read('docs/catalog.json');
let features = [];
try { features = await read('docs/model-feature-evidence.json'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const body = values.verify ? old : values.from ? JSON.parse(await readFile(values.from, 'utf8')) : await fetchPublicJson(CATALOG_URL);
const fetchedAt = values.verify ? (await read('src/catalog-meta.json')).fetchedAt : values.from ? values['fetched-at'] : new Date().toISOString();
const diff = catalogDiff(old, body);
if (values.check) {
  console.log(JSON.stringify({ ...diff, currentCount: body.data.length, fetchedAt, savedSnapshot: snapshotAge(await read('src/catalog-meta.json')) }, null, 2));
  process.exitCode = diff.hasChanges ? 1 : 0;
} else {
  const built = buildCatalog(body, { fetchedAt, historical, features });
  const json = value => JSON.stringify(value, null, 2) + '\n';
  const files = { 'docs/catalog.json': json(body), 'src/seed.json': json(built.seed), 'src/catalog-meta.json': json(built.meta), 'docs/models.json': json(built.directory), 'docs/MODELS.md': built.markdown };
  if (values.verify) {
    const mismatches = [];
    for (const [name, expected] of Object.entries(files)) if (await readFile(join(root, name), 'utf8') !== expected) mismatches.push(name);
    console.log(JSON.stringify({ verified: mismatches.length === 0, mismatches, sourceCount: built.meta.sourceCount, eligibleCount: built.meta.eligibleCount }));
    process.exitCode = mismatches.length ? 1 : 0;
  } else {
    // Validate and render everything before writes; same-directory rename avoids half-written JSON.
    for (const [name, text] of Object.entries(files)) await writeFile(join(root, `${name}.pending-${process.pid}`), text, { flag: 'wx' });
    for (const name of Object.keys(files)) await rename(join(root, `${name}.pending-${process.pid}`), join(root, name));
    console.log(JSON.stringify({ updated: Object.keys(files), sourceCount: built.meta.sourceCount, eligibleCount: built.meta.eligibleCount, ...diff }));
  }
}
