# Full compatibility release gates

Publication author/committer timestamp: `2026-09-13T08:59:21+00:00`.

Requested deliverable is a finished full-compatibility release, not an installable preview. Release remains BLOCKED. Package installation and harness tests do not satisfy feature gates.

## Distribution target

Release as an independently maintained **ClawHub plugin**. Built-in OpenClaw inclusion is not an acceptance criterion. Community guidance motivating this choice is quoted and qualified in [AGENTS.md](../AGENTS.md). Registry validation, packaging, installation/update documentation and an authorized ClawHub submission are release work; acceptance must be verified, not assumed.

## Required acceptance

- Every catalog model has an explicit outcome for each applicable documented feature, tied to exact runtime/source and actual execution evidence. Unsupported must be justified by provider documentation, not inferred from an unexecuted test.
- Resolve failed vision accuracy. Retained Concentrate OpenAPI explicitly allows array content in FunctionToolCallOutputItemInput.output; correct image bytes at ingress alone do not prove the backend received or interpreted them. Do not patch away this failure on speculation.
- Complete real parallel-tool roundtrip and fresh-user context through the actual fixed-origin transport with durable per-forward accounting. Simulated dispatcher callbacks are not sufficient.
- Resolve or explicitly scope historical inconclusive/error/quarantined routes. Do not label the entire catalog certified while these remain.
- Test applicable streaming, schema requests/output validation, reasoning, image input, replay, cancellation/error behavior and other documented feature rows. Keep host behavior, provider behavior and harness validation separate.
- Test the final packaged source, installation/onboarding and representative live flows against its exact identity. Publish MIT source, reproducible sanitized tests, machine-readable results, limitations and exact commit timestamps.
- Account for unreconciled requests without releasing reservations or expanding account caps implicitly. No auto-top-up or upstream acceptance assumed.

## Current scope

185 catalog models and 14 feature dimensions produce 2,590 campaign rows. Representative passes are not all-model coverage. Current source installation checks passed, but broad compatibility remains unfinished. See [feature evidence](FEATURE-TESTING.md) for exact per-stage qualifications.

The no-delegation instruction applies to all continuation. Blaxel is a remote execution environment controlled directly by Cad, not a reason to spawn another agent.
