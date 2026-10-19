"""Publish this LOCAL review bundle; not a deploy and not a game-state migration."""
from pathlib import Path
import subprocess,sys,shutil,hashlib,json
R=Path(__file__).resolve().parent
for name in ['author.py','validate.py']:subprocess.run([sys.executable,str(R/name)],check=True)
workspace=R.parents[3]/'xiaojianghu-legacy-prologue'
out=workspace/'review/qiyue-story-20261014'
out.mkdir(parents=True,exist_ok=True)
for source,target in [('story.json','story.json'),('dialogue.md','script.md')]:shutil.copy2(R/source,out/target)
(out/'source-manifest.json').write_text(json.dumps(dict(status='review-draft',source='xiaojianghu/docs/design/qiyue-story-review-20261014/author.py',authorSha256=hashlib.sha256((R/'author.py').read_bytes()).hexdigest(),storySha256=hashlib.sha256((R/'story.json').read_bytes()).hexdigest(),gameStateChanged=False,calendarRegistered=False),indent=2)+'\n')
print(out)
