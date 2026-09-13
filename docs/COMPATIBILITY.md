# Compatibility snapshot

Snapshot: 2026-09-13, completed resume-04 batch. Tests continue; this is a committed snapshot, not a real-time feed.

## Coverage

- passed: **119**
- error: **5**
- inconclusive: **33**
- skipped: **3**
- pending: **25**

All 185 catalog IDs are retained in [compatibility.json](compatibility.json). A pass means a verified basic text-response smoke through the actual OpenClaw provider route, not full model/feature compatibility. Historical errors include output-budget-limited attempts, not necessarily provider incompatibility. Inconclusive includes missing raw evidence, blocked continuations, unavailable routes and rate limits. Eight Grok-family rows remain quarantined pending output-limit semantics review. A redaction utility is outside chat scope; other skipped rows have unresolved pricing bounds.

## Tested environment and controls

OpenClaw 2026.9.4, Node 24.16.0, isolated Linux on Blaxel. Initial tests used 32 output tokens; later tests use 256 for ordinary text and 2048 for reasoning. Attempts preserve original histories. Fresh state, measured empty skills/tools, fixed-origin HTTPS, one upstream-forward guard, no model fallback, configured provider retries disabled, and process-group cancellation constrain each smoke test. Provider-side routing is retained in receipts; requested model does not imply a fixed backend provider.

## Findings and limitations

- Small output limits can end reasoning before visible text. These are inconclusive, not failed interoperability.
- Some Grok receipts exceeded the requested output cap; affected routes remain quarantined.
- OpenClaw may attempt a visible-answer continuation even with transient retries disabled. The test guard blocks extra paid forwards; such attempts are not clean passes.
- One earlier batch lost raw remote artifacts during a worker failure. Its surviving summaries are conservatively inconclusive. Later runners checkpoint raw evidence after every model.
- Live tool use, image inputs, structured output and every-model multi-turn behavior are not certified by these text smokes.
- Public catalog capability flags and synthetic fixtures are not live model passes.
- Provider-returned usage/cost is distinct from account billing reconciliation. User-entered costs are explicitly estimates, not spend limits.
- Native macOS and Windows remain unverified.

## Evidence and reproducibility

The repository includes the plugin, unit tests, public vendor metadata fixtures, pricing inspection helper, test-plan generator, synthetic host checks and bounded adapter. Private infrastructure launchers, credentials, account records and raw operational archives are intentionally excluded. Local-path installation has been exercised in isolated hosts; no registry release exists. The exact public packaging tree has not yet received its own fresh clean-room verification; prior runtime proof applies to the transported implementation snapshots.

Official sources: [Concentrate docs](https://concentrate.ai/docs/llms.txt), [OpenClaw provider SDK](https://docs.openclaw.ai/plugins/sdk-provider-plugins).
