# ClawHub publication

Authoritative references:
- https://docs.openclaw.ai/clawhub
- https://docs.openclaw.ai/clawhub/cli
- https://docs.openclaw.ai/clawhub/plugin-validation-fixes

This repository is a **code plugin**, not a skill. Use `clawhub package` commands, not `clawhub skill publish`. The MIT-0 skill publishing terms are not a reason to silently change this plugin's MIT license.

## Required preparation

1. Finish the release gates and bind the exact reviewed source commit and package artifact. Do not label incomplete compatibility as stable certification.
2. Check current required package metadata. Official docs require `openclaw.compat.pluginApi` and `openclaw.build.openclawVersion`. The package now records build compatibility with OpenClaw 2026.9.4; retain truthful provenance and validate the resulting candidate before upload. Do not invent a build timestamp or claim prior tests ran against changed source.
3. Confirm the intended package name and publisher with the authorized account. The candidate package is `openclaw-concentrate@1.0.0`; this name passed a dry run but is not yet a verified ClawHub registry identity. Do not assume the GitHub organization automatically grants ClawHub publisher access.
4. Install/use the ClawHub CLI in the bounded execution environment, record its version, and run:

```sh
clawhub package validate /absolute/path/to/candidate --json
clawhub package publish /absolute/path/to/candidate --source-repo arcacomputer/openclaw-concentrate --source-commit <exact-source-commit> --dry-run --json
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

The 1.0.0 candidate passed zero-issue validation and an exact-source publish dry run. Publisher authentication is unavailable; upload, security scan and registry installation have not occurred. See [current release evidence](RELEASE-1.0.0.md).

## Executed preflight

ClawHub CLI 0.23.3 static validation passed with no issues after adding build metadata. The first dry run stopped because code plugins require explicit `--source-repo` and `--source-commit`; the example above includes those flags. This result is not an uploaded release.

The corrected exact-commit dry run **passed**, along with 32 package tests and zero-issue static validation. See [machine-readable preflight evidence](CLAWHUB-PREFLIGHT.json). This proves a publish plan for the preview package, not registry upload, full compatibility, or final publisher identity.
