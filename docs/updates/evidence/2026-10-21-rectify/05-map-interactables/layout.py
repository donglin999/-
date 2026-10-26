import json,sys
sys.path.insert(0,'/private/tmp/claude-501/-Users-wuxiuxiang-project-luotuozhuan/cee2f540-8d09-4e39-a916-75d3855a0702/scratchpad')
from compose import compose
from PIL import Image,ImageDraw,ImageFont
OUT='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu/review/qihe-map-interactables/'
INV=json.load(open('/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/docs/updates/evidence/2026-10-21-rectify/05-map-interactables/inventory.json'))
F='/System/Library/Fonts/Hiragino Sans GB.ttc'
def font(n): return ImageFont.truetype(F,n)
COL={'景物':(52,120,220),'商人':(235,140,30),'算命':(150,70,190),'支线':(215,50,50),'采集':(40,160,80),'改':(90,90,90),'观察':(120,120,120),'奇遇':(200,170,40)}
TYPE_NAME={'景物':'景物调查／可翻找','商人':'商人／服务','算命':'算命','支线':'支线发起人','采集':'采集／小游戏','改':'改动现有点','观察':'观察者预留位（魔教正面人物，另案设计）','奇遇':'已有奇遇设计的落点（qihe-hidden-rewards）'}
MAPS={
 'central':dict(title='中央村落（qihe_trial，2400×1600）',inv='qihe_trial',scale=0.7,pts=[
  ('C1','古井（新景物）','景物',(1250,790),(1185,730,1315,850)),
  ('C2','孩童嬉戏点：阿栓、小禾（新人物）','支线',(1440,845),None),
  ('C3','算命摊：游方算命先生（新人物）','算命',(905,470),(835,415,975,525)),
  ('C4','货郎担：杂货货郎（新人物）','商人',(700,765),(635,720,770,805)),
  ('C5','村公粮仓（新建筑）','景物',(1965,360),(1850,120,2080,340)),
  ('C6','村中告示（现有路牌，加寻物／招工条）','改',(1656,1459),None),
  ('O1','观察者预留：陈伯家屋后林缘','观察',(1300,70),None)]),
 'inn':dict(title='客栈室内（prologue_inn_interior，1200×800，沿用现有室内图）',inv='prologue_inn_interior',scale=1.0,pts=[
  ('I1','店家回柜台（由南村口外院移入）','支线',(734,405),None),
  ('I2','帮众：饮酒桌（三天酒钱）','支线',(400,500),None),
  ('I3','算命先生住店（方案B：不出摊时坐这里）','算命',(880,560),None),
  ('I4','柜台住客簿（景物）','景物',(690,250),None),
  ('I5','后厨灶台：讨一碗热汤（回复）','景物',(1010,250),None),
  ('I6','里间箱笼（店家允许后可翻）','景物',(990,470),None),
  ('O2','观察者预留：后门门帘','观察',(895,165),None)]),
 'south':dict(title='南村口 · 客栈外院（qh_south，1536×1024）',inv='qh_south',scale=1.0,pts=[
  ('S1','店家原站位：移入客栈后改放“外院菜牌”','改',(580,350),None),
  ('S2','茶棚边旧木桶（可翻找）','景物',(1290,330),None),
  ('S3','货郎担方案B（若不放中央）','商人',(1000,660),(935,620,1070,700)),
  ('O3','观察者预留：茶棚座位','观察',(1085,300),None)]),
 'west':dict(title='西田埂 · 练场与药车道（qh_west，1536×1024）',inv='qh_west',scale=1.0,pts=[
  ('W1','晒谷场（新地面布置）：翻谷赶雀','采集',(790,230),(620,95,975,300)),
  ('W2','谷垛（小禾藏身处）','支线',(925,150),None),
  ('W3','工具棚边木桶（可翻找）','景物',(565,280),None),
  ('O4','观察者预留：东北林缘','观察',(1390,170),None)]),
 'east':dict(title='栖河东埠 · 晒药与装卸（qh_east，1536×1024）',inv='qh_east',scale=1.0,pts=[
  ('E1','船家：河埠小船（钓鱼、渡口闲话）','商人',(1265,665),None),
  ('E2','H5 第一夜河埠灯影','奇遇',(1345,560),None),
  ('O5','观察者预留：对岸芦苇','观察',(1460,330),None)]),
 'north':dict(title='后山采药路（qh_north，1536×1024）',inv='qh_north',scale=1.0,pts=[
  ('N1','H1 北坡石洞口（补落点）','奇遇',(1230,450),None),
  ('N2','老树树洞（小禾的“宝贝”）','景物',(380,440),None),
  ('O6','观察者预留：老树背后','观察',(225,300),None)]),
 'refuge':dict(title='邻村 · 接应院（qh_refuge，1536×1024）',inv='qh_refuge',stage='refuge',scale=1.0,pts=[
  ('R1','阿栓、小禾撤离后落脚（各一句回响）','支线',(330,570),None)]),
}
def label(d,xy,text,col,f):
  x,y=xy; w=d.textlength(text,font=f); h=f.size+6
  d.rounded_rectangle([x,y,x+w+10,y+h],radius=4,fill=(255,255,255,225),outline=col,width=2)
  d.text((x+5,y+2),text,font=f,fill=(20,20,20))
def dashed_rect(d,box,col,width=4,dash=14):
  x0,y0,x1,y1=box
  for (a,b,c,e) in [(x0,y0,x1,y0),(x0,y1,x1,y1),(x0,y0,x0,y1),(x1,y0,x1,y1)]:
    L=max(abs(c-a),abs(e-b)); n=int(L//dash)
    for i in range(0,n,2):
      t0=i/n;t1=min(1,(i+1)/n)
      d.line([(a+(c-a)*t0,b+(e-b)*t0),(a+(c-a)*t1,b+(e-b)*t1)],fill=col,width=width)
def render(key,cfg):
  if key=='inn':
    R='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/assets/production/maps/'
    im=Image.open(R+'m_qihe_inn_interior.webp').convert('RGBA').resize((1200,800));im.alpha_composite(Image.open(R+'m_qihe_inn_interior_fg.webp').convert('RGBA').resize((1200,800)))
  else: im=compose(key).convert('RGBA')
  k=cfg['scale']; im=im.resize((int(im.width*k),int(im.height*k)),Image.LANCZOS)
  ov=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
  # 现有点
  existing=[n for n in INV[cfg.get('stage','day1')][cfg['inv']]['list'] if not n['id'].startswith('exit-') and not n['id'].endswith('-out')]
  fs=font(15)
  for n in existing:
    x,y=n['x']*k,n['y']*k
    d.ellipse([x-7,y-7,x+7,y+7],fill=(255,255,255,235),outline=(30,30,30),width=2)
    d.text((x+9,y-9),n['name'],font=fs,fill=(255,255,255),stroke_width=2,stroke_fill=(0,0,0))
  for pid,name,t,(x,y),box in cfg['pts']:
    col=COL[t]
    if box: dashed_rect(d,[v*k for v in box],(255,215,0,255))
    x,y=x*k,y*k; r=19
    if t=='观察':
      for a in range(0,360,30): d.arc([x-r,y-r,x+r,y+r],a,a+15,fill=col+(255,),width=4)
      d.ellipse([x-r+4,y-r+4,x+r-4,y+r-4],fill=(255,255,255,170))
    else:
      d.ellipse([x-r,y-r,x+r,y+r],fill=col+(255,),outline=(255,255,255),width=3)
    f=font(17); tw=d.textlength(pid,font=f)
    d.text((x-tw/2,y-11),pid,font=f,fill=(0,0,0) if t=='观察' else (255,255,255))
    lw=d.textlength(name,font=font(17))+10
    lx=x+r+4 if x+r+4+lw<im.width-4 else x-r-4-lw
    label(d,(lx,y-14),name,col,font(17))
  im=Image.alpha_composite(im,ov)
  # 图例栏
  W=560; canvas=Image.new('RGB',(im.width+W,max(im.height,760)),(246,243,236)); canvas.paste(im.convert('RGB'),(0,0))
  d=ImageDraw.Draw(canvas); x0=im.width+20; y=20
  d.text((x0,y),'栖河 · 可交互点布置图（草案）',font=font(24),fill=(20,20,20)); y+=36
  d.text((x0,y),cfg['title'],font=font(17),fill=(60,60,60)); y+=26
  d.text((x0,y),'2026-10-21 · 待用户确认 · 位置为世界坐标近似值',font=font(15),fill=(120,60,60)); y+=34
  for pid,name,t,xy,box in cfg['pts']:
    col=COL[t]; d.ellipse([x0,y+2,x0+20,y+22],fill=col); 
    d.text((x0+28,y),f'{pid}  {name}',font=font(16),fill=(20,20,20)); y+=22
    d.text((x0+28,y),f'类型：{TYPE_NAME[t].split("（")[0]}　坐标≈{xy}',font=font(13),fill=(100,100,100)); y+=26
  y+=10; d.line([(x0,y),(x0+W-40,y)],fill=(180,180,180)); y+=12
  d.text((x0,y),'图例',font=font(18),fill=(20,20,20)); y+=28
  used=sorted(set(p[2] for p in cfg['pts']),key=list(COL).index)
  for t in used:
    d.ellipse([x0,y+2,x0+18,y+20],fill=COL[t]); d.text((x0+26,y),TYPE_NAME[t],font=font(14),fill=(40,40,40)); y+=26
  d.ellipse([x0,y+2,x0+16,y+18],fill=(255,255,255),outline=(30,30,30),width=2); d.text((x0+26,y),'现有可交互点（盘点于 8792，阶段见文件名）',font=font(14),fill=(40,40,40)); y+=26
  d.rectangle([x0,y+4,x0+18,y+18],outline=(255,215,0),width=3); d.text((x0+26,y),'新增建筑／地面布置的大致占地（虚线）',font=font(14),fill=(40,40,40)); y+=30
  st=cfg.get('stage','day1'); d.text((x0,y),'白点按“%s”阶段盘点' % {'day1':'风起第一天白天','refuge':'邻村接应'}[st],font=font(13),fill=(110,110,110))
  canvas.save(OUT+f'layout-{key}.png'); print(key,canvas.size)
for k,c in MAPS.items(): render(k,c)
