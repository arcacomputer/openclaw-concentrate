# Concentrate.ai provider for OpenClaw

An experimental, MIT-licensed provider plugin maintained by [Arca Computer](https://arca.computer). AI-assisted development with human stewardship by Luis Felipe Abarca. Not an official endorsement by Concentrate or OpenClaw.

**Real OpenClaw inference has been exercised. This is not a production-certified release.** See [the compatibility snapshot](docs/COMPATIBILITY.md) and [all model rows](docs/compatibility.json). Source is public; no npm release or upstream PR has been published. The npm `private` flag prevents accidental registry publication, not source access.

## Configure explicit estimates

Install only in disposable state for now. Set `CONCENTRATE_API_KEY` through OpenClaw's supported secret/auth configuration when separately authorized. Never put credentials in this plugin config.

In `plugins.entries.concentrate.config`, supply `acknowledgeEstimatedCosts: true` and `costOverrides`, a map of exact Concentrate model IDs to all four numeric rates: `input`, `output`, `cacheRead`, `cacheWrite`, in **USD per million tokens**. At most 32 models are accepted. Rates must be finite and nonnegative. There are no default prices.

Synthetic example for registration tests only — **these numbers are deliberately NOT vendor prices and must not be copied as production billing data**:

```json
{
  "acknowledgeEstimatedCosts": true,
  "costOverrides": {
    "gpt-4.1-mini": {"input": 11, "output": 22, "cacheRead": 3, "cacheWrite": 4}
  }
}
```

Models carry `[user cost estimate]` in their host display name and registration emits an estimate warning. These are your estimates, not vendor truth, an account balance, a spending cap, or a promise about the bill. Explicit zero is accepted only as your acknowledged estimate; absence is never converted to zero. Without complete acknowledged overrides, no unpriced runtime models are submitted. The existing primary model is preserved during API-key onboarding.

The bundled snapshot supports `gpt-4.1-mini` offline. Other exact IDs are resolved from the public aggregate catalog when credentials are configured (credentials are not sent to the public metadata endpoint). Public acquisition uses the host's five-second timeout and sixty-second cache. Only models with explicit overrides can become runnable. Missing live models are not invented; on acquisition failure only configured bundled models remain available. Snapshot capabilities can become stale; catalog membership is not account entitlement.

## Authoritative pricing evidence

Concentrate publishes route pricing at [model details](https://concentrate.ai/docs/api-reference/endpoint/get-model.md), under `providers[provider].pricing`; aggregate `/v1/models` currently omits it. The source-only read-only helper fetches one exact model with a five-second timeout, one-MiB response limit, no redirects or credentials:

```sh
node scripts/pricing.mjs claude-sonnet-4-5 /tmp/sonnet-pricing.json
```

It preserves raw USD unit rates, tiers, cache TTLs, tool charges, route support flags, source URL and timestamp; normalized base token prices use `USD * 1000000 / units`. Missing rates stay unknown. It does **not** silently promote route base rates into a universal model price. Review this evidence when choosing your explicit estimates.

The current native Responses contract admits cache-write usage. Some routes lack explicit cache-write controls, but that alone does not prove Concentrate cannot bill cache writes after routing/fallback. Therefore missing `cache.write` is not treated as zero. Anthropic routes can provide multiple write TTL prices and long-context tiers; selecting one silently would also be misleading. A provider-prefixed model pins the first route, not necessarily all fallback attempts.

OpenClaw 2026.9.4's runtime model schema uses four numbers and its registry/config fallback can substitute zero for omitted cost objects. The separate unified discovery catalog allows omitted costs, but this is not an unknown-cost inference accounting contract. This plugin works within the numeric host contract using informed estimates instead of imposing a blanket inference prohibition. It does not modify the host or claim vendor `cost`/`byok` extensions are already integrated into host accounting.

## Verification — approved disposable Linux host only

```sh
npm test
npm run check
node scripts/verify.mjs /tmp/concentrate-evidence
clawhub package validate . --openclaw-version 2026.9.4 --json
```

Provider packages use **`clawhub package validate`**, not the tool/feature-only `openclaw plugins validate` lane. Real SDK imports, isolated plugin installation, host config validation, and host model-list read-back are separate integration gates. ClawHub validation is nonpublishing; runtime inspector capture additionally requires its explicit execution flags. Do not fabricate tool metadata to satisfy the wrong lane.

Proof target: OpenClaw 2026.9.4, Node 24.16.0, Linux. Live basic-response smoke results are recorded separately from synthetic and registration checks. Remaining gates include broad live tool/vision/schema/cancellation coverage, credentialed onboarding UX, routing and billing reconciliation, and release readiness. No macOS or Windows claim.
