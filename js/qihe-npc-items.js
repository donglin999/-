'use strict';
// 开始部分人物随身物品 v2（2026-10-27）：新物品定义与商店货单。
// 依据：../xiaojianghu/docs/design/npc-gifts-and-inventory.md 第 11 节“随身物品 v2”（三类：穿戴装备／随身物／商店货）。
// 只放数据：物品名、说明、价值；台词一律在 ink（R-剧情-04）。
// 已有 id 不在这里重定义（qh_rope、qh_tinder、qh_sewing_kit、qh_candy、qh_fried_rice 在 js/qihe-town.js；club、knife 等在 js/menu.js）。
(()=>{
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;
 if(typeof ITEMS==='undefined')return;

 // ── 新物品（第 11.5 节）。q：品阶框色 0 丁／1 丙；price：开始部分物价（两），易物秤按它称；图标都还没有，先用字（ICO）
 const NEW={
  // 2026-10-30 培养部分台词里交到手的东西（评审台第三十轮第 4 题选甲），看过对应场次由 qh-mode-cultivation-core.js 的 CULT_GIFTS 发一次
  gy_wood_bird:{name:'小木鸟',desc:'二师叔手削的小木鸟，翅膀能动。师母塞给你的，叫你别让他看见。',key:1,q:0,ico:'鸟'},
  gy_hand_cloth:{name:'缠手布条',desc:'二师叔给的一卷灰白布条。练剑前把手腕缠上。',key:1,q:0,ico:'布'},
  gy_wrist_guard:{name:'钟拙的护腕',desc:'护具。二师叔做了两天的牛皮护腕，里面夹了竹片。磨碰时能挡一点，刀可挡不住。',armor:5,q:0,ico:'腕'},
  gy_wood_bird_sale:{name:'代卖的木鸟',desc:'二师叔托你带进城代卖的木鸟，卖不掉就拿回来。这件托付还没办。',key:1,q:0,ico:'鸟'},
  pei_lens:{name:'裂镜片',desc:'裴叔裂了的一片镜片，要照样磨一副。裴知古怕压碎，放在你这儿。这件托付还没办。',key:1,q:0,ico:'镜'},
  qh_ration:{name:'随行干粮',desc:'油纸包着的烙饼和咸菜，走远路的人揣在包里。回复 30 气血。',heal:30,price:4,q:0,ico:'粮'},
  qh_storm_lantern:{name:'风灯',desc:'竹骨纸罩、铁提梁的风灯，下雨起风也吹不灭。周婶的东西，借来要还。',key:1,price:8,q:0,ico:'灯'},
  qh_iron_chain:{name:'铁锁链',desc:'差役拿人用的铁链，一头带锁扣，沉甸甸的。',price:12,q:0,ico:'链'},
  qh_hand_wrap:{name:'麻缠护手',desc:'拳类兵器。一副叠麻绑手，掌根补过缝；空手发力时护住指节。',weapon:{kind:'拳',atk:3},price:16,q:0,ico:'缠'},
  qh_herb_pouch:{name:'药香荷包',desc:'佩饰。青布绣花荷包，抽绳收口，绣一枝艾草，散着淡淡药香。（食物、药物恢复量 +30%）',acc:1,fx:{},func:{heal:.3},price:55,q:1,ico:'荷'},
  qh_medical_kit:{name:'行诊药囊',desc:'医具。双层棉药囊，带可拆的小竹筒，出诊时背在身上。占兵器位，进攻弱，治疗招式回得多 22%。',weapon:{kind:'医具',atk:5},func:{skillHeal:.22},price:50,q:1,req:{wis:4},ico:'囊'},   // 目录丙级：攻击 7、治疗 +12%、治疗量 +10%（martial-review/equipment.md），攻击按开始部分丙级刀剑的比例缩
  qh_hidden_dagger:{name:'藏锋短刀',desc:'刀类兵器。宽根窄尖的单刃短刀，偏心铜护手，墨紫缠柄，收在贴身短鞘里。',weapon:{kind:'刀',atk:9},price:50,q:1,req:{agi:4},ico:'刃'}
 };
 for(const[id,it]of Object.entries(NEW)){const{ico,...def}=it;if(!ITEMS[id])ITEMS[id]=def;if(typeof ICO!=='undefined'&&!ICO[id])ICO[id]=ico}

 // ── 商店货（第 11.4 节）：只有功能人物在“买卖”里卖；不进易物秤、不进偷窃。price 单位两（文）。
 // innkeeper 的装备六件＝js/qihe-chapter.js 的 STARTER_STOCK，吃食两样待主会话接进 equipmentShop；
 // apothecary 的买卖待主会话新接（现在点药商只进集市帮忙）；peddler＝js/qihe-town.js 的 GOODS（价格以那边为准，这里只列 id）。
 const SHOPS={
  innkeeper:[{id:'bun',price:6},{id:'wine',price:20},{id:'club'},{id:'cloth'},{id:'needles'},{id:'charm'},{id:'knife'},{id:'mianjia'}],
  apothecary:[{id:'pill',price:20}],
  peddler:[{id:'qh_rope'},{id:'qh_tinder'},{id:'qh_sewing_kit'},{id:'qh_fried_rice'},{id:'qh_candy'}]
 };
 const shopIds=pid=>(SHOPS[pid]||[]).map(x=>x.id);

 window.QIHE_NPC_ITEMS={NEW:Object.keys(NEW),SHOPS,shopIds};
})();
