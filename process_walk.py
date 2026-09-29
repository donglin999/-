# 行走帧管线 r2：assets/c_{k}_{dir}.webp(export.py 出的原图) -> 像素化(44px,量化,硬alpha) -> 统一描边/饱和度 -> 分物种步态4帧 -> x3 最近邻
# 帧约定：0 站立，1 迈步A，2 过渡(身体上浮)，3 迈步B；引擎播放 1,2,3,2
# 注意：会覆盖 c_{k}_{d}.webp 为像素化站立帧，重跑前先 python3 export.py
import json,numpy as np,colorsys
from PIL import Image
M=json.load(open('framemap.json'));LH=44;S=3
SAT={'dog':0.55,'snake':0.6,'rooster':0.75,'lady':0.9,'child':0.9}   # 过艳角色压饱和
QUAD={'dog','wolf'};BIRD={'rooster'};SNAKE={'snake'}
def pix(im,k):
    im=im.convert('RGBA');w,h=im.size;lw=max(1,round(w*LH/h))
    a=np.array(im).astype(float);rgb=a[...,:3];al=a[...,3]
    al[(al<250)&(rgb.min(-1)>200)]=0;a[...,3]=al
    pm=a.copy();pm[...,:3]*=al[...,None]/255
    sm=np.array(Image.fromarray(pm.clip(0,255).astype('uint8')).resize((lw,LH),Image.BOX)).astype(float)
    sa=np.array(Image.fromarray(al.astype('uint8')).resize((lw,LH),Image.BOX)).astype(float)
    out=np.zeros((LH,lw,4),'uint8');m=sa>110
    c=(sm[...,:3][m]*255/np.maximum(sa[m],1)[:,None]).clip(0,255)
    # 饱和度统一：全体 x0.88，艳色角色额外压
    f=0.88*SAT.get(k,1.0);g=c.mean(1,keepdims=True);c=g+(c-g)*f
    out[...,:3][m]=c.clip(0,255);out[...,3][m]=255
    q=Image.fromarray(out[...,:3]).quantize(24,method=Image.MEDIANCUT).convert('RGB')
    o=np.dstack([np.array(q),out[...,3]]);o[o[...,3]==0]=0
    return outline(o)
def outline(o):
    # 统一描边：轮廓像素压暗成深色描边（原作深色外轮廓）
    A=o[...,3]>0;p=np.pad(A,1)
    edge=A&~(p[:-2,1:-1]&p[2:,1:-1]&p[1:-1,:-2]&p[1:-1,2:])
    c=o[...,:3].astype(float);lum=c.mean(-1)
    t=edge&(lum>55);c[t]=c[t]*0.38+np.array([18,12,10])
    o[...,:3]=c.clip(0,255);return o
def roll(r,dy,dx):
    o=np.zeros_like(r);h,w=r.shape[:2]
    ys=slice(max(dy,0),h+min(dy,0));yd=slice(max(-dy,0),h+min(-dy,0))
    xs=slice(max(dx,0),w+min(dx,0));xd=slice(max(-dx,0),w+min(-dx,0))
    o[ys,xs]=r[yd,xd];return o
def shift(a,dy=0,dx=0,rows=None,cols=None,keep=True):
    src=a.copy();r0,r1=rows or (0,a.shape[0]);c0,c1=cols or (0,a.shape[1])
    reg=np.zeros_like(a);reg[r0:r1,c0:c1]=src[r0:r1,c0:c1]
    if not keep: src[r0:r1,c0:c1]=0
    reg=roll(reg,dy,dx);m=reg[...,3]>0
    src[m]=reg[m];return src
def box(a):
    ys,xs=np.nonzero(a[...,3]);return ys.min(),ys.max()+1,xs.min(),xs.max()+1,int(np.median(xs))
def arms(a,top,bot):
    # 手臂带：躯干中段(38%~66%)每行轮廓最外侧 3 列
    h=bot-top;r0,r1=top+int(h*.38),top+int(h*.66);L=np.zeros(a.shape[:2],bool);R=L.copy()
    for y in range(r0,r1):
        xs=np.nonzero(a[y,:,3])[0]
        if len(xs)>6:L[y,xs[0]:xs[0]+3]=True;R[y,xs[-1]-2:xs[-1]+1]=True
    return L,R
def mshift(a,mask,dy,dx=0):
    reg=np.where(mask[...,None],a,0);reg=roll(reg,dy,dx);b=a.copy();m=reg[...,3]>0;b[m]=reg[m];return b
def human(a,side,d):
    top,bot,x0,x1,cx=box(a);leg=bot-max(5,(bot-top)*27//100);h=a.shape[0];w=a.shape[1]
    AL,AR=arms(a,top,bot)
    if not side:
        def step(L):
            b=a.copy()
            fw,bk=((0,cx),(cx,w)) if L else ((cx,w),(0,cx))
            b=shift(b,-2,0,(leg,h),bk,keep=False);b=shift(b,0,0,(leg,h),bk)   # 后脚抬起(脚底收短)
            b=shift(b,1 if d=='d' else -1,0,(leg,h),fw)                       # 前脚迈出
            b=mshift(b,AR if L else AL,1 if d=='d' else -1)                     # 异侧手前摆
            b=mshift(b,AL if L else AR,-1 if d=='d' else 1)
            return b
        return [a,step(True),shift(shift(a,-1,0,(0,leg)),0,0),step(False)]
    else:
        mid=(leg+bot)//2;fwd=1 if d=='r' else -1
        # 侧面：腿分前后两半，迈步时前后分开 2px；手臂带(中段靠前后缘)反向摆
        top_,bot_=top,bot;band=np.zeros(a.shape[:2],bool);hh=bot-top
        band[top+int(hh*.42):top+int(hh*.62),:]=True
        def stride(s):
            b=shift(a,0,-fwd*s,(mid,h),(0,cx) if fwd>0 else (cx,w))
            b=shift(b,0,fwd*s,(mid,h),(cx,w) if fwd>0 else (0,cx))
            b=shift(b,0,0,(leg,mid))
            m=band&(a[...,3]>0);m[:, :cx-2]&=True
            return mshift(b,m&(np.arange(w)[None,:]*fwd>(cx+1)*fwd),0,-fwd) if s>0 else b
        f1=stride(2);f3=mshift(stride(1),band&(a[...,3]>0)&(np.arange(w)[None,:]*fwd>(cx+1)*fwd),0,fwd)
        f2=shift(a,-1,0,(0,leg))
        return [a,f1,f2,f3]
def quad(a,side,d):
    top,bot,x0,x1,cx=box(a);h,w=a.shape[:2];leg=bot-max(4,(bot-top)*28//100)
    if side:
        q=[x0+(x1-x0)*i//4 for i in range(5)]
        def trot(p):
            b=a.copy()
            for i in range(4):
                up=(i%2==p)          # 对角线两条腿同时抬
                b=shift(b,-1 if up else 0,(1 if up else -1)*(1 if d=='r' else -1),(leg,h),(q[i],q[i+1]))
                b=shift(b,0,0,(leg,h),(q[i],q[i+1])) if not up else b
            return shift(b,-1,0,(0,leg)) if p==0 else b
        f2=shift(a,-1,0,(0,leg))
        return [a,trot(0),f2,trot(1)]
    hd=top+(bot-top)*35//100
    def st(L):
        cols=(0,cx) if L else (cx,w);b=shift(a,-2,0,(leg,h),cols,keep=False);b=shift(b,0,0,(leg+1,h),cols)
        return shift(b,1,0,(0,hd)) if d=='d' else b   # 低头嗅
    return [a,st(True),shift(a,-1,0,(0,leg)),st(False)]
def bird(a,side,d):
    top,bot,x0,x1,cx=box(a);h,w=a.shape[:2];hd=top+(bot-top)*40//100;fwd=1 if d=='r' else -1
    crouch=shift(shift(a,1,0,(0,bot-4)),0,0,(bot-4,h))
    peck=shift(crouch,1,2*fwd if side else 0,(0,hd)) if d!='u' else crouch
    hop=roll(a,-2,0)
    return [a,crouch,hop,peck]
def snake(a,side,d):
    top,bot,x0,x1,cx=box(a);h,w=a.shape[:2]
    def wave(ph,amp):
        b=np.zeros_like(a)
        for y in range(h):
            t=(y-top)/(max(1,bot-top));s=int(round(amp*np.sin(ph+t*6.28)*(0.3+0.7*t)))
            b[y]=np.roll(a[y],s,0)
        return b
    return [a,wave(0,1.6),wave(1.57,1.6),wave(3.14,1.6)]
for k in M:
    for d in 'dlru':
        a=pix(Image.open(f'assets/c_{k}_{d}.webp'),k)
        a=np.pad(a,((3,0),(2,2),(0,0)))
        side=d in 'lr'
        fn=quad if k in QUAD else bird if k in BIRD else snake if k in SNAKE else human
        fr=fn(a,side,d)
        for i,x in enumerate(fr):
            im=Image.fromarray(np.ascontiguousarray(x),'RGBA');im=im.resize((im.width*S,im.height*S),Image.NEAREST)
            im.save(f'assets/c_{k}_{d}_{i}.webp',lossless=True)
            if i==0: im.save(f'assets/c_{k}_{d}.webp',lossless=True)
print('ok')
