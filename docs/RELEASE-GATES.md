# Release gates

Current evidence: [1.0.0 release report](RELEASE-1.0.0.md) and [machine-readable results](release-1.0.0.json).

## Verified candidate

- **Code: passed.** Metadata fallback and the 256-model estimate boundary have RED/GREEN regressions; 38 package tests pass.
- **Synthetic transport: passed.** Eight focused client checks pass, with their host/provider limitations stated.
- **Package: passed.** Exact eight-file MIT tarball, byte comparison to source, real SDK import, fresh installation and enabled/loaded provider readback.
- **Native catalog: passed.** Config and model selection accepted; explicit refresh returned the configured model as available.
- **Representative live integration: passed within stated boundaries.** Parallel reads, paired results and durable new-user recall; 256×256 tool-image control; strict-schema wire/output checks; bounded reasoning. These are actual host/provider calls, not simulated dispatcher callbacks.
- **Evidence and resource containment: passed.** Exact source/artifact hashes, UTC times and receipts preserved. Both owned sandboxes were removed and independently checked. Earlier uncertain reservations remain held.

## Distribution gate: blocked

ClawHub validation and the exact-source publish dry run passed with zero issues. There is no authenticated publisher available. Actual upload, scan acceptance, public readback and a clean registry installation remain required before saying **ClawHub release complete**. GitHub/source installation is not a substitute.

## Broader campaign, not a universal claim

The original all-model/all-feature campaign remains incomplete. Its 185-model smoke histories and 2,590 feature rows are retained; untested, inconclusive and quarantined rows are not promoted to passes by these representative checks. See [historical criteria](HISTORICAL-RELEASE-GATES.md) and [feature history](FEATURE-TESTING.md).

The bounded plugin release exposes the host's native Responses path and documents upstream limitations. It does not certify every catalog route, guarantee image accuracy, add host-side JSON validation, claim exact billing, or promise compatibility with untested operating systems/runtime versions.

Arca maintains an independent ClawHub plugin. Built-in OpenClaw inclusion is not a prerequisite. Continue directly without delegation unless the user changes that instruction.
