"""Early layout checks on proposed full-width roads, before generating art.
A pass is geometric feasibility only; living-space/art direction need independent review.
"""
import json,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw

def check(board):
 w,h=board['worldSize'];errors=[];objects=board['objects']
 for road in board['roads']:
  lane=Image.new('1',(w,h));d=ImageDraw.Draw(lane);points=[tuple(p) for p in road['points']];half=road['width']/2
  d.line(points,fill=1,width=road['width'],joint='curve')
  for x,y in points:d.ellipse((x-half,y-half,x+half,y+half),fill=1)
  a=np.array(lane)
  for o in objects:
   r=o.get('footprintRect')
   if not r or o.get('role')=='door' or o.get('nonBlocking'):continue
   x,y,z,q=map(int,r);crop=a[max(0,y):min(h,q),max(0,x):min(w,z)]
   if crop.size and crop.any():
    yy,xx=np.argwhere(crop)[0];errors.append({'type':'road-obstruction','road':road['id'],'object':o['id'],'point':[int(xx+max(0,x)),int(yy+max(0,y))],'clearWidth':road['width']})
 for area in board.get('doors',[])+board.get('workPads',[]):
  bounds=area.get('approachEnvelope') or area.get('rect')
  if not bounds:continue
  allowed=set(area.get('members',[]))
  for o in objects:
   r=o.get('footprintRect')
   if not r or o.get('role')=='door' or o.get('nonBlocking') or o['id'] in allowed:continue
   x,y,z,q=bounds;a,c,d,e=r
   if max(x,a)<min(z,d) and max(y,c)<min(q,e):
    errors.append({'type':'operation-envelope-obstruction','area':area['id'],'object':o['id'],'intersection':[max(x,a),max(y,c),min(z,d),min(q,e)]})
 for o in objects:
  if o.get('role')=='prop' and not all(o.get(k) for k in ['groupId','owner','purpose']):errors.append({'type':'missing-activity-membership','object':o['id']})
 return {'status':'fail' if errors else 'pass','errors':errors,'scope':'Full road width, declared door/working envelopes versus solid footprints and prop group completeness; not visual/semantic or runtime acceptance.'}
if __name__=='__main__':
 p=Path(sys.argv[1] if len(sys.argv)>1 else 'art_sources/chapter1_scene_v2_plan/concept-board.json');b=json.loads(p.read_text());r=check(b);(p.parent/'early-layout-check.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n');print(json.dumps(r,ensure_ascii=False))
