'use strict';
// 栖河地图物资点（../xiaojianghu/docs/design/qihe-treasure-points.md）：普通箱、铁箍箱、隐藏点三档，参考八方旅人的棕箱、红箱、隐藏物。2026-11-02 用户：所有宝箱都不要设置钥匙。
// 台词全在 ink：story/01-开始/村中-宝箱.ink；这里只管站位、开放时段、存档与奖励。
// 规则：活动不耗时（R-时间-01）；起火后村子关闭；奖励固定、一次领取，不随机；取后可见变空。存档 S.qiheTown.chests。
(()=>{
 if(!isQiheEntry())return;
 const CP=()=>S?.qiheChapter,X=QiheExpansion;
 const inVillage=()=>!!CP()&&['opening','days'].includes(CP().stage);
 const atRefuge=()=>CP()?.stage==='refuge';
 const opened=()=>{const t=S.qiheTown||(S.qiheTown={version:1});return t.chests||(t.chests={})};
 const play=(knot,vars={})=>QiheChapter.play(knot,{},vars);
 const save=()=>QihePrologue.checkpoint();
 async function guarded(fn){if(QiheChapter.running)return;const was=busy;busy=true;keys={};player.path=null;try{return await fn()}finally{busy=was;keys={};save();X.refresh()}}
 async function gain(items={},silver=0){S.bag||={};for(const[id,n]of Object.entries(items))S.bag[id]=(S.bag[id]||0)+n;if(silver)S.silver=(S.silver||0)+silver;save();
  await say('获得',[...Object.entries(items).map(([id,n])=>ITEMS[id].name+(n>1?' ×'+n:'')),...(silver?['银两 '+silver]:[])].join(' · '))}

 // ── 物资点（类型、奖励、归属理由见设计稿第 3 节）──
 const POINTS=[
  {id:'yehou',key:'central',type:'hidden',name:'草里的碎银',at:[420,190],silver:8},
  {id:'chenyard',key:'central',type:'crate',name:'旧木箱',at:[2000,300],items:{qh_sewing_kit:1,qh_tinder:1}},
  {id:'alley',key:'central',type:'hidden',name:'墙根的酒坛',at:[175,1180],items:{wine:1}},
  {id:'drift',key:'central',type:'drift',name:'漂来的木匣',at:[2110,800],silver:12},
  {id:'tree',key:'north',type:'iron',name:'铁箍箱',at:[250,470],items:{mianjia:1,pill:2}},
  {id:'nook',key:'north',type:'hidden',name:'石缝里的药包',at:[1330,310],items:{pill:1}},
  {id:'east-crate',key:'east',type:'crate',name:'破货箱',at:[230,700],items:{qh_fried_rice:2}},
  {id:'hat',key:'east',type:'hidden',name:'草里的斗笠',at:[430,160],items:{qh_old_hat:1},silver:6},
  {id:'sunk',key:'east',type:'iron',name:'铁箍箱',at:[1130,805],items:{charm:1},silver:30},
  {id:'wall',key:'west',type:'hidden',name:'墙缝里的布包',at:[235,230],silver:10},
  {id:'field',key:'west',type:'basket',name:'旧竹篓',at:[420,848],items:{qh_hand_wrap:1}},
  {id:'south-crate',key:'south',type:'crate',name:'旧药箱',at:[250,125],items:{pill:1}},
  {id:'candy',key:'south',type:'hidden',name:'石头下的糖块',at:[205,700],items:{qh_candy:2}},
  {id:'refuge',key:'refuge',type:'basket',name:'系红绳的竹篓',at:[1340,395],show:atRefuge,items:{bun:2,pill:1}}
 ];
 const propOf=(p,done)=>p.type==='hidden'?null:`prop_qh_chest_${p.type}_${done?'open':'closed'}_20261102`;
 const BLOCK={crate:[24,9],basket:[24,9],iron:[34,12],drift:[24,8]};
 const GLOW_NEAR=190;   // 隐藏点只在走近时才闪（八方旅人系列的隐藏物同理），箱子画面里看得见就闪
 for(const p of POINTS){
  const isOpen=()=>!!opened()[p.id];
  const show=p.show||inVillage;
  const n=X.add(p.key,'chest-'+p.id,p.name,null,p.at,()=>guarded(async()=>{
   if(isOpen())return play('qh_tr_empty');
   opened()[p.id]=true;
   await play('qh_tr_'+p.id.replace(/-/g,'_'));
   await gain(p.items||{},p.silver||0)}),p.type==='hidden'?()=>show()&&!isOpen():show);
  n.chest=p;if(p.type!=='hidden'){n.prop=propOf(p,false);n.block=BLOCK[p.type];ASSETS.push(propOf(p,false),propOf(p,true))}
 }
 // ── 绘制：取后换成打开的图；没开过的才闪淡蓝（exploration-containers.md 第 1 节）──
 function glint(x,y,t){const a=.5+Math.sin(t/300+x)*.38;g.save();g.fillStyle=`rgba(150,215,255,${a})`;for(const[dx,dy,s]of[[0,0,4],[-10,7,2],[9,-8,2]]){g.fillRect(x+dx-s/2,y+dy-s*2,s,s*4);g.fillRect(x+dx-s*2,y+dy-s/2,s*4,s)}g.restore()}
 // 原有两只旧木桶（js/qihe-town.js）也归到同一种提示：走近才闪淡蓝，翻过就不闪
 const barrels=[['west','barrel-west'],['south','barrel-south']].map(([k,id])=>SC[X.ids[k]].npcs.find(n=>String(n.id).endsWith(id))).filter(Boolean);
 const base=drawNpc;
 drawNpc=function(n,t,near){if(barrels.includes(n)){const x=n.x*TS,y=n.y*TS;if(!S.qiheTown?.searched?.[String(n.id).replace(/^.*(barrel-)/,'$1')]&&Math.hypot(player.x-x,player.y-y)<GLOW_NEAR)glint(x,y-10,t);if(near&&near.o===n)label(n.name,x,y-24);return}
  const p=n.chest;if(!p)return base(n,t,near);const done=!!opened()[p.id],x=n.x*TS,y=n.y*TS;
  if(p.type!=='hidden'){n.prop=propOf(p,done);base(n,t,near);if(!done)glint(x,y-((IMG[n.prop]?.height||50)*.78125)*.72,t);return}
  if(Math.hypot(player.x-x,player.y-y)<GLOW_NEAR)glint(x,y-10,t);if(near&&near.o===n)label(n.name,x,y-24)};
 window.drawNpc=drawNpc;
 window.QiheTreasure={POINTS,opened};
})();
