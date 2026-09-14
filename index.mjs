import { definePluginEntry } from 'openclaw/plugin-sdk/plugin-entry';
import { createProviderApiKeyAuthMethod } from 'openclaw/plugin-sdk/provider-auth';
import { getCachedLiveProviderModelRows } from 'openclaw/plugin-sdk/provider-catalog-live-runtime';
import { createConcentrateProvider, createConcentrateModelCatalog } from './src/provider.mjs';

export default definePluginEntry({
  id: 'concentrate-provider', name: 'Concentrate AI Provider',
  description: 'Concentrate AI Responses provider with explicit user cost estimates',
  register(api) {
    api.registerCli(async ({ program }) => {
      const { readConfigFileSnapshotForWrite, mutateConfigFile } = await import('openclaw/plugin-sdk/config-mutation');
      const { registerConcentrateCli } = await import('./src/cli.mjs');
      registerConcentrateCli(program, {
        readSnapshot: async () => (await readConfigFileSnapshotForWrite()).snapshot,
        mutate: mutateConfigFile,
      });
    }, { descriptors: [{ name: 'concentrate', description: 'Browse Concentrate models and review setup estimates', hasSubcommands: true, machineOutput: ({ argv }) => argv.includes('--json') }] });
    api.registerProvider(createConcentrateProvider(
      { createProviderApiKeyAuthMethod, getCachedLiveProviderModelRows },
      message => api.logger.warn(message), api.pluginConfig ?? {},
    ));
    api.registerModelCatalogProvider(createConcentrateModelCatalog(
      { getCachedLiveProviderModelRows }, message => api.logger.warn(message),
    ));
  },
});
