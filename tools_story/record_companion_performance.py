#!/usr/bin/env python3
"""Persist built-in image outputs and their file checks without altering originals."""
import argparse
import hashlib
import json
import shutil
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'art_sources/companion_performance_20261004'
p=argparse.ArgumentParser()
p.add_argument('--job',required=True)
p.add_argument('--source',type=Path,required=True)
p.add_argument('--attempt',type=int,default=1)
p.add_argument('--inputs',nargs='+')
p.add_argument('--prompt-file',type=Path)
args=p.parse_args()
manifest=OUT/'manifest.json';d=json.loads(manifest.read_text())
c=next(c for c in d['characters'] if c['character_id']==args.job.split('/')[0])
j=next(j for j in c['jobs'] if j['id']==args.job)
dest=OUT/'native'/c['character_id']/f'{args.job.split("/")[1]}-r{args.attempt}.png'
dest.parent.mkdir(parents=True,exist_ok=True)
if dest.exists() and dest.read_bytes()!=args.source.read_bytes():raise SystemExit('Refusing to overwrite different native output')
shutil.copyfile(args.source,dest)
im=Image.open(dest);alpha=im.getchannel('A') if 'A' in im.getbands() else None
hist=alpha.histogram() if alpha else [];size=list(im.size)
checks={'size':size,'mode':im.mode,'has_alpha':alpha is not None,'fully_transparent_fraction':hist[0]/(im.width*im.height) if hist else 0,'portrait_2_3':im.width*3==im.height*2,'native_at_least_1024_1536':im.width>=1024 and im.height>=1536}
actual_prompt=args.prompt_file.relative_to(ROOT).as_posix() if args.prompt_file else j['prompt_file']
record={'source_type':'builtin_imagegen','model':'not_exposed','tool_source':str(args.source),'native_file':dest.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'transparent_background':True,'actual_inputs':args.inputs or [str(ROOT/j['input_reference'])],'prompt_file':actual_prompt,'file_checks':checks,'attempt':args.attempt,'visual_review':'pending'}
j['actual_prompt_file']=actual_prompt
j.setdefault('attempts',[]).append(record);j['generation']=record;j['native_file']=record['native_file'];j['status']='generated';j['quality']['medium']='file_checks_passed_visual_pending' if checks['has_alpha'] and checks['portrait_2_3'] else 'file_checks_failed'
j['runtime_file']=None;j.pop('export',None);j['quality']['display']='pending'
if j['kind']=='expression':j['quality']['emotion_pose']='pending'
c['production_status']='generation_in_progress'
alljobs=[j for c in d['characters'] for j in c['jobs']];d['production_totals']={'planned':len(alljobs),'native_generated':sum(bool(j.get('native_file')) for j in alljobs),'internally_accepted':sum(j['status'] in ['internally_accepted','integrated','complete'] for j in alljobs),'integrated':sum(j['status'] in ['integrated','complete'] for j in alljobs)};d['status']='production_in_progress';manifest.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'job':args.job,'saved':record['native_file'],'file_checks':checks,'total_generated':d['production_totals']['native_generated']},ensure_ascii=False))
