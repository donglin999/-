'use strict';
// 偷窃系统·数据表（2026-10-27 开发三子任务一）：所有规则、数值、人物物品特例全在表里，管线不认识任何具体 id。
// 依据：../xiaojianghu/docs/design/npc-steal.md（第 4～11 节，第七、八、九、十、十一、十三轮拍板已写入）。
(()=>{
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;

 // ── 物品难度系数（第 4.3 节，第七轮 14 定难六 0.2）
 const DIFFICULTY={1:1.00,2:0.85,3:0.70,4:0.50,5:0.30,6:0.20};

 // ── 品阶 → 门槛、经验、针速、几手、贵重标记、品德（第 4.3、5、6、8.2 节）
 const TIERS={
  丁:{gate:1,exp:1,needle:2.5,hands:1,precious:false,moral:-1},
  丙:{gate:2,exp:2,needle:2.2,hands:1,precious:false,moral:-1},
  乙:{gate:4,exp:4,needle:1.9,hands:1,precious:false,moral:-2},
  甲:{gate:7,exp:8,needle:1.7,hands:2,precious:true,moral:-2},
  绝:{gate:10,exp:15,needle:1.5,hands:2,precious:true,moral:-2},
  none:{gate:1,exp:1,needle:2.5,hands:1,precious:false,moral:-1}  // 钱、证物
 };

 // ── 窃术 1～10 级（第 5 节表）：加成、经验门槛、效果（perks 也是数据）
 const SKILL=[
  {lv:1,exp:0,bonus:5,perks:[]},
  {lv:2,exp:6,bonus:10,perks:[]},
  {lv:3,exp:15,bonus:15,perks:[{op:'redCore',ratio:1/3}]},
  {lv:4,exp:28,bonus:20,perks:[{op:'redCore',ratio:1/3}]},
  {lv:5,exp:45,bonus:25,perks:[{op:'redCore',ratio:1/3},{op:'showHidden'}]},
  {lv:6,exp:70,bonus:30,perks:[{op:'redCore',ratio:1/3},{op:'showHidden'}]},
  {lv:7,exp:100,bonus:35,perks:[{op:'redCore',ratio:1/3},{op:'showHidden'},{op:'showPrecious'}]},
  {lv:8,exp:140,bonus:45,perks:[{op:'redCore',ratio:1/3},{op:'showHidden'},{op:'showPrecious'}]},
  {lv:9,exp:180,bonus:50,perks:[{op:'redCore',ratio:1/3},{op:'showHidden'},{op:'showPrecious'},{op:'hands',tier:'甲',set:1}]},
  {lv:10,exp:230,bonus:60,perks:[{op:'redCore',ratio:1/3},{op:'showHidden'},{op:'showPrecious'},{op:'hands',tier:'甲',set:1},{op:'firstFailUnseen'}]}
 ];

 // ── 下手把握的加项（第 4.1 节）：每项是"取值方式 + 参数"，管线用 TERM 登记表统一计算
 const GRIP_TERMS=[
  {id:'base',op:'const',v:40},
  {id:'skill',op:'table',table:'SKILL',key:'hero.stealLv',field:'bonus'},
  {id:'agi',op:'linear',src:'hero.agi',k:3,offset:-4},
  {id:'lvAdv',op:'diff',a:'hero.lv',b:'target.lv',min:0,max:10},
  {id:'occasion',op:'pick',src:'target.state',map:{drunk:15,busy:15},mute:{'bond.stage':{in:['厌恶','仇视']}}},
  {id:'tip',op:'flag',src:'hero.perks.thiefTip',v:5},
  {id:'rumor',op:'step',src:'rumor.here',gte:3,v:-15}
 ];

 // ── 差距系数（第 4.2 节）：1/(1+(d/s)²)，s=5+0.5×窃术等级
 const GAP={curve:'invSquare',scaleBase:5,scalePerLv:0.5,clamp:[5,95]};   // 2026-10-27 用户：最低设成 5%，不然太难（原 1%）
 // 戒心（2026-10-27 用户：要有难度递进，被偷了之后察觉、警惕）：这个人被你偷走过一件记 1 级、失手被发觉过一回记 2 级，每级成功率 ×0.85，仍不低于 5%
 const WARY={perTaken:1,perCaught:2,mult:0.85,max:6};

 // ── 失手扣关系（第 8.3 节，第六轮 12）
 const CAUGHT_PENALTY={1:-10,more:-15};

 // ── 结算规则表（第 11.2 节）：按 ruleset 分组，自上而下匹配 when，收集 effects，遇 final 停
 const OUTCOME_RULES=[
  // 教学组（固定成功率、不扣关系、不发事件）
  {set:'teach',when:{result:'fail'},effects:[],final:true},   // 教学失手的“再来再来”由 js/qihe-aqi.js 播（等小游戏收起后）
  {set:'teach',when:{result:{in:['ok','great']}},effects:[{op:'advanceQuest',key:'aqiTeach.step'},{op:'exp',v:1}],final:true},

  // 主规则组
  {set:'main',when:{result:{in:['ok','great']}},effects:[
    {op:'take'},{op:'moral',from:'tier.moral',skipWhen:{'target.villain':true}},
    {op:'exp',from:'tier.exp'},{op:'expBonus',when:{'item.diff':{gte:5}},v:3},
    {op:'firstFrom'}]},
  {set:'main',when:{result:'great'},effects:[{op:'exp',v:1},{op:'stamp',ch:'妙'}]},

  // 失手：宋先生例外（断线、不开战）
  {set:'main',when:{result:'fail','target.flags.breaksLine':'song'},effects:[
    {op:'bond',table:'CAUGHT_PENALTY'},{op:'set',path:'qiheSong.broken',v:true},
    {op:'copy',from:'qiheSong.step',to:'qiheSong.brokenAt'},{op:'say',knot:'{npc}_steal_caught'}],final:true},

  // 失手：通用
  {set:'main',when:{result:'fail'},effects:[
    {op:'say',knot:'{npc}_steal_caught'},{op:'alert',until:'nextSegment'},
    {op:'bond',table:'CAUGHT_PENALTY'},
    {op:'bond',target:'target.patron',v:-3,reason:'steal_caught_kin'},
    {op:'moral',v:-2,skipWhen:{'target.villain':true}},
    {op:'rumor',v:1},{op:'emit',event:'steal_caught'}]},

  // 失手后敌对开战（第 8.5 节）：习武、敌对、开始部分、失手≥2 次、不在固定剧情中、对象无"开始部分不开战"标记
  {set:'main',when:{result:'fail','bond.hostile':true,'target.fighter':true,'ctx.phase':'opening','caught.count':{gte:2},'ctx.fixedScene':false,'target.flags.noHostileInOpening':{not:true}},
   effects:[{op:'fight',mode:'hostile',loseTo:'nearestRest'}]},

  // 失手但不习武的人：风声起满、标记敌对
  {set:'main',when:{result:'fail','bond.hostile':true,'target.fighter':false},
   effects:[{op:'rumor',setMax:true},{op:'markHostile'}]}
 ];

 // ── 列表显示规则（第 11.2 节）：自上而下，第一条命中即用
 const DISPLAY_RULES=[
  {when:{'item.kind':'money'},show:'name'},
  {when:{'target.conceal':'allButMoney','item.kind':{notIn:['money']}},show:'unseen'},
  {when:{'tier.precious':true},show:'unknown'},
  {when:{},show:'name'}
 ];

 // ── 教学覆盖（第 3.3 节、第 6 节）：固定成功率、换用结算规则组
 const OVERRIDES={
  aqi_lesson_coin:{chance:70,ruleset:'teach'},
  aqi_lesson_purse:{chance:100,ruleset:'teach'}
 };


 // 宋先生身上能偷到的几件（偷窃稿第 8.4 节；目录 martial-review/catalog.json）。佩饰的“功能类”效果（买价、银两、掉落、战后回复）游戏里还没有通道，先只登记物品，数值待核
 if(typeof ITEMS!=='undefined')Object.assign(ITEMS,{
  mj_art_jh_hp:{name:'《寒魄符》',desc:'甲级秘籍。从宋先生身上偷来的，纸页冰凉。开始部分还参悟不了。',key:1,q:4},
  qh_merchant_tally:{name:'行商牙牌',desc:'甲级佩饰。一块象牙色长方牙牌，边角磨圆，刻着细细的账格纹，挂黑丝绳。（商店买价 −12%、银两获得 +15%）',acc:1,fx:{},func:{buy:.12,silver:.15},price:650,q:4},
  qh_compass_fish:{name:'指南鱼坠',desc:'甲级佩饰。薄铁片剪成的小鱼形指南鱼，嵌在小木盒里。（掉落率 +15%、战后回复 8% 气血内力）',acc:1,fx:{},func:{drop:.15,postHeal:.08},price:650,q:4},
  qh_escort_notes:{name:'走镖手札',desc:'甲级成长资源。一本走镖人的手札，记着路上的门道。读一遍得江湖历练 360，全队共用。',key:1,insight:360,q:4},
  qh_song_roster:{name:'后山记人笺',desc:'证物。折起的纸，记着这几天进村的人、几个、站在哪。',key:1,q:2}
 });
 window.QIHE_STEAL_DATA={DIFFICULTY,TIERS,SKILL,GRIP_TERMS,GAP,WARY,CAUGHT_PENALTY,OUTCOME_RULES,DISPLAY_RULES,OVERRIDES};
})();
