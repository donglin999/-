'use strict';
// 栖河地图可交互物（../xiaojianghu/docs/design/qihe-map-interactables.md 第 3～6、9 节）：D1 现有资源搬家、D4 支线、D5 小动作。
// 台词全在 ink：story/01-开始/村中-*.ink（客栈、景物、货郎、孩子猜字谜）；这里只管站位、开放时段、存档、奖励与选项回传（fq_answer）。
// 规则：活动不耗时（R-时间-01）；起火后村子关闭（第 3 节第 6 条）；景物调查一律走对话框（第 3 节第 7 条）。
// 存档 S.qiheTown（第 9 节字段示意）：tab 三天酒钱、grain 翻谷、pole 断扁担、riddle 猜字谜、well 古井、searched 木桶与箱笼、gossipAt 以物换话。
(()=>{
 if(!isQiheEntry())return;
 const CP=()=>S?.qiheChapter,X=QiheExpansion;
 const days=()=>CP()?.stage==='days',half=()=>CP()?.halfDay??0;
 const beforeFire=()=>!CP()||['opening','days'].includes(CP().stage);
 const town=()=>{const t=S.qiheTown||(S.qiheTown={version:1});t.tab||={stage:'none'};t.grain||={};t.pole||={stage:'none'};t.riddle||={wins:{},used:[]};t.well||={};t.searched||={};return t};
 const play=(knot,vars={},ext={})=>QiheChapter.play(knot,ext,vars);
 const save=()=>QihePrologue.checkpoint();
 async function guarded(fn){if(QiheChapter.running)return;const was=busy;busy=true;keys={};player.path=null;try{return await fn()}finally{busy=was;keys={};save();X.refresh()}}
 async function gain(items={},silver=0){S.bag||={};for(const[id,n]of Object.entries(items))S.bag[id]=(S.bag[id]||0)+n;if(silver)S.silver=(S.silver||0)+silver;save();
  await say('获得',[...Object.entries(items).map(([id,n])=>ITEMS[id].name+' ×'+n),...(silver?['银两 '+silver]:[])].join(' · '))}
 const pay=n=>{if((S.silver||0)<n)return false;S.silver-=n;return true};
 function restore(kind,ratio){try{const d=derived();if(kind==='hp')S.hp=Math.min(d.mhp,(S.hp||0)+Math.round(d.mhp*ratio));else S.mp=Math.min(d.mmp,(S.mp||0)+Math.round(d.mmp*ratio))}catch(e){}}
 // ── 新物品（设计稿第 8 节图标另做；价格暂用，数值待核）──
 Object.assign(ITEMS,{
  qh_rope:{name:'麻绳',desc:'一捆结实的麻绳，捆东西、拴行李都用得着。',price:4,q:0},
  qh_tinder:{name:'火折子',desc:'竹筒里卷着易燃的纸芯，拔开吹一口就着。',price:6,q:0},
  qh_sewing_kit:{name:'针线包',desc:'针、线、顶针缝在一块布里，补衣裳够用。',price:8,q:0},
  qh_candy:{name:'糖块',desc:'麦芽熬的糖块，孩子最爱。',price:2,q:0,heal:5},
  qh_fried_rice:{name:'炒米',desc:'一袋炒熟的米，干嚼也行，泡水也行。路上的干粮。',price:3,q:0,heal:30},
  qh_old_hat:{name:'旧斗笠',desc:'客人落下的旧斗笠，帽檐有点破，遮雨挡太阳还使得。',price:3,q:0},
  qh_flat_stone:{name:'扁石子',desc:'小禾在河边捡的扁石子，磨得光溜溜的。纪念物。',key:1,q:1}
 });
 // ── 客栈（方案 A，5.4）：店家回柜台、帮众坐饮酒桌、住客簿、灶台、箱笼 ──
 // 设计稿的室内坐标（账簿 690,250、灶台 1010,250）落在柜台后、隔板后，人走不到；按实机可达改到柜台前沿、后厨入口（2026-10-27）
 const INN=SC.prologue_inn_interior,inn=(id,name,sp,at,act,show)=>{const n=X.node('central',id,name,sp,at,act,show);INN.npcs.push(n);return n};
 INN.npcs=INN.npcs.filter(n=>!['innkeeper','bandit'].includes(n.id));
 const TAB_FEE=24;   // 帮众三天的酒钱（数值待核）
 const tabOpen=()=>days()&&half()<=3&&town().tab.stage!=='done';
 const banditIn=()=>beforeFire()&&!(CP()&&half()>=4);
 inn('innkeeper','店家','c_qh_merchant',[845,385],async()=>{
  if(!CP())return QihePrologue.actions.cloth();
  const t=town().tab;
  if(t.stage==='done'&&!t.thanked)return guarded(async()=>{t.thanked=true;await play('qh_inn_tab_done',{via:t.via})});
  if(tabOpen()&&banditIn()&&t.stage==='none')return guarded(async()=>{t.stage='offered';const pick=await play('qh_inn_tab_offer',{can_cen:!!CP()?.events?.['three-meeting'],can_pay:(S.silver||0)>=TAB_FEE});if(pick==='pay')return tabPay()});
  if(tabOpen()&&t.stage==='offered'&&(S.silver||0)>=TAB_FEE&&t.againAt!==half())return guarded(async()=>{t.againAt=half();if(await play('qh_inn_tab_again')==='pay')await tabPay()});   // 每个时段提一次，不选结账就收住
  // 2026-10-30 风声（偷窃失手累计）可以在客栈花钱压下去，每级 10 两；每个时段问一次（评审台第三十轮第 3 题，照八方旅人“找酒馆的人”）
  const st=window.QiheSteal?.state?.(),lv=st?Object.values(st.rumor||{}).reduce((a,n)=>a+n,0):0;
  if(lv>0&&t.rumorAt!==half())return guarded(async()=>{t.rumorAt=half();const fee=Math.min(lv,3)*10;if(await play('qh_inn_rumor',{fee:String(fee),can_fee:(S.silver||0)>=fee})==='pay'&&pay(fee)){st.rumor={};toast('风声压下去了',1400);save()}});
  return QiheChapter.interact('innkeeper')},beforeFire).mark=()=>tabOpen()&&banditIn()&&town().tab.stage==='none'||town().tab.stage==='done'&&!town().tab.thanked;
 async function tabPay(){if(!pay(TAB_FEE))return;await play('qh_inn_tab_pay');tabDone('pay')}
 function tabDone(via){const t=town().tab;t.stage='done';t.via=via;save();toast('三天酒钱 · 已了结',1600)}
 inn('bandit','帮众','c_qh_bandit',[400,500],async()=>{
  if(tabOpen()&&town().tab.stage==='offered')return guarded(async()=>{if(await play('qh_inn_tab_face_ask')!=='face')return QiheChapter.interact('bandit');await play('qh_inn_tab_face');tabDone('face')});
  return QiheChapter.interact('bandit')},banditIn);
 inn('inn-book','住客簿',null,[700,300],()=>guarded(()=>play('qh_inn_book')),()=>!!CP());
 inn('inn-stove','后厨灶台',null,[890,420],()=>guarded(async()=>{const t=town(),free=t.tab.stage==='done';
  if(t.soupAt===half())return play('qh_inn_soup_full');if(!free&&!pay(1))return play('qh_inn_soup_poor');   /* 2026-10-29：汤价按“一两”台词改 1 */t.soupAt=half();await play('qh_inn_soup',{free});restore('mp',.2)}),()=>!!CP()&&beforeFire());
 inn('inn-chest','里间箱笼',null,[990,470],()=>guarded(async()=>{const t=town();if(t.tab.stage!=='done')return play('qh_inn_chest_locked');if(t.searched.chest)return play('qh_inn_chest_empty');
  const pick=await play('qh_inn_chest');if(!pick)return;t.searched.chest=pick;await gain({[pick==='tinder'?'qh_tinder':'qh_old_hat']:1})}),()=>!!CP());
 // 岑霜那头：找她结账（第二天傍晚登场后才开；qihe-representatives.js 交谈前调用）
 async function cenOffer(){if(!(tabOpen()&&town().tab.stage==='offered'&&CP()?.events?.['three-meeting']))return false;if(await play('qh_inn_tab_cen_ask')!=='tab')return false;await play('qh_inn_tab_cen');tabDone('cen');return true}
 // ── 南村口：店家、帮众搬进客栈；原站位放菜牌（S1）；茶棚边木桶（S2）──
 const south=SC[X.ids.south];south.npcs=south.npcs.filter(n=>!['cloth','bandit'].includes(n.id));
 Object.assign(X.add('south','inn-menu','客栈外院菜牌',null,[580,352],()=>guarded(()=>play('qh_inn_menu')),()=>!!CP()&&beforeFire()),{prop:'prop_qh_inn_menu_board_fit_20261027',block:[30,8]});
 // ── 木桶（W3、S2）：每处只能翻一次（大侠立志传“破罐碎银”的简化版）──
 const barrel=(key,id,at,loot)=>X.add(key,id,'旧木桶',null,at,()=>guarded(async()=>{const t=town();if(t.searched[id])return play('qh_barrel_empty');t.searched[id]=true;await play('qh_barrel',{kind:loot.kind});await gain(loot.items||{},loot.silver||0)}),()=>!!CP()&&beforeFire());
 barrel('west','barrel-west',[540,260],{kind:'silver',silver:5});
 barrel('south','barrel-south',[1250,300],{kind:'rope',items:{qh_rope:1}});
 // ── 告示招工（C6）＋晒谷场翻谷（W1、Q4）＋粮仓（C5）──
 const grainOpen=()=>days()&&half()<=4&&!town().grain.done;
 {const central=SC[X.ids.central],sign=central.npcs.find(n=>n.id==='notice');if(sign){const old=sign.act;sign.act=async(...a)=>{await old(...a);if(grainOpen()&&!town().grain.seen){town().grain.seen=true;await play('qh_notice_work');save()}}}}
 const grainAct=()=>guarded(async()=>{if(!grainOpen())return play('qh_grain_idle');if(await play('qh_grain_turn')!=='done')return;town().grain.done=true;await gain({qh_fried_rice:1})});
 // 2026-10-27 用户：晒谷场“硬生生嵌到背景里”——从山脚草地挪到路口的空地上（晒谷本来就在场院、路边），压色版
 X.add('west','grain-yard','晒谷场',null,[520,440],grainAct,beforeFire).prop='prop_qh_grain_mat_fit_20261027';
 Object.assign(X.add('west','grain-heap','谷堆',null,[450,505],grainAct,beforeFire),{prop:'prop_qh_grain_heap_fit_20261027',block:[34,13]});
 // 2026-10-30 用户（评审台第二十四轮第 3 题）：粮仓没有剧情就清掉——不再摆粮仓、不再可查看；素材 prop_qh_granary_fit_20261027 留着不删。
 // ── 古井（C1）：看刻痕、打水喝（每时段一次，回少量气血）、丢颗石子听响（冷读：饮水井里丢钱不合村里习惯）──
 // 2026-10-27 井台石板撤掉：整块灰石板压在草地上太显眼（用户：新素材硬生生嵌在背景里）
 Object.assign(X.add('central','well','古井',null,[1300,775],()=>guarded(async()=>{const w=town().well,pick=await play('qh_well',{drank:w.drinkAt===half()});
  if(pick==='drink'){w.drinkAt=half();restore('hp',.15)}else if(pick==='coin')await play('qh_well_coin')}),beforeFire),{prop:'prop_qh_well_fit_20261027',block:[58,22]});
 // ── 货郎（C4、Q6）：卖杂货、收山货、断扁担、以物换话 ──
 const GOODS=['qh_rope','qh_tinder','qh_sewing_kit','qh_fried_rice','qh_candy'],BUYS={qh_dry_branch:2,qh_river_reed:2,qh_wild_herb:3};
 const peddlerHere=()=>days()&&half()<=5;
 const pole=()=>town().pole;
 X.add('central','peddler','货郎','c_qh_huolang',[960,640],   // 2026-10-27 从古井边草地挪到大路上（用户：“要么直接放大道上”）
 ()=>guarded(async()=>{const p=pole(),t=town();
  if(p.stage==='fixed')return polePaid();
  const pick=await play('qh_peddler_talk',{pole_new:p.stage==='none'&&half()<=4,pole_wait:p.stage==='carry',gossip:p.stage==='done'&&t.gossipAt!==half()&&Object.keys(BUYS).some(id=>(S.bag?.[id]||0)>0)});
  if(pick==='buy')return shop();if(pick==='sell')return sell();if(pick==='pole'){if(await play('qh_peddler_pole')==='take'){p.stage='carry';save();toast('已接：断了的扁担',1600)}return}
  if(pick==='gossip')return gossip()}),peddlerHere).mark=()=>pole().stage==='fixed'||pole().stage==='none'&&days()&&half()<=4;
 // 货郎担：扁担修好前是断扁担的样子；跟货郎并排、挡路
 Object.assign(X.add('central','peddler-load','货郎担',null,[1045,655],()=>SC[X.ids.central].npcs.find(n=>n.id==='peddler').act(),peddlerHere),{block:[44,13]});
 Object.defineProperty(SC[X.ids.central].npcs.find(n=>n.id==='peddler-load'),'prop',{get:()=>['fixed','done'].includes(pole().stage)?'prop_qh_peddler_load_fit_20261027':'prop_qh_peddler_load_broken_fit_20261027'});
 // 2026-10-27 买卖统一（用户：「以物易物和买东西是两套系统」）：货单读 js/qihe-npc-items.js 的 SHOPS，商店货不上易物秤、不能偷；货郎、药商还收山货
 const SELL_TO={peddler:BUYS,apothecary:{qh_wild_herb:3,qh_river_reed:2}};
 const priceOf=x=>x.price??ITEMS[x.id]?.price??1;
 // 2026-10-27 买卖改成交易面板（js/qihe-gift-ui.js shop；用户：“应该是有个交易 ui，而不是直接一个对话框”）；面板没加载时退回旧的选项框
 // 九折（用户第二十三轮 6）：客栈三天酒钱了结后，店家卖的兵器、护具、佩饰打九折，作谢礼
 const isGear=id=>{const it=ITEMS[id];return!!it&&!!(it.weapon||it.armor||it.acc||typeof mnSlot==='function'&&mnSlot(id))};
 // 行商牙牌（js/qihe-acc-fx.js）：队里有人戴着，所有货买价再 −12%，和九折相乘
 function discountFor(pid,list){const tab=pid==='innkeeper'&&town().tab.stage==='done',fx=window.QiheAccFx,o={};
  for(const x of list){let p=priceOf(x);if(tab&&isGear(x.id))p=Math.max(1,Math.round(p*0.9));if(fx)p=fx.buy(p);if(p!==priceOf(x))o[x.id]=p}return o}
 const offNote=pid=>[pid==='innkeeper'&&town().tab.stage==='done'?'了结酒钱的谢礼 · 九折':'',window.QiheAccFx?.team('buy')?'行商牙牌 · 买价 −12%':''].filter(Boolean).join('　')
 async function openShop(pid){const list=(window.QIHE_NPC_ITEMS?.SHOPS?.[pid]||GOODS.map(id=>({id}))).filter(x=>ITEMS[x.id]).map(x=>({id:x.id,price:priceOf(x)}));const buys=SELL_TO[pid];
  const p=window.QIHE_NPC_DATA?.PEOPLE?.[pid],npc=p&&(cur?._npcs||cur?.npcs||[]).find(n=>(p.npc||[p.name]).includes(n.name));
  if(window.QiheGiftUI?.shop&&p&&typeof HTMLElement!=='undefined'){const off=discountFor(pid,list);await QiheGiftUI.shop(npc,p,{list,buys,off,offNote:Object.keys(off).length?offNote(pid):'',say:({innkeeper:'客官要点什么？',apothecary:'金疮药，治外伤最灵。',peddler:'针头线脑、火折子，要啥有啥！'})[pid]||''});save();return}
  for(;;){const rows=list.map(x=>`${ITEMS[x.id].name} · ${window.QiheAccFx?QiheAccFx.buy(x.price):x.price} 两`);const opts=[...rows,...(buys?['卖点山货']:[]),'不买了'];const n=await choose('','你身上有银两 '+(S.silver||0)+'。买哪样？',opts,undefined,opts.length-1);
   if(n<list.length){const x=list[n],pr=window.QiheAccFx?QiheAccFx.buy(x.price):x.price;if(!pay(pr)){toast('银两不够',1500);continue}await gain({[x.id]:1});continue}
   if(buys&&n===list.length){await sellTo(buys);continue}return}}
 async function sellTo(buys){const have=Object.keys(buys).filter(id=>(S.bag?.[id]||0)>0);if(!have.length)return toast('身上没有他收的山货',1800);
  const n=await choose('','卖哪样？（一次卖一件）',[...have.map(id=>`${ITEMS[id].name} · ${buys[id]} 两（有 ${S.bag[id]}）`),'不卖了'],undefined,have.length);const id=have[n];if(!id)return;S.bag[id]--;S.silver=(S.silver||0)+buys[id];save();toast(`卖了 ${ITEMS[id].name} · 银两 +${buys[id]}`,1500)}
 const shop=()=>openShop('peddler');
 async function sell(){return sellTo(BUYS)}
 async function gossip(){const have=Object.keys(BUYS).filter(id=>(S.bag?.[id]||0)>0);const n=await choose('','拿哪样换句闲话？',[...have.map(id=>ITEMS[id].name),'算了'],undefined,have.length);const id=have[n];if(!id)return;
  S.bag[id]--;town().gossipAt=half();await play('qh_peddler_gossip',{kind:{qh_dry_branch:'branch',qh_river_reed:'reed',qh_wild_herb:'herb'}[id]})}
 async function polePaid(){const p=pole();p.stage='done';await play('qh_peddler_pole_done');await gain({qh_sewing_kit:1})}
 // 陈伯门厅：带着断扁担去找他（陈伯的门厅交互已由 qihe-expansion.js 包过一层短棍，这里再包一层）
 {const chen=SC.prologue_chen_hall.npcs.find(n=>n.id==='chen');const old=chen.act,oldMark=chen.mark;
  chen.act=async(...a)=>{if(pole().stage==='carry'&&days())return guarded(async()=>{await play('qh_pole_chen');pole().stage='fixed';save();toast('扁担修好了 · 回村心交给货郎',1600)});return old(...a)};
  chen.mark=()=>pole().stage==='carry'&&days()||!!oldMark?.()}
 // ── 孩子猜字谜（C2、R1，5.3）：每个时段一局三题；谜题按天分三档，同一题不重复 ──
 const KIDS=()=>days()&&half()<=4;
 const RIDDLES={1:['gao','zhong','ka','na','si','cha'],2:['pang','nai','lv','ming','hao','zao'],3:['she','tun','fen','yan','qing','chuang']};   // 题在 story/01-开始/村中-猜字谜.ink
 const tierNow=()=>half()<=1?1:half()<=3?2:3;
 async function riddleRound(){const r=town().riddle;if(r.playedAt===half())return play('qh_kids_played');r.playedAt=half();
  await play('qh_kids_open');const tier=tierNow(),pool=RIDDLES[tier].filter(id=>!r.used.includes(id));let full=0;
  for(const id of pool.slice(0,3)){r.used.push(id);const a=await play('qh_riddle_'+id);if(a==='right')full++}
  const win=full>=3&&pool.length>=3,first=win&&!r.wins[tier];if(win)r.wins[tier]=(r.wins[tier]||0)+1;const all=[1,2,3].every(k=>r.wins[k]);
  await play('qh_kids_end',{result:win?'win':'lose',all:all&&!r.stone});
  if(first)await gain(tier===1?{qh_candy:1}:{},tier===1?0:1);if(all&&!r.stone){r.stone=true;await gain({qh_flat_stone:1})}}
 X.add('central','ashuan','阿栓','c_qh_ashuan',[1440,640],   // 2026-10-27 孩子也挪到大路上
 ()=>guarded(riddleRound),KIDS);
 X.add('central','xiaohe','小禾','c_qh_xiaohe',[1490,655],()=>guarded(riddleRound),KIDS);
 const refugeKids=()=>CP()?.stage==='refuge';
 // 2026-10-29 逻辑排查：在村里一题都没猜过的（riddle.used 为空），撤离后孩子不来要“最后一题”，只说一句闲话
 const lastRiddle=()=>guarded(async()=>{const r=town().riddle;if(!r.used?.length)return play('qh_kids_refuge_idle');if(r.last)return play('qh_kids_last_done');r.last=true;const wins=[1,2,3].filter(k=>r.wins[k]).length;await play('qh_kids_last',{many:wins>=2});await play('qh_riddle_last')});
 X.add('refuge','ashuan','阿栓','c_qh_ashuan',[330,570],lastRiddle,refugeKids);
 X.add('refuge','xiaohe','小禾','c_qh_xiaohe',[372,585],lastRiddle,refugeKids);
 // ── 道具绘制与挡路（素材 assets/production/maps/town-props-20261027，世界尺寸＝源像素 × 0.78125）──
 // 节点带 prop 就先画这张图（底边中点为锚；地面层 propTop 以上沿为锚，站上去的人都画在它上面），跟人物一起按纵坐标排序；block 是脚下挡路的椭圆半轴
 const PROP_K=.78125,TOWN_PROPS=['prop_qh_grain_mat_fit_20261027','prop_qh_grain_heap_fit_20261027','prop_qh_peddler_load_fit_20261027','prop_qh_peddler_load_broken_fit_20261027','prop_qh_fortune_stall_fit_20261027','prop_qh_well_fit_20261027','prop_qh_inn_menu_board_fit_20261027'];   // 2026-10-27 只载压色版（art_sources/qihe-props-fit-20261027）；v1、v2 原件留在素材库不加载
 ASSETS.push(...TOWN_PROPS);
 {const grain=SC[X.ids.west].npcs.find(n=>n.id==='grain-yard');grain.propTop=true;}
 // 算命摊：摆在算命先生身前（js/qihe-lamp-watcher.js 的 fortune 站在摊后）
 Object.assign(X.add('central','fortune-stall','算命摊',null,[1005,362],()=>window.QiheLamp?.fortuneTalk(),()=>!!window.QiheLamp&&days()&&half()<=4&&!QiheLamp.exposed()),{prop:'prop_qh_fortune_stall_fit_20261027',block:[44,12]});
 {const base=drawNpc;drawNpc=function(n,t,near){if(!n.prop)return base(n,t,near);const im=IMG[n.prop],x=n.x*TS,y=n.y*TS;let top=y;
   if(ok(im)){const w=im.width*PROP_K,h=im.height*PROP_K;top=n.propTop?y:y-h;g.save();g.imageSmoothingEnabled=false;
   if(!n.propTop){g.fillStyle='rgba(28,24,12,.28)';g.beginPath();g.ellipse(x,y-2,w*.46,Math.max(5,h*.07),0,0,Math.PI*2);g.fill()}   // 2026-10-27 贴地阴影：用户说新道具“硬生生嵌到背景里”，脚下压一圈淡影落地
   g.drawImage(im,Math.round(x-w/2),Math.round(top),Math.round(w),Math.round(h));g.restore()}
   if(n.sp)return base(n,t,near);if(near&&near.o===n)label(n.name,x,top-8)};window.drawNpc=drawNpc}
 {const base=standOk;standOk=function(x,y){if(!base(x,y))return false;const ns=cur?.npcs;if(!ns)return true;for(const n of ns){if(!n.block||!n.prop||(n.show&&!n.show()))continue;const cx=n.x*TS,cy=n.y*TS-n.block[1]*.6,dx=(x-cx)/n.block[0],dy=(y-cy)/n.block[1];if(dx*dx+dy*dy<1)return false}return true};window.standOk=standOk}
 window.QiheTown={shop:pid=>guarded(()=>openShop(pid)),town,cenOffer,RIDDLES,tierNow,GOODS,BUYS,TAB_FEE};
})();
