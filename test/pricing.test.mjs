import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRate, fetchPricing } from '../scripts/pricing.mjs';
test('unit-aware pricing retains unknown rates', () => {
  assert.equal(normalizeRate({price:{USD:2},units:1000}),2000);
  for (const x of [null, {}, {price:{USD:0}}, {price:{USD:-1},units:1}, {price:{USD:1},units:0}]) assert.equal(normalizeRate(x),null);
  assert.equal(normalizeRate({price:{USD:0},units:1}),0);
});
test('details acquisition is bounded, public, and preserves raw tiers and missing writes', async () => {
  const pricing={tokens:{input:{price:{USD:1},units:1000},tiers:[{above:200000}]}};
  const result=await fetchPricing('test-model',{fetchImpl:async (url,options)=>{
    assert.equal(url,'https://api.concentrate.ai/v1/models/test-model');
    assert.equal(options.headers.Authorization,undefined);
    assert.equal(options.redirect,'error');
    assert.ok(options.signal);
    return new Response(JSON.stringify({slug:'test-model',providers:{vendor:{pricing}}}));
  }});
  assert.deepEqual(result.routes.vendor.pricing,pricing);
  assert.equal(result.routes.vendor.normalizedBase.cacheRead,null);
  assert.deepEqual(result.routes.vendor.normalizedBase.cacheWriteByTTL,{});
  await assert.rejects(fetchPricing('../bad'));
  await assert.rejects(fetchPricing('test',{fetchImpl:async()=>new Response('x'.repeat(1024*1024+1))}),/1 MiB/);
});
