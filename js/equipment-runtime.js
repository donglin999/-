/* 由 tools_docs/build_weapon_stats.py 与 build_armor_acc.py 生成，勿手改。装备数值 v1（weapon-stats.md、armor-acc-stats.md）。 */
window.EquipmentRuntime={
 "weapons": {
  "eq_practice_sword": {
   "name": "竹纹练剑",
   "grade": "丁",
   "q": 0,
   "desc": "丁级剑。宽钝木刃、竹节刻痕、麻绳缠柄，短直护手。攻击 +8，暴击 +3%。无附带特性（可靠的入门剑）。",
   "weapon": {
    "kind": "剑",
    "atk": 8,
    "crit": 3
   },
   "fx": {},
   "price": 30,
   "req": {},
   "mods": {},
   "statusBonus": {},
   "mech": {
    "type": "none"
   }
  },
  "eq_clear_sword": {
   "name": "清流剑",
   "grade": "丙",
   "q": 1,
   "desc": "丙级剑。窄钢刃、浅水纹剑脊、银灰弯护手、靛蓝柄缠。攻击 +12，暴击 +3%。每场战斗首次出手伤害 +15%（起手更稳）。",
   "weapon": {
    "kind": "剑",
    "atk": 12,
    "crit": 3
   },
   "fx": {},
   "price": 90,
   "req": {
    "agi": 5
   },
   "mods": {},
   "statusBonus": {},
   "mech": {
    "type": "first_strike_atk",
    "value": 0.15,
    "once": "每场一次"
   }
  },
  "eq_cloud_sword": {
   "name": "岚隙剑",
   "grade": "乙",
   "q": 2,
   "desc": "乙级剑。不对称断云护手、宽根窄尖刃、竹青短穗，保养旧木柄。攻击 +17，暴击 +3%。选“防御”后的下一次剑招伤害 +15%（每次防御一次）。风劲招式伤害 +6%。",
   "weapon": {
    "kind": "剑",
    "atk": 17,
    "crit": 3
   },
   "fx": {},
   "price": 240,
   "req": {
    "agi": 7
   },
   "mods": {
    "element_bonus": {
     "风": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "after_defend_atk",
    "value": 0.15,
    "once": "每次防御后一次"
   }
  },
  "eq_sunset_sword": {
   "name": "照晚",
   "grade": "甲",
   "q": 3,
   "desc": "甲级剑。长直细钢刃、落照半圆护手、银嵌金脊、霜白短双穗。攻击 +23，暴击 +4%。对已看破目标的本回合首击伤害 +20%（每回合一次）。阳劲招式伤害 +8%。",
   "weapon": {
    "kind": "剑",
    "atk": 23,
    "crit": 4
   },
   "fx": {},
   "price": 600,
   "req": {
    "agi": 9
   },
   "mods": {
    "element_bonus": {
     "阳": 0.08
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "revealed_first_hit",
    "value": 0.2,
    "once": "每回合一次"
   }
  },
  "eq_return_sword": {
   "name": "归山",
   "grade": "绝",
   "q": 4,
   "desc": "绝级剑。开口双层云山护手、暗金嵌银、清晰锻纹与竹青复结穗，锋端局部白光。攻击 +26，暴击 +4%。消耗守势时回复 6 内力（每战两次，不增加行动）。风劲招式伤害 +8%；阳劲招式伤害 +8%。",
   "weapon": {
    "kind": "剑",
    "atk": 26,
    "crit": 4
   },
   "fx": {},
   "price": 0,
   "req": {
    "agi": 11
   },
   "mods": {
    "element_bonus": {
     "风": 0.08,
     "阳": 0.08
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "token_mp",
    "value": 6,
    "once": "每战两次"
   },
   "unsellable": 1
  },
  "eq_wrap": {
   "name": "麻缠护手",
   "grade": "丁",
   "q": 0,
   "desc": "丁级拳。一副作为单件装备的叠麻绑手，粗纤维与掌根补缝。攻击 +8，暴击 +3%。普攻伤害 +10%（空手技基础发力；不提供防御）。",
   "weapon": {
    "kind": "拳",
    "atk": 8,
    "crit": 3
   },
   "fx": {},
   "price": 30,
   "req": {},
   "mods": {},
   "statusBonus": {},
   "mech": {
    "type": "basic_atk",
    "value": 0.1
   }
  },
  "eq_brace": {
   "name": "合川拳套",
   "grade": "乙",
   "q": 2,
   "desc": "乙级拳。赭红分指拳套、厚掌根、铁灰小护片、双绳结外轮廓。攻击 +16，暴击 +3%。拳掌招式命中弱点时伤害 +10%（不额外削盾）。雷劲招式伤害 +6%。",
   "weapon": {
    "kind": "拳",
    "atk": 16,
    "crit": 3
   },
   "fx": {},
   "price": 240,
   "req": {
    "str": 7
   },
   "mods": {
    "element_bonus": {
     "雷": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "weak_hit",
    "value": 0.1,
    "weapon": "拳掌"
   }
  },
  "eq_heavy_brace": {
   "name": "承岳护拳",
   "grade": "甲",
   "q": 3,
   "desc": "甲级拳。低矮拱形护拳、层叠熟皮、旧金铆钉与深色承重脊，关节可弯。攻击 +22，暴击 +4%。援护（替同伴承伤）后的下一次拳招伤害 +20%。阳劲招式伤害 +8%。",
   "weapon": {
    "kind": "拳",
    "atk": 22,
    "crit": 4
   },
   "fx": {},
   "price": 600,
   "req": {
    "str": 9
   },
   "mods": {
    "element_bonus": {
     "阳": 0.08
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "after_guard_atk",
    "value": 0.2,
    "once": "每次援护后一次"
   }
  },
  "eq_needle_roll": {
   "name": "理针囊",
   "grade": "丙",
   "q": 1,
   "desc": "丙级暗器。月白卷囊展开一角、三格银针、药青布带，针尖安全收纳。攻击 +9，暴击 +8%。自身目眩时，暗器招式的落空率减半（不按针数消耗背包）。",
   "weapon": {
    "kind": "暗器",
    "atk": 9,
    "crit": 8
   },
   "fx": {},
   "price": 90,
   "req": {
    "agi": 5
   },
   "mods": {},
   "statusBonus": {},
   "mech": {
    "type": "blind_miss_half",
    "value": 0.5,
    "weapon": "暗器"
   }
  },
  "eq_thread_needle": {
   "name": "循脉银针",
   "grade": "乙",
   "q": 2,
   "desc": "乙级暗器。狭长赭布针夹、长短分明三组针、铜扣细格、少量金色针尾。攻击 +13，暴击 +8%。对已看破目标施放针技内力 −2（每回合一次）。阴劲招式伤害 +6%。",
   "weapon": {
    "kind": "暗器",
    "atk": 13,
    "crit": 8
   },
   "fx": {},
   "price": 240,
   "req": {
    "agi": 7
   },
   "mods": {
    "element_bonus": {
     "阴": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "revealed_mp",
    "value": -2,
    "once": "每回合一次"
   }
  },
  "eq_return_needle": {
   "name": "归息针匣",
   "grade": "甲",
   "q": 3,
   "desc": "甲级暗器。扁窄梨木滑盖匣、银嵌连续脉线、可抽薄针托与青赭双色系绳。攻击 +17，暴击 +9%。所装配招式以针攻为主时针技伤害 +8%，以医术为主时治疗 +8%（按装配多数自动取一项，不双算）。阴劲招式伤害 +8%。",
   "weapon": {
    "kind": "暗器",
    "atk": 17,
    "crit": 9
   },
   "fx": {},
   "price": 600,
   "req": {
    "agi": 9
   },
   "mods": {
    "element_bonus": {
     "阴": 0.08
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "hit_or_heal",
    "value": 0.08
   }
  },
  "eq_medical_kit": {
   "name": "行诊药囊",
   "grade": "丙",
   "q": 1,
   "desc": "丙级医具。双层棉药囊、可拆小竹筒、药青束口与洁净包布；无现代红十字。攻击 +7，治疗 +12%。治疗量 +10%（占武器槽，进攻较弱）。",
   "weapon": {
    "kind": "医具",
    "atk": 7
   },
   "fx": {},
   "price": 90,
   "req": {
    "wis": 5
   },
   "mods": {
    "heal": 0.12
   },
   "statusBonus": {},
   "mech": {
    "type": "heal",
    "value": 0.1
   }
  },
  "eq_hidden_dagger": {
   "name": "藏锋短刀",
   "grade": "丙",
   "q": 1,
   "desc": "丙级短刀。宽根窄尖单刃、偏心铜护手、墨紫缠柄和贴身短鞘。攻击 +12，暴击 +5%。单体招式暴击率 +6%。",
   "weapon": {
    "kind": "短刀",
    "atk": 12,
    "crit": 5
   },
   "fx": {},
   "price": 90,
   "req": {
    "agi": 5
   },
   "mods": {},
   "statusBonus": {},
   "mech": {
    "type": "crit_single",
    "value": 6
   }
  },
  "eq_ember_dagger": {
   "name": "留烬",
   "grade": "甲",
   "q": 3,
   "desc": "甲级短刀。内弧短刀、双层折焰铜护手、暗红柄缠、脊线细金与缺口式短穗。攻击 +23，暴击 +6%。本回合攻击后，首次获得的卸力额外 +10%（每回合一次）。炎劲招式伤害 +8%；施加流血基础率 +10%。",
   "weapon": {
    "kind": "短刀",
    "atk": 23,
    "crit": 6
   },
   "fx": {},
   "price": 600,
   "req": {
    "agi": 9
   },
   "mods": {
    "element_bonus": {
     "炎": 0.08
    },
    "status_chance": {
     "流血": 0.1
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "after_atk_unload",
    "value": 0.1,
    "once": "每回合一次"
   }
  },
  "eq_lock_dagger": {
   "name": "雀尾短刀",
   "grade": "乙",
   "q": 2,
   "desc": "乙级短刀。短直刀身、雀尾式青灰木柄、朴素铜箍、小工具套与刀鞘分隔。攻击 +17，暴击 +5%。牵制、控制类招式内力 −2（不增加盗窃或掉落）。阴劲招式伤害 +6%。",
   "weapon": {
    "kind": "短刀",
    "atk": 17,
    "crit": 5
   },
   "fx": {},
   "price": 240,
   "req": {
    "agi": 7
   },
   "mods": {
    "element_bonus": {
     "阴": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "control_mp",
    "value": -2
   }
  },
  "eq_road_saber": {
   "name": "护行刀",
   "grade": "丙",
   "q": 1,
   "desc": "丙级刀。厚背微弯钢刀、椭圆铁护手、旧褐皮柄与补缝刀鞘。攻击 +14，防御 +2。防御 +2（稳定的护行刀）。",
   "weapon": {
    "kind": "刀",
    "atk": 14
   },
   "fx": {
    "def": 2
   },
   "price": 90,
   "req": {
    "str": 5
   },
   "mods": {},
   "statusBonus": {},
   "mech": {
    "type": "def",
    "value": 2
   }
  },
  "eq_ember_saber": {
   "name": "断烬刀",
   "grade": "乙",
   "q": 2,
   "desc": "乙级刀。直背宽刃前端微上挑、折角旧铜护手、暗红分段缠柄。攻击 +20。自身带“暴露”时刀招伤害 +20%（暴露的代价照常保留）。炎劲招式伤害 +6%。",
   "weapon": {
    "kind": "刀",
    "atk": 20
   },
   "fx": {},
   "price": 240,
   "req": {
    "str": 7
   },
   "mods": {
    "element_bonus": {
     "炎": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "exposed_atk",
    "value": 0.2
   }
  },
  "eq_storm_saber": {
   "name": "风雨兼程",
   "grade": "甲",
   "q": 3,
   "desc": "甲级刀。较长微弧刃、雨槽锻纹、双护环短手格、深褐防滑柄。攻击 +26。援护成功后的下一次刀招内力 −3。雷劲招式伤害 +8%。",
   "weapon": {
    "kind": "刀",
    "atk": 26
   },
   "fx": {},
   "price": 600,
   "req": {
    "str": 9
   },
   "mods": {
    "element_bonus": {
     "雷": 0.08
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "after_guard_mp",
    "value": -3,
    "once": "每次援护后一次"
   }
  },
  "eq_patrol_staff": {
   "name": "截江棍",
   "grade": "丙",
   "q": 1,
   "desc": "丙级棍。灰褐硬木长杆、两端铁箍、中段深蓝绳缠，粗细结构清楚。攻击 +13，防御 +3。长兵招式施加迟滞、眩晕的基础率 +8%。",
   "weapon": {
    "kind": "棍",
    "atk": 13
   },
   "fx": {
    "def": 3
   },
   "price": 90,
   "req": {
    "str": 5
   },
   "mods": {},
   "statusBonus": {},
   "mech": {
    "type": "status_chance",
    "value": 0.08,
    "statuses": [
     "迟滞",
     "眩晕"
    ]
   }
  },
  "eq_boat_pole": {
   "name": "渡汀长篙",
   "grade": "乙",
   "q": 2,
   "desc": "乙级棍。分节长竹、偏扁铁脚、青布防滑握段、实用双节加固。攻击 +18，防御 +4。援护、救援类招式内力 −2（不穿越地形）。寒劲招式伤害 +6%。",
   "weapon": {
    "kind": "棍",
    "atk": 18
   },
   "fx": {
    "def": 4
   },
   "price": 240,
   "req": {
    "str": 7
   },
   "mods": {
    "element_bonus": {
     "寒": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "guard_mp",
    "value": -2
   }
  },
  "eq_fan": {
   "name": "邀锋铁骨扇",
   "grade": "乙",
   "q": 2,
   "desc": "乙级扇。绯红扇面半开、七根可数主铁骨、深金短钉、收束短流苏，不画双扇。攻击 +14，暴击 +4%，闪避 +6%。每回合首次卸力额外 +10%。风劲招式伤害 +6%。",
   "weapon": {
    "kind": "扇",
    "atk": 14,
    "crit": 4
   },
   "fx": {
    "dodge": 6
   },
   "price": 240,
   "req": {
    "agi": 7
   },
   "mods": {
    "element_bonus": {
     "风": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "unload_bonus",
    "value": 0.1,
    "once": "每回合一次"
   }
  },
  "eq_umbrella": {
   "name": "留灯伞",
   "grade": "乙",
   "q": 2,
   "desc": "乙级伞。莲粉油纸伞半开、硬竹骨内撑、深木弯柄和修补白绢片。攻击 +14，防御 +8。为同伴援护、卸力的招式内力 −2（不增加音波攻击）。阴劲招式伤害 +6%。",
   "weapon": {
    "kind": "伞",
    "atk": 14
   },
   "fx": {
    "def": 8
   },
   "price": 240,
   "req": {
    "wil": 7
   },
   "mods": {
    "element_bonus": {
     "阴": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "guard_mp",
    "value": -2
   }
  },
  "eq_throwing_blades": {
   "name": "燕尾飞刃",
   "grade": "乙",
   "q": 2,
   "desc": "乙级暗器。三枚成套短飞刃有燕尾柄轮廓、杏黄缠线与专用窄套。攻击 +13，暴击 +8%。多段暗器招式第二段起每段伤害 +8%（段数不增加）。风劲招式伤害 +6%。",
   "weapon": {
    "kind": "暗器",
    "atk": 13,
    "crit": 8
   },
   "fx": {},
   "price": 240,
   "req": {
    "agi": 7
   },
   "mods": {
    "element_bonus": {
     "风": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "multihit_later",
    "value": 0.08,
    "weapon": "暗器"
   }
  },
  "eq_work_hammer": {
   "name": "校铁锤",
   "grade": "乙",
   "q": 2,
   "desc": "乙级锤。一端方平一端窄楔的锤头、短硬木柄、斜向刻槽和防脱绳。攻击 +21。对已看破目标，削盾/破势类招式伤害 +12%。雷劲招式伤害 +6%。",
   "weapon": {
    "kind": "锤",
    "atk": 21
   },
   "fx": {
    "spd": -1
   },
   "price": 240,
   "req": {
    "str": 7
   },
   "mods": {
    "element_bonus": {
     "雷": 0.06
    }
   },
   "statusBonus": {},
   "mech": {
    "type": "revealed_break_atk",
    "value": 0.12
   }
  },
  "eq_qin_practice": {
   "name": "桐木练琴",
   "grade": "丁",
   "q": 0,
   "desc": "丁级琴。素面桐木琴身、七弦、无漆饰、简单雁足。攻击 +6。无附带特性（入门练习琴）。",
   "weapon": {
    "kind": "琴",
    "atk": 6
   },
   "fx": {},
   "price": 30,
   "req": {},
   "mods": {},
   "statusBonus": {
    "封穴": 0.03,
    "心乱": 0.03
   },
   "mech": {
    "type": "none"
   }
  },
  "eq_flute_bamboo": {
   "name": "竹节横笛",
   "grade": "丙",
   "q": 1,
   "desc": "丙级笛。紫竹单节横笛、六孔、穿青色笛囊。攻击 +9。笛路招式内力 −1。施加迟滞基础率 +5%。",
   "weapon": {
    "kind": "笛",
    "atk": 9
   },
   "fx": {},
   "price": 90,
   "req": {
    "wis": 5
   },
   "mods": {
    "status_chance": {
     "迟滞": 0.05
    }
   },
   "statusBonus": {
    "惊惧": 0.06,
    "迟滞": 0.06
   },
   "mech": {
    "type": "route_mp",
    "value": -1,
    "weapon": "音律"
   }
  },
  "eq_qin_night": {
   "name": "夜阑琴",
   "grade": "乙",
   "q": 2,
   "desc": "乙级琴。断纹漆面、玉徽十三点、深色琴轸与流苏。攻击 +12。特性即右栏的封穴、心乱施加率 +8%（不另计，避免与装备技能影响重复）。阴劲招式伤害 +6%；施加封穴基础率 +8%；施加心乱基础率 +8%。",
   "weapon": {
    "kind": "琴",
    "atk": 12
   },
   "fx": {},
   "price": 240,
   "req": {
    "wis": 7
   },
   "mods": {
    "element_bonus": {
     "阴": 0.06
    },
    "status_chance": {
     "封穴": 0.08,
     "心乱": 0.08
    }
   },
   "statusBonus": {
    "封穴": 0.09,
    "心乱": 0.09
   },
   "mech": {
    "type": "see_mods"
   }
  },
  "eq_flute_guanshan": {
   "name": "关山笛",
   "grade": "甲",
   "q": 3,
   "desc": "甲级笛。铁竹笛身、三道银箍、笛尾系旧军中红绳。攻击 +17。笛路群体招式命中后，全队下一次受到的惊惧持续 −1 回合。风劲招式伤害 +8%；施加惊惧基础率 +8%。",
   "weapon": {
    "kind": "笛",
    "atk": 17
   },
   "fx": {},
   "price": 600,
   "req": {
    "wis": 9
   },
   "mods": {
    "element_bonus": {
     "风": 0.08
    },
    "status_chance": {
     "惊惧": 0.08
    }
   },
   "statusBonus": {
    "惊惧": 0.12,
    "迟滞": 0.12
   },
   "mech": {
    "type": "team_fear_minus",
    "value": 1
   }
  },
  "eq_lock_river_staff": {
   "name": "锁江棍",
   "grade": "甲",
   "q": 3,
   "desc": "甲级棍。铁箍乌木长棍、两端铜镦、棍身刻巡江水纹。攻击 +24，防御 +6。长兵招式命中后，目标下一次行动伤害 −10%（每回合一次）。",
   "weapon": {
    "kind": "棍",
    "atk": 24
   },
   "fx": {
    "def": 6
   },
   "price": 600,
   "req": {
    "str": 9
   },
   "mods": {},
   "statusBonus": {},
   "mech": {
    "type": "weaken_next",
    "value": 0.1,
    "once": "每回合一次"
   }
  },
  "eq_jade_hui_qin": {
   "name": "玉徽琴",
   "grade": "甲",
   "q": 3,
   "desc": "甲级琴。桐木漆面、十三点白玉琴徽、浅青琴穗。攻击 +16。琴路单体招式对已封穴或心乱的目标伤害 +12%。",
   "weapon": {
    "kind": "琴",
    "atk": 16
   },
   "fx": {},
   "price": 600,
   "req": {
    "wis": 9
   },
   "mods": {},
   "statusBonus": {
    "封穴": 0.12,
    "心乱": 0.12
   },
   "mech": {
    "type": "status_target_atk",
    "value": 0.12,
    "statuses": [
     "封穴",
     "心乱"
    ]
   }
  }
 },
 "armors": {
  "eq_plain_robe": {
   "name": "归谷短衣",
   "grade": "丁",
   "q": 0,
   "type": "轻",
   "armor": 3,
   "fx": {
    "dodge": 3
   },
   "desc": "丁级轻装。灰米短交领、竹青单缘、束袖和便于活动的下摆，无亮色宽腰封。防御 +3。无附带特性（谷中日常短衣）。",
   "price": 30,
   "req": {},
   "mods": {},
   "mech": {
    "type": "none"
   }
  },
  "eq_padded_coat": {
   "name": "行旅夹衣",
   "grade": "丙",
   "q": 1,
   "type": "中",
   "armor": 7,
   "fx": {
    "mhp": 16
   },
   "desc": "丙级中装。棕灰夹棉短衣、菱格缝线、肘部补强、小布扣。防御 +7。无附带特性。流血抗性 +15%。",
   "price": 90,
   "req": {
    "con": 5
   },
   "mods": {
    "status_resist": {
     "流血": 0.15
    }
   },
   "mech": {
    "type": "none"
   }
  },
  "eq_sword_coat": {
   "name": "折锋剑衣",
   "grade": "乙",
   "q": 2,
   "type": "轻",
   "armor": 7,
   "fx": {
    "dodge": 5
   },
   "desc": "乙级轻装。靛蓝纵向剑衣、银灰护腕、整齐剑带与长分摆。防御 +7。第一回合身速 +1（剑衣利落，先行观察）。目眩、迟滞抗性 +20%。",
   "price": 240,
   "req": {
    "agi": 7
   },
   "mods": {
    "status_resist": {
     "目眩": 0.2,
     "迟滞": 0.2
    }
   },
   "mech": {
    "type": "first_round_spd",
    "value": 1
   }
  },
  "eq_medical_robe": {
   "name": "轻行医袍",
   "grade": "乙",
   "q": 2,
   "type": "医",
   "armor": 8,
   "fx": {
    "mmp": 18
   },
   "desc": "乙级医装。月白轻短医袍、药青单细缘、窄袖与两层小医袋，无教习三缘。防御 +8。治疗量 +8%。中毒、流血抗性 +20%。",
   "price": 240,
   "req": {
    "wis": 7
   },
   "mods": {
    "status_resist": {
     "中毒": 0.2,
     "流血": 0.2
    },
    "heal": 0.05
   },
   "mech": {
    "type": "heal",
    "value": 0.08
   }
  },
  "eq_guard_vest": {
   "name": "护运软甲",
   "grade": "乙",
   "q": 2,
   "type": "重",
   "armor": 14,
   "fx": {
    "spd": -1,
    "block": 6
   },
   "desc": "乙级重装。分片熟皮软甲、麻绳系带、内衬赭布，肩部保持活动空间。防御 +14。援护替同伴承伤时，所受伤害再 −10%。眩晕、流血抗性 +20%。",
   "price": 240,
   "req": {
    "con": 7
   },
   "mods": {
    "status_resist": {
     "眩晕": 0.2,
     "流血": 0.2
    }
   },
   "mech": {
    "type": "guard_reduce",
    "value": 0.1
   }
  },
  "eq_dancer_layer": {
   "name": "绯袖行衣",
   "grade": "乙",
   "q": 2,
   "type": "轻",
   "armor": 7,
   "fx": {
    "dodge": 5
   },
   "desc": "乙级轻装。绯色可束短披袖、深金窄缘、内层便行衣和独立扇袋。防御 +7。每回合首次给同伴卸力时，卸力额外 +10%。心乱、惊惧抗性 +20%。",
   "price": 240,
   "req": {
    "agi": 7
   },
   "mods": {
    "status_resist": {
     "心乱": 0.2,
     "惊惧": 0.2
    }
   },
   "mech": {
    "type": "unload_bonus",
    "value": 0.1,
    "once": "每回合一次"
   }
  },
  "eq_hidden_coat": {
   "name": "余烬行装",
   "grade": "甲",
   "q": 3,
   "type": "中",
   "armor": 14,
   "fx": {
    "mhp": 32
   },
   "desc": "甲级中装。墨紫非对称叠衣、铜扣分段束腰、暗红折焰窄缘与短兵鞘挂点。防御 +14。本战第一次带“暴露”受击时，该次伤害 −20%。流血、内伤、惊惧抗性 +25%。",
   "price": 600,
   "req": {
    "con": 9
   },
   "mods": {
    "status_resist": {
     "流血": 0.25,
     "内伤": 0.25,
     "惊惧": 0.25
    }
   },
   "mech": {
    "type": "expose_first_reduce",
    "value": 0.2,
    "once": "每战一次"
   }
  },
  "eq_old_mantle": {
   "name": "守诺旧氅",
   "grade": "绝",
   "q": 4,
   "type": "中",
   "armor": 16,
   "fx": {
    "mhp": 40
   },
   "desc": "绝级中装。不对称长短旧氅、竹青内衬、数处不同针脚与细银包边，独特轮廓无帝王金甲。防御 +16。本战首次援护濒危（气血低于三成）同伴后，自身回复 10% 气血。全部异常抗性 +10%，惊惧抗性 +30%。",
   "price": 0,
   "req": {
    "con": 11
   },
   "mods": {
    "status_resist": {
     "中毒": 0.1,
     "流血": 0.1,
     "内伤": 0.1,
     "封穴": 0.1,
     "眩晕": 0.1,
     "目眩": 0.1,
     "心乱": 0.1,
     "惊惧": 0.3,
     "迟滞": 0.1
    }
   },
   "mech": {
    "type": "guard_heal",
    "value": 0.1,
    "once": "每战一次"
   },
   "unsellable": 1
  },
  "eq_cowhide_guard": {
   "name": "牛皮护心甲",
   "grade": "丙",
   "q": 1,
   "type": "重",
   "armor": 10,
   "fx": {
    "spd": -1,
    "block": 4
   },
   "desc": "丙级重装。熟牛皮缝成的护胸软甲，前胸一块加厚护心皮，皮绳系带，边缘铜钉。防御 +10。无附带特性。流血抗性 +15%。",
   "price": 90,
   "req": {
    "con": 5
   },
   "mods": {
    "status_resist": {
     "流血": 0.15
    }
   },
   "mech": {
    "type": "none"
   }
  },
  "eq_cloud_shirt": {
   "name": "岚纹轻衫",
   "grade": "甲",
   "q": 3,
   "type": "轻",
   "armor": 10,
   "fx": {
    "dodge": 6
   },
   "desc": "甲级轻装。青灰薄绸长衫，袖口与衣摆织着淡淡的山岚纹，腰间细带，轻盈贴身。防御 +10。闪避一次攻击后，下一次攻击伤害 +15%（每回合一次）。目眩、迟滞、心乱抗性 +25%。",
   "price": 600,
   "req": {
    "agi": 9
   },
   "mods": {
    "status_resist": {
     "目眩": 0.25,
     "迟滞": 0.25,
     "心乱": 0.25
    }
   },
   "mech": {
    "type": "dodge_counter_atk",
    "value": 0.15,
    "once": "每回合一次"
   }
  },
  "eq_iron_scale": {
   "name": "铁鳞软甲",
   "grade": "甲",
   "q": 3,
   "type": "重",
   "armor": 20,
   "fx": {
    "spd": -1,
    "block": 8
   },
   "desc": "甲级重装。细小铁鳞片层层缀在熟皮衬底上的软甲，肩部加厚，鳞片暗沉有磨痕。防御 +20。援护替同伴承伤时，所受伤害再 −15%。眩晕、内伤、流血抗性 +25%。",
   "price": 600,
   "req": {
    "con": 9
   },
   "mods": {
    "status_resist": {
     "眩晕": 0.25,
     "内伤": 0.25,
     "流血": 0.25
    }
   },
   "mech": {
    "type": "guard_reduce",
    "value": 0.15
   }
  },
  "eq_herb_weave": {
   "name": "百草织袍",
   "grade": "甲",
   "q": 3,
   "type": "医",
   "armor": 10,
   "fx": {
    "mmp": 24
   },
   "desc": "甲级医装。素白长袍，内衬织入淡青草药纹，襟边缝着几个小药袋，袖口宽大。防御 +10。治疗量 +12%。中毒、流血、心乱抗性 +25%。",
   "price": 600,
   "req": {
    "wis": 9
   },
   "mods": {
    "status_resist": {
     "中毒": 0.25,
     "流血": 0.25,
     "心乱": 0.25
    },
    "heal": 0.05
   },
   "mech": {
    "type": "heal",
    "value": 0.12
   }
  }
 },
 "accs": {
  "eq_plain_knot": {
   "name": "同道结",
   "grade": "丁",
   "q": 0,
   "cls": "战斗",
   "fx": {
    "mhp": 15
   },
   "affix": {},
   "desc": "丁级战斗类佩饰。一个粗麻双环结、一粒旧木珠、短尾自然纤维。气血上限 +15。",
   "price": 30,
   "mods": {}
  },
  "eq_needle_tag": {
   "name": "分针铜牌",
   "grade": "丙",
   "q": 1,
   "cls": "战斗",
   "fx": {},
   "affix": {
    "crit_route": [
     "暗器",
     4
    ]
   },
   "desc": "丙级战斗类佩饰。一块泛着暖黄铜光的窄长铜牌，牌面嵌着三根细长银针（针尾露出牌外），三道凹槽刻在银针旁，顶孔穿药青色丝绳；金属质感明显，与木牌截然不同。暗器招式暴击 +4%。施加封穴基础率 +8%。",
   "price": 100,
   "mods": {
    "status_chance": {
     "封穴": 0.08
    }
   }
  },
  "eq_cloud_tassel": {
   "name": "回岚剑穗",
   "grade": "乙",
   "q": 2,
   "cls": "战斗",
   "fx": {},
   "affix": {
    "mp_after_token": [
     "剑",
     2
    ]
   },
   "desc": "乙级战斗类佩饰。竹青双色短穗、断云式木珠、两股不同长短编绳。消耗守势后的下一次剑招内力 −2。风劲招式伤害 +6%。",
   "price": 260,
   "mods": {
    "element_bonus": {
     "风": 0.06
    }
   }
  },
  "eq_guard_buckle": {
   "name": "承岳扣",
   "grade": "乙",
   "q": 2,
   "cls": "战斗",
   "fx": {
    "spd": -1
   },
   "affix": {
    "guard_reduce": 0.1
   },
   "desc": "乙级战斗类佩饰。厚铁横梁扣、双绳孔、赭红短织带与细铜铆点。援护承伤再 −10%；身速 -1。内伤抗性 +20%。",
   "price": 260,
   "mods": {
    "status_resist": {
     "内伤": 0.2
    }
   }
  },
  "eq_route_knot": {
   "name": "松径结",
   "grade": "乙",
   "q": 2,
   "cls": "战斗",
   "fx": {},
   "affix": {
    "first_round_spd": 1
   },
   "desc": "乙级战斗类佩饰。松褐木片与灰绿交错结，边缘三条不同刻槽。第一回合身速 +1。风劲招式伤害 +4%；迟滞抗性 +30%。",
   "price": 260,
   "mods": {
    "status_resist": {
     "迟滞": 0.3
    },
    "element_bonus": {
     "风": 0.04
    }
   }
  },
  "eq_case_tag": {
   "name": "行旅凭牌",
   "grade": "丙",
   "q": 1,
   "cls": "战斗",
   "fx": {
    "def": 3
   },
   "affix": {},
   "desc": "丙级战斗类佩饰。素木窄牌挂于深蓝布绳，简短水纹刻线，无官阶补子。防御 +3。封穴抗性 +15%。",
   "price": 100,
   "mods": {
    "status_resist": {
     "封穴": 0.15
    }
   }
  },
  "eq_lamp_pendant": {
   "name": "留灯坠",
   "grade": "乙",
   "q": 2,
   "cls": "战斗",
   "fx": {},
   "affix": {
    "unload_first": 0.1
   },
   "desc": "乙级战斗类佩饰。莲粉小陶坠、白绳双结、暖金包口，轮廓细长如灯芯。每回合首次给同伴卸力时额外 +10%。心乱抗性 +20%。",
   "price": 260,
   "mods": {
    "status_resist": {
     "心乱": 0.2
    }
   }
  },
  "eq_kept_word": {
   "name": "践约环",
   "grade": "甲",
   "q": 3,
   "cls": "战斗",
   "fx": {},
   "affix": {
    "mp_after_guard": 6
   },
   "desc": "甲级战斗类佩饰。旧金开口环、内嵌绛青线、两端不等宽合页结构。首次护卫后回复 6 内力（每战一次）。阳劲招式伤害 +6%；惊惧抗性 +30%。",
   "price": 650,
   "mods": {
    "status_resist": {
     "惊惧": 0.3
    },
    "element_bonus": {
     "阳": 0.06
    }
   }
  },
  "eq_home_token": {
   "name": "归途佩",
   "grade": "绝",
   "q": 4,
   "cls": "战斗",
   "fx": {},
   "affix": {
    "last_stand_unload": 0.4
   },
   "desc": "绝级战斗类佩饰。青白双材质山口形佩、暗金细包边、不同工匠刻痕和短朱绳；无传送法阵。首次濒危时自动卸力 40%（每战一次）（独有）。我方封穴、目眩、心乱、惊惧持续 −1（最少 1）。",
   "price": 0,
   "mods": {
    "status_duration_minus": {
     "封穴": 1,
     "目眩": 1,
     "心乱": 1,
     "惊惧": 1
    }
   },
   "unsellable": 1
  },
  "eq_tiger_claw": {
   "name": "虎爪坠",
   "grade": "丙",
   "q": 1,
   "cls": "战斗",
   "fx": {
    "str": 1,
    "crit": 3
   },
   "affix": {},
   "desc": "丙级战斗类佩饰。一枚老虎爪牙用红绳穿起的挂坠，爪尖磨得光滑。臂力 +1；暴击 +3%。",
   "price": 100,
   "mods": {}
  },
  "eq_sandal_beads": {
   "name": "檀木手串",
   "grade": "丙",
   "q": 1,
   "cls": "战斗",
   "fx": {
    "wil": 1,
    "mmp": 8
   },
   "affix": {},
   "desc": "丙级战斗类佩饰。十八颗深褐檀木珠串成的手串，珠面有细细木纹，系一枚小结。定力 +1；内力上限 +8。",
   "price": 100,
   "mods": {}
  },
  "eq_jade_thumb": {
   "name": "青玉扳指",
   "grade": "乙",
   "q": 2,
   "cls": "战斗",
   "fx": {
    "crit": 4
   },
   "affix": {
    "weak_dmg": 0.05
   },
   "desc": "乙级战斗类佩饰。一枚青白玉扳指，表面光润，内侧有拉弦磨出的浅痕。暴击 +4%；命中弱点时伤害 +5%。",
   "price": 260,
   "mods": {}
  },
  "eq_swallow_pin": {
   "name": "飞燕银簪",
   "grade": "乙",
   "q": 2,
   "cls": "战斗",
   "fx": {
    "dodge": 4,
    "spd": 1
   },
   "affix": {},
   "desc": "乙级战斗类佩饰。一支银簪，簪头錾成燕尾分叉的形状，缀一颗小珍珠。闪避 +4%；身速 +1。",
   "price": 260,
   "mods": {}
  },
  "eq_iron_cash": {
   "name": "铁钱串",
   "grade": "乙",
   "q": 2,
   "cls": "战斗",
   "fx": {
    "mhp": 25
   },
   "affix": {},
   "desc": "乙级战斗类佩饰。十几枚旧铁钱用粗麻绳串成一串，钱面锈迹斑驳。气血上限 +25。内伤抗性 +20%。",
   "price": 260,
   "mods": {
    "status_resist": {
     "内伤": 0.2
    }
   }
  },
  "eq_gilt_waist_tag": {
   "name": "鎏金腰牌",
   "grade": "甲",
   "q": 3,
   "cls": "战斗",
   "fx": {},
   "affix": {
    "start_bp": 1
   },
   "desc": "甲级战斗类佩饰。一块长方形鎏金铜腰牌，边框錾卷云纹，中间素面无字，挂黑色丝绦。开战时蓄势 +1。惊惧抗性 +25%。",
   "price": 650,
   "mods": {
    "status_resist": {
     "惊惧": 0.25
    }
   }
  },
  "eq_crane_jade": {
   "name": "鹤衔玉佩",
   "grade": "甲",
   "q": 3,
   "cls": "战斗",
   "fx": {
    "wis": 2,
    "mmp": 18
   },
   "affix": {
    "heal": 0.1
   },
   "desc": "甲级战斗类佩饰。一块白玉佩，雕一只仙鹤口衔灵芝，鹤颈修长，挂浅青丝穗。悟性 +2；治疗量 +10%；内力上限 +18。",
   "price": 650,
   "mods": {}
  },
  "eq_bell_rope": {
   "name": "朱绳铜铃",
   "grade": "甲",
   "q": 3,
   "cls": "战斗",
   "fx": {
    "crit": 5
   },
   "affix": {
    "break_dmg": 0.15
   },
   "desc": "甲级战斗类佩饰。一枚古铜小铃系在朱红编绳上，铃身有回纹，铃舌是一粒铜丸。对破势中的目标伤害 +15%；暴击 +5%。",
   "price": 650,
   "mods": {}
  },
  "eq_ink_seal": {
   "name": "墨玉印坠",
   "grade": "甲",
   "q": 3,
   "cls": "战斗",
   "fx": {},
   "affix": {
    "elite_dmg": 0.1
   },
   "desc": "甲级战斗类佩饰。一方小小的墨玉印章做成的挂坠，印钮雕成伏兽，印面素平，系深蓝绳。对精英与首领伤害 +10%。封穴抗性 +25%。",
   "price": 650,
   "mods": {
    "status_resist": {
     "封穴": 0.25
    }
   }
  },
  "eq_dragonfly_pin": {
   "name": "蜻蜓翠簪",
   "grade": "甲",
   "q": 3,
   "cls": "战斗",
   "fx": {
    "dodge": 5
   },
   "affix": {
    "regen_mp": 0.03
   },
   "desc": "甲级战斗类佩饰。一支金簪，簪头是一只点翠蜻蜓，翅膀翠蓝，细足轻搭在簪杆上。闪避 +5%；每回合开始回复 3% 内力。",
   "price": 650,
   "mods": {}
  },
  "eq_heart_mirror": {
   "name": "护心镜坠",
   "grade": "绝",
   "q": 4,
   "cls": "战斗",
   "fx": {
    "mhp": 40
   },
   "affix": {
    "last_stand": 0.15,
    "resist_all": 0.1
   },
   "desc": "绝级战斗类佩饰。一面巴掌大的古铜护心镜做成的挂坠，镜背铸着云雷纹，镜面幽光，挂粗皮绳。首次致命伤时以 1 点气血撑住并回复 15%（每战一次）（独有）；全部异常抗性 +10%；气血上限 +40。",
   "price": 0,
   "mods": {},
   "unsellable": 1
  },
  "eq_wind_pearl": {
   "name": "惊鸿青珠",
   "grade": "绝",
   "q": 4,
   "cls": "战斗",
   "fx": {
    "spd": 1
   },
   "affix": {
    "first_act": 1
   },
   "desc": "绝级战斗类佩饰。一颗鸽蛋大小的半透明青珠，珠内有一缕旋状絮纹，嵌在银托里，挂青丝绦。身速 +1；第一回合必定先手（独有）。迟滞、眩晕抗性 +30%。",
   "price": 0,
   "mods": {
    "status_resist": {
     "迟滞": 0.3,
     "眩晕": 0.3
    }
   },
   "unsellable": 1
  },
  "eq_suet_ring": {
   "name": "羊脂玉环",
   "grade": "绝",
   "q": 4,
   "cls": "战斗",
   "fx": {
    "con": 3
   },
   "affix": {
    "regen_hp": 0.03,
    "heal_recv": 0.15
   },
   "desc": "绝级战斗类佩饰。一只温润的羊脂白玉环，环面光洁无纹，一侧系着淡金色丝绳。根骨 +3；每回合开始回复 3% 气血；受到的治疗 +15%。",
   "price": 0,
   "mods": {},
   "unsellable": 1
  },
  "eq_ward_coin": {
   "name": "厌胜钱",
   "grade": "丁",
   "q": 0,
   "cls": "功能",
   "fx": {},
   "affix": {
    "silver_pct": 0.1
   },
   "desc": "丁级功能类佩饰。一枚铜质厌胜钱，钱面铸吉祥纹样，穿红绳打着如意结。银两获得 +10%。",
   "price": 30,
   "mods": {}
  },
  "eq_herb_pouch": {
   "name": "药香荷包",
   "grade": "丙",
   "q": 1,
   "cls": "功能",
   "fx": {},
   "affix": {
    "item_heal_pct": 0.3
   },
   "desc": "丙级功能类佩饰。一个青布绣花荷包，口用抽绳收紧，散出淡淡药香，绣一枝艾草。食物、药物恢复量 +30%。",
   "price": 100,
   "mods": {}
  },
  "eq_wine_gourd": {
   "name": "小酒葫芦",
   "grade": "丙",
   "q": 1,
   "cls": "功能",
   "fx": {},
   "affix": {
    "wine_pct": 0.5
   },
   "desc": "丙级功能类佩饰。一只巴掌大的小葫芦，漆成朱红，腰间系绳，塞着软木塞。酒类内力回复 +50%（独有）。",
   "price": 100,
   "mods": {}
  },
  "eq_walker_knot": {
   "name": "行脚结",
   "grade": "丙",
   "q": 1,
   "cls": "功能",
   "fx": {},
   "affix": {
    "walk_pct": 0.1
   },
   "desc": "丙级功能类佩饰。用草绳和布条编成的行脚人平安结，坠一枚小小的草鞋形木片。地图行走速度 +10%。",
   "price": 100,
   "mods": {}
  },
  "eq_abacus_pendant": {
   "name": "算盘坠",
   "grade": "乙",
   "q": 2,
   "cls": "功能",
   "fx": {},
   "affix": {
    "shop_disc": 0.08,
    "silver_pct": 0.1
   },
   "desc": "乙级功能类佩饰。一把拇指长的微型铜算盘挂坠，算珠可拨动，挂褐色丝绳。商店购买价 −8%；银两获得 +10%。",
   "price": 260,
   "mods": {}
  },
  "eq_lucky_knot": {
   "name": "吉祥结",
   "grade": "乙",
   "q": 2,
   "cls": "功能",
   "fx": {},
   "affix": {
    "drop_pct": 0.25
   },
   "desc": "乙级功能类佩饰。一个大红丝线编成的吉祥结，结下垂着长长的流苏，中间嵌一枚小铜钱。福源：掉落率 +25%。",
   "price": 260,
   "mods": {}
  },
  "eq_brush_pendant": {
   "name": "笔管坠",
   "grade": "乙",
   "q": 2,
   "cls": "功能",
   "fx": {},
   "affix": {
    "xinfa_pct": 0.15
   },
   "desc": "乙级功能类佩饰。一截斑竹笔管做成的挂坠，笔管里塞着一卷小纸，两端包铜。心法修炼进度 +15%。",
   "price": 260,
   "mods": {}
  },
  "eq_fang_charm": {
   "name": "犬牙坠",
   "grade": "乙",
   "q": 2,
   "cls": "功能",
   "fx": {},
   "affix": {
    "pet_atk": 0.15,
    "aff_pct": 0.1
   },
   "desc": "乙级功能类佩饰。一枚狗牙用皮绳穿起，牙根缠着几圈红线，旁边挂一枚小铜铃。同行的大黄攻击 +15%（独有）；好感获得 +10%。",
   "price": 260,
   "mods": {}
  },
  "eq_jade_cicada": {
   "name": "玉蝉",
   "grade": "甲",
   "q": 3,
   "cls": "功能",
   "fx": {},
   "affix": {
    "prof_pct": 0.1,
    "exp_pct": 0.08
   },
   "desc": "甲级功能类佩饰。一枚青白玉雕的蝉，蝉翼刻得极薄，背上穿孔系绿丝绳。熟练成长 +10%；修为获得 +8%。",
   "price": 650,
   "mods": {}
  },
  "eq_fortune_coin": {
   "name": "福寿钱",
   "grade": "甲",
   "q": 3,
   "cls": "功能",
   "fx": {},
   "affix": {
    "drop_pct": 0.35,
    "pickup": 0.1
   },
   "desc": "甲级功能类佩饰。一枚大铜钱，钱面铸着福寿吉祥的篆纹，系金黄丝穗。福源：掉落率 +35%；战后 10% 概率另拾得一件药食。",
   "price": 650,
   "mods": {}
  },
  "eq_compass_pendant": {
   "name": "指南鱼坠",
   "grade": "甲",
   "q": 3,
   "cls": "功能",
   "fx": {},
   "affix": {
    "walk_pct": 0.15,
    "post_heal": 0.08
   },
   "desc": "甲级功能类佩饰。一条薄铁片剪成的小鱼形指南鱼，鱼头微翘，嵌在一只小木盒里，盒盖半开。地图行走速度 +15%；战后回复 8% 气血与内力。",
   "price": 650,
   "mods": {}
  },
  "eq_ledger_tag": {
   "name": "行商牙牌",
   "grade": "甲",
   "q": 3,
   "cls": "功能",
   "fx": {},
   "affix": {
    "shop_disc": 0.12,
    "silver_pct": 0.15
   },
   "desc": "甲级功能类佩饰。一块象牙色长方牙牌，边角磨圆，刻着细细的账格纹，挂黑丝绳。商店购买价 −12%；银两获得 +15%。",
   "price": 650,
   "mods": {}
  },
  "eq_peach_sword": {
   "name": "桃木剑坠",
   "grade": "绝",
   "q": 4,
   "cls": "功能",
   "fx": {},
   "affix": {
    "no_silver_loss": 1,
    "drop_pct": 0.5,
    "pickup": 0.15
   },
   "desc": "绝级功能类佩饰。一柄三寸长的小桃木剑挂坠，剑身刻七星纹，剑柄缠红线，挂红穗。战败时不损失银两（独有）；福源：掉落率 +50%；战后 15% 概率另拾得一件药食。",
   "price": 0,
   "mods": {},
   "unsellable": 1
  },
  "eq_longevity_lock": {
   "name": "长命金锁",
   "grade": "绝",
   "q": 4,
   "cls": "功能",
   "fx": {},
   "affix": {
    "exp_pct": 0.15,
    "prof_pct": 0.12,
    "aff_pct": 0.2
   },
   "desc": "绝级功能类佩饰。一把小巧的金锁，锁身錾如意云纹与莲花，下缀三枚小铃铛，挂红绳。修为获得 +15%；熟练成长 +12%；好感获得 +20%。",
   "price": 0,
   "mods": {},
   "unsellable": 1
  },
  "eq_scholar_seal": {
   "name": "书院闲章",
   "grade": "绝",
   "q": 4,
   "cls": "功能",
   "fx": {
    "wis": 1
   },
   "affix": {
    "xinfa_pct": 0.25,
    "prof_pct": 0.1
   },
   "desc": "绝级功能类佩饰。一方青田石闲章，章钮雕一卷书和一枝梅，印面朝下，系一截旧丝绳。心法修炼进度 +25%；熟练成长 +10%；悟性 +1。",
   "price": 0,
   "mods": {},
   "unsellable": 1
  }
 }
};
