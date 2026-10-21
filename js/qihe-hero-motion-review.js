'use strict';
// 本地评审入口（不进发布包）：?journey=hero-anim-test&play=1 用独立存档，首次进入直接放到栖河地图（蓝衣、自由行走），
// 用于试走主角走跑；不读写正式旅程。
(()=>{
 if(!isQiheEntry()||qiheJourneyId()!=='hero-anim-test')return;
 addEventListener('DOMContentLoaded',()=>{
  const start=qiheTrialStart;
  window.qiheTrialStart=async function(){
   if(!loadSave()){
    S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();S.prologue.arrival.stage='done';S.prologue.relicSeen=true;S.prologue.rested=true;S.prologue.arrival.borrowed=true;
    S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.scene='qihe_trial';S.x=SC.qihe_trial.start[0]*TS;S.y=SC.qihe_trial.start[1]*TS;S.party=[];
    mnEnsure();const d=derived();S.hp=d.mhp;S.mp=d.mmp;save();
   }
   await start();document.title='小江湖 · 主角走跑试走';
  };
 });
})();
