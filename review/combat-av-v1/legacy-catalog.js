// Generated from current runtime definitions. Rebuild with tools_fx/build_legacy_catalog.cjs.
window.LegacyCatalog={
  "skills": {
    "fist": {
      "name": "粗浅拳脚",
      "kind": "拳",
      "mp": 0,
      "pow": 1,
      "range": 1,
      "shape": "single",
      "combo": 10,
      "desc": "人人都会的三招两式。"
    },
    "fuhu": {
      "name": "伏虎拳",
      "kind": "拳",
      "mp": 6,
      "pow": 1.35,
      "range": 1,
      "shape": "single",
      "combo": 60,
      "desc": "拳势连绵，连击率高。"
    },
    "liuye": {
      "name": "柳叶剑法",
      "kind": "剑",
      "mp": 8,
      "pow": 1.5,
      "range": 2,
      "shape": "line",
      "combo": 20,
      "desc": "剑出如柳，可穿透一排两人。",
      "needWeapon": "剑"
    },
    "jingxin": {
      "name": "静心诀",
      "kind": "内",
      "mp": 10,
      "pow": 0,
      "range": 0,
      "shape": "self",
      "heal": 0.3,
      "desc": "孤儿专属：调息回复三成气血。"
    },
    "shuaibei": {
      "name": "乞儿摔碑手",
      "kind": "掌",
      "mp": 7,
      "pow": 1.25,
      "range": 1,
      "shape": "single",
      "combo": 35,
      "stun": 30,
      "desc": "小乞专属：有几率令敌人眩晕一回合。"
    },
    "bianfa": {
      "name": "牧羊鞭法",
      "kind": "鞭",
      "mp": 7,
      "pow": 1.1,
      "range": 2,
      "shape": "cross",
      "combo": 15,
      "desc": "放羊娃专属：鞭梢横扫十字范围。"
    },
    "lianhua": {
      "name": "莲花落",
      "kind": "掌",
      "mp": 9,
      "pow": 1.45,
      "range": 1,
      "shape": "single",
      "combo": 45,
      "bleed": 1,
      "desc": "丐帮入门掌法，伤敌流血。"
    },
    "guafeng": {
      "name": "刮风脚",
      "kind": "腿",
      "mp": 12,
      "pow": 1.7,
      "range": 1,
      "shape": "arc",
      "combo": 10,
      "desc": "红冠将军身上悟出的腿法，扫击前方三格。"
    },
    "bite": {
      "name": "撕咬",
      "kind": "咬",
      "mp": 0,
      "pow": 1,
      "range": 1,
      "shape": "single",
      "combo": 30
    },
    "lick": {
      "name": "舔舐",
      "kind": "内",
      "mp": 8,
      "pow": 0,
      "range": 1,
      "shape": "ally",
      "heal": 0.25,
      "desc": "大黄狗为同伴疗伤。"
    },
    "peck": {
      "name": "铁喙连啄",
      "kind": "啄",
      "mp": 0,
      "pow": 1.1,
      "range": 1,
      "shape": "single",
      "combo": 70
    },
    "blade": {
      "name": "劈砍",
      "kind": "刀",
      "mp": 0,
      "pow": 1,
      "range": 1,
      "shape": "single",
      "combo": 10
    },
    "ghost": {
      "name": "鬼头斩",
      "kind": "刀",
      "mp": 10,
      "pow": 1.6,
      "range": 1,
      "shape": "arc",
      "combo": 0
    },
    "coil": {
      "name": "缠绞",
      "kind": "缠",
      "mp": 0,
      "pow": 1.2,
      "range": 1,
      "shape": "single",
      "combo": 0,
      "stun": 25
    },
    "palm_m": {
      "name": "罗汉掌",
      "kind": "掌",
      "mp": 0,
      "pow": 0.8,
      "range": 1,
      "shape": "single",
      "combo": 0
    },
    "staff": {
      "name": "拨草棍",
      "kind": "棍",
      "mp": 0,
      "pow": 1.1,
      "range": 2,
      "shape": "single",
      "combo": 25
    },
    "jinzhen": {
      "name": "金针刺穴",
      "kind": "暗器",
      "mp": 4,
      "pow": 1,
      "desc": "银针点穴，并看破敌人一处弱点。"
    },
    "huichun": {
      "name": "回春散",
      "kind": "医",
      "mp": 6,
      "pow": 0,
      "heal": 0.38,
      "desc": "为一名同伴回复气血。"
    },
    "baicao": {
      "name": "百草露",
      "kind": "医",
      "mp": 10,
      "pow": 0,
      "heal": 0.2,
      "desc": "为全体同伴回复少量气血。"
    },
    "dingshen": {
      "name": "定神",
      "kind": "医",
      "mp": 5,
      "pow": 0,
      "desc": "令一名同伴心神安定：三回合内攻防提升。"
    },
    "sniff": {
      "name": "嗅探",
      "kind": "咬",
      "mp": 4,
      "pow": 0.7,
      "desc": "大黄嗅出敌人两处弱点。"
    },
    "fanjiang": {
      "name": "翻江刺",
      "kind": "刀",
      "mp": 8,
      "pow": 1.3,
      "range": 1,
      "shape": "single",
      "combo": 0,
      "desc": "浪里鳅的分水刺，贴身连扎。"
    }
  },
  "battle": {
    "fist": {
      "t": "拳"
    },
    "fuhu": {
      "t": "拳",
      "e": "阳",
      "hits": 2
    },
    "liuye": {
      "t": "剑",
      "tgt": "foes"
    },
    "jingxin": {
      "tgt": "self"
    },
    "shuaibei": {
      "t": "拳",
      "e": "阴",
      "stun": 1
    },
    "bianfa": {
      "t": "棍",
      "tgt": "foes"
    },
    "lianhua": {
      "t": "拳",
      "e": "毒",
      "bleed": 1
    },
    "guafeng": {
      "t": "拳",
      "e": "雷",
      "tgt": "foes"
    },
    "bite": {
      "t": "刀"
    },
    "lick": {
      "tgt": "ally"
    },
    "peck": {
      "t": "刀",
      "hits": 2
    },
    "blade": {
      "t": "刀"
    },
    "ghost": {
      "t": "刀",
      "tgt": "foes"
    },
    "coil": {
      "t": "拳",
      "stun": 1
    },
    "palm_m": {
      "t": "拳"
    },
    "staff": {
      "t": "棍"
    },
    "jinzhen": {
      "t": "暗器",
      "reveal": 1
    },
    "huichun": {
      "tgt": "ally"
    },
    "baicao": {
      "tgt": "allies"
    },
    "dingshen": {
      "tgt": "ally",
      "buff": 1
    },
    "sniff": {
      "t": "刀",
      "reveal": 2
    }
  },
  "fx": {
    "_atk": {
      "tier": 0,
      "cls": "dmg"
    },
    "fist": {
      "tier": 0,
      "cls": "dmg",
      "hit": "拳"
    },
    "blade": {
      "tier": 0,
      "cls": "dmg",
      "hit": "刀"
    },
    "bite": {
      "tier": 0,
      "cls": "dmg",
      "hit": "咬"
    },
    "peck": {
      "tier": 0,
      "cls": "dmg",
      "hit": "啄"
    },
    "palm_m": {
      "tier": 0,
      "cls": "dmg",
      "hit": "拳"
    },
    "staff": {
      "tier": 0,
      "cls": "dmg",
      "hit": "棍"
    },
    "coil": {
      "tier": 0,
      "cls": "dmg",
      "hit": "毒"
    },
    "jinzhen": {
      "tier": 1,
      "cls": "dmg"
    },
    "sniff": {
      "tier": 1,
      "cls": "dmg",
      "hit": "咬"
    },
    "fuhu": {
      "tier": 1,
      "cls": "dmg"
    },
    "shuaibei": {
      "tier": 1,
      "cls": "dmg"
    },
    "bianfa": {
      "tier": 1,
      "cls": "dmg"
    },
    "liuye": {
      "tier": 2,
      "cls": "dmg"
    },
    "lianhua": {
      "tier": 2,
      "cls": "dmg"
    },
    "guafeng": {
      "tier": 2,
      "cls": "dmg"
    },
    "dingshen": {
      "tier": 1,
      "cls": "sup"
    },
    "huichun": {
      "tier": 1,
      "cls": "sup"
    },
    "lick": {
      "tier": 1,
      "cls": "sup"
    },
    "jingxin": {
      "tier": 1,
      "cls": "sup"
    },
    "baicao": {
      "tier": 2,
      "cls": "sup"
    },
    "ghost": {
      "tier": 3,
      "cls": "dmg",
      "boss": 1
    },
    "_break": {
      "tier": 3,
      "cls": "sys"
    }
  },
  "special": [
    "fuhu",
    "shuaibei",
    "bianfa",
    "jinzhen",
    "sniff",
    "liuye",
    "lianhua",
    "guafeng",
    "ghost",
    "jingxin",
    "huichun",
    "lick",
    "baicao",
    "dingshen"
  ]
};
const SKILLS=LegacyCatalog.skills,BSK=LegacyCatalog.battle;
