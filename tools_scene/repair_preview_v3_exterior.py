"""Exterior review r3.3: author grounded volumes and every visible fence span.
Coordinates are pixels in the reviewed AI preview; no raster modification.
"""
from pathlib import Path
import json, shutil
ROOT=Path(__file__).resolve().parents[1]
path=ROOT/'art_sources/chapter1_preview_v3/authoring-board.json'
history=ROOT/'review/chapter1-preview-v3/exterior-r3.3/history/authoring-before.json'
if not history.exists(): shutil.copy2(path,history)
b=json.loads(path.read_text());v=b['scenes']['village']
def rect(x,y,w,h):return [[x,y],[x+w,y],[x+w,y+h],[x,y+h]]
def solid(id,p,why):v['obstacles'].append({'id':id,'polygon':p,'purpose':why})
def foreground(id,p,y,why):v['foreground'].append({'id':id,'polygon':p,'sortY':y,'purpose':why})
v['source']='art_sources/chapter1_preview_v3/village-preview-chen-clear-v4.png'
v['obstacles']=[];v['foreground']=[]
# Whole grounded volumes, including the depth behind the front facade.
for id,bb,why in [
 ('clinic_body',(402,205,255,150),'药棚完整屋身地面投影'),
 ('clinic_annex',(656,230,76,115),'备药附屋实体'),
 ('home_body',(802,105,194,105),'叶家完整屋身'),
 ('chen_body',(1165,151,164,147),'陈家完整屋身'),
 ('chen_workshop',(1065,166,100,120),'左侧修车棚含工作架与立柱'),
 ('chen_log_shed',(1329,173,105,106),'右侧储木棚'),
 ('chen_cart',(1390,290,72,32),'推车沿木棚停放'),
 ('inn_body',(1021,478,378,195),'客栈完整屋身'),
 ('inn_side_store',(1399,575,91,91),'客栈侧库房'),
 ('inn_table',(1078,645,61,20),'门廊餐桌'),
 ('inn_bench',(1081,679,54,23),'配套餐凳'),
 ('inn_crates',(1402,665,121,54),'侧库外装卸推车'),
 ('elder_body',(630,633,190,125),'老人屋完整地面占位'),
 ('elder_garden',(505,650,97,140),'围栏内菜畦'),
 ('clinic_drying',(746,296,54,58),'靠附屋晒药架'),
 ('clinic_jars_w',(407,338,34,24),'药棚西侧水罐'),
 ('clinic_jars_e',(655,337,28,18),'药棚东侧药罐'),
 ('home_water',(776,179,34,32),'叶家屋侧水罐'),
 ('home_basket',(911,218,27,22),'屋侧药材筐'),
 ('home_clothes_posts',(947,211,69,7),'晾衣架落地支撑'),
 ('elder_water_w',(606,720,27,29),'老人屋侧水罐'),
 ('elder_water_e',(817,736,36,25),'老人屋侧储水罐'),
 ('center_tree_trunk',(697,480,47,39),'中心树落地树根'),
 ('north_tree_trunk',(537,79,26,31),'北树落地树根'),
 ('chen_north_tree',(1087,83,20,29),'陈家北侧树根'),
 ('inn_east_tree',(1477,505,20,29),'客栈东侧树根'),
 ('garden_tree_trunk',(1130,940,50,44),'南园旁树根'),
]:solid(id,rect(*bb),why)
# Continuous masonry and fence spans. Open leaves are separate, gaps stay walkable.
for id,p,why in [
 ('home_wall_left',rect(806,302,71,25),'叶家南墙西段'),
 ('home_wall_right',rect(950,304,70,23),'叶家南墙东段'),
 ('home_wall_west_upper',rect(739,231,85,22),'叶家西墙横段'),
 ('home_wall_west_lower',rect(810,253,14,46),'叶家西墙竖段'),
 ('home_wall_east',rect(1003,194,25,112),'叶家东墙完整侧段含墙脚厚度'),
 ('home_gate_left',rect(873,284,20,50),'打开的叶家西门扇'),
 ('home_gate_right',rect(930,284,20,45),'打开的叶家东门扇'),
 ('north_garden_wall_w',rect(616,91,95,27),'北菜园南墙西段'),
 ('north_garden_wall_e',rect(756,90,44,24),'北菜园南墙东段'),
 ('north_garden_gate_w',rect(705,64,15,55),'北菜园西门扇'),
 ('north_garden_gate_e',rect(752,64,15,54),'北菜园东门扇'),
 ('north_garden_fence_w',rect(636,0,13,92),'北菜园西栏'),
 ('north_garden_fence_s',rect(642,40,64,11),'北菜园内部竹架'),
 ('north_garden_fence_e',rect(786,0,12,82),'北菜园东栏'),
 ('chen_fence_w',rect(1053,117,13,241),'陈家左侧连续栏杆'),
 ('chen_fence_s_w',rect(1060,337,133,16),'陈家院门左栏'),
 ('chen_fence_s_e',rect(1289,335,180,17),'陈家院门右栏'),
 ('chen_fence_e',rect(1471,196,15,149),'陈家右侧栏杆'),
 ('chen_fence_ne',[[1399,112],[1410,113],[1410,164],[1400,164]],'储木棚后栏'),
 ('top_fence_w',[[1285,16],[1372,26],[1371,52],[1286,43]],'村北道路西侧栅栏'),
 ('top_wall',rect(1375,0,19,65),'村北石墙柱'),
 ('top_fence_e',rect(1451,40,85,18),'村北道路东侧栅栏'),
 ('elder_wall_s_w',rect(511,815,173,25),'老人南院墙西段'),
 ('elder_wall_s_e',rect(760,816,189,27),'老人南院墙东段'),
 ('elder_gate_w',rect(682,791,21,55),'老人西门扇'),
 ('elder_gate_e',rect(742,791,20,55),'老人东门扇'),
 ('elder_wall_e',[[891,654],[904,654],[950,824],[934,826]],'老人院东墙'),
 ('elder_wall_n',[[820,637],[858,652],[899,684],[891,696],[847,670],[820,651]],'老人院屋东后墙'),
 ('elder_fence_w',rect(490,625,13,206),'老人院西栏'),
 ('elder_fence_n',rect(498,638,107,14),'老人菜园北栏'),
 ('elder_fence_garden_e',rect(598,644,14,113),'老人菜园东栏'),
 ('elder_fence_garden_s',rect(503,781,107,14),'老人菜园南栏'),
 ('center_tree_fence',[[592,470],[646,489],[644,502],[591,484]],'中心树旁短栏'),
 ('inn_signpost',rect(943,541,15,78),'客栈招幡立柱'),
 ('inn_east_fence_n',rect(1400,459,37,11),'客栈东侧北短栏'),
 ('inn_east_fence_e',rect(1511,553,15,94),'客栈东侧栏杆'),
 ('south_garden_wall_w',[[1233,900],[1264,898],[1256,971],[1244,991],[1228,987],[1223,939]],'南菜园西侧石墙完整折段，用户截图问题点'),
 ('south_garden_wall_n',rect(1375,860,161,25),'南菜园北石墙'),
 ('south_garden_wall_s',[[1250,1000],[1536,979],[1536,1004],[1250,1024]],'南菜园南墙斜段'),
 ('south_garden_fence_w',rect(1255,937,14,63),'南菜园西侧栅栏'),
 ('south_garden_fence_n',rect(1231,837,305,20),'南菜园北侧栅栏'),
 ('south_garden_fence_s',[[1266,972],[1536,953],[1536,972],[1266,991]],'南菜园南侧栅栏'),
]:solid(id,p,why)
for id,p,y in [
 ('clinic',[[390,254],[396,150],[650,142],[674,171],[733,192],[733,347],[655,355],[410,355]],355),
 ('home',[[791,61],[988,48],[1018,81],[1018,204],[994,210],[802,210]],210),
 ('chen',[[1050,126],[1161,97],[1239,60],[1337,104],[1438,139],[1443,276],[1328,299],[1165,299],[1066,285]],299),
 ('inn',[[976,500],[1020,455],[1020,400],[1358,393],[1399,426],[1399,494],[1493,540],[1493,666],[1399,685],[1020,685],[1013,573],[976,566]],685),
 ('elder',[[619,668],[631,579],[811,577],[828,610],[828,752],[629,759]],759),
 ('center_tree',[[619,432],[640,391],[689,354],[756,352],[794,373],[825,425],[814,473],[774,478],[745,521],[690,518],[684,478],[641,477]],523),
 ('garden_tree',[[1020,885],[1067,828],[1130,800],[1205,824],[1228,890],[1199,934],[1180,984],[1130,984],[1098,938],[1058,928]],985),
 ('north_tree',[[449,12],[526,0],[609,4],[638,56],[608,87],[566,109],[537,110],[518,87],[471,83]],111),
 ('chen_north_tree',[[1025,5],[1090,0],[1190,4],[1210,49],[1178,81],[1108,105],[1080,111],[1060,88],[1030,80]],112),
 ('garden_north_canopies',[[1180,817],[1220,746],[1290,744],[1360,792],[1420,777],[1494,747],[1536,740],[1536,890],[1438,887],[1360,860],[1285,853],[1226,859]],885),
 ('bridge_front_rail',rect(52,533,382,18),551),
]:foreground(id,p,y,'完整建筑/树冠/前栏杆遮挡')
# Each fence/wall also gets depth-aware foreground, never blocking the full canopy.
for o in v['obstacles']:
 if any(s in o['id'] for s in ('wall','fence','gate')):
  foreground(o['id'],o['polygon'],max(p[1] for p in o['polygon']),o['purpose']+'遮挡')
v['anchors']['chen']=[1251,312]
v['anchors'].update(chen_gate_out=[1241,380],chen_gate_in=[1241,327],chen_west_lane=[1040,212],chen_north_lane=[1121,99],garden_wall_out=[1191,937],garden_south_out=[1210,1012],garden_north_out=[1325,818],elder_east_lane=[965,760],home_east_lane=[1040,265])
for n in v['interactions']:
 if n['id']=='chen':n['at']=v['anchors']['chen']
for n in b['scenes']['chen_hall']['interactions']:
 if n.get('destination')=='village':n['arrival']=v['anchors']['chen']
b['revision']='3.3-chen-redesign-and-exterior-volumes'
b['status']='exterior-collision-and-visual-review-pending'
path.write_text(json.dumps(b,ensure_ascii=False,indent=2)+'\n')
print('Annotated',len(v['obstacles']),'exterior obstacles;',len(v['foreground']),'foreground regions')
