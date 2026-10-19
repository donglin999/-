'use strict';
// Driver compatibility only, with local DOM/turn fixtures. No browser or HTTP requests.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
function fixture(step='defense'){
 const calls=[],state={stage:'dog'},lesson={uiStep:step},dog={name:'受惊山犬',x:300,y:420},ctx={window:null,S:{hp:60,mp:0,skills:{},bag:{},party:[]},busy:true,dlgBusy:false,W:960,H:540,
  PrologueArrival:{step:'P-02-battle',running:true,state:()=>state},PrologueWater:{step:null},OpeningCharacters:{modernEvent:true},unitH:()=>54,
  CAM:{toScreen:(x,y)=>[x+10,y-5]},PointerEvent:class{constructor(type,props){this.type=type;Object.assign(this,props)}},setTimeout(fn){queueMicrotask(fn)},addEventListener(){},
  B:{opt:{storyLesson:lesson},cur:{name:step==='defense'?'萧白':'叶蘅'},foes:[dog],tsel:0,tgtList:step==='target'?[dog]:null,click(){}}
 };
 const finish=kind=>{calls.push(kind);state.stage='done';ctx.PrologueArrival.running=false;ctx.busy=false;ctx.B=null};
 const labels=['攻击','武学','道具','防御'];
 const cmd={get hidden(){return lesson.uiStep==='target'},querySelectorAll(sel){assert.equal(sel,'.row');const names=lesson.uiStep==='drive-menu'?['驱离']:labels;return names.map(label=>({querySelector(sel){assert.equal(sel,'.l');return{textContent:label}},classList:{contains:()=>false},click(){calls.push(label);if(label==='防御'){assert.equal(lesson.uiStep,'defense');lesson.uiStep='ye-turn';ctx.B.cur.name='叶蘅'}else if(label==='武学'){assert.equal(lesson.uiStep,'ye-turn');lesson.uiStep='drive-menu'}else if(label==='驱离'){assert.equal(lesson.uiStep,'drive-menu');lesson.uiStep='target';ctx.B.tgtList=[dog]}else assert.fail('clicked a locked action')}}))}};
 const nodes={dlg:{hidden:true},'bt-cmd':cmd,'bt-teaching-skip':{disabled:false,click:()=>finish('skip')},cv:{getBoundingClientRect:()=>({left:20,top:30,width:1280,height:720}),dispatchEvent(e){assert.equal(e.type,'pointerdown');assert.equal(lesson.uiStep,'target');assert.equal(e.clientX,20+310*1280/960);assert.equal(e.clientY,30+(420-27-5)*720/540);finish('target-confirm')}}};
 ctx.document={getElementById:id=>nodes[id]||null};ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'../review/prologue-arrival/driver.js'),'utf8'),ctx);return{ctx,calls};
}
test('new review driver clicks ordinary defense, skill, temporary drive and real canvas target',async()=>{
 const f=fixture();await f.ctx.arrivalReview.drive('done');assert.deepEqual(f.calls,['防御','武学','驱离','target-confirm']);assert(f.ctx.arrivalReview.result().resourcesUnchanged);
});
test('skip uses only the independent corner button from main menu',async()=>{
 const f=fixture();await f.ctx.arrivalReview.drive('done',{dog:'skip'});assert.deepEqual(f.calls,['skip']);
});
test('skip remains independent at target selection',async()=>{
 const f=fixture('target');await f.ctx.arrivalReview.drive('done',{battleSkip:true});assert.deepEqual(f.calls,['skip']);
});
test('legacy screenshot guard/drive aliases stop at the new real menu steps',async()=>{
 const f=fixture();assert.equal((await f.ctx.arrivalReview.drive('battle-guard')).step,'defense');assert.deepEqual(f.calls,[]);
 assert.equal((await f.ctx.arrivalReview.drive('battle-drive')).step,'ye-turn');assert.deepEqual(f.calls,['防御']);
 assert.equal((await f.ctx.arrivalReview.drive('battle-drive-menu')).step,'drive-menu');assert.equal((await f.ctx.arrivalReview.drive('battle-target')).step,'target');
});
