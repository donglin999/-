// ───────────────────────── 音频 (audio.js) ─────────────────────────
// 自包含：只读取/包裹其它脚本的全局（say/choose/toast/fade/openPanel/closePanel/goScene, player/mode/cur/cam/S/SC/TS），
// 不修改它们的实现。资产在 assets/audio/，重新生成：python3 tools_audio/gen_audio.py [slug...]
// 用 HTMLAudioElement（file:// 下也能播放，无需 fetch）。首次用户手势后才开声。M 键/右上喇叭按钮静音（localStorage 记忆）。
(function(){
const DIR='assets/audio/';
const VOL={bgm:.25,amb:.35,sfx:.5};
// 每条素材的额外增益（粗略响度对齐；试听后可微调）
const GAIN={blip:.35,advance:.6,select:.7,menu_open:.6,menu_close:.6,chime:.7,whoosh:.35,coin:.8,forge:.5,kettle:1};
// 各场景的音景；未列出的场景保持安静
const SCENES={street:{bgm:'bgm_street',amb:'amb_street'}};

let muted=false;try{muted=localStorage.getItem('xjh.mute')==='1'}catch(e){}
let started=false;
const pool={};
function sfx(name,vol=1,rate=1){if(!started||muted)return;
  const list=pool[name]||(pool[name]=[]);let a=list.find(x=>x.paused||x.ended);
  if(!a){if(list.length>=4)a=list[0];else{a=new Audio(DIR+name+'.mp3');a.preload='auto';list.push(a)}}
  try{a.currentTime=0}catch(e){}
  a.volume=Math.max(0,Math.min(1,VOL.sfx*(GAIN[name]??1)*vol));a.playbackRate=rate;a.preservesPitch=false;
  const p=a.play();p&&p.catch(()=>{})}

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
const bgm=new Loop('bgm'),amb=new Loop('amb');

// ── 静音按钮 ──
function btn(){const g=document.getElementById('game');if(!g||document.getElementById('sndbtn'))return;
  const b=document.createElement('button');b.id='sndbtn';b.className='ui';b.setAttribute('aria-label','声音开关（M）');b.title='声音开关（M）';
  b.style.cssText='position:absolute;top:calc(12px + 3.4em);right:12px;z-index:30;width:2.1em;height:2.1em;padding:0;font-size:max(13px,1.35cqw);'+
   'background:linear-gradient(#2b2119,#17110c);color:#e7d3a3;border:1px solid #8a6a3a;border-radius:4px;box-shadow:0 0 0 1px #0008,inset 0 0 6px #0009;cursor:pointer;line-height:1;opacity:.85';
  b.onclick=e=>{e.stopPropagation();setMute(!muted)};g.appendChild(b);paint()}
function paint(){const b=document.getElementById('sndbtn');if(b){b.textContent=muted?'🔇':'🔊';b.style.opacity=muted?.55:.85}}
function setMute(m){muted=m;try{localStorage.setItem('xjh.mute',m?'1':'0')}catch(e){}paint();if(!m)start()}

function start(){if(started)return;started=true;[bgm,amb].forEach(l=>l.fresh=true)}
['pointerdown','keydown','touchstart'].forEach(t=>addEventListener(t,start,{capture:true}));
addEventListener('keydown',e=>{if((e.key==='m'||e.key==='M')&&!e.repeat&&!/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'')){setMute(!muted)}});

// ── 包裹全局函数 ──
function wrap(name,f){try{const o=window[name]??eval(name);if(typeof o!=='function')return;const w=f(o);eval(name+'=w');window[name]===o&&(window[name]=w)}catch(e){console.warn('audio: cannot wrap',name,e)}}
wrap('say',o=>function(who,text){const dlg=document.getElementById('dlg');const s=String(text);let n=0;
  const iv=setInterval(()=>{const t=dlg&&dlg.querySelector('.txt');if(!t||dlg.hidden){clearInterval(iv);return}
    const L=t.textContent.length;if(L>=s.length){clearInterval(iv);return}if(L>n+1||(L>n&&n%2===0))sfx('blip',1,.95+Math.random()*.15);n=L},45);
  return o.apply(this,arguments).then(r=>{clearInterval(iv);sfx('advance');return r})});
wrap('choose',o=>function(){return o.apply(this,arguments).then(r=>{sfx('select');return r})});
wrap('toast',o=>function(t){if(!/^购得/.test(String(t)))sfx('chime');return o.apply(this,arguments)});
wrap('openPanel',o=>function(){if(document.getElementById('panel')?.hidden)sfx('menu_open');return o.apply(this,arguments)});
wrap('closePanel',o=>function(){if(!document.getElementById('panel')?.hidden)sfx('menu_close');return o.apply(this,arguments)});
wrap('fade',o=>function(){if(typeof mode!=='undefined'&&mode==='scene')sfx('whoosh');return o.apply(this,arguments)});

// ── 轮询：场景音景 / 铁匠铺 / 银两 ──
// 现有脚步素材带明显金属铃音，暂不按行走距离循环播放。
let last=performance.now(),forgeT=3,kettleT=8,silver=null;
function g(n){try{return eval(n)}catch(e){return undefined}}
function frame(now){const dt=Math.min(.1,(now-last)/1000);last=now;btn();
  const md=g('mode'),c=g('cur'),P=g('player'),SCx=g('SC'),S_=g('S'),TSz=g('TS')||48;
  let id=null;if(md==='scene'&&c&&SCx)for(const k in SCx)if(SCx[k]===c){id=k;break}
  const cfg=SCENES[id]||{};bgm.set(cfg.bgm||null);amb.set(cfg.amb||null);bgm.tick(dt);amb.tick(dt);
  if(md==='scene'&&P){
    if(id==='street'){const npcs=c.npcs||[],sm=npcs.find(n=>n.id==='smith');
      if(sm){const dist=Math.hypot(P.x-sm.x*TSz,P.y-sm.y*TSz)/TSz;forgeT-=dt;
        if(forgeT<=0){forgeT=2.8+Math.random()*2.5;if(dist<12)sfx('forge',Math.max(.15,1-dist/12),.95+Math.random()*.1)}}
      kettleT-=dt;if(kettleT<=0){kettleT=14+Math.random()*12;sfx('kettle',.8)}}
  }
  if(S_&&typeof S_.silver==='number'){if(silver!==null&&S_.silver<silver)sfx('coin');silver=S_.silver}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.__audio={sfx,setMute,get muted(){return muted},get started(){return started},bgm,amb};
})();
// 面板/对话打开时隐藏声音按钮，避免遮挡界面右上角
(function(){const tick=()=>{const b=document.getElementById('sndbtn'),p=document.getElementById('panel'),m=document.getElementById('mapui');if(b)b.style.visibility=((p&&!p.hidden)||(m&&!m.hidden))?'hidden':'';requestAnimationFrame(tick)};requestAnimationFrame(tick)})();
