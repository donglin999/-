# 左右行朝向检查图：每张表 行1(l)/行2(r) 列0 放大并排
import json,re,numpy as np,glob
from PIL import Image,ImageDraw
art=open('js/art.js').read();SH=json.loads(re.search(r'ART.sheet=(\{.*?\});',art).group(1))
tiles=[]
for f in sorted(glob.glob('assets/s_*.webp')):
    k=f[9:-5];im=Image.open(f).convert('RGBA');W,H=im.size;ch=H//4
    b=k.replace('_bright','');cols=4 if b in SH else 8
    cw=W//cols
    t=Image.new('RGB',(cw*2*2+10,ch*2+14),(200,200,190));d=ImageDraw.Draw(t);d.text((2,0),k,fill=0)
    for i,r in enumerate((1,2)):
        c=im.crop((0,r*ch,cw,(r+1)*ch)).resize((cw*2,ch*2),Image.NEAREST);t.paste(c,(i*(cw*2+10),14),c)
    d.text((2,ch*2),'L                R',fill=(200,0,0))
    tiles.append(t)
n=6;w=max(t.width for t in tiles);h=max(t.height for t in tiles)
out=Image.new('RGB',(w*n,h*((len(tiles)+n-1)//n)),(255,255,255))
for i,t in enumerate(tiles):out.paste(t,((i%n)*w,(i//n)*h))
out.save('review/lr_check.png');print(out.size)
