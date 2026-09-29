# 侧面(行1 l / 行2 r)行走帧 1..3 重新推导：自站立帧(列0)在 1x 像素格上拆出双腿
# 腿罩：脚区(剪影底部 ~14%)的连通块中宽度>=3 的块(排除长矛/拐杖等细杆)；远腿压暗 0.7，近腿原色
# 帧1 近腿前迈/远腿后蹬，帧2 过渡(后脚抬起+身体上浮1px)，帧3 反向
import sys,numpy as np
from PIL import Image
from scipy import ndimage
S=3
def outline(o):
    A=o[...,3]>0;p=np.pad(A,1);e=A&~(p[:-2,1:-1]&p[2:,1:-1]&p[1:-1,:-2]&p[1:-1,2:])
    c=o[...,:3].astype(float);t=e&(c.mean(-1)>80);c[t]=c[t]*0.4+np.array([16,11,9]);o[...,:3]=c.clip(0,255);return o
def put(dst,src,mask,dy,dx,dark=1.0):
    ys,xs=np.nonzero(mask&(src[...,3]>0));ty,tx=ys+dy,xs+dx;h,w=dst.shape[:2];k=(ty>=0)&(ty<h)&(tx>=0)&(tx<w)
    px=src[ys[k],xs[k]].copy()
    if dark!=1:px[:,:3]=(px[:,:3]*dark).astype('uint8')
    dst[ty[k],tx[k]]=px
def frames(a,fd):
    h,w=a.shape[:2];al=a[...,3]>0;ys,xs=np.nonzero(al);t,b=ys.min(),ys.max()+1;H=b-t
    band=max(4,round(H*.14));f0=b-band
    Y=np.arange(h)[:,None]*np.ones((1,w),int)
    foot=al&(Y>=f0)
    tr_=al[t+int(H*.45):f0];cols=np.nonzero(tr_.sum(0)>=tr_.shape[0]*.6)[0]
    # 躯干跨度：中段被覆盖>=60%行的列(细杆只占极少列但可能入选，故再取最长连续段)
    runs=np.split(cols,np.nonzero(np.diff(cols)>1)[0]+1);rr=max(runs,key=len);tl,tr=rr[0]-1,rr[-1]+1
    lab,n=ndimage.label(foot);leg=np.zeros_like(foot)
    for i in range(1,n+1):
        m=lab==i;cx=np.nonzero(m.any(0))[0]
        if len(cx)>=3 and tl<=cx.mean()<=tr:leg|=m
    if not leg.any():leg=foot
    lx=np.nonzero(leg.any(0))[0];x0,x1=lx.min(),lx.max()+1
    # 单腿剪影：取腿区中较宽的一半左右对称作一只“腿”，直接用整块作近腿，复制作远腿
    body=al&~leg
    out=[]
    for f,(s,lift,bob) in enumerate([(2,0,0),(0,2,-1),(-2,0,0)]):
        o=np.zeros_like(a)
        far=np.zeros_like(a);put(far,a,leg,-(lift if s<=0 else 0),-fd*s,0.68)
        near=np.zeros_like(a);put(near,a,leg,-(lift if s>=0 else 0) if s!=0 else 0,fd*s)
        if s==0:  # 过渡：远腿抬起在后
            far=np.zeros_like(a);put(far,a,leg,-lift,-fd,0.68)
        for p in (far,near):m=p[...,3]>0;o[m]=p[m]
        bb=np.zeros_like(a);put(bb,a,body,bob,0);m=bb[...,3]>0;o[m]=bb[m]
        if bob:  # 上浮后补腿顶一行
            put(o,a,leg&(Y==f0),bob,0)
        out.append(outline(o))
    return out
def fix(path):
    im=np.array(Image.open(path).convert('RGBA'));ch,cw=im.shape[0]//4,im.shape[1]//4
    for r,fd in ((1,-1),(2,1)):
        a=im[r*ch:(r+1)*ch,0:cw][1::S,1::S]
        for i,fr in enumerate(frames(a,fd)):
            im[r*ch:(r+1)*ch,(i+1)*cw:(i+2)*cw]=np.repeat(np.repeat(fr,S,0),S,1)[:ch,:cw]
    Image.fromarray(im).save(path,lossless=True);print('fixed',path)
if __name__=='__main__':
    for p in sys.argv[1:]:fix(p)
