'use strict';
// ───────────────────────── 战斗像素特效 VFX + 战斗时钟 BT ─────────────────────────
// 规范见 docs/vfx.md。要点：
//  · 特效画在 1/3 分辨率离屏层（320×180，1 像素 = 游戏里 3×3，与角色像素同尺度），再最近邻放大叠加；辉光用 1/4 分辨率模糊层。
//  · 每个特效实例按「等级 tier」领取预算（时长/粒子/震屏/闪白/压暗/顿帧），所有接口都会按预算截断 —— 低等级技能在机制上无法比高等级更炫。
//  · 同一等级内按内力消耗线性分配预算（mp 越高越接近上限）；蓄势每点 +8%，但仍不超过该等级上限。
//  · 所有特效/动作时间走战斗时钟 BT：顿帧（BT.stop）期间 BT.now() 停止前进，画面整体冻结；wait() 的真实节奏不受影响。

// 战斗时钟：now() 为扣除顿帧后的毫秒；stop(ms) 从此刻起冻结 ms（重叠时取最远结束点）；frozen() 当前是否冻结
window.BT=(()=>{let fz=0,s0=0,s1=0;const pn=()=>performance.now();
  const settle=r=>{if(s1&&r>=s1){fz+=s1-s0;s0=s1=0}};
  return{now(){const r=pn();settle(r);return(s1?s0:r)-fz},
    stop(ms){const r=pn();settle(r);if(!(ms>0))return;if(s1)s1=Math.max(s1,r+ms);else{s0=r;s1=r+ms}},
    frozen(){settle(pn());return!!s1}}})();

const VFX_TIER=[
  {name:'T0 普攻',ms:380, parts:14, shake:3, flash:0,   dim:0,   stop:30, mp:[0,0]},
  {name:'T1 入门',ms:650, parts:28, shake:5, flash:.12, dim:0,   stop:50, mp:[1,7]},
  {name:'T2 进阶',ms:950, parts:56, shake:8, flash:.22, dim:.25, stop:70, mp:[8,12]},
  {name:'T3 绝学',ms:1400,parts:110,shake:12,flash:.4,  dim:.5,  stop:110,mp:[13,30]}];
const tierCap=(mp,boss)=>Math.min(3,(!mp?0:mp<=7?1:mp<=12?2:3)+(boss?1:0));
// 招式 → 特效：tier 等级；cls 伤害 dmg / 辅助 sup（单调性按类比较）；boss 头目招式（上限 +1 档）
const FXDEF={
  _atk:{tier:0,cls:'dmg'},fist:{tier:0,cls:'dmg',hit:'拳'},
  blade:{tier:0,cls:'dmg',hit:'刀'},bite:{tier:0,cls:'dmg',hit:'咬'},peck:{tier:0,cls:'dmg',hit:'啄'},palm_m:{tier:0,cls:'dmg',hit:'拳'},staff:{tier:0,cls:'dmg',hit:'棍'},
  coil:{tier:0,cls:'dmg',hit:'毒'},
  jinzhen:{tier:1,cls:'dmg'},sniff:{tier:1,cls:'dmg',hit:'咬'},fuhu:{tier:1,cls:'dmg'},shuaibei:{tier:1,cls:'dmg'},bianfa:{tier:1,cls:'dmg'},
  liuye:{tier:2,cls:'dmg'},lianhua:{tier:2,cls:'dmg'},guafeng:{tier:2,cls:'dmg'},
  dingshen:{tier:1,cls:'sup'},huichun:{tier:1,cls:'sup'},lick:{tier:1,cls:'sup'},jingxin:{tier:1,cls:'sup'},baicao:{tier:2,cls:'sup'},
  ghost:{tier:3,cls:'dmg',boss:1},
  _break:{tier:3,cls:'sys'}};

const VFX=(()=>{
  const LW=640,LH=360,Q=1.5;   // 与战斗精灵同像素尺度（显示每美术像素 1.5 画布像素，见 bstage.js BSC）
  const lc=document.createElement('canvas');lc.width=LW;lc.height=LH;const c=lc.getContext('2d');
  const gl0=document.createElement('canvas');gl0.width=LW;gl0.height=LH;const gl=gl0.getContext('2d');   // 纯光源层：只以块状半透明光 + 辉光出现，不遮挡角色
  const bc0=document.createElement('canvas');bc0.width=LW/8;bc0.height=LH/8;const bc=bc0.getContext('2d');
  let list=[],parts=[],clock=0,last=0,acc=0,dimA=0,flash={a:0,c:'#fff'};const overlays=[];
  // 调色板（白 → 亮 → 主色 → 暗 → 余烬）。v2 舞台偏暗：暗/余烬两阶整体提亮，避免粒子尾段直接"消失在黑里"
  const PAL={
    拳:['#ffffff','#fff0b0','#ffb448','#e8682c','#8a3424'],阳:['#ffffff','#ffe9a0','#ffa040','#e8582c','#8a3024'],
    刀:['#ffffff','#f4f0e4','#d8cfbb','#9a907e','#5a5044'],剑:['#ffffff','#d4f4ff','#7ad0ff','#4a7ae0','#2e3c80'],
    棍:['#ffffff','#f4dcaa','#d8a868','#906c48','#5a3a24'],暗器:['#ffffff','#fff4c0','#f0c860','#aa8a38','#5a4424'],
    阴:['#ffffff','#e4dcff','#b0a8ff','#7a60d0','#3e2c7a'],毒:['#ffffff','#e0ffc8','#98e868','#46a03a','#28542a'],
    雷:['#ffffff','#fffac8','#ffe25a','#d0b028','#6a5a1a'],医:['#ffffff','#d8ffe0','#8ff0b0','#48b07a','#245a44'],
    血:['#ffffff','#ffd0c0','#ff5a4a','#c0243a','#5a1420'],咬:['#ffffff','#f4f0e4','#e8d8c8','#9a7a70','#5a3a30'],
    冰:['#ffffff','#e0f6ff','#9fd4ff','#5a90d0','#2e4a80'],金:['#ffffff','#fff0b0','#ffcf5a','#f08a2a','#8a4414']};
  PAL.啄=PAL.刀;
  const pc=(p,k)=>p[Math.max(0,Math.min(p.length-1,Math.floor(k*p.length)))];
  const L=v=>v/Q;                                            // 游戏坐标 → 低分辨率坐标
  const Z=2;                                                 // 特效几何尺度（相对单位高 150 的角色）
  // 单位中心/脚底：含 bfx.js 写入的绘制偏移 ox/oy（冲刺、后跳时特效跟随身体）
  const ctr=u=>({x:L(u.x+(u.ox||0)),y:L(u.y+(u.oy||0)-unitH(u)*.5)});
  const foot=u=>({x:L(u.x+(u.ox||0)),y:L(u.y+(u.oy||0))});
  // ── 像素图元（低分辨率坐标；主体不透明绘制，淡出用 Bayer 抖动去像素；辉光另作一层叠加） ──
  const BY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
  function P(x,y,col,a=1){if(a<=0)return;x=Math.round(x);y=Math.round(y);if(a<1&&BY[(y&3)*4+(x&3)]>a)return;c.fillStyle=col;c.fillRect(x,y,1,1)}
  function Ln(x0,y0,x1,y1,col,a=1,w=1){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));
    const nx=-(y1-y0),ny=x1-x0,nl=Math.hypot(nx,ny)||1;for(let i=0;i<=n;i++){const t=i/n,x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;
      for(let j=0;j<w;j++){const o=j-(w-1)/2;P(x+nx/nl*o,y+ny/nl*o,col,a)}}}
  function ring(cx,cy,rx,ry,col,a=1,gap=0,rot=0,w=1){for(let j=0;j<w;j++){const r2=rx-j,ry2=ry-j*ry/Math.max(rx,1);if(r2<=0)break;const n=Math.max(8,Math.ceil(r2*7));const seen=new Set();
    for(let i=0;i<n;i++){const an=i/n*Math.PI*2;if(gap&&(Math.floor((an+rot)/gap)&1))continue;const x=Math.round(cx+Math.cos(an)*r2),y=Math.round(cy+Math.sin(an)*ry2),k=x*999+y;if(seen.has(k))continue;seen.add(k);P(x,y,col,a)}}}
  // 弯月刀光：圆心 (cx,cy) 半径 R，朝向 dir（弧度），张角 span，厚度 th；外缘白、中亮、内侧主色，sweep 为展开进度
  function crescent(cx,cy,R,dir,span,th,pal,a=1,sweep=1){const R2=Math.ceil(R+1);
    for(let y=-R2;y<=R2;y++)for(let x=-R2;x<=R2;x++){const r=Math.hypot(x,y);if(r>R+.6||r<R-th-.5)continue;
      let an=Math.atan2(y,x)-dir;an=Math.atan2(Math.sin(an),Math.cos(an));const f=an/span;if(Math.abs(f)>.5)continue;if(f>sweep-.5)continue;
      const w=th*(1-Math.abs(f)*2)+.5;if(r<R-w)continue;P(cx+x,cy+y,r>R-1.2?pal[0]:r>R-w*.55?pal[1]:pal[2],a)}}
  function bolt(x0,y0,x1,y1,seed,col,a=1,w=2){let s=seed;const rnd1=()=>(s=(s*9301+49297)%233280)/233280;let px=x0,py=y0;const n=9;
    for(let i=1;i<=n;i++){const t=i/n;const nx=x0+(x1-x0)*t+(i<n?(rnd1()-.5)*14:0),ny=y0+(y1-y0)*t;Ln(px,py,nx,ny,col,a,w);px=nx;py=ny}}
  // ── 实例与预算 ──
  function budget(key,mp,bp){const d=FXDEF[key]||FXDEF._atk,T=VFX_TIER[d.tier];const[lo,hi]=T.mp;
    const frac=hi>lo?Math.max(0,Math.min(1,((mp||0)-lo)/(hi-lo))):1;
    const s=Math.min(1,(.62+.3*frac)*(1+.08*(bp||0)));return{T,d,s,parts:Math.round(T.parts*s)}}
  function inst(key,mp,bp,dur,fn){const b=budget(key,mp,bp);const it={key,T:b.T,s:b.s,left:b.parts,t0:clock,dur:Math.min(dur||b.T.ms,b.T.ms),fn};list.push(it);return it}
  const shake=(it,v)=>{if(B)B.shake=Math.max(B.shake,Math.min(v,it.T.shake)*it.s)};
  const doFlash=(it,a,col='#fff')=>{a=Math.min(a,it.T.flash);if(a>flash.a){flash.a=a;flash.c=col}};
  const doDim=(it,a)=>{dimA=Math.max(dimA,Math.min(a,it.T.dim))};
  // 顿帧：走战斗时钟，冻结全部单位动作/位移/特效
  const hitStop=(it,ms)=>{BT.stop(Math.min(ms,it.T.stop))};
  function emit(it,n,f){n=Math.min(n,it.left);it.left-=n;for(let i=0;i<n;i++)parts.push(Object.assign({age:0,g:0,drag:.9,life:12},f(i,n)))}
  const R=(a,b)=>a+Math.random()*(b-a);
  function sparks(it,x,y,n,pal,sp=[1.5,4.5],up=0,dir=0,spread=Math.PI*2){emit(it,n,()=>{const a=dir+(Math.random()-.5)*spread,s=R(...sp)*1.4;return{k:'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-up,g:.16,life:R(10,20)|0,pal}})}
  function motes(it,x,y,n,pal,rad=8){emit(it,n,()=>({k:'mote',x:x+R(-rad,rad)*Z,y:y+R(-3,3),vx:R(-.1,.1),vy:-R(.4,1),drag:1,life:R(20,34)|0,pal}))}

  // ── 普攻 / 通用命中（按兵刃/内劲类型） ──
  function hitFx(it,t,ty,side){const p=ctr(t),pal=PAL[ty]||PAL.拳,dir=side;
    if(ty==='刀'||ty==='啄'){it.fn=k=>{crescent(p.x+dir*5*Z,p.y,11*Z,dir>0?Math.PI*.15:Math.PI*.85,Math.PI*1.1,3.5*Z,pal,1-k*.9,Math.min(1,k*3))};sparks(it,p.x,p.y,10,pal)}
    else if(ty==='剑'){const an=-.4*dir;it.fn=k=>{const g=Math.min(1,k*4),w=Math.max(0,1-k*1.3),L2=17*Z,dx=Math.cos(an)*L2,dy=Math.sin(an)*L2;
        Ln(p.x-dx,p.y-dy,p.x-dx+2*dx*g,p.y-dy+2*dy*g,pal[2],w,5);Ln(p.x-dx,p.y-dy,p.x-dx+2*dx*g,p.y-dy+2*dy*g,pal[1],w,3);Ln(p.x-dx,p.y-dy,p.x-dx+2*dx*g,p.y-dy+2*dy*g,pal[0],w,1);
        if(k<.4){const r=4*Z*(1-k/.4);Ln(p.x-r,p.y,p.x+r,p.y,pal[0],1,2);Ln(p.x,p.y-r,p.x,p.y+r,pal[0],1,2)}};sparks(it,p.x,p.y,8,pal)}
    else if(ty==='棍'){it.fn=k=>{ring(p.x,p.y+6,(4+k*13)*Z,(2+k*4)*Z,pal[1],1-k,0,0,2);ring(p.x,p.y+6,(2+k*8)*Z,(1+k*2.5)*Z,pal[0],(1-k)*.8,0,0,2)};
      emit(it,8,()=>({k:'dust',x:foot(t).x+R(-8,8),y:foot(t).y,vx:R(-1.4,1.4),vy:-R(.2,.6),life:R(12,22)|0,pal:['#e8dcc8','#b8a898','#887868']}));sparks(it,p.x,p.y,6,pal)}
    else if(ty==='暗器'){it.fn=k=>{for(let i=-1;i<=1;i++){const q=Math.max(0,1-k*2),x=p.x+i*4,y=p.y+i*6;if(q>0){Ln(x-5,y-5,x+5,y+5,pal[2],q,3);Ln(x-5,y-5,x+5,y+5,pal[0],q,1);Ln(x-3,y+3,x+3,y-3,pal[1],q,1)}}};sparks(it,p.x,p.y,6,pal,[1,3])}
    else if(ty==='咬'){it.fn=k=>{const g=Math.min(1,k*3),o=6*Z*(1-g);for(let i=-2;i<=2;i++){const x=p.x+i*3*Z;Ln(x,p.y-7*Z-o,x,p.y-3*Z-o,pal[0],1-k,2);Ln(x,p.y+7*Z+o,x,p.y+3*Z+o,pal[0],1-k,2)}};sparks(it,p.x,p.y,8,PAL.血)}
    else if(ty==='毒'){it.fn=k=>{ring(p.x,p.y,(3+k*9)*Z,(3+k*9)*Z,pal[2],1-k,.6,k*4,2);ring(p.x,p.y,(1+k*5)*Z,(1+k*5)*Z,pal[1],(1-k)*.8,0,0,2)};motes(it,p.x,p.y,8,pal,5)}
    else{// 拳：冲击环 + 放射线
      it.fn=k=>{const r=(2+k*10)*Z;ring(p.x,p.y,r,r,pal[2],1-k,0,0,3);ring(p.x,p.y,r-1,r-1,pal[0],1-k);if(k<.5)for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.3,r0=(3+k*9)*Z,r1=r0+5*Z*(1-k*2);Ln(p.x+Math.cos(a)*r0,p.y+Math.sin(a)*r0,p.x+Math.cos(a)*r1,p.y+Math.sin(a)*r1,pal[1],1-k*1.5,2)}};
      sparks(it,p.x,p.y,10,pal)}
    shake(it,it.T.shake);hitStop(it,it.T.stop)}

  // ── 招式特效：cast(it,u,tgs,bp) 返回前摇毫秒；hit(it,u,t) 每次命中 ──
  const SK={
    fuhu:{hit(it,u,t){const p=ctr(t),pal=PAL.阳,d=Math.sign(t.x-u.x)||-1;
      it.fn=k=>{const r=(3+k*14)*Z;ring(p.x,p.y,r,r*.9,pal[2],1-k,0,0,3);ring(p.x,p.y,r*.6,r*.55,pal[0],(1-k)*.8,0,0,2);
        if(k<.65)for(let i=-1;i<=1;i++){const g=Math.min(1,k*4);Ln(p.x-7*Z*d+i*5*Z,p.y-9*Z,p.x-7*Z*d+i*5*Z+12*Z*d*g,p.y-9*Z+16*Z*g,i===0?'#ffffff':pal[1],1-k*1.3,3)}};
      sparks(it,p.x,p.y,16,pal);shake(it,5);hitStop(it,50);doFlash(it,.08,'#ffd8a0')}},
    shuaibei:{hit(it,u,t){const p=ctr(t),f=foot(t),pal=PAL.阴;const cr=[...Array(6)].map(()=>R(0,Math.PI*2));
      it.fn=k=>{ring(f.x,f.y,(3+k*16)*Z,(1+k*4)*Z,pal[2],1-k,0,0,2);const g=Math.min(1,k*3);for(const a of cr)Ln(f.x,f.y,f.x+Math.cos(a)*13*Z*g,f.y+Math.sin(a)*3.5*Z*g,pal[1],1-k,2);
        if(k<.3){ring(p.x,p.y-8*Z+k*20*Z,7*Z,2.5*Z,pal[0],1-k/.3,0,0,2)}
        if(k>.35)for(let i=0;i<3;i++){const a=clock/120+i*2.1;const sx=p.x+Math.cos(a)*7*Z,sy=p.y-13*Z+Math.sin(a)*2*Z;Ln(sx-2,sy,sx+2,sy,'#fff6a0',1-k,1);Ln(sx,sy-2,sx,sy+2,'#fff6a0',1-k,1)}};
      sparks(it,f.x,f.y,12,pal,[1.5,4],1.6,-Math.PI/2,2.4);shake(it,5);hitStop(it,50)}},
    bianfa:{cast(it,u,tgs){const a=ctr(u),far=tgs.reduce((m,t)=>Math.abs(t.x-u.x)>Math.abs(m.x-u.x)?t:m,tgs[0]),b=ctr(far);
        it.fn=k=>{const g=Math.min(1,k*2.2);let px=a.x,py=a.y;for(let i=1;i<=30;i++){const t=i/30*g,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t+Math.sin(t*14-k*20)*6*(1-t*.5);Ln(px,py,x,y,i===30?'#ffffff':PAL.棍[1],1-Math.max(0,k-.6)*2.5,2);px=x;py=y}};return 240},
      hit(it,u,t){hitFx(it,t,'棍',Math.sign(t.x-u.x))}},
    jinzhen:{cast(it,u,tgs){const a=ctr(u),b=ctr(tgs[0]);it.fn=k=>{const g=Math.min(1,k*3.2);if(g<1)for(let i=-1;i<=1;i++){const x=a.x+(b.x-a.x)*g,y=a.y+(b.y-a.y)*g+i*7;Ln(x,y,x+(a.x-b.x)*.14,y,PAL.暗器[2],.8,1);Ln(x,y,x+(a.x-b.x)*.07,y,'#ffffff',1,1);P(x,y-2,'#ffffff');P(x,y+2,'#ffffff');P(x-2,y,'#fff4c0')}};return 200},
      hit(it,u,t){const p=ctr(t);it.fn=k=>{const r=7*Z*(1-k);Ln(p.x-r,p.y,p.x+r,p.y,'#fff4c0',1-k,2);Ln(p.x,p.y-r,p.x,p.y+r,'#fff4c0',1-k,2);ring(p.x,p.y,(2+k*7)*Z,(2+k*7)*Z,PAL.暗器[2],1-k,0,0,2)};sparks(it,p.x,p.y,10,PAL.暗器,[1,3]);shake(it,3)}},
    sniff:{hit(it,u,t){hitFx(it,t,'咬',Math.sign(t.x-u.x))}},
    liuye:{cast(it,u,tgs){const a=ctr(u),xs=tgs.map(t=>ctr(t));doDim(it,.25);const minX=Math.min(...xs.map(p=>p.x))-16;
        const lv=[...Array(11)].map((_,i)=>({y:a.y-14*Z+i*2.6*Z+R(-2,2),d:R(0,.25),ph:R(0,6)}));
        it.fn=k=>{for(const l of lv){const g=Math.max(0,Math.min(1,(k-l.d)*2.2));if(g<=0||g>=1)continue;const x=a.x+(minX-a.x)*g,y=l.y+Math.sin(g*9+l.ph)*5;
          Ln(x,y,x+8,y-3,'#62b884',1,3);Ln(x,y,x+8,y-3,'#c8f8d0',1,1);P(x,y,'#ffffff');Ln(x+9,y-3,x+16,y-5,'#9ae0a0',.5,1)}};return 330},
      hit(it,u,t){const p=ctr(t);it.fn=k=>{const g=Math.min(1,k*4),w=1-k;const x0=p.x+16*Z,y0=p.y-11*Z,dx=-32*Z*g,dy=22*Z*g;Ln(x0,y0,x0+dx,y0+dy,'#62b884',w,6);Ln(x0,y0,x0+dx,y0+dy,'#7ad0ff',w,4);Ln(x0,y0,x0+dx,y0+dy,'#ffffff',w,2)};
        emit(it,8,()=>({k:'leaf',x:p.x,y:p.y,vx:R(-2.4,2.4),vy:R(-2.6,.4),g:.06,life:R(16,26)|0,pal:['#e0ffe0','#9ae0a0','#62b884']}));sparks(it,p.x,p.y,8,PAL.剑);shake(it,6);hitStop(it,60)}},
    lianhua:{hit(it,u,t){const p=ctr(t),pal=PAL.毒;doDim(it,.18);
      it.fn=k=>{const g=Math.min(1,k*2.5),q=1-Math.max(0,k-.5)*2;for(let i=0;i<8;i++){const a=i/8*Math.PI*2+k*.8,r=(3+g*10)*Z,ca=Math.cos(a),sa=Math.sin(a);
          for(let j=0;j<7;j++){const rr=r-j*1.6,wv=j<2||j>5?1:2;for(let o=-wv;o<=wv;o++)P(p.x+ca*rr-sa*o,p.y+(sa*rr+ca*o)*.8,j===0?'#ffe8f6':j<3?'#ff9ad0':j<5?'#e060a8':pal[2],q)}}
        ring(p.x,p.y,3*Z,3*Z,'#ffe25a',q,0,0,2);P(p.x,p.y,'#fff',q)};
      emit(it,18,()=>({k:'bubble',x:p.x+R(-10,10)*Z,y:p.y+R(-2,8),vx:R(-.2,.2),vy:-R(.4,1),drag:1,life:R(20,32)|0,pal}));shake(it,6);hitStop(it,60)}},
    guafeng:{cast(it,u,tgs){const a=ctr(u);doDim(it,.3);it.fn=k=>{for(let i=0;i<3;i++){const g=Math.min(1,Math.max(0,k*2-i*.2));if(g<=0||g>=1)continue;crescent(a.x-g*130,a.y-6*Z+i*6*Z,11*Z,Math.PI,Math.PI*1.2,2.5*Z,PAL.雷,1-g*.8)}};return 300},
      hit(it,u,t){const p=ctr(t),seed=Math.random()*1e5|0;it.fn=k=>{if(k<.55&&((clock/50|0)&1)===0){bolt(p.x+R(-3,3),-2,p.x,p.y,seed,PAL.雷[2],1,4);bolt(p.x,-2,p.x,p.y,seed,'#ffffff',1,2)}ring(p.x,p.y,(2+k*11)*Z,(2+k*10)*Z,PAL.雷[2],1-k,0,0,2)};
        sparks(it,p.x,p.y,14,PAL.雷,[2,5]);doFlash(it,.2,'#fff8c0');shake(it,8);hitStop(it,70)}},
    ghost:{cast(it,u,tgs){const a=ctr(u);doDim(it,.5);it.fn=k=>{const r=(6+k*14)*Z;ring(a.x,a.y,r,r,PAL.血[2],1-k,0,0,3);ring(a.x,a.y,r*.5,r*.5,PAL.血[1],.8,0,0,2)};
        emit(it,24,()=>({k:'mote',x:a.x+R(-16,16)*Z,y:a.y+R(-12,12)*Z,vx:0,vy:-R(.4,1),drag:1,life:R(12,22)|0,pal:PAL.血}));return 380},
      hit(it,u,t){const p=ctr(t);it.fn=k=>{crescent(p.x+12*Z,p.y,24*Z,0,Math.PI*1.3,6*Z,PAL.血,1-k*.9,Math.min(1,k*3))};
        sparks(it,p.x,p.y,28,PAL.血,[2.5,6]);doFlash(it,.35,'#ffd0c0');shake(it,12);hitStop(it,110)}},
    // 辅助
    jingxin:{cast(it,u){const f=foot(u),p=ctr(u),pal=PAL.剑;it.fn=k=>{const q=k<.8?1:(1-k)*5;ring(f.x,f.y,11*Z,3*Z,pal[2],q,0,0,2);ring(f.x,f.y,8*Z,2.2*Z,pal[1],q,.5,k*8,2);
        for(let y=f.y;y>p.y-14*Z;y-=1)if(Math.random()<.3)P(f.x+R(-5,5)*Z,y,pal[1],.5*q)};motes(it,f.x,f.y-2,24,pal,9);return 300}},
    huichun:{cast(it,u,tgs){for(const t of tgs){const f=foot(t);emit(it,16,i=>({k:'leaf',x:f.x+Math.cos(i)*9*Z,y:f.y-2,vx:-Math.sin(i)*.8,vy:-R(.6,1.3),drag:1,life:R(22,32)|0,pal:PAL.医}))}
        it.fn=k=>{for(const t of tgs){const p=ctr(t);if(k<.75)for(let i=0;i<2;i++){const x=p.x+Math.sin(k*9+i*3)*9*Z,y=p.y+12*Z-k*30*Z+i*7*Z;Ln(x-3,y,x+3,y,'#d8ffe0',1,2);Ln(x,y-3,x,y+3,'#d8ffe0',1,2)}}};return 260}},
    lick:{cast(it,u,tgs){return SK.huichun.cast(it,u,tgs)}},
    baicao:{cast(it,u,tgs){doDim(it,.18);for(const t of tgs){const p=ctr(t);emit(it,14,()=>({k:'drop',x:p.x+R(-12,12)*Z,y:p.y-R(25,50)*Z,vx:0,vy:R(2,3),g:.1,drag:1,life:R(16,24)|0,pal:PAL.医}))}
        it.fn=k=>{for(const t of tgs){const f=foot(t);ring(f.x,f.y,(4+k*11)*Z,(1.5+k*3)*Z,PAL.医[2],1-k,0,0,2)}};return 380}},
    dingshen:{cast(it,u,tgs){const t=tgs[0],f=foot(t),top=ctr(t).y-16*Z;it.fn=k=>{const y=f.y+(top-f.y)*Math.min(1,k*1.4);ring(f.x,y,10*Z,2.8*Z,'#ffe7a0',1-Math.max(0,k-.7)*3,0,0,2);ring(f.x,y,7*Z,1.8*Z,'#ffffff',(1-k)*.8,0,0,1)};motes(it,f.x,f.y-4,14,['#ffffff','#fff0b0','#ffd060','#a07020'],8);return 300}},
  };
  // 辅助招式施法者脚下法阵（T1 起允许的元素）：尺寸随 tier 与预算系数 s，时长受档位上限截断
  const SIGIL_PAL={dingshen:'金',huichun:'医',lick:'医',baicao:'医'};
  function sigil(key,u,bp){const d=FXDEF[key];if(!d||d.cls!=='sup'||d.tier<1||key==='jingxin')return;const it=inst(key,mpOf(key),bp);
    const pal=PAL[SIGIL_PAL[key]||'医'],f=foot(u),rx=(8+d.tier*2.5)*Z*it.s;
    it.fn=k=>{const g=Math.min(1,k*4),q=k<.75?1:(1-k)*4,rx2=rx*g;ring(f.x,f.y,rx2,rx2*.3,pal[2],q,0,0,2);ring(f.x,f.y,rx2*.72,rx2*.22,pal[1],q*.9,.45,-k*7,1);
      for(let i=0;i<6;i++){const a=i/6*Math.PI*2+k*3;P(f.x+Math.cos(a)*rx2*.86,f.y+Math.sin(a)*rx2*.26,pal[0],q);P(f.x+Math.cos(a)*rx2*.86,f.y+Math.sin(a)*rx2*.26-1,pal[1],q*.7)}}}

  // ── 对外接口（battle.js / bfx.js 调用） ──
  const mpOf=k=>(SKILLS[k]&&SKILLS[k].mp)||0;
  function hit(u,t,ty,key,bp){const d=key&&SK[key]&&SK[key].hit?key:null;
    if(d){const it=inst(key,mpOf(key),bp);SK[key].hit(it,u,t)}
    else{const k0=key&&FXDEF[key]?key:'_atk',hk=FXDEF[k0].hit||ty||'拳';const it=inst(k0,mpOf(k0),bp);hitFx(it,t,hk,Math.sign(t.x-u.x)||1);
      if(hk==='暗器'&&u!==t)needleStreak(u,t,bp)}}
  // 针光：三枚银针的飞行光迹（小尺寸人物下细针看不清，用亮线 + 拖尾 + 针头星芒表现）
  function needleStreak(u,t,bp){const it=inst('_atk',0,bp,180),a=ctr(u),b=ctr(t);a.y-=4;
    it.fn=k=>{for(let i=-1;i<=1;i++){const g=Math.min(1,k*2.2+.15),x=a.x+(b.x-a.x)*g,y=a.y+(b.y-a.y)*g+i*7,tl=.16*(1-k),tx=x+(a.x-b.x)*tl,ty=y+(a.y-b.y)*tl;
      Ln(tx,ty,x,y,PAL.暗器[2],(1-k*.6)*.7,1);Ln(tx+(x-tx)*.5,ty+(y-ty)*.5,x,y,'#ffffff',1-k*.4,1);if(k<.7){P(x,y-1,'#ffffff');P(x,y+1,'#ffffff');P(x+1,y,'#fff4c0')}}}}
  async function cast(u,key,tgs,bp){sigil(key,u,bp);if(!SK[key]||!SK[key].cast)return;const it=inst(key,mpOf(key),bp);const lead=SK[key].cast(it,u,tgs,bp)||0;if(lead)await btWait(lead)}
  function brk(t){const it=inst('_break',0,0);const p=ctr(t);it.fn=k=>{const r=(4+k*26)*Z;ring(p.x,p.y,r,r*.8,PAL.冰[3],1-k,0,0,3);ring(p.x,p.y,r*.7,r*.56,'#ffffff',(1-k)*.9,.35,k*3,2)};
    emit(it,40,()=>{const a=R(0,Math.PI*2),s=R(1.5,6);return{k:'shard',x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,g:.1,life:R(16,28)|0,pal:PAL.冰}});doFlash(it,.12,'#e0f4ff');hitStop(it,100)}
  function act(u,k){u.anim={k,t0:BT.now()}}
  // 按战斗时钟等待（顿帧期间顺延）
  async function btWait(ms){const end=BT.now()+ms;for(;;){const r=end-BT.now();if(r<=0)return;await wait(Math.max(4,Math.min(r,60)))}}

  // ── 主角旧版战斗动作表（assets/s_hero_battle.webp）。bfx.js 在 BART.hero 未就绪时以同样数据走通用 drawUnit ──
  const HB={cell:[147,141],idle:[0,1,2,1,0,3],atk:[[0,4],[70,5],[140,6],[300,7],[380,8],[460,-1]],atk2:[[0,5],[50,6],[150,7],[220,-1]],hurt:[[0,9],[300,-1]],cast:[[0,10],[420,-1]]};
  function heroFrame(u,now){const a=u.anim;if(a&&HB[a.k]){const e=now-a.t0;let f=-1;for(const[t,fr]of HB[a.k])if(e>=t)f=fr;if(f>=0)return f;u.anim=null}
    return HB.idle[Math.floor(now/170)%HB.idle.length]}
  function drawHero(u,x,y,h,alpha,flash,now){const im=IMG.s_hero_battle;if(!ok(im))return false;now=BT.now();
    const f=heroFrame(u,now),[cw,ch]=HB.cell,w=h*cw/ch;
    g.save();g.globalAlpha=alpha;g.fillStyle='rgba(0,0,0,.38)';g.beginPath();g.ellipse(x,y-2,h*.2,h*.045,0,0,7);g.fill();
    if(flash)g.filter='brightness(2.2)';g.imageSmoothingEnabled=false;g.drawImage(im,f*cw,0,cw,ch,x-w/2,y-h,w,h);g.restore();g.imageSmoothingEnabled=true;return true}

  // ── 覆盖层：其他模块（bfx.js 的蓄势光柱/蓄力/回盾等）把像素画进同一低分辨率层，共享辉光 ──
  function PG(x,y,w,h,col,a){if(a<=0)return;gl.globalAlpha=Math.min(1,a);gl.fillStyle=col;gl.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
  const API={P,Ln,ring,crescent,PG,L,Q,Z,PAL,pc,get clock(){return clock}};
  function overlay(fn){overlays.push(fn)}

  // ── 每帧绘制（在单位之后、UI 之前）。时间取 BT，顿帧期间 clock 不走、粒子不步进 ──
  const STEP=1000/60;
  function draw(){const now=BT.now();const dt=last?Math.max(0,Math.min(50,now-last)):16;last=now;clock+=dt;
    acc+=dt;let steps=Math.floor(acc/STEP);acc-=steps*STEP;if(steps>3){steps=3;acc=0}
    const stopped=dt===0;
    if(dimA>0){g.fillStyle=`rgba(6,3,12,${dimA})`;g.fillRect(-W,-H,W*3,H*3)}
    c.clearRect(0,0,LW,LH);c.globalCompositeOperation='source-over';gl.globalAlpha=1;gl.clearRect(0,0,LW,LH);
    for(const it of list){const k=(clock-it.t0)/it.dur;if(k>=0&&k<1&&it.fn)it.fn(k)}
    list=list.filter(it=>clock-it.t0<it.dur);
    for(const f of overlays){try{f(API,now)}catch(e){console.error(e)}}
    for(const p of parts){for(let s=0;s<steps;s++){p.age++;p.vy+=p.g;p.vx*=p.drag;p.vy*=p.drag===1?1:p.drag;p.x+=p.vx;p.y+=p.vy;if(p.k==='mote'||p.k==='bubble')p.x+=Math.sin(p.age*.3)*.15}
      const k=p.age/p.life,col=pc(p.pal,k);
      if(p.k==='spark'){Ln(p.x,p.y,p.x-p.vx*1.4,p.y-p.vy*1.4,col,1-k*.5,k<.4?2:1)}
      else if(p.k==='bubble'){if(k<.85){P(p.x,p.y-1,col);P(p.x-1,p.y,col);P(p.x+1,p.y,col);P(p.x,p.y+1,col);P(p.x,p.y,'#ffffff')}else ring(p.x,p.y,3,3,p.pal[1],.8)}
      else if(p.k==='leaf'){const f=(p.age>>2)&1;Ln(p.x-2,p.y+f,p.x+2,p.y-f,col,1,2)}
      else if(p.k==='drop'){P(p.x,p.y,'#ffffff');P(p.x,p.y-1,col);P(p.x,p.y-2,col,.5);P(p.x-1,p.y,col,.7);P(p.x+1,p.y,col,.7)}
      else if(p.k==='dust'){for(let i=0;i<4;i++)P(p.x+(i&1),p.y-(i>>1),col,1-k)}
      else if(p.k==='shard'){P(p.x,p.y,col);P(p.x+1,p.y,col);P(p.x,p.y+1,col,.7);P(p.x-1,p.y-1,col,.5)}
      else{if((p.age>>1)%3!==2||k<.5){P(p.x,p.y,col);P(p.x+1,p.y,col,.6);P(p.x,p.y+1,col,.6)}}}
    parts=parts.filter(p=>p.age<p.life);
    c.globalAlpha=1;c.globalCompositeOperation='source-over';
    // 合成：像素层 + 低分辨率辉光（暗舞台上辉光更显眼，强度略收）
    g.save();g.imageSmoothingEnabled=false;g.globalCompositeOperation='lighter';
    bc.clearRect(0,0,bc0.width,bc0.height);bc.filter='blur(2px) brightness(1.25)';bc.drawImage(lc,0,0,bc0.width,bc0.height);bc.globalCompositeOperation='lighter';bc.drawImage(gl0,0,0,bc0.width,bc0.height);bc.globalCompositeOperation='source-over';bc.filter='none';
    g.globalAlpha=.78;g.drawImage(bc0,0,0,W,H);g.globalAlpha=.75;g.drawImage(gl0,0,0,W,H);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(lc,0,0,W,H);g.restore();g.imageSmoothingEnabled=true;
    if(flash.a>.005){g.fillStyle=flash.c;g.globalAlpha=flash.a;g.fillRect(-W,-H,W*3,H*3);g.globalAlpha=1;if(!stopped)flash.a*=Math.pow(.8,Math.max(1,steps))}
    if(!stopped){dimA=list.length?dimA:dimA*Math.pow(.85,Math.max(1,steps));if(dimA<.01)dimA=0}
    return stopped}
  function reset(){list=[];parts=[];dimA=0;flash.a=0;last=0;acc=0}

  // ── 等级自检：tier 不得超过内力档位上限；同类招式内力越高 tier 不得越低 ──
  function audit(){const bad=[];const rows=Object.entries(FXDEF).filter(([k])=>!k.startsWith('_')&&SKILLS[k]);
    for(const[k,d]of rows){const cap=tierCap(mpOf(k),d.boss);if(d.tier>cap)bad.push(`${k} tier ${d.tier} > 上限 ${cap}（mp ${mpOf(k)}）`)}
    for(const cls of['dmg','sup']){const r=rows.filter(([,d])=>d.cls===cls&&!d.boss).sort((a,b)=>mpOf(a[0])-mpOf(b[0]));
      for(let i=1;i<r.length;i++)if(r[i][1].tier<r[i-1][1].tier&&mpOf(r[i][0])>mpOf(r[i-1][0]))bad.push(`${r[i][0]}(mp ${mpOf(r[i][0])}) tier ${r[i][1].tier} < ${r[i-1][0]}(mp ${mpOf(r[i-1][0])}) tier ${r[i-1][1].tier}`)}
    for(const k of Object.keys(BSK))if(SKILLS[k]&&!FXDEF[k])bad.push(`${k} 缺少 FXDEF`);
    if(bad.length)console.warn('[VFX 等级自检]',bad);return bad}
  return{hit,cast,brk,act,draw,drawHero,reset,audit,overlay,btWait,PAL,budget,HB,API}})();
setTimeout(()=>{try{VFX.audit()}catch(e){}},0);
