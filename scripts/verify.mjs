import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024, ...options,
  });
  return {
    command: [command, ...args], exitCode: result.status,
    signal: result.signal, error: result.error?.message,
    stdout: result.stdout ?? '', stderr: result.stderr ?? '',
    passed: result.status === 0 && !result.error && !result.signal,
  };
}

export async function verify(outputDir) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  await mkdir(outputDir, { recursive: true });
  const commands = [
    [process.execPath, ['--version'], 'node-version'],
    ['npm', ['--version'], 'npm-version'],
    ['npm', ['test'], 'tests'],
    ['npm', ['run', 'check'], 'syntax'],
    [process.execPath, ['-e', "import('./index.mjs')"], 'real-import'],
    ['npm', ['pack', '--dry-run', '--ignore-scripts', '--json'], 'pack-dry-run'],
  ];
  const results = [];
  for (const [command, args, label] of commands) {
    const result = runCommand(command, args, { cwd: root });
    await writeFile(resolve(outputDir, `${label}.stdout.txt`), result.stdout);
    await writeFile(resolve(outputDir, `${label}.stderr.txt`), result.stderr);
    const { stdout, stderr, ...summary } = result;
    results.push({ label, ...summary });
  }
  const summary = { timestamp: new Date().toISOString(), passed: results.every(r => r.passed), commands: results };
  await writeFile(resolve(outputDir, 'verification.json'), JSON.stringify(summary, null, 2) + '\n');
  return summary;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!process.argv[2]) throw new Error('Usage: node scripts/verify.mjs <evidence-directory>; run only on an approved verification host');
  const summary = await verify(resolve(process.argv[2]));
  console.log(JSON.stringify(summary, null, 2));
  if (!summary.passed) process.exitCode = 1;
}
