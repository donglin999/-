'use strict';
// 用户 2026-10-21 采用：栖河岑霜四向走跑（Wan 3.0 视频后期版，art_sources/censhuang-motion-video-20261021）。
// 站姿仍用 NPC 表 s_npc_qh_censhuang_story_20261010；规格与萧白一致，步距同萧白。
(()=>{
 if(!isQiheEntry())return;
 const k='qh_censhuang_story',identity='censhuang-video-motion-20261021';
 const motion=(frames,file,stride)=>({frames,cell:[96,116],rows:'dlru',file,bright:file,order:Array.from({length:frames},(_,i)=>i),stride,identity_id:identity});
 ART.walk[k]=motion(12,'s_qh_censhuang_walk_20261021',.175);
 ART.run[k]=motion(10,'s_qh_censhuang_run_20261021',.23);
})();
