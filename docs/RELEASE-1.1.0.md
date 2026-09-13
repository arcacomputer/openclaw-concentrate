# Version 1.1.0: concentrate-provider

## Publication status

This source candidate introduces the owner-authorized package migration. Final publication, scan and installation evidence will be recorded here after verification; do not infer registry availability from this source commit alone.

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
