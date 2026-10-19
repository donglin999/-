from pathlib import Path
from PIL import Image,ImageDraw
import json,sys
root=Path(__file__).resolve().parents[2];out=root/'art_sources/qihe-expansion-v1';out.mkdir(exist_ok=True)
scenes={
 'south':{'name':'南村口与客栈外院','world':[1536,1024],'doors':{'north':[768,85],'west':[85,760],'east':[1450,700]},'objects':[
 ['drug_stall',[170,160,320,225],'药商棚，门朝南'],['shelter',[1040,180,300,220],'正道盟歇脚棚，开敞南面'],['cart',[280,700,155,100],'卸货车，不占主路']], 'actors':{'merchant':[315,455],'innkeeper':[655,270],'steward':[1160,470],'retainer':[1270,480],'wukui':[560,620],'henchman':[660,690],'luheng':[490,820]}},
 'east':{'name':'栖河河埠与晒药场','world':[1440,960],'doors':{'west':[85,470],'southwest':[260,890]},'objects':[
 ['shade',[550,160,310,220],'登记棚，开敞南面'],['rack',[930,410,155,90],'晒药架'],['rack2',[930,560,155,90],'晒药架'],['boat',[1170,670,140,135],'系在东岸河中的木舟']], 'actors':{'procurement':[660,445],'aide':[800,455],'chengduo':[355,570],'bailiff':[410,700],'wukui':[640,680]}},
 'west':{'name':'西田埂与护路练场','world':[1440,960],'doors':{'east':[1355,460],'southeast':[1160,875],'west':[85,610]},'objects':[
 ['cart',[870,170,180,100],'待修木车'],['shed',[160,100,280,210],'田边工具棚，南面开口'],['target',[750,400,80,125],'练棍木靶'],['field',[190,730,620,180],'低矮菜畦，有田埂绕行']], 'actors':{'luheng':[620,460],'chen':[1010,335],'training':[590,595],'guard':[420,595]}},
 'north':{'name':'后山采药路','world':[1440,960],'doors':{'south':[715,875]},'objects':[
 ['rock',[1020,280,180,120],'自然山石'],['tree',[250,260,145,225],'路侧树，树干落地'],['log',[690,230,180,60],'休息倒木']], 'actors':{'hero':[620,585],'ye':[810,555],'wolf1':[430,535],'wolf2':[475,655],'clue':[630,780]}},
 'refuge':{'name':'邻村接应院','world':[1200,800],'doors':{'east':[1115,485],'north':[560,75]},'objects':[
 ['room',[140,120,280,220],'借住村舍，门朝南'],['shelter',[720,120,250,190],'救济棚，朝南开口'],['table',[690,540,170,75],'物资登记桌']], 'actors':{'aunt':[350,435],'chen':[255,465],'elder':[410,510],'censhuang':[870,390],'chengduo':[795,675],'zhouyan':[565,470],'luheng':[610,635]}},
 'mountain':{'name':'归云谷前径与客院','world':[1440,960],'doors':{'south':[700,875]},'objects':[
 ['xiao_room',[120,130,280,240],'萧白客房，门朝南'],['ye_room',[1010,130,280,240],'叶蘅客房，门朝南'],['kitchen',[620,85,290,235],'厨房饭堂，门朝南'],['herbs',[990,650,280,130],'药圃低畦，不是乱石'],['table',[610,650,170,80],'院中饭桌和配套凳']], 'actors':{'zhouyan':[740,420],'ye':[1120,460],'luheng':[500,700],'xiao_door':[260,415],'ye_door':[1145,415],'meal':[690,785]}}
}
for key,s in scenes.items():
 w,h=s['world'];im=Image.new('RGB',(w,h),'#9ba487');d=ImageDraw.Draw(im)
 # Broad continuous ground, never a narrow corridor painted against invisible boundaries.
 d.rounded_rectangle((55,55,w-55,h-55),40,fill='#c6b799',outline='#505b4b',width=6)
 for name,(x,y) in s['doors'].items():
  edge=(0,y) if name=='west' else (w,y) if name=='east' else (x,0) if name=='north' else (x,h)
  d.line([edge,(x,y),(w//2,h//2)],fill='#decead',width=130)
 for id,(x,y,ow,oh),desc in s['objects']:
  d.rectangle((x,y,x+ow,y+oh),fill='#69756b',outline='#29352f',width=4)
  d.text((x+6,y+6),id,fill='white')
 # 92-unit adult scale marker in left reference margin, not a character to include in art.
 d.line([(25,h-120),(25,h-28)],fill='white',width=5)
 im.save(out/(key+'-guide.png'))
 s['status']='graybox';s['sourceScale']=1
(out/'layout.json').write_text(json.dumps(scenes,ensure_ascii=False,indent=2)+'\n')
print('6 scene design guides written')
