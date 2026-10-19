/* 由 tools_docs/build_martial_lineage_v3.py 生成，勿手改。门派功法传承 v3。 */
window.MartialExternalArts=[
 {
  "id": "system_gy_foundation_s",
  "name": "试锋剑法",
  "grade": "丁",
  "tier": "入门",
  "group": "guiyun",
  "skillIds": [
   "gy_s1"
  ],
  "unlocks": {
   "gy_s1": 1
  },
  "mastery": {
   "moves": [
    "gy_s1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "辨距离、练试锋与回收，归云剑路的基本功。",
  "path": "剑",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_gy_s2",
  "name": "拨云剑法",
  "grade": "丙",
  "tier": "进阶",
  "group": "guiyun",
  "skillIds": [
   "gy_s2"
  ],
  "unlocks": {
   "gy_s2": 1
  },
  "mastery": {
   "moves": [
    "gy_s2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "以两段轻剑拨开对手架势，练试探与削盾。",
  "path": "剑",
  "learnReq": {
   "agi": 6
  },
  "prereq": {
   "art_id": "system_gy_foundation_s",
   "level": 3
  }
 },
 {
  "id": "art_gy_s3",
  "name": "开晴剑法",
  "grade": "乙",
  "tier": "专精",
  "group": "guiyun",
  "skillIds": [
   "gy_s3"
  ],
  "unlocks": {
   "gy_s3": 1
  },
  "mastery": {
   "moves": [
    "gy_s3"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "先守后攻，把防御中看到的空隙化成一击。",
  "path": "剑",
  "learnReq": {
   "agi": 9,
   "wis": 6
  },
  "prereq": {
   "art_id": "art_gy_s2",
   "level": 5
  }
 },
 {
  "id": "system_gy_s",
  "name": "归云剑诀",
  "grade": "甲",
  "tier": "上乘",
  "group": "guiyun",
  "skillIds": [
   "gy_s4",
   "gy_s4b"
  ],
  "unlocks": {
   "gy_s4": 1,
   "gy_s4b": 5
  },
  "mastery": {
   "moves": [
    "gy_s4",
    "gy_s4b"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "收势观敌，守势转攻；高阶集中剑势，不靠多段数量证明造诣。",
  "path": "剑",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_gy_s3",
   "level": 7
  }
 },
 {
  "id": "art_gy_s_jue",
  "name": "云开见山剑",
  "grade": "绝",
  "tier": "镇派",
  "group": "guiyun",
  "skillIds": [
   "gy_s5a",
   "gy_s5b",
   "gy_s5"
  ],
  "unlocks": {
   "gy_s5a": 1,
   "gy_s5b": 5,
   "gy_s5": 7
  },
  "mastery": {
   "moves": [
    "gy_s5a",
    "gy_s5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "先辨虚实再见根本，以守势换取决断。",
  "path": "剑",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": {
   "art_id": "system_gy_s",
   "level": 7
  }
 },
 {
  "id": "system_gy_foundation_p",
  "name": "守拙拳法",
  "grade": "丁",
  "tier": "入门",
  "group": "guiyun",
  "skillIds": [
   "gy_p1"
  ],
  "unlocks": {
   "gy_p1": 1
  },
  "mastery": {
   "moves": [
    "gy_p1"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "稳架、出手、收势与重心转换，可空手施展。",
  "path": "拳掌",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_gy_p2",
  "name": "回岚身法",
  "grade": "丙",
  "tier": "进阶",
  "group": "guiyun",
  "skillIds": [
   "gy_p2"
  ],
  "unlocks": {
   "gy_p2": 1
  },
  "mastery": {
   "moves": [
    "gy_p2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "错身卸力的步法，剑、拳两路都能辅助。",
  "path": "拳掌",
  "learnReq": {
   "str": 6
  },
  "prereq": {
   "art_id": "system_gy_foundation_p",
   "level": 3
  }
 },
 {
  "id": "art_gy_p3",
  "name": "叠岚掌法",
  "grade": "乙",
  "tier": "专精",
  "group": "guiyun",
  "skillIds": [
   "gy_p3"
  ],
  "unlocks": {
   "gy_p3": 1
  },
  "mastery": {
   "moves": [
    "gy_p3"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "护人承伤后叠劲还击。",
  "path": "拳掌",
  "learnReq": {
   "str": 9,
   "con": 6
  },
  "prereq": {
   "art_id": "art_gy_p2",
   "level": 5
  }
 },
 {
  "id": "system_gy_p",
  "name": "归云拳掌法",
  "grade": "甲",
  "tier": "上乘",
  "group": "guiyun",
  "skillIds": [
   "gy_p4",
   "gy_p4b"
  ],
  "unlocks": {
   "gy_p4": 1,
   "gy_p4b": 5
  },
  "mastery": {
   "moves": [
    "gy_p4",
    "gy_p4b"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "站稳、卸力、叠劲与承伤后还击相贯。",
  "path": "拳掌",
  "learnReq": {
   "str": 12,
   "con": 9
  },
  "prereq": {
   "art_id": "art_gy_p3",
   "level": 7
  }
 },
 {
  "id": "art_gy_p_jue",
  "name": "万壑掌",
  "grade": "绝",
  "tier": "镇派",
  "group": "guiyun",
  "skillIds": [
   "gy_p5a",
   "gy_p5b",
   "gy_p5"
  ],
  "unlocks": {
   "gy_p5a": 1,
   "gy_p5b": 5,
   "gy_p5": 7
  },
  "mastery": {
   "moves": [
    "gy_p5a",
    "gy_p5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "一声入壑，群山相应；先承住群敌来势，再一并震回。",
  "path": "拳掌",
  "learnReq": {
   "str": 15,
   "con": 12,
   "wil": 10
  },
  "prereq": {
   "art_id": "system_gy_p",
   "level": 7
  }
 },
 {
  "id": "art_bh_s0",
  "name": "止血术",
  "grade": "丁",
  "tier": "入门",
  "group": "white-heron",
  "skillIds": [
   "bh_s0"
  ],
  "unlocks": {
   "bh_s0": 1
  },
  "mastery": {
   "moves": [
    "bh_s0"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "辨伤、止血与包扎，白鹇谷人人先学的急救。",
  "path": "医",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_bh_s1",
  "name": "金针刺穴法",
  "grade": "丙",
  "tier": "进阶",
  "group": "white-heron",
  "skillIds": [
   "bh_s1"
  ],
  "unlocks": {
   "bh_s1": 1
  },
  "mastery": {
   "moves": [
    "bh_s1"
   ],
   "effect": {
    "reveal": 1
   },
   "text": "本功法招式出手时看破 1 处"
  },
  "principle": "辨穴下针，以针探出对手破绽。",
  "path": "针",
  "learnReq": {
   "agi": 6
  },
  "prereq": {
   "art_id": "art_bh_s0",
   "level": 3
  }
 },
 {
  "id": "art_bh_s2",
  "name": "回春散方",
  "grade": "丙",
  "tier": "进阶",
  "group": "white-heron",
  "skillIds": [
   "bh_s2"
  ],
  "unlocks": {
   "bh_s2": 1
  },
  "mastery": {
   "moves": [
    "bh_s2"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "依证配散，急救单人。",
  "path": "药",
  "learnReq": {
   "wis": 6
  },
  "prereq": {
   "art_id": "art_bh_s0",
   "level": 3
  }
 },
 {
  "id": "art_bh_s3",
  "name": "净脉针法",
  "grade": "乙",
  "tier": "专精",
  "group": "white-heron",
  "skillIds": [
   "bh_s3"
  ],
  "unlocks": {
   "bh_s3": 1
  },
  "mastery": {
   "moves": [
    "bh_s3"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "以针导药，治疗同时清除一项异常。",
  "path": "医",
  "learnReq": {
   "wis": 9,
   "wil": 6
  },
  "prereq": {
   "any_of": [
    "art_bh_s1",
    "art_bh_s2"
   ],
   "level": 5
  }
 },
 {
  "id": "art_bh_jia",
  "name": "百草回生术",
  "grade": "甲",
  "tier": "上乘",
  "group": "white-heron",
  "skillIds": [
   "bh_s4",
   "bh_s4b"
  ],
  "unlocks": {
   "bh_s4": 1,
   "bh_s4b": 5
  },
  "mastery": {
   "moves": [
    "bh_s4",
    "bh_s4b"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "汇集药性接续生机，救活着的人，不能起死回生。",
  "path": "医",
  "learnReq": {
   "wis": 12,
   "wil": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_bh_s3",
   "level": 7
  }
 },
 {
  "id": "art_bh_jue",
  "name": "相续针诀",
  "grade": "绝",
  "tier": "镇派",
  "group": "white-heron",
  "skillIds": [
   "bh_s5a",
   "bh_s5b",
   "bh_s5"
  ],
  "unlocks": {
   "bh_s5a": 1,
   "bh_s5b": 5,
   "bh_s5": 7
  },
  "mastery": {
   "moves": [
    "bh_s5a",
    "bh_s5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "一息尚存便有转机，保住最后一息等待后援。",
  "path": "医",
  "learnReq": {
   "wis": 15,
   "wil": 12,
   "con": 11
  },
  "prereq": {
   "art_id": "art_bh_jia",
   "level": 7
  }
 },
 {
  "id": "art_zc_s1",
  "name": "照水剑法",
  "grade": "丁",
  "tier": "入门",
  "group": "zhaochuan",
  "skillIds": [
   "zc_s1"
  ],
  "unlocks": {
   "zc_s1": 1
  },
  "mastery": {
   "moves": [
    "zc_s1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "以剑映水般先试其形，低费起手。",
  "path": "剑",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_zc_s2",
  "name": "折光剑法",
  "grade": "丙",
  "tier": "进阶",
  "group": "zhaochuan",
  "skillIds": [
   "zc_s2"
  ],
  "unlocks": {
   "zc_s2": 1
  },
  "mastery": {
   "moves": [
    "zc_s2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "三段折锋，段均轻而拆防稳。",
  "path": "剑",
  "learnReq": {
   "agi": 6
  },
  "prereq": {
   "art_id": "art_zc_s1",
   "level": 3
  }
 },
 {
  "id": "art_zc_s3",
  "name": "问隙剑法",
  "grade": "乙",
  "tier": "专精",
  "group": "zhaochuan",
  "skillIds": [
   "zc_s3"
  ],
  "unlocks": {
   "zc_s3": 1
  },
  "mastery": {
   "moves": [
    "zc_s3"
   ],
   "effect": {
    "reveal": 1
   },
   "text": "本功法招式出手时看破 1 处"
  },
  "principle": "先问破绽，再对已看破之处加力。",
  "path": "剑",
  "learnReq": {
   "agi": 9,
   "wis": 6
  },
  "prereq": {
   "art_id": "art_zc_s2",
   "level": 5
  }
 },
 {
  "id": "art_zc_jia",
  "name": "照川剑法",
  "grade": "甲",
  "tier": "上乘",
  "group": "zhaochuan",
  "skillIds": [
   "zc_s4",
   "zc_s4b"
  ],
  "unlocks": {
   "zc_s4": 1,
   "zc_s4b": 5
  },
  "mastery": {
   "moves": [
    "zc_s4",
    "zc_s4b"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "落击先破架，守中留反击。",
  "path": "剑",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_zc_s3",
   "level": 7
  }
 },
 {
  "id": "art_zc_jue",
  "name": "澄江剑",
  "grade": "绝",
  "tier": "镇派",
  "group": "zhaochuan",
  "skillIds": [
   "zc_s5a",
   "zc_s5b",
   "zc_s5"
  ],
  "unlocks": {
   "zc_s5a": 1,
   "zc_s5b": 5,
   "zc_s5": 7
  },
  "mastery": {
   "moves": [
    "zc_s5a",
    "zc_s5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "水清而虚实可见，识破路数后以一剑收束。",
  "path": "剑",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": {
   "art_id": "art_zc_jia",
   "level": 7
  }
 },
 {
  "id": "art_hc_s1",
  "name": "落桩拳",
  "grade": "丁",
  "tier": "入门",
  "group": "hechuan",
  "skillIds": [
   "hc_s1"
  ],
  "unlocks": {
   "hc_s1": 1
  },
  "mastery": {
   "moves": [
    "hc_s1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "站桩出拳，稳定低费。",
  "path": "拳",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_hc_s2",
  "name": "横肩护人术",
  "grade": "丙",
  "tier": "进阶",
  "group": "hechuan",
  "skillIds": [
   "hc_s2"
  ],
  "unlocks": {
   "hc_s2": 1
  },
  "mastery": {
   "moves": [
    "hc_s2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "护运中练出的替人挡招。",
  "path": "拳",
  "learnReq": {
   "str": 6
  },
  "prereq": {
   "art_id": "art_hc_s1",
   "level": 3
  }
 },
 {
  "id": "art_hc_s3",
  "name": "崩石拳",
  "grade": "乙",
  "tier": "专精",
  "group": "hechuan",
  "skillIds": [
   "hc_s3"
  ],
  "unlocks": {
   "hc_s3": 1
  },
  "mastery": {
   "moves": [
    "hc_s3"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "短劲破架，命中拳弱点再削一层护盾。",
  "path": "拳",
  "learnReq": {
   "str": 9,
   "con": 6
  },
  "prereq": {
   "art_id": "art_hc_s2",
   "level": 5
  }
 },
 {
  "id": "art_hc_jia",
  "name": "合川拳法",
  "grade": "甲",
  "tier": "上乘",
  "group": "hechuan",
  "skillIds": [
   "hc_s4",
   "hc_s4b"
  ],
  "unlocks": {
   "hc_s4": 1,
   "hc_s4b": 5
  },
  "mastery": {
   "moves": [
    "hc_s4",
    "hc_s4b"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "众人合力撑山，稳架护众后重拳开闩。",
  "path": "拳",
  "learnReq": {
   "str": 12,
   "con": 9
  },
  "prereq": {
   "art_id": "art_hc_s3",
   "level": 7
  }
 },
 {
  "id": "art_hc_jue",
  "name": "震关拳",
  "grade": "绝",
  "tier": "镇派",
  "group": "hechuan",
  "skillIds": [
   "hc_s5a",
   "hc_s5b",
   "hc_s5"
  ],
  "unlocks": {
   "hc_s5a": 1,
   "hc_s5b": 5,
   "hc_s5": 7
  },
  "mastery": {
   "moves": [
    "hc_s5a",
    "hc_s5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "以短促合力制止敌人蓄势。",
  "path": "拳",
  "learnReq": {
   "str": 15,
   "con": 12,
   "wil": 10
  },
  "prereq": {
   "art_id": "art_hc_jia",
   "level": 7
  }
 },
 {
  "id": "art_sf_s1",
  "name": "松间步",
  "grade": "丁",
  "tier": "入门",
  "group": "songfeng",
  "skillIds": [
   "sf_s1"
  ],
  "unlocks": {
   "sf_s1": 1
  },
  "mastery": {
   "moves": [
    "sf_s1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "松间错步，自身卸力。",
  "path": "步",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_sf_s2",
  "name": "引枝剑",
  "grade": "丙",
  "tier": "进阶",
  "group": "songfeng",
  "skillIds": [
   "sf_s2"
  ],
  "unlocks": {
   "sf_s2": 1
  },
  "mastery": {
   "moves": [
    "sf_s2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "以剑引开来锋，为同伴卸力。",
  "path": "剑",
  "learnReq": {
   "agi": 6
  },
  "prereq": {
   "art_id": "art_sf_s1",
   "level": 3
  }
 },
 {
  "id": "art_sf_s3",
  "name": "三径相援法",
  "grade": "乙",
  "tier": "专精",
  "group": "songfeng",
  "skillIds": [
   "sf_s3"
  ],
  "unlocks": {
   "sf_s3": 1
  },
  "mastery": {
   "moves": [
    "sf_s3"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "三人相援，卸力并调整同伴行动先后。",
  "path": "剑",
  "learnReq": {
   "agi": 9,
   "wis": 6
  },
  "prereq": {
   "art_id": "art_sf_s2",
   "level": 5
  }
 },
 {
  "id": "art_sf_jia",
  "name": "松涛剑法",
  "grade": "甲",
  "tier": "上乘",
  "group": "songfeng",
  "skillIds": [
   "sf_s4",
   "sf_s4b"
  ],
  "unlocks": {
   "sf_s4": 1,
   "sf_s4b": 5
  },
  "mastery": {
   "moves": [
    "sf_s4",
    "sf_s4b"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "松涛由众枝同响，合阵须有人先守。",
  "path": "剑",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_sf_s3",
   "level": 7
  }
 },
 {
  "id": "art_sf_jue",
  "name": "万籁剑阵",
  "grade": "绝",
  "tier": "镇派",
  "group": "songfeng",
  "skillIds": [
   "sf_s5a",
   "sf_s5b",
   "sf_s5"
  ],
  "unlocks": {
   "sf_s5a": 1,
   "sf_s5b": 5,
   "sf_s5": 7
  },
  "mastery": {
   "moves": [
    "sf_s5a",
    "sf_s5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "万籁归于同一节拍，稳住队伍再接上行动。",
  "path": "剑",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": {
   "art_id": "art_sf_jia",
   "level": 7
  }
 },
 {
  "id": "art_gj_s1",
  "name": "藏锋刺",
  "grade": "丁",
  "tier": "入门",
  "group": "guijintang",
  "skillIds": [
   "gj_s1"
  ],
  "unlocks": {
   "gj_s1": 1
  },
  "mastery": {
   "moves": [
    "gj_s1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "贴身短刺，不等于暗器。",
  "path": "刀",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_gj_s2",
  "name": "燃隙刀",
  "grade": "丙",
  "tier": "进阶",
  "group": "guijintang",
  "skillIds": [
   "gj_s2"
  ],
  "unlocks": {
   "gj_s2": 1
  },
  "mastery": {
   "moves": [
    "gj_s2"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "以自身暴露换一记强击。",
  "path": "刀",
  "learnReq": {
   "str": 6
  },
  "prereq": {
   "art_id": "art_gj_s1",
   "level": 3
  }
 },
 {
  "id": "art_gj_s3",
  "name": "断烬身法",
  "grade": "乙",
  "tier": "专精",
  "group": "guijintang",
  "skillIds": [
   "gj_s3"
  ],
  "unlocks": {
   "gj_s3": 1
  },
  "mastery": {
   "moves": [
    "gj_s3"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "两段短刺后收身留路。",
  "path": "刀",
  "learnReq": {
   "str": 9,
   "agi": 6
  },
  "prereq": {
   "art_id": "art_gj_s2",
   "level": 5
  }
 },
 {
  "id": "art_gj_jia",
  "name": "焚契刀法",
  "grade": "甲",
  "tier": "上乘",
  "group": "guijintang",
  "skillIds": [
   "gj_s4",
   "gj_s4b"
  ],
  "unlocks": {
   "gj_s4": 1,
   "gj_s4b": 5
  },
  "mastery": {
   "moves": [
    "gj_s4",
    "gj_s4b"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "斩断旧约，付出暴露换取突围。",
  "path": "刀",
  "learnReq": {
   "str": 12,
   "agi": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_gj_s3",
   "level": 7
  }
 },
 {
  "id": "art_gj_jue",
  "name": "留生短兵诀",
  "grade": "绝",
  "tier": "镇派",
  "group": "guijintang",
  "skillIds": [
   "gj_s5a",
   "gj_s5b",
   "gj_s5"
  ],
  "unlocks": {
   "gj_s5a": 1,
   "gj_s5b": 5,
   "gj_s5": 7
  },
  "mastery": {
   "moves": [
    "gj_s5a",
    "gj_s5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "猛火之后还留生路，攻势未尽时先替同伴安排退路。",
  "path": "刀",
  "learnReq": {
   "str": 15,
   "agi": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": {
   "art_id": "art_gj_jia",
   "level": 7
  }
 },
 {
  "id": "art_pj_s1",
  "name": "横江棍法",
  "grade": "丁",
  "tier": "入门",
  "group": "patrol",
  "skillIds": [
   "pj_s1"
  ],
  "unlocks": {
   "pj_s1": 1
  },
  "mastery": {
   "moves": [
    "pj_s1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "长兵横拦，展示擒拿路数。",
  "path": "棍",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_pj_s2",
  "name": "回杆卸势",
  "grade": "丙",
  "tier": "进阶",
  "group": "patrol",
  "skillIds": [
   "pj_s2"
  ],
  "unlocks": {
   "pj_s2": 1
  },
  "mastery": {
   "moves": [
    "pj_s2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "回杆削弱对手下一击。",
  "path": "棍",
  "learnReq": {
   "str": 6
  },
  "prereq": {
   "art_id": "art_pj_s1",
   "level": 3
  }
 },
 {
  "id": "art_pj_s3",
  "name": "断渡擒法",
  "grade": "乙",
  "tier": "专精",
  "group": "patrol",
  "skillIds": [
   "pj_s3"
  ],
  "unlocks": {
   "pj_s3": 1
  },
  "mastery": {
   "moves": [
    "pj_s3"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "截断去路，把可延后的敌人压到最后。",
  "path": "棍",
  "learnReq": {
   "str": 9,
   "wil": 6
  },
  "prereq": {
   "art_id": "art_pj_s2",
   "level": 5
  }
 },
 {
  "id": "art_pj_jia",
  "name": "巡江擒护法",
  "grade": "甲",
  "tier": "上乘",
  "group": "patrol",
  "skillIds": [
   "pj_s4",
   "pj_s4b"
  ],
  "unlocks": {
   "pj_s4": 1,
   "pj_s4b": 5
  },
  "mastery": {
   "moves": [
    "pj_s4",
    "pj_s4b"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "风雨中护送归人，锁住来犯者。",
  "path": "棍",
  "learnReq": {
   "str": 12,
   "wil": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_pj_s3",
   "level": 7
  }
 },
 {
  "id": "art_hui_q1",
  "name": "勾挑指法",
  "grade": "丁",
  "tier": "入门",
  "group": "qinghui",
  "skillIds": [
   "hui_q1"
  ],
  "unlocks": {
   "hui_q1": 1
  },
  "mastery": {
   "moves": [
    "hui_q1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "勾、挑、抹、剔，先练准音位再谈音劲。",
  "path": "琴",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_hui_q2",
  "name": "商声琴法",
  "grade": "丙",
  "tier": "进阶",
  "group": "qinghui",
  "skillIds": [
   "hui_q2"
  ],
  "unlocks": {
   "hui_q2": 1
  },
  "mastery": {
   "moves": [
    "hui_q2"
   ],
   "effect": {
    "reveal": 1
   },
   "text": "本功法招式出手时看破 1 处"
  },
  "principle": "商音清冷，两声相叠扰人心神。",
  "path": "琴",
  "learnReq": {
   "wis": 6
  },
  "prereq": {
   "art_id": "art_hui_q1",
   "level": 3
  }
 },
 {
  "id": "art_hui_q3",
  "name": "静夜琴诀",
  "grade": "乙",
  "tier": "专精",
  "group": "qinghui",
  "skillIds": [
   "hui_q3"
  ],
  "unlocks": {
   "hui_q3": 1
  },
  "mastery": {
   "moves": [
    "hui_q3"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "以低音长韵沉入经脉，点封穴道。",
  "path": "琴",
  "learnReq": {
   "wis": 9,
   "wil": 6
  },
  "prereq": {
   "art_id": "art_hui_q2",
   "level": 5
  }
 },
 {
  "id": "art_hui_jia_q",
  "name": "清徽琴法",
  "grade": "甲",
  "tier": "上乘",
  "group": "qinghui",
  "skillIds": [
   "hui_q4a",
   "hui_q4b"
  ],
  "unlocks": {
   "hui_q4a": 1,
   "hui_q4b": 5
  },
  "mastery": {
   "moves": [
    "hui_q4a",
    "hui_q4b"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "清音有准：先安同伴心神，再断敌之心弦。",
  "path": "琴",
  "learnReq": {
   "wis": 12,
   "wil": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_hui_q3",
   "level": 7
  }
 },
 {
  "id": "art_hui_jue_q",
  "name": "太音希声",
  "grade": "绝",
  "tier": "镇派",
  "group": "qinghui",
  "skillIds": [
   "hui_q5a",
   "hui_q5b",
   "hui_q5"
  ],
  "unlocks": {
   "hui_q5a": 1,
   "hui_q5b": 5,
   "hui_q5": 7
  },
  "mastery": {
   "moves": [
    "hui_q5a",
    "hui_q5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "余音乱心，希声封穴：先以绕梁余音扰乱众敌心神，最强的一声几乎听不见，却封住众人穴道。",
  "path": "琴",
  "learnReq": {
   "wis": 15,
   "wil": 12,
   "con": 11
  },
  "prereq": {
   "art_id": "art_hui_jia_q",
   "level": 7
  }
 },
 {
  "id": "art_hui_d1",
  "name": "横笛调",
  "grade": "丁",
  "tier": "入门",
  "group": "qinghui",
  "skillIds": [
   "hui_d1"
  ],
  "unlocks": {
   "hui_d1": 1
  },
  "mastery": {
   "moves": [
    "hui_d1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "横笛吐纳与指孔，先求一声清啸。",
  "path": "笛",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_hui_d2",
  "name": "折柳笛法",
  "grade": "丙",
  "tier": "进阶",
  "group": "qinghui",
  "skillIds": [
   "hui_d2"
  ],
  "unlocks": {
   "hui_d2": 1
  },
  "mastery": {
   "moves": [
    "hui_d2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "折柳送别之曲，缠住对手脚步。",
  "path": "笛",
  "learnReq": {
   "wis": 6
  },
  "prereq": {
   "art_id": "art_hui_d1",
   "level": 3
  }
 },
 {
  "id": "art_hui_d3",
  "name": "梅落笛法",
  "grade": "乙",
  "tier": "专精",
  "group": "qinghui",
  "skillIds": [
   "hui_d3"
  ],
  "unlocks": {
   "hui_d3": 1
  },
  "mastery": {
   "moves": [
    "hui_d3"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "梅花落曲，笛声四散令众敌心惊。",
  "path": "笛",
  "learnReq": {
   "wis": 9,
   "wil": 6
  },
  "prereq": {
   "art_id": "art_hui_d2",
   "level": 5
  }
 },
 {
  "id": "art_hui_jia_d",
  "name": "关山笛诀",
  "grade": "甲",
  "tier": "上乘",
  "group": "qinghui",
  "skillIds": [
   "hui_d4a",
   "hui_d4b"
  ],
  "unlocks": {
   "hui_d4a": 1,
   "hui_d4b": 5
  },
  "mastery": {
   "moves": [
    "hui_d4a",
    "hui_d4b"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "关山月远：守城传讯的笛法，既能伤敌，也能催动同伴。",
  "path": "笛",
  "learnReq": {
   "wis": 12,
   "wil": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_hui_d3",
   "level": 7
  }
 },
 {
  "id": "art_hui_jue_d",
  "name": "裂石笛",
  "grade": "绝",
  "tier": "镇派",
  "group": "qinghui",
  "skillIds": [
   "hui_d5a",
   "hui_d5b",
   "hui_d5"
  ],
  "unlocks": {
   "hui_d5a": 1,
   "hui_d5b": 5,
   "hui_d5": 7
  },
  "mastery": {
   "moves": [
    "hui_d5a",
    "hui_d5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "响遏行云、声裂金石，一声令敌胆寒。",
  "path": "笛",
  "learnReq": {
   "wis": 15,
   "wil": 12,
   "con": 11
  },
  "prereq": {
   "art_id": "art_hui_jia_d",
   "level": 7
  }
 },
 {
  "id": "art_am_s1",
  "name": "短锋相照",
  "grade": "丙",
  "tier": "进阶",
  "group": "alliance",
  "skillIds": [
   "am_s1"
  ],
  "unlocks": {
   "am_s1": 1
  },
  "mastery": {
   "moves": [
    "am_s1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "公开护卫演练教的协同短剑。",
  "path": "剑",
  "learnReq": {
   "agi": 6
  },
  "prereq": null
 },
 {
  "id": "art_am_jia",
  "name": "明约协锋法",
  "grade": "甲",
  "tier": "上乘",
  "group": "alliance",
  "skillIds": [
   "am_s2",
   "am_s3"
  ],
  "unlocks": {
   "am_s2": 1,
   "am_s3": 5
  },
  "mastery": {
   "moves": [
    "am_s2",
    "am_s3"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "徐令仪师友所传，自己的出手为下一名同伴留出位置。",
  "path": "剑",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_am_s1",
   "level": 7
  }
 },
 {
  "id": "art_bh_d1",
  "name": "柳叶针法",
  "grade": "丁",
  "tier": "入门",
  "group": "white-heron",
  "skillIds": [
   "bh_d1"
  ],
  "unlocks": {
   "bh_d1": 1
  },
  "mastery": {
   "moves": [
    "bh_d1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "放血薄针的掷法，医者防身的第一课。",
  "path": "飞针",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_bh_d2",
  "name": "麻沸烟方",
  "grade": "丙",
  "tier": "进阶",
  "group": "white-heron",
  "skillIds": [
   "bh_d2"
  ],
  "unlocks": {
   "bh_d2": 1
  },
  "mastery": {
   "moves": [
    "bh_d2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "把外科麻药制成烟丸，制人而不取命。",
  "path": "飞针",
  "learnReq": {
   "agi": 6
  },
  "prereq": {
   "art_id": "art_bh_d1",
   "level": 3
  }
 },
 {
  "id": "art_bh_d3",
  "name": "透骨针法",
  "grade": "乙",
  "tier": "专精",
  "group": "white-heron",
  "skillIds": [
   "bh_d3"
  ],
  "unlocks": {
   "bh_d3": 1
  },
  "mastery": {
   "moves": [
    "bh_d3"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "三针分取阴经，药性分段发作。",
  "path": "飞针",
  "learnReq": {
   "agi": 9,
   "wis": 6
  },
  "prereq": {
   "art_id": "art_bh_d2",
   "level": 5
  }
 },
 {
  "id": "art_bh_d_jia",
  "name": "百草逆方",
  "grade": "甲",
  "tier": "上乘",
  "group": "white-heron",
  "skillIds": [
   "bh_d4a",
   "bh_d4b"
  ],
  "unlocks": {
   "bh_d4a": 1,
   "bh_d4b": 5
  },
  "mastery": {
   "moves": [
    "bh_d4a",
    "bh_d4b"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "药与毒只差分量：先下药，再以针引药。",
  "path": "飞针",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_bh_d3",
   "level": 7
  }
 },
 {
  "id": "art_bh_d_jue",
  "name": "寒潭锁脉针",
  "grade": "绝",
  "tier": "镇派",
  "group": "white-heron",
  "skillIds": [
   "bh_d5a",
   "bh_d5b",
   "bh_d5"
  ],
  "unlocks": {
   "bh_d5a": 1,
   "bh_d5b": 5,
   "bh_d5": 7
  },
  "mastery": {
   "moves": [
    "bh_d5a",
    "bh_d5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "知道哪里能救人，也就知道哪里能制人；锁脉而不断脉。",
  "path": "飞针",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": {
   "art_id": "art_bh_d_jia",
   "level": 7
  }
 },
 {
  "id": "art_zc_f1",
  "name": "袖光剑",
  "grade": "丁",
  "tier": "入门",
  "group": "zhaochuan",
  "skillIds": [
   "zc_f1"
  ],
  "unlocks": {
   "zc_f1": 1
  },
  "mastery": {
   "moves": [
    "zc_f1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "袖中短剑的脱手与回收，长剑之外的防身手段。",
  "path": "袖剑",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_zc_f2",
  "name": "分光袖剑",
  "grade": "丙",
  "tier": "进阶",
  "group": "zhaochuan",
  "skillIds": [
   "zc_f2"
  ],
  "unlocks": {
   "zc_f2": 1
  },
  "mastery": {
   "moves": [
    "zc_f2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "两柄袖剑一先一后，同落一处。",
  "path": "袖剑",
  "learnReq": {
   "agi": 6
  },
  "prereq": {
   "art_id": "art_zc_f1",
   "level": 3
  }
 },
 {
  "id": "art_zc_f3",
  "name": "寒星袖剑",
  "grade": "乙",
  "tier": "专精",
  "group": "zhaochuan",
  "skillIds": [
   "zc_f3"
  ],
  "unlocks": {
   "zc_f3": 1
  },
  "mastery": {
   "moves": [
    "zc_f3"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "数剑齐发，以水光乱目。",
  "path": "袖剑",
  "learnReq": {
   "agi": 9,
   "wis": 6
  },
  "prereq": {
   "art_id": "art_zc_f2",
   "level": 5
  }
 },
 {
  "id": "art_zc_f_jia",
  "name": "飞光剑诀",
  "grade": "甲",
  "tier": "上乘",
  "group": "zhaochuan",
  "skillIds": [
   "zc_f4a",
   "zc_f4b"
  ],
  "unlocks": {
   "zc_f4a": 1,
   "zc_f4b": 5
  },
  "mastery": {
   "moves": [
    "zc_f4a",
    "zc_f4b"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "先乱其目，再追着看破的那一点去。",
  "path": "袖剑",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_zc_f3",
   "level": 7
  }
 },
 {
  "id": "art_zc_f_jue",
  "name": "千江映月剑",
  "grade": "绝",
  "tier": "镇派",
  "group": "zhaochuan",
  "skillIds": [
   "zc_f5a",
   "zc_f5b",
   "zc_f5"
  ],
  "unlocks": {
   "zc_f5a": 1,
   "zc_f5b": 5,
   "zc_f5": 7
  },
  "mastery": {
   "moves": [
    "zc_f5a",
    "zc_f5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "一轮月照遍千江：每个敌人面前都有一柄剑。",
  "path": "袖剑",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": {
   "art_id": "art_zc_f_jia",
   "level": 7
  }
 },
 {
  "id": "art_hc_g1",
  "name": "挑担杠法",
  "grade": "丁",
  "tier": "入门",
  "group": "hechuan",
  "skillIds": [
   "hc_g1"
  ],
  "unlocks": {
   "hc_g1": 1
  },
  "mastery": {
   "moves": [
    "hc_g1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "脚夫起担、换肩的基本功。",
  "path": "杠棒",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_hc_g2",
  "name": "清道杠",
  "grade": "丙",
  "tier": "进阶",
  "group": "hechuan",
  "skillIds": [
   "hc_g2"
  ],
  "unlocks": {
   "hc_g2": 1
  },
  "mastery": {
   "moves": [
    "hc_g2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "横杠一推，替货队清出一条路。",
  "path": "杠棒",
  "learnReq": {
   "str": 6
  },
  "prereq": {
   "art_id": "art_hc_g1",
   "level": 3
  }
 },
 {
  "id": "art_hc_g3",
  "name": "拨火杠",
  "grade": "乙",
  "tier": "专精",
  "group": "hechuan",
  "skillIds": [
   "hc_g3"
  ],
  "unlocks": {
   "hc_g3": 1
  },
  "mastery": {
   "moves": [
    "hc_g3"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "拨火塘的铁杠，劲力闷在体内不散。",
  "path": "杠棒",
  "learnReq": {
   "str": 9,
   "wil": 6
  },
  "prereq": {
   "art_id": "art_hc_g2",
   "level": 5
  }
 },
 {
  "id": "art_hc_g_jia",
  "name": "千斤杠法",
  "grade": "甲",
  "tier": "上乘",
  "group": "hechuan",
  "skillIds": [
   "hc_g4a",
   "hc_g4b"
  ],
  "unlocks": {
   "hc_g4a": 1,
   "hc_g4b": 5
  },
  "mastery": {
   "moves": [
    "hc_g4a",
    "hc_g4b"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "找准缝隙撬开，再连环抡打。",
  "path": "杠棒",
  "learnReq": {
   "str": 12,
   "wil": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_hc_g3",
   "level": 7
  }
 },
 {
  "id": "art_hc_g_jue",
  "name": "镇河杠",
  "grade": "绝",
  "tier": "镇派",
  "group": "hechuan",
  "skillIds": [
   "hc_g5a",
   "hc_g5b",
   "hc_g5"
  ],
  "unlocks": {
   "hc_g5a": 1,
   "hc_g5b": 5,
   "hc_g5": 7
  },
  "mastery": {
   "moves": [
    "hc_g5a",
    "hc_g5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "先压住，再扫开，最后一杠定住全场。",
  "path": "杠棒",
  "learnReq": {
   "str": 15,
   "wil": 12,
   "con": 11
  },
  "prereq": {
   "art_id": "art_hc_g_jia",
   "level": 7
  }
 },
 {
  "id": "art_sf_f1",
  "name": "扫叶拂尘",
  "grade": "丁",
  "tier": "入门",
  "group": "songfeng",
  "skillIds": [
   "sf_f1"
  ],
  "unlocks": {
   "sf_f1": 1
  },
  "mastery": {
   "moves": [
    "sf_f1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "晨课后扫落叶的手势，一抖即收。",
  "path": "拂尘",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_sf_f2",
  "name": "松针拂",
  "grade": "丙",
  "tier": "进阶",
  "group": "songfeng",
  "skillIds": [
   "sf_f2"
  ],
  "unlocks": {
   "sf_f2": 1
  },
  "mastery": {
   "moves": [
    "sf_f2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "拂尘一振，尘丝如松针四散。",
  "path": "拂尘",
  "learnReq": {
   "agi": 6
  },
  "prereq": {
   "art_id": "art_sf_f1",
   "level": 3
  }
 },
 {
  "id": "art_sf_f3",
  "name": "缠枝拂",
  "grade": "乙",
  "tier": "专精",
  "group": "songfeng",
  "skillIds": [
   "sf_f3"
  ],
  "unlocks": {
   "sf_f3": 1
  },
  "mastery": {
   "moves": [
    "sf_f3"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "尘丝缠腕缠刃，拖慢对手。",
  "path": "拂尘",
  "learnReq": {
   "agi": 9,
   "wil": 6
  },
  "prereq": {
   "art_id": "art_sf_f2",
   "level": 5
  }
 },
 {
  "id": "art_sf_f_jia",
  "name": "松涛拂尘",
  "grade": "甲",
  "tier": "上乘",
  "group": "songfeng",
  "skillIds": [
   "sf_f4a",
   "sf_f4b"
  ],
  "unlocks": {
   "sf_f4a": 1,
   "sf_f4b": 5
  },
  "mastery": {
   "moves": [
    "sf_f4a",
    "sf_f4b"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "卷住来势送回去，再以雷声惊众。",
  "path": "拂尘",
  "learnReq": {
   "agi": 12,
   "wil": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_sf_f3",
   "level": 7
  }
 },
 {
  "id": "art_sf_f_jue",
  "name": "万壑松雷",
  "grade": "绝",
  "tier": "镇派",
  "group": "songfeng",
  "skillIds": [
   "sf_f5a",
   "sf_f5b",
   "sf_f5"
  ],
  "unlocks": {
   "sf_f5a": 1,
   "sf_f5b": 5,
   "sf_f5": 7
  },
  "mastery": {
   "moves": [
    "sf_f5a",
    "sf_f5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "风起于松，雷循丝而下。",
  "path": "拂尘",
  "learnReq": {
   "agi": 15,
   "wil": 12,
   "con": 11
  },
  "prereq": {
   "art_id": "art_sf_f_jia",
   "level": 7
  }
 },
 {
  "id": "art_gj_h1",
  "name": "扬灰手",
  "grade": "丁",
  "tier": "入门",
  "group": "guijintang",
  "skillIds": [
   "gj_h1"
  ],
  "unlocks": {
   "gj_h1": 1
  },
  "mastery": {
   "moves": [
    "gj_h1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "一把冷灰迷眼，堂众最先学会的脱身手段。",
  "path": "烬砂",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_gj_h2",
  "name": "火鸦镖法",
  "grade": "丙",
  "tier": "进阶",
  "group": "guijintang",
  "skillIds": [
   "gj_h2"
  ],
  "unlocks": {
   "gj_h2": 1
  },
  "mastery": {
   "moves": [
    "gj_h2"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "带火尾的短镖，专开血口。",
  "path": "烬砂",
  "learnReq": {
   "agi": 6
  },
  "prereq": {
   "art_id": "art_gj_h1",
   "level": 3
  }
 },
 {
  "id": "art_gj_h3",
  "name": "烬雨手",
  "grade": "乙",
  "tier": "专精",
  "group": "guijintang",
  "skillIds": [
   "gj_h3"
  ],
  "unlocks": {
   "gj_h3": 1
  },
  "mastery": {
   "moves": [
    "gj_h3"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "烧红的铁砂抛向半空，落成一场烬雨。",
  "path": "烬砂",
  "learnReq": {
   "agi": 9,
   "wis": 6
  },
  "prereq": {
   "art_id": "art_gj_h2",
   "level": 5
  }
 },
 {
  "id": "art_gj_h_jia",
  "name": "焚砂手",
  "grade": "甲",
  "tier": "上乘",
  "group": "guijintang",
  "skillIds": [
   "gj_h4a",
   "gj_h4b"
  ],
  "unlocks": {
   "gj_h4a": 1,
   "gj_h4b": 5
  },
  "mastery": {
   "moves": [
    "gj_h4a",
    "gj_h4b"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "引线两头都在烧：给对手留破绽，自己也站到明处。",
  "path": "烬砂",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_gj_h3",
   "level": 7
  }
 },
 {
  "id": "art_gj_h_jue",
  "name": "烬夜流火",
  "grade": "绝",
  "tier": "镇派",
  "group": "guijintang",
  "skillIds": [
   "gj_h5a",
   "gj_h5b",
   "gj_h5"
  ],
  "unlocks": {
   "gj_h5a": 1,
   "gj_h5b": 5,
   "gj_h5": 7
  },
  "mastery": {
   "moves": [
    "gj_h5a",
    "gj_h5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "先种下阴火，再催燃旧伤，最后放一场流火。",
  "path": "烬砂",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": {
   "art_id": "art_gj_h_jia",
   "level": 7
  }
 },
 {
  "id": "art_pj_d1",
  "name": "巡江腰刀",
  "grade": "丁",
  "tier": "入门",
  "group": "patrol",
  "skillIds": [
   "pj_d1"
  ],
  "unlocks": {
   "pj_d1": 1
  },
  "mastery": {
   "moves": [
    "pj_d1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "差役腰刀的出鞘、示警与回鞘。",
  "path": "刀",
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_pj_d2",
  "name": "截缆刀",
  "grade": "丙",
  "tier": "进阶",
  "group": "patrol",
  "skillIds": [
   "pj_d2"
  ],
  "unlocks": {
   "pj_d2": 1
  },
  "mastery": {
   "moves": [
    "pj_d2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "追船时截断缆绳的快刀。",
  "path": "刀",
  "learnReq": {
   "str": 6
  },
  "prereq": {
   "art_id": "art_pj_d1",
   "level": 3
  }
 },
 {
  "id": "art_pj_d3",
  "name": "断流刀",
  "grade": "乙",
  "tier": "专精",
  "group": "patrol",
  "skillIds": [
   "pj_d3"
  ],
  "unlocks": {
   "pj_d3": 1
  },
  "mastery": {
   "moves": [
    "pj_d3"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "追到力竭处，一刀最重。",
  "path": "刀",
  "learnReq": {
   "str": 9,
   "agi": 6
  },
  "prereq": {
   "art_id": "art_pj_d2",
   "level": 5
  }
 },
 {
  "id": "art_pj_d_jia",
  "name": "缉盗刀法",
  "grade": "甲",
  "tier": "上乘",
  "group": "patrol",
  "skillIds": [
   "pj_d4a",
   "pj_d4b"
  ],
  "unlocks": {
   "pj_d4a": 1,
   "pj_d4b": 5
  },
  "mastery": {
   "moves": [
    "pj_d4a",
    "pj_d4b"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "一刀封路、一刀拿人。",
  "path": "刀",
  "learnReq": {
   "str": 12,
   "agi": 9,
   "con": 8
  },
  "prereq": {
   "art_id": "art_pj_d3",
   "level": 7
  }
 },
 {
  "id": "art_pj_d_jue",
  "name": "镇澜刀",
  "grade": "绝",
  "tier": "镇派",
  "group": "patrol",
  "skillIds": [
   "pj_d5a",
   "pj_d5b",
   "pj_d5"
  ],
  "unlocks": {
   "pj_d5a": 1,
   "pj_d5b": 5,
   "pj_d5": 7
  },
  "mastery": {
   "moves": [
    "pj_d5a",
    "pj_d5b"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "风浪再大，一刀下去江面就平了。",
  "path": "刀",
  "learnReq": {
   "str": 15,
   "agi": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": {
   "art_id": "art_pj_d_jia",
   "level": 7
  }
 },
 {
  "id": "art_jh_gh",
  "name": "孤鸿九剑",
  "grade": "绝",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_gh1",
   "jh_gh2",
   "jh_gh3"
  ],
  "unlocks": {
   "jh_gh1": 1,
   "jh_gh2": 5,
   "jh_gh3": 7
  },
  "mastery": {
   "moves": [
    "jh_gh1",
    "jh_gh2"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "不拘招式，料敌机先，攻其必救；只攻不守。",
  "path": "剑",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": null
 },
 {
  "id": "art_jh_fl",
  "name": "伏龙十八掌",
  "grade": "绝",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_fl1",
   "jh_fl2",
   "jh_fl3"
  ],
  "unlocks": {
   "jh_fl1": 1,
   "jh_fl2": 5,
   "jh_fl3": 7
  },
  "mastery": {
   "moves": [
    "jh_fl1",
    "jh_fl2"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "刚猛无俦而留有余力：打出十分，自留二十分。",
  "path": "拳掌",
  "learnReq": {
   "str": 15,
   "con": 12,
   "wil": 10
  },
  "prereq": null
 },
 {
  "id": "art_jh_lm",
  "name": "六脉剑气",
  "grade": "绝",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_lm1",
   "jh_lm2",
   "jh_lm3"
  ],
  "unlocks": {
   "jh_lm1": 1,
   "jh_lm2": 5,
   "jh_lm3": 7
  },
  "mastery": {
   "moves": [
    "jh_lm1",
    "jh_lm2"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "以指力化无形剑气，六脉各有剑路；耗内力极巨。",
  "path": "暗器",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": null
 },
 {
  "id": "art_jh_dm",
  "name": "夺命十三式",
  "grade": "绝",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_dm1",
   "jh_dm2",
   "jh_dm3"
  ],
  "unlocks": {
   "jh_dm1": 1,
   "jh_dm2": 5,
   "jh_dm3": 7
  },
  "mastery": {
   "moves": [
    "jh_dm1",
    "jh_dm2"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "十三式之外还有变化；最后的变化连使剑的人也控制不了。",
  "path": "剑",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": null
 },
 {
  "id": "art_jh_bx",
  "name": "不虚飞刀",
  "grade": "绝",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_bx1",
   "jh_bx2",
   "jh_bx3"
  ],
  "unlocks": {
   "jh_bx1": 1,
   "jh_bx2": 5,
   "jh_bx3": 7
  },
  "mastery": {
   "moves": [
    "jh_bx1",
    "jh_bx2"
   ],
   "effect": {
    "mp": -2
   },
   "text": "本功法非绝招招式内力 −2"
  },
  "principle": "出手只一刀，出手之前没有人看得见。",
  "path": "暗器",
  "learnReq": {
   "agi": 15,
   "wis": 12,
   "con": 11,
   "wil": 10
  },
  "prereq": null
 },
 {
  "id": "art_jh_qq",
  "name": "驱犬棒法",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_qq1",
   "jh_qq2"
  ],
  "unlocks": {
   "jh_qq1": 1,
   "jh_qq2": 5
  },
  "mastery": {
   "moves": [
    "jh_qq1",
    "jh_qq2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "绊、缠、封、转，一根竹棒四面八方皆是棒影。",
  "path": "长兵",
  "learnReq": {
   "str": 12,
   "wil": 9,
   "con": 8
  },
  "prereq": null
 },
 {
  "id": "art_jh_qs",
  "name": "七损拳",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_qs1",
   "jh_qs2"
  ],
  "unlocks": {
   "jh_qs1": 1,
   "jh_qs2": 5
  },
  "mastery": {
   "moves": [
    "jh_qs1",
    "jh_qs2"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "一拳七劲，先伤己，再伤敌。",
  "path": "拳掌",
  "learnReq": {
   "str": 12,
   "con": 9
  },
  "prereq": null
 },
 {
  "id": "art_jh_xh",
  "name": "销魂掌",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_xh1",
   "jh_xh2"
  ],
  "unlocks": {
   "jh_xh1": 1,
   "jh_xh2": 5
  },
  "mastery": {
   "moves": [
    "jh_xh1",
    "jh_xh2"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "心境越苦，掌力越重。",
  "path": "拳掌",
  "learnReq": {
   "str": 12,
   "con": 9
  },
  "prereq": null
 },
 {
  "id": "art_jh_ly",
  "name": "两仪圆转剑",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_ly1",
   "jh_ly2"
  ],
  "unlocks": {
   "jh_ly1": 1,
   "jh_ly2": 5
  },
  "mastery": {
   "moves": [
    "jh_ly1",
    "jh_ly2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "以柔克刚，借力打力，后发制人。",
  "path": "剑",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": null
 },
 {
  "id": "art_jh_qx",
  "name": "祛邪剑谱",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_qx1",
   "jh_qx2"
  ],
  "unlocks": {
   "jh_qx1": 1,
   "jh_qx2": 5
  },
  "mastery": {
   "moves": [
    "jh_qx1",
    "jh_qx2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "快到对手看不清来路。",
  "path": "剑",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": null
 },
 {
  "id": "art_jh_xy",
  "name": "弦月弯刀",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_xy1",
   "jh_xy2"
  ],
  "unlocks": {
   "jh_xy1": 1,
   "jh_xy2": 5
  },
  "mastery": {
   "moves": [
    "jh_xy1",
    "jh_xy2"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "刀如新月，一刀两分。",
  "path": "刀",
  "learnReq": {
   "str": 12,
   "agi": 9,
   "con": 8
  },
  "prereq": null
 },
 {
  "id": "art_jh_bw",
  "name": "项王枪",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_bw1",
   "jh_bw2"
  ],
  "unlocks": {
   "jh_bw1": 1,
   "jh_bw2": 5
  },
  "mastery": {
   "moves": [
    "jh_bw1",
    "jh_bw2"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "枪长而重，一往无前。",
  "path": "长兵",
  "learnReq": {
   "str": 12,
   "wil": 9,
   "con": 8
  },
  "prereq": null
 },
 {
  "id": "art_jh_qp",
  "name": "雀屏翎",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_qp1",
   "jh_qp2"
  ],
  "unlocks": {
   "jh_qp1": 1,
   "jh_qp2": 5
  },
  "mastery": {
   "moves": [
    "jh_qp1",
    "jh_qp2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "辉煌如孔雀开屏，人在目眩神迷中倒下。",
  "path": "暗器",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": null
 },
 {
  "id": "art_jh_by",
  "name": "白云一剑",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_by1",
   "jh_by2"
  ],
  "unlocks": {
   "jh_by1": 1,
   "jh_by2": 5
  },
  "mastery": {
   "moves": [
    "jh_by1",
    "jh_by2"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "人随剑落，如青天白云，无瑕无垢。",
  "path": "剑",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": null
 },
 {
  "id": "art_jh_hp",
  "name": "寒魄符",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_hp1",
   "jh_hp2"
  ],
  "unlocks": {
   "jh_hp1": 1,
   "jh_hp2": 5
  },
  "mastery": {
   "moves": [
    "jh_hp1",
    "jh_hp2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "凝水成冰，入体成符；中符者受制于人。",
  "path": "暗器",
  "learnReq": {
   "agi": 12,
   "wis": 9,
   "con": 8
  },
  "prereq": null
 },
 {
  "id": "art_jh_sh",
  "name": "雷音吼",
  "grade": "甲",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_sh1",
   "jh_sh2"
  ],
  "unlocks": {
   "jh_sh1": 1,
   "jh_sh2": 5
  },
  "mastery": {
   "moves": [
    "jh_sh1",
    "jh_sh2"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "以内力发声，一吼震慑全场。",
  "path": "音律",
  "learnReq": {
   "wis": 12,
   "wil": 9,
   "con": 8
  },
  "prereq": null
 },
 {
  "id": "art_jh_ty",
  "name": "天涯刀",
  "grade": "乙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_ty1"
  ],
  "unlocks": {
   "jh_ty1": 1
  },
  "mastery": {
   "moves": [
    "jh_ty1"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "拔刀只练一个动作：刀光一闪，刀已回鞘。",
  "path": "刀",
  "learnReq": {
   "str": 9,
   "agi": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_cy",
  "name": "纯阳指",
  "grade": "乙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_cy1"
  ],
  "unlocks": {
   "jh_cy1": 1
  },
  "mastery": {
   "moves": [
    "jh_cy1"
   ],
   "effect": {
    "reveal": 1
   },
   "text": "本功法招式出手时看破 1 处"
  },
  "principle": "指力凝于一点，专点穴道。",
  "path": "拳掌",
  "learnReq": {
   "str": 9,
   "con": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_hd",
  "name": "冷月刀法",
  "grade": "乙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_hd1"
  ],
  "unlocks": {
   "jh_hd1": 1
  },
  "mastery": {
   "moves": [
    "jh_hd1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "攻守兼备，后发制人。",
  "path": "刀",
  "learnReq": {
   "str": 9,
   "agi": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_cg",
  "name": "摧骨爪",
  "grade": "乙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_cg1"
  ],
  "unlocks": {
   "jh_cg1": 1
  },
  "mastery": {
   "moves": [
    "jh_cg1"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "五指如钩，摧坚如穿腐土。",
  "path": "拳掌",
  "learnReq": {
   "str": 9,
   "con": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_tz",
  "name": "弹指惊雷",
  "grade": "乙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_tz1"
  ],
  "unlocks": {
   "jh_tz1": 1
  },
  "mastery": {
   "moves": [
    "jh_tz1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "以指力弹出小石，破空击远。",
  "path": "暗器",
  "learnReq": {
   "agi": 9,
   "wis": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_bl",
  "name": "别离钩",
  "grade": "乙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_bl1"
  ],
  "unlocks": {
   "jh_bl1": 1
  },
  "mastery": {
   "moves": [
    "jh_bl1"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "钩住哪里，哪里就要离别。",
  "path": "刀",
  "learnReq": {
   "str": 9,
   "agi": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_lx",
  "name": "通犀指",
  "grade": "乙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_lx1"
  ],
  "unlocks": {
   "jh_lx1": 1
  },
  "mastery": {
   "moves": [
    "jh_lx1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "两指一夹，夹住来锋。",
  "path": "拳掌",
  "learnReq": {
   "str": 9,
   "con": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_luo",
  "name": "落英掌",
  "grade": "丙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_luo1"
  ],
  "unlocks": {
   "jh_luo1": 1
  },
  "mastery": {
   "moves": [
    "jh_luo1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "掌影如落花，虚多实少。",
  "path": "拳掌",
  "learnReq": {
   "str": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_jh",
  "name": "金虺剑法",
  "grade": "丙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_jh1"
  ],
  "unlocks": {
   "jh_jh1": 1
  },
  "mastery": {
   "moves": [
    "jh_jh1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "剑如蛇信，专勾对手兵刃。",
  "path": "剑",
  "learnReq": {
   "agi": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_wm",
  "name": "无名快剑",
  "grade": "丙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_wm1"
  ],
  "unlocks": {
   "jh_wm1": 1
  },
  "mastery": {
   "moves": [
    "jh_wm1"
   ],
   "effect": {
    "pow": 0.05
   },
   "text": "本功法招式威力（含恢复量）+5%"
  },
  "principle": "没有名字的剑法，只求一个快字。",
  "path": "剑",
  "learnReq": {
   "agi": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_pl",
  "name": "霹雳子",
  "grade": "丙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_pl1"
  ],
  "unlocks": {
   "jh_pl1": 1
  },
  "mastery": {
   "moves": [
    "jh_pl1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "火药铁丸，掷出即炸。",
  "path": "暗器",
  "learnReq": {
   "agi": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_bp",
  "name": "冰魄针",
  "grade": "丙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "jh_bp1"
  ],
  "unlocks": {
   "jh_bp1": 1
  },
  "mastery": {
   "moves": [
    "jh_bp1"
   ],
   "effect": {
    "mp": -1
   },
   "text": "本功法招式内力 −1"
  },
  "principle": "银针淬寒毒，无声而至。",
  "path": "暗器",
  "learnReq": {
   "agi": 6
  },
  "prereq": null
 },
 {
  "id": "art_jh_fuhu",
  "name": "伏虎拳",
  "grade": "丙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "fuhu"
  ],
  "unlocks": {
   "fuhu": 1
  },
  "mastery": null,
  "principle": "江湖散学候选：武馆、镖局切磋",
  "path": null,
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_jh_liuye",
  "name": "柳叶剑法",
  "grade": "丙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "liuye"
  ],
  "unlocks": {
   "liuye": 1
  },
  "mastery": null,
  "principle": "江湖散学候选：书铺手抄本",
  "path": null,
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_jh_lianhua",
  "name": "莲花落",
  "grade": "丙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "lianhua"
  ],
  "unlocks": {
   "lianhua": 1
  },
  "mastery": null,
  "principle": "江湖散学候选：市井乞儿与说唱艺人传授的掌法（获取地点待安排）",
  "path": null,
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_jh_shuaibei",
  "name": "乞儿摔碑手",
  "grade": "丁",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "shuaibei"
  ],
  "unlocks": {
   "shuaibei": 1
  },
  "mastery": null,
  "principle": "江湖散学候选：旧原型出身“小乞”自带；现行主线中由市井乞儿传授",
  "path": null,
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_jh_bianfa",
  "name": "牧羊鞭法",
  "grade": "丁",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "bianfa"
  ],
  "unlocks": {
   "bianfa": 1
  },
  "mastery": null,
  "principle": "江湖散学候选：旧原型出身“放羊娃”自带；现行主线中由山村牧人传授",
  "path": null,
  "learnReq": {},
  "prereq": null
 },
 {
  "id": "art_jh_guafeng",
  "name": "刮风脚",
  "grade": "乙",
  "tier": "江湖散学",
  "group": "jianghu",
  "skillIds": [
   "guafeng"
  ],
  "unlocks": {
   "guafeng": 1
  },
  "mastery": null,
  "principle": "江湖散学候选：获取方式与地点待安排（原为击败旧襄阳演示红冠将军后领悟）",
  "path": null,
  "learnReq": {},
  "prereq": null
 }
];
