'use strict';
// Spatial integration only; narrative phase belongs to QiheChapter.
(()=>{
 if(!isQiheEntry())return;
 const D=QIHE_EXPANSION,CP=()=>S?.qiheChapter;
 const ids={central:'qihe_trial',south:'qh_south',east:'qh_east',west:'qh_west',north:'qh_north',refuge:'qh_refuge',mountain:'qh_mountain'};
 const keyOf=sc=>Object.keys(ids).find(k=>ids[k]===sc);
 // 2026-10-19 风起主线批次：本文件的单句台词迁入 story/01-开始/风起-村中路人.ink；这里只按剧本名播放。
 const speak=knot=>StoryRuntime.play(knot,{line:(id,who,text)=>say(who,text)});
 const beforeFire=()=>!CP()||['opening','days','fire'].includes(CP().stage);
 function refresh(){if(!cur)return;syncFire();cur._npcs=npcsOf(cur);spawnWanderers();hud()}
 async function go(key,anchor='entry'){const m=D[key];if(anchor==='entry'&&!m?.anchors.entry)anchor='start';const p=m?.anchors[anchor];if(!p)throw Error('未登记入口 '+key+'/'+anchor);let at=p.slice();const npc=SC[ids[key]].npcs.find(n=>n.sp&&(!n.show||n.show())&&Math.hypot(n.x*TS-at[0],n.y*TS-at[1])<30);if(npc)at[1]+=45;await goScene(ids[key],at.map(v=>v/TS));cur.dark=null;QihePrologue.checkpoint()}
 function node(key,id,name,sp,anchor,act,show=()=>true){const p=Array.isArray(anchor)?anchor:D[key].anchors[anchor];return{id,name,sp,x:p[0]/TS,y:p[1]/TS,dir:'d',fixed:true,idle:false,show,act:async()=>{const token=DialogueStage.begin({id:'qihe-exp:'+id,cast:[{who:'萧白',sp:'c_hero',slot:'left'},{who:name,sp,slot:'right'}].filter(x=>x.sp)});try{return await act()}finally{DialogueStage.end(token);keys={};QihePrologue.checkpoint();refresh()}},verb:sp?'交谈':'进入 / 查看'}}
 function add(key,...args){const n=node(key,...args);SC[ids[key]].npcs.push(n);return n}
 function portal(key,anchor,to,dest,label){return add(key,'exit-'+anchor,label,null,anchor,async()=>{
  if(key==='mountain'&&to==='refuge'){await speak('fq_x_portal_mountain');return}
  if(key==='refuge'&&to!=='mountain'){await speak('fq_x_portal_refuge');return}
  if(!beforeFire()&&!['refuge','mountain'].includes(key)){await QiheChapter.resume();return}
  await go(to,dest);
 })}
 for(const[key,m]of Object.entries(D)){
  ASSETS.push(...[m.bg,m.fg,m.propImg].filter(Boolean));   // 模块化地图（tools_scene/qihe/modular_maps.py）无整图前景，改用道具层 propImg
  const old=SC[ids[key]];SC[ids[key]]={...(old||{}),name:m.name||old.name,region:'qihe_trial',bg:m.bg,fg:m.fg,fgp:m.fgp,props:m.props,propImg:m.propImg,propK:m.propK,water:m.water,mask:m.mask,gw:m.worldSize[0]/TS,gh:m.worldSize[1]/TS,mapv:2,preciseNav:true,revealPlayer:true,previewKey:'qh-exp1:'+key,footX:14,start:(m.start||m.anchors.start).map(v=>v/TS),arrivalWalk:false,noFollow:true,walk:[],block:[],exits:[],npcs:old?.npcs||[]};
 }
 for(const[a,aa,b,bb,label]of[['central','north','north','south','后山采药路'],['central','south','south','north','南村口 / 客栈外院'],['central','west','west','east','西田埂 / 练场'],['central','east','east','west','栖河东埠'],['south','east','east','south','沿河装卸路'],['south','west','west','south','田埂药车道']]){portal(a,aa,b,bb,'前往 · '+label);portal(b,bb,a,aa,'返回 · '+(D[a].name||'栖河村'))}
 const act=(key,...args)=>QiheChapter?.interact?QiheChapter.interact(key,...args):speak('fq_x_wait');
 // 2026-10-08 乔装账房「宋先生」：倒木南侧固定站位。第一、二日坐在倒木前翻账簿（坐姿表），第三日站着等（站姿表）；身旁放着包袱；有待看场景时头顶「!」。素材见 art_sources/qh-song-disguise-20261008。
 const song=add('north','stranger','宋先生','c_qh_song_story',[870,300],()=>act('stranger'),()=>!!window.QiheChapter?.strangerVisible?.());
 Object.defineProperty(song,'sp',{get:()=>CP()?.halfDay>=4?'c_qh_song_story':'c_qh_song_seated',configurable:true});song.mark=()=>!!window.QiheChapter?.strangerPending?.();
 {const baseDraw=drawNpc;drawNpc=function(n,t,near){const im=n===song||n.id==='staged-宋先生'?IMG.r_qh_song_bundle_v1:n.id==='stranger-basket'?IMG.r_qh_song_basket_v1:null;if(ok(im)&&S?.scene==='qh_north'){const x=n.x*TS,y=n.y*TS;g.save();g.imageSmoothingEnabled=false;if(n.id!=='stranger-basket')g.drawImage(im,x-22-im.width,y-im.height+4);else g.drawImage(im,x-im.width/2,y-im.height+6);g.restore()}return baseDraw(n,t,near)};window.drawNpc=drawNpc}
 add('north','stranger-basket','周婶的竹匾',null,[950,305],()=>act('stranger-basket'),()=>CP()?.stage==='days'&&CP().halfDay===0&&!CP().events?.['c1-00b']);
 add('north','tracks','山道痕迹',null,'clue',()=>speak('fq_x_tracks'));
 add('south','merchant','药商','c_opening_apothecary','merchant',()=>act('apothecary'),beforeFire);
 add('south','cloth','店家','c_merchant','innkeeper',()=>CP()?act('innkeeper'):QihePrologue.actions.cloth(),beforeFire);
 add('south','retainer','护院','c_opening_retainer','retainer',()=>speak('fq_x_retainer'),beforeFire);
 add('south','bandit','帮众','c_qh_bandit','bandit',()=>act('bandit'),()=>beforeFire()&&(!CP()||CP().halfDay<4));
 add('east','aide','采办随从','c_opening_procurement_aide','procurement_aide',()=>act('aide'),beforeFire);
 add('east','bailiff','差役','c_opening_bailiff','bailiff',()=>speak('fq_x_bailiff'),beforeFire);
 // 2026-10-23 开发一（opening-errands-rework.md 0.3）：三方三人第一夜不露面，固定剧情正式登场前不上图——
 // 徐令仪在《徐令仪上门》（事件 xu-meeting，第一天傍晚）之后才站到南村口；岑霜、沈雁回在《装卸路》（three-meeting，第二天傍晚）之后才出现。
 // 随从（护院、帮众、采办随从、差役）照旧在。岑霜登场后已在东埠装卸路，南村口那一处因此不再出现（保留站位，条件写全）。
 const metXu=()=>!!CP()?.events?.['xu-meeting'],met3=()=>!!CP()?.events?.['three-meeting'];
 add('south','xulingyi','徐令仪','c_qh_xulingyi_story','steward',()=>act('xulingyi'),()=>beforeFire()&&metXu());
 add('south','censhuang','岑霜','c_qh_censhuang_story','wukui',()=>act('censhuang'),()=>beforeFire()&&met3()&&CP().halfDay<4);
 add('east','shenyanhui','沈雁回','c_qh_shenyanhui_story','procurement',()=>act('shenyanhui'),()=>beforeFire()&&met3());
 add('east','censhuang','岑霜','c_qh_censhuang_story',[690,710],()=>act('censhuang'),()=>beforeFire()&&met3()&&CP()?.halfDay>=4);
 // 2026-10-21：第三天上午陆衡一早去邻村催车（装卸路那场他说的），不在西田埂。
 add('west','luheng','陆衡','c_opening_luheng','luheng',()=>act('luheng'),()=>beforeFire()&&!(CP()?.stage==='days'&&CP().halfDay===4));
 add('west','zhouyan','周砚','c_opening_zhouyan',[1010,600],()=>act('zhouyan'),()=>!!window.QiheChapter?.zhouAtWest?.());
 add('west','training','练场 · 护路棍法',null,'training',()=>act('lesson'),beforeFire);
 add('west','cart','药车停靠处',null,'chen',()=>act('cart'),beforeFire);
 add('west','refuge-road','西行邻村道路',null,'west',async()=>{if(CP()?.stage==='escape')return QiheChapter.resume();await speak('fq_x_westroad')});
 const atRefuge=()=>CP()?.stage==='refuge';
 for(const[key,name,sp]of[['aunt','周婶','aunt'],['chen','陈伯','chen'],['zhouyan','周砚','zhouyan'],['luheng','陆衡','luheng']])add('refuge',key,name,key==='chen'?'c_qh_chen_rest_story':'c_opening_'+sp,key,()=>act(key),atRefuge);
 add('refuge','ye','叶蘅','c_ye',[530,440],()=>act('ye'),atRefuge);
 add('refuge','xulingyi','徐令仪','c_qh_xulingyi_story',[930,540],()=>act('xulingyi'),atRefuge);
 add('refuge','censhuang','岑霜','c_qh_censhuang_story','censhuang',()=>act('censhuang'),atRefuge);
 add('refuge','shenyanhui','沈雁回','c_qh_shenyanhui_story','chengduo',()=>act('shenyanhui'),atRefuge);
 add('refuge','evidence','核对三份来件',null,[880,640],()=>act('evidence'),atRefuge);
 add('refuge','elder','村口老人','c_qh_oldman','elder',()=>speak('fq_x_elder'),atRefuge);
 // 2026-10-23 开发一：邻村对证之后，护院站在徐令仪身后（R2）、差役守在村口老人身边（R3），切磋首场与差役切磋、请教在这里（npc-spar-and-insight.md 2.6 节）。
 // 他们在邻村没有现成台词，墨印里不出“谈”（站位表 talk:false）；交互全部走人物交互框架（js/qihe-npc-ui.js）。
 for(const st of window.QIHE_NPC_DATA?.STATIONS||[]){const n=add(st.key,st.id,QIHE_NPC_DATA.PEOPLE[st.person].name,st.sp,st.at,async()=>{},()=>!!window.QiheNpc?.test(st.when));n.person=st.person;n.talk=st.talk}
 portal('refuge','east','west','west','田埂接应路');portal('refuge','north','mountain','south','上山道路');portal('refuge','south','west','west','村后接应小径');
 // All visible gaps remain reachable; chapter transitions are explained at the actual trail.
 SC.qh_refuge.npcs.find(n=>n.id==='exit-north').act=()=>QiheChapter.routes();
 const atMountain=()=>['mountain','ended','cultivation'].includes(CP()?.stage);
 add('mountain','zhouyan','周砚','c_opening_zhouyan','zhouyan',()=>act('zhouyan'),atMountain);
 add('mountain','ye','叶蘅','c_ye','ye',()=>act('ye'),atMountain);
 add('mountain','xiao-room','萧白的客房',null,'xiao_door',async()=>{S.qiheRoomReturn={key:'mountain',anchor:'xiao_door'};await QihePrologue.goLocal('chen_guest')});
 add('mountain','ye-room','叶蘅的客房',null,'ye_door',()=>speak('fq_x_yeroom'));
 add('mountain','kitchen','厨房门前',null,'kitchen',()=>act('cultivate'));
 add('mountain','meal','客院饭桌',null,'meal',()=>act('meal'));
 add('mountain','practice','院内练场',null,'training',()=>act('cultivate'));
 portal('mountain','south','refuge','north','下山道路');
 // Ye keeps her own schedule; chapter errands do not require her to trail the player.
 const yeLocation=()=>{const p=CP();if(!p)return'house';if(p.stage!=='days')return'none';
  // 2026-10-17 试玩反馈：叶蘅跟着主线走——陪她去东埠送药那一步在东埠，其余时候在村中药铺。
  const m=QiheChapter.MAIN_STEPS?.find(m=>m.to>(p.halfDay||0));return m?.to===4?'east':m?.to===5?'house':'clinic'};
 add('east','daily-ye','叶蘅','c_ye',[600,650],()=>act('ye'),()=>yeLocation()==='east');
 const clinic=SC.prologue_clinic_interior;clinic.npcs.push({id:'daily-ye',name:'叶蘅',sp:'c_ye',x:600/TS,y:650/TS,dir:'l',fixed:true,idle:false,show:()=>yeLocation()==='clinic',act:()=>act('ye')});
 // 2026-10-21 删去“整理旧屋”后，叶家门只在第一夜收药箱前、和第三天上午回叶家收拾药箱时开（那时叶蘅在家）。
 SC.qihe_trial.npcs.find(n=>n.id==='ye-door').show=()=>beforeFire()&&(!S.prologue.relicSeen||CP()?.stage==='days'&&window.QiheChapter?.mainStep?.()?.to===5);
 const homeYe=SC.prologue_ye_house.npcs.find(n=>n.id==='ye');homeYe.show=()=>yeLocation()==='house';const oldHomeYe=homeYe.act;homeYe.act=()=>CP()?.stage==='days'?act('ye'):oldHomeYe();
 const homeZhou=SC.prologue_chen_hall.npcs.find(n=>n.id==='zhouyan');const oldZhou=homeZhou.act,zhouShow=homeZhou.show;homeZhou.show=()=>(!zhouShow||zhouShow())&&!window.QiheChapter?.zhouAtWest?.();homeZhou.act=()=>CP()?.stage==='days'?act('zhouyan'):oldZhou();
 const elderly=SC.qihe_trial.npcs.find(n=>n.id==='elder');elderly.show=()=>beforeFire()&&CP()?.choices?.transport!=='elders';
 // Guests now occupy their functional outer locations, not the residential crossroads.
 SC.qihe_trial.npcs=SC.qihe_trial.npcs.filter(n=>!['bailiff','procurement-aide'].includes(n.id));
 SC.prologue_inn_interior.npcs=SC.prologue_inn_interior.npcs.filter(n=>n.id!=='bandit');const innCounter=SC.prologue_inn_interior.npcs.find(n=>n.id==='innkeeper');Object.assign(innCounter,{name:'柜台留字',sp:null,act:()=>speak('fq_x_counter')});
 SC.prologue_chen_guest.npcs.find(n=>n.id==='guest-out').act=()=>S.qiheRoomReturn?go(S.qiheRoomReturn.key,S.qiheRoomReturn.anchor):QihePrologue.goLocal('chen_hall','guest_door');
 SC.prologue_chen_guest.npcs.find(n=>n.id==='rest').act=()=>CP()?QiheChapter.rest():QihePrologue.rest();
 for(const id of ['qihe_trial','prologue_clinic_interior','prologue_chen_hall','prologue_ye_house'])for(const n of SC[id].npcs){const original=n.show;n.show=()=>beforeFire()&&(!original||original())}
 // A portal belongs to the edited exterior. Room returns retain source-anchor coordinates.
 const names={店家:'qh_merchant',村口老人:'qh_oldman',周婶:'aunt',陈伯:'chen',周砚:'zhouyan',差役:'bailiff',采办随从:'procurement_aide'};
 for(const sc of Object.values(SC))if(sc.region==='qihe_trial')for(const n of sc.npcs||[])if(names[n.name]&&n.sp!=='c_qh_chen_rest_story')n.sp=names[n.name].startsWith('qh_')?'c_'+names[n.name]:'c_opening_'+names[n.name];
 function syncFire(){const sc=SC.qh_east;if(!sc._m)return;const lit=!!S?.qiheChapter?.fireLit;if(sc._fireState===lit)return;sc._cleanMask||=sc._m.slice();sc._m=sc._cleanMask.slice();if(lit)sc._fireVisualSince=performance.now();if(lit)for(let y=478;y<642;y+=2)for(let x=925;x<1192;x+=2)sc._m[Math.floor(y/2)*sc.mask.w+Math.floor(x/2)]=0;sc._fireState=lit;delete sc._nav;}
 SC.qh_east.over=t=>{if(!S?.qiheChapter?.fireLit)return;const growth=clamp((t-(SC.qh_east._fireVisualSince||t-1800))/1800,.18,1);g.save();const glow=g.createRadialGradient(1060,580,8,1060,580,210);glow.addColorStop(0,'#ed8a3538');glow.addColorStop(1,'#ed8a3500');g.fillStyle=glow;g.fillRect(845,370,440,400);
 for(let i=0;i<28;i++){const x=945+i*9,base=615,phase=t/160+i*1.9,h=(32+(Math.sin(phase)+1)*18)*growth;g.globalAlpha=.84*growth;g.fillStyle=i%2?'#d46b32':'#efa649';g.beginPath();g.moveTo(x-7,base);g.quadraticCurveTo(x-12,base-h*.4,x+Math.sin(phase)*9,base-h);g.quadraticCurveTo(x+7,base-h*.5,x+7,base);g.fill();g.fillStyle='#ffdf91';g.fillRect(x-3,base-10,5,10);
 if(i%3===0){const rise=(t/50+i*19)%145;g.globalAlpha=.24*(1-rise/200)*growth;g.fillStyle='#454941';g.beginPath();g.ellipse(x+rise*.28,550-rise,13+rise*.08,12+rise*.1,0,0,Math.PI*2);g.fill();}if(i%4===0){g.globalAlpha=.6;g.fillStyle='#f5bb68';g.fillRect(x+Math.sin(phase)*12,560-(t/35+i*11)%110,2,3)}}g.restore()};
 window.QiheExpansion={syncFire,go,node,add,refresh,keyOf,ids};
})();
