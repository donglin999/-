// 重叠半透明引擎能力回归检查（2026-10-23）：node tools_scene/qihe/check_overlap.cjs
// 在本地 VM＋真 Canvas 里摆人：主角、普通 NPC、剧情站位 NPC（cast）分别站到树冠、屋檐、凉棚后，
// 断言被挡时补画人形、关掉配置或单个角色排除时不画、站在开阔处不画。规则表见 js/scene.js OCCLUSION。
const{boot}=require('./harness.cjs');
const SPOTS={树冠:['south',[1448,676]],屋檐:['central',[1231,397]],凉棚:['east',[643,244]]},OPEN={south:[1300,800],central:[1100,600],east:[700,430]};
(async()=>{const{c,run,cv}=await boot();run("S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();S.prologue.arrival.borrowed=true;S.prologue.arrival.stage='done';S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';mode='scene';busy=false;PXS=4/3;keys={};");
 const issues=[],rows=[];
 const frame=()=>{cv.width=1280;cv.height=720;run('g.setTransform(PXS,0,0,PXS,0,0);');c.drawScene(1000);return{...run('OCC_STATS')}};
 for(const[spot,[key,at]]of Object.entries(SPOTS)){await c.QiheExpansion.go(key);
  run('wanderers=[];followers=[];cur._base=cur._base||cur.npcs;cur.npcs=cur._base;cur._npcs=npcsOf(cur);delete cur.occlusion');
  const put=(role,npcAt,extra='')=>{const p=role==='player'?npcAt:OPEN[key];
   run(`Object.assign(player,{x:${p[0]},y:${p[1]},alpha:1,dir:'d',walk:0,moving:false});cur.npcs=cur._base${role==='player'?'':`.concat([{id:'${role==='cast'?'staged-陈伯':'occ-npc'}',name:'测',sp:'${role==='cast'?'c_opening_chen':'c_opening_aunt'}',x:${npcAt[0]}/TS,y:${npcAt[1]}/TS,dir:'d',fixed:true,idle:false${role==='cast'?',cast:true':''}${extra},act:async()=>{}}])`};cur._npcs=npcsOf(cur);snapCam();cam.x=Math.max(0,Math.min(WW-VW,${npcAt[0]}-VW/2));cam.y=Math.max(0,Math.min(WH-VH,${npcAt[1]}-VH/2));`)};
  for(const role of['player','npc','cast']){
   put(role,at);const on=frame();
   run('cur.occlusion=false');const off=frame();run('delete cur.occlusion');
   put(role,OPEN[key]);const open=frame();
   let skip=null;if(role!=='player'){put(role,at,',occlusion:false');skip=frame()}
   rows.push({spot,role,on:on.ghosts,off:off.ghosts,open:open.ghosts,skip:skip&&skip.ghosts});
   if(on.ghosts<1)issues.push(`${spot}/${role}: 被挡却没补画人形`);
   if(open.ghosts!==0)issues.push(`${spot}/${role}: 站在开阔处却补画了人形`);
   if(off.ghosts!==0)issues.push(`${spot}/${role}: sc.occlusion=false 仍补画`);
   if(skip&&skip.ghosts!==0&&role!=='player')issues.push(`${spot}/${role}: n.occlusion=false 仍补画`);}
 }
 console.table(rows);console.log(issues.length?'FAIL\n'+issues.join('\n'):'PASS');if(issues.length)process.exitCode=1})();
