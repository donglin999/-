import os
from PIL import Image
from collections import deque
for f in sorted(os.listdir('raw2')):
    if not f.startswith('p_'):continue
    im=Image.open('raw2/'+f).convert('RGBA');w,h=im.size;px=im.load()
    ref=px[3,3];seen=bytearray(w*h);q=deque([(x,0) for x in range(w)]+[(0,y) for y in range(h)]+[(w-1,y) for y in range(h)])
    close=lambda p:sum(abs(p[i]-ref[i]) for i in range(3))<60
    while q:
        x,y=q.popleft()
        if x<0 or y<0 or x>=w or y>=h or seen[y*w+x]:continue
        seen[y*w+x]=1
        if not close(px[x,y]):continue
        px[x,y]=(0,0,0,0);q.extend([(x+1,y),(x-1,y),(x,y+1),(x,y-1)])
    im=im.crop(im.getbbox());s=min(480/im.width,640/im.height);im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS);im.save('assets/'+f[:-4]+'.webp',quality=86);print(f)
