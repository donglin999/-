'use strict';
// ───────────────────────── 战斗演出（工作流 C · 见 docs/battle-v2.md / docs/vfx.md） ─────────────────────────
// 覆盖 battle.js：drawUnit lunge boostFx doAttack doSkill foeAct hurt heal doBreak drawParts drawBreakFlash
// 规则与数值（伤害、命中/闪避、眩晕、流血、看破、蓄势、破势）逐行照搬原函数，只改表现与时序。
//  · 动作：读 window.BART[u.art]（D 产出），按状态播 idle/dash/atk/atk2/hurt/cast/brk/dead/win，缺动作按契约回退；
//    角色缺条目 → 原静态帧 + 呼吸 + 程序化姿态；主角在 BART 就绪前用 s_hero_battle 旧动作表（同一通用路径）。
//  · 时间：一切位移/动作/特效走战斗时钟 BT（vfx.js），顿帧 BT.stop() 时画面整体冻结。
//  · 编排：冲刺（dash 帧 + 残影）→ 出招帧与命中对齐 → 后跳回位；辅助为前踏半步 + 运功 + 脚下法阵；镜头推近/复位。
const BFXI=(()=>{
  const now=()=>BT.now();
  const bw=ms=>VFX.btWait(ms);
  const cam=(m,...a)=>{try{if(typeof CAM!=='undefined'&&CAM&&typeof CAM[m]==='function')CAM[m](...a)}catch(e){console.error(e)}};
  const R=(a,b)=>a+Math.random()*(b-a);
  const face=u=>u.side==='foe'?1:-1;                    // 朝向敌方的屏幕方向（敌人在左、我方在右）
  const cl01=v=>v<0?0:v>1?1:v;
  const PX=3;                                           // 屏幕像素块（与特效层 1:3 同尺度）
  const STEP=1000/60;

  // ── 动作数据 ──
  // 主角旧动作表（BART.hero 未就绪时）：帧 0-3 待机 4-8 出招 9 受击 10 运功
  const HERO_LEGACY={file:'s_hero_battle',cell:[147,141],cols:11,facing:'l',legacy:1,anim:{
    idle:{f:[0,1,2,1,0,3],ms:170,loop:true},dash:{f:[5],ms:200},
    atk:{f:[4,5,6,7,8],ms:[70,70,160,80,80],hit:2},atk2:{f:[5,6,7],ms:[50,100,70],hit:1},
    hurt:{f:[9],ms:300},cast:{f:[10],ms:420}}};
  const FALL={dash:['idle'],atk2:['atk','idle'],brk:['hurt','idle'],dead:['hurt','idle'],win:['idle'],hurt:['idle'],cast:['idle'],atk:['idle']};
  const STATIC_DUR={atk:380,atk2:220,hurt:300,cast:420,win:700,dash:200};
  const hasA=(A,k)=>!!(A&&A.anim&&A.anim[k]&&A.anim[k].f&&A.anim[k].f.length);
  function sheetOk(A){const im=IMG[A.file];if(ok(im))return true;if(!A._ld&&typeof loadOpt==='function'){A._ld=1;loadOpt(A.file,A.file)}return false}
  function artOf(u){const A=window.BART&&BART[u.art];if(A&&A.file&&A.cell&&A.anim&&sheetOk(A))return A;
    if(u.isHero&&ok(IMG.s_hero_battle))return HERO_LEGACY;return null}
  function spec(A,k){if(hasA(A,k))return A.anim[k];for(const f of FALL[k]||[])if(hasA(A,f))return A.anim[f];return hasA(A,'idle')?A.anim.idle:{f:[0],ms:200,loop:true}}
  const msArr=s=>Array.isArray(s.ms)?s.ms:s.f.map(()=>s.ms||120);
  const durOf=s=>msArr(s).reduce((a,b)=>a+b,0);
  function fidx(s,e,loop){const m=msArr(s),T=durOf(s)||1;if(loop)e=((e%T)+T)%T;else if(e>=T)return s.f[s.f.length-1];let a=0;for(let i=0;i<m.length;i++){a+=m[i];if(e<a)return s.f[i]}return s.f[s.f.length-1]}
  // 出招 → 命中的毫秒数（出招帧与命中对齐）：spec.hit 指定命中帧序号，缺省取中间帧
  function impactMs(u,k){const A=artOf(u);if(!A)return k==='atk2'?50:90;const s=spec(A,k),m=msArr(s);const hi=s.hit!=null?s.hit:Math.min(s.f.length-1,Math.floor(s.f.length*.5));let t=0;for(let i=0;i<hi;i++)t+=m[i];return Math.max(40,t)}
  function act(u,k,hold){u.anim={k,t0:now(),hold:!!hold}}
  function stateOf(u,t){if(u.hp<=0)return{k:'dead',t0:u._dT??t,hold:1};
    const a=u.anim;if(a){if(a.hold)return a;const A=artOf(u),d=A?durOf(spec(A,a.k)):(STATIC_DUR[a.k]||300);if(t-a.t0<d)return a;u.anim=null}
    if(u.broken)return{k:'brk',t0:u._bT||0,loop:1};
    if(u.charging)return{k:'cast',t0:u._cT||0,hold:1};
    return{k:'idle',t0:-((u.id*7919)%1)*4000,loop:1}}
  function frameOf(u,t,h){const st=stateOf(u,t),want=u.side==='foe'?'r':'l',A=artOf(u);
    if(A){const im=IMG[A.file],s=spec(A,st.k),[cw,ch]=A.cell,cols=A.cols||Math.max(1,Math.floor(im.naturalWidth/cw)),fi=fidx(s,t-st.t0,!!(st.loop||s.loop)&&!st.hold);
      const body=battleBodyBounds(A),dh=h*ch/body.height;
      return{im,sx:(fi%cols)*cw,sy:Math.floor(fi/cols)*ch,sw:cw,sh:ch,dh,dw:dh*cw/ch,foot:(ch-body.bottom)*dh/ch,flip:(A.facing||want)!==want,sheet:1,st,has:k=>hasA(A,k),legacy:!!A.legacy}}
    const key=unitImg(u,want);if(!key)return{st,none:1,dh:h,dw:h*.4};const im=IMG[key],other=want==='l'?'r':'l',iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
    const bounds=typeof charBounds==='function'?charBounds(im):null;
    const dh=bounds?h*ih/bounds.height:h;
    return{im,sx:0,sy:0,sw:iw,sh:ih,dh,dw:dh*iw/ih,foot:bounds?(ih-bounds.bottom)*dh/ih:0,flip:key.startsWith(`c_${u.art}_${other}`),sheet:0,st,has:()=>false}}

  // ── 精灵绘制：着色（闪白/灰化/压暗）在复用的小离屏画布上按源分辨率完成，不逐帧新建画布 ──
  const SC=document.createElement('canvas');SC.width=SC.height=192;const sc=SC.getContext('2d');
  const RC=document.createElement('canvas');const rc=RC.getContext('2d',{willReadFrequently:true});   // 仅死亡碎散取像素用
  function ensure(w,h){if(SC.width<w||SC.height<h){SC.width=Math.max(SC.width,w);SC.height=Math.max(SC.height,h)}}
  function prep(fr,o){if(!(o.white||o.grey||o.dark))return[fr.im,fr.sx,fr.sy,fr.sw,fr.sh];
    const w=fr.sw,h=fr.sh;ensure(w,h);sc.globalCompositeOperation='source-over';sc.globalAlpha=1;sc.clearRect(0,0,w,h);sc.imageSmoothingEnabled=false;sc.drawImage(fr.im,fr.sx,fr.sy,w,h,0,0,w,h);
    if(o.grey){sc.globalCompositeOperation='saturation';sc.globalAlpha=o.grey;sc.fillStyle='#808080';sc.fillRect(0,0,w,h);sc.globalCompositeOperation='destination-in';sc.globalAlpha=1;sc.drawImage(fr.im,fr.sx,fr.sy,w,h,0,0,w,h)}
    if(o.dark){sc.globalCompositeOperation='source-atop';sc.globalAlpha=o.dark;sc.fillStyle=o.dc||'#000';sc.fillRect(0,0,w,h)}
    if(o.white){sc.globalCompositeOperation='source-atop';sc.globalAlpha=Math.min(1,o.white);sc.fillStyle=o.wc||'#fff';sc.fillRect(0,0,w,h)}
    sc.globalCompositeOperation='source-over';sc.globalAlpha=1;return[SC,0,0,w,h]}
  function blit(fr,x,y,o={}){if(fr.none)return;const[src,sx,sy,sw,sh]=prep(fr,o);g.save();g.globalAlpha=o.alpha??1;if(o.comp)g.globalCompositeOperation=o.comp;g.imageSmoothingEnabled=false;
    g.translate(Math.round(x),Math.round(y+(fr.foot||0)));if(o.rot)g.rotate(o.rot);g.scale((fr.flip?-1:1)*(o.sx||1),o.sy||1);const dw=Math.round(fr.dw),dh=Math.round(fr.dh);
    if(fr.tone&&fr.tone!=='none')g.filter=fr.tone;
    g.drawImage(src,sx,sy,sw,sh,-Math.round(dw/2),-dh,dw,dh);g.restore()}

  // ── 像素图元（直接画在世界层 g 上，3px 网格） ──
  const sn=v=>Math.round(v/PX)*PX;
  function pxEllipse(cx,cy,rx,ry,col,a=1,gap=0,rot=0){if(a<=0)return;g.save();g.globalAlpha=Math.min(1,a);g.fillStyle=col;const n=Math.max(12,Math.ceil((rx+ry)*Math.PI/PX*1.4)),seen=new Set();
    for(let i=0;i<n;i++){const an=i/n*Math.PI*2;if(gap&&(Math.floor((an+rot)/gap)&1))continue;const x=Math.round((cx+Math.cos(an)*rx)/PX),y=Math.round((cy+Math.sin(an)*ry)/PX),k=x*9999+y;if(seen.has(k))continue;seen.add(k);g.fillRect(x*PX,y*PX,PX,PX)}g.restore()}
  function shadow(x,y,h,lift,a=1){const rx=Math.max(15,h*.19)*(1-Math.min(.45,lift/110)),ry=Math.max(4,h*.042);g.save();g.globalAlpha=.34*a*(1-Math.min(.5,lift/140));g.fillStyle='#000';
    for(let yy=-ry;yy<=ry;yy+=PX){const w=rx*Math.sqrt(Math.max(0,1-(yy/ry)**2));const x0=sn(x-w),x1=sn(x+w);if(x1>x0)g.fillRect(x0,sn(y-2+yy),x1-x0,PX)}g.restore()}

  // ── 位移（相对站位的偏移，全部走 BT） ──
  const EASE={out:k=>1-(1-k)**3,io:k=>k<.5?2*k*k:1-(-2*k+2)**2/2,lin:k=>k,in:k=>k*k};
  function mvPos(u,t){const m=u.mv;if(!m)return{x:0,y:0};const e=EASE[m.ease||'out'](cl01((t-m.t0)/m.dur));return{x:m.x0+(m.x1-m.x0)*e,y:m.y0+(m.y1-m.y0)*e}}
  function moveTo(u,x1,y1,dur,arc=0,ease='out'){const t=now(),p=mvPos(u,t);u.mv={x0:p.x,y0:p.y,x1,y1,t0:t,dur,arc,ease};return bw(dur)}
  function offOf(u,t){let x=0,y=0,lift=0;const m=u.mv;
    if(m){const k=cl01((t-m.t0)/m.dur),e=EASE[m.ease||'out'](k);x=m.x0+(m.x1-m.x0)*e;y=m.y0+(m.y1-m.y0)*e;lift=m.arc*4*k*(1-k);if(k>=1&&!m.x1&&!m.y1)u.mv=null}
    if(u.kbT!=null){const k=(t-u.kbT)/260;if(k<1&&k>=0)x+=(u.side==='foe'?-1:1)*12*Math.sin(k*Math.PI);else if(k>=1)u.kbT=null}
    if(u.dgT!=null){const k=(t-u.dgT)/340;if(k<1&&k>=0){const s=Math.sin(k*Math.PI);x+=(u.side==='foe'?-1:1)*34*s;lift+=12*s}else if(k>=1)u.dgT=null}
    return{x,gy:y,lift}}
  // 冲刺到目标前方：dash 帧 + 残影；返回时 u 停在目标跟前（y 略靠前，保证画在目标之前）
  async function dashTo(u,t){if(!t||t===u)return;const dir=Math.sign(t.x-u.x)||face(u),hu=unitH(u),ht=unitH(t);
    const gap=ht*.2+hu*.16+14;let tx=t.x-dir*gap-u.x;if(tx*dir<0)tx=0;const ty=(t.y+4)-u.y;
    act(u,'dash',true);u.dashing=true;u._tr=[];bsfx('whoosh',.45,1.35);
    await moveTo(u,tx,ty,Math.round(170+Math.min(110,Math.abs(tx)*.18)),0,'out');u.dashing=false}
  // 后跳回位（小抛物线）
  function hopBack(u){u.anim=null;u.dashing=false;return moveTo(u,0,0,300,30,'io')}
  function stepFwd(u,px=28){return moveTo(u,face(u)*px,0,170,0,'out')}
  function stepBack(u){return moveTo(u,0,0,220,0,'io')}
  function camOn(us,z=1.08,ms=260){const v=us.filter(Boolean);if(!v.length)return;
    const x=v.reduce((s,u)=>s+u.x,0)/v.length,y=v.reduce((s,u)=>s+u.y-unitH(u)*.45,0)/v.length;cam('focus',x,y,z,ms)}
  const camReset=(ms=380)=>cam('reset',ms);
  // 原 lunge 语义（自包含：过去再回来）；k<1 为前踏半步（道具等）
  async function lunge(u,t,k=1){const tok=u._mvTok=(u._mvTok||0)+1;
    if(k<1){act(u,'cast');stepFwd(u,Math.min(34,110*k));await bw(230);(async()=>{await bw(240);if(u._mvTok===tok){u.anim=null;stepBack(u)}})();return}
    await dashTo(u,t);(async()=>{await bw(200);if(u._mvTok===tok)hopBack(u)})()}

  // ── 单位绘制 ──
  let lastT=null,lastCur=null;
  function drawUnit(u,t0){if(!B)return;if(t0!==undefined&&t0===lastT)return;lastT=t0;drawAll()}
  // 同一帧只画一次：按「站位 y + 位移 y」排序全部单位（冲刺到目标跟前的出手者画在目标之前）
  function drawAll(){const t=now();
    if(B.cur!==lastCur){lastCur=B.cur;if(B.cur)onTurnStart(B.cur)}
    const L=B.units.map(u=>({u,o:offOf(u,t)})).sort((a,b)=>(a.u.y+a.o.gy)-(b.u.y+b.o.gy));
    for(const e of L){try{drawOne(e.u,e.o,t)}catch(err){console.error(err)}}}
  function drawOne(u,o,t){const h=unitH(u);
    // 状态跃迁
    if(u.hp<=0){if(u._dT==null){u._dT=t;u.anim=null;u.dashing=false}}else if(u._dT!=null){u._dT=null;u._blk=null;u._gone=0}
    if(u.broken&&!u._bk){u._bk=1;u._bT=t}else if(!u.broken&&u._bk){u._bk=0;if(u.hp>0)u._shT=t}
    if(u.charging&&!u._ch){u._ch=1;u._cT=t}else if(!u.charging)u._ch=0;
    const gx=u.x+o.x,gy=u.y+o.gy,y=gy-o.lift;u.ox=o.x;u.oy=o.gy-o.lift;u.goy=o.gy;
    if(u.hp<=0&&u.side==='foe'){foeDeath(u,gx,gy,h,t);return}
    const fr=frameOf(u,t,h),st=fr.st,k=st.k,e=t-st.t0,dir=face(u);
    shadow(gx,gy,h,o.lift);
    rings(u,gx,gy,h,t);
    trail(u,fr,gx,y,t);
    // 程序化姿态：静态帧或表内缺该动作时补足
    let rot=0,dx=0,sxs=1,sys=1,up=0;const op={};
    if(!fr.sheet||!fr.has(k)){
      if(k==='idle'&&!fr.sheet)sys=1+Math.sin(t/420+u.id*9)*.012;
      else if(k==='dash')rot=.1*dir;
      else if(k==='atk'||k==='atk2'){const im=impactMs(u,k);if(e<im){dx=-5*dir*e/im;rot=-.05*dir}else{const q=Math.max(0,1-(e-im)/250);dx=10*dir*q;sxs=1+.06*q;rot=.06*dir*q}}
      else if(k==='hurt'){rot=-.12*dir*Math.max(0,1-e/300)}
      else if(k==='cast'){up=3*Math.min(1,e/120);op.white=.1+.06*Math.sin(t/60);op.wc='#fff4c0'}
      else if(k==='dead'){rot=-.32*dir}}
    if(u.broken&&u.hp>0){if(fr.sheet&&fr.has('brk'))op.grey=.25;else{op.grey=.7;op.dark=.22;rot+=-.08*dir}}
    if(u.hp<=0){op.grey=.45;op.dark=.45}
    if(B.tgtList&&u.hp>0&&u!==B.cur){const on=B.tgtList.includes(u)&&(B.tgtAll||B.tgtList[B.tsel]===u);if(on){op.white=Math.max(op.white||0,.1+.08*Math.sin(t/110));op.wc='#fff4d8'}else{op.dark=Math.max(op.dark||0,.38);op.dc='#05030a'}}
    if(u._boT!=null){const kb=(t-u._boT)/(760+u._boL*120);if(kb>=0&&kb<1){op.white=(.06+.05*u._boL)*Math.sin(kb*Math.PI);op.wc='#ffd070'}}
    if(u.charging&&u.hp>0){op.white=.07+.06*Math.sin(t/70);op.wc='#ff3020'}
    if(u._hlT!=null&&t-u._hlT<320){op.white=.35*(1-(t-u._hlT)/320);op.wc='#b0ffc8'}
    if(u._shT!=null&&t-u._shT<300){op.white=.7*(1-(t-u._shT)/300);op.wc='#bfe6ff'}
    if(u._flT!=null){const f=t-u._flT;if(f<70||(f>=120&&f<190)){op.white=f<70?1:.7;op.wc='#ffffff'}}
    if(u.hp<=0&&u._dT!=null&&t-u._dT<160){op.white=.8;op.wc='#fff'}
    if(fr.none){g.save();g.globalAlpha=.9;g.fillStyle='#0b0806';g.beginPath();g.ellipse(gx,y-h*.35,h*.18,h*.35,0,0,7);g.arc(gx,y-h*.82,h*.12,0,7);g.fill();g.restore();return}
    blit(fr,gx+dx,y-up,{rot,sx:sxs,sy:sys,...op,alpha:u.hp<=0?.9:1})}
  // 当前行动者脚下光环 + 回合开始的扩散强调
  function rings(u,x,y,h,t){const rx=Math.max(30,h*.24),ry=rx*.28;
    if(u.hp>0&&B.cur===u){const col=u.side==='foe'?'#ff7a5a':'#ffd24a',p=.62+.22*Math.sin(t/220);pxEllipse(x,y,rx,ry,col,p);pxEllipse(x,y,rx*.78,ry*.78,col,p*.45,.5,t/500)}
    if(u._tT!=null){const k=(t-u._tT)/560;if(k>=0&&k<1){const r=1+k*1.2;pxEllipse(x,y,rx*r,ry*r,u.side==='foe'?'#ffb09a':'#fff0b8',(1-k)*.95);if(k<.5)pxEllipse(x,y,rx*r*.7,ry*r*.7,'#ffffff',(1-k*2)*.6)}}}
  // 冲刺残影：2–3 个递减透明的着色剪影
  function trail(u,fr,x,y,t){if(u.dashing&&!fr.none){if(!u._tr)u._tr=[];const l=u._tr[0];if(!l||t-l.t>=38){u._tr.unshift({x,y,fr,t});if(u._tr.length>3)u._tr.length=3}}
    if(!u._tr||!u._tr.length)return;const A=[.5,.34,.2],col=u.side==='foe'?'#ff8a70':'#8fd0ff';
    for(let i=u._tr.length-1;i>=0;i--){const s=u._tr[i],age=t-s.t,f=cl01(1-(age-110)/150);if(f<=0||(Math.abs(s.x-x)<6&&!u.dashing))continue;blit(s.fr,s.x,s.y,{white:.85,wc:col,alpha:A[i]*f})}
    if(!u.dashing&&u._tr.every(s=>t-s.t>260))u._tr=[]}

  // ── 敌人死亡：闪红白 → 自上而下像素碎散 ──
  const FL=260;
  function snap(fr){try{const w=fr.sw,h=fr.sh;if(RC.width<w||RC.height<h){RC.width=Math.max(RC.width,w);RC.height=Math.max(RC.height,h)}rc.clearRect(0,0,w,h);rc.drawImage(fr.im,fr.sx,fr.sy,w,h,0,0,w,h);const d=rc.getImageData(0,0,w,h).data;
      const bs=Math.max(1,Math.round(h/44)),k2=fr.dh/h,out=[];let y0=1e9,y1=-1e9;
      for(let by=0;by<h;by+=bs)for(let bx=0;bx<w;bx+=bs){const px=Math.min(w-1,bx+(bs>>1)),py=Math.min(h-1,by+(bs>>1)),i=(py*w+px)*4;if(d[i+3]<110)continue;
        const lx=fr.flip?(w-bx-bs):bx;out.push({x:lx*k2-fr.dw/2,y:(by-h)*k2,r:d[i],g:d[i+1],b:d[i+2],by});y0=Math.min(y0,by);y1=Math.max(y1,by)}
      for(const b of out){const n=(b.by-y0)/Math.max(1,y1-y0);b.rel=n*560+Math.random()*110;b.vx=(b.x/Math.max(1,fr.dw/2))*.05+R(-.03,.03);b.vy=-R(.03,.09);b.life=R(420,720);
        b.c=`rgb(${b.r},${b.g},${b.b})`;b.cs=[0,1,2,3,4].map(j=>{const m=j/4;return`rgb(${Math.round(b.r+(255-b.r)*Math.min(1,m*1.6))},${Math.round(b.g+(170-b.g)*m)},${Math.round(b.b+(90-b.b)*m)})`})}
      return{b:out,s:Math.max(2,Math.ceil(bs*k2))}}catch(e){return false}}
  function foeDeath(u,x,y,h,t){if(u._gone)return;const e=t-u._dT;
    if(e<FL){const fr=frameOf(u,t,h);shadow(x,y,h,0);const ph=(e/65|0)%2;blit(fr,x+Math.sin(e*.9)*2,y,{white:.88,wc:ph?'#ff3a2a':'#ffffff'});return}
    if(u._blk==null){u._blk=snap(frameOf(u,t,h))}
    const E=e-FL;
    if(!u._blk){const fr=frameOf(u,t,h);const a=1-E/600;if(a<=0){u._gone=1;return}blit(fr,x,y,{alpha:a,white:.4,wc:'#ff6040'});return}
    shadow(x,y,h,0,Math.max(0,1-E/600));
    const S=u._blk.s;let alive=0;g.save();g.imageSmoothingEnabled=false;
    for(const b of u._blk.b)if(E<b.rel){g.fillStyle=E>b.rel-70?'#ffffff':b.c;g.fillRect(Math.round(x+b.x),Math.round(y+b.y),S,S);alive++}
    g.globalCompositeOperation='lighter';
    for(const b of u._blk.b){const a=E-b.rel;if(a<0||a>b.life)continue;alive++;const k=a/b.life;
      const px=x+b.x+b.vx*a,py=y+b.y+b.vy*a-.00006*a*a;g.globalAlpha=k<.1?1:1-k;g.fillStyle=k<.1?'#fff4e0':b.cs[Math.min(4,1+(k*4|0))];
      const s=k>.55?Math.max(2,S-1):S;g.fillRect(sn(px),sn(py),s,s)}
    g.restore();if(!alive)u._gone=1}

  // ── 覆盖层（画进 VFX 低分辨率像素层，共享辉光）：蓄势光柱、蓄势预览、头目蓄力、破势星、回盾 ──
  const hsh=(i,s=1)=>{const v=Math.sin(i*127.1+s*311.7)*43758.5453;return v-Math.floor(v)};
  function streaks(A,fx,fy,n,bw,ht,pal,q,spd,len){const{Ln,P}=A;for(let i=0;i<n;i++){const ph=(A.clock/spd+hsh(i,3))%1,xo=(hsh(i,1)-.5)*2*bw,yy=fy-ph*ht,l=len+hsh(i,2)*4,a=q*(1-ph*.75);
      Ln(fx+xo,yy,fx+xo,yy+l,pal[2],a*.8,1);P(fx+xo,yy,pal[0],a);P(fx+xo,yy+1,pal[1],a)}}
  function motesUp(A,fx,fy,n,bw,ht,pal,q,spd){const{P}=A;for(let i=0;i<n;i++){const ph=(A.clock/spd+hsh(i,7))%1,x=fx+(hsh(i,5)-.5)*2*bw+Math.sin(A.clock/200+i)*1.5,y=fy-ph*ht;P(x,y,A.pc(pal,ph),q*(1-ph))}}
  // 蓄势等级光效：L=1..3；pre=选择中的预览（弱、持续脉动）；k=爆发进度
  // 光柱：画进纯光源层（块状半透明 + 辉光），中心亮、两侧与顶端衰减
  function pillar(A,fx,fy,bw,ht,col,q){if(ht<1||q<=0)return;const n=Math.ceil(bw);for(let x=-n;x<=n;x++){const e=1-(x/(bw+.5))**2;if(e<=0)continue;
      for(let y=0;y<ht;y+=2){const v=y/ht,a=q*e*(1-v)*(1-v*.4);if(a>.02)A.PG(fx+x,fy-y-2,1,2,col,a)}}}
  function aura(A,u,L,k,pre){const{ring,PAL}=A,pal=PAL.金,s=Math.sqrt(unitH(u)/150),fx=A.L(u.x+(u.ox||0)),fy=A.L(u.y+(u.goy||0)),hh=A.L(unitH(u));
    const q=pre?.55+.15*Math.sin(A.clock/160):k<.1?k/.1:k>.72?(1-k)/.28:1;
    const rx=(9+L*3.5)*s,ry=rx*.3;
    ring(fx,fy,rx,ry,pal[2],q,0,0,L>1?2:1);ring(fx,fy,rx-1,ry-.4,pal[0],q*.8,0,0,1);
    if(L>=2)ring(fx,fy,rx*.7,ry*.7,pal[1],q,.5,A.clock/260,1);
    if(L>=3)ring(fx,fy,rx*1.3,ry*1.3,pal[3],q*.9,.35,-A.clock/300,1);
    const grow=pre?1:Math.min(1,k*5),ht=hh*(.55+.28*L)*grow*(pre?.8:1),bw=hh*(.14+.04*L);
    pillar(A,fx,fy,bw*1.1,ht,pal[2],q*(pre?.14+.05*L:.14+.1*L));pillar(A,fx,fy,bw*.45,ht*.9,pal[1],q*(pre?.08+.04*L:.1+.07*L));
    streaks(A,fx,fy,(pre?2:3)+L*(pre?2:4),bw*1.15,ht,pal,q,Math.max(340,760-L*120),4+L*3);
    motesUp(A,fx,fy,4+L*4,bw*1.5,ht*1.15,pal,q,560-L*60);
    if(!pre&&L>=3&&k<.5){const kk=k/.5;ring(fx,fy,rx*(1+kk*3.6),ry*(1+kk*3.6),pal[1],1-kk,0,0,2);ring(fx,fy,rx*(1+kk*3.6)-1,ry*(1+kk*3.6)-.4,'#ffffff',(1-kk)*.8,0,0,1);
      if(kk>.2){const k2=(kk-.2)/.8;ring(fx,fy,rx*(1+k2*2.4),ry*(1+k2*2.4),pal[0],(1-k2)*.8,.4,0,1)}}
    if(pre&&u._pvT!=null){const kk=(now()-u._pvT)/320;if(kk>=0&&kk<1){ring(fx,fy,rx*(1+kk*.9),ry*(1+kk*.9),pal[0],1-kk,0,0,1+(L>2));pillar(A,fx,fy,bw,ht,'#ffffff',.3*(1-kk))}}}
  function chargeAura(A,u){const{ring,PAL}=A,pal=PAL.血,s=Math.sqrt(unitH(u)/150),fx=A.L(u.x+(u.ox||0)),fy=A.L(u.y+(u.goy||0)),hh=A.L(unitH(u));const q=.6+.25*Math.sin(A.clock/90);
    const rx=14*s,ry=rx*.3;pillar(A,fx,fy,hh*.2,hh*.95,pal[2],q*.2);ring(fx,fy,rx,ry,pal[2],q,0,0,2);ring(fx,fy,rx*.72,ry*.72,pal[1],q*.8,.5,-A.clock/200,1);
    streaks(A,fx,fy,7,hh*.2,hh*.9,pal,q*.85,520,6);motesUp(A,fx,fy,8,hh*.24,hh,pal,q,640)}
  function stars(A,u){const{P}=A,s=Math.sqrt(unitH(u)/150),cx=A.L(u.x+(u.ox||0)),cy=A.L(u.y+(u.oy||0)-unitH(u))-2;
    for(let i=0;i<3;i++){const a=A.clock/300+i*2.1,sx=cx+Math.cos(a)*8*s,sy=cy+Math.sin(a)*2.2,q=Math.sin(a)<0?.55:1;P(sx,sy,'#ffffff',q);P(sx-1,sy,'#ffe25a',q);P(sx+1,sy,'#ffe25a',q);P(sx,sy-1,'#ffe25a',q);P(sx,sy+1,'#ffe25a',q)}}
  function shieldBack(A,u,e){const{ring,P,PAL}=A,kk=e/620,s=Math.sqrt(unitH(u)/150),cx=A.L(u.x+(u.ox||0)),cy=A.L(u.y+(u.oy||0)-unitH(u)*.5),r=(6+kk*16)*s;
    ring(cx,cy,r,r*.95,PAL.冰[2],1-kk,0,0,2);ring(cx,cy,r*.6,r*.57,'#ffffff',(1-kk)*.8,.5,kk*4,1);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2+kk*2,rr=r*(1.05+hsh(i,9)*.3);P(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,PAL.冰[i&1],1-kk)}}
  function overlay(A,t){if(!B)return;
    for(const u of B.units){if(u.hp<=0)continue;
      if(u._boT!=null){const d=760+u._boL*120,k=(t-u._boT)/d;if(k>=0&&k<1){aura(A,u,u._boL,k,false);continue}}
      if(u.side==='ally'){if(B.cur===u&&B.bpUse>0){if(u._pvL!==B.bpUse){if(B.bpUse>(u._pvL||0))u._pvT=t;u._pvL=B.bpUse}aura(A,u,Math.min(3,B.bpUse),0,true)}else u._pvL=0}
      if(u.charging)chargeAura(A,u);
      if(u.broken)stars(A,u);
      if(u._shT!=null&&t-u._shT<620)shieldBack(A,u,t-u._shT)}}
  VFX.overlay(overlay);

  // ── 旧粒子（B.parts：破势碎片、治疗光点）改为像素块，时间走 BT ──
  let pAcc=0,pLast=0;
  function drawParts(){if(!B)return;const t=now(),dt=pLast?Math.max(0,Math.min(50,t-pLast)):16;pLast=t;pAcc+=dt;let n=Math.floor(pAcc/STEP);pAcc-=n*STEP;if(n>3){n=3;pAcc=0}
    for(const p of B.parts)for(let s=0;s<n;s++){p.x+=p.vx;p.y+=p.vy;p.vy+=p.glow?0:.25;p.life--;p.rot=(p.rot||0)+(p.vr||0)}
    g.save();g.imageSmoothingEnabled=false;
    for(const p of B.parts){const a=Math.min(1,p.life/25);if(a<=0)continue;const x=sn(p.x),y=sn(p.y);g.fillStyle=p.c;
      if(p.glow){g.globalCompositeOperation='lighter';g.globalAlpha=a*.3;g.fillRect(x-PX,y-PX,PX*3,PX*3);g.globalAlpha=a;g.fillRect(x,y,PX,PX);if(p.r>3){g.fillRect(x,y-PX,PX,PX)}}
      else{g.globalCompositeOperation='source-over';g.globalAlpha=a;const big=p.r>5;g.fillStyle='rgba(10,16,30,.8)';g.fillRect(x-1,y-1,(big?PX*2:PX)+2,PX+2);g.fillStyle=p.c;g.fillRect(x,y,big?PX*2:PX,PX);
        const c=Math.cos(p.rot||0);g.fillRect(c>0?x+(big?PX*2:PX):x-PX,c>0?y-PX:y+PX,PX,PX)}}
    g.restore();B.parts=B.parts.filter(p=>p.life>0)}

  // ── 破势：盾碎 + 横幅（POSHI.banner；都缺失时自绘回退横幅）+ 屏幕闪 ──
  const SHIELD=['01111111110','11111111111','11111111111','11111111111','11111111111','11111111111','01111111110','00111111100','00011111000','00001110000','00000100000'];
  const CRACK=[[5,0],[5,1],[4,2],[5,3],[6,4],[5,5],[4,6],[5,7],[5,8]];
  function shieldShatter(u,e){const s=4,cx=u.x+(u.ox||0),cy=u.y+(u.oy||0)-unitH(u)*.62,W0=11*s,H0=11*s;g.save();g.imageSmoothingEnabled=false;
    const sp=e<90?1+.25*(1-e/90):1;
    for(let r=0;r<11;r++)for(let c=0;c<11;c++){if(SHIELD[r][c]!=='1')continue;
      const edge=[[0,1],[0,-1],[1,0],[-1,0]].some(([a,b])=>(SHIELD[r+a]||'')[c+b]!=='1');
      let col=e<50?'#ffffff':edge?'#bfe6ff':r<4&&c<5?'#7ab8e8':'#3a78b0';if(e>=40&&CRACK.some(([cc,rr])=>cc===c&&rr===r))col='#0a1a2a';
      let x=(c-5.5)*s*sp,y=(r-5.5)*s*sp,a=1;
      if(e>=110){const k=e-110,qx=c<5.5?-1:1,qy=r<5?-1:1;x+=qx*(.1+.06*(r%3))*k;y+=qy*.05*k-.12*k+.00045*k*k;a=cl01(1-(k-260)/220)}
      if(a<=0)continue;g.globalAlpha=a;g.fillStyle='#08101c';g.fillRect(Math.round(cx+x)-1,Math.round(cy+y)-1,s+2,s+2);g.fillStyle=col;g.fillRect(Math.round(cx+x),Math.round(cy+y),s,s)}
    g.restore()}
  // 回退横幅（仅当 POSHI 与 BUI.breakBanner 都不存在时）：墨色斜带 + 毛笔字「破势」
  const BRUSH='"Zhi Mang Xing","Ma Shan Zheng","ZCOOL XiaoWei","Noto Serif SC",serif';
  function breakBanner(u,e){const cy=Math.max(90,u.y+(u.oy||0)-unitH(u)*.5-8),cx=Math.min(W-110,Math.max(110,u.x+(u.ox||0)));
    const a=e<900?1:cl01(1-(e-900)/320),grow=cl01(e/140),bwid=Math.round(220*grow/PX)*PX,bh=16*PX;
    if(a<=0)return;g.save();g.globalAlpha=a*.9;
    for(let r=0;r<bh/PX;r++){const off=Math.round((bh/PX/2-r)*.6)*PX;g.fillStyle=r===0||r===bh/PX-1?'#b8231c':'rgba(12,8,6,.92)';g.fillRect(sn(cx-bwid/2+off),sn(cy-bh/2)+r*PX,bwid,PX)}
    if(grow>.5){const sc=e<120?1.5-(e/120)*.5:1;g.globalAlpha=a;g.font=`${Math.round(44*sc)}px ${BRUSH}`;g.textAlign='center';g.textBaseline='middle';
      g.lineWidth=6;g.strokeStyle='#ece2c8';g.strokeText('破势',cx,cy+2);g.fillStyle='#120c0a';g.fillText('破势',cx,cy+2)}
    g.restore()}
  function drawBreakFlash(){if(!B)return;const t=now(),rt=performance.now();
    for(const u of B.foes){if(u.breakT&&rt-u.breakT<300){g.fillStyle=`rgba(255,244,214,${.22*(1-(rt-u.breakT)/300)})`;g.fillRect(-W,-H,W*3,H*3)}}
    for(const u of B.foes){if(u._brkFx==null)continue;const e=t-u._brkFx;if(e<0)continue;if(e<760)shieldShatter(u,e);if(u._bnr&&e<1250)breakBanner(u,e);if(e>1300)u._brkFx=null}
    if(window.POSHI&&typeof POSHI.draw==='function'){try{POSHI.draw()}catch(er){console.error(er)}}}

  // ── BFX（B 调用） ──
  function onTurnStart(u){if(!u)return;const t=now();if(!(u._tT!=null&&t-u._tT<250&&t>=u._tT))u._tT=t}
  async function victoryPose(){if(!B)return;const al=B.allies.filter(u=>u.hp>0);if(!al.length)return;
    camOn(al,1.2,450);
    al.forEach((u,i)=>{(async()=>{await bw(i*90);const A=window.BART&&BART[u.art];
      if(A&&hasA(A,'win')&&artOf(u)===A){act(u,'win',true)}
      else{act(u,'cast',true);await moveTo(u,0,0,340,26,'lin');await moveTo(u,0,0,240,12,'lin');u.anim=null}})()});
    await bw(900)}

  return{now,bw,act,cam,camOn,camReset,dashTo,hopBack,stepFwd,stepBack,moveTo,impactMs,lunge,drawUnit,drawParts,drawBreakFlash,onTurnStart,victoryPose,artOf,hasCast:k=>!!(k&&['bianfa','jinzhen','liuye','guafeng','ghost'].includes(k))}})();
window.BFX={victoryPose:BFXI.victoryPose,onTurnStart:BFXI.onTurnStart};

// ───────── 覆盖 battle.js（规则/数值与原函数逐行一致） ─────────
function drawUnit(u,t){BFXI.drawUnit(u,t)}
function drawParts(now){BFXI.drawParts(now)}
function drawBreakFlash(now){BFXI.drawBreakFlash(now)}
function lunge(u,t,k=1){return BFXI.lunge(u,t,k)}
async function boostFx(u,bp){B.boostT=performance.now();B.boostU=u;floatTxt(u,'蓄势 '+'◆'.repeat(bp),'#ffcf73',22);bsfx('chime',.6,1+bp*.1);
  u._boT=BT.now();u._boL=Math.min(3,bp);BFXI.act(u,'cast');if(bp>=3){B.shake=Math.max(B.shake,4);BFXI.cam('punch',1.04,220)}
  await BFXI.bw(380+Math.min(3,bp)*70)}
function hurt(t,dmg,col,big){t.hp=Math.max(0,t.hp-dmg);t.flash=performance.now();t.ghT=performance.now();if(t.hp>0)BFXI.act(t,'hurt');t.kb=performance.now();t.kbT=BT.now();t._flT=BT.now();
  B.shake=Math.max(B.shake,big?8:4);bsfx('advance',.9,.7+Math.random()*.2);
  floatTxt(t,String(dmg),col,big?34:28);if(t.hp<=0){t.dieT=performance.now();t.intent=null;if(t.side==='ally'){t.bp=0;t.defend=false;t.stun=false}}renderCards()}
function heal(t,n){const h=Math.min(n,t.mhp-t.hp);t.hp+=h;floatTxt(t,'+'+h,'#7fe0a0',28);t._hlT=BT.now();
  for(let i=0;i<10;i++)B.parts.push({x:t.x+rnd(-25,25),y:t.y-rnd(10,80),vx:0,vy:-rnd(.6,1.6),r:rnd(2,4),life:rnd(30,50),c:'#9ff0b0',glow:1});bsfx('chime',.5);renderCards()}
function doBreak(t){VFX.brk(t);t.broken=true;t.brokenUntil=B.round+1;t.charging=false;t.intent=null;t.breakT=performance.now();B.shake=14;bsfx('whoosh',1,.6);
  const bf=window.POSHI&&typeof POSHI.banner==='function'?POSHI.banner:window.BUI&&typeof BUI.breakBanner==='function'?BUI.breakBanner:null,bn=!!bf;
  if(bn){try{bf(t)}catch(e){console.error(e)}}
  for(let i=0;i<26;i++){const a=rnd(0,Math.PI*2),s=rnd(2,7);B.parts.push({x:t.x,y:t.y-unitH(t)*.55,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,r:rnd(3,9),rot:rnd(0,6),vr:rnd(-.3,.3),life:rnd(40,70),c:Math.random()<.5?'#bfe6ff':'#ffe7a0'})}
  t._brkFx=BT.now();t._bnr=!bn;BT.stop(250);BFXI.cam('punch',1.12,320)}
async function doAttack(u,t,bp){const hits=1+bp;if(bp)await boostFx(u,bp);
  showName(u,u.atkName+(hits>1?` ×${hits}`:''));BFXI.camOn([u,t],1.18);await BFXI.dashTo(u,t);
  for(let h=0;h<hits;h++){if(t.hp<=0)break;const a=h?'atk2':'atk';BFXI.act(u,a);await BFXI.bw(BFXI.impactMs(u,a));
    strike(u,t,{pow:1,t:u.atkType});VFX.hit(u,t,u.atkType,null,bp);await BFXI.bw(hits>1?150:230)}
  BFXI.camReset();await BFXI.hopBack(u);await wait(120)}
async function doSkill(u,k,tgs,bp){const sk=SKILLS[k],bi=BSK[k]||{};u.mp-=sk.mp||0;renderCards();if(bp)await boostFx(u,bp);showName(u,sk.name);
  const lvM=1+.15*(((u.skLv||{})[k]||1)-1);
  if(sk.heal||bi.buff){BFXI.act(u,'cast',true);BFXI.camOn([u,...tgs],1.1);BFXI.stepFwd(u);await VFX.cast(u,k,tgs,bp)}
  if(sk.heal){for(const t of tgs)if(t.hp>0)heal(t,Math.round(t.mhp*sk.heal*lvM*(1+bp*.5)));await BFXI.bw(280);u.anim=null;BFXI.camReset();await BFXI.stepBack(u);await wait(300);return}
  if(bi.buff){for(const t of tgs){t.buffs.ding=2+bp;floatTxt(t,'定神 · 攻防提升','#ffe7a0',20)}renderCards();await BFXI.bw(280);u.anim=null;BFXI.camReset();await BFXI.stepBack(u);await wait(300);return}
  const hits=(bi.hits||1)+(bi.hits?bp:0),pow=(sk.pow||1)*lvM*(bi.hits?1/Math.sqrt(bi.hits):1)*(bi.hits?1:1+bp*.8);
  const ranged=bi.tgt==='foes'||BFXI.hasCast(k);
  BFXI.camOn([u,...tgs],tgs.length>1?1.08:1.18);
  if(ranged){BFXI.act(u,'atk');BFXI.stepFwd(u,36);await VFX.cast(u,k,tgs,bp)}
  else{await VFX.cast(u,k,tgs,bp);await BFXI.dashTo(u,tgs[0])}
  for(let h=0;h<hits;h++){if(h||!ranged){const a=h?'atk2':'atk';BFXI.act(u,a);await BFXI.bw(BFXI.impactMs(u,a))}
    for(const t of tgs){if(t.hp<=0)continue;strike(u,t,{pow,t:bi.t,e:bi.e});VFX.hit(u,t,bi.t,k,bp);
      if(h===0&&bi.reveal&&t.hp>0)reveal(t,bi.reveal+(bp?1:0));
      if(bi.bleed&&t.hp>0)t.bleedN=3;
      if(bi.stun&&t.hp>0&&!t.broken&&chance(sk.stun||25)){t.intent=null;floatTxt(t,'眩晕 · 失去行动','#e0c0ff',18)}}
    await BFXI.bw(hits>1?170:230)}
  BFXI.camReset();if(ranged)await BFXI.stepBack(u);else await BFXI.hopBack(u);await wait(150)}
async function foeAct(u){const it=u.intent||{};u.intent=null;
  if(it.charge){u.charging=true;floatTxt(u,'蓄力！','#ffe25a',24);bsfx('whoosh',.8,.7);BFXI.act(u,'cast');await wait(700);u.intent={sk:'ghost',all:true};return}
  u.charging=false;const sk=SKILLS[it.sk]||SKILLS.blade,info=BSK[it.sk]||{t:'刀'};
  const al=aliveOf('ally');if(!al.length)return;
  let tg=it.all?al:[it.tgt&&it.tgt.hp>0?it.tgt:al[ri(0,al.length-1)]];
  showName(u,sk.name);
  const near=tg.reduce((m,t)=>Math.abs(t.x-u.x)<Math.abs(m.x-u.x)?t:m,tg[0]);
  BFXI.camOn([u,it.all?near:tg[0]],it.all?1.08:1.16);
  if(it.sk==='ghost'){BFXI.act(u,'cast',true);await VFX.cast(u,'ghost',tg,0)}
  await BFXI.dashTo(u,it.all?near:tg[0]);
  const hits=info.hits||1;
  for(let h=0;h<hits;h++){const a=h?'atk2':'atk';BFXI.act(u,a);await BFXI.bw(BFXI.impactMs(u,a));
    for(const t of tg){if(t.hp<=0)continue;
      if(!it.all&&chance(t.dodge*.6)){floatTxt(t,'闪','#bcd',24);t.dgT=BT.now();continue}
      let dmg=(u.atk*(sk.pow||1)*(hits>1?.65:1)*(it.all?.85:1))-t.def*.5;if(t.buffs.ding)dmg*=.8;if(t.defend)dmg*=.5;
      dmg=Math.max(1,Math.round(dmg*rnd(.9,1.1)));hurt(t,dmg,'#ff9c80');VFX.hit(u,t,info.t,it.sk,0);
      if(info.stun&&t.hp>0&&chance(sk.stun||25)){t.stun=true;floatTxt(t,'眩晕','#e0c0ff',20)}}
    renderCards();await wait(260)}
  BFXI.camReset();await BFXI.hopBack(u);await wait(100)}
