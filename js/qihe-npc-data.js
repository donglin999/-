'use strict';
// 人物交互框架（2026-10-23 开发一）：只放数据表，不放逐人逻辑。规则引擎在 js/qihe-npc-core.js，界面在 js/qihe-npc-ui.js。
// 依据（都已用户拍板）：
//   ../xiaojianghu/docs/design/npc-interaction-v2.md（2.1 金石朱印、第 3 节可见度四档 4／14／29、第 4 节查看页、第 5 节请教、第 10 节拍板）
//   ../xiaojianghu/docs/design/npc-spar-and-insight.md（切磋、眼力只看悟性、请教一律加兵刃造诣）
//   ../xiaojianghu/docs/design/npc-gifts-and-inventory.md（第 2 节关系轴含负向、第 4～6 节随身物品；赠礼界面本轮不做）
// 台词一律在 ink（R-剧情-04）；这里只有界面短句（小签、条件、卷上一句）和数值。
(()=>{
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;

 // ── 菜单项表：顺序即墨印排列顺序（主稿第 2 节、第 10 节第 3 项：托／谈／观／礼／教／比／易，第八枚“窃”下一批做）。
 // note：聚焦时小签上的默认小注；条件不满足时由规则引擎换成原因。
 const MENU=[
  {id:'tuo',ch:'托',lab:'托付',story:true},
  {id:'tan',ch:'谈',lab:'交谈',note:''},
  {id:'guan',ch:'观',lab:'查看',note:'装备 · 随身 · 武学'},
  {id:'li',ch:'礼',lab:'赠礼',note:''},
  {id:'jiao',ch:'教',lab:'请教',note:''},
  {id:'bi',ch:'比',lab:'切磋',note:'点到为止'},
  {id:'yi',ch:'易',lab:'交易',note:'买卖'},
  {id:'qie',ch:'窃',lab:'偷窃',note:'',reserved:true}   // 留位：偷窃下一批做，本轮一律隐藏
 ];

 // ── 可见度四档（主稿第 3 节）。d = 对方等级 − 萧白等级。字段说明：
 // lv 等级写法 exact|vague|abyss；art 外功 full|grade|nameOnly|hidden；inner 内功 full|nameOnly|hidden；stats 根基 exact|band2|tri|hidden
 const TIERS=[
  {id:'clear',max:4,seal:'看透',lv:'exact',art:'full',inner:'full',stats:'exact',artNote:'重数与已开招式',statNote:'精确数值'},
  {id:'see',max:14,seal:'看出',lv:'exact',art:'grade',inner:'nameOnly',stats:'band2',artNote:'看得出重数',statNote:'看出个范围'},
  {id:'rough',max:29,seal:'大概',lv:'vague',art:'nameOnly',inner:'hidden',stats:'tri',artNote:'只认得出路数',statNote:'差得远只看出高低'},
  {id:'opaque',max:Infinity,seal:'不透',lv:'abyss',art:'hidden',inner:'hidden',stats:'hidden',artNote:'看不透',statNote:'看不透'}
 ];
 const TIER_TEXT={vague:'高你许多',abyss:'深不可测'};
 const STAT_TRI=[[5,'低'],[10,'中'],[Infinity,'高']];   // ≤5 低，6～10 中，≥11 高
 const STAT_BAND=2;                                      // “看得出”档：真值 ±2

 // ── 眼力（切磋稿第 3 节，P4：只看悟性）。最多比不加眼力时好一档；乔装、不习武不受影响。
 const INSIGHT=[{min:12,k:5},{min:8,k:3},{min:-Infinity,k:0}];

 // ── 切磋规则（切磋稿 2.3～2.5，P5、P6 照稿）。
 const SPAR={
  refuseStrong:15, refuseWeak:-10,          // d ≥ 15 对方不接；d ≤ −10 对方不接
  perPersonPerSlot:1, perSlot:3,            // 每个时段每人 1 次，合计 3 次（剧情首场不计）
  hurtBelow:.5,                             // 萧白气血低于五成不接
  stopAt:.3, maxRounds:8,                   // 任一方掉到三成或打满八回合收手
  exp:{base:8,perLv:2,result:{win:1,draw:.7,lose:.4},decay:[1,.6,.3,0]},
  insight:{first:10,firstWinMin:10,firstWinDiv:2,round:5}
 };

 // ── 关系轴（赠礼稿第 2 节，单一来源）。score −100～100；开始部分正向上限 49，特殊人物未解锁前 19。
 const BOND={
  stages:[{min:80,name:'托付'},{min:50,name:'信赖'},{min:20,name:'熟络'},{min:0,name:'初识'},{min:-19,name:'冷淡'},{min:-49,name:'厌恶'},{min:-100,name:'仇视'}],
  openingCap:49, lockedCap:19, floor:-100, hostileAt:-50,
  // 各档对墨印的影响（2.2 节）：冷淡不教；厌恶不易、不教、不比、不托；仇视同厌恶（敌对开战归偷窃、赠礼两稿，本轮不做）
  effects:{冷淡:{jiao:'关系冷淡 · 不肯教'},厌恶:{yi:'他厌恶你',jiao:'他厌恶你',bi:'他厌恶你',tuo:'他厌恶你'},仇视:{yi:'已成仇',jiao:'已成仇',bi:'已成仇',tuo:'已成仇'}},
  unlockBonus:8
 };

 // ── 时段（切磋、请教、收礼共用）：开始部分按半日；邻村对证之后算一个时段（切磋稿 2.5）。
 // ── 条件写法（规则引擎 QiheNpc.test 解析，全部满足才算满足）：
 //   event:<id> 主线事件已发生；!event:<id> 未发生；stage:<a|b> 主线阶段；halfDay<n / halfDay>=n；choice:<活动> 活动做完；
 //   learned:<招式> 已学；has:<物品> 行囊或身上有；errand:<键>:<阶段> 三方跑腿阶段；prologueErrand:<键> 第一夜三件已做；
 //   bond:<人>>=n 关系分；sparred:<人> 切磋过；skill:spar 已学会切磋；chapter 已进风起（有主线存档）

 // ── 请教表（切磋稿第 4.2 节：习武的人加兵刃造诣，代码键 棍＝长兵、拳＝拳掌；陆衡保持原样走现有学棍）。
 // line：卷上那一句（界面文字，设计稿原句）；req：[条件, 卷上写的条件, 墨印小签上的短句]；fx：所得。
 const TEACH={
  luheng_staff:{title:'护路棍法',grade:'丙',sub:'一重 · 横杆护身',skill:'qh_hulu_staff',
   req:[['stage:days halfDay<4','第二天傍晚前','过了时限']],info:'棍类兵器：他给你一根练习棍',
   gain:'学会得：横杆护身 · 练习棍 · 护路棍法笔记',tip:'丙级只此一招\n往后的重数靠自己练',fx:{activity:'practice'},closedNote:'已学过横杆护身'},
  ye_needle:{title:'暗器造诣',grade:'常识',sub:'捏针',line:'叶蘅教你捏针：三根手指夹稳，腕子别抖。',
   req:[['choice:clinic','药棚帮忙做完','帮完药棚再来'],['halfDay<4','第二天傍晚前','过了时限']],gain:'暗器造诣 +10',fx:{zy:'暗器',n:10}},
  xu_sword:{title:'剑造诣',grade:'常识',sub:'出剑前的站法',line:'徐令仪让你看她出剑前脚下怎么站。',
   req:[['bond:xulingyi>=20','关系熟络（替她跑过拜帖）','熟络之后再来'],['stage:days|refuge','开始部分结束前','过了时限']],gain:'剑造诣 +25',fx:{zy:'剑',n:25}},
  shen_staff:{title:'长兵造诣',grade:'常识',sub:'横杆的架子',line:'沈雁回看你使了两下棍，替你把横杆的架子掰正。',
   req:[['learned:qh_hulu_staff','已学横杆护身','先学横杆护身'],['bond:shenyanhui>=20','关系熟络（替她对过药单）','熟络之后再来'],['stage:days|refuge','开始部分结束前','过了时限']],gain:'长兵造诣 +25',fx:{zy:'棍',n:25}},
  bailiff_stance:{title:'长兵造诣',grade:'常识',sub:'守路的站法',line:'差役教你守路的站法：脚钉住，棍别离身。',
   req:[['sparred:bailiff','跟他切磋过一场','切磋过再来'],['stage:refuge','在邻村','到邻村再说']],gain:'长兵造诣 +10',fx:{zy:'棍',n:10}}
 };

 // ── 物品类别（赠礼稿第 4 节）：普 普通｜贵 甲、绝（显示“未知物品”，悟性认）｜锁 奇遇支线奖励（未知、认不出）｜贴 贴身（不显示；乔装者“贴身收着一件”）｜剧 剧情物（朱印“剧情”）
 // 物品条目：{n:名称, id:运行时物品 id（有图标时）, c:类别, q:数量, g:品阶, glyph:无图标时的字, when/until:条件, money:两}
 // ── 人物表。battle：等级、五维、兵器、武学的来源——clash＝js/qihe-faction-clash-data.js 的 profiles；spar＝QiheSparFoes；party＝入队同伴；
 //    lv 只写设计稿已定的等级（100 级方案）；没有战斗档的人五维、武学写“未登记”，不编。
 //    npc：地图上 NPC 的名字（按名字认人）；chapter：QiheChapter.interact 用的 id；story：托的来源（main 主线这一步找他｜errand 三方跑腿｜errandCheck 跑腿问话｜stranger 宋先生回话）。
 const PEOPLE={
  ye:{name:'叶蘅',npc:['叶蘅'],chapter:'ye',faction:'栖河村',role:'村中医者',portrait:'p_ye',special:true,unlock:'choice:clinic',
   battle:{party:'ye',lv:3,arts:[{name:'药针',grade:'',moves:['回春','百草']}]},
   story:['main'],teach:'ye_needle',spar:{deny:'companion'},
   bag:[{n:'野草药',id:'qh_wild_herb',q:3},{n:'金疮药',id:'pill',q:2},{n:'素铜针囊',id:'needles',c:'剧',until:'has:needles'},{n:'无名字条',c:'剧',glyph:'条'},
    {n:'种子纸包',c:'剧',glyph:'种',when:'choice:clinic'},{n:'母亲药签',c:'贴'},{n:'父亲笔记',c:'贴'},{money:8}]},
  aunt:{name:'周婶',npc:['周婶'],faction:'栖河村',role:'药棚帮手',civilian:true,
   bag:[{n:'羊肉笼饼',id:'bun',q:2},{n:'金疮药',id:'pill',q:1},{n:'风灯',c:'普',glyph:'灯',use:'任'},{money:12}]},
  chen:{name:'陈伯',npc:['陈伯'],faction:'栖河村',role:'木匠',civilian:true,tools:'木匠工具',story:['errandCheck'],
   bag:[{n:'枣木短杖',id:'club',until:'has:club'},{n:'麻绳',glyph:'绳',q:2},{n:'修车工具',c:'剧',glyph:'具'},{n:'第十七号底单',c:'贴'},{money:15}]},
  elder:{name:'村口老人',npc:['村口老人'],faction:'栖河村',role:'村南老住户',civilian:true,
   bag:[{n:'周婶的竹篮',c:'剧',glyph:'篮',until:'prologueErrand:medicine'},{money:4}]},
  innkeeper:{name:'店家',npc:['店家'],faction:'栖河村',role:'客栈掌柜',civilian:true,trade:true,
   bag:[{n:'羊肉笼饼',id:'bun',q:3},{n:'竹叶青',id:'wine',q:1},{n:'火折子',glyph:'火',q:2},{money:30}]},
  apothecary:{name:'药商',npc:['药商'],faction:'外来药商',role:'南村口药摊',civilian:true,trade:true,story:['errandCheck'],
   bag:[{n:'金疮药',id:'pill',q:3},{n:'野草药',id:'qh_wild_herb',q:4},{n:'旧药罐',c:'剧',glyph:'罐',q:7},{n:'行诊药囊',glyph:'囊',g:'丙'},{money:40}]},
  aide:{name:'采办随从',npc:['采办随从'],faction:'巡江司采办队',role:'采办随从',civilian:true,
   bag:[{n:'采办单',c:'剧',glyph:'单'},{n:'竹叶青',id:'wine',q:1},{money:20}]},
  bailiff:{name:'差役',npc:['差役'],faction:'巡江司',role:'守路差役',story:['errandCheck'],
   battle:{spar:'bailiff',arts:[{name:'护路棍法',grade:'丙',lv:1,moves:['横杆护身']}]},
   teach:'bailiff_stance',spar:{},
   bag:[{n:'羊肉笼饼',id:'bun',q:1},{money:10}]},
  retainer:{name:'护院',npc:['护院'],faction:'正道盟',role:'徐令仪的护院',
   battle:{clash:'guard_front',art:'c_qh_clash_guard'},
   spar:{first:true,firstNote:'徐令仪已点头',firstWhen:'event:evidence-v2'},
   bag:[{n:'随行干粮',glyph:'粮',q:2},{n:'金疮药',id:'pill',q:1},{money:20}]},
  bandit:{name:'帮众',npc:['帮众'],faction:'归烬堂',role:'乌魁手下',
   battle:{clash:'adept',art:'c_qh_clash_guard'},spar:{},
   bag:[{n:'竹叶青',id:'wine',q:1},{money:2}]},
  xulingyi:{name:'徐令仪',npc:['徐令仪'],chapter:'xulingyi',faction:'正道盟',role:'文议执事',portrait:'p_qh_xulingyi_story',special:true,unlock:'errand:letter:done',
   battle:{clash:'xu',weaponName:'青锋剑'},story:['errand'],teach:'xu_sword',spar:{},
   bag:[{n:'收货单附页',c:'剧',glyph:'札',until:'event:evidence-v2'},{n:'拜帖',c:'剧',glyph:'帖',when:'errand:letter:none'},{n:'金疮药',id:'pill',q:2},{n:'羊肉笼饼',id:'bun',q:2},
    {n:'短锋相照',glyph:'册',g:'丙'},{n:'笔管坠',glyph:'坠',g:'乙',look:true},{money:60}]},
  censhuang:{name:'岑霜',npc:['岑霜'],chapter:'censhuang',faction:'归烬堂',role:'对外管事',portrait:'p_qh_censhuang_story',special:true,unlock:'errand:account:done',
   battle:{clash:'cen',acc:'窄面折扇'},story:['errand'],spar:{},
   bag:[{n:'旧货账',c:'剧',glyph:'账'},{n:'竹叶青',id:'wine',q:1},{n:'燃隙刀',glyph:'册',g:'丙'},{n:'蜻蜓翠簪',key:'qh_dragonfly_hairpin',c:'贵',g:'甲'},{money:120}]},
  shenyanhui:{name:'沈雁回',npc:['沈雁回'],chapter:'shenyanhui',faction:'巡江司',role:'民间委办',portrait:'p_qh_shenyanhui_story',special:true,unlock:'errand:ledger:done',
   battle:{lv:24,weapon:'截江棍',weaponGrade:'丙'},story:['errand'],teach:'shen_staff',spar:{},
   bag:[{n:'采办队附页',c:'剧',glyph:'札'},{n:'行旅凭牌',c:'剧',glyph:'牌'},{n:'野草药',id:'qh_wild_herb',q:2},{n:'药香荷包',glyph:'包',g:'丙'},{money:50}]},
  luheng:{name:'陆衡',npc:['陆衡'],chapter:'luheng',faction:'跑山路护运',role:'护运',portrait:'p_opening_luheng',special:true,unlock:'choice:transport',
   battle:{lv:16,weapon:'护行刀',weaponGrade:'丙',acc:'铁钱串',accGrade:'乙',arts:[{name:'护路棍法',grade:'丙',moves:['横杆护身']}]},
   story:['main'],teach:'luheng_staff',spar:{noProfile:true},
   bag:[{n:'练习棍',id:'qh_practice_staff',c:'剧',until:'learned:qh_hulu_staff'},{n:'路单',c:'剧',glyph:'单',use:'任'},{n:'随行干粮',glyph:'粮',q:3},{n:'麻绳',glyph:'绳',q:1},{money:35}]},
  zhouyan:{name:'周砚',npc:['周砚'],faction:'归云谷',role:'以旧友身份来访',portrait:'p_opening_zhouyan',special:true,unlock:'never',bondFloor:-49,
   battle:{lv:88},spar:{noProfile:true},
   bag:[{n:'随行干粮',glyph:'粮',q:2},{n:'金疮药',id:'pill',q:1},{n:'出岫心经',glyph:'册',g:'丙',look:true},{n:'归云剑诀',key:'qh_guiyun_sword_manual',c:'贵',g:'甲'},{money:200}]},
  song:{name:'宋先生',npc:['宋先生'],chapter:'stranger',faction:'行商账房',role:'后山倒木旁',portrait:'p_qh_song_story',special:true,unlock:'event:c1-s1',disguised:true,
   story:['stranger'],spar:{deny:'disguised'},
   bag:[{n:'金疮药',id:'pill',c:'剧',q:2,until:'event:c1-00b'},{n:'青绫行衣',id:'qh_song_coat',c:'剧',until:'event:c1-s1'},{n:'乌木算珠',id:'qh_song_abacus',c:'剧',until:'event:c1-s2'},
    {n:'旧账簿',c:'剧',glyph:'簿'},{n:'红绳系的玉',c:'贴'},{n:'银铤一枚',glyph:'银',money:600,silverBar:true},{n:'寒魄符',key:'mj_art_jh_hp',c:'贵',g:'甲'},{n:'行商牙牌',key:'qh_merchant_tally',c:'贵',g:'甲'},
    {n:'指南鱼坠',key:'qh_compass_fish',c:'贵',g:'甲'},{n:'走镖手札',key:'qh_escort_notes',c:'贵',g:'甲'},{n:'后山记人笺',c:'剧',glyph:'笺',when:'event:c1-s1'}]}
 };

 // ── 托（剧情项）的来源表：label 两字，note 小注由引擎按来源填（主线这一步的标题、跑腿名等，不剧透）。
 const STORY={main:{lab:'托付'},errand:{lab:'托付',labActive:'回话',notes:{letter:'拜帖跑腿',account:'旧货账跑腿',ledger:'药单跑腿'}},errandCheck:{lab:'回话'},stranger:{lab:'回话',note:'后山的事'}};

 // ── 邻村护院、差役站位（切磋稿 2.6 节 R2、R3；布置图 review/qihe-map-interactables/layout-refuge-v2.png）：邻村对证之后出现。
 const STATIONS=[
  {key:'refuge',id:'retainer-refuge',person:'retainer',sp:'c_opening_retainer',at:[1015,580],when:'stage:refuge event:evidence-v2',talk:false},
  {key:'refuge',id:'bailiff-refuge',person:'bailiff',sp:'c_opening_bailiff',at:[540,615],when:'stage:refuge event:evidence-v2',talk:false}
 ];

 window.QIHE_NPC_DATA={MENU,TIERS,TIER_TEXT,STAT_TRI,STAT_BAND,INSIGHT,SPAR,BOND,TEACH,PEOPLE,STORY,STATIONS};
})();
