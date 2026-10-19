#!/usr/bin/env python3
"""门派功法传承 v3：生成功法清单、23 个新招式合同、命名审定表与运行数据。

唯一设计来源是本脚本内的 ARTS / NEW_MOVES / MASTERY；规则见 docs/design/martial-lineage.md。
- 外功按品阶定招式数：丁丙乙 1 招，甲 2 招（第二招五重），绝 3 招（五重、七重）。
- 功法重数 = 本功法各招重数的最高值；已开启的招式共享功法重数；满十重得一项精通。
- 人物技能（叶蘅与散人同伴）暂缓：保留旧分组，标记 paused，不并入外功。
- 新招式名称与新功法名称均为待审定占位，审定表见 lineage-v3-naming.md。
"""
from pathlib import Path
import json
import attack_expansion_data as EXP   # 攻击招式扩充 v1（2026-10-11）：六派第二路 + 江湖散学，数据见该文件

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
GRADES = ['丁', '丙', '乙', '甲', '绝']
MOVE_COUNT = {'丁': 1, '丙': 1, '乙': 1, '甲': 2, '绝': 3}
UNLOCKS = {1: [1], 2: [1, 5], 3: [1, 5, 7]}
TIER = {'丁': '入门', '丙': '进阶', '乙': '专精', '甲': '上乘', '绝': '镇派'}

# 精通（满十重）：只用运行中“十重火候”已支持的 mp / pow / reveal 三类，避免另造结算。
MASTERY = {
    'mp1': ({'mp': -1}, '本功法招式内力 −1'),
    'pow5': ({'pow': .05}, '本功法招式威力（含恢复量）+5%'),
    'reveal1': ({'reveal': 1}, '本功法招式出手时看破 1 处'),
    'mp2': ({'mp': -2}, '本功法非绝招招式内力 −2'),
}

# (id, 名称, 门派, 路线, 品阶, [招式ID…], 精通, 名称状态, 技理, 取得, 阶段, 前置功法)
# 名称状态：kept=沿用已确认名称；review=待命名审定
ARTS = [
    # 归云谷 · 剑
    ('system_gy_foundation_s', '试锋剑法', 'guiyun', '剑', '丁', ['gy_s1'], 'mp1', 'kept', '辨距离、练试锋与回收，归云剑路的基本功。', '首月 B03 后 K01 正式教学，5 体力', 'Y1', None),
    ('art_gy_s2', '拨云剑法', 'guiyun', '剑', '丙', ['gy_s2'], 'mp1', 'review', '以两段轻剑拨开对手架势，练试探与削盾。', '剑路基础三重后，周砚收势课', 'Y1', 'system_gy_foundation_s'),
    ('art_gy_s3', '开晴剑法', 'guiyun', '剑', '乙', ['gy_s3'], 'pow5', 'review', '先守后攻，把防御中看到的空隙化成一击。', '年二主修剑，季度考校通过', 'Y2', 'art_gy_s2'),
    ('system_gy_s', '归云剑诀', 'guiyun', '剑', '甲', ['gy_s4', 'gy_s4b'], 'mp1', 'kept', '收势观敌，守势转攻；高阶集中剑势，不靠多段数量证明造诣。', '年二末起，导师在场，专门传授剧情', 'TRAVEL', 'art_gy_s3'),
    ('art_gy_s_jue', '云开见山剑', 'guiyun', '剑', '绝', ['gy_s5a', 'gy_s5b', 'gy_s5'], 'mp2', 'review', '先辨虚实再见根本，以守势换取决断。', '剑路长线实务与导师复盘后个人领悟', 'LATE', 'system_gy_s'),
    # 归云谷 · 拳掌
    ('system_gy_foundation_p', '守拙拳法', 'guiyun', '拳掌', '丁', ['gy_p1'], 'pow5', 'kept', '稳架、出手、收势与重心转换，可空手施展。', '首月 B03 后 K02 正式教学，5 体力', 'Y1', None),
    ('art_gy_p2', '回岚身法', 'guiyun', '拳掌', '丙', ['gy_p2'], 'mp1', 'review', '错身卸力的步法，剑、拳两路都能辅助。', '拳路基础三重后，师叔步法课', 'Y1', 'system_gy_foundation_p'),
    ('art_gy_p3', '叠岚掌法', 'guiyun', '拳掌', '乙', ['gy_p3'], 'pow5', 'review', '护人承伤后叠劲还击。', '年二主修拳掌，季度考校通过', 'Y2', 'art_gy_p2'),
    ('system_gy_p', '归云拳掌法', 'guiyun', '拳掌', '甲', ['gy_p4', 'gy_p4b'], 'mp1', 'kept', '站稳、卸力、叠劲与承伤后还击相贯。', '年二末起，导师在场，专门传授剧情', 'TRAVEL', 'art_gy_p3'),
    ('art_gy_p_jue', '万壑掌', 'guiyun', '拳掌', '绝', ['gy_p5a', 'gy_p5b', 'gy_p5'], 'mp2', 'review', '一声入壑，群山相应；先承住群敌来势，再一并震回。', '拳路长线实务与导师复盘后个人领悟', 'LATE', 'system_gy_p'),
    # 白鹇谷
    ('art_bh_s0', '止血术', 'white-heron', '医', '丁', ['bh_s0'], 'pow5', 'review', '辨伤、止血与包扎，白鹇谷人人先学的急救。', '白鹇谷公开急救课，或苏芷指点', 'Y1', None),
    ('art_bh_s1', '金针刺穴法', 'white-heron', '针', '丙', ['bh_s1'], 'reveal1', 'review', '辨穴下针，以针探出对手破绽。', '止血术三重后，医案执事考核', 'Y1', 'art_bh_s0'),
    ('art_bh_s2', '回春散方', 'white-heron', '药', '丙', ['bh_s2'], 'pow5', 'review', '依证配散，急救单人。', '止血术三重后，医案执事考核', 'Y1', 'art_bh_s0'),
    ('art_bh_s3', '净脉针法', 'white-heron', '医', '乙', ['bh_s3'], 'mp1', 'review', '以针导药，治疗同时清除一项异常。', '金针刺穴法或回春散方五重，谷中复诊实务', 'Y2', 'art_bh_s1|art_bh_s2'),
    ('art_bh_jia', '百草回生术', 'white-heron', '医', '甲', ['bh_s4', 'bh_s4b'], 'mp1', 'review', '汇集药性接续生机，救活着的人，不能起死回生。', '谷主何素问许可，外地疫病实务后传授', 'TRAVEL', 'art_bh_s3'),
    ('art_bh_jue', '相续针诀', 'white-heron', '医', '绝', ['bh_s5a', 'bh_s5b', 'bh_s5'], 'mp2', 'review', '一息尚存便有转机，保住最后一息等待后援。', '白鹇谷长线医案与谷主亲传', 'LATE', 'art_bh_jia'),
    # 照川剑派
    ('art_zc_s1', '照水剑法', 'zhaochuan', '剑', '丁', ['zc_s1'], 'mp1', 'review', '以剑映水般先试其形，低费起手。', '照川公开试艺或外派基础课', 'Y1', None),
    ('art_zc_s2', '折光剑法', 'zhaochuan', '剑', '丙', ['zc_s2'], 'mp1', 'review', '三段折锋，段均轻而拆防稳。', '照水剑法三重，教习梁照庭考校', 'Y1', 'art_zc_s1'),
    ('art_zc_s3', '问隙剑法', 'zhaochuan', '剑', '乙', ['zc_s3'], 'reveal1', 'review', '先问破绽，再对已看破之处加力。', '折光剑法五重，掌门顾行简考校', 'Y2', 'art_zc_s2'),
    ('art_zc_jia', '照川剑法', 'zhaochuan', '剑', '甲', ['zc_s4', 'zc_s4b'], 'pow5', 'kept', '落击先破架，守中留反击。', '唐照雪个人篇与掌门许可', 'TRAVEL', 'art_zc_s3'),
    ('art_zc_jue', '澄江剑', 'zhaochuan', '剑', '绝', ['zc_s5a', 'zc_s5b', 'zc_s5'], 'mp2', 'review', '水清而虚实可见，识破路数后以一剑收束。', '唐照雪个人篇后期领悟', 'LATE', 'art_zc_jia'),
    # 合川拳门
    ('art_hc_s1', '落桩拳', 'hechuan', '拳', '丁', ['hc_s1'], 'mp1', 'review', '站桩出拳，稳定低费。', '合川拳馆公开课', 'Y1', None),
    ('art_hc_s2', '横肩护人术', 'hechuan', '拳', '丙', ['hc_s2'], 'mp1', 'review', '护运中练出的替人挡招。', '落桩拳三重，随队护运一次', 'Y1', 'art_hc_s1'),
    ('art_hc_s3', '崩石拳', 'hechuan', '拳', '乙', ['hc_s3'], 'pow5', 'review', '短劲破架，命中拳弱点再削一层护盾。', '横肩护人术五重，门主杜敬山考校', 'Y2', 'art_hc_s2'),
    ('art_hc_jia', '合川拳法', 'hechuan', '拳', '甲', ['hc_s4', 'hc_s4b'], 'mp1', 'kept', '众人合力撑山，稳架护众后重拳开闩。', '段明棠或石长庚个人篇后门主传授', 'TRAVEL', 'art_hc_s3'),
    ('art_hc_jue', '震关拳', 'hechuan', '拳', '绝', ['hc_s5a', 'hc_s5b', 'hc_s5'], 'mp2', 'review', '以短促合力制止敌人蓄势。', '合川拳门长线护运事件后传授', 'LATE', 'art_hc_jia'),
    # 松风观
    ('art_sf_s1', '松间步', 'songfeng', '步', '丁', ['sf_s1'], 'mp1', 'review', '松间错步，自身卸力。', '松风观公开早课', 'Y1', None),
    ('art_sf_s2', '引枝剑', 'songfeng', '剑', '丙', ['sf_s2'], 'mp1', 'review', '以剑引开来锋，为同伴卸力。', '松间步三重，监院明谦许可', 'Y1', 'art_sf_s1'),
    ('art_sf_s3', '三径相援法', 'songfeng', '剑', '乙', ['sf_s3'], 'mp1', 'review', '三人相援，卸力并调整同伴行动先后。', '引枝剑五重，与观中弟子合练', 'Y2', 'art_sf_s2'),
    ('art_sf_jia', '松涛剑法', 'songfeng', '剑', '甲', ['sf_s4', 'sf_s4b'], 'pow5', 'review', '松涛由众枝同响，合阵须有人先守。', '闻疏桐个人篇后观主静笃传授', 'TRAVEL', 'art_sf_s3'),
    ('art_sf_jue', '万籁剑阵', 'songfeng', '剑', '绝', ['sf_s5a', 'sf_s5b', 'sf_s5'], 'mp2', 'review', '万籁归于同一节拍，稳住队伍再接上行动。', '松风观长线事件后观主亲传', 'LATE', 'art_sf_jia'),
    # 归烬堂
    ('art_gj_s1', '藏锋刺', 'guijintang', '刀', '丁', ['gj_s1'], 'mp1', 'review', '贴身短刺，不等于暗器。', '归烬堂堂众基础课', 'Y1', None),
    ('art_gj_s2', '燃隙刀', 'guijintang', '刀', '丙', ['gj_s2'], 'pow5', 'review', '以自身暴露换一记强击。', '藏锋刺三重，堂内考校', 'Y1', 'art_gj_s1'),
    ('art_gj_s3', '断烬身法', 'guijintang', '刀', '乙', ['gj_s3'], 'mp1', 'review', '两段短刺后收身留路。', '燃隙刀五重，堂主韩烬川许可', 'Y2', 'art_gj_s2'),
    ('art_gj_jia', '焚契刀法', 'guijintang', '刀', '甲', ['gj_s4', 'gj_s4b'], 'pow5', 'review', '斩断旧约，付出暴露换取突围。', '岑霜或戚铮个人篇后堂主传授', 'TRAVEL', 'art_gj_s3'),
    ('art_gj_jue', '留生短兵诀', 'guijintang', '刀', '绝', ['gj_s5a', 'gj_s5b', 'gj_s5'], 'mp2', 'review', '猛火之后还留生路，攻势未尽时先替同伴安排退路。', '岑霜个人篇后期领悟（个人）', 'LATE', 'art_gj_jia'),
    # 巡江司
    ('art_pj_s1', '横江棍法', 'patrol', '棍', '丁', ['pj_s1'], 'mp1', 'review', '长兵横拦，展示擒拿路数。', '巡江司差务训练', 'Y1', None),
    ('art_pj_s2', '回杆卸势', 'patrol', '棍', '丙', ['pj_s2'], 'mp1', 'review', '回杆削弱对手下一击。', '横江棍法三重，差务复盘', 'Y1', 'art_pj_s1'),
    ('art_pj_s3', '断渡擒法', 'patrol', '棍', '乙', ['pj_s3'], 'mp1', 'review', '截断去路，把可延后的敌人压到最后。', '回杆卸势五重，沈雁回带队实务', 'Y2', 'art_pj_s2'),
    ('art_pj_jia', '巡江擒护法', 'patrol', '棍', '甲', ['pj_s4', 'pj_s4b'], 'mp1', 'kept', '风雨中护送归人，锁住来犯者。', '沈雁回个人篇后差务长官许可', 'TRAVEL', 'art_pj_s3'),
    # 清徽阁（2026-10-08 新增，纯女子音律门派；琴路阴劲、笛路风劲）
    ('art_hui_q1', '勾挑指法', 'qinghui', '琴', '丁', ['hui_q1'], 'mp1', 'review', '勾、挑、抹、剔，先练准音位再谈音劲。', '清徽阁入门课（只收女弟子）', 'TRAVEL', None),
    ('art_hui_q2', '商声琴法', 'qinghui', '琴', '丙', ['hui_q2'], 'reveal1', 'review', '商音清冷，两声相叠扰人心神。', '勾挑指法三重，首徒林清徵考校', 'TRAVEL', 'art_hui_q1'),
    ('art_hui_q3', '静夜琴诀', 'qinghui', '琴', '乙', ['hui_q3'], 'mp1', 'review', '以低音长韵沉入经脉，点封穴道。', '商声琴法五重，阁主许可', 'TRAVEL+', 'art_hui_q2'),
    ('art_hui_jia_q', '清徽琴法', 'qinghui', '琴', '甲', ['hui_q4a', 'hui_q4b'], 'pow5', 'review', '清音有准：先安同伴心神，再断敌之心弦。', '静夜琴诀七重，阁主亲传', 'LATE', 'art_hui_q3'),
    ('art_hui_jue_q', '太音希声', 'qinghui', '琴', '绝', ['hui_q5a', 'hui_q5b', 'hui_q5'], 'mp2', 'review', '余音乱心，希声封穴：先以绕梁余音扰乱众敌心神，最强的一声几乎听不见，却封住众人穴道。', '清徽琴法七重，长线事件后阁主传授', 'LATE', 'art_hui_jia_q'),
    ('art_hui_d1', '横笛调', 'qinghui', '笛', '丁', ['hui_d1'], 'mp1', 'review', '横笛吐纳与指孔，先求一声清啸。', '清徽阁入门课（只收女弟子）', 'TRAVEL', None),
    ('art_hui_d2', '折柳笛法', 'qinghui', '笛', '丙', ['hui_d2'], 'mp1', 'review', '折柳送别之曲，缠住对手脚步。', '横笛调三重，谢晚笛指点', 'TRAVEL', 'art_hui_d1'),
    ('art_hui_d3', '梅落笛法', 'qinghui', '笛', '乙', ['hui_d3'], 'pow5', 'review', '梅花落曲，笛声四散令众敌心惊。', '折柳笛法五重，谢晚笛考校', 'TRAVEL+', 'art_hui_d2'),
    ('art_hui_jia_d', '关山笛诀', 'qinghui', '笛', '甲', ['hui_d4a', 'hui_d4b'], 'mp1', 'review', '关山月远：守城传讯的笛法，既能伤敌，也能催动同伴。', '梅落笛法七重，谢晚笛亲传', 'LATE', 'art_hui_d3'),
    ('art_hui_jue_d', '裂石笛', 'qinghui', '笛', '绝', ['hui_d5a', 'hui_d5b', 'hui_d5'], 'mp2', 'review', '响遏行云、声裂金石，一声令敌胆寒。', '关山笛诀七重，长线事件后传授', 'LATE', 'art_hui_jia_d'),
    # 正道盟（成员协同训练，不设丁、绝）
    ('art_am_s1', '短锋相照', 'alliance', '剑', '丙', ['am_s1'], 'mp1', 'review', '公开护卫演练教的协同短剑。', '正道盟公开护卫演练', 'Y1', None),
    ('art_am_jia', '明约协锋法', 'alliance', '剑', '甲', ['am_s2', 'am_s3'], 'mp1', 'kept', '徐令仪师友所传，自己的出手为下一名同伴留出位置。', '徐令仪个人篇（个人）', 'TRAVEL', 'art_am_s1'),
]

# 新招式：(id, 名称, 兵器, 档型, 品阶, 段数, 目标, BP模式, 护盾预算, 总威力, 冷却, 效果[(类型,值,条件)], 战斗作用, 说明, 名称含义, 画面)
NEW_MOVES = [
    ('gy_s4b', '敛云守锋', '剑', 'G', '甲', 0, 'self', 'guard_strength', [0, 0, 0, 0], 0, 0,
     [('unload', .40, 'self_next_received_hit'), ('guard_token', 1, 'self_max_one'), ('next_attack_bonus', .30, 'next_same_art_move_once')],
     '守护支援', '自身卸力一次（40%）并得一枚守势；下一次本功法招式威力提高30%', '敛云是收拢云气，守锋是收剑护身；归云剑诀“先收后放”的收势一式。', '剑气收拢成一道竹青弧护在身前，云絮向内卷'),
    ('gy_s5a', '拂岚问剑', '剑', 'B', '甲', 2, 'specified', 'damage', [2, 2, 2, 2], 1.6, 0,
     [('reveal', 1, 'on_hit')], '破势输出', '单体两段并看破一处', '拂去山岚以问剑路，先探明虚实再求决断。', '两道细长剑痕拂开雾气，后一道更亮'),
    ('gy_s5b', '群峰回照', '剑', 'B', '甲', 1, 'all_foes', 'damage', [1, 1, 1, 1], 1.05, 0,
     [('conditional_damage', .2, 'consume_one_self_guard_token')], '群体破势', '敌全体一击；自身有守势时消耗一枚，全体伤害提高20%', '群峰同被日光回照；把守势积下的余裕一次照遍诸敌。', '数道竖立剑光如群峰并起，顶端泛暖光'),
    ('gy_p4b', '推山填壑', '拳', 'B', '甲', 1, 'specified', 'damage', [2, 2, 2, 3], 1.7, 0,
     [('extra_shield_damage', 1, 'consume_one_self_guard_token')], '破势输出', '单体重掌；消耗一枚守势时额外削盾1点', '推动山岳去填平沟壑：归云拳掌由承力转为推力，与绝学《万壑掌》相呼应。', '一掌推出的厚重气墙，前缘云纹翻卷'),
    ('gy_p5a', '千峰压岳', '拳', 'B', '甲', 1, 'specified', 'damage', [1, 1, 1, 1], 1.55, 0,
     [('conditional_damage', .25, 'target_broken')], '破势输出', '单体重击；对已破势目标伤害提高25%', '千峰之重压于一岳，专打已经露出破绽的敌人。', '掌印上叠着层层山形，自上压下'),
    ('gy_p5b', '群壑承声', '拳', 'G', '甲', 0, 'specified', 'guard_strength', [0, 0, 0, 0], 0, 2,
     [('unload', .25, 'one_hit_each_of_two_selected_allies'), ('guard_token', 1, 'self_max_one')], '守护支援', '为两名同伴各一次卸力，自身得一枚守势', '群壑承接声响而不乱；先替同伴承住来势，为万壑回响蓄势。', '两道回旋气流护住左右，中间一圈低沉声纹'),
    ('bh_s0', '止血包扎', '医具', 'H', '丁', 0, 'specified', 'healing', [0, 0, 0, 0], 0, 0,
     [('heal_coefficient', .55, 'immediate'), ('cleanse_bleed', 1, 'dispellable_only')], '医疗维持', '低量单体恢复，并解除流血', '止血、包扎是白鹇谷第一课，朴素直白，不冒充成熟医术。', '一圈素白布带缠绕，中间一点止住的红'),
    ('bh_s4b', '解秽散', '医具', 'H', '甲', 0, 'all_allies', 'healing', [0, 0, 0, 0], 0, 2,
     [('cleanse', 1, 'each_alive_ally_dispellable_only'), ('heal_coefficient', .35, 'all_alive_allies')], '群体净化', '全队各解除一项可驱散异常，并各回复0.35倍治疗基值', '解除秽浊的散剂；百草回生术中专管净化的一方。', '药青色粉雾向四周散开，污浊黑点随之消退'),
    ('bh_s5a', '镇魄针', '暗器', 'B', '甲', 1, 'specified', 'damage', [1, 1, 1, 1], 1.4, 0,
     [('next_enemy_attack_reduction', .15, 'boss_half'), ('reveal', 1, 'on_hit')], '牵制看破', '单体针攻，削弱目标下一击并看破一处', '镇住心魄使其不乱；以针定人，是医者为护人而用的针攻。', '三枚金针呈品字钉入一圈暗纹，暗纹被压住'),
    ('bh_s5b', '回脉十二针', '医具', 'H', '甲', 0, 'specified', 'healing', [0, 0, 0, 0], 0, 2,
     [('heal_coefficient', 1.4, 'immediate_capped_35pct_max_hp'), ('cleanse', 99, 'all_dispellable')], '医疗维持', '单体大量恢复并解除全部可驱散异常', '十二针循十二经脉回转，是相续针诀里真正“续”的一手。', '十二道细针光沿环形经络依次点亮'),
    ('zc_s4b', '逆流截江', '剑', 'G', '甲', 0, 'self', 'guard_strength', [0, 0, 0, 0], 0, 2,
     [('guard_token', 1, 'self_max_one'), ('unload', .30, 'self_next_received_hit'), ('counter_power', 1.2, 'first_single_hit_received_before_next_self_action')], '反击守势', '进入守势并卸力30%；下次自身行动前第一次受单体攻击时以1.2倍威力反击', '逆着来势截住江流，照川剑派守中留反击的一式。', '一道竖剑截住横来的水流，水花反卷'),
    ('zc_s5a', '江心定影', '剑', 'B', '甲', 1, 'specified', 'damage', [1, 1, 1, 1], 1.3, 0,
     [('reveal', 2, 'on_hit')], '看破输出', '单体一击并看破两处', '江心水定，倒影才清；一剑把对手的两处破绽照出来。', '平静水面中一道剑影，倒影里显出两处亮点'),
    ('zc_s5b', '千帆照水', '剑', 'B', '甲', 1, 'all_foes', 'damage', [1, 1, 1, 1], 1.0, 0,
     [('conditional_damage', .2, 'target_has_revealed_weakness')], '群体破势', '敌全体一击；对已看破目标伤害提高20%', '千帆过江，帆影皆照在水中；看破过的敌人一个不漏。', '数道细窄剑光如帆影斜掠水面'),
    ('hc_s4b', '开闩重拳', '拳', 'B', '甲', 1, 'specified', 'damage', [3, 3, 3, 4], 1.45, 0,
     [('extra_shield_damage', 2, 'on_matching_weakness_once')], '破势输出', '单体一击；命中拳弱点时额外削盾2点（受每行动上限约束）', '护运人开门卸闩的力道，用来打开对手的架势。', '一记直拳撞断横闩，木屑与赭红劲气四散'),
    ('hc_s5a', '坠桩镇步', '拳', 'B', '甲', 1, 'specified', 'damage', [1, 1, 1, 1], 1.4, 0,
     [('slow', 1, 'target_next_round_order_down_boss_if_marked'), ('next_enemy_attack_reduction', .15, 'boss_half')], '控制节奏', '单体一击，使目标下一回合行动排序降低并削弱其下一击（首领折半）', '如木桩坠地，镇住对手脚步；迟滞不等于跳过回合。', '一根粗桩形劲气砸地，地面裂纹向前延伸'),
    ('hc_s5b', '担山护众', '拳', 'G', '甲', 0, 'specified', 'guard_strength', [0, 0, 0, 0], 0, 2,
     [('intercept', 1, 'next_single_hit_each_of_two_selected_allies'), ('self_speed_multiplier', .85, 'until_next_self_action')], '守护支援', '援护两名同伴各一次单体攻击，自身本轮速度降低', '一肩担山，护住众人；合川拳门“护自己人”的本分。', '宽肩形气劲横展，左右各护住一道人影'),
    ('sf_s4b', '听涛辨枝', '剑', 'B', '甲', 1, 'specified', 'damage', [1, 1, 1, 1], 1.1, 0,
     [('reveal', 1, 'on_hit'), ('next_ally_same_target_damage', .1, 'once_this_round')], '协同看破', '单体一击并看破一处；本回合下一名同伴对该目标伤害提高10%', '听松涛辨出哪一枝在动；为同伴指出该打的地方。', '一道轻剑点在松枝分叉处，松针随声波荡开'),
    ('sf_s5a', '松影千重', '剑', 'B', '甲', 2, 'all_foes', 'hits', [2, 3, 4, 5], 1.0, 0,
     [], '群体拆防', '敌全体两段低威力；BP增加段数用于拆防，总威力不变', '松影重重叠叠，每一重都轻，合起来却拆得开阵势。', '层层灰绿松影向前铺开，剑痕细而多'),
    ('sf_s5b', '风定还枝', '通用', 'G', '甲', 0, 'specified', 'none', [0, 0, 0, 0], 0, 2,
     [('cleanse_slow', 99, 'selected_ally_all_dispellable_slow'), ('cleanse_seal', 1, 'selected_ally'), ('order_shift', -1, 'selected_ally_next_round')], '单人救援', '解除一名同伴的迟滞与封穴，并使其下回合前移一位（眩晕不可解除）；BP 不强化本招', '风停之后，被吹乱的枝条回到原位。', '一阵旋风止息，一根松枝回弹归位'),
    ('gj_s4b', '残火截锋', '刀', 'B', '甲', 1, 'specified', 'damage', [1, 1, 1, 1], 1.6, 0,
     [('conditional_damage', .25, 'self_has_exposure')], '风险强攻', '单体强击；自身带暴露时伤害提高25%', '残火最烈，带着破绽出刀反而更狠；风险不会被抹去。', '一道暗红刀光带着火星截断前方'),
    ('gj_s5a', '烬里藏锋', '刀', 'B', '甲', 1, 'specified', 'damage', [1, 1, 1, 1], 1.35, 0,
     [('target_exposure', .1, 'target_next_received_hit'), ('self_exposure', .1, 'next_received_hit')], '破绽交换', '单体一击，使目标与自身各获一层暴露', '余烬里藏着锋刃；以自身破绽换对方破绽。', '灰烬中露出一点短刀寒光'),
    ('gj_s5b', '回灰护影', '刀', 'G', '甲', 0, 'specified', 'guard_strength', [0, 0, 0, 0], 0, 2,
     [('unload', .25, 'selected_ally_next_received_hit'), ('cleanse_exposure', 1, 'selected_ally')], '守护支援', '为一名同伴卸力一次并解除其暴露', '扬起回灰遮住同伴身影；为强攻后的同伴留退路。', '一片灰幕斜覆在一道人影前'),
    ('pj_s4b', '锁江擒拿', '棍', 'B', '甲', 1, 'specified', 'damage', [2, 2, 2, 3], 1.35, 0,
     [('next_enemy_attack_reduction', .2, 'boss_half'), ('extra_shield_damage', 1, 'target_slowed_once')], '擒拿削弱', '单体一击并削弱目标下一击（首领折半）；目标已迟滞时额外削盾1点', '锁住江面去路，再将来犯者擒住；擒拿是护送的手段。', '长棍横锁，两端钩回扣住一道人影'),
    # 清徽阁 · 琴路（阴劲）
    ('hui_q1', '勾弦', '琴', 'A', '丁', 1, 'specified', 'damage', [1, 1, 1, 1], 1.0, 0, [], '低耗试探', '单体一击；音劲远发', '勾是右手指法之一，入门第一声。', '一道细弦光从琴面勾出'),
    ('hui_q2', '商声', '琴', 'A', '丙', 2, 'specified', 'hits', [2, 3, 4, 5], 1.06, 0, [], '扰心试探', '单体两段，每段可能令目标心乱', '商为五音之一，声清而凄，两声相叠扰人心神。', '两道淡青声纹相叠推出'),
    ('hui_q3', '夜阑', '琴', 'B', '乙', 1, 'specified', 'damage', [1, 1, 1, 1], 1.3, 0, [], '封穴控制', '单体一击，可能封住目标穴道', '夜阑人静，低音沉入经脉。', '一圈暗蓝低音波纹没入人影'),
    ('hui_q4a', '一曲安澜', '琴', 'H', '甲', 0, 'all_allies', 'healing', [0, 0, 0, 0], 0, 2, [('cleanse', 1, 'each_alive_ally_dispellable_only'), ('heal_coefficient', .40, 'all_alive_allies')], '群体清心', '全队各解除一项异常，并各回复0.4倍治疗基值', '安澜是平息波澜；一曲奏罢，众人心神归位。', '平缓的月白音波铺开，抚平几道乱纹'),
    ('hui_q4b', '断弦', '琴', 'B', '甲', 1, 'specified', 'damage', [1, 1, 1, 1], 1.6, 0, [], '扰心输出', '单体重击，可能令目标心乱', '弦断声裂，最锐的一声直刺心神。', '一根琴弦崩断，断口迸出锐利声刃'),
    ('hui_q5a', '余音绕梁', '琴', 'B', '甲', 1, 'all_foes', 'damage', [1, 1, 1, 1], 1.0, 0, [], '群体扰心', '敌全体一击，各可能心乱', '余音绕梁不绝，众敌心神被缠住。', '环形音纹绕成一圈罩住众敌'),
    ('hui_q5b', '定心', '琴', 'G', '甲', 0, 'all_allies', 'guard_strength', [0, 0, 0, 0], 0, 2, [('unload', .20, 'one_hit_each_ally'), ('status_guard', 1, 'each_alive_ally_next_status')], '群体抗扰', '全队各卸力一次（20%），并免疫下一次异常', '一声定音，让同伴心神稳住，不为外扰所动。', '一道竖直定音线贯穿全队'),
    ('hui_q5', '希声', '琴', 'X', '绝', 1, 'all_foes', 'ultimate', [0, 0, 0, 1], 2.9, 0, [], '绝级转局', '敌全体阴劲重击，各可能被封穴；需3BP及24MP', '大音希声：几乎无声的一击，却封住众人穴道。', '万籁俱寂，只余一圈近乎透明的音环扩散'),
    # 清徽阁 · 笛路（风劲）
    ('hui_d1', '清啸', '笛', 'A', '丁', 1, 'specified', 'damage', [1, 1, 1, 1], 1.0, 0, [], '低耗试探', '单体一击；笛音远发', '一声清啸，笛路的第一课。', '一道细长风线从笛孔射出'),
    ('hui_d2', '折柳', '笛', 'A', '丙', 1, 'specified', 'damage', [1, 1, 1, 1], 1.05, 0, [], '迟滞牵制', '单体一击，可能令目标迟滞', '折柳送别，曲声缠住对手脚步。', '一枝柳条形音纹缠住人影脚下'),
    ('hui_d3', '梅落', '笛', 'B', '乙', 1, 'all_foes', 'damage', [1, 1, 1, 1], .85, 0, [], '群体惊扰', '敌全体一击，各可能惊惧', '梅花落曲，笛声四散，梅瓣般落向众敌。', '数片梅瓣形音纹四散落下'),
    ('hui_d4a', '关山月', '笛', 'B', '甲', 3, 'specified', 'damage', [3, 3, 3, 3], 1.55, 0, [], '破势输出', '单体三段风劲；适合拆盾', '关山月是边塞笛曲，三叠长音直贯敌阵。', '三道层叠的月白长音贯穿向前'),
    ('hui_d4b', '催行', '笛', 'G', '甲', 0, 'all_allies', 'none', [0, 0, 0, 0], 0, 2, [('team_attack_bonus', .15, 'each_alive_ally_next_attack'), ('cleanse_fear', 1, 'each_alive_ally')], '群体鼓舞', '全队下一次攻击伤害+15%，并解除惊惧', '催行是守城时催促同伴前进的笛号。', '一串急促的风纹从后向前推过全队'),
    ('hui_d5a', '遏云', '笛', 'B', '甲', 1, 'specified', 'damage', [1, 1, 1, 1], 1.6, 0, [('reveal', 1, 'on_hit')], '看破输出', '单体一击风劲，看破一处弱点', '响遏行云：笛声高到能把云停住。', '一道直冲上空的风柱，云絮被截住'),
    ('hui_d5b', '惊鸿过隙', '笛', 'B', '甲', 1, 'all_foes', 'damage', [1, 1, 1, 1], .8, 2, [], '群体控场', '敌全体一击，各可能迟滞与惊惧', '笛声如惊鸿掠过，众敌一时失了节拍。', '一道鸿雁形风纹横掠敌阵'),
    ('hui_d5', '裂石', '笛', 'X', '绝', 1, 'specified', 'ultimate', [0, 0, 0, 1], 4.4, 0, [], '绝级转局', '单体风劲重击，必定惊惧；需3BP及24MP', '声裂金石，一声令敌胆寒。', '一道笔直的白色风刃劈开岩石'),
]

# 攻击招式扩充 v1（2026-10-11）：门派第二路 30 门 + 江湖散学 28 门，共 97 个攻击招；设计见 martial-review/attack-expansion-v1.md
EXP_ART_IDS = set(EXP.ALL_ART_IDS)
EXP_ART_META = {}
for (aid, name, group, path, grade, moves, mastery, principle, obtain, phase, prereq) in EXP.SECT_ARTS:
    ARTS.append((aid, name, group, path, grade, moves, mastery, 'review', principle, obtain, phase, prereq))
    EXP_ART_META[aid] = {'expansion': 'attack-v1', 'route_note': EXP.SECT_ROUTE_NOTE[group]}
for (aid, name, path, grade, moves, mastery, principle, proto, otype, where, how) in EXP.JIANGHU_ARTS:
    ARTS.append((aid, name, 'jianghu', path, grade, moves, mastery, 'review', principle, f'{otype}：{how}', EXP.PHASE_BY_GRADE[grade], None))
    EXP_ART_META[aid] = {'expansion': 'attack-v1', 'prototype': proto, 'placement': {'type': otype, 'where': where, 'how': how}}
NEW_MOVES += EXP.MOVES
EXP_MOVE_IDS = set(EXP.MOVE_IDS)

# 人物技能（暂缓）：沿用旧分组 ID，保持 64 招一招一主。
CHARACTER_GROUPS = ['system_yh_care', 'system_yh_needle', 'system_yh_med', 'system_yl', 'system_qx', 'system_lh', 'system_qf', 'system_rq', 'system_lhg', 'system_hzc']

# 江湖散学候选：旧原型招式，名称、来源与品阶待命名审定和世界观审定。
JIANGHU = [
    ('art_jh_fuhu', '伏虎拳', '丙', ['fuhu'], '武馆、镖局切磋'),
    ('art_jh_liuye', '柳叶剑法', '丙', ['liuye'], '书铺手抄本'),
    ('art_jh_lianhua', '莲花落', '丙', ['lianhua'], '市井乞儿与说唱艺人传授的掌法（获取地点待安排）'),
    ('art_jh_shuaibei', '乞儿摔碑手', '丁', ['shuaibei'], '旧原型出身“小乞”自带；现行主线中由市井乞儿传授'),
    ('art_jh_bianfa', '牧羊鞭法', '丁', ['bianfa'], '旧原型出身“放羊娃”自带；现行主线中由山村牧人传授'),
    ('art_jh_guafeng', '刮风脚', '乙', ['guafeng'], '获取方式与地点待安排（原为击败旧襄阳演示红冠将军后领悟）'),
]

PHASE_ORDER = {'Y1': 0, 'Y2': 1, 'TRAVEL': 2, 'LATE': 3}
# 学习门槛（2026-10-08 用户确认：功法不与章节绑定，用属性门槛防止初期学会高阶功法）
ATTR = {'str': '臂力', 'con': '根骨', 'agi': '身法', 'wil': '定力', 'wis': '悟性'}
ROUTE = {'剑': ('agi', 'wis'), '刀': ('str', 'agi'), '拳掌': ('str', 'con'), '拳': ('str', 'con'), '棍': ('str', 'wil'), '针': ('agi', 'wis'),
         '琴': ('wis', 'wil'), '笛': ('wis', 'wil'), '医': ('wis', 'wil'), '药': ('wis', 'wil'), '步': ('agi', 'wil'),
         # 扩充 v1：门派第二路与江湖散学的路线（按 martial-lineage.md §3.2：暗器 身法/悟性，长兵 臂力/定力，音律 悟性/定力；拂尘为软兵，取身法/定力）
         '飞针': ('agi', 'wis'), '袖剑': ('agi', 'wis'), '烬砂': ('agi', 'wis'), '暗器': ('agi', 'wis'), '杠棒': ('str', 'wil'), '长兵': ('str', 'wil'), '拂尘': ('agi', 'wil'), '音律': ('wis', 'wil')}
REQ = {'丁': {}, '丙': {'main': 6}, '乙': {'main': 9, 'sub': 6}, '甲': {'main': 12, 'sub': 9, 'con': 8}, '绝': {'main': 15, 'sub': 12, 'con': 11, 'wil': 10}}


def learn_req(path, grade):
    main, sub = ROUTE[path]
    r = {}
    for k, v in REQ[grade].items():
        key = main if k == 'main' else sub if k == 'sub' else k
        r[key] = max(r.get(key, 0), v)
    return r



def mp_for(profile, grade):
    if profile == 'X':
        return 24
    return {'G': {'丁': 3, '丙': 5, '乙': 8, '甲': 14}, 'H': {'丁': 4, '丙': 6, '乙': 10, '甲': 16}}.get(profile, {'丁': 2, '丙': 4, '乙': 8, '甲': 14})[grade]


# 模拟后下调内力的新招式（2026-10-08 第六轮）：甲级自保招按模板 14 内力从未被选用
MP_OVERRIDE = {'gy_s4b': 6, 'zc_s4b': 8, 'gj_s5b': 8, **EXP.MP_OVERRIDE}
DEFEND_ENHANCE = {'gy_s4b', 'zc_s4b'}   # 与 build_status.py 一致


def contract(row):
    (id, name, weapon, profile, grade, hits, target, mode, shield, power, cooldown, fx, *_rest) = row
    effects = [{'type': t, 'value': v, 'condition': c} for t, v, c in fx]
    c = {'version': 'MOVE-CONTRACT-3', 'status': 'lineage_v3_proposal_pending_naming', 'mp': MP_OVERRIDE.get(id, mp_for(profile, grade)), 'action_cost': 1,
         'total_power': power, 'base_hits': hits, 'hit_weights': [round(1 / hits, 6)] * hits if hits else [], 'accuracy': 1 if grade == '丁' or not hits else .95,
         'target': target, 'target_count': 2 if 'two_selected' in json.dumps(fx) else 'all_alive' if target in ['all_allies', 'all_foes'] else 1,
         'cooldown_self_actions': cooldown, 'cooldown_clock': 'caster_action_start; next N opportunities blocked', 'duration_recipient_actions': 0,
         'guard_expiry': 'before_next_caster_action', 'max_level': 10, 'mastery_per_level': .04, 'effects': effects, 'bp': [],
         'ultimate_lock_next_self_actions': 0, 'runtime_id': None, 'runtime_note': '门派功法 v3 新增招式合同；待命名审定与图标，未开放学习、装配或战斗效果。'}
    for bp in range(4):
        h = hits + bp if mode == 'hits' else hits
        mult = [1, 1.35, 1.7, 2.1][bp] if mode == 'damage' else 1
        ef = [dict(e) for e in effects]
        for e in ef:
            if mode == 'guard_strength' and e['type'] == 'unload':
                e['value'] = round(e['value'] + [0, .05, .10, .15][bp], 2)   # 以基础值为 0BP，每档 +5%
            if e['type'] == 'intercept':
                e['damage_reduction'] = [.25, .30, .35, .40][bp] if mode == 'guard_strength' else .25
        ok = profile != 'X' or bp == 3   # 绝招必须 3BP；威力已含满蓄势
        if profile == 'X':
            mult = 1
        c['bp'].append({'spent': bp, 'available': ok, 'total_power': round(power * mult, 4) if ok else 0, 'hits': h if ok else 0, 'shield_cap': shield[bp] if ok else 0,
                        'heal_multiplier': [1, 1.25, 1.5, 1.8][bp] if mode == 'healing' else 1, 'duration_recipient_actions': 0, 'effects': ef if ok else []})
    c['ultimate_lock_next_self_actions'] = 1 if profile == 'X' else 0
    if id in DEFEND_ENHANCE:
        c.update(mp=0, cooldown_self_actions=0, usage_note='防御强化：选防御时自动附带，不另耗内力')
    return c


def main():
    catalog = json.loads((DOC / 'catalog.json').read_text())
    catalog['groups'].setdefault('jianghu', ['江湖散学', '不挂门派的单门功法，靠秘籍、奇遇、人物传授取得；2026-10-11 起含改编自金庸、古龙小说的功法（名称另起，内容按小说描写转成本作机制）。', '按各功法自身意象设计，不套门派配色。'])
    old = json.loads((DOC / 'martial-systems-v2.json').read_text())  # v2 存档，保证重复运行结果一致
    old_by = {s['id']: s for s in old['systems']}
    skills = {s['id']: s for s in catalog['skills']}
    new = {r[0]: r for r in NEW_MOVES}
    inner = {g: [] for g in catalog['groups']}
    for s in old['systems']:
        for i in s['compatible_inner_ids']:
            if i not in inner[s['group']]:
                inner[s['group']].append(i)

    arts, owner, unlock_of = [], {}, {}
    for (aid, name, group, path, grade, moves, mastery, name_status, principle, obtain, phase, prereq) in ARTS:
        assert len(moves) == MOVE_COUNT[grade], (aid, grade, moves)
        unlocks = UNLOCKS[len(moves)]
        move_rows = []
        for i, (k, lv) in enumerate(zip(moves, unlocks)):
            g = skills[k]['grade'] if k in skills else new[k][4]
            # 招式品阶不高于功法；最后开启的一招等于功法品阶（绝级最后一招为 X 型绝招）。
            assert GRADES.index(g) <= GRADES.index(grade), (aid, k, g)
            if i == len(moves) - 1:
                assert g == grade, (aid, k, g)
            assert k not in owner, k
            owner[k] = aid
            unlock_of[k] = lv
            move_rows.append({'id': k, 'name': skills[k]['name'] if k in skills else new[k][1], 'grade': g, 'unlock_level': lv,
                              'status': 'existing_contract' if k in skills else 'new_pending_naming'})
        personal = [u for k in moves if k in skills and skills[k]['access'] == 'personal' for u in skills[k]['allowed_users']]
        eff, desc = MASTERY[mastery]
        mastery_moves = [m['id'] for m in move_rows if not (mastery == 'mp2' and m['id'] == moves[-1])]
        legacy = old_by.get(aid, {})
        arts.append({'id': aid, 'name': name, 'kind': 'external_art', 'category': 'external', 'group': group, 'group_name': catalog['groups'][group][0],
                     'path': path, 'tier': '江湖散学' if group == 'jianghu' else TIER[grade], 'grade': grade, 'move_count': len(moves), 'moves': move_rows, 'skill_ids': [m for m in moves if m in skills],
                     'new_move_ids': [m for m in moves if m not in skills], 'principle': principle, 'obtain': obtain, 'reference_phase': phase, 'learn_req': learn_req(path, grade), 'learn_req_text': '、'.join(f'{ATTR[k]}{v}' for k, v in learn_req(path, grade).items()) or '无',
                     'prerequisite': ({'any_of': prereq.split('|'), 'level': 5 if grade == '乙' else 3} if prereq and '|' in prereq else
                                      {'art_id': prereq, 'level': {'丙': 3, '乙': 5, '甲': 7, '绝': 7}[grade]} if prereq else None),
                     'mastery': {'level': 10, 'effect': eff, 'description': desc, 'move_ids': mastery_moves},
                     'access': 'personal' if personal else 'licensed_teaching', 'allowed_users': sorted(set(personal)),
                     'name_status': 'kept' if name_status == 'kept' else 'final_v3',
                     'compatible_inner_ids': inner[group], 'status': legacy.get('status', 'design_v3_not_runtime'),
                     'runtime_status': legacy.get('runtime_status', 'planned_not_runtime'),
                     # 沿用旧上乘传承的传授触发与来源说明；前置改为同路乙级七重
                     **({k: legacy[k] for k in ['teaching_trigger', 'source', 'advances_to'] if k in legacy}),
                     # 图录筛选沿用 training_stages 字段
                     'training_stages': [{'name': m['name'], 'grade': m['grade'], 'requires': ('学会即得' if m['unlock_level'] == 1 else f"本功法{m['unlock_level']}重开启"), 'skill_id': m['id']} for m in move_rows],
                     'grade_note': f"{grade}级外功，{len(moves)} 招；" + '、'.join(f"{m['name']}（{'学会即得' if m['unlock_level'] == 1 else str(m['unlock_level']) + '重'}）" for m in move_rows),
                     **EXP_ART_META.get(aid, {}),
                     'completeness': '已接入本地培养' if legacy.get('runtime_status') == 'foundation_runtime' else ('含待命名新招式' if any(m not in skills for m in moves) else '招式合同齐备，传授剧情未接入')})
    for a in arts:
        t = a.get('teaching_trigger')
        if t and a['prerequisite']:
            first = next(x for x in arts if x['id'] == a['prerequisite']['art_id'])['moves'][0]['id']
            a['teaching_trigger'] = {**t, 'prerequisite_course': first, 'prerequisite_level': a['prerequisite']['level']}
            a['prerequisite_systems'] = [a['prerequisite']['art_id']]
        if a.get('advances_to'):
            a['advances_to'] = next((x['id'] for x in arts if x['prerequisite'] and x['prerequisite'].get('art_id') == a['id']), None)
    assert len(arts) == 52 + len(EXP_ART_IDS), len(arts)
    assert sorted(new) == sorted(k for a in arts for k in a['new_move_ids'])

    groups = []
    for gid in CHARACTER_GROUPS:
        s = dict(old_by[gid])
        s.update(kind='character_skill_group', category='character_skill', status='paused_pending_character_schedule', runtime_status='paused',
                 completeness='人物技能暂缓：品阶随人物等级提升，等出场时机与个人篇定稿后细化',
                 grade_note='人物技能不算外功，不套用品阶定招式数，不可传授。')
        for k in s['skill_ids']:
            assert k not in owner, k
            owner[k] = gid
            unlock_of[k] = None
        groups.append(s)
    assert sorted(owner) == sorted(list(skills) + list(new)), set(skills) - set(owner)

    jianghu = [{'id': i, 'name': n, 'grade': g, 'kind': 'jianghu_candidate', 'runtime_skill_ids': m, 'obtain': o, 'move_count': 1,
                'status': 'candidate_pending_naming_and_lore_review'} for i, n, g, m, o in JIANGHU]

    out = {'version': 'MARTIAL-SYSTEM-3', 'date': '2026-10-07', 'status': 'lineage_v3_rules_confirmed_names_pending',
           'rules_ref': '../martial-lineage.md', 'rules': {'move_count_by_grade': MOVE_COUNT, 'unlock_levels': {str(k): v for k, v in UNLOCKS.items()},
                                                          'art_level': '本功法已学各招重数的最高值；已开启招式共享功法重数', 'mastery_level': 10},
           'systems': arts + groups, 'jianghu_candidates': jianghu, 'standalone_hearts': old['standalone_hearts'],
           'runtime_adoption': old['runtime_adoption'], 'relationship_rule': old['relationship_rule']}
    (DOC / 'martial-systems.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')

    for k, s in skills.items():
        s['system_id'] = owner[k]
        s['art_unlock_level'] = unlock_of[k]
        s['character_skill'] = owner[k] in CHARACTER_GROUPS
    (DOC / 'catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')

    rows = []
    for r in NEW_MOVES:
        (id, name, weapon, profile, grade, hits, target, mode, shield, power, cooldown, fx, role, effect, meaning, visual) = r
        rows.append({'id': id, 'name': name, 'name_status': 'final_v3', 'group': catalog['groups'][arts[[a['id'] for a in arts].index(owner[id])]['group']][0],
                     'system_id': owner[id], 'unlock_level': unlock_of[id], 'grade': grade, 'weapon': weapon, 'profile': profile, 'combat_role': role,
                     'target_mode': target, 'boost_mode': mode, 'base_hits': hits, 'shield_budget_by_bp': shield, 'effect': effect, 'visual': visual,
                     'naming': {'meaning': meaning, 'basis': ('攻击招式扩充 v1：' + ('改编自小说功法，名称另起；原型见所属功法 prototype 字段' if id.startswith('jh_') else '门派第二路，原创意象')) if id in EXP_MOVE_IDS else '原创武侠意象；与金庸、古龙同名检索待命名审定', 'status': 'final_v3'},
                     **({'expansion': 'attack-v1'} if id in EXP_MOVE_IDS else {}),
                     **({'free_hand': True} if id in EXP.FREE_HAND else {}),   # 徒手招：指力、掌力、内力发声，不要求装备兵器
                     'combat': contract(r), 'icon_status': (('generated_v4_pending_review' if (ROOT / f'art_sources/martial_icons_v4/{id}.png').exists() else 'pending_icon_v4') if id in EXP_MOVE_IDS else 'not_generated_wait_naming_review')})   # 扩充招式：v4 图标已生成则标“待评审”
    (DOC / 'lineage-v3-moves.json').write_text(json.dumps({'version': 'LINEAGE-V3-MOVES', 'date': '2026-10-07', 'status': 'proposal_names_final_v3',
                                                         'count': len(rows), 'moves': rows}, ensure_ascii=False, indent=2) + '\n')

    # 运行数据：只包含门派功法与散学候选；人物技能暂缓，仍由旧逻辑按单招收纳。
    runtime = [{'id': a['id'], 'name': a['name'], 'grade': a['grade'], 'tier': a['tier'], 'group': a['group'], 'skillIds': [m['id'] for m in a['moves']],
                'unlocks': {m['id']: m['unlock_level'] for m in a['moves']}, 'mastery': {'moves': a['mastery']['move_ids'], 'effect': a['mastery']['effect'], 'text': a['mastery']['description']},
                'principle': a['principle'], 'path': a['path'], 'learnReq': a['learn_req'], 'prereq': a['prerequisite']} for a in arts]
    # learnReq/prereq：秘籍“点书学会”的学习要求（docs/design/secret-manuals.md）
    runtime += [{'id': j['id'], 'name': j['name'], 'grade': j['grade'], 'tier': '江湖散学', 'group': 'jianghu', 'skillIds': j['runtime_skill_ids'],
                 'unlocks': {k: 1 for k in j['runtime_skill_ids']}, 'mastery': None, 'principle': '江湖散学候选：' + j['obtain'],
                 'path': j.get('path'), 'learnReq': j.get('learn_req') or {}, 'prereq': None} for j in jianghu]
    (ROOT / 'js/martial-external-data.js').write_text('/* 由 tools_docs/build_martial_lineage_v3.py 生成，勿手改。门派功法传承 v3。 */\nwindow.MartialExternalArts=' +
                                                     json.dumps(runtime, ensure_ascii=False, indent=1) + ';\n')

    write_docs(arts, groups, jianghu, rows)
    print(json.dumps({'arts': len(arts), 'moves_in_arts': sum(a['move_count'] for a in arts), 'new_moves': len(rows),
                      'character_groups_paused': len(groups), 'jianghu_candidates': len(jianghu)}, ensure_ascii=False))


def write_docs(arts, groups, jianghu, rows):
    L = ['> 由 `tools_docs/build_martial_lineage_v3.py` 生成；规则见[门派功法传承 v3](../martial-lineage.md)。', '',
         '# 门派功法清单 v3', '', '状态：现行　最后核对：2026-10-19（原记：**规则已确认，名称已定稿（2026-10-08）**。外功按品阶定招式数：丁丙乙 1 招，甲 2 招（第二招五重开启），绝 3 招（五重、七重开启）。功法重数取本功法已学各招重数的最高值，满十重得一项精通。）', '',
         f'共 {len(arts)} 门外功（门派 {sum(1 for a in arts if a["group"] != "jianghu")} 门、江湖散学 {sum(1 for a in arts if a["group"] == "jianghu")} 门）、{sum(a["move_count"] for a in arts)} 个招式（其中 v3 新增 {len(rows)} 个，含 2026-10-11 [攻击招式扩充 v1](attack-expansion-v1.md) 的 {len(EXP_MOVE_IDS)} 个）；人物技能 {len(groups)} 组暂缓；江湖散学候选 {len(jianghu)} 门。机器清单：[martial-systems.json](martial-systems.json) · 新招式合同：[lineage-v3-moves.json](lineage-v3-moves.json) · [命名审定表](lineage-v3-naming.md)。', '',
         '| 门派 | 路线 | 层级 | 功法 | 招式（开启重数） | 学习条件（前置与属性） | 精通（十重） | 取得途径 |', '| --- | --- | --- | --- | --- | --- | --- | --- |']
    name = {a['id']: a['name'] for a in arts}
    for a in arts:
        mv = '；'.join(f"{m['name']}{'（新）' if m['status'] != 'existing_contract' else ''} {m['unlock_level']}" for m in a['moves'])
        p = a['prerequisite']
        pre = '—' if not p else (' 或 '.join('《' + name[x] + '》' for x in p['any_of']) + f" {p['level']}重" if 'any_of' in p else f"《{name[p['art_id']]}》{p['level']}重")
        nm = a['name'] + ('' if a['name_status'] == 'kept' else '＊')
        L.append(f"| {a['group_name']} | {a['path']} | {a['grade']}·{a['tier']} | 《{nm}》 | {mv} | {pre}；属性：{a['learn_req_text']} | {a['mastery']['description']} | {a['obtain']}{'（个人）' if a['access'] == 'personal' else ''} |")
    L += ['', '＊ 本轮新起的名称（2026-10-08 定稿）。招式后的数字是开启重数，1 表示学会即得。', '', '## 人物技能（暂缓）', '',
          '以下分组沿用旧 ID 保持一招一主，不算外功、不可传授；品阶随人物等级提升的细则等出场时机与个人篇定稿后再定。', '',
          '| 分组 | 人物技能 |', '| --- | --- |']
    for g in groups:
        L.append(f"| {g['name']}（`{g['id']}`） | {'、'.join(g['skill_ids'])} |")
    L += ['', '## 江湖散学候选', '', '| 功法 | 品阶 | 来源（待世界观审定） |', '| --- | --- | --- |']
    for j in jianghu:
        L.append(f"| 《{j['name']}》 | {j['grade']} | {j['obtain']} |")
    (DOC / 'martial-systems.md').write_text('\n'.join(L) + '\n')

    N = ['> 由 `tools_docs/build_martial_lineage_v3.py` 生成。', '', '# 门派功法 v3 命名审定表', '',
         '状态：现行　最后核对：2026-10-19（原记：**定稿（2026-10-08 用户要求“完成所有的任务”，由 Claude 代为定稿）**：排云推岳改为推山填壑（避开《风云》排云掌），《百步震关拳》改为《震关拳》（避开“百步神拳”），《拨云剑法》保留；其余按下表定稿。江湖散学旧名保留，来源按现行世界观改写。原状态：待用户审定。2026-10-07。列出本轮新起的功法名与新招式名，以及每个名字的含义和设计依据。审定通过前均为占位；改名只改本表和生成脚本，ID 不变。）', '',
         '同名检索：按金庸、古龙主要作品与常见武侠用语做了人工比对，未做全文检索；“需复核”表示存在相近说法。', '',
         '## 一、新功法名', '', '| 功法 | 门派 | 品阶 | 含义与依据 | 同名检索 |', '| --- | --- | --- | --- | --- |']
    flags = {'拨云剑法': '“拨云见日”是通用成语，不是具体功法名；定稿保留',
             '止血术': '通用词，无冲突', '松间步': '无明显同名', '万壑掌': '无明显同名'}
    for a in arts:
        if a['name_status'] == 'kept' or a.get('expansion'):   # 扩充 v1 的名称见 attack-expansion-v1.md，不进 2026-10-08 已定稿的审定表
            continue
        N.append(f"| 《{a['name']}》 | {a['group_name']} | {a['grade']} | {a['principle']} 名称取自本功法招式“{max(a['moves'], key=lambda m: len(set(m['name']) & set(a['name'])))['name']}”的意象。 | {flags.get(a['name'], '未见明显同名')} |")
    N += ['', '## 二、新招式名', '', '| 招式 | 所属功法 | 开启 | 含义与依据 | 画面意象 | 同名检索 |', '| --- | --- | --- | --- | --- | --- |']
    for r in rows:
        if r.get('expansion'):
            continue
        N.append(f"| {r['name']}（`{r['id']}`） | 《{name[r['system_id']]}》 | {'学会即得' if r['unlock_level'] == 1 else str(r['unlock_level']) + '重'} | {r['naming']['meaning']} | {r['visual']} | {flags.get(r['name'], '未见明显同名')} |")
    N += ['', '## 三、江湖散学候选（旧原型名）', '', '这些名字来自旧原型，世界观（旧门派丐帮等）已调整，需决定保留、改名或删除。', '',
          '| 功法 | 品阶 | 旧来源 |', '| --- | --- | --- |'] + [f"| 《{j['name']}》 | {j['grade']} | {j['obtain']} |" for j in jianghu]
    (DOC / 'lineage-v3-naming.md').write_text('\n'.join(N) + '\n')


if __name__ == '__main__':
    main()
