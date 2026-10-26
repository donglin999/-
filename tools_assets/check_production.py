# -*- coding: utf-8 -*-
"""Reject broken canonical paths, content drift and accidental map proposal swaps."""
from pathlib import Path
import json,hashlib
from PIL import Image
root=Path(__file__).resolve().parents[1]
d=json.loads((root/'docs/assets/production-assets.json').read_text());errors=[]
ids=[a['id'] for a in d['assets']]
if len(ids)!=len(set(ids)):errors.append('duplicate logical asset IDs')
for a in d['assets']:
 p=root/a['path']
 if not p.is_file():errors.append('missing '+a['path']);continue
 if hashlib.sha256(p.read_bytes()).hexdigest()!=a['sha256']:errors.append('content drift '+a['path'])
 if p.suffix in {'.webp','.png','.jpg'}:
  try:
   with Image.open(p) as im:im.verify()
  except Exception as e:errors.append(str(e))
central=next((a for a in d['assets'] if a['id']=='m_qh_central'),None)
acceptance=d.get('map_acceptance',{})
source=root/acceptance.get('adopted_source','art_sources/qihe-expansion-v1/central.png')
if acceptance:
 reference=root/acceptance['approved_reference']
 if not reference.is_file() or hashlib.sha256(reference.read_bytes()).hexdigest()!=acceptance['reference_sha256']:errors.append('approved four-way reference changed')
 if acceptance.get('world_size')!=[2400,1600]:errors.append('HD adoption changed world contract')
 if not (root/acceptance.get('evidence','')).is_file():errors.append('HD acceptance evidence missing')
if not central:errors.append('confirmed four-way central missing')
else:
 with Image.open(root/central['path']) as a,Image.open(source) as b:
  if a.convert('RGBA').tobytes()!=b.convert('RGBA').tobytes():errors.append('central no longer matches documented adopted source')
if any(a['id'] in {'m_qihe_trial_v1','m_qihe_trial_v1_fg'} for a in d['assets']):errors.append('superseded closed map promoted')
# Compare the human-facing register with the executable mapping, not just file hashes.
md=(root/'docs/assets/production-assets.md').read_text()
script=(root/'js/production-assets.js').read_text()
try:
 aliases=json.JSONDecoder().raw_decode(script[script.index('window.PRODUCTION_ASSET_PATHS=')+len('window.PRODUCTION_ASSET_PATHS='):])[0]
except Exception as e:
 aliases={};errors.append('invalid runtime registry '+str(e))
expected={}
for a in d['assets']:
 if f"| {a['id']} | `{a['path']}` | `{a['original_path']}` | {a['sha256'][:12]} |" not in md:errors.append('document register mismatch '+a['id'])
 if a['path'].startswith('assets/production/') and a['path'].endswith('.webp'):expected[a['id']]=a['path']
if central and aliases.get('m_qh_central')!=central['path']:errors.append('runtime central differs from accepted central')
if aliases!=expected:errors.append('runtime mapping differs from documented production registry')
try:
 audio_aliases=json.JSONDecoder().raw_decode(script.split('window.PRODUCTION_AUDIO_PATHS=',1)[1])[0]
 if audio_aliases!={a['id']:a['path'] for a in d['assets'] if a['system']=='audio'}:errors.append('audio runtime mapping differs from registry')
except Exception as e:errors.append('invalid audio runtime registry '+str(e))

entry=(root/'index.html').read_text()
if 'js/production-assets.js' not in entry or entry.index('js/production-assets.js')>entry.index('js/core.js'):errors.append('registry must load before core')
if 'js/production-asset-selection.js' not in entry:errors.append('superseded-map selection guard missing')
from cg_review import selection_errors
errors.extend(selection_errors(root,d,(root/'js/qihe-fire-cinematic.js').read_text()))
# 透明素材镂空：地图道具切片、精灵、立绘等不得有未登记的封闭透明洞／窄缺口（2026-10-25，白名单 docs/assets/prop-holes-allow.json）
from check_prop_holes import check as prop_hole_errors
errors.extend(prop_hole_errors())
for doc in ['AGENTS.md','docs/update-workflow.md','docs/assets/README.md']:
 if not (root/doc).is_file():errors.append('required update policy missing '+doc)
print(json.dumps({'status':'fail' if errors else 'pass','assets_checked':len(d['assets']),'errors':errors},ensure_ascii=False))
raise SystemExit(bool(errors))
