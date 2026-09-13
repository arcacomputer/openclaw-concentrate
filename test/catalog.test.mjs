import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('projects recorded vendor metadata exactly without invented prices', async () => {
  const { projectRows } = await import('../src/catalog.mjs');
  const body = JSON.parse(await readFile(new URL('./fixtures/catalog.json', import.meta.url)));
  const row = body.data.find(row => row.id === 'gpt-4.1-mini');
  assert.deepEqual(projectRows([row]), [{ id: row.id, name: row.display_name,
    reasoning: row.capabilities.thinking.supported || row.capabilities.effort.supported,
    input: row.capabilities.image_input.supported ? ['text', 'image'] : ['text'],
    contextWindow: row.max_input_tokens, maxTokens: row.max_tokens }]);
});

test('rejects malformed, non-chat and unsafe IDs; deduplicates without normalization', async () => {
  const { projectRows } = await import('../src/catalog.mjs');
  const body = JSON.parse(await readFile(new URL('./fixtures/catalog.json', import.meta.url)));
  const good = body.data.find(row => row.id === 'gpt-4.1-mini');
  const bad = [null, {}, {...good, id:' padded '}, {...good, id:'../escape'},
    {...good, max_tokens:0}, {...good, max_input_tokens:'1000'},
    {...good, type:'embedding'}, {...good, disabled:true}, {...good, deprecated:true},
    {...good, id:'redact-v1'}];
  assert.deepEqual(projectRows([...bad, good, good]), projectRows([good]));
});
