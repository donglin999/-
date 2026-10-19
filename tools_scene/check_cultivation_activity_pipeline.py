#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Native alpha and frozen joint overlay QA; never changes original art pixels."""
import json,hashlib,math,shutil
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'art_sources/cultivation_activity_pipeline_20261004'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 manifest=json.loads((BASE/'manifest.json').read_text());summary=[]
 for clip in manifest:
  directory=BASE/clip['id'];source=directory/clip.get('selectedNative','native.png');im=Image.open(source);poses=json.loads((directory/'poses.json').read_text())
  assert sha(directory/'poses.json')==clip['qa']['frozenPoseSha256'];assert sha(directory/'mannequin-six.png')==clip['qa']['guideSha256']
  assert im.mode=='RGBA' and im.width%3==0 and im.height%2==0 and im.width//3==im.height//2,(clip['id'],im.size,im.mode)
  cell=im.width//3;cells=[];bounds=[]
  for i in range(6):
   c=im.crop((i%3*cell,i//3*cell,(i%3+1)*cell,(i//3+1)*cell));cells.append(c);mask=np.array(c.getchannel('A'))>=128;ys,xs=np.where(mask);assert len(xs)>1000
   bounds.append([int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)])
  unit=512/cell;heights=[(b[3]-b[1])*unit for b in bounds];scale=min(1.15,385/float(np.median(heights)))
  offsets=[];registered=[];union=[];checks=[];overlay=Image.new('RGBA',(1536,1024),'#eadbb8')
  for i,(c,b,p) in enumerate(zip(cells,bounds,poses['keys'])):
   # One common camera scale; only whole-cell translations compensate layout drift.
   native=np.array(c.getchannel('A'))>=128
   hy,hx=np.where(native & (np.indices(native.shape)[0]<b[1]+(b[3]-b[1])*.43))
   headx=(hx.min()+hx.max()+1)/2
   # Anchor the stable head and supporting left shoe, not moving prop extremes.
   support=native & (np.indices(native.shape)[1]<headx-15/unit) & (np.indices(native.shape)[1]>headx-150/unit)
   sy,sx=np.where(support)
   dx=256-headx*unit;dy=438-(int(sy.max())+1)*unit
   ox=dx*scale;oy=dy*scale+(438-256)*(1-scale)
   offsets.append({'dx':round(ox,3),'dy':round(oy,3)})
   fitted=Image.new('RGBA',(512,512));sized=c.resize((round(512*scale),round(512*scale)),Image.Resampling.LANCZOS)
   fitted.alpha_composite(sized,(round((512-sized.width)/2+ox),round((512-sized.height)/2+oy)))
   a=np.array(fitted.getchannel('A'));mask=a>=128;ys,xs=np.where(mask);ub=[int(xs.min()),int(ys.min()),int(xs.max()+1),int(ys.max()+1)];union.append(ub)
   errors=[]
   for arm in p['arms']:
    for joint in ('shoulder','elbow','wrist'):
     x,y=arm[joint];distance=float(np.min((xs-x)**2+(ys-y)**2)**.5);errors.append({'joint':joint,'x':round(x,1),'y':round(y,1),'distanceToAlpha':round(distance,1)})
   checks.append({'frame':i,'bounds':b,'edgeClearance':min(b[0],b[1],cell-b[2],cell-b[3]),'jointSilhouetteDistances':errors})
   overlay.alpha_composite(fitted,((i%3)*512,(i//3)*512));d=ImageDraw.Draw(overlay);ox2=(i%3)*512;oy2=(i//3)*512
   for arm in p['arms']:
    d.line([(ox2+arm[j][0],oy2+arm[j][1]) for j in ('shoulder','elbow','wrist')],fill='#1a91bdbb',width=3)
    for j in ('shoulder','elbow','wrist'):
     x,y=arm[j];d.ellipse([ox2+x-4,oy2+y-4,ox2+x+4,oy2+y+4],fill='#006f99')
  overlay.save(directory/'joint-overlay.png')
  bx=min(b[0] for b in union)-3;by=min(b[1] for b in union)-3;bx2=max(b[2] for b in union)+3;by2=max(b[3] for b in union)+3
  unique=len(set(hashlib.sha256(c.tobytes()).hexdigest() for c in cells));transparent=np.array(im.getchannel('A'));zero=float((transparent==0).mean())
  report={'id':clip['id'],'nativeSha256':sha(source),'nativeAlphaPreserved':True,'dimensions':im.size,'cell':cell,'uniqueFrames':unique,'transparentRatio':zero,'frozenPoseSha256':clip['qa']['frozenPoseSha256'],'registration':{'commonScale':round(scale,6),'frames':offsets},'presentation':{'bounds':[bx,by,bx2-bx,by2-by]},'frames':checks,'maximumJointDistance':max(j['distanceToAlpha'] for f in checks for j in f['jointSilhouetteDistances']),'technicalPass':unique==6 and zero>.1 and min(f['edgeClearance'] for f in checks)>=3,'visualAcceptance':'requires-review'}
  review_path=directory/'pose-review.json'
  if review_path.exists():
   review=json.loads(review_path.read_text())
   if review['nativeSha256']==report['nativeSha256'] and review['frozenPoseSha256']==clip['qa']['frozenPoseSha256']:
    report['visualAcceptance']='accepted' if review['poseAcceptance'] else 'rejected'
   else: clip['visualAcceptance']=False;clip['poseAcceptance']=False
  (directory/'art-qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));clip.update({'status':'pose-reviewed' if report['visualAcceptance']=='accepted' else 'rejected-pose' if report['visualAcceptance']=='rejected' else 'generated','sourceSha256':report['nativeSha256'],'artQa':f"{clip['id']}/art-qa.json"});summary.append({k:report[k] for k in ('id','dimensions','uniqueFrames','transparentRatio','technicalPass','maximumJointDistance','visualAcceptance')})
 (BASE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));(BASE/'qa-summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary))
if __name__=='__main__':main()
