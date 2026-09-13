# Concentrate.ai for OpenClaw

An MIT-licensed provider plugin maintained by [Arca Computer](https://arca.computer). Connect OpenClaw to Concentrate's Responses API with streaming, tools, reasoning, structured output and image input, where the selected upstream model supports them.

**Version 1.1.0.** See the [release report](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/docs/RELEASE-1.1.0.md) for verified distribution status, installation evidence and limitations. No npm release is claimed; `private: true` prevents accidental npm publication.

AI-assisted development, human stewardship by Luis Felipe Abarca. This is an independent integration, not an endorsement by Concentrate or the OpenClaw Foundation.

## Install

The verified target is **OpenClaw 2026.9.4, Node 24.16.0, Linux**. Other host versions and operating systems have not been verified. Start in disposable state before changing an existing agent.

```sh
openclaw plugins install clawhub:concentrate-provider --accept-capabilities
openclaw plugins list --json
```

Review the code first: `--accept-capabilities` grants the plugin's declared capabilities. The registry command above does not require `--force`. Installation alone does not configure credentials or start inference. A clean registry scan and matching artifact hashes are not a signed build-provenance attestation; see the release report for the host's trust diagnostics.

### Existing installations

This is a new package, not an automatic rename or update of `openclaw-concentrate`. The plugin ID is now `concentrate-provider`; the provider/model prefix remains `concentrate/`. **Do not enable both plugins.** Back up your configuration and follow the [migration instructions](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/docs/MIGRATING.md) before replacing an existing installation. The old release remains available.

## Configure

Provide `CONCENTRATE_API_KEY` through OpenClaw's supported environment, secret or provider-auth configuration. Never put a key in this repository or in the plugin's cost configuration. API-key onboarding preserves an existing primary model.

In `plugins.entries["concentrate-provider"].config`, acknowledge and provide your own complete cost estimates:

```json
{
  "acknowledgeEstimatedCosts": true,
  "costOverrides": {
    "gpt-4.1-mini": {
      "input": 0.4,
      "output": 1.6,
      "cacheRead": 0.1,
      "cacheWrite": 0.4
    }
  }
}
```

All rates are **USD per million tokens**. This example uses the published base input/output/cache-read rates observed for GPT-4.1 Mini on 2026-09-13, plus **an explicit user estimate of 0.4 for cache write**, which was not published for that route. Review current pricing and replace these estimates for your workload. This is not a vendor quote or a spending limit. Set account/key limits in Concentrate separately.

After configuring credentials and estimates, select `concentrate/gpt-4.1-mini` with OpenClaw's model picker or `openclaw models set concentrate/gpt-4.1-mini`.

Up to **256 exact, unprefixed Concentrate model IDs** can be configured. Every model needs all four finite, nonnegative rates: `input`, `output`, `cacheRead`, `cacheWrite`. Missing prices are never silently turned into zero. Explicit zero is accepted only as your acknowledged estimate. Configured model names display `[user cost estimate]`.

Only configured models become runnable. The bundled snapshot supports `gpt-4.1-mini` without a live metadata lookup. Other IDs use the public aggregate catalog, with the host's five-second timeout and sixty-second cache. Credentials are not sent to that public metadata endpoint. Empty, malformed or unavailable metadata falls back to configured bundled models; a valid live catalog does not invent missing models. Catalog visibility is not account entitlement.

## Supported behavior and limits

- **Text and streaming:** native OpenClaw `openai-responses` transport, without a second custom inference client.
- **Tools:** tool calls and results use the host's standard Responses representation. Parallel-tool and conversation-replay evidence is reported separately from single-tool checks.
- **Reasoning:** use a reasoning-capable model and OpenClaw's thinking settings. GPT-5 Mini has live evidence; that does not certify every reasoning route.
- **Structured output:** set `agents.defaults.models["concentrate/<model-id>"].params.response_format` to an OpenAI-style strict `json_schema` object. The host maps it to Responses `text.format`. **Validate the returned JSON yourself:** requesting a schema is not host-side enforcement.
- **Images:** no speculative image-role rewrite is installed. GPT-4.1 Mini correctly identified a 256×256 red/blue image returned by OpenClaw's actual `read` tool. Earlier 16×16 single-color tests failed, and other-model controls were inconsistent. Image content reaching the API does not guarantee correct perception. Do not use this evidence to promise reliable vision across the catalog.
- **Errors and cancellation:** the plugin preserves catalog cancellation. Runtime inference errors, cancellation and retries belong to OpenClaw's transport. Focused synthetic checks are not live upstream cancellation/billing proof. Disabling model fallbacks alone does not disable retries or incomplete-response continuation.
- **Routing and billing:** Concentrate chooses upstream routes. Host token-cost estimates do not incorporate all provider receipt extensions, route fallback, cache TTLs, context tiers, hosted tool charges or BYOK behavior. No hard spending guarantee is implemented by this plugin.

The public catalog contains **185 model IDs** in the retained snapshot. [Every original smoke outcome](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/docs/compatibility.json) remains available, including errors, inconclusive attempts, skipped and pending rows. The wider feature matrix is ongoing research, not a claim that all models and features passed. In particular, historical Grok output-cap violations remain quarantined in the test campaign.

## Pricing evidence

Concentrate's aggregate `/v1/models` does not provide complete pricing. The per-model endpoint exposes route-level `providers[provider].pricing`. From a source checkout:

```sh
node scripts/pricing.mjs gpt-4.1-mini /tmp/gpt-pricing.json
```

This read-only helper uses a five-second timeout, one-MiB response limit, no redirects and no credentials. It preserves raw unit rates, tiers, cache TTLs, tool charges, support flags, source URL and timestamp. It does not collapse multiple routes into an invented universal price. Missing cache-write rates stay unknown.

## Development and verification

Run installation and OpenClaw verification in a bounded disposable host, not a production gateway:

```sh
npm test
npm run check
npm run test:transport
node scripts/verify.mjs /tmp/concentrate-evidence
clawhub package validate . --openclaw-version 2026.9.4 --json
```

Read [AGENTS.md](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/AGENTS.md) before changing the provider. It documents the isolated Blaxel lane, credentials, inference budgets, retained failures, privacy and publication gates. No delegation is required to use Blaxel.

- [Release and installation evidence](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/docs/RELEASE-1.1.0.md)
- [Original per-model smoke report](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/docs/COMPATIBILITY.md)
- [Feature campaign and historical failures](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/docs/FEATURE-TESTING.md)
- [ClawHub publication procedure](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/docs/CLAWHUB-PUBLISHING.md)
- [Exact Git author/committer timestamps](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/docs/COMMIT-HISTORY.md)
- [Provenance and evidence dates](https://github.com/arcacomputer/openclaw-concentrateai/blob/main/docs/PROVENANCE.md)

Arca maintains this as an independent ClawHub plugin. Built-in OpenClaw inclusion is not a prerequisite or promised outcome. Community guidance motivating that choice is preserved, with its qualifications, in AGENTS.md.
