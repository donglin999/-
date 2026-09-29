# 主角行走 8 帧手工像素步态（1x 像素格上重组，再 x3 最近邻）
# 源：s_hero(_bright).webp 站立帧(列0)；输出 assets/s_hero_walk{,_bright}.webp
# 布局：4 行(d,l,r,u) x 8 列，单元 99x141（=33x47 像素 x3，比 s_hero 左右各多 2 像素留给步幅），脚底基线与 s_hero 相同
# 帧序 0..7 循环：0 接触(A脚前) 1 下沉 2 过渡(A脚抬) 3 腾起 4 接触(B脚前) 5 下沉 6 过渡 7 腾起
import numpy as np
from PIL import Image
S=3;F=8
BOB=[0,1,0,-1,0,1,0,-1]
BOBF=[2,1,0,-1,2,1,0,-1]   # 正背面：接触帧下沉 2px          # 身体上下（+ 向下）
STR=[3,2,0,-2,-3,-2,0,2]         # 步幅：>0 A 脚在前
LIFT=[(0,0),(0,0),(3,0),(1,0),(0,0),(0,0),(0,3),(0,1)]  # (A脚抬高, B脚抬高)
def base(path,row):
    im=np.array(Image.open(path).convert('RGBA'));cw,ch=im.shape[1]//4,im.shape[0]//4
    c=im[row*ch:(row+1)*ch,0:cw][1::S,1::S];o=np.zeros((c.shape[0],c.shape[1]+4,4),'uint8');o[:,2:-2]=c;return o
def put(dst,src,dy,dx,mask):
    m=mask&(src[...,3]>0);ys,xs=np.nonzero(m);ty,tx=ys+dy,xs+dx;h,w=dst.shape[:2]
    k=(ty>=0)&(ty<h)&(tx>=0)&(tx<w);dst[ty[k],tx[k]]=src[ys[k],xs[k]]
def outline(o):
    A=o[...,3]>0;p=np.pad(A,1);edge=A&~(p[:-2,1:-1]&p[2:,1:-1]&p[1:-1,:-2]&p[1:-1,2:])
    c=o[...,:3].astype(float);t=edge&(c.mean(-1)>80);c[t]=c[t]*0.4+np.array([16,11,9]);o[...,:3]=c.clip(0,255);return o
def skin(px): r,g,b=px[...,0].astype(int),px[...,1].astype(int),px[...,2].astype(int);return (r>200)&(g>150)&(g<225)&(b<190)&(r-b>45)
def frame(a,side,fd,f):
    h,w=a.shape[:2];ys,xs=np.nonzero(a[...,3]);t,b=ys.min(),ys.max()+1;H=b-t
    foot=b-4                      # 脚/裤脚 4 行
    hem=b-11                      # 下摆起始
    Y=np.arange(h)[:,None]*np.ones((1,w),int);X=np.ones((h,1),int)*np.arange(w)[None,:]
    bob=BOB[f];s=STR[f];la,lb=LIFT[f]
    body=np.zeros_like(a)
    # 上身（含头、剑）
    upper=Y<hem
    put(body,a,bob,0,upper)
    # 头部前倾 / 发髻滞后（侧面）
    if side:
        head=Y<t+int(H*.33)
        hb=np.zeros_like(a);put(hb,a,bob,fd if abs(s)==3 else 0,head)
        if bob<0: # 腾起时发髻上缘向后飘 1px
            tuft=Y<t+3;put(hb,a,bob+1,-fd,tuft)
        hm=Y<t+int(H*.33)+bob;body[hm]=0;m=hb[...,3]>0;body[m]=hb[m]
    # 下摆：前后缘随步幅张开
    hemm=(Y>=hem)&(Y<foot)
    ys2,xs2=np.nonzero(a[...,3]&hemm);cx=int(np.median(xs2))
    if side:
        # 下摆按行剪切：越往下越张
        for y in range(hem,foot):
            k=(y-hem+1)/(foot-hem);d=int(round(k*abs(s)/2))
            rowm=(Y==y)
            put(body,a,bob,-d*fd if s!=0 else 0,rowm&(X<cx))
            put(body,a,bob,d*fd if s!=0 else 0,rowm&(X>=cx))
            # 填中缝
            if d>0:
                put(body,a,bob,0,rowm&(X>=cx-1)&(X<=cx))
    else:
        # 正/背面：下摆整体上提 2px 并左右摆 2px，露出腿
        bob=BOBF[f];sw=2 if s>=2 else (-2 if s<=-2 else 0)
        body=np.zeros_like(a);put(body,a,bob,0,upper)
        put(body,a,bob-2 if abs(s)>=2 else bob-1,sw,hemm)
    # 手：肤色像素摆动（侧面前后，正背面上下）
    arm=(Y>=t+int(H*.5))&(Y<hem+2)&skin(a[...,:3])
    if arm.any():
        body[np.roll(arm,bob,0)]=0 if False else body[np.roll(arm,bob,0)]
        hand=np.zeros_like(a)
        if side: put(hand,a,bob,-int(np.sign(s))*fd*(2 if abs(s)==3 else 1 if s else 0),arm)
        else:
            L=arm&(X<cx);R=arm&(X>=cx);sg=int(np.sign(s))
            sg*=2 if abs(s)>=2 else 1;put(hand,a,bob-sg,0,L);put(hand,a,bob+sg,0,R)
        m=hand[...,3]>0;body[m]=hand[m]
    # 脚：原脚区左右两半各当一只脚，重新摆位
    fm=(Y>=foot)
    fys,fxs=np.nonzero(a[...,3]&fm);fc=int(np.median(fxs))
    A=fm&(X<fc);B=fm&(X>=fc)
    feet=np.zeros_like(a)
    if side:
        # 侧面：A=远脚(压暗)，B=近脚；以脚区中心为原点前后错开
        sa=np.zeros_like(a);put(sa,a,0,0,fm);  # 整只脚剪影
        def one(dx,lift,dark):
            tmp=np.zeros_like(a);put(tmp,sa,-lift,dx,fm)
            if dark: tmp[...,:3]=(tmp[...,:3]*0.7).astype('uint8')
            return tmp
        far=one(-fd*s//1,la,True) if True else None
        near=one(fd*s,lb,False)
        far=one(-fd*s,la,True)
        for p in (far,near):m=p[...,3]>0;feet[m]=p[m]
        # 裤腿：从下摆到抬起的脚之间补 1 行
    else:
        # 前脚向下(朝镜头) 0~+1、后脚上收 3~4px；两脚之间画裤腿竖条连到下摆
        fwd=abs(s)>=2
        dA=(1 if s>0 else -4 if s<0 else 0) if fwd else -la
        dB=(1 if s<0 else -4 if s>0 else 0) if fwd else -lb
        if not fwd: dA,dB=-la-1 if la else 0,-lb-1 if lb else 0
        fr=a[foot:b][a[foot:b][...,3]>0];pc=np.median(fr[:,:3],0)*0.75
        for m_,d_ in ((A,dA),(B,dB)):
            fx=np.nonzero(m_.any(0)&a[...,3][foot:b].any(0))[0]
            if len(fx):
                c0=int(np.median(fx))
                for y in range(hem+4+bob,foot+d_+bob+1):
                    for x in (c0-1,c0):
                        if 0<=y<h: feet[y,x,:3]=pc;feet[y,x,3]=255
            put(feet,a,d_+max(bob,0),0,m_)
    m=feet[...,3]>0;out=feet.copy();mb=body[...,3]>0;out[mb]=body[mb]
    return outline(out)
def run(src,dst):
    rows=[]
    for side,fd in [(0,0),(1,-1),(1,1),(0,0)]:
        rows.append(None)
    sh=None
    for r,(side,fd) in enumerate([(0,0),(1,-1),(1,1),(0,0)]):
        a=base(src,r);h,w=a.shape[:2]
        if sh is None: sh=np.zeros((4*h,F*w,4),'uint8')
        for f in range(F): sh[r*h:(r+1)*h,f*w:(f+1)*w]=frame(a,side,fd,f)
    Image.fromarray(sh).resize((sh.shape[1]*S,sh.shape[0]*S),Image.NEAREST).save(dst,lossless=True);print(dst,w*S,h*S)
import sys
c=sys.argv[1] if len(sys.argv)>1 else 'hero'
run(f'assets/review/s_{c}.webp',f'assets/s_{c}_walk.webp')
run(f'assets/s_{c}_bright.webp',f'assets/s_{c}_walk_bright.webp')
