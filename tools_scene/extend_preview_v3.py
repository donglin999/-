"""Annotate generated full-room previews; coordinates are source pixels.
No raster editing or arbitrary placement. Kept separate from legacy maps.
"""
from pathlib import Path
import json
ROOT=Path(__file__).resolve().parents[1];p=ROOT/'art_sources/chapter1_preview_v3/authoring-board.json';b=json.loads(p.read_text())
def rect(x,y,w,h):return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]]
def room(key,name,source,start,walk,scale=.6):return {'id':key,'name':name,'source':'art_sources/chapter1_preview_v3/'+source,'sourceSize':[1536,1024],'worldScale':scale,'adultHeight':92,'start':start,'walkPolygons':walk,'obstacles':[],'foreground':[],'anchors':{'entry':start},'interactions':[]}
def obj(r,id,bounds,why,visual=None):
 x,y,w,h=bounds;r['obstacles'].append({'id':id,'polygon':rect(x,y,w,h),'purpose':why})
 if visual:r['foreground'].append({'id':id,'sortY':y+h,'polygon':visual,'purpose':why+'遮挡'})
def node(r,id,at,name,destination=None,arrival=None,action=None,sp=None,description=None):
 r['anchors'][id]=at;n={'id':id,'at':at,'name':name}
 for k,v in [('destination',destination),('arrival',arrival),('action',action),('sp',sp),('description',description)]:
  if v is not None:n[k]=v
 r['interactions'].append(n)
mainwalk=[[[180,343],[1353,343],[1353,811],[890,811],[890,880],[620,880],[620,811],[180,811]]]
c=room('clinic_interior','药棚 · 问诊与备药','clinic-preview.png',[775,744],mainwalk+[rect(1118,142,114,210)])
for id,bb,why,vis in [
('treatment_cot',[205,300,112,153],'处理榻',rect(200,190,126,270)),('treatment_stool',[328,412,47,53],'处理榻旁小凳',rect(326,383,51,82)),('wash',[360,280,80,49],'清洗台',None),('screen',[422,335,107,200],'诊疗屏风',[[418,317],[534,260],[531,455],[420,544]]),('screen_plant',[460,520,41,23],'屏风脚盆栽',rect(450,477,55,66)),
('medicine_cabinet',[613,281,287,64],'药柜',rect(609,148,296,195)),('shelf',[915,280,154,63],'药架',rect(911,138,163,205)),
('consultation_desk',[560,486,292,98],'问诊案',rect(552,420,305,164)),('doctor_chair',[695,390,64,41],'医师座椅',None),('patient_stool',[681,582,60,47],'病人座椅',None),
('preparation',[1230,457,130,257],'配药案及罐筐',rect(1216,325,145,414)),('prep_stool',[1168,490,48,52],'配药座椅',None),('waiting',[246,709,224,45],'等候凳',rect(240,644,230,110)),('water_stand',[480,706,66,48],'饮水小台',None)]:obj(c,id,bb,why,vis)
node(c,'exit',[775,843],'药棚前门 · 回村','village',[542,377]);node(c,'service_exit',[1172,282],'备药出口 · 后路','village',[741,195]);node(c,'aunt',[968,567],'周婶 · 村中小事',action='aunt',sp='c_gossip');node(c,'work',[1100,625],'配药工作区',description='这里用于备药和短暂处理伤病；萧白不诊断，也不擅自开方。借宿另在陈伯家。')
c['anchors'].update(entry_front=c['start'],entry_back=[1172,353],cot_side=[360,505],waiting_side=[567,699])
h=room('chen_hall','陈伯家 · 家用门厅','chen-hall-preview.png',[778,735],mainwalk+[rect(1177,308,142,331)])
for id,bb,why,vis in [('tools',[199,367,159,114],'工具架',rect(193,190,170,292)),('timber',[185,493,111,95],'靠墙备用木料',None),('cabinet',[404,290,150,56],'家用柜',None),('altar',[650,268,238,42],'家中供案',None),('altar_stool',[740,310,72,36],'供案旁凳',None),('clothes',[943,299,140,59],'衣物柜',None),('table',[548,468,184,112],'家用饭桌',rect(541,382,197,198)),('bench_left',[487,475,47,111],'饭桌左凳',None),('bench_right',[750,475,47,111],'饭桌右凳',None),('shoes',[247,710,160,45],'入口鞋架',None),('plant',[981,734,82,47],'入口花架',None)]:obj(h,id,bb,why,vis)
node(h,'exit',[775,845],'出门回陈伯院','village',b['scenes']['village']['anchors']['chen']);node(h,'guest_door',[1248,650],'内门 · 独立借宿客房','chen_guest');node(h,'chen',[951,562],'陈伯 · 还碗',action='chen',sp='c_oldman');h['anchors']['table_side']=[865,556]
g=room('chen_guest','陈伯家 · 萧白独立借宿客房','chen-guest-preview.png',[769,734],[[[416,339],[1090,339],[1090,722],[861,722],[861,839],[672,839],[672,722],[416,722]]])
for id,bb,why,vis in [('bed',[450,317,135,182],'借宿床',rect(443,196,150,305)),('bed_foot_chest',[450,485,135,54],'床脚衣箱',None),('bedside',[595,302,80,32],'床旁台',None),('desk',[827,325,233,77],'窗下书桌',rect(817,253,247,146)),('chair',[877,397,67,58],'书桌椅',None),('travel_chest',[1002,502,83,79],'靠墙行李柜',None),('wash',[463,665,93,58],'门边洗手架',None)]:obj(g,id,bb,why,vis)
node(g,'exit',[765,811],'回陈伯家门厅','chen_hall',[1248,650]);node(g,'rest',[711,476],'借宿榻 · 收拾歇息',action='rest');node(g,'modern',[941,622],'自己的衣包与关机手机',description='现代衣包与手机归萧白保管；手机无信号，没有新消息，也没有获得武器。');g['anchors']['desk_side']=[807,480]
i=room('inn_interior','客栈 · 接待与用餐','inn-preview.png',[775,747],mainwalk,scale=.7)
for id,bb,why,vis in [('table_nw',[249,315,112,84],'北左餐桌',rect(246,244,118,158)),('table_ne',[490,315,111,85],'北右餐桌',rect(485,243,123,163)),('table_sw',[305,582,140,98],'南侧餐桌',rect(299,487,151,193)),('seat_nw_s',[275,409,57,33],'配套餐凳',None),('seat_nw_w',[211,363,31,42],'配套餐凳',None),('seat_nw_e',[367,363,30,42],'配套餐凳',None),('seat_ne_s',[516,409,57,33],'配套餐凳',None),('seat_ne_w',[454,365,29,43],'配套餐凳',None),('seat_ne_e',[608,365,30,43],'配套餐凳',None),('seat_sw_w',[257,550,35,43],'配套餐凳',None),('seat_sw_e',[457,550,34,43],'配套餐凳',None),('seat_sw_s',[347,675,63,42],'配套餐凳',None),('counter',[723,349,359,71],'接待账台',rect(710,286,375,134)),('counter_shelf',[797,244,273,53],'账台背柜',None),('kitchen_partition',[1096,423,184,166],'后厨隔墙',rect(1090,417,193,173)),('luggage',[1220,602,107,71],'靠墙行李',None),('bench',[1026,744,192,24],'入口等候凳',None)]:obj(i,id,bb,why,vis)
node(i,'exit',[775,843],'出门回客栈前场','village',[1248,711]);node(i,'innkeeper',[940,518],'店家 · 受托取布',action='cloth',sp='c_merchant');node(i,'cloth',[1119,679],'受托布包',action='cloth');node(i,'table_view',[645,592],'客栈餐桌',description='餐桌供往来客人用餐，凳子按桌配对。受托取布找店家，不擅自取柜中物品。');i['anchors']['counter_side']=[901,490]
for r in [c,h,g,i]:
 r['foreground'] += [{'id':'south_wall_left','sortY':892 if r is not g else 846,'polygon':rect(105,774,513,119) if r is not g else rect(345,727,326,120),'purpose':'前墙遮挡'},{'id':'south_wall_right','sortY':892 if r is not g else 846,'polygon':rect(891,774,515,119) if r is not g else rect(861,727,320,120),'purpose':'前墙遮挡'}]
 b['scenes'][r['id']]=r
v=b['scenes']['village'];v['name']='栖河村 · 预览先行序章';v['anchors'].update(clinic_back=[741,195]);v['interactions']=[n for n in v['interactions'] if n['id']!='clinic_back']
for n in v['interactions']:
 if n['id']=='clinic':n.update(destination='clinic_interior');n.pop('description',None)
 if n['id']=='chen':n.update(destination='chen_hall');n.pop('description',None)
 if n['id']=='inn':n.update(destination='inn_interior');n.pop('description',None)
 if n['id']=='elder':n.update(action='elder',sp='c_oldman');n.pop('description',None)
 if n['id']=='ye_home':n['action']='inviteHome'
node(v,'clinic_back',[741,195],'药棚备药后路 · 入内','clinic_interior',c['anchors']['entry_back'])
y=b['scenes']['ye_home'];y['name']='叶蘅家 · 居所与医师工作间';y['interactions']=[n for n in y['interactions'] if n['id'] not in ('relic','ye')];node(y,'ye',[1030,695],'叶蘅 · 收药箱',action='relic',sp='c_ye');y['anchors']['relic']=[1030,695]
if not str(b.get('revision','')).startswith('3.3'):
 b['revision']='3.2-room-and-prologue'
b['status']='rooms-implemented-pending-runtime-and-visual-review';p.write_text(json.dumps(b,ensure_ascii=False,indent=2)+'\n');print('Annotated six scenes, 5 furnished interiors; revision',b['revision'])
