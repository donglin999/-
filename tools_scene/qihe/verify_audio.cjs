const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'../..'),nodes=new Map(),events={},raf=[],audios=[];let now=0;
function node(id){if(nodes.has(id))return nodes.get(id);const n={id,hidden:true,style:{},dataset:{},textContent:'',appendChild(a){if(a.id)nodes.set(a.id,a)},setAttribute(){},querySelector(){return null}};nodes.set(id,n);return n}
class Audio{constructor(src){this.src=src;this.paused=true;this.ended=false;this.duration=59.1;this.currentTime=0;this.volume=0;this.dataset={};this.listeners={};this.plays=0;audios.push(this)}addEventListener(k,f){this.listeners[k]=f}play(){this.paused=false;this.plays++;return Promise.resolve()}pause(){this.paused=true}}
const store=new Map(),c={Audio,console,performance:{now:()=>now},setInterval:()=>0,clearInterval(){},requestAnimationFrame:f=>raf.push(f),localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},document:{hidden:false,body:node('body'),getElementById:node,createElement:()=>node('generated'+nodes.size),activeElement:null,addEventListener:(k,f)=>events[k]=f},addEventListener:(k,f)=>events[k]=f,isQiheEntry:()=>true,mode:'scene',S:{prologue:{},silver:0},B:null,SC:{qihe_trial:{},qh_south:{},prologue_clinic_interior:{},qh_mountain:{},street:{}},player:{x:0,y:0},TS:48,PRODUCTION_AUDIO_PATHS:{bgm_qh_cultivation_v5_short:'assets/audio/bgm_qh_cultivation_v5_short.wav',bgm_qh_daily_v2:'assets/audio/bgm_qh_daily_v2.mp3',bgm_qh_battle_v2:'assets/audio/bgm_qh_battle_v2.mp3'}};
c.window=c;c.cur=c.SC.qihe_trial;for(const name of ['say','choose','toast','openPanel','closePanel','fade'])c[name]=async()=>{};
c.battleLoop=()=>new Promise(r=>c.endBattle=r);vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'js/audio.js'),'utf8'),c);
async function step(n=20){for(let i=0;i<n;i++){now+=100;for(const a of audios)if(!a.paused){a.currentTime+=.1;if(a.loop&&a.currentTime>=a.duration)a.currentTime%=a.duration}const q=raf.splice(0);q.forEach(f=>f(now));await Promise.resolve()} }
const playing=()=>audios.filter(a=>a.dataset.bgm&&!a.paused);
(async()=>{
 await step();assert.equal(playing().length,0,'gesture gate');events.pointerdown();await step();
 let day=playing()[0];assert(day.src.includes('daily'));const t=day.currentTime;
 c.cur=c.SC.qh_south;await step(3);assert.equal(playing()[0],day);assert(day.currentTime>t);
 nodes.get('dlg').hidden=false;await step(10);assert(Math.abs(c.__audio.bgm.gain-.708)<.01);nodes.get('dlg').hidden=true;
 c.__audio.voice(true);c.__audio.voice(true);c.__audio.voice(false);await step(10);assert.equal(c.__audio.bgm.gain,.5);c.__audio.voice(false);await step(10);assert.equal(c.__audio.bgm.gain,1);
 c.mode='battle';c.B={bg:'bb_qh_evacuation_v1'};const battle=c.battleLoop();await step();const combat=playing()[0];assert(combat.src.includes('battle'));assert(day.paused);assert.equal(playing().length,1);
 let ct=combat.currentTime;await step(10);assert(combat.currentTime>ct);assert.equal(playing().length,1);
 await step(620);assert.equal(playing()[0],combat);assert(combat.currentTime<59.1);assert.equal(playing().length,1,'loop without double track');
 c.__audio.setMute(true);assert.equal(playing().length,0);let paused=combat.currentTime;await step();assert.equal(combat.currentTime,paused);c.__audio.setMute(false);await step();assert(combat.currentTime>paused);
 c.document.hidden=true;events.visibilitychange();paused=combat.currentTime;await step();assert.equal(playing().length,0);assert.equal(combat.currentTime,paused);c.document.hidden=false;events.visibilitychange();await step();assert.equal(playing()[0],combat);
 c.endBattle('win');await battle;await step();assert.equal(playing().length,0,'settlement fades out');
 const saved=day.currentTime;c.B=null;c.mode='scene';c.cur=c.SC.prologue_clinic_interior;await step();assert.equal(playing()[0],day);assert(day.currentTime>=saved&&day.currentTime<saved+3);
 c.S.qiheChapter={stage:'fire'};await step();assert.equal(playing().length,0,'no warm village music during fire');
 c.mode='battle';c.B={bg:'bb_qh_evacuation_v1'};const retry=c.battleLoop();await step(3);assert.equal(playing()[0],combat);assert(combat.currentTime<1,'new battle starts from zero');c.endBattle('lose');await retry;
 c.mode='scene';c.S.qiheChapter.stage='days';await step(2);c.mode='end';await step();assert.equal(playing().length,0,'latest destination wins');
 c.mode='scene';c.cur=c.SC.qh_mountain;c.S.qiheChapter.stage='ended';await step();assert.equal(playing().length,0,'first mountain night remains quiet');
 c.mode='cultivation';c.S.qiheChapter.stage='cultivation';await step();const home=playing()[0];assert(home.src.endsWith('bgm_qh_cultivation_v5_short.wav'));home.duration=108.74110416666667;
 const ht=home.currentTime;c.mode='scene';nodes.get('panel').hidden=false;await step();assert.equal(playing()[0],home);assert(home.currentTime>ht,'martial menu keeps position');nodes.get('panel').hidden=true;c.mode='cultivation';await step();assert.equal(playing()[0],home);
 c.mode='battle';c.B={bg:'bb_qh_training_v1'};const training=c.battleLoop();await step();assert.equal(playing()[0],combat);const resume=home.currentTime;c.endBattle('win');await training;c.B=null;c.mode='cultivation';await step();assert.equal(playing()[0],home);assert(home.currentTime>=resume&&home.currentTime<resume+3);
 c.__audio.setMute(true);paused=home.currentTime;await step();assert.equal(playing().length,0);assert.equal(home.currentTime,paused);c.__audio.setMute(false);await step();assert.equal(playing()[0],home);
 c.document.hidden=true;events.visibilitychange();paused=home.currentTime;await step();assert.equal(home.currentTime,paused);assert.equal(playing().length,0);c.document.hidden=false;events.visibilitychange();await step();assert.equal(playing()[0],home);
 await step(1100);assert.equal(playing().length,1);assert.equal(playing()[0],home);assert.equal(audios.filter(a=>a.src.endsWith('bgm_qh_cultivation_v5_short.wav')).length,1);
 c.mode='scene';c.cur=c.SC.qh_south;await step();assert(home.paused,'travel leaves cultivation music');assert(playing()[0].src.includes('bgm_qh_daily_v2'));
 console.log('PASS cultivation WAV, first-night silence, menu continuity, combat return, mute, visibility, 109s loop, travel routing');
 console.log('PASS gesture, daily continuity, dialog/voice duck, battle, 60s loop, mute, hidden, settlement, resume, fire, retry, rapid transition');
})().catch(e=>{console.error(e);process.exitCode=1});
