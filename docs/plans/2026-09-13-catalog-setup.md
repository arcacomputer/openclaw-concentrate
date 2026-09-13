# Catalog and setup release implementation plan

**Goal:** Ship the full eligible fallback catalog, a readable model directory, guided model/pricing configuration, and additional measured feature coverage as the next verified release.

**Status:** Accepted and active. Nothing in this plan claims an unreleased feature already ships. Release 1.1.0 remains the published baseline until the final gates pass.

**Execution:** Cad implements directly. No delegation. Use the existing bounded Blaxel lane, preserved cumulative accounting and exact-source release gates in `AGENTS.md`. Do not touch production gateway state or memory.

**Architecture:** Preserve the Responses provider and pricing acknowledgement boundary. Keep dated current metadata separate from immutable historical test fixtures. Use the host's public CLI and transactional config APIs for a small guided setup command. New runtime dependencies are unnecessary.

**Tech stack:** Native ESM and Node built-ins; OpenClaw 2026.9.4 public SDK; isolated Linux/Node 24.16.0 proof; Python control-plane evidence and provenance tools.

## 1. Full catalog, live-first runtime

- Add `test/full-catalog.test.mjs`: static discovery must cover every eligible recorded ID; configured models must still use changed live limits and never resurrect absent live IDs.
- Run the regression against baseline in Blaxel and preserve the actual RED result.
- Refresh `src/seed.json` from a bounded public API read. Record source timestamp, hash, row counts and explicit exclusions in `src/catalog-meta.json`.
- Remove the seed-hit short circuit in `src/provider.mjs`; keep auth, pricing, cancellation and fallback boundaries.
- Run the regression GREEN and the existing provider/runtime/catalog suite.

## 2. Repeatable refresh and readable directory

- Add a bounded public-metadata acquisition and validation module. Reject duplicates, incomplete pagination, unsafe IDs and malformed eligible rows before writes.
- Add `scripts/update-catalog.mjs`: explicit refresh, read-only drift check and deterministic regeneration from the saved public snapshot.
- Generate `docs/MODELS.md` and `docs/models.json`. Include every catalog ID once, explicit exclusions, vendor capability claims, current limits and dated observed test outcomes.
- Preserve `test/fixtures/catalog.json`, `docs/compatibility.json` and earlier feature evidence unchanged.
- Test deterministic regeneration, new/removed/changed rows, stale timestamps, malformed responses and aborts. Verify counts programmatically.

## 3. Guided setup without hand-edited JSON

- Verify CLI registration and config mutation contracts against the exact published OpenClaw SDK, not only current documentation.
- Reuse `scripts/pricing.mjs` rate normalization through a packaged module; distinguish route base prices, tier/TTL details and explicit user estimates.
- Add pure selection/review/config-patch logic and a thin lazy CLI registrar under `src/`.
- Make model selection, pricing review and final consent explicit. Unknown rates cannot silently become zero. Never send API credentials to public metadata endpoints.
- Preview and cancellation must not write. Apply only the selected model estimates and corresponding model allowlist entries through the host mutation API.
- Preserve primary model, credentials, unrelated config, existing unselected models and historical-plugin migration boundaries. Reject concurrent selected-config changes.
- Test actual TTY/non-TTY paths, strict JSON output, invalid inputs, missing pricing, cancellation, conflict and native write/readback.

## 4. Additional targeted live feature evidence

- Select additional model families using current public capability and route-price evidence, outside historical quarantine.
- Run credential-free actual-host synthetic preflight before enabling forwarding.
- Exercise narrowly scoped tool round-trip, strict-schema transport and controlled image/reasoning cases as supported by the selected models and remaining authorized budget.
- Bound every forward, response, deadline and process group. Reserve before dispatch, checkpoint receipts before continuation, and never retry accepted or ambiguous requests blindly.
- Publish actual per-case results and model identity. A failed or inconclusive upstream feature is not a pass and does not erase earlier evidence.

## 5. Release and close the goal

- Run `npm run check`, `npm test`, `npm run test:transport`, catalog consistency and native setup/catalog proof in Blaxel.
- Inspect `npm pack --json` and validate the real package. Bind evidence to the exact source/artifact.
- Publish source and reviewed release evidence under the existing human authorization, then publish the new ClawHub version.
- Verify clean registry scans, public archive bytes, fresh native registry installation, 1.1.0 upgrade/config preservation and rollback.
- Export actual commit chronology, read back public targets and independently verify all owned workers absent.

Completion means every acceptance item has a real result and public evidence, not merely that this checklist has been written.
