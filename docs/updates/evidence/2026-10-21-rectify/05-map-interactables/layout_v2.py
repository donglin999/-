# 布置图第二版（2026-10-23，第十三轮落实）：撤 W2、N2、I3、S3、O1～O6；算命摊、货郎、粮仓按新位置重出。
# 用法：python3 layout_v2.py（底图数据 exp.json 与 compose_v2.py 在同目录；旧图先移到 review/qihe-map-interactables/_v1/）
import json,sys,os
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
from compose_v2 import compose
from PIL import Image,ImageDraw,ImageFont
OUT='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu/review/qihe-map-interactables/'
INV=json.load(open(os.path.join(HERE,'inventory.json')))
F='/System/Library/Fonts/Hiragino Sans GB.ttc'
def font(n): return ImageFont.truetype(F,n)
COL={'景物':(52,120,220),'商人':(235,140,30),'算命':(150,70,190),'支线':(215,50,50),'采集':(40,160,80),'改':(90,90,90),'奇遇':(200,170,40),'固定':(20,130,140),'预留':(120,120,120)}
TYPE_NAME={'景物':'景物调查／可翻找','商人':'商人／服务','算命':'算命（蔺晦之乔装，与观察者支线合一）','支线':'支线发起人','采集':'采集／小游戏','改':'改动现有点','奇遇':'已有奇遇设计的落点（qihe-hidden-rewards）','固定':'已定固定剧情人物（不是本稿新增，画出来核对拥挤）','预留':'支线人物位（观察者支线稿定是否上图）'}
MAPS={
 'central':dict(title='中央村落（qihe_trial，2400×1600）',inv='qihe_trial',scale=0.7,pts=[
  ('C1','古井（新景物）','景物',(1300,775),(1235,715,1365,835)),
  ('C2','孩童：阿栓、小禾（猜字谜）','支线',(1490,835),None),
  ('C3','算命摊：游方算命先生＝蔺晦之','算命',(915,330),(850,280,985,385)),
  ('C4','货郎担：货郎','商人',(1130,830),(1080,795,1185,865),'below'),
  ('C5','村公粮仓（新建筑，叶家门前西侧）','景物',(190,600),(90,505,290,690)),
  ('C6','村中告示（现有路牌，加招工条）','改',(1656,1459),None),
  ('K','小耗子（风起第一天固定的一课）','固定',(700,1290),None,'below')],
  lines=[((915,330),(1063,110),'视线：北路／上后山的人','算命'),((915,330),(523,550),'视线：叶家门','算命'),
         ((94,722),(190,690),'运粮：西口进村即入仓','采集')]),
 'inn':dict(title='客栈室内（prologue_inn_interior，1200×800，沿用现有室内图）',inv='prologue_inn_interior',scale=1.0,pts=[
  ('I1','店家回柜台（由南村口外院移入）','支线',(734,405),None),
  ('I2','帮众：饮酒桌（三天酒钱）','支线',(400,500),None),
  ('I4','柜台住客簿（景物）','景物',(690,250),None,'above'),
  ('I5','后厨灶台：讨一碗热汤（回复）','景物',(1010,250),None,'below'),
  ('I6','里间箱笼（Q3 后店家让挑一样）','景物',(990,470),None)]),
 'south':dict(title='南村口 · 客栈外院（qh_south，1536×1024）',inv='qh_south',scale=1.0,pts=[
  ('S1','店家原站位：移入客栈后改放“外院菜牌”','改',(580,350),None),
  ('S2','茶棚边旧木桶（可翻找）','景物',(1290,330),None)],
  notes=['白点是现行版本盘点：徐令仪、岑霜按任务稿第五节，','　正式登场前不上图（第一夜起都不在路口）。','货郎不放这里（方案 B 已撤），药商仍是这里唯一的收购人。']),
 'west':dict(title='西田埂 · 练场与药车道（qh_west，1536×1024）',inv='qh_west',scale=1.0,pts=[
  ('W1','晒谷场（地面布置）：翻谷赶雀','采集',(790,200),(620,95,975,300)),
  ('W3','工具棚边木桶（可翻找）','景物',(565,280),None)],
  lines=[((900,300),(1460,510),'晒干挑回：经东口进村入仓','采集')],
  notes=['枯枝采集点 west-branch-edge（约 640,170）落在晒谷场里，开发时挪到工具棚西侧。','练场（陆衡教棍）就在晒谷场南边隔一条路：白天有人看场。']),
 'east':dict(title='栖河东埠 · 晒药与装卸（qh_east，1536×1024）',inv='qh_east',scale=1.0,pts=[
  ('E1','船家：河埠小船（渡口闲话；灯一问脚夫来路）','商人',(1265,665),None),
  ('E2','H5 第一夜河埠灯影','奇遇',(1345,560),None),
  ('E3','押船伙计（挑夫装扮，住船家处）','预留',(1150,720),None)]),
 'north':dict(title='后山采药路（qh_north，1536×1024）',inv='qh_north',scale=1.0,pts=[
  ('N1','H1 北坡石洞口（补落点）','奇遇',(1230,450),None)],
  notes=['N2 老树树洞（小禾支线）随小孩剧情撤下；O6 观察位撤销：','　蔺晦之在中央 C3 看北路，不上后山。']),
}
REMOVED={'central':'已撤：O1（观察者预留，由 C3 蔺晦之取代）','inn':'已撤：I3 算命先生住店（方案 B）、O2 观察位','south':'已撤：S3 货郎方案 B、O3 观察位','west':'已撤：W2 谷垛（小孩剧情）、O4 观察位','east':'已撤：O5 观察位（押船伙计改记为 E3 预留）','north':'已撤：N2 老树树洞、O6 观察位'}
def label(d,xy,text,col,f):
  x,y=xy; w=d.textlength(text,font=f); h=f.size+6
  d.rounded_rectangle([x,y,x+w+10,y+h],radius=4,fill=(255,255,255,225),outline=col,width=2)
  d.text((x+5,y+2),text,font=f,fill=(20,20,20))
def dashed(d,a,b,col,width=3,dash=12):
  (x0,y0),(x1,y1)=a,b; L=((x1-x0)**2+(y1-y0)**2)**.5; n=max(1,int(L//dash))
  for i in range(0,n,2):
    t0=i/n;t1=min(1,(i+1)/n); d.line([(x0+(x1-x0)*t0,y0+(y1-y0)*t0),(x0+(x1-x0)*t1,y0+(y1-y0)*t1)],fill=col,width=width)
def dashed_rect(d,box,col):
  x0,y0,x1,y1=box
  for a,b in [((x0,y0),(x1,y0)),((x0,y1),(x1,y1)),((x0,y0),(x0,y1)),((x1,y0),(x1,y1))]: dashed(d,a,b,col,4,14)
def render(key,cfg):
  if key=='inn':
    R='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/assets/production/maps/'
    im=Image.open(R+'m_qihe_inn_interior.webp').convert('RGBA').resize((1200,800));im.alpha_composite(Image.open(R+'m_qihe_inn_interior_fg.webp').convert('RGBA').resize((1200,800)))
  else: im=compose(key).convert('RGBA')
  k=cfg['scale']; im=im.resize((int(im.width*k),int(im.height*k)),Image.LANCZOS)
  ov=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
  existing=[n for n in INV['day1'][cfg['inv']]['list'] if not n['id'].startswith('exit-') and not n['id'].endswith('-out')]
  fs=font(15)
  for n in existing:
    x,y=n['x']*k,n['y']*k
    d.ellipse([x-7,y-7,x+7,y+7],fill=(255,255,255,235),outline=(30,30,30),width=2)
    d.text((x+9,y-9),n['name'],font=fs,fill=(255,255,255),stroke_width=2,stroke_fill=(0,0,0))
  for a,b,txt,t in cfg.get('lines',[]):
    A=(a[0]*k,a[1]*k);B=(b[0]*k,b[1]*k); dashed(d,A,B,COL[t]+(230,),3,10)
    d.ellipse([B[0]-5,B[1]-5,B[0]+5,B[1]+5],fill=COL[t]+(255,))
    mx,my=(A[0]+B[0])/2,(A[1]+B[1])/2
    d.text((mx+6,my-8),txt,font=font(14),fill=(255,255,255),stroke_width=3,stroke_fill=COL[t])
  for P in cfg['pts']:
    pid,name,t,(x,y),box=P[:5]; side=P[5] if len(P)>5 else ''
    col=COL[t]
    if box: dashed_rect(d,[v*k for v in box],(255,215,0,255))
    x,y=x*k,y*k; r=19
    d.ellipse([x-r,y-r,x+r,y+r],fill=col+(255,),outline=(255,255,255),width=3)
    f=font(17); tw=d.textlength(pid,font=f)
    d.text((x-tw/2,y-11),pid,font=f,fill=(255,255,255))
    lw=d.textlength(name,font=font(17))+10
    lx=x+r+4 if x+r+4+lw<im.width-4 else x-r-4-lw
    if side=='above': label(d,(x-lw/2,y-r-30),name,col,font(17))
    elif side=='below': label(d,(x-lw/2,y+r+4),name,col,font(17))
    else: label(d,(lx,y-14),name,col,font(17))
  im=Image.alpha_composite(im,ov)
  W=600; canvas=Image.new('RGB',(im.width+W,max(im.height,760)),(246,243,236)); canvas.paste(im.convert('RGB'),(0,0))
  d=ImageDraw.Draw(canvas); x0=im.width+20; y=20
  d.text((x0,y),'栖河 · 可交互点布置图（第二版）',font=font(24),fill=(20,20,20)); y+=36
  d.text((x0,y),cfg['title'],font=font(17),fill=(60,60,60)); y+=26
  d.text((x0,y),'2026-10-23 · 按第十三轮拍板重出 · 坐标为世界像素近似值',font=font(15),fill=(120,60,60)); y+=34
  for P in cfg['pts']:
    pid,name,t,xy,box=P[:5]
    col=COL[t]; d.ellipse([x0,y+2,x0+20,y+22],fill=col)
    d.text((x0+28,y),f'{pid}  {name}',font=font(16),fill=(20,20,20)); y+=22
    d.text((x0+28,y),f'类型：{TYPE_NAME[t].split("（")[0]}　坐标≈{xy}',font=font(13),fill=(100,100,100)); y+=26
  d.text((x0,y),REMOVED[key],font=font(14),fill=(150,60,60)); y+=24
  for s in cfg.get('notes',[]): d.text((x0,y),s,font=font(13),fill=(60,60,60)); y+=20
  y+=8; d.line([(x0,y),(x0+W-40,y)],fill=(180,180,180)); y+=12
  d.text((x0,y),'图例',font=font(18),fill=(20,20,20)); y+=28
  used=sorted(set(p[2] for p in cfg['pts'])|set(l[3] for l in cfg.get('lines',[])),key=list(COL).index)
  for t in used:
    d.ellipse([x0,y+2,x0+18,y+20],fill=COL[t]); d.text((x0+26,y),TYPE_NAME[t],font=font(14),fill=(40,40,40)); y+=26
  d.ellipse([x0,y+2,x0+16,y+18],fill=(255,255,255),outline=(30,30,30),width=2); d.text((x0+26,y),'现有可交互点（10-21 盘点于 8792，风起第一天白天）',font=font(14),fill=(40,40,40)); y+=26
  d.rectangle([x0,y+4,x0+18,y+18],outline=(255,215,0),width=3); d.text((x0+26,y),'新增建筑／地面布置的大致占地（虚线框）',font=font(14),fill=(40,40,40)); y+=26
  if cfg.get('lines'): d.line([(x0,y+11),(x0+18,y+11)],fill=(120,120,120),width=3); d.text((x0+26,y),'虚线：视线或运粮路线（说明设计理由）',font=font(14),fill=(40,40,40)); y+=26
  canvas.save(OUT+f'layout-{key}.png'); print(key,canvas.size,'legend_bottom',y)
for k,c in MAPS.items(): render(k,c)
