// Backward-compatible read-only pricing evidence CLI. Never sends inference.
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { fetchPricing } from '../src/pricing.mjs';
export { normalizeRate, fetchPricing } from '../src/pricing.mjs';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2] || !process.argv[3]) throw Error('Usage: node scripts/pricing.mjs <exact-model-id> <output.json>');
  await writeFile(process.argv[3], JSON.stringify(await fetchPricing(process.argv[2]), null, 2) + '\n');
}
