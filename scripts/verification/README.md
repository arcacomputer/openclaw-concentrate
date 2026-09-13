# Reproduce release proof

## Current 1.1.0 registry identity proof

`clawhub-registry-1.1.0.mjs` is the exact executed, credential-free host proof for the new `concentrate-provider` package. It verifies fresh registry installation, each installed file hash, native registration, configuration/model selection, migration with the old plugin disabled, saved-cost and synthetic memory preservation, and rollback. All commands and results are in `docs/CLAWHUB-RELEASE-1.1.0.json`.

Run only on a **fresh, bounded disposable Linux worker**, never a production agent. Install OpenClaw 2026.9.4 under `/tmp/host/node_modules` and use Node 24.16.0. No real provider/publisher/infrastructure credentials belong in the proof environment. Stage `registry-1.1.0-files.json` as `/tmp/expected-files.json`, then run the exact script; it writes proof under `/tmp/rename-proof`. The synthetic key is intentionally nonfunctional; public model metadata reads are not paid inference. The historical proof sources below remain unchanged and apply to their original identities.


These are the exact executed harness sources, not an implementation sketch. They are excluded from the installable package. Run only in an authorized, disposable Linux sandbox; never against a production gateway or an unbounded billing account.

## Fixed runtime layout

- Node 24.16.0 at `/tmp/toolchain/node_modules/node/bin/node`, first on `PATH`.
- OpenClaw 2026.9.4 under `/tmp/host/node_modules`, including its CLI and transitive dependencies.
- This source checkout at `/tmp/candidate`; link its `node_modules` to `/tmp/host/node_modules`.
- Install the packed plugin with `openclaw plugins install --force --accept-capabilities` into disposable state at `/tmp/release-install/state`. The template explicitly loads that installed copy, not a modified plugin.
- Copy `release-host.mjs` to `/tmp/batch.mjs`, `credential-audit.mjs` to `/tmp/credential-audit.mjs`, and `test/fixtures/release/template.json` to `/tmp/template.json`.
- Copy `test/fixtures/release/control-a.png` to `/tmp/image.png`. It is a deterministic 256×256 red/blue image, not the historical 16×16 red fixture.
- Create `/tmp/proof` and a private `/tmp/proof/reservation.json` containing `reservedUsd` and `models`. Seed **all outstanding prior reservations**, not a convenient zero. The supplemental harness ceiling is USD18; independently enforce the operator's aggregate inference/compute budget.

## Two separate processes per case

`BATCH_ROW` is a JSON object. Use unique integer `index` values and attempt IDs; preserve every failed attempt. Shared fields:

```json
{"id":"gpt-4.1-mini","feature":"parallel","maxOutputTokens":512,"maxTokenRateUsd":0.000002,"inputRateUsd":0.0000004,"outputRateUsd":0.000002,"imageTokenReserve":0,"index":202,"attemptId":"unique-preflight","preflightOnly":true}
```

1. Run `node /tmp/batch.mjs` with that row and **without any model credential**. Require exit zero and `/tmp/proof/202/preflight-result.json` with `passed: true`. The real OpenClaw host must show no skills and only the intended tools.
2. Preserve/download the complete preflight. Re-fetch current official pricing and reserve worst-case costs on the control plane before permitting a paid process. The rates above are dated proof inputs, not a current pricing recommendation.
3. Use the same row with a new `index`, a unique `attemptId`, `preflightIndex: 202`, and no `preflightOnly`. Inject `CONCENTRATE_API_KEY` into **that process only**, never argv or a repository file. The proof hash must match the preflight source.
4. Require zero host and harness exits, exactly the authorized upstream count, validated usage/cost receipts, expected text/JSON assertions, and complete evidence download before further dispatch or teardown. Retain unknown charges and stop on ambiguous submissions, cap overruns or missing evidence.

Case variants used in this release:

- `parallel`, GPT-4.1 Mini, 512 output tokens: two read calls in one response, two paired results, then a fresh user message in another CLI process using the same persisted session. Exactly three paid forwards. Initial and recall output must contain both random file values in order. **This does not require exactly two output lines**: the upstream returned duplicate message items in the first final reply, which remain documented.
- `vision`, GPT-4.1 Mini, 256 output tokens, `imageTokenReserve: 4096`: exactly two forwards. Independently check the final red/blue answer and transmitted image hash.
- `schema`, GPT-4.1 Mini, 256 output tokens, `schema: true`: exactly one forward. Check on-wire strict `text.format` and validate the final JSON object separately.
- `reasoning`, GPT-5 Mini, 2048 output tokens, `reasoning: true`: exactly one forward. Check on-wire low effort and positive inclusive reasoning usage.

The harness preserves its executed bytes, including a legacy `input-bound.json` explanatory string saying “16x16”. That string is not the active fixture or a bound calculation. The supplied image hash, actual bytes, measured request ceilings and explicit 4096-token image allowance define this run. Do not copy that stale label into new evidence.

## Direct image controls

Copy both PNGs to `/tmp/fixtures`, use `vision-controls.mjs`, and select one object from `test/fixtures/release/vision-cases.json` as `DIAGNOSTIC_CASE`. Each process permits one fixed-origin request with no redirect/retry. Reserve externally before injecting a credential, download request/result/receipt files immediately, and stop if receipt validation fails. `passed` is a strict text match: preserve synonyms and format failures in the record rather than silently upgrading them.

## Safety and provenance

The host subprocess receives only a dummy loopback credential. `credential-audit.mjs` asserts that no model or Blaxel key reaches it. The owning proxy forwards only to the fixed Concentrate HTTPS origin, records dispatches, validates terminal usage before continuation, enforces body/output/time/cost bounds and drains the stream before unlocking the next request.

Use one bounded Blaxel sandbox, explicit TTL and process-group deadlines. Save exact source/package/harness hashes and UTC times. Download evidence **before** scoped deletion and independently verify provider inventory afterward. No raw account logs or personal conversation state belong in the public repo.

## 1.0.1 native registry proof: no paid inference

`clawhub-registry-1.0.1.mjs` is the exact executed registry-install verifier. `clawhub-1.0.1-expected-files.json` contains the eight expected file hashes. Neither is part of the installed package. Run only in an approved, credential-free disposable Linux sandbox with Node 24.16.0 and OpenClaw 2026.9.4 in the fixed runtime layout above. Reuse only the Node/OpenClaw installation paths; do not run the old local-plugin installation or paid-proxy steps for this registry proof.

Copy the verifier to `/tmp/registry-proof.mjs` and the expected-file JSON to `/tmp/expected-files.json`, then run `node /tmp/registry-proof.mjs`. The script creates separate disposable state, installs from the public registry without a publisher token or `--force`, checks version and all file hashes, verifies provider loading, applies the explicit cost example, selects the model and refreshes its catalog. Real model and infrastructure credentials are rejected. The dummy key proves configuration/catalog registration only, not account entitlement or a paid inference result.

The archived command uses the unversioned registry target, which resolved to 1.0.1 in this execution; the version/hash assertions fail closed after incompatible registry changes. Preserve the archived bytes. A later reproduction targeting another release is a new proof, not a retroactive change to this one.

The complete final run also repeated the package tests, syntax check, synthetic transport suite, native verifier and ClawHub static validation. See `../../docs/CLAWHUB-RELEASE.json` and `../../evidence/2026-09-13/clawhub-1.0.1/`. Automated evidence download and cleanup completed before the final worker expired. The native `provenance-invalid` trust classification is retained, not treated as signed provenance.
