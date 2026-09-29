# 从拆好的帧导出四方向贴图：MAP[char]=(正面帧, 侧面帧, 背面帧, 侧面帧是否朝右)
import sys,json,os
from PIL import Image
MAP=json.load(open('framemap.json'))
for k,(d,s,u,right) in MAP.items():
    src=f'frames/c_{k}_%d.png'
    D=Image.open(src%d);Sd=Image.open(src%s);U=Image.open(src%u)
    L=Sd.transpose(Image.FLIP_LEFT_RIGHT) if right else Sd
    R=Sd if right else Sd.transpose(Image.FLIP_LEFT_RIGHT)
    for n,im in zip('dlru',[D,L,R,U]):im.save(f'assets/c_{k}_{n}.webp',lossless=True)
print('ok',len(MAP))
