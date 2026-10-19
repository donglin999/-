# 全招式命名与数值合同 v3

状态：现行　最后核对：2026-10-19

64项外功招式均有逐项参数；不自动学会、不改授课资格。现有基础课程消耗3/0MP保留；其余是后续实现合同。比例防御候选公式仅供离线验证，现行战斗公式尚未整体迁移。

## 量纲与结算

- 总威力按整招登记，多段均分总量；群攻为每目标威力，不乘隐藏目标数。
- 每次占1行动；冷却以施者行动开始递减，随后N次行动禁用；持续恢复以受益者行动末结算。
- 内力、BP、冷却同时满足才能用；无合法目标不消耗任何资源。
- 医疗基数12+4×悟性+0.1×最大内力；单次恢复不超过目标最大气血35%；净化只影响可驱散异常。
- 同类伤害加成取最高，条件加成总池封顶30%；对首领的攻击削弱折半。卸力、援护只阻挡声明次数，不拦未声明的群攻。
- 多段削盾仅在对应弱点实际命中时结算；打碎最后盾的那段不吃破势增伤，后续段才吃。
- 绝级需24内力与3BP，威力已含BP；下一次自身行动不得再用任何绝级。
- 装备、人物被动、内功增长不得再次放大表内BP；返还内力、转赠BP、反击不得循环触发自身。

## 逐项清单

| ID | 招式 | 品阶 | 内力 | 总威力／段数 | 冷却（行动） | 功能 |
| --- | --- | --- | --- | --- | --- | --- |
| gy_s1 | 试锋探路 | 丁 | 3 | 1.05／1 | 0 | 单体一击；命中已知剑弱点时给予明确破势教学反馈 |
| gy_s2 | 拨云回锋 | 丙 | 4 | 1.08／2 | 0 | 单体两段；总威力低于同费单击，适合试探与削盾 |
| gy_s3 | 一线开晴 | 乙 | 8 | 1.38／1 | 0 | 单体一击；本角色上次主动防御则增强本击，条件用后清除 |
| gy_s4 | 千岚归一 | 甲 | 14 | 1.62／3 | 0 | 单体三段集中；前两段试锋，末段吃破势增伤；不额外插入行动 |
| gy_s5 | 云开见山 | 绝 | 24 | 4.6／4 | 0 | 单体四段集中，消耗一枚守势强化末击；需要3BP及24MP，施放后下一次自身行动不能再用任何绝级招式 |
| gy_p1 | 守拙立桩 | 丁 | 0 | 1／1 | 0 | 单体一击；空手也能使用的低消耗基本攻击 |
| gy_p2 | 回岚步 | 丙 | 0 | 0／0 | 0 | 自身卸力一次（40%），下一次自身攻击伤害+20%；下次行动前首次受单体攻击时以0.8倍威力反击 |
| gy_p3 | 叠岚掌 | 乙 | 8 | 1.26／2 | 0 | 单体两段；本轮护卫实际承伤后末段增强一次 |
| gy_p4 | 抱山还岳 | 甲 | 14 | 0／0 | 2 | 自身援护一次；承伤后自动反击一击，反击不产生BP和反击链 |
| gy_p5 | 万壑回响 | 绝 | 24 | 2.9／2 | 0 | 敌全体两段，先震后合；需要3BP及24MP，单体威力低于剑路绝技，共享绝级调息间隔 |
| bh_s1 | 金针刺穴 | 丙 | 4 | 1.05／1 | 0 | 单体一击并看破一处；已有同名技能，迁移前保留旧数值 |
| bh_s2 | 回春散 | 丙 | 6 | 0／0 | 0 | 单体急救；已有技能，以旧恢复量为迁移基线 |
| bh_s3 | 净脉针 | 乙 | 10 | 0／0 | 0 | 单体小治疗并解除一个可驱散异常；无异常时保留治疗 |
| bh_s4 | 百草回生 | 甲 | 16 | 0／0 | 2 | 全队中治疗；不能复活，消耗高并有两行动冷却 |
| bh_s5 | 一息相续 | 绝 | 24 | 0／0 | 0 | 指定同伴获得一次濒危保护，致命伤留1HP；需3BP及24MP，同一受益者每战仅能获得本技一次保护；不复活，不叠加其他保命 |
| zc_s1 | 照水起锋 | 丁 | 2 | 1.02／1 | 0 | 单体一击，低费起手；与归云低阶差异主要是后续剑势联动 |
| zc_s2 | 折光三叠 | 丙 | 4 | 1.03／3 | 0 | 单体三段，段均弱；削盾总量按统一上限 |
| zc_s3 | 问隙挑灯 | 乙 | 8 | 1.42／1 | 0 | 对已看破目标单体加强；未看破仍造成正常伤害 |
| zc_s4 | 照川落日 | 甲 | 14 | 1.72／1 | 0 | 单体重击；本次若击破护盾，下回合本人获得一次伤害加成 |
| zc_s5 | 一剑澄江 | 绝 | 24 | 4.3／1 | 0 | 单体集中爆发，已看破种类越多末击越强，上限明确；需3BP及24MP，共享绝级调息间隔 |
| hc_s1 | 落桩拳 | 丁 | 2 | 1.08／1 | 0 | 单体一击，稳定低费；站桩不增加永久防御 |
| hc_s2 | 横肩护人 | 丙 | 5 | 0／0 | 0 | 替一名同伴承担下一次单体攻击并获得减伤；不拦群攻 |
| hc_s3 | 崩石短打 | 乙 | 8 | 1.35／1 | 0 | 单体一击，命中拳弱点时额外削盾一次，受总上限约束 |
| hc_s4 | 合川撑岳 | 甲 | 14 | 0／0 | 2 | 全队各一次卸力，施者本轮速度降低；不等于无敌 |
| hc_s5 | 百步震关 | 绝 | 24 | 3.0／1 | 0 | 敌全体一段；命中弱点且目标蓄力时额外削盾1点；需3BP及24MP，不直接跳过首领行动 |
| sf_s1 | 松间错步 | 丁 | 0 | 0／0 | 0 | 自身卸力一次（40%），下一次自身攻击伤害+15%；下次行动前首次受单体攻击时以0.6倍威力反击 |
| sf_s2 | 引枝卸锋 | 丙 | 5 | 0.6／1 | 0 | 单体轻击（总威力0.6），并为一名同伴卸力一次（30%）；不需要移动真实站位 |
| sf_s3 | 三径相援 | 乙 | 8 | 0／0 | 2 | 选两名同伴各获一次卸力，其中一人下回合前移一位；不新增行动，排序不能越过不可改动的剧情动作 |
| sf_s4 | 松涛合阵 | 甲 | 14 | 1.05／1 | 0 | 敌全体各一击；本轮有同伴主动护卫则威力增加一次 |
| sf_s5 | 万籁归松 | 绝 | 24 | 0／0 | 0 | 全队各一次卸力，并免疫一次可驱散迟滞；下回合首名队友前移一位；无反击和整回合冻结 |
| gj_s1 | 藏锋短刺 | 丁 | 2 | 1.08／1 | 0 | 单体一击；岑霜使用，贴身出手不等于暗器 |
| gj_s2 | 燃隙刀 | 丙 | 4 | 1.32／1 | 0 | 单体强击，施者下一次受击增加10%伤害 |
| gj_s3 | 断烬回身 | 乙 | 8 | 1.2／2 | 0 | 单体两段，随后给自己一次卸力；伤害预算让给退路 |
| gj_s4 | 焚契破阵 | 甲 | 14 | 1.14／1 | 0 | 敌全体各一击；本人获得暴露，不能与强防护同时获全额收益 |
| gj_s5 | 余烬留生 | 绝 | 24 | 3.9／1 | 0 | 指定一敌强击，同时为一名同伴援护一次；需3BP及24MP，共享绝级调息间隔；护卫者承伤不触发连续反击 |
| am_s1 | 短锋相照 | 丙 | 4 | 0.95／1 | 0 | 单体一击后为一名同伴一次轻减伤，伤害较低 |
| am_s2 | 同担一线 | 乙 | 8 | 0／0 | 2 | 选另一名同伴交予蓄势，按BP档给予2/2/3/3BP；占一次行动及8MP，不能对自己使用；收到本技BP者本回合不能再转赠 |
| am_s3 | 明约合锋 | 甲 | 14 | 每敌1.05／1 | 0 | 全体敌人各一击，独立接应标记15/20/25/30% |
| pj_s1 | 横江拦步 | 丁 | 2 | 1／1 | 0 | 单体一击；展示擒拿路数，低费 |
| pj_s2 | 回杆卸势 | 丙 | 4 | 1.02／1 | 0 | 单体一击并降低目标下一击伤害；首领幅度折半 |
| pj_s3 | 断渡擒锋 | 乙 | 8 | 1.25／2 | 2 | 单体两段；命中弱点且敌人可延后时，将其尚未执行的本回合行动移到末尾；首领仅标明可延后的意图有效，不能连续回合延后同一目标 |
| pj_s4 | 风雨护归 | 甲 | 14 | 0／0 | 2 | 解除全队一项可驱散迟滞并各获一次卸力；适合蓄力前稳住行动节奏，不解除剧情封锁 |
| yh_s0 | 随行照护 | 丁 | 4 | 0／0 | 0 | 低量单体恢复；独立于序章驱离照应动作，先经正式战斗救护教学 |
| yh_n1 | 循隙针 | 丙 | 4 | 1.02／2 | 0 | 单体两段；选择已看破目标时降低本次内力消耗 |
| yh_n2 | 截脉三针 | 乙 | 8 | 1.22／3 | 0 | 单体三段并削弱下一击；首领减益折半 |
| yh_n3 | 归息断潮 | 甲 | 14 | 1.55／3 | 0 | 单体一击加两束收针；已削弱目标则末段增强一次 |
| yh_m1 | 温络行针 | 丙 | 6 | 0／0 | 0 | 单体两回合小持续治疗，满血不转护盾 |
| yh_m2 | 和脉同息 | 乙 | 10 | 0／0 | 0 | 单体输出增益两回合；不可与同类最高增伤叠加 |
| yh_m3 | 归息续照 | 甲 | 16 | 0／0 | 2 | 刷新一名同伴的一项本角色持续增益一次，不能无限延长 |
| yl_s1 | 飞燕点枝 | 丙 | 4 | 1.04／2 | 0 | 晏小楼单体两次投掷；低单段伤害适合试探 |
| yl_s2 | 满场惊鸿 | 甲 | 14 | 1.02／1 | 0 | 晏小楼敌全体各一击后自身卸力；不产生分身单位 |
| qx_s1 | 撑篙截流 | 丙 | 5 | 0／0 | 0 | 乔行舟援护指定同伴一次；地图站位不变化 |
| qx_s2 | 回舟接客 | 甲 | 14 | 0／0 | 2 | 指定濒危或受迟滞同伴：解除一项迟滞并为其援护一次；对非濒危也可救援，但不提供全队防护 |
| lh_s1 | 伞下容身 | 丙 | 5 | 0／0 | 0 | 柳含烟给同伴一次卸力，自身不能同时援护 |
| lh_s2 | 雨住留灯 | 甲 | 14 | 0／0 | 2 | 柳含烟给全队各一次物理卸力，持续至本轮末；本轮已经完成行动的队友同样生效，不再附带解除迟滞 |
| qf_s1 | 扇骨截招 | 丙 | 5 | 0／0 | 0 | 秦绯鸢自身一次卸力；次次招架不叠加反击 |
| qf_s2 | 回袖引步 | 乙 | 8 | 0／0 | 2 | 选择本回合尚未行动的另一同伴，将其未执行行动移到秦绯鸢之后；不复制回合、不允许连用改变已锁定顺序；无合法目标时不能施放 |
| qf_s3 | 邀锋护席 | 甲 | 14 | 0／0 | 2 | 秦绯鸢援护一次单体攻击并减伤；群攻不改目标 |
| rq_s1 | 雀喙探隙 | 丙 | 4 | 1／1 | 0 | 阮青雀单体一击，削弱敌方下一击 |
| rq_s2 | 袖手卸势 | 乙 | 8 | 0／0 | 0 | 阮青雀自身卸力一次并提高下次攻击看破效率 |
| rq_s3 | 雀步换位 | 乙 | 8 | 0／0 | 2 | 阮青雀下一回合后移至我方末位，并给一名同伴一次卸力；用于预留断后时机，不把低速一律当作惩罚 |
| rq_s4 | 留缝接应 | 甲 | 14 | 0.96／1 | 0 | 单体低威力短刀攻击；下一名友方在本回合命中该目标已知弱点时额外削盾1点，标记用后消失；不赋予弱点、不产生道具收益 |
| lhg_s1 | 横刀护途 | 丙 | 5 | 0／0 | 0 | 陆衡援护一名同伴一次；职业护送低费可靠 |
| hzc_s1 | 寻隙敲山 | 乙 | 8 | 1.42／1 | 0 | 霍逐尘单体重击，对已看破目标额外削盾一次 |

## 名称含义与逐招特殊效果

### 试锋探路 · `gy_s1`

试锋探路以“一条上挑竹青剑气，钝起尖收，底部一小段回锋”表现低耗试探，名称服务于本招动作与作用。

所属外功：`system_gy_foundation_s`。取得：首月B03后K01正式教学，5体力。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 3,
  "action_cost": 1,
  "total_power": 1.05,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 3,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.05,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.4175,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.785,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.205,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": "gy_s1",
  "runtime_note": "正式初阶功法，独立于门派上乘传承；现有单体一击与BP保留，三重上限。"
}
```

### 拨云回锋 · `gy_s2`

拨云回锋以“两条相向折返的短剑气，交点留白”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_gy_s2`。取得：剑式入门后周砚收势课。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 1.08,
  "base_hits": 2,
  "hit_weights": [
    0.5,
    0.5
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.08,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.08,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.08,
      "hits": 4,
      "shield_cap": 4,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 1.08,
      "hits": 5,
      "shield_cap": 5,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 一线开晴 · `gy_s3`

一线开晴以“厚云间一道尖锐直隙，窄金白剑脊贯穿”表现破势输出，名称服务于本招动作与作用。

所属外功：`art_gy_s3`。取得：年二主修剑与护送复盘。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 1.38,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "conditional_damage",
      "value": 0.2,
      "condition": "previous_self_guard"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.38,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.2,
          "condition": "previous_self_guard"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.863,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.2,
          "condition": "previous_self_guard"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.346,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.2,
          "condition": "previous_self_guard"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.898,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.2,
          "condition": "previous_self_guard"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 千岚归一 · `gy_s4`

千重山岚收于一锋，前三式的观察在末击汇聚，归云的收势转攻由此成形。

所属外功：`system_gy_s`。取得：下山后回谷切磋与责任事件。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 1.62,
  "base_hits": 3,
  "hit_weights": [
    0.333333,
    0.333333,
    0.333333
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "last_hit_bonus",
      "value": 0.2,
      "condition": "target_broken_before_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.62,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "target_broken_before_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 2.187,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "target_broken_before_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.754,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "target_broken_before_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 3.402,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "target_broken_before_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 云开见山 · `gy_s5`

云散而山自显，比喻先辨虚实再见根本；消耗守势换取决断，不能靠连续绝技代替观察。

所属外功：`art_gy_s_jue`。取得：剑路长线实务与导师复盘后个人领悟。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 24,
  "action_cost": 1,
  "total_power": 4.6,
  "base_hits": 4,
  "hit_weights": [
    0.25,
    0.25,
    0.25,
    0.25
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "last_hit_bonus",
      "value": 0.15,
      "condition": "consume_one_guard_token"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 4.6,
      "hits": 4,
      "shield_cap": 4,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.15,
          "condition": "consume_one_guard_token"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 1,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 守拙立桩 · `gy_p1`

守拙立桩以“紧凑米白冲击楔形，边缘一圈短促竹青回劲”表现低耗试探，名称服务于本招动作与作用。

所属外功：`system_gy_foundation_p`。取得：首月B03后K02正式教学，5体力。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 0,
  "action_cost": 1,
  "total_power": 1,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 3,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.35,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.7,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.1,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": "gy_p1",
  "runtime_note": "正式初阶功法，独立于门派上乘传承；现有单体一击与BP保留，三重上限。"
}
```

### 回岚步 · `gy_p2`

回岚步以“两段前后错开的风足迹意象，没有实体鞋子”表现守护支援，名称服务于本招动作与作用。

所属外功：`art_gy_p2`。取得：基础步法熟悉后明确传授。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 0,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.4,
      "condition": "next_received_hit"
    },
    {
      "type": "next_attack_bonus",
      "value": 0.2,
      "condition": "next_self_attack_once"
    },
    {
      "type": "counter_power",
      "value": 0.8,
      "condition": "first_single_hit_received_before_next_self_action"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.4,
          "condition": "next_received_hit"
        },
        {
          "type": "next_attack_bonus",
          "value": 0.2,
          "condition": "next_self_attack_once"
        },
        {
          "type": "counter_power",
          "value": 0.8,
          "condition": "first_single_hit_received_before_next_self_action"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.45,
          "condition": "next_received_hit"
        },
        {
          "type": "next_attack_bonus",
          "value": 0.2,
          "condition": "next_self_attack_once"
        },
        {
          "type": "counter_power",
          "value": 0.8,
          "condition": "first_single_hit_received_before_next_self_action"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.5,
          "condition": "next_received_hit"
        },
        {
          "type": "next_attack_bonus",
          "value": 0.2,
          "condition": "next_self_attack_once"
        },
        {
          "type": "counter_power",
          "value": 0.8,
          "condition": "first_single_hit_received_before_next_self_action"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.55,
          "condition": "next_received_hit"
        },
        {
          "type": "next_attack_bonus",
          "value": 0.2,
          "condition": "next_self_attack_once"
        },
        {
          "type": "counter_power",
          "value": 0.8,
          "condition": "first_single_hit_received_before_next_self_action"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。",
  "usage_note": "防御强化：选防御时自动附带，不另耗内力"
}
```

### 叠岚掌 · `gy_p3`

叠岚掌以“前小后大的两层方圆气掌，均为气劲而无实体手”表现破势输出，名称服务于本招动作与作用。

所属外功：`art_gy_p3`。取得：年二拳掌主修与护人实务。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 1.26,
  "base_hits": 2,
  "hit_weights": [
    0.5,
    0.5
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "last_hit_bonus",
      "value": 0.2,
      "condition": "actual_intercept_damage_this_round"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.26,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "actual_intercept_damage_this_round"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.701,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "actual_intercept_damage_this_round"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.142,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "actual_intercept_damage_this_round"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.646,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "actual_intercept_damage_this_round"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 抱山还岳 · `gy_p4`

抱山是承重，还岳是还力；先替同伴担住来势，再将所受之力还出。

所属外功：`system_gy_p`。取得：下山后的解围与师叔传授。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "intercept",
      "value": 1,
      "condition": "next_single_ally_hit"
    },
    {
      "type": "counter_power",
      "value": 0.6,
      "condition": "after_actual_intercept"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.25
        },
        {
          "type": "counter_power",
          "value": 0.6,
          "condition": "after_actual_intercept"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.3
        },
        {
          "type": "counter_power",
          "value": 0.6,
          "condition": "after_actual_intercept"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.35
        },
        {
          "type": "counter_power",
          "value": 0.6,
          "condition": "after_actual_intercept"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.4
        },
        {
          "type": "counter_power",
          "value": 0.6,
          "condition": "after_actual_intercept"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 万壑回响 · `gy_p5`

一声入壑，群山相应；震与合分成两段，让拳掌路以控制群敌见长。

所属外功：`art_gy_p_jue`。取得：拳路长线责任事件与领悟。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 24,
  "action_cost": 1,
  "total_power": 2.9,
  "base_hits": 2,
  "hit_weights": [
    0.5,
    0.5
  ],
  "accuracy": 0.95,
  "target": "all_foes",
  "target_count": "all_alive",
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.9,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 1,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 金针刺穴 · `bh_s1`

金针刺穴以“三束短针气指向一个清楚的穴点，不画针囊”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_bh_s1`。取得：苏芷初见任务体验（初见剧情待重新设计）；主角需另经授权学习。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 1.05,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "reveal",
      "value": 1,
      "condition": "on_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.05,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "reveal",
          "value": 1,
          "condition": "on_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.4175,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "reveal",
          "value": 1,
          "condition": "on_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.785,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "reveal",
          "value": 1,
          "condition": "on_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.205,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "reveal",
          "value": 1,
          "condition": "on_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 回春散 · `bh_s2`

回春散以“断开的温白生机流被药青短流接续”表现医疗维持，名称服务于本招动作与作用。

所属外功：`art_bh_s2`。取得：苏芷随身医术，不因见面授给全队。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 6,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "heal_coefficient",
      "value": 1.15,
      "condition": "immediate"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 1.15,
          "condition": "immediate"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.25,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 1.15,
          "condition": "immediate"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.5,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 1.15,
          "condition": "immediate"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.8,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 1.15,
          "condition": "immediate"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 净脉针 · `bh_s3`

净脉针以“一束笔直白针气穿过灰绿纠结，出口恢复清绿”表现医疗维持，名称服务于本招动作与作用。

所属外功：`art_bh_s3`。取得：苏芷巡诊复盘，外学者先修医理与监督实习。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 10,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "heal_coefficient",
      "value": 0.85,
      "condition": "immediate"
    },
    {
      "type": "cleanse",
      "value": 1,
      "condition": "dispellable_only"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.85,
          "condition": "immediate"
        },
        {
          "type": "cleanse",
          "value": 1,
          "condition": "dispellable_only"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.25,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.85,
          "condition": "immediate"
        },
        {
          "type": "cleanse",
          "value": 1,
          "condition": "dispellable_only"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.5,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.85,
          "condition": "immediate"
        },
        {
          "type": "cleanse",
          "value": 1,
          "condition": "dispellable_only"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.8,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.85,
          "condition": "immediate"
        },
        {
          "type": "cleanse",
          "value": 1,
          "condition": "dispellable_only"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 百草回生 · `bh_s4`

百草各有所长，回生取汇集药性接续生机之意；救活着的人，不能起死回生。

所属外功：`art_bh_jia`。取得：未写完的医案完成且巡诊方案可持续。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 16,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "all_allies",
  "target_count": "all_alive",
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "heal_coefficient",
      "value": 0.7,
      "condition": "all_alive_allies"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.7,
          "condition": "all_alive_allies"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.25,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.7,
          "condition": "all_alive_allies"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.5,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.7,
          "condition": "all_alive_allies"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.8,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.7,
          "condition": "all_alive_allies"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 一息相续 · `bh_s5`

一息尚存便有转机；相续是保住最后一息等待后援，施者不夺生死之权。

所属外功：`art_bh_jue`。取得：长期急救案例与教习共同验证。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 24,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 2,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "death_prevention",
      "value": 1,
      "condition": "one_recipient_once_per_battle"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 2,
      "effects": []
    },
    {
      "spent": 1,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 2,
      "effects": []
    },
    {
      "spent": 2,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 2,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 2,
      "effects": [
        {
          "type": "death_prevention",
          "value": 1,
          "condition": "one_recipient_once_per_battle"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 1,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 照水起锋 · `zc_s1`

照水起锋以“短直剑光下接一条水平反光，轮廓如锐角”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_zc_s1`。取得：唐照雪初见试艺；主角经外派交流另学。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 2,
  "action_cost": 1,
  "total_power": 1.02,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.02,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.377,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.734,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.142,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 折光三叠 · `zc_s2`

折光三叠以“三条长度递增的折线剑锋，银蓝分层”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_zc_s2`。取得：正式基础考校或公开基础课。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 1.03,
  "base_hits": 3,
  "hit_weights": [
    0.333333,
    0.333333,
    0.333333
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.03,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.03,
      "hits": 4,
      "shield_cap": 4,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.03,
      "hits": 5,
      "shield_cap": 5,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 1.03,
      "hits": 6,
      "shield_cap": 6,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 问隙挑灯 · `zc_s3`

问隙挑灯以“一道细锋挑开厚重菱形锋隙，核心暖白”表现破势输出，名称服务于本招动作与作用。

所属外功：`art_zc_s3`。取得：唐照雪因材施教事件，先辨路再施招。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 1.42,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "conditional_damage",
      "value": 0.2,
      "condition": "target_has_revealed_weakness"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.42,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.2,
          "condition": "target_has_revealed_weakness"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.917,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.2,
          "condition": "target_has_revealed_weakness"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.414,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.2,
          "condition": "target_has_revealed_weakness"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.982,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.2,
          "condition": "target_has_revealed_weakness"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 照川落日 · `zc_s4`

落日收光如一锋敛锐，落击先破架，余照留给下一回合。

所属外功：`art_zc_jia`。取得：人物篇完成后自创定式。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 1.72,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "next_attack_bonus",
      "value": 0.15,
      "condition": "only_if_this_skill_breaks_shield"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.72,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_attack_bonus",
          "value": 0.15,
          "condition": "only_if_this_skill_breaks_shield"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 2.322,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_attack_bonus",
          "value": 0.15,
          "condition": "only_if_this_skill_breaks_shield"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.924,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_attack_bonus",
          "value": 0.15,
          "condition": "only_if_this_skill_breaks_shield"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 3.612,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_attack_bonus",
          "value": 0.15,
          "condition": "only_if_this_skill_breaks_shield"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 一剑澄江 · `zc_s5`

澄江取水清而虚实可见之意；先识破路数再以一剑收束，见识比盲目强攻更重要。

所属外功：`art_zc_jue`。取得：师门传承争议解决后自证剑路。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 24,
  "action_cost": 1,
  "total_power": 4.3,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "last_hit_bonus_per_revealed_type",
      "value": 0.04,
      "condition": "maximum_5_types"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 4.3,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus_per_revealed_type",
          "value": 0.04,
          "condition": "maximum_5_types"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 1,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 落桩拳 · `hc_s1`

落桩拳以“下压方形气劲，底部两道承重裂线”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_hc_s1`。取得：公开基础拳课或段明棠体验。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 2,
  "action_cost": 1,
  "total_power": 1.08,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.08,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.458,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.836,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.268,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 横肩护人 · `hc_s2`

横肩护人以“粗壮横向气梁托住一枚内侧小亮点”表现守护支援，名称服务于本招动作与作用。

所属外功：`art_hc_s2`。取得：石长庚护运体验，另教给认可的同伴。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 5,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "intercept",
      "value": 1,
      "condition": "next_single_ally_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.25
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.3
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.35
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.4
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 崩石短打 · `hc_s3`

崩石短打以“短粗赭红楔形撞碎一层灰石面”表现破势输出，名称服务于本招动作与作用。

所属外功：`art_hc_s3`。取得：段明棠解决工钱纠纷后的训练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 1.35,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "extra_shield_damage",
      "value": 1,
      "condition": "on_matching_weakness_once"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.35,
      "hits": 1,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "extra_shield_damage",
          "value": 1,
          "condition": "on_matching_weakness_once"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.8225,
      "hits": 1,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "extra_shield_damage",
          "value": 1,
          "condition": "on_matching_weakness_once"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.295,
      "hits": 1,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "extra_shield_damage",
          "value": 1,
          "condition": "on_matching_weakness_once"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.835,
      "hits": 1,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "extra_shield_damage",
          "value": 1,
          "condition": "on_matching_weakness_once"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 合川撑岳 · `hc_s4`

众人合川以撑山岳；共同卸力有赖施者稳架，故以自身速度换取全队承伤余地。

所属外功：`art_hc_jia`。取得：护运体系整改后的守队训练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "all_allies",
  "target_count": "all_alive",
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.25,
      "condition": "one_hit_each_ally"
    },
    {
      "type": "self_speed_multiplier",
      "value": 0.85,
      "condition": "until_next_self_action"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "one_hit_each_ally"
        },
        {
          "type": "self_speed_multiplier",
          "value": 0.85,
          "condition": "until_next_self_action"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.3,
          "condition": "one_hit_each_ally"
        },
        {
          "type": "self_speed_multiplier",
          "value": 0.85,
          "condition": "until_next_self_action"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.35,
          "condition": "one_hit_each_ally"
        },
        {
          "type": "self_speed_multiplier",
          "value": 0.85,
          "condition": "until_next_self_action"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.4,
          "condition": "one_hit_each_ally"
        },
        {
          "type": "self_speed_multiplier",
          "value": 0.85,
          "condition": "until_next_self_action"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 百步震关 · `hc_s5`

百步之外亦震关隘，以短促合力制止敌人蓄势；震关不等于凭空越过头目规则。

所属外功：`art_hc_jue`。取得：拳门公共护运长线终章。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 24,
  "action_cost": 1,
  "total_power": 3.0,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "all_foes",
  "target_count": "all_alive",
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "extra_shield_damage",
      "value": 1,
      "condition": "on_matching_weakness_and_charging_once"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 3.0,
      "hits": 1,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "extra_shield_damage",
          "value": 1,
          "condition": "on_matching_weakness_and_charging_once"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 1,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 松间错步 · `sf_s1`

松间错步以“两股松绿流风在中央错开而不相交”表现守护支援，名称服务于本招动作与作用。

所属外功：`art_sf_s1`。取得：闻疏桐山路同行；对外基础课。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 0,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.4,
      "condition": "next_received_hit"
    },
    {
      "type": "next_attack_bonus",
      "value": 0.15,
      "condition": "next_self_attack_once"
    },
    {
      "type": "counter_power",
      "value": 0.6,
      "condition": "first_single_hit_received_before_next_self_action"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.4,
          "condition": "next_received_hit"
        },
        {
          "type": "next_attack_bonus",
          "value": 0.15,
          "condition": "next_self_attack_once"
        },
        {
          "type": "counter_power",
          "value": 0.6,
          "condition": "first_single_hit_received_before_next_self_action"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.45,
          "condition": "next_received_hit"
        },
        {
          "type": "next_attack_bonus",
          "value": 0.15,
          "condition": "next_self_attack_once"
        },
        {
          "type": "counter_power",
          "value": 0.6,
          "condition": "first_single_hit_received_before_next_self_action"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.5,
          "condition": "next_received_hit"
        },
        {
          "type": "next_attack_bonus",
          "value": 0.15,
          "condition": "next_self_attack_once"
        },
        {
          "type": "counter_power",
          "value": 0.6,
          "condition": "first_single_hit_received_before_next_self_action"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.55,
          "condition": "next_received_hit"
        },
        {
          "type": "next_attack_bonus",
          "value": 0.15,
          "condition": "next_self_attack_once"
        },
        {
          "type": "counter_power",
          "value": 0.6,
          "condition": "first_single_hit_received_before_next_self_action"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。",
  "usage_note": "防御强化：选防御时自动附带，不另耗内力"
}
```

### 引枝卸锋 · `sf_s2`

引枝卸锋以“细长弯枝般气线将一束银锋拨到侧面”表现守护支援，名称服务于本招动作与作用。

所属外功：`art_sf_s2`。取得：俗家协作练习。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 5,
  "action_cost": 1,
  "total_power": 0.6,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.3,
      "condition": "selected_ally_next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0.6,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.3,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0.6,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.35,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0.6,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.4,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0.6,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.45,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 三径相援 · `sf_s3`

三径相援以“三条小径状气线围成开口三角，一条引路细锋指向前方”表现预排行动，名称服务于本招动作与作用。

所属外功：`art_sf_s3`。取得：路图保护乡邻事件与两人合练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 2,
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.25,
      "condition": "one_hit_each_selected_ally"
    },
    {
      "type": "order_shift",
      "value": -1,
      "condition": "one_selected_ally_next_round"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "one_hit_each_selected_ally"
        },
        {
          "type": "order_shift",
          "value": -1,
          "condition": "one_selected_ally_next_round"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.3,
          "condition": "one_hit_each_selected_ally"
        },
        {
          "type": "order_shift",
          "value": -1,
          "condition": "one_selected_ally_next_round"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.35,
          "condition": "one_hit_each_selected_ally"
        },
        {
          "type": "order_shift",
          "value": -1,
          "condition": "one_selected_ally_next_round"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.4,
          "condition": "one_hit_each_selected_ally"
        },
        {
          "type": "order_shift",
          "value": -1,
          "condition": "one_selected_ally_next_round"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 松涛合阵 · `sf_s4`

松涛由众枝同响，合阵须有人先守；协作成立之后才增进阵中攻势。

所属外功：`art_sf_jia`。取得：闻疏桐个人篇及多人演练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 1.05,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "all_foes",
  "target_count": "all_alive",
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "conditional_damage",
      "value": 0.15,
      "condition": "ally_used_guard_this_round"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.05,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.15,
          "condition": "ally_used_guard_this_round"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.4175,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.15,
          "condition": "ally_used_guard_this_round"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.785,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.15,
          "condition": "ally_used_guard_this_round"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.205,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "conditional_damage",
          "value": 0.15,
          "condition": "ally_used_guard_this_round"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 万籁归松 · `sf_s5`

万籁归于松间，纷乱动作归于同一节拍；稳住队伍，让同伴接上行动。

所属外功：`art_sf_jue`。取得：观中入世争议收束与护乡实务。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 24,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "all_allies",
  "target_count": "all_alive",
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.4,
      "condition": "one_hit_each_ally"
    },
    {
      "type": "slow_immunity",
      "value": 1,
      "condition": "one_dispellable_slow"
    },
    {
      "type": "order_shift",
      "value": -1,
      "condition": "first_ally_next_round"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.4,
          "condition": "one_hit_each_ally"
        },
        {
          "type": "slow_immunity",
          "value": 1,
          "condition": "one_dispellable_slow"
        },
        {
          "type": "order_shift",
          "value": -1,
          "condition": "first_ally_next_round"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 1,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 藏锋短刺 · `gj_s1`

藏锋短刺以“短而偏置的暗红尖锋从墨紫折角穿出”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_gj_s1`。取得：货路任务体验或基础教习。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 2,
  "action_cost": 1,
  "total_power": 1.08,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.08,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.458,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.836,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.268,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 燃隙刀 · `gj_s2`

燃隙刀以“一条铜红厚斩弧尾部有两处断裂余烬”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_gj_s2`。取得：戚铮基础刀路与明确传授。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 1.32,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "self_exposure",
      "value": 0.1,
      "condition": "next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.32,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "self_exposure",
          "value": 0.1,
          "condition": "next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.782,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "self_exposure",
          "value": 0.1,
          "condition": "next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.244,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "self_exposure",
          "value": 0.1,
          "condition": "next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.772,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "self_exposure",
          "value": 0.1,
          "condition": "next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 断烬回身 · `gj_s3`

断烬回身以“两道背向折刃，中间一条明确撤出的空隙”表现破势输出，名称服务于本招动作与作用。

所属外功：`art_gj_s3`。取得：岑霜赔偿落实后复盘险情。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 1.2,
  "base_hits": 2,
  "hit_weights": [
    0.5,
    0.5
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.25,
      "condition": "self_next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.2,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.62,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.04,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.52,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 焚契破阵 · `gj_s4`

焚契是斩去旧约，破阵是付出暴露换取突围；断旧路必须承担风险。

所属外功：`art_gj_jia`。取得：堂务问责篇后戚铮选择承担断后。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 1.14,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "all_foes",
  "target_count": "all_alive",
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "self_exposure",
      "value": 0.1,
      "condition": "next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.14,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "self_exposure",
          "value": 0.1,
          "condition": "next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.539,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "self_exposure",
          "value": 0.1,
          "condition": "next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.938,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "self_exposure",
          "value": 0.1,
          "condition": "next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.394,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "self_exposure",
          "value": 0.1,
          "condition": "next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 余烬留生 · `gj_s5`

余烬留生指猛火之后还留生路；攻势未尽时先替同伴安排退路，拒绝只求同归于尽。

所属外功：`art_gj_jue`。取得：岑霜兑现退路的个人长线。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 24,
  "action_cost": 1,
  "total_power": 3.9,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "intercept",
      "value": 1,
      "condition": "selected_ally_next_single_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": false,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 3.9,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "selected_ally_next_single_hit",
          "damage_reduction": 0.25
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 1,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 短锋相照 · `am_s1`

短锋相照以“一短直锋与一弯护弧互为犄角”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_am_s1`。取得：徐令仪个人师友传授，公议护送体验。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 0.95,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.1,
      "condition": "selected_ally_next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0.95,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.1,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.2825,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.1,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.615,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.1,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 1.995,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.1,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 同担一线 · `am_s2`

同担一线以“一条绛青劲流将一枚明亮金色力点送往另一道锋线”表现BP供给，名称服务于本招动作与作用。

所属外功：`art_am_jia`。取得：赈济裁断失误后护送合练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "bp_transfer",
      "value": 2,
      "condition": "another_ally_cannot_retransfer_same_round"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "bp_transfer",
          "value": 2,
          "condition": "another_ally_cannot_retransfer_same_round"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "bp_transfer",
          "value": 2,
          "condition": "another_ally_cannot_retransfer_same_round"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "bp_transfer",
          "value": 3,
          "condition": "another_ally_cannot_retransfer_same_round"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "bp_transfer",
          "value": 3,
          "condition": "another_ally_cannot_retransfer_same_round"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 明约合锋 · `am_s3`

明约是共同承诺，合锋是接续而非抢攻；自己的出手为下一名同伴留出位置。

所属外功：`art_am_jia`。取得：徐令仪个人篇结束与同伴练习。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 1.05,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "all_foes",
  "target_count": "all_alive",
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "next_ally_same_target_damage",
      "value": 0.15,
      "condition": "once_until_next_round_end"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.05,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_ally_same_target_damage",
          "value": 0.15,
          "condition": "once_until_next_round_end"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.05,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_ally_same_target_damage",
          "value": 0.2,
          "condition": "once_until_next_round_end"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.05,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_ally_same_target_damage",
          "value": 0.25,
          "condition": "once_until_next_round_end"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 1.05,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_ally_same_target_damage",
          "value": 0.3,
          "condition": "once_until_next_round_end"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "2026-10-14群攻修订；当前栖河NPC旁观交锋装配，主角未自动学习。",
  "mastery_bonus": {
    "mp": -1
  }
}
```

### 横江拦步 · `pj_s1`

横江拦步以“水平深蓝气栏和一条向内钩回的短劲”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_pj_s1`。取得：沈雁回获准参加的基础自保训练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 2,
  "action_cost": 1,
  "total_power": 1,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.35,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.7,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.1,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 回杆卸势 · `pj_s2`

回杆卸势以“回钩弧裹住一枚斜向铁灰冲击楔”表现低耗试探，名称服务于本招动作与作用。

所属外功：`art_pj_s2`。取得：护送实务与教习纠正。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 1.02,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "next_enemy_attack_reduction",
      "value": 0.15,
      "condition": "boss_half"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.02,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.377,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.734,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.142,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 断渡擒锋 · `pj_s3`

断渡擒锋以“两道交叉气栏拦住前进锋线，末端向后钩回”表现延后敌手，名称服务于本招动作与作用。

所属外功：`art_pj_s3`。取得：证物护送成功后训练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 1.25,
  "base_hits": 2,
  "hit_weights": [
    0.5,
    0.5
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "delay_remaining_action",
      "value": 1,
      "condition": "matching_weakness_and_delayable_intent_no_consecutive_rounds"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.25,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "delay_remaining_action",
          "value": 1,
          "condition": "matching_weakness_and_delayable_intent_no_consecutive_rounds"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.25,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "delay_remaining_action",
          "value": 1,
          "condition": "matching_weakness_and_delayable_intent_no_consecutive_rounds"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.25,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "delay_remaining_action",
          "value": 1,
          "condition": "matching_weakness_and_delayable_intent_no_consecutive_rounds"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 1.25,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "delay_remaining_action",
          "value": 1,
          "condition": "matching_weakness_and_delayable_intent_no_consecutive_rounds"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 风雨护归 · `pj_s4`

风雨里护送归人，先解迟滞再守住同行者；巡江职责落在实际护送上。

所属外功：`art_pj_jia`。取得：沈雁回个人篇与差务交接后。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "all_allies",
  "target_count": "all_alive",
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "cleanse_slow",
      "value": 1,
      "condition": "each_alive_ally_dispellable_only"
    },
    {
      "type": "unload",
      "value": 0.25,
      "condition": "one_hit_each_ally"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "cleanse_slow",
          "value": 1,
          "condition": "each_alive_ally_dispellable_only"
        },
        {
          "type": "unload",
          "value": 0.25,
          "condition": "one_hit_each_ally"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "cleanse_slow",
          "value": 1,
          "condition": "each_alive_ally_dispellable_only"
        },
        {
          "type": "unload",
          "value": 0.3,
          "condition": "one_hit_each_ally"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "cleanse_slow",
          "value": 1,
          "condition": "each_alive_ally_dispellable_only"
        },
        {
          "type": "unload",
          "value": 0.35,
          "condition": "one_hit_each_ally"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "cleanse_slow",
          "value": 1,
          "condition": "each_alive_ally_dispellable_only"
        },
        {
          "type": "unload",
          "value": 0.4,
          "condition": "one_hit_each_ally"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 随行照护 · `yh_s0`

随行照护以“一缕温白回流托住断开的小叶脉”表现医疗维持，名称服务于本招动作与作用。

所属外功：`system_yh_care`。取得：初期家传实践后教学，序章OC.3不提前授予。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "heal_coefficient",
      "value": 0.7,
      "condition": "immediate"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.7,
          "condition": "immediate"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.25,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.7,
          "condition": "immediate"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.5,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.7,
          "condition": "immediate"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1.8,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "heal_coefficient",
          "value": 0.7,
          "condition": "immediate"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 循隙针 · `yh_n1`

循隙针以“两束细金针路沿一道裂隙并行深入”表现低耗试探，名称服务于本招动作与作用。

所属外功：`system_yh_needle`。取得：第13月起针攻路线入门课。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 1.02,
  "base_hits": 2,
  "hit_weights": [
    0.5,
    0.5
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "mp_discount",
      "value": 1,
      "condition": "target_has_revealed_weakness"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.02,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "mp_discount",
          "value": 1,
          "condition": "target_has_revealed_weakness"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.02,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "mp_discount",
          "value": 1,
          "condition": "target_has_revealed_weakness"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.02,
      "hits": 4,
      "shield_cap": 4,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "mp_discount",
          "value": 1,
          "condition": "target_has_revealed_weakness"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 1.02,
      "hits": 5,
      "shield_cap": 5,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "mp_discount",
          "value": 1,
          "condition": "target_has_revealed_weakness"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 截脉三针 · `yh_n2`

截脉三针以“三束不同角度针气准确钉住三枚赭红穴点”表现破势输出，名称服务于本招动作与作用。

所属外功：`system_yh_needle`。取得：针攻实务后逐点校准。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 1.22,
  "base_hits": 3,
  "hit_weights": [
    0.333333,
    0.333333,
    0.333333
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "next_enemy_attack_reduction",
      "value": 0.15,
      "condition": "boss_half"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.22,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.647,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.074,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.562,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 归息断潮 · `yh_n3`

归息是将散乱针势收回，断潮是截住已显露的敌方来势；循脉观察决定末针。

所属外功：`system_yh_needle`。取得：身世篇后针攻实践与家传整理。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 1.55,
  "base_hits": 3,
  "hit_weights": [
    0.333333,
    0.333333,
    0.333333
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "last_hit_bonus",
      "value": 0.2,
      "condition": "target_has_attack_reduction"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.55,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "target_has_attack_reduction"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 2.0925,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "target_has_attack_reduction"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.635,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "target_has_attack_reduction"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 3.255,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "last_hit_bonus",
          "value": 0.2,
          "condition": "target_has_attack_reduction"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 温络行针 · `yh_m1`

温络行针以“温青叶脉沿两处白色节点连续流转”表现医疗维持，名称服务于本招动作与作用。

所属外功：`system_yh_med`。取得：第13月起白鹇谷监督实习。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 6,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 2,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "regen_coefficient_per_tick",
      "value": 0.5,
      "condition": "end_of_recipient_action"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 2,
      "effects": [
        {
          "type": "regen_coefficient_per_tick",
          "value": 0.5,
          "condition": "end_of_recipient_action"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 3,
      "effects": [
        {
          "type": "regen_coefficient_per_tick",
          "value": 0.5,
          "condition": "end_of_recipient_action"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 4,
      "effects": [
        {
          "type": "regen_coefficient_per_tick",
          "value": 0.5,
          "condition": "end_of_recipient_action"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 5,
      "effects": [
        {
          "type": "regen_coefficient_per_tick",
          "value": 0.5,
          "condition": "end_of_recipient_action"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 和脉同息 · `yh_m2`

和脉同息以“两股等距柔流并行，三处温金交点节律清楚”表现医疗维持，名称服务于本招动作与作用。

所属外功：`system_yh_med`。取得：医线复诊追踪与教习认可。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 10,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 2,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "damage_bonus",
      "value": 0.15,
      "condition": "highest_same_type_only"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 2,
      "effects": [
        {
          "type": "damage_bonus",
          "value": 0.15,
          "condition": "highest_same_type_only"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 3,
      "effects": [
        {
          "type": "damage_bonus",
          "value": 0.15,
          "condition": "highest_same_type_only"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 4,
      "effects": [
        {
          "type": "damage_bonus",
          "value": 0.15,
          "condition": "highest_same_type_only"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 5,
      "effects": [
        {
          "type": "damage_bonus",
          "value": 0.15,
          "condition": "highest_same_type_only"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 归息续照 · `yh_m3`

续照不是永燃之灯，是为已有疗护再续片刻；不能无尽延长同一增益。

所属外功：`system_yh_med`。取得：身世篇后家传与白鹇医案交叉验证。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 16,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 2,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "refresh_own_buff",
      "value": 1,
      "condition": "once_per_buff_no_self_refresh_no_reapply_resets"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 2,
      "effects": [
        {
          "type": "refresh_own_buff",
          "value": 1,
          "condition": "once_per_buff_no_self_refresh_no_reapply_resets"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 3,
      "effects": [
        {
          "type": "refresh_own_buff",
          "value": 1,
          "condition": "once_per_buff_no_self_refresh_no_reapply_resets"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 4,
      "effects": [
        {
          "type": "refresh_own_buff",
          "value": 1,
          "condition": "once_per_buff_no_self_refresh_no_reapply_resets"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 5,
      "effects": [
        {
          "type": "refresh_own_buff",
          "value": 1,
          "condition": "once_per_buff_no_self_refresh_no_reapply_resets"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 飞燕点枝 · `yl_s1`

飞燕点枝以“两片杏金燕尾状飞锋，前后错位”表现低耗试探，名称服务于本招动作与作用。

所属外功：`system_yl`。取得：戏班护送任务临时体验。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 1.04,
  "base_hits": 2,
  "hit_weights": [
    0.5,
    0.5
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.04,
      "hits": 2,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.04,
      "hits": 3,
      "shield_cap": 3,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.04,
      "hits": 4,
      "shield_cap": 4,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 1.04,
      "hits": 5,
      "shield_cap": 5,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": []
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 满场惊鸿 · `yl_s2`

惊鸿取掠水一现的轻快意象；一轮投掷后卸力退开，灵巧不等于凭空分身。

所属外功：`system_yl`。取得：署名新戏与巡演交接后练习。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 1.02,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "all_foes",
  "target_count": "all_alive",
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.25,
      "condition": "self_next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.02,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.377,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.734,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.142,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 撑篙截流 · `qx_s1`

撑篙截流以“长而结实的斜向气柱顶住半圆水势”表现守护支援，名称服务于本招动作与作用。

所属外功：`system_qx`。取得：渡口救援任务与本人指导。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 5,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "intercept",
      "value": 1,
      "condition": "next_single_ally_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.25
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.3
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.35
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.4
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 回舟接客 · `qx_s2`

回舟接客是撑船人回头接住落后的同行者；单人救援体现渡客职责。

所属外功：`system_qx`。取得：浅滩新船试航与救援训练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "cleanse_slow",
      "value": 1,
      "condition": "selected_ally"
    },
    {
      "type": "intercept",
      "value": 1,
      "condition": "next_single_ally_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "cleanse_slow",
          "value": 1,
          "condition": "selected_ally"
        },
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.25
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "cleanse_slow",
          "value": 1,
          "condition": "selected_ally"
        },
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.3
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "cleanse_slow",
          "value": 1,
          "condition": "selected_ally"
        },
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.35
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "cleanse_slow",
          "value": 1,
          "condition": "selected_ally"
        },
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.4
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 伞下容身 · `lh_s1`

伞下容身以“莲粉弧形伞势覆盖一段细白流，不画实体伞”表现守护支援，名称服务于本招动作与作用。

所属外功：`system_lh`。取得：本人自保练习（获取时点待安排）；琵琶不是音波武器。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 5,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.25,
      "condition": "another_ally_next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "another_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.3,
          "condition": "another_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.35,
          "condition": "another_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.4,
          "condition": "another_ally_next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 雨住留灯 · `lh_s2`

雨住而灯留，伞护让同伴撑过眼前这一阵；保护只挡一次物理来袭。

所属外功：`system_lh`。取得：解约同行篇后持续练習。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "all_allies",
  "target_count": "all_alive",
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "physical_unload",
      "value": 0.25,
      "condition": "one_hit_each_ally_until_round_end"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "physical_unload",
          "value": 0.25,
          "condition": "one_hit_each_ally_until_round_end"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "physical_unload",
          "value": 0.3,
          "condition": "one_hit_each_ally_until_round_end"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "physical_unload",
          "value": 0.35,
          "condition": "one_hit_each_ally_until_round_end"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "physical_unload",
          "value": 0.4,
          "condition": "one_hit_each_ally_until_round_end"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 扇骨截招 · `qf_s1`

扇骨截招以“一组硬朗红金放射骨线截住斜来锋芒”表现守护支援，名称服务于本招动作与作用。

所属外功：`system_qf`。取得：守席训练（获取时点待安排），不因初见自动可控。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 5,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.25,
      "condition": "self_next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.3,
          "condition": "self_next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.35,
          "condition": "self_next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.4,
          "condition": "self_next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 回袖引步 · `qf_s2`

回袖引步以“绯红袖势引出一束向前疾行的白线，后方留出空位”表现提前队友，名称服务于本招动作与作用。

所属外功：`system_qf`。取得：共同护送练习与本人同意。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "order_after_caster",
      "value": 1,
      "condition": "unacted_other_ally_no_locked_order"
    },
    {
      "type": "unload",
      "value": 0,
      "condition": "selected_ally_next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "order_after_caster",
          "value": 1,
          "condition": "unacted_other_ally_no_locked_order"
        },
        {
          "type": "unload",
          "value": 0,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "order_after_caster",
          "value": 1,
          "condition": "unacted_other_ally_no_locked_order"
        },
        {
          "type": "unload",
          "value": 0.1,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "order_after_caster",
          "value": 1,
          "condition": "unacted_other_ally_no_locked_order"
        },
        {
          "type": "unload",
          "value": 0.15,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "order_after_caster",
          "value": 1,
          "condition": "unacted_other_ally_no_locked_order"
        },
        {
          "type": "unload",
          "value": 0.2,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 邀锋护席 · `qf_s3`

邀锋是将对手刀锋引向自己，护席是为席间同伴让出安全处；不虚构群体无敌。

所属外功：`system_qf`。取得：舞约善后、班务交接后实练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "intercept",
      "value": 1,
      "condition": "next_single_ally_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.25
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.3
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.35
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.4
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 雀喙探隙 · `rq_s1`

雀喙探隙以“一枚短青锋侧向压住一段灰白攻势”表现低耗试探，名称服务于本招动作与作用。

所属外功：`system_rq`。取得：人物线中的合法自保训练（获取时点待安排）。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 4,
  "action_cost": 1,
  "total_power": 1,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "next_enemy_attack_reduction",
      "value": 0.15,
      "condition": "boss_half"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.35,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.7,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.1,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_enemy_attack_reduction",
          "value": 0.15,
          "condition": "boss_half"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 袖手卸势 · `rq_s2`

袖手卸势以“短青弧与折回白线勾出一个失衡缺口”表现守护支援，名称服务于本招动作与作用。

所属外功：`system_rq`。取得：本人偿还与修锁生计节点后训练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "unload",
      "value": 0.25,
      "condition": "self_next_received_hit"
    },
    {
      "type": "next_reveal_extra",
      "value": 1,
      "condition": "next_successful_matching_weakness_hit_once"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.25,
          "condition": "self_next_received_hit"
        },
        {
          "type": "next_reveal_extra",
          "value": 1,
          "condition": "next_successful_matching_weakness_hit_once"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.3,
          "condition": "self_next_received_hit"
        },
        {
          "type": "next_reveal_extra",
          "value": 1,
          "condition": "next_successful_matching_weakness_hit_once"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.35,
          "condition": "self_next_received_hit"
        },
        {
          "type": "next_reveal_extra",
          "value": 1,
          "condition": "next_successful_matching_weakness_hit_once"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "unload",
          "value": 0.4,
          "condition": "self_next_received_hit"
        },
        {
          "type": "next_reveal_extra",
          "value": 1,
          "condition": "next_successful_matching_weakness_hit_once"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 雀步换位 · `rq_s3`

雀步换位以“一前一后的雀尾风痕绕开锋角，后侧风痕托住小亮点”表现主动断后，名称服务于本招动作与作用。

所属外功：`system_rq`。取得：断后练习且已有合作经历。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 2,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "order_to_allied_tail",
      "value": 1,
      "condition": "self_next_round"
    },
    {
      "type": "unload",
      "value": 0.25,
      "condition": "selected_ally_next_received_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "order_to_allied_tail",
          "value": 1,
          "condition": "self_next_round"
        },
        {
          "type": "unload",
          "value": 0.25,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "order_to_allied_tail",
          "value": 1,
          "condition": "self_next_round"
        },
        {
          "type": "unload",
          "value": 0.3,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "order_to_allied_tail",
          "value": 1,
          "condition": "self_next_round"
        },
        {
          "type": "unload",
          "value": 0.35,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "order_to_allied_tail",
          "value": 1,
          "condition": "self_next_round"
        },
        {
          "type": "unload",
          "value": 0.4,
          "condition": "selected_ally_next_received_hit"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 留缝接应 · `rq_s4`

留缝是故意保留可接应的破绽，短刀牵出一线，由同伴完成破势。

所属外功：`system_rq`。取得：六节点与善后完成后训练。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 14,
  "action_cost": 1,
  "total_power": 0.96,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "next_ally_extra_shield_damage",
      "value": 1,
      "condition": "same_round_matching_known_weakness_once"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0.96,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_ally_extra_shield_damage",
          "value": 1,
          "condition": "same_round_matching_known_weakness_once"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.296,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_ally_extra_shield_damage",
          "value": 1,
          "condition": "same_round_matching_known_weakness_once"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 1.632,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_ally_extra_shield_damage",
          "value": 1,
          "condition": "same_round_matching_known_weakness_once"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.016,
      "hits": 1,
      "shield_cap": 1,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "next_ally_extra_shield_damage",
          "value": 1,
          "condition": "same_round_matching_known_weakness_once"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 横刀护途 · `lhg_s1`

横刀护途以“褐金横刀劲护住一道向后的白色归路”表现守护支援，名称服务于本招动作与作用。

所属外功：`system_lhg`。取得：首季送药体验，主角另学需授课。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 5,
  "action_cost": 1,
  "total_power": 0,
  "base_hits": 0,
  "hit_weights": [],
  "accuracy": 1,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "intercept",
      "value": 1,
      "condition": "next_single_ally_hit"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.25
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.3
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.35
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 0,
      "hits": 0,
      "shield_cap": 0,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "intercept",
          "value": 1,
          "condition": "next_single_ally_hit",
          "damage_reduction": 0.4
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

### 寻隙敲山 · `hzc_s1`

寻隙敲山以“短柄锤击般方块劲势撞上有一处缺口的铁灰环”表现破势输出，名称服务于本招动作与作用。

所属外功：`system_hzc`。取得：找回工具与修械交付后本人使用。

```json
{
  "version": "MOVE-CONTRACT-3",
  "status": "authored_design_not_full_runtime",
  "mp": 8,
  "action_cost": 1,
  "total_power": 1.42,
  "base_hits": 1,
  "hit_weights": [
    1.0
  ],
  "accuracy": 0.95,
  "target": "specified",
  "target_count": 1,
  "cooldown_self_actions": 0,
  "cooldown_clock": "caster_action_start; next N opportunities blocked",
  "duration_recipient_actions": 0,
  "guard_expiry": "before_next_caster_action; lh_s2 at round end",
  "max_level": 10,
  "mastery_per_level": 0.04,
  "effects": [
    {
      "type": "extra_shield_damage",
      "value": 1,
      "condition": "matching_weakness_and_revealed_target_once"
    }
  ],
  "bp": [
    {
      "spent": 0,
      "available": true,
      "total_power": 1.42,
      "hits": 1,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "extra_shield_damage",
          "value": 1,
          "condition": "matching_weakness_and_revealed_target_once"
        }
      ]
    },
    {
      "spent": 1,
      "available": true,
      "total_power": 1.917,
      "hits": 1,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "extra_shield_damage",
          "value": 1,
          "condition": "matching_weakness_and_revealed_target_once"
        }
      ]
    },
    {
      "spent": 2,
      "available": true,
      "total_power": 2.414,
      "hits": 1,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "extra_shield_damage",
          "value": 1,
          "condition": "matching_weakness_and_revealed_target_once"
        }
      ]
    },
    {
      "spent": 3,
      "available": true,
      "total_power": 2.982,
      "hits": 1,
      "shield_cap": 2,
      "heal_multiplier": 1,
      "duration_recipient_actions": 0,
      "effects": [
        {
          "type": "extra_shield_damage",
          "value": 1,
          "condition": "matching_weakness_and_revealed_target_once"
        }
      ]
    }
  ],
  "ultimate_lock_next_self_actions": 0,
  "runtime_id": null,
  "runtime_note": "未来招式合同；未开放学习、装配或战斗效果。"
}
```

<!-- v3-skills:start -->
## v3 补充：弱点类型、属性与异常（自动生成）

| ID | 招式 | 兵器类 | 属性 | 施加异常 | 解除 | 用法 |
| --- | --- | --- | --- | --- | --- | --- |
| gy_s1 | 试锋探路 | 剑 | — | — | — | 主动 |
| gy_s2 | 拨云回锋 | 剑 | — | — | — | 主动 |
| gy_s3 | 一线开晴 | 剑 | 风 | — | — | 主动 |
| gy_s4 | 千岚归一 | 剑 | 风 | — | — | 主动 |
| gy_s5 | 云开见山 | 剑 | 阳 | — | — | 主动 |
| gy_p1 | 守拙立桩 | 拳掌 | — | — | — | 主动 |
| gy_p2 | 回岚步 | — | — | — | — | 防御强化 |
| gy_p3 | 叠岚掌 | 拳掌 | 阳 | 60% 内伤 | — | 主动 |
| gy_p4 | 抱山还岳 | 拳掌 | — | — | — | 主动 |
| gy_p5 | 万壑回响 | 拳掌 | 风 | — | — | 主动 |
| bh_s1 | 金针刺穴 | 暗器 | 寒 | 35% 封穴 | — | 主动 |
| bh_s2 | 回春散 | — | — | — | — | 主动 |
| bh_s3 | 净脉针 | — | — | — | mid | 主动 |
| bh_s4 | 百草回生 | — | — | — | — | 主动 |
| bh_s5 | 一息相续 | — | — | — | — | 主动 |
| zc_s1 | 照水起锋 | 剑 | — | — | — | 主动 |
| zc_s2 | 折光三叠 | 剑 | — | 每段25% 流血 | — | 主动 |
| zc_s3 | 问隙挑灯 | 剑 | 寒 | 40% 目眩 | — | 主动 |
| zc_s4 | 照川落日 | 剑 | 阳 | — | — | 主动 |
| zc_s5 | 一剑澄江 | 剑 | 寒 | — | — | 主动 |
| hc_s1 | 落桩拳 | 拳掌 | — | — | — | 主动 |
| hc_s2 | 横肩护人 | 拳掌 | — | — | — | 主动 |
| hc_s3 | 崩石短打 | 拳掌 | 雷 | 60% 内伤 | — | 主动 |
| hc_s4 | 合川撑岳 | 拳掌 | — | — | — | 主动 |
| hc_s5 | 百步震关 | 拳掌 | 雷 | 50% 惊惧 | — | 主动 |
| sf_s1 | 松间错步 | — | — | — | — | 防御强化 |
| sf_s2 | 引枝卸锋 | 剑 | — | 35% 目眩 | — | 主动 |
| sf_s3 | 三径相援 | 剑 | — | — | — | 主动 |
| sf_s4 | 松涛合阵 | 剑 | 风 | — | — | 主动 |
| sf_s5 | 万籁归松 | 剑 | — | — | — | 主动 |
| gj_s1 | 藏锋短刺 | 刀 | — | 50% 流血 | — | 主动 |
| gj_s2 | 燃隙刀 | 刀 | 炎 | — | — | 主动 |
| gj_s3 | 断烬回身 | 刀 | 阴 | 每段40% 流血 | — | 主动 |
| gj_s4 | 焚契破阵 | 刀 | 炎 | 30% 惊惧 | — | 主动 |
| gj_s5 | 余烬留生 | 刀 | 炎 | — | — | 主动 |
| am_s1 | 短锋相照 | 剑 | 风 | — | — | 主动 |
| am_s2 | 同担一线 | 剑 | — | — | — | 主动 |
| am_s3 | 明约合锋 | 甲 | 14 | 每敌1.05／1 | 0 | 全体敌人各一击，独立接应标记15/20/25/30% |
| pj_s1 | 横江拦步 | 长兵 | — | — | — | 主动 |
| pj_s2 | 回杆卸势 | 长兵 | — | — | — | 主动 |
| pj_s3 | 断渡擒锋 | 长兵 | 寒 | 30% 封穴 | — | 主动 |
| pj_s4 | 风雨护归 | 长兵 | — | — | low | 主动 |
| yh_s0 | 随行照护 | — | — | — | — | 主动 |
| yh_n1 | 循隙针 | 暗器 | — | — | — | 主动 |
| yh_n2 | 截脉三针 | 暗器 | 阴 | 35% 封穴 | — | 主动 |
| yh_n3 | 归息断潮 | 暗器 | 阴 | — | — | 主动 |
| yh_m1 | 温络行针 | — | — | — | — | 主动 |
| yh_m2 | 和脉同息 | — | — | — | — | 主动 |
| yh_m3 | 归息续照 | — | — | — | — | 主动 |
| yl_s1 | 飞燕点枝 | 暗器 | — | 每段30% 流血 | — | 主动 |
| yl_s2 | 满场惊鸿 | 暗器 | 风 | — | — | 主动 |
| qx_s1 | 撑篙截流 | 长兵 | — | — | — | 主动 |
| qx_s2 | 回舟接客 | 长兵 | — | — | low | 主动 |
| lh_s1 | 伞下容身 | 长兵 | — | — | — | 主动 |
| lh_s2 | 雨住留灯 | 长兵 | — | — | — | 主动 |
| qf_s1 | 扇骨截招 | 暗器 | — | — | — | 主动 |
| qf_s2 | 回袖引步 | 暗器 | — | — | — | 主动 |
| qf_s3 | 邀锋护席 | 暗器 | — | — | — | 主动 |
| rq_s1 | 雀喙探隙 | 刀 | — | 35% 目眩 | — | 主动 |
| rq_s2 | 袖手卸势 | 刀 | — | — | — | 主动 |
| rq_s3 | 雀步换位 | 刀 | — | — | — | 主动 |
| rq_s4 | 留缝接应 | 刀 | 阴 | — | — | 主动 |
| lhg_s1 | 横刀护途 | 刀 | — | — | — | 主动 |
| hzc_s1 | 寻隙敲山 | 刀 | 雷 | — | — | 主动 |
| gy_s4b | 敛云守锋 | 剑 | — | — | — | 防御强化 |
| gy_s5a | 拂岚问剑 | 剑 | 阳 | — | — | 主动 |
| gy_s5b | 群峰回照 | 剑 | 阳 | 30% 惊惧 | — | 主动 |
| gy_p4b | 推山填壑 | 拳掌 | 阳 | — | — | 主动 |
| gy_p5a | 千峰压岳 | 拳掌 | 风 | 35% 眩晕 | — | 主动 |
| gy_p5b | 群壑承声 | 拳掌 | — | — | — | 主动 |
| bh_s0 | 止血包扎 | — | — | — | low | 主动 |
| bh_s4b | 解秽散 | — | — | — | mid | 主动 |
| bh_s5a | 镇魄针 | 暗器 | 阴 | 50% 封穴 | — | 主动 |
| bh_s5b | 回脉十二针 | — | — | — | all | 主动 |
| zc_s4b | 逆流截江 | 剑 | — | — | — | 防御强化 |
| zc_s5a | 江心定影 | 剑 | 寒 | 40% 目眩 | — | 主动 |
| zc_s5b | 千帆照水 | 剑 | 阳 | — | — | 主动 |
| hc_s4b | 开闩重拳 | 拳掌 | 炎 | 60% 内伤×2 | — | 主动 |
| hc_s5a | 坠桩镇步 | 拳掌 | 雷 | 40% 眩晕 | — | 主动 |
| hc_s5b | 担山护众 | 拳掌 | — | — | — | 主动 |
| sf_s4b | 听涛辨枝 | 剑 | 风 | — | — | 主动 |
| sf_s5a | 松影千重 | 剑 | 雷 | 每段15% 心乱 | — | 主动 |
| sf_s5b | 风定还枝 | — | — | — | mid | 主动 |
| gj_s4b | 残火截锋 | 刀 | 炎 | — | — | 主动 |
| gj_s5a | 烬里藏锋 | 刀 | 阴 | 70% 中毒×2 | — | 主动 |
| gj_s5b | 回灰护影 | 刀 | — | — | — | 主动 |
| pj_s4b | 锁江擒拿 | 长兵 | 雷 | 40% 封穴 | — | 主动 |
| hui_q1 | 勾弦 | 音律 | — | — | — | 主动 |
| hui_q2 | 商声 | 音律 | — | 每段15% 心乱 | — | 主动 |
| hui_q3 | 夜阑 | 音律 | 阴 | 35% 封穴 | — | 主动 |
| hui_q4a | 一曲安澜 | 音律 | — | — | mid | 主动 |
| hui_q4b | 断弦 | 音律 | 阴 | 40% 心乱 | — | 主动 |
| hui_q5a | 余音绕梁 | 音律 | 阴 | 25% 心乱 | — | 主动 |
| hui_q5b | 定心 | 音律 | — | — | — | 主动 |
| hui_q5 | 希声 | 音律 | 阴 | 50% 封穴 | — | 主动 |
| hui_d1 | 清啸 | 音律 | — | — | — | 主动 |
| hui_d2 | 折柳 | 音律 | — | 40% 迟滞 | — | 主动 |
| hui_d3 | 梅落 | 音律 | 风 | 25% 惊惧 | — | 主动 |
| hui_d4a | 关山月 | 音律 | 风 | — | — | 主动 |
| hui_d4b | 催行 | 音律 | — | — | — | 主动 |
| hui_d5a | 遏云 | 音律 | 风 | — | — | 主动 |
| hui_d5b | 惊鸿过隙 | 音律 | 风 | 50% 迟滞、30% 惊惧 | — | 主动 |
| hui_d5 | 裂石 | 音律 | 风 | 100% 惊惧 | — | 主动 |
| bh_d1 | 柳叶飞针 | 暗器 | — | 25% 流血 | — | 主动 |
| bh_d2 | 麻沸烟 | 暗器 | 寒 | 30% 迟滞 | — | 主动 |
| bh_d3 | 三阴透骨针 | 暗器 | 阴 | 每段30% 中毒 | — | 主动 |
| bh_d4a | 乌头烟 | 暗器 | 阴 | 50% 中毒×2 | — | 主动 |
| bh_d4b | 催毒针 | 暗器 | 寒 | — | — | 主动 |
| bh_d5a | 封脉寒针 | 暗器 | 寒 | 45% 封穴 | — | 主动 |
| bh_d5b | 满谷飞霜 | 暗器 | 寒 | 每段20% 迟滞 | — | 主动 |
| bh_d5 | 万针锁脉 | 暗器 | 阴 | 70% 中毒×3 | — | 主动 |
| zc_f1 | 袖底流光 | 暗器 | — | — | — | 主动 |
| zc_f2 | 分光 | 暗器 | 阳 | — | — | 主动 |
| zc_f3 | 寒星点水 | 暗器 | 寒 | 25% 目眩 | — | 主动 |
| zc_f4a | 追光 | 暗器 | 阳 | — | — | 主动 |
| zc_f4b | 碎镜 | 暗器 | 寒 | — | — | 主动 |
| zc_f5a | 江月初照 | 暗器 | 寒 | 40% 目眩 | — | 主动 |
| zc_f5b | 流萤渡江 | 暗器 | 阳 | — | — | 主动 |
| zc_f5 | 千江有月 | 暗器 | 阳 | — | — | 主动 |
| hc_g1 | 挑担起肩 | 长兵 | — | — | — | 主动 |
| hc_g2 | 横杠清道 | 长兵 | — | — | — | 主动 |
| hc_g3 | 火塘拨杠 | 长兵 | 炎 | 50% 内伤 | — | 主动 |
| hc_g4a | 撬闸 | 长兵 | 雷 | — | — | 主动 |
| hc_g4b | 连枷三叠 | 长兵 | 炎 | — | — | 主动 |
| hc_g5a | 压舱 | 长兵 | 雷 | — | — | 主动 |
| hc_g5b | 滚雷扫堂 | 长兵 | 雷 | 20% 眩晕 | — | 主动 |
| hc_g5 | 一杠镇河 | 长兵 | 炎 | 50% 惊惧 | — | 主动 |
| sf_f1 | 拂尘扫叶 | 长兵 | — | — | — | 主动 |
| sf_f2 | 松针散 | 长兵 | 风 | — | — | 主动 |
| sf_f3 | 缠枝 | 长兵 | 风 | 45% 迟滞 | — | 主动 |
| sf_f4a | 卷帘 | 长兵 | 风 | — | — | 主动 |
| sf_f4b | 惊雷落松 | 长兵 | 雷 | 15% 眩晕 | — | 主动 |
| sf_f5a | 风入松 | 长兵 | 风 | — | — | 主动 |
| sf_f5b | 引雷 | 长兵 | 雷 | — | — | 主动 |
| sf_f5 | 松雷九响 | 长兵 | 雷 | 30% 眩晕 | — | 主动 |
| gj_h1 | 扬灰 | 暗器 | — | 25% 目眩 | — | 主动 |
| gj_h2 | 火鸦镖 | 暗器 | 炎 | 35% 流血 | — | 主动 |
| gj_h3 | 烬雨 | 暗器 | 炎 | 25% 流血 | — | 主动 |
| gj_h4a | 引火线 | 暗器 | 炎 | — | — | 主动 |
| gj_h4b | 爆烬 | 暗器 | 炎 | — | — | 主动 |
| gj_h5a | 阴火附骨 | 暗器 | 阴 | 70% 中毒×2 | — | 主动 |
| gj_h5b | 回燃 | 暗器 | 炎 | — | — | 主动 |
| gj_h5 | 流火焚夜 | 暗器 | 炎 | 60% 流血×2 | — | 主动 |
| pj_d1 | 出鞘示警 | 刀 | — | — | — | 主动 |
| pj_d2 | 截缆 | 刀 | — | 30% 流血 | — | 主动 |
| pj_d3 | 寒江断流 | 刀 | 寒 | — | — | 主动 |
| pj_d4a | 连环追缉 | 刀 | 雷 | — | — | 主动 |
| pj_d4b | 封江 | 刀 | 寒 | 35% 迟滞 | — | 主动 |
| pj_d5a | 雷行水上 | 刀 | 雷 | — | — | 主动 |
| pj_d5b | 缴械 | 刀 | 寒 | 40% 封穴 | — | 主动 |
| pj_d5 | 一刀镇澜 | 刀 | 寒 | — | — | 主动 |
| jh_gh1 | 破兵式 | 剑 | — | — | — | 主动 |
| jh_gh2 | 荡矢式 | 剑 | — | 35% 目眩 | — | 主动 |
| jh_gh3 | 无式 | 剑 | — | — | — | 主动 |
| jh_fl1 | 盈龙有悔 | 拳掌 | 阳 | — | — | 主动 |
| jh_fl2 | 回龙摆尾 | 拳掌 | 阳 | — | — | 主动 |
| jh_fl3 | 震雷百里 | 拳掌 | 阳 | 50% 惊惧 | — | 主动 |
| jh_lm1 | 少阳剑气 | 暗器 | 阳 | — | — | 主动 |
| jh_lm2 | 轻冲剑气 | 暗器 | 阳 | — | — | 主动 |
| jh_lm3 | 六脉轮转 | 暗器 | 阳 | — | — | 主动 |
| jh_dm1 | 十三连环 | 剑 | 阴 | — | — | 主动 |
| jh_dm2 | 第十四式 | 剑 | 阴 | — | — | 主动 |
| jh_dm3 | 第十五式 | 剑 | 阴 | — | — | 主动 |
| jh_bx1 | 扣刀不发 | 暗器 | — | — | — | 主动 |
| jh_bx2 | 后发一刀 | 暗器 | — | — | — | 主动 |
| jh_bx3 | 一刀不虚 | 暗器 | — | — | — | 主动 |
| jh_qq1 | 绊字诀 | 长兵 | — | 40% 迟滞 | — | 主动 |
| jh_qq2 | 封转八方 | 长兵 | — | — | — | 主动 |
| jh_qs1 | 三损拳 | 拳掌 | 炎 | 50% 内伤 | — | 主动 |
| jh_qs2 | 七劲齐伤 | 拳掌 | 炎 | 70% 内伤×2 | — | 主动 |
| jh_xh1 | 拖泥涉水 | 拳掌 | 阴 | 35% 迟滞 | — | 主动 |
| jh_xh2 | 穷途一掌 | 拳掌 | 阴 | — | — | 主动 |
| jh_ly1 | 圆转如意 | 剑 | 风 | — | — | 主动 |
| jh_ly2 | 后发制人 | 剑 | 风 | — | — | 主动 |
| jh_qx1 | 抉目连刺 | 剑 | 阴 | 每段15% 目眩 | — | 主动 |
| jh_qx2 | 群邪退避 | 剑 | 阴 | 35% 惊惧 | — | 主动 |
| jh_xy1 | 春雨一痕 | 刀 | 阴 | 50% 流血×2 | — | 主动 |
| jh_xy2 | 一刀中分 | 刀 | 阴 | — | — | 主动 |
| jh_bw1 | 丈三横扫 | 长兵 | 雷 | — | — | 主动 |
| jh_bw2 | 一往无前 | 长兵 | 雷 | 25% 眩晕 | — | 主动 |
| jh_qp1 | 翎光乍现 | 暗器 | 炎 | 35% 目眩 | — | 主动 |
| jh_qp2 | 雀屏尽开 | 暗器 | 炎 | — | — | 主动 |
| jh_by1 | 白云出岫 | 剑 | 阳 | — | — | 主动 |
| jh_by2 | 天外来仙 | 剑 | 阳 | — | — | 主动 |
| jh_hp1 | 凝冰成符 | 暗器 | 寒 | 80% 中毒×3 | — | 主动 |
| jh_hp2 | 催符 | 暗器 | 寒 | 30% 惊惧 | — | 主动 |
| jh_sh1 | 先声夺人 | 音律 | 雷 | 30% 惊惧 | — | 主动 |
| jh_sh2 | 雷音贯耳 | 音律 | 雷 | 25% 眩晕 | — | 主动 |
| jh_ty1 | 黑刀一闪 | 刀 | — | — | — | 主动 |
| jh_cy1 | 一指定阳 | 拳掌 | 阳 | 50% 封穴 | — | 主动 |
| jh_hd1 | 八方藏刀 | 刀 | 寒 | — | — | 主动 |
| jh_cg1 | 五指摧坚 | 拳掌 | 阴 | 30% 惊惧 | — | 主动 |
| jh_tz1 | 飞石破空 | 暗器 | 雷 | 20% 眩晕 | — | 主动 |
| jh_bl1 | 钩处即别 | 刀 | — | 60% 流血×2 | — | 主动 |
| jh_lx1 | 两指夹锋 | 拳掌 | — | — | — | 主动 |
| jh_luo1 | 落红成阵 | 拳掌 | 风 | 20% 目眩 | — | 主动 |
| jh_jh1 | 蛇信分叉 | 剑 | — | — | — | 主动 |
| jh_wm1 | 铁片快剑 | 剑 | — | — | — | 主动 |
| jh_pl1 | 掷雷 | 暗器 | 雷 | 20% 惊惧 | — | 主动 |
| jh_bp1 | 银针淬寒 | 暗器 | 寒 | 60% 中毒×2 | — | 主动 |

<!-- v3-skills:end -->
