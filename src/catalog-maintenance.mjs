import { createHash } from 'node:crypto';
import { projectRows } from './catalog.mjs';
export const CATALOG_URL = 'https://api.concentrate.ai/v1/models';
const order = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort(order).map(k => [k, stable(value[k])])) : value;
const canonical = value => JSON.stringify(stable(value));
const clean = value => String(value ?? '').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '').replace(/[\\`*_[\]<>|]/g, '\\$&');

export async function fetchPublicJson(url, { signal, fetchImpl = fetch } = {}) {
  const target = new URL(url);
  if (target.origin !== 'https://api.concentrate.ai' || !/^\/v1\/models(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)?$/.test(target.pathname) || target.search || target.hash || target.username || target.password) throw Error('Invalid public metadata URL');
  signal?.throwIfAborted();
  const response = await fetchImpl(url, { redirect: 'error', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(5000)]) : AbortSignal.timeout(5000), headers: { Accept: 'application/json' } });
  if (!response.ok || !response.body) throw Error('Public metadata unavailable');
  const reader = response.body.getReader();
  const chunks = []; let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 1024 * 1024) throw Error('Public metadata exceeds 1 MiB');
      chunks.push(value);
    }
  } finally { await reader.cancel(); }
  signal?.throwIfAborted();
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
}

export function validateCatalog(body) {
  if (!body || body.object !== 'list' || body.has_more !== false || !Array.isArray(body.data) || !body.data.length || body.data.length > 2048 || body.first_id !== body.data[0]?.id || body.last_id !== body.data.at(-1)?.id) throw Error('Incomplete or invalid catalog snapshot');
  const seen = new Set(); const exclusions = [];
  for (const row of body.data) {
    if (!row || typeof row.id !== 'string' || row.id.length > 256 || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(row.id) || seen.has(row.id)) throw Error('Invalid or duplicate catalog ID');
    seen.add(row.id);
    if (row.id === 'redact-v1') exclusions.push({ id: row.id, reason: 'redaction utility, not a chat model' });
    else if (row.object !== 'model' || row.type !== 'model') exclusions.push({ id: row.id, reason: 'not a chat model' });
    else if (row.disabled === true || row.deprecated === true || row.archived === true || row.active === false || ['disabled', 'archived', 'deprecated', 'retired'].includes(row.status)) exclusions.push({ id: row.id, reason: 'upstream marks this model inactive' });
    else if (projectRows([row]).length !== 1) throw Error('Malformed eligible catalog model limits');
  }
  const eligible = projectRows(body.data);
  if (!eligible.length || eligible.length + exclusions.length !== body.data.length) throw Error('Catalog eligibility reconciliation failed');
  return { eligible, exclusions };
}

export function snapshotAge(meta, now = Date.now()) {
  const ageMs = now - Date.parse(meta?.fetchedAt);
  return { ageDays: Number.isFinite(ageMs) ? Math.floor(ageMs / 86400000) : null, stale: !Number.isFinite(ageMs) || ageMs < -60000 || ageMs > 30 * 86400000 };
}

export function catalogDiff(before, after) {
  validateCatalog(before); validateCatalog(after);
  const a = new Map(before.data.map(x => [x.id, x])); const b = new Map(after.data.map(x => [x.id, x]));
  const added = [...b.keys()].filter(id => !a.has(id)).sort(order);
  const removed = [...a.keys()].filter(id => !b.has(id)).sort(order);
  const changed = [...b.keys()].filter(id => a.has(id) && canonical(a.get(id)) !== canonical(b.get(id))).sort(order);
  return { hasChanges: Boolean(added.length || removed.length || changed.length), added, removed, changed };
}

export function buildCatalog(body, { fetchedAt, historical = { models: [] }, features = [] } = {}) {
  const { eligible, exclusions } = validateCatalog(body);
  if (!Number.isFinite(Date.parse(fetchedAt))) throw Error('Catalog snapshot requires its actual fetchedAt timestamp');
  const timestamp = new Date(fetchedAt).toISOString();
  const ids = new Set(eligible.map(x => x.id));
  const byId = new Map(eligible.map(x => [x.id, x]));
  const historic = new Map(historical.models.map(x => [x.model, x]));
  if (historic.size !== historical.models.length) throw Error('Duplicate historical compatibility ID');
  const meta = { source: CATALOG_URL, fetchedAt: timestamp, snapshotSha256: createHash('sha256').update(canonical(body)).digest('hex'), sourceCount: body.data.length, eligibleCount: eligible.length, exclusions, qualification: 'Dated upstream metadata, not measured feature support, entitlement or prices. Live discovery takes precedence; fallback can be stale.' };
  // Preserve the original fallback's first choice; do not silently change default selection.
  const seed = body.data.filter(x => ids.has(x.id)).toSorted((a, b) => Number(b.id === 'gpt-4.1-mini') - Number(a.id === 'gpt-4.1-mini'));
  const models = body.data.map(row => ({
    id: row.id, name: row.display_name ?? row.id, vendor: row.owned_by ?? 'unknown', eligible: ids.has(row.id),
    exclusion: exclusions.find(x => x.id === row.id)?.reason ?? null,
    contextWindow: row.max_input_tokens ?? null, maxOutputTokens: row.max_tokens ?? null,
    advertised: {
      imageInput: row.capabilities?.image_input?.supported ?? null,
      reasoning: byId.get(row.id)?.reasoning ?? null,
      structuredOutput: row.capabilities?.structured_outputs?.supported ?? null,
      tools: row.capabilities?.tools?.supported ?? null,
    },
    basicResponse: historic.get(row.id) ?? { model: row.id, status: 'not-tested', note: 'Not present in the historical smoke snapshot' },
    featureEvidence: features.filter(x => x.model === row.id),
  })).sort((a, b) => order(String(a.vendor), String(b.vendor)) || order(a.id, b.id));
  const directory = { ...meta, historicalSnapshot: historical.snapshot ?? null, featureQualification: 'Upstream capability flags are not feature certification. Basic-response results are historical and are not rerun by a catalog refresh.', models };
  const lines = ['# Concentrate AI model directory', '', `Metadata fetched: **${timestamp}** from [the public catalog](${CATALOG_URL}).`, '', `**${models.length} catalog IDs; ${eligible.length} eligible chat models; ${exclusions.length} excluded.** All eligible metadata is bundled for offline fallback. Live discovery takes precedence.`, '', '**Reading this directory:** upstream capability flags are not feature certification. Unknown is not no, and a successful basic response does not prove tools, vision or reasoning. Pricing is reviewed separately during setup.', '', `Basic-response evidence: **${clean(historical.snapshot ?? 'not recorded')}**. [Historical outcomes](COMPATIBILITY.md), [feature evidence](FEATURE-TESTING.md), [release proofs](RELEASE-GATES.md), [machine-readable directory](models.json).`, '', 'The fallback may be stale. Catalog visibility does not imply account entitlement. `redact-v1` is a redaction utility, not a runnable chat model.', ''];
  const flag = value => value === true ? 'yes' : value === false ? 'no' : 'unknown';
  for (const vendor of [...new Set(models.map(x => x.vendor))]) {
    lines.push(`## ${clean(vendor)}`, '', '| Model ID | Input limit | Output limit | Image* | Reasoning* | JSON schema* | Basic response |', '| --- | ---: | ---: | --- | --- | --- | --- |');
    for (const m of models.filter(x => x.vendor === vendor)) lines.push(`| \`${m.id}\`${m.eligible ? '' : ' (excluded)'} | ${m.contextWindow ?? 'unknown'} | ${m.maxOutputTokens ?? 'unknown'} | ${flag(m.advertised.imageInput)} | ${flag(m.advertised.reasoning)} | ${flag(m.advertised.structuredOutput)} | ${clean(m.basicResponse.status)} |`);
    lines.push('');
  }
  lines.push('*Asterisked capabilities are upstream metadata, not an installed-host certification. Tool support is unknown when the aggregate catalog does not declare it.*', '', '## Per-model feature supplements', '', 'These supplements retain their own exact source, timestamps and classification. Earlier failures are not erased.', '');
  if (!features.length) lines.push('See the linked historical feature and release reports above for existing representative proofs. This generated directory does not promote basic-response passes into feature passes.', '');
  for (const f of features) lines.push(`- \`${clean(f.model)}\`: **${clean(f.feature)} / ${clean(f.status)}**. ${clean(f.note ?? '')} ${f.evidence ? `[Evidence](${encodeURI(f.evidence).replace(/[()]/g, x => encodeURIComponent(x))})` : ''}`);
  return { meta, seed, directory, markdown: lines.join('\n') + '\n' };
}
