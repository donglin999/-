'use strict';
// Explicit local review entry; never reads, resets, or overwrites the player's Qihe save.
(()=>{
 if(!isQiheUIReview())return;
 // Fourth heroine is a visual fixture only until her recruitment chapter is available.
 PARTY_DEF.censhuang={name:'岑霜',art:['opening_censhuang'],por:['opening_censhuang'],st:{str:5,con:4,agi:6,wil:4,wis:4},skills:['liuye'],atkType:'剑',atkName:'剑击'};
 const start=qiheTrialStart;
 window.qiheTrialStart=async function(){
  if(!loadSave()){
   S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();S.prologue.arrival.stage='done';S.prologue.relicSeen=true;S.prologue.rested=true;S.prologue.arrival.borrowed=true;S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.scene='qihe_trial';S.x=SC.qihe_trial.start[0]*TS;S.y=SC.qihe_trial.start[1]*TS;S.party=['ye','suzhi','censhuang'];S.qiheRoster={version:1,members:['hero','ye','suzhi','censhuang'],availability:{},revision:0,commands:[]};S.bag={bun:12,pill:5,wine:3,club:1,knife:1,needles:1,cloth:1,vest:1,charm:1,book:1,qh_dry_branch:8,qh_wild_herb:6,qh_river_reed:4};S.skills.fuhu=1;S.pts=3;S.silver=120;mnEnsure();const d=derived();S.hp=d.mhp-25;S.mp=d.mmp-10;save();
  }
  await start();
  // Explicit capacity fixture, restricted to the independent UI review save key.
  if(new URLSearchParams(location.search).get('martialCapacity')==='1'){
   S.chapter=2;S.lv=25;S.sect='taihe';S.st={str:10,con:10,agi:10,wil:10,wis:10};
   S.skills={fuhu:2,qh_hulu_staff:3};S.prof={fuhu:4,qh_hulu_staff:12};
   S.xinfa={known:['tuna','th_xin','th_zuo'],main:'tuna',subs:[],lv:{tuna:2,th_xin:1,th_zuo:1},prog:{tuna:2},unstable:0};mnEnsure();save();
  }
  document.title='小江湖 · UI 独立验收';toast('界面试用 · 独立存档，四人阵容仅供验收',2600);
 };
})();
