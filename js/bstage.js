'use strict';
// ───────────────────────── 战斗舞台与镜头（工作流 A，见 docs/battle-v2.md）─────────────────────────
// 覆盖 battle.js：drawBattleBg / drawStageFront / layoutUnits / unitH，赋值 CAM。
//  · 背景：优先 assets/bb_{scene}.webp（战斗专用，低地平线、中场空旷、偏暗），缺则回退 bg_{scene} 并压暗调色。
//    景深虚化 / 调色 / 地平线薄雾 预渲染到离屏画布（每张图只做一次），每帧只 drawImage 一次。
//  · 前景：3px 像素颗粒的尘埃 / 火星 / 落叶 / 萤火，低处薄雾带（低分辨率贴图最近邻放大、横向缓慢滚动）。
//  · 站位：我方从右前向右后斜线纵深，敌方错落、头目居中偏前；按脚底 y 写 u.depth(0 后排..1 前排) 与 u.dscale。
//  · 镜头：CAM.focus/punch/reset，平滑缓动，缩放 1–1.25，边界夹紧不露黑边；toWorld 为 apply 的精确逆变换。
const bstageMapKey=id=>(SC[id]||{}).bg;   // 探索地图键（IIFE 内 SC 被场景氛围表遮蔽，故放外面）
const BSTAGE=(()=>{
  const PX=3;                                   // 一个像素单位 = 3 屏幕像素（与战斗精灵同密度）
  const HORIZON=.57;                            // bb_* 地平线高度（画面比例）
  const BLEED=28;                               // 背景四周外扩，震屏时不露边
  // 场景氛围：tint 整体调色（叠加）、pool 脚下光斑颜色、fx 前景粒子、mist 雾色、dark 回退图压暗量
  const SC={
    street:     {hz:.51,tint:'rgba(40,30,70,.10)', pool:'255,190,120', fx:['ember','dust'], mist:'150,140,170', dark:.42},
    temple_out: {hz:.56,tint:'rgba(70,40,40,.10)', pool:'255,200,140', fx:['leaf','dust'],  mist:'170,150,150', dark:.40},
    temple:     {hz:.58,tint:'rgba(50,35,30,.12)', pool:'255,190,120', fx:['dust','ember'], mist:'150,130,120', dark:.42},
    gate:       {hz:.53,tint:'rgba(50,40,70,.10)', pool:'255,200,140', fx:['dust','leaf'],  mist:'160,150,170', dark:.40},
    alley:      {hz:.59,tint:'rgba(30,40,80,.12)', pool:'190,210,255', fx:['dust','fly'],   mist:'130,150,190', dark:.45},
    ferry:      {hz:.53,tint:'rgba(70,40,50,.08)', pool:'255,190,130', fx:['fly','dust'],   mist:'180,160,170', dark:.38},
    bandit_gate:{hz:.52,tint:'rgba(70,25,20,.12)', pool:'255,170,100', fx:['ember','dust'], mist:'150,120,110', dark:.42},
    bandit_cave:{hz:.56,tint:'rgba(40,20,20,.14)', pool:'255,160,90',  fx:['ember','dust'], mist:'120,100,95',  dark:.48},
    road:       {hz:.56,tint:'rgba(50,45,60,.10)', pool:'255,200,140', fx:['leaf','dust'],  mist:'160,160,165', dark:.40},
    river:      {hz:.60,tint:'rgba(60,40,40,.10)', pool:'255,190,120', fx:['dust'],        mist:'170,150,140', dark:.40},   // 渡船甲板（crossing 江心截船，工作流 F）
  };
  // ── 背景键 → 战斗背景 bb_{name}（见 docs/battle-v2.md §背景映射）──
  // 剧情可传 bb_* / bg_{scene} / m_{scene}(_v2)：去前缀与 _vN 后缀，探索场景 id 与战斗背景名不同的走 BB_ALIAS。
  // 这样 m_gate/bg_gate→bb_gate、m_temple_out→bb_temple_out、m_bgate→bb_bandit_gate、m_cave→bb_bandit_cave、m_street_v2→bb_street、crossing→bb_river、ferry_e→bb_ferry。
  const BB_ALIAS={bgate:'bandit_gate',cave:'bandit_cave',crossing:'river',ferry_e:'ferry'};   // 渡船 → bb_river；东岸芦苇荡 → bb_ferry（同一段江岸）
  const bbName=k=>{const s=String(k||'').replace(/^(bb|bg|m)_/,'').replace(/_v\d+$/,'');return BB_ALIAS[s]||s};
  // 没有对应文件的旧键（battle.js 未传 bg 时按 'bg_'+S.scene 取图）：bb 载入后挂到这些键上，避免 404
  const NOFILE={bg_bgate:'bb_bandit_gate',bg_cave:'bb_bandit_cave',bg_crossing:'bb_river',bg_ferry_e:'bb_ferry'};
  const sceneOf=()=>bbName((B&&B.bg)||'')||bbName(S.scene)||'street';
  const cfg=()=>SC[sceneOf()]||SC.street;
  const cv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};

  // ── 资源：bb_* 按需加载 ──
  const req=new Set();
  function want(k){if(IMG[k]||req.has(k))return;req.add(k);loadOpt(k,k).then(okk=>{if(!okk){IMG[k]=null;return}
    for(const[a,b]of Object.entries(NOFILE))if(b===k&&!IMG[a])IMG[a]=IMG[k]})}
  // 进入游戏空闲后预载全部战斗背景（很小），避免开战时闪一帧回退图
  setTimeout(()=>{for(const k of Object.keys(SC))want('bb_'+k)},4000);

  // ── 背景预渲染缓存 ──
  const cache=new Map();                       // key → canvas (W+2B)×(H+2B)
  function build(key,fallback){
    const im=IMG[key],CW=W+BLEED*2,CH=H+BLEED*2,c=cv(CW,CH),x=c.getContext('2d');
    const hz=BLEED+H*(cfg().hz||HORIZON);
    x.imageSmoothingEnabled=false;
    if(im&&im.naturalWidth){x.drawImage(im,0,0,CW,CH)}
    else{ // 场景地图兜底
      const m=IMG[bstageMapKey(S.scene)]||IMG['m_'+S.scene];x.fillStyle='#1d1812';x.fillRect(0,0,CW,CH);
      if(ok(m)){const s=Math.max(CW/m.naturalWidth,CH/m.naturalHeight)*1.1;x.drawImage(m,(CW-m.naturalWidth*s)/2,(CH-m.naturalHeight*s)/2,m.naturalWidth*s,m.naturalHeight*s)}}
    // 景深：远景（地平线以上）与最下缘前景虚化，中场清晰。模糊副本 + 渐变遮罩合成
    const bl=cv(CW,CH),bx=bl.getContext('2d');bx.filter=`blur(${fallback?2.2:1.3}px)`;bx.drawImage(c,0,0);bx.filter='none';
    bx.globalCompositeOperation='destination-in';
    const mk=bx.createLinearGradient(0,0,0,CH);
    mk.addColorStop(0,'rgba(0,0,0,.9)');mk.addColorStop((hz-60)/CH,'rgba(0,0,0,.75)');mk.addColorStop((hz+10)/CH,'rgba(0,0,0,0)');
    mk.addColorStop(.86,'rgba(0,0,0,0)');mk.addColorStop(1,'rgba(0,0,0,.7)');
    bx.fillStyle=mk;bx.fillRect(0,0,CW,CH);x.drawImage(bl,0,0);
    // 调色：回退图先整体压暗降饱和；统一叠加场景色调
    const C=cfg();
    if(fallback){x.fillStyle=`rgba(10,8,14,${C.dark})`;x.fillRect(0,0,CW,CH);
      x.globalCompositeOperation='saturation';x.fillStyle='rgba(128,128,128,.35)';x.fillRect(0,0,CW,CH);x.globalCompositeOperation='source-over'}
    x.globalCompositeOperation='soft-light';x.fillStyle=C.tint;x.fillRect(0,0,CW,CH);x.globalCompositeOperation='source-over';
    // 天空与地面上下压暗，中场留亮（舞台光）
    const gr=x.createLinearGradient(0,0,0,CH);
    gr.addColorStop(0,'rgba(6,4,10,.3)');gr.addColorStop(.25,'rgba(6,4,10,.06)');gr.addColorStop(.55,'rgba(6,4,10,0)');
    gr.addColorStop(.8,'rgba(6,4,10,.04)');gr.addColorStop(1,'rgba(6,4,10,.32)');
    x.fillStyle=gr;x.fillRect(0,0,CW,CH);
    // 地平线薄雾带（空气透视）
    const hzg=x.createLinearGradient(0,hz-70,0,hz+40);const mc=C.mist;
    hzg.addColorStop(0,`rgba(${mc},0)`);hzg.addColorStop(.62,`rgba(${mc},.16)`);hzg.addColorStop(1,`rgba(${mc},0)`);
    x.fillStyle=hzg;x.fillRect(0,hz-70,CW,110);
    // 左右框景再压暗，把视线收到中场
    const sg=x.createLinearGradient(0,0,CW,0);
    sg.addColorStop(0,'rgba(4,3,8,.3)');sg.addColorStop(.12,'rgba(4,3,8,0)');sg.addColorStop(.88,'rgba(4,3,8,0)');sg.addColorStop(1,'rgba(4,3,8,.3)');
    x.fillStyle=sg;x.fillRect(0,0,CW,CH);
    return c}
  function bgCanvas(){
    const bg=(B&&B.bg)||'bg_street',nm=sceneOf(),bb=SC[nm]?'bb_'+nm:null;if(bb)want(bb);   // 只请求登记过的 bb_*，杜绝 404
    let key,fb;
    if(bb&&ok(IMG[bb])){key=bb;fb=false}else{key=bg;fb=true}
    const ck=key+(ok(IMG[key])?'':'#map');
    if(!cache.has(ck))cache.set(ck,build(key,fb));
    return cache.get(ck)}

  // ── 脚下光斑（预渲染一次） ──
  let poolSpr=null,poolCol='';
  function pool(){const C=cfg();if(poolSpr&&poolCol===C.pool)return poolSpr;poolCol=C.pool;
    const c=cv(160,48),x=c.getContext('2d');x.translate(80,24);x.scale(1,.3);
    const gr=x.createRadialGradient(0,0,0,0,0,80);gr.addColorStop(0,`rgba(${C.pool},.34)`);gr.addColorStop(.45,`rgba(${C.pool},.14)`);gr.addColorStop(1,`rgba(${C.pool},0)`);
    x.fillStyle=gr;x.beginPath();x.arc(0,0,80,0,7);x.fill();poolSpr=c;return c}

  function drawBg(){
    const c=bgCanvas();g.imageSmoothingEnabled=true;g.drawImage(c,-BLEED,-BLEED);
    // 角色脚下柔和光斑（叠加提亮）
    const p=pool();g.save();g.globalCompositeOperation='lighter';
    for(const u of B.units){if(u.hp<=0&&u.side==='foe')continue;const h=unitH(u),w=Math.max(110,h*.9)*(u.hp>0?1:.7);
      g.globalAlpha=(u.hp>0?1:.4)*(.75+.25*(u.depth??1));g.drawImage(p,u.x-w/2,u.y-w*.15,w,w*.3)}
    g.restore()}

  // ── 前景：像素粒子与低处薄雾 ──
  const LW=W/PX,LH=H/PX;
  let parts=[],lastT=0,curB=null,mistTex=null,mistKey='';
  const R=(a,b)=>a+Math.random()*(b-a);
  function spawn(type,init){
    const p={type,x:R(-10,LW+10),y:0,vx:0,vy:0,ph:R(0,6.28),life:R(6,14)};
    if(type==='ember'){p.y=init?R(LH*.3,LH):LH+R(0,6);p.vx=R(-.8,1.6);p.vy=-R(2.5,6);p.c=Math.random()<.5?'255,190,90':'255,120,50'}
    else if(type==='leaf'){p.y=init?R(0,LH):-R(2,10);p.x=init?p.x:R(-40,LW);p.vx=R(3,7);p.vy=R(2,4.5);p.c=['196,120,50','160,90,40','210,160,70'][Math.random()*3|0]}
    else if(type==='fly'){p.y=R(LH*.45,LH*.95);p.vx=R(-1.5,1.5);p.vy=R(-1,1);p.c='210,255,150'}
    else{p.y=R(LH*.2,LH);p.vx=R(-1.2,1.2)+.8;p.vy=R(-.6,.4);p.c='235,220,190'}
    return p}
  function resetFx(){parts=[];const f=cfg().fx;for(let i=0;i<34;i++)parts.push(spawn(f[i%f.length]||'dust',true))}
  function mist(){const C=cfg();if(mistTex&&mistKey===C.mist)return mistTex;mistKey=C.mist;
    // 低分辨率薄雾（每格 = 3px），两倍宽，横向可无缝循环
    const w=LW*2,h=40,c=cv(w,h),x=c.getContext('2d'),id=x.createImageData(w,h),d=id.data;
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){
      const a=i/w*Math.PI*2;
      const n=.5+.25*Math.sin(a*3+j*.15)+.15*Math.sin(a*7-j*.3+1.3)+.1*Math.sin(a*13+j*.5+2.1);
      const v=Math.sin(Math.PI*j/h)**1.4*n;                // 中间浓、上下淡
      const q=Math.min(1,v*1.25),lvl=Math.round(q*4)/4,o=(j*w+i)*4;   // 透明度量化为 4 级（像素化的色阶雾）
      d[o]=+C.mist.split(',')[0];d[o+1]=+C.mist.split(',')[1];d[o+2]=+C.mist.split(',')[2];d[o+3]=lvl*100}
    x.putImageData(id,0,0);mistTex=c;return c}
  function drawFront(now){
    if(curB!==B){curB=B;resetFx();lastT=now}
    const dt=Math.min(.05,Math.max(0,(now-lastT)/1000));lastT=now;const f=cfg().fx;
    g.save();g.imageSmoothingEnabled=false;
    // 薄雾带（两层反向滚动）
    const m=mist(),mw=m.width*PX,mh=m.height*PX;
    for(const [sp,y,al] of [[6,H-mh*.75,.55],[-9,H-mh*.45,.4]]){const off=((now/1000*sp)%mw+mw)%mw;g.globalAlpha=al;
      const ox=Math.round((-off)/PX)*PX;g.drawImage(m,ox,Math.round(y),mw,mh);g.drawImage(m,ox+mw,Math.round(y),mw,mh)}
    // 粒子
    for(let i=0;i<parts.length;i++){const p=parts[i];
      p.ph+=dt*2;p.life-=dt;
      if(p.type==='leaf'){p.x+=(p.vx+Math.sin(p.ph)*3)*dt;p.y+=p.vy*dt}
      else if(p.type==='ember'){p.x+=(p.vx+Math.sin(p.ph*1.7)*1.2)*dt;p.y+=p.vy*dt}
      else if(p.type==='fly'){p.x+=(p.vx+Math.sin(p.ph*.8)*1.5)*dt;p.y+=(p.vy+Math.cos(p.ph*.6)*1)*dt}
      else{p.x+=(p.vx+Math.sin(p.ph*.5)*.6)*dt;p.y+=(p.vy+Math.cos(p.ph*.4)*.4)*dt}
      if(p.life<=0||p.y<-4||p.y>LH+12||p.x<-50||p.x>LW+50){parts[i]=spawn(f[i%f.length]||'dust',false);continue}
      const X=Math.round(p.x)*PX,Y=Math.round(p.y)*PX,fade=Math.min(1,p.life/2);
      if(p.type==='ember'){const fl=.55+.45*Math.sin(p.ph*9);g.globalAlpha=fade*fl;g.fillStyle=`rgb(${p.c})`;g.fillRect(X,Y,PX,PX);
        g.globalAlpha=fade*fl*.35;g.fillRect(X,Y+PX,PX,PX)}
      else if(p.type==='leaf'){g.globalAlpha=fade*.85;g.fillStyle=`rgb(${p.c})`;const s=Math.sin(p.ph*2)>0;
        g.fillRect(X,Y,PX*(s?2:1),PX);if(!s)g.fillRect(X,Y+PX,PX,PX)}
      else if(p.type==='fly'){const fl=Math.max(0,Math.sin(p.ph*2.3));g.globalAlpha=fade*fl;g.fillStyle=`rgb(${p.c})`;g.fillRect(X,Y,PX,PX);
        g.globalAlpha=fade*fl*.25;g.fillRect(X-PX,Y,PX*3,PX);g.fillRect(X,Y-PX,PX,PX*3)}
      else{g.globalAlpha=fade*(.25+.2*Math.sin(p.ph));g.fillStyle=`rgb(${p.c})`;g.fillRect(X,Y,PX,PX)}}
    g.restore()}

  return {drawBg,drawFront,sceneOf,HORIZON};
})();

function drawBattleBg(){BSTAGE.drawBg();stageActive(performance.now())}
function drawStageFront(now){BSTAGE.drawFront(now)}

// ───────── 站位 ─────────
// 纵深：脚底 y 在 [Y_BACK, Y_FRONT] 间映射 depth 0..1，dscale = .84..1（后排略小）
const STG={Y_BACK:365,Y_FRONT:495};
function stgDepth(u){u.depth=Math.max(0,Math.min(1,(u.y-STG.Y_BACK)/(STG.Y_FRONT-STG.Y_BACK)));u.dscale=.84+.16*u.depth}
function layoutUnits(allies,foes,opt){
  // 我方：右前(近敌、靠下) → 右后(远、靠上)斜线；站在 x≈500–700（右下 x≈700–940,y≈280–540 为队伍面板，其上方为指令菜单）
  // 参照《八方旅人》：我方一列纵向交错（前后错开半个身位），与敌方之间留出大片空场，出招需冲过去
  const AL={1:[[700,430]],2:[[650,408],[790,452]],3:[[630,396],[736,428],[846,464]],4:[[610,388],[696,412],[792,440],[878,472]]};
  const as=AL[Math.min(4,allies.length)]||AL[4];
  allies.forEach((u,i)=>{const s=as[i]||[560-i*20,420];u.x=s[0];u.y=s[1]});
  // 敌方：错落分布；头目居中偏前，小怪在其两侧后方
  if(opt.boss){
    const rest=[[380,372],[112,470],[330,470],[60,392]];
    foes.forEach((u,i)=>{if(i===0){u.bossy=true;u.x=230;u.y=430}else{const s=rest[i-1]||[60+i*30,440];u.x=s[0];u.y=s[1]}})}
  else{
    const FL={1:[[300,420]],2:[[340,392],[210,446]],3:[[370,378],[256,418],[132,462]],4:[[392,366],[298,396],[200,428],[100,466]],5:[[400,360],[318,388],[232,416],[146,446],[62,478]]};
    const fs=FL[Math.min(5,foes.length)]||FL[5];
    foes.forEach((u,i)=>{const s=fs[i]||[60+i*40,440];u.x=s[0];u.y=s[1]});
    if(foes.length===1&&!foes[0].bossy)foes[0].tierHint='elite'}
  for(const u of[...allies,...foes]){stgDepth(u);u.bx=u.x;u.stepO=0}
  // 开场镜头：先推近敌阵，再拉回全景（参照《八方旅人》开战运镜）
  try{const fx=foes.reduce((s,u)=>s+u.x,0)/Math.max(1,foes.length),fy=foes.reduce((s,u)=>s+u.y,0)/Math.max(1,foes.length)-60;
    CAM.focus&&CAM.focus(fx,fy,1.22,0);setTimeout(()=>{try{CAM.reset&&CAM.reset(1100)}catch(e){}},380)}catch(e){}}
// 当前行动者：向敌方跨出一步，脚下金色光圈（每帧在背景层调用）
function stageActive(now){if(!B)return;const dt=Math.min(50,now-(B._stT||now));B._stT=now;
  for(const u of B.allies){if(u.bx==null)continue;const want=(B.cur===u&&u.hp>0)?-30:0;u.stepO+=(want-u.stepO)*Math.min(1,dt/90);if(Math.abs(want-u.stepO)<.3)u.stepO=want;u.x=u.bx+u.stepO}
  const a=B.cur;if(!a||a.side!=='ally'||a.hp<=0)return;const r=unitH(a)*.42,p=.75+.25*Math.sin(now/260);
  g.save();const gr=g.createRadialGradient(a.x,a.y,2,a.x,a.y,r);gr.addColorStop(0,`rgba(255,214,120,${.42*p})`);gr.addColorStop(.6,`rgba(255,180,70,${.16*p})`);gr.addColorStop(1,'rgba(255,160,60,0)');
  g.fillStyle=gr;g.translate(a.x,a.y);g.scale(1,.28);g.translate(-a.x,-a.y);g.beginPath();g.arc(a.x,a.y,r,0,7);g.fill();g.restore()}

// 显示高度：BART[art].h 优先（D 已按档位与统一像素密度给出，直接采用）；表内非 boss 档却当头目用时 ×1.3。
// 回退（无 BART）：party≈165、minion≈1.2×、elite≈1.5×、boss≈2.2×（×体型 ART.scale），最后乘纵深缩放 dscale
const TIER_MUL={party:1,minion:1.2,elite:1.5,boss:2.2};
// 战斗显示倍率（参照《八方旅人》：我方约占画高 1/6）：BART 表为 3× 像素，×2/3 → 每美术像素 2 画布像素（整数倍）
const BSC=.5;   // 参照《八方旅人》人物很小：表内 3× 像素 → 显示每美术像素 1.5 画布像素
function unitH(u){
  const ba=window.BART&&BART[u.art];let h;
  // 有 BART：保持整数像素倍率（h 为 3× 像素高）——不乘纵深缩放；非头目表当头目时 ×4/3（每美术像素 3→4 画布像素）
  if(ba&&ba.h)return ba.h*BSC*(u.side==='foe'&&u.bossy&&ba.tier!=='boss'?1.5:1);   // ×1.5 → 每美术像素 3 画布像素
  else{const tier=u.side==='ally'?'party':u.bossy?'boss':(u.tierHint||'minion');
    const s=(window.ART&&ART.scale&&ART.scale[u.art])||(u.h?u.h/170:1);
    h=165*TIER_MUL[tier]*(tier==='boss'?Math.min(1,s):s)}
  return h*BSC*(u.dscale||1)}

// ───────── 2D 镜头 ─────────
// 世界坐标 = 画布 960×540 坐标；视图中心 (cx,cy)、缩放 z（1..1.25），apply: translate(W/2,H/2)·scale(z)·translate(-cx,-cy)
CAM=(()=>{
  const ZMIN=1,ZMAX=1.25;
  let cx=W/2,cy=H/2,z=1;                         // 当前（含冲击）
  let bx=W/2,by=H/2,bz=1;                        // 基础（缓动中）
  let tw=null,pu=null,owner=null;
  const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
  const clampZ=v=>Math.max(ZMIN,Math.min(ZMAX,v));
  function clampC(x,y,zz){const hw=W/2/zz,hh=H/2/zz;return[Math.max(hw,Math.min(W-hw,x)),Math.max(hh,Math.min(H-hh,y))]}
  function snap(){cx=bx=W/2;cy=by=H/2;z=bz=1;tw=null;pu=null}
  const C={
    update(now){
      if(owner!==B){owner=B;snap()}
      if(tw){const k=tw.ms>0?Math.min(1,(now-tw.t0)/tw.ms):1,e=ease(k);
        bz=tw.z0+(tw.z1-tw.z0)*e;bx=tw.x0+(tw.x1-tw.x0)*e;by=tw.y0+(tw.y1-tw.y0)*e;if(k>=1)tw=null}
      let pz=0;
      if(pu){const k=(now-pu.t0)/pu.ms;if(k>=1)pu=null;else{const a=k<.18?k/.18:Math.pow(1-(k-.18)/.82,2);pz=pu.a*(k<.18?Math.sin(a*Math.PI/2):a)}}
      z=clampZ(bz*(1+pz));[cx,cy]=clampC(bx,by,z)},
    apply(){g.translate(W/2,H/2);g.scale(z,z);g.translate(-cx,-cy)},
    toWorld(x,y){return[(x-W/2)/z+cx,(y-H/2)/z+cy]},
    toScreen(x,y){return[(x-cx)*z+W/2,(y-cy)*z+H/2]},
    focus(x,y,zoom=1.12,ms=380){const t0=performance.now();C.update(t0);
      const z1=clampZ(zoom),[x1,y1]=clampC(x,y,z1);tw={t0,ms:Math.max(0,ms),x0:bx,y0:by,z0:bz,x1,y1,z1}},
    // 以单位为焦点：取身体中部
    focusUnit(u,zoom=1.15,ms=380){if(!u)return;C.focus(u.x,u.y-unitH(u)*.45,zoom,ms)},
    punch(zoom=1.08,ms=320){pu={t0:performance.now(),ms:Math.max(60,ms),a:Math.max(-.2,Math.min(.25,zoom-1))}},
    reset(ms=420){C.focus(W/2,H/2,1,ms)},
    get state(){return{cx,cy,z,bx,by,bz}}};
  return C})();
