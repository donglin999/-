# 明亮风格角色表：s_{char}.webp -> s_{char}_bright.webp（单元布局不变）
# 1x 像素格上：中间调提亮(gamma)、饱和度回升、暖光；深色描边(亮度<60)保留
import numpy as np,sys,colorsys
from PIL import Image
def bright(k):
    im=Image.open(f'assets/review/s_{k}.webp').convert('RGBA');a=np.array(im).astype(float)
    rgb=a[...,:3]/255;lum=rgb.mean(-1,keepdims=True)
    keep=(lum<0.2)
    o=rgb**0.78                       # 中间调提亮
    g=o.mean(-1,keepdims=True);o=g+(o-g)*1.22   # 饱和度回升
    o=o*np.array([1.04,1.01,0.95])+0.02          # 暖日光
    o=np.where(keep,rgb*0.9,o)
    a[...,:3]=(o.clip(0,1)*255)
    Image.fromarray(a.astype('uint8')).save(f'assets/s_{k}_bright.webp',lossless=True);print(k)
for k in (sys.argv[1:] or ['hero','lady','smith','villager','child','soldier']):bright(k)
