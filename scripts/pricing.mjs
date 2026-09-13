// Read-only pricing evidence, never an inference request or automatic rate selection.
import { writeFile } from 'node:fs/promises';
export function normalizeRate(rate) {
  if (typeof rate?.price?.USD !== 'number' || !Number.isFinite(rate.price.USD) || rate.price.USD < 0 || typeof rate.units !== 'number' || !Number.isFinite(rate.units) || rate.units <= 0) return null;
  const result = rate.price.USD * (1000000 / rate.units);
  return Number.isFinite(result) ? result : null;
}
export async function fetchPricing(model, { signal, fetchImpl = fetch } = {}) {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(model)) throw Error('Invalid exact model ID');
  const url = `https://api.concentrate.ai/v1/models/${encodeURIComponent(model)}`;
  const deadline = AbortSignal.timeout(5000);
  const response = await fetchImpl(url, { signal: signal ? AbortSignal.any([signal, deadline]) : deadline, redirect: 'error', headers: { Accept: 'application/json' } });
  if (!response.ok) throw Error('Public model pricing unavailable');
  const reader = response.body.getReader();
  const chunks = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 1024 * 1024) throw Error('Pricing response exceeds 1 MiB');
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (body.slug !== model || !body.providers || typeof body.providers !== 'object' || Array.isArray(body.providers)) throw Error('Invalid model details');
  return {
    model, source: url, fetchedAt: new Date().toISOString(),
    qualification: 'Route base rates only. Tiers, cache TTLs, tools and fallback prevent automatic flat-price selection. null means unknown, not free.',
    routes: Object.fromEntries(Object.entries(body.providers).map(([provider, row]) => [provider, {
      pricing: row.pricing ?? null, supports: row.supports ?? null,
      normalizedBase: {
        input: normalizeRate(row.pricing?.tokens?.input), output: normalizeRate(row.pricing?.tokens?.output),
        cacheRead: normalizeRate(row.pricing?.tokens?.cache?.read),
        cacheWriteByTTL: Object.fromEntries(Object.entries(row.pricing?.tokens?.cache?.write ?? {}).map(([ttl, rate]) => [ttl, normalizeRate(rate)])),
      },
    }])),
  };
}
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  if (!process.argv[2] || !process.argv[3]) throw Error('Usage: node scripts/pricing.mjs <exact-model-id> <output.json>');
  await writeFile(process.argv[3], JSON.stringify(await fetchPricing(process.argv[2]), null, 2) + '\n');
}
