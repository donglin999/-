# 行走帧管线：assets/c_{k}_{dir}.webp(由export.py出) -> 像素化(44px高,量化,硬alpha,去白边) -> 4帧行走 -> x3 最近邻放大
import json,numpy as np
from PIL import Image
M=json.load(open('framemap.json'));LH=44;S=3
def pix(im):
    im=im.convert('RGBA');w,h=im.size;lw=max(1,round(w*LH/h))
    a=np.array(im).astype(float)
    # 去白边：半透明且近白的像素判透明
    rgb=a[...,:3];al=a[...,3];light=rgb.min(-1)>200
    al[(al<250)&light]=0;a[...,3]=al
    # 预乘后box缩小
    pm=a.copy();pm[...,:3]*=al[...,None]/255
    sm=np.array(Image.fromarray(pm.clip(0,255).astype('uint8')).resize((lw,LH),Image.BOX)).astype(float)
    sa=np.array(Image.fromarray(al.astype('uint8')).resize((lw,LH),Image.BOX)).astype(float)
    out=np.zeros((LH,lw,4),'uint8');m=sa>110
    out[...,:3][m]=(sm[...,:3][m]*255/np.maximum(sa[m],1)[:,None]).clip(0,255);out[...,3][m]=255
    q=Image.fromarray(out[...,:3]).quantize(24,method=Image.MEDIANCUT).convert('RGB')
    o=np.dstack([np.array(q),out[...,3]]);o[o[...,3]==0]=0
    return o
def shift(a,dy=0,dx=0,rows=None,cols=None,keep=False):
    b=np.zeros_like(a);src=a.copy();r0,r1=rows or (0,a.shape[0]);c0,c1=cols or (0,a.shape[1])
    reg=np.zeros_like(a);reg[r0:r1,c0:c1]=src[r0:r1,c0:c1];
    if not keep: src[r0:r1,c0:c1]=0
    reg=np.roll(np.roll(reg,dy,0),dx,1);m=reg[...,3]>0
    b[:]=src;b[m]=reg[m];return b
def walk(a,side):
    h,w=a.shape[:2];ys,xs=np.nonzero(a[...,3]);top,bot=ys.min(),ys.max()+1
    leg=bot-max(4,(bot-top)//4);cx=int(np.median(xs))
    f=[a]
    if not side:
        for L in (True,False):
            b=shift(a,-1,0,(0,leg),keep=True)                      # 身体起伏1px
            cols=(0,cx) if L else (cx,w)
            b=shift(b,-2,0,(leg,h),cols)                  # 抬脚
            f.append(b)
        f.insert(2,a)
    else:
        mid=(leg+bot)//2
        b=shift(a,0,-1,(mid,h),(0,cx));b=shift(b,0,1,(mid,h),(cx,w));f.append(b)   # 跨步
        f.append(shift(a,-1,0,(0,h)))                                                # 过渡：抬起
        b=shift(a,0,1,(mid,h),(0,cx));b=shift(b,0,-1,(mid,h),(cx,w));b=shift(b,-1,0,(0,leg),keep=True);f.append(b)  # 收腿
    return f
for k in M:
    for d in 'dlru':
        a=pix(Image.open(f'assets/c_{k}_{d}.webp'))
        a=np.pad(a,((2,0),(1,1),(0,0)))  # 顶部留2px给起伏
        fr=walk(a,d in 'lr')
        for i,x in enumerate(fr):
            im=Image.fromarray(x,'RGBA');im=im.resize((im.width*S,im.height*S),Image.NEAREST)
            im.save(f'assets/c_{k}_{d}_{i}.webp',lossless=True)
            if i==0: im.save(f'assets/c_{k}_{d}.webp',lossless=True)
print('ok')
