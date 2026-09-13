import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
assert.equal(process.version, 'v24.16.0');
for (const key of ['CONCENTRATE_API_KEY','BL_API_KEY','CLAWHUB_AUTH_JSON']) assert.equal(process.env[key], undefined, `Unexpected credential: ${key}`);
const proof='/tmp/rename-proof';
fs.mkdirSync(proof,{recursive:true});
const expected=JSON.parse(fs.readFileSync('/tmp/expected-files.json'));
const commands=[];
const save=(name,data)=>fs.writeFileSync(proof+'/'+name+'.json',JSON.stringify(data,null,2));
function context(name) {
 const root='/tmp/'+name; fs.mkdirSync(root,{recursive:true});
 return {root,env:{PATH:process.env.PATH,HOME:root,OPENCLAW_STATE_DIR:root+'/state',OPENCLAW_CONFIG_PATH:root+'/config.json',CLAWHUB_DISABLE_TELEMETRY:'1'}};
}
function run(ctx,label,args) {
 const startedAt=new Date().toISOString();
 const r=spawnSync('/tmp/host/node_modules/.bin/openclaw',args,{env:ctx.env,cwd:ctx.root,encoding:'utf8',timeout:90000,maxBuffer:8388608});
 const record={label,args,startedAt,finishedAt:new Date().toISOString(),exitCode:r.status,signal:r.signal,stdout:r.stdout,stderr:r.stderr,error:r.error?.message};
 save(label,record); commands.push({label,args,startedAt,finishedAt:record.finishedAt,exitCode:r.status});
 assert.equal(r.status,0,`${label}: ${r.stderr||r.stdout||r.error?.message}`); return r;
}
function list(ctx,label) {return JSON.parse(run(ctx,label,['plugins','list','--json']).stdout).plugins;}
function checkNew(plugins) {
 const plugin=plugins.find(x=>x.id==='concentrate-provider'); assert.ok(plugin);
 assert.equal(plugin.enabled,true); assert.equal(plugin.status,'loaded'); assert.equal(plugin.version,'1.1.0'); assert.deepEqual(plugin.providerIds,['concentrate']); assert.ok(!plugin.error);
 const folder=path.dirname(plugin.source); const files=[];
 for(const item of expected) {
  const digest=createHash('sha256').update(fs.readFileSync(path.join(folder,item.path))).digest('hex');
  assert.equal(digest,item.sha256,item.path); files.push({...item,matched:true});
 }
 assert.equal(files.length,8);
 return {plugin:{id:plugin.id,version:plugin.version,enabled:plugin.enabled,status:plugin.status,providerIds:plugin.providerIds,trust:plugin.trust},files};
}
function models(ctx,label) {
 ctx.env.CONCENTRATE_API_KEY='fixture-only-not-a-real-key';
 const all=JSON.parse(run(ctx,label,['models','list','--all','--provider','concentrate','--refresh','--json']).stdout);
 const model=all.models.find(x=>x.key==='concentrate/gpt-4.1-mini'); assert.ok(model); assert.equal(model.available,true); return model;
}
const costs={acknowledgeEstimatedCosts:true,costOverrides:{'gpt-4.1-mini':{input:1.23,output:4.56,cacheRead:0.78,cacheWrite:1.11}}};
try {
 const fresh=context('rename-fresh');
 run(fresh,'fresh-install',['plugins','install','clawhub:concentrate-provider','--accept-capabilities']);
 const freshResult=checkNew(list(fresh,'fresh-plugins'));
 run(fresh,'fresh-config',['config','set','plugins.entries.concentrate-provider.config',JSON.stringify(costs)]);
 run(fresh,'fresh-validate',['config','validate']);
 run(fresh,'fresh-select',['models','set','concentrate/gpt-4.1-mini']);
 freshResult.model=models(fresh,'fresh-models');
 save('fresh-summary',freshResult);
 const migration=context('rename-migration');
 fs.mkdirSync(migration.root+'/workspace',{recursive:true});
 const memoryPath=migration.root+'/workspace/MEMORY.md'; const sentinel='Synthetic migration memory sentinel: preserve exactly.\n'; fs.writeFileSync(memoryPath,sentinel);
 run(migration,'old-install',['plugins','install','clawhub:openclaw-concentrate','--accept-capabilities']);
 const old=list(migration,'old-plugins').find(x=>x.id==='concentrate'); assert.equal(old.version,'1.0.1'); assert.equal(old.status,'loaded');
 run(migration,'old-config',['config','set','plugins.entries.concentrate.config',JSON.stringify(costs)]);
 run(migration,'old-select',['models','set','concentrate/gpt-4.1-mini']);
 const saved=JSON.parse(run(migration,'old-config-backup',['config','get','plugins.entries.concentrate.config']).stdout); assert.deepEqual(saved,costs);
 run(migration,'old-disable',['plugins','disable','concentrate']);
 run(migration,'new-install',['plugins','install','clawhub:concentrate-provider','--accept-capabilities']);
 run(migration,'new-config',['config','set','plugins.entries.concentrate-provider.config',JSON.stringify(saved)]);
 run(migration,'migration-validate',['config','validate']);
 const migrated=list(migration,'migrated-plugins'); const migratedResult=checkNew(migrated); assert.equal(migrated.find(x=>x.id==='concentrate').enabled,false);
 assert.deepEqual(JSON.parse(run(migration,'new-config-readback',['config','get','plugins.entries.concentrate-provider.config']).stdout),saved);
 migratedResult.model=models(migration,'migrated-models');
 assert.equal(fs.readFileSync(memoryPath,'utf8'),sentinel);
 run(migration,'rollback-disable-new',['plugins','disable','concentrate-provider']);
 run(migration,'rollback-enable-old',['plugins','enable','concentrate']);
 run(migration,'rollback-validate',['config','validate']);
 const rolled=list(migration,'rollback-plugins'); assert.equal(rolled.find(x=>x.id==='concentrate').status,'loaded'); assert.equal(rolled.find(x=>x.id==='concentrate-provider').enabled,false);
 assert.deepEqual(JSON.parse(run(migration,'rollback-costs',['config','get','plugins.entries.concentrate.config']).stdout),saved);
 const rollbackModel=models(migration,'rollback-models');
 assert.equal(fs.readFileSync(memoryPath,'utf8'),sentinel);
 save('summary',{passed:true,atUtc:new Date().toISOString(),node:process.version,openclaw:JSON.parse(fs.readFileSync('/tmp/host/node_modules/openclaw/package.json')).version,version:'1.1.0',registryTarget:'clawhub:concentrate-provider',fresh:freshResult,migration:{passed:true,...migratedResult,costsPreserved:true,oldDisabled:true,memorySentinelPreserved:true},rollback:{passed:true,oldVersion:old.version,model:rollbackModel,costsPreserved:true,memorySentinelPreserved:true},commands,realModelCredentialsPresent:false,publisherCredentialsPresent:false,paidInferenceRequests:0});
 console.log('FRESH_INSTALL_MIGRATION_AND_ROLLBACK_VERIFIED');
} catch(error) {save('failure',{error:error.message,commands,atUtc:new Date().toISOString()});throw error;}
