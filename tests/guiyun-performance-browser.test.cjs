'use strict';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(__dirname,'../review/guiyun-performance-fix-20261012');
const url='http://127.0.0.1:8792/?chapterPresentationReview=cultivation-performance-20261012&play=1#qihe-map';
async function ready(p){await p.waitForFunction(()=>window.Cultivation&&typeof S!=='undefined'&&S?.cultivation);await p.evaluate(()=>document.fonts.ready);}
async function fixture(p,id,phase='intro',cursor=0,key=null){return p.evaluate(({id,phase,cursor,key})=>{
 if(!saveKey().startsWith('xjh.qihe.presentation.review.v1.cultivation-'))throw Error('not isolated');
 const C=CultivationCore,H=CultivationHousehold,V=CultivationVisitors,D=CultivationData,d=V.all().find(d=>d.id===id),s=C.initial();C.join(s);s.month=Math.floor(d.window[0]/5)+1;s.phase=d.window[0]%5;s.facts.gy_hair_long={};s.learned={stance:{},footwork:{},fist:{},sword:{}};s.relations={};
 const v=V.init(s,id);Object.assign(v.context,{adult:true,rel:{yin:100,ye:100,pei:100},yinScore:100,learned:{footwork:true,fist:true,sword:true},opening:{chen_injury:'light'},first_delivery:{method:'guided_footwork'},facts:{},footwork:true,fist:true,sword:true,delivery:'guided_footwork'});
 const x=V.script(id,v.context);v.phase=phase;v.cursor=cursor;v.selected=key===null?null:x.choices.findIndex(c=>c.key===key);if(['branch','closing','commit'].includes(phase)&&v.selected===null)v.selected=0;
 s.pending={id:'review-'+id,economyVersion:D.economyVersion,action:id,period:C.period(s),cost:0,energyBefore:s.energy,moodBefore:s.mood,stage:phase==='commit'?'result':'choice',story:true,storyStep:0,inputs:{},result:phase==='commit'?{gainName:'见识',gain:2,outputs:{}}:null,visitor:v};
 C.validate(s);S.cultivation=s;H.resetMoods();Cultivation.render();return {choices:x.choices.map(c=>c.key),intro:x.intro.length,closing:x.closing.length};
 },{id,phase,cursor,key});}
async function measure(p){await p.evaluate(async()=>{await Promise.all([...document.querySelectorAll('#cultivation img')].map(i=>i.decode().catch(()=>{})))});return p.evaluate(()=>{
 const scene=document.querySelector('.cu-story-scene'),stage=scene?.querySelector('.cu-story-stage'),actors=[...scene?.querySelectorAll('.cu-story-actor')||[]],box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};
 return {speaker:scene?.dataset.speaker,foreground:actors.map(a=>({id:a.dataset.character,mood:a.dataset.mood,src:a.getAttribute('src'),...box(a)})),roster:[...scene?.querySelectorAll('.cu-story-roster-person')||[]].map(a=>a.dataset.character),stage:stage?box(stage):null,text:scene?.querySelector('.cu-speech p')?.textContent,images:[...document.querySelectorAll('#cultivation img')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')),storage:[...Object.keys(localStorage),...Object.keys(sessionStorage)]};
 });}
(async()=>{
 const b=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell'}),report={status:'running',url,saveIsolation:'disposable browser contexts + explicit cultivation review save',captures:[],errors:[],badRequests:[],renderedLines:0};
 try{
 for(const vp of [{width:1600,height:900},{width:1280,height:720},{width:1920,height:1080}]){
  const context=await b.newContext({viewport:vp}),p=await context.newPage();p.on('pageerror',e=>report.errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&!r.url().endsWith('favicon.ico'))report.badRequests.push({url:r.url(),status:r.status()})});
  await p.goto(url,{waitUntil:'networkidle'});await ready(p);
  const samples=[['gn_cook','intro',3,null,'pei-scale'],['gy_night_return','intro',7,null,'yin-complete'],['gy_m02','branch',0,'linear','zhou-present'],['gy_brother_hurt','intro',5,null,'six-person'],['gy_mid_autumn','branch',0,'moon_ye','private-talk'],['gy_ledger','intro',0,null,'shimu-alpha'],['gy_m05','closing',3,0,'recipient'],['gy_new_year','intro',0,null,'new-year-cast']];
  for(const [id,phase,cursor,key,name]of samples){await fixture(p,id,phase,cursor,typeof key==='number'?null:key);const m=await measure(p);assert.equal(m.images.length,0,name+' broken image');assert(m.foreground.some(a=>a.id===m.speaker),name+' missing speaker');assert(m.foreground.length<=3);assert(m.storage.every(k=>k.includes('review')),'player save touched');const file=name+'-'+vp.width+'.png';await p.screenshot({path:path.join(out,file)});report.captures.push({file,viewport:vp,...m});}
  if(vp.width===1600){
   report.activities=await p.evaluate(async()=>{
    const C=CultivationCore,D=CultivationData,Q=CultivationStory,H=CultivationHousehold;let lines=0;const checked=[],misses=[];
    async function check(expected){Cultivation.render();await Promise.all([...document.querySelectorAll('#cultivation img')].map(i=>i.decode().catch(()=>{})));const scene=document.querySelector('.cu-story-scene'),speaker=scene?.dataset.speaker,cast=[...scene?.querySelectorAll('.cu-story-actor')||[]].map(i=>i.dataset.character);lines++;if(speaker!==expected||!cast.includes(expected))misses.push({expected,speaker,cast});for(const i of document.querySelectorAll('#cultivation img'))if(!i.naturalWidth)misses.push({image:i.getAttribute('src')});}
    for(const a of D.actions.filter(a=>a.once&&!a.visitor))for(const method of a.introByDelivery?Object.keys(a.introByDelivery):[null]){
     const s=C.initial();C.join(s);s.month=36;s.phase=3;s.facts.gy_hair_long={};if(method)s.facts.first_delivery={method};s.pending={id:'activity-review-'+a.id,economyVersion:D.economyVersion,action:a.id,period:C.period(s),cost:0,energyBefore:s.energy,moodBefore:s.mood,stage:'choice',story:true,storyStep:0,storyLine:0,inputs:{},result:null};S.cultivation=s;H.resetMoods();const intro=a.introByDelivery?.[method]||a.introLines;
     for(let n=0;n<intro.length;n++){s.pending.storyLine=n;C.validate(s);await check(intro[n].speaker);}s.pending.storyStep=1;await check('hero');s.pending.stage='result';s.pending.result={gain:2,outputs:{}};C.validate(s);await check(Object.keys(Q.labels).find(id=>Q.labels[id]===a.teacher));checked.push({id:a.id,method});
    }
    for(const kind of ['arrival','offer','delivery-unlearned','delivery-learned']){
     const s=C.initial();s.month=36;s.phase=3;s.facts.gy_hair_long={};if(kind!=='arrival'){C.join(s);s.letters=[];s.learned.stance={};}if(kind.startsWith('delivery')){s.mode='story';if(kind==='delivery-learned')s.learned.footwork={};}S.cultivation=s;H.resetMoods();await check(kind.startsWith('delivery')?'lu':'zhou');checked.push({id:kind});
    }
    return {lines,checked,misses};
   });assert.deepEqual(report.activities.misses,[]);
   const walked=await p.evaluate(async()=>{
    const V=CultivationVisitors,H=CultivationHousehold,C=CultivationCore,D=CultivationData;let lines=0,branches=0,results=0;const misses=[],broken=[];
    for(const d of V.all()){
     const s0=C.initial();C.join(s0);s0.month=Math.floor(d.window[0]/5)+1;s0.phase=d.window[0]%5;s0.facts.gy_hair_long={};s0.learned={stance:{},footwork:{},fist:{},sword:{}};
     const c={...V.init(s0,d.id).context,adult:true,rel:{yin:100,ye:100,pei:100},yinScore:100,learned:{footwork:true,fist:true,sword:true},opening:{chen_injury:'light'},first_delivery:{method:'guided_footwork'},facts:{},footwork:true,fist:true,sword:true,delivery:'guided_footwork'},x=V.script(d.id,c);
     for(let ch=0;ch<x.choices.length;ch++){
      branches++;const s=JSON.parse(JSON.stringify(s0));s.pending={id:'audit-'+d.id,economyVersion:D.economyVersion,action:d.id,period:C.period(s),cost:0,energyBefore:s.energy,moodBefore:s.mood,stage:'choice',story:true,storyStep:0,inputs:{},result:null,visitor:{version:1,phase:'intro',cursor:0,selected:null,context:c}};S.cultivation=s;H.resetMoods();
      for(let guard=0;guard<100;guard++){
       C.validate(s);const l=V.current(s.pending);Cultivation.render();await Promise.all([...document.querySelectorAll('#cultivation img')].map(i=>i.decode().catch(()=>{})));
       const e=document.querySelector('.cu-story-scene');if(l.speaker!=='title'){lines++;const imgs=[...e.querySelectorAll('.cu-story-actor')],present=[...e.querySelectorAll('[data-character]')].map(i=>i.dataset.character);if(!imgs.some(i=>i.dataset.character===l.speaker)||imgs.length>3||JSON.stringify([...present].sort())!==JSON.stringify([...l.cast].sort()))misses.push({id:d.id,phase:s.pending.visitor.phase,speaker:l.speaker,present});if(s.pending.stage==='result'){results++;if(e.querySelector('.cu-speech p').textContent!==l.text||!e.querySelector('.cu-story-outcome'))misses.push({id:d.id,problem:'result prose or gain'});}}
       for(const i of document.querySelectorAll('#cultivation img'))if(!i.naturalWidth)broken.push(i.getAttribute('src'));
       if(s.pending.stage==='result')break;
       if(s.pending.visitor.phase==='choice')V.choose(s.pending,ch);else if(V.next(s.pending)){s.pending.stage='result';s.pending.result={gainName:'见识',gain:2,outputs:{}};}
      }
     }
    }
    return {lines,branches,results,misses,broken};
   });report.walked=walked;report.renderedLines=walked.lines;assert.deepEqual(walked.misses,[]);assert.deepEqual(walked.broken,[]);
  }
  await context.close();
 }
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.badRequests,[]);report.status='pass';
 }catch(e){report.status='fail';report.failure=e.stack;throw e;}finally{fs.writeFileSync(path.join(out,'browser-audit.json'),JSON.stringify(report,null,2)+'\n');await b.close();}
 console.log(JSON.stringify({status:report.status,renderedLines:report.renderedLines,branches:report.walked.branches,results:report.walked.results,captures:report.captures.length,errors:report.errors}));
})();
