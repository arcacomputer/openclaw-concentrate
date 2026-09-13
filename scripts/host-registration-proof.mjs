import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import plugin from '../index.mjs';
const costs = { input: 11, output: 22, cacheRead: 3, cacheWrite: 4 };
const pluginConfig = { acknowledgeEstimatedCosts: true, costOverrides: { 'gpt-4.1-mini': costs } };
let provider;
plugin.register({pluginConfig, registerProvider: p => provider=p, registerModelCatalogProvider:()=>{}, logger:{warn:()=>{}}});
const runtime=await provider.catalog.run({resolveProviderApiKey:()=>({apiKey:'synthetic-registration-only'})});
assert.equal(runtime.provider.models[0].id,'gpt-4.1-mini');
assert.deepEqual(runtime.provider.models[0].cost,costs);
writeFileSync('/tmp/proof/runtime.json',JSON.stringify({realSdk:true,...runtime,inference:false},null,2));
const path=process.env.OPENCLAW_CONFIG_PATH;
const config=JSON.parse(readFileSync(path,'utf8'));
config.plugins.entries.concentrate.config=pluginConfig;
config.agents ??= {}; config.agents.defaults ??= {};
config.agents.defaults.model={primary:'concentrate/gpt-4.1-mini'};
writeFileSync(path,JSON.stringify(config,null,2));
const dir='/tmp/host/node_modules/openclaw/dist';
const evidence=[];
for(const file of readdirSync(dir)) {
  if(!file.endsWith('.mjs') || !/model-registry|models-config|model-catalog|provider-catalog/.test(file))continue;
  const text=readFileSync(`${dir}/${file}`,'utf8');
  const lines=text.split('\n');
  for(let i=0;i<lines.length;i++) if(/cacheWrite: 0|cacheWrite: Type.Number|cost: model.cost|cost \?\?/.test(lines[i])) evidence.push({file,line:i+1,context:lines.slice(Math.max(0,i-5),i+5)});
}
writeFileSync('/tmp/proof/host-cost-contract.json',JSON.stringify(evidence,null,2));
