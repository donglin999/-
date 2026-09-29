# 生成评审图：review/bright_compare.png, review/walk_frames.png, review/walk_hero.gif
import numpy as np
from PIL import Image,ImageDraw
R='review/'
def cell(path,row,col=0,cw=None,ch=141):
    im=Image.open(path).convert('RGBA');cw=cw or im.width//4;return im.crop((col*cw,row*ch,(col+1)*cw,(row+1)*ch))
CH=[('hero',.47,.62,0),('lady',.36,.70,0),('smith',.58,.45,1),('villager',.40,.52,2),('child',.62,.72,0),('soldier',.50,.85,3)]
SC={'hero':1,'lady':.97,'smith':1.12,'villager':1,'child':.75,'soldier':1.05}
def comp(mp,suf,label):
    m=Image.open(mp).convert('RGB').resize((960,540),Image.NEAREST).convert('RGBA')
    for k,x,y,r in CH:
        c=cell(f'assets/s_{k}{suf}.webp',r);f=77/132*SC[k]
        c=c.resize((max(1,round(c.width*f)),round(c.height*f)),Image.NEAREST)
        m.alpha_composite(c,(int(x*960-c.width/2),int(y*540-c.height)))
    d=ImageDraw.Draw(m);d.rectangle((0,0,420,22),fill=(0,0,0,170));d.text((6,5),label,fill=(255,255,255));return m
P=[('assets/m_street.webp','','A current m_street + current sprites'),('assets/m_street_bright.webp','_bright','B RELIT m_street_bright (same layout) + bright sprites'),
   ('assets/review/m_street_gen1.webp','_bright','C generated gen1 (new layout) + bright sprites'),('assets/review/m_street_gen2.webp','_bright','D generated gen2 (new layout) + bright sprites')]
out=Image.new('RGBA',(1920,1080))
for i,(a,b,c) in enumerate(P): out.alpha_composite(comp(a,b,c),((i%2)*960,(i//2)*540))
out.convert('RGB').save(R+'bright_compare.png')
# 行走帧
W=Image.open('assets/s_hero_walk_bright.webp').convert('RGBA');cw,ch=99,141;base=[[W.crop((f*cw,r*ch,(f+1)*cw,(r+1)*ch)).resize((33,47),Image.NEAREST) for f in range(8)] for r in range(4)]
st=Image.open('assets/s_hero_bright.webp').convert('RGBA')
Z=4;fw,fh=33*Z,47*Z;sheet=Image.new('RGBA',(fw*9+20,(fh+16)*4+10),(120,150,110,255));d=ImageDraw.Draw(sheet)
for r in range(4):
    old=st.crop((0,r*141,87,(r+1)*141)).resize((29*Z,47*Z),Image.NEAREST);sheet.alpha_composite(old,(4,r*(fh+16)+14))
    d.text((4,r*(fh+16)+2),'dlru'[r]+' old stand',fill=(0,0,0))
    for f in range(8):
        sheet.alpha_composite(base[r][f].resize((fw,fh),Image.NEAREST),(20+fw*(f+1),r*(fh+16)+14));d.text((20+fw*(f+1),r*(fh+16)+2),f'f{f}',fill=(0,0,0))
sheet.convert('RGB').save(R+'walk_frames.png')
# GIF：明亮地图上四向行走，10fps
M=Image.open('assets/m_street_bright.webp').convert('RGBA').resize((1280,720),Image.NEAREST).crop((160,90,1120,630))
frames=[]
for i in range(32):
    fr=M.copy();f=i%8;p=i*3
    for r,(x,y,dx,dy) in enumerate([(180,120,0,1),(700,300,-1,0),(260,300,1,0),(480,420,0,-1)]):
        c=base[r][f].resize((66,94),Image.NEAREST);fr.alpha_composite(c,(x+dx*p-33,y+dy*p-94+94))
    frames.append(fr.convert('RGB').quantize(255))
frames[0].save(R+'walk_hero.gif',save_all=True,append_images=frames[1:],duration=100,loop=0)
print('ok')
