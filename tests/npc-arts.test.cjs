'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const ctx=vm.createContext({console,window:{},S:{scene:'street',st:{agi:3,wis:3},hp:80,mp:12,bag:{},silver:40,moral:0},cur:{},mode:'scene',busy:false,dlgBusy:false,location:{hash:''},SC:{street:{npcs:[]}},clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),save(){},toast(){},hud(){},npcArtLevel(){},interact:async()=>{},reviewStart(){},derived:()=>({st:{}}),ITEMS:{cloth:{name:'短打'},pill:{name:'药'}},say:async()=>{},choose:async()=>0,Math:Object.create(Math)});
for(const f of ['npc-art-lessons.js','npc-arts.js'])vm.runInContext(fs.readFileSync('js/'+f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);
(async()=>{
 assert.equal(run('NPCArts.level("inspect")'),0);
 assert.equal(run('NPCArts.learn("steal",{name:"铁匠"},{teach:["spar"]})'),false);
 assert.equal(run('NPCArts.learn("steal",{name:"许青"},{teach:["steal"]})'),true);
 assert.equal(run('S.npcArtLearning.steal.teacher'),'许青');
 run('globalThis.n={id:"arts_trainer",name:"许青",sp:"c_villager"};globalThis.spec=NPCArts.spec(n);NPCArts.gesture=async()=>{}');
 ctx.choose=async()=>2;await run('NPCArts.exercise("steal",n,spec)');assert.equal(run('S.npcArtProgress.steal'),0);
 ctx.choose=async()=>1;await run('NPCArts.exercise("steal",n,spec)');assert.equal(run('S.npcArtProgress.steal'),0);
 for(let i=0;i<8;i++){ctx.choose=async()=>run('NPCArts.lesson("steal").q[2]');await run('NPCArts.exercise("steal",n,spec)')}
 assert.equal(run('S.npcArtProgress.steal'),6);assert.equal(run('NPCArts.level("steal")'),1);assert.match(run('NPCArts.examWhy("steal")'),/应用不足/);
 run('NPCArts.award("steal",{id:"smith"},"take:cloth");NPCArts.award("steal",{id:"smith"},"take:cloth")');assert.equal(run('S.npcArtProgress.steal'),7);
 ctx.choose=async()=>run('NPCArts.lesson("steal",true).q[2]');await run('NPCArts.exercise("steal",n,spec,true)');assert.equal(run('NPCArts.level("steal")'),2);
 run('NPCArts.award("steal",{id:"slice_herbalist"},"take:pill")');
 for(let i=0;i<14;i++){ctx.choose=async()=>run('NPCArts.lesson("steal").q[2]');await run('NPCArts.exercise("steal",n,spec)')}
 assert.equal(run('S.npcArtProgress.steal'),20);assert.equal(run('NPCArts.practiceState("steal").counts[2]'),12);
 ctx.choose=async()=>run('NPCArts.lesson("steal",true).q[2]');await run('NPCArts.exercise("steal",n,spec,true)');assert.equal(run('NPCArts.level("steal")'),3);
 run('globalThis.smith={id:"smith",name:"铁匠",sp:"c_smith"};globalThis.ss=NPCArts.spec(smith);S.npcArtRecords={};S.npcArtProgress.steal=0');ctx.Math.random=()=>0;
 await run('NPCArts.perform("steal",smith,ss)');await run('NPCArts.perform("steal",smith,ss)');assert.equal(run('S.bag.cloth'),1);assert.equal(run('S.moral'),-2);assert.equal(run('S.npcArtProgress.steal'),1);
 run('S.npcArtRecords={};NPCArts.gesture=async(id,n,outcome)=>{if(outcome)throw Error("injected")};');await run('NPCArts.perform("steal",smith,ss)');assert.equal(run('S.bag.cloth'),1);assert.equal(run('S.moral'),-2);assert.equal(run('NPCArts.pending'),false);
 run('NPCArts.gesture=async()=>{};S.npcArtRecords={};');ctx.Math.random=()=>.999;await run('NPCArts.perform("steal",smith,ss)');assert.equal(run('S.bag.cloth'),1);assert.equal(run('NPCArts.rec(smith).alert'),1);
 ctx.location.hash='#xiangyang';run('reviewStart()');for(const id of ['inquire','persuade','inspect','spar'])assert.equal(run('NPCArts.level("'+id+'")'),1);assert.equal(run('NPCArts.level("steal")'),3);
 console.log('NPC arts: teacher eligibility, practice cancel/error/caps, 6/18 examination, distinct achievements, theft stock/risk/rollback, Xiangyang grants PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
