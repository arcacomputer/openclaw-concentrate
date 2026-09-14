# Installed-plugin all-model campaign

Updated: 2026-09-14T15:53:50.579956+00:00

**Incomplete.** Evidence through 2026-09-14T15:52:16.210693+00:00. Not an all-model compatibility certificate.

- Plugin: `concentrate-provider@1.2.0`
- Exact tested source: `0043409b4273a37e12e80f526a5b94e47df27906`
- Artifact SHA-256: `6b6b13a9e17de626f9c09c199c03d398c8998824ae6dd47a396101d1827b5220`
- Runtime: OpenClaw 2026.9.4, Node 24.16.0, Linux on Blaxel
- **322 / 717 checks recorded; 268 passed.**
- All 176 nonquarantined models have baseline outcomes, not necessarily passes.
- Feature testing is underway. Historical representative proofs remain separate.

## Outcomes

- `passed`: 268
- `failed-acceptance`: 22
- `inconclusive`: 22
- `inconclusive-interrupted`: 1
- `upstream-rejected`: 8
- `blocked-synthetic-preflight`: 1

## Feature coverage

- **basic-response**: 176 / 176 recorded; 154 passed.
- **reasoning**: 34 / 125 recorded; 26 passed.
- **schema**: 37 / 137 recorded; 36 passed.
- **tool-roundtrip**: 40 / 176 recorded; 27 passed.
- **vision**: 35 / 103 recorded; 25 passed.

## Interpretation and remaining failures

- Baseline response success is not proof of tools, strict schema, reasoning or vision. Individual feature cases appear in the JSON.
- Acceptance failures are distinct from connectivity failures. Some baseline responses wrapped otherwise correct JSON in Markdown fences.
- Some reasoning requests exhausted the 512-token ceiling, including `gpt-5` and the second tool turn of `o1`. These are inconclusive, not proof the models lack tool support.
- `gpt-5-mini` hit the request-byte ceiling on a tool continuation. The continuation was blocked before dispatch.
- `gpt-4o` attempted a third request beyond the two-forward test budget; it was blocked locally.
- `gpt-oss-safeguard-120b` had a continuation missing the required tool result. It was blocked before dispatch.
- `gpt-5.4-pro` reasoning failed synthetic preflight: the host sent medium effort rather than the expected low. No paid forward occurred for this case.
- `command-a-vision` received an upstream rate-limit rejection during its baseline test.
- Earlier output-cap violations, interrupted calls and timeouts remain recorded. Eight Grok models remain quarantined; `redact-v1` is excluded as non-chat utility.

## Controller repairs and continuation

An earlier controller defect could mistake synthetic receipts for failed live receipts. The audit rejected those settlements and restored reservations. This did not change the published plugin artifact.

The [receipt guard](../scripts/verification/receipt_guard.py) matches genuine live terminal events, request identity, counts and token/cost bounds before settlement. Eleven receipt regression tests passed during the latest controller verification.

Reviewed continuation rules permit other unsubmitted cases after specific isolated failures, with evidence and cleanup verification. Completed prefixes and bounded incomplete responses must match actual live requests and reserved costs. Inconclusive outcomes and full spending holds remain unchanged. No extra paid forward, retry, or relaxed token/byte limit is authorized by these rules. Unrecognized failures still stop the campaign.

## Full catalog and case accounting

[Machine-readable results](ALL-MODEL-E2E.json) cover all **185 catalog IDs** and **717 planned cases**, with untested entries, per-model feature outcomes, execution timestamps and SHA-256 references to private evidence. Null timestamps/counts indicate unavailable evidence, not zero. Evidence hashes are references, not public access or independent attestation.

No credentials, private account balances or raw workspace transcripts are published. Validated receipts are not account-level reconciliation. This is a documentation update, not a new ClawHub release, main-branch integration or completed registry update/rollback proof.

[Commit history](COMMIT-HISTORY.md) exports real Git timestamps through the preceding commit. Git records the later publication commit itself; no timestamps are backdated.
