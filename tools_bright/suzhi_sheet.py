# 苏芷(suzhi) 精灵表全流程：raw2/c_suzhi.png → split 切帧 → process_walk 像素化+步态 → 打包 review/s_suzhi.webp
# → face.py 补五官 → assets/s_suzhi.webp；bright_sprites → s_suzhi_bright.webp；sidewalk 修侧面双腿
import json,re,subprocess,numpy as np
from PIL import Image
K='suzhi';ORDER={'d':0,'l':1,'r':2,'u':3}   # 原图顺序：正、朝左、朝右、背
g={};exec(open('split.py').read().split("for f in sorted")[0],g);g['split'](f'c_{K}')
pw={};exec(open('process_walk.py').read().split("for k in M:")[0],pw)
fr={}
for d,i in ORDER.items():
    a=pw['pix'](Image.open(f'frames/c_{K}_{i}.png'),K);a=np.pad(a,((3,0),(2,2),(0,0)))
    for j,x in enumerate(pw['human'](a,d in 'lr',d)):
        im=Image.fromarray(np.ascontiguousarray(x),'RGBA');fr[(d,j)]=im.resize((im.width*3,im.height*3),Image.NEAREST)
cw=max(i.width for i in fr.values());ch=max(i.height for i in fr.values())
sh=Image.new('RGBA',(cw*4,ch*4))
for r,d in enumerate('dlru'):
    for j in range(4):im=fr[(d,j)];sh.paste(im,(j*cw+(cw-im.width)//2,r*ch+ch-im.height))
sh.save(f'assets/review/s_{K}.webp',lossless=True);print('cell',cw,ch)
