import json,os,sys
from PIL import Image
import numpy as np
root='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue'
d=json.load(open(root+'/docs/assets/production-assets.json'))
out=[]
for a in d['assets']:
    p=os.path.join(root,a['path'])
    r={'id':a['id'],'sys':a['system'],'path':a['path']}
    if not os.path.exists(p): r['missing']=True; out.append(r); continue
    if not p.endswith(('.png','.webp')): continue
    im=Image.open(p); r['size']=im.size; r['mode']=im.mode
    if a.get('size') and list(a['size'])!=list(im.size): r['size_mismatch']=a['size']
    if 'A' in im.getbands():
        al=np.array(im.convert('RGBA'))[:,:,3]
        h,w=al.shape
        r['amax']=int(al.max()); r['opaque_frac']=round(float((al>0).mean()),3)
        r['semi_frac']=round(float(((al>0)&(al<250)).mean()),3)
        # edge touch: count non-transparent px on each edge
        e={'top':int((al[0]>32).sum()),'bottom':int((al[-1]>32).sum()),'left':int((al[:,0]>32).sum()),'right':int((al[:,-1]>32).sum())}
        r['edge']=e
        r['edge_frac']={k:round(v/(w if k in('top','bottom') else h),3) for k,v in e.items()}
        ys,xs=np.where(al>32)
        if len(ys): r['bbox']=[int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())]
    out.append(r)
json.dump(out,open(sys.argv[1],'w'),ensure_ascii=False,indent=0)
