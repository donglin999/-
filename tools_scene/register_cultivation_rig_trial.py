#!/usr/bin/env python3
"""Register whole newly generated cells; never reposes limbs or edits originals.

One scale is shared by the entire clip. Cell translations compensate sheet
layout shifts. Frozen silhouettes stay unchanged. This is a diagnostic fit,
not anatomy or motion acceptance.
"""
import json
from pathlib import Path
import numpy as np
from PIL import Image

BASE=Path(__file__).resolve().parents[1]/'art_sources/cultivation_rig_trial_20261004'
N=128


def shift(a,dx,dy):
    result=np.zeros((N,N),dtype=bool)
    x0=max(0,dx);x1=min(N,N+dx);y0=max(0,dy);y1=min(N,N+dy)
    if x1>x0 and y1>y0:
        result[y0:y1,x0:x1]=a[y0-dy:y1-dy,x0-dx:x1-dx]
    return result


def scale_mask(mask,scale):
    width=round(N*scale)
    tiny=Image.fromarray(mask.astype('uint8')*255).resize((width,width),Image.Resampling.NEAREST)
    canvas=Image.new('L',(N,N));canvas.paste(tiny,((N-width)//2,(N-width)//2))
    return np.array(canvas)>127


def scores(a,b):
    overlap=np.count_nonzero(a&b)
    return overlap/max(1,np.count_nonzero(a|b)),overlap/max(1,b.sum()),np.count_nonzero(a&~b)/max(1,a.sum())


def main():
    manifest=json.loads((BASE/'manifest.json').read_text())
    output=[]
    for clip in manifest:
        directory=BASE/clip['id'];native=Image.open(directory/'candidate-native.png');guide=Image.open(directory/'mannequin-overlay.png');sources=[];targets=[]
        for i in range(6):
            box=((i%3)*512,(i//3)*512,(i%3+1)*512,(i//3+1)*512)
            sources.append(np.array(native.crop(box).getchannel('A').resize((N,N),Image.Resampling.NEAREST))>=128)
            targets.append(np.array(guide.crop(box).getchannel('A').resize((N,N),Image.Resampling.NEAREST))>=128)
        best=None
        for scale in np.arange(.82,1.021,.02):
            picked=[]
            for source,target in zip(sources,targets):
                mask=scale_mask(source,float(scale));fit=None
                for dy in range(-16,9,2):
                    for dx in range(-8,9,2):
                        moved=shift(mask,dx,dy);metrics=scores(moved,target)
                        if fit is None or metrics[0]>fit[0]:fit=(metrics[0],dx,dy,metrics)
                picked.append(fit)
            mean=sum(p[0] for p in picked)/6
            if best is None or mean>best[0]:best=(mean,float(scale),picked)
        average,scale,picks=best
        result={'id':clip['id'],'nativeAlphaUnchanged':True,'method':'whole-frame uniform scale plus translation against frozen silhouettes','commonScale':round(scale,3),'coordinateSystem':'source 512 square, scale about center (256,256), then translate','frames':[{'frame':i,'dx':p[1]*4,'dy':p[2]*4,'iou':round(p[3][0],4),'coverage':round(float(p[3][1]),4),'spill':round(float(p[3][2]),4)} for i,p in enumerate(picks)],'meanIoU':round(average,4),'notAnatomyAcceptance':True,'frozenPoseSha256':clip['qa']['frozenPoseSha256']}
        (directory/'registration.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
        clip['registration']=f"{clip['id']}/registration.json"
        output.append({'id':clip['id'],'scale':result['commonScale'],'offsets':[[p['dx'],p['dy']] for p in result['frames']],'meanIoU':result['meanIoU']})
    (BASE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    print(json.dumps(output))


if __name__=='__main__':main()
