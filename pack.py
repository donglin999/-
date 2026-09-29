# 打包精灵表：assets/c_{char}_{dir}_{i}.webp → assets/s_{char}.webp（4 行 d,l,r,u × 4 列帧），并把单元格尺寸写回 js/art.js 的 ART.sheet
from PIL import Image
import json,re
CH=['hero','monk','soldier','gossip','oldman','smith','lady','beggar','boatman','bandit','chief','villager','child','merchant','dog','rooster','snake','wolf']
meta={}
for c in CH:
    fr={(d,i):Image.open(f'assets/c_{c}_{d}_{i}.webp').convert('RGBA') for d in 'dlru' for i in range(4)}
    cw=max(im.width for im in fr.values());ch=max(im.height for im in fr.values())
    sh=Image.new('RGBA',(cw*4,ch*4),(0,0,0,0))
    for r,d in enumerate('dlru'):
        for i in range(4):
            im=fr[(d,i)];sh.paste(im,(i*cw+(cw-im.width)//2,r*ch+ch-im.height))
    sh.save(f'assets/s_{c}.webp',lossless=True);meta[c]=[cw,ch]
a=open('js/art.js').read();a=re.sub(r'ART\.sheet=.*;',f'ART.sheet={json.dumps(meta)};',a);open('js/art.js','w').write(a)
print('packed',len(meta))
