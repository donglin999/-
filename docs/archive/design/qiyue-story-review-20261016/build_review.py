"""Build only the local R2 review, preserving R1 and its browser notes."""
from pathlib import Path
import subprocess, sys, json, shutil, hashlib, html, re
R=Path(__file__).resolve().parent
for f in ('author.py','validate.py'):
 subprocess.run([sys.executable,str(R/f)],check=True)
O=R.parents[3]/'xiaojianghu-legacy-prologue/review/qiyue-story-20261016'
O.mkdir(parents=True,exist_ok=True)
for a,b in [('story.json','story.json'),('dialogue.md','script.md'),('README.md','design.md')]:shutil.copy2(R/a,O/b)
def inline(t):
 t=html.escape(t)
 t=re.sub(r'\*\*(.*?)\*\*',r'<strong>\1</strong>',t)
 # Source-relative references remain in downloadable source; review links must resolve.
 t=re.sub(r'\[(.*?)\]\((.*?)\)',lambda m:m[1] if m[2].startswith('../') else '<a href="'+('script.md' if m[2]=='dialogue.md' else m[2])+'">'+m[1]+'</a>',t)
 return t
chunks=[];table=False;ul=False
for line in (R/'README.md').read_text().splitlines():
 if not line.startswith('|') and table:chunks.append('</tbody></table></div>');table=False
 if not line.startswith('- ') and ul:chunks.append('</ul>');ul=False
 if line.startswith('|'):
  cells=[x.strip() for x in line.strip('|').split('|')]
  if all(re.fullmatch(r'[:\- ]+',x) for x in cells):continue
  if not table:chunks.append('<div class="table"><table><tbody>');table=True
  chunks.append('<tr>'+''.join('<td>'+inline(x)+'</td>' for x in cells)+'</tr>');continue
 if not line.strip():continue
 if line.startswith('#'):
  level=len(line)-len(line.lstrip('#'));chunks.append(f'<h{level}>'+inline(line[level:].strip())+f'</h{level}>')
 elif line.startswith('- '):
  if not ul:chunks.append('<ul>');ul=True
  chunks.append('<li>'+inline(line[2:])+'</li>')
 else:chunks.append('<p>'+inline(line)+'</p>')
page='''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>栖月楼 · 暗线设计与作者真相</title><style>body{margin:0;background:#ede8dc;color:#35443c;font:16px/1.9 system-ui}main{max-width:1080px;margin:24px auto;padding:32px;background:#faf5e8}h1,h2,h3{font-family:"Songti SC",serif;line-height:1.4}h2{margin-top:42px;border-top:1px solid #d5c9b0;padding-top:25px}td{padding:12px;vertical-align:top;border-bottom:1px solid #d3ccb9;min-width:120px}tr:first-child{font-weight:bold;background:#eee4cc}table{border-collapse:collapse;width:100%;font-size:14px}.table{overflow:auto}a{color:#74623c}nav{position:sticky;top:0;background:#e7dec9;padding:12px 24px;font-size:14px}p{overflow-wrap:anywhere}@media(max-width:700px){main{margin:0;padding:20px}}</style><nav><a href="./">← 回到剧情与逐句对照</a> · 作者剧透 / 新增提案 · <a href="design.md" download>下载设计文档</a></nav><main>'''+''.join(chunks)+'</main></html>'
(O/'design.html').write_text(page)
manifest=dict(status='review-draft-unapproved',version='20261016.2',source=str(R.relative_to(R.parents[3])),sha256={n:hashlib.sha256((R/n).read_bytes()).hexdigest() for n in ['author.py','base-20261014.json','story.json','README.md']},gameStateChanged=False,calendarRegistered=False,previousReviewPreserved=True)
(O/'source-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(O)
