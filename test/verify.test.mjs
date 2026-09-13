import test from 'node:test';
import assert from 'node:assert/strict';
import { runCommand } from '../scripts/verify.mjs';

test('verification does not mask failed Node commands', () => {
  const result = runCommand(process.execPath, ['-e', 'process.exit(7)']);
  assert.equal(result.exitCode, 7);
  assert.equal(result.passed, false);
});
test('verification rejects spawn failures and timeouts', () => {
  assert.equal(runCommand('/nonexistent/concentrate-proof', []).passed, false);
  const timeout = runCommand(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { timeout: 100 });
  assert.equal(timeout.passed, false);
  assert.ok(timeout.error);
});
test('verification preserves separated command streams', () => {
  const result = runCommand(process.execPath, ['-e', 'console.log("out"); console.error("err")']);
  assert.equal(result.passed, true);
  assert.equal(result.stdout, 'out\n');
  assert.equal(result.stderr, 'err\n');
});
