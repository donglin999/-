'use strict';
// Exercise the real animation clock, crop, contact range and recovery functions.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const cast=fs.readFileSync('js/qihe-cast-art.js','utf8');
const source=cast.slice(cast.indexOf('BART["hero_village"]=')).split('\n')[0];
const art=JSON.parse(source.split('=',2)[1].split(';ASSETS')[0]);
const [CW,CH]=art.cell,image={width:CW*art.cols,height:CH,naturalWidth:CW*art.cols,naturalHeight:CH};
const context=vm.createContext({console,window:{BART:{hero_village:art}},BART:{hero_village:art},IMG:{[art.file]:image},
  document:{createElement:()=>({getContext:()=>({})})},BT:{now:()=>0},VFX:{btWait:async()=>{},overlay(){}},
  ok:im=>!!im,unitH:()=>105,battleBodyBounds:()=>({height:195,bottom:300}),bsfx(){}});
const text=fs.readFileSync('js/bfx.js','utf8').split('window.BFX=')[0].replace('return{now,bw,act,','return{frameOf,now,bw,act,');
vm.runInContext(text+'\nglobalThis.engine=BFXI',context);
const hero={art:'hero_village',x:640,y:350,side:'ally',hp:128,id:1};
for(const name of ['atk','atk2']){
 const hit=name==='atk'?700:320;
 assert.equal(context.engine.impactMs(hero,name),hit);
 assert.equal(context.engine.recoveryMs(hero,name,150),name==='atk'?320:280);
 hero.anim={k:name,t0:0};
 const frame=context.engine.frameOf(hero,hit,105);
 assert.equal(frame.sx,art.anim[name].f[art.anim[name].hit]*CW,'damage occurs on the actual contact frame');
 assert.equal(frame.sw,CW);assert.equal(frame.sh,CH);
 assert.ok(Math.abs(frame.originX-art.anchor[0]*105/195)<1e-9,'wide weapon frame preserves body anchor');
 assert.ok(Math.abs(frame.foot-(CH-300)*105/195)<1e-9,'source blank margin preserves foot baseline');
}
(async()=>{
 await context.engine.dashTo(hero,{x:320,y:350,side:'foe'});
 assert.ok(Math.abs(hero.mv.x1-(320-640+art.anim.atk.contacts[0].reach*105/195))<1e-9,'stop with first sweep tip at target, rather than body touching');
 assert.equal(hero.mv.y1,4);
 assert.equal(context.engine.recoveryMs({art:'missing'},'atk',230),230,'unrelated art retains original timing');
 console.log('hero staff: final contact frame, complete recovery, anchor and sweep range OK');
})().catch(e=>{console.error(e);process.exitCode=1});
