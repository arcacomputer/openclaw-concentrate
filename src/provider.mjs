import seed from './seed.json' with { type: 'json' };
import { projectRows } from './catalog.mjs';

export const BASE_URL = 'https://api.concentrate.ai/v1';
export const PRICING_BLOCKER = 'Concentrate pricing is unknown until configured: enable acknowledgeEstimatedCosts and supply complete per-model costOverrides (USD per million tokens). These are user estimates, not vendor prices, actual charges, or a spending cap. Catalog visibility is not account entitlement.';
export const ESTIMATE_WARNING = 'Concentrate runtime uses explicit user cost estimates, not vendor prices. Routing, cache TTLs, tiers, tools and BYOK can change actual charges; this is not a spending cap.';
const COST_KEYS = ['input', 'output', 'cacheRead', 'cacheWrite'];
function validateOverrides(config) {
  const overrides = config.costOverrides ?? {};
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides) || Object.keys(overrides).length > 256) throw new Error('Concentrate costOverrides must contain at most 256 models');
  if (Object.keys(overrides).length && config.acknowledgeEstimatedCosts !== true) throw new Error('Concentrate requires acknowledgeEstimatedCosts=true for user cost estimates');
  for (const [id, cost] of Object.entries(overrides)) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(id) || !cost || typeof cost !== 'object' || Array.isArray(cost) || Object.keys(cost).length !== 4 || COST_KEYS.some(k => !Object.hasOwn(cost, k) || typeof cost[k] !== 'number' || !Number.isFinite(cost[k]) || cost[k] < 0)) throw new Error('Concentrate cost override requires an exact model ID and four finite nonnegative USD/1M rates');
  }
  return structuredClone(overrides);
}
const fallbackModels = () => projectRows(structuredClone(seed));
const selected = ctx => !ctx.providerIds || ctx.providerIds.includes('concentrate');

// Dependency injection is confined to the SDK boundary; index.mjs uses real public exports.
export function createConcentrateProvider(sdk, warn = () => {}, config = {}) {
  const overrides = validateOverrides(config);
  const runtime = models => {
    const configured = models.filter(m => Object.hasOwn(overrides, m.id)).map(m => ({
      ...m, name: `${m.name} [user cost estimate]`, cost: structuredClone(overrides[m.id]),
    }));
    if (!configured.length) { warn(PRICING_BLOCKER); return null; }
    warn(ESTIMATE_WARNING);
    return { provider: { baseUrl: BASE_URL, api: 'openai-responses', models: configured } };
  };
  return {
    id: 'concentrate',
    label: 'Concentrate AI',
    envVars: ['CONCENTRATE_API_KEY'],
    auth: [sdk.createProviderApiKeyAuthMethod({
      providerId: 'concentrate', methodId: 'api-key', label: 'Concentrate AI API key',
      hint: 'API key from your Concentrate dashboard; configure per-model cost estimates separately',
      optionKey: 'concentrateApiKey', flagName: '--concentrate-api-key',
      envVar: 'CONCENTRATE_API_KEY', promptMessage: 'Enter your Concentrate AI API key',
      preserveExistingPrimary: true,
      noteTitle: 'Concentrate cost estimates', noteMessage: PRICING_BLOCKER,
    })],
    staticCatalog: { order: 'simple', run: async ctx => {
      if (!selected(ctx)) return null;
      ctx.signal?.throwIfAborted();
      return Object.keys(overrides).length ? runtime(fallbackModels()) : null;
    } },
    catalog: {
      order: 'simple',
      run: async ctx => {
        if (!selected(ctx)) return null;
        ctx.signal?.throwIfAborted();
        if (!ctx.resolveProviderApiKey('concentrate').apiKey) return null;
        if (!Object.keys(overrides).length) { warn(PRICING_BLOCKER); return null; }
        const snapshot = fallbackModels();
        // A full fallback must never hide changed limits or removed live IDs.
        try {
          const rows = await sdk.getCachedLiveProviderModelRows({
            providerId: 'concentrate', endpoint: `${BASE_URL}/models`, requireHttps: true,
            timeoutMs: 5000, ttlMs: 60000, signal: ctx.signal,
            auditContext: 'concentrate-public-runtime-catalog',
            shouldCacheRows: rows => projectRows(rows).length > 0,
          });
          ctx.signal?.throwIfAborted();
          const models = projectRows(rows);
          if (!models.length) throw new Error('No usable models');
          return runtime(models);
        } catch {
          ctx.signal?.throwIfAborted();
          warn('Concentrate metadata unavailable; only configured models in the bundled snapshot can run.');
          return runtime(snapshot);
        }
      },
    },
  };
}

// The unified control-plane entry contract has no mandatory runtime cost object.
// These are discovery rows, never ModelDefinitionConfig runtime rows.
export function createConcentrateModelCatalog(sdk, warn = () => {}) {
  const entries = (models, source) => models.map(({ id, name, ...metadata }) => ({
    kind: 'text', provider: 'concentrate', model: id, label: name, source,
    authEnvVars: ['CONCENTRATE_API_KEY'], capabilities: metadata,
    warnings: [PRICING_BLOCKER],
  }));
  return {
    provider: 'concentrate', kinds: ['text'],
    staticCatalog: async ctx => {
      if (!selected(ctx)) return null;
      ctx.signal?.throwIfAborted();
      return entries(fallbackModels(), 'static');
    },
    liveCatalog: async ctx => {
      if (!selected(ctx)) return null;
      ctx.signal?.throwIfAborted();
      if (!ctx.resolveProviderApiKey('concentrate').apiKey) return null;
      try {
        const rows = await sdk.getCachedLiveProviderModelRows({
          providerId: 'concentrate', endpoint: `${BASE_URL}/models`,
          requireHttps: true, timeoutMs: 5000,
          ttlMs: 60000, signal: ctx.signal,
          auditContext: 'concentrate-public-model-catalog',
          shouldCacheRows: rows => projectRows(rows).length > 0,
        });
        ctx.signal?.throwIfAborted();
        const models = projectRows(rows);
        if (!models.length) throw new Error('No usable models');
        return entries(models, 'live');
      } catch {
        ctx.signal?.throwIfAborted();
        warn('Concentrate public catalog unavailable or unusable; using the bundled snapshot, which may be stale. Account entitlement and cost remain unknown.');
        return entries(fallbackModels(), 'static');
      }
    },
  };
}
