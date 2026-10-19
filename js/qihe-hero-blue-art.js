'use strict';
// 用户 2026-10-10 采用完整 C 包；保留逻辑角色 ID、初版世界身高及步距。
(()=>{
 if(!isQiheEntry())return;
 const hero='qh_hero_initial',identity='xiaobai-blue-initial-proportions-20261010';
 ART.sheetFile=ART.sheetFile||{};
 ART.sheetFile.s_qh_hero_initial='s_qh_hero_blue_20261010';
 ART.sheetFile.s_qh_hero_initial_bright='s_qh_hero_blue_20261010';
 ART.sheet[hero]=[96,116];ART.frames[hero]=1;
 const motion=(frames,file,extra)=>({frames,cell:[96,116],rows:'dlru',file,bright:file,order:Array.from({length:frames},(_,i)=>i),identity_id:identity,...extra});
 ART.walk[hero]=motion(12,'s_qh_hero_blue_walk_20261010',{stride:.175});
 ART.run[hero]=motion(10,'s_qh_hero_blue_run_20261010',{stride:.23});
 ART.idle[hero]=motion(1,'s_qh_hero_blue_idle_20261010',{ms:[1000]});
 ART.motionAnchor[hero]={body:90,foot:108};
})();
