import os,sys
from PIL import Image
from collections import deque
os.makedirs('assets',exist_ok=True)
for f in sorted(os.listdir('raw')):
    k=f[:-4];out=f'assets/{k}.webp'
    if os.path.exists(out):continue
    im=Image.open('raw/'+f).convert('RGBA')
    if k.startswith(('bg_','td_')):
        im.convert('RGB').resize((960,540),Image.LANCZOS).save(out,quality=82);continue
    w,h=im.size;px=im.load();seen=bytearray(w*h);q=deque()
    def white(p):return p[0]>225 and p[1]>225 and p[2]>225 and max(p[:3])-min(p[:3])<22
    for x in range(w):q.extend([(x,0),(x,h-1)])
    for y in range(h):q.extend([(0,y),(w-1,y)])
    while q:
        x,y=q.popleft()
        if x<0 or y<0 or x>=w or y>=h or seen[y*w+x]:continue
        seen[y*w+x]=1
        if not white(px[x,y]):continue
        px[x,y]=(0,0,0,0);q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
    im=im.crop(im.getbbox())
    # 软化边缘的白色描边：半透明化贴边的近白像素
    nh=360;im=im.resize((round(im.width*nh/im.height),nh),Image.LANCZOS)
    im.save(out,quality=88);print(k,im.size)
