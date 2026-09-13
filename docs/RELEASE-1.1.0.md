# Version 1.1.0: concentrate-provider

## Publication status

**Published and verified:** [concentrate-provider 1.1.0 on ClawHub](https://clawhub.ai/plugins/concentrate-provider). [Machine-readable evidence](CLAWHUB-RELEASE-1.1.0.json) records exact identities, timestamps, hashes, commands and remaining limits.

- Publisher: `felirami`; display name: **Concentrate AI Provider**.
- Source commit: [`f8a1923eb428a62d42b4d445f94861a31cbe6b4a`](https://github.com/arcacomputer/openclaw-concentrateai/commit/f8a1923eb428a62d42b4d445f94861a31cbe6b4a).
- ClawScan and TruffleHog: **clean**. Public artifact digest matches the tested tarball.
- Package checks: **41 passed, zero failed**. Synthetic transport: **8 passed, zero failed**. The new identity regressions first failed against the previous source.
- ClawHub validation: zero issues and warnings. Exact eight-file MIT archive and real SDK import verified.
- Fresh registry installation passed **without `--force`**. Plugin `concentrate-provider` loaded, provider `concentrate` registered, and every installed file matched the tested package.
- Native model selection and refresh returned `concentrate/gpt-4.1-mini` as available using a nonfunctional synthetic credential. This is not an entitlement/inference test.
- Migration from registry 1.0.1 passed: old plugin disabled, new plugin loaded, exact saved cost configuration retained, unchanged model ID and a synthetic memory sentinel preserved.
- Rollback passed: new plugin disabled, old 1.0.1 plugin re-enabled, model registration and saved costs retained. The old public package artifact remains unchanged.
- All 24 native proof commands exited zero. Both sequential, bounded Blaxel workers were removed after evidence download; provider inventory independently verified.
- **No new paid inference and no production gateway changes.** Historical model limitations and unknown charge reservations remain intact.

```sh
openclaw plugins install clawhub:concentrate-provider --accept-capabilities
```

Tarball SHA-256: `3f1039704f440b4edf15da4098c2d02bc98be53e6bb21ffb577d3f3cce18690f`.

The verification target is **OpenClaw 2026.9.4 / Node 24.16.0 / Linux**. This remains a community/source-linked release, not signed build provenance. Native OpenClaw still reports `trust.reason: provenance-invalid`; that diagnostic is retained, not bypassed or explained away.

## Identity changes

- GitHub: `arcacomputer/openclaw-concentrateai`, renamed in place with the same repository ID and preserved history/releases.
- ClawHub: new `concentrate-provider` package. The owner-facing rename attempt returned HTTP 403, `Admin role required`.
- Plugin ID: `concentrate-provider`, as required for a separate package under the same publisher.
- Display name: `Concentrate AI Provider`.
- Provider/model prefix stays `concentrate/`; API-key environment and auth choice remain unchanged.
- The old `openclaw-concentrate` package remains available. No automatic update/alias migration is claimed.

Follow [MIGRATING.md](MIGRATING.md) before replacing an existing installation. Do not enable both plugins.

## Scope and retained evidence

`src/provider.mjs`, `src/catalog.mjs` and `src/seed.json` are unchanged from the prior qualified release. The entry changes its plugin identity and display name; metadata, configuration documentation and active harnesses follow that identity. New package checks, installed-host registration and migration proof qualify those changes without spending on new inference.

Earlier live feature/model findings remain dated evidence, not a new all-model certification: [1.0.x release](RELEASE-1.0.0.md), [feature testing](FEATURE-TESTING.md), [compatibility](COMPATIBILITY.md). Historical failures, unknown charges and quarantines are retained. Community/source-linked distribution is not signed build provenance.
