# 交换精灵表第 1(l)/2(r) 行
import sys,numpy as np
from PIL import Image
for f in sys.argv[1:]:
    a=np.array(Image.open(f).convert('RGBA'));h=a.shape[0]//4
    a[h:2*h],a[2*h:3*h]=a[2*h:3*h].copy(),a[h:2*h].copy()
    Image.fromarray(a).save(f,lossless=True);print('swapped',f)
