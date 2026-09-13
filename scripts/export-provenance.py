#!/usr/bin/env python3
"""Export existing Git history. Run before committing; never backdates history."""
import datetime,json,subprocess
from pathlib import Path
root=Path(__file__).resolve().parents[1]
raw=subprocess.check_output(['git','log','--format=%H%x09%aI%x09%cI%x09%s'],cwd=root,text=True)
commits=[dict(zip(['sha','authorTime','committerTime','subject'],line.split('\t',3))) for line in raw.splitlines()]
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
data={'schemaVersion':1,'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),'historyThrough':head,'scope':'Existing commits through historyThrough. The later commit storing this export is not included; inspect Git history for its SHA and timestamps.','commits':commits}
(root/'docs/commit-history.json').write_text(json.dumps(data,indent=2)+'\n')
lines=['# Commit history','',f"Exported at **{data['generatedAt']}**.",'',f'History through `{head}`.','', 'Author and committer timestamps below come directly from Git, with their recorded UTC offsets. This export does not include the later commit that stores it; Git history remains authoritative. No historical work was backdated.','']
for c in reversed(commits):
 lines += [f"## {c['subject']}",'',f"- Commit: [`{c['sha']}`](https://github.com/arcacomputer/openclaw-concentrate/commit/{c['sha']})",f"- Author timestamp: `{c['authorTime']}`",f"- Committer timestamp: `{c['committerTime']}`",'']
(root/'docs/COMMIT-HISTORY.md').write_text('\n'.join(lines))
print(json.dumps({'historyThrough':head,'commits':len(commits),'generatedAt':data['generatedAt']}))
