#!/usr/bin/env python3
"""Native-resolution map review coverage and stale-evidence gate, not a visual oracle."""
import argparse, hashlib, json, math, shutil
from pathlib import Path
from PIL import Image, ImageDraw

POLICY = {'small': {'maxArea': 1250000, 'maxEdge': 1440, 'maxObjects': 24, 'maxAnchors': 16},
          'medium': {'maxArea': 5000000, 'maxEdge': 3072, 'maxObjects': 80, 'maxAnchors': 48},
          'leafMax': [640, 480], 'districtMax': [1280, 960], 'halo': 96}

def tier(board):
    w,h=board['worldSize'];n=len(board['objects']);a=len(board['anchors'])
    for key in ['small','medium']:
        p=POLICY[key]
        if w*h<=p['maxArea'] and max(w,h)<=p['maxEdge'] and n<=p['maxObjects'] and a<=p['maxAnchors']:
            # Height transitions require overlapping local review even on a compact map.
            elevated=any(s.get('height',0)!=0 or s.get('heightFrom',0)!=s.get('heightTo',0) or s.get('layer',0)!=0 or
                         any(tag in s.get('id','').lower() for tag in ['bridge','steps','stairs','ramp']) for s in board.get('surfaces',[]))
            return 'medium' if key=='small' and elevated else key
    return 'large'

def intersects(a,b):return a[0]<b[2] and b[0]<a[2] and a[1]<b[3] and b[1]<a[3]
def grid(w,h,size):
    nx=math.ceil(w/size[0]);ny=math.ceil(h/size[1]);out=[]
    for row in range(ny):
        for col in range(nx):
            out.append({'id':f'r{row+1}c{col+1}','row':row,'col':col,
                        'core':[round(col*w/nx),round(row*h/ny),round((col+1)*w/nx),round((row+1)*h/ny)]})
    return out

def describe(board):
    w,h=board['worldSize'];t=tier(board);halo=POLICY['halo']
    zones=[{'id':'whole','row':0,'col':0,'core':[0,0,w,h]}] if t=='small' else grid(w,h,POLICY['leafMax'])
    for z in zones:
        a,b,c,d=z['core'];z['reviewRect']=[max(0,a-halo),max(0,b-halo),min(w,c+halo),min(h,d+halo)]
        z['objects']=[o['id'] for o in board['objects'] if intersects(o['visualRect'],z['reviewRect'])]
        z['anchors']=[k for k,(x,y) in board['anchors'].items() if a<=x<c and b<=y<d]
        z['needsRuntimeEvidence']=bool(z['anchors'] or z['objects'])
    seams=[]
    for i,z in enumerate(zones):
        for q in zones[i+1:]:
            a,b,c,d=z['core'];e,f,g,h2=q['core'];r=None
            if c==e and b==f and d==h2:r=[max(0,c-halo),max(0,b-halo),min(w,c+halo),min(h,d+halo)]
            elif d==f and a==e and c==g:r=[max(0,a-halo),max(0,d-halo),min(w,c+halo),min(h,d+halo)]
            if r:seams.append({'id':z['id']+'__'+q['id'],'zones':[z['id'],q['id']],'reviewRect':r,
                              'objects':[o['id'] for o in board['objects'] if intersects(o['visualRect'],r)]})
    areas=board.get('reviewAreas',[])
    for z in zones:z['functionalAreas']=[a['id'] for a in areas if intersects(z['reviewRect'],a['rect'])]
    for s in seams:s['functionalAreas']=[a['id'] for a in areas if intersects(s['reviewRect'],a['rect'])]
    districts=grid(w,h,POLICY['districtMax']) if t=='large' else []
    for d in districts:d['zones']=[z['id'] for z in zones if intersects(z['core'],d['core'])]
    return {'tier':t,'policy':POLICY,'worldSize':[w,h],'functionalAreas':areas,'zones':zones,'seams':seams,'districts':districts}

def digest(board,assembled,mask):
    # Review-state changes must not invalidate geometric evidence; content changes must.
    state_fields={'artReviewStatus','runtimeAcceptanceStatus','runtimeAcceptanceScope','runtimeAcceptanceEvidence',
                  'partitionReviewStatus','partitionReviewEvidence','productionReady'}
    b={k:v for k,v in board.items() if k not in state_fields}
    sha=hashlib.sha256(json.dumps(b,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode())
    for p in [assembled,mask]:sha.update(Path(p).read_bytes())
    return sha.hexdigest()

def gate(plan,ledger,base):
    errors=[]
    for kind in ['zones','seams','districts']:
        for item in plan[kind]:
            r=ledger.get(kind,{}).get(item['id'],{})
            prefix=kind+'/'+item['id']
            if r.get('inputDigest')!=plan['inputDigest']:errors.append(prefix+': stale or missing evidence');continue
            if r.get('status')!='pass' or r.get('unresolvedFindings'):errors.append(prefix+': not accepted');continue
            if not r.get('reviewer'):errors.append(prefix+': reviewer missing')
            if not r.get('visualEvidence'):errors.append(prefix+': visual evidence missing')
            if item.get('needsRuntimeEvidence') and not r.get('runtimeEvidence'):errors.append(prefix+': runtime evidence missing')
            for evidence in r.get('visualEvidence',[])+r.get('runtimeEvidence',[]):
                p=Path(evidence)
                if not p.is_absolute():p=base/p
                if not p.is_file():errors.append(prefix+': missing file '+str(evidence))
    return {'status':'accepted' if not errors else 'pending','errors':errors,
            'scope':'Coverage/evidence gate only; visual judgments are recorded by reviewer, never inferred from mask connectivity.'}

def build(board_path,assembled_path,mask_path,out_path):
    board_path=Path(board_path);out=Path(out_path);out.mkdir(parents=True,exist_ok=True)
    board=json.loads(board_path.read_text());plan=describe(board);plan['inputDigest']=digest(board,assembled_path,mask_path)
    previous_plan=out/'review-plan.json'
    if previous_plan.exists():
        old=json.loads(previous_plan.read_text())
        if old.get('inputDigest')!=plan['inputDigest'] or old.get('tier')!=plan['tier']:
            archive=out/'previous'/old.get('inputDigest','unknown')[:16];archive.mkdir(parents=True,exist_ok=True)
            for p in list(out.iterdir()):
                if p.name=='previous':continue
                if p.is_file():shutil.copy2(p,archive/p.name)
                elif p.is_dir():shutil.copytree(p,archive/p.name,dirs_exist_ok=True)
            # Engine-owned obsolete panes must not appear to belong to the new plan.
            for pattern in ['zones-*.png','seams-*.png','districts-*.png']:
                for p in out.glob(pattern):p.unlink()
    im=Image.open(assembled_path).convert('RGB');assert list(im.size)==board['worldSize'],'Native assembled size must equal world size'
    overview=im.copy();d=ImageDraw.Draw(overview)
    for z in plan['zones']:d.rectangle(z['core'],outline='#38c9ee',width=2);d.text((z['core'][0]+6,z['core'][1]+6),z['id'],fill='#ffffff')
    overview.save(out/'overview.png')
    mask=Image.open(mask_path).convert('RGBA');overlay=im.convert('RGBA');red=Image.new('RGBA',im.size,(230,40,25,0));red.putalpha(mask.getchannel('R').point(lambda a:90 if a==0 else 0));overlay=Image.alpha_composite(overlay,red)
    for kind in ['zones','seams','districts']:
        for item in plan[kind]:
            rect=item.get('reviewRect',item['core'] if 'core' in item else None)
            name=kind+'-'+item['id'];im.crop(rect).save(out/(name+'.png'));overlay.crop(rect).save(out/(name+'-collision.png'))
            item['image']=str(out/(name+'.png'));item['collisionImage']=str(out/(name+'-collision.png'))
    ledger_path=out/'review-ledger.json'
    ledger=json.loads(ledger_path.read_text()) if ledger_path.exists() else {'zones':{},'seams':{},'districts':{}}
    # Preserve previous entries; changed inputDigest makes them pending, not silently accepted.
    ledger_path.write_text(json.dumps(ledger,ensure_ascii=False,indent=2)+'\n')
    result=gate(plan,ledger,Path.cwd());plan['gate']=result
    (out/'review-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
    return plan

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('board');p.add_argument('assembled');p.add_argument('mask');p.add_argument('out');a=p.parse_args()
    r=build(a.board,a.assembled,a.mask,a.out);print(json.dumps({'tier':r['tier'],'zones':len(r['zones']),'seams':len(r['seams']),'districts':len(r['districts']),'gate':r['gate']['status']}))
