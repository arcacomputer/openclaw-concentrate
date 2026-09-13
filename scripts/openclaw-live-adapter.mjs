// Actual OpenClaw CLI route, never a raw provider fetch. Not yet live-validated.
// This adapter deliberately supports only the text-response tracer bullet.
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Linux harness: a detached child owns a new process group. Always reap the
// group, including descendants holding pipes after the wrapper has exited.
export async function runProcessGroup(binary, args, {env, timeoutMs, signal}) {
  if (process.platform !== 'linux') throw new Error('Process-group proof is Linux-only');
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error('Finite positive deadline required');
  if (signal?.aborted) return {status:null,signal:null,error:'aborted',stdout:'',stderr:''};
  const child = spawn(binary,args,{env,detached:true,shell:false,stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='',bytes=0,error,stopping=false,killTimer;
  const signals=[];
  const send = sig => {
    if (!child.pid) return;
    try { process.kill(-child.pid,sig); signals.push(sig); }
    catch(e) { if(e.code!=='ESRCH') error=String(e); }
  };
  let finishStop;
  const stopped = new Promise(resolve=>{finishStop=resolve;});
  const stop = reason => {
    if(stopping) return;
    stopping=true; if(reason) error=reason;
    send('SIGTERM');
    // Do not cancel escalation when only the wrapper exits.
    killTimer=setTimeout(()=>{send('SIGKILL');finishStop();},250);
  };
  const onAbort=()=>stop('aborted');
  const timer=setTimeout(()=>stop('deadline'),timeoutMs);
  signal?.addEventListener('abort',onAbort,{once:true});
  for(const [stream,append] of [[child.stdout,x=>stdout+=x],[child.stderr,x=>stderr+=x]]) {
    stream.on('data',chunk=>{bytes+=chunk.length;if(bytes>1024*1024)stop('output-limit');else append(chunk.toString());});
  }
  const terminal = await new Promise(resolve=>{
    child.once('error',e=>{error=String(e);stop();resolve({status:null,signal:null});});
    child.once('exit',(status,signal)=>{stop();resolve({status,signal});});
  });
  await stopped;
  clearTimeout(timer); clearTimeout(killTimer); signal?.removeEventListener('abort',onAbort);
  child.stdout.destroy(); child.stderr.destroy();
  return {...terminal,error,stdout,stderr,pid:child.pid,signals};
}

// Published 2026.9.4 SettingsManager reads <agentDir>/settings.json, NOT
// agents.defaults.models[...].params.maxRetries. Project overrides are disabled.
export function prepareZeroRetrySettings(stateDir) {
  const dir=join(stateDir,'agents','main','agent');
  mkdirSync(dir,{recursive:true});
  writeFileSync(join(dir,'settings.json'),JSON.stringify({retry:{enabled:false,provider:{maxRetries:0}}}),{mode:0o600});
}
import { randomUUID, createHash } from 'node:crypto';
export function openClawAdapter({binary, configPath, stateDir, env={}, transportPolicyVerified=false}) {
  return {
    route:'openclaw-agent-local',
    supports: feature=>feature==='responses',
    async run({model,timeoutMs,maxOutputTokens,signal}) {
      // Host retry/fallback policy and egress constraints require separate proof.
      if(!transportPolicyVerified) return {status:'unsupported',reason:'Host retry/output/egress policy not independently verified; no request sent'};
      const config=JSON.parse(readFileSync(configPath));
      const key=`concentrate/${model}`;
      if(config.agents?.defaults?.model?.primary!==key || (config.agents.defaults.model.fallbacks??[]).length || config.agents.defaults.models?.[key]?.params?.maxTokens!==maxOutputTokens) {
        return {status:'unsupported',reason:'Dedicated exact-model config, zero fallbacks, and explicit output cap required; no request sent'};
      }
      if (config.agents.defaults.embeddedAgent?.projectSettingsPolicy!=='ignore' || config.agents.list || config.agents.entries) {
        return {status:'unsupported',reason:'Isolated implicit main agent and ignored project settings required; no request sent'};
      }
      prepareZeroRetrySettings(stateDir);
      const result=await runProcessGroup(binary,['agent','--local','--agent','main','--session-id',randomUUID(),'--message','Reply with exactly CONCENTRATE_OK. Do not use tools.','--json','--timeout','25'],{
        env:{PATH:process.env.PATH,HOME:stateDir,...env,OPENCLAW_CONFIG_PATH:configPath,OPENCLAW_STATE_DIR:stateDir},
        timeoutMs:Math.min(timeoutMs,30000),signal,
      });
      // Retain hashes, not credentials or raw tool/user data. Capture private logs in
      // the surrounding approved worker if needed; review before publication.
      const streams=`${result.stdout??''}\n${result.stderr??''}`;
      const evidence={exitCode:result.status,signal:result.signal,termination:result.error??null,pid:result.pid,groupSignals:result.signals,outputSha256:createHash('sha256').update(streams).digest('hex')};
      if(/\b402\b|payment.required|insufficient.credit/i.test(streams))return {...evidence,status:'payment-required',httpStatus:402};
      if(result.error || result.signal)return {...evidence,status:'unknown'};
      let body; try {body=JSON.parse(result.stdout);} catch {return {...evidence,status:'unknown',reason:'Host output is not whole-stream JSON'};}
      const meta=body.meta?.agentMeta;
      if(meta?.provider!=='concentrate' || meta?.model!==model)return {...evidence,status:'unknown',reason:'Exact provider route not proven by host result'};
      const text=(body.payloads??[]).map(p=>p.text??'').join('\n').trim();
      return {...evidence,status:result.status===0 && text==='CONCENTRATE_OK'?'passed':'failed',host:meta,reason:'Text response only; usage is not authoritative billing'};
    },
  };
}
