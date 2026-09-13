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

## Batch 09: fixture paths qualified; replay discovery blocked

Publication author/committer timestamp: `2026-09-13T07:27:33+00:00`. Evidence verified at `2026-09-13T07:26:06.379663+00:00`.

Four safe absolute/relative path cases and twelve rejection cases passed. Actual OpenClaw read relative `a.txt` and absolute `b.txt`, preserving distinct call IDs and both values. These qualify fixture handling, not live parallel-tool compatibility.

Actual-host reordered replay remains unproved: the harness guessed a JSONL location but the host reported a logical session identifier. New-user-turn, malformed-ID and validator-only gate-negative tests were not reached. Automatic teardown on the first assertion failure also prevented intended same-worker debugging. Both are test workflow limitations, not provider failures.

Zero paid forwards, retries or model-key reads; ledger unchanged. Next qualification remains credential-free and must discover the installed persistence interface rather than guess filenames. 22 checkpoint files verified against archive `9e746f6f8a0ef42d43bc1002f1342341893dc53e599cd280076911a10bdfd7b3`, downloaded at `2026-09-13T07:24:10.498129+00:00` before scoped cleanup. No full preflight pass was produced.

## Batch 10: host process deadline; SQLite persistence source discovery

Publication author/committer timestamp: `2026-09-13T07:37:13+00:00`. Evidence verified at `2026-09-13T07:35:57.649249+00:00`.

Actual host read both fixtures with distinct IDs, but after emitting final JSON the process exceeded its 65-second deadline and was terminated (143/SIGTERM). **Final output is not a clean execution pass.** Reordered replay, new-user context, malformed-ID and gate-negative tests were not reached.

Installed source establishes scoped SQLite transcript interfaces, including watermark reads and generation/byte-fenced rewrites. This is an internal interface, not a stable public replay command, and remains runtime-unqualified. The next zero-paid stage diagnoses process exit before attempting replay. Candidate launcher classifier repairs remain unexecuted, not verified fixes.

No paid model calls or key reads. Ledger and feature matrix unchanged. 22 checkpoint files and 220 installed source files verified; archive `2a3e05675eced6560385f3f183ba14aa41bc0ea34e0d34b004c99a54a066fbd2` downloaded at `2026-09-13T07:31:15.953164+00:00` before cleanup. No live preflight pass or authorization resulted.

## Batch 11: recovered clean exit; internal ID mismatch blocks replay

Publication author/committer timestamp: `2026-09-13T07:53:13+00:00`. Recovery verified the existing checkpoint and archive, not a new test run.

34 raw files matched their checkpoint hashes and archive bytes; six recorded code hashes matched. The synthetic host exited 0 with no signals/error and was quiescent after 9219 ms and two synthetic forwards. **One clean exit neither diagnoses nor fixes the earlier deadline.**

The persistence probe reached transcript reads but expected bare tool IDs where the runtime stored composite identifiers `call_a|fc_a` and `call_b|fc_b`. No rewrite, generation-fence test, reordered replay or new-user turn executed. This is a harness expectation mismatch, not proof of provider failure. Next credential-free qualification must follow runtime ID conversion semantics without blindly rewriting identifiers.

Archive SHA-256: `7e0c1828998fa8c7672060fdf3fa33a23ab3580dd1b7d09d7abbc8565509f0e9`. Exact worker absence verified. No paid activity or key reads; ledger and feature matrix unchanged. Live testing remains blocked.

## Batch 12–13: recovered synthetic persistence/replay pass

Publication author/committer timestamp: `2026-09-13T08:11:45+00:00`. Batch 12 stopped before provisioning because an overly broad no-key-read instruction also blocked infrastructure authentication. No runtime pass came from that stage.

Batch 13's initial launcher failed Python parsing before execution. A corrected invocation subsequently ran; its first synthetic attempt failed an incorrect reversed-wire-order expectation, then a reviewed same-worker attempt passed. The later orchestration timeout was after cleanup, not a model failure.

**Runtime proved:** invalid-generation rejection; stale second-row bytes rejected with first-row rollback; durable SQLite tool-result reorder to B,A; actual-host new-user replay with wire A,B and correct distinct-ID pairing. Initial host, persistence probe and replay exited 0 and were quiescent. This is synthetic host replay qualification, not a paid parallel-tool pass or a fix for historical deadline causality.

Recovery verified 70 checkpoint files against raw/archive bytes and 171 local evidence checks. Executed harness SHA-256: `7ebc298b7e5f6cd028770ea5fab3c126807cec8dde6cbb8b6deed4c0df71c471`. Archive SHA-256: `34783f9617efd3db355fea801bedbe10d11d38a61bc0a975a0846409413159b2`.

**Remaining gate limitation:** validator-only evidence was rejected, but the gate checks hash presence rather than content integrity. Recovery independently checked actual hashes; the gate itself still needs tampering and identity-binding tests before paid continuation. Stale metadata and superseded source hashes are not treated as executed-source identities.

No paid calls or model-key reads in qualification. Ledger/matrix/quarantine unchanged; cleanup verified. Next stage is zero-paid integrity qualification only.

## Batch 14: standalone proof-integrity gate qualified

Publication author/committer timestamp: `2026-09-13T08:17:51+00:00`.

The replacement gate verifies exact-byte SHA-256, independently pinned source/runtime/model/case identities and freshness. 33 remote Node checks passed: 31 negatives, pristine retained actual-host proof accepted, and a RED control reproducing the old truthy-hash defect. This was not a new host replay or a model feature pass.

211 local evidence checks verified preservation of 200 prior evidence files including 70 checkpoints. Ledger, matrix and quarantine unchanged. No model calls or model-key extraction. Checkpoints, archive and executed source were verified before cleanup; provider readback at `2026-09-13T08:15:23.887649+00:00` confirmed worker absence.

**Scope limitation:** standalone gate qualification only. Integration into the private dispatcher remains unverified, and no production integration or live model authorization resulted from this batch. Integrated negative tests and fresh source-bound synthetic host proof must precede any new bounded live regression.
