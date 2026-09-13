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

## Batch 05: reasoning pass, vision accuracy failure

Publication author/committer timestamp: `2026-09-13T06:55:23+00:00`. Evidence verification: `2026-09-13T06:52:57.212495+00:00`. The coordinator timed out after results and cleanup were saved; the timeout itself is not a model result.

- Eight zero-paid lifecycle regressions passed again. Synthetic parent and child processes were verified credential-free before live dispatch.
- `gpt-5-mini` bounded reasoning passed at `2026-09-13T06:49:41.780Z`: one forward, 128 reported reasoning tokens, within the configured bound. Strict JSON, encrypted replay and reasoning summaries were **not proved**.
- `gpt-4.1-mini` vision case completed at `2026-09-13T06:49:30.842Z` with two forwards, but **failed visual accuracy**: expected red, answered blue. Transport completion is not vision compatibility. Fixture, on-wire image and host projection require diagnosis before assigning a root cause or retrying.
- Three paid forwards, no paid retries. Basic smoke totals unchanged; full certification incomplete.
- Archive SHA-256: `d986020dbce134df29fb0d0654eaf857493160c432d19228cb9866a99452e72f`. Download recorded at `2026-09-13T06:49:45.081273+00:00`; cleanup readback at `2026-09-13T06:50:59.483959+00:00`. Parent independently confirmed the worker absent.

## Batch 06: vision diagnosis and strict-schema configuration blocker

Publication author/committer timestamp: `2026-09-13T07:05:45+00:00`. Evidence verified at `2026-09-13T07:03:05.288637+00:00`.

Deterministic decoding confirms the retained vision fixture has 256 red RGB(255,0,0) pixels, valid PNG CRCs and no color-profile ambiguity. Synthetic and live requests contain identical image bytes. This proves correct client-to-Concentrate ingress, **not** provider-internal forwarding to the underlying model. The blue answer remains a failed visual-accuracy case; internal image handling versus model interpretation is unresolved. No vision retry occurred.

Four negative schema-validator checks passed, but the actual synthetic OpenClaw request omitted `body.text.format`. The harness incorrectly used `extra_body`, which applies to Chat Completions rather than Responses in this runtime. This is a harness configuration error, not a provider rejection. Strict schema remains unproved; the supported host configuration path must produce actual wire evidence before live testing.

Zero new paid forwards or reservations. Ten raw checkpoint files and archive were verified before scoped deletion. No compatibility status is upgraded by this batch. Archive SHA-256: `155d280de41ccaa2ce98aea13ae16b29b6d5602a78c3ee4030d7b9b962216b2a`.

## Batch 07: strict-schema request and bounded live output passed

Publication author/committer timestamp: `2026-09-13T07:12:28+00:00`. Evidence verified at `2026-09-13T07:11:27.065774+00:00`.

The actual OpenClaw host configuration is `agents.defaults.models["concentrate/gpt-4.1-mini"].params.response_format`, using nested `json_schema`. Installed runtime source and captured requests show conversion to Responses `body.text.format`; the proxy did not inject it.

Six credential-free real-host synthetic cases passed the test criteria: five adversarial outputs were rejected by the **harness validator**, and valid JSON was accepted. **OpenClaw returned the invalid fixtures successfully.** This demonstrates schema request support and independent validation, not host-side schema enforcement. Consumers must validate outputs rather than assume the host rejects malformed responses.

One paid forward through `azure/gpt-4.1-mini` returned `{"ok":true}`, HTTP 200 completed, 1,631 input and 6 output tokens under a 512-token cap. No paid retries or vision retests. This is a bounded representative strict-schema pass, not a guarantee across the catalog or every schema.

53 checkpoint files verified against the archive. Archive SHA-256: `2e5acd2d761caf82a47bafc2d8cebf689fc652c43468528c875405d6af28a2a5`; downloaded at `2026-09-13T07:09:10.412402+00:00` before cleanup. Parallel tools were not attempted in this batch. Vision remains unresolved; full certification incomplete.

## Batch 08: partial synthetic proof; live inconclusive

Publication author/committer timestamp: `2026-09-13T07:21:40+00:00`. Evidence verified at `2026-09-13T07:20:20.464384+00:00`.

Actual synthetic OpenClaw preserved two distinct tool calls, correctly paired fixture outputs and context on a new user turn. Reversed outputs and three invalid-ID cases were tested only by the harness validator. **Actual-host reordered replay and host-side negative validation were not proved.** The live prerequisite gate incorrectly accepted this narrower evidence.

The live attempt stopped after one forward because the harness's absolute-only path guard rejected harmless relative `a.txt`. No terminal receipt was captured; billing is unknown, not zero. All three authorized-forward reservations remain retained. No retry occurred. This is not a live parallel-tool pass or a model failure.

The next stage is zero-paid only: canonical fixture-path safety tests, actual-host reordered replay, and a gate that rejects validator-only evidence. Basic smoke and previous strict-schema results remain unchanged.

48 checkpoint files verified against archive `0a266f910a9f819501b3b76f5be6eb78cee0f5ebf0f72d30ae715d58eb62cbce`, downloaded at `2026-09-13T07:17:30.422281+00:00` before scoped cleanup.
