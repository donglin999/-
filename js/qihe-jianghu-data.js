'use strict';
// 门派关系与声誉：数据（开始部分）
(()=>{
 if(typeof isQiheEntry!=='function'||!isQiheEntry())return;
 // 势力：门类（sect门派／town村镇／guan官府／other其他）、子类（ben本门／zheng正道／mo魔道）、主事、印字、颜色、特殊限制
 const FACTIONS={
  alliance:  {name:'正道盟',group:'sect',sub:'zheng',tag:'正道',region:'qihe',glyph:'盟',color:'#536779',boss:'xulingyi'},
  guijintang:{name:'归烬堂',group:'sect',sub:'mo',tag:'魔道',region:'qihe',glyph:'烬',color:'#8f394c',boss:'censhuang'},
  patrol:    {name:'巡江司',group:'guan',tag:'委办查验',region:'qihe',glyph:'巡',color:'#3c566b',boss:'shenyanhui',noMend:true},
  qihe:      {name:'栖河村',group:'town',tag:'乡里',region:'qihe',glyph:'村',color:'#78624e',boss:null},
  guiyun:    {name:'归云谷',group:'sect',sub:'ben',tag:'本门',region:'guiyun',glyph:'云',color:'#4d6a52',boss:'zhouyan',floor:-10,pin:true}
 };
 // 门类、地域的叫法（「关系」页标题条用）
 const GROUP_NAME={sect:'门派',town:'村镇',guan:'官府',other:'其他'};
 const REGION_NAME={qihe:'栖河一带',guiyun:'归云谷'};
 // 成员称呼：按势力门类分开叫（2026-10-27 栖河村是村镇，不用“主事／门人／喽啰”）；成员行里 title 可单独覆盖
 const RANK_NAME={
  sect:{boss:'主事',member:'门人',minor:'喽啰'},
  town:{boss:'乡里',member:'乡邻',minor:'乡里孩子'},
  guan:{boss:'主事',member:'公人',minor:'随从'},
  other:{boss:'头领',member:'帮众',minor:'喽啰'}
 };
 // 成员：所属势力、分量等级、主事人（可单独覆盖）、隐藏（蔺管事结局3后才登记）
 // 2026-10-27 成员 id 与人物交互表 js/qihe-npc-data.js PEOPLE 一致（原拼音 id 对不上，个人关系折不进门派）
 const MEMBERS={
  xulingyi:{faction:'alliance',rank:'boss'},
  guanshi:{faction:'alliance',rank:'member'},retainer:{faction:'alliance',rank:'member'},
  censhuang:{faction:'guijintang',rank:'boss'},wukui:{faction:'guijintang',rank:'member'},bandit:{faction:'guijintang',rank:'minor'},atan:{faction:'guijintang',rank:'minor'},
  shenyanhui:{faction:'patrol',rank:'boss'},
  caibanshi:{faction:'patrol',rank:'member'},aide:{faction:'patrol',rank:'minor'},
  bailiff:{faction:'patrol',rank:'member',boss:null},
  ye:{faction:'qihe',rank:'boss'},aunt:{faction:'qihe',rank:'member'},chen:{faction:'qihe',rank:'member'},
  elder:{faction:'qihe',rank:'member'},innkeeper:{faction:'qihe',rank:'member'},ashuan:{faction:'qihe',rank:'minor'},xiaohe:{faction:'qihe',rank:'minor'},
  // 2026-10-27 新上图人物：船家是栖河村人，进表；货郎、小耗子原只列不折算，用户第二十二轮 9 定“都折进栖河村”
  boatman:{faction:'qihe',rank:'member'},
  peddler:{faction:'qihe',rank:'member',title:'外来'},aqi:{faction:'qihe',rank:'minor',title:'外乡人'},
  song:{faction:null,hidden:true},
  // 算命先生即蔺晦之（qihe-map-interactables.md 拍板 21），明面是游方测字；隐藏规则同蔺管事：揭露前不列、不折算
  fortune:{faction:'guijintang',rank:'boss',hidden:true}
 };
 const RANK_WEIGHT={boss:5,member:10,minor:20};
 // 门派关系分档（按下限从高到低排）
 const STAGES=[
  {id:'tuo',name:'托付',min:60},{id:'xin',name:'信赖',min:35},{id:'shu',name:'熟络',min:15},
  {id:'chu',name:'初识',min:0},{id:'leng',name:'冷淡',min:-5},{id:'yan',name:'厌恶',min:-10},
  {id:'chou',name:'仇视',min:-100,hostile:true}
 ];
 // 声誉分档
 const FAME_STAGES=[
  {id:'xia3',name:'侠名远扬',min:60},{id:'xia2',name:'一方称道',min:30},{id:'xia1',name:'有人提起',min:10},
  {id:'none',name:'无闻',min:-9},{id:'e1',name:'有人嘀咕',min:-29},{id:'e2',name:'坏名在外',min:-59},
  {id:'e3',name:'恶名昭著',min:-100}
 ];
 // 各部分上下限（开始部分不进敌对、不进熟络）
 const PART_LIMITS={kaishi:{faction:[-10,14],fame:[-29,29]},peiyang:{faction:[-100,100],fame:[-100,100]},youli:{faction:[-100,100],fame:[-100,100]}};
 // 牵连：哪些原因下降时再扣主事人；表里没有的原因默认−3
 const IMPLICATE_DEFAULT=-3;
 const IMPLICATE={steal_caught:0,steal_caught_kin:0,implicated:0,hostile_win:-3};
 // 事件规则表（数据驱动管线）
 const EVENT_RULES={
  steal_caught:[{op:'fame',amount:{by:'victimIsVillain',map:{true:-1,false:-2}}}],
  hostile_start:[{op:'faction',of:'npc',amount:-5},{op:'fame',amount:{by:'byPlayer',map:{true:-3,false:0}}}],
  hostile_win:[{op:'bond',who:'npc',amount:-10,reason:'hostile_win'},{op:'fame',amount:{by:'byPlayer',map:{true:0,false:1}}}],
  spar_first_win:[{op:'fame',amount:1,once:'npc'}],
  bond:[{op:'fold',amount:{from:'delta'}},{op:'implicate',amount:{by:'reason',map:IMPLICATE},once:'segment'}],
  mend_paid:[{op:'factionSet',of:'payload',value:-10}],
  story:[{op:'factionMany',from:'faction'},{op:'fame',amount:{from:'fame'}}]
 };
 // 档位效果表（门派档位管什么）
 const GATE={
  chou:{trade:'faction_hostile',teach:'faction_hostile',spar:'faction_hostile',ask:'faction_hostile'},
  yan:{trade:'faction_hate',teach:'faction_hate',spar:'faction_hate',ask:'faction_hate'},
  leng:{priceMul:1.1,firstMeet:-2},chu:{firstMeet:0},shu:{priceMul:0.9,firstMeet:2},
  xin:{priceMul:0.85,firstMeet:4},tuo:{priceMul:0.85,firstMeet:6}
 };
 // 声誉档位效果（初见加减、商价、门槛、躲避）
 const FAME_GATE={
  e3:{priceMul:1.1,firstMeet:-6,flee:true},e2:{priceMul:1.1,firstMeet:-4},e1:{firstMeet:-2},
  none:{},xia1:{firstMeet:2},xia2:{firstMeet:4},xia3:{firstMeet:6}
 };
 // 付钱说和：中人列表（培养起）、价钱表
 const MEND_AGENTS=[{id:'shaohe',at:'hangao',price:500}];
 const MEND_PRICE={leng:200,yan:500,chou:1000};
 // 日志、提示里原因的说法（程序代号 → 给玩家看的话）；查不到的显示“其他”
 const REASON_TEXT={bond:'人情往来',gift:'送礼',amends:'赔礼',steal_caught:'偷窃被发觉',steal_caught_kin:'牵连',spar_first_win:'切磋首胜',hostile_start:'翻脸动手',hostile_win:'打赢了仇家',story:'剧情',mend:'说和'};
 window.QiheJianghuData={REASON_TEXT,FACTIONS,GROUP_NAME,REGION_NAME,RANK_NAME,MEMBERS,RANK_WEIGHT,STAGES,FAME_STAGES,PART_LIMITS,IMPLICATE_DEFAULT,IMPLICATE,EVENT_RULES,GATE,FAME_GATE,MEND_AGENTS,MEND_PRICE};
})();
