# 自动判朝向：头部区域(上 35%)肤色质心 相对 头部剪影中心 的偏移；<0 朝左
import glob,numpy as np
from PIL import Image
def face(c):
    a=np.array(c).astype(int);al=a[...,3]>0;ys,xs=np.nonzero(al)
    if len(ys)==0:return 0
    t=ys.min();H=ys.max()-t;hm=al.copy();hm[t+int(H*.35):]=0
    r,g,b=a[...,0],a[...,1],a[...,2];sk=hm&(r>150)&(r-b>30)&(g>90)&(r>g)
    hx=np.nonzero(hm)[1].mean();sx=np.nonzero(sk)[1]
    return 0 if len(sx)<3 else sx.mean()-hx
for f in sorted(glob.glob('assets/s_*.webp')):
    im=Image.open(f).convert('RGBA');W,H=im.size;ch=H//4;cols=8 if ('walk' in f or 'run' in f) else 4;cw=W//cols
    v=[face(im.crop((i*cw,r*ch,(i+1)*cw,(r+1)*ch))) for r in (1,2) for i in (0,)]
    print(f'{f:36s} L={v[0]:+6.1f} R={v[1]:+6.1f}',' SWAP?' if v[0]>v[1] else '')
