'use strict';
// ───────────────────────── 战斗 UI · 武侠化（v3 工作流 G，见 docs/battle-v3.md；v2 工作流 B 的像素版在其上改造）─────────────────────────
// 覆盖 battle.js 的 UI 层：battleCSS battleDom renderCards porFill hint tyTag pips allyTurn drawOrderBar headChip
//   drawShieldRow drawUnitUI drawIntentLines ghostTick syncCardGhost floatTxt bpop bigText showName drawFloats drawBanner drawBig victory
// 规则与数值逻辑与原函数一致，只改表现：
//  · 视觉语言：墨迹横扫（飞白）、宣纸、圆相（头像圈）、朱红印章、铜钱（蓄势）、毛笔线（气血朱红 / 内力墨青）、悬挂令牌（行动顺序）
//    全部在离屏 canvas 上程序化生成（值噪声模拟笔毛与飞白）并按尺寸/参数缓存，不逐帧重画；DOM 端以 dataURL 使用
//  · 字体：动态注入 Google Fonts「Ma Shan Zheng / Zhi Mang Xing / Liu Jian Mao Cao」，加载前回退 ZCOOL XiaoWei / Noto Serif；
//    画布文字的缓存键含字体代数，字体到位后自动重绘
//  · 头像：立绘裁脸平滑缩小（2× 分辨率，imageSmoothingQuality high）；男女主按状态用表情差分（porKey）；无立绘用战斗精灵头部
//  · 敌人：平时只有「护盾数字小印 + 一排小圆点」（已知弱点彩色、未知灰）；被选为目标 / 悬停时展开弱点字徽与血线；意图为小墨点字徽
//  · 两套主题：BUI.theme='ink'（墨迹题签：指令为一叠墨迹签条）| 'scroll'（卷轴木牌：指令为竖排卷轴展开）；也可 ?uitheme=scroll
// 对外：window.BUI = { theme, setTheme(t), breakBanner(u), weakIcon(t), icon(name,sz), img(name,sz), text(str,col,size), seal(txt,w,h,o),
//        blot(ch,col,sz,o), coin(state,sz), swash(w,h,o), face(u,sz), fontGen() }
//   breakBanner：破势大横幅由 F（POSHI.banner）实现并接管；本文件仅保留转发与无 POSHI 时的简易回退
window.BUI=(function(){
  const PR=2;   // 生成素材的像素密度（DOM 被整体缩放约 1.3×，2× 保证清晰）
  const hex=c=>{c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');return[0,2,4].map(i=>parseInt(c.slice(i,i+2),16))};
  const mix=(a,b,t)=>{const A=hex(a),C=hex(b);return'#'+A.map((v,i)=>Math.round(v+(C[i]-v)*t).toString(16).padStart(2,'0')).join('')};
  const lt=(c,t=.45)=>mix(c,'#ffffff',t),dk=(c,t=.45)=>mix(c,'#000000',t);
  const lum=c=>{const[r,g,b]=hex(c);return(r*.299+g*.587+b*.114)/255};
  const mkc=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c};
  const cl=(v,a=0,b=1)=>v<a?a:v>b?b:v,sm=(a,b,x)=>{const t=cl((x-a)/(b-a));return t*t*(3-2*t)};
  const FB='"Ma Shan Zheng","ZCOOL XiaoWei","Noto Serif SC",serif',FC='"Zhi Mang Xing","Ma Shan Zheng","ZCOOL XiaoWei",serif',FS='"Noto Serif SC","Songti SC",serif';
  const INK='#0d0806',PAPER='#eadcbc',CINNABAR='#b3261e';

  // ── 主题 ──
  let theme='ink';
  try{const q=(location.search.match(/[?&]uitheme=(ink|scroll)/)||[])[1];theme=q||localStorage.getItem('bui.theme')||'ink'}catch(e){}
  if(theme!=='ink'&&theme!=='scroll')theme='ink';

  // ── 毛笔字体：注入 + 按需加载字形（CJK 字体按 unicode-range 分片，画布用到的字要显式 load）──
  let fgen=0,linkOK=false;const seen=new Set();
  const PRELOAD='0123456789+-×~·？?!！第回合下一二三四五六七八九十攻击武学道具防御逃跑蓄势投入胜败脱身修为银两战利品境界突破层属性点继续击或按确定返回选择直选血内气力定神眩晕中毒倒破弱点看护盾恢复闪全体敌人同伴预计需装备不足群招煞小江湖失去行动攻防提升';
  function injectFonts(){if(document.getElementById('bui-fonts'))return;const l=document.createElement('link');l.id='bui-fonts';l.rel='stylesheet';
    l.href='https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&family=Zhi+Mang+Xing&family=Liu+Jian+Mao+Cao&display=swap';
    l.onload=()=>{linkOK=true;PRELOAD.split('').forEach(c=>seen.add(c));loadGlyphs([...seen].join(''))};document.head.appendChild(l)}
  function loadGlyphs(txt){if(!txt||!document.fonts||!document.fonts.load)return;
    Promise.all([document.fonts.load('20px "Ma Shan Zheng"',txt),document.fonts.load('20px "Zhi Mang Xing"',txt)])
      .then(r=>{if(r.some(a=>a&&a.length)){fgen++;for(const k of[...cache.keys()])if(k.includes('§'))cache.delete(k)}}).catch(()=>{})}
  function glyphs(s){s=String(s);let nw='';for(const ch of s)if(!seen.has(ch)){seen.add(ch);nw+=ch}if(nw&&linkOK)loadGlyphs(nw)}
  const fontKey=()=>'§'+fgen;

  // ── 缓存 ──
  const cache=new Map();let nText=0;
  function memo(k,f){let v=cache.get(k);if(!v){v=f();cache.set(k,v)}return v}
  const url=c=>c._u||(c._u=c.toDataURL());
  const tag=(c,cls='',style='')=>`<img class="bi ${cls}" src="${url(c)}" width="${c.lw}" height="${c.lh}" style="${style}" alt="">`;
  function canvasL(w,h,pr=PR){const c=mkc(w*pr,h*pr);c.lw=w;c.lh=h;c.pr=pr;return c}

  // ── 值噪声 ──
  function hs(x,y,s){let h=(x*374761393+y*668265263+s*1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967295}
  function vn(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
    const a=hs(xi,yi,s),b=hs(xi+1,yi,s),c=hs(xi,yi+1,s),d=hs(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
  const fbm=(x,y,s)=>vn(x,y,s)*.6+vn(x*2.1,y*2.1,s+7)*.28+vn(x*4.3,y*4.3,s+13)*.12;
  const strSeed=s=>{let h=7;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))%100003;return h};

  // 笔毛模型：沿笔方向坐标 s、横向 n（离中线）、进度 t、半宽 hw → 墨量 0..1（边缘参差、收笔与边缘飞白）
  function inkA(s,n,t,hw,S,dry,len){const v=Math.abs(n)/hw;
    let e=1+(fbm(s*.25,n*.25,S+3)-.5)*.34;if(t>.6)e+=(vn(s*.03,n*.5,S+9)-.5)*.9*(t-.6);
    if(v>=e)return 0;let a=Math.min(1,(e-v)*hw/1.1);
    const st=.6*vn(s*.02/len,n*.7,S+11)+.4*vn(s*.065/len,n*1.5,S+17);
    const dz=dry*(sm(.35,1,t)*1.1+sm(.45,1.05,v)*.65);
    a*=cl((st-dz*.9)*9+.15);return a*(.78+.22*vn(s*.05,n*.12,S+5))}
  // 墨迹横扫：w×h（逻辑像素）。o:{seed,col,a,dry,head,tail,tip,thick,wave,tilt,len,rev(起笔在右),pr}
  function swash(w,h,o={}){w=Math.round(w);h=Math.round(h);return memo('sw|'+w+'|'+h+'|'+JSON.stringify(o),()=>{
    const pr=o.pr||PR,S=o.seed||1,col=hex(o.col||INK),A=o.a??.92,dry=o.dry??.45,head=o.head??.07,tail=o.tail??.4,thick=o.thick??.84,wave=o.wave??.08,len=o.len||1,rev=!!o.rev;
    const c=canvasL(w,h,pr),X=c.getContext('2d'),PW=c.width,PH=c.height,id=X.createImageData(PW,PH),d=id.data,cy=new Float32Array(PW),hw=new Float32Array(PW);
    for(let i=0;i<PW;i++){let t=i/(PW-1);if(rev)t=1-t;let p;
      if(t<head){const q=t/head;p=.35+.65*Math.sqrt(1-(1-q)*(1-q))}else if(t>1-tail){const q=(t-1+tail)/tail;p=1-q*q*(o.tip??.7)}else p=1;
      p*=1+(vn(t*5,.5,S)-.5)*.22;hw[i]=Math.max(.5,h*thick/2*p);cy[i]=h/2+(vn(t*2.2,4.5,S)-.5)*2*h*wave+(o.tilt||0)*h*(t-.5)}
    for(let y=0;y<PH;y++){const ly=(y+.5)/pr;for(let i=0;i<PW;i++){let t=i/(PW-1);if(rev)t=1-t;const a=inkA(i/pr,ly-cy[i],t,hw[i],S,dry,len);if(a<=.004)continue;
      const p=(y*PW+i)*4;d[p]=col[0];d[p+1]=col[1];d[p+2]=col[2];d[p+3]=255*A*a}}
    X.putImageData(id,0,0);
    // 纸色晕边：先铺一层略宽的淡色笔触（暗背景上显出墨迹轮廓与飞白丝缕）
    if(o.halo){const hl=swash(w,h,{...o,halo:0,seed:S+100,col:o.halo,a:o.haloA??.3,thick:Math.min(.99,thick+.14),dry:dry+.15,tail:Math.min(.6,tail+.06),pr});
      const c2=canvasL(w,h,pr),X2=c2.getContext('2d');X2.drawImage(hl,0,0);X2.drawImage(c,0,0);return c2}
    return c})}
  // 圆相（头像圈）：sz 直径，o:{seed,col,th,a0,span,dry}
  function enso(sz,o={}){return memo('en|'+sz+'|'+JSON.stringify(o),()=>{const c=canvasL(sz,sz),X=c.getContext('2d'),P=c.width,id=X.createImageData(P,P),d=id.data;
    const S=o.seed||3,col=hex(o.col||PAPER),th=o.th||sz*.085,R=sz/2-th*.75,a0=o.a0??-2.2,span=o.span??5.85,dry=o.dry??.5,A=o.a??1;
    for(let y=0;y<P;y++)for(let i=0;i<P;i++){const dx=(i+.5)/PR-sz/2,dy=(y+.5)/PR-sz/2,r=Math.hypot(dx,dy);let th0=Math.atan2(dy,dx)-a0;th0=((th0%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
      const t=th0/span;if(t>1)continue;const hw=th/2*(t<.06?.45+.55*t/.06:t>.55?1-(t-.55)/.45*.72:1);const a=inkA(t*span*R,r-R-(t>.8?(t-.8)*th*.8:0),t,hw,S,dry,1);if(a<=.004)continue;
      const p=(y*P+i)*4;d[p]=col[0];d[p+1]=col[1];d[p+2]=col[2];d[p+3]=255*A*a}
    X.putImageData(id,0,0);return c})}
  // 宣纸：o:{seed,col,pr,edge}
  function paper(w,h,o={}){w=Math.round(w);h=Math.round(h);return memo('pa|'+w+'|'+h+'|'+JSON.stringify(o),()=>{const pr=o.pr||PR,c=canvasL(w,h,pr),X=c.getContext('2d'),PW=c.width,PH=c.height,id=X.createImageData(PW,PH),d=id.data;
    const S=o.seed||7,[r0,g0,b0]=hex(o.col||'#e8dab8'),E=o.edge??12;
    for(let y=0;y<PH;y++)for(let i=0;i<PW;i++){const lx=i/pr,ly=y/pr,n=fbm(lx*.035,ly*.035,S),f=vn(lx*.8,ly*.07,S+2)*.5+vn(lx*.09,ly*1.1,S+4)*.5,e=Math.min(lx,w-lx,ly,h-ly);
      const v=(n-.5)*26+(f-.5)*12-(e<E?(E-e)*(E-e)/E*1.4:0)-(hs(i,y,S)>.985?18:0),p=(y*PW+i)*4;d[p]=cl(r0+v,0,255);d[p+1]=cl(g0+v*.95,0,255);d[p+2]=cl(b0+v*.8,0,255);d[p+3]=255}
    X.putImageData(id,0,0);return c})}
  // 卷轴木轴：水平 w×h（两端铜钮）
  function rod(w,h){return memo('ro|'+w+'|'+h,()=>{const c=canvasL(w,h),X=c.getContext('2d');X.scale(PR,PR);const kw=Math.round(h*1.2);
    let gr=X.createLinearGradient(0,0,0,h);[['0','#24140a'],['.3','#6e4220'],['.45','#a8703a'],['.6','#6a3e1c'],['1','#1a0e06']].forEach(([a,b])=>gr.addColorStop(+a,b));
    X.fillStyle=gr;X.fillRect(kw*.7,h*.12,w-kw*1.4,h*.76);
    gr=X.createLinearGradient(0,0,0,h);[['0','#3a260c'],['.35','#e6c67e'],['.55','#b08a40'],['1','#3a2408']].forEach(([a,b])=>gr.addColorStop(+a,b));X.fillStyle=gr;
    for(const x0 of[0,w-kw]){X.beginPath();X.roundRect?X.roundRect(x0,0,kw,h,h*.35):X.rect(x0,0,kw,h);X.fill()}
    X.fillStyle='rgba(0,0,0,.35)';X.fillRect(kw,h*.12,1,h*.76);X.fillRect(w-kw-1,h*.12,1,h*.76);return c})}
  // 印章：txt 1~3 字，w×h；o:{col,ink,seed,frame(阳文边框)}
  function seal(t,w,h=w,o={}){t=String(t);glyphs(t);return memo('se|'+t+'|'+w+'|'+h+'|'+JSON.stringify(o)+fontKey(),()=>{
    const c=canvasL(w,h),X=c.getContext('2d');X.scale(PR,PR);const col=o.col||CINNABAR,S=o.seed||strSeed(t);
    X.fillStyle=col;X.beginPath();const j=(k)=>(hs(k,S,3)-.5)*Math.min(w,h)*.06;
    X.moveTo(.6+j(1),.6+j(2));X.lineTo(w-.6+j(3),.6+j(4));X.lineTo(w-.6+j(5),h-.6+j(6));X.lineTo(.6+j(7),h-.6+j(8));X.closePath();X.fill();
    const ch=[...t],vert=h>w*1.25,n=ch.length,fs=vert?Math.min(w*.8,(h-3)/n*.98):n>1?Math.min(h*.62,(w-3)/Math.ceil(n/2)*.95):Math.min(w,h)*.8;
    X.fillStyle=o.ink||'#f7ecd6';X.font=`${fs}px ${FB}`;X.textAlign='center';X.textBaseline='middle';
    if(vert)ch.forEach((q,i)=>X.fillText(q,w/2,h/2+(i-(n-1)/2)*fs*.98+fs*.04));
    else if(n===1)X.fillText(ch[0],w/2,h/2+fs*.05);
    else if(n===2&&w<h*1.25){X.font=`${Math.min(w*.52,h*.5)}px ${FB}`;const f2=Math.min(w*.52,h*.5);X.fillText(ch[0],w/2,h/2-f2*.47);X.fillText(ch[1],w/2,h/2+f2*.53)}
    else ch.forEach((q,i)=>X.fillText(q,w/2+(i-(n-1)/2)*fs*.98,h/2+fs*.05));
    if(o.frame){X.strokeStyle=o.ink||'#f7ecd6';X.lineWidth=Math.max(.8,Math.min(w,h)*.05);X.strokeRect(Math.min(w,h)*.1,Math.min(w,h)*.1,w-Math.min(w,h)*.2,h-Math.min(w,h)*.2)}
    // 印泥斑驳：边缘缺口 + 点状剥落
    const id=X.getImageData(0,0,c.width,c.height),d=id.data;
    for(let y=0;y<c.height;y++)for(let i=0;i<c.width;i++){const p=(y*c.width+i)*4+3;if(!d[p])continue;const e=Math.min(i,y,c.width-1-i,c.height-1-y)/PR;
      const n=vn(i*.45/PR*2,y*.45/PR*2,S);if((e<1.4&&n>.62)||vn(i*.9,y*.9,S+5)>.86)d[p]=d[p]*.25}
    X.putImageData(id,0,0);return c})}
  // 墨点字徽（弱点 / 兵刃 / 指令）：ch 字，col 底色，sz 直径；o:{fg,dim,ring}
  function blot(ch,col,sz,o={}){ch=String(ch);glyphs(ch);return memo('bl|'+ch+'|'+col+'|'+sz+'|'+JSON.stringify(o)+fontKey(),()=>{
    const c=canvasL(sz,sz),X=c.getContext('2d');X.scale(PR,PR);const S=strSeed(ch+col),r=sz/2-.8,cx=sz/2,cy=sz/2;
    X.beginPath();for(let k=0;k<=36;k++){const a=k/36*Math.PI*2,rr=r*(1+(vn(a*1.3,S%97,S)-.5)*.14);k?X.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr):X.moveTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}X.closePath();
    const gr=X.createRadialGradient(cx-r*.3,cy-r*.3,r*.1,cx,cy,r);gr.addColorStop(0,lt(col,.18));gr.addColorStop(.7,col);gr.addColorStop(1,dk(col,.3));X.fillStyle=gr;X.fill();
    X.lineWidth=Math.max(.8,sz*.05);X.strokeStyle=o.ring||'rgba(12,7,4,.85)';X.stroke();
    if(ch){X.fillStyle=o.fg||(lum(col)>.5?'#1a0f08':'#f6ead2');X.font=`${sz*.68}px ${FB}`;X.textAlign='center';X.textBaseline='middle';X.fillText(ch,cx,cy+sz*.05)}
    if(o.dim){X.globalCompositeOperation='source-atop';X.fillStyle='rgba(40,34,28,.6)';X.fillRect(0,0,sz,sz)}
    return c})}
  // 铜钱（蓄势）：state off|on|use
  function coin(st,sz){return memo('co|'+st+'|'+sz,()=>{const c=canvasL(sz,sz),X=c.getContext('2d');X.scale(PR,PR);const R=sz/2-.6,cx=sz/2,cy=sz/2;
    const P={off:['#3b2e22','#231a12','#5c4a36'],on:['#e6b060','#9a6020','#ffe0a0'],use:['#fff4c0','#f0b030','#ffffff']}[st]||[];
    const gr=X.createRadialGradient(cx-R*.35,cy-R*.4,R*.1,cx,cy,R);gr.addColorStop(0,P[0]);gr.addColorStop(1,P[1]);
    X.beginPath();X.arc(cx,cy,R,0,7);X.fillStyle=gr;X.fill();X.lineWidth=Math.max(.8,sz*.07);X.strokeStyle=st==='off'?'#120c08':'#3a200a';X.stroke();
    X.beginPath();X.arc(cx,cy,R*.74,0,7);X.lineWidth=Math.max(.5,sz*.04);X.strokeStyle=st==='off'?'rgba(0,0,0,.4)':'rgba(80,40,6,.55)';X.stroke();
    const q=R*.36;X.fillStyle=st==='off'?'#0d0906':'#2a1606';X.fillRect(cx-q,cy-q,q*2,q*2);X.strokeStyle=P[2];X.lineWidth=Math.max(.5,sz*.04);X.strokeRect(cx-q-.4,cy-q-.4,q*2+.8,q*2+.8);
    if(st!=='off'){X.fillStyle='rgba(60,30,4,.6)';for(const[a,b]of[[0,-1],[1,0],[0,1],[-1,0]])X.fillRect(cx+a*R*.56-.6,cy+b*R*.56-.6,1.2,1.2)}
    return c})}
  // 小箭头（笔触三角）：dir d|r|l
  function pointer(col,sz,dir='d'){return memo('pt|'+col+'|'+sz+'|'+dir,()=>{const c=canvasL(sz,sz),X=c.getContext('2d');X.scale(PR,PR);X.translate(sz/2,sz/2);X.rotate({d:0,r:-Math.PI/2,l:Math.PI/2}[dir]);
    X.beginPath();X.moveTo(-sz*.42,-sz*.34);X.quadraticCurveTo(0,-sz*.2,sz*.42,-sz*.36);X.quadraticCurveTo(sz*.1,0,0,sz*.42);X.quadraticCurveTo(-sz*.12,0,-sz*.42,-sz*.34);X.closePath();
    X.fillStyle=col;X.fill();X.lineWidth=1.2;X.strokeStyle='rgba(10,6,4,.9)';X.stroke();return c})}

  // ── 立绘裁脸（平滑缩小）──
  const FACE={hero:[.61,.2],hero_hurt:[.62,.2],hero_smile:[.6,.195],suzhi:[.53,.2],suzhi_shy:[.53,.2],bandit:[.56,.155],chief:[.55,.17],lady:[.58,.16],monk:[.52,.14],
    beggar:[.58,.18],soldier:[.52,.18],boatman:[.57,.12],oldman:[.56,.15],smith:[.52,.17],gossip:[.47,.19]};
  const autoFace=new Map();
  function faceBox(k,im){if(FACE[k])return FACE[k];if(autoFace.has(k))return autoFace.get(k);let r=FACE[k.split('_')[0]]||[.55,.17];
    try{const w=48,h=Math.round(48*im.naturalHeight/im.naturalWidth),c=mkc(w,h),x=c.getContext('2d');x.drawImage(im,0,0,w,h);const d=x.getImageData(0,0,w,Math.round(h*.4)).data;
      let sx=0,sy=0,n=0,y0=-1;for(let y=0;y<Math.round(h*.4);y++)for(let i=0;i<w;i++){const p=(y*w+i)*4,R=d[p],G=d[p+1],Bb=d[p+2],A=d[p+3];
        if(A>200&&R>150&&R>G+8&&G>Bb+5&&R-Bb>35){if(y0<0)y0=y;if(y<y0+h*.17){sx+=i;sy+=y;n++}}}
      if(n>12)r=[sx/n/w,Math.min(.3,sy/n/h+.01)]}catch(e){}
    autoFace.set(k,r);return r}
  // 战斗精灵头部（BART 第 0 帧不透明包围盒）
  const sprBox=new Map();
  function spriteHead(u){const A=window.BART&&BART[u.art];if(A&&A.file&&A.cell&&ok(IMG[A.file])){const im=IMG[A.file],[cw,ch]=A.cell;
      let bb=sprBox.get(u.art);if(!bb){bb=[0,0,cw,ch];try{const c=mkc(cw,ch),x=c.getContext('2d');x.drawImage(im,0,0,cw,ch,0,0,cw,ch);const d=x.getImageData(0,0,cw,ch).data;let x0=cw,x1=0,y0=ch,y1=0;
          for(let y=0;y<ch;y++)for(let i=0;i<cw;i++)if(d[(y*cw+i)*4+3]>60){if(i<x0)x0=i;if(i>x1)x1=i;if(y<y0)y0=y;if(y>y1)y1=y}
          if(x1>x0){let hx=0,hn=0;const hh=(y1-y0)*.14;for(let y=y0;y<y0+hh;y++)for(let i=x0;i<=x1;i++)if(d[(y*cw+i)*4+3]>60){hx+=i;hn++}
            const left=(A.facing||'r')==='l',ew=(x1-x0)*.22;let ty=-1;for(let y=y0;y<=y1&&ty<0;y++)for(let i=Math.round(left?x0:x1-ew);i<=(left?x0+ew:x1);i++)if(d[(y*cw+i)*4+3]>60){ty=y;break}
            bb=[x0,y0,x1,y1,hn?hx/hn:(x0+x1)/2,ty<0?y0:ty]}}catch(e){}sprBox.set(u.art,bb)}
      const[x0,y0,x1,y1,hx]=bb,H0=y1-y0,beast=/dog|wolf|snake|rooster/.test(u.art);
      if(beast){const s=Math.min(H0*.7,x1-x0),left=(A.facing||'r')==='l',hy=bb[5];return{src:im,crop:[left?x0-s*.04:x1-s*.96,hy-s*.12,s,s],key:'B|'+u.art}}
      const s=H0*.3;return{src:im,crop:[hx-s/2,y0-s*.12,s,s],key:'B|'+u.art}}
    const im=IMG[`c_${u.art}_d_0`]||IMG[`c_${u.art}_d`]||IMG[`c_${u.art}_${u.side==='foe'?'r':'l'}_0`];if(!ok(im))return null;
    const iw=im.naturalWidth,ih=im.naturalHeight,beast=/dog|wolf|snake|rooster/.test(u.art),cs=Math.min(iw,ih*.55)*(beast?1:.62);return{src:im,crop:[(iw-cs)/2,beast?ih*.2:ih*.02,cs,cs],key:'S|'+u.art}}
  function faceSrc(u){const pk=u.side==='ally'?porKey(u):(ok(IMG['p_'+u.art])?u.art:null);
    if(pk&&ok(IMG['p_'+pk])){const im=IMG['p_'+pk],[cx,cy]=faceBox(pk,im),s=im.naturalHeight*.235;return{src:im,crop:[cx*im.naturalWidth-s/2,cy*im.naturalHeight-s/2,s,s],key:'F|'+pk}}
    return spriteHead(u)}
  const faceKey=u=>{const f=faceSrc(u);return f?f.key:'-'+u.name};
  function face(u,sz){const f=faceSrc(u);if(!f)return null;return memo(f.key+'|'+sz,()=>{const c=canvasL(sz,sz),X=c.getContext('2d');
    X.imageSmoothingEnabled=f.key[0]==='F'||f.crop[2]>=c.width*.9;X.imageSmoothingQuality='high';X.fillStyle=f.key[0]==='F'?'#efe4cc':'#2a211a';X.fillRect(0,0,c.width,c.height);X.drawImage(f.src,...f.crop,0,0,c.width,c.height);return c})}

  // ── 画布文字（毛笔字 + 墨边）──
  function text(s,col='#f3e6c8',size=28,o={}){s=String(s);glyphs(s);const key='tx|'+s+'|'+col+'|'+size+'|'+JSON.stringify(o)+fontKey();let c=cache.get(key);if(c)return c;
    if(++nText>400){for(const k of[...cache.keys()])if(k.startsWith('tx|'))cache.delete(k);nText=0}
    const font=`${size}px ${o.font||FB}`,m=mkc(4,4).getContext('2d');m.font=font;const tw=Math.ceil(m.measureText(s).width),ow=Math.max(3,size*.16),pad=Math.ceil(ow+4);
    c=canvasL(tw+pad*2,Math.ceil(size*1.3)+pad*2);const X=c.getContext('2d');X.scale(PR,PR);X.font=font;X.textAlign='center';X.textBaseline='middle';X.lineJoin='round';
    const cx=c.lw/2,cy=c.lh/2+size*.04;X.fillStyle='rgba(8,4,2,.55)';X.fillText(s,cx+size*.05,cy+size*.08);X.lineWidth=ow;X.strokeStyle=o.edge||'#140905';X.strokeText(s,cx,cy);
    if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(col)){const gr=X.createLinearGradient(0,cy-size*.5,0,cy+size*.5);gr.addColorStop(0,lt(col,.35));gr.addColorStop(.55,col);gr.addColorStop(1,dk(col,.18));X.fillStyle=gr}else X.fillStyle=col;X.fillText(s,cx,cy);
    cache.set(key,c);return c}
  const draw=(G,c,x,y,a)=>{if(!c)return;if(a!=null){const o=G.globalAlpha;G.globalAlpha=o*a;G.drawImage(c,x,y,c.lw,c.lh);G.globalAlpha=o}else G.drawImage(c,x,y,c.lw,c.lh)};

  // ── 兵刃/内劲/指令 字徽 ──
  const GL={刀:'刀',剑:'剑',拳:'拳',棍:'棍',暗器:'暗',阳:'阳',阴:'阴',毒:'毒',雷:'雷',医:'医',内:'内',武:'武',药:'药',守:'守',走:'走'};
  const GC={武:'#d9b36c',药:'#86c79a',守:'#8bb8e0',走:'#b8ae9e',医:'#6ccf8a',内:'#e8c070'};
  const colOf=t=>(typeof WCOL!=='undefined'&&WCOL[t])||GC[t]||'#b0a490';
  const icon=(name,sz=20,v='')=>name==='?'?blot('?','#5a524a',sz,{fg:'#d8ccb0',dim:v==='dim'}):blot(GL[name]||String(name)[0],colOf(name),sz,{dim:v==='dim'});
  const img=(name,sz=20,v='',cls='')=>tag(icon(name,sz,v),cls);

  // ── 破势横幅：转发 F（POSHI.banner）；无 POSHI 时用简易回退 ──
  function breakBanner(u){if(!B||!u)return;const P=window.POSHI;if(P&&typeof P.banner==='function'&&P.banner!==api.breakBanner){try{return P.banner(u)}catch(e){console.error(e)}}
    B.fx.push({x:u.x,y:u.y-unitH(u)*.5,t:'破势',c:'#ff7a3a',size:38,t0:performance.now(),life:1300,pop:1,u})}   // 无 POSHI 时仅弹出书法小字
  function poshiSeal(sz){const P=window.POSHI;if(P&&typeof P.seal==='function'){try{const s=P.seal(sz);if(s)return s}catch(e){}}return seal('破',sz,sz)}
  function drawAny(G,im,x,y,w,h){if(!im)return;if(im.lw)G.drawImage(im,x,y,w??im.lw,h??im.lh);else G.drawImage(im,x,y,w??(im.width||im.naturalWidth),h??(im.height||im.naturalHeight))}

  // ── 主题 ──
  function setTheme(t){if(t!=='ink'&&t!=='scroll')return;theme=t;try{localStorage.setItem('bui.theme',t)}catch(e){}
    const st=document.getElementById('battle-css');if(st)st.remove();if(document.getElementById('bt')){battleCSS();applyTheme()}
    const el=document.getElementById('bt-cards');if(el)el._n=-1;if(window.B&&B){renderCards();B.redraw&&B.redraw()}}
  function applyTheme(){const el=document.getElementById('bt');if(!el)return;el.classList.toggle('th-ink',theme==='ink');el.classList.toggle('th-scroll',theme==='scroll')}

  const api={dock:'left',PR,FB,FC,FS,INK,PAPER,CINNABAR,icon,img,tag,url,text,seal,blot,coin,swash,enso,paper,rod,pointer,face,faceKey,poshiSeal,drawAny,draw,breakBanner,
    weakIcon:t=>icon(typeof WTYPES!=='undefined'&&WTYPES.includes(t)?t:'?',20),lt,dk,mix,glyphs,injectFonts,setTheme,applyTheme,fontGen:()=>fgen,K:INK,memo,canvasL};
  Object.defineProperty(api,'theme',{get:()=>theme,set:setTheme,enumerable:true});
  return api;
})();

// ───────── 样式与 DOM ─────────
function battleCSS(){if($('battle-css'))return;const U=BUI;U.injectFonts();const st=document.createElement('style');st.id='battle-css';const u=c=>`url(${U.url(c)})`;
  // 预生成背景素材（dataURL，CSS 变量引用）
  const swCard=i=>U.swash(236,58,{seed:11+i*7,rev:1,halo:'#d8c49a',haloA:.34,a:.9,dry:.38,head:.1,tail:.5,tip:.55,thick:.8,wave:.06});
  const swCur=U.swash(250,60,{seed:5,rev:1,halo:'#f0c070',haloA:.5,a:.96,dry:.3,head:.1,tail:.45,tip:.5,thick:.86,wave:.05});
  const swTgt=U.swash(250,60,{seed:6,rev:1,halo:'#8fe0a8',haloA:.45,col:'#0e2a20',a:.94,dry:.32,head:.1,tail:.45,thick:.86,wave:.05});
  const swRow=i=>U.swash(200,30,{seed:31+i*5,rev:1,halo:'#d8c49a',haloA:.3,a:.86,dry:.42,head:.08,tail:.42,thick:.78,wave:.08});
  const swSel=U.swash(214,32,{seed:40,rev:1,halo:'#f0c070',haloA:.55,a:.97,dry:.3,head:.08,tail:.42,thick:.86,wave:.06});
  const swHd=U.swash(210,34,{seed:47,rev:1,halo:'#e07050',haloA:.35,col:'#2a0c08',a:.92,dry:.4,head:.08,tail:.5,thick:.82});
  const swHint=U.swash(420,34,{seed:52,halo:'#d8c49a',haloA:.3,a:.88,dry:.42,head:.05,tail:.22,thick:.9,wave:.05});
  const swRed=U.swash(190,30,{seed:61,rev:1,col:'#a8281a',a:.85,dry:.45,head:.06,tail:.45,thick:.8});
  const swLv=U.swash(320,34,{seed:66,col:'#9a2216',a:.9,dry:.4,head:.05,tail:.3,thick:.86});
  const papM=U.paper(220,300,{seed:3}),papH=U.paper(420,40,{seed:9,edge:6}),papW=U.paper(360,320,{seed:13}),rodH=U.rod(232,12),rodW=U.rod(392,16),rodS=U.rod(48,10);
  const ensoN=U.enso(60,{col:'#e3d3b0',seed:3}),ensoC=U.enso(60,{col:'#d8402a',seed:4,th:6}),ensoT=U.enso(60,{col:'#8fe0a8',seed:8,th:6});
  window.__buiCardSw=[0,1,2,3].map(i=>u(swCard(i)));window.__buiRowSw=[0,1,2,3,4].map(i=>u(swRow(i)));window.__buiEnso=[ensoN,ensoC,ensoT];
  const rodV=(()=>{const c=U.canvasL(12,52),X=c.getContext('2d');X.translate(c.width,0);X.rotate(Math.PI/2);X.drawImage(U.rod(52,12),0,0);return c})();
  st.textContent=`
#bt{position:absolute;left:0;top:0;width:960px;height:540px;transform-origin:0 0;pointer-events:none;font-family:var(--serif);color:var(--paper);
  --bb:${U.FB};--bc:${U.FC};--swcur:${u(swCur)};--swtgt:${u(swTgt)};--swsel:${u(swSel)};--swhd:${u(swHd)};--swhint:${u(swHint)};--swred:${u(swRed)};--swlv:${u(swLv)};
  --papm:${u(papM)};--paph:${u(papH)};--papw:${u(papW)};--rodh:${u(rodH)};--rodw:${u(rodW)};--rodv:${u(rodV)};--rods:${u(rodS)}}
#bt[hidden]{display:none}
#bt .frame,#bt-cmd,#bt-hint,#bt-win,.bt-card{pointer-events:auto}
#bt .bi{display:inline-block;vertical-align:middle;flex:none}
#bt .pxi{image-rendering:pixelated;display:inline-block;vertical-align:middle;flex:none}
/* ── 队伍面板：墨迹横扫 + 圆相头像 ── */
#bt-cards{position:absolute;right:2px;bottom:4px;width:252px;display:flex;flex-direction:column;gap:0}
.bt-card{position:relative;height:62px;cursor:pointer;transition:transform .24s cubic-bezier(.3,1.5,.5,1),filter .2s}
.bt-card::before{content:'';position:absolute;left:22px;right:0;top:3px;bottom:1px;background:var(--sw) right center/100% 100% no-repeat;opacity:.86;transition:opacity .2s,transform .25s;transform-origin:right center}
.bt-card.cur{transform:translateX(-20px)}
.bt-card.cur::before{background-image:var(--swcur);opacity:1;transform:scaleX(1.1)}
.bt-card.tgt::before{background-image:var(--swtgt);opacity:1;filter:drop-shadow(0 0 5px rgba(127,224,160,.55))}
.bt-card.dead{filter:grayscale(1) brightness(.62)}
.bt-card.hit{animation:bthit .28s ease-out}
@keyframes bthit{0%{translate:0 0}25%{translate:-4px 1px}50%{translate:3px -1px}75%{translate:-2px 0}100%{translate:0 0}}
.bt-card .fc{position:absolute;left:5px;top:5px;width:52px;height:52px;border-radius:50%;overflow:hidden;background:#e6dac0;box-shadow:0 0 0 1px rgba(0,0,0,.6),0 2px 6px rgba(0,0,0,.6)}
.bt-card .fc canvas{width:52px;height:52px;display:block}
.bt-card .rg{position:absolute;left:1px;top:1px;width:60px;height:60px;pointer-events:none}
.bt-card .rg img{position:absolute;left:0;top:0;width:60px;height:60px}
#bt .bt-card .rg .c,#bt .bt-card .rg .t{display:none}
#bt .bt-card.cur .rg .n,#bt .bt-card.tgt .rg .n{display:none}#bt .bt-card.cur .rg .c{display:block}#bt .bt-card.tgt .rg .t{display:block}#bt .bt-card.tgt.cur .rg .c{display:none}
.bt-card .inf{position:absolute;left:66px;right:10px;top:7px;bottom:6px;display:flex;flex-direction:column;justify-content:space-between}
.bt-card .nm{display:flex;align-items:center;justify-content:space-between;height:20px}
.bt-card .nm .n{font-family:var(--bb);font-size:20px;line-height:20px;color:#f2e4c4;letter-spacing:.08em;text-shadow:0 1px 2px #000}
.bt-card.cur .nm .n{color:#ffe2a0}
.bt-card .ln{display:flex;align-items:center;gap:4px;height:13px}
.bt-card .bar{position:relative;flex:none;width:var(--bw);height:9px;background:var(--tr) center/100% 100% no-repeat}
.bt-card .bar i,.bt-card .bar b{position:absolute;left:0;top:0;bottom:0;overflow:hidden;background:var(--full) left center/var(--bw) 9px no-repeat;-webkit-mask-image:linear-gradient(90deg,#000 calc(100% - 7px),transparent);mask-image:linear-gradient(90deg,#000 calc(100% - 7px),transparent)}
.bt-card .bar b{background-image:var(--ghost)}
.bt-card .v{flex:1;min-width:30px;text-align:right;font-family:var(--bb);font-size:16px;line-height:14px;color:#f6dcc4;text-shadow:0 1px 2px #000}
.bt-card .ln.mp .v{font-size:14px;color:#a8d8e4}
.bt-card .ln.low .v{color:#ff8a6a}
.bt-card .pips{display:flex;gap:1px}
.bt-card .st{position:absolute;right:6px;top:-5px;display:flex;gap:2px;z-index:2}
.bt-card .st img{filter:drop-shadow(0 1px 1px rgba(0,0,0,.6))}
#bt-cards .bt-card .tp{position:absolute;left:-18px;top:21px;display:none;animation:tpb .6s ease-in-out infinite alternate}
#bt-cards .bt-card.tgt .tp{display:block}
@keyframes tpb{to{translate:-4px 0}}
/* 铜钱（蓄势） */
.bt-pip{display:inline-block;width:14px;height:14px;background:var(--co-off) center/100% 100% no-repeat}
.bt-pip.on{background-image:var(--co-on)}
.bt-pip.use{background-image:var(--co-use);animation:pipu .5s ease-in-out infinite alternate}
@keyframes pipu{to{filter:brightness(1.3) drop-shadow(0 0 3px #ffd070)}}
.bt-card .pips .bt-pip{width:12px;height:12px}
/* ── 指令菜单 ── */
#bt-cmd{position:absolute;box-sizing:border-box;font-size:16px}
#bt-cmd[hidden]{display:none}
#bt-cmd .hd{display:flex;align-items:baseline;justify-content:space-between}
#bt-cmd .hd b{font-family:var(--bb);font-size:21px;font-weight:normal;letter-spacing:.14em}
#bt-cmd .hd span{font-family:var(--bb);font-size:14px;letter-spacing:.08em}
#bt-cmd .row{border:none;box-shadow:none;position:relative;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;transition:transform .16s ease-out}
#bt-cmd .row .l{font-family:var(--bb);font-size:18px;letter-spacing:.1em;overflow:hidden;text-overflow:ellipsis}
#bt-cmd .row .r{margin-left:auto;font-size:12px;display:flex;align-items:center;gap:2px}
#bt-cmd .row .cur{position:absolute;display:none}
#bt-cmd .row.sel .cur{display:block}
#bt-cmd .row .why{font-size:10px;color:#e0806a;letter-spacing:0;margin-left:2px}
#bt-cmd .ics{display:flex;gap:1px;min-width:20px}
#bt-cmd .kn{display:inline-block;width:10px;font:11px/14px var(--serif);text-align:center;flex:none;opacity:.7}
#bt-cmd .mpc{color:#8cc8ff}#bt-cmd .mpc.no{color:#e0604a}
#bt-cmd .ft{white-space:nowrap;display:flex;align-items:center;gap:3px;font-size:12px}
#bt-cmd .ft .lb{font-family:var(--bb);font-size:15px;letter-spacing:.05em;margin-right:1px}
#bt-cmd .ft button{padding:0;width:17px;height:17px;border-radius:50%;font:11px/15px var(--serif);letter-spacing:0;box-shadow:none;flex:none}
#bt-cmd .ft .pips .bt-pip{width:13px;height:13px}
#bt-cmd .ft .pips{display:flex;gap:1px}
#bt-cmd .ft .pips .bt-pip{cursor:pointer}
#bt-cmd .ft .n{margin-left:auto;font-size:12px}
#bt-cmd .ft .n b{font-family:var(--bb);font-size:16px;font-weight:normal}
/* 墨迹题签：一叠墨迹签条 */
.th-ink #bt-cmd{width:210px}
.th-ink #bt-cmd.open{animation:inkin .22s ease-out}
@keyframes inkin{from{opacity:0;transform:translateX(14px)}}
.th-ink #bt-cmd .hd{height:34px;align-items:center;padding:0 12px 0 26px;margin-bottom:1px;background:var(--swhd) center/100% 100% no-repeat}
.th-ink #bt-cmd .hd b{color:#f6e0b0;text-shadow:0 1px 2px #000}.th-ink #bt-cmd .hd span{color:#e0b8a0}
.th-ink #bt-cmd .row{height:30px;margin:1px 0;padding:0 12px 0 26px;color:#e8d8b8;background:var(--sw) center/100% 100% no-repeat}
.th-ink #bt-cmd .row.sel{transform:translateX(-14px);color:#ffe6a8;background-image:var(--swsel)}
.th-ink #bt-cmd .row.sel .l{text-shadow:0 0 6px rgba(255,200,120,.35)}
.th-ink #bt-cmd .row .cur{left:5px;top:7px}
.th-ink #bt-cmd .row .r{color:#b8a888}
.th-ink #bt-cmd .row.dis{color:#6d5f4b;cursor:default}.th-ink #bt-cmd .row.dis .bi{filter:grayscale(1) brightness(.55)}
.th-ink #bt-cmd .ft{height:30px;margin-top:2px;padding:0 12px 0 16px;color:#c9b48c;background:var(--sw) center/100% 100% no-repeat}
.th-ink #bt-cmd .ft button{background:#20150d;border:1px solid #7a6344;color:#f3d58e}
.th-ink #bt-cmd .ft .n{color:#e8d8b8}.th-ink #bt-cmd .ft .n b{color:#ffcf73}
/* 卷轴木牌：竖排卷轴展开 */
.th-scroll #bt-cmd{width:206px;padding:14px 12px 12px;color:#2a1a0e;background:var(--papm) center/100% 100% no-repeat;box-shadow:0 8px 18px rgba(0,0,0,.55)}
.th-scroll #bt-cmd::before,.th-scroll #bt-cmd::after{content:'';position:absolute;left:-13px;right:-13px;height:12px;background:var(--rodh) center/100% 100% no-repeat;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}
.th-scroll #bt-cmd::before{top:-6px}.th-scroll #bt-cmd::after{bottom:-6px}
.th-scroll #bt-cmd.open{animation:unroll .3s ease-out}
@keyframes unroll{from{clip-path:inset(-8px -14px calc(100% - 14px) -14px)}to{clip-path:inset(-8px -14px -8px -14px)}}
.th-scroll #bt-cmd .hd{padding:0 4px 5px;margin-bottom:4px;background:linear-gradient(90deg,transparent,#5a3c22 12% 88%,transparent) bottom/100% 1px no-repeat}
.th-scroll #bt-cmd .hd b{color:#1a0f08}.th-scroll #bt-cmd .hd span{color:#8a2a1a}
.th-scroll #bt-cmd .row{height:29px;padding:0 6px 0 20px;margin:0 -4px}
.th-scroll #bt-cmd .row.sel{color:#fff2dc;background:var(--swred) center/100% 100% no-repeat}
.th-scroll #bt-cmd .row .cur{left:1px;top:6px}
.th-scroll #bt-cmd .row .r{color:#6a5236}.th-scroll #bt-cmd .row.sel .r{color:#ffe0c8}
.th-scroll #bt-cmd .row.dis{color:#a89878;cursor:default}.th-scroll #bt-cmd .row.dis .bi{filter:grayscale(1) opacity(.5)}
.th-scroll #bt-cmd .mpc{color:#2a5a8a}.th-scroll #bt-cmd .row.sel .mpc{color:#d8ecff}
.th-scroll #bt-cmd .ft{margin-top:5px;padding:6px 2px 0;color:#5a4028;background:linear-gradient(90deg,transparent,#5a3c22 12% 88%,transparent) top/100% 1px no-repeat}
.th-scroll #bt-cmd .ft button{background:#efe2c4;border:1px solid #5a3c22;color:#3a2412}
.th-scroll #bt-cmd .ft .n b{color:#a8281a}
/* ── 说明条 ── */
#bt-hint{position:absolute;left:50%;top:82px;transform:translateX(-50%);font-size:14px;line-height:24px;white-space:nowrap;letter-spacing:.06em;display:flex;align-items:center;gap:4px}
#bt-hint[hidden]{display:none}
#bt-hint .dm{font-size:12px}
#bt-hint .ws{display:inline-flex;gap:2px}
#bt-hint .wk{color:#ffe25a;animation:wkp .35s ease-in-out infinite alternate}
@keyframes wkp{from{opacity:.45}to{opacity:1}}
.th-ink #bt-hint{padding:5px 34px;color:#f0e2c4;background:var(--swhint) center/100% 100% no-repeat;text-shadow:0 1px 2px #000}
.th-ink #bt-hint .pv{color:#fff3e0}.th-ink #bt-hint .dm{color:#a8987c}.th-ink #bt-hint .hl{color:#f3d58e}
.th-scroll #bt-hint{padding:3px 24px;color:#2a1a0e;background:var(--paph) center/100% 100% no-repeat;box-shadow:0 3px 8px rgba(0,0,0,.5)}
.th-scroll #bt-hint::before,.th-scroll #bt-hint::after{content:'';position:absolute;top:-5px;bottom:-5px;width:10px;background:var(--rodv) center/100% 100% no-repeat}
.th-scroll #bt-hint::before{left:-6px}.th-scroll #bt-hint::after{right:-6px}
.th-scroll #bt-hint .pv{color:#1a0f08}.th-scroll #bt-hint .dm{color:#7a6448}.th-scroll #bt-hint .hl{color:#a8281a}.th-scroll #bt-hint .wk{color:#c02010}
/* 首回合按键提示 */
#bt-help{position:absolute;left:10px;bottom:8px;display:flex;gap:10px;font-size:11px;color:rgba(233,220,192,.8);letter-spacing:.04em;text-shadow:0 1px 2px #000;opacity:0;transition:opacity .8s}
#bt-help.on{opacity:1}
#bt-help kbd{display:inline-block;min-width:14px;margin:0 3px 0 0;padding:0 4px;font:10px/15px var(--serif);color:#2a1a0e;background:#e3d3b0;border:none;border-radius:2px;box-shadow:0 1px 0 #6a5236,0 0 0 1px rgba(0,0,0,.5);vertical-align:1px}
/* ── 胜利结算：宣纸卷轴 ── */
#bt-win{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:372px;box-sizing:border-box;padding:16px 30px 14px;text-align:center;color:#2a1a0e;
  background:var(--papw) center/100% 100% no-repeat;box-shadow:0 12px 30px rgba(0,0,0,.65);animation:unrollw .45s ease-out}
#bt-win::before,#bt-win::after{content:'';position:absolute;left:-16px;right:-16px;height:16px;background:var(--rodw) center/100% 100% no-repeat;filter:drop-shadow(0 3px 3px rgba(0,0,0,.6))}
#bt-win::before{top:-8px}#bt-win::after{bottom:-8px}
@keyframes unrollw{from{clip-path:inset(calc(50% - 8px) -20px calc(50% - 8px) -20px)}to{clip-path:inset(-10px -20px -10px -20px)}}
#bt-win .wt{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;margin:0 0 4px;height:92px}
#bt-win h2{margin:0;font-family:var(--bc);font-size:92px;line-height:92px;font-weight:normal;color:#140a05;letter-spacing:0}
#bt-win .wt .sl{position:absolute;right:62px;top:14px;transform:rotate(6deg);animation:stamp .35s .35s cubic-bezier(.3,1.6,.5,1) both}
@keyframes stamp{from{opacity:0;transform:scale(1.8) rotate(6deg)}to{opacity:1;transform:scale(1) rotate(6deg)}}
#bt-win .ln{display:flex;align-items:center;gap:8px;padding:5px 4px;font-size:15px;text-align:left;background:linear-gradient(90deg,transparent,rgba(60,36,18,.45) 10% 90%,transparent) bottom/100% 1px no-repeat}
#bt-win .ln>span{flex:1;font-family:var(--bb);font-size:18px;color:#3a2412;letter-spacing:.15em}
#bt-win .ln b{font-family:var(--bb);font-size:19px;color:#1a0f08;font-weight:normal;display:flex;align-items:center;gap:3px;flex-wrap:wrap;justify-content:flex-end}
#bt-win .ln .it{display:inline-flex;align-items:center;gap:2px;font-family:var(--serif);font-size:13px}
#bt-win .ln .it i{width:24px;height:24px;display:inline-block;image-rendering:pixelated}
#bt-win .lv{white-space:nowrap;margin:8px -12px 0;padding:6px 0;color:#fff0d8;font-family:var(--bb);font-size:20px;letter-spacing:.2em;background:var(--swlv) center/100% 100% no-repeat;text-shadow:0 1px 2px #3a0a04}
#bt-win .lv small{white-space:nowrap;font-family:var(--serif);font-size:12px;color:#ffe0c0;letter-spacing:.05em;margin-left:6px}
#bt-win .go{margin-top:8px;color:#6a5236;font-size:12px;animation:wkp .7s ease-in-out infinite alternate}
`;document.head.appendChild(st);
  const bt=$('bt');if(bt){bt.style.setProperty('--co-off',u(U.coin('off',28)));bt.style.setProperty('--co-on',u(U.coin('on',28)));bt.style.setProperty('--co-use',u(U.coin('use',28)))}}
function battleDom(){let el=$('bt');if(!el){el=document.createElement('div');el.id='bt';el.hidden=true;
    el.innerHTML='<div id="bt-cards"></div><div id="bt-hint" hidden></div><div id="bt-cmd" hidden></div><div id="bt-help"></div>';
    const fadeE=$('fade');fadeE.parentNode.insertBefore(el,$('dlg'));
    const fit=()=>{const gm=$('game');el.style.transform=`scale(${gm.clientWidth/960})`};fit();
    try{new ResizeObserver(fit).observe($('game'))}catch(e){addEventListener('resize',fit)}}
  battleCSS();BUI.applyTheme();
  const cs=el.style;if(!cs.getPropertyValue('--co-on')){cs.setProperty('--co-off',`url(${BUI.url(BUI.coin('off',28))})`);cs.setProperty('--co-on',`url(${BUI.url(BUI.coin('on',28))})`);cs.setProperty('--co-use',`url(${BUI.url(BUI.coin('use',28))})`)}
  return el}
// 兵刃/内劲标签 → 墨点字徽（'武''药''守''走' 等指令名也可）
function tyTag(t){if(!t)return'';return BUI.img(t,19,'','ty')}
function pips(n,use,max=5){let s='';for(let i=0;i<max;i++)s+=`<i class="bt-pip ${i<n?(i>=n-use?'use':'on'):''}" data-p="${i}"></i>`;return s}
// 毛笔血线素材（按宽度缓存）
function buiBars(w){const U=BUI,o={rev:0,dry:.3,head:.12,tail:.3,tip:.6,thick:.9,wave:.12,a:1};
  return{tr:U.url(U.swash(w,9,{...o,seed:71,col:'#e9dcc0',a:.16,dry:.5})),hp:U.url(U.swash(w,9,{...o,seed:72,col:'#d63a22'})),low:U.url(U.swash(w,9,{...o,seed:72,col:'#ff5a2a'})),
    mp:U.url(U.swash(w,9,{...o,seed:73,col:'#4aa0b8'})),gh:U.url(U.swash(w,9,{...o,seed:72,col:'#f3e0b0',a:.85}))}}
const BUI_STAT={防御:['防','#2f5f8a'],护主:['护','#2f7a55'],定神:['定','#a8781a'],眩晕:['晕','#6a3a9a'],中毒:['毒','#2f7a3a'],倒下:['倒','#5a1a10']};
function renderCards(){const el=$('bt-cards');if(!el||!B)return;const U=BUI;
  // 当前行动者切换 → 通知演出层
  if(B.cur!==B._buiCur){B._buiCur=B.cur;if(B.cur&&window.BFX&&BFX.onTurnStart)try{BFX.onTurnStart(B.cur)}catch(e){console.error(e)}}
  if(el._n!==B.allies.length||el._B!==B){el._n=B.allies.length;el._B=B;const bw=122,bb=buiBars(bw),[eN,eC,eT]=window.__buiEnso||[];
    el.innerHTML=B.allies.map((u,i)=>`<div class="bt-card" data-i="${i}" style="--sw:${(window.__buiCardSw||[])[i%4]||'none'}"><div class="st"></div>${U.tag(U.pointer('#8fe0a8',16,'r'),'tp')}
      <div class="fc"></div><div class="rg">${eN?U.tag(eN,'n')+U.tag(eC,'c')+U.tag(eT,'t'):''}</div><div class="inf">
      <div class="nm"><span class="n">${esc(u.name)}</span><span class="pips"></span></div>
      <div class="ln hp"><div class="bar hp" style="--tr:url(${bb.tr});--full:url(${bb.hp});--ghost:url(${bb.gh});--bw:${bw}px"><b class="gh"></b><i></i></div><span class="v hp"></span></div>
      <div class="ln mp"><div class="bar mp" style="--tr:url(${bb.tr});--full:url(${bb.mp});--bw:${bw}px"><i></i></div><span class="v mp"></span></div></div></div>`).join('');
    el._bb=bb;el.querySelectorAll('.bt-card').forEach(c=>c.onpointerdown=e=>{e.stopPropagation();const u=B.allies[+c.dataset.i];if(B.tgtList&&B.tgtList.includes(u)&&B.pickCard)B.pickCard(u)})}
  B.allies.forEach((u,i)=>{const c=el.children[i];if(!c)return;const cur=B.cur===u,use=cur?B.bpUse:0,tg=!!(B.tgtList&&B.tgtList.includes(u)&&(B.tgtAll||B.tgtList[B.tsel]===u));
    c.classList.toggle('cur',cur);c.classList.toggle('tgt',tg);c.classList.toggle('dead',u.hp<=0);
    const fc=c.querySelector('.fc'),fk=U.faceKey(u)+(u.hp<=0);if(fc._k!==fk){fc._k=fk;fc.innerHTML='';porFill(fc,u)}
    const st=[];if(u.hp<=0)st.push(['倒下']);else{if(u.defend)st.push(['防御']);if(u.guardBy&&u.guardBy.hp>0&&u.guardUntil>=B.round)st.push(['护主']);if(u.buffs.ding)st.push(['定神',u.buffs.ding]);if(u.stun)st.push(['眩晕']);if(u.bleedN>0)st.push(['中毒'])}
    const sh=st.map(([t,n])=>{const[ch,col]=BUI_STAT[t];return U.tag(U.seal(ch,18,18,{col}),'','')+(n?`<span style="font:11px/18px var(--serif);color:#f3d58e;margin-left:-1px;text-shadow:0 1px 2px #000">${n}</span>`:'')}).join('')+'|'+U.fontGen();
    const se=c.querySelector('.st');if(se._h!==sh){se._h=sh;se.innerHTML=sh.split('|')[0];se.title=st.map(s=>s.join(' ')).join(' · ')}
    const ph=pips(u.bp,use);const pe=c.querySelector('.nm .pips');if(pe._h!==ph){pe._h=ph;pe.innerHTML=ph}
    const low=u.hp<u.mhp*.3,hv=c.querySelector('.v.hp'),mv=c.querySelector('.v.mp');if(hv.textContent!==String(u.hp))hv.textContent=u.hp;if(mv.textContent!==String(u.mp))mv.textContent=u.mp;
    const hb=c.querySelector('.bar.hp'),ln=c.querySelector('.ln.hp');if(ln.classList.contains('low')!==low){ln.classList.toggle('low',low);hb.style.setProperty('--full',`url(${low?el._bb.low:el._bb.hp})`)}
    hb.querySelector('i').style.width=100*u.hp/u.mhp+'%';hb.querySelector('.gh').style.width=100*(u.gh??u.hp)/u.mhp+'%';
    c.querySelector('.bar.mp i').style.width=100*u.mp/Math.max(1,u.mmp)+'%';c.title=`${u.name} 气血 ${u.hp}/${u.mhp} 内力 ${u.mp}/${u.mmp} 蓄势 ${u.bp}`});
  // 首回合按键提示（教学战全程）
  const hp=$('bt-help');if(hp){if(!hp.querySelector('kbd')){hp.innerHTML='<span><kbd>↑</kbd><kbd>↓</kbd>选择</span><span><kbd>Enter</kbd>确定</span><span><kbd>Esc</kbd>返回</span><span><kbd>Q</kbd><kbd>E</kbd>蓄势</span><span><kbd>1</kbd>–<kbd>9</kbd>直选</span>'}
    hp.classList.toggle('on',!!(B.cur&&B.cur.side==='ally'&&!B.cur.pet&&(B.round<=1||B.opt.tutorial)))}}
// 头像：立绘裁脸平滑缩小（缺立绘则取战斗精灵头部）
function porFill(el,u){const f=BUI.face(u,52);if(!f)return;const c=document.createElement('canvas');c.width=f.width;c.height=f.height;c.getContext('2d').drawImage(f,0,0);el.appendChild(c)}
function hint(html){const h=$('bt-hint');if(!h)return;if(!html){h.hidden=true;return}h.hidden=false;if(h._h!==html){h._h=html;h.innerHTML=html}}

// ───────── 我方回合（规则同 battle.js，仅表现） ─────────
function allyTurn(u){return new Promise(res=>{B.bpUse=0;const cmd=$('bt-cmd');
  // 菜单挂在队伍面板上方（右对齐），不遮挡我方站位
  const place=()=>{const cs=$('bt-cards'),pc=cs&&cs.querySelector('.bt-card.cur');const h=cmd.offsetHeight||200;
    const left=cs?cs.offsetLeft-20:730,top=pc?cs.offsetTop+pc.offsetTop:380,bot=pc?top+pc.offsetHeight:520;
    if(BUI.dock==='above'&&cs){cmd.style.left=(cs.offsetLeft+cs.offsetWidth-cmd.offsetWidth-(BUI.theme==='scroll'?16:0))+'px';cmd.style.bottom='';cmd.style.top=Math.max(84,cs.offsetTop-h-(BUI.theme==='scroll'?14:4))+'px';return}
    // 参照《八方旅人》：菜单贴在当前行动者状态条左侧，顶端与该条对齐
    cmd.style.left=(left-4-cmd.offsetWidth)+'px';cmd.style.bottom='';cmd.style.top=clamp(top-4,84,540-6-h)+'px'};
  const done=async(fn,nob)=>{cmd.hidden=true;B.key=null;hint('');if(nob)B.bpUse=0;const use=B.bpUse;if(use){u.bp-=use;u.boosted=true}B.bpUse=use;renderCards();const r=await fn(use);B.bpUse=0;res(r)};
  const boostCtl=()=>`<div class="ft" style="--sw:${(window.__buiRowSw||[])[4]||'none'}"><span class="lb">蓄势</span><button data-b="-1" title="Q / ←">Q</button><span class="pips">${pips(u.bp,B.bpUse)}</span><button data-b="1" title="E / →">E</button><span class="n">投入 <b>${B.bpUse}</b></span></div>`;
  const setBp=d=>{const n=clamp(B.bpUse+d,0,Math.min(3,u.bp));if(n!==B.bpUse){B.bpUse=n;bsfx('select',.6,1+n*.15);renderCards();B.redraw&&B.redraw()}};
  const ptr=()=>BUI.tag(BUI.pointer(BUI.theme==='scroll'?'#f6e6c8':'#e0402a',16,'r'),'cur');
  // 通用菜单
  const menu=(title,rows,back,onSel)=>{let sel=Math.max(0,rows.findIndex(r=>!r.dis));
    const draw=()=>{const wasHidden=cmd.hidden;cmd.hidden=false;const rs=window.__buiRowSw||[];
      cmd.innerHTML=`<div class="hd"><b>${esc(u.name)}</b><span>${title}</span></div>`+
      rows.map((r,i)=>`<div class="row ${i===sel?'sel':''} ${r.dis?'dis':''}" data-i="${i}" style="--sw:${rs[i%4]||'none'}">${ptr()}<span class="kn">${i<9?i+1:''}</span><span class="ics">${r.ico||''}</span><span class="l">${r.label}</span>${r.why?`<span class="why">${r.why}</span>`:''}<span class="r">${r.right||''}</span></div>`).join('')+(title==='道具'?'':boostCtl());
      if(wasHidden){cmd.classList.remove('open');void cmd.offsetWidth;cmd.classList.add('open')}
      cmd.querySelectorAll('.row').forEach(e=>{e.onpointerenter=()=>{const i=+e.dataset.i;if(i!==sel&&!rows[i].dis){sel=i;draw()}};e.onclick=()=>pick(+e.dataset.i)});
      cmd.querySelectorAll('[data-b]').forEach(b=>b.onclick=e=>{e.stopPropagation();setBp(+b.dataset.b)});
      // 铜钱按钮：点第 i 枚 = 从这枚起投入（再点同一档取消）
      cmd.querySelectorAll('.ft .bt-pip').forEach(p=>p.onclick=e=>{e.stopPropagation();const i=+p.dataset.p;if(i>=u.bp)return;const want=u.bp-i;setBp((want===B.bpUse?0:want)-B.bpUse)});
      place();const r=rows[sel];hint(r&&r.desc?r.desc:'')};
    const pick=i=>{if(rows[i].dis){bsfx('menu_close',.5);return}bsfx('select');onSel(rows[i].val)};
    B.redraw=draw;draw();
    B.key=k=>{if(k==='up'||k==='down'){const d=k==='up'?-1:1;let i=sel;for(let n=0;n<rows.length;n++){i=(i+d+rows.length)%rows.length;if(!rows[i].dis)break}sel=i;draw();bsfx('blip',.6)}
      else if(k==='ok')pick(sel);else if(k==='back'&&back){bsfx('menu_close',.6);back()}else if(k==='left')setBp(-1);else if(k==='right')setBp(1);else if(k==='bm')setBp(-1);else if(k==='bp')setBp(1);
      else if(k[0]==='n'){const i=+k.slice(1)-1;if(rows[i]&&!rows[i].dis){sel=i;draw();pick(i)}}}};
  // 目标选择
  const target=(side,all,back,go,desc)=>{const list=side==='foe'?aliveOf('foe'):aliveOf('ally');if(!list.length){back();return}
    cmd.hidden=true;B.tgtList=list;B.tgtAll=all;B.tsel=side==='foe'?0:Math.max(0,list.indexOf(u));
    const fin=()=>{const tl=B.tgtList;B.tgtList=null;B.click=null;B.pickCard=null;B.pv=null;return tl};
    const info=()=>{const t=list[B.tsel];let s=`<span class="hl" style="font-family:var(--bb);font-size:17px">${desc}</span><span class="dm">·</span>`;
      if(all)s+=side==='foe'?'全体敌人':'全体同伴';else{s+=esc(t.name);if(side==='foe')s+=' <span class="ws">'+t.weak.map(w=>t.known.has(w)?BUI.img(w,18):BUI.img('?',18)).join('')+'</span>'}
      if(side==='foe'&&B.pv){const v=B.pv(B.bpUse),ts=all?list:[t];const ests=ts.map(x=>estDmg(u,x,v));const wk=ts.some(x=>hitsWeak(x,v));
        s+=`<span class="dm">·</span><span class="pv">预计 ${Math.min(...ests)}${Math.max(...ests)!==Math.min(...ests)?'~'+Math.max(...ests):''}${v.hits>1?' ×'+v.hits:''}</span>`+(wk?' <span class="wk">弱点！</span>':'')}
      hint(s+`<span class="dm"> · 蓄势 ${B.bpUse}</span>`);renderCards()};
    B.redraw=info;info();
    const ok2=()=>{const tl=fin();bsfx('select');go(all?tl:[tl[B.tsel]])};
    B.key=k=>{if(k==='left'||k==='up'){if(!all){B.tsel=(B.tsel-1+list.length)%list.length;bsfx('blip',.6)}info()}
      else if(k==='right'||k==='down'){if(!all){B.tsel=(B.tsel+1)%list.length;bsfx('blip',.6)}info()}
      else if(k==='ok')ok2();else if(k==='back'){fin();bsfx('menu_close',.6);back()}else if(k==='bm')setBp(-1);else if(k==='bp')setBp(1)};
    B.click=(x,y)=>{const hit=unitAt(x,y);if(hit&&list.includes(hit)){if(all||list[B.tsel]===hit)ok2();else{B.tsel=list.indexOf(hit);info()}}};
    B.pickCard=hit=>{if(all||list[B.tsel]===hit)ok2();else{B.tsel=list.indexOf(hit);info()}}};
  const main=()=>{B.tgtList=null;const flee=!B.opt.boss&&!B.opt.tutorial&&!B.opt.noFlee;
    const inv=Object.entries(S.bag||{}).filter(([k,n])=>n>0&&ITEMS[k]&&(ITEMS[k].heal||ITEMS[k].mp));
    menu('第 '+B.round+' 回合',[
      {label:'攻击',val:'atk',ico:tyTag(u.atkType),right:u.atkName,desc:`以${u.atkName}出手（${u.atkType}）· 蓄势可连击 ${1+B.bpUse} 次`},
      {label:'武学',val:'sk',ico:tyTag('武'),dis:!u.skills.length,desc:'施展武学，消耗内力'},
      {label:'道具',val:'it',ico:tyTag('药'),dis:!inv.length,desc:'使用行囊中的药物'},
      {label:'防御',val:'def',ico:tyTag('守'),desc:'本回合受伤减半，下回合率先行动'},
      ...(flee?[{label:'逃跑',val:'run',ico:tyTag('走'),desc:'试图脱离战斗'}]:[])],null,v=>{
      if(v==='atk'){B.pv=bp=>({t:u.atkType,pow:1,hits:1+bp})}
      if(v==='atk')target('foe',false,main,t=>done(bp=>doAttack(u,t[0],bp)),u.atkName+(B.bpUse?` ×${1+B.bpUse}`:''));
      else if(v==='sk')skills();else if(v==='it')items(inv);
      else if(v==='def')done(async()=>{u.defend=true;u.prio=true;floatTxt(u,'防御','#9fd4ee',22);await wait(450)},1);
      else if(v==='run')done(async()=>{const fs=aliveOf('foe'),ps=aliveOf('ally');const p=clamp(55+(avg(ps,'spd')-avg(fs,'spd'))*6,20,90);
        if(chance(p)){bsfx('whoosh');return'flee'}floatTxt(u,'逃跑失败','#aaa',22);await wait(600)},1)})};
  const skills=()=>{menu('武学',u.skills.map(k=>{const sk=SKILLS[k],bi=BSK[k]||{},need=sk.needWeapon&&u.isHero&&u.atkType!==sk.needWeapon,lack=u.mp<(sk.mp||0);
      return{label:sk.name,val:k,ico:tyTag(bi.t||(sk.heal||bi.buff?'医':'内'))+(bi.e?tyTag(bi.e):''),right:sk.mp?`<span class="mpc ${lack?'no':''}">${sk.mp}</span>内`:'',
        why:need?'需'+sk.needWeapon:lack?'内力不足':'',dis:lack||need,desc:(sk.desc||'')+(need?`（需装备${sk.needWeapon}）`:'')}}),main,k=>{
      const bi=BSK[k]||{},tg=bi.tgt||(SKILLS[k].heal?'ally':'foe');
      const go=t=>done(bp=>doSkill(u,k,t,bp));B.pv=bp=>skillPv(u,k,bp);
      if(tg==='self')go([u]);else target(tg==='foe'||tg==='foes'?'foe':'ally',tg==='foes'||tg==='allies',skills,go,SKILLS[k].name)})};
  const items=inv=>{menu('道具',inv.map(([k,n])=>({label:ITEMS[k].name,val:k,ico:buiItem(k,22),right:'×'+n,desc:ITEMS[k].desc})),main,k=>target('ally',false,()=>items(inv),t=>done(async()=>{
      const it=ITEMS[k];S.bag[k]--;const x=t[0];await lunge(u,x,.3);if(it.heal){heal(x,it.heal)}if(it.mp){x.mp=Math.min(x.mmp,x.mp+it.mp);floatTxt(x,'内力+'+it.mp,'#8cf',22)}renderCards();await wait(500)},1),ITEMS[k].name))};
  main()})}
// 道具图标：ART.icons 图集（96px = 32 像素 ×3），缺失回落「药」字徽
function buiItem(k,s=24){const r=window.ART&&ART.icons&&ART.icons[k];if(!r)return BUI.img('药',20);const[x,y,w,h]=r,f=s/w;
  return`<i class="pxi" style="width:${s}px;height:${s}px;background:url(assets/i_icons.webp) ${-x*f}px ${-y*f}px/${576*f}px auto no-repeat;image-rendering:pixelated"></i>`}

// ───────── 画布：行动顺序条（悬挂令牌）─────────
const CN_NUM=n=>{const d='零一二三四五六七八九';if(n<=10)return n===10?'十':d[n];if(n<20)return'十'+d[n-10];if(n<100)return d[n/10|0]+'十'+(n%10?d[n%10]:'');return String(n)};
// 令牌：拱顶木牌 + 圆窗头像（按 头像键/尺寸/阵营/主题/暗 缓存）
function buiPlaque(u,s,dim){const U=BUI,th=U.theme,h=Math.round(s*1.3),fo=u.side==='foe';
  return U.memo('pl|'+U.faceKey(u)+'|'+s+'|'+(fo?1:0)+'|'+th+'|'+(dim?1:0),()=>{const c=U.canvasL(s,h),X=c.getContext('2d');X.scale(U.PR,U.PR);
    const path=()=>{X.beginPath();X.moveTo(1,h-2);X.lineTo(1,s*.34);X.quadraticCurveTo(1,1,s/2,1);X.quadraticCurveTo(s-1,1,s-1,s*.34);X.lineTo(s-1,h-2);X.quadraticCurveTo(s/2,h+1,1,h-2);X.closePath()};
    let gr=X.createLinearGradient(0,0,s,h);
    if(th==='ink'){(fo?[['0','#5a1a12'],['1','#200604']]:[['0','#23332d'],['1','#0b1210']]).forEach(([a,b])=>gr.addColorStop(+a,b))}
    else{(fo?[['0','#b0603a'],['1','#6a2a14']]:[['0','#c49058'],['1','#7a4e26']]).forEach(([a,b])=>gr.addColorStop(+a,b))}
    path();X.fillStyle=gr;X.fill();
    if(th==='scroll'){X.save();path();X.clip();X.strokeStyle='rgba(60,30,10,.35)';X.lineWidth=.6;for(let i=0;i<7;i++){X.beginPath();const x0=2+i*s/7+Math.sin(i*3)*1.5;X.moveTo(x0,0);X.bezierCurveTo(x0+2,h*.3,x0-2,h*.7,x0+1,h);X.stroke()}X.restore()}
    path();X.lineWidth=1.3;X.strokeStyle=th==='ink'?'#c9a56a':'#2a160a';X.stroke();
    const cx=s/2,cy=s*.52,r=s*.37,f=U.face(u,Math.round(r*2));X.save();X.beginPath();X.arc(cx,cy,r,0,7);X.clip();X.fillStyle='#e6dac0';X.fillRect(cx-r,cy-r,r*2,r*2);if(f)X.drawImage(f,cx-r,cy-r,r*2,r*2);
    else{X.fillStyle='#2a1a10';X.font=`${r*1.1}px ${U.FB}`;X.textAlign='center';X.textBaseline='middle';X.fillText(u.name[0],cx,cy)}X.restore();
    X.beginPath();X.arc(cx,cy,r,0,7);X.lineWidth=1.2;X.strokeStyle=th==='ink'?'#e0c890':'#2a160a';X.stroke();
    // 阵营色签（底部小横纹）
    X.fillStyle=fo?'#e0503a':'#6fcf90';X.fillRect(s*.3,h-s*.2,s*.4,Math.max(1.5,s*.06));
    if(dim){path();X.fillStyle='rgba(8,5,3,.6)';X.fill()}
    return c})}
function headChip(u,x,y,s,dim){const p=buiPlaque(u,s,dim);g.drawImage(p,x,y,p.lw,p.lh)}
function drawOrderBar(now){if(!B.round)return;const U=BUI,th=U.theme;g.save();
  // 横梁：墨线（ink）/ 木轴（scroll）
  if(th==='ink'){const bm=U.swash(900,12,{seed:21,halo:'#d8c49a',haloA:.4,a:.9,dry:.45,head:.02,tail:.3,thick:.66,wave:.25,pr:1});g.drawImage(bm,30,3,bm.lw,bm.lh)}
  else{const bm=U.rod(920,10);g.drawImage(bm,20,4,bm.lw,bm.lh)}
  // 回合印
  const rt=CN_NUM(B.round)+'回',rs=U.seal(rt,26,Math.max(48,[...rt].length*21+6),{col:U.CINNABAR});g.drawImage(rs,12,6,rs.lw,rs.lh);
  let x=50,idx=0;const cord=th==='ink'?'rgba(10,6,4,.9)':'#4a2e16';
  const draw=(list,cur,sz0)=>{for(const u of list){if(u.hp<=0&&!cur)continue;const done=cur&&(B.done.has(u)||u.hp<=0),isCur=cur&&u===B.cur,bk=u.side==='foe'&&u.broken;
      const s=isCur?sz0+10:sz0,p=buiPlaque(u,s,done||bk),px=x+s/2,top=isCur?14:16;idx++;
      const ang=isCur?Math.sin(now/420)*.07:Math.sin(now/1100+idx*1.7)*.012;
      g.save();g.translate(px,8);g.rotate(ang);
      g.strokeStyle=cord;g.lineWidth=1.2;g.beginPath();g.moveTo(-3,0);g.lineTo(0,top-8+1);g.lineTo(3,0);g.stroke();
      if(isCur){g.shadowColor='rgba(255,190,90,.55)';g.shadowBlur=10}
      g.drawImage(p,-s/2,top-8,p.lw,p.lh);g.shadowBlur=0;
      // 流苏：当前行动者朱红长穗
      const ty=top-8+p.lh-1;g.strokeStyle=isCur?'#d8402a':cord;g.lineWidth=isCur?2:1;g.beginPath();g.moveTo(0,ty);g.lineTo(0,ty+(isCur?10:4));g.stroke();
      if(isCur){g.fillStyle='#d8402a';g.beginPath();g.moveTo(-3,ty+8);g.lineTo(3,ty+8);g.lineTo(0,ty+16);g.closePath();g.fill()}
      if(bk){const sl=U.poshiSeal(Math.round(s*.46));U.drawAny(g,sl,s/2-s*.46+2,top-8+p.lh-s*.46-2,s*.46,s*.46)}
      g.restore();x+=s+6}};
  draw(B.order,true,30);x+=4;
  // 「下回」竖排小字 + 墨线分隔
  g.fillStyle=th==='ink'?'rgba(20,12,8,.85)':'#4a2e16';g.fillRect(x,14,1.5,40);
  ['下','回'].forEach((q,i)=>{const nx=U.text(q,'#d8c8a4',15,{edge:'#0d0806'});g.drawImage(nx,x+12-nx.lw/2,16+i*17,nx.lw,nx.lh)});x+=26;
  g.globalAlpha=.78;draw(B.next.filter(u=>u.hp>0&&!(u.side==='foe'&&u.broken&&u.brokenUntil>=B.round+1)),false,26);g.globalAlpha=1;g.restore()}

// ───────── 画布：敌人脚边（护盾小印 + 弱点圆点 / 展开字徽 + 血线）─────────
const WSHORT=w=>w==='暗器'?'暗':w;
function buiHpBar(bx,by,bw,u){const U=BUI,o={dry:.3,head:.12,tail:.3,tip:.6,thick:.9,wave:.12,a:1,pr:2},bh=7;
  const tr=U.swash(bw,bh,{...o,seed:81,col:'#0d0806',a:.75,dry:.2,thick:1}),gh=U.swash(bw,bh,{...o,seed:82,col:'#f3e0b0',a:.9}),hp=U.swash(bw,bh,{...o,seed:82,col:u.broken?'#ff7a3a':'#d63a22'});
  g.drawImage(tr,bx,by,bw,bh);const clip=(c,k)=>{k=Math.max(0,Math.min(1,k));if(k<=0)return;g.drawImage(c,0,0,c.width*k,c.height,bx,by,bw*k,bh)};
  clip(gh,(u.gh??u.hp)/u.mhp);clip(hp,u.hp/u.mhp)}
function drawShieldRow(u,t){const U=BUI,n=u.weak.length,tg=B.tgtList&&B.tgtList.includes(u)&&(B.tgtAll||B.tgtList[B.tsel]===u),hov=u._buiHov,big=!!(tg||hov);
  const pv=B.pv&&B.tgtList&&B.tgtList.includes(u)?B.pv(B.bpUse):null;
  const ss=big?20:16,bs=big?18:6,step=big?bs+3:8,w0=ss+5+n*step-(step-bs),x=Math.round(u.x-w0/2),y=Math.round(u.y+8);
  g.save();
  // 衬底淡墨
  const bg=U.swash(w0+26,big?28:22,{seed:7+n+(big?5:0),a:big?.62:.5,dry:.5,head:.1,tail:.3,thick:.82,pr:1});g.drawImage(bg,x-13,Math.round(y+ss/2-bg.lh/2));
  // 护盾小印（受击时放大一档；破势换「破」印）
  const hitA=u.shieldHit?Math.max(0,1-(t-u.shieldHit)/300):0,k=1+hitA*.5,sw=ss*k;
  const sl=u.broken?U.poshiSeal(ss):U.seal(String(u.shield),ss,ss,{col:'#1f3a5a',frame:1});U.drawAny(g,sl,x+ss/2-sw/2,y+ss/2-sw/2,sw,sw);
  let cx=x+ss+5;
  u.weak.forEach(w=>{const kn=u.known.has(w),fresh=kn&&u.revealT&&t-u.revealT<600,hit=kn&&pv&&(pv.t===w||pv.e===w),col=kn?WCOL[w]:'#6a625a';
    if(big){const b=U.icon(kn?w:'?',bs,u.broken?'dim':''),by=y+(ss-bs)/2;g.drawImage(b,cx,by,bs,bs);
      if(hit&&((t/160|0)%3)){g.strokeStyle='#ffe25a';g.lineWidth=2;g.beginPath();g.arc(cx+bs/2,by+bs/2,bs/2+2,0,7);g.stroke();const a=U.pointer('#ffe25a',10,'d');g.drawImage(a,cx+bs/2-5,by-12-((t/200|0)%2)*2,10,10)}
      if(fresh&&((t/80|0)%2)){g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(cx+bs/2,by+bs/2,bs/2,0,7);g.fill()}}
    else{const cy=y+ss/2;g.beginPath();g.arc(cx+3,cy,3.2,0,7);g.fillStyle=fresh&&((t/80|0)%2)?'#ffffff':u.broken?dkCol(col):col;g.fill();g.lineWidth=1;g.strokeStyle='rgba(8,5,3,.9)';g.stroke();
      if(hit&&((t/160|0)%3)){g.strokeStyle='#ffe25a';g.lineWidth=1.5;g.beginPath();g.arc(cx+3,cy,5.5,0,7);g.stroke()}}
    cx+=step});
  // 血线：被选为目标 / 悬停 / 受击后 1.5s 显示
  const since=t-(u.ghT||-1e9);
  if(big||since<1500||(u.gh??u.hp)>u.hp){const a=big?1:Math.min(1,(1500-since)/300+((u.gh??u.hp)>u.hp?1:0));g.globalAlpha=Math.max(0,Math.min(1,a));
    const bw=Math.max(w0,big?72:48);buiHpBar(Math.round(u.x-bw/2),y+ss+4,bw,u);g.globalAlpha=1}
  g.restore()}
const dkCol=c=>BUI.mix(c,'#3a342e',.6);
// 残血：受击后 0.4s 再缓慢回落
function ghostTick(u,now){if(u.gh==null||u.gh<u.hp)u.gh=u.hp;if(u.gh>u.hp&&now-(u.ghT||0)>400)u.gh=Math.max(u.hp,u.gh-u.mhp*.012)}
function syncCardGhost(){const el=$('bt-cards');if(!el||!B)return;B.allies.forEach((u,i)=>{const c=el.children[i];if(!c)return;const e=c.querySelector('.gh');if(e)e.style.width=100*(u.gh??u.hp)/u.mhp+'%';
  if(u.flash&&u.flash!==c._fl){c._fl=u.flash;c.classList.remove('hit');void c.offsetWidth;c.classList.add('hit')}})}
// 意图连线：只画当前选中目标的敌人 / 悬停的敌人 / 全体攻击（朱砂虚线）
function drawIntentLines(now){if(!B.cur||B.cur.side!=='ally')return;g.save();g.setLineDash([3,7]);g.lineDashOffset=-now/40;g.lineWidth=2;g.lineCap='round';
  for(const f of B.foes){const it=f.intent;if(!it||f.hp<=0||f.broken||it.charge)continue;const sel=B.tgtList&&B.tgtList.includes(f)&&(B.tgtAll||B.tgtList[B.tsel]===f);
    if(!it.all&&!sel&&!f._buiHov)continue;const ts=it.all?aliveOf('ally'):it.tgt&&it.tgt.hp>0?[it.tgt]:[];
    for(const t of ts){const x0=f.x,y0=f.y-unitH(f)*.95,x1=t.x,y1=t.y-unitH(t)*.95,mx=(x0+x1)/2,my=Math.min(y0,y1)-60;
      g.strokeStyle=it.all?'rgba(214,58,34,.5)':'rgba(230,110,80,.42)';g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(mx,my,x1,y1);g.stroke()}}
  g.restore()}
// 单位 UI：敌人脚边 + 头顶意图字徽；目标箭头
function drawUnitUI(u,now){const U=BUI,h=unitH(u),x=u.x,y=u.y;const tg=B.tgtList&&B.tgtList.includes(u)&&(B.tgtAll||B.tgtList[B.tsel]===u);
  u._buiHov=!!(B.hover&&unitAt(...B.hover)===u);let top=y-h;
  if(u.side==='foe'&&u.hp>0){drawShieldRow(u,now);
    const it=u.intent;if(it&&!u.broken){g.save();
      const hot=it.charge||it.all,bs=hot?22:19,iy=Math.round(Math.max(96,y-h-bs-8));top=iy;
      let ic;if(it.charge)ic=U.blot('蓄',(now/220|0)%2?'#e0402a':'#b3261e',bs);else if(it.all)ic=U.blot('群','#b3261e',bs);else{const bt=BSK[it.sk]&&BSK[it.sk].t;ic=U.blot(WSHORT(bt||'刀'),'#2a1d14',bs,{fg:'#eadcbc',ring:'rgba(200,170,120,.7)'})}
      if(hot){g.shadowColor='rgba(255,80,40,.6)';g.shadowBlur=8}
      g.drawImage(ic,Math.round(x-bs/2),iy,bs,bs);g.shadowBlur=0;
      // 文字：悬停或被选为目标时显示（小墨签）
      if(tg||u._buiHov){const lab=intentLabel(u),tx=U.text(lab,hot?'#ffc8b0':'#eee2c6',14,{font:U.FS,edge:'#0d0806'}),tw=tx.lw+26;
        const ly=iy-30>=90?iy-30:iy+bs+4;if(ly<iy)top=ly;const bgc=U.swash(Math.round(tw/2)*2,26,{seed:91,halo:hot?'#e07050':'#d8c49a',haloA:.3,col:hot?'#3a0a06':'#0d0806',a:.86,dry:.35,head:.06,tail:.25,thick:.86,pr:1});
        g.drawImage(bgc,Math.round(x-bgc.lw/2),ly);g.drawImage(tx,Math.round(x-tx.lw/2),Math.round(ly+13-tx.lh/2),tx.lw,tx.lh)}
      g.restore()}}
  if(tg){const fo=u.side==='foe',col=fo?'#e8402a':'#8fe0a8',a=U.pointer(col,22,'d'),by=Math.round(top-6-22-((now/180|0)%2)*3);
    if(fo&&by<86){const p=U.pointer(col,22,'r');g.drawImage(p,Math.round(x-24-22-((now/180|0)%2)*3),Math.round(top+10),22,22)}
    else g.drawImage(a,Math.round(x-11),Math.max(70,by),22,22)}}

// ───────── 浮字 / 横幅 / 大字 ─────────
function floatTxt(u,t,c,size=26,slow){B.fx.push({x:u.x+rnd(-14,14),y:u.y-unitH(u)*.7-B.fx.filter(f=>f.u===u&&performance.now()-f.t0<300).length*22,t,c,size,t0:performance.now(),life:slow?1500:1000,u})}
function bpop(u,t,c,big){if(/破\s*势|破\s*防|BREAK/.test(t)){BUI.breakBanner(u);return}
  B.fx.push({x:u.x,y:u.y-unitH(u)*(big?.5:1.12),t,c,size:big?38:22,t0:performance.now(),life:big?1300:800,pop:1,u,kind:/WEAK/.test(t)?'weak':''})}
async function bigText(t,c,ms){B.big={t,c,t0:performance.now(),ms};await wait(ms)}
function showName(u,n){B.banner={t:n,side:u.side,t0:performance.now()}}
function drawFloats(now){const U=BUI;g.save();
  for(const f of B.fx){const k=(now-f.t0)/f.life;if(k>=1)continue;const e=now-f.t0;const fade=k>.72?(1-k)/.28:1;
    if(f.kind==='weak'){const y=f.y-Math.min(k*3,1)*16,sc=e<90?1.35-e/90*.35:1,tx=U.text('弱点','#ffe25a',30,{edge:'#5a1606'});g.globalAlpha=fade;
      if(e<260){g.strokeStyle=`rgba(255,226,90,${.55*(1-e/260)})`;g.lineWidth=2;g.beginPath();g.arc(f.x,y,16+e/7,0,7);g.stroke()}
      g.drawImage(tx,f.x-tx.lw*sc/2,y-tx.lh*sc/2,tx.lw*sc,tx.lh*sc);g.globalAlpha=1;continue}
    // 蓄势 ◆◆ → 铜钱
    const bm=/^蓄势\s*(◆+)$/.exec(f.t);if(bm){const y=f.y-k*30,tx=U.text('蓄势','#ffcf73',f.size),n=bm[1].length,cs=18,w=tx.lw+4+n*(cs+2);g.globalAlpha=fade;
      g.drawImage(tx,f.x-w/2,y-tx.lh/2,tx.lw,tx.lh);for(let i=0;i<n;i++){const c=U.coin('use',cs);g.drawImage(c,f.x-w/2+tx.lw+4+i*(cs+2),y-cs/2,cs,cs)}g.globalAlpha=1;continue}
    const num=/^\+?\d+$/.test(f.t);
    if(num){const BO=[0,-12,-20,-24,-22,-20];const y=f.y+(e<300?BO[Math.min(5,e/50|0)]:-20-(e-300)*.025);const big=f.size>=34;let sc=e<70?1.3:1;
      const tx=U.text(f.t,f.c||'#fff3e0',big?44:34,{font:U.FB});g.globalAlpha=fade;
      if(e<90&&((e/30|0)%2===0)){const wt=U.text(f.t,'#ffffff',big?44:34,{font:U.FB});g.drawImage(wt,f.x-wt.lw*sc/2,y-wt.lh*sc/2,wt.lw*sc,wt.lh*sc)}else g.drawImage(tx,f.x-tx.lw*sc/2,y-tx.lh*sc/2,tx.lw*sc,tx.lh*sc);
      g.globalAlpha=1;continue}
    let y=f.y-k*30,sc=1;if(f.pop){y=f.y-Math.min(k*3,1)*16;sc=k<.15?.6+k/.15*.6:1.2-Math.min(.2,(k-.15))}
    const tx=U.text(f.t,f.c||'#f3e6c8',Math.round(f.size*1.05));g.globalAlpha=fade;g.drawImage(tx,f.x-tx.lw*sc/2,y-tx.lh*sc/2,tx.lw*sc,tx.lh*sc)}
  g.globalAlpha=1;B.fx=B.fx.filter(f=>now-f.t0<f.life);g.lineWidth=1;g.restore()}
// 招式名横幅：墨迹题签（ink）/ 横卷轴（scroll），按文字缓存
function drawBanner(now){if(!B.banner)return;const U=BUI,b=B.banner,k=(now-b.t0)/1100;if(k>=1){B.banner=null;return}
  const fo=b.side==='foe',th=U.theme,key=th+'|'+U.fontGen();U.glyphs(b.t);
  if(!b._c||b._k!==key){b._k=key;const m=mkcB(4,4).getContext('2d');m.font=`26px ${U.FB}`;const tw=Math.ceil(m.measureText(b.t).width),w=tw+(th==='ink'?140:96),h=48;
    const c=U.canvasL(w,h,2),X=c.getContext('2d');X.scale(2,2);
    if(th==='ink'){const sw=U.swash(w,40,{seed:(b.t.length*13)%50+3,halo:fo?'#e07050':'#d8c49a',haloA:.38,col:fo?'#2e0806':'#0d0806',a:.92,dry:.42,head:.05,tail:.3,thick:.86});X.drawImage(sw,0,4,w,40);
      const sl=U.seal(fo?'煞':'招',20,20,{col:U.CINNABAR});X.drawImage(sl,w/2+tw/2+10,14,20,20)}
    else{const pp=U.paper(w-16,34,{seed:17,edge:5});X.shadowColor='rgba(0,0,0,.5)';X.shadowBlur=6;X.shadowOffsetY=2;X.drawImage(pp,8,7,w-16,34);X.shadowColor='transparent';
      const rv=U.rod(46,10);for(const rx of[0,w-10]){X.save();X.translate(rx+10,1);X.rotate(Math.PI/2);X.drawImage(rv,0,0,46,10);X.restore()}}
    const tx=U.text(b.t,th==='ink'?(fo?'#ffb49a':'#f6dca0'):(fo?'#9a1a10':'#1a0f08'),26,th==='ink'?{}:{edge:'rgba(0,0,0,0)'});X.drawImage(tx,w/2-tx.lw/2,24-tx.lh/2,tx.lw,tx.lh);b._c=c}
  const cv=b._c,grow=th==='scroll'?Math.min(1,k/.14):Math.min(1,k/.08),a=k>.82?(1-k)/.18:1,w=cv.lw*grow,y=78;
  g.save();g.globalAlpha=a;g.drawImage(cv,(cv.width-cv.width*grow)/2,0,cv.width*grow,cv.height,W/2-w/2,y,w,cv.lh);g.restore()}
const mkcB=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
// 胜 / 败 / 脱身：满宽墨带 + 书法大字 + 「小江湖」朱印（砸入）
function drawBig(now){if(!B.big)return;const U=BUI,k=(now-B.big.t0)/B.big.ms;if(k>=1.4)return;const e=now-B.big.t0;
  const a=Math.min(1,k*5)*(k>1?Math.max(0,(1.4-k)/.4):1),c=B.big.c,cy=H/2;g.save();g.globalAlpha=a;
  const band=U.swash(W,170,{seed:33,halo:'#d8c49a',haloA:.3,a:.86,dry:.5,head:.03,tail:.28,thick:.8,wave:.05,pr:1}),gw=Math.min(1,e/180);
  g.drawImage(band,0,0,band.width*gw,band.height,0,cy-85,W*gw,170);
  U.glyphs(B.big.t);const sc=e<90?1.6:e<150?1.18:e<200?.96:1,fs=B.big.t.length>1?112:136;
  const tx=U.text(B.big.t,U.mix(c,'#fff4e0',.25),fs,{font:U.FC,edge:'#0d0604'});g.drawImage(tx,W/2-tx.lw*sc/2,cy-tx.lh*sc/2,tx.lw*sc,tx.lh*sc);
  if(e<120){g.globalAlpha=a*(1-e/120);const wt=U.text(B.big.t,'#ffffff',fs,{font:U.FC});g.drawImage(wt,W/2-wt.lw*sc/2,cy-wt.lh*sc/2,wt.lw*sc,wt.lh*sc);g.globalAlpha=a}
  if(e>260){const ss=Math.min(1,(e-260)/140),s2=1.7-.7*ss,sl=U.seal('小江湖',26,70,{col:U.CINNABAR});g.globalAlpha=a*ss;g.save();g.translate(W/2+tx.lw/2+14,cy+4);g.rotate(.06);g.drawImage(sl,-13*s2,-35*s2,26*s2,70*s2);g.restore()}
  g.restore();g.lineWidth=1}

// ───────── 胜利结算（结算与升级逻辑同 battle.js） ─────────
async function victory(){await (window.BFX&&BFX.victoryPose?BFX.victoryPose():0);bsfx('chime');await bigText('胜','#f3d58e',900);
  let exp=0,sil=0;const drops={};for(const f of B.foes){exp+=f.exp;sil+=f.silver;for(const[k,p]of Object.entries(f.drops||{}))if(ITEMS[k]&&chance(p))drops[k]=(drops[k]||0)+1}
  exp=Math.round(exp*(B.opt.tutorial?.5:1));S.exp+=exp;S.silver+=sil;for(const[k,n]of Object.entries(drops))S.bag[k]=(S.bag[k]||0)+n;
  const lvl=[];while(S.exp>=S.lv*100){S.exp-=S.lv*100;S.lv++;S.pts+=3;const d=derived();S.hp=d.mhp;S.mp=d.mmp;lvl.push(S.lv)}
  if(sil)bsfx('coin');
  const U=BUI,w=document.createElement('div');w.id='bt-win';
  const dr=Object.entries(drops).map(([k,n])=>`<span class="it">${buiItem(k,24)}${esc(ITEMS[k].name)}×${n}</span>`).join('')||'—';
  w.innerHTML=`<div class="wt"><h2>胜</h2>${U.tag(U.seal('大捷',30,30,{col:U.CINNABAR}),'sl')}</div>
    <div class="ln">${U.tag(U.blot('修','#6ccf8a',22))}<span>修为</span><b>+<em class="cnt" data-v="${exp}" style="font-style:normal">0</em></b></div>
    <div class="ln">${U.tag(U.blot('银','#c8d0dc',22))}<span>银两</span><b>+<em class="cnt" data-v="${sil}" style="font-style:normal">0</em></b></div>
    <div class="ln">${U.tag(U.blot('物','#d9b36c',22))}<span>战利品</span><b>${dr}</b></div>
    ${lvl.map(l=>`<div class="lv">境界突破 · 第 ${l} 层<small>属性点 +3</small></div>`).join('')}
    <div class="go">点击或按 Enter 继续</div>`;
  $('bt').appendChild(w);
  // 数字滚动（纯表现）
  const t0=performance.now(),cs=[...w.querySelectorAll('.cnt')];const roll=()=>{if(!w.isConnected)return;const k=Math.min(1,(performance.now()-t0)/500);cs.forEach(c=>c.textContent=Math.round(+c.dataset.v*k));if(k<1)requestAnimationFrame(roll)};roll();
  await wait(350);
  await new Promise(r=>{const f=()=>{removeEventListener('keydown',kf,true);w.removeEventListener('pointerdown',f);B.click=null;r()};
    const kf=e=>{if(['Enter',' ','z','Z','Escape'].includes(e.key)){e.preventDefault();e.stopPropagation();f()}};
    addEventListener('keydown',kf,true);w.addEventListener('pointerdown',f);B.click=()=>f()});
  bsfx('select');w.remove()}
// 预热：字体注入 + 常用素材在空闲时生成（避免首个战斗帧卡顿）
(function(){try{BUI.injectFonts()}catch(e){}const warm=()=>{try{const U=BUI;U.swash(W||960,170,{seed:33,halo:'#d8c49a',haloA:.3,a:.86,dry:.5,head:.03,tail:.28,thick:.8,wave:.05,pr:1});U.swash(900,12,{seed:21,halo:'#d8c49a',haloA:.4,a:.9,dry:.45,head:.02,tail:.3,thick:.66,wave:.25,pr:1})}catch(e){}};
  setTimeout(()=>window.requestIdleCallback?requestIdleCallback(warm,{timeout:3000}):warm(),1200)})();

// ───────── 队伍状态条：参照《八方旅人》的紧凑横条（无大头像；名字 + 蓄势 | 气血数字/细条 | 内力数字/细条） ─────────
// 覆盖上面 battleCSS 的面板尺寸与排布；主题切换重建样式时用 !important 保持生效。
(function(){const st=document.createElement('style');st.id='bui-compact';st.textContent=`
#bt-cards{width:182px!important;right:6px!important;bottom:123px!important;gap:3px!important}
#bt-cards .bt-card{height:36px!important}
#bt-cards .bt-card.cur{transform:translateX(-10px)!important}
#bt-cards .bt-card::before{left:0!important;top:0!important;bottom:0!important;opacity:.62!important}
#bt-cards .bt-card.cur::before,#bt-cards .bt-card.tgt::before{opacity:.95!important}
#bt-cards .bt-card .fc,#bt-cards .bt-card .rg{display:none!important}
#bt-cards .bt-card .inf{left:8px!important;right:6px!important;top:2px!important;bottom:2px!important;display:grid!important;grid-template-columns:50px 1fr 1fr!important;column-gap:6px!important;align-items:center!important}
#bt-cards .bt-card .nm{flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;height:auto!important;gap:1px}
#bt-cards .bt-card .nm .n{font-size:14px!important;line-height:16px!important;letter-spacing:.02em!important}
#bt-cards .bt-card .pips .bt-pip{width:8px!important;height:8px!important}
#bt-cards .bt-card .ln{flex-direction:column-reverse!important;align-items:stretch!important;gap:1px!important;height:auto!important}
#bt-cards .bt-card .bar{--bw:54px!important;width:100%!important;height:4px!important;background-size:100% 100%!important}
#bt-cards .bt-card .bar i,#bt-cards .bt-card .bar b{background-size:54px 4px!important}
#bt-cards .bt-card .v{text-align:right!important;font-size:13px!important;line-height:14px!important;min-width:0!important}
#bt-cards .bt-card .ln.mp .v{font-size:12px!important}
#bt-cards .bt-card .st{right:2px!important;top:-8px!important}
#bt-cards .bt-card .tp{top:10px!important}
/* 指令菜单：紧凑短列表（参照《八方旅人》） */
.th-ink #bt-cmd{width:152px!important}
.th-ink #bt-cmd .hd{height:25px!important;padding:0 8px 0 16px!important}
.th-ink #bt-cmd .hd b{font-size:15px!important}
.th-ink #bt-cmd .hd span{font-size:11px!important}
.th-ink #bt-cmd .row{height:23px!important;margin:0!important;padding:0 8px 0 16px!important}
.th-ink #bt-cmd .row .l{font-size:14px!important}
.th-ink #bt-cmd .row .r{font-size:10px!important}
.th-ink #bt-cmd .row .cur{left:1px!important;top:4px!important}
.th-ink #bt-cmd .row.sel{transform:translateX(-8px)!important}
#bt-cmd .kn{width:8px!important;font-size:9px!important}
#bt-cmd .ft .lb{display:none!important}
#bt-cmd .ft .n{font-size:0!important}#bt-cmd .ft .n b{font-size:13px!important}
#bt-cmd .ft .pips .bt-pip{width:10px!important;height:10px!important}
`;document.head.appendChild(st)})();

// ═════════ 布局 v4：按《八方旅人》原作截图对齐（结构照原作，质感保留水墨） ═════════
// 原作要点：左上「大菱形当前行动者 + 细线串小菱形」行动顺序；右上无框状态（名字 + BP 点 / 大号 HP 当前/上限 + 细条 / SP）；
// 指令菜单紧挨当前角色身侧；敌人脚下淡盾牌 +「弱点」+ 一排小方格；被选中敌人泛红；无常驻按键提示。
(function(){const st=document.createElement('style');st.id='bui-ot';st.textContent=`
#bt-help{display:none!important}
#bt-cards{top:6px!important;right:44px!important;bottom:auto!important;width:206px!important;gap:2px!important}
#bt-cards .bt-card{height:54px!important;transform:none!important}
#bt-cards .bt-card::before{content:''!important;background:linear-gradient(270deg,rgba(6,4,10,.78) 0%,rgba(6,4,10,.55) 55%,rgba(6,4,10,0) 100%)!important;left:0!important;right:0!important;top:0!important;bottom:0!important;opacity:1!important;transform:none!important;filter:none!important}
#bt-cards .bt-card.cur::before{background:linear-gradient(270deg,rgba(60,40,12,.85) 0%,rgba(40,26,8,.6) 60%,rgba(40,26,8,0) 100%)!important}
#bt-cards .bt-card.cur{box-shadow:inset -2px 0 0 #f0c878!important}
#bt-cards .bt-card.tgt::before{background:linear-gradient(270deg,rgba(20,60,36,.85),rgba(20,60,36,0))!important}
#bt-cards .bt-card .inf{left:26px!important;right:8px!important;top:2px!important;bottom:3px!important;display:flex!important;flex-direction:column!important;justify-content:space-between!important;gap:0!important}
#bt-cards .bt-card .nm{flex-direction:row!important;align-items:center!important;justify-content:space-between!important;height:16px!important}
#bt-cards .bt-card .nm .n{font-size:15px!important;line-height:16px!important}
#bt-cards .bt-card .pips .bt-pip{width:8px!important;height:8px!important}
#bt-cards .bt-card .ln{position:relative!important;display:flex!important;flex-direction:column-reverse!important;height:auto!important;gap:0!important;padding-left:18px!important}
#bt-cards .bt-card .ln::before{position:absolute;left:0;top:0;font:12px/14px var(--serif);color:#d8cbb0;text-shadow:0 1px 2px #000}
#bt-cards .bt-card .ln.hp::before{content:'血'}#bt-cards .bt-card .ln.mp::before{content:'内'}
#bt-cards .bt-card .v{text-align:right!important;font-size:15px!important;line-height:15px!important}
#bt-cards .bt-card .v.hp::after{content:'/' attr(data-max);font-size:11px;color:#b8ab90;margin-left:1px}
#bt-cards .bt-card .v.mp{font-size:12px!important;line-height:12px!important}
#bt-cards .bt-card .v.mp::after{content:'/' attr(data-max);font-size:10px;color:#90a8b4;margin-left:1px}
#bt-cards .bt-card .bar{--bw:162px!important;width:100%!important;height:3px!important}
#bt-cards .bt-card .bar i,#bt-cards .bt-card .bar b{background-size:162px 3px!important}
#bt-cards .bt-card .ln.mp .bar{height:2px!important}
#bt-cards .bt-card .st{left:2px!important;right:auto!important;top:4px!important;flex-direction:column!important}
#bt-cards .bt-card .tp{left:-16px!important;top:18px!important}
`;document.head.appendChild(st)})();

// 状态数值加「/上限」（原作 HP 250/250）
{const _rc=renderCards;renderCards=function(){_rc();const el=$('bt-cards');if(!el||!B)return;
  B.allies.forEach((u,i)=>{const c=el.children[i];if(!c)return;const hv=c.querySelector('.v.hp'),mv=c.querySelector('.v.mp');
    if(hv&&hv.dataset.max!==String(u.mhp))hv.dataset.max=u.mhp;if(mv&&mv.dataset.max!==String(u.mmp))mv.dataset.max=u.mmp})}}

// 指令菜单：挂在当前角色身侧（右侧放得下放右侧，否则左侧），顶端约与角色胸口齐
{const _at=allyTurn;allyTurn=function(u){const p=_at(u);const cmd=$('bt-cmd');
  const fit=()=>{if(!cmd||cmd.hidden||!B||B.cur!==u)return;const w=cmd.offsetWidth||160,h=cmd.offsetHeight||180,uh=unitH(u);
    // 候选：右侧（原作习惯）/ 左侧 / 头顶上方；选遮挡其他单位（身体框）与右上状态栏最少者，同分优先右侧
    const cands=[[u.x+uh*.26+8,u.y-uh*.95],[u.x-uh*.26-8-w,u.y-uh*.95],[u.x-w*.5,u.y-uh-h-8]].map(([x0,y0])=>[clamp(x0,8,952-w),clamp(y0,70,540-8-h)]);
    const ov=(ax,ay,aw,ah,bx,by,bw,bh)=>Math.max(0,Math.min(ax+aw,bx+bw)-Math.max(ax,bx))*Math.max(0,Math.min(ay+ah,by+bh)-Math.max(ay,by));
    const cs=$('bt-cards'),sr=cs?[cs.offsetLeft,cs.offsetTop,cs.offsetWidth,cs.offsetHeight]:[0,0,0,0];
    let best=cands[0],bs=1e12;cands.forEach(([x0,y0],i)=>{let sc=i*50;for(const v of B.units){if(v===u||v.hp<=0)continue;const vh=unitH(v),vw=vh*.5;sc+=ov(x0,y0,w,h,v.x-vw/2,v.y-vh,vw,vh)*(v.side==='ally'?3:1)}
      sc+=ov(x0,y0,w,h,...sr)*2;sc+=ov(x0,y0,w,h,u.x-uh*.25,u.y-uh,uh*.5,uh)*4;if(sc<bs){bs=sc;best=[x0,y0]}});
    cmd.style.left=Math.round(best[0])+'px';cmd.style.top=Math.round(best[1])+'px';cmd.style.bottom=''};
  const mo=new MutationObserver(fit);if(cmd)mo.observe(cmd,{childList:true,attributes:true,attributeFilter:['hidden','style']});
  let raf=0;const loop=()=>{fit();if(B&&B.cur===u&&!cmd.hidden)raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  return p.finally(()=>{mo.disconnect();cancelAnimationFrame(raf)})}}

// 行动顺序：左上大菱形（当前行动者）+ 细线串起小菱形；「››」分隔下回合
function buiDia(u,cx,cy,s,dim,big){const U=BUI;const hh=s/Math.SQRT2;g.save();g.translate(cx,cy);g.rotate(Math.PI/4);
  g.fillStyle=u.side==='foe'?'rgba(64,18,16,.92)':'rgba(16,38,56,.92)';g.fillRect(-hh/2,-hh/2,hh,hh);
  g.beginPath();g.rect(-hh/2,-hh/2,hh,hh);g.save();g.clip();g.rotate(-Math.PI/4);const f=U.face(u,Math.round(s*1.1));
  if(f){g.imageSmoothingEnabled=true;g.drawImage(f,-s*.55,-s*.52,s*1.1,s*1.1)}else{g.fillStyle='#ddd';g.font=`${Math.round(s*.4)}px var(--serif),serif`;g.textAlign='center';g.fillText(u.name[0],0,s*.14)}
  if(dim){g.fillStyle='rgba(0,0,0,.5)';g.fillRect(-s,-s,2*s,2*s)}g.restore();
  g.strokeStyle=big?'#f4e2b0':u.side==='foe'?'#e08a74':'#9fd0e8';g.lineWidth=big?2:1.2;g.strokeRect(-hh/2,-hh/2,hh,hh);
  if(big){g.strokeStyle='rgba(244,226,176,.45)';g.lineWidth=1;g.strokeRect(-hh/2-5,-hh/2-5,hh+10,hh+10)}g.restore();
  if(u.side==='foe'&&u.broken){const sl=U.poshiSeal?U.poshiSeal(Math.round(s*.46)):null;if(sl)g.drawImage(sl,cx-s*.1,cy+s*.02,s*.46,s*.46)}}
function drawOrderBar(now){if(!B||!B.round)return;g.save();
  const y=44,x0=46,cur=B.cur&&B.cur.hp>0?B.cur:null;
  const rest=B.order.filter(u=>u.hp>0&&!B.done.has(u)&&u!==cur),nxt=B.next.filter(u=>u.hp>0&&!(u.side==='foe'&&u.broken&&u.brokenUntil>=B.round+1));
  const xe=x0+46+rest.length*32+30+nxt.length*28+12;
  const gr=g.createLinearGradient(x0,0,xe,0);gr.addColorStop(0,'rgba(240,228,200,.75)');gr.addColorStop(1,'rgba(240,228,200,.12)');
  g.strokeStyle=gr;g.lineWidth=1;g.beginPath();g.moveTo(x0+30,y+.5);g.lineTo(xe,y+.5);g.stroke();
  if(cur){const s=58+Math.sin(now/300)*1.5;buiDia(cur,x0,y,s,false,true)}
  let x=x0+48;for(const u of rest){buiDia(u,x,y,28,false,false);x+=32}
  x+=4;g.fillStyle='rgba(240,228,200,.7)';g.font='14px var(--serif),serif';g.textAlign='center';g.fillText('››',x+6,y+5);x+=24;
  if(nxt.length){g.font='11px var(--serif),serif';g.textAlign='left';g.fillStyle='rgba(240,228,200,.75)';g.fillText('下一回合',x-12,y-22);g.strokeStyle='rgba(240,228,200,.45)';g.beginPath();g.moveTo(x-12,y-17.5);g.lineTo(x+nxt.length*28,y-17.5);g.stroke()}
  for(const u of nxt){buiDia(u,x,y,24,true,false);x+=28}
  g.restore()}

// 敌人脚下：淡盾牌 + 数字、「弱点」+ 一排小方格（未知为「？」），被选中/悬停时显示细血条
function drawShieldRow(u,t){const U=BUI,x=u.x,y=u.y+8,n=u.weak.length,cs=15,gap=3,tg=B.tgtList&&B.tgtList.includes(u)&&(B.tgtAll||B.tgtList[B.tsel]===u);
  const pv=B.pv&&B.tgtList&&B.tgtList.includes(u)?B.pv(B.bpUse):null,w=n*(cs+gap)-gap,bx=Math.round(x-w/2+10),by=y+14;
  g.save();g.imageSmoothingEnabled=true;
  // 盾牌
  const sx=bx-20,sy=by-4,hit=u.shieldHit?Math.max(0,1-(t-u.shieldHit)/300):0,sc=1+hit*.35;
  g.save();g.translate(sx+6,sy+8);g.scale(sc*1.3,sc*1.3);g.beginPath();g.moveTo(-9,-10);g.lineTo(9,-10);g.lineTo(9,1);g.quadraticCurveTo(9,8,0,12);g.quadraticCurveTo(-9,8,-9,1);g.closePath();
  g.fillStyle=u.broken?'rgba(80,70,70,.8)':'rgba(40,84,130,.82)';g.fill();g.strokeStyle=u.broken?'#aaa':'rgba(200,232,255,.9)';g.lineWidth=1.2;g.stroke();
  g.fillStyle='#fff';g.font='bold 12px var(--serif),serif';g.textAlign='center';g.fillText(u.broken?'破':u.shield,0,4);g.restore();
  // 「弱点」
  g.font='11px var(--serif),serif';g.textAlign='left';g.fillStyle='rgba(240,230,210,.9)';g.shadowColor='#000';g.shadowBlur=3;g.fillText('弱点',bx,by-4);g.shadowBlur=0;
  u.weak.forEach((wk,i)=>{const cx=bx+i*(cs+gap),kn=u.known.has(wk),hot=kn&&pv&&(pv.t===wk||pv.e===wk);
    g.fillStyle=u.broken?'rgba(40,40,40,.75)':'rgba(14,12,18,.78)';g.fillRect(cx,by,cs,cs);
    g.strokeStyle=hot?`rgba(255,226,90,${.6+.4*Math.sin(t/110)})`:kn?(WCOL[wk]||'#ccc'):'rgba(200,200,200,.55)';g.lineWidth=hot?2:1;g.strokeRect(cx+.5,by+.5,cs-1,cs-1);
    if(kn){const ic=U.weakIcon(wk);if(ic)g.drawImage(ic,cx+1,by+1,cs-2,cs-2)}else{g.fillStyle='rgba(230,230,230,.85)';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText('?',cx+cs/2,by+11.5)}});
  const recent=u.ghT&&t-u.ghT<1500;if(tg||recent||(B.hover&&unitAt(...B.hover)===u)){g.fillStyle='rgba(0,0,0,.7)';g.fillRect(bx,by+cs+3,w,3);g.fillStyle='#d0402c';g.fillRect(bx,by+cs+3,w*u.hp/u.mhp,3)}
  g.restore()}
