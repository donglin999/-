"""Compile generated images using image-reviewed footprints, not original graybox boxes."""
from pathlib import Path
from PIL import Image,ImageDraw
import json,base64,hashlib,numpy as np,shutil
ROOT=Path(__file__).resolve().parents[2];S=ROOT/'art_sources/qihe-expansion-v1'
def box(x,y,w,h):return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]]
def obj(id,foot,visual=None):return dict(id=id,footprint=box(*foot),foreground=box(*(visual or foot)),sortY=foot[1]+foot[3])
def roof(id,visual,sort_y):return dict(id=id,footprint=[],foreground=box(*visual),sortY=sort_y)
# All exterior additions use source coordinates 1:1 with world coordinates.
scenes={
 'south':dict(name='南村口 · 客栈外院',start=[690,120],poly=[[590,0],[770,0],[800,70],[1300,95],[1400,155],[1420,510],[1536,540],[1536,700],[1390,740],[1420,880],[1270,950],[360,945],[160,900],[100,770],[0,705],[0,520],[120,505],[125,330],[100,140],[340,85],[570,90]],objects=[obj('apothecary',(155,260,320,88),(138,143,350,210)),obj('shelter',(920,325,360,30),(920,120,360,235)),obj('tea-table',(1040,280,110,60)),obj('cart',(250,680,195,80),(250,645,195,120))],anchors=dict(north=[680,60],west=[60,610],east=[1470,620],merchant=[325,440],innkeeper=[580,350],steward=[1180,475],retainer=[1290,475],wukui=[720,700],bandit=[820,740],luheng=[510,800],entry=[680,160])),
 'east':dict(name='栖河东埠 · 晒药与装卸',start=[100,435],poly=[[0,360],[180,355],[190,220],[300,140],[510,90],[895,90],[1120,210],[1235,380],[1260,565],[1250,730],[1200,875],[650,930],[395,940],[350,1024],[200,1024],[180,900],[105,850],[125,545],[0,510]],objects=[obj('shade',(550,280,330,40),(550,85,330,225)),obj('rack-a',(955,386,225,40),(955,320,225,110)),obj('rack-b',(955,566,225,40),(950,475,230,137))],anchors=dict(west=[65,435],south=[275,965],procurement=[670,425],procurement_aide=[820,445],chengduo=[400,580],bailiff=[500,745],wukui=[780,710],entry=[160,435],loading=[855,665])),
 'west':dict(name='西田埂 · 练场与药车道',start=[1390,510],poly=[[0,490],[155,470],[200,285],[220,60],[560,60],[700,130],[1300,80],[1420,190],[1420,440],[1536,440],[1536,580],[1390,590],[1420,850],[1370,920],[1370,1024],[1150,1024],[1120,900],[920,940],[170,890],[100,760],[100,620],[0,640]],objects=[obj('shed',(240,240,300,45),(240,80,300,210)),obj('cart',(1070,225,230,55),(1070,150,230,135)),obj('target',(1000,420,60,30),(1000,325,60,125))],anchors=dict(east=[1460,510],south=[1260,960],west=[65,560],luheng=[770,435],chen=[1160,350],training=[880,510],guard=[700,610],entry=[1370,510])),
 'north':dict(name='后山采药路',start=[790,920],poly=[[680,1024],[900,1024],[950,880],[1120,885],[1280,750],[1300,495],[1360,425],[1400,260],[1270,145],[1080,85],[620,95],[430,120],[190,180],[135,400],[210,650],[390,820],[600,875]],objects=[obj('tree',(343,415,42,30),(200,145,330,320)),obj('log',(750,238,250,43),(750,205,250,75)),obj('rock',(1110,345,235,95),(1110,280,245,165))],anchors=dict(south=[790,965],ye=[835,665],clue=[680,820],entry=[790,870],hero=[650,670],wolf1=[470,580],wolf2=[475,720])),
 'refuge':dict(name='邻村 · 接应院',start=[1440,535],poly=[[100,80],[640,80],[665,0],[835,0],[860,80],[1400,90],[1430,430],[1536,455],[1536,610],[1430,615],[1400,925],[825,925],[825,1024],[675,1024],[675,920],[130,930]],objects=[obj('room',(180,300,405,88),(180,95,405,300)),obj('shelter',(900,345,370,35),(900,105,370,280)),obj('table',(940,698,160,62),(940,630,160,135))],anchors=dict(east=[1450,535],north=[750,60],south=[750,960],aunt=[405,480],chen=[260,465],elder=[575,530],censhuang=[1190,450],chengduo=[1120,790],zhouyan=[740,540],luheng=[705,750],entry=[1360,535])),
 'mountain':dict(name='归云谷 · 山居客院',start=[735,930],poly=[[70,115],[510,65],[555,0],[945,0],[1000,65],[1430,130],[1420,770],[1200,880],[870,900],[835,1024],[610,1024],[600,900],[150,850],[65,590]],objects=[obj('xiao-room',(115,300,365,100),(115,125,365,280)),obj('ye-room',(1020,300,350,100),(1020,125,350,280)),obj('kitchen',(570,200,350,90),(570,30,350,260)),obj('table',(345,640,180,55),(345,560,180,140)),obj('herbs',(915,695,305,35),(915,560,305,175))],anchors=dict(south=[735,965],zhouyan=[770,425],ye=[1100,485],luheng=[650,680],xiao_door=[300,440],ye_door=[1190,440],kitchen=[745,330],meal=[470,750],training=[680,525],entry=[735,865]))}
# Open-sided shelters: poles/table block feet; the roof only occludes.
scenes['south']['objects']=[o for o in scenes['south']['objects'] if o['id']!='shelter']+[obj('shelter-left-post',(928,320,20,32),(928,235,20,117)),obj('shelter-right-post',(1260,320,20,32),(1260,235,20,117)),roof('shelter-roof',(920,120,360,124),352)]
scenes['east']['objects']=[o for o in scenes['east']['objects'] if o['id']!='shade']+[obj('shade-left-post',(564,278,18,28),(564,190,18,116)),obj('shade-right-post',(838,278,18,28),(838,190,18,116)),roof('shade-roof',(550,85,330,120),306),obj('register-table',(665,260,101,31),(665,235,101,63)),obj('register-stool',(693,292,38,15),(693,278,38,30))]
scenes['refuge']['objects']=[o for o in scenes['refuge']['objects'] if o['id']!='shelter']+[obj('refuge-left-post',(910,350,20,30),(910,235,20,145)),obj('refuge-right-post',(1250,350,20,30),(1250,235,20,145)),roof('refuge-roof',(900,105,370,140),380)]
# Review points under the visible open roofs catch invisible crossbars.
scenes['east']['anchors']['shade-floor']=[790,290]
scenes['south']['anchors']['shelter-floor']=[1200,335]
scenes['refuge']['anchors']['shelter-floor']=[1090,355]
compiled={};manifest=[]
for key,m in scenes.items():
 im=Image.open(S/(key+'.png')).convert('RGBA');assert im.size==(1536,1024)
 mask=Image.new('1',(768,512));d=ImageDraw.Draw(mask);d.polygon([(x/2,y/2)for x,y in m['poly']],fill=1)
 fg=Image.new('RGBA',im.size);fgp=[]
 for o in m['objects']:
  if o['footprint']:d.polygon([(x/2,y/2)for x,y in o['footprint']],fill=0)
  alpha=Image.new('L',im.size);ImageDraw.Draw(alpha).polygon([tuple(p)for p in o['foreground']],fill=255);fg.paste(im,(0,0),alpha)
  x,y,xx,yy=alpha.getbbox();fgp.append([x,y,xx-x,yy-y,o['sortY']])
 bg='m_qh_'+key;im.save(ROOT/'assets'/f'{bg}.webp',lossless=True);fg.save(ROOT/'assets'/f'{bg}_fg.webp',lossless=True)
 enc=base64.b64encode(np.packbits(np.asarray(mask,dtype=np.uint8).reshape(-1)).tobytes()).decode()
 compiled[key]={**m,'worldSize':[1536,1024],'sourceScale':1,'bg':bg,'fg':bg+'_fg','fgp':fgp,'mask':dict(w=768,h=512,d=enc)}
 overlay=im.copy();od=ImageDraw.Draw(overlay);od.line([tuple(p)for p in m['poly']]+[tuple(m['poly'][0])],fill='#32e090',width=3)
 for o in m['objects']:
  if o['footprint']:od.line([tuple(p)for p in o['footprint']]+[tuple(o['footprint'][0])],fill='#ff5555',width=3)
 for label,(x,y)in m['anchors'].items():od.ellipse((x-14,y-5,x+14,y+5),outline='#ffe550',width=2);od.text((x+16,y),label,fill='white',stroke_width=1,stroke_fill='black')
 overlay.save(S/(key+'-collision.png'))
 manifest.append(dict(id=key,sourceSize=list(im.size),worldSize=[1536,1024],density=1,sha256=hashlib.sha256((S/(key+'.png')).read_bytes()).hexdigest(),status='playable-prototype',productionReady=False,remaining=['door-scale review','browser acceptance']))
# Central edit: retain every reviewed building, open only four edited edge corridors.
original=json.loads((ROOT/'art_sources/qihe-v1/spatial.json').read_text());K=original['sourceScale'];im=Image.open(S/'central.png').convert('RGBA');mask=Image.new('1',(1200,800));d=ImageDraw.Draw(mask)
sc=lambda poly:[(x*K/2,y*K/2)for x,y in poly];d.polygon(sc(original['walkPolygon']),fill=1)
for p in [box(595,0,170,180),box(0,430,180,65),box(620,910,115,114),box(1270,373,266,46)]:d.polygon(sc(p),fill=1)
fg=Image.new('RGBA',im.size);fgp=[]
for o in original['objects']:
 d.polygon(sc(o['footprint']),fill=0);alpha=Image.new('L',im.size);ImageDraw.Draw(alpha).polygon([tuple(p)for p in o['foreground']],fill=255);fg.paste(im,(0,0),alpha)
 x,y,xx,yy=alpha.getbbox();fgp.append([x*K,y*K,(xx-x)*K,(yy-y)*K,o['sortY']*K])
im.save(ROOT/'assets/m_qh_central.webp',lossless=True);fg.save(ROOT/'assets/m_qh_central_fg.webp',lossless=True)
compiled['central']=dict(worldSize=[2400,1600],sourceScale=K,bg='m_qh_central',fg='m_qh_central_fg',fgp=fgp,mask=dict(w=1200,h=800,d=base64.b64encode(np.packbits(np.asarray(mask,dtype=np.uint8).reshape(-1)).tobytes()).decode()),anchors={**{k:[v*K for v in p]for k,p in original['anchors'].items()},**{k:[v*K for v in p]for k,p in dict(north=[680,65],west=[60,462],south=[680,965],east=[1470,397]).items()}})
import sys;sys.path.insert(0,str(Path(__file__).parent));from modular_maps import apply as apply_modular;apply_modular(compiled)   # 已采用的模块化地图覆盖整图 bg/fg
(ROOT/'js/qihe-expansion-data.js').write_text('// Authored/image-reviewed by tools_scene/qihe/build_expansion.py\nwindow.QIHE_EXPANSION='+json.dumps(compiled,ensure_ascii=False,separators=(',',':'))+';\n')
(S/'reviewed-layout.json').write_text(json.dumps(scenes,ensure_ascii=False,indent=2));(S/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2));print('Compiled six exterior maps + four central exits')
