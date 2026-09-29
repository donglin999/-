# 明亮风格地图：raw → 重打光(提影/提曝光/去泥黄/暖阳) → pixmaps 同款像素化(640x360, 边缘加深减弱, 64色 kmeans)
# 用法：python3 tools_bright/pix_bright.py <src.png> <dst.webp> [relight=1]
import sys,numpy as np
from PIL import Image,ImageFilter,ImageEnhance,ImageChops
src,dst=sys.argv[1],sys.argv[2];rel=len(sys.argv)<4 or sys.argv[3]!='0'
im=Image.open(src).convert('RGB');s=im.resize((640,360),Image.BOX)
a=np.array(s).astype(float)/255
if rel:
    g=a.mean(-1,keepdims=True)
    a=g+(a-g)*np.where(a.mean(-1,keepdims=True)<.5,1,1)          # 占位
    # 去泥黄：蓝通道回补、红绿略收
    a=a*np.array([1.0,1.0,1.02])
    a=a**0.7                               # 提影/中间调
    a=a*1.06                                # 曝光
    # 暖阳：高光加暖，阴影微冷
    L=a.mean(-1,keepdims=True);a=a+ (L-.5)*np.array([.16,.08,-.10])
    g=a.mean(-1,keepdims=True);a=g+(a-g)*1.25   # 色彩更鲜
else:
    a=a**1.18
s=Image.fromarray((a.clip(0,1)*255).astype('uint8'))
s=ImageEnhance.Contrast(s).enhance(1.04)
L=s.convert('L');e=L.filter(ImageFilter.FIND_EDGES).point(lambda v:0 if v<40 else min(255,(v-40)*2))
dark=ImageChops.multiply(s,Image.new('RGB',s.size,(170,160,150)))
s=Image.composite(dark,s,e.point(lambda v:int(v*.4)))
q=s.quantize(colors=64,method=Image.MEDIANCUT,kmeans=4,dither=Image.NONE).convert('RGB')
q.save(dst,lossless=True,quality=100,method=6);print(dst)
