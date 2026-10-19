#!/usr/bin/env python3
"""Record an explicit visual review; never infer a visual pass from metadata."""
import argparse,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'art_sources/companion_performance_20261004'
p=argparse.ArgumentParser();p.add_argument('--jobs',nargs='+',required=True);p.add_argument('--result',choices=['accepted','rejected'],required=True);p.add_argument('--note',required=True);p.add_argument('--evidence',nargs='*',default=[]);a=p.parse_args()
file=OUT/'manifest.json';d=json.loads(file.read_text())
for c in d['characters']:
 for j in c['jobs']:
  if j['id'] not in a.jobs:continue
  if not j.get('native_file'):raise SystemExit('No native file to review')
  j['visual_review']={'result':a.result,'note':a.note,'evidence':a.evidence,'user_approved':False}
  j['generation']['visual_review']=a.result
  j['status']='internally_accepted' if a.result=='accepted' else 'rejected'
  for key in ['identity','stage','structure','medium']:j['quality'][key]='passed' if a.result=='accepted' else 'failed'
  if j['kind']=='expression':j['quality']['emotion_pose']='passed' if a.result=='accepted' else 'failed'
  # Display and runtime are separate gates, untouched by an art inspection.
for c in d['characters']:
 c['production_status']='all_11_art_internally_accepted_display_pending' if all(j['status']=='internally_accepted' for j in c['jobs']) else 'generation_in_progress'
alljobs=[j for c in d['characters'] for j in c['jobs']]
d['production_totals']={'planned':len(alljobs),'native_generated':sum(bool(j.get('native_file')) for j in alljobs),'internally_accepted':sum(j['status'] in ['internally_accepted','integrated','complete'] for j in alljobs),'integrated':sum(j['status'] in ['integrated','complete'] for j in alljobs)}
file.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(d['production_totals']))
