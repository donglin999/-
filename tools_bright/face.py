# 五官补点：44px 像素化抹掉了正面/侧面的眼睛。1x 像素格上在肤色脸部区域补 2 眼(深色)+眉+嘴/腮红
# 用法：face.py <src.webp> <dst.webp> [cols=4]  （表：4 行 d,l,r,u；d 行补双眼，l/r 行补单眼于脸前侧；u 行不动）
import sys,numpy as np
from PIL import Image
S=3;ANIMAL={'dog','rooster','snake','wolf'}
def skin(c):
    r,g,b=[c[...,i].astype(int) for i in range(3)];return (c[...,3]>0)&(r>150)&(r-b>35)&(g>95)&(r>=g)
def face(a,mode):
    h,w=a.shape[:2];ys,xs=np.nonzero(a[...,3])
    if not len(ys):return a
    t=ys.min();H=ys.max()-t;sk=skin(a);sk[t+int(H*.4):]=False
    fy,fx=np.nonzero(sk)
    if len(fy)<8:  # 白皙肤色回退判据(苏芷等)
        r,g_,b=[a[...,i].astype(int) for i in range(3)];sk=(a[...,3]>0)&(r>165)&(r-b>12)&(r>=g_-4);sk[t+int(H*.4):]=False;fy,fx=np.nonzero(sk)
    if len(fy)<8:return a
    y0,y1,x0,x1=fy.min(),fy.max(),fx.min(),fx.max();fh=y1-y0+1
    eye=np.array([34,22,20,255],'uint8');brow=np.array([70,45,35,255],'uint8');mouth=np.array([170,90,80,255],'uint8')
    ey=y0+max(1,int(fh*.42))
    def setp(y,x,c):
        if 0<=y<h and 0<=x<w and a[y,x,3]>0 and a[y,x,:3].mean()>110:a[y,x]=c
    if mode=='d':
        rx=np.nonzero(sk[ey])[0]
        if len(rx):x0,x1=rx.min(),rx.max()
        cx=(x0+x1)/2;dx=max(2,int(round((x1-x0+1)*.22)))
        for ex in (int(round(cx-dx)),int(round(cx+dx))-(1 if (x1-x0)%2==0 else 0)):
            setp(ey,ex,eye);setp(ey+1,ex,eye);setp(ey-2,ex,brow)
        setp(ey+min(4,fh-ey+y0-1),int(round(cx)),mouth)
    else:
        hy,hx=np.nonzero((a[...,3]>0)&~sk);k=(hy>=y0)&(hy<=y1);fd=1 if fx.mean()>hx[k].mean() else -1  # 脸朝离发髻远的一侧
        rx=np.nonzero(sk[ey])[0]
        if not len(rx):return a
        ex=(rx.min()+1) if fd<0 else (rx.max()-1)
        setp(ey,ex,eye);setp(ey+1,ex,eye);setp(ey-2,ex,brow)
    return a
def fix(src,dst,cols=4,animal=False):
    im=np.array(Image.open(src).convert('RGBA'));H,W=im.shape[:2];ch,cw=H//4,W//cols
    if not animal:
        for r,m in ((0,'d'),(1,'l'),(2,'r')):
            for c in range(cols):
                cell=im[r*ch:(r+1)*ch,c*cw:(c+1)*cw];b=cell[1::S,1::S].copy();b=face(b,m)
                im[r*ch:(r+1)*ch,c*cw:(c+1)*cw]=np.repeat(np.repeat(b,S,0),S,1)[:ch,:cw]
    Image.fromarray(im).save(dst,lossless=True)
if __name__=='__main__':
    import os
    k=os.path.basename(sys.argv[1])[2:].split('.')[0].replace('_bright','').replace('_walk','')
    fix(sys.argv[1],sys.argv[2],int(sys.argv[3]) if len(sys.argv)>3 else 4,k in ANIMAL)
