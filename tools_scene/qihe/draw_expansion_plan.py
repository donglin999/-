"""Authoring diagram, not game art or a spatial collision contract."""
import json
from pathlib import Path
from html import escape
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[2]
out = root / 'docs/design/qihe-map/expansion'
scenes = [
 {'id':'A','name':'栖河 · 生活核心','world':[2400,1600],'box':[580,450,450,215],'kind':'existing_rework','people':['周婶 · 陈伯 · 老人 · 叶蘅'],'uses':['叶家 / 陈家客房 / 药铺','外客只在剧情事件时进入'],'phase':'序章起开放'},
 {'id':'B','name':'北 · 后山采药道','world':[1440,960],'box':[580,125,450,215],'kind':'new','people':['开场：萧白 · 叶蘅 · 两只狼'],'uses':['陌生靴印 / 折枝 / 远处犬吠','换衣后可重访，第二天获得旁证'],'phase':'开场固定演出 → 换衣后自由探索'},
 {'id':'C','name':'南 · 村口与客栈外院','world':[1536,1024],'box':[580,810,450,215],'kind':'new','people':['店家 · 药商 · 乌魁与帮众'],'uses':['正道盟管事与护院在北侧歇脚棚','陆衡卸货；客栈两门通同一室内'],'phase':'序章外来客 → 第一章明确诉求'},
 {'id':'D','name':'东 · 河埠与晒药场','world':[1440,960],'box':[1110,450,450,215],'kind':'new','people':['采办使 · 随从 · 程铎与差役'],'uses':['药货登记 / 取水 / 晒药','D2拦路冲突；保留公共绕行通路'],'phase':'序章随从 → 第一章采办使到场'},
 {'id':'E','name':'西 · 田埂与护路练场','world':[1440,960],'box':[50,450,450,215],'kind':'new','people':['陆衡授课 · 陈伯修车'],'uses':['学习丙级《护路棍法》（暂名）','白天认路；夜间撤离与守路战'],'phase':'序章可探 → 第一章授课与接应'},
 {'id':'F','name':'邻村 · 接应院','world':[1200,800],'box':[50,810,450,215],'kind':'new','people':['周婶 · 陈伯 · 老人 · 接应村民'],'uses':['岑霜救助处 / 程铎登记桌 / 周砚休息院','三处分别邀约；仅归云谷线可确认'],'phase':'第一章可送老人 → 火后安置'},
 {'id':'G','name':'归云谷 · 前径与客院','world':[1440,960],'box':[50,125,450,215],'kind':'new','people':['周砚 · 萧白 · 叶蘅；陆衡送达后离开'],'uses':['第一章：分房、晚饭、暂住一夜','第二章：萧白拜师，叶蘅暂住，开启培养'],'phase':'选择山居后开放'}
]
edges=[
 {'a':'A','b':'B','unlock':'after_borrowed_clothes','opening_exception':'fixed scene before free exploration'},
 {'a':'A','b':'C','unlock':'after_borrowed_clothes'},
 {'a':'A','b':'D','unlock':'after_borrowed_clothes'},
 {'a':'A','b':'E','unlock':'after_borrowed_clothes'},
 {'a':'C','b':'D','unlock':'after_borrowed_clothes'},
 {'a':'C','b':'E','unlock':'after_borrowed_clothes'},
 {'a':'E','b':'F','unlock':'chapter1_start','before_unlock_visible_reason':'bridge repair, mandatory story repair independent of cart activity'},
 {'a':'F','b':'G','unlock':'mountain_route_and_both_consents'}
]
plan={'version':'QH-EXP-01','date':'2026-10-04','status':'design_review_not_implemented',
 'coordinate_type':'diagram pixels only; world sizes are proposed',
 'scenes':scenes,'bidirectional_portals':edges,
 'inn_contract':{'same_interior':True,'entrances':['A','C'],'return_to_used_entrance':True},
 'population_rule':'One actor per phase; event location overrides residency, no cloned NPCs.',
 'design_changes':{'enemy':'two wolves, existing normal combat tutorial','new_skill':{'id':'qh_hulu_staff','name':'护路棍法','name_status':'proposed','grade':'丙','teacher':'陆衡','cost_half_days':1,'persistent':True},
 'hero':'short hair borrowed village clothes, whitebox referenced motion regeneration',
 'cultivation':{'months':36,'phases_per_month':5,'stamina_per_normal_phase':10,'first_chapter_uses_separate_half_days':6,'formal_hero_entry':'chapter2 month1','ye_route_choice':'end month12'}},
 'production_gates':['story_layout_review','same_scale_cast_board','walkable_graybox','referenced_preview','partition_generation','geometry_calibration','actual_game_acceptance'],
 'runtime_changes_this_turn':False,'new_game_images_this_turn':0}
(out/'plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
W,H=1600,1230
im=Image.new('RGB',(W,H),'#f5f3ec');d=ImageDraw.Draw(im)
fontpath='/System/Library/Fonts/Supplemental/Arial Unicode.ttf'
fonts={n:ImageFont.truetype(fontpath,n) for n in [17,18,19,20,23,27,34]}
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}"><rect width="100%" height="100%" fill="#f5f3ec"/>']
def rect(box,fill,stroke=None,r=10):
 x,y,w,h=box;d.rounded_rectangle((x,y,x+w,y+h),r,fill=fill,outline=stroke,width=2)
 svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke or fill}" stroke-width="2"/>')
def text(x,y,s,n=20,col='#26382f'):
 d.text((x,y),s,font=fonts[n],fill=col)
 svg.append(f'<text x="{x}" y="{y+n}" font-family="Arial Unicode MS, PingFang SC, sans-serif" font-size="{n}" fill="{col}">{escape(s)}</text>')
def line(pts,col='#81958a',width=4):
 d.line(pts,fill=col,width=width)
 svg.append('<polyline points="'+' '.join(f'{x},{y}' for x,y in pts)+f'" fill="none" stroke="{col}" stroke-width="{width}"/>')
 # two endpoints / paired exits, intentionally not one-way arrows
 for x,y in (pts[0],pts[-1]):
  d.ellipse((x-5,y-5,x+5,y+5),fill=col)
  svg.append(f'<circle cx="{x}" cy="{y}" r="5" fill="{col}"/>')
text(50,25,'栖河：把外来人的压力放进空间，把乡邻生活留在村里',34)
text(50,77,'QH-EXP-01  ·  剧情与人物分布草案  ·  线为双向路线，位置是示意而非生成坐标  ·  2026-10-04',18,'#66766c')
line([(805,340),(805,450)]);text(825,374,'采药归村',19)
line([(500,550),(580,550)]);line([(1030,550),(1110,550)])
line([(805,665),(805,810)]);text(825,727,'外客来村',19)
line([(275,665),(275,810)],'#b38b55');text(65,711,'D1 起便桥修复，可往返',17,'#886739')
line([(450,665),(540,755),(630,810)]);text(362,765,'南西绕行',17)
line([(1335,665),(1335,730),(990,810)]);text(1115,690,'装卸与客栈往来',18)
line([(50,900),(24,900),(24,230),(50,230)],'#b38b55')
for s in scenes:
 x,y,w,h=s['box'];tone='#e7eee3' if s['id']=='A' else ('#f0e6d6' if s['id'] in ['F','G'] else '#ffffff')
 rect(s['box'],tone,'#c6d0c4')
 text(x+20,y+14,f"{s['id']}  {s['name']}",27)
 text(x+20,y+57,s['people'][0],18)
 text(x+20,y+90,s['uses'][0],18)
 text(x+20,y+121,s['uses'][1],18)
 text(x+20,y+162,s['phase'],17,'#7c6746')
text(1115,153,'阶段变化',23)
text(1115,199,'序章：少量陌生面孔与声响',20)
text(1115,234,'第一天：问消息，开始索物',20)
text(1115,269,'第二天：拦路，药货受阻',20)
text(1115,304,'第三夜：三方才聚到装车点',20)
rect([1110,810,450,215],'#e9eee9','#c6d0c4')
text(1130,827,'站位与通路规则',23)
text(1130,872,'每个角色按时段只出现一处',19)
text(1130,908,'NPC留在路侧，门与主路可绕行',19)
text(1130,944,'火后沿已认识的西田埂撤离',19)
text(1130,980,'G路线：F选择山居后开放',17,'#7c6746')
line([(50,1070),(1560,1070)],'#c6d0c4',2)
text(50,1090,'人物整改：短发便衣萧白按旧动作白模重生；先统一叶蘅 / 帮众同框；三方专属素材有候选、未接入。',20)
text(50,1128,'剧情衔接：狼被惊扰 → 生面孔变多 → 三方索物 → 村火撤离 → 山居暂住 → 次晨主动求学与首期培养。',20)
text(50,1174,'此图为设计产物。未生成正式地图、未替换运行素材，第一章与第二章入口仍待开发。',18,'#7c6746')
svg.append('</svg>')
(out/'distribution.svg').write_text('\n'.join(svg)+'\n')
im.save(out/'distribution.png')
print(out/'distribution.png')
