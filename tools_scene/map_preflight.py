"""Compare rendered asset measurements with an independently approved design intent.
The builder never writes or approves the intent or its approval record.
"""
import hashlib,json
from pathlib import Path

def file_hash(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def check(board, intent_path, measurements, approval_path, rendered_tiles=None):
    errors=[];intent_path=Path(intent_path);approval_path=Path(approval_path)
    if not intent_path.is_file():return {'status':'fail','errors':['independent design intent missing']}
    intent=json.loads(intent_path.read_text())
    approval=json.loads(approval_path.read_text()) if approval_path.is_file() else {}
    if approval.get('intentSha256')!=file_hash(intent_path) or approval.get('status')!='accepted' or not approval.get('reviewer'):
        errors.append('design intent not independently approved at current hash')
    evidence=approval.get('evidence',{})
    if not evidence:errors.append('independent design approval evidence missing')
    for name,sha in evidence.items():
        path=Path(name)
        if not path.is_absolute():path=intent_path.parent/path
        if not path.is_file() or file_hash(path)!=sha:errors.append('design approval evidence missing or changed: '+name)
    if board['worldSize']!=intent['worldSize']:errors.append('world size differs from design intent')
    objects={o['id']:o for o in board['objects']}
    expected={o['id']:o for o in intent['structures']}
    actual={o['id'] for o in board['objects'] if o['asset'] in intent['structuralAssets']}
    if actual!=set(expected):errors.append('structural inventory differs from intent')
    for id,spec in expected.items():
        o=objects.get(id)
        if not o:errors.append(id+': required structure missing');continue
        for field in ['asset','visualRect','footprintRect','baseline','groundPlaneRect']:
            if o.get(field)!=spec.get(field):errors.append(id+': '+field+' differs from frozen intent')
        if o.get('rotation',0)!=spec.get('rotation',0):errors.append(id+': rotation differs from frozen intent')
        m=measurements.get(id)
        if not m:errors.append(id+': rendered measurement missing');continue
        if m['sourceSha256']!=spec['sourceSha256']:errors.append(id+': unapproved source replacement')
        if m['visibleSize']!=spec['visibleSize']:errors.append(id+': actual visible size differs from intent')
        if m['visibleRect']!=spec['visibleRect']:errors.append(id+': actual visible placement differs from intent')
    for field in ['wallRuns','wallOpenings','wallConnections']:
        if board.get(field,[])!=intent.get(field,[]):errors.append(field+': differs from approved boundary/entrance design')
    wall_ids={id for id,o in objects.items() if o.get('asset') in ['wall_h','wall_v']}
    coverage={id for line in intent.get('boundarySegments',[]) for id in line['objectIds']}
    if wall_ids-coverage:errors.append('wall pieces lack continuous rendered boundary checks: '+','.join(sorted(wall_ids-coverage)))
    building_ids={id for id,o in objects.items() if o.get('kind')=='house' or o.get('asset') in ['house','clinic','inn','inn-door-preflight-v1']}
    if building_ids!={s['id'] for s in intent.get('buildings',[])}:errors.append('building door/function inventory incomplete')
    boundary_samples=[]
    for segment in intent.get('boundarySegments',[]):
        if not 0<=segment.get('radius',0)<=3:errors.append(segment['id']+': boundary tolerance exceeds 3px');continue
        a,z=segment['from'],segment['to'];count=max(abs(z[0]-a[0]),abs(z[1]-a[1]))
        for step in range(count+1):
            point=[round(a[k]+(z[k]-a[k])*step/max(1,count)) for k in [0,1]]
            boundary_samples.append(dict(id=segment['id']+':'+str(step),point=point,radius=segment.get('radius',0),objectIds=segment['objectIds']))
    for probe in intent.get('boundaryProbes',[])+boundary_samples:
        hit=False
        for id in probe['objectIds']:
            if not rendered_tiles or id not in rendered_tiles or id not in objects:continue
            tile=rendered_tiles[id];left,top,_,_=objects[id]['visualRect'];x,y=probe['point'];radius=probe.get('radius',0)
            for yy in range(max(0,y-top-radius),min(tile.height,y-top+radius+1)):
                for xx in range(max(0,x-left-radius),min(tile.width,x-left+radius+1)):
                    if tile.getpixel((xx,yy))[3]>=128:hit=True
        if not hit:errors.append(probe['id']+': expected visible structural joint absent')
    doors=[]
    for spec in intent.get('buildings',[]):
        id=spec['id'];m=measurements.get(id,{})
        if not m.get('sourceVisibleSize'):errors.append(id+': source scale measurement missing');continue
        rect=spec['doorSourceRect'];height=(rect[3]-rect[1])*m['visibleSize'][1]/m['sourceVisibleSize'][1]
        doors.append({'id':id,'projectedDoorHeight':height,'adultHeight':board.get('adultHeight',92)})
        if height<92+8:errors.append(id+': door height below adult plus 8px headroom')
        if not spec.get('role') or not spec.get('sizeReason'):errors.append(id+': building function/size rationale missing')
    for group in intent.get('scaleGroups',[]):
        sizes=[measurements[id]['visibleSize'] for id in group['objectIds'] if id in measurements]
        if len(sizes)!=len(group['objectIds']):errors.append(group['id']+': scale group incomplete');continue
        for axis in [0,1]:
            if max(s[axis] for s in sizes)-min(s[axis] for s in sizes)>group.get('tolerancePx',1):errors.append(group['id']+': same model rendered at inconsistent scale')
    return {'status':'fail' if errors else 'pass','errors':errors,'intentSha256':file_hash(intent_path),'measurements':measurements,'doors':doors,'boundarySampleCount':len(boundary_samples),
            'scope':'Frozen independent geometry and actual rendered alpha bounds/source identity; visual function, gate readability and style require independent review.'}
