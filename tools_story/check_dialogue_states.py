#!/usr/bin/env python3
"""Verify actual files, provenance and explicit review status; never infer art acceptance."""
import argparse,hashlib,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'art_sources/companion_dialogue_states_20261004'
p=argparse.ArgumentParser();p.add_argument('--require-complete',action='store_true');a=p.parse_args()
d=json.loads((OUT/'manifest.json').read_text());atlas=json.loads((ROOT/'docs/design/story-atlas.json').read_text());errors=[];metrics=[];pending=[]
def check(ok,msg):
 if not ok:errors.append(msg)
check({c['id'] for c in atlas['characters'] if c['type']=='companion'}=={c['character_id'] for c in d['characters']},'Roster mismatch')
expected_count=len([c for c in atlas['characters'] if c['type']=='companion'])
expected_images=expected_count*6
check(d['counting']=={'characters':expected_count,'states_per_character':6,'total_images':expected_images,'separate_expression_images':0},'Quota mismatch')
check(d['output_contract']['switch']=='replace_whole_character_image' and d['output_contract']['imagegen_transparent_background'],'Wrong whole-image contract')
alljobs=[];hashes=[]
for c in d['characters']:
 ref=ROOT/c['identity_source'];check(ref.is_file() and hashlib.sha256(ref.read_bytes()).hexdigest()==c['identity_sha256'],c['character_id']+': identity changed')
 jobs=c['jobs'];alljobs+=jobs;keys={j['key'] for j in jobs};check(len(jobs)==6 and len(keys)==6 and {'neutral','happy','sad','angry','surprise'}<keys,c['character_id']+': wrong state set')
 check(len({j['body_and_emotion'] for j in jobs})==6,c['character_id']+': duplicate state briefs')
 for j in jobs:
  aid=j['id'];check(j['kind']=='dialogue_state',aid+': separate pose or face job remains')
  check((OUT/j['prompt_file']).is_file(),aid+': missing design prompt')
  if not j.get('native_file') or j['status'] not in ['internally_accepted','integrated','complete']:pending.append(aid)
  if not j.get('native_file'):continue
  native=ROOT/j['native_file'];check(native.is_file(),aid+': missing actual native')
  if not native.is_file():continue
  h=hashlib.sha256(native.read_bytes()).hexdigest();hashes.append(h);check(h==j['generation']['sha256'],aid+': native hash mismatch')
  im=Image.open(native);check(im.size==(1024,1536),aid+': native resolution');check(im.mode=='RGBA',aid+': no alpha')
  alpha=im.getchannel('A');hist=alpha.histogram();check(0.1<hist[0]/(im.width*im.height)<0.95,aid+': invalid transparency coverage')
  bbox=alpha.point(lambda n:255 if n>16 else 0).getbbox();metrics.append({'id':aid,'alpha_gt_16_bbox':bbox,'head_or_prop_top_fraction':bbox[1]/im.height,'bottom_fraction':bbox[3]/im.height,'note':'silhouette bbox; not face or anatomical anchor measurement'})
  check(bbox[0]>0 and bbox[1]>0 and bbox[2]<im.width and bbox[3]<im.height,aid+': silhouette touches canvas edge; inspect crop')
  check((ROOT/j['actual_prompt_file']).is_file(),aid+': missing actual prompt')
  check(all(Path(path).is_file() for path in j['generation']['actual_inputs']),aid+': lost generation reference')
  if j['status'] in ['internally_accepted','integrated','complete']:
   check(all(j['quality'][g]=='passed' for g in ['identity','stage','structure','medium','emotion_pose']),aid+': unreviewed art gates')
   check(j.get('visual_review',{}).get('result')=='accepted' and bool(j['visual_review'].get('evidence')),aid+': missing visual evidence')
  if j.get('runtime_file'):
   runtime=ROOT/j['runtime_file'];check(runtime.is_file(),aid+': missing runtime')
   if runtime.is_file():
    image=Image.open(runtime);check(image.size==(512,768) and 'A' in image.getbands(),aid+': runtime size/alpha');check(hashlib.sha256(runtime.read_bytes()).hexdigest()==j['export']['sha256'],aid+': export hash mismatch')
  if j['quality']['display']=='passed':
   display=j.get('display_review',{})
   check(display.get('result')=='passed' and bool(display.get('scope')),aid+': display result or scope missing')
   evidence=display.get('evidence',[])
   check(bool(evidence) and all((ROOT/path).is_file() for path in evidence),aid+': display evidence missing')
check(len(alljobs)==expected_images and len({j['id'] for j in alljobs})==expected_images,'Total state IDs mismatch');check(len(hashes)==len(set(hashes)),'Repeated native file across states')
check(json.loads((ROOT/'docs/design/companion-performance.json').read_text())==d,'Machine mirror stale')
if a.require_complete:
 check(not pending,'Art generation or explicit review still pending')
 check(all(j.get('runtime_file') for j in alljobs),'Exports incomplete')
report={'scope':'unified dialogue state files, provenance and recorded visual reviews; game integration is separate','totals':d['production_totals'],'errors':errors,'pending':pending,'silhouette_metrics':metrics}
(OUT/'contract-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'totals':report['totals'],'errors':errors,'pending_count':len(pending)},ensure_ascii=False));raise SystemExit(bool(errors))
