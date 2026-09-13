# Version 1.0.0 release candidate

## Status

**Code, package installation and the representative live integration gates passed. ClawHub publication is blocked on publisher authentication.** This is not a claim of universal compatibility across all Concentrate routes or of production certification.

- Tested source: [`d9b023750f6f2ed1ecb6ad3005eeb77395d0d29e`](https://github.com/arcacomputer/openclaw-concentrate/commit/d9b023750f6f2ed1ecb6ad3005eeb77395d0d29e).
- Source author and committer time: **2026-09-13T10:45:20+00:00**.
- Package: `openclaw-concentrate@1.0.0`, MIT; eight allowlisted files, 7,858 compressed bytes.
- SHA-256: `8e4ae463d032e6e1a1070c445846e6cff623f23e12400f2b3ce702052d05769f`.
- Runtime: OpenClaw **2026.9.4**, Node **24.16.0**, Linux on bounded Blaxel sandboxes.
- [Machine-readable evidence](release-1.0.0.json) contains individual cases, timestamps, receipt costs, hashes and limitations.
- [Exact executed proof sources and reproduction layout](../scripts/verification/README.md).

The later commit publishing this report does not change the tested package bytes. Every file in the downloaded npm tarball was compared byte-for-byte to the tested source commit. Git commit times and test execution times are intentionally separate.

## Product defects fixed

1. **Empty or unusable live metadata discarded the configured bundled model.** The runtime now falls back to the bundled snapshot, matching the discovery catalog's existing behavior. Cancellation still propagates. A valid live catalog does not invent absent models.
2. **The 32-model estimate limit could not cover the 185-model catalog.** Runtime validation and manifest schema now agree on a bounded 256-model limit. This changes configuration capacity, not upstream model entitlement or feature support.

Four new regressions failed on the old implementation for the expected reasons; two companion boundaries already passed. After the fixes, **38 package tests and 8 synthetic transport tests passed**. The repository's native verifier also passed tests, syntax, real SDK import and packing checks.

The transport tests cover ordered SSE deltas/usage, function-call continuation and call IDs, missing usage, cancellation and one-request HTTP 400/402/429/500 behavior. They are synthetic client checks, not evidence of upstream error billing or of all OpenClaw retry paths.

## Live integration on the installed package

The harness loaded the **installed tarball copy** from fresh OpenClaw state, not a speculative request transformation. Host children received only a loopback dummy credential; the bounded proxy owned the real inference credential.

### Parallel tools and a fresh user message

GPT-4.1 Mini returned two `read` calls in one model response. OpenClaw read two random-value files, paired both results to their original call IDs, and sent both back. A second CLI invocation used the same persisted session and a fresh user message; it retained the two paired results and correctly recalled both random values without another tool call.

Exactly **three paid forwards**, each with a validated receipt. Both CLI invocations exited zero.

**Output caveat:** the upstream's first final response contained two identical text-message items. OpenClaw faithfully delivered both. The follow-up recall contained one correct pair. The proof establishes parallel calls, pairing, file-value fidelity and durable context; it does not claim perfect instruction-following or exactly two output lines. No text-deduplication workaround is installed.

### Image returned by the real `read` tool

GPT-4.1 Mini called OpenClaw's `read` tool on a deterministic **256×256 red/blue image**. The final answer correctly identified left red and right blue. Exactly two paid forwards, validated receipts and a clean host exit. This succeeded both in the diagnostic phase and on the final installed package.

Earlier **16×16 solid-color tests failed**. They remain in the historical record. The newer control demonstrates that the input path can work; it does not establish why the earlier tests failed or certify general vision reliability. No speculative image-role rewrite is included.

Separate direct API controls preserve their exact outcomes: GPT-4.1 Mini passed red/blue controls in both placements; one green/yellow tool-result answer used the synonym “Lime,” which failed the original exact-match assertion. GPT-4o sometimes returned the literal `LEFT,RIGHT` rather than colors. Those results are not silently upgraded or treated as proof of a plugin defect.

### Structured output

The host's supported model parameter produced strict Responses `text.format` on the wire. GPT-4.1 Mini returned `{"ok":true}`. One paid forward and a clean host exit. The harness separately parsed and validated the object. **Consumers still need output validation:** requesting a strict schema is not equivalent to OpenClaw enforcing it.

### Reasoning

GPT-5 Mini accepted low reasoning effort and returned the requested object through OpenClaw. One paid forward, a clean host exit, positive reasoning usage and inclusive output usage below the configured cap. Exact token counts are in the JSON report.

## Installation and registration

- Packed with npm, verified the eight-file allowlist, downloaded the exact artifact and compared every packaged file to source.
- Installed with OpenClaw's explicit local-source and capability consent flags in disposable state.
- Native plugin readback: `concentrate`, version `1.0.0`, **enabled**, **loaded**, provider ID `concentrate`, no plugin error.
- Native config commands accepted the README's cost-estimate example and model selection.
- `openclaw models list --all --provider concentrate --refresh --json` returned the configured GPT-4.1 Mini as **available**, `text+image`, with the expected context window and default/configured tags.
- A stopped gateway can initially show only a stale local catalog. The explicit refresh above was required to verify discovery; the initial cache warning was not treated as a registration pass.

Credentialed interactive login was not exercised. The documented environment-key path was used behind the isolated test proxy. No production OpenClaw installation or session state was changed.

## ClawHub

ClawHub CLI **0.23.3** returned a static validation pass with **zero issues and zero warnings**. Its exact-source dry run selected the code-plugin family, package name `openclaw-concentrate`, version `1.0.0`, the source commit above and the eight-file artifact.

**No upload, registry security scan or ClawHub installation has happened.** The browser is signed out, the isolated CLI reports `Not logged in`, and no normal local ClawHub credential config was found. GitHub authentication does not provide ClawHub publisher authority.

After the authorized publisher signs in, publish this reviewed source/artifact, read back the exact package/version and scan status, and verify a fresh `openclaw plugins install clawhub:<returned-package-name>` installation. Do not guess the publisher handle or claim a dry run was an upload.

## Budget, failures and cleanup

The new work made **21 paid forwards** with retained receipts reporting **USD 0.012043048** in inference costs. This is not account reconciliation or total compute billing. Prior unknown charges and reservations remain held; automatic top-up and provider key caps were not changed.

Both owned Blaxel sandboxes were removed and absence was independently verified. Unrelated inventory was preserved. Proof files were downloaded before deletion.

Two harness-only setup mistakes remain recorded: a CLI version flag was unsupported after the test suites had passed, and a synthetic allowance array initially covered two turns rather than three. The latter failed with zero paid forwards, was corrected to the actual forward count, and passed a fresh credential-free preflight before live dispatch. Neither failure is hidden as a model pass.

## What remains outside this release's claims

- ClawHub publisher login, actual publication, scan acceptance and registry installation.
- All-model/all-feature certification; the broader 185-model campaign retains its original outcomes.
- Historical Grok output-cap violations, ambiguous billing and unresolved upstream vision behavior.
- macOS, Windows and OpenClaw/Node versions other than the verified target.
- Provider-side output correctness, host-side schema enforcement, exact upstream billing or hard spend guarantees.

These boundaries are part of the release contract, not a promise to make every upstream model behave identically.
