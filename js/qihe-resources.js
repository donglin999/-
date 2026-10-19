'use strict';
// Authored habitat points, independent of plot timers and the legacy container save.
(()=>{
 if(!isQiheEntry())return;
 const kinds={
  branch:{item:'qh_dry_branch',name:'枯枝',verb:'拾取',use:'捡地上的落枝，不砍树。2份可在南村口店家、接应院周婶或山居厨房换1份干粮。'},
  herb:{item:'qh_wild_herb',name:'野草药',verb:'采集',use:'只采散生的小丛，留根。2份可交南村口药商辨收，换4文；不是可直接服用的药品。'},
  reed:{item:'qh_river_reed',name:'芦苇',verb:'采集',use:'河岸少量取秆，留根。2份可交南村口药商作包装垫料，换2文。'}
 };
 for(const[k,v]of Object.entries(kinds)){ITEMS[v.item]={name:v.name,desc:v.use};ASSETS.push('r_qh_'+k+'_v1')}
 // World pixel coordinates. Do not randomize or reuse cultivated crop/medicine racks.
 const placements=[
  ['north-branch-log','north','branch',620,330,2,'倒木旁的落枝'],
  ['north-herb-rock','north','herb',1060,485,2,'山石南侧草坡'],
  ['north-herb-shade','north','herb',415,695,1,'林缘半阴草地'],
  ['north-branch-trail','north','branch',905,825,1,'下山路旁落枝'],
  ['east-reed-lower','east','reed',1210,735,2,'河埠下游岸边'],
  ['east-reed-upper','east','reed',1205,465,2,'晒架以外的自然河岸'],
  ['east-herb-meadow','east','herb',1000,810,1,'河埠南侧草坡'],
  ['west-herb-margin','west','herb',610,590,1,'菜畦以北的野草地'],
  ['west-branch-edge','west','branch',640,170,2,'工具棚外林缘'],
  ['west-reed-bank','west','reed',200,405,1,'西溪岸边'],
  ['south-branch-edge','south','branch',1150,795,1,'客栈外院南边草地'],
  ['south-reed-bank','south','reed',1335,390,1,'村口河岸'],
  ['central-branch-edge','central','branch',890,210,1,'村北树下路边'],
  ['refuge-branch-edge','refuge','branch',1280,760,1,'接应院边树下'],
  ['mountain-branch-edge','mountain','branch',590,780,2,'山居院外竹木边'],
  ['mountain-herb-edge','mountain','herb',1280,510,1,'药圃围栏外的散生草丛']
 ];
 const taken=id=>!!S?.qiheResources?.nodes?.[id];
 const safePhase=()=>!['fire','escape'].includes(S?.qiheChapter?.stage);
 const remaining=n=>!!S&&!taken(n.id)&&safePhase();
 const near=n=>cur===SC[n.scene]&&Math.hypot(player.x-n.x*TS,player.y-n.y*TS)<80&&lineOk(player.x,player.y,n.x*TS,n.y*TS);
 function commit(bag,state,silver=S.silver){
  const next={...S,bag,qiheResources:state,silver,scene:Object.keys(SC).find(k=>SC[k]===cur),x:player.x,y:player.y};
  try{persistState(next)}catch(e){toast('未能保存，材料没有扣除或领取。请腾出存储空间后重试。',3000);return false}
  Object.assign(S,next);return true;
 }
 function collect(n){
  if(!nodes.includes(n)||mode!=='scene'||dlgBusy||!$('panel').hidden||!remaining(n)||!near(n))return false;
  const v=kinds[n.kind],bag={...S.bag,[v.item]:(S.bag[v.item]||0)+n.amount};
  const state={...S.qiheResources,version:1,nodes:{...S.qiheResources?.nodes,[n.id]:true}};
  if(!commit(bag,state))return false;
  cur._npcs=npcsOf(cur);player.path=null;player.goal=null;player.talkTo=null;
  toast('获得 '+v.name+' ×'+n.amount+' · B 查看野外行囊',2200);hud();return true;
 }
 const nodes=placements.map(([id,key,kind,x,y,amount,habitat])=>{
  const n={id:'resource-'+id,scene:QiheExpansion.ids[key],key,kind,amount,habitat,name:kinds[kind].name,
   x:x/TS,y:y/TS,sp:null,resource:true,fixed:true,verb:kinds[kind].verb};
  n.show=()=>remaining(n);n.act=async()=>collect(n);SC[n.scene].npcs.push(n);return n;
 });
 function draw(n,t,closest){
  const im=IMG['r_qh_'+n.kind+'_v1'];if(!ok(im))return;
  const x=n.x*TS,y=n.y*TS;g.save();g.imageSmoothingEnabled=false;g.drawImage(im,Math.round(x-32),Math.round(y-60),64,64);
  if(closest?.o===n){label(n.name+' ×'+n.amount,x,Math.min(y-64,player.y-CHAR_H-16),'#e7e2b5')}
  else if(Math.hypot(player.x-x,player.y-y)<220){g.globalAlpha=.35+.15*Math.sin(t/650);g.fillStyle='#e4d9a3';g.fillRect(x+12,y-30,3,3)}
  g.restore();
 }
 const recipes=[
  {id:'fuel',kind:'branch',cost:2,item:'bun',amount:1,text:'交枯枝 2 → 干粮 1',receivers:[['south','cloth'],['refuge','aunt'],['mountain','kitchen']]},
  {id:'medicine',kind:'herb',cost:2,silver:4,text:'交野草药 2 → 4文',receivers:[['south','merchant']]},
  {id:'packing',kind:'reed',cost:2,silver:2,text:'交芦苇 2 → 2文',receivers:[['south','merchant']]}
 ];
 function receiver(r){if(!safePhase())return null;for(const[key,id]of r.receivers){const scene=QiheExpansion.ids[key];const n=SC[scene].npcs.find(n=>n.id===id);if(n&&(!n.show||n.show())&&near({...n,scene}))return n}return null}
 function exchange(id){
  const r=recipes.find(r=>r.id===id);if(!r||mode!=='scene'||!S||!receiver(r))return false;
  const item=kinds[r.kind].item;if((S.bag[item]||0)<r.cost)return false;
  const bag={...S.bag,[item]:S.bag[item]-r.cost};if(r.item)bag[r.item]=(bag[r.item]||0)+r.amount;
  const state={...S.qiheResources,version:1,nodes:{...S.qiheResources?.nodes},exchanges:(S.qiheResources?.exchanges||0)+1};
  if(!commit(bag,state,(S.silver||0)+(r.silver||0)))return false;
  toast(r.text+' · 已存档',1600);hud();return true;
 }
 async function inventory(){
  if(!S||busy||dlgBusy||mode!=='scene'||!$('panel').hidden)return;
  busy=true;keys={};player.path=null;player.goal=null;player.talkTo=null;
  try{await new Promise(resolve=>{
   const panel=openPanel('qh-resource-panel');panelKind='qh-resources';panelClose=resolve;
   function render(){
    panel.innerHTML='<header><h2>野外行囊</h2><button id="qh-resource-close">返回 · Esc</button></header><p>少量取用，留根留苗。采集不耗半日或培养体力；本段不刷新。</p><div class="qh-resource-list">'+Object.entries(kinds).map(([k,v])=>'<article><img alt="" src="assets/r_qh_'+k+'_v1.webp"><div><h3>'+v.name+' ×'+(S.bag[v.item]||0)+'</h3><p>'+v.use+'</p></div></article>').join('')+'<h3>就近交付</h3><p>到收取者身旁再交付。干粮 ×'+(S.bag.bun||0)+' · 银钱 '+(S.silver||0)+'文</p>'+recipes.map(r=>{
     const n=receiver(r),enough=(S.bag[kinds[r.kind].item]||0)>=r.cost;
     return '<div class="qh-resource-trade"><button id="qh-resource-'+r.id+'" '+(!n||!enough?'disabled':'')+'>'+r.text+'</button><span>'+(!n?(r.id==='fuel'?'前往：南村口店家 / 接应院周婶 / 山居厨房':'前往：南村口药商'):!enough?'材料不足':'交给：'+n.name)+'</span></div>';
    }).join('')+'</div>';
    $('qh-resource-close').onclick=closePanel;for(const r of recipes)$('qh-resource-'+r.id).onclick=()=>{if(exchange(r.id))render()};
   }
   render();$('qh-resource-close').focus();
  })}finally{busy=false;keys={};hud()}
 }
 const originalHud=hud;let button;
 hud=function(...args){const result=originalHud(...args);if(!button){button=document.createElement('button');button.id='qihe-resources';button.textContent='野外行囊 · B';button.style.cssText='position:fixed;right:168px;bottom:12px;z-index:6;padding:8px 14px;background:#24271dee;color:#f3dfb4;border:1px solid #8f8056;border-radius:4px;cursor:pointer';button.onclick=inventory;document.body.appendChild(button)}button.hidden=!S||mode!=='scene';return result};
 addEventListener('keydown',e=>{if(window.QiheJianghuUI)return;if(e.key.toLowerCase()==='b'&&!e.repeat&&!['INPUT','TEXTAREA'].includes(e.target?.tagName)){e.preventDefault();if(panelKind==='qh-resources'&&!dlgBusy)closePanel();else inventory()}});
 window.QiheResources={nodes,kinds,recipes,taken,collect,draw,inventory,exchange,receiver};
})();
