# Installed-plugin all-model campaign

Updated: 2026-09-14T05:12:18.434046+00:00

**Incomplete.** Evidence through 2026-09-14T05:09:43.312096+00:00. This is not an all-model compatibility certificate.

- Tested plugin: `concentrate-provider@1.2.0`
- Exact plugin source: `0043409b4273a37e12e80f526a5b94e47df27906`
- Artifact SHA-256: `6b6b13a9e17de626f9c09c199c03d398c8998824ae6dd47a396101d1827b5220`
- Runtime: OpenClaw 2026.9.4, Node 24.16.0, Linux on Blaxel
- Planned checks: 717 across basic responses and applicable tools, schema, reasoning and vision
- Recorded baseline outcomes: 92, with **84 passed, 4 formatting failures, 4 inconclusive/interrupted**
- No feature phase has been reached in this campaign. Earlier representative feature proofs are separate.

## What failed

Four models returned the correct JSON inside Markdown fences despite the JSON-only instruction. This is an instruction-following failure, not evidence that a strict-schema request failed: strict schema was not requested in the baseline.

- `qwen3-vl-30b-a3b`: live timeout; billing remains unknown.
- `qwen3.5-plus`: reported 1,170 output tokens against a requested maximum of 512. Not retried.
- `qwen3.5-397b-a17b`: interrupted during the safety shutdown; dispatch/charge remain unresolved.
- `qwen3-max`: live timeout at the 25-second upstream deadline; no validated billing receipt.

## Controller defect and repair

The initial controller could mistake a leftover synthetic receipt for a failed live call's receipt. This incorrectly settled two calls and allowed testing to continue. The audit rejected those receipts and restored the reservations. The published plugin artifact was not changed by this controller repair.

The repaired guard rejects synthetic IDs, mismatched runtime counts, missing live requests, wrong model/turn identity, altered receipts, duplicated terminal events, and invalid token/cost bounds. A receipt must exactly match its live terminal event. Eleven private controller regression tests passed, including both retained actual failures and the genuine-receipt corpus. The original and repaired assessment functions were replayed against both failures: the original settled; the repaired version stopped without settling.

Portable guard: [receipt_guard.py](../scripts/verification/receipt_guard.py). It is controller-side accounting validation, not a change to provider behavior or a substitute for real-host tests.

## Full catalog accounting

[Machine-readable results](ALL-MODEL-E2E.json) list all 185 catalog IDs individually, including untested models, eight Grok safety quarantines, and the non-chat `redact-v1` exclusion. Prior compatibility reports remain unchanged.

No credentials, private account balances, or raw workspace transcripts are published here. Completed-call receipts are not account-level billing reconciliation.
