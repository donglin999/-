'use strict';
// P-S1/S2/S3 and P-04 actions; bound by the branch controller (js/qihe-map-trial.js).
// 2026-10-18 第 2 期：台词改由 ink 剧本提供，这里只把各场交给剧本运行时：
//   还碗 story/01-开始/第一夜-还碗.ink（qihe_errand_chen）、取布 第一夜-取布.ink（qihe_errand_cloth）、
//   送药与还篮 第一夜-送药.ink（qihe_errand_elder）、药箱旁 第一夜-收药箱.ink（qihe_relic）。
//   接取、交物、旁听、存档、提示都写在剧本里（set_flag、carry/uncarry、checkpoint、toast_for）；play 由 qihe-map-trial.js 提供并绑定这些游戏函数。
//   不要在 JS 里再写这些场景的台词。
// 2026-10-23 剧本二：三件合成一条「替周婶跑一圈」（opening-errands-rework.md 0.1）。三处仍各是一场：到了地方人就在说话，玩家选听或不听；
//   接取在周婶托付里一次接下三处，交差回药棚（第一夜-周婶托付.ink），任务面板与行程提示由 qihe-map-trial.js 从三个键推导。这里的入口不变。
window.createQiheActions=({play})=>{
const chen=()=>play('qihe_errand_chen');
const cloth=()=>play('qihe_errand_cloth');
const elder=()=>play('qihe_errand_elder');
const relic=()=>play('qihe_relic');
return {chen,cloth,elder,relic};
};
