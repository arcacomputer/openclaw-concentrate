import { createHash } from 'node:crypto';
import { projectRows } from './catalog.mjs';
import { COST_KEYS, validateOverrides, BASE_URL } from './provider.mjs';
export const PLUGIN_ID = 'concentrate-provider';
export class SetupError extends Error {}
const fail = message => { throw new SetupError(message); };
const finite = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const maxKnown = values => values.length && values.every(finite) ? Math.max(...values) : null;

export function selectModels(ids, rows) {
  if (!Array.isArray(ids) || !ids.length || ids.length > 16 || new Set(ids).size !== ids.length) fail('Select 1 to 16 distinct exact model IDs per setup.');
  const available = new Map(projectRows(rows).map(row => [row.id, row]));
  return ids.map(id => {
    if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id) || !available.has(id)) fail('Unknown or ineligible exact model ID. Use concentrate models to inspect the catalog.');
    return available.get(id);
  });
}

export function suggestRates(pricing) {
  const routes = Object.values(pricing?.routes ?? {}).map(x => x.normalizedBase ?? {});
  return { input: maxKnown(routes.map(x => x.input)), output: maxKnown(routes.map(x => x.output)), cacheRead: maxKnown(routes.map(x => x.cacheRead)), cacheWrite: maxKnown(routes.map(x => maxKnown(Object.values(x.cacheWriteByTTL ?? {})))) };
}

export function parseRate(value) {
  if (typeof value === 'string' && !/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)) fail('Enter a finite nonnegative rate in USD per million tokens.');
  if (typeof value !== 'string' && typeof value !== 'number') fail('Unknown rates require an explicit estimate.');
  const number = Number(value);
  if (!finite(number)) fail('Enter a finite nonnegative rate in USD per million tokens.');
  return number;
}

function checkConfig(config) {
  const legacy = config.plugins?.entries?.concentrate;
  if (legacy?.enabled !== false && (legacy || config.plugins?.allow?.includes('concentrate'))) fail('Disable the historical concentrate plugin first. See docs/MIGRATING.md; never enable both plugins.');
  if (config.plugins?.entries?.[PLUGIN_ID]?.enabled === false) fail('Enable concentrate-provider before setup.');
  const baseUrl = config.models?.providers?.concentrate?.baseUrl;
  if (baseUrl && baseUrl.replace(/\/$/, '') !== BASE_URL) fail('A custom Concentrate endpoint is configured. Review that override before using public-catalog setup.');
}

export function createSetupPlan({ config, sourceHash, selections, rows }) {
  checkConfig(config);
  const selected = selectModels(selections.map(x => x.id), rows);
  const costs = Object.fromEntries(selections.map(({ id, rates }) => [id, rates]));
  const existing = config.plugins?.entries?.[PLUGIN_ID]?.config ?? {};
  let costOverrides;
  try { costOverrides = validateOverrides({ acknowledgeEstimatedCosts: true, costOverrides: costs }); validateOverrides({ acknowledgeEstimatedCosts: true, costOverrides: { ...existing.costOverrides, ...costOverrides } }); }
  catch { fail('Each selected model needs four explicit finite nonnegative cost estimates; the combined configuration must fit 256 models.'); }
  const allowlist = config.agents?.defaults?.models;
  const allowlistAdditions = allowlist && Object.keys(allowlist).length ? selected.map(x => `concentrate/${x.id}`).filter(id => !Object.hasOwn(allowlist, id)) : [];
  const manualCostChanges = (config.models?.providers?.concentrate?.models ?? []).filter(x => Object.hasOwn(costOverrides, x.id)).map(x => x.id);
  const plan = { sourceHash, modelIds: selected.map(x => x.id), costOverrides, allowlistAdditions, manualCostChanges, qualification: 'These are your estimates, not vendor prices, actual charges or a spending cap. Primary model and credentials are unchanged.' };
  return { ...plan, reviewToken: createHash('sha256').update(JSON.stringify(plan)).digest('hex') };
}

export function applySetupPlan(draft, plan) {
  checkConfig(draft);
  const costs = validateOverrides({ acknowledgeEstimatedCosts: true, costOverrides: plan.costOverrides });
  draft.plugins ??= {}; draft.plugins.entries ??= {};
  const entry = draft.plugins.entries[PLUGIN_ID] ??= { enabled: true };
  const next = { ...entry.config, acknowledgeEstimatedCosts: true, costOverrides: { ...entry.config?.costOverrides, ...costs } };
  validateOverrides(next);
  entry.config = next;
  const allowlist = draft.agents?.defaults?.models;
  if (allowlist && Object.keys(allowlist).length) for (const id of Object.keys(costs)) {
    const key = `concentrate/${id}`;
    if (!Object.hasOwn(allowlist, key)) allowlist[key] = {};
  }
  for (const model of draft.models?.providers?.concentrate?.models ?? []) if (Object.hasOwn(costs, model.id)) model.cost = structuredClone(costs[model.id]);
}

export async function runSetup(options, io) {
  if (options.apply && options.dryRun) fail('--apply and --dry-run cannot be combined.');
  io.signal?.throwIfAborted();
  const before = await io.readSnapshot();
  if (!before.valid || !before.hash) fail('A valid existing OpenClaw configuration is required. Run openclaw config validate.');
  const config = before.sourceConfig ?? before.resolved;
  checkConfig(config);
  const ids = options.model?.length ? options.model : io.interactive ? await io.chooseModels(io.rows) : [];
  const selected = selectModels(ids, io.rows);
  const selections = []; const pricingEvidence = [];
  for (const model of selected) {
    io.signal?.throwIfAborted();
    let evidence;
    try { evidence = await io.pricing(model.id); }
    catch (e) { if (io.signal?.aborted || e.name === 'AbortError') throw e; evidence = { routes: {}, unavailable: true }; }
    pricingEvidence.push({ model: model.id, ...evidence });
    const rates = suggestRates(evidence);
    for (const key of COST_KEYS) {
      if (options[key] !== undefined) rates[key] = parseRate(options[key]);
      else if (io.interactive && !options.dryRun) rates[key] = parseRate(await io.askRate({ model: model.id, key, suggested: rates[key], evidence }));
    }
    selections.push({ id: model.id, rates });
  }
  const missingRates = selections.flatMap(x => COST_KEYS.filter(k => !finite(x.rates[k])).map(k => `${x.id}.${k}`));
  const plan = missingRates.length ? null : createSetupPlan({ config, sourceHash: before.hash, selections, rows: io.rows });
  const preview = { applied: false, canApply: Boolean(plan), plan, selections, missingRates, pricingEvidence, qualification: 'Suggestions use the highest published base route/TTL rate, not a tier ceiling. Unknown rates are never free. Review tiers, surcharges and all four estimates before saving.' };
  io.emit?.(preview);
  if (options.dryRun || (!io.interactive && !options.apply)) return preview;
  if (!plan) fail('Missing cost estimates. Supply every unknown rate explicitly before applying.');
  if (io.interactive) {
    if (!await io.confirm(plan)) return { ...preview, cancelled: true };
  } else if (options.acknowledgeEstimates !== true || options.review !== plan.reviewToken) fail('Apply requires --acknowledge-estimates and --review with the exact preview token. Re-preview if prices or configuration changed.');
  io.signal?.throwIfAborted();
  const saved = await io.mutate({ base: 'source', baseHash: before.hash, afterWrite: { mode: 'none', reason: 'Operator-invoked model setup; restart the gateway explicitly when ready.' }, writeOptions: { auditOrigin: 'cli' }, mutate(draft) { io.signal?.throwIfAborted(); applySetupPlan(draft, plan); } });
  const after = await io.readSnapshot();
  const actual = (after.sourceConfig ?? after.resolved)?.plugins?.entries?.[PLUGIN_ID]?.config;
  if (!after.valid || actual?.acknowledgeEstimatedCosts !== true || selections.some(x => COST_KEYS.some(k => actual.costOverrides?.[x.id]?.[k] !== x.rates[k]))) fail('Saved configuration could not be verified. Inspect native config status before retrying.');
  return { applied: true, modelIds: plan.modelIds, reviewToken: plan.reviewToken, persistedHash: saved.persistedHash ?? null, primaryChanged: false, credentialsChanged: false, next: 'Restart the gateway explicitly when ready. Use openclaw models set concentrate/<model-id> separately if you want to change your primary model.' };
}
