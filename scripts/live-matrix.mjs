// Serial, fail-closed orchestration. Plan mode makes no network calls.
// A checkpoint is an audit journal, NOT permission to replay an uncertain request.
import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export async function runMatrix({manifest, checkpoint, mode='plan', permit, billing, adapter, maxDurationMs=360000, expectedModels}) {
  if (!['plan','live-provider'].includes(mode)) throw new Error('Separate synthetic tests from live-provider evidence');
  if (existsSync(checkpoint)) throw new Error('Checkpoint already exists: reconcile started/unknown charges before creating an explicit continuation');
  const ids=manifest.models.map(m=>m.id);
  if (new Set(ids).size !== ids.length || (expectedModels && ids.length !== expectedModels)) throw new Error('Incomplete or duplicate manifest');
  if (!Number.isFinite(maxDurationMs) || maxDurationMs<=0 || maxDurationMs>360000) throw new Error('Invalid deadline');
  const deadline=Date.now()+maxDurationMs;
  const state={schema:1,mode, manifestSha256:createHash('sha256').update(JSON.stringify(manifest)).digest('hex'), startedAt:new Date().toISOString(), inferenceAttempts:0, localCommittedUsd:0, actualSpendUsd:null, stopReason:null,
    models:manifest.models.map(m=>({id:m.id,catalogProjection:m.catalogProjection,runtimeStatus:'not-tested',checks:m.checks.map(c=>({...c,status:c.status==='not-applicable'?'not-applicable':'blocked-authorization', reason:c.status==='not-applicable'?c.reason:'No authorized request yet'}))}))};
  mkdirSync(dirname(checkpoint),{recursive:true});
  const save=()=>{writeFileSync(checkpoint+'.tmp',JSON.stringify(state,null,2)+'\n',{mode:0o600});renameSync(checkpoint+'.tmp',checkpoint);};
  save();
  if(mode==='plan') return state;
  const authorized=()=>permit?.approved===true && permit.hardCapVerified===true && permit.autoTopUp===false && Number.isFinite(permit.capUsd) && permit.capUsd>0 && permit.capUsd<=20 && permit.expiresAt>Date.now() && typeof permit.evidence==='string' && permit.evidence.length>0;
  if(!authorized()){state.stopReason='authorization-or-verified-cap-missing';save();return state;}
  if(adapter?.route!=='openclaw-agent-local'){state.stopReason='actual-host-route-required';save();return state;}
  async function bounded(operation, timeoutMs){
    let timer;
    try { return await Promise.race([operation(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Deadline')),timeoutMs);})]); }
    finally {clearTimeout(timer);}
  }
  async function reconcile(){
    let b;
    try { b=await bounded(()=>billing?.snapshot({signal:AbortSignal.timeout(5000)}),5000); } catch { b=null; }
    if(!b?.authoritative || !b.evidence || !Number.isFinite(b.spentUsd) || b.spentUsd<0 || !Number.isFinite(b.remainingUsd) || b.remainingUsd<0){state.stopReason='unknown-billing';return false;}
    state.billing=b;state.actualSpendUsd=b.spentUsd;
    if(b.spentUsd>=permit.capUsd || b.remainingUsd<=0){state.stopReason='budget-exhausted';return false;}
    return true;
  }
  for(const model of state.models){
    for(const check of model.checks){
      if(check.status==='not-applicable')continue;
      if(state.stopReason){check.status='blocked-stopped';check.reason=state.stopReason;save();continue;}
      if(Date.now()+35000>deadline){state.stopReason='checkpoint-deadline';check.status='blocked-stopped';save();continue;}
      if(!authorized()){state.stopReason='authorization-expired';check.status='blocked-stopped';save();continue;}
      if(!await reconcile()){check.status='blocked-billing';save();continue;}
      if(!adapter.supports?.(check.feature)){check.status='host-adapter-unavailable';check.reason='No proven host feature mapping; vendor support does not prove OpenClaw support';save();continue;}
      const bound=permit.requestUpperBounds?.[model.id]?.[check.feature];
      const ceiling=Math.min(18,permit.capUsd-2);
      if(!bound?.reviewed || !bound.evidence || !Number.isFinite(bound.usd) || bound.usd<=0){state.stopReason='unknown-request-upper-bound';check.status='blocked-budget';save();continue;}
      const committed=Math.max(state.localCommittedUsd,state.actualSpendUsd);
      if(committed+bound.usd>ceiling){state.stopReason='reserved-budget-exhausted';check.status='blocked-budget';save();continue;}
      // Reserve BEFORE dispatch and never refund uncertain calls. Includes tools,
      // reasoning, cache, route/fallback charges in the operator-reviewed bound.
      state.localCommittedUsd=committed+bound.usd;check.reservedUsd=bound.usd;check.boundEvidence=bound.evidence;
      check.status='started';check.reason='Never automatically replay this request';check.startedAt=new Date().toISOString();state.inferenceAttempts++;save();
      try {
        const result=await bounded(()=>adapter.run({model:model.id,feature:check.feature,timeoutMs:30000,maxOutputTokens:32,signal:AbortSignal.timeout(30000)}),30000);
        const allowed=['passed','failed','unsupported','unavailable','payment-required','unknown'];
        if(!allowed.includes(result?.status)) throw new Error('Invalid adapter verdict');
        Object.assign(check,result,{completedAt:new Date().toISOString()});
        if(result.httpStatus===402 || result.status==='payment-required')state.stopReason='payment-required';
        if(result.status==='unknown')state.stopReason='uncertain-request';
      } catch {check.status='unknown';check.reason='Host failed or timed out; billing must be reconciled manually';state.stopReason='uncertain-request';}
      model.runtimeStatus=check.status;save();
      if(!state.stopReason){await reconcile();save();}
    }
    save();
  }
  state.completedAt=new Date().toISOString();save();return state;
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const [manifestPath,out,mode='plan']=process.argv.slice(2);
  if(!manifestPath || !out || mode!=='plan')throw new Error('CLI is no-spend plan only: node scripts/live-matrix.mjs MANIFEST CHECKPOINT [plan]. Credentialed execution requires reviewed billing integration.');
  const result=await runMatrix({manifest:JSON.parse(readFileSync(manifestPath)),checkpoint:out,mode,expectedModels:185});
  console.log(JSON.stringify({models:result.models.length,checks:result.models.reduce((n,m)=>n+m.checks.length,0),mode:result.mode,inferenceAttempts:result.inferenceAttempts}));
}
