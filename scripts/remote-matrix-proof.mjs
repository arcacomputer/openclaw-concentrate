// Disposable-worker entry. No credentials, no vendor network, no optional free/timeout binaries.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { cpus } from 'node:os';
const proof='/tmp/proof';mkdirSync(proof,{recursive:true});mkdirSync('/tmp/host',{recursive:true});
writeFileSync(`${proof}/runtime.json`,JSON.stringify({node:process.version,cpus:cpus().length,memory:readFileSync('/proc/meminfo','utf8')},null,2));
const results=[];
function run(label,command,args,cwd='/tmp/candidate',timeout=45000){
 const r=spawnSync(command,args,{cwd,env:{...process.env,OPENCLAW_PACKAGE_JSON:'/tmp/host/package.json'},encoding:'utf8',timeout,maxBuffer:4*1024*1024,killSignal:'SIGKILL',shell:false});
 writeFileSync(`${proof}/${label}.stdout.txt`,r.stdout??'');writeFileSync(`${proof}/${label}.stderr.txt`,r.stderr??'');
 const row={label,command:[command,...args],exitCode:r.status,signal:r.signal,error:r.error?.message,passed:r.status===0&&!r.error&&!r.signal};results.push(row);writeFileSync(`${proof}/commands.json`,JSON.stringify(results,null,2));return row.passed;
}
let ok=false;
try{
 if(!run('install','npm',['install','--ignore-scripts','--no-audit','--no-fund','--save-exact','openai@7.8.0'],'/tmp/host',100000))throw new Error('Install failed; no retry');
 ok=run('focused-tests',process.execPath,['--test','--test-concurrency=1','test/matrix.test.mjs','test/transport.synthetic.mjs']);
 ok=run('matrix-syntax',process.execPath,['--check','scripts/live-matrix.mjs'])&&ok;
 ok=run('adapter-syntax',process.execPath,['--check','scripts/openclaw-live-adapter.mjs'])&&ok;
 ok=run('manifest',process.execPath,['scripts/generate-manifest.mjs'])&&ok;
 ok=run('plan',process.execPath,['scripts/live-matrix.mjs','evidence/2026-09-12/catalog-test-manifest.json',`${proof}/matrix-checkpoint.json`,'plan'])&&ok;
 writeFileSync(`${proof}/catalog-test-manifest.json`,readFileSync('evidence/2026-09-12/catalog-test-manifest.json'));
}catch(e){writeFileSync(`${proof}/failure.txt`,e.message);}
finally{run('archive','tar',['-czf','/tmp/proof.tar.gz','-C','/tmp','proof'],'/tmp',15000);}
process.exitCode=ok?0:1;
