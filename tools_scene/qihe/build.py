"""Compile a reviewed spatial contract; never infer collision from generated pixels."""
from pathlib import Path
from PIL import Image, ImageDraw
import json, base64, hashlib, numpy as np
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'art_sources/qihe-v1'
def rect(x,y,w,h): return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]]
# Coordinates are in the actual 1536×1024 generated source, NOT the requested size.
# Footprints describe ground contact; foregrounds describe projected silhouettes.
objects=[
 dict(id='ye-home',purpose='叶家私宅，药箱整理',footprint=rect(190,217,294,91),sortY=319,foreground=[[170,143],[202,105],[207,93],[224,105],[458,105],[470,94],[477,119],[505,148],[505,210],[481,230],[488,313],[477,327],[383,329],[383,336],[298,336],[298,324],[188,324],[187,233],[170,216]],approach=[335,352]),
 dict(id='chen-home',purpose='陈家，独立客房与修理院',footprint=rect(801,217,290,94),sortY=321,foreground=[[779,141],[809,108],[815,96],[836,108],[1064,107],[1079,96],[1087,123],[1116,146],[1112,218],[1095,235],[1097,324],[986,328],[986,338],[902,338],[902,330],[799,325],[798,232],[777,216]],approach=[944,356]),
 dict(id='inn',purpose='客栈，布巾取送',footprint=rect(174,674,325,111),sortY=789,foreground=[[145,582],[174,556],[190,547],[198,532],[213,546],[470,547],[483,532],[493,561],[522,579],[532,667],[502,693],[503,790],[380,796],[380,816],[279,816],[279,795],[170,792],[171,696],[146,684]],approach=[333,842]),
 dict(id='clinic',purpose='药铺，临时救治与晒药',footprint=rect(1104,573,270,102),sortY=677,foreground=[[1079,482],[1108,460],[1115,443],[1132,456],[1348,456],[1366,444],[1374,470],[1401,489],[1403,570],[1380,588],[1377,684],[1290,686],[1290,699],[1193,699],[1193,689],[1100,683],[1100,586],[1080,579]],approach=[1238,726]),
 dict(id='elder-home',purpose='村口老人，送药',footprint=rect(727,769,253,96),sortY=865,foreground=[[702,694],[734,679],[742,658],[762,672],[958,671],[971,658],[979,680],[1002,695],[1003,767],[984,785],[986,869],[895,870],[895,885],[811,885],[811,872],[724,870],[723,784],[702,773]],approach=[852,906]),
 dict(id='repair-bench',purpose='陈伯修理工具，不占主路',footprint=rect(1140,310,91,25),sortY=335,foreground=[[1131,267],[1238,263],[1242,279],[1231,284],[1235,339],[1132,340]],approach=[1184,356]),
 dict(id='cloth-rack',purpose='客栈布巾取送目标',footprint=rect(108,864,109,13),sortY=877,foreground=[[100,800],[222,800],[219,880],[107,880]],approach=[165,902]),
 dict(id='herbs',purpose='河畔晒药，仅一张药筛',footprint=rect(1298,732,57,16),sortY=747,foreground=[[1296,708],[1320,695],[1353,705],[1362,721],[1354,751],[1295,751]],approach=[1318,778]),
 dict(id='notice',purpose='村中告示，区位导览',footprint=rect(1031,891,59,18),sortY=909,foreground=[[1020,833],[1095,832],[1101,849],[1090,854],[1093,911],[1026,911],[1029,853],[1020,850]],approach=[1060,934]),
 dict(id='north-tree',purpose='北岸可见树干边界',footprint=rect(1207,103,26,20),sortY=122,foreground=[[1160,29],[1210,16],[1250,27],[1270,68],[1240,111],[1227,126],[1208,126],[1206,102],[1166,85]],approach=[1160,143])
]
# Visible cliffs and stone river lip; open lawns inside remain walkable.
perimeter=[[103,121],[128,82],[230,67],[353,76],[465,72],[570,86],[601,73],[611,72],[638,70],[670,68],[709,80],[751,67],[837,80],[933,73],[1070,72],[1160,84],[1271,137],[1295,182],[1345,218],[1363,262],[1346,313],[1349,348],[1371,394],[1381,425],[1380,443],[1370,485],[1385,560],[1387,632],[1380,696],[1385,756],[1357,799],[1374,840],[1351,885],[1309,914],[1240,918],[1190,939],[1111,953],[990,962],[923,947],[836,969],[745,955],[684,967],[590,954],[530,950],[474,955],[410,936],[363,936],[312,941],[278,941],[252,919],[193,930],[150,919],[118,887],[83,875],[82,817],[93,770],[72,722],[84,677],[66,626],[81,581],[61,525],[75,475],[66,417],[78,376],[64,330],[79,302],[109,313],[126,277],[104,233],[78,211],[84,169]]
board={'version':'qihe-v1','sourceSize':[1536,1024],'worldSize':[2400,1600],'sourceScale':1.5625,'footHalfWidth':14,'maskCell':2,'navCell':8,'start':[669,180],'walkPolygon':perimeter,'objects':objects,'anchors':{'start':[669,180],**{o['id']:o['approach'] for o in objects},'crossroads':[700,414],'lawn':[920,515],'west-lane':[120,550],'east-lane':[1284,415],'south-lane':[681,908]}}
(SRC/'spatial.json').write_text(json.dumps(board,ensure_ascii=False,indent=2)+'\n')
assert hashlib.sha256((SRC/'generated-village.png').read_bytes()).hexdigest()=='4a3404922984bdc2c1f8133f86902f445371224393e1a483ebd16899c4bbdeba', 'Source image changed: review spatial geometry before rebuilding'
im=Image.open(SRC/'generated-village.png').convert('RGBA');assert im.size==tuple(board['sourceSize'])
im.save(ROOT/'assets/m_qihe_trial_v1.webp',lossless=True)
K=board['sourceScale'];w,h=board['worldSize'];mask=Image.new('1',(w//2,h//2));d=ImageDraw.Draw(mask)
scale=lambda poly:[(round(x*K/2),round(y*K/2)) for x,y in poly]
d.polygon(scale(perimeter),fill=1)
fg=Image.new('RGBA',im.size);fgp=[]
for o in objects:
 d.polygon(scale(o['footprint']),fill=0)
 alpha=Image.new('L',im.size);ImageDraw.Draw(alpha).polygon([tuple(p) for p in o['foreground']],fill=255)
 fg.paste(im,(0,0),alpha)
 x0,y0,x1,y1=alpha.getbbox();fgp.append([x0*K,y0*K,(x1-x0)*K,(y1-y0)*K,o['sortY']*K])
fg.save(ROOT/'assets/m_qihe_trial_v1_fg.webp',lossless=True)
a=np.asarray(mask,dtype=np.uint8).reshape(-1);encoded=base64.b64encode(np.packbits(a).tobytes()).decode()
scene={'mask':{'w':w//2,'h':h//2,'d':encoded},'fgp':fgp,'anchors':{k:[x*K,y*K] for k,(x,y) in board['anchors'].items()},'worldSize':[w,h],'sourceScale':K,'objects':objects}
(ROOT/'js/qihe-map-data.js').write_text('// Generated by tools_scene/qihe/build.py; edit its spatial contract.\nwindow.QIHE_MAP_DATA='+json.dumps(scene,ensure_ascii=False,separators=(',',':'))+';\n')
overlay=im.copy();ov=Image.new('RGBA',im.size);od=ImageDraw.Draw(ov);od.polygon([tuple(p) for p in perimeter],fill=(70,170,220,35),outline=(60,255,170,230),width=2)
for o in objects:od.polygon([tuple(p) for p in o['footprint']],fill=(240,70,60,110),outline=(255,60,40),width=2)
for name,(x,y) in board['anchors'].items():od.ellipse((x-4,y-4,x+4,y+4),fill=(255,235,50));od.text((x+5,y),name,fill=(255,255,255),stroke_width=1,stroke_fill=(0,0,0))
overlay.alpha_composite(ov);overlay.save(SRC/'collision-review.png')
manifest={'generator':'built-in image_gen','requestedSize':[1920,1280],'actualSize':list(im.size),'worldSize':[w,h],'productionReady':False,'reason':'map trial; source density 0.64 source pixel/world unit; exterior only; browser input not yet verified','sha256':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [SRC/'generated-village.png',SRC/'layout-guide.png',SRC/'legacy-style-reference.png',SRC/'prompt.txt',SRC/'spatial.json']}}
(SRC/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('Compiled Qihe: 10 semantic objects, 16 anchors, 2-unit collision mask.')
