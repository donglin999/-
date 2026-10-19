#!/usr/bin/env python3
"""Rebuild review indexes from immutable image receipts and authored VFX descriptions."""
from pathlib import Path
import json, hashlib
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'art_sources/martial_icons_full_v1';DOC=ROOT/'docs/design/martial-review'
c=json.loads((DOC/'catalog.json').read_text());vfx={r['id']:r for r in json.loads((DOC/'vfx/catalog.json').read_text())['entries']}
existing={r['id']:r for r in json.loads((ROOT/'art_sources/martial_icons_tiers_v1/manifest.json').read_text())}
for r in json.loads((OUT/'prompts.json').read_text()):
 p=OUT/(r['id']+'.json')
 if p.exists():existing[r['id']]=json.loads(p.read_text())
# Optional explicit revision receipts supersede a first output without deleting history.
for p in sorted(OUT.glob('*-v[2-9].json')):
 r=json.loads(p.read_text());existing[r['id']]=r
entries=[]
for row in c['skills']+c['hearts']:
 r={k:row[k] for k in ['id','name','grade','kind','group','visual','effect','icon_id']};r.update({k:row[k] for k in ['naming','combat','system_id','production_icon','category','active_skill','passive_skill','structure_version','effect_v3','weak_class','element','statuses','usage','cleanse_tier','art_unlock_level','desc_v4','vfx_v4','icon_subject','active_desc_v4','passive_desc_v4'] if k in row});r['group_name']=c['groups'][r['group']][0];r['vfx']=vfx[r['id']];r['vfx_doc']='docs/design/martial-review/vfx/'+r['group']+'.md';asset=existing.get(r['id']);r['asset']=asset;r['generated']=bool(asset)
 if asset:
  p=ROOT/asset['path'];assert p.exists(),p;assert hashlib.sha256(p.read_bytes()).hexdigest()==asset['sha256'],p
  row.update(asset_status='sample_user_approved' if asset.get('review_status')=='user_approved_style_sample' else 'generated_pending_review',sample_path=asset['path'],sample_record='art_sources/martial_icons_full_v1/manifest.json')
 entries.append(r)
manifest=list(existing.values());(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
missing=[r['id'] for r in entries if not r['generated']]
report={'expected':len(entries),'generated':len(entries)-len(missing),'missing':missing,'vfx_descriptions':len(vfx),'runtime_integrated':0}
(ROOT/'review/martial-library/data.json').write_text(json.dumps({'report':report,'entries':entries},ensure_ascii=False)+'\n')
(OUT/'progress.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');(DOC/'catalog.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False))
