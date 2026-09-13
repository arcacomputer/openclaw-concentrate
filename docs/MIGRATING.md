# Migrating to concentrate-provider

## What changed

- Repository: `arcacomputer/openclaw-concentrateai`. GitHub redirects the previous repository URL and preserves its history, issues and releases.
- New ClawHub package: `concentrate-provider`; display name: **Concentrate AI Provider**.
- New plugin ID/configuration entry: `concentrate-provider`.
- Unchanged provider ID, model IDs and credential: `concentrate`, `concentrate/<model-id>`, `CONCENTRATE_API_KEY`.

ClawHub returned `403 Admin role required` for its name-repair dry run. Its publishing rules require each package under one publisher to use a distinct plugin ID. This is therefore a new package with an explicit migration, not a redirect or an automatic update of `openclaw-concentrate`. The old package and its releases remain available, unchanged.

## Existing installation

Do this during a maintenance window, not during an active agent run. Take a normal backup of your OpenClaw configuration/state first. Preserve sessions, memory, auth profiles and credentials. Do not delete or reset the state directory.

1. Save your existing `plugins.entries.concentrate.config`, including `acknowledgeEstimatedCosts` and every `costOverrides` value. Do not substitute the README's sample prices for your saved estimates.
2. Disable the old plugin, then install the new package:

```sh
openclaw plugins disable concentrate
openclaw plugins install clawhub:concentrate-provider --accept-capabilities
```

3. Copy the saved cost configuration into `plugins.entries["concentrate-provider"].config` using OpenClaw's configuration editor or `openclaw config set plugins.entries.concentrate-provider.config '<saved-cost-config-json>'`. The quoted JSON is a placeholder for your saved object, not a literal command to paste.
4. Run `openclaw config validate` and `openclaw plugins list --json`. Require `concentrate-provider` enabled/loaded and `concentrate` disabled. Keep the previous disabled plugin/configuration for rollback. **Do not enable both plugins.**
5. Keep your existing provider credentials, `concentrate/<model-id>` selections and model parameters. Restart your gateway in the normal maintenance workflow after validation. Check model availability with `openclaw models list --all --provider concentrate --refresh --json`; model listing does not send a paid inference request.

If you maintain an explicit `plugins.allow` list, make sure it permits `concentrate-provider`. The native installer manages its install record; do not rewrite the SQLite install index by hand. Custom source-only `plugins.load.paths` entries must point to the intended installed package, not an obsolete checkout.

## Rollback

The old package was not deleted or overwritten. While the gateway is idle:

```sh
openclaw plugins disable concentrate-provider
openclaw plugins enable concentrate
openclaw config validate
```

Keep the saved old config and normal backup until migration is verified. Rollback does not require deleting memory, sessions, credentials or either plugin's configuration. Restart the gateway using its normal service workflow.

## Evidence scope

See [the 1.1.0 release report](RELEASE-1.1.0.md) for exact package, registry installation, model-registration, migration and rollback results. The verification target is OpenClaw 2026.9.4 / Node 24.16.0 on isolated Linux. No production gateway was modified and no new paid model call is part of this identity change.
