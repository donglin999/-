# 土路（11-10 起通用：南村口、村心、后山）：找出路面上的深色石块堆，路中间的用旁边干净的土路纹理盖掉，靠路边的留下
import numpy as np, json, sys  # 用法：python3 find.py <候选.json> <底图>
from PIL import Image, ImageDraw
from scipy import ndimage
SRC=sys.argv[2]
im=np.array(Image.open(SRC).convert('RGB')).astype(int)
r,g,b=im[...,0],im[...,1],im[...,2]
mx=im.max(2); mn=im.min(2); sat=(mx-mn)/np.maximum(mx,1)
dirt=(r>150)&(g>110)&(b<150)&(r-b>45)&(r>=g)
dirtR=ndimage.binary_opening(ndimage.binary_closing(dirt,iterations=8),iterations=12)
edge=ndimage.distance_transform_edt(dirtR)   # 到路边（非土路）的距离
rock=((mx<170)&(sat<0.45))|((g>=r)&(mx<150))
rock&=ndimage.binary_dilation(dirtR,iterations=3)
lab,n=ndimage.label(ndimage.binary_closing(rock,iterations=2))
out=[]
for i,sl in enumerate(ndimage.find_objects(lab)):
    ys,xs=sl; h=ys.stop-ys.start; w=xs.stop-xs.start
    area=(lab[sl]==i+1).sum()
    if area<18 or w>70 or h>70: continue
    cy,cx=(ys.start+ys.stop)//2,(xs.start+xs.stop)//2
    if not dirtR[max(0,cy-4):cy+5,max(0,cx-4):cx+5].any(): continue
    out.append([int(xs.start),int(ys.start),int(w),int(h),float(edge[cy,cx]),int(area)])
json.dump(out,open(sys.argv[1],'w'))
print(len(out))
