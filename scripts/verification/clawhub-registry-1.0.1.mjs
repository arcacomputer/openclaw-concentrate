import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
assert.equal(process.version,'v24.16.0');
for(const key of ['CONCENTRATE_API_KEY','BL_API_KEY','CLAWHUB_AUTH_JSON'])assert.equal(process.env[key],undefined,`Unexpected credential: ${key}`);
const root='/tmp/registry-install-v101';const proof='/tmp/proof-v101';
fs.mkdirSync(root,{recursive:true});fs.mkdirSync(proof,{recursive:true});
const env={PATH:process.env.PATH,HOME:root,OPENCLAW_STATE_DIR:root+'/state',OPENCLAW_CONFIG_PATH:root+'/config.json',CLAWHUB_DISABLE_TELEMETRY:'1'};
const save=(name,value)=>fs.writeFileSync(proof+'/'+name,JSON.stringify(value,null,2));
const commands=[];
function run(label,args){
 const startedAt=new Date().toISOString();
 const r=spawnSync('/tmp/host/node_modules/.bin/openclaw',args,{env,cwd:root,encoding:'utf8',timeout:90000,maxBuffer:8388608});
 const record={label,args,startedAt,finishedAt:new Date().toISOString(),exitCode:r.status,signal:r.signal,stdout:r.stdout,stderr:r.stderr,error:r.error?.message};save(label+'.json',record);commands.push({label,args,startedAt,finishedAt:record.finishedAt,exitCode:r.status});
 assert.equal(r.status,0,`${label}: ${r.stderr||r.stdout||r.error?.message}`);return r;
}
try{
 run('registry-install',['plugins','install','clawhub:openclaw-concentrate','--accept-capabilities']);
 const list=JSON.parse(run('plugins',['plugins','list','--json']).stdout);
 const plugin=list.plugins.find(x=>x.id==='concentrate');assert.ok(plugin);assert.equal(plugin.enabled,true);assert.equal(plugin.status,'loaded');assert.equal(plugin.version,'1.0.1');assert.deepEqual(plugin.providerIds,['concentrate']);assert.ok(!plugin.error);
 const folder=path.dirname(plugin.source);assert.ok(folder.startsWith(root+'/state/extensions/'));
 const expected=JSON.parse(fs.readFileSync('/tmp/expected-files.json'));const fileChecks=[];
 for(const item of expected){const digest=createHash('sha256').update(fs.readFileSync(path.join(folder,item.path))).digest('hex');assert.equal(digest,item.sha256,item.path);fileChecks.push({...item,matched:true});}
 assert.equal(fileChecks.length,8);
 const config={acknowledgeEstimatedCosts:true,costOverrides:{'gpt-4.1-mini':{input:0.4,output:1.6,cacheRead:0.1,cacheWrite:0.4}}};
 run('cost-config',['config','set','plugins.entries.concentrate.config',JSON.stringify(config)]);
 run('config-valid',['config','validate']);env.CONCENTRATE_API_KEY='fixture-only';
 run('model-select',['models','set','concentrate/gpt-4.1-mini']);
 const models=JSON.parse(run('model-refresh',['models','list','--all','--provider','concentrate','--refresh','--json']).stdout);
 const model=models.models.find(x=>x.key==='concentrate/gpt-4.1-mini');assert.ok(model);assert.equal(model.available,true);
 save('summary.json',{passed:true,atUtc:new Date().toISOString(),node:process.version,openclaw:JSON.parse(fs.readFileSync('/tmp/host/node_modules/openclaw/package.json')).version,registryTarget:'clawhub:openclaw-concentrate',version:plugin.version,plugin:{id:plugin.id,enabled:plugin.enabled,status:plugin.status,providerIds:plugin.providerIds,source:plugin.source,origin:plugin.origin,trust:plugin.trust},model,files:fileChecks,commands,realModelCredentialsPresent:false,publisherCredentialsPresent:false,paidInferenceRequests:0});
 console.log('REGISTRY_INSTALL_VERIFIED');
}catch(error){save('failure.json',{error:error.message,commands,atUtc:new Date().toISOString()});throw error;}
