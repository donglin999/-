'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('enemy-targeted support preview accepts null damage without crashing or inventing damage',()=>{
 const text=fs.readFileSync('js/bui.js','utf8'),start=text.indexOf('  const target=(side,all,back,go,desc)=>'),end=text.indexOf('  const main=()=>',start);assert(start>=0&&end>start);let message='';
 const foe={name:'靶',hp:20,weak:['剑'],known:new Set()},u={name:'知古'};const c={B:{pv:()=>null,bpUse:0,opt:{}},u,cmd:{},aliveOf:()=>[foe],esc:String,BUI:{img:()=>'? '},hint:t=>message=t,renderCards(){},estDmg(){throw Error('support must not estimate damage')},hitsWeak(){throw Error('support must not predict shield damage')},bsfx(){},setBp(){}};
 vm.createContext(c);vm.runInContext(text.slice(start,end)+'\nglobalThis.selectTarget=target;',c);c.selectTarget('foe',false,()=>{},()=>{},'指瑕');assert.match(message,/辅助 · 不造成伤害/);assert.equal(c.B.tgtList[0],foe);assert.equal(typeof c.B.key,'function');
 c.B.pv=()=>({hits:2,pow:1});c.estDmg=()=>9;c.hitsWeak=()=>false;c.selectTarget('foe',false,()=>{},()=>{},'出手');assert.match(message,/预计 9 ×2/);
});
test('book basic action honors BP, never removes shields, and stops on defeat',async()=>{
 const text=fs.readFileSync('js/pei-companion-runtime.js','utf8'),start=text.indexOf('doAttack=async function'),end=text.indexOf('\ndoSkill=',start);let boosts=0,poses=[],delegated=0;
 const c={P:{id:'peizhigu'},oldAttack:async()=>delegated++,showName(){},boostFx:async()=>boosts++,BFXI:{dashTo:async()=>{},hopBack:async()=>{}},playAttackPose:async(u,a,targets,t,k,bp,resolve)=>{poses.push(a);resolve(targets[0])},hurt:(t,n)=>t.hp-=n,Math:Object.assign(Object.create(Math),{random:()=>0})};vm.createContext(c);vm.runInContext(text.slice(start,end),c);
 const u={key:'peizhigu',mp:40},t={hp:10,shield:3};await c.doAttack(u,t,3);assert.equal(t.hp,6);assert.equal(t.shield,3);assert.equal(u.mp,40);assert.equal(boosts,1);assert.deepEqual(poses,['atk','atk2','atk2','atk2']);poses=[];t.hp=1;await c.doAttack(u,t,3);assert.equal(poses.length,1);await c.doAttack({key:'ye'},t,0);assert.equal(delegated,1);
});
test('explicit zero attack multiplier stays zero for teaching actors',()=>{
 const text=fs.readFileSync('js/battle.js','utf8'),start=text.indexOf('function mkFoe('),end=text.indexOf('// 站位',start);const c={statUnit:s=>({mhp:100,atk:20,lv:s.lv}),FOE_DEF:{},SKILLS:{fist:{}},ri:()=>0};vm.createContext(c);vm.runInContext(text.slice(start,end),c);
 const base={name:'教习',sp:'c_gy_zhouyan',lv:88,skills:{fist:1}};assert.equal(c.mkFoe({...base,atkMul:0},0).atk,0);assert.equal(c.mkFoe(base,0).atk,12);
});
test('book benefits expire at their declared action boundary and cannot persist forever',()=>{
 const P=require('../js/pei-companion'),u={skills:['pei_zhi','pei_shen'],mp:20,buffs:{}},t={hp:30,weak:['剑'],known:new Set(),buffs:{}};
 P.cast(u,'pei_zhi',[t],0);P.actionStart(t);assert(t.buffs.peiFlaw);P.expire(t);assert.equal(t.buffs.peiFlaw,undefined);
 P.defend(u);assert(u.buffs.peiCover);P.actionStart(u);assert.equal(u.buffs.peiCover,undefined);
});
