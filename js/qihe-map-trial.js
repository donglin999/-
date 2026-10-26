'use strict';
// QH-P2: complete prologue on the legacy-character map branch.
(()=>{
 if(!isQiheEntry())return;
 const D=QIHE_MAP_DATA,R=QIHE_ROOMS;
 const fresh=()=>({version:2,errands:{bowls:'none',cloth:'none',medicine:'none'},carry:{},heard:{},relicSeen:false,rested:false,ending:false,yeHousePermission:false,arrival:{version:1,stage:'encounter',borrowed:false,originExpression:null,dogResult:null,greeted:{}}});
 const state=()=>S.prologue||(S.prologue=fresh());
 const checkpoint=()=>{S.x=player.x;S.y=player.y;save();hud()};
 // 2026-10-18 第 2 期：第一夜（周婶托付、三件小事、叶家邀请与药箱、过夜、村中查看）的台词改由 ink 剧本提供（story/01-开始/第一夜-*.ink）。
 // 这里只保留游戏函数实现与流程入口；台词、顺序、条件、接取与交物都以剧本为准，不要在 JS 里再写这些场景的台词。
 const story=(knot,externals={},vars={})=>StoryRuntime.play(knot,{line:(id,w,t)=>say(w,t),vars,externals:{
  checkpoint:()=>checkpoint(),
  toast_for:(t,ms)=>toast(t,ms),
  carry:(k,n)=>{state().carry[k]=n},
  uncarry:k=>{delete state().carry[k]},
  go_scene:(scene,anchor)=>goLocal(scene.replace(/^prologue_/,''),anchor),
  ...externals}});
 const actions=createQiheActions({play:knot=>story(knot)});
 // 2026-10-23 剧本二：周婶三件合成一条「替周婶跑一圈」（opening-errands-rework.md 0.1 乙-1）。存档仍用 errands 的三个键，任务进度从三个键推导，
 //   不另存汇总状态；旧档（三件分开接过的）照样能读。三步：陈伯家还碗 → 客栈取布 → 村南送药取篮，做完回药棚交差。
 const taskNames={bowls:'还碗',cloth:'取布',medicine:'送药与还篮'};
 const pending=()=>Object.entries(state().errands).filter(([,v])=>['accepted','collected','delivered'].includes(v));
 const ROUND_STEPS=[['bowls','陈伯家还碗',{accepted:'碗还没送'}],['cloth','客栈取布',{accepted:'布还没取'}],['medicine','村南老人家送药、带回竹篮',{accepted:'药还没送'}]];
 const roundState=()=>{const e=state().errands,v=Object.values(e);if(v.every(x=>x==='none'))return'none';if(v.every(x=>x==='done'))return'done';if(v.every(x=>['done','closed','none'].includes(x)))return v.includes('done')?'partial':'closed';if(e.bowls==='done'&&['collected','done'].includes(e.cloth)&&['delivered','done'].includes(e.medicine))return'return';return'taken'};
 const roundLeft=()=>{const e=state().errands;return ROUND_STEPS.filter(([k,,m])=>m[e[k]]).map(([k,,m])=>m[e[k]])};
 const roundText=()=>{const e=state().errands,r=roundState();if(r==='none')return'可选 · 尚未接受';if(r==='closed')return'没办完，已由周婶收尾';
  const marks=ROUND_STEPS.map(([k,t],i)=>'第'+'一二三'[i]+'步 '+t+(['done','collected','delivered'].includes(e[k])?'（已办）':e[k]==='closed'?'（没办，已收尾）':'（未办）')).join('；');
  return marks+(r==='done'?'。已回药棚交差。':r==='partial'?'。':r==='return'?'。三处都办完了，回药棚交差。':'。办完回药棚交差。')};
 const point=(scene,key)=>scene==='village'?D.anchors[key]:R[scene].anchors[key];
 async function goLocal(scene,key=scene==='village'?'start':'entry'){
  const id=scene==='village'?'qihe_trial':'prologue_'+scene,p=point(scene,key);
  if(!p||!SC[id])throw Error('未登记的序章门口：'+scene+'/'+key);
  await goScene(id,p.map(v=>v/TS));checkpoint();
 }
 // 叶家门口：寒暄＋收药箱邀请（story/01-开始/第一夜-问候.ink qihe_ye_invite）
 const inviteHome=()=>story('qihe_ye_invite');
 // 药棚周婶：接下「替周婶跑一圈」、回来交差（第一夜-周婶托付.ink）。交差时剧本把 prologue.errandGift 记成 true，
 //   这里补发谢礼一盒金创药（复用 ITEMS.pill，只发一次，另记 errandGiftPaid）。
 const aunt=async()=>{await story('qihe_errand_aunt');const p=state();if(p.errandGift===true&&!p.errandGiftPaid){p.errandGiftPaid=true;if(typeof giveItem==='function'&&ITEMS.pill)giveItem('pill',1);checkpoint()}};
 // 过夜（第一夜-过夜.ink）：已经过完且风起栖河已加载时直接转入风起栖河；resuming 为读档时正处在过夜途中
 async function rest(resuming=false){
  const p=state();if(p.rested&&window.QiheChapter)return QiheChapter.begin();
  await story('qihe_first_night',{
   go_scene:async(scene,anchor)=>{await goLocal(scene.replace(/^prologue_/,''),anchor);busy=true},
   night_falls:()=>fade(async()=>{cur.dark='rgba(13,22,32,.32)'}),
   hand_off_first_night:()=>{p.carry={};p.handoff={chapter:'风起栖河',origin:p.arrival.originExpression,heard:{...p.heard},noteOwner:'叶蘅',relicOwner:'叶蘅',lodging:'陈伯独立客房'}}
  },{resuming});
 }
 function wrap(name,fn){return async(...args)=>{
  const token=DialogueStage.begin({id:'qihe:'+name,cast:[{who:'萧白',sp:'c_hero',slot:'left'},...(name==='叶蘅'?[{who:'叶蘅',sp:'c_ye',slot:'right'}]:[])]});
  try{return await fn(...args)}finally{DialogueStage.end(token);keys={};checkpoint()}
 }}
 function node(scene,id,name,sp,anchor,act,mark){const p=Array.isArray(anchor)?anchor:point(scene,anchor);return {id,name,sp,x:p[0]/TS,y:p[1]/TS,dir:'d',fixed:true,idle:false,act:wrap(name,act),mark,verb:sp?'交谈':'查看 / 进入'}}
 const v=(...a)=>node('village',...a),r=(scene,...a)=>node(scene,...a);
 ASSETS.push('m_qihe_trial_v1','m_qihe_trial_v1_fg');
 SC.qihe_trial={name:'栖河村 · 暮色初起',region:'qihe_trial',bg:'m_qihe_trial_v1',fg:'m_qihe_trial_v1_fg',fgp:D.fgp,gw:60,gh:40,mapv:2,preciseNav:true,previewKey:'qihe-v1',footX:14,mask:D.mask,start:D.anchors.start.map(v=>v/TS),startDir:'d',arrivalWalk:false,walk:[],block:[],exits:[],noFollow:true,npcs:[
  v('ye-door','叶家 · 应邀帮忙收药箱',null,'ye-home',inviteHome,()=>!state().relicSeen),
  v('chen-door','陈伯家 · 门厅与独立客房',null,'chen-home',()=>goLocal('chen_hall')),
  v('clinic-door','药棚 · 周婶',null,'clinic',()=>goLocal('clinic_interior')),
  v('inn-door','客栈 · 店家',null,'inn',()=>goLocal('inn_interior')),
  v('elder','村口老人','c_oldman',D.anchors['elder-home'].map((a,i)=>a+(i===0?45:0)),actions.elder,()=>state().errands.medicine==='accepted'),
  v('notice','村中路牌',null,'notice',()=>story('qihe_look_sign')),
  v('rack','客栈晒架',null,'cloth-rack',()=>story('qihe_look_rack')),
  v('herbs','药棚晒药处',null,'herbs',()=>story('qihe_look_herbs'))
 ]};
 // Compatibility coordinates for the reused fixed opening: source anchors become world/3.
 window.CHAPTER1_V2_MAPS={};
 for(const[key,m]of Object.entries(R)){
  // 2026-10-21 整改：室内也开 revealPlayer——主角走到柜台、屏风、前矮墙后时补画半透明人形，不再整个人消失（js/scene.js drawScene 末尾）。
  ASSETS.push(m.bg,m.fg);CHAPTER1_V2_MAPS[key]={anchors:Object.fromEntries(Object.entries(m.anchors).map(([k,p])=>[k,p.map(v=>v/3)])),worldSize:m.worldSize};
  SC['prologue_'+key]={name:m.name,region:'qihe_trial',bg:m.bg,fg:m.fg,fgp:m.fgp,mask:m.mask,gw:30,gh:20,mapv:2,footX:14,preciseNav:true,previewKey:'qihe-room:'+key,revealPlayer:true,start:m.start.map(v=>v/TS),startDir:'u',arrivalWalk:false,noFollow:true,isRoom:true,walk:[],block:[],exits:[],npcs:[]};
 }
 const out=(key,label,anchor,destination)=>r(key,key+'-out',label,null,anchor,()=>goLocal('village',destination));
 SC.prologue_clinic_interior.npcs=[out('clinic_interior','药棚前门 · 回村','exit','clinic'),r('clinic_interior','aunt','周婶','c_gossip','aunt',aunt,()=>pending().length>0),r('clinic_interior','work','备药案',null,'work',()=>story('qihe_look_work'))];
 SC.prologue_ye_house.npcs=[out('ye_house','叶家前门 · 回村','exit','ye-home'),r('ye_house','ye','叶蘅','c_ye','relic',actions.relic,()=>!state().relicSeen)];
 SC.prologue_inn_interior.npcs=[out('inn_interior','客栈前门 · 回村','exit','inn'),r('inn_interior','innkeeper','店家','c_merchant','host',actions.cloth,()=>state().errands.cloth==='accepted')];
 SC.prologue_chen_hall.npcs=[out('chen_hall','陈家前门 · 回村','exit','chen-home'),r('chen_hall','chen','陈伯','c_oldman','chen',actions.chen,()=>state().errands.bowls==='accepted'),r('chen_hall','guest-door','东侧内门 · 借宿客房',null,'guest_door',()=>goLocal('chen_guest'))];
 SC.prologue_chen_guest.npcs=[r('chen_guest','guest-out','回陈伯家门厅',null,'exit',()=>goLocal('chen_hall','guest_door')),r('chen_guest','rest','借宿榻 · 收拾歇息',null,'rest',()=>rest(),()=>state().relicSeen&&!state().rested),r('chen_guest','phone','自己的现代衣包',null,'modern',()=>story('qihe_look_phone'))];
 for(const [id,name,sp,xy]of[['night-chen','陈伯','c_oldman',[700,620]],['night-aunt','周婶','c_gossip',[850,665]]]){
  const n=r('ye_house',id,name,sp,xy.map(v=>v*R.ye_house.sourceScale),async()=>{});n.show=()=>state().ending;SC.prologue_ye_house.npcs.push(n);
 }
 // Static supporting cast: standing clear of doors, with no free-roaming or new action sheets.
 SC.prologue_chen_hall.npcs.push(r('chen_hall','zhouyan','周砚','c_zhou',[560,680].map(v=>v*R.chen_hall.sourceScale),()=>story('qihe_chen_zhouyan')));
 SC.prologue_inn_interior.npcs.push(r('inn_interior','bandit','帮众','c_bandit',[760,600].map(v=>v*R.inn_interior.sourceScale),()=>story('qihe_inn_bandit')));
 SC.qihe_trial.npcs.push(v('bailiff','差役','c_soldier',D.anchors['elder-home'].map((v,i)=>v+(i===0?-60:12)),()=>story('qihe_village_bailiff')),
  v('procurement-aide','采办随从','c_villager',D.anchors['elder-home'].map((v,i)=>v+(i===0?145:-5)),()=>story('qihe_village_aide')));
 const priorQuest=questLine;questLine=function(){if(!isQiheEntry()||!S?.prologue)return priorQuest();const p=state();if(p.rested)return'回陈伯家客房歇息，第二天在村里走访';if(p.arrival.stage!=='done')return'与叶蘅一起下山，到村里歇脚';if(p.ending)return'与叶蘅道别，回陈伯客房过夜';const r=roundState();if(!p.relicSeen)return'去西北叶家帮忙收药箱 · '+(r==='none'?'替周婶跑一圈（可不做）':r==='return'?'替周婶跑一圈：回药棚交差':pending().length?'替周婶跑一圈：'+roundLeft().join('，'):'替周婶跑一圈已办完');if(r==='return')return'回药棚找周婶交差，或回陈伯独立客房歇息';if(pending().length)return'替周婶跑一圈：'+roundLeft().join('，')+' · 也可回陈伯客房歇息';return'回东北陈伯家，经门厅东侧进客房歇息'};window.questLine=questLine;
 const oldLog=questLog;questLog=function(){return isQiheEntry()?[...(state().rested?[]:[{t:'眼下',d:esc(questLine()),done:false}]),...(window.QiheMilestones?.list(S)||[]).map(m=>({t:m.t,group:'江湖经历',d:m.d,done:true}))]:oldLog()};
 const oldSide=mnQuests;mnQuests=function(){if(!isQiheEntry())return oldSide();const r=roundState();return[{t:'替周婶跑一圈',giver:'周婶',d:esc(roundText()),done:['done','partial','closed'].includes(r),closed:r==='closed'}]};
 async function journal(){if(busy||dlgBusy||mode!=='scene')return;busy=true;keys={};player.path=null;try{const p=state();const text=[questLine(),...mnQuests().map(q=>q.t+'：'+q.d)].join('\n');const i=await choose('行程',text,['继续游玩','保存进度','从头重新开始']);if(i===1){checkpoint();toast('进度已保存',1200)}if(i===2&&await choose('','重新开始会覆盖这条分支的进度。',['保留进度','重新开始'])===1){S=null;localStorage.removeItem(saveKey());busy=false;await start(true)}}finally{busy=false;keys={};hud()}}
 let completion=null;
 async function start(force=false){
  const old=force?null:loadSave();S=old?.prologue?.version===2&&SC[old.scene]?old:newState();S.name='萧白';
  if(!old||S!==old){S.prologue=fresh();S.scene='prologue_backhill';S.party=[];S.pet=null;S.unlocked={};const d=derived();S.hp=d.mhp;S.mp=d.mmp}
  state();mode='scene';cur=SC[S.scene]||SC.qihe_trial;buildGrid(cur);player.x=Number.isFinite(S.x)&&S===old?S.x:cur.start[0]*TS;player.y=Number.isFinite(S.y)&&S===old?S.y:cur.start[1]*TS;
  Object.assign(player,{dir:'d',vx:0,vy:0,path:null,goal:null,talkTo:null,trail:[],anim:null,alpha:1});keys={};$('panel').hidden=true;spawnWanderers();snapCam();cur.dark=state().rested?'rgba(13,22,32,.32)':null;hud();placeName(cur.name);
  if(!document.getElementById('qihe-journal')){const b=document.createElement('button');b.id='qihe-journal';b.textContent='行程 · J';b.onclick=()=>QihePrologue.journal();b.style.cssText='position:fixed;right:16px;bottom:12px;z-index:6;padding:8px 14px;background:#24271dee;color:#f3dfb4;border:1px solid #8f8056;border-radius:4px;cursor:pointer';document.body.appendChild(b)}
  PrologueArrival.bindGreetings();if(window.QiheChapter)QiheChapter.restoreScene();checkpoint();
  if(state().arrival.stage!=='done')completion=PrologueArrival.play();
  else if(state().ending){busy=true;completion=rest(true).catch(e=>{console.error(e);toast('过夜片段未完成，回客房可继续。')}).finally(()=>{busy=false;keys={};hud()})}
  else toast('WASD / 方向键移动 · Shift 切换走跑 · E 交谈或进门 · I 江湖 · J 行程',2600);
  return completion;
 }
 // I retains the shared Jianghu menu. The journal has its own button / J binding.
 window.PrologueVillage={state,previewActions:{aunt,...actions,rest,inviteHome},start};
 window.QihePrologue={state,fresh,checkpoint,goLocal,pending,roundState,roundText,rest,journal,start,actions:{aunt,...actions,rest,inviteHome},get completion(){return completion}};
 window.qiheTrialStart=start;
})();
