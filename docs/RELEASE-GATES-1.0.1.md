# Release gates

Current release: **1.0.1**, published on [ClawHub](https://clawhub.ai/plugins/openclaw-concentrate). See the [release report](RELEASE-1.0.0.md), [registry evidence](CLAWHUB-RELEASE.json) and [original live qualification](release-1.0.0.json).

## Verified release

- **Code: passed.** Runtime fallback and the 256-model estimate boundary have RED/GREEN regressions. Final package tests: 39 passed, zero failed. Registry-ready metadata/README regression passed after reproducing the stale description.
- **Synthetic transport: passed.** Eight focused checks, zero failed. Host/provider limitations remain explicit.
- **Package: passed.** Exact eight-file MIT tarball, byte comparison to source, real SDK import and zero-issue/zero-warning static validation.
- **Registry installation: passed.** Fresh unauthenticated `openclaw plugins install clawhub:openclaw-concentrate --accept-capabilities` installed 1.0.1. Provider enabled/loaded, all eight files matched, no `--force` or signature bypass.
- **Native catalog: passed.** Configuration and model selection accepted; explicit refresh returned the configured GPT-4.1 Mini as available. This is not an account-entitlement test.
- **Representative live integration: passed within stated boundaries.** Parallel reads, paired results and durable new-user recall; 256×256 tool-image control; strict-schema wire/output checks; bounded reasoning. These are actual earlier host/provider calls. The 1.0.1 provider code is byte-identical; no new paid inference was used for the metadata patch.
- **Distribution: passed.** Authorized publisher `felirami`; exact returned attempt/release readback, public latest version 1.0.1, clean ClawScan and TruffleHog, matching artifact digest and independent registry installation.
- **Containment: passed.** All owned publication/proof workers are absent. Final evidence was downloaded automatically before verified cleanup. One earlier worker lost supplemental logs at TTL; retained evidence and the complete fresh rerun are distinguished in the release report. Unknown earlier billing reservations remain held.

## Trust and coverage limits

This is a community/source-linked, artifact-scanned release, **not signed build provenance**. ClawHub reports `hasProvenance: false`; native OpenClaw readback reports `trust.reason: provenance-invalid`. The cause of that native classification is not established. Successful installation and matching bytes do not erase it.

The original 185-model smoke histories and 2,590 feature rows remain research, not universal certification. Untested, inconclusive and quarantined rows are not promoted by representative checks. See [historical criteria](HISTORICAL-RELEASE-GATES.md) and [feature history](FEATURE-TESTING.md).

No guarantee covers every upstream route, image accuracy, host-side schema enforcement, exact billing, hard spend limits or untested operating systems/runtime versions. Arca maintains an independent plugin; built-in OpenClaw inclusion is not required.
