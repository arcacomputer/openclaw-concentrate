// Single sandbox-only assertion run against the published host; synthetic key only.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdirSync,writeFileSync,symlinkSync,readFileSync,readdirSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {setTimeout as sleep} from 'node:timers/promises';
import {openClawAdapter,runProcessGroup} from './openclaw-live-adapter.mjs';
const proof='/tmp/proof';mkdirSync(proof,{recursive:true});
try{symlinkSync('/tmp/host/node_modules','/tmp/candidate/node_modules','dir');}catch(e){if(e.code!=='EEXIST')throw e;}
const requests=[],results=[];let mode='success';
function activeGroup(pgid){return readdirSync('/proc').filter(x=>/^\d+$/.test(x)).flatMap(pid=>{try{const raw=readFileSync(`/proc/${pid}/stat`,'utf8');const fields=raw.slice(raw.lastIndexOf(')')+2).split(' ');return Number(fields[2])===pgid&&fields[0]!=='Z'?[Number(pid)]:[];}catch{return [];}});}
const server=createServer(async(req,res)=>{try{
let raw='';for await(const c of req){raw+=c;if(raw.length>262144){res.writeHead(413).end();return;}}
const body=JSON.parse(raw||'{}');requests.push({mode,url:req.url,body,at:Date.now()});
if(mode==='tree'){res.end('ok');return;}
assert.equal(body.model,'gpt-4.1-mini');assert.equal(body.max_output_tokens,32);
assert.equal(req.headers.authorization,'Bearer synthetic-not-a-secret');
if(mode==='timeout'){await sleep(35000);if(!res.destroyed)res.writeHead(500).end('{}');return;}
if(mode!=='success'){res.writeHead(Number(mode),{'Content-Type':'application/json'});res.end(JSON.stringify({error:{message:`synthetic HTTP ${mode}`,type:mode==='402'?'payment_required':mode==='429'?'rate_limit_error':'server_error'}}));return;}
const item={id:'msg_synthetic',type:'message',role:'assistant',status:'completed',content:[{type:'output_text',text:'CONCENTRATE_OK',annotations:[]}]};
const response={id:'resp_synthetic',object:'response',status:'completed',model:'gpt-4.1-mini',output:[item],usage:{input_tokens:5,output_tokens:2,total_tokens:7,input_tokens_details:{cached_tokens:0},output_tokens_details:{reasoning_tokens:0}}};
res.writeHead(200,{'Content-Type':'text/event-stream'});
for(const e of [{type:'response.created',response:{...response,status:'in_progress',output:[]}},{type:'response.output_item.added',output_index:0,item:{...item,status:'in_progress',content:[]}},{type:'response.content_part.added',item_id:item.id,output_index:0,content_index:0,part:{type:'output_text',text:'',annotations:[]}},{type:'response.output_text.delta',item_id:item.id,output_index:0,content_index:0,delta:'CONCENTRATE_OK'},{type:'response.output_text.done',item_id:item.id,output_index:0,content_index:0,text:'CONCENTRATE_OK'},{type:'response.output_item.done',output_index:0,item},{type:'response.completed',response}])res.write(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);res.end();
}catch(e){res.destroy(e);}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base='http://127.0.0.1:'+server.address().port;
const configTemplate={"plugins": {"allow": ["concentrate"], "load": {"paths": ["/tmp/candidate"]}, "entries": {"concentrate": {"enabled": true, "config": {"acknowledgeEstimatedCosts": true, "costOverrides": {"gpt-4.1-mini": {"input": 1, "output": 1, "cacheRead": 1, "cacheWrite": 1}}}}}}, "models": {"mode": "merge", "providers": {"concentrate": {"baseUrl": "http://127.0.0.1:37573/v1", "api": "openai-responses", "apiKey": "synthetic-not-a-secret", "models": [{"id": "gpt-4.1-mini", "name": "synthetic", "reasoning": false, "input": ["text"], "cost": {"input": 1, "output": 1, "cacheRead": 1, "cacheWrite": 1}, "contextWindow": 128000, "maxTokens": 4096}]}}}, "agents": {"defaults": {"workspace": "/tmp/synthetic-home-105c5c89-8955-430a-8260-170258a3aec7/workspace", "model": {"primary": "concentrate/gpt-4.1-mini", "fallbacks": []}, "models": {"concentrate/gpt-4.1-mini": {"params": {"maxTokens": 32}}}, "skipBootstrap": true, "embeddedAgent": {"projectSettingsPolicy": "ignore"}}}, "tools": {"profile": "minimal"}};
try{
for(const label of ['success','402','429','500','timeout']){
mode=label;const home='/tmp/synthetic-'+randomUUID();mkdirSync(home,{recursive:true});
const config=structuredClone(configTemplate);config.models.providers.concentrate.baseUrl=base+'/v1';config.agents.defaults.workspace=home+'/workspace';
writeFileSync(home+'/config.json',JSON.stringify(config));
const start=requests.length,started=Date.now();
const adapter=openClawAdapter({binary:'/tmp/host/node_modules/.bin/openclaw',configPath:home+'/config.json',stateDir:home,env:{CONCENTRATE_API_KEY:'synthetic-not-a-secret'},transportPolicyVerified:true});
const timeoutMs=label==='timeout'?15000:30000;
const result=await adapter.run({model:'gpt-4.1-mini',timeoutMs,maxOutputTokens:32});
const returned=Date.now();const countAtReturn=requests.length-start;
await sleep(label==='timeout'?4000:300);
const row={label,result,requestCount:requests.length-start,countAtReturn,elapsedMs:returned-started,activeGroup:activeGroup(result.pid)};results.push(row);
writeFileSync(proof+'/host-synthetic.json',JSON.stringify({results,requests},null,2));
assert.equal(row.requestCount,1,`${label}: exactly one HTTP request`);assert.equal(countAtReturn,1);assert.deepEqual(row.activeGroup,[]);
if(label==='success')assert.equal(result.status,'passed');
else if(label==='timeout'){assert.equal(result.termination,'deadline');assert.ok(result.groupSignals.includes('SIGTERM'));assert.ok(row.elapsedMs<timeoutMs+2000);}
else{assert.notEqual(result.exitCode,0);assert.notEqual(result.exitCode,null);assert.equal(result.termination,null);if(label==='402')assert.equal(result.status,'payment-required');}
console.log(JSON.stringify(row));
}
// Force escalation: a wrapper exits on TERM, its child ignores TERM and would
// send again after the deadline unless KILL still targets the complete group.
mode='tree';const start=requests.length;
const childCode=`process.on('SIGTERM',()=>{});fetch('${base}/tree',{method:'POST',body:'{}'});setTimeout(()=>fetch('${base}/tree',{method:'POST',body:'{}'}),2200);setInterval(()=>{},1000);`;
const wrapper=`const {spawn}=require('node:child_process');spawn(process.execPath,['-e',${JSON.stringify(childCode)}],{stdio:'inherit'});setInterval(()=>{},1000);`;
const tree=await runProcessGroup(process.execPath,['-e',wrapper],{env:{PATH:process.env.PATH},timeoutMs:1200});
await sleep(1500);assert.equal(requests.length-start,1);assert.deepEqual(activeGroup(tree.pid),[]);assert.ok(tree.signals.includes('SIGKILL'));assert.equal(tree.error,'deadline');
results.push({label:'term-resistant-descendant',requestCount:requests.length-start,result:tree,activeGroup:activeGroup(tree.pid)});
writeFileSync(proof+'/host-synthetic.json',JSON.stringify({passed:true,results,requests},null,2));console.log('PASS: five host cases and TERM-resistant descendant, exact counts');
}finally{server.closeAllConnections();server.close();}
