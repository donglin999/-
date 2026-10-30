'use strict';
// 2026-10-28 叶蘅新地图形象与动作、主角待机与闲置小动作（art_sources/ye-motion-video-20261028）。
// 用户：“叶的走路和静止模型太没有特点了，感觉和常规 npc 一样，重新设计一下，然后通过 wan 去生成一下走路资源和静止资源……静止不动一段时间后也应该有点动作的，不然太呆板了”。
// 叶蘅：照立绘重画（灰发带、斜挎皮带、插草药的药囊、红穗针筒），走路一手扶皮带、步子轻；跑步按住皮带小跑；待机呼吸；站久了从药囊拈出草药看一眼再插回（背面是理发带）。
// 主角：待机呼吸；站久了伸个懒腰。闲置小动作走 ART.fidget（js/core.js、js/scene.js：静止满 after 毫秒播一遍，之后每隔 gap 毫秒再播）。
// 必须排在 qihe-npc-pixel-art.js、qihe-hero-blue-art.js 之后（覆盖它们给叶蘅、主角定的站立与走路表）。
(()=>{
 if(!isQiheEntry())return;
 ART.fidget=ART.fidget||{};ART.sheetFile=ART.sheetFile||{};
 const cell=[96,116],seq=n=>Array.from({length:n},(_,i)=>i);
 const T={ye:130,hero:150};   // 小动作每帧毫秒（取各方向视频的平均，见 out/timing.json）
 // 叶蘅
 ART.sheetFile.s_ye='s_qh_ye_stand_20261028';ART.sheetFile.s_ye_bright='s_qh_ye_stand_20261028';
 ART.sheet.ye=cell;ART.frames.ye=1;
 const ye={cell,rows:'dlru',identity_id:'ye-video-motion-20261028'};
 ART.walk.ye={...ye,frames:12,file:'s_qh_ye_walk_20261028',bright:'s_qh_ye_walk_20261028',order:seq(12),stride:.16};
 // 跑步（2026-10-27 用户补充“这个是可加入角色必备的素材”）：一手按住皮带护着药囊小跑，跟随主角跑动时用；步幅同主角跑步表
 ART.run.ye={...ye,frames:10,file:'s_qh_ye_run_20261028',bright:'s_qh_ye_run_20261028',order:seq(10),stride:.23};
 ART.idle.ye={...ye,frames:4,file:'s_qh_ye_idle_20261028',bright:'s_qh_ye_idle_20261028',order:[0,1,2,3,2,1],ms:[320,260,260,320,260,260]};
 ART.fidget.ye={...ye,frames:18,file:'s_qh_ye_fidget_20261028',bright:'s_qh_ye_fidget_20261028',order:seq(18),ms:Array(18).fill(T.ye),after:5000,gap:11000};
 // 主角（蓝衣）
 const hero='qh_hero_initial',hv={cell,rows:'dlru',identity_id:'xiaobai-blue-video-idle-20261028'};
 ART.idle[hero]={...hv,frames:4,file:'s_qh_hero_blue_idle_20261028',bright:'s_qh_hero_blue_idle_20261028',order:[0,1,2,3,2,1],ms:[340,260,260,340,260,260]};
 ART.fidget[hero]={...hv,frames:18,file:'s_qh_hero_blue_fidget_20261028',bright:'s_qh_hero_blue_fidget_20261028',order:seq(18),ms:Array(18).fill(T.hero),after:7000,gap:13000};
})();
