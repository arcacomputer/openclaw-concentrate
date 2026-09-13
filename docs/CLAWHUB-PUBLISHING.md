# ClawHub publication

Authoritative references:
- https://docs.openclaw.ai/clawhub
- https://docs.openclaw.ai/clawhub/cli
- https://docs.openclaw.ai/clawhub/plugin-validation-fixes

Current identity: `concentrate-provider`, source `arcacomputer/openclaw-concentrateai`. Read [the latest release report](RELEASE-1.1.0.md) and [migration guide](MIGRATING.md); the 1.0.1 evidence below is historical and belongs to `openclaw-concentrate`.

This repository is a **code plugin**, not a skill. Use `clawhub package` commands, not `clawhub skill publish`. The MIT-0 skill publishing terms are not a reason to silently change this plugin's MIT license.

## Required preparation

1. Finish the release gates and bind the exact reviewed source commit and package artifact. Do not label incomplete compatibility as stable certification.
2. Check current required package metadata. Official docs require `openclaw.compat.pluginApi` and `openclaw.build.openclawVersion`. The package now records build compatibility with OpenClaw 2026.9.4; retain truthful provenance and validate the resulting candidate before upload. Do not invent a build timestamp or claim prior tests ran against changed source.
3. Confirm the intended package name and publisher with the authorized account. The verified registry identity is `openclaw-concentrate`, currently published as 1.0.1 by `felirami`; bind any subsequent publication to its own reviewed version and source. Do not assume the GitHub organization automatically grants ClawHub publisher access.
4. Install/use the ClawHub CLI in the bounded execution environment, record its version, and run:

```sh
clawhub package validate /absolute/path/to/candidate --json
clawhub package publish /absolute/path/to/candidate --source-repo arcacomputer/openclaw-concentrateai --source-commit <exact-source-commit> --dry-run --json
```

Static validation does not prove runtime behavior. Warnings can still exit zero; inspect the report, not just the exit code. Runtime validation imports code and belongs in the isolated sandbox.

## Authenticated publication

The separate `clawhub` CLI handles login and publishing; native `openclaw` handles installation. Use `clawhub login` device authorization and verify `clawhub whoami`. Never print the stored token or commit its config. Obtain human help if the authorized account is unavailable. A dry run is not an upload.

After release gates, identity and publication authorization are satisfied:

```sh
clawhub package publish /absolute/path/to/candidate
```

Record the returned exact package/version identity and inspect its registry state. Automated scan or moderation holds may prevent public installation even after submission. Verify the public artifact/digest and a clean installation before claiming publication is complete:

```sh
openclaw plugins install clawhub:<verified-package-name>
```

The placeholder must be replaced by the actual registry identity, not a guessed scope. Source installation is not ClawHub installation proof. Record publication/install timestamps separately from execution and Git commit dates.

Trusted GitHub Actions publishing is optional follow-up, not automatic: initial package creation requires normal authentication, and trusted-publisher configuration must be explicitly established and read back. Never add automatic publish-on-push as a convenience without authorization.

## Status

**Version 1.0.1 is published and install-verified.** ClawScan and TruffleHog are clean. Fresh unauthenticated native installation passed without `--force`, and all eight files matched the tested artifact. See [current release evidence](RELEASE-1.0.0.md) and [machine-readable publication/installation records](CLAWHUB-RELEASE.json). This is a community/source-linked release, not cryptographically attested provenance; the native trust diagnostic is preserved in those records.

## Historical preflight

ClawHub CLI 0.23.3 static validation passed with no issues after adding build metadata. The first dry run stopped because code plugins require explicit `--source-repo` and `--source-commit`; the example above includes those flags. This result is not an uploaded release.

The corrected exact-commit dry run **passed**, along with 32 package tests and zero-issue static validation. See [machine-readable preflight evidence](CLAWHUB-PREFLIGHT.json). This proves a publish plan for the preview package, not registry upload, full compatibility, or final publisher identity.

## Observed publication details

For ClawHub CLI 0.23.3, the successful publication explicitly selected owner, family, name, version, source repository/commit and `latest` tag. Optional topics were explicitly empty. `openclaw` is a reserved topic: a server-side rejection caught it even after a successful dry run. Verify the previous attempt's state before correcting and resubmitting; never repeat an accepted/ambiguous upload blindly.

A successful upload can return `pending-publication`. Preserve its exact attempt and release IDs. The CLI uses `GET /api/v1/publish/attempts/<attemptId>` for authenticated status; require a terminal published state and inspect each check. Public `GET /api/v1/packages/<name>` exposes `package.latestVersion`, `package.artifact.sha256` and `package.scanStatus`. Read the actual schema rather than assuming a top-level `latestRelease` object.

Do not hold a paid sandbox idle while remote registry checks are queued. Checkpoint its evidence and clean it up, then use a fresh bounded install worker only after publication and scans are ready. The final worker should download its complete evidence and perform verified cleanup automatically, without waiting for another conversational turn.

Keep README links absolute so evidence opens from the ClawHub renderer. Keep package and manifest descriptions synchronized. Documentation/metadata changes to an already-published archive require a new version; 1.0.1 preserves unchanged provider code and model data rather than overwriting 1.0.0.
