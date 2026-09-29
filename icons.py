# 道具/武学图标：raw_icons/sheet1.png(HY出图,白底网格) -> 裁切去白底 -> 32px 像素化+描边 -> x3=96px -> assets/i_icons.webp 图集 + js/art.js ART.icons
import numpy as np,json,re
from PIL import Image
src=Image.open('raw_icons/sheet1.png').convert('RGB');A=np.array(src).astype(int)
X=[47,275,499,747,978];Y=[43,275,497,720,995]
names=[['bun','pill','wine','shovel'],['book','gall','token','wood'],['iron','rusty','cloth','vest'],['k_quan','k_zhang','k_bian','k_tui']]
boxes={}
for r,row in enumerate(names):
    for c,n in enumerate(row): boxes[n]=(X[c]+6,Y[r]+6,X[c+1]-6,Y[r+1]-6)
boxes['k_zhang']=(X[1]+6,Y[3]+6,X[2]-6,850);boxes['k_bian']=(X[2]+6,Y[3]+6,X[3]-6,850)
boxes['token']=(505,281,690,491);boxes['wood']=(690,281,972,491)
boxes['k_nei']=(420,835,560,985)
def keepbig(fg):
    # 连通域：保留 >=8% 最大块的块（去掉串格残片/杂点），4 邻接 + 3px 膨胀
    from collections import deque
    d=fg.copy()
    for _ in range(3):d=d|np.roll(d,1,0)|np.roll(d,-1,0)|np.roll(d,1,1)|np.roll(d,-1,1)
    lb=np.zeros(d.shape,int);n=0;sizes=[]
    for y,x in zip(*np.nonzero(d)):
        if lb[y,x]:continue
        n+=1;q=deque([(y,x)]);lb[y,x]=n;cnt=0
        while q:
            a,b=q.popleft();cnt+=fg[a,b]
            for u,v in((a+1,b),(a-1,b),(a,b+1),(a,b-1)):
                if 0<=u<d.shape[0] and 0<=v<d.shape[1] and d[u,v] and not lb[u,v]:lb[u,v]=n;q.append((u,v))
        sizes.append(cnt)
    sizes=np.array(sizes);ok=1+np.nonzero(sizes>=sizes.max()*0.08)[0];return fg&np.isin(lb,ok)
A2=np.array(Image.open('raw_icons/sheet2.png').convert('RGB')).astype(int)   # 第二批：重做 gall/k_jian/k_nei
boxes['gall']=(90,180,400,560,A2);boxes['k_jian']=(560,150,760,580,A2);boxes['k_nei']=(860,160,1210,560,A2)
N=32;S=3;out={}
for n,b in boxes.items():
    x0,y0,x1,y1=b[:4];c=(b[4] if len(b)>4 else A)[y0:y1,x0:x1];fg=c.min(-1)<215
    if n=='k_jian':   # 竖长剑斜放 45° 以占满格子
        c=np.array(Image.fromarray(c.astype('uint8')).rotate(-45,Image.NEAREST,expand=True,fillcolor=(255,255,255))).astype(int);fg=c.min(-1)<215
    fg=keepbig(fg)
    if n in('token','k_bian'):   # 黑色物件提亮：暗部抬到深棕灰，暗底面板上可辨
        dk=fg&(c.max(-1)<110);c[dk]=c[dk]*0.55+np.array([72,62,54])
    if n=='k_nei':    # 打坐剪影提亮成深青灰，暗底上可辨
        dk=fg&(c.max(-1)<90);c[dk]=c[dk]*0.6+np.array([70,78,92])
    ys,xs=np.nonzero(fg);c=c[ys.min():ys.max()+1,xs.min():xs.max()+1];fg=fg[ys.min():ys.max()+1,xs.min():xs.max()+1]
    h,w=fg.shape;sc=(N-4)/max(h,w);nw,nh=max(1,round(w*sc)),max(1,round(h*sc))
    rgba=np.dstack([c,fg*255]).astype('uint8');pm=rgba.astype(float);pm[...,:3]*=fg[...,None]
    sm=np.array(Image.fromarray(pm.astype('uint8')).resize((nw,nh),Image.BOX)).astype(float)
    sa=np.array(Image.fromarray((fg*255).astype('uint8')).resize((nw,nh),Image.BOX)).astype(float)
    o=np.zeros((N,N,4),'uint8');oy,ox=(N-nh)//2,(N-nw)//2;m=sa>100
    col=(sm[...,:3]*255/np.maximum(sa,1)[...,None]).clip(0,255);g=col.mean(-1,keepdims=True);col=g+(col-g)*0.85
    blk=o[oy:oy+nh,ox:ox+nw];blk[...,:3][m]=col[m];blk[...,3][m]=255
    # 1px 深色外描边
    a=o[...,3]>0;p=np.pad(a,1);nb=(p[:-2,1:-1]|p[2:,1:-1]|p[1:-1,:-2]|p[1:-1,2:])&~a
    o[nb]=[34,24,20,255]
    if n in('token','k_bian'):  # 内侧亮边：轮廓内一圈提亮成暖灰高光
        p2=np.pad(a,1);ed=a&~(p2[:-2,1:-1]&p2[2:,1:-1]&p2[1:-1,:-2]&p2[1:-1,2:])
        o[...,:3][ed]=np.clip(o[...,:3][ed].astype(int)+[70,62,50],0,255)
    out[n]=Image.fromarray(o).resize((N*S,N*S),Image.NEAREST)
keys=['bun','pill','wine','shovel','book','gall','token','wood','iron','rusty','cloth','vest','k_quan','k_zhang','k_bian','k_tui','k_nei','k_jian'];C=6;cs=N*S;at=Image.new('RGBA',(C*cs,((len(keys)+C-1)//C)*cs),(0,0,0,0));meta={}
for i,k in enumerate(keys):
    x,y=(i%C)*cs,(i//C)*cs;at.paste(out[k],(x,y));meta[k]=[x,y,cs,cs]
at.save('assets/i_icons.webp',lossless=True)
s=open('js/art.js').read();s=re.sub(r'\n?// 道具图标.*\nART\.icons=.*;','',s)
s+='\n// 道具图标：assets/i_icons.webp 图集，ART.icons[key]=[x,y,w,h]（96x96，32px像素x3，请用 imageSmoothingEnabled=false 绘制）\nART.icons='+json.dumps(meta)+';'
open('js/art.js','w').write(s);print(keys,at.size)
