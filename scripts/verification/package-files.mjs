import fs from 'node:fs';import {createHash} from 'node:crypto';
const pack=JSON.parse(fs.readFileSync('/tmp/proof/pack.json'))[0];
const files=pack.files.map(x=>({path:x.path,sha256:createHash('sha256').update(fs.readFileSync('/tmp/packed/package/'+x.path)).digest('hex')}));
fs.writeFileSync('/tmp/proof/expected-files.json',JSON.stringify(files,null,2)+'\n');
