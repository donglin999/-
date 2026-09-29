# 奔跑 8 帧（与行走明显不同）：步幅 ±5、抬脚 4、前倾(上身按行剪切 最多 3px)、腾空帧整体上浮 2~3px、手臂前后摆幅加大、发髻/下摆向后拖
# 复用 walk.py 的逐帧拼装(frame)，覆盖步态参数；输入站立帧=s_{c}(_bright).webp 列0；输出 s_{c}_run(_bright).webp 4 行(d,l,r,u)×8，单元 (w+10px)*3 × 141
import sys,numpy as np
from PIL import Image
src=open(__file__.replace('run.py','walk.py')).read().split('\nrun(')[0]
G={};exec(src,G)
G['BOB']=[1,2,0,-2,1,2,0,-2];G['BOBF']=[2,3,0,-2,2,3,0,-2]
G['STR']=[5,3,0,-3,-5,-3,0,3];G['LIFT']=[(0,0),(0,0),(4,0),(2,0),(0,0),(0,0),(0,4),(0,2)]
S=3;F=8;PAD=5
def base(path,row):
    im=np.array(Image.open(path).convert('RGBA'));cw,ch=im.shape[1]//4,im.shape[0]//4
    c=im[row*ch:(row+1)*ch,0:cw][1::S,1::S];o=np.zeros((c.shape[0],c.shape[1]+2*PAD,4),'uint8');o[:,PAD:-PAD]=c;return o
def lean(o,fd,air):
    ys,xs=np.nonzero(o[...,3]);t,b=ys.min(),ys.max()+1;H=b-t;hem=b-11;n=o.copy();n[:hem]=0
    for y in range(t,hem):
        d=int(round(3*(hem-y)/(hem-t)))*fd
        r=np.roll(o[y],d,0);n[y]=r
    # 发尾/后衣摆拖曳：最后侧 1 列轮廓再向后复制一格
    if air:
        for y in range(t,t+H//3):
            xs=np.nonzero(n[y,:,3])[0]
            if len(xs):
                x=xs[0] if fd>0 else xs[-1];nx=x-fd
                if 0<=nx<n.shape[1]:n[y,nx]=n[y,x]
    return n
def run(src,dst):
    sh=None
    for r,(side,fd) in enumerate([(0,0),(1,-1),(1,1),(0,0)]):
        a=base(src,r);h,w=a.shape[:2]
        if sh is None:sh=np.zeros((4*h,F*w,4),'uint8')
        for f in range(F):
            fr=G['frame'](a,side,fd,f)
            if side:fr=lean(fr,fd,f in (3,7,2,6))
            elif r==0:  # 正面：上身略前压 1px(下沉) 已含于 BOBF
                pass
            sh[r*h:(r+1)*h,f*w:(f+1)*w]=fr
    Image.fromarray(sh).resize((sh.shape[1]*S,sh.shape[0]*S),Image.NEAREST).save(dst,lossless=True);print(dst,w*S,h*S)
if __name__=='__main__':
    c=sys.argv[1] if len(sys.argv)>1 else 'hero'
    run(f'assets/s_{c}.webp',f'assets/s_{c}_run.webp');run(f'assets/s_{c}_bright.webp',f'assets/s_{c}_run_bright.webp')
