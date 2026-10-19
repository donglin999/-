"""Validate authored wall coverage, registered openings, and actual connections."""
def check(board):
 errors=[];runs=[]
 object_list=board['objects'];opening_list=board.get('wallOpenings',[])
 for kind,items in [('object',object_list),('opening',opening_list),('wall run',board.get('wallRuns',[]))]:
  ids=[item['id'] for item in items]
  for id in set(ids):
   if ids.count(id)>1:errors.append('duplicate '+kind+' id '+id)
 objects={o['id']:o for o in object_list};openings={o['id']:o for o in opening_list}
 wall_ids={id for id,o in objects.items() if o.get('asset') in ['wall_h','wall_v'] or o.get('kind') in ['wall_h','wall_v']}
 if wall_ids and not board.get('wallRuns'):errors.append('wall assets require a nonempty wallRuns contract')
 membership={id:[] for id in wall_ids}
 for run in board.get('wallRuns',[]):
  for id in run['objectIds']:
   if id in membership:membership[id].append(run['id'])
 # Legacy room junction caps are explicitly connected to BOTH a declared run
 # and its building in wallConnections. Resolve their run ownership from that
 # authored joint; arbitrary extra walls cannot inherit membership by proximity.
 def touches(a,b):
  a=a.get('footprintRect');b=b.get('footprintRect')
  return bool(a and b and max(a[0],b[0])<=min(a[2],b[2]) and max(a[1],b[1])<=min(a[3],b[3]))
 resolved={}
 for id in wall_ids:
  if membership[id]:continue
  peers=[q if p==id else p for p,q in board.get('wallConnections',[]) if id in [p,q] and p in objects and q in objects and touches(objects[p],objects[q])]
  buildings=[q for q in peers if objects[q].get('asset') in ['house','clinic','inn']]
  declared=[q for q in peers if q in membership and membership[q]]
  if buildings and declared:
   membership[id]=sorted({run for q in declared for run in membership[q]});resolved[id]=dict(type='explicit-building-junction',buildingIds=buildings,wallIds=declared,runIds=membership[id],connectionChain=[[id,q] for q in declared+buildings])
  if not membership[id]:errors.append('wall asset has no wallRun ownership '+id)
 for run in board.get('wallRuns',[]):
  axis=run['axis'];line=run['line'];a,z=run['start'],run['end'];intervals=[]
  for id in run['objectIds']:
   o=objects.get(id)
   if not o:errors.append(run['id']+': missing wall '+id);continue
   r=o.get('footprintRect')
   if not r:errors.append(id+': missing solid footprint');continue
   lo,hi=(r[0],r[2]) if axis=='x' else (r[1],r[3]);cross=(r[1],r[3]) if axis=='x' else (r[0],r[2])
   if not cross[0]<=line<=cross[1]:errors.append(id+': does not meet run line')
   intervals.append([max(a,lo),min(z,hi),'wall',id])
  for id in run['openingIds']:
   op=openings.get(id)
   if not op:errors.append(run['id']+': missing registered opening '+id);continue
   if op['axis']!=axis or op['line']!=line or op['clearWidth']!=op['end']-op['start']:errors.append(id+': opening geometry mismatch')
   if op['clearWidth']<2*board['footHalfWidth']+16:errors.append(id+': opening too narrow')
   if not op.get('purpose') or len(op.get('approachPoints',[]))<2:errors.append(id+': incomplete opening purpose/approaches')
   for l,h,t,oid in intervals:
    if max(l,op['start'])<min(h,op['end']):errors.append(id+': wall intrudes on opening '+oid)
   intervals.append([op['start'],op['end'],'opening',id])
  end=a
  for l,h,_,id in sorted(intervals):
   if l>end:errors.append(run['id']+f': unregistered gap {end}..{l}')
   end=max(end,h)
  if end<z:errors.append(run['id']+f': missing end {end}..{z}')
  runs.append(dict(id=run['id'],intervals=intervals))
 for left,right in board.get('wallConnections',[]):
  if left not in objects or right not in objects:errors.append('missing connection '+left+' / '+right);continue
  a=objects[left]['footprintRect'];b=objects[right]['footprintRect']
  if not(max(a[0],b[0])<=min(a[2],b[2]) and max(a[1],b[1])<=min(a[3],b[3])):errors.append('disconnected wall endpoint '+left+' / '+right)
 # Walls may meet only at explicit structural joints; props must not penetrate them.
 allowed={tuple(sorted(pair)) for pair in board.get('wallConnections',[])}
 values=list(objects.values())
 if board.get('wallRuns'):
  for i,left in enumerate(values):
   for right in values[i+1:]:
    a=left.get('footprintRect');b=right.get('footprintRect')
    if not a or not b:continue
    if max(a[0],b[0])<min(a[2],b[2]) and max(a[1],b[1])<min(a[3],b[3]) and tuple(sorted([left['id'],right['id']])) not in allowed:errors.append('unregistered solid overlap '+left['id']+' / '+right['id'])
 return dict(status='fail' if errors else 'pass',errors=errors,runs=runs,derivedRunMembership={id:dict(runIds=owners,via='explicit-building-junction' if id in resolved else 'direct-objectIds',connectionChain=resolved[id]['connectionChain'] if id in resolved else []) for id,owners in membership.items()},resolvedBuildingJunctions=resolved,openingCount=len(openings),connectionCount=len(board.get('wallConnections',[])))

def check_alpha(tile,asset,source=None):
 """A full transparent cut across a wall or missing cap must never ship."""
 import numpy as np
 a=np.asarray(tile.getchannel('A'))>=128
 covered=a.any(axis=0 if asset=='wall_h' else 1)
 longest=run=0
 for present in covered:
  run=0 if present else run+1;longest=max(longest,run)
 edge=max(2,min(12,len(covered)//3));left=float(covered[:edge].mean());right=float(covered[-edge:].mean())
 errors=[]
 if longest>=2:errors.append(f'transparent break of {longest}px across wall')
 if min(left,right)<.8:errors.append('missing endpoint cap coverage')
 if source is not None:
  from PIL import Image
  w,h=tile.size;sw,sh=source.size
  if asset=='wall_h':
   cap=round(sw*.13);cw=min(round(cap*h/sh),w//3)
   expected=[source.crop((0,0,cap,sh)).resize((cw,h),Image.Resampling.NEAREST),source.crop((sw-cap,0,sw,sh)).resize((cw,h),Image.Resampling.NEAREST)]
   actual=[tile.crop((0,0,cw,h)),tile.crop((w-cw,0,w,h))]
  else:
   src_top=round(sh*.115);src_bottom=round(sh*.28);top=min(round(src_top*w/sw),h//3);bottom=min(round(src_bottom*w/sw),h//3)
   expected=[source.crop((0,0,sw,src_top)).resize((w,top),Image.Resampling.NEAREST),source.crop((0,sh-src_bottom,sw,sh)).resize((w,bottom),Image.Resampling.NEAREST)]
   actual=[tile.crop((0,0,w,top)),tile.crop((0,h-bottom,w,h))]
  for label,got,want in zip(['start','end'],actual,expected):
   if got.tobytes()!=want.tobytes():errors.append(label+' cap differs from full original endpoint module')
 return dict(status='fail' if errors else 'pass',errors=errors,longestTransparentCut=longest,endCoverage=[left,right])
