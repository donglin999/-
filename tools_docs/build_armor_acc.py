#!/usr/bin/env python3
"""护具与佩饰数值 v1（2026-10-08 用户：“护具和佩饰也一起做完，佩饰可能更多样，例如抗性、福源、一些奇奇怪怪词条都可以加上去，
而且种类可以更加多（中高阶多，低阶没什么必要），需要分成战斗类首饰或者功能类首饰；然后同步设计 icon”）。

- 护具分轻、中、重、医四类：防御 = 中装基础（丁4 丙7 乙10 甲14 绝16，约占阶段参考防御的 35–40%）× 类型倍率，另加类型副属性。
  原 8 件补到 12 件（补丙级重装、甲级轻、重、医）。
- 佩饰原 9 件扩到 36 件，分战斗类与功能类；丁级只留 2 件，主要在乙、甲、绝。词条数：丙 1–2、乙 2、甲 2–3、绝 3（含一条独有）。
  原有佩饰的“少量气血”“略增命中”等描述全部改成具体数字；原有技能影响（skill_mods）保留。
- 价格：护具与武器同价（丁 30 丙 90 乙 240 甲 600）；佩饰略贵（丙 100 乙 260 甲 650）；绝级不出售。
- 新名称已于 2026-10-09 命名评审：定风珠改惊鸿青珠（原名是《封神演义》法宝，暗示神异），燕尾银簪改飞燕银簪（与燕尾飞刃同路线撞名）；
  逐件来源与释义见 NAMING，状态为“设计提案、待剧情核实”。
输出：catalog.json 的护具、佩饰条目（stats/affix/kind_cat/price/req，新增条目带 visual 供出图），equipment.md 的“护具与佩饰数值 v1”段，
js/equipment-runtime.js 的 armors、accs（与武器同文件，由本脚本在 build_weapon_stats.py 之后追加）。
生成链：build_weapon_stats.py 之后。
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
START, END = '<!-- armor-acc-stats:start -->', '<!-- armor-acc-stats:end -->'
GRADES = '丁丙乙甲绝'
ARMOR_BASE = {'丁': 4, '丙': 7, '乙': 10, '甲': 14, '绝': 16}
ARMOR_TYPE = {  # 倍率、副属性（按品阶序号 gi）、主属性
    '轻': dict(mul=0.70, sub=lambda gi: {'dodge': 2 + gi}, main='agi', note='闪避高、防御低'),
    '中': dict(mul=1.00, sub=lambda gi: {'mhp': 8 * gi}, main='con', note='防御与气血均衡'),
    '重': dict(mul=1.40, sub=lambda gi: {'spd': -1, 'block': 2 * gi}, main='con', note='防御最高、身速 −1、格挡'),
    '医': dict(mul=0.75, sub=lambda gi: {'mmp': 6 * gi}, main='wis', note='防御低、内力上限高、治疗略增'),
}
REQ = {'丁': 0, '丙': 5, '乙': 7, '甲': 9, '绝': 11}
PRICE_ARMOR = {'丁': 30, '丙': 90, '乙': 240, '甲': 600, '绝': None}
PRICE_ACC = {'丁': 30, '丙': 100, '乙': 260, '甲': 650, '绝': None}
NEW_TAG = {'status': 'draft_pending_review'}

# 护具：id → (类型, 机制 dict(type,value,text))；新增条目另带名称、品阶、使用者、外观
ARMOR = {
    'eq_plain_robe': ('轻', dict(type='none', text='无附带特性（谷中日常短衣）')),
    'eq_padded_coat': ('中', dict(type='none', text='无附带特性')),
    'eq_sword_coat': ('轻', dict(type='first_round_spd', value=1, text='第一回合身速 +1（剑衣利落，先行观察）')),
    'eq_medical_robe': ('医', dict(type='heal', value=0.08, text='治疗量 +8%')),
    'eq_guard_vest': ('重', dict(type='guard_reduce', value=0.10, text='援护替同伴承伤时，所受伤害再 −10%')),
    'eq_dancer_layer': ('轻', dict(type='unload_bonus', value=0.10, once='每回合一次', text='每回合首次给同伴卸力时，卸力额外 +10%')),
    'eq_hidden_coat': ('中', dict(type='expose_first_reduce', value=0.20, once='每战一次', text='本战第一次带“暴露”受击时，该次伤害 −20%')),
    'eq_old_mantle': ('中', dict(type='guard_heal', value=0.10, once='每战一次', text='本战首次援护濒危（气血低于三成）同伴后，自身回复 10% 气血')),
}
NEW_ARMOR = [
    dict(id='eq_cowhide_guard', name='牛皮护心甲', grade='丙', type='重', users='通用（护卫）', phase='Y1+',
         visual='熟牛皮缝成的护胸软甲，前胸一块加厚护心皮，皮绳系带，边缘铜钉', obtain='待安排',
         mech=dict(type='none', text='无附带特性'), mods={'status_resist': {'流血': .15}}),
    dict(id='eq_cloud_shirt', name='岚纹轻衫', grade='甲', type='轻', users='剑路、身法路', phase='TRAVEL',
         visual='青灰薄绸长衫，袖口与衣摆织着淡淡的山岚纹，腰间细带，轻盈贴身', obtain='归云谷上乘考校后师门所赐，或高价订制',
         mech=dict(type='dodge_counter_atk', value=0.15, once='每回合一次', text='闪避一次攻击后，下一次攻击伤害 +15%（每回合一次）'),
         mods={'status_resist': {'目眩': .25, '迟滞': .25, '心乱': .25}}),
    dict(id='eq_iron_scale', name='铁鳞软甲', grade='甲', type='重', users='拳路、护卫', phase='TRAVEL',
         visual='细小铁鳞片层层缀在熟皮衬底上的软甲，肩部加厚，鳞片暗沉有磨痕', obtain='合川拳门或巡江司军需，或大支线奖励',
         mech=dict(type='guard_reduce', value=0.15, text='援护替同伴承伤时，所受伤害再 −15%'),
         mods={'status_resist': {'眩晕': .25, '内伤': .25, '流血': .25}}),
    dict(id='eq_herb_weave', name='百草织袍', grade='甲', type='医', users='医路（叶蘅、苏芷）', phase='TRAVEL',
         visual='素白长袍，内衬织入淡青草药纹，襟边缝着几个小药袋，袖口宽大', obtain='白鹇谷医案执事考核通过后所赠',
         mech=dict(type='heal', value=0.12, text='治疗量 +12%'), mods={'status_resist': {'中毒': .25, '流血': .25, '心乱': .25}}),
]

# 佩饰：class 战斗/功能；affix 列表 (key, value)；文字由 AFFIX_TEXT 生成；可附 mods（skill_mods）与 unique（独有词条文字）
A = lambda **k: k
ACC_OLD = {
    'eq_plain_knot': A(cls='战斗', affix=[('mhp', 15)]),
    'eq_needle_tag': A(cls='战斗', affix=[('crit_route', ('暗器', 4))]),
    'eq_cloud_tassel': A(cls='战斗', affix=[('mp_after_token', ('剑', 2))]),
    'eq_guard_buckle': A(cls='战斗', affix=[('guard_reduce', 0.10), ('spd', -1)]),
    'eq_route_knot': A(cls='战斗', affix=[('first_round_spd', 1)]),
    'eq_case_tag': A(cls='战斗', affix=[('def', 3)]),
    'eq_lamp_pendant': A(cls='战斗', affix=[('unload_first', 0.10)]),
    'eq_kept_word': A(cls='战斗', affix=[('mp_after_guard', 6)]),
    'eq_home_token': A(cls='战斗', affix=[('last_stand_unload', 0.40)]),
}
NEW_ACC = [
    # —— 战斗类 ——
    A(id='eq_tiger_claw', name='虎爪坠', grade='丙', cls='战斗', affix=[('str', 1), ('crit', 3)], visual='一枚老虎爪牙用红绳穿起的挂坠，爪尖磨得光滑', users='刀路、拳路'),
    A(id='eq_sandal_beads', name='檀木手串', grade='丙', cls='战斗', affix=[('wil', 1), ('mmp', 8)], visual='十八颗深褐檀木珠串成的手串，珠面有细细木纹，系一枚小结', users='通用'),
    A(id='eq_jade_thumb', name='青玉扳指', grade='乙', cls='战斗', affix=[('crit', 4), ('weak_dmg', 0.05)], visual='一枚青白玉扳指，表面光润，内侧有拉弦磨出的浅痕', users='暗器、剑路'),
    A(id='eq_swallow_pin', name='飞燕银簪', grade='乙', cls='战斗', affix=[('dodge', 4), ('spd', 1)], visual='一支银簪，簪头錾成燕尾分叉的形状，缀一颗小珍珠', users='身法路'),
    A(id='eq_iron_cash', name='铁钱串', grade='乙', cls='战斗', affix=[('mhp', 25)], mods={'status_resist': {'内伤': .20}}, visual='十几枚旧铁钱用粗麻绳串成一串，钱面锈迹斑驳', users='拳路、护卫'),
    A(id='eq_gilt_waist_tag', name='鎏金腰牌', grade='甲', cls='战斗', affix=[('start_bp', 1)], mods={'status_resist': {'惊惧': .25}}, visual='一块长方形鎏金铜腰牌，边框錾卷云纹，中间素面无字，挂黑色丝绦', users='通用'),
    A(id='eq_crane_jade', name='鹤衔玉佩', grade='甲', cls='战斗', affix=[('wis', 2), ('heal', 0.10), ('mmp', 18)], visual='一块白玉佩，雕一只仙鹤口衔灵芝，鹤颈修长，挂浅青丝穗', users='医路、音律'),
    A(id='eq_bell_rope', name='朱绳铜铃', grade='甲', cls='战斗', affix=[('break_dmg', 0.15), ('crit', 5)], visual='一枚古铜小铃系在朱红编绳上，铃身有回纹，铃舌是一粒铜丸', users='破势输出'),
    A(id='eq_ink_seal', name='墨玉印坠', grade='甲', cls='战斗', affix=[('elite_dmg', 0.10)], mods={'status_resist': {'封穴': .25}}, visual='一方小小的墨玉印章做成的挂坠，印钮雕成伏兽，印面素平，系深蓝绳', users='通用'),
    A(id='eq_dragonfly_pin', name='蜻蜓翠簪', grade='甲', cls='战斗', affix=[('dodge', 5), ('regen_mp', 0.03)], visual='一支金簪，簪头是一只点翠蜻蜓，翅膀翠蓝，细足轻搭在簪杆上', users='身法、音律'),
    A(id='eq_heart_mirror', name='护心镜坠', grade='绝', cls='战斗', affix=[('last_stand', 0.15), ('resist_all', 0.10), ('mhp', 40)],
      visual='一面巴掌大的古铜护心镜做成的挂坠，镜背铸着云雷纹，镜面幽光，挂粗皮绳', users='通用'),
    A(id='eq_wind_pearl', name='惊鸿青珠', grade='绝', cls='战斗', affix=[('spd', 1), ('first_act', 1)], mods={'status_resist': {'迟滞': .30, '眩晕': .30}},
      visual='一颗鸽蛋大小的半透明青珠，珠内有一缕旋状絮纹，嵌在银托里，挂青丝绦', users='通用'),
    A(id='eq_suet_ring', name='羊脂玉环', grade='绝', cls='战斗', affix=[('con', 3), ('regen_hp', 0.03), ('heal_recv', 0.15)],
      visual='一只温润的羊脂白玉环，环面光洁无纹，一侧系着淡金色丝绳', users='护卫、拳路'),
    # —— 功能类 ——
    A(id='eq_ward_coin', name='厌胜钱', grade='丁', cls='功能', affix=[('silver_pct', 0.10)], visual='一枚铜质厌胜钱，钱面铸吉祥纹样，穿红绳打着如意结', users='通用'),
    A(id='eq_herb_pouch', name='药香荷包', grade='丙', cls='功能', affix=[('item_heal_pct', 0.30)], visual='一个青布绣花荷包，口用抽绳收紧，散出淡淡药香，绣一枝艾草', users='通用'),
    A(id='eq_wine_gourd', name='小酒葫芦', grade='丙', cls='功能', affix=[('wine_pct', 0.50)], visual='一只巴掌大的小葫芦，漆成朱红，腰间系绳，塞着软木塞', users='通用'),
    A(id='eq_walker_knot', name='行脚结', grade='丙', cls='功能', affix=[('walk_pct', 0.10)], visual='用草绳和布条编成的行脚人平安结，坠一枚小小的草鞋形木片', users='通用'),
    A(id='eq_abacus_pendant', name='算盘坠', grade='乙', cls='功能', affix=[('shop_disc', 0.08), ('silver_pct', 0.10)], visual='一把拇指长的微型铜算盘挂坠，算珠可拨动，挂褐色丝绳', users='通用'),
    A(id='eq_lucky_knot', name='吉祥结', grade='乙', cls='功能', affix=[('drop_pct', 0.25)], visual='一个大红丝线编成的吉祥结，结下垂着长长的流苏，中间嵌一枚小铜钱', users='通用'),
    A(id='eq_brush_pendant', name='笔管坠', grade='乙', cls='功能', affix=[('xinfa_pct', 0.15)], visual='一截斑竹笔管做成的挂坠，笔管里塞着一卷小纸，两端包铜', users='通用'),
    A(id='eq_fang_charm', name='犬牙坠', grade='乙', cls='功能', affix=[('pet_atk', 0.15), ('aff_pct', 0.10)], visual='一枚狗牙用皮绳穿起，牙根缠着几圈红线，旁边挂一枚小铜铃', users='通用'),
    A(id='eq_jade_cicada', name='玉蝉', grade='甲', cls='功能', affix=[('prof_pct', 0.10), ('exp_pct', 0.08)], visual='一枚青白玉雕的蝉，蝉翼刻得极薄，背上穿孔系绿丝绳', users='通用'),
    A(id='eq_fortune_coin', name='福寿钱', grade='甲', cls='功能', affix=[('drop_pct', 0.35), ('pickup', 0.10)],
      visual='一枚大铜钱，钱面铸着福寿吉祥的篆纹，系金黄丝穗', users='通用'),
    A(id='eq_compass_pendant', name='指南鱼坠', grade='甲', cls='功能', affix=[('walk_pct', 0.15), ('post_heal', 0.08)],
      visual='一条薄铁片剪成的小鱼形指南鱼，鱼头微翘，嵌在一只小木盒里，盒盖半开', users='通用'),
    A(id='eq_ledger_tag', name='行商牙牌', grade='甲', cls='功能', affix=[('shop_disc', 0.12), ('silver_pct', 0.15)], visual='一块象牙色长方牙牌，边角磨圆，刻着细细的账格纹，挂黑丝绳', users='通用'),
    A(id='eq_peach_sword', name='桃木剑坠', grade='绝', cls='功能', affix=[('no_silver_loss', 1), ('drop_pct', 0.50), ('pickup', 0.15)],
      visual='一柄三寸长的小桃木剑挂坠，剑身刻七星纹，剑柄缠红线，挂红穗', users='通用'),
    A(id='eq_longevity_lock', name='长命金锁', grade='绝', cls='功能', affix=[('exp_pct', 0.15), ('prof_pct', 0.12), ('aff_pct', 0.20)],
      visual='一把小巧的金锁，锁身錾如意云纹与莲花，下缀三枚小铃铛，挂红绳', users='通用'),
    A(id='eq_scholar_seal', name='书院闲章', grade='绝', cls='功能', affix=[('xinfa_pct', 0.25), ('prof_pct', 0.10), ('wis', 1)],
      visual='一方青田石闲章，章钮雕一卷书和一枝梅，印面朝下，系一截旧丝绳', users='通用'),
]
# 命名评审（2026-10-09）：id → (来源, 命名含义)。含义沿器形、工艺、用途或取得途径提取，不暗示未实现功能；来源未实现的标“提案”。
NAMING = {
    'eq_cowhide_guard': ('待安排', '牛皮指熟牛皮材质，护心指前胸加厚的一块护心皮；名字直接说明材质与构造。'),
    'eq_cloud_shirt': ('归云谷上乘考校后师门所赐，或高价订制（提案）', '岚纹是衣摆织出的山岚纹，取归云谷山间云气，与岚隙剑、回岚剑穗同出一脉；轻衫说明轻装形制。'),
    'eq_iron_scale': ('合川拳门或巡江司军需，或大支线奖励（提案）', '铁鳞指缀在熟皮衬底上的细小铁片，软甲指皮衬能随身屈伸；名字只说明工艺，不暗示额外功能。'),
    'eq_herb_weave': ('白鹇谷医案执事考核通过后所赠（提案）', '百草指内衬织入的草药纹和襟边小药袋，取医者随身带药的习惯；织袍说明是织物医袍。'),
    'eq_tiger_claw': ('猎户、山货摊', '猎户把虎爪穿绳挂在身上，取其勇悍；对应臂力与暴击。'),
    'eq_sandal_beads': ('寺前香摊、杂货铺', '檀木珠串常用来数珠静心；对应定力与内力。'),
    'eq_jade_thumb': ('待安排', '扳指本是拉弓护指的器物，内侧弦痕说明主人惯于瞄准；对应暴击与命中弱点。'),
    'eq_swallow_pin': ('银铺', '簪头錾成燕尾分叉，取飞燕轻捷；对应闪避与身速。'),
    'eq_iron_cash': ('镖局、护运报酬', '旧铁钱沉实耐磨，走镖人常串一挂随身；对应气血与内伤抗性。'),
    'eq_gilt_waist_tag': ('官府或巡江司长期差务报酬（提案）', '鎏金腰牌是有差使在身者的凭证，佩着临阵不慌；牌面无字，不指任何具体官职；对应开战蓄势与惊惧抗性。'),
    'eq_crane_jade': ('清徽阁或白鹇谷长辈所赠（提案）', '仙鹤衔灵芝是常见的延寿吉纹；对应治疗、内力与悟性。'),
    'eq_bell_rope': ('镖局长期护运报酬（提案）', '镖车开道摇铃示警，铃声一响对方阵脚先乱；对应对破势中目标增伤与暴击。'),
    'eq_ink_seal': ('书院或藏家处换得（提案）', '墨玉小印的印钮雕伏兽，取镇守之意；对应对精英与首领增伤和封穴抗性。'),
    'eq_dragonfly_pin': ('大城首饰铺订制（提案）', '点翠蜻蜓立在簪头，取蜻蜓点水的轻巧；对应闪避与回内。'),
    'eq_heart_mirror': ('跨地区护运长线终章，老镖师所传旧镜（提案）', '护心镜原是甲胄上护住心口的铜镜，缩成挂坠仍守在心口；对应致命一击时撑住一口气。'),
    'eq_wind_pearl': ('奇遇所得（提案，随事件排期登记）', '惊鸿取曹植《洛神赋》“翩若惊鸿”的迅疾，对应首回合先手与身速；青珠是银托里的一颗青色珠子，不具驱风之类的神异。'),
    'eq_suet_ring': ('人物篇赠礼（提案）', '羊脂白玉温润如脂，旧有以玉养身的说法；对应根骨、回血与受到的治疗。'),
    'eq_ward_coin': ('杂货铺', '厌胜钱是民间铸来祈福压邪的花钱，不作通宝流通；对应银两获得。'),
    'eq_herb_pouch': ('药铺', '荷包里装艾草药末，随身闻香；对应食物、药物恢复量。'),
    'eq_wine_gourd': ('酒肆', '随身小葫芦盛酒；对应饮酒回内。'),
    'eq_walker_knot': ('杂货铺、行脚僧所赠', '行脚人系在包袱上的平安结，坠一枚草鞋木片；对应行走速度。'),
    'eq_abacus_pendant': ('商铺', '拇指长的小算盘，喻精于算账；对应商店折扣与银两。'),
    'eq_lucky_knot': ('节庆集市', '吉祥结是讨彩头的红结；对应福源掉落。'),
    'eq_brush_pendant': ('书铺', '斑竹笔管里藏一卷小纸，随时记下行功心得；对应心法修炼进度。'),
    'eq_fang_charm': ('猎户所赠', '犬牙穿绳，是与犬为伴的人常戴的小物；对应大黄攻击与好感。'),
    'eq_jade_cicada': ('古玩铺或支线报酬（提案）', '蝉从蛰伏到蜕壳出土，古人借玉蝉寄托蜕变新生；对应熟练与修为成长。'),
    'eq_fortune_coin': ('节庆、奇遇（提案）', '福寿花钱铸福寿篆纹，讨福讨寿；对应掉落与拾遗。'),
    'eq_compass_pendant': ('工匠支线报酬（提案）', '指南鱼是宋人用磁化薄铁片做的指向器，见《武经总要》；带着不易迷路，对应行走速度与战后回复。'),
    'eq_ledger_tag': ('行商会馆长期往来（提案）', '宋时牙人（买卖中介）凭牙牌入市，牌上刻账格；对应商店折扣与银两。'),
    'eq_peach_sword': ('道观奇遇（提案）', '桃木剑是民间驱邪避凶的吉物，取逢凶化吉之意；只是吉物，不具法术；对应战败不失银两与福源。'),
    'eq_longevity_lock': ('人物篇长辈赠礼（提案）', '长命锁是长辈给孩子挂的祝福锁，寓意锁住平安长大；对应修为、熟练成长与好感。'),
    'eq_scholar_seal': ('书院大支线报酬（提案）', '闲章是文人刻诗句雅号的私章，印钮雕书卷与梅枝；对应心法、熟练与悟性。'),
}


def icon_prompt(name, grade, visual):
    return ('精细手绘二维南宋武侠墨彩图标，参考 art_sources/xiangyang_icons_v3/style-approved.png 的已批准画风；自然细墨边、细致水粉笔触、清楚主轮廓与集中高光。'
            '单件、正方形、透明RGBA背景，原稿至少512×512。主体约占70—80%，生产512帧四边至少48px安全边；48px仍可辨识。无文字、无数字、无边框、无底板、无水印；不做摄影、3D或粗像素。'
            f'对象：{name}，{grade}级。主体类别：实体物件，材质、构造与用途相符。独有构图：{visual}。一个明确主形，精细完成；不加繁复装饰。'
            '等级色只作辅助，形状区别优先；不要通用换色旋涡，不增加设定外的龙、法阵或召唤物。')


AFFIX_TEXT = {
    'str': '臂力 +{}', 'con': '根骨 +{}', 'agi': '身法 +{}', 'wil': '定力 +{}', 'wis': '悟性 +{}',
    'mhp': '气血上限 +{}', 'mmp': '内力上限 +{}', 'def': '防御 +{}', 'crit': '暴击 +{}%', 'dodge': '闪避 +{}%', 'spd': '身速 {:+d}',
    'weak_dmg': '命中弱点时伤害 +{:.0%}', 'break_dmg': '对破势中的目标伤害 +{:.0%}', 'elite_dmg': '对精英与首领伤害 +{:.0%}',
    'heal': '治疗量 +{:.0%}', 'heal_recv': '受到的治疗 +{:.0%}', 'regen_hp': '每回合开始回复 {:.0%} 气血', 'regen_mp': '每回合开始回复 {:.0%} 内力',
    'start_bp': '开战时蓄势 +{}', 'first_act': '第一回合必定先手（独有）', 'first_round_spd': '第一回合身速 +{}', 'resist_all': '全部异常抗性 +{:.0%}',
    'last_stand': '首次致命伤时以 1 点气血撑住并回复 {:.0%}（每战一次）（独有）', 'last_stand_unload': '首次濒危时自动卸力 {:.0%}（每战一次）（独有）',
    'guard_reduce': '援护承伤再 −{:.0%}', 'unload_first': '每回合首次给同伴卸力时额外 +{:.0%}', 'mp_after_guard': '首次护卫后回复 {} 内力（每战一次）',
    'silver_pct': '银两获得 +{:.0%}', 'exp_pct': '修为获得 +{:.0%}', 'drop_pct': '福源：掉落率 +{:.0%}', 'shop_disc': '商店购买价 −{:.0%}',
    'prof_pct': '熟练成长 +{:.0%}', 'xinfa_pct': '心法修炼进度 +{:.0%}', 'walk_pct': '地图行走速度 +{:.0%}', 'post_heal': '战后回复 {:.0%} 气血与内力',
    'item_heal_pct': '食物、药物恢复量 +{:.0%}', 'wine_pct': '酒类内力回复 +{:.0%}（独有）', 'no_silver_loss': '战败时不损失银两（独有）', 'pickup': '战后 {:.0%} 概率另拾得一件药食',
    'pet_atk': '同行的大黄攻击 +{:.0%}（独有）', 'aff_pct': '好感获得 +{:.0%}',
}


def affix_text(k, v):
    if k == 'crit_route':
        return f'{v[0]}招式暴击 +{v[1]}%'
    if k == 'mp_after_token':
        return f'消耗守势后的下一次{v[0]}招内力 −{v[1]}'
    t = AFFIX_TEXT[k]
    return t if '{' not in t else t.format(v)


def mods_text(m):
    import build_equipment_mods as bem
    return bem.text(m) if m else ''


def main():
    p = DOC / 'catalog.json'
    cat = json.loads(p.read_text())
    by = {e['id']: e for e in cat['equipment']}
    tmpl_a, tmpl_c = by['eq_padded_coat'], by['eq_plain_knot']

    def add(n, slot, tmpl):
        e = {k: v for k, v in tmpl.items() if k not in ('skill_mods', 'skill_mods_text', 'stats', 'mech', 'affix', 'price', 'req')}
        e.update(id=n['id'], name=n['name'], grade=n['grade'], slot=slot, kind='equipment', users=n.get('users', '通用'), phase=n.get('phase', 'TRAVEL'),
                 visual=n['visual'], obtain=NAMING[n['id']][0], effect=n.get('effect', ''), icon_id='icon_' + n['id'],
                 asset_status='not_generated', prompt=icon_prompt(n['name'], n['grade'], n['visual']),
                 naming={'meaning': NAMING[n['id']][1], 'basis': NAMING[n['id']][0], 'design_anchor': n['visual'], 'lore_text': NAMING[n['id']][1],
                         'status': 'design_proposal_pending_story_review'}, **NEW_TAG)
        if n.get('mods'):
            e['skill_mods'] = n['mods']
        e['skill_mods_text'] = mods_text(n.get('mods'))
        if n['id'] in by:
            cat['equipment'][cat['equipment'].index(by[n['id']])] = e
        else:
            cat['equipment'].append(e)
        by[n['id']] = e
        return e

    for n in NEW_ARMOR:
        add(n, 'armor', tmpl_a)
        ARMOR[n['id']] = (n['type'], n['mech'])
    for n in NEW_ACC:
        add(n, 'acc', tmpl_c)
        ACC_OLD[n['id']] = n

    armors, accs = [], []
    for e in cat['equipment']:
        gi = GRADES.index(e['grade']) + 1
        if e['slot'] == 'armor' and e['id'] in ARMOR:
            typ, mech = ARMOR[e['id']]
            T = ARMOR_TYPE[typ]
            st = {'def': round(ARMOR_BASE[e['grade']] * T['mul']), **T['sub'](gi)}
            if typ == '医':
                st['heal'] = 5
            e.update(armor_type=typ, stats=st, mech=mech, price=PRICE_ARMOR[e['grade']], req=({T['main']: REQ[e['grade']]} if REQ[e['grade']] else {}))
            e['effect'] = f"{typ}装：{T['note']}。{mech['text']}"
            armors.append(e)
        if e['slot'] == 'acc' and e['id'] in ACC_OLD:
            a = ACC_OLD[e['id']]
            aff = [{'k': k, 'v': v, 'text': affix_text(k, v)} for k, v in a['affix']]
            e.update(acc_class=a['cls'], affix=aff, price=PRICE_ACC[e['grade']], req={})
            e.pop('unique', None)
            e['effect'] = f"{a['cls']}类：" + '；'.join(x['text'] for x in aff)
            accs.append(e)
    p.write_text(json.dumps(cat, ensure_ascii=False, indent=2) + '\n')

    # equipment.md 标记段
    NAME = {'str': '臂力', 'agi': '身法', 'wis': '悟性', 'wil': '定力', 'con': '根骨'}
    L = [START, '## 护具与佩饰数值 v1（2026-10-08，自动生成）', '',
         '由 `tools_docs/build_armor_acc.py` 生成；设计说明见 [护具与佩饰数值](armor-acc-stats.md)。新增条目已过命名评审（2026-10-09），来源仍为提案。', '',
         '### 护具', '', '| 护具 | 品阶 | 类型 | 防御 | 副属性 | 机制 | 异常抗性等 | 价格 | 要求 |', '| --- | --- | --- | --- | --- | --- | --- | --- | --- |']
    order = {g: i for i, g in enumerate(GRADES)}
    SUBN = {'dodge': '闪避 +{}%', 'mhp': '气血 +{}', 'spd': '身速 {:+d}', 'block': '格挡 +{}', 'mmp': '内力 +{}', 'heal': '治疗 +{}%'}
    for e in sorted(armors, key=lambda x: (x['armor_type'], order[x['grade']])):
        sub = '；'.join(SUBN[k].format(v) for k, v in e['stats'].items() if k != 'def')
        L.append(f"| {e['name']} | {e['grade']} | {e['armor_type']} | {e['stats']['def']} | {sub or '—'} | {e['mech']['text']} | {e.get('skill_mods_text') or '—'} | {e['price'] or '不出售'} | {'、'.join(f'{NAME[k]} {v}' for k, v in e['req'].items()) or '—'} |")
    for cls in ['战斗', '功能']:
        L += ['', f'### 佩饰·{cls}类', '', '| 佩饰 | 品阶 | 词条 | 技能影响 | 价格 |', '| --- | --- | --- | --- | --- |']
        for e in sorted([x for x in accs if x['acc_class'] == cls], key=lambda x: order[x['grade']]):
            L.append(f"| {e['name']} | {e['grade']} | {'；'.join(a['text'] for a in e['affix'])} | {e.get('skill_mods_text') or '—'} | {e['price'] or '不出售'} |")
    L += ['', END]
    q = DOC / 'equipment.md'
    t = q.read_text()
    block = '\n'.join(L)
    t = re.sub(re.escape(START) + r'.*?' + re.escape(END), block, t, flags=re.S) if START in t else t.rstrip('\n') + '\n\n' + block + '\n'
    q.write_text(t)

    # 运行时数据：并入 js/equipment-runtime.js
    rp = ROOT / 'js/equipment-runtime.js'
    src = rp.read_text()
    data = json.loads(re.search(r'window\.EquipmentRuntime=(\{.*\});', src, re.S).group(1))
    Q = {'丁': 0, '丙': 1, '乙': 2, '甲': 3, '绝': 4}
    STAT_FX = ('str', 'con', 'agi', 'wil', 'wis', 'mhp', 'mmp', 'def', 'crit', 'dodge', 'spd', 'block')
    data['armors'] = {e['id']: {'name': e['name'], 'grade': e['grade'], 'q': Q[e['grade']], 'type': e['armor_type'], 'armor': e['stats']['def'],
                                'fx': {k: v for k, v in e['stats'].items() if k in STAT_FX and k != 'def'},
                                'desc': f"{e['grade']}级{e['armor_type']}装。{e.get('visual') or ''}".rstrip('。') + f"。防御 +{e['stats']['def']}。{e['mech']['text']}。" + (f"{e['skill_mods_text']}。" if e.get('skill_mods_text') else ''),
                                'price': e['price'] or 0, 'req': e['req'], 'mods': {**(e.get('skill_mods') or {}), **({'heal': e['stats']['heal'] / 100} if e['stats'].get('heal') else {})},
                                'mech': {k: v for k, v in e['mech'].items() if k != 'text'}, **({} if e['price'] else {'unsellable': 1})} for e in armors}
    data['accs'] = {}
    for e in accs:
        fx = {a['k']: a['v'] for a in e['affix'] if a['k'] in STAT_FX}
        func = {a['k']: a['v'] for a in e['affix'] if a['k'] not in STAT_FX}
        data['accs'][e['id']] = {'name': e['name'], 'grade': e['grade'], 'q': Q[e['grade']], 'cls': e['acc_class'], 'fx': fx, 'affix': func,
                                 'desc': f"{e['grade']}级{e['acc_class']}类佩饰。{e.get('visual') or ''}".rstrip('。') + '。' + '；'.join(a['text'] for a in e['affix']) + '。'
                                 + (f"{e['skill_mods_text']}。" if e.get('skill_mods_text') else ''),
                                 'price': e['price'] or 0, 'mods': e.get('skill_mods') or {}, **({} if e['price'] else {'unsellable': 1})}
    rp.write_text('/* 由 tools_docs/build_weapon_stats.py 与 build_armor_acc.py 生成，勿手改。装备数值 v1（weapon-stats.md、armor-acc-stats.md）。 */\nwindow.EquipmentRuntime='
                  + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    from collections import Counter
    print(json.dumps({'护具': len(armors), '佩饰': len(accs), '佩饰分类': Counter(e['acc_class'] for e in accs), '佩饰品阶': Counter(e['grade'] for e in accs)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
