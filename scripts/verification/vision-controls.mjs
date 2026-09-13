import fs from 'node:fs';
const spec=JSON.parse(process.env.DIAGNOSTIC_CASE);
const bytes=fs.readFileSync('/tmp/fixtures/'+spec.fixture+'.png');
const image={type:'input_image',image_url:'data:image/png;base64,'+bytes.toString('base64'),detail:'high'};
const question='The attached image has two solid colored halves. Name the LEFT color and the RIGHT color, in that order. Reply only as LEFT,RIGHT using ordinary color names. If you cannot see the image, say CANNOT_SEE.';
let input;
if(spec.placement==='direct') input=[{role:'user',content:[{type:'input_text',text:question},image]}];
else input=[{role:'user',content:question},{type:'function_call',call_id:'call_control',name:'read',arguments:'{"path":"fixture.png"}'},{type:'function_call_output',call_id:'call_control',output:[{type:'input_text',text:'Image file returned by read.'},image]}];
const request={model:spec.model,input,stream:false,max_output_tokens:128,temperature:0};
const body=JSON.stringify(request);if(Buffer.byteLength(body)>16000)throw Error('input byte ceiling');
const path='/tmp/proof/'+spec.id;fs.mkdirSync('/tmp/proof',{recursive:true});fs.writeFileSync(path+'-request.json',body);
const result={case:spec,startedAt:new Date().toISOString(),paidForwards:1};
try{
 const res=await fetch('https://api.concentrate.ai/v1/responses',{method:'POST',redirect:'error',signal:AbortSignal.timeout(45000),headers:{Authorization:'Bearer '+process.env.CONCENTRATE_API_KEY,'Content-Type':'application/json'},body});
 result.httpStatus=res.status;const reader=res.body.getReader();let buf=Buffer.alloc(0);
 while(true){const {value,done}=await reader.read();if(done)break;buf=Buffer.concat([buf,value]);if(buf.length>524288){await reader.cancel();throw Error('response byte ceiling');}}
 fs.writeFileSync(path+'-response.json',buf);const d=JSON.parse(buf);
 result.returnedModel=d.model;result.usage=d.usage;result.cost=d.cost;
 result.text=(d.output??[]).flatMap(x=>x.content??[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');
 result.passed=result.text.toLowerCase().replaceAll(' ','').replace(/[.\n]/g,'')===spec.expected;
 if(!res.ok||d.status!=='completed'||!Number.isFinite(d.usage?.input_tokens)||!Number.isFinite(d.usage?.output_tokens)||d.usage.output_tokens>128||!Number.isFinite(d.cost?.total)||d.cost.total>0.05)throw Error('receipt/status/budget guard failed');
 result.receiptVerified=true;
}catch(e){result.error=String(e);result.receiptVerified=false;process.exitCode=1;}
finally{result.finishedAt=new Date().toISOString();fs.writeFileSync(path+'-result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));}
