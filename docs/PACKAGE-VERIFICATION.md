# Direct clean-package verification

Publication author/committer time: `2026-09-13T08:50:53+00:00`.
Tested source commit: `e0f895ab19e5cfc041fc8c2ccef09a6d362e5e8a`.
Source archive SHA256: `c85b023b1bc00b051cfa990d0835d505f51f6adf91b0fc7e13dd9ca1bc2d84b0`.

Directly operated on Blaxel, no subagent. One worker at a time, 8 GiB, ten-minute TTL. No paid inference or model keys. All three sequential workers were cleaned up.

- Package syntax checks passed.
- 31 package tests passed, zero failed/skipped.
- npm pack completed.
- OpenClaw 2026.9.4 local plugin installation completed with explicit local-source trust and capability consent.
- `plugins list --json` reported `concentrate` enabled, status `loaded`, provider ID `concentrate`, dependencies installed and no diagnostics.

Initial installation attempts correctly stopped for missing local-source trust and capability consent. They were not plugin incompatibility results. The documented final command includes both explicit consent flags.

Final install evidence timestamp: `2026-09-13T08:50:09.301084+00:00`.
Cleanup readback timestamp: `2026-09-13T08:50:16.303201+00:00`.

This proves source package installation and loading, not full feature certification. Vision accuracy remains unresolved. Live parallel-tool/new-user testing remains incomplete; the latest dispatcher tests used simulated transport callbacks. Prior text, tool-roundtrip, reasoning and strict-schema results retain their existing individual scopes. No npm release or upstream acceptance is claimed.
