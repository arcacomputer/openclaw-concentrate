// SYNTHETIC HTTP/SSE fixtures. OpenAI client transport only, NOT OpenClaw host
// routing or Concentrate live compatibility. No credential leaves loopback.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
const require=createRequire(process.env.OPENCLAW_PACKAGE_JSON || '/tmp/host/node_modules/openclaw/package.json');
const {default:OpenAI}=await import(require.resolve('openai'));
const usage={input_tokens:5,output_tokens:2,total_tokens:7,input_tokens_details:{cached_tokens:1},output_tokens_details:{reasoning_tokens:0}};
const completed={id:'resp_synthetic',object:'response',status:'completed',output:[],usage};
function sse(res,events){res.writeHead(200,{'Content-Type':'text/event-stream'}); for(const e of events)res.write(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`);res.end();}
async function fixture(fn){
 const requests=[]; const server=createServer(async(req,res)=>{let raw='';for await(const c of req)raw+=c;const body=JSON.parse(raw||'{}');requests.push(body);fn(req,res,body,requests.length);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const client=new OpenAI({apiKey:'synthetic-not-a-secret',baseURL:`http://127.0.0.1:${server.address().port}/v1`,maxRetries:0,timeout:2000});
 return {client,requests,close:()=>new Promise(r=>{server.closeAllConnections();server.close(r);})};
}
test('synthetic SSE preserves ordered text deltas and terminal usage',{timeout:5000},async()=>{
 const f=await fixture((req,res)=>sse(res,[{type:'response.output_text.delta',delta:'CONCENTRATE_'},{type:'response.output_text.delta',delta:'OK'},{type:'response.completed',response:completed}]));
 try {const events=[];for await(const e of await f.client.responses.create({model:'synthetic',input:'hello',stream:true,max_output_tokens:32}))events.push(e);
 assert.equal(events.filter(e=>e.type==='response.output_text.delta').map(e=>e.delta).join(''),'CONCENTRATE_OK'); assert.deepEqual(events.at(-1).response.usage,usage);assert.equal(f.requests.length,1);assert.equal(f.requests[0].max_output_tokens,32);
 }finally{await f.close();}
});
test('synthetic function call roundtrip preserves call ID and tool output',{timeout:5000},async()=>{
 const f=await fixture((req,res,body,n)=>sse(res,n===1?[{type:'response.output_item.done',item:{type:'function_call',call_id:'call_synthetic',name:'echo',arguments:'{"value":"OK"}'}},{type:'response.completed',response:completed}]:[{type:'response.output_text.delta',delta:'OK'},{type:'response.completed',response:completed}]));
 try {let call;for await(const e of await f.client.responses.create({model:'synthetic',input:'echo',stream:true,tools:[{type:'function',name:'echo',parameters:{type:'object',properties:{value:{type:'string'}},required:['value']}}]}))if(e.type==='response.output_item.done')call=e.item;
 assert.equal(JSON.parse(call.arguments).value,'OK'); const input=[call,{type:'function_call_output',call_id:call.call_id,output:'OK'}];
 for await(const e of await f.client.responses.create({model:'synthetic',input,stream:true,max_output_tokens:32})){};
 assert.equal(f.requests.length,2);assert.equal(f.requests[1].input[1].call_id,'call_synthetic');assert.equal(f.requests[1].input[1].output,'OK');
 }finally{await f.close();}
});
test('synthetic 402 is propagated without automatic retry',{timeout:5000},async()=>{
 const f=await fixture((req,res)=>{res.writeHead(402,{'Content-Type':'application/json'});res.end(JSON.stringify({error:{message:'synthetic no credit',type:'payment_required'}}));});
 try{await assert.rejects(f.client.responses.create({model:'synthetic',input:'hello',max_output_tokens:32}),e=>e.status===402);assert.equal(f.requests.length,1);}finally{await f.close();}
});
test('synthetic cancellation aborts an unfinished SSE stream',{timeout:5000},async()=>{
 const f=await fixture((req,res)=>{res.writeHead(200,{'Content-Type':'text/event-stream'});res.write('event: response.output_text.delta\ndata: {"type":"response.output_text.delta","delta":"first"}\n\n');});
 try{const stream=await f.client.responses.create({model:'synthetic',input:'hello',stream:true,max_output_tokens:32});let count=0;
 try{for await(const e of stream){count++;stream.controller.abort();}}catch(e){assert.match(e.name,/Abort/);}
 assert.equal(count,1);assert.equal(stream.controller.signal.aborted,true);assert.equal(f.requests.length,1);
 }finally{await f.close();}
});
test('synthetic missing usage stays absent, never inferred as free',{timeout:5000},async()=>{
 const f=await fixture((req,res)=>sse(res,[{type:'response.completed',response:{id:'synthetic',status:'completed',output:[]}}]));
 try{let last;for await(const e of await f.client.responses.create({model:'synthetic',input:'hi',stream:true,max_output_tokens:32}))last=e; assert.equal(Object.hasOwn(last.response,'usage'),false);}finally{await f.close();}
});
