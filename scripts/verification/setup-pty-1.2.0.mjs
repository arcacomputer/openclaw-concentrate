// Real PTY proof using OpenClaw's existing, pinned node-pty dependency.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import pty from '@lydell/node-pty';
const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const cfg = spec.configPath;
const digest = () => createHash('sha256').update(fs.readFileSync(cfg)).digest('hex');
const steps = answer => [
  ['Filter models by name/vendor', 'claude-haiku-4-5\r'], ['Select model numbers', '1\r'],
  ['input USD/1M', '9\r'], ['output USD/1M', '10\r'], ['cacheRead USD/1M', '11\r'],
  ['cacheWrite USD/1M', '12\r'], ['Save these estimates?', answer + '\r'],
];
async function run(label, answers) {
  const before = digest(); let output = '', sent = 0, fault = null;
  const terminal = pty.spawn(spec.cli, ['concentrate', 'setup'], { cwd: spec.root, env: spec.env, name: 'xterm-256color', cols: 140, rows: 40 });
  const kill = () => { try { process.kill(-terminal.pid, 'SIGKILL'); } catch {} try { terminal.kill('SIGKILL'); } catch {} };
  let timer;
  try {
    const result = await new Promise(resolve => {
      timer = setTimeout(() => { fault = 'PTY deadline'; kill(); }, 38000);
      terminal.onData(data => {
        output += data;
        if (Buffer.byteLength(output) > 1048576) { fault = 'PTY output ceiling'; kill(); return; }
        while (sent < answers.length && output.includes(answers[sent][0])) terminal.write(answers[sent++][1]);
      });
      terminal.onExit(resolve);
    });
    const row = { label, exitCode: result.exitCode, signal: result.signal, promptsAnswered: sent, expectedPrompts: answers.length, configUnchanged: before === digest(), fault };
    fs.writeFileSync(path.join(spec.proof, label + '.txt'), output);
    fs.writeFileSync(path.join(spec.proof, label + '.json'), JSON.stringify(row, null, 2));
    assert.equal(fault, null, JSON.stringify(row));
    assert.equal(sent, answers.length, JSON.stringify(row));
    return row;
  } finally { clearTimeout(timer); kill(); }
}
const outcomes = [];
const mode = process.argv[3] ?? 'all'; assert.ok(['all', 'interrupt', 'eof'].includes(mode));
try {
  if (mode === 'all') {
  const declined = await run('tty-decline', steps('no')); outcomes.push(declined);
  assert.equal(declined.exitCode, 0); assert.equal(declined.configUnchanged, true);
  const applied = await run('tty-save', steps('yes')); outcomes.push(applied);
  assert.equal(applied.exitCode, 0); assert.equal(applied.configUnchanged, false);
  assert.deepEqual(JSON.parse(fs.readFileSync(cfg, 'utf8')).plugins.entries['concentrate-provider'].config.costOverrides['claude-haiku-4-5'], { input: 9, output: 10, cacheRead: 11, cacheWrite: 12 });
  }
  if (mode !== 'eof') {
  const cancelled = await run('tty-interrupt', [['Filter models by name/vendor', '\x03']]); outcomes.push(cancelled);
  assert.equal(cancelled.configUnchanged, true); assert.equal(cancelled.exitCode, 130);
  }
  if (mode !== 'interrupt') {
    const eof = await run('tty-eof', [['Filter models by name/vendor', '\x04']]); outcomes.push(eof);
    assert.equal(eof.configUnchanged, true); assert.equal(eof.exitCode, 130);
  }
  fs.writeFileSync(path.join(spec.proof, 'tty-summary.json'), JSON.stringify({ passed: true, outcomes, paidInferenceRequests: 0 }, null, 2));
} catch (error) {
  fs.writeFileSync(path.join(spec.proof, 'tty-summary.json'), JSON.stringify({ passed: false, outcomes, error: error.message, paidInferenceRequests: 0 }, null, 2));
  throw error;
}
