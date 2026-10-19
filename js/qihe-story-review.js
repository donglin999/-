'use strict';
// Reproducible story review; never touches the ordinary prologue save.
(()=>{
 if(!isQiheStoryReview())return;
 const start=qiheTrialStart,id=new URLSearchParams(location.search).get('storyReview');
 window.qiheTrialStart=async function(){
  S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();S.prologue.arrival.stage='done';S.prologue.arrival.borrowed=true;
  S.scene=id==='procurement'?'qh_east':'qh_south';S.x=SC[S.scene].start[0]*TS;S.y=SC[S.scene].start[1]*TS;S.party=['ye'];S.pet=null;
  const d=derived();S.hp=d.mhp;S.mp=d.mmp;save();await start();
  await QiheExpansion.go(id==='procurement'?'east':'south',id);
  document.title='小江湖 · 三路来客支线试用';await QiheChapter.interact(id);
 };
})();
