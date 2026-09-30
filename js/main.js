'use strict';
// ───────────────────────── 输入 ─────────────────────────
function toLocal(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
cv.addEventListener('pointermove',e=>{const[x,y]=toLocal(e);if(mode==='battle'&&B)B.hover=cellAt(x,y);
  if(mode==='scene'&&!busy&&!dlgBusy&&$('panel').hidden)ContainerSystem.setHover(x/ZOOM+cam.x,y/ZOOM+cam.y);
  if(mode==='map'){mapHover=NODES.find(n=>S.unlocked[n.id]&&Math.hypot(n.x*W-x,n.y*H-y)<40)||null;cv.style.cursor=mapHover?'pointer':''}});
cv.addEventListener('pointerdown',e=>{const[x,y]=toLocal(e),sx=x,sy=y;
  if(mode==='battle'&&B&&B.click){const c=cellAt(x,y);if(c)B.click(...c);return}
  if(mode==='map'&&mapPick){const n=NODES.find(n=>S.unlocked[n.id]&&Math.hypot(n.x*W-x,n.y*H-y)<30);if(n){mapSel=n;mapUI()}return}
  if(mode==='scene'&&!busy&&!dlgBusy&&$('panel').hidden){const x=sx/ZOOM+cam.x,y=sy/ZOOM+cam.y;
    const loot=ContainerSystem.targetAt(x,y);if(loot){ContainerSystem.click(loot);return}
    const hit=npcsOf(cur).filter(n=>!n.loot).find(n=>{const p=npcPos(n),h=n.sp?npcH(n):30,hw=n.sp?Math.max(20,h*.28):24;return Math.abs(p.x-x)<hw&&y<p.y+10&&y>p.y-h});
    if(hit){const p=npcPos(hit);if(Math.hypot(p.x-player.x,p.y-player.y)<80){interact(hit);return}
      // 走到 NPC 身旁（优先靠近主角的一侧），到达后自动交谈
      const side=player.x<p.x?-1:1,off=hit.sp?Math.max(34,npcH(hit)*.4):20;
      const cand=[[p.x+side*off,p.y+2],[p.x-side*off,p.y+2],[p.x,p.y+off*.8],[p.x,p.y-off*.6]];
      let path=null;for(const[cx,cy]of cand){if(standOk(cx,cy)&&!npcBlock(cx,cy)){path=setPath(cx,cy);if(path)break}}
      if(!path)path=setPath(p.x,p.y+40);player.talkTo=path?hit:null;return}
    player.talkTo=null;const now=performance.now(),dbl=now-lastClick<320&&Math.hypot(sx-lastCX,sy-lastCY)<60;lastClick=now;lastCX=sx;lastCY=sy;
    setPath(x,y,dbl?true:e.pointerType==='touch'?'touch':undefined)}});
let lastClick=0,lastCX=0,lastCY=0;
const KM={a:'left',arrowleft:'left',d:'right',arrowright:'right',w:'up',arrowup:'up',s:'down',arrowdown:'down'};
// Shift 切换步行/跑步，不依赖按键持续按下。失焦后复位，避免回到页面时意外疾跑。
let walkRunToggle=false;
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();
  if(k==='shift'&&mode==='scene'&&!e.repeat&&!busy&&!dlgBusy&&$('panel').hidden){walkRunToggle=!walkRunToggle;e.preventDefault();toast(walkRunToggle?'步法：跑步':'步法：步行',850)}
  // 双击方向键：跑步，直到松开所有方向键
  if(KM[k]&&mode==='scene'){if(!e.repeat&&!keys[KM[k]]){const now=performance.now();if(tapDir===KM[k]&&now-tapT<280)keys.run=1;tapDir=KM[k];tapT=now}keys[KM[k]]=1;e.preventDefault()}
  if((k==='e'||k===' ')&&mode==='scene'&&!dlgBusy&&$('panel').hidden){e.preventDefault();interact()}
  if(k==='i'&&mode==='scene'&&!dlgBusy&&!busy)bagPanel()});
let tapDir=null,tapT=0;
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(KM[k]){keys[KM[k]]=0;if(!keys.left&&!keys.right&&!keys.up&&!keys.down)keys.run=0}});
addEventListener('blur',()=>{for(const k in keys)keys[k]=0;walkRunToggle=false});
for(const[id,key]of[['tl','left'],['tr','right'],['tu','up'],['td','down']]){const b=$(id);b.onpointerdown=()=>keys[key]=1;b.onpointerup=b.onpointerleave=()=>keys[key]=0}
$('te').onclick=()=>interact();

// ───────────────────────── 主循环 ─────────────────────────
let last=performance.now();
function frame(t){const dt=Math.min(50,t-last);last=t;fitCanvas();
  if(mode==='title'||mode==='end'){drawBg('bg_title');vignette();}
  else if(mode==='scene'&&cur){updateScene(dt);drawScene(t);S.x=player.x;S.y=player.y}
  else if(mode==='map')drawMap(t);
  else if(mode==='battle'&&B)drawBattle(t);
  requestAnimationFrame(frame)}
loadAll(p=>$('lbar').style.width=p*100+'%').then(()=>{$('loading').hidden=true;if(['#street','#streetbright','#xiangyang'].includes(location.hash))reviewStart();else titleScreen();requestAnimationFrame(frame)});
setInterval(()=>{if(S&&mode==='scene'&&!busy)save()},5000);
