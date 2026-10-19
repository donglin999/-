// ───────────────────────── 音频 (audio.js) ─────────────────────────
// 自包含：只读取/包裹其它脚本的全局（say/choose/toast/fade/openPanel/closePanel/goScene, player/mode/cur/cam/S/SC/TS），
// 不修改它们的实现。资产在 assets/audio/，重新生成：python3 tools_audio/gen_audio.py [slug...]
// 用 HTMLAudioElement（file:// 下也能播放，无需 fetch）。首次用户手势后才开声。M 键/右上喇叭按钮静音（localStorage 记忆）。
(function(){
const DIR='assets/audio/';
const VOL={bgm:.25,amb:.35,sfx:.5};
// 每条素材的额外增益（粗略响度对齐；试听后可微调）
const GAIN={blip:.35,advance:.6,select:.7,menu_open:.6,menu_close:.6,chime:.7,whoosh:.35,coin:.8};
// 非栖河入口的场景音景表；原襄阳街市 bgm_street/amb_street 已于 2026-10-19 归档，栖河音景见 qiheSoundscape。
const SCENES={};

let muted=false;try{muted=localStorage.getItem('xjh.mute')==='1'}catch(e){}
let started=false;
const pool={};
let sfxCapture=null;
function sfx(name,vol=1,rate=1){if(!started||muted||document.hidden)return;
  const list=pool[name]||(pool[name]=[]);let a=list.find(x=>x.paused||x.ended);
  if(!a){if(list.length>=4)a=list[0];else{a=new Audio(window.PRODUCTION_AUDIO_PATHS?.[name]||DIR+name+(name.startsWith('arts_')?'.wav':'.mp3'));a.preload='auto';list.push(a)}}
  try{a.currentTime=0}catch(e){}
  a.volume=Math.max(0,Math.min(1,VOL.sfx*(GAIN[name]??1)*vol));a.playbackRate=rate;a.preservesPitch=false;
  const capture=sfxCapture,event={name,src:a.src,volume:a.volume,rate:a.playbackRate,timestamp:Date.now()/1000};
  const p=a.play();p&&p.then(()=>{if(capture)capture.events.push(event)}).catch(()=>{})}

// 双元素交叉淡化循环（掩盖 mp3 循环缝）
function Loop(kind){this.kind=kind;this.name=null;this.els=[];this.i=0;this.target=0;this.level=0}
Loop.prototype.set=function(name){if(name===this.name)return;this.name=name;this.target=0;this.pending=name};
Loop.prototype.tick=function(dt){
  // 淡出后切换
  if(this.pending!==undefined&&this.level<=0.001){this.els.forEach(a=>{a.pause()});this.els=[];
    const n=this.pending;delete this.pending;if(n){for(let k=0;k<2;k++){const a=new Audio(DIR+n+'.mp3');a.preload='auto';this.els.push(a)}this.i=0;this.fresh=true}}
  if(this.pending===undefined)this.target=this.name&&!muted&&started?1:0;
  const sp=dt/1.6;this.level+=Math.max(-sp,Math.min(sp,this.target-this.level));
  if(!this.els.length)return;
  const a=this.els[this.i],b=this.els[1-this.i],base=VOL[this.kind];
  if(this.fresh&&started&&!muted){this.fresh=false;a.currentTime=0;a.play().catch(()=>{this.fresh=true})}
  const XF=2.5,d=a.duration;let fa=1,fb=0;
  if(d&&isFinite(d)&&d>XF*2){const left=d-a.currentTime;
    if(left<XF){if(b.paused){b.currentTime=0;b.play().catch(()=>{})}fb=Math.min(1,b.currentTime/XF);fa=Math.max(0,left/XF)}
    if(a.ended||left<0.05){a.pause();this.i=1-this.i;fa=fb;fb=0}}
  const A=this.els[this.i],B=this.els[1-this.i];
  A.volume=base*this.level*(A===a?fa:fb);if(!B.paused)B.volume=base*this.level*(B===a?fa:fb);
  if(this.level<=0.001&&!A.paused&&(muted||!started)){A.pause();B.pause();this.fresh=true}
};
// Qihe uses one element per track: no overlapping drum patterns at loop boundaries.
function MusicLoop(kind){this.kind=kind;this.name=null;this.playingName=null;this.level=0;this.gain=1;this.cache=new Map();this.failures=new Set()}
MusicLoop.prototype.set=function(name){this.name=name};
MusicLoop.prototype.restart=function(name){const a=this.cache.get(name);if(a){a.pause();a.currentTime=0}if(this.playingName===name)this.level=0};
MusicLoop.prototype.element=function(name){
 if(this.cache.has(name))return this.cache.get(name);
 const a=new Audio(window.PRODUCTION_AUDIO_PATHS?.[name]||DIR+name+(name==='bgm_qh_cultivation_v5_short'?'.wav':'.mp3'));
 a.preload='auto';a.loop=true;a.volume=0;a.hidden=true;a.dataset.bgm=name;
 a.addEventListener('error',()=>{this.failures.add(name);a.pause();console.warn('BGM unavailable:',name)});
 (document.getElementById('game')||document.body).appendChild(a);this.cache.set(name,a);return a;
};
MusicLoop.prototype.suspend=function(){for(const a of this.cache.values())a.pause();this.level=0};
MusicLoop.prototype.tick=function(dt){
 if(!started||muted||document.hidden){this.suspend();return}
 // The newest desired name wins even if a previous fade has not finished.
 if(this.name!==this.playingName){
  this.level=Math.max(0,this.level-dt/(this.name?.includes('battle')?.6:.8));
  const old=this.cache.get(this.playingName);if(old)old.volume=VOL[this.kind]*this.level*this.gain;
  if(this.level>0)return;
  if(old)old.pause();this.playingName=this.name;
 }
 if(!this.playingName||this.failures.has(this.playingName))return;
 const a=this.element(this.playingName);this.level=Math.min(1,this.level+dt/(this.playingName.includes('battle')?.2:1.2));
 const t=a.currentTime,d=a.duration,edge=Number.isFinite(d)?Math.max(0,Math.min(1,t/.06,(d-t)/.06)):1;
 a.volume=Math.max(0,Math.min(1,VOL[this.kind]*this.level*this.gain*edge));
 if(a.paused&&!a._requestPending){a._requestPending=true;a.play().catch(()=>{}).finally(()=>{a._requestPending=false;if(muted||document.hidden||this.playingName!==a.dataset.bgm)a.pause()})}
};
const qiheAudio=typeof isQiheEntry==='function'&&isQiheEntry();
const bgm=qiheAudio?new MusicLoop('bgm'):new Loop('bgm'),amb=new Loop('amb');
let seenBattle=null,settledBattle=null,voiceDepth=0;
function qiheSoundscape(md,id,state,battle){
 if(md==='battle'){
  if(!battle||battle===settledBattle)return {};
  if(battle!==seenBattle){seenBattle=battle;bgm.restart('bgm_qh_battle_v2')}
  return {bgm:'bgm_qh_battle_v2',gain:battle.bg==='bb_qh_training_v1'?.8:1};
 }
 if(md==='cultivation')return {bgm:'bgm_qh_cultivation_v5_short'};
 if(md!=='scene')return {};
 const chapter=state?.qiheChapter?.stage;
 if(id==='qh_mountain'&&chapter==='cultivation')return {bgm:'bgm_qh_cultivation_v5_short'};
 if(state?.prologue?.ending||['fire','escape','refuge','mountain','ended'].includes(chapter))return {};
 if(/^(qihe_|qh_|prologue_)/.test(id||''))return {bgm:'bgm_qh_daily_v2'};
 return SCENES[id]||{};
}
function voice(active){voiceDepth=Math.max(0,voiceDepth+(active?1:-1))}
document.addEventListener('visibilitychange',()=>{if(document.hidden){bgm.suspend?.();for(const l of [amb])for(const a of l.els)a.pause();for(const list of Object.values(pool))for(const a of list)a.pause()}});


// ── 静音按钮 ──
function btn(){const g=document.getElementById('game');if(!g||document.getElementById('sndbtn'))return;
  const b=document.createElement('button');b.id='sndbtn';b.className='ui';b.setAttribute('aria-label','声音开关（M）');b.title='声音开关（M）';
  b.style.cssText='position:absolute;top:calc(12px + 3.4em);right:12px;z-index:30;width:2.1em;height:2.1em;padding:0;font-size:17.3px;'+
   'background:linear-gradient(#2b2119,#17110c);color:#e7d3a3;border:1px solid #8a6a3a;border-radius:4px;box-shadow:0 0 0 1px #0008,inset 0 0 6px #0009;cursor:pointer;line-height:1;opacity:.85';
  b.onclick=e=>{e.stopPropagation();setMute(!muted)};g.appendChild(b);paint()}
function paint(){const b=document.getElementById('sndbtn');if(b){b.textContent=muted?'🔇':'🔊';b.style.opacity=muted?.55:.85}}
function setMute(m){muted=m;try{localStorage.setItem('xjh.mute',m?'1':'0')}catch(e){}paint();if(m){window.BattleVoice?.stop();window.CharacterVoice?.stop();bgm.suspend?.();for(const list of Object.values(pool))for(const a of list)a.pause();for(const a of amb.els)a.pause();amb.fresh=true;}if(!m)start()}

function start(){if(started)return;started=true;[bgm,amb].forEach(l=>l.fresh=true)}
['pointerdown','keydown','touchstart'].forEach(t=>addEventListener(t,start,{capture:true}));
addEventListener('keydown',e=>{if((e.key==='m'||e.key==='M')&&!e.repeat&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')){setMute(!muted)}});

// ── 包裹全局函数 ──
function wrap(name,f){try{const o=window[name]??eval(name);if(typeof o!=='function')return;const w=f(o);eval(name+'=w');window[name]===o&&(window[name]=w)}catch(e){console.warn('audio: cannot wrap',name,e)}}
wrap('say',o=>function(who,text){const dlg=document.getElementById('dlg');const s=String(text),voice=window.CharacterVoice?.begin(who,text,arguments[2]);let n=0;
  const iv=setInterval(()=>{const t=dlg&&dlg.querySelector('.txt');if(!t||dlg.hidden){clearInterval(iv);return}
    const L=t.textContent.length;if(L>=s.length){clearInterval(iv);return}if(!voice?.matched&&(L>n+1||(L>n&&n%2===0)))sfx('blip',1,.95+Math.random()*.15);n=L},45);
  return o.apply(this,arguments).finally(()=>{clearInterval(iv);window.CharacterVoice?.stop(voice?.token)}).then(r=>{sfx('advance');return r})});
wrap('choose',o=>function(who,text,opts,sp){const voice=window.CharacterVoice?.begin(who,text,sp);return o.apply(this,arguments).finally(()=>window.CharacterVoice?.stop(voice?.token)).then(r=>{sfx('select');return r})});
wrap('toast',o=>function(t){if(!/^购得/.test(String(t)))sfx('chime');return o.apply(this,arguments)});
wrap('openPanel',o=>function(){if(document.getElementById('panel')?.hidden)sfx('menu_open');return o.apply(this,arguments)});
wrap('closePanel',o=>function(){if(!document.getElementById('panel')?.hidden)sfx('menu_close');return o.apply(this,arguments)});
wrap('fade',o=>function(){window.CharacterVoice?.stop();if(typeof mode!=='undefined'&&mode==='scene')sfx('whoosh');return o.apply(this,arguments)});

wrap('battleLoop',o=>async function(){const current=g('B');try{return await o.apply(this,arguments)}finally{settledBattle=current}});

// ── 轮询：场景音景 / 银两 ──
// 现有脚步素材带明显金属铃音，暂不按行走距离循环播放。
let last=performance.now(),silver=null;
function g(n){try{return eval(n)}catch(e){return undefined}}
function frame(now){const dt=Math.min(.1,(now-last)/1000);last=now;btn();
  const md=g('mode'),c=g('cur'),P=g('player'),SCx=g('SC'),S_=g('S'),TSz=g('TS')||48;
  let id=null;if(md==='scene'&&c&&SCx)for(const k in SCx)if(SCx[k]===c){id=k;break}
  const cfg=qiheAudio?qiheSoundscape(md,id,S_,g('B')):(SCENES[id]||{});
  const talking=!document.getElementById('dlg')?.hidden,menu=!document.getElementById('panel')?.hidden;
  const targetGain=(cfg.gain||1)*(voiceDepth?0.5:(talking||menu)?0.708:1);
  if(qiheAudio)bgm.gain+=Math.max(-dt*3,Math.min(dt*3,targetGain-bgm.gain));
  bgm.set(cfg.bgm||null);amb.set(document.hidden?null:cfg.amb||null);bgm.tick(dt);amb.tick(dt);
  if(md==='scene'&&P){
  }
  if(S_&&typeof S_.silver==='number'){if(silver!==null&&S_.silver<silver)sfx('coin');silver=S_.silver}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.__audio={sfx,setMute,get muted(){return muted},get started(){return started},bgm,amb,voice,
  beginSfxCapture(){if(typeof isQiheBattleReview!=='function'||!isQiheBattleReview())return false;sfxCapture={kind:'successful_game_sfx_playback_events',start:Date.now()/1000,events:[]};return true},
  endSfxCapture(){const capture=sfxCapture;sfxCapture=null;if(capture)capture.end=Date.now()/1000;return capture}};
})();
// 面板/对话打开时隐藏声音按钮，避免遮挡界面右上角
(function(){const tick=()=>{const b=document.getElementById('sndbtn'),p=document.getElementById('panel'),m=document.getElementById('mapui');if(b)b.style.visibility=((p&&!p.hidden)||(m&&!m.hidden))?'hidden':'';requestAnimationFrame(tick)};requestAnimationFrame(tick)})();
