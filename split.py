# 将 4 方向行走图拆成单帧：洪泛去白底 → 按列投影切分 → 统一裁剪高度
import os,sys,json
from PIL import Image
from collections import deque
os.makedirs('frames',exist_ok=True)
def cutout(im):
    im=im.convert('RGBA');w,h=im.size;px=im.load();seen=bytearray(w*h);q=deque()
    white=lambda p:p[0]>222 and p[1]>222 and p[2]>222 and max(p[:3])-min(p[:3])<24
    for x in range(w):q.extend([(x,0),(x,h-1)])
    for y in range(h):q.extend([(0,y),(w-1,y)])
    while q:
        x,y=q.popleft()
        if x<0 or y<0 or x>=w or y>=h or seen[y*w+x]:continue
        seen[y*w+x]=1
        if not white(px[x,y]):continue
        px[x,y]=(0,0,0,0);q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
    return im
def split(k):
    im=cutout(Image.open(f'raw2/{k}.png'));w,h=im.size;a=im.getchannel('A').load()
    col=[any(a[x,y]>20 for y in range(0,h,2)) for x in range(w)]
    segs=[];x=0
    while x<w:
        if col[x]:
            s=x
            while x<w and col[x]:x+=1
            segs.append([s,x])
        x+=1
    # 合并间隙很小的片段（剑穗、尾巴等）
    m=[]
    for s in segs:
        if m and s[0]-m[-1][1]<14:m[-1][1]=s[1]
        else:m.append(s)
    m=[s for s in m if s[1]-s[0]>25]
    out=[]
    for i,(x0,x1) in enumerate(m):
        fr=im.crop((x0,0,x1,h));bb=fr.getbbox();fr=fr.crop(bb)
        nh=132;fr=fr.resize((max(1,round(fr.width*nh/fr.height)),nh),Image.LANCZOS)
        fr.save(f'frames/{k}_{i}.png');out.append(fr.size)
    return out
for f in sorted(os.listdir('raw2')):
    if f.startswith('c_'):print(f[:-4],split(f[:-4]))
