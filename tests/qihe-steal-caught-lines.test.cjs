'use strict';
// 2026-10-30 用户（评审台第十九轮第 8 题）：“后续所有新加角色都得加对应的内容”——身上有可窃东西的人，都要有失手时的一句（npc-steal.md 第 8.2 节）。
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
global.window=global;global.isQiheEntry=()=>true;
require('../js/qihe-npc-data.js');
const P=window.QIHE_NPC_DATA.PEOPLE;
const ink=fs.readFileSync(path.join(__dirname,'../story/01-开始/人物-失手.ink'),'utf8');
const have=new Set([...ink.matchAll(/^=== (\w+)_steal_caught ===/gm)].map(m=>m[1]));
test('有可窃东西的人都有失手台词',()=>{
 const miss=Object.entries(P).filter(([id,p])=>!p.noSteal&&(p.bag||[]).length&&!have.has(id)).map(([id,p])=>id+'（'+p.name+'）');
 assert.deepEqual(miss,[],'缺失手台词：'+miss.join('、'));
});
