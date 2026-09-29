# 街市图层管线：assets/m_street.webp(640x360) → 前景遮挡层 assets/m_street_fg.webp + 精细可走 mask + 前景分块(fgp) → js 片段
# 坐标全部以源图像素(640x360)标注；世界坐标 = ×3。输出 raw_street/street_layers.js（贴入 story.js）与调试叠图 raw_street/dbg_*.png
from PIL import Image,ImageDraw
import base64,json,sys
SRC='assets/m_street.webp'; K=3; MW,MH=240,135; MS=640/MW   # mask 每格 = 8 世界像素
im=Image.open(SRC).convert('RGBA'); W,H=im.size
# ── 可走区（多边形/矩形并集，减去障碍） ──
# 2026-09 空气墙审计：按新版地图逐块重标（宽松原则：肉眼可走的铺地/沙地/土路一律可走，只挡建筑/墙/桌椅/桶/摊/推车）
WALK=[
  [(282,0),(345,0),(345,252),(282,252)],                        # 北向主街（含东侧阴影铺地）
  [(214,148),(290,148),(290,252),(214,252)],                    # 茶摊沙地
  [(158,224),(216,224),(216,252),(158,252)],                    # 茶摊棚下前沿
  [(112,242),(162,242),(162,270),(112,270)],                    # 西侧沙地
  [(0,264),(160,264),(160,238),(560,238),(560,270),(640,270),(640,306),(400,306),(400,310),(160,310),(160,301),(0,301)],  # 东西大街 + 石铺广场
  [(340,180),(456,180),(456,252),(340,252)],                    # 铁匠铺前院
  [(438,52),(492,52),(492,252),(438,252)],                      # 东侧巷道铺地（向北）
  [(486,158),(540,158),(540,272),(486,272)],                    # 灯笼巷土路
  [(288,296),(340,296),(340,360),(288,360)],                    # 城门洞
]
BLOCK=[
  ('r',(356,160,408,206)),   # 铁匠炉台
  ('r',(412,186,434,212)),   # 木箱
  ('r',(372,216,442,245)),   # 菜筐/货箱
  ('r',(432,158,452,187)),   # 水桶
  ('r',(222,168,270,220)),   # 茶桌+凳
  ('r',(268,182,279,199)),   # 右侧小凳
  ('r',(204,222,228,246)),   # 竹椅/柜
  ('r',(254,231,266,240)),   # 小罐
  ('r',(141,244,158,275)),   # 路边木架
  ('r',(500,244,532,272)),   # 两只木桶
  ('r',(178,292,216,310)),   # 翻倒的推车
  ('r',(282,300,290,360)),('r',(338,300,346,360)),   # 城门两壁
]
FG=[ # (名, 形状, 参数, 底边y源像素) 底边 9999 = 永远在人物之上
  ('red_umbrella','e',(222,118,268,152),206),
  ('yel_umbrella','e',(220,150,268,186),206),
  ('lanterns_lane','c',(482,92,506,200),200),
  ('lanterns_road','c',(324,0,348,116),130),
  ('gate_tower','p',[(262,296),(362,296),(362,360),(262,360)],9999),
  ('roof_sw','r',(0,297,160,360),9999),
  ('roof_s','r',(404,310,532,360),9999),
  ('roof_se','r',(588,300,640,360),9999),
]
def shape(d,kind,a,fill=255):
    if kind=='r':d.rectangle(a,fill=fill)
    elif kind=='e':d.ellipse(a,fill=fill)
    else:d.polygon(a,fill=fill)
# mask（源图分辨率先画，再按 8/3 取样）
m=Image.new('L',(W,H),0);d=ImageDraw.Draw(m)
for P in WALK:d.polygon(P,fill=255)
for k,a in BLOCK:shape(d,k,a,0)
bits=[]
for r in range(MH):
    for c in range(MW):
        bits.append(1 if m.getpixel((min(W-1,int((c+.5)*MS)),min(H-1,int((r+.5)*MS))))>128 else 0)
by=bytearray((len(bits)+7)//8)
for i,b in enumerate(bits):
    if b:by[i>>3]|=1<<(7-(i&7))
b64=base64.b64encode(bytes(by)).decode()
# 前景层
fg=Image.new('RGBA',(W,H),(0,0,0,0));fgp=[]
for name,kind,a,base in FG:
    pm=Image.new('L',(W,H),0)
    if kind=='c':  # 颜色抠取：矩形内的灯笼红 + 外扩 1px 描边，墙面/柱子不进前景
        from PIL import ImageFilter
        for y in range(a[1],a[3]):
            for x in range(a[0],a[2]):
                r_,g_,b_,_=im.getpixel((x,y))
                if r_>g_+28 and r_>b_+28:pm.putpixel((x,y),255)
        pm=pm.filter(ImageFilter.MaxFilter(3))
    else:shape(ImageDraw.Draw(pm),kind,a)
    fg.paste(im,(0,0),pm)
    xs=[p[0] for p in a] if kind=='p' else [a[0],a[2]];ys=[p[1] for p in a] if kind=='p' else [a[1],a[3]]
    x0,y0,x1,y1=min(xs),min(ys),max(xs)+1,max(ys)+1
    fgp.append([x0*K,y0*K,(x1-x0)*K,(y1-y0)*K,base*K])
if '--fg' in sys.argv:fg.save('assets/m_street_fg.webp',lossless=True,quality=100,method=6)
open('raw_street/street_layers.js','w').write('SC.street.mask={w:%d,h:%d,d:"%s"};\nSC.street.fgp=%s;\n'%(MW,MH,b64,json.dumps(fgp)))
# 调试叠图（2x）
dbg=im.convert('RGB').copy();ov=Image.new('RGBA',(W,H),(0,0,0,0));od=ImageDraw.Draw(ov)
for r in range(MH):
    for c in range(MW):
        if bits[r*MW+c]:od.rectangle((c*MS,r*MS,(c+1)*MS-1,(r+1)*MS-1),fill=(0,255,0,70))
for name,kind,a,base in FG:
    if kind in 'rc':od.rectangle(a,outline=(255,0,255,255))
    elif kind=='e':od.ellipse(a,outline=(255,0,255,255))
    else:od.polygon(a,outline=(255,0,255,255))
dbg=Image.alpha_composite(dbg.convert('RGBA'),ov).resize((W*2,H*2),Image.NEAREST)
dd=ImageDraw.Draw(dbg)
for x in range(0,W,40):dd.line([(x*2,0),(x*2,H*2)],fill=(255,255,0,90));dd.text((x*2+2,2),str(x),fill=(255,255,0))
for y in range(0,H,40):dd.line([(0,y*2),(W*2,y*2)],fill=(255,255,0,90));dd.text((2,y*2+2),str(y),fill=(255,255,0))
dbg.save('raw_street/dbg_walk.png')
print('ok',len(b64))
