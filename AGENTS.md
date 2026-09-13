# Agent guide: OpenClaw × Concentrate

## Mission and ownership

Build a finished, evidence-backed Concentrate.ai provider integration for OpenClaw. This repository is MIT-licensed, maintained by Arca Computer with human stewardship by Luis Felipe Abarca. Do not imply official endorsement, upstream acceptance or full compatibility before it is established.

Work directly by default. Do not spawn subagents or delegate work unless the human explicitly authorizes it. Different agents may work on this repository in separate sessions; that is not permission to create autonomous agent chains. Keep coordination asynchronous and concise, with evidence and handoff notes rather than repeated progress messages.

## Plugin-first distribution and maintenance

The intended release is an independently maintained **ClawHub plugin**, not a built-in OpenClaw provider. Arca Computer maintains this integration, its compatibility evidence, documentation and ongoing fixes. Core inclusion is not a release requirement or promised next step.

Community feedback shared by the maintainer motivates this direction:

> Patrick or someone else from the foundation can correct me but I believe that all new providers and channels are requested to maintain their own code and be a ClawHub plugin. [The foundation] can't add support for every provider/channel/etc on the market, it is a lot easier to externalize what we can.

This is a community comment supplied by the project owner, not a verified formal foundation policy or approval. No author, permalink or foundation confirmation has been supplied here. Preserve that qualification when describing it.

Maintain a reviewed, validated ClawHub package with clear ownership and a reproducible installation/update path. New releases use registry identity and plugin ID `concentrate-provider`, published by `felirami`, with source at `arcacomputer/openclaw-concentrateai`. The provider/model prefix remains `concentrate/`. Historical `openclaw-concentrate` releases keep plugin ID `concentrate`; never enable both plugins. Read `docs/MIGRATING.md` and the latest release report for verified publication, migration and install evidence. Source installation and package tests alone do not establish registry acceptance. Consult current official OpenClaw/ClawHub publishing requirements before submission. Upstream contributions should address shared SDK/runtime defects where appropriate, rather than assume this provider must be merged into core. Human authorization is required for registry publication or upstream submissions.

Official ClawHub reference: <https://docs.openclaw.ai/clawhub>. Follow [the repository publishing checklist](docs/CLAWHUB-PUBLISHING.md), including actual package validation, publish dry run, publisher authentication and registry-install verification.

## Start here

Read these before changing code or making compatibility claims:

- `README.md`: installation, credentials and explicit cost configuration.
- `package.json`, `openclaw.plugin.json`, `index.mjs`: packaging, permissions and registration.
- `src/provider.mjs`: provider/auth/catalog integration and pricing gates.
- `src/catalog.mjs`, `src/seed.json`: catalog projection and offline fallback.
- `test/` and `scripts/`: existing tests and verification tools; reuse them before inventing a new framework.
- `docs/COMPATIBILITY.md` and `docs/compatibility.json`: dated basic-response results for all catalog rows.
- `docs/FEATURE-TESTING.md`: actual feature results, failures and qualifications.
- `docs/RELEASE-GATES.md`: release/distribution gates; `docs/RELEASE-1.1.0.md` tracks the new package and `docs/MIGRATING.md` covers existing installations. `docs/RELEASE-1.0.0.md`, `docs/CLAWHUB-RELEASE.json` and `docs/release-1.0.0.json` retain historical 1.0.x evidence.
- `docs/PACKAGE-VERIFICATION.md`: clean source installation proof.
- `docs/PROVENANCE.md`, `docs/COMMIT-HISTORY.md`: source/evidence chronology.

Check Git status and HEAD first. Preserve other agents' uncommitted changes. Use a task branch/worktree for concurrent work; do not share mutable state or overwrite another agent's evidence. Keep public handoffs sanitized and identify the exact commit, changes, tests, blockers and next action. Never delete memory, private notes or old evidence to simplify a handoff.

## Current product boundary

The 1.0.x release has verified ClawHub publication, clean registry scans, fresh registry installation, native model registration and representative live tools/context, vision, reasoning and schema evidence. Version 1.0.1 is a documentation/metadata patch with unchanged provider code. This is not universal model or all-platform certification, nor a cryptographically attested release. Consult the latest release report and dated histories; preserve all historical error/inconclusive/quarantine states.

Known remaining boundaries include inconsistent upstream image/output behavior, broad per-model feature coverage and reconciliation of ambiguous earlier charges. Real parallel tools and fresh-user context now have installed-package evidence; standalone or simulated gate tests still cannot substitute for live proof. The package remains private to npm to prevent accidental publication. No npm or ClawHub release is implied by public MIT source.

## Execution: Blaxel, not the control-plane host

The maintained validation lane uses isolated Linux on Blaxel, OpenClaw **2026.9.4** and Node **24.16.0**. `package.json` declares a wider Node engine range; that is not evidence those versions were tested. Version changes require a new explicit verification record.

- Run installs, builds and OpenClaw/test execution in a bounded sandbox. Keep the agent host to source edits, Git, lightweight inspection, archive creation and orchestration.
- One owned sandbox at a time unless the human approves otherwise. Default maximum: 8 GiB RAM, ten-minute TTL, 120 seconds reserved for evidence download and cleanup, and an estimated compute ceiling of USD 1 per run. These are workflow limits, not provider-enforced billing caps. Never raise limits or purchase credits implicitly.
- Verify authenticated inventory before creation. Record exact owned resource names and never touch unrelated workers. Use explicit expiration policies and bounded process timeouts.
- Infrastructure authentication is allowed through the operator's approved credential loader. Do not print keys, put them in argv, sync them into the repository, or inject Blaxel credentials into model-test processes.
- Check current official Blaxel documentation and the installed SDK interfaces. Prefer the existing operator Blaxel tooling; do not assume a particular private filesystem path exists on another agent's machine.
- Syntax-check launchers before provisioning. Probe required binaries; slim images may lack `free`, `curl` or other conveniences. Optional resource probes must not abort the core test.
- Reuse the same sandbox for bounded ordinary fixture corrections. Keep one outer cleanup path; do not tear down on the first expected assertion and reinstall everything repeatedly. Stop on actual safety failures or the cleanup deadline.
- Require a terminal process status and exit code. Exit 0 on a still-running process is not completion. Emitting final JSON before SIGTERM/deadline is not a clean pass.
- Download raw checkpoints and archives before deleting the exact owned worker. Verify hashes and provider-side absence after deletion. TTL alone is not cleanup verification. Record missing evidence honestly.

Blaxel operations and SDK documentation: <https://docs.blaxel.ai/>. If the operator has an installed Blaxel operations skill, read it for authenticated tooling and current lifecycle details. Do not copy private credentials or infrastructure inventories into public docs.

## Inference access and spending

Concentrate endpoint: `https://api.concentrate.ai/v1`. Model credentials use `CONCENTRATE_API_KEY` through supported OpenClaw auth/secret configuration. Read current official API documentation at <https://concentrate.ai/docs>; recorded documentation is evidence of a dated contract, not a promise the service never changes.

**Repository access does not grant permission or credentials for paid inference.** Ask the operator for an approved execution channel and current cumulative budget ledger if they are unavailable. Do not create replacement keys or start a zeroed ledger.

The existing campaign used a dedicated test key with a USD 20 lifetime limit and a stricter USD 18 cumulative conservative reservation ceiling. These historical limits are not fresh spend authorization. Recover the latest private ledger, including unknown charges and reservations, before any new paid request. Account balances, key values and private ledger locations belong outside this public repository.

- Obtain an explicit bounded live-test scope. Reserve the worst applicable route cost for every possible forward **before dispatch**, durably and with exact decimal arithmetic.
- Include input, image, cache/tier, output and reasoning costs where applicable. Missing prices are not zero. An explicit advertised zero and an unknown price are different.
- Do not infer actual billing from configured OpenClaw estimates. The plugin requires acknowledged complete per-model `costOverrides`; estimates are not an account balance or spending cap.
- Preserve unknown billing as unknown and keep its reservation. Known API receipts are not account reconciliation. Do not blindly retry accepted or ambiguous requests.
- Keep automatic top-up off and existing account/key limits unchanged unless the human approves an account change.
- Stop for HTTP 402, observed bound violations, unknown dispatch or failed evidence retrieval. Any exception allowing unrelated continuation after a model-specific error must be explicitly scoped, with unknown reservations retained.

## Real-host test discipline

1. Define one feature's acceptance criteria and applicable models. Separate catalog claims, synthetic transport proof, real-host behavior and live provider results.
2. Use synthetic nonprivate fixtures first. Synthetic host processes and their children must not receive real model credentials. A dummy key is acceptable for loopback fixtures. Infrastructure credential loading on the control plane is separate.
3. Capture actual OpenClaw requests. Prove source/runtime/model/case identity, skill/tool restrictions, payload and token bounds, retry settings and process-tree containment before enabling paid forwarding.
4. For live traffic, enforce fixed HTTPS origin, explicit per-case forward budgets, no uncontrolled fallbacks/retries and durable reservations/checkpoints. Multi-turn tests intentionally need multiple separately reserved forwards.
5. Checkpoint each result before the next paid request. Preserve returned backend identity, timestamps, token usage, cost when provided, response classification and exact source hashes.
6. Validate the feature's result, not just HTTP 200 or host exit 0. A wrong image answer is a failure even when transport works. Valid-looking JSON alone is not proof of a strict-schema request.

### Lessons from actual failures

- OpenClaw 2026.9.4 retry behavior must be tested through actual host requests. Model-level `maxRetries` alone was not the demonstrated control. Isolated agent settings support `retry.enabled:false` and `retry.provider.maxRetries:0`; ignore project overrides and verify no extra forwards.
- Measure empty skill descriptions in the actual request/report. `skills.allowBundled: []` alone did not establish isolation. Tool tests may enable only the explicitly required harmless fixture tools.
- For streaming tool turns, persist and validate semantic terminal usage before allowing continuation. Normal downstream close after terminal consumption is not necessarily cancellation. Drain under bounds/timeouts and reject contradictory terminal records. Include delayed-EOF and fragmented-SSE regressions.
- Reasoning tokens may be a breakdown of inclusive output tokens; do not count them twice. Observed output-cap violations invalidate the bound, even if a route advertises support. Preserve Grok quarantine until its specific safety assumptions are resolved.
- Strict schema uses model `params.response_format` (or supported alias) with nested `json_schema`, converted by this runtime to Responses `body.text.format`. `extra_body` and CLI `--json` are not substitutes. Captured wire evidence is mandatory. OpenClaw returned adversarial synthetic output successfully; independent output validation remains necessary.
- Resolve relative/absolute fixture paths canonically within the disposable fixture root. Reject traversal, symlink escapes and unexpected files. Do not reject an otherwise authorized `a.txt` solely for being relative.
- This runtime persists scoped transcripts in SQLite, not necessarily the guessed JSONL path. Internal transcript interfaces are not stable public APIs. Only manipulate disposable test sessions; test generation/byte fences and rollback. Preserve composite internal IDs and follow runtime conversion semantics rather than blindly splitting strings.
- Durable tool-result order B,A may become correctly paired wire order A,B. Test semantic pairing, not an invented order guarantee.
- Proof gates must verify actual bytes/hashes plus source, runtime, model, case and freshness. Truthy hash fields are not integrity. Simulated key/forward callbacks do not qualify real dispatch/accounting integration.

## Package checks and installation

Run these in the sandbox from the candidate repository:

```sh
npm run check
npm test
npm pack --json
```

For a reviewed source candidate in disposable OpenClaw state:

```sh
openclaw plugins install --force --accept-capabilities /absolute/path/to/candidate
openclaw plugins list --json
```

The flags explicitly consent to unreviewed local source and declared capabilities; they are not generic instructions to bypass unfamiliar security warnings. Require plugin `concentrate-provider` enabled/loaded with registered provider ID `concentrate`, and inspect diagnostics. Configure approved credentials and acknowledged cost estimates separately before any live use. Never install test candidates into a production gateway to obtain convenient proof.

## Publication and completion

Public source, tests and documentation are MIT. Do not publish keys, account details, personal data, raw private logs or partnership dossiers. Inspect the actual package allowlist and diff before pushing. GitHub writes, registry releases, upstream PRs and contacting maintainers require the human's applicable authorization; do not infer one from another.

Preserve exact identifiers and actual Git author/committer dates. Run `python3 scripts/export-provenance.py` before publication; it exports history through the current HEAD and cannot contain its own future commit hash. Distinguish execution timestamps from publication timestamps. Never backdate work or invent missing test times. Read back the exact remote commit/files after a push.

A final handoff must include:

- Exact candidate/commit and what changed.
- Commands actually run, runtime, outcomes and evidence hashes.
- Per-model/per-feature coverage and unresolved failures, not just a total of harness assertions.
- Cleanup verification and accounting status, with private details kept private.
- Explicit remaining release gates. Do not say “finished,” “full compatibility” or “production ready” while required cases remain untested or inconclusive.
