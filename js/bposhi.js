'use strict';
// 「破势」演出素材与横幅（工作流 F），见 docs/battle-v3.md
// 对外：window.POSHI = { banner(u), seal(size), draw() }；加载后 BUI.breakBanner = POSHI.banner
//  · banner(u)：约 1.15s 的系统演出（T3 档，走真实时间，与 C 的 250ms 时停/拉镜叠加）：
//      斜向刀光划屏 → 墨色横扫 + 宣纸飞白带展开 → 行草大字「破」砸入（放大回弹、墨点四溅、震屏）→ 朱印「势」盖章（轻震）→ 分阶淡出
//  · seal(size)：「破」字小朱印 canvas（size×size，同一 size 复用同一张画布；素材加载后原地重绘）
//  · draw()：由 bfx.js 的 drawBreakFlash 每帧调用（世界坐标内）：敌人破势期间头顶小印 + 屏幕层横幅
// 画法：横幅画进 320×180 低分辨率层（1 像素 = 画布 3×3，与角色/特效同像素尺度），最近邻放大；压暗在全分辨率。
// 素材：assets/fx_poshi_{po,band,seal,seal_s,ink}.webp（tools_fx/poshi_gen.py 生成，字体为 Google Fonts 开源毛笔字）
window.POSHI=(()=>{
  const Q=1.5,LW=W/Q,LH=H/Q;   // 与战斗精灵同像素尺度
  const FILES=['fx_poshi_po','fx_poshi_band','fx_poshi_seal','fx_poshi_seal_s','fx_poshi_ink'];
  const FONT='"Zhi Mang Xing","Ma Shan Zheng","ZCOOL XiaoWei","Noto Serif SC",serif';
  const im=k=>{const i=IMG[k];return ok(i)?i:null};
  const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c};
  const cl=v=>v<0?0:v>1?1:v;
  const eo=k=>1-(1-k)**3, ei=k=>k*k*k;
  const PAPER='#ece2c8',INKC='#0d0a09';
  const lay=mk(LW,LH),c=lay.getContext('2d');c.imageSmoothingEnabled=false;

  // ── 素材加载与派生（染色带、描边剪影、回退大字） ──
  const cache={};
  function tint(src,col){const o=mk(src.width,src.height),x=o.getContext('2d');x.drawImage(src,0,0);x.globalCompositeOperation='source-in';x.fillStyle=col;x.fillRect(0,0,o.width,o.height);return o}
  function outline(src,col){const o=mk(src.width+2,src.height+2),x=o.getContext('2d'),t=tint(src,col);
    for(const[dx,dy]of[[0,1],[2,1],[1,0],[1,2],[0,0],[2,0],[0,2],[2,2]])x.drawImage(t,dx,dy);x.drawImage(src,1,1);return o}
  function fbGlyph(ch,px,col){const o=mk(px,px),x=o.getContext('2d');x.fillStyle=col;x.textAlign='center';x.textBaseline='middle';x.font=`${Math.round(px*.9)}px ${FONT}`;x.fillText(ch,px/2,px*.52);return o}
  function get(k){if(cache[k])return cache[k];let r=null;
    if(k==='po'){const s=im('fx_poshi_po');r=s?outline(s,'#d9ccae'):outline(fbGlyph('破',112,'#141010'),PAPER);if(!s)return r}
    else if(k==='band'){const s=im('fx_poshi_band');if(!s)return null;r=tint(s,PAPER)}
    else if(k==='bandInk'){const s=im('fx_poshi_band');if(!s)return null;r=tint(s,INKC)}
    else if(k==='inkR'){const s=im('fx_poshi_ink');if(!s)return null;r=tint(s,'#9a1e16')}
    else if(k==='seal'){const s=im('fx_poshi_seal');if(s)r=outline(s,'#1a0806');else{const o=mk(40,40),x=o.getContext('2d');x.fillStyle='#c4261c';x.fillRect(2,2,36,36);x.drawImage(fbGlyph('势',34,'#ffecd6'),3,3);return o}}
    return cache[k]=r}
  let loaded=0;
  if(typeof loadOpt==='function')FILES.forEach(f=>{if(!im(f))loadOpt(f,f).then(okk=>{if(okk){loaded++;for(const k in cache)delete cache[k];redrawSeals()}})});

  // ── 小印 seal(size) ──
  const seals={};
  function paintSeal(cv){const s=cv.width,x=cv.getContext('2d');x.clearRect(0,0,s,s);const src=im('fx_poshi_seal_s');
    if(src){x.imageSmoothingEnabled=s<src.width;x.drawImage(src,0,0,s,s);return}
    const r=Math.max(1,s/16|0);x.fillStyle='#8a1a14';x.fillRect(0,0,s,s);x.fillStyle='#c4261c';x.fillRect(r,r,s-2*r,s-2*r);
    x.fillStyle='#ffecd6';x.textAlign='center';x.textBaseline='middle';x.font=`bold ${Math.round(s*.72)}px ${FONT}`;x.fillText('破',s/2,s*.54)}
  function seal(size){size=Math.max(4,Math.round(size||32));let cv=seals[size];if(!cv){cv=seals[size]=mk(size,size);paintSeal(cv)}return cv}
  function redrawSeals(){for(const k in seals)paintSeal(seals[k])}

  // ── 破势提示（参照《八方旅人》BREAK：局部、贴在被破敌人身上、约一个身位宽，不做全屏压暗/横幅） ──
  // 时序：0 局部刀光划过敌人 → 40ms「破」由 1.5× 砸入并闪白 → 130ms 回弹定住 → 190ms 朱印「势」盖在右下 → 停留 → 880ms 起 4 档淡出 → 1150ms 结束
  const DUR=1150,T_POP=40,T_SET=130,T_SEAL=190,T_OUT=880;
  const active=[];
  const hs=(i,s=1)=>{const v=Math.sin(i*127.1+s*311.7)*43758.5453;return v-Math.floor(v)};
  // 素材按目标美术像素尺寸缩小：先平滑缩小，再把 alpha 二值化，保持像素硬边（缓存）
  const small={};
  function shrink(key,art){const k=key+'@'+art;if(small[k])return small[k];const src=get(key);if(!src)return null;
    const cv=mk(art,Math.round(art*src.height/src.width)),x=cv.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(src,0,0,cv.width,cv.height);
    const d=x.getImageData(0,0,cv.width,cv.height),a=d.data;for(let i=0;i<a.length;i+=4){if(a[i+3]<110)a[i+3]=0;else{a[i+3]=255}}x.putImageData(d,0,0);return small[k]=cv}
  function banner(u){if(typeof B==='undefined'||!B||!u)return;const t=performance.now();u._psT=t+DUR-120;
    for(let i=active.length-1;i>=0;i--)if(active[i].u===u)active.splice(i,1);
    active.push({B,u,t0:t,seed:Math.random()*1e4|0,shk:0});try{bsfx('whoosh',.8,1.4)}catch(e){}}
  function px(x,y,col){g.fillStyle=col;g.fillRect(Math.round(x/Q)*Q,Math.round(y/Q)*Q,Q,Q)}
  function drawOne(S,t){const e=t-S.t0,u=S.u;if(e>=DUR||S.B!==B)return false;
    const h=unitH(u),cx=u.x+(u.ox||0),top=u.y+(u.oy||0)-h;
    const size=Math.max(54,Math.min(96,h*.34));                         // 字高（画布像素），约与身宽相当
    const cy=Math.max(78+size/2,top+h*.42);                              // 贴在敌人上半身，避开顶部顺序条
    const fo=e<T_OUT?1:Math.ceil((1-cl((e-T_OUT)/(DUR-T_OUT)))*4)/4;
    if(e>=T_POP&&!S.shk){S.shk=1;B.shake=Math.max(B.shake||0,5);try{bsfx('advance',.9,.5)}catch(er){}}
    g.save();g.imageSmoothingEnabled=false;
    // 局部刀光：斜向划过敌人（约 1.4 个身宽），100ms 划出、再 140ms 收尾
    if(e<240){const L=Math.max(90,size*1.6),ang=-.42,dx=Math.cos(ang),dy=Math.sin(ang),head=eo(cl(e/100))*2*L,tail=e<100?0:Math.min(head,(e-100)/140*2*L);
      for(let s2=tail;s2<=head;s2+=Q){const x=cx-dx*L+dx*s2,y=cy+6-dy*L+dy*s2,f=(s2-tail)/Math.max(1,head-tail),w=Math.max(1,Math.round(2*Math.sin(Math.PI*Math.min(1,f*1.05))));
        for(let j=-w;j<=w;j++)px(x,y+j*Q,Math.abs(j)===w?'#ffb448':'#fff4c8')}}
    // 「破」砸入：1.5× → 1.0，闪白，回弹
    if(e>=T_POP){const art=Math.round(size/Q),po=shrink('po',art);
      if(po){let sc;const k=(e-T_POP)/(T_SET-T_POP);if(k<1)sc=1.5-.5*ei(cl(k));else{const q=e-T_SET;sc=q<70?1+.07*Math.sin(q/70*Math.PI):1}
        const w=Math.round(po.width*Q*sc),hh=Math.round(po.height*Q*sc),x=Math.round(cx-w/2-size*.12),y=Math.round(cy-hh/2);
        g.globalAlpha=fo;g.fillStyle='rgba(10,4,2,.5)';g.drawImage(po,x+Q,y+Q,w,hh);   // 投影
        g.drawImage(po,x,y,w,hh);
        if(e<T_POP+70){g.globalCompositeOperation='lighter';g.globalAlpha=fo*(1-(e-T_POP)/70);g.drawImage(po,x,y,w,hh);g.drawImage(po,x,y,w,hh);g.globalCompositeOperation='source-over'}
        g.globalAlpha=1;
        // 少量墨点（6 粒），随字淡出
        if(e>=T_POP){for(let i=0;i<6;i++){const a2=hs(i,S.seed)*6.28,d=size*(.45+.35*hs(i,S.seed+1))*eo(cl((e-T_POP)/150)),x2=cx+Math.cos(a2)*d*1.2,y2=cy+Math.sin(a2)*d*.7;
          if(fo>=.5||i%2===0){px(x2,y2,i===1?'#b0241a':'#1a0e08');if(i%3===0)px(x2+Q,y2,'#1a0e08')}}}}}
    // 朱印「势」：右下角盖章 1.4× → 1.0
    if(e>=T_SEAL){const q=e-T_SEAL,art=Math.round(size*.5/Q),sl=shrink('seal',art);
      if(sl){const sc=q<70?1.4-.4*ei(q/70):1,w=Math.round(sl.width*Q*sc),hh=Math.round(sl.height*Q*sc),x=Math.round(cx+size*.3-w/2),y=Math.round(cy+size*.32-hh/2);
        g.globalAlpha=fo*(q<70?.6+q/175:1);g.drawImage(sl,x,y,w,hh);g.globalAlpha=1}}
    g.restore();return true}

  // ── 每帧（bfx.js drawBreakFlash 内调用，处于镜头变换中：世界坐标） ──
  function drawSeals(t){for(const u of B.foes){if(!u.broken||u.hp<=0||u._gone)continue;const st=u._psT||0;if(t<st)continue;const q=t-st;
      const h=unitH(u),S0=24,s=seal(S0),sc=q<110?1.6-.6*ei(q/110):1,bob=((t/400|0)%2)*2,x=u.x+(u.ox||0),y=Math.max(76,u.y+(u.oy||0)-h-22)+bob,w=Math.round(S0*sc);
      g.save();g.imageSmoothingEnabled=false;g.globalAlpha=q<110?.6+q/275:1;g.fillStyle='rgba(8,4,2,.55)';g.fillRect(Math.round(x-w/2)+2,Math.round(y-w/2)+2,w,w);g.drawImage(s,Math.round(x-w/2),Math.round(y-w/2),w,w);g.restore()}}
  function draw(){if(typeof B==='undefined'||!B)return;const t=performance.now();
    try{drawSeals(t)}catch(e){console.error(e)}
    for(let i=active.length-1;i>=0;i--){let alive=false;try{alive=drawOne(active[i],t)}catch(e){console.error(e)}if(!alive)active.splice(i,1)}}

  return{banner,seal,draw,get loaded(){return loaded}}})();
window.BUI=window.BUI||{};
BUI.breakBanner=POSHI.banner;
