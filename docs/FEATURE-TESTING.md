# Full-feature campaign: batch 01

Publication author/committer timestamp: `2026-09-13T06:26:15+00:00`. Exact commit SHA is available from `git log -1 --format='%H %aI %cI' -- docs/FEATURE-TESTING.md`.

## Recorded execution times (UTC)

- Stage started: `2026-09-13T06:20:02.369782+00:00`
- Cleanup completed: `2026-09-13T06:20:53.106341+00:00`
- Provider readback: `2026-09-13T06:22:46.807631+00:00`

Runtime: OpenClaw 2026.9.4, Node 24.16.0. These are stage timestamps, not invented per-case timestamps.

## Actual result

The fragmented-SSE synthetic two-turn preflight passed. Live `gpt-4.1-mini` streamed 29 chunks, emitted a `read` call, and OpenClaw executed it and prepared the matching function-call output. The guard blocked the second paid forward because it arrived before first-turn receipt validation finished. This is a harness sequencing defect, not evidence of model incompatibility.

**Full tool roundtrip: inconclusive. Full-feature passes in this batch: 0.** One upstream forward occurred. Vision and reasoning remained undispatched. Structured JSON and cancellation/error gates remain unverified in this campaign.

The existing basic-response results are unchanged. No full-feature certification or upstream readiness is claimed. Before another paid case: delayed-EOF zero-paid regression, fail-closed receipt accounting repair, then bounded live verification.

## Evidence

13 private raw files plus archive were downloaded and verified. Raw logs are not published because they can contain operational details. Archive SHA-256: `b9f582c7ece0888d708df25ac9156cf1a691a11c6d370b6ca5e6f63186fe2afb`. Tested provider source SHA-256: `e87b61a519631f84d705330dfe01433549922ecec3feb2e771e527abed4c2513`. Source hashes identify tested files; this was not a checkout of the current public documentation commit.

## Feature acceptance definitions

- **streaming**: stream=true; receive incremental text/tool-argument deltas before terminal; preserve chunk timestamps; fragmented synthetic SSE
- **tool-roundtrip**: one named function and matching call_id result; real workspace read; precisely two reserved upstream forwards
- **multiturn**: tool-mediated context in first stage; later independent user conversation and history replay
- **structured-json**: strict text.format.json_schema request observable from actual host; validate parsed output against schema; --json CLI flag alone is not model structured output
- **vision**: deterministic nonprivate red16x16 PNG read through actual tool into input_image; exact image hash and image-aware reservation
- **reasoning**: supported effort on wire plus reasoning-inclusive usage below output cap; summary/encrypted replay separately qualified
- **usage-cost**: raw terminal usage and cost for every forward, host-projected usage comparison, no reasoning double count; not account reconciliation
- **cancellation**: synthetic hung stream and process-group TERM/KILL containment; live disconnect billing reconciliation is separately blocked
- **errors**: isolated synthetic 400/402/429/500/incomplete/failed/malformed SSE; exact attempted and forwarded counts; no paid manufactured errors
- **parallel-tools**: two independent synthetic calls with out-of-order outputs before one bounded paid representative
- **context-replay**: function call IDs, assistant reasoning summaries/encrypted replay, fresh user turn, overflow and compaction synthetic first
- **routing-pricing**: all eligible route rates/cache/tier pricing; backend receipt identification; fallback/degradation cannot silently count as feature pass
- **catalog-auth**: discovery versus configured estimates, missing key, HTTPS fixed origin, abort, dynamic failure/static fallback
- **packaging-platform**: fresh exact public-tree install on Linux; macOS/Windows separately; no broad-suite claim from original runtime hashes

## Batch 04: verified lifecycle repair and live tool roundtrip

Publication author/committer timestamp: `2026-09-13T06:44:42+00:00`. Live case recorded at `2026-09-13T06:40:08.787Z`; evidence verified at `2026-09-13T06:41:50.543254+00:00`. These timestamps are separate from batch 01 above.

The harness incorrectly treated downstream close after terminal consumption as cancellation. The tested repair validates and persists the semantic terminal before forwarding it, then drains upstream under bounds/timeouts before authorizing the next forward. Later contradictory terminal records still fail closed.

**Eight zero-paid regressions passed:** valid fragmented-SSE/delayed-EOF and seven fail-closed cases (missing usage, invalid usage, overcap, timeout, cancellation, oversized frame, contradictory terminal). This is harness safety evidence, not eight model feature passes.

**Live `gpt-4.1-mini` tool roundtrip passed:** two reserved forwards, two receipts, host exit 0, matching tool-call/result ID and final `FEATURE_OK`. No paid retries. Other models and broader features remain uncertified; the 141-model basic smoke count is unchanged.

Credential-isolation caveat: standalone regressions were credential-free; the live process repeated synthetic preflight with the real key still held in its parent closure, although synthetic children received only a dummy key. A later isolation draft was untested in this batch. Do not describe that hardening as verified.

### Exact regression record times

- `valid`: `2026-09-13T06:39:07.356Z`
- `missing`: `2026-09-13T06:39:14.745Z`
- `invalid`: `2026-09-13T06:39:20.943Z`
- `overcap`: `2026-09-13T06:39:27.216Z`
- `timeout`: `2026-09-13T06:39:33.901Z`
- `cancel`: `2026-09-13T06:39:41.935Z`
- `bounds`: `2026-09-13T06:39:48.241Z`
- `contradiction`: `2026-09-13T06:39:55.087Z`
