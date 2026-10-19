const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'../..');let now=0,raf=[],timers=[],audio=[],duck=0;
const nodes={game:{appendChild(){}},dlg:{hidden:true}};
class Audio {constructor(url){this.src=url;this.paused=true;this.dataset={};audio.push(this)}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
const bank={characters:{}};
for(const cid of ['ye','suzhi','liu']){const events={};for(const e of ['turn','attack','hurt','down','support'])events[e]=[0,1].map(i=>({id:cid+'.'+e+i,url:cid+e+i+'.mp3'}));bank.characters[cid]={name:cid==='ye'?'叶蘅':cid==='suzhi'?'苏芷':'疤脸刘',events}}
const c={console,Audio,Math:Object.assign(Object.create(Math),{random:()=>0}),performance:{now:()=>now},document:{hidden:false,getElementById:id=>nodes[id],body:nodes.game,addEventListener:(k,f)=>c[k]=f},setTimeout:f=>{timers.push(f);return timers.length},clearTimeout:id=>{timers[id-1]=null},requestAnimationFrame:f=>raf.push(f),GAME_BATTLE_VOICES:bank,mode:'battle',B:{auto:false},__audio:{started:true,muted:false,voice:on=>{duck+=on?1:-1}},SKILLS:{heal:{heal:.3},buff:{},hit:{}},BSK:{buff:{buff:1}},QiheUIModel:{skillWhy:()=>null},battleLoop(){},allyTurn(){return 'menu'},doAttack(u,t,bp){for(let i=0;i<=bp;i++)c.hurt(t,1)},doSkill(){},foeAct(){},hurt(u,n){u.hp=Math.max(0,u.hp-n)},tickBuffs(u){if(u.bleedN)u.hp=Math.max(0,u.hp-1)},aliveOf:()=>[1]};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'js/battle-voice.js'),'utf8'),c);
function unit(cid,extra={}){return {key:cid,name:cid,hp:50,mhp:100,side:'ally',...extra}}
function end(){audio.filter(a=>!a.paused).forEach(a=>a.onended?.())}
function step(ms=4000){now+=ms;const t=timers;timers=[];t.forEach(f=>f?.());const r=raf;raf=[];r.forEach(f=>f())}
const voice=c.BattleVoice,ye=unit('ye'),su=unit('suzhi'),hero=unit('hero',{isHero:true}),animal=unit('wolf'),foe=unit('liu',{side:'foe'});
c.battleLoop();assert.equal(voice.identity(hero),null);assert.equal(voice.identity(animal),null);assert.equal(voice.identity(unit('bandit',{name:'拦路帮众'})),null);
c.__audio.started=false;c.allyTurn(ye);assert.equal(audio.length,0);c.__audio.started=true;
c.allyTurn(ye);assert.equal(voice.current.event,'turn');assert.equal(duck,1);const oldFinish=audio.at(-1).onended;
c.doAttack(ye,animal,3);assert.equal(voice.current.event,'attack');assert.equal(audio.filter(a=>!a.paused).length,1);assert.equal(audio.filter(a=>a.dataset.event==='attack').length,1,'multi-hit only one cue');oldFinish();assert.equal(voice.current.event,'attack');assert.equal(duck,1,'stale callback cannot undo duck');
c.hurt(su,100);assert.equal(voice.current.character,'suzhi');assert.equal(voice.current.event,'down');const n=audio.length;c.hurt(su,1);assert.equal(audio.length,n);end();assert.equal(duck,0);
step();c.doSkill(ye,'heal');assert.equal(voice.current.event,'support');end();step();c.doSkill(ye,'buff');assert.equal(voice.current.event,'support');end();
step();c.hurt(ye,1);assert.equal(voice.current.event,'hurt');end();const count=audio.length;c.hurt(ye,1);assert.equal(audio.length,count,'hurt cooldown');
step();c.doAttack(ye,animal,0);const a1=voice.current.line;end();step();c.doAttack(ye,animal,0);assert.notEqual(voice.current.line,a1,'no consecutive repeat');end();
c.B={auto:true};c.battleLoop();c.allyTurn(ye);assert.equal(voice.current,null,'auto has no turn cue');c.doAttack(ye,animal,0);assert.equal(voice.current.event,'attack');
c.document.hidden=true;c.visibilitychange();assert.equal(duck,0);assert.equal(audio.filter(a=>!a.paused).length,0);c.document.hidden=false;
step();c.__audio.muted=true;c.doAttack(ye,animal,0);assert.equal(voice.current,null);c.__audio.muted=false;
step();c.foeAct(foe);assert.equal(voice.current.character,'liu');nodes.dlg.hidden=false;step(16);assert.equal(duck,0,'dialogue wins');nodes.dlg.hidden=true;
c.B={};c.battleLoop();ye.hp=1;ye.bleedN=1;c.tickBuffs(ye);assert.equal(voice.current.event,'down');c.mode='scene';step(16);assert.equal(voice.current,null);assert.equal(duck,0);
console.log('PASS battle voice: identity, gesture, single bus, priority, multi-hit/death dedupe, old callbacks, support, cooldown, variants, auto, mute, hidden, dialogue, DOT defeat, exit');
