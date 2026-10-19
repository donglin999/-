/* 东方剑侠像素特效 v2：先烘焙精细素材（图集），再组合演出。
 * 640×360 特效像素空间（与战斗特效层一致），整数 2 倍放大到 1280×720 舞台。
 * 图集素材按需烘焙并缓存：月牙剑气、剑痕、碎光、竹叶、飞剑（按 48 个角度预旋转，避免运行时旋转锯齿）、
 * 光晕、星芒、如意云、水墨远山、山形锋面、地面涟漪、尘烟。范围与预算见 docs/design/sword-vfx-xianxia.md。
 * 仅表现：不结算伤害、不播声音。
 */
(function(root){
 'use strict';
 const W=640,H=360,GS=4,TAU=Math.PI*2,ANG=48;
 const GROUP=[[-92,-20],[-70,26]];// 评审舞台群体演示：第 2、3 名敌人相对主目标的偏移（特效像素）
 const B8=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21].map(v=>(v+.5)/64);
 const dth=(x,y)=>B8[(x&7)+((y&7)<<3)];
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,win=(t,a,b)=>clamp((t-a)/(b-a));
 const out3=k=>1-Math.pow(1-clamp(k),3),inout=k=>{k=clamp(k);return k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2},back=k=>{k=clamp(k);return 1+2.7*Math.pow(k-1,3)+1.7*Math.pow(k-1,2)};
 const accel=k=>{k=clamp(k);return .07*k+.93*Math.pow(k,3.6)};// 前段缓收、末段骤然提速
 function rng(seed){let s=seed>>>0||1;return()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
 const hash=(a,b)=>{let h=Math.imul(a|0,374761393)+Math.imul(b|0,668265263)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296};
 // 六阶色带：0 描边暗 → 5 白芯
 const RAMP={
  jade:['#0c2e2e','#175450','#2f8f7a','#58c9a4','#a6f0d2','#effff8'],
  sky:['#121f3c','#24497a','#3f7fbf','#78bfe8','#c2eaff','#ffffff'],
  gold:['#2e1608','#7a4218','#c47a26','#eeb64e','#ffe39a','#fffbea'],
  mist:['#3d4f5c','#6c8494','#9db4c2','#cddde5','#eef6f8','#ffffff'],
  dust:['#221e1c','#3e3832','#5e564c','#857a6c','#b0a492','#d6cbb8'],
  red:['#3a0c10','#7a1e22','#b8352e','#e05a4a','#f59a7a','#ffd0c0'],
  white:['#40506a','#8a9ab8','#c8d4ea','#e8f0fa','#f8fbff','#ffffff'],
  // 属性色带（docs/design/damage-numbers.md 第 1 节）：0 描边 → 3 数字主色 → 5 白芯
  fire:['#5a1606','#9a2c14','#d8482a','#ff6a3d','#ffb08a','#fff0e6'],
  frost:['#0e2a44','#1e4f78','#4c94c8','#8fd8ff','#ccefff','#ffffff'],
  thunder:['#3a1a5a','#6a3a8a','#c79a3a','#ffe25a','#fff0a8','#fffbe8'],
  wind:['#0f3a2a','#1f6a4c','#3fae84','#7fe3b5','#c2f5dd','#f2fff8'],
  sun:['#5a3200','#8a5410','#d89a32','#ffc35a','#ffe3a6','#fffbea'],
  yin:['#24184a','#43307a','#7a62c8','#b79cff','#dccfff','#f6f2ff'],
  heal:['#0e3a22','#1f6a40','#46b070','#7fe0a0','#c4f4d4','#f2fff6'],
  plain:['#3a2a1a','#6a5638','#b8a888','#fff3e0','#fffaf0','#ffffff']
 };
 const INK=['#05070c','#0d1220','#182036','#253150','#3a4a6e','#6b7ea6','#b9c8e6'];
 const rgbC={};const rgb=h=>rgbC[h]||(rgbC[h]=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)));
 const mkCanvas=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c};
 function paint(w,h,fn){const c=mkCanvas(w,h),x=c.getContext('2d'),im=x.createImageData(c.width,c.height),d=im.data;fn((px,py,hex)=>{if(px<0||py<0||px>=c.width||py>=c.height)return;const [r,g,b]=rgb(hex),i=(py*c.width+px)*4;d[i]=r;d[i+1]=g;d[i+2]=b;d[i+3]=255});x.putImageData(im,0,0);return c}

 // ───────── 形状函数：局部坐标（朝 +x），返回色阶 0–5 或 -1 ─────────
 const SH={
  // 月牙：外圆减去后移内圆；前缘白芯，内缘暗；尖端抖动消隐；后侧拖出长短不一的飞白丝
  arc(R,o){const tipT=Math.atan2(Math.sqrt(Math.max(1,R*R-o*o/4)),-o/2);return(lx,ly,X,Y)=>{const d1=Math.hypot(lx,ly),d2=Math.hypot(lx+o,ly);
   if(d1<R&&d2>=R){const a=R-d1,b=d2-R,f=a/(a+b+1e-6),th=Math.atan2(ly,lx),tf=Math.abs(th)/tipT;if(tf>.74&&(tf-.74)/.26>dth(X,Y))return-1;
    if(f>.5&&hash(Math.round(d1),Math.floor(th*R/3))<.32*f)return-1;let t=f<.1?5:f<.28?4:f<.52?3:f<.8?2:1;if(tf>.86)t=Math.max(1,t-1);return t}
   if(d1<R&&d2<R){const lane=Math.round(ly/1.4),L=o*(.5+1.8*hash(lane,7));if(hash(lane,3)<.45&&R-d2<L&&(1-(R-d2)/L)>dth(X,Y))return hash(lane,9)<.3?3:2}
   if(d1>=R&&d1<R+1.3&&hash(X*7+Y*131,13)<.06)return 5;return-1}},
  // 剑痕：两头尖的楔形，中心白芯，外侧一圈暗描边；gap 为中段留白；side 只取半截
  slash(L,w,gap=0,side=0){return(lx,ly)=>{const u=lx/(L/2);if(Math.abs(u)>=1||(gap&&Math.abs(u)<gap)||(side&&u*side<0))return-1;const hw=w*Math.pow(1-u*u,.8),f=Math.abs(ly)/Math.max(.5,hw);
   if(f>1)return f<1+1.2/hw&&hw>1.8?1:-1;if(f>.4&&hash(Math.round(ly*1.5),Math.floor(lx/5))<.25*f)return-1;return f<.22?5:f<.5?4:f<.8?3:2}},
  shard(L,w){return(lx,ly)=>{const v=Math.abs(lx)/L+Math.abs(ly)/w;return v<.4?5:v<.75?4:v<1?2:-1}},
  leaf(L,w){return(lx,ly)=>{const u=lx/L+.5;if(u<0||u>1)return-1;const c=(u-.5)*w*.5,hw=w*Math.pow(Math.sin(Math.PI*Math.pow(u,.75)),.9),dv=Math.abs(ly-c),f=dv/Math.max(.4,hw);if(f>1)return-1;return dv<.6&&u<.92?4:f>.72?1:u>.65?3:2}},
  // 飞剑：剑尖在原点，剑身沿 -x；中脊白、上侧亮、下侧暗、外描边；如意护手、缠绳剑柄、环形剑首
  sword(L){const bl=L*.72,bw=Math.max(1.6,L*.042),tip=L*.11,gw=Math.max(2,L*.045),gs=Math.max(4,L*.12),gl=L*.19;return(lx,ly)=>{const u=-lx,a=Math.abs(ly);
   if(u>=-.6&&u<bl){const hw=bw*Math.min(1,Math.max(0,u)/tip)+.35;if(a<=hw){if(a<.6)return 5;const edge=a>hw-1;return ly<0?(edge?3:4):(edge?1:2)}return a<=hw+1?0:-1}
   if(u>=bl&&u<bl+gw){const curl=gs+1.5*Math.sin((u-bl)/gw*Math.PI);if(a<curl)return a>curl-1.4?2:(u-bl<1?4:3);return a<curl+1?0:-1}
   if(u>=bl+gw&&u<bl+gw+gl){if(a<1.7)return(Math.round(u+ly*2)%3===0)?1:2;return a<2.7?0:-1}
   const pu=u-(bl+gw+gl);if(pu>=0&&pu<5){const d=Math.hypot(pu-2.2,ly);return d<1?4:d<2.3?3:d<3.2?0:-1}return-1}}
 };

 // ───────── 图集：按需烘焙，缓存 ─────────
 class Atlas{
  constructor(){this.cache=new Map()}
  get size(){return this.cache.size}
  get(key,make){let s=this.cache.get(key);if(!s){s=make();this.cache.set(key,s)}return s}
  // 预旋转烘焙：e 为局部最大半径，ang 量化到 48 个方向
  bake(key,ramp,e,ang,fn){const b=((Math.round(ang/TAU*ANG)%ANG)+ANG)%ANG;return this.get(key+'|'+ramp+'@'+b,()=>{const a=b/ANG*TAU,c=Math.cos(a),s=Math.sin(a),S=Math.ceil(e)*2+3,h=S>>1,R=RAMP[ramp];
   return{c:paint(S,S,set=>{for(let Y=0;Y<S;Y++)for(let X=0;X<S;X++){const px=X-h,py=Y-h,t=fn(px*c+py*s,-px*s+py*c,X,Y);if(t>=0)set(X,Y,R[t])}}),ax:h,ay:h}})}
  glow(ramp,r){r=Math.max(2,Math.round(r));return this.get('glow'+ramp+r,()=>{const S=r*2+1,R=RAMP[ramp];return{c:paint(S,S,set=>{for(let y=0;y<S;y++)for(let x=0;x<S;x++){const d=Math.hypot(x-r,y-r)/r;if(d>=1)continue;const v=Math.pow(1-d,1.6);if(v<dth(x,y)*.9)continue;set(x,y,R[v>.7?5:v>.42?4:v>.2?3:2])}}),ax:r,ay:r}})}
  star(ramp,s){s=Math.max(1,Math.round(s));return this.get('star'+ramp+s,()=>{const S=s*2+1,R=RAMP[ramp];return{c:paint(S,S,set=>{for(let i=-s;i<=s;i++){const k=Math.abs(i)/s,t=k<.25?5:k<.6?4:3;set(s+i,s,R[t]);set(s,s+i,R[t])}const d=Math.round(s*.4);for(let i=1;i<=d;i++)for(const [a,b] of [[1,1],[1,-1],[-1,1],[-1,-1]])set(s+a*i,s+b*i,R[i<2?4:2]);if(s>=4)for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]])set(s+a,s+b,R[5])}),ax:s,ay:s}})}
  smoke(r,ramp='dust'){r=Math.max(2,Math.round(r));return this.get('smoke'+ramp+r,()=>{const S=r*2+1,R=RAMP[ramp];return{c:paint(S,S,set=>{for(let y=0;y<S;y++)for(let x=0;x<S;x++){const dx=(x-r)/r,dy=(y-r)/r,d=Math.hypot(dx,dy*1.2);if(d>=1)continue;const v=1-d;if(v*1.6<dth(x,y))continue;const l=clamp(.55-dy*.5-dx*.2+(hash(x>>1,y>>1)-.5)*.3);set(x,y,R[1+Math.min(4,Math.floor(l*5))])}}),ax:r,ay:r}})}
  ring(ramp,rx,asp=.26){rx=Math.max(4,Math.round(rx/3)*3);return this.get('ring'+ramp+rx+asp,()=>{const ry=rx*asp,Sw=rx*2+5,Sh=Math.ceil(ry*2)+5,R=RAMP[ramp],cx=Sw>>1,cy=Sh>>1;return{c:paint(Sw,Sh,set=>{for(let y=0;y<Sh;y++)for(let x=0;x<Sw;x++){const d=Math.hypot((x-cx)/rx,(y-cy)/ry),e=Math.abs(d-1)*rx;if(e<.8)set(x,y,R[y<cy?5:4]);else if(e<2.2&&d<1&&dth(x,y)<.55)set(x,y,R[3]);else if(e<3.5&&d<1&&dth(x,y)<.2)set(x,y,R[2])}}),ax:cx,ay:cy}})}
  // 如意云：圆团并集，每像素取最高的圆团做球面光照，色阶抖动过渡；外描边、顶缘亮边、圆团之间勾分界线、云头卷纹
  cloud(seed,w,pal=INK){const key='cloud'+seed+'_'+w+pal[0];return this.get(key,()=>{const R=rng(seed),n=Math.max(5,Math.round(w/20)),h=w*.36,P=[];
   for(let i=0;i<n;i++){const u=i/(n-1);P.push([w/2+(u-.5)*w*.78+(R()-.5)*4,h*.72-Math.sin(u*Math.PI)*h*.3+(R()-.5)*5,h*(.26+.3*Math.sin(u*Math.PI))*(.85+R()*.3)])}
   for(let i=0;i<n-1;i++){const u=(i+.5)/(n-1);P.push([w/2+(u-.5)*w*.72+(R()-.5)*3,h*.9,h*(.15+R()*.07)])}
   const Wd=Math.ceil(w+8),Hd=Math.ceil(h*1.2+8),id=new Int16Array(Wd*Hd).fill(-1),Lx=-.4,Ly=-.72,Lz=.57;
   for(let y=0;y<Hd;y++)for(let x=0;x<Wd;x++){let best=-1,bz=-1;for(let i=0;i<P.length;i++){const dx=x-P[i][0],dy=y-P[i][1],q=P[i][2]*P[i][2]-dx*dx-dy*dy;if(q>0){const z=Math.sqrt(q);if(z>bz){bz=z;best=i}}}id[y*Wd+x]=best}
   const at=(x,y)=>x<0||y<0||x>=Wd||y>=Hd?-1:id[y*Wd+x];
   const c=paint(Wd,Hd,set=>{for(let y=0;y<Hd;y++)for(let x=0;x<Wd;x++){const i=at(x,y);if(i<0)continue;
    if(at(x-1,y)<0||at(x+1,y)<0||at(x,y-1)<0||at(x,y+1)<0){set(x,y,pal[1]);continue}
    if(at(x,y-1)<0||at(x,y-2)<0){set(x,y,pal[6]);continue}
    const [cx,cy,r]=P[i],nx=(x-cx)/r,ny=(y-cy)/r,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),l=clamp(nx*Lx+ny*Ly+nz*Lz),v=1.6+l*4.2;let k=Math.floor(v);if(v-k>dth(x,y))k++;k=Math.min(6,Math.max(2,k));
    const j=at(x+1,y),m=at(x,y+1);if((j>=0&&j!==i&&P[j][2]<r)||(m>=0&&m!==i&&P[m][2]<r)){set(x,y,pal[Math.max(1,k-3)]);continue}
    set(x,y,pal[k])}
    for(let q=0;q<2;q++){const p=P[1+Math.floor(R()*(n-2))],cr=p[2]*.5,dir=R()<.5?1:-1;for(let t=0;t<TAU*1.2;t+=.08){const rr=cr*(1-t/(TAU*1.35)),x=Math.round(p[0]+Math.cos(t*dir)*rr),y=Math.round(p[1]-p[2]*.15+Math.sin(t)*rr*.8);if(at(x,y)>=0&&at(x,y+1)>=0){set(x,y,pal[6]);set(x,y+1,pal[2])}}}});
   return{c,ax:Wd/2,ay:Hd*.6}})}
  // 水墨远山：脊线中点位移；向光坡描亮边、短皴笔；下缘抖动入雾
  // 水墨远山：若干尖峰取下包络（国画式峰形）叠加细碎起伏；向光坡描亮边、短皴笔；下缘抖动入雾
  mountain(seed,{h=150,peaks=7,hi=.75,fill=[INK[2],INK[3],INK[4]],rim='#b8a57a',peakAt=-1}={}){return this.get('mt'+seed+h+peaks,()=>{const R=rng(seed),Wd=W+40,n=128,noise=new Float32Array(n+1);
   let step=n,a=10;while(step>1){const half=step>>1;for(let i=half;i<n;i+=step)noise[i]=(noise[i-half]+noise[i+half])/2+(R()-.5)*a;a*=.6;step=half}
   const P=[];for(let i=0;i<peaks;i++)P.push([(i+.2+R()*.6)/peaks*Wd,h*(1-hi*(.35+R()*.65)),.55+R()*.9]);if(peakAt>=0)P.push([peakAt+20,h*(1-hi*1.05),.7]);
   const top=x=>{let y=h*.85;for(const [px,py,sl] of P)y=Math.min(y,py+Math.abs(x-px)*sl*(1+.25*Math.sin((x-px)*.09)));const f=x/Wd*n,i=Math.min(n-1,Math.max(0,Math.floor(f)));return Math.max(3,y+lerp(noise[i],noise[i+1],f-i))};
   return{c:paint(Wd,h,set=>{for(let x=0;x<Wd;x++){const ty=Math.round(top(x)),slope=top(x+2)-top(x-2),lit=slope<0;for(let y=ty;y<h;y++){const d=y-ty,f=d/(h-ty);if(f>.45&&(1-f)/.55<dth(x,y))continue;
     if(d<1){set(x,y,lit?rim:fill[1]);continue}let k=lit&&d<12?2:d<5?1:0;if(hash(Math.floor((x+y*(lit?.7:-.7))/3),Math.floor(y/5))<.14)k=Math.max(0,k-1);if(lit&&hash(x*3,y)<.05)k=2;set(x,y,fill[k])}}}),ax:0,ay:0,w:Wd}})}
  // 山形锋面：左右两半分别烘焙（以便劈开），底边中点为锚
  peak(s=1){return this.get('peak'+s,()=>{const P=[[-100,0],[-80,-44],[-62,-30],[-38,-86],[-20,-66],[0,-150],[20,-66],[38,-86],[62,-30],[80,-44],[100,0]].map(([x,y])=>[x*s,y*s]),R=RAMP.gold,Wd=Math.ceil(100*s)+3,Hd=Math.ceil(150*s)+3;
   const top=x=>{for(let i=1;i<P.length;i++)if(x<=P[i][0]){const [xa,ya]=P[i-1],[xb,yb]=P[i];return{y:lerp(ya,yb,(x-xa)/(xb-xa)),lit:yb<ya,i}}return{y:0,lit:false,i:P.length-1}};
   const half=side=>paint(Wd,Hd,set=>{for(let X=0;X<Wd;X++){const x=side<0?X-Wd+1:X,{y:ty,lit,i}=top(x);for(let Y=0;Y<Hd;Y++){const y=Y-Hd+1;if(y<ty-1)continue;
     if(y<ty){set(X,Y,R[1]);continue}const d=y-ty,f=d/Math.max(1,-ty);let k=Math.abs(x)<1.5?5:d<1.6?5:lit?(d<8?4:3):(d<5?3:2);
     const vx=P[i][1]<P[i-1][1]?P[i][0]:P[i-1][0];if(Math.abs(x-vx-(y-Math.min(P[i][1],P[i-1][1]))*(vx<0?-.35:.35))<.8&&k<5)k=lit?5:1;
     if(f>.35&&hash(Math.floor((x+y*.6)/3),Math.floor(y/4))<.16)k=Math.max(1,k-1);if(f>.7&&(1-f)/.3*1.3<dth(X,Y))continue;set(X,Y,R[k])}}});
   return{l:{c:half(-1),ax:Wd-1,ay:Hd-1},r:{c:half(1),ax:0,ay:Hd-1}}})}
 }

 // 5×7 像素数字
 const PLUS='00000001000010011111001000010000000';
 const DIG=['01110100011001110101110011000101110','00100011000010000100001000010001110','01110100010000100010001000100011111','11110000010000101110000010000111110','00010001100101010010111110001000010','11111100001111000001000011000101110','00110010001000011110100011000101110','11111000010001000100010000100001000','01110100011000101110100011000101110','01110100011000101111000010001001100'];

 const IMG={};
 class WuxiaFX{
  constructor(out,{bg=null,hero=null,foe=null,overlay=false}={}){
   this.overlay=overlay;this.out=out;this.o=out?out.getContext('2d'):null;this.bg=bg;this.hero=hero;this.foe=foe;this.glowOn=true;this.atlas=new Atlas();
   this.M=overlay?{x:200,y:120}:{x:0,y:0};const M=this.M;// 叠加模式四周留白：战斗中按舞台尺度放大演出，元素可能超出 640×360
   this.L={back:mkCanvas(W+2*M.x,H+2*M.y),front:mkCanvas(W+2*M.x,H+2*M.y),ui:mkCanvas(W+2*M.x,H+2*M.y)};this.cx={};for(const k in this.L){this.cx[k]=this.L[k].getContext('2d');this.cx[k].imageSmoothingEnabled=false}
   this.gC=mkCanvas((W+2*M.x)/GS,(H+2*M.y)/GS);this.g=this.gC.getContext('2d');this.sil=mkCanvas(360,204);
   this.A={hand:{x:429,y:171},target:{x:184,y:208},ground:{x:184,y:271},foot:{x:505,y:271}};  // foot：评审舞台施法者脚下＝身体中线（少侠精灵在特效空间约 391–632，中线约 505；原 452 偏向剑尖）this.T=null;this.AL=null;this.group=0;this.bp=0;this.quiet=false;this.reset();
  }
  // 生成素材（assets/fx/sword_v1/manifest.json）：加载一次，所有实例共用
  static async load(base){const m=await(await fetch(base+'manifest.json',{cache:'no-store'})).json();await Promise.all(Object.entries(m).map(([id,e])=>new Promise((ok,no)=>{const im=new Image();im.onload=()=>{IMG[id]={img:im,w:e.w,h:e.h,add:e.blend==='add'};ok()};im.onerror=()=>no(Error('素材加载失败 '+e.file));im.src=base+e.file})));return Object.keys(IMG).length}
  // 画一张生成素材：(x,y) 为锚点（ax/ay 为素材内比例），rot 弧度，sx/sy 缩放（负值翻转），clip=[u0,u1] 只显示横向区间
  // boost：逐招“主体放大”（2026-10-08 实战评审：战斗尺度下主体过小），skill.noBoost 里的素材（缩放表示距离或铺满画面的）不放大
  img(layer,id,x,y,{a=1,add,rot=0,sx=1,sy=1,ax=.5,ay=.5,clip=null}={}){const s=IMG[id],sk=this.skill,bo=sk&&sk.boost&&!(sk.noBoost&&sk.noBoost.includes(id.split('@')[0]))?sk.boost:1;sx*=bo;sy*=bo;if(!s||a<=.01||!sx||!sy)return;const c=this.cx[layer];c.save();c.globalCompositeOperation=(add??s.add)?'lighter':'source-over';c.globalAlpha=Math.min(1,a);c.translate(Math.round(x),Math.round(y));if(rot)c.rotate(rot);c.scale(sx,sy);
   if(clip){c.beginPath();c.rect(-s.w*ax+clip[0]*s.w,-s.h*ay-2,(clip[1]-clip[0])*s.w,s.h+4);c.clip()}c.drawImage(s.img,-s.w*ax,-s.h*ay);c.restore()}
  // 短时素材实例：缩放、透明度随寿命插值，可带速度
  pop(id,x,y,{life=400,delay=0,sc=[1,1],a=[1,0],layer='front',add,rot=0,spin=0,vx=0,vy=0,ax=.5,ay=.5,flip=false,ease=out3}={}){(this.s.pops||(this.s.pops=[])).push({id,x,y,t0:this.t+delay,life,sc,a,layer,add,rot,spin,vx,vy,ax,ay,flip,ease})}
  drawPops(layer){for(const p of this.s.pops||[]){if(p.layer!==layer)continue;const e=this.t-p.t0;if(e<0||e>p.life)continue;const k=e/p.life,q=p.ease(k),sc=lerp(p.sc[0],p.sc[1],q),al=lerp(p.a[0],p.a[1],k),s=e/1000;
   this.img(layer,p.id,p.x+p.vx*s,p.y+p.vy*s,{a:al,add:p.add,rot:p.rot+p.spin*s,sx:sc*(p.flip?-1:1),sy:sc,ax:p.ax,ay:p.ay})}}
  reset(){this.skill=null;this.t=0;this.parts=[];this.nums=[];this.fired=new Set();this.s={};this.shakeAmt=0;this.fl=null;this.hitUntil=-1;this.used=0;this.dropped=0;this.peak=0}
  play(name,seed=7,{bp=0}={}){const sk=SKILLS[name];if(!sk)throw Error('WuxiaFX: unknown skill '+name);this.reset();this.skill=sk;this.name=name;this.bp=Math.max(0,Math.min(3,bp|0));this.budget=(sk.budget||1e9)*(1+.2*this.bp);this.rand=rng(seed);sk.init?.(this)}
  // 目标与我方锚点：战斗中由 wuxia-battle.js 写入 T/AL（每项 {x,y 胸口, gx,gy 脚下}）；评审舞台按 group 生成演示目标
  targets(){if(this.T&&this.T.length)return this.T;const t={x:this.A.target.x+5,y:this.A.target.y-8,gx:this.A.ground.x,gy:this.A.ground.y};return[t,...GROUP.slice(0,Math.max(0,this.group-1)).map(([dx,dy])=>({x:t.x+dx,y:t.y+dy,gx:t.gx+dx,gy:t.gy+dy}))]}
  allies(){return this.AL&&this.AL.length?this.AL:[{x:this.A.foot.x,y:this.A.hand.y+14,gx:this.A.foot.x,gy:this.A.foot.y}]}  // 评审舞台默认我方 = 施法者身体（不是手）
  get done(){return!this.skill||this.t>=this.skill.dur}
  once(key,cond,fn){if(cond&&!this.fired.has(key)){this.fired.add(key);fn()}}
  hit(mode,ms){this.hitMode=mode;this.hitUntil=this.t+ms}
  flash(col,a,ms){this.fl={col,a,t0:this.t,ms}}
  shake(n){this.shakeAmt=Math.max(this.shakeAmt,n)}
  num(text,x,y,o={}){if(this.quiet)return;this.nums.push({text,x,y,scale:1,ramp:'gold',age:0,life:1100,...o})}
  spawn(o){if(this.used>=this.budget){this.dropped++;return}this.used++;this.parts.push({x:0,y:0,vx:0,vy:0,ax:0,ay:0,drag:0,age:0,life:500,kind:'px',layer:'front',add:true,ramp:'gold',size:1,rot:0,spin:0,alpha:1,seed:this.rand()*99,...o})}
  update(dt){
   if(!this.skill)return;this.t+=dt;this.skill.update?.(this,this.t,dt);if(this.bp)bpCharge(this,this.t,dt);const s=dt/1000;
   this.parts=this.parts.filter(p=>{p.age+=dt;if(p.age>=p.life)return false;p.px=p.x;p.py=p.y;
    if(p.pull){const dx=p.pull.x-p.x,dy=p.pull.y-p.y,d=Math.hypot(dx,dy)||1;if(d<2&&p.kill!==false)return false;p.vx+=(dx/d*p.pullF-dy/d*(p.swirl||0))*s;p.vy+=(dy/d*p.pullF+dx/d*(p.swirl||0))*s}
    p.vx+=p.ax*s;p.vy+=p.ay*s;const k=Math.exp(-p.drag*s);p.vx*=k;p.vy*=k;p.x+=p.vx*s;p.y+=p.vy*s;p.rot+=p.spin*s;return true});
   this.peak=Math.max(this.peak,this.parts.length);for(const n of this.nums)n.age+=dt;this.nums=this.nums.filter(n=>n.age<n.life);this.shakeAmt=Math.max(0,this.shakeAmt-dt*.03);
  }
  // ── 绘制原语 ──
  spr(layer,s,x,y,{a=1,add=false,sx=1,sy=1}={}){if(a<=.01||!s)return;const c=this.cx[layer];c.globalCompositeOperation=add?'lighter':'source-over';c.globalAlpha=Math.min(1,a);c.drawImage(s.c,Math.round(x-s.ax*sx),Math.round(y-s.ay*sy),Math.round(s.c.width*sx),Math.round(s.c.height*sy))}
  rect(layer,x,y,w,h,col,a=1,add=false){if(a<=.01)return;const c=this.cx[layer];c.globalCompositeOperation=add?'lighter':'source-over';c.globalAlpha=Math.min(1,a);c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)))}
  line(layer,x0,y0,x1,y1,col,a=1,add=true){if(a<=.01)return;const c=this.cx[layer],n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));c.globalCompositeOperation=add?'lighter':'source-over';c.globalAlpha=Math.min(1,a);c.fillStyle=col;for(let i=0;i<=n;i++)c.fillRect(Math.round(lerp(x0,x1,i/n)),Math.round(lerp(y0,y1,i/n)),1,1)}
  gdot(x,y,r,col,a=1){if(a<=.01)return;const g=this.g,X=x/GS,Y=y/GS,R=Math.max(.8,r/GS),gr=g.createRadialGradient(X,Y,0,X,Y,R);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=Math.min(1,a);g.fillStyle=gr;g.fillRect(X-R,Y-R,R*2,R*2)}
  gline(pts,w,col,a=1){if(a<=.01||pts.length<2)return;const g=this.g;g.globalAlpha=Math.min(1,a);g.strokeStyle=col;g.lineWidth=Math.max(.5,w/GS);g.lineCap='round';g.beginPath();g.moveTo(pts[0][0]/GS,pts[0][1]/GS);for(const p of pts)g.lineTo(p[0]/GS,p[1]/GS);g.stroke()}
  grect(x,y,w,h,col,a=1){if(a<=.01)return;this.g.globalAlpha=Math.min(1,a);this.g.fillStyle=col;this.g.fillRect(x/GS,y/GS,w/GS,h/GS)}
  // 运行时剑气光带（长度与角度逐帧变化时用）：六阶明暗、外描边、飞白断丝、头尾显隐
  beam(layer,x0,y0,x1,y1,w,ramp,{head=1,tail=1,shape='blunt',a=1,seed=1,glow=1}={}){
   if(a<=.01||head<=0)return;const R=RAMP[ramp],c=this.cx[layer],len=Math.hypot(x1-x0,y1-y0),n=Math.max(4,Math.ceil(len)),ang=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(ang),ny=Math.cos(ang),bins=[[],[],[],[],[],[]],u0=Math.max(0,head-tail);
   for(let i=0;i<=n;i++){const u=i/n;if(u>head||u<u0)continue;const prof=shape==='blunt'?Math.min(1,u*5)*Math.pow(1-u,.5):shape==='even'?1:Math.pow(Math.sin(Math.PI*u),.6),tf=tail<1?clamp((u-u0)/(tail*.3)):1,ww=w*prof*(.3+.7*tf)/2;if(ww<.4)continue;
    const x=lerp(x0,x1,u),y=lerp(y0,y1,u);for(let d=-ww-1;d<=ww+1;d+=.6){const rel=Math.abs(d)/ww,X=Math.round(x+nx*d),Y=Math.round(y+ny*d);if(rel>1){if(ww>1.8&&rel<1+1/ww)bins[1].push(X,Y);continue}
     if(rel>.45&&hash(Math.round(d*1.4)+seed*31,Math.floor(i/(3+(Math.round(d)&3))))<.3*rel)continue;if(tf<1&&tf<dth(X,Y))continue;bins[rel<.2?5:rel<.45?4:rel<.75?3:2].push(X,Y)}}
   c.globalCompositeOperation='source-over';c.globalAlpha=Math.min(1,a);for(let k=1;k<6;k++){c.fillStyle=R[k];const b=bins[k];for(let i=0;i<b.length;i+=2)c.fillRect(b[i],b[i+1],1,1)}
   if(glow){const h=lerp(x0,x1,head),hy=lerp(y0,y1,head),tx=lerp(x0,x1,u0),ty=lerp(y0,y1,u0);this.gline([[tx,ty],[h,hy]],w*2.4*glow,R[3],a*.6)}
  }
  drawParts(layer){
   for(const p of this.parts){if(p.layer!==layer)continue;const k=p.age/p.life,R=RAMP[p.ramp],tone=Math.max(1,Math.min(5,Math.round(lerp(p.tone??5,1,Math.pow(k,1.3))))),a=p.alpha*(p.fadeIn?Math.min(1,p.age/p.fadeIn):1)*(1-Math.pow(k,p.fade||1.4));
    switch(p.kind){
     case'streak':this.line(layer,p.x-p.vx*(p.len||.03),p.y-p.vy*(p.len||.03),p.x,p.y,R[tone],a,p.add);break;
     case'star':{const tw=.55+.45*Math.sin(p.age*.03+p.seed);this.spr(layer,this.atlas.star(p.ramp,Math.max(1,p.size*tw*(1-k*.5))),p.x,p.y,{a,add:true});break}
     case'shard':this.spr(layer,this.atlas.bake('sh'+p.size,p.ramp,p.size+1,p.rot,SH.shard(p.size,Math.max(1,p.size*.28))),p.x,p.y,{a,add:p.add});break;
     case'leaf':this.spr(layer,this.atlas.bake('lf'+p.size,p.ramp,p.size+1,p.rot,SH.leaf(p.size*2,p.size*.45)),p.x,p.y,{a});break;
     case'smoke':this.spr(layer,this.atlas.smoke(p.size*(1+k*1.3),p.ramp),p.x,p.y,{a:a*.9});break;
     case'orb':this.spr(layer,this.atlas.glow(p.ramp,p.size),p.x,p.y,{a,add:true});break;
     default:this.rect(layer,p.x,p.y,p.size,p.size,R[tone],a,p.add)}
    if(p.glow)this.gdot(p.x,p.y,p.glow,R[3],a*.6)}
  }
  // 文字浮字（异常名、解除等）：按 damage-numbers.md 第 3 节颜色，小字号深色描边
  label(text,x,y,col,o={}){if(this.quiet)return;this.nums.push({label:text,col,x,y,age:0,life:900,px:11,...o})}
  drawNums(){const c=this.cx.ui;c.globalCompositeOperation='source-over';
   for(const n of this.nums){if(!n.label)continue;const k=n.age/n.life,a=k>.72?1-(k-.72)/.28:1;c.globalAlpha=a;c.font=`bold ${n.px}px "PingFang SC","Hiragino Sans GB",sans-serif`;c.textAlign='center';c.lineWidth=3;c.strokeStyle=n.stroke||'#0a0610';  // stroke：可选描边色（解除浮字用异常色描边，damage-numbers.md §3）
   const y=Math.round(n.y-out3(k)*16);c.strokeText(n.label,Math.round(n.x),y);c.fillStyle=n.col;c.fillText(n.label,Math.round(n.x),y)}
   c.textAlign='start';
   for(const n of this.nums){if(n.label)continue;const k=n.age/n.life,S=n.scale+(n.age<80?1:0),a=k>.72?1-(k-.72)/.28:1,R=RAMP[n.ramp],w=n.text.length*6*S-S,x0=Math.round(n.x-w/2),y0=Math.round(n.y-out3(k)*22-(n.age<80?3:0));c.globalAlpha=a;
    for(const pass of [0,1,2])for(let i=0;i<n.text.length;i++){const m=n.text[i]==='+'?PLUS:DIG[+n.text[i]];if(!m)continue;for(let r=0;r<7;r++)for(let q=0;q<5;q++)if(m[r*5+q]==='1'){const X=x0+i*6*S+q*S,Y=y0+r*S;
     if(pass===0){c.fillStyle='#0a0610';c.fillRect(X-1,Y-1,S+2,S+3)}else if(pass===1){c.fillStyle=R[1];c.fillRect(X,Y+1,S,S)}else{c.fillStyle=r<2?R[5]:r<4?R[4]:R[3];c.fillRect(X,Y,S,S)}}}}
  }
  render(){
   const M=this.M;for(const k in this.cx){const c=this.cx[k];c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.globalAlpha=1;c.clearRect(0,0,c.canvas.width,c.canvas.height);c.setTransform(1,0,0,1,M.x,M.y)}
   const g=this.g;g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,this.gC.width,this.gC.height);g.setTransform(1,0,0,1,M.x/GS,M.y/GS);g.globalCompositeOperation='lighter';
   this.tint=null;this.vig=0;this.zoom=null;if(this.skill){this.skill.draw(this,this.t);if(this.bp)bpAura(this,this.t);if(this.skill.set==='v4'&&this.skill.leadAura!==false)leadAura(this,this.t)}
   this.drawPops('back');this.drawPops('front');this.drawParts('back');this.drawParts('front');this.drawNums();if(!this.overlay)this.composite();
  }
  // 叠加模式（接入战斗）：不画背景与角色；back 层在战斗背景之后、角色之前画，front/辉光/ui 在角色之后画。压暗减半，暗角与推镜交给战斗镜头
  drawBackInto(o,ow,oh){o.save();o.imageSmoothingEnabled=false;if(this.tint){o.globalAlpha=this.tint[1]*.5;o.fillStyle=this.tint[0];o.fillRect(-ow*3,-oh*3,ow*7,oh*7);o.globalAlpha=1}const S=ow/W,M=this.M,R=[-M.x*S,-M.y*S,(W+2*M.x)*S,(H+2*M.y)*S];o.drawImage(this.L.back,...R);o.restore()}
  drawFrontInto(o,ow,oh){const S=ow/W,M=this.M,R=[-M.x*S,-M.y*S,(W+2*M.x)*S,(H+2*M.y)*S];o.save();o.imageSmoothingEnabled=false;o.drawImage(this.L.front,...R);
   if(this.glowOn){o.globalCompositeOperation='lighter';o.imageSmoothingEnabled=true;o.filter='blur(8px)';o.drawImage(this.gC,...R);o.filter='none';o.imageSmoothingEnabled=false;o.globalCompositeOperation='source-over'}
   o.drawImage(this.L.ui,...R);if(this.fl){const k=(this.t-this.fl.t0)/this.fl.ms;if(k<1){o.globalCompositeOperation='lighter';o.globalAlpha=this.fl.a*.6*(1-k);o.fillStyle=this.fl.col;o.fillRect(-ow*3,-oh*3,ow*7,oh*7)}}o.restore()}
  drawChars(o){
   const k=this.out.width/960;if(this.hero)o.drawImage(this.hero,13*396,0,396,210,(720-133.1)*k,(417-192.15)*k,362.3*k,192.15*k);
   if(!this.foe)return;const mode=this.t<this.hitUntil?this.hitMode:null,fr=mode?12:0,w=329.4*k,h=186.66*k;
   if(mode){const s=this.sil.getContext('2d');s.globalCompositeOperation='source-over';s.clearRect(0,0,360,204);s.drawImage(this.foe,fr*360,0,360,204,0,0,360,204);s.globalCompositeOperation='source-in';s.fillStyle=mode==='white'?'#ffffff':'#0d0716';s.fillRect(0,0,360,204)}
   const offs=[[0,0],...GROUP.slice(0,Math.max(0,this.group-1))].sort((a,b)=>a[1]-b[1]);
   for(const [ox,oy] of offs){const dx=(300-186.66+ox*1.5)*k,dy=(417-186.66+oy*1.5)*k;if(mode)o.drawImage(this.sil,0,0,360,204,dx,dy,w,h);else o.drawImage(this.foe,0,0,360,204,dx,dy,w,h)}
  }
  composite(){
   const o=this.o,ow=this.out.width,oh=this.out.height,S=ow/W;o.save();o.setTransform(1,0,0,1,0,0);o.clearRect(0,0,ow,oh);
   if(this.shakeAmt>0)o.translate(Math.round((Math.random()-.5)*2*this.shakeAmt)*S,Math.round((Math.random()-.5)*2*this.shakeAmt)*S);
   if(this.zoom&&this.zoom.s!==1){const z=this.zoom;o.translate(z.x*S,z.y*S);o.scale(z.s,z.s);o.translate(-z.x*S,-z.y*S)}
   o.imageSmoothingEnabled=false;if(this.bg)o.drawImage(this.bg,0,0,ow,oh);o.fillStyle='rgba(7,12,27,.3)';o.fillRect(0,0,ow,oh);
   if(this.tint){o.globalAlpha=this.tint[1];o.fillStyle=this.tint[0];o.fillRect(0,0,ow,oh);o.globalAlpha=1}
   if(this.vig>0){const g=o.createRadialGradient(ow*.4,oh*.55,oh*.22,ow*.4,oh*.55,ow*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(2,3,8,'+this.vig+')');o.fillStyle=g;o.fillRect(0,0,ow,oh)}
   o.drawImage(this.L.back,0,0,ow,oh);this.drawChars(o);o.drawImage(this.L.front,0,0,ow,oh);
   if(this.glowOn){o.globalCompositeOperation='lighter';o.imageSmoothingEnabled=true;o.filter='blur(8px)';o.drawImage(this.gC,0,0,ow,oh);o.filter='none';o.imageSmoothingEnabled=false;o.globalCompositeOperation='source-over'}
   o.drawImage(this.L.ui,0,0,ow,oh);
   if(this.fl){const k=(this.t-this.fl.t0)/this.fl.ms;if(k<1){o.globalCompositeOperation='lighter';o.globalAlpha=this.fl.a*(1-k);o.fillStyle=this.fl.col;o.fillRect(-40,-40,ow+80,oh+80);o.globalAlpha=1;o.globalCompositeOperation='source-over'}}
   o.restore();
  }
 }

 // ───────── 组合件 ─────────
 const chest=fx=>fx.targets()[0];
 const quad=(p0,p1,p2)=>u=>{const v=1-u;return[v*v*p0[0]+2*v*u*p1[0]+u*u*p2[0],v*v*p0[1]+2*v*u*p1[1]+u*u*p2[1],Math.atan2(2*v*(p1[1]-p0[1])+2*u*(p2[1]-p1[1]),2*v*(p1[0]-p0[0])+2*u*(p2[0]-p1[0]))]};
 const arcSpr=(fx,R,ramp,ang)=>fx.atlas.bake('arc'+R,ramp,R+2,ang,SH.arc(R,R*.4));
 // 月牙剑气＋残影；echo 为沿路径向后的残影数
 function qi(fx,layer,path,q,R,ramp,{a=1,echo=3,gap=.045,glow=1}={}){
  for(let i=echo;i>=0;i--){const qq=q-i*gap;if(qq<0)continue;const [x,y,ang]=path(qq);fx.spr(layer,arcSpr(fx,Math.max(6,Math.round(R*(1-i*.12))),ramp,ang),x,y,{a:a*(i?.5/i:1)})}
  const [x,y]=path(q);if(glow)fx.gdot(x,y,R*2.6,RAMP[ramp][3],a*.8*glow);
 }
 function shed(fx,x,y,ang,ramp,n0,{sp=60,life=420,layer='front',back=1}={}){const R=fx.rand,n=n0*2;for(let i=0;i<n;i++){const u=ang+Math.PI*back+(R()-.5)*1.6,v=sp*(.3+R());fx.spawn({x:x+(R()-.5)*6,y:y+(R()-.5)*6,vx:Math.cos(u)*v,vy:Math.sin(u)*v-10,drag:2,life:life*(.6+R()*.8),ramp,layer,size:R()<.2?2:1,glow:R()<.15?5:0})}}
 // 命中：剑痕＋白闪＋碎光／碎片／星芒＋局部光爆＋数字
 function strike(fx,x,y,ang,{ramp='jade',L=40,w=4,power=1,num='',scale=1,hit=90,shake=2,flash=0,gap=0,split=false,life=320}={}){
  const R=fx.rand,P=power;(fx.s.marks||(fx.s.marks=[])).push({x,y,ang,L,w,ramp,gap,split,life,t0:fx.t});(fx.s.bursts||(fx.s.bursts=[])).push({x,y,r:9+P*5,ramp,t0:fx.t});
  fx.hit('white',Math.round(hit*.6));fx.shake(shake);if(flash)fx.flash(RAMP[ramp][4],flash,140);if(num)fx.num(num,x+(R()-.5)*14,y-38-R()*10,{scale,ramp:ramp==='sky'?'sky':ramp==='jade'?'jade':'gold'});
  for(let i=0;i<20*P;i++){const u=ang+(R()<.5?0:Math.PI)+(R()-.5)*.7,v=90+R()*220*Math.sqrt(P);fx.spawn({x,y,vx:Math.cos(u)*v,vy:Math.sin(u)*v,drag:3.2,life:200+R()*300,kind:'streak',len:.028,ramp})}
  for(let i=0;i<16*P;i++){const u=R()*TAU,v=30+R()*150;fx.spawn({x,y,vx:Math.cos(u)*v,vy:Math.sin(u)*v-20,ay:60,drag:2,life:300+R()*500,ramp,size:R()<.25?2:1,glow:R()<.2?5:0})}
  for(let i=0;i<6*P;i++){const u=ang+(R()-.5)*1.2+(R()<.5?0:Math.PI),v=60+R()*160;fx.spawn({x,y,vx:Math.cos(u)*v,vy:Math.sin(u)*v,ay:120,drag:1.5,life:350+R()*400,kind:'shard',size:3+Math.round(R()*3),rot:R()*TAU,spin:(R()-.5)*18,ramp})}
  for(let i=0;i<Math.ceil(P*2.5);i++)fx.spawn({x:x+(R()-.5)*36,y:y+(R()-.5)*24,life:250+R()*300,kind:'star',size:2+Math.round(R()*2*P),ramp})}
 function drawHits(fx,layer){const t=fx.t;
  for(const b of fx.s.bursts||[]){const a=t-b.t0;if(a<0||a>160)continue;const k=a/160;fx.spr(layer,fx.atlas.glow(b.ramp,b.r*(1-k*.4)),b.x,b.y,{a:.8*(1-k),add:true});fx.gdot(b.x,b.y,b.r*3,RAMP[b.ramp][3],.8*(1-k))}
  for(const m of fx.s.marks||[]){const a=t-m.t0;if(a<0||a>m.life)continue;const k=a/m.life,L=Math.max(8,Math.round(m.L*Math.min(1,a/45)/4)*4),w=Math.max(1.5,Math.round(m.w*(1-k*.6)*2)/2),al=1-k*k;
   if(m.split&&a>120){const s=(a-120)*.06;for(const side of [-1,1])fx.spr(layer,fx.atlas.bake(`sl${L}_${w}_${m.gap}_${side}`,m.ramp,L/2+3,m.ang,SH.slash(L,w,m.gap,side)),m.x+Math.cos(m.ang)*side*s,m.y+Math.sin(m.ang)*side*s,{a:al})}
   else fx.spr(layer,fx.atlas.bake(`sl${L}_${w}_${m.gap}`,m.ramp,L/2+3,m.ang,SH.slash(L,w,m.gap)),m.x,m.y,{a:al});
   if(a<90)fx.gline([[m.x-Math.cos(m.ang)*L/2,m.y-Math.sin(m.ang)*L/2],[m.x+Math.cos(m.ang)*L/2,m.y+Math.sin(m.ang)*L/2]],m.w*3,RAMP[m.ramp][4],1-a/90)}
  for(const r of fx.s.ripples||[]){const k=win(t,r.t0,r.t0+r.dur);if(k<=0||k>=1)continue;fx.spr('back',fx.atlas.ring(r.ramp,8+r.rx*out3(k)),r.x,r.y,{a:(1-k)*r.a,add:true})}}
 const ripple=(fx,x,y,{rx=80,dur=600,delay=0,ramp='jade',a=1}={})=>(fx.s.ripples||(fx.s.ripples=[])).push({x,y,rx,dur,t0:fx.t+delay,ramp,a});
 // 飞剑：预旋转烘焙；reveal 自剑尖向剑首显现；红穗逐帧摆动
 function sword(fx,layer,x,y,ang,L,{ramp='gold',a=1,reveal=1,glow=1}={}){
  if(a<=.01)return;const s=fx.atlas.bake('sw'+L,ramp,L+2,ang,SH.sword(L)),dx=Math.cos(ang),dy=Math.sin(ang),c=fx.cx[layer];
  if(reveal<1){const r=L*clamp(reveal),nx=-dy*12,ny=dx*12;c.save();c.beginPath();c.moveTo(x+dx*3+nx,y+dy*3+ny);c.lineTo(x-dx*r+nx,y-dy*r+ny);c.lineTo(x-dx*r-nx,y-dy*r-ny);c.lineTo(x+dx*3-nx,y+dy*3-ny);c.closePath();c.clip();fx.spr(layer,s,x,y,{a});c.restore()}else fx.spr(layer,s,x,y,{a});
  if(glow)fx.gline([[x,y],[x-dx*L*.72*clamp(reveal),y-dy*L*.72*clamp(reveal)]],(L>80?12:7)*glow,RAMP[ramp][3],a*.75);
  if(reveal>=1){const e=L*(.72+.045+.19)+4,px=x-dx*e,py=y-dy*e,t=fx.t;for(const [o,len] of [[-1,8],[1,7]]){let qx=px,qy=py;for(let i=1;i<=len;i++){const sw=Math.sin(t*.012+i*.6+o)*.9,nx=qx-dx*1+(-dy)*sw*.6,ny=qy-dy*1+dx*sw*.6+.55;fx.rect(layer,nx,ny,1,1,RAMP.red[i<3?4:i<6?3:2],a);qx=nx;qy=ny}}}
 }
 const cloud=(fx,layer,seed,w,x,y,{a=1,pal=INK}={})=>fx.spr(layer,fx.atlas.cloud(seed,w,pal),x,y,{a});
 const MIST=['#4c606c','#6c8494','#93abb9','#b4c8d2','#d2e0e6','#e9f2f5','#ffffff'];
 const motes=(fx,cx,cy,rx,ry,ramp,n,{vy=-14,life=900,layer='front'}={})=>{const R=fx.rand;for(let i=0;i<n;i++)fx.spawn({x:cx+(R()-.5)*rx*2,y:cy+(R()-.5)*ry*2,vx:(R()-.5)*8,vy:vy*(.5+R()),life:life*(.6+R()*.8),ramp,layer,tone:4,fadeIn:150,glow:R()<.25?4:0,kind:R()<.12?'star':'px',size:R()<.12?2:1})};
 const converge=(fx,C,ramp,n,{r0=50,r1=110,F=300,swirl=90,life=700}={})=>{const R=fx.rand;for(let i=0;i<n;i++){const u=R()*TAU,d=r0+R()*(r1-r0);fx.spawn({x:C.x+Math.cos(u)*d,y:C.y+Math.sin(u)*d*.7,pull:C,pullF:F,swirl,life,ramp,tone:4,glow:R()<.2?4:0})}};

 // ───────── 五招编排（第三轮：生成素材 + 程序编排，逐帧对照 art_sources/sword_vfx_concepts_v1/） ─────────
 const SKILLS={};const add=(id,def)=>{SKILLS[id]={set:'sword',...def}};
 const PI=Math.PI;
 // 沿路径飞行的素材（素材朝左为前进方向），带残影
 function fly(fx,layer,id,path,k,{sc=1,echo=2,gap=.06,a=1,ax=.5}={}){for(let i=echo;i>=0;i--){const kk=k-i*gap;if(kk<0)continue;const [x,y,ang]=path(kk);fx.img(layer,id,x,y,{a:a*(i?.38/i:1),rot:ang-PI,sx:sc,sy:sc,ax})}}
 // 命中：生成素材光爆 + 程序碎光/剑痕 + 白闪 + 数字
 function blast(fx,id,x,y,ang,{sc=1,life=380,ramp='gold',...o}={}){fx.pop(id,x,y,{life,sc:[sc*.45,sc*1.1],a:[1,0]});fx.pop(id,x,y,{life:life*.35,sc:[sc*.9,sc*1.25],a:[.9,0],rot:.4});strike(fx,x,y,ang,{ramp,...o})}
 const smokeAt=(fx,x,y,n,{sc=1,spread=60,life=1300}={})=>{const R=fx.rand;for(let i=0;i<n;i++){const d=R()<.5?-1:1;fx.pop('smoke',x+d*(6+R()*spread*.4),y-6-R()*10,{life:life*(.7+R()*.6),sc:[sc*.5,sc*(1+R()*.6)],a:[.85,0],vx:d*(20+R()*spread),vy:-6-R()*10,flip:d<0,layer:'back',ease:k=>k})}};

 // ── 丁 · 试锋探路（概念 gy_s1_a）：竹青月牙由剑尖上挑飞至胸口，命中星爆，底部小回锋
 add('gy_s1',{grade:'丁',name:'试锋探路',dur:800,budget:200,
  init(fx){const H=fx.A.hand,C=chest(fx);fx.s.path=quad([H.x-14,H.y+4],[(H.x+C.x)/2+30,C.y+26],[C.x+6,C.y])},
  update(fx,t,dt){const H=fx.A.hand,C=chest(fx),R=fx.rand;
   if(t<110&&R()<dt/14)converge(fx,H,'jade',1,{r0:10,r1:24,F:260,swirl:60,life:300});
   const k=win(t,90,310);if(k>0&&k<1){const [x,y,a]=fx.s.path(accel(k));shed(fx,x,y,a,'jade',1,{sp:50,life:380})}
   fx.once('h',t>=310,()=>blast(fx,'hit_jade',C.x,C.y,-.6,{sc:.9,ramp:'jade',L:36,w:3,power:1,num:'38',hit:90,shake:1.5}))},
  draw(fx,t){const H=fx.A.hand,C=chest(fx);
   const ca=win(t,0,60)*(1-win(t,100,170));if(ca>0)fx.img('front','hit_jade',H.x-4,H.y,{a:ca,sx:.28+.1*win(t,0,100),sy:.28+.1*win(t,0,100)});
   const k=win(t,90,310);if(k>0&&k<1)fly(fx,'front','qi_jade',fx.s.path,accel(k),{sc:.62+.38*k,echo:2});
   const r=win(t,340,660);if(r>0&&r<1)fx.img('front','qi_jade',C.x+8,C.y+20-r*10,{a:1-r,rot:-1.3+r*1.6,sx:.32,sy:.32});
   drawHits(fx,'front')}});

 // ── 丙 · 拨云回锋（概念 gy_s2_a）：两道月牙一往一返交成留白叉形，两朵祥云被拨开，竹叶纷飞
 add('gy_s2',{grade:'丙',name:'拨云回锋',dur:1000,budget:400,
  init(fx){const H=fx.A.hand,C=chest(fx);fx.s.p1=quad([H.x-10,H.y],[(H.x+C.x)/2+20,C.y-100],[C.x,C.y]);fx.s.p2=quad([C.x-80,C.y+50],[C.x-50,C.y+6],[C.x,C.y])},
  update(fx,t,dt){const C=chest(fx),R=fx.rand,s=fx.s;
   for(const [k,p,ease] of [[win(t,140,393),s.p1,accel],[win(t,393,460),s.p2,out3]])if(k>0&&k<1){const [x,y,a]=p(ease(k));shed(fx,x,y,a,'jade',2,{sp:60,life:420})}
   fx.once('h1',t>=393,()=>blast(fx,'hit_jade',C.x,C.y,.75,{sc:.8,ramp:'jade',L:44,w:3.5,power:1.3,num:'22',hit:80,shake:1.5,gap:.13,split:true,life:520}));
   fx.once('h2',t>=460,()=>{blast(fx,'hit_jade',C.x,C.y,-.75,{sc:1,ramp:'jade',L:44,w:3.5,power:1.6,num:'24',hit:90,shake:2,gap:.13,split:true,life:520});
    for(let i=0;i<10;i++)fx.spawn({x:C.x+(R()-.5)*30,y:C.y+(R()-.5)*30,vx:(R()-.5)*120,vy:-40-R()*60,ay:60,drag:.8,life:1100,kind:'leaf',size:4,rot:R()*TAU,spin:(R()-.5)*7,ramp:'jade'})});
   if(t>300&&t<900&&R()<dt/20)motes(fx,C.x,C.y,50,36,'jade',1)},
  draw(fx,t){const C=chest(fx),s=fx.s,part=out3(win(t,393,850))*34,ca=win(t,40,240)*(1-win(t,720,1000));
   fx.img('back','cloud_mist',C.x-40-part,C.y-34-part*.3,{a:ca});fx.img('back','cloud_mist',C.x+44+part,C.y+36+part*.3,{a:ca*.9,sx:-.85,sy:.85});
   const k1=win(t,140,393);if(k1>0&&k1<1)fly(fx,'front','qi_jade',s.p1,accel(k1),{sc:.75,echo:3,gap:.05});
   const k2=win(t,393,460);if(k2>0&&k2<1)fly(fx,'front','qi_jade',s.p2,out3(k2),{sc:.75,echo:2,gap:.1});
   const x=win(t,460,900);if(x>0&&x<1){const sp=out3(x)*16;for(const [r,dx,dy] of [[.75,-sp,-sp*.7],[-.75,-sp,sp*.7]])fx.img('front','qi_jade',C.x+dx,C.y+dy,{a:(1-x)*.8,rot:r,sx:.42,sy:.42})}
   drawHits(fx,'front')}});

 // ── 乙 · 一线开晴（概念 gy_s3_a）：上下墨云压紧 → 金线绷直 → 金白剑脊横贯 → 切口天光放射，云团震散
 add('gy_s3',{grade:'乙',name:'一线开晴',dur:1300,budget:800,
  update(fx,t,dt){const H=fx.A.hand,C=chest(fx),R=fx.rand;
   if(t<320&&R()<dt/5){const sd=R()<.5?-1:1;fx.spawn({x:C.x+sd*(100+R()*50),y:C.y+(R()-.5)*20,vx:-sd*240,life:300,kind:'streak',len:.04,ramp:'white',alpha:.45})}
   if(t>220&&t<480&&R()<dt/10){const u=R();fx.spawn({x:lerp(H.x,C.x,u),y:lerp(H.y,C.y,u),vx:(R()-.5)*10,vy:(R()-.5)*10,life:220,ramp:'gold',tone:5,glow:4})}
   if(t>480&&t<560)for(let i=0;i<3;i++)fx.spawn({x:lerp(H.x,C.x-90,R()),y:C.y+(R()-.5)*14,vx:-560,life:110,kind:'streak',len:.025,ramp:'gold'});
   if(t>520&&t<950&&R()<.9)for(let i=0;i<2;i++)fx.spawn({x:lerp(H.x,C.x-140,R()),y:C.y+(R()-.5)*5,vx:(R()-.5)*30,vy:(R()-.5)*30-10,drag:2,life:380,ramp:'gold',tone:5,glow:R()<.15?4:0});
   fx.once('h',t>=560,()=>{fx.s.cut=t;fx.pop('rays_gold',C.x,C.y,{life:750,sc:[.5,1.25],a:[1,0]});blast(fx,'hit_gold',C.x,C.y,PI,{sc:.7,ramp:'gold',L:70,w:5,power:2.8,num:'96',scale:2,hit:160,shake:3.5,flash:.22,life:460});
    for(let i=0;i<10;i++){const sd=i%2?-1:1;fx.pop('cloud_ink',C.x+(R()-.5)*160,C.y+sd*(46+R()*20),{life:700+R()*300,sc:[.22+R()*.12,.12],a:[.9,0],vx:(R()-.5)*160,vy:sd*(40+R()*60),ease:k=>k})}
    for(let i=0;i<24;i++){const sd=R()<.5?-1:1,u=-PI/2*sd+(R()-.5)*1.2;fx.spawn({x:C.x+(R()-.5)*80,y:C.y+sd*24,vx:Math.cos(u)*(30+R()*60),vy:Math.sin(u)*(30+R()*50),drag:1.2,life:900+R()*500,kind:'smoke',size:4+R()*4,ramp:'dust',add:false,alpha:.45,layer:'back'})}});
   if(fx.s.cut&&t<1150&&R()<dt/5)fx.spawn({x:C.x+(R()-.5)*140,y:C.y-40-R()*70,vx:(R()-.5)*6,vy:18+R()*14,life:900,ramp:'gold',tone:5,fadeIn:120,glow:R()<.3?4:0,kind:R()<.15?'star':'px',size:2})},
  draw(fx,t){const H=fx.A.hand,C=chest(fx),s=fx.s,end=1-win(t,1000,1300),press=inout(win(t,0,300))*12,open=s.cut?out3(win(t,s.cut,s.cut+500))*60:0,ca=win(t,0,140)*(1-win(t,880,1250));
   fx.tint=['#0a1024',.42*Math.min(win(t,0,220),end)];fx.vig=.3*Math.min(win(t,0,300),end);
   fx.img('front','cloud_ink',C.x-6,C.y-74+press-open,{a:.95*ca,sx:.85,sy:.85});fx.img('front','cloud_ink',C.x+10,C.y+66-press+open,{a:.95*ca,sx:-.8,sy:.8});
   if(t>=220&&t<480){const L=out3(win(t,220,460)),x1=lerp(H.x,C.x-6,L),y1=lerp(H.y,C.y,L),vib=Math.sin(t*.09)*.6;fx.line('front',H.x,H.y,x1,y1+vib,RAMP.gold[4],.7+.3*Math.sin(t*.07));fx.gline([[H.x,H.y],[x1,y1]],4,RAMP.gold[3],.6);fx.spr('front',fx.atlas.star('gold',3),x1,y1,{add:true})}
   const k=win(t,480,560),fade=1-win(t,620,1000),len=H.x-(C.x-150),sx=len/300,rot=Math.atan2(H.y-C.y,len);
   if(k>0&&fade>0)fx.img('front','beam_gold',H.x,H.y,{a:fade,rot,sx,sy:1+.4*(1-fade),ax:1,clip:[1-Math.pow(k,.35),1-.85*win(t,620,1000)]});
   if(s.cut){const ka=win(t,s.cut,s.cut+650);if(ka<1){const sp=1+out3(ka)*4;fx.line('front',C.x-130,C.y-sp,C.x+100,C.y-sp,'#ffffff',1-ka);fx.line('front',C.x-130,C.y+sp,C.x+100,C.y+sp,RAMP.gold[4],1-ka);fx.grect(C.x-140,C.y-6,280,12,RAMP.gold[4],.8*(1-ka))}}
   drawHits(fx,'front')}});

 // ── 甲 · 千岚归一（概念 gy_s4_a / gy_s4_b）：天青云刃两道试锋，主刃凝成金白飞剑骤贯，残影、光爆、涟漪、尘烟
 add('gy_s4',{grade:'甲',name:'千岚归一',dur:1800,budget:1600,
  init(fx){const H=fx.A.hand,C=chest(fx);fx.s.b=[{p:quad([H.x-60,H.y+96],[C.x+90,C.y+100],[C.x,C.y]),from:380,to:560,flip:1},{p:quad([H.x-70,H.y-120],[C.x+80,C.y-110],[C.x,C.y]),from:520,to:700,flip:-1}];fx.s.sx=H.x-8;fx.s.sy=H.y;fx.s.ang=Math.atan2(C.y-H.y,C.x-H.x)},
  update(fx,t,dt){const C=chest(fx),G=fx.A.ground,R=fx.rand,s=fx.s;
   if(t<900&&R()<dt/5)converge(fx,C,'sky',2,{r0:60,r1:130,F:260,swirl:120,life:800});
   if(t<1500&&R()<dt/8)motes(fx,320,180,320,160,'sky',1,{vy:-8,life:1400,layer:R()<.5?'back':'front'});
   for(const b of s.b){if(t>60&&t<b.to){const k=t<b.from?.16*out3(win(t,0,b.from)):.16+.84*accel(win(t,b.from,b.to)),[x,y,a]=b.p(k);shed(fx,x,y,a,'sky',t>b.from?3:1,{sp:50,life:500})}}
   fx.once('h1',t>=560,()=>blast(fx,'hit_jade',C.x,C.y,.9,{sc:.7,ramp:'sky',L:44,w:3.5,power:1.5,num:'42',hit:90,shake:2}));
   fx.once('h2',t>=700,()=>blast(fx,'hit_jade',C.x,C.y,-.9,{sc:.7,ramp:'sky',L:44,w:3.5,power:1.5,num:'46',hit:90,shake:2}));
   if(t>700&&t<880)for(let i=0;i<4;i++){const u=R(),x=s.sx-Math.cos(s.ang)*110*u,y=s.sy-Math.sin(s.ang)*110*u,a=R()*TAU,d=20+R()*20;fx.spawn({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d,pull:{x,y},pullF:500,life:300,ramp:'gold',tone:5})}
   if(t>880&&t<960)for(let i=0;i<4;i++)fx.spawn({x:lerp(s.sx,C.x+40,R()),y:lerp(s.sy,C.y,R())+(R()-.5)*16,vx:-620,life:100,kind:'streak',len:.025,ramp:'gold'});
   fx.once('h3',t>=960,()=>{s.big=t;blast(fx,'hit_gold',C.x,C.y,s.ang,{sc:1.15,ramp:'gold',L:96,w:7,power:3.2,num:'128',scale:2,hit:240,shake:5,flash:.3,life:520});
    fx.pop('ripple',G.x,G.y,{life:900,sc:[.3,1.1],a:[1,0],layer:'back'});fx.pop('ripple',G.x,G.y,{life:900,delay:140,sc:[.2,.8],a:[.8,0],layer:'back'});smokeAt(fx,C.x,G.y,8,{sc:1,spread:80})});
   if(s.big&&t>s.big+250&&t<s.big+650)for(let i=0;i<3;i++){const u=R(),x=C.x-40-Math.cos(s.ang)*110*u,y=C.y-Math.sin(s.ang)*110*u;fx.spawn({x,y,vx:(R()-.5)*30,vy:-20-R()*30,life:600,ramp:'gold',tone:5,glow:R()<.3?4:0})}},
  draw(fx,t){const H=fx.A.hand,C=chest(fx),s=fx.s,end=1-win(t,1350,1800);
   fx.tint=['#070b1c',.55*Math.min(win(t,0,250),end)];fx.vig=.58*Math.min(win(t,0,300),end);if(s.big){const z=win(t,s.big,s.big+340);fx.zoom={s:1+.07*(1-out3(z)),x:C.x,y:C.y}}
   const ca=win(t,0,220)*(1-win(t,1050,1450)),o=out3(win(t,1050,1450))*120;fx.img('back','cloud_ink',40-o,60,{a:.85*ca,sx:.6,sy:.6});fx.img('back','cloud_ink',W-40+o,300,{a:.85*ca,sx:-.6,sy:.6});fx.img('back','cloud_ink',W-60+o,40,{a:.6*ca,sx:-.45,sy:.45});fx.img('back','cloud_ink',30-o,320,{a:.6*ca,sx:.45,sy:.45});
   for(const b of s.b){if(t>=b.to)continue;const k=t<b.from?.16*out3(win(t,0,b.from)):.16+.84*accel(win(t,b.from,b.to)),al=win(t,0,180),[x,y,a]=b.p(k);
    for(let i=3;i>=0;i--){const kk=k-i*.04;if(kk<0||(t<b.from&&i))continue;const [ex,ey,ea]=b.p(kk);fx.img('front','qi_sky',ex,ey,{a:al*(i?.35/i:1),rot:ea-b.flip*PI/4,sx:.8,sy:.8*b.flip})}}
   if(t>=150&&t<720){const al=win(t,150,300)*(1-win(t,640,720));fx.img('front','hit_gold',H.x-12,H.y,{a:al*.8,sx:.3+.05*Math.sin(t*.02),sy:.3+.05*Math.sin(t*.02)})}
   if(t>=700&&t<880){const r=out3(win(t,700,860));fx.img('front','sword_gold',s.sx,s.sy,{rot:s.ang-PI,ax:1,clip:[1-r,1]});fx.spr('front',fx.atlas.star('gold',4+Math.round(r*3)),s.sx+Math.cos(s.ang)*110*r,s.sy+Math.sin(s.ang)*110*r,{add:true})}
   const dx=Math.cos(s.ang)*110,dy=Math.sin(s.ang)*110,tip=k=>[lerp(s.sx+dx,C.x-40,k),lerp(s.sy+dy,C.y,k)];
   if(t>=880&&t<960){const k=accel(win(t,880,960)),[x,y]=tip(k);fx.beam('front',s.sx,s.sy,x-dx,y-dy,9,'gold',{shape:'blunt',glow:1.2});for(let i=2;i>=1;i--){const [ex,ey]=tip(Math.max(0,k-i*.14));fx.img('front','sword_gold',ex,ey,{a:.32/i,rot:s.ang-PI,ax:0})}fx.img('front','sword_gold',x,y,{rot:s.ang-PI,ax:0})}
   if(t>=960){const k=win(t,960,1550);if(k<1){const [x,y]=tip(1),hx=x-dx,hy=y-dy;fx.beam('front',lerp(s.sx,hx,out3(k)),lerp(s.sy,hy,out3(k)),hx,hy,9*(1-k*.6),'gold',{a:1-k*k,glow:1.2});fx.img('front','sword_gold',x,y,{rot:s.ang-PI,ax:0,a:1-win(t,1250,1550)})}}
   drawHits(fx,'front')}});

 // ── 绝 · 云开见山（概念 gy_s5_a–d）：墨云合围、身后剑阵 → 三剑连斩 → 云开现远山天光 → 第四剑化山形锋面压落爆发 → 两翼折收 → 日出云海（定格）→ 山影落定
 // 2026-10-11 按标杆加强（xiaojianghu/docs/archive/design/vfx/upgrade-20261011.md）：七段；日轮、云海、山脊天光等本门素材由 js/fx/fx-gy.js 通过 realmBack／realmMid／realmFront 三个挂点画入，本文件只用公共素材包。
 add('gy_s5',{grade:'绝',name:'云开见山',dur:4000,budget:5600,
  init(fx){const H=fx.A.hand;fx.s.sw=[-2.7,-2.15,-.95,-1.57].map((a,i)=>({x:H.x+16+Math.cos(a)*118,y:H.y+34+Math.sin(a)*112,show:160+i*110,launch:[760,890,1000,1150][i],hit:[930,1060,1170,1620][i],ang:[-.6,.55,-.15][i]}))},
  update(fx,t,dt){const H=fx.A.hand,C=chest(fx),G=fx.A.ground,R=fx.rand,s=fx.s;
   if(t<3300&&R()<dt/5)motes(fx,320,170,320,170,'gold',1,{vy:-6,life:1600,layer:R()<.5?'back':'front'});
   if(t<1550&&R()<dt/3)fx.spawn({x:H.x+40+(R()-.5)*70,y:G.y-R()*8,vx:(R()-.5)*10,vy:-30-R()*50,life:900+R()*500,ramp:'gold',tone:5,fadeIn:100,glow:R()<.3?5:0,kind:R()<.12?'star':'px',size:R()<.15?2:1});
   if(t<700&&R()<dt/16){const d=R()<.5?1:-1;fx.spawn({x:d>0?-10:W+10,y:40+R()*260,vx:d*400,life:300,kind:'streak',len:.06,ramp:'white',alpha:.3})}
   s.sw.forEach((w,i)=>{if(t>w.show-120&&t<w.show+80)converge(fx,w,'gold',2,{r0:14,r1:40,F:420,swirl:140,life:300});
    if(i<3&&t>w.launch&&t<w.hit){const [x,y,a]=swPath(w,C,i)(accel(win(t,w.launch,w.hit)));shed(fx,x,y,a,'gold',3,{sp:70,life:500})}});
   fx.once('array',t>=600,()=>{fx.flash(RAMP.gold[4],.08,160);s.sw.forEach(w=>{fx.pop('hit_gold',w.x,w.y,{life:300,sc:[.25,.6],a:[1,0]});for(let i=0;i<10;i++){const u=R()*TAU;fx.spawn({x:w.x,y:w.y,vx:Math.cos(u)*(40+R()*80),vy:Math.sin(u)*(40+R()*80),drag:2.4,life:420,ramp:'gold',tone:5,glow:R()<.3?4:0})}})});
   fx.once('open',t>=1300,()=>{fx.flash('#ffe2a0',.1,220);fx.pop('rays_gold',C.x,34,{life:900,sc:[.5,1.7],a:[1,0],layer:'back'});for(let i=0;i<60;i++){const d=R()<.5?-1:1;fx.spawn({x:C.x+d*R()*60,y:20+R()*120,vx:d*(120+R()*260),vy:(R()-.5)*40,drag:1.6,life:700+R()*400,kind:'smoke',size:4+R()*5,ramp:'white',add:false,alpha:.4,layer:'back'})}});
   s.sw.slice(0,3).forEach((w,i)=>fx.once('h'+i,t>=w.hit,()=>blast(fx,'hit_gold',C.x,C.y,w.ang,{sc:.75,ramp:'gold',L:60,w:5,power:2.2,num:['88','96','104'][i],hit:120,shake:3,flash:.1})));
   if(t>1150&&t<1300)converge(fx,{x:C.x,y:40},'gold',3,{r0:30,r1:80,F:380,swirl:200,life:400});
   if(t>1480&&t<1620)for(let i=0;i<4;i++)fx.spawn({x:C.x+(R()-.5)*200,y:R()*120,vy:700,life:120,kind:'streak',len:.03,ramp:'gold',alpha:.8});
   fx.once('final',t>=1620,()=>{s.final=t;fx.pop('burst_peak',C.x,G.y+6,{life:1100,sc:[.45,1.15],a:[1,0],ax:.5,ay:.95});blast(fx,'hit_gold',C.x,C.y,PI/2,{sc:1.6,ramp:'gold',L:110,w:8,power:5,num:'420',scale:2,hit:360,shake:12,flash:.45,life:600});
    for(let i=0;i<90;i++){const u=-PI/2+(R()-.5)*2.6,v=120+R()*320;fx.spawn({x:C.x+(R()-.5)*60,y:G.y-R()*20,vx:Math.cos(u)*v,vy:Math.sin(u)*v,ay:260,drag:.9,life:900+R()*700,ramp:'gold',tone:5,size:R()<.3?2:1,glow:R()<.2?5:0,kind:R()<.12?'shard':'px',rot:R()*TAU,spin:(R()-.5)*14})}
    fx.pop('ripple',G.x,G.y,{life:1000,sc:[.4,1.8],a:[1,0],layer:'back'});fx.pop('ripple',G.x,G.y,{life:1000,delay:150,sc:[.3,1.3],a:[.9,0],layer:'back'});fx.pop('ripple',G.x,G.y,{life:900,delay:300,sc:[.2,.9],a:[.8,0],layer:'back'});smokeAt(fx,C.x,G.y,14,{sc:1.4,spread:140,life:1600})});
   // 日出云海（定格）：日轮自主峰后升起，金屑自云海向上涌；山影落定：余晖一线，金叶缓落
   fx.once('sunrise',t>=2080,()=>{s.sun=t;fx.flash('#fff0c8',.25,320);fx.shake(4);fx.pop('rays_gold',W/2+30,96,{life:1400,sc:[.8,2.6],a:[.9,0],layer:'back'});
    for(let i=0;i<170;i++)fx.spawn({x:R()*W,y:150+R()*90,vx:(R()-.5)*30,vy:-30-R()*110,drag:.7,life:1100+R()*900,ramp:'gold',tone:5,fadeIn:120,glow:R()<.18?4:0,kind:R()<.14?'star':'px',size:R()<.25?2:1,layer:R()<.5?'back':'front'})});
   fx.once('settle',t>=2950,()=>{ripple(fx,G.x,G.y,{rx:150,dur:900,ramp:'gold'});for(let i=0;i<26;i++)fx.spawn({x:R()*W,y:-6-R()*40,vx:-20+(R()-.5)*30,vy:40+R()*40,drag:.4,life:1000,kind:'leaf',size:4,rot:R()*TAU,spin:(R()-.5)*6,ramp:'gold',fade:2})});
   fx.skill.realmUpdate?.(fx,t,dt);
   if(t>1300&&t<3500&&R()<dt/2)fx.spawn({x:C.x+(R()-.5)*300,y:-4,vx:(R()-.5)*8,vy:22+R()*20,life:2200,ramp:'gold',tone:5,fadeIn:200,glow:R()<.25?4:0,kind:R()<.15?'star':'px',size:R()<.2?2:1,layer:R()<.4?'back':'front'})},
  draw(fx,t){const H=fx.A.hand,C=chest(fx),G=fx.A.ground,s=fx.s,end=1-win(t,3150,4000),sk=fx.skill;
   fx.tint=['#04050d',.74*Math.min(win(t,0,350),end)];fx.vig=.62*Math.min(win(t,0,400),end);
   if(s.final){const z=win(t,s.final,s.final+460);fx.zoom={s:1+.17*(1-out3(z))+(s.sun?.03*win(t,s.sun,s.sun+500)*(1-win(t,3000,3700)):0),x:C.x,y:C.y+16}}else if(t>1300)fx.zoom={s:1+.035*win(t,1300,1620),x:C.x,y:C.y}
   // 云开见山：远山、天光
   const ma=win(t,1150,1500)*end;sk.realmBack?.(fx,t,ma);if(ma>0){const my=186+(1-out3(win(t,1150,1600)))*16;fx.img('back','mountains',W/2,my,{a:ma,ay:1,sx:.95,sy:.95});if(fx.overlay&&IMG.mountains)for(const d of [-1,1])fx.img('back','mountains',W/2+d*IMG.mountains.w*.95,my,{a:ma,ay:1,sx:-.95,sy:.95});  // 战斗里特效层缩到约 0.75 倍，两侧补镜像免得露边
    fx.grect(C.x-50,0,100,G.y,'#ffcf70',.22*ma);fx.gdot(C.x,0,140,'#ffe2a0',.6*ma);
    for(let i=0;i<5;i++){const x=C.x+(i-2)*30;fx.beam('back',x,-4,x+(i-2)*12,G.y-30,5,'gold',{shape:'lens',a:.22*ma,glow:.6,seed:i})}}
   sk.realmMid?.(fx,t,ma);
   // 墨云合围 → 云开
   const roll=inout(win(t,0,650)),op=inout(win(t,1150,1450)),off=(1-roll)*240+op*320,ca=win(t,0,200)*(1-win(t,1380,1520));
   fx.img('back','cloud_ink',70-off,70,{a:ca,sx:1.05,sy:1.05});fx.img('back','cloud_ink',50-off*1.2,300,{a:ca,sx:1.1,sy:-1});fx.img('back','cloud_ink',W-70+off,60,{a:ca,sx:-1.05,sy:1.05});fx.img('back','cloud_ink',W-50+off*1.2,296,{a:ca,sx:-1.1,sy:-1});
   // 主角气环
   const au=win(t,0,300)*(1-win(t,1500,1900));if(au>0)fx.img('back','aura_gold',H.x+40,G.y-6,{a:au*(.8+.2*Math.sin(t*.01)),sx:1+.04*Math.sin(t*.006),sy:1,ay:.75});
   // 剑阵连线
   const la=win(t,500,700)*(1-win(t,760,1000));if(la>0)for(let i=0;i<3;i++){const a=s.sw[[0,1,3][i]],b=s.sw[[1,3,2][i]];fx.line('front',a.x,a.y,b.x,b.y,RAMP.gold[3],.5*la)}
   s.sw.forEach((w,i)=>{const show=win(t,w.show,w.show+150),bob=Math.sin(t*.006+i)*2;if(show<=0)return;
    if(i<3){if(t<w.launch){const ang=Math.atan2(C.y-w.y,C.x-w.x);fx.img('front','sword_gold',w.x,w.y+bob,{rot:ang-PI,sx:.8,sy:.8,ax:0,clip:[0,out3(show)]});if(show<1)fx.pop('hit_gold',w.x,w.y,{life:220,sc:[.2,.4],a:[.9,0]});return}
     if(t>=w.hit)return;const path=swPath(w,C,i),k=accel(win(t,w.launch,w.hit)),[x,y,a]=path(k),[tx,ty]=path(Math.max(0,k-.35));
     fx.beam('front',tx,ty,x,y,7,'gold',{shape:'blunt',glow:1.1,seed:i});for(let e=2;e>=1;e--){const [ex,ey,ea]=path(Math.max(0,k-e*.06));fx.img('front','sword_gold',ex,ey,{a:.3/e,rot:ea-PI,sx:.75,sy:.75,ax:0})}fx.img('front','sword_gold',x,y,{rot:a-PI,sx:.75,sy:.75,ax:0});return}
    if(t<w.launch){fx.img('front','sword_gold',w.x,w.y+bob,{rot:PI/2-PI,sx:.85,sy:.85,ax:0,clip:[0,out3(show)]});return}
    if(t<1300){const k=inout(win(t,w.launch,1300)),x=lerp(w.x,C.x,k),y=lerp(w.y,30,k),sc=lerp(.85,1.1,k);fx.img('front','sword_gold',x,y+60*sc,{rot:PI/2-PI,sx:sc,sy:sc,ax:0});fx.gdot(x,y+60*sc,40,'#ffd27a',.8);return}
    const form=back(win(t,1300,1480)),fall=Math.pow(win(t,1480,1620),2.2),by=lerp(150,G.y+4,fall),fa=Math.min(1,win(t,1300,1380)*1.3)*(1-win(t,(s.final||1e9)+60,(s.final||1e9)+260)),sc=.4+.6*form;
    if(t>=1480&&t<1620)for(let e=2;e>=1;e--)fx.img('front','peak_face',C.x,by-e*22,{a:.22/e*fa,sx:sc,sy:sc,ay:1});
    fx.img('front','peak_face',C.x,by,{a:fa,sx:sc,sy:sc,ay:1});fx.img('front','peak_face',C.x,by,{a:fa*.25,sx:sc,sy:sc,ay:1,add:true});fx.gdot(C.x,by-90*sc,180*sc,'#ffcf70',.8*fa)});
   // 两翼折收
   if(s.final){const k=win(t,s.final+80,s.final+1100);if(k>0&&k<1){const o=out3(k)*110,a=(1-k)*Math.min(1,k*6);fx.img('front','wing_gold',C.x-30-o,G.y+4,{a,ax:.7,ay:1,sx:.95,sy:.95*(1-k*.35)});fx.img('front','wing_gold',C.x+30+o,G.y+4,{a,ax:.7,ay:1,sx:-.95,sy:.95*(1-k*.35)})}}
   sk.realmFront?.(fx,t,ma);drawHits(fx,'front')}});
 const swPath=(w,C,i)=>quad([w.x,w.y],[lerp(w.x,C.x,.5),Math.min(w.y,C.y)-60+i*34],[C.x,C.y]);


 // ───────── 技能特效 v4 第一批（概念 art_sources/v4_vfx_concepts_v1/，素材 assets/fx/v4_v1/；说明 docs/design/v4-vfx-batch1.md） ─────────
 // 伤害数字与异常浮字按 docs/design/damage-numbers.md：属性色带 fire/frost/thunder/wind/sun/yin/heal/plain，数字倍数 2 普通、4 绝招。
 // 元数据（供 js/wuxia-battle.js 接入战斗）：ramp 属性主色；lead 起手时长（BP 加强作用的窗口）；hitAt 首次命中时刻（战斗在此刻结算伤害）；
 // group 群体（对 fx.targets() 每个目标命中）；side:'ally' 作用于我方（fx.allies()）。
 const addV4=(id,def)=>{SKILLS[id]={set:'v4',...def}};
 const STC={中毒:'#8BD45E',流血:'#C8423A',内伤:'#C98A4B',封穴:'#6C7BFF',眩晕:'#E0C0FF',目眩:'#D9D9D9',心乱:'#E58CD6',惊惧:'#8FA3B8',迟滞:'#9BB8B0'};
 const hurt=(fx,x,y,num,ramp,{scale=2,status=null,sc=.9,id=null,ang=PI,shake=2,hit=90,flash=0}={})=>{const K=1+.15*(fx.bp||0);if(id)fx.pop(id,x,y,{life:420,sc:[sc*.45,sc*1.1],a:[1,0]});strike(fx,x,y,ang,{ramp,L:40*sc,w:3.5,power:1.2*sc*K,hit,shake:shake*K,flash});fx.num(String(Math.round(num*(1+.25*(fx.bp||0)))),x+(fx.rand()-.5)*10,y-40,{scale,ramp});if(status)fx.label(status,x,y-58,STC[status],{life:1000})};
 const mid=T=>{const n=T.length,f=k=>T.reduce((a,p)=>a+p[k],0)/n;return{x:f('x'),y:f('y'),gx:f('gx'),gy:f('gy')}};
 // BP 起手加强（每档）：手部聚气粒子更密、范围更大；手部光晕；BP≥2 脚下一圈主色涟漪；BP3 起手轻震。命中火花与震屏 ×(1+0.15·BP)，粒子预算 ×(1+0.2·BP)。
 // 起手内息光：专属编排在起手窗口内，施法者手部有一团主色内息流转（实战评审：多招起手只有零星粒子，看不出在起手）
 function leadAura(fx,t){const sk=fx.skill,lead=sk.lead||0;if(!lead||t>lead+120||typeof IMG==='undefined'||!IMG.kit_qi)return;const a=win(t,0,Math.min(160,lead*.5))*(1-win(t,lead-40,lead+120)),H=fx.A.hand;if(a<=.01)return;
  const b=sk.boost;sk.boost=1;fx.img('front',tinted('kit_qi',sk.ramp||'white'),H.x,H.y,{a:.9*a,rot:t*.008,sx:.55+.25*win(t,0,lead),sy:.55+.25*win(t,0,lead)});sk.boost=b}
 function bpCharge(fx,t,dt){const sk=fx.skill,lead=sk.lead||220;if(t>lead)return;const R=fx.rand,H=fx.A.hand,ramp=sk.ramp||'gold';
  if(R()<dt/(36/fx.bp))converge(fx,H,ramp,1,{r0:12,r1:26+12*fx.bp,F:260,swirl:60,life:320});
  fx.once('bp0',true,()=>{if(fx.bp>=2)ripple(fx,fx.A.foot.x,fx.A.foot.y,{rx:26+12*fx.bp,dur:lead+260,ramp});if(fx.bp>=3)fx.shake(2)})}
 function bpAura(fx,t){const sk=fx.skill,lead=sk.lead||220,a=win(t,0,80)*(1-win(t,lead-60,lead+120));if(a<=0)return;const H=fx.A.hand,R=RAMP[sk.ramp||'gold'];fx.gdot(H.x,H.y,14+8*fx.bp,R[4],.3*fx.bp*a)}

 // 丙 · 金针刺穴（暗器·寒·封穴 35%）：三枚金针品字飞出，依次钉入肩胸腰，霜花点亮，末针靛蓝细环收紧
 addV4('bh_s1',{grade:'丙',name:'金针刺穴',dur:1000,budget:300,ramp:'frost',lead:160,hitAt:470,
  init(fx){const H=fx.A.hand,C=chest(fx);fx.s.n=[[C.x+6,C.y-22],[C.x+2,C.y],[C.x+4,C.y+22]].map((p,i)=>({p:quad([H.x-6,H.y-6+i*6],[(H.x+p[0])/2+10,p[1]-30+i*16],p),from:160+i*70,to:330+i*70,end:p}))},
  update(fx,t,dt){const R=fx.rand;
   for(const n of fx.s.n){const k=win(t,n.from,n.to);if(k>0&&k<1){const [x,y,a]=n.p(accel(k));shed(fx,x,y,a,'frost',1,{sp:30,life:300})}}
   fx.s.n.forEach((n,i)=>fx.once('n'+i,t>=n.to,()=>{fx.pop('frost_star',n.end[0],n.end[1],{life:620,sc:[.3,.9],a:[1,0]});for(let j=0;j<5;j++)fx.spawn({x:n.end[0],y:n.end[1],vx:(R()-.5)*60,vy:(R()-.5)*60,drag:3,life:400,ramp:'frost',tone:4})}));
   fx.once('h',t>=470,()=>{const C=chest(fx);fx.pop('seal_ring',C.x+4,C.y+22,{life:700,sc:[1.1,.35],a:[1,.2]});hurt(fx,C.x,C.y,36,'frost',{status:'封穴',sc:.6,shake:1.5})})},
  draw(fx,t){for(const n of fx.s.n){const k=win(t,n.from,n.to);if(k>0&&k<1)fly(fx,'front','needle_gold',n.p,accel(k),{sc:.7,echo:2,gap:.07});else if(t>=n.to&&t<n.to+380)fx.img('front','needle_gold',n.end[0]+6,n.end[1],{a:1-win(t,n.to+200,n.to+380),sx:.5,sy:.5,ax:0})}
   drawHits(fx,'front')}});

 // 乙 · 叠岚掌（拳掌·阳·内伤 60%）：前小后大两道掌形气劲叠压，金色冲击环，山岚被推开
 addV4('gy_p3',{grade:'乙',name:'叠岚掌',dur:1200,budget:500,ramp:'sun',lead:200,hitAt:420,
  init(fx){const H=fx.A.hand,C=chest(fx);fx.s.p=quad([H.x-10,H.y+6],[(H.x+C.x)/2,C.y-6],[C.x+16,C.y])},
  update(fx,t,dt){const C=chest(fx),R=fx.rand;
   for(const [a,b,sc] of [[200,420,.55],[420,640,.95]]){const k=win(t,a,b);if(k>0&&k<1){const [x,y,ang]=fx.s.p(accel(k));shed(fx,x,y,ang,'sun',sc>.8?3:2,{sp:50,life:420})}}
   fx.once('h1',t>=420,()=>{fx.pop('ring_sun',C.x+10,C.y,{life:420,sc:[.3,.7],a:[1,0]});hurt(fx,C.x,C.y,24,'sun',{sc:.6,shake:1.5})});
   fx.once('h2',t>=640,()=>{fx.pop('ring_sun',C.x+6,C.y,{life:560,sc:[.4,1.15],a:[1,0]});hurt(fx,C.x-4,C.y+4,34,'sun',{status:'内伤',sc:.9,shake:3,flash:.12});
    for(let i=0;i<14;i++)fx.spawn({x:C.x+(R()-.5)*20,y:C.y+(R()-.5)*30,vx:-80-R()*120,vy:(R()-.5)*40,drag:1.5,life:700,ramp:'sun',tone:4,glow:R()<.2?4:0})})},
  draw(fx,t){const C=chest(fx),end=1-win(t,900,1200);fx.tint=['#140c04',.28*Math.min(win(t,0,200),end)];
   const push=out3(win(t,420,1000))*60;fx.img('back','cloud_mist',C.x+30-push,C.y-30,{a:.7*end,sx:.9,sy:.9});fx.img('back','cloud_mist',C.x+40-push*1.3,C.y+24,{a:.6*end,sx:-.8,sy:.8});
   for(const [a,b,sc] of [[200,420,.55],[420,640,.95]]){const k=win(t,a,b);if(k>0&&k<1)fly(fx,'front','palm_sun',fx.s.p,accel(k),{sc,echo:2,gap:.08})}
   drawHits(fx,'front')}});

 // 乙 · 崩石短打（拳掌·雷·内伤 60%）：短促直拳凝成方形震劲，金紫震波与崩裂纹，碎石后崩
 addV4('hc_s3',{grade:'乙',name:'崩石短打',dur:1000,budget:500,ramp:'thunder',lead:200,hitAt:360,
  init(fx){const H=fx.A.hand,C=chest(fx);fx.s.p=quad([H.x-10,H.y+10],[(H.x+C.x)/2,C.y+14],[C.x+10,C.y+12])},
  update(fx,t,dt){const C=chest(fx),R=fx.rand;
   if(t<200&&R()<dt/12)converge(fx,fx.A.hand,'thunder',1,{r0:10,r1:26,F:300,swirl:40,life:260});
   const k=win(t,200,360);if(k>0&&k<1){const [x,y,a]=fx.s.p(accel(k));shed(fx,x,y,a,'thunder',2,{sp:70,life:300})}
   fx.once('h',t>=360,()=>{fx.pop('quake_ring',C.x,C.y+12,{life:620,sc:[.3,1],a:[1,0]});hurt(fx,C.x,C.y+10,45,'thunder',{status:'内伤',sc:.9,shake:4,flash:.15,hit:120});
    for(let i=0;i<5;i++)fx.pop('rock_debris',C.x+(R()-.5)*10,C.y+18,{life:700,sc:[.5,.4],a:[1,0],vx:-60-R()*120,vy:-60+R()*50,spin:(R()-.5)*8,ease:k=>k});
    ripple(fx,C.gx,C.gy,{rx:70,dur:500,ramp:'thunder'})})},
  draw(fx,t){const k=win(t,200,360);if(k>0&&k<1)fly(fx,'front','fist_thunder',fx.s.p,accel(k),{sc:.8,echo:2,gap:.1});
   if(t<240){const H=fx.A.hand;fx.img('front','fist_thunder',H.x-8,H.y+8,{a:win(t,60,200),sx:.4+.2*win(t,0,200),sy:.4+.2*win(t,0,200)})}
   drawHits(fx,'front')}});

 // 乙 · 夜阑（音律·阴·封穴 35%）：三圈黛紫音波由近及远贯穿，经脉细线收束，夜色压暗
 addV4('hui_q3',{grade:'乙',name:'夜阑',dur:1300,budget:400,ramp:'yin',lead:180,hitAt:620,
  update(fx,t,dt){const C=chest(fx),R=fx.rand;if(t<1100&&R()<dt/14)motes(fx,320,170,280,120,'yin',1,{vy:-6,life:1300,layer:'back'});
   fx.once('h',t>=620,()=>{fx.pop('meridian_lines',C.x,C.y,{life:800,sc:[1,.5],a:[1,0]});hurt(fx,C.x,C.y,40,'yin',{status:'封穴',sc:.7,shake:1.5})})},
  draw(fx,t){const H=fx.A.hand,C=chest(fx),end=1-win(t,1000,1300);fx.tint=['#0b0620',.42*Math.min(win(t,0,250),end)];fx.vig=.3*Math.min(win(t,0,250),end);
   for(let i=0;i<3;i++){const k=win(t,180+i*90,620+i*90);if(k<=0||k>=1)continue;const x=lerp(H.x-10,C.x-30,out3(k)),y=lerp(H.y,C.y-4,out3(k)),sc=.6+.4*k;fx.img('front','wave_yin',x,y,{a:(1-k*k)*(1-i*.2),sx:sc,sy:sc})}
   drawHits(fx,'front')}});

 // 甲 · 焚契破阵（刀·炎·群体惊惧 30%）：火刀高举、契约悬空焦卷、地面火线 → 大弧火痕劈下，纸卷断为两截，热浪震慑。群体：火线圈住全部目标，火痕按目标中心放大，逐个命中
 addV4('gj_s4',{grade:'甲',name:'焚契破阵',dur:1700,budget:900,ramp:'fire',lead:500,hitAt:760,group:true,
  update(fx,t,dt){const T=fx.targets(),M=mid(T),H=fx.A.hand,R=fx.rand,top=Math.min(...T.map(p=>p.y))-70;
   if(t<700&&R()<dt/6)fx.spawn({x:M.x+(R()-.5)*70,y:top+(R()-.5)*16,vx:(R()-.5)*20,vy:-20-R()*30,life:700,ramp:'fire',tone:4,glow:R()<.3?3:0});
   if(t<700&&R()<dt/8)fx.spawn({x:H.x-4+(R()-.5)*14,y:H.y-40-R()*30,vx:(R()-.5)*10,vy:-40-R()*30,life:500,ramp:'fire',tone:4});
   fx.once('h',t>=760,()=>{fx.s.cut=t;T.forEach((P,i)=>hurt(fx,P.x,P.y,96-i*9,'fire',{status:'惊惧',sc:i?.9:1.2,shake:5,flash:i?0:.22,hit:200,ang:-2.3}));ripple(fx,M.gx,M.gy,{rx:120+30*(T.length-1),dur:700,ramp:'fire'});
    fx.pop('scroll_half',M.x-10,top,{life:900,sc:[.9,.8],a:[1,0],vx:-110,vy:30,spin:-2,ease:k=>k});fx.pop('scroll_half',M.x+10,top,{life:900,sc:[.9,.8],a:[1,0],vx:90,vy:40,spin:2,flip:true,ease:k=>k});
    for(const P of T)for(let i=0;i<Math.round(30/T.length)+4;i++){const u=-PI*(.15+R()*.7);fx.spawn({x:P.x+(R()-.5)*30,y:P.y+(R()-.5)*30,vx:Math.cos(u)*(60+R()*160)*(R()<.5?-1:1),vy:Math.sin(u)*(60+R()*120),ay:80,drag:1.2,life:900,ramp:'fire',tone:4,glow:R()<.25?3:0})}})},
  draw(fx,t){const H=fx.A.hand,T=fx.targets(),M=mid(T),s=fx.s,n=T.length,top=Math.min(...T.map(p=>p.y))-70,end=1-win(t,1300,1700);fx.tint=['#140604',.48*Math.min(win(t,0,250),end)];fx.vig=.45*Math.min(win(t,0,300),end);
   if(s.cut){const z=win(t,s.cut,s.cut+320);fx.zoom={s:1+.06*(1-out3(z)),x:M.x,y:M.y}}
   const rf=win(t,100,500)*end,wide=1+.45*(n-1);fx.img('back','ring_fire',M.gx,M.gy,{a:rf*(.8+.2*Math.sin(t*.02)),sx:(.75+(s.cut?.4*out3(win(t,s.cut,s.cut+400)):0))*wide,sy:.75*(1+.6*(n-1))});
   if(t<760){const up=out3(win(t,0,500));fx.img('front','blade_fire',H.x+4,H.y-10-up*20,{a:win(t,0,200),sx:.8+.05*Math.sin(t*.05),sy:.8,ay:.85});fx.img('back','scroll_contract',M.x,top+Math.sin(t*.004)*3,{a:win(t,80,320),sx:.85,sy:.85})}
   if(s.cut){const k=win(t,s.cut-60,s.cut+120),g=1+.25*(n-1);fx.img('front','arc_fire',M.x+30*g,M.y-6,{a:1-win(t,s.cut+200,s.cut+700),clip:[1-out3(k),1],sx:g,sy:g})}
   drawHits(fx,'front')}});

 // 甲 · 松涛合阵（剑·风·群体）：身后升起松枝剑气 → 松针化为十道细剑气横扫，按目标轮流分配，最后逐个命中
 addV4('sf_s4',{grade:'甲',name:'松涛合阵',dur:1600,budget:900,ramp:'wind',lead:520,hitAt:860,group:true,
  init(fx){const R=fx.rand,H=fx.A.hand,T=fx.targets();fx.s.ns=Array.from({length:10},(_,i)=>{const P=T[i%T.length];return{P,y0:H.y-60+R()*90,y1:P.y-26+R()*52,from:620+i*28,to:820+i*28}});fx.s.H=H},
  update(fx,t,dt){const R=fx.rand,T=fx.targets(),G=fx.A.ground;
   if(t<1300&&R()<dt/10)fx.spawn({x:W+4,y:G.y-6-R()*40,vx:-260-R()*80,life:900,kind:'streak',len:.05,ramp:'wind',alpha:.6,layer:'back'});
   fx.s.ns.forEach((n,i)=>fx.once('n'+i,t>=n.to,()=>{if(i%3===0)strike(fx,n.P.x,n.y1,PI+.1,{ramp:'wind',L:30,w:2.5,power:.7,hit:40,shake:1})}));
   fx.once('h',t>=1100,()=>{T.forEach((P,i)=>hurt(fx,P.x,P.y,88-i*8,'wind',{sc:.8,shake:3,flash:i?0:.1}))})},
  draw(fx,t){const s=fx.s,H=s.H,end=1-win(t,1250,1600);fx.tint=['#04120c',.4*Math.min(win(t,0,250),end)];fx.vig=.4*Math.min(win(t,0,300),end);
   const rise=out3(win(t,0,520));fx.img('back','pine_qi',H.x+50,H.y+110-rise*40,{a:win(t,0,300)*(1-win(t,900,1300)),sx:1,sy:.9+.1*rise,ay:1});
   fx.img('back','wind_band',W/2,fx.A.ground.y-14,{a:.6*win(t,200,500)*end});
   for(const n of s.ns){const k=win(t,n.from,n.to);if(k<=0||k>=1)continue;const x=lerp(H.x+30,n.P.x-20,accel(k)),y=lerp(n.y0,n.y1,k);fx.img('front','needle_wind',x,y,{a:1-k*.3,sx:.8,sy:.8})}
   drawHits(fx,'front')}});

 // 甲 · 一曲安澜（音律·我方群体解除并恢复）：月白音波在每名我方脚下平缓扩散，乱纹被抚平，莲叶柔光、翠绿光点上升
 addV4('hui_q4a',{grade:'甲',name:'一曲安澜',dur:1600,budget:600,ramp:'heal',lead:300,hitAt:900,side:'ally',group:true,
  update(fx,t,dt){const AL=fx.allies(),R=fx.rand;
   for(const P of AL){if(t<500&&R()<dt/(5*AL.length)/.6)fx.spawn({x:P.x+(R()-.5)*40,y:P.y+(R()-.5)*60,vx:(R()-.5)*30,vy:(R()-.5)*30,life:500,kind:'streak',len:.06,ramp:'dust',alpha:.7});
    if(t>650&&t<1450&&R()<dt/(6*AL.length)/.6)fx.spawn({x:P.gx+(R()-.5)*50,y:P.gy-2,vx:(R()-.5)*6,vy:-30-R()*30,life:900,ramp:'heal',tone:4,glow:R()<.3?3:0,fadeIn:120})}
   fx.once('heal',t>=900,()=>{for(const P of AL){fx.num('+'+Math.round(64*(1+.25*(fx.bp||0))),P.x,P.y-50,{scale:2,ramp:'heal'});fx.label('解除·中毒',P.x,P.y-68,'#ffffff',{life:1000})}})},
  draw(fx,t){for(const P of fx.allies()){
    for(let i=0;i<3;i++){const k=win(t,80+i*170,780+i*170);if(k<=0||k>=1)continue;fx.img('back','wave_moon',P.gx,P.gy-8,{a:(1-k)*.9,sx:.4+.9*out3(k),sy:.4+.9*out3(k)})}
    const lg=win(t,650,900)*(1-win(t,1300,1600));fx.img('back','lotus_glow',P.gx,P.gy-2,{a:lg,sx:.9+.05*Math.sin(t*.008),sy:.9})}
   drawHits(fx,'front')}});

 // 绝 · 一剑澄江（剑·寒）：夜江冷月、剑意冲天 → 巨型霜蓝剑光劈入江心，两道水墙向两侧掀起 → 水落江平、霜花飘落
 addV4('zc_s5',{grade:'绝',name:'一剑澄江',dur:3200,budget:2400,ramp:'frost',lead:950,hitAt:1260,
  update(fx,t,dt){const C=chest(fx),R=fx.rand;
   if(t<2900&&R()<dt/9)motes(fx,320,170,320,170,'frost',1,{vy:-4,life:1500,layer:R()<.5?'back':'front'});
   if(t<1000&&R()<dt/60)fx.pop('frost_star',40+R()*560,C.gy-4+R()*40,{life:900,sc:[.2,.5],a:[.9,0],layer:'back'});
   if(t>1150&&t<1260)for(let i=0;i<3;i++)fx.spawn({x:C.x+(R()-.5)*40,y:R()*120,vy:800,life:120,kind:'streak',len:.03,ramp:'frost',alpha:.8});
   fx.once('final',t>=1260,()=>{fx.s.final=t;fx.pop('burst_frost',C.x,C.gy-20,{life:900,sc:[.4,1.3],a:[1,0]});hurt(fx,C.x,C.y,480,'frost',{scale:4,sc:1.6,shake:8,flash:.4,hit:340,ang:PI/2});
    ripple(fx,C.gx,C.gy,{rx:160,dur:900,ramp:'frost'});ripple(fx,C.gx,C.gy,{rx:110,dur:900,delay:150,ramp:'frost'})});
   if(fx.s.final&&t>fx.s.final+500&&t<3000&&R()<dt/4)fx.spawn({x:C.x+(R()-.5)*360,y:-4,vx:(R()-.5)*10,vy:24+R()*20,life:2000,ramp:'frost',tone:5,fadeIn:150,kind:R()<.2?'star':'px',size:R()<.2?2:1,layer:R()<.4?'back':'front'})},
  draw(fx,t){const H=fx.A.hand,C=chest(fx),s=fx.s,end=1-win(t,2700,3200);fx.tint=['#030814',.72*Math.min(win(t,0,400),end)];fx.vig=.6*Math.min(win(t,0,400),end);
   if(s.final){const z=win(t,s.final,s.final+480);fx.zoom={s:1+.12*(1-out3(z)),x:C.x,y:C.y+10}}
   fx.img('back','moon_cold',W-90,58,{a:win(t,100,600)*end,sx:1,sy:1});fx.img('back','river_glint',W/2,C.gy+18,{a:.8*win(t,150,600)*end,sx:1.1,sy:1});
   if(t<1260){const r=out3(win(t,250,950));fx.img('front','sword_frost',H.x-2,H.y-8,{a:win(t,250,400),ay:1,sx:1,sy:.3+.9*r})}
   if(t>=1050&&t<2400){const k=win(t,1050,1260),f=1-win(t,1700,2400);fx.img('front','pillar_frost',C.x,C.gy-6,{a:f,ay:1,sx:1+.3*(1-f),sy:out3(k)})}
   if(s.final){const k=win(t,s.final,s.final+420),fall=win(t,s.final+700,s.final+1300),h=out3(k)*(1-fall*.85),a=1-win(t,s.final+900,s.final+1400);
    fx.img('front','water_wall',C.x-38,C.gy+8,{a,ay:1,ax:0,sx:-.9,sy:.2+.8*h});fx.img('front','water_wall',C.x+38,C.gy+8,{a,ay:1,ax:0,sx:.9,sy:.2+.8*h})}
   drawHits(fx,'front')}});

 // ───────── 技能特效 v4 第二批：其余 7 门绝招（概念 art_sources/v4_vfx_concepts_b2/，素材 assets/fx/v4_b2/；说明 docs/design/v4-vfx-kit.md §5） ─────────
 const lineTo=(fx,a,b,ramp,n=12)=>{for(let i=0;i<n;i++){const u=fx.rand();fx.spawn({x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u),vx:(fx.rand()-.5)*10,vy:(fx.rand()-.5)*10,life:300,ramp,tone:5,glow:fx.rand()<.2?3:0})}};

 // 绝 · 万壑回响（拳掌·风·群体两段）：贴地风劲横推敌阵 → 两侧谷壁气纹回卷，在每个敌人身上合拢成冲击环
 addV4('gy_p5',{grade:'绝',name:'万壑回响',dur:2700,budget:2200,ramp:'wind',lead:480,hitAt:900,group:true,
  update(fx,t,dt){const T=fx.targets(),M=mid(T),H=fx.A.hand,R=fx.rand;
   if(t<480&&R()<dt/5)converge(fx,H,'wind',1,{r0:12,r1:40,F:260,swirl:80,life:320});
   if(t>480&&t<900&&R()<dt/3){const x=lerp(H.x,M.x-40,win(t,480,900));fx.spawn({x,y:M.gy-4-R()*10,vx:-60-R()*80,vy:-20-R()*30,drag:1.5,life:600,kind:'smoke',size:4+R()*4,ramp:'dust',add:false,alpha:.5,layer:'back'})}
   fx.once('h1',t>=900,()=>T.forEach((P,i)=>hurt(fx,P.x,P.y,60-i*5,'wind',{sc:1,shake:4,hit:120})));
   if(t>1050&&t<1650&&R()<dt/4){const s=R()<.5?-1:1;for(const P of T)fx.spawn({x:M.x+s*110,y:P.y+(R()-.5)*40,vx:-s*320,vy:(R()-.5)*30,life:300,kind:'streak',len:.05,ramp:'wind'})}
   fx.once('h2',t>=1700,()=>{T.forEach((P,i)=>{fx.pop('wind_ring_big',P.x,P.y,{life:700,sc:[.3,1],a:[1,0]});hurt(fx,P.x,P.y,92-i*7,'wind',{sc:1.3,shake:8,flash:i?0:.18,hit:200})});
    for(let i=0;i<24;i++)fx.spawn({x:M.x+(R()-.5)*140,y:M.y+(R()-.5)*60,vx:(R()-.5)*160,vy:-40-R()*80,ay:60,drag:.8,life:1200,kind:'leaf',size:4,rot:R()*TAU,spin:(R()-.5)*7,ramp:'wind'})})},
  draw(fx,t){const T=fx.targets(),M=mid(T),H=fx.A.hand,end=1-win(t,2300,2700);fx.tint=['#04120c',.5*Math.min(win(t,0,300),end)];fx.vig=.45*Math.min(win(t,0,300),end);
   const k=win(t,480,900);if(k>0&&k<1)fx.img('front','wind_shock',lerp(H.x-20,M.x-30,out3(k)),M.gy-10,{a:1-k*.3,ay:1,sx:.6+.6*k,sy:.7+.4*k});
   const c=win(t,1000,1300)*(1-win(t,1800,2300));if(c>0){for(const s of[-1,1])fx.img('back','cliff_qi',M.x+s*(120+20*(T.length-1)),M.gy+6,{a:c,ay:1,sx:s,sy:.4+.6*out3(win(t,1000,1400))})}
   if(t>1700){const z=win(t,1700,2100);fx.zoom={s:1+.08*(1-out3(z)),x:M.x,y:M.y}}
   drawHits(fx,'front')}});

 // 绝 · 百步震关（拳掌·雷·群体·惊惧）：三道方形震劲由近及远、一道比一道宽 → 敌阵立起断关裂面
 addV4('hc_s5',{grade:'绝',name:'百步震关',dur:2500,budget:2200,ramp:'thunder',lead:420,hitAt:1000,group:true,
  update(fx,t,dt){const T=fx.targets(),M=mid(T),H=fx.A.hand,R=fx.rand;
   if(t<420&&R()<dt/6)converge(fx,H,'thunder',1,{r0:10,r1:30,F:300,swirl:40,life:280});
   [450,650,850].forEach((t0,i)=>fx.once('w'+i,t>=t0,()=>{const x=lerp(H.x-30,M.x,(i+1)/3);fx.pop(tinted('kit_crack','thunder'),x,M.gy,{life:800,sc:[.4,.6+.2*i],a:[1,0]});fx.shake(2+i);for(let j=0;j<6;j++)fx.spawn({x:x+(R()-.5)*20,y:M.gy-4,vx:(R()-.5)*120,vy:-60-R()*90,ay:200,life:500,kind:'shard',size:2+Math.round(R()*2),rot:R()*TAU,spin:(R()-.5)*10,ramp:'thunder'})}));
   fx.once('h',t>=1000,()=>{fx.pop('gate_split',M.x,M.gy+4,{life:1100,sc:[.6,1.3+.15*(T.length-1)],a:[1,0],ay:1});T.forEach((P,i)=>hurt(fx,P.x,P.y,118-i*8,'thunder',{status:'惊惧',sc:1.3,shake:10,flash:i?0:.3,hit:240}));
    for(let i=0;i<10;i++)fx.pop('rock_debris',M.x+(R()-.5)*30,M.y+10,{life:900,sc:[.6,.5],a:[1,0],vx:(R()-.5)*260,vy:-80-R()*120,spin:(R()-.5)*8,ease:k=>k})})},
  draw(fx,t){const T=fx.targets(),M=mid(T),H=fx.A.hand,end=1-win(t,2100,2500);fx.tint=['#140a1e',.5*Math.min(win(t,0,300),end)];fx.vig=.45*Math.min(win(t,0,300),end);
   [450,650,850].forEach((t0,i)=>{const k=win(t,t0-120,t0+260);if(k>0&&k<1)fx.img('front','quake_wall',lerp(H.x-30,M.x,(i+1)/3),M.gy+4,{a:1-k*k,ay:1,sx:.8+.35*i,sy:.5+.3*i+.3*out3(k)})});
   if(t>1000){const z=win(t,1000,1400);fx.zoom={s:1+.1*(1-out3(z)),x:M.x,y:M.y}}
   drawHits(fx,'front')}});

 // 绝 · 希声（音律·阴·群体·封穴）：几乎透明的大音环越过敌阵，所到之处敌人一顿、胸口亮起靛蓝穴光
 addV4('hui_q5',{grade:'绝',name:'希声',dur:2500,budget:1600,ramp:'yin',lead:400,hitAt:950,group:true,
  update(fx,t,dt){const T=fx.targets(),R=fx.rand;if(t<2200&&R()<dt/10)motes(fx,320,170,300,150,'yin',1,{vy:-4,life:1500,layer:'back'});
   fx.once('h',t>=950,()=>{fx.shake(4);T.forEach((P,i)=>{fx.pop(tinted('kit_ring','yin'),P.x,P.y,{life:700,sc:[.4,1.4],a:[1,0]});fx.pop('meridian_lines',P.x,P.y,{life:900,sc:[1.6,.9],a:[1,0]});fx.pop('seal_ring',P.x,P.y,{life:800,sc:[1.1,.4],a:[1,.2]});hurt(fx,P.x,P.y,84-i*6,'yin',{status:'封穴',sc:.9,shake:4,flash:i?0:.08})})})},
  draw(fx,t){const H=fx.A.hand,G=fx.A.ground,end=1-win(t,2100,2500);fx.tint=['#0b0620',.6*Math.min(win(t,0,350),end)];fx.vig=.5*Math.min(win(t,0,350),end);
   for(let i=0;i<3;i++){const k=win(t,350+i*220,1500+i*220);if(k<=0||k>=1)continue;fx.img('back','faint_ring',H.x-10,G.y-6,{a:Math.min(1,(1-k)*1.4),sx:.25+1.6*out3(k),sy:.25+1.6*out3(k)})}
   drawHits(fx,'front')}});

 // 绝 · 裂石（音律·风·单体）：一道笔直白色风刃自笛口劈出 → 目标身后岩影从中裂开
 addV4('hui_d5',{grade:'绝',name:'裂石',dur:2200,budget:1600,ramp:'wind',lead:500,hitAt:660,
  update(fx,t,dt){const C=chest(fx),H=fx.A.hand,R=fx.rand;if(t<500&&R()<dt/5)converge(fx,H,'wind',1,{r0:10,r1:36,F:280,swirl:30,life:300});
   if(t>500&&t<660)for(let i=0;i<2;i++)fx.spawn({x:lerp(H.x,C.x,R()),y:C.y+(R()-.5)*8,vx:-500,life:120,kind:'streak',len:.03,ramp:'wind'});
   fx.once('h',t>=660,()=>{fx.s.hit=t;hurt(fx,C.x,C.y,126,'wind',{scale:3,sc:1.5,shake:10,flash:.3,hit:300});
    for(let i=0;i<12;i++)fx.pop('rock_debris',C.x-36+(R()-.5)*20,C.y-10,{life:900,sc:[.5,.4],a:[1,0],vx:(R()<.5?-1:1)*(60+R()*140),vy:-60-R()*100,spin:(R()-.5)*8,ease:k=>k})})},
  draw(fx,t){const C=chest(fx),H=fx.A.hand,s=fx.s,end=1-win(t,1800,2200);fx.tint=['#04120c',.45*Math.min(win(t,0,300),end)];fx.vig=.45*Math.min(win(t,0,300),end);
   const k=win(t,500,660);if(k>0&&k<1)fly(fx,'front','wind_blade',u=>[lerp(H.x,C.x+20,u),lerp(H.y,C.y,u),PI],accel(k),{sc:1,echo:2,gap:.1});
   if(s.hit){const r=win(t,s.hit,s.hit+500),a=Math.min(win(t,s.hit-40,s.hit+60),1-win(t,s.hit+900,s.hit+1400));
    fx.img('back','rock_half',C.x-40+r*18,C.gy+6,{a,ay:1,ax:0,sx:1,sy:1});fx.img('back','rock_half',C.x-40-r*18,C.gy+6,{a,ay:1,ax:0,sx:-1,sy:1});
    const z=win(t,s.hit,s.hit+400);fx.zoom={s:1+.1*(1-out3(z)),x:C.x,y:C.y}}
   drawHits(fx,'front')}});

 // 绝 · 余烬留生（刀·炎·单体·护同伴）：朱红裂锋劈开目标 → 裂锋内侧延出一条温白归路回到我方身前
 addV4('gj_s5',{grade:'绝',name:'余烬留生',dur:2600,budget:2000,ramp:'fire',lead:600,hitAt:780,
  update(fx,t,dt){const C=chest(fx),H=fx.A.hand,R=fx.rand;if(t<600&&R()<dt/6)fx.spawn({x:H.x+(R()-.5)*14,y:H.y-30-R()*30,vx:(R()-.5)*10,vy:-50-R()*30,life:500,ramp:'fire',tone:4});
   fx.once('h',t>=780,()=>{fx.s.cut=t;hurt(fx,C.x,C.y,132,'fire',{scale:3,sc:1.5,shake:10,flash:.3,hit:300,ang:-2.3});
    for(let i=0;i<40;i++){const u=-PI*(.1+R()*.8);fx.spawn({x:C.x+(R()-.5)*30,y:C.y+(R()-.5)*30,vx:Math.cos(u)*(60+R()*180)*(R()<.5?-1:1),vy:Math.sin(u)*(60+R()*140),ay:90,drag:1.1,life:1000,ramp:'fire',tone:4,glow:R()<.3?3:0})}});
   fx.once('p',t>=1500,()=>{const P=fx.allies()[0];fx.pop(tinted('kit_burst','white'),P.x-30,P.y,{life:700,sc:[.2,.5],a:[1,0]})})},
  draw(fx,t){const C=chest(fx),H=fx.A.hand,s=fx.s,end=1-win(t,2200,2600);fx.tint=['#140604',.55*Math.min(win(t,0,300),end)];fx.vig=.5*Math.min(win(t,0,300),end);
   if(t<780){const up=out3(win(t,0,500));fx.img('front','blade_fire',H.x+4,H.y-10-up*20,{a:win(t,0,200),sx:.8,sy:.8,ay:.85})}
   if(s.cut){const k=win(t,s.cut-100,s.cut+100);fx.img('front','rift_fire',C.x+20,C.y-6,{a:1-win(t,s.cut+300,s.cut+900),clip:[1-out3(k),1]});
    const z=win(t,s.cut,s.cut+400);fx.zoom={s:1+.1*(1-out3(z)),x:C.x,y:C.y};
    const p=win(t,s.cut+300,s.cut+900),P=fx.allies()[0];if(p>0)fx.img('front','white_path',(C.x+P.x)/2,(C.y+P.y)/2+10,{a:Math.min(1,p*2)*(1-win(t,s.cut+1300,s.cut+1700)),clip:[0,out3(p)],sx:Math.max(.4,Math.abs(P.x-C.x)/220),sy:.8})}
   drawHits(fx,'front')}});

 // 绝 · 一息相续（医·救援同伴）：掌心金青光点拉成细桥接上同伴将断的生命流，留下护命徽记（濒危保护“留一息”）
 addV4('bh_s5',{grade:'绝',name:'一息相续',dur:2300,budget:1200,ramp:'heal',lead:400,hitAt:950,side:'ally',
  update(fx,t,dt){const P=fx.allies()[0],H=fx.A.hand,R=fx.rand;if(t<400&&R()<dt/8)converge(fx,H,'heal',1,{r0:8,r1:22,F:200,swirl:60,life:300});
   if(t>400&&t<950&&R()<dt/10)lineTo(fx,H,P,'heal',2);
   fx.once('h',t>=950,()=>{fx.pop('leaf_emblem',P.x,P.y-4,{life:1300,sc:[.4,1],a:[1,.0],ease:out3});fx.pop(tinted('kit_ring','heal'),P.x,P.y,{life:700,sc:[.3,.9],a:[1,0]});
    for(let i=0;i<30;i++){const u=R()*TAU;fx.spawn({x:P.x,y:P.y,vx:Math.cos(u)*50,vy:Math.sin(u)*40-10,drag:1.5,life:800,ramp:'heal',tone:5,glow:R()<.3?3:0})}
    fx.flash('#ffffff',.08,300);fx.label('留一息',P.x,P.y-60,'#7FE0A0',{life:1200})})},
  draw(fx,t){const P=fx.allies()[0],H=fx.A.hand,end=1-win(t,1900,2300),d=Math.hypot(P.x-H.x,P.y-H.y);fx.tint=['#06140e',.35*Math.min(win(t,0,300),end)];
   const k=win(t,400,900);if(k>0){const a=Math.min(1,k*2)*(1-win(t,1300,1800));
    if(d>40)fx.img('front','life_bridge',(H.x+P.x)/2,(H.y+P.y)/2,{a,clip:[0,out3(k)],rot:Math.atan2(P.y-H.y,P.x-H.x)+(P.x<H.x?PI:0),sx:(P.x<H.x?-1:1)*d/200,sy:1.6});
    else fx.img('front','life_bridge',P.x,P.y-30,{a,clip:[0,out3(k)],sx:.35,sy:.5})}
   drawHits(fx,'front')}});

 // 绝 · 万籁归松（剑·我方群体护阵）：松涛剑气环绕全队挡开乱流 → 静白护光落在每名同伴身上，引导线指向下一位
 addV4('sf_s5',{grade:'绝',name:'万籁归松',dur:2600,budget:1400,ramp:'mist',lead:300,hitAt:1150,side:'ally',group:true,
  update(fx,t,dt){const AL=fx.allies(),M=mid(AL),R=fx.rand;
   if(t>200&&t<1300&&R()<dt/6){const u=R()*TAU;fx.spawn({x:M.gx+Math.cos(u)*90,y:M.gy-10+Math.sin(u)*22,vx:-Math.sin(u)*120,vy:Math.cos(u)*30,life:500,kind:'streak',len:.06,ramp:'mist'})}
   fx.once('h',t>=1150,()=>{for(const P of AL){motes(fx,P.x,P.y,14,30,'white',8,{vy:-14,life:1200})}fx.flash('#ffffff',.06,300)})},
  draw(fx,t){const AL=fx.allies(),M=mid(AL),end=1-win(t,2200,2600);fx.tint=['#0c1214',.35*Math.min(win(t,0,300),end)];
   const r=win(t,200,700)*(1-win(t,1500,2100));if(r>0)fx.img('back','pine_ring',M.gx,M.gy-8,{a:r,sx:(1+.3*(AL.length-1))*(1+.04*Math.sin(t*.01)),sy:1});
   for(const P of AL){const f=win(t,900,1200)*(1-win(t,1900,2400));if(f>0)fx.img('front','light_fall',P.gx,P.gy+4,{a:f*.9,ay:1,sx:.8,sy:.4+.6*out3(win(t,900,1250))})}
   const g=win(t,1300,1700)*(1-win(t,2000,2400));if(g>0){const P=AL[0];fx.img('front',tinted('kit_thrust','mist'),P.x-60,P.y+10,{a:g,sx:.6,sy:.5,clip:[1-out3(win(t,1300,1700)),1]})}
   drawHits(fx,'front')}});

 // ───────── 技能特效组件库 v1：模板编排（docs/design/v4-vfx-kit.md） ─────────
 // 没有专属编排的招式与内功主动，按 WuxiaKitSpecs（tools_fx/build_vfx_kit_specs.py 导出）自动编排：
 // 中性白光组件（assets/fx/kit_v1/）按属性/用途色带做渐变映射着色；兵器类定出手形态，档位 F1–F4 定时长、预算、镜头，
 // 用途定作用方式（伤害 / 治疗 / 净化 / 护卫 / 增益 / 回内 / 看破 / 控制 / 防御强化）。专属编排优先，模板只补空缺。
 // 素材亮度 → 色带（0 描边暗 … 5 白芯）渐变映射；结果以 “id@色带” 缓存进 IMG。
 function tinted(id,ramp){const key=id+'@'+ramp;if(IMG[key])return key;const s=IMG[id];if(!s||typeof document==='undefined')return id;
  const c=mkCanvas(s.w,s.h),x=c.getContext('2d');x.drawImage(s.img,0,0,s.w,s.h);const im=x.getImageData(0,0,s.w,s.h),d=im.data,R=(RAMP[ramp]||RAMP.white).map(rgb);
  for(let i=0;i<d.length;i+=4){const a=d[i+3];if(!a)continue;const v=Math.min(4.999,Math.max(d[i],d[i+1],d[i+2])/255*Math.sqrt(a/255)*5),j=Math.floor(v),f=v-j;for(let q=0;q<3;q++)d[i+q]=Math.round(R[j][q]+(R[j+1][q]-R[j][q])*f)}
  x.putImageData(im,0,0);IMG[key]={img:c,w:s.w,h:s.h,add:s.add};return key}
 const EL_RAMP={炎:'fire',寒:'frost',雷:'thunder',风:'wind',阳:'sun',阴:'yin'};
 const ROLE_RAMP={heal:'heal',cleanse:'jade',guard:'mist',defend:'mist',buff:'gold',ding:'gold',mp:'sky',reveal:'sky',debuff:'yin'};
 const kitRamp=S=>{if(S.el&&EL_RAMP[S.el])return EL_RAMP[S.el];if(S.role==='dmg')return S.wc==='剑'?'white':'plain';return ROLE_RAMP[S.role]||'white'};
 // 档位参数（下标 = F 档）：起手、飞行、收势时长，粒子预算，主体缩放，命中震屏
 const KT={lead:[0,100,160,220,320,420],travel:[0,160,200,240,280,320],tail:[0,350,450,560,720,900],budget:[0,150,250,400,600,900],sc:[0,.6,.72,.86,1,1.12],shake:[0,1,1.5,2.5,4,6],num:[0,18,30,44,70,120]};
 const SHOT={剑:'kit_slash',暗器:'kit_needle',拳掌:'kit_fist',音律:'kit_wave',刀:'kit_blade',长兵:'kit_sweep'};
 function kitDef(id,S){
  const T=Math.max(1,Math.min(5,S.tier||2)),ramp=kitRamp(S),hits=Math.max(1,Math.min(4,S.hits||1)),attack=S.role==='dmg'||S.role==='debuff',
   melee=S.wc==='刀'||S.wc==='长兵',lead=KT.lead[T],travel=attack?(melee?130:KT.travel[T]):0,gap=hits>1?130:0,
   hitAt=attack?lead+travel:lead+(S.role==='reveal'?120:180),dur=hitAt+gap*(hits-1)+KT.tail[T],sc=KT.sc[T],
   shot=S.wc==='剑'?(/刺|点|挑|穿|隙/.test(S.name)?'kit_thrust':'kit_slash'):S.wc==='拳掌'?(/掌/.test(S.name)?'kit_palm':'kit_fist'):(SHOT[S.wc]||'kit_fist'),
   side=S.side==='foe'?undefined:'ally';
  const I=n=>tinted(n,ramp),tgt=fx=>side?fx.allies():fx.targets();
  return{set:'kit',grade:S.grade,name:S.name,dur,budget:KT.budget[T],ramp,lead,hitAt,group:!!S.group,side,spec:S,
   init(fx){const H=fx.A.hand,P=tgt(fx).slice(0,S.group?4:1);fx.s.P=P;fx.s.shots=[];
    if(attack)for(let h=0;h<hits;h++)P.forEach((Q,i)=>{const from=lead+h*gap+i*50,bend=(h%2?1:-1)*(18+6*T);
     fx.s.shots.push({Q,h,from,to:from+travel,path:quad([H.x-6,H.y],[(H.x+Q.x)/2,Math.min(H.y,Q.y)+bend],[Q.x+10,Q.y])})})},
   update(fx,t,dt){const R=fx.rand,H=fx.A.hand,P=fx.s.P;
    if(t<lead&&R()<dt/(40/T))converge(fx,H,ramp,1,{r0:8,r1:16+8*T,F:240,swirl:50,life:260});
    for(const s of fx.s.shots){const k=win(t,s.from,s.to);if(!melee&&k>0&&k<1&&S.wc!=='音律'){const [x,y,a]=s.path(accel(k));shed(fx,x,y,a,ramp,T>2?2:1,{sp:40,life:300})}
     fx.once('s'+s.h+'_'+P.indexOf(s.Q),t>=s.to,()=>{const Q=s.Q;fx.pop(I('kit_burst'),Q.x,Q.y,{life:380+40*T,sc:[sc*.35,sc*.9],a:[1,0]});
      if(T>=2)fx.pop(I('kit_ring'),Q.x,Q.y,{life:420+40*T,sc:[sc*.3,sc*.95],a:[.9,0]});if(T>=3)ripple(fx,Q.gx,Q.gy,{rx:40+14*T,dur:500,ramp});
      if(S.wc==='拳掌'&&T>=4)fx.pop(I('kit_crack'),Q.gx,Q.gy-2,{life:700,sc:[.5,.9],a:[1,0]});
      if(S.role==='debuff')fx.pop(tinted('kit_down',S.st[0]&&STC[S.st[0]]?'yin':ramp),Q.x,Q.y-10,{life:700,sc:[.9,.7],a:[.9,0]});
      if(S.role==='debuff'){strike(fx,Q.x,Q.y,PI,{ramp,L:30*sc,w:3,power:sc,hit:60+20*T,shake:KT.shake[T]});if(s.h===0&&S.st[0])fx.label(S.st[0],Q.x,Q.y-58,STC[S.st[0]],{life:1000})}
      else hurt(fx,Q.x,Q.y,Math.round(KT.num[T]*(1+.15*s.h)),ramp,{scale:2,status:s.h===0?S.st[0]||null:null,sc:sc*.8,shake:KT.shake[T],flash:T>=4&&s.h===hits-1?.12:0,hit:60+20*T})})}
    if(!attack)fx.once('sup',t>=hitAt,()=>{for(const Q of P){
     if(S.role==='heal'){fx.pop(I('kit_ground'),Q.gx,Q.gy-2,{life:900,sc:[.4,.9],a:[.9,0]});fx.pop(I('kit_rise'),Q.x,Q.gy,{life:800,sc:[.5,.8],a:[.9,0],ay:1});fx.num('+'+KT.num[T],Q.x,Q.y-44,{scale:2,ramp:'heal'});if(S.cleanse)fx.label('解除',Q.x,Q.y-62,'#ffffff')}
     else if(S.role==='cleanse'){fx.pop(I('kit_cleanse'),Q.x,Q.y,{life:800,sc:[.4,1],a:[1,0]});for(let i=0;i<10;i++){const u=R()*TAU;fx.spawn({x:Q.x,y:Q.y,vx:Math.cos(u)*90,vy:Math.sin(u)*70,drag:2,life:500,kind:'streak',len:.05,ramp:'dust'})}fx.label('解除',Q.x,Q.y-58,'#ffffff')}
     else if(S.role==='mp'){fx.label('+'+(6+3*T)+' 内',Q.x,Q.y-50,'#8CCBFF')}
     else if(S.role==='reveal'){fx.pop(I('kit_mark'),Q.x,Q.y-6,{life:900,sc:[1.4,.8],a:[1,0]});fx.label('看破',Q.x,Q.y-56,'#ffffff')}
     if(['buff','ding','heal','mp'].includes(S.role))motes(fx,Q.x,Q.y,14,30,ramp,6+2*T,{vy:-24,life:900})}})},
   draw(fx,t){const H=fx.A.hand,P=fx.s.P,end=1-win(t,dur-260,dur);
    if(T>=3&&attack){fx.tint=[RAMP[ramp][0],(.12+.06*T)*Math.min(win(t,0,200),end)];if(T>=4)fx.vig=.3*Math.min(win(t,0,250),end)}
    if(t<lead+80)fx.img('front',I('kit_qi'),H.x,H.y,{a:win(t,0,lead*.6)*(1-win(t,lead,lead+80))*.8,sx:.3+.06*T,sy:.3+.06*T,rot:t*.006});
    for(const s of fx.s.shots){const k=win(t,s.from,s.to),Q=s.Q;
     if(melee){const r=win(t,s.from,s.to+60);if(r>0&&r<1||t<s.to+420&&t>=s.to)fx.img('front',I(shot),Q.x+18,Q.y-4,{a:1-win(t,s.to+120,s.to+420),clip:[1-out3(Math.min(1,r)),1],sx:sc*(s.h%2?-1:1),sy:sc})}
     else if(S.wc==='音律'){for(let w=0;w<3;w++){const kk=win(t,s.from+w*60,s.to+w*60);if(kk>0&&kk<1){const x=lerp(H.x-10,Q.x-20,out3(kk)),y=lerp(H.y,Q.y,out3(kk));fx.img('front',I(shot),x,y,{a:(1-kk*kk)*(1-w*.25),sx:sc*(.6+.4*kk),sy:sc*(.6+.4*kk)})}}}
     else if(k>0&&k<1){if(S.wc==='暗器')for(let n=-1;n<=1;n++)fly(fx,'front',I(shot),u=>{const p=s.path(u);return[p[0],p[1]+n*7,p[2]]},accel(k),{sc:sc*.8,echo:1});
      else fly(fx,'front',I(shot),s.path,accel(k),{sc:sc*(shot==='kit_fist'||shot==='kit_palm'?.9:1),echo:T>=3?2:1,gap:.07})}}
    if(!attack&&t>=hitAt-40)for(const Q of P){const a=Math.min(win(t,hitAt-40,hitAt+120),end);
     if(S.role==='guard'||S.role==='defend'){fx.img('front',I('kit_shield'),Q.x,Q.y+4,{a:.75*a,sx:.8+.1*Math.sin(t*.01),sy:.85});fx.img('front',I('kit_guard'),Q.x-26,Q.y+2,{a:.9*a,sx:sc,sy:sc})}
     if(S.role==='buff'||S.role==='ding')fx.img('back',I('kit_rise'),Q.x,Q.gy,{a:.8*a,ay:1,sx:sc,sy:sc*(.7+.3*win(t,hitAt,hitAt+300))});
     if(S.heart||S.role==='mp')fx.img('front',I('kit_qi'),Q.x,Q.y+6,{a:.85*a,rot:t*.005,sx:.7,sy:.7})}
    drawHits(fx,'front')}}}
 // 剑法套（归云谷 gy_s1–gy_s5）补接入战斗用的元数据：首次命中时刻取评审页对照帧
 for(const [k,h,l] of [['gy_s1',310,90],['gy_s2',393,140],['gy_s3',600,300],['gy_s4',800,520],['gy_s5',650,400]])if(SKILLS[k])Object.assign(SKILLS[k],{hitAt:h,lead:l,ramp:'jade'});
 // 2026-10-08 实战评审后的专属编排加强（xiaojianghu/docs/archive/design/vfx/review-20261008.md）：主体放大；一息相续光桥加粗、希声音环提亮
 for(const [k,b,no] of [['gy_s1',1.7],['gy_s2',1.6],['gy_s4',1.4],['bh_s1',1.8],['hc_s3',1.7],['hui_q3',1.6],['gy_p3',1.6],['hui_q4a',1.4],
   ['bh_s5',2,['life_bridge']],['gy_p5',1.6,['cliff_qi']],['hui_d5',1.3,['rock_half']]])if(SKILLS[k])Object.assign(SKILLS[k],{boost:b,noBoost:no||[]});
 // 旧原型心法（运行时 13 门）没有 v3 规格时，按主动效果类型用通用内功模板（js/wuxia-battle.js 映射 heart_<效果>）
 for(const [eff,role]of[['mp','mp'],['heal','heal'],['ding','ding'],['guard','guard'],['reveal','reveal'],['cleanse','cleanse']])
  SKILLS['heart_'+eff]=kitDef('heart_'+eff,{name:'内功',grade:'丙',tier:2,wc:'内',el:null,role,side:role==='reveal'?'foe':'self',group:false,hits:1,st:[],cleanse:role==='cleanse',heart:true});
 for(const [id,S]of Object.entries(root.WuxiaKitSpecs||{}))if(!SKILLS[id])SKILLS[id]=kitDef(id,S);

 // ───────── 门派特效文件接口（js/fx/fx-<门派>.js）：逐招专属编排写在各门派文件里，加载后覆盖组件库模板 ─────────
 // 规则见 docs/design/v4-vfx-per-skill.md。定义与第一批相同（set:'v4'，须带 dur、budget、ramp、lead、hitAt；作用我方写 side:'ally'，群体写 group:true）。
 WuxiaFX.lib={W,H,PI,TAU,RAMP,IMG,STC,win,accel,out3,inout,back,lerp,clamp,quad,fly,strike,shed,motes,converge,ripple,drawHits,smokeAt,blast,hurt,mid,chest,tinted,lineTo,rgb};
 WuxiaFX.define=(id,def)=>{SKILLS[id]={set:'v4',...def}};
 WuxiaFX.assetDirs=[];  // 各门派特效文件登记的素材包（相对站点根目录），战斗与评审页统一加载
 WuxiaFX.loadAll=dirs=>Promise.all(dirs.map(d=>WuxiaFX.load(d).catch(e=>console.warn('素材包缺失 '+d,e&&e.message))));

 const api={WuxiaFX,SKILLS,Atlas,SH,RAMP,IMG,W,H};root.WuxiaFX=WuxiaFX;root.WuxiaSkills=SKILLS;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
