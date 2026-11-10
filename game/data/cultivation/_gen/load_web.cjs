// 以浏览器全局方式按 index.html 顺序加载原版养成相关脚本（只读）
const fs=require('fs'),vm=require('vm');const J='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/js/';
globalThis.window=globalThis;
const files=['character-growth-state.js','shared-insight-pool.js','qh-pre-hangao-data.js','qh-pre-hangao.js','pei-companion.js','qh-mode-cultivation-scripts.js','qh-mode-cultivation-scenes.js','qh-mode-cultivation-side.js','qh-mode-cultivation-neighbors.js','qh-mode-cultivation-mentors.js','qh-mode-cultivation-household.js','qh-mode-cultivation-dialogue.js','qh-mode-cultivation-visitors.js','qh-mode-cultivation-library.js','qh-mode-cultivation-balance.js','qh-mode-cultivation-data.js','qh-mode-cultivation-martial.js','qh-mode-cultivation-relations.js','qh-mode-cultivation-growth.js','qh-mode-cultivation-core.js'];
for(const f of files){try{vm.runInThisContext(fs.readFileSync(J+f,'utf8'),{filename:f});}catch(e){console.error('载入失败',f,e.message);}}
module.exports=globalThis;
