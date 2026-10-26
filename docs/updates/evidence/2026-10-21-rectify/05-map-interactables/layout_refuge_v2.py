# 在 layout-refuge.png 基础上加护院、差役两个站位，另存 v2（原图不动）
from PIL import Image,ImageDraw,ImageFont
D='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu/review/qihe-map-interactables/'
F='/System/Library/Fonts/Hiragino Sans GB.ttc'
def font(n): return ImageFont.truetype(F,n)
im=Image.open(D+'layout-refuge.png').convert('RGBA')
MW=1536
COL={'支线':(215,50,50),'站位':(30,140,150)}
pts=[('R1','阿栓、小禾撤离后落脚（各一句回响）','支线',(330,570),'2026-10-21 原有'),
     ('R2','护院（正道盟）：站在徐令仪身后，切磋首场','站位',(1015,580),'新增 · 切磋稿第 2.6 节'),
     ('R3','差役（巡江司）：送村口老人到此后守在他身边','站位',(540,615),'新增 · 切磋稿第 2.6 节')]
ov=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
def label(xy,text,col,f):
  x,y=xy; w=d.textlength(text,font=f); h=f.size+6
  d.rounded_rectangle([x,y,x+w+10,y+h],radius=4,fill=(255,255,255,225),outline=col,width=2)
  d.text((x+5,y+2),text,font=f,fill=(20,20,20))
for pid,name,t,(x,y),_ in pts[1:]:
  col=COL[t]; r=19
  d.ellipse([x-r,y-r,x+r,y+r],fill=col+(255,),outline=(255,255,255),width=3)
  f=font(17); tw=d.textlength(pid,font=f); d.text((x-tw/2,y-11),pid,font=f,fill=(255,255,255))
  short=name.split('：')[0]+'站位'
  label((x+r+4,y-14),short,col,font(17))
im=Image.alpha_composite(im,ov).convert('RGB')
d=ImageDraw.Draw(im); d.rectangle([MW,0,im.width,im.height],fill=(246,243,236))
x0=MW+20; y=20
d.text((x0,y),'栖河 · 可交互点布置图（草案 v2）',font=font(24),fill=(20,20,20)); y+=36
d.text((x0,y),'邻村 · 接应院（qh_refuge，1536×1024）',font=font(17),fill=(60,60,60)); y+=26
d.text((x0,y),'2026-10-22 · 待用户确认 · 位置为世界坐标近似值',font=font(15),fill=(120,60,60)); y+=34
for pid,name,t,xy,note in pts:
  col=COL[t]; d.ellipse([x0,y+2,x0+20,y+22],fill=col)
  d.text((x0+28,y),f'{pid}  {name}',font=font(15),fill=(20,20,20)); y+=22
  d.text((x0+28,y),f'{note}　坐标≈{xy}',font=font(13),fill=(100,100,100)); y+=28
y+=4
for s in ['R2、R3 只在邻村对证之后出现（与徐令仪、沈雁回同时段）。',
          '护院：R3-R1 徐令仪令其护乡邻西撤，人跟到邻村；',
          '　对证后在 R2 打切磋首场，学会“切磋”。',
          '差役：R3-R7 沈雁回令其接村口老人；',
          '　站老人身旁，切磋过后可请教（棍法熟练）。',
          '两人都不挡出口与主路：R2 在路南草边，',
          '　R3 在老人南侧路边草地，脚底不压通道。',
          '差役切磋要战斗形象，随后续素材批次一起补。']:
  d.text((x0,y),s,font=font(13),fill=(60,60,60)); y+=20
y+=10; d.line([(x0,y),(x0+520,y)],fill=(180,180,180)); y+=12
d.text((x0,y),'图例',font=font(18),fill=(20,20,20)); y+=28
for t,txt in [('支线','支线发起人（原图已有）'),('站位','新增人物站位（本版）')]:
  d.ellipse([x0,y+2,x0+18,y+20],fill=COL[t]); d.text((x0+26,y),txt,font=font(14),fill=(40,40,40)); y+=26
d.ellipse([x0,y+2,x0+16,y+18],fill=(255,255,255),outline=(30,30,30),width=2); d.text((x0+26,y),'现有可交互点（盘点于 8792，邻村接应阶段）',font=font(14),fill=(40,40,40)); y+=30
d.text((x0,y),'底图与白点沿用 layout-refuge.png（2026-10-21）',font=font(13),fill=(110,110,110))
im.save(D+'layout-refuge-v2.png'); print(im.size)
