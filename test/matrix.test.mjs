// Synthetic orchestration tests: no provider or host inference.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runMatrix } from '../scripts/live-matrix.mjs';
const manifest = { models: [{ id: 'm', catalogProjection: 'included', checks: [{feature:'responses',status:'pending'}, {feature:'streaming',status:'pending'}] }] };
const out = () => join(mkdtempSync(join(tmpdir(),'matrix-')), 'checkpoint.json');
const permit = { approved:true, hardCapVerified:true, autoTopUp:false, capUsd:20, expiresAt:Date.now()+60000, evidence:'synthetic-only',requestUpperBounds:{m:{responses:{reviewed:true,evidence:'synthetic bound, not vendor price',usd:0.01},streaming:{reviewed:true,evidence:'synthetic bound, not vendor price',usd:0.01}}} };
const billing = { snapshot:async()=>({authoritative:true, spentUsd:0, remainingUsd:20, evidence:'synthetic-only'}) };
test('default matrix checkpoints every row without invoking an adapter', async()=>{
 const p=out(); let calls=0;
 const r=await runMatrix({manifest, checkpoint:p, adapter:{run:()=>{calls++;}}, mode:'plan'});
 assert.equal(calls,0); assert.equal(r.models[0].checks.length,2); assert.equal(r.models[0].checks[0].status,'blocked-authorization');
 assert.deepEqual(JSON.parse(readFileSync(p)),r);
});
test('unknown billing prevents any inference',async()=>{
 let calls=0; const r=await runMatrix({manifest,checkpoint:out(),mode:'live-provider',permit, billing:{snapshot:async()=>({})},adapter:{route:'openclaw-agent-local',run:()=>{calls++;}}});
 assert.equal(calls,0); assert.equal(r.stopReason,'unknown-billing');
});
test('402 stops serial execution and persists the exact model result',async()=>{
 let calls=0; const adapter={route:'openclaw-agent-local',supports:()=>true,run:async()=>{calls++;return {status:'payment-required',httpStatus:402};}};
 const r=await runMatrix({manifest,checkpoint:out(),mode:'live-provider',permit,billing,adapter});
 assert.equal(calls,1); assert.equal(r.models[0].checks[0].status,'payment-required'); assert.equal(r.stopReason,'payment-required');
 assert.equal(r.models[0].checks[1].status,'blocked-stopped');
});
test('unsupported and unavailable are retained, never promoted to pass',async()=>{
 const m=structuredClone(manifest); m.models[0].checks[1].status='not-applicable';
 const r=await runMatrix({manifest:m,checkpoint:out(),mode:'live-provider',permit,billing,adapter:{route:'openclaw-agent-local',supports:()=>true,run:async()=>({status:'unavailable'})}});
 assert.equal(r.models[0].checks[0].status,'unavailable'); assert.equal(r.models[0].checks[1].status,'not-applicable');
});
test('started checkpoint cannot be blindly resumed',async()=>{
 const p=out(); await runMatrix({manifest,checkpoint:p,mode:'plan'});
 await assert.rejects(runMatrix({manifest,checkpoint:p,mode:'plan'}),/already exists/);
});
test('post-call unknown billing stops the next test',async()=>{
 let n=0,calls=0;
 const r=await runMatrix({manifest,checkpoint:out(),mode:'live-provider',permit,billing:{snapshot:async()=> ++n===1 ? {authoritative:true,spentUsd:0,remainingUsd:20,evidence:'mock'} : {}},adapter:{route:'openclaw-agent-local',supports:()=>true,run:async()=>{calls++;return {status:'passed'};}}});
 assert.equal(calls,1); assert.equal(r.stopReason,'unknown-billing');
});

test('unknown per-call upper bound blocks dispatch',async()=>{
 let calls=0; const p={...permit,requestUpperBounds:{}};
 const r=await runMatrix({manifest,checkpoint:out(),mode:'live-provider',permit:p,billing,adapter:{route:'openclaw-agent-local',supports:()=>true,run:async()=>{calls++;return {status:'passed'};}}});
 assert.equal(calls,0);assert.equal(r.stopReason,'unknown-request-upper-bound');
});
test('reservation ceiling preserves two dollars of headroom',async()=>{
 let calls=0; const p={...permit,requestUpperBounds:{m:{responses:{reviewed:true,evidence:'synthetic',usd:18.01}}}};
 const r=await runMatrix({manifest,checkpoint:out(),mode:'live-provider',permit:p,billing,adapter:{route:'openclaw-agent-local',supports:()=>true,run:async()=>{calls++;return {status:'passed'};}}});
 assert.equal(calls,0);assert.equal(r.stopReason,'reserved-budget-exhausted');assert.equal(r.localCommittedUsd,0);
});
