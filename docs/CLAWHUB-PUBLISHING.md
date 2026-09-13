# ClawHub publication

Authoritative references:
- https://docs.openclaw.ai/clawhub
- https://docs.openclaw.ai/clawhub/cli
- https://docs.openclaw.ai/clawhub/plugin-validation-fixes

This repository is a **code plugin**, not a skill. Use `clawhub package` commands, not `clawhub skill publish`. The MIT-0 skill publishing terms are not a reason to silently change this plugin's MIT license.

## Required preparation

1. Finish the release gates and bind the exact reviewed source commit and package artifact. Do not label incomplete compatibility as stable certification.
2. Check current required package metadata. Official docs require `openclaw.compat.pluginApi` and `openclaw.build.openclawVersion`. The current package has compatibility metadata but is missing build provenance; add a truthful build/runtime version and validate the resulting candidate before upload. Do not invent a build timestamp or claim prior tests ran against changed source.
3. Confirm the intended package name and publisher with the authorized account. The current `openclaw-concentrate-local` name is preview metadata, not a verified ClawHub registry identity. Do not assume the GitHub organization automatically grants ClawHub publisher access.
4. Install/use the ClawHub CLI in the bounded execution environment, record its version, and run:

```sh
clawhub package validate /absolute/path/to/candidate --json
clawhub package publish /absolute/path/to/candidate --dry-run --json
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

Documentation reviewed and publication requirements recorded. This document is not evidence that validation, dry-run publication, authentication or an upload has occurred. ClawHub release is still pending.
