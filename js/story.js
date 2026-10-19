'use strict';
// ───────────────────────── 剧情基础钩子 ─────────────────────────
// 2026-10-19：原「第一章 · 襄阳风云」场景与剧情（羊太傅庙、襄阳城、东津渡、黑风寨、青蚨散）已随襄阳演示入口一并归档到
// _attic/2026-10-19-deprecated/xiaojianghu-legacy-prologue/js/story.js。这里只保留栖河与培养仍要调用的底层钩子：
//   questLine / questLog：任务提示的最底层（栖河序章、第一章、培养各自包装覆盖）；
//   onCompanionTalk：队伍页「交谈」与跟随同伴交谈的入口。
function questLine(){return''}
function questLog(){return[]}
window.questLine=questLine;window.questLog=questLog;

window.onCompanionTalk=async function(id){
  if(id==='dog')await say(typeof DOG!=='undefined'?DOG.name:'大黄','汪！',typeof DOG!=='undefined'?DOG.sp:'c_dog');
};
