# -*- coding: utf-8 -*-

"""Inventory all local media; package explicitly registered runtime images without deleting history."""
from pathlib import Path
import json,re,hashlib,shutil,collections
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs/assets';DOC.mkdir(exist_ok=True)
import sys
if (DOC/'production-assets.json').exists() and '--adopt-reviewed' not in sys.argv:
 raise SystemExit('已有正式清单：请先核对设计、采用验收与更新记录；经审查的采用使用 --adopt-reviewed。禁止自动刷新掩盖差异。')
evidence=json.loads((DOC/'runtime-evidence.json').read_text())
obsolete={'m_qihe_trial_v1','m_qihe_trial_v1_fg'}
paths={('assets/'+Path(x['path']).name if '/production/' in x['path'] and (ROOT/'assets'/Path(x['path']).name).exists() else x['path']) for x in evidence['loaded'] if Path(x['path']).stem not in obsolete}
for row in evidence['requests']:
 if row['status']<400 and row['path'].endswith(('.webp','.png','.mp3','.wav')) and Path(row['path']).stem not in obsolete:paths.add('assets/'+Path(row['path']).name if '/production/' in row['path'] and (ROOT/'assets'/Path(row['path']).name).exists() else row['path'])
# Battle background names are built dynamically; retain the declared fallback family.
for p in (ROOT/'assets').glob('*.webp'):
 if p.stem.startswith(('bb_','bg_')):paths.add(p.relative_to(ROOT).as_posix())
for p in (ROOT/'assets/production').rglob('*.webp'):
 original=ROOT/'assets'/p.name
 if original.exists() and p.stem not in obsolete:paths.add(original.relative_to(ROOT).as_posix())
prior=DOC/'production-assets.json'
if prior.exists():
 for a in json.loads(prior.read_text())['assets']:
  if a['id'] not in obsolete and (ROOT/a['original_path']).exists():paths.add(a['original_path'])
for k in evidence['registered']:
 if k not in obsolete and (ROOT/f'assets/{k}.webp').is_file():paths.add(f'assets/{k}.webp')
for char in evidence['walks']:
 for kind in ['walk','run','idle']:
  spec=char.get(kind)
  if spec:
   for k in ['file','bright']:
    p=f"assets/{spec[k]}.webp"
    if (ROOT/p).is_file():paths.add(p)
# Preserve reviewed logical IDs and adopted source paths across repackaging.
prior_doc=json.loads((DOC/'production-assets.json').read_text()) if (DOC/'production-assets.json').exists() else {}
prior_by_id={a['id']:a for a in prior_doc.get('assets',[])}
paths={prior_by_id[Path(p).stem]['original_path'] if Path(p).stem in prior_by_id and (p.startswith('assets/production/') or len(Path(p).parts)==2) else p for p in paths}
# Direct UI media are already separated by design version. Only the current version is selected.
for p in (ROOT/'assets/ui/jianghu-v4').rglob('*'):
 if p.is_file():paths.add(p.relative_to(ROOT).as_posix())
texts={p.relative_to(ROOT).as_posix():p.read_text(errors='replace') for p in (ROOT/'js').glob('*.js')}
texts['index.html']=(ROOT/'index.html').read_text()
for p in (ROOT/'assets').glob('*.webp'):
 if p.stem not in obsolete and any(re.search(r"['\"]"+re.escape(p.stem)+r"['\"]",t) or p.as_posix().endswith('assets/'+p.name) and 'assets/'+p.name in t for k,t in texts.items() if k!='js/production-assets.js'):paths.add(p.relative_to(ROOT).as_posix())
for p in (ROOT/'assets/audio').rglob('*'):
 if p.is_file() and p.suffix in {'.mp3','.wav','.ogg'} and (any(p.stem in text for text in texts.values()) or p.stem.startswith(('step','arts_'))):paths.add(p.relative_to(ROOT).as_posix())
# Normalize after all code-discovered paths too, so stale root originals cannot override adoption.
paths={prior_by_id[Path(p).stem]['original_path'] if Path(p).stem in prior_by_id and (p.startswith('assets/production/') or len(Path(p).parts)==2) else p for p in paths}
def system(p):
 n=Path(p).stem
 if '/audio/' in p:return 'audio'
 if '/ui/' in p:return 'ui'
 if n.startswith(('bb_','b_')):return 'battle'
 if n.startswith('m_'):return 'maps'
 if n.startswith('p_'):return 'portraits'
 if n.startswith('s_'):return 'characters'
 if n.startswith(('i_','a_','r_')):return 'icons-and-props'
 return 'shared'
production=[];aliases={}
# Replacements reuse the existing register. A source may back several products,
# and logical audio IDs need not match file stems; do not rediscover them by name.
registered_only='--registered-only' in sys.argv
if registered_only:
 for a in prior_doc.get('assets',[]):
  target=ROOT/a['path']
  if not target.is_file() or hashlib.sha256(target.read_bytes()).hexdigest()!=a['sha256']:
   raise SystemExit('正式成品缺失或变化，不能仅刷新登记：'+a['path'])
  if not (ROOT/a['original_path']).is_file():raise SystemExit('正式来源缺失：'+a['original_path'])
  production.append(dict(a))
  if a['path'].startswith('assets/production/') and target.suffix=='.webp':aliases[a['id']]=a['path']
for path in ([] if registered_only else sorted(paths)):
 p=ROOT/path;kind=system(path)
 preserved=next((a for a in prior_doc.get('assets',[]) if a['original_path']==path),None)
 logical=preserved['id'] if preserved else p.stem
 if preserved:kind=preserved['system']
 if preserved and preserved['path'].startswith('assets/production/'):
  final=preserved['path'];target=ROOT/final
  if not target.exists() or hashlib.sha256(target.read_bytes()).hexdigest()!=preserved['sha256']:
   raise SystemExit('正式成品缺失或变化，先单独验收采用，禁止用原稿覆盖：'+final)
  if target.suffix=='.webp':aliases[logical]=final
 elif len(Path(path).parts)==2 and p.suffix=='.webp':
  target=ROOT/'assets/production'/kind/p.name;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
  final=target.relative_to(ROOT).as_posix();aliases[p.stem]=final
 else:final=path
 refs=[k for k,s in texts.items() if p.stem in s or path in s]
 role='qihe-active-map' if logical.startswith(('m_qh_','m_qihe_')) else 'dynamic-background-fallback' if p.stem.startswith(('bb_','bg_')) else 'registered-or-direct-runtime'
 production.append({**(preserved or {}),**dict(id=logical,path=final,original_path=path,system=kind,role=role,sha256=hashlib.sha256((ROOT/final).read_bytes()).hexdigest(),references=refs)})
(DOC/'production-assets.json').write_text(json.dumps({'version':'qihe-production-20261005','confirmed_map':'m_qh_central','scope':'8792 legacy-prologue workspace; runtime registration is not visual acceptance',**({'map_acceptance':prior_doc['map_acceptance']} if 'map_acceptance' in prior_doc else {}),'assets':production},ensure_ascii=False,indent=2)+'\n')
(ROOT/'js/production-assets.js').write_text("'use strict';\n// Generated canonical runtime image paths; edit docs/assets/production-assets.json via organizer.\nwindow.PRODUCTION_ASSET_PATHS="+json.dumps(aliases,ensure_ascii=False,separators=(',',':'))+';\n')
with (ROOT/'js/production-assets.js').open('a') as f:
 f.write('window.PRODUCTION_AUDIO_PATHS='+json.dumps({a['id']:a['path'] for a in production if a['system']=='audio'},separators=(',',':'))+';\n')

media={'.png','.webp','.jpg','.jpeg','.gif','.svg','.mp3','.wav','.ogg','.mp4','.woff','.woff2','.ttf'}
rows=[];errors=[]
formal_paths={a['path'] for a in production}
source_paths={a['original_path'] for a in production}
for folder in ['assets','art_sources','review','raw_anim','raw_battle','raw_scene']:
 for p in sorted((ROOT/folder).rglob('*')):
  if not p.is_file() or p.suffix.lower() not in media:continue
  path=p.relative_to(ROOT).as_posix();row=dict(path=path,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),system=system(path))
  if path in formal_paths:status='production-registered'
  elif path in source_paths:status='history-original-of-production'
  elif path.startswith('assets/'):status='retained-unselected'
  elif path.startswith('review/'):status='review-evidence'
  else:status='authoring-source-or-candidate'
  if p.stem in obsolete:status='superseded-closed-map'
  row['status']=status;row['references']=[k for k,s in texts.items() if p.stem in s or path in s]
  if p.suffix.lower() in {'.png','.webp','.jpg','.jpeg','.gif'}:
   try:
    with Image.open(p) as im:row['size']=list(im.size);im.verify()
   except Exception as e:row['decode_error']=str(e);errors.append(path)
  rows.append(row)
groups=collections.defaultdict(list)
for r in rows:groups[r['sha256']].append(r['path'])
duplicates=[v for v in groups.values() if len(v)>1]
counts=dict(collections.Counter(r['status'] for r in rows))
report=dict(workspace=str(ROOT),confirmed_map=aliases.get('m_qh_central'),files=rows,counts=counts,decode_errors=errors,identical_groups=duplicates,failed_runtime_requests=[r for r in evidence['requests'] if r['status']>=400])
(DOC/'inventory.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
lines=['# 当前版本正式素材清单','','基准：用户确认四向通行栖河村。工作区为 `xiaojianghu-legacy-prologue`，本地入口端口 8792。','', '**地图唯一基准：正式 ID `m_qh_central`，具体采用文件及参考原件以下表与 JSON 的 map_acceptance 为准。** 封闭版 `m_qihe_trial_v1` 已退出正式加载。另一工作区的 opening-v4 村落及错误 4K 试验不属于本版本。','', '## 使用与入库规则','', '- 运行图片从 `assets/production/<系统>/` 加载；UI 当前版本独立保留在 `assets/ui/jianghu-v4/`。来源原件保留在原路径，仅用于追溯，禁止据文件名直接选用。','- 新素材先放 `art_sources/<批次>/`，记录参考原图、提示词、模型与实际尺寸。经核对后更新正式清单、独立目录和运行映射；不得覆盖旧版本原件。','- 正式清单表示程序当前登记使用；不代表每份图片已通过人工风格验收。候选/历史/未证实动态引用在 inventory.json 单独列出，不自动删除或转为正式。','- 修改素材后运行 `python3 tools_assets/organize_assets.py --adopt-reviewed` 和 `python3 tools_assets/check_production.py`。','- **透明素材镂空检查（2026-10-25 起，发布构建必过）**：`check_production.py` 调用 `tools_assets/check_prop_holes.py`，对地图道具切片、精灵、立绘、战斗表、培养素材、图标等带透明通道的正式图找“封闭透明洞”（四面被不透明像素包住、面积 ≥16 像素），地图道具切片另查“窄缺口”（半径 5 闭运算补得上、面积 ≥60、最厚 ≥2.5 像素的透明豁口，例如切件时把木料、阴影当地面抠掉）。特效、界面、地图底图与前景层不查。窗格、栅栏、车轮辐条、枝杈间、手臂与身体之间这类有意镂空，登记到 `docs/assets/prop-holes-allow.json`（key、原因、允许的洞外框；看过可视化的写 `status: reviewed`）；未登记的洞直接报错。新素材入库前先跑 `python3 tools_assets/check_prop_holes.py --report <证据目录>` 看红（封闭洞）橙（窄缺口）标色图：是抠图错误就修图（从未抠的原件补像素或重切），确属造型才登记白名单，不得为过检查整批登记。','', '## 按系统记录','']
for kind in sorted({r['system'] for r in production}):
 lines += [f'### {kind}','','| ID | 正式路径 | 原件来源 | SHA256（前12位） |','| --- | --- | --- | --- |']
 for r in production:
  if r['system']==kind:lines.append(f"| {r['id']} | `{r['path']}` | `{r['original_path']}` | {r['sha256'][:12]} |")
 lines.append('')
(DOC/'production-assets.md').write_text('\n'.join(lines))
(DOC/'audit.md').write_text('# 全部素材盘点\n\n'+f'共检查 {len(rows)} 份媒体文件（含正式副本），登记 {len(production)} 份运行资源。图片解码错误 {len(errors)}，启动失败请求 {len(report["failed_runtime_requests"])}。\n\n'+'\n'.join(f'- {k}：{v}' for k,v in counts.items())+'\n\n完整路径、尺寸、哈希、代码引用及重复组见 inventory.json。哈希相同的来源和正式副本是可追溯副本，不视为重复生成错误。未引用文件不等于弃用；动态资源需保留并评审。音频与字体纳入盘点，但本轮没有逐条听审，也没有宣称所有画风人工验收通过。\n')
print(json.dumps({'total':len(rows),'production':len(production),'counts':counts,'decode_errors':errors,'failed_runtime_requests':report['failed_runtime_requests']},ensure_ascii=False))
