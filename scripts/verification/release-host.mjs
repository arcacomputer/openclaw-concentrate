import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdirSync,writeFileSync,readFileSync,symlinkSync,openSync,fsyncSync,closeSync} from 'node:fs';
import {createHash,randomUUID} from 'node:crypto';
import {runProcessGroup,prepareZeroRetrySettings} from '/tmp/candidate/scripts/openclaw-live-adapter.mjs';
const row=JSON.parse(process.env.BATCH_ROW);delete process.env.BATCH_ROW;
const secret=process.env.CONCENTRATE_API_KEY;delete process.env.CONCENTRATE_API_KEY;assert.ok(row.syntheticOnly || row.preflightOnly || secret);if(row.syntheticOnly||row.preflightOnly)assert.equal(secret,undefined,'credential-free synthetic parent');
const proof='/tmp/proof/'+row.index;mkdirSync(proof,{recursive:true});
const clean=s=>secret?String(s).split(secret).join('[REDACTED]'):String(s);
const save=(n,v)=>{writeFileSync(proof+'/'+n,clean(JSON.stringify(v,null,2)),{mode:0o600});const fd=openSync(proof+'/'+n,'r');fsyncSync(fd);closeSync(fd);};
try{symlinkSync('/tmp/host/node_modules','/tmp/candidate/node_modules','dir');}catch(e){if(e.code!=='EEXIST')throw e;}
assert.equal(process.version,'v24.16.0');assert.equal(JSON.parse(readFileSync('/tmp/host/node_modules/openclaw/package.json')).version,'2026.9.4');
save('metadata.json',{at:new Date().toISOString(),node:process.version,openclaw:'2026.9.4',case:row,packageLockSha256:createHash('sha256').update(readFileSync('/tmp/host/package-lock.json')).digest('hex')});
let mode='synthetic',forwarded=0,syntheticCount=0,failed=false;const requests=[],receipts=[],limits=[];
const tool=row.feature==='tool-roundtrip'||row.feature==='vision'||row.feature==='parallel';const forwardBudget=row.feature==='parallel'?3:tool?2:1;
let activeWorkspace='';
function fixture(n){
 const call=tool&&n===0;
 const paths=row.feature==='parallel'?['a.txt','b.txt']:[row.feature==='vision'?'image.png':'feature.txt'];
 const output=call?paths.map((path,i)=>({id:'fc_fixture_'+i,type:'function_call',call_id:'call_fixture_'+i,name:'read',arguments:JSON.stringify({path:activeWorkspace+'/'+path}),status:'completed'})):[{id:'msg_fixture_'+n,type:'message',role:'assistant',status:'completed',content:[{type:'output_text',text:'FEATURE_OK',annotations:[]}]}];
 const response={id:'resp_fixture_'+n,object:'response',status:'completed',model:row.id,output,usage:{input_tokens:5,output_tokens:2,total_tokens:7,input_tokens_details:{cached_tokens:0},output_tokens_details:{reasoning_tokens:0}}};
 const events=[{type:'response.created',response:{...response,status:'in_progress',output:[]}}];
 output.forEach((item,i)=>{
  events.push({type:'response.output_item.added',output_index:i,item:call?{...item,arguments:''}:{...item,status:'in_progress',content:[]}});
  if(call)events.push({type:'response.function_call_arguments.delta',item_id:item.id,output_index:i,delta:item.arguments},{type:'response.function_call_arguments.done',item_id:item.id,output_index:i,arguments:item.arguments});
  else events.push({type:'response.content_part.added',item_id:item.id,output_index:i,content_index:0,part:{type:'output_text',text:'',annotations:[]}},{type:'response.output_text.delta',item_id:item.id,output_index:i,content_index:0,delta:'FEATURE_OK'},{type:'response.output_text.done',item_id:item.id,output_index:i,content_index:0,text:'FEATURE_OK'});
  events.push({type:'response.output_item.done',output_index:i,item});
 });
 events.push({type:'response.completed',response});return events;
}
function validate(body,n){
 if(row.feature==='parallel'&&n>=1){
  const calls=body.input.filter(x=>x.type==='function_call');const outputs=body.input.filter(x=>x.type==='function_call_output');
  assert.equal(calls.length,2,'exactly two durable calls');assert.equal(outputs.length,2,'exactly two durable results');
  assert.deepEqual(new Set(outputs.map(x=>x.call_id)),new Set(calls.map(x=>x.call_id)),'results paired to calls');
  const paths=calls.map(x=>JSON.parse(x.arguments).path).map(x=>x.split('/').at(-1)).sort();assert.deepEqual(paths,['a.txt','b.txt']);
  for(const v of Object.values(JSON.parse(readFileSync(proof+'/fixture-values.json'))))assert.ok(JSON.stringify(outputs).includes(v),'file contents actually present on wire');
  if(n===2)assert.ok(JSON.stringify(body.input.at(-1)).includes('RECALL_VALUES_NOW'),'fresh user message after durable history');
 }
assert.equal(body.model,row.id);assert.equal(body.max_output_tokens,row.maxOutputTokens);assert.equal(body.stream,true);const names=(body.tools??[]).map(t=>t.name);assert.deepEqual(names,tool?['read']:[]);if(row.reasoning)assert.equal(body.reasoning?.effort,'low','on-wire reasoning effort');if(row.schema)assert.equal(body.text?.format?.strict,true,'strict schema present on wire');if(n===1){assert.ok(body.input.some(x=>x.type==='function_call_output'),'second forward must carry tool result');if(row.feature==='vision')assert.ok(JSON.stringify(body.input).includes('input_image'),'image bytes must reach actual model request');}}
let inFlight=Promise.resolve(), waiting=0;const sequencing=[];
const fixtureServer=createServer(async(req,res)=>{
 const n=Number(req.url.slice(1));const events=fixture(n);events.at(-1).response.cost={total:0};
 if(row.fault==='missing')delete events.at(-1).response.usage;
 if(row.fault==='invalid')events.at(-1).response.usage.output_tokens='2';
 if(row.fault==='overcap')events.at(-1).response.usage.output_tokens=row.maxOutputTokens+1;
 res.writeHead(200,{'Content-Type':'text/event-stream'});
 const bytes=Buffer.from(': split UTF8 café 🦀\n\n'+events.map(e=>`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join(''));
 for(let i=0;i<bytes.length;i+=17){if(res.destroyed)return;res.write(bytes.subarray(i,i+17));await new Promise(r=>setTimeout(r,1));}
 sequencing.push({event:'terminal-sent',n,at:Date.now()});
 if(row.fault==='bounds')res.write('x'.repeat(300000));if(row.fault==='contradiction'){await new Promise(r=>setTimeout(r,150));res.write('event: response.failed\ndata: '+JSON.stringify({type:'response.failed',response:{status:'failed'}})+'\n\n');}
 await new Promise(r=>setTimeout(r,['timeout','cancel'].includes(row.fault)?1600:700));
 sequencing.push({event:'upstream-eof',n,at:Date.now()});save('sequencing.json',sequencing);res.end();
});await new Promise(r=>fixtureServer.listen(0,'127.0.0.1',r));
const server=createServer(async(req,res)=>{let release;try{
 let raw='';for await(const c of req){raw+=c;assert.ok(Buffer.byteLength(raw)<=65536,'global request byte ceiling');}
 assert.equal(req.url,'/v1/responses');assert.equal(req.method,'POST');
 if(row.fault!=='red'){
  assert.ok(waiting<2,'bounded queue');waiting++;const previous=inFlight;inFlight=new Promise(r=>release=r);
  sequencing.push({event:'queued',mode,at:Date.now()});let timer;
  try{await Promise.race([previous,new Promise((_,reject)=>timer=setTimeout(()=>reject(Error('receipt queue timeout')),28000))]);}finally{clearTimeout(timer);waiting--;}
 }
 assert.equal(res.destroyed,false,'cancelled queued request');
 const n=mode==='synthetic'?syntheticCount:forwarded;assert.ok(n<forwardBudget,'strict per-case forward budget');assert.equal(failed,false,'prior failure blocks continuation');const body=JSON.parse(raw);validate(body,n);
 requests.push({mode,turn:n,bytes:Buffer.byteLength(raw),body,at:new Date().toISOString()});save('requests.json',requests);
 assert.equal(receipts.length,n,'prior forward must have validated usage');
 if(mode==='synthetic'){syntheticCount++;limits[n]=65536;row.turnReservations??=Array(forwardBudget).fill(1);}else{assert.ok(Buffer.byteLength(raw)<=limits[n],'measured per-turn byte ceiling');forwarded++;save('dispatch-'+n+'.json',{forwarded,at:new Date().toISOString(),origin:'https://api.concentrate.ai/v1/responses',redirect:'error',tlsValidation:true});}
 sequencing.push({event:'forward',mode,n,at:Date.now()});save('sequencing.json',sequencing);
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),mode==='synthetic'&&row.fault==='timeout'?650:25000);let text='',chunks=0,frame='';const times=[],events=[];const decoder=new TextDecoder('utf-8',{fatal:true});
 const cancelled=()=>{sequencing.push({event:'downstream-close',n,at:Date.now(),writableEnded:res.writableEnded,terminalParsed:events.some(e=>e.type==='response.completed')});save('sequencing.json',sequencing);if(!res.writableEnded&&!terminalValidated){sequencing.push({event:'abort-downstream',n,at:Date.now()});controller.abort(Error('downstream cancelled'));}};res.on('close',cancelled);
 let status=null;let terminalValidated=false;
 try{const upstream=await fetch(mode==='synthetic'?'http://127.0.0.1:'+fixtureServer.address().port+'/'+n:'https://api.concentrate.ai/v1/responses',{method:'POST',headers:mode==='synthetic'?{'Content-Type':'application/json'}:{'Content-Type':'application/json',Authorization:'Bearer '+secret},body:raw,redirect:'error',signal:controller.signal});status=upstream.status;res.writeHead(upstream.status,{'Content-Type':upstream.headers.get('content-type')??'application/json'});
 for await(const chunk of upstream.body){const part=decoder.decode(chunk,{stream:true});text+=part;frame+=part;assert.ok(Buffer.byteLength(text)<=4194304,'stream total bound');let end;while((end=frame.indexOf('\n\n'))>=0){const f=frame.slice(0,end);frame=frame.slice(end+2);assert.ok(Buffer.byteLength(f)<=262144,'SSE frame bound');const data=f.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');if(data&&data!=='[DONE]'){
 const event=JSON.parse(data);assert.equal(terminalValidated,false,'event after terminal contradiction');events.push(event);
 if(['response.completed','response.incomplete','response.failed'].includes(event.type)){
  const receipt=event.response;assert.equal(status,200,'HTTP failure stops case');assert.ok(receipt,'missing terminal response');
  const u=receipt.usage;assert.ok(Number.isInteger(u?.output_tokens)&&u.output_tokens>=0&&u.output_tokens<=row.maxOutputTokens,'unknown/overrun output');
  const r=u.output_tokens_details?.reasoning_tokens??0;assert.ok(Number.isInteger(r)&&r>=0&&r<=u.output_tokens,'ambiguous reasoning usage');assert.ok(Number.isInteger(u.input_tokens)&&u.input_tokens>=0&&u.input_tokens<=limits[n]+1024+(row.imageTokenReserve??0),'input bound violation');assert.ok(Number.isFinite(receipt.cost?.total)&&receipt.cost.total>=0,'unknown cost');assert.ok(receipt.cost.total<=row.turnReservations[n],'cost exceeds reservation');assert.equal(receipt.status,'completed','incomplete stops case');assert.equal(event.type,'response.completed','terminal type mismatch');
  save(mode+'-terminal-candidate-'+n+'.json',receipt);terminalValidated=true;sequencing.push({event:'terminal-validated',mode,n,at:Date.now()});save('sequencing.json',sequencing);
 }
}}assert.ok(Buffer.byteLength(frame)<=262144,'SSE frame bound');chunks++;times.push(new Date().toISOString());res.write(chunk);if(mode==='synthetic'&&row.fault==='cancel'&&text.includes('event: response.completed')&&n===0)res.destroy();}
 text+=decoder.decode();assert.equal(frame.trim(),'','truncated SSE frame');
 save(mode+'-upstream-'+n+'.json',{status:upstream.status,body:text,chunks,chunkTimes:times,at:new Date().toISOString()});
 const terminals=events.filter(e=>['response.completed','response.incomplete','response.failed'].includes(e.type));assert.equal(terminals.length,1,'exactly one terminal');const receipt=terminals[0]?.response;
 assert.equal(upstream.status,200,'HTTP failure stops case');assert.ok(receipt,'missing terminal response');const u=receipt.usage;assert.ok(Number.isInteger(u?.output_tokens)&&u.output_tokens>=0&&u.output_tokens<=row.maxOutputTokens,'unknown/overrun output');const r=u.output_tokens_details?.reasoning_tokens??0;assert.ok(Number.isInteger(r)&&r>=0&&r<=u.output_tokens,'ambiguous reasoning usage');assert.ok(Number.isInteger(u.input_tokens)&&u.input_tokens>=0&&u.input_tokens<=limits[n]+1024+(row.imageTokenReserve??0),'input bound violation');assert.ok(Number.isFinite(receipt.cost?.total)&&receipt.cost.total>=0,'unknown cost');assert.ok(receipt.cost.total<=row.turnReservations[n],'cost exceeds reservation');assert.equal(receipt.status,'completed','incomplete stops case');receipts.push(receipt);save('receipts.json',receipts);
 sequencing.push({event:'validated',mode,n,at:Date.now()});save('sequencing.json',sequencing);
 res.end();}finally{clearTimeout(timer);res.off('close',cancelled);controller.abort();save(mode+'-raw-final-'+n+'.json',{status,body:text,chunks,chunkTimes:times,at:new Date().toISOString()});}
 }catch(e){sequencing.push({event:'exception',error:e.message,at:Date.now()});save('sequencing.json',sequencing);if(!failed)save('first-proxy-error.json',{error:e.message,stack:e.stack,at:new Date().toISOString()});failed=true;save('proxy-error.json',{mode,error:clean(e.message),forwarded,syntheticCount,at:new Date().toISOString()});if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});res.end();}finally{release?.();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const template=JSON.parse(readFileSync('/tmp/template.json'));const estimate=row.maxTokenRateUsd*1e6;const cost={input:estimate,output:estimate,cacheRead:estimate,cacheWrite:estimate};
const sessionId=randomUUID();
async function run(label,recall=false){const home='/tmp/feature-'+row.index+'-'+mode;activeWorkspace=home+'/workspace';mkdirSync(activeWorkspace,{recursive:true});writeFileSync(activeWorkspace+'/feature.txt','FEATURE_OK\n');if(row.feature==='parallel'&&!recall){const values={a:'A-'+randomUUID(),b:'B-'+randomUUID()};writeFileSync(activeWorkspace+'/a.txt',values.a);writeFileSync(activeWorkspace+'/b.txt',values.b);save('fixture-values.json',values);}writeFileSync(activeWorkspace+'/image.png',readFileSync('/tmp/image.png'));
 const c=structuredClone(template);c.plugins.entries.concentrate.config.costOverrides={[row.id]:cost};c.agents.defaults.model={primary:'concentrate/'+row.id,fallbacks:[]};c.agents.defaults.models={['concentrate/'+row.id]:{params:{maxTokens:row.maxOutputTokens}}};c.agents.entries={main:{default:true,skills:[]}};const m=c.models.providers.concentrate.models[0];m.id=row.id;m.name=row.id;m.cost=cost;m.reasoning=!!row.reasoning;m.input=row.feature==='vision'?['text','image']:['text'];c.models.providers.concentrate.baseUrl='http://127.0.0.1:'+server.address().port+'/v1';c.models.providers.concentrate.apiKey='synthetic-local-proxy';c.agents.defaults.workspace=activeWorkspace;c.skills={allowBundled:[]};c.tools=tool?{profile:'coding',allow:['read'],fs:{workspaceOnly:true}}:{profile:'minimal',deny:['*']};
 if(row.schema)c.agents.defaults.models['concentrate/'+row.id].params.response_format={type:'json_schema',json_schema:{name:'proof',strict:true,schema:{type:'object',properties:{ok:{type:'boolean',const:true}},required:['ok'],additionalProperties:false}}};
 writeFileSync(home+'/config.json',JSON.stringify(c));prepareZeroRetrySettings(home);save(label+'-config.json',c);
 const message=row.feature==='parallel'?(recall?'RECALL_VALUES_NOW. Without calling any tools, repeat the exact full values of a.txt and b.txt that you read in the previous turn, in that order, separated by a newline.':'Use read to fetch BOTH a.txt and b.txt. Make two parallel read tool calls together in ONE response. After both results, return only the two complete values, a.txt first and b.txt second, separated by a newline.'):row.feature==='vision'?'Use read exactly once to open image.png. The image has two colored halves. Name its LEFT and RIGHT colors using color names only, separated by a comma.':tool?'Use the read tool exactly once to read feature.txt in your workspace. Reply only with its contents. Do not guess its contents.':'Reply with only the JSON object {"ok":true}. No markdown or other text.';
 const args=['agent','--local','--agent','main','--session-id',sessionId,'--message',message,'--json','--timeout','60'];if(row.reasoning)args.push('--thinking','low');
 const r=await runProcessGroup('/tmp/host/node_modules/.bin/openclaw',args,{env:{PATH:process.env.PATH,HOME:home,OPENCLAW_CONFIG_PATH:home+'/config.json',OPENCLAW_STATE_DIR:home,CONCENTRATE_API_KEY:'synthetic-local-proxy',NODE_OPTIONS:'--import=/tmp/credential-audit.mjs',AUDIT_PROOF:proof+'/'+label+'-child-isolation.json'},timeoutMs:65000});save(label+'-host.json',r);return r;
}
try{
 let s;if(row.syntheticOnly||row.preflightOnly){assert.equal(secret,undefined);save('parent-isolation.json',{at:new Date().toISOString(),paidCredentialPresent:false,environmentKeys:Object.keys(process.env).sort()});s=await run('synthetic');await inFlight;if(row.feature==='parallel'){const recall=await run('synthetic-recall',true);await inFlight;assert.equal(recall.status,0);}}else{const prior='/tmp/proof/'+row.preflightIndex;const gate=JSON.parse(readFileSync(prior+'/preflight-result.json'));assert.equal(gate.passed,true);assert.equal(gate.id,row.id);assert.equal(gate.feature,row.feature);assert.equal(gate.sourceSha256,createHash('sha256').update(readFileSync('/tmp/batch.mjs')).digest('hex'));s=JSON.parse(readFileSync(prior+'/synthetic-host.json'));requests.push(...JSON.parse(readFileSync(prior+'/requests.json')));syntheticCount=gate.syntheticCount;save('preflight-reused.json',gate);}
 if(row.syntheticOnly){
  if(row.fault==='valid'){
   assert.equal(s.status,0);assert.equal(failed,false);assert.equal(syntheticCount,2);assert.equal(receipts.length,2);
   const first=sequencing.find(x=>x.event==='validated'&&x.n===0),second=sequencing.find(x=>x.event==='forward'&&x.n===1);assert.ok(first.at<=second.at);
   assert.ok(sequencing.some(x=>x.event==='queued'&&x.at>sequencing.find(y=>y.event==='terminal-sent'&&y.n===0).at&&x.at<first.at),'second request actually queued before EOF validation');
  }else{assert.equal(failed,true);assert.equal(syntheticCount,1);if(row.fault!=='red')assert.equal(receipts.length,0);}
  const before=syntheticCount;const reject=await fetch('http://127.0.0.1:'+server.address().port+'/v1/responses',{method:'POST',body:JSON.stringify(requests[0].body)});await reject.text();assert.equal(reject.status,502);assert.equal(syntheticCount,before);assert.equal(forwarded,0);
  save('regression-result.json',{passed:true,fault:row.fault,hostExit:s.status,syntheticForwards:syntheticCount,paidForwards:forwarded,maxForwards:2,thirdOrPostFailureBlocked:true,at:new Date().toISOString()});
 }else{
 assert.equal(s.status,0,'synthetic host exit');assert.equal(failed,false,'synthetic request contract');assert.equal(syntheticCount,forwardBudget,'synthetic authorized turn count');const report=JSON.parse(s.stdout).meta.systemPromptReport;assert.deepEqual(report.skills.entries,[]);assert.deepEqual(report.tools.entries.map(t=>t.name),tool?['read']:[]);limits.length=0;receipts.length=0;
 for(let n=0;n<forwardBudget;n++)limits.push(Math.min(65536,requests[n].bytes+2048));row.turnReservations=limits.map(b=>(b+1024+(row.imageTokenReserve??0))*row.inputRateUsd+row.maxOutputTokens*row.outputRateUsd);const reservation=row.turnReservations.reduce((a,b)=>a+b,0);
 save('input-bound.json',{at:new Date().toISOString(),limits,forwardBudget,turnReservations:row.turnReservations,worstCaseUsd:reservation,syntheticRequestCount:syntheticCount,skills:report.skills.entries,tools:report.tools.entries,imageTokenReservePerForward:row.imageTokenReserve??0,boundPolicy:'UTF8 request byte ceiling plus 1024 framing plus 4096 image tokens per vision forward; synthetic 16x16 PNG only; maximum all-route input/cache/tier and output/reasoning/tier rates'});
 if(row.preflightOnly){save('preflight-result.json',{passed:true,id:row.id,feature:row.feature,syntheticCount,paidForwards:forwarded,sourceSha256:createHash('sha256').update(readFileSync('/tmp/batch.mjs')).digest('hex'),at:new Date().toISOString()});}else{const ledger=JSON.parse(readFileSync('/tmp/proof/reservation.json'));assert.ok(Number.isFinite(reservation)&&reservation>=0&&ledger.reservedUsd+reservation<=18);ledger.reservedUsd+=reservation;ledger.models.push({id:row.id,attemptId:row.attemptId,worstCaseUsd:reservation,turnReservations:row.turnReservations,forwardBudget,maxOutputTokens:row.maxOutputTokens});writeFileSync('/tmp/proof/reservation.json',JSON.stringify(ledger,null,2));const fd=openSync('/tmp/proof/reservation.json','r');fsyncSync(fd);closeSync(fd);
 mode='live';const r=await run('live');await inFlight;if(row.feature==='parallel'){const recall=await run('live-recall',true);await inFlight;assert.equal(recall.status,0);const values=JSON.parse(readFileSync(proof+'/fixture-values.json'));for(const result of [r,recall]){const text=JSON.parse(result.stdout).payloads.map(x=>x.text??'').join('\n');assert.ok(text.includes(values.a)&&text.includes(values.b)&&text.indexOf(values.a)<text.indexOf(values.b),'live file values preserved in order');}}save('result.json',{forwarded,forwardBudget,hostExit:r.status,failed,receipts:receipts.length,at:new Date().toISOString()});assert.equal(failed,false);assert.equal(r.status,0);assert.equal(forwarded,forwardBudget);assert.equal(receipts.length,forwardBudget);
}}
}catch(e){save('harness-error.json',{error:clean(e.message),forwarded,at:new Date().toISOString()});process.exitCode=1;}finally{fixtureServer.closeAllConnections();fixtureServer.close();server.closeAllConnections();server.close();}
