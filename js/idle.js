'use strict';
// ───────────────────────── 可交互 NPC 待机活动 ─────────────────────────
// scene.js 的 drawNpc() 调 npcIdle() 取当帧姿态（朝向/位移/踏步），再调 npcIdleFx() 画职业小动作与表情气泡。
// 通用行为：主角靠近（<110）时转身看向主角；否则按权重随机「左右张望 / 原地踏步 / 点头 / 冒气泡 / 职业动作」，间隔 2.5–6s。
// 职业动作 act：hammer 打铁火星 · steam 茶水热气 · tell 说书拍醒木 · bead 捻珠垂首 · fan 摇扇张望 · doze 打盹 · sway 摇橹晃身 · guard 站岗巡视
const IDLE_ROLE={
  smith:{act:'hammer',emo:['嘿哈！','好铁！'],w:{look:1,step:0,nod:0,emo:1}},
  lady:{act:'steam',emo:['♪','来碗茶？','雨前龙井～'],w:{look:2,step:1,nod:1,emo:2}},
  oldman:{act:'tell',emo:['话说……','啪！','且听下回'],w:{look:1,step:0,nod:2,emo:2}},
  monk:{act:'bead',emo:['阿弥陀佛','……'],w:{look:1,step:0,nod:3,emo:1}},
  gossip:{act:'fan',emo:['嘿嘿','听说了没？','嘘——'],w:{look:4,step:1,nod:0,emo:2}},
  beggar:{act:'doze',emo:['Zz…','咕……'],w:{look:1,step:0,nod:1,emo:2}},
  boatman:{act:'sway',emo:['哎——嗨——','起风喽'],w:{look:2,step:0,nod:1,emo:1}},
  soldier:{act:'guard',emo:['……','站好了！'],w:{look:3,step:1,nod:0,emo:1}},
  bandit:{act:'none',emo:['哼','看什么看'],w:{look:3,step:2,nod:0,emo:1}},
  suzhi:{act:'none',emo:['……','嗯'],w:{look:2,step:1,nod:1,emo:1}},
  villager:{act:'none',emo:['唉……','……水'],w:{look:1,step:0,nod:1,emo:1}},
  _:{act:'none',emo:['……'],w:{look:2,step:1,nod:1,emo:1}}};
const NOIDLE=new Set(['snake','rooster','dog','chief','wolf']);   // 敌/动物另有表现或需保持威慑
const idleSt=new Map();
function idleOf(n){const k=spKey(n.sp),id=n.id||n.name||k;let s=idleSt.get(id);
  if(!s){s={k,role:IDLE_ROLE[k]||IDLE_ROLE._,act:null,t0:0,next:performance.now()+rnd(800,3000),dir:null,parts:[],emo:null,lastT:0,cycle:rnd(0,1400)};idleSt.set(id,s)}return s}
function pickW(w){const e=Object.entries(w),tot=e.reduce((a,[,v])=>a+v,0);let r=Math.random()*tot;for(const[k,v]of e){if((r-=v)<0)return k}return e[0][0]}
function npcIdle(n,t,near){if(!n.sp)return null;const s=idleOf(n);if(NOIDLE.has(s.k))return null;
  const base=n.dir||'d',x=n.x*TS,y=n.y*TS,pd=Math.hypot(player.x-x,player.y-y);const r={dir:s.dir||base,dx:0,dy:0,moving:false,walk:0};
  // 靠近或正在交谈：看向主角
  if(pd<110||(near&&near.o===n)){s.act=null;s.dir=null;r.dir=faceTo(player.x-x,player.y-y);return r}
  if(!s.act&&t>s.next){s.act=pickW(s.role.w);s.t0=t;
    if(s.act==='look'){const side=['l','r','d'].filter(d=>d!==base);s.dir=side[ri(0,side.length-1)];s.dur=rnd(1200,2400)}
    else if(s.act==='step')s.dur=560;else if(s.act==='nod')s.dur=700;
    else if(s.act==='emo'){s.emo={txt:s.role.emo[ri(0,s.role.emo.length-1)],t0:t};s.dur=10}}
  const e=t-s.t0;
  if(s.act==='step'){r.moving=true;r.walk=e*.09}
  else if(s.act==='nod'){r.dy=Math.max(0,Math.sin(e/700*Math.PI*2))*3}
  if(s.act&&e>s.dur){s.act=null;s.dir=null;s.next=t+rnd(2500,6000)}
  r.dir=s.dir||base;
  // 职业动作对姿态的影响
  const a=s.role.act,cy=(t+s.cycle)%1400;
  if(a==='hammer'&&cy<140)r.dy=3;
  else if(a==='bead')r.dy+=(Math.sin(t/900)>.6?2:0);
  else if(a==='doze')r.dy+=Math.sin(t/1100)>0?1.5:0;
  else if(a==='sway')r.dx=Math.round(Math.sin(t/800)*2);
  else if(a==='tell'&&(t+s.cycle)%4200<160)r.dy=2;
  return r}
// 世界坐标里以 3×3 为 1 个美术像素，与角色像素同尺度
function ipx(x,y,col,a=1){g.globalAlpha=a;g.fillStyle=col;g.fillRect(Math.round(x/3)*3,Math.round(y/3)*3,3,3)}
function npcIdleFx(n,t,x,y,h,near,id){const s=idleOf(n);if(NOIDLE.has(s.k))return;const dt=Math.min(50,s.lastT?t-s.lastT:16);s.lastT=t;
  const dir=id&&id.dir||n.dir||'d',fx=dir==='l'?-1:dir==='r'?1:0,a=s.role.act,cy=(t+s.cycle)%1400;
  // 生成
  if(a==='hammer'&&cy<dt+1){for(let i=0;i<7;i++)s.parts.push({x:x+fx*h*.28,y:y-h*.3,vx:(fx||1)*rnd(-.5,2.5)*(Math.random()<.5?-1:1),vy:-rnd(1.5,3.5),g:.18,life:rnd(260,480),age:0,c:['#fff4c0','#ffc050','#ff7a2a']})}
  if(a==='steam'&&Math.random()<dt/260)s.parts.push({x:x+(fx||.6)*h*.22+rnd(-4,4),y:y-h*.42,vx:0,vy:-.35,g:0,life:rnd(1200,1800),age:0,c:['#ffffff'],soft:1,ph:rnd(0,6)});
  if(a==='doze'&&!s.emo&&(t+s.cycle)%5200<dt+1)s.emo={txt:'Zz…',t0:t};
  if(a==='tell'&&!s.emo&&(t+s.cycle)%4200<dt+1)s.emo={txt:Math.random()<.5?'啪！':'话说……',t0:t};
  // 粒子
  g.save();
  for(const p of s.parts){p.age+=dt;const k=p.age/p.life;p.vy+=p.g*dt/16;p.x+=p.vx*dt/16+(p.soft?Math.sin(p.age/300+p.ph)*.3:0);p.y+=p.vy*dt/16;
    if(p.soft)ipx(p.x,p.y,'#ffffff',.35*(1-k));else ipx(p.x,p.y,p.c[Math.min(p.c.length-1,k*p.c.length|0)],1-k*.5)}
  s.parts=s.parts.filter(p=>p.age<p.life);
  // 表情气泡（主角靠近显示名字、或头顶有任务标记时不显示）
  if(s.emo){const e=t-s.emo.t0,D=1900;if(e>D||(near&&near.o===n)||(n.mark&&n.mark()))s.emo=null;else{
    const al=e<150?e/150:e>D-300?(D-e)/300:1,by=y-h-16-Math.min(e,200)/200*6;g.globalAlpha=al;g.font='15px "Noto Serif SC",serif';g.textAlign='center';
    const tw=g.measureText(s.emo.txt).width+14;g.fillStyle='rgba(250,244,228,.94)';g.strokeStyle='#3a2a1a';g.lineWidth=2;
    g.beginPath();g.roundRect?g.roundRect(x-tw/2,by-18,tw,22,6):g.rect(x-tw/2,by-18,tw,22);g.fill();g.stroke();
    g.beginPath();g.moveTo(x-4,by+4);g.lineTo(x+4,by+4);g.lineTo(x,by+10);g.closePath();g.fill();g.fillStyle='#2a1a0a';g.fillText(s.emo.txt,x,by-2)}}
  g.restore();g.globalAlpha=1}
