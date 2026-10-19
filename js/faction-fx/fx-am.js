'use strict';
/* 正道盟逐招专属特效（docs/design/v4-vfx-per-skill.md；设计表 xiaojianghu/docs/archive/design/vfx/am.md）。用 WuxiaFX.define(id, def) 注册，覆盖组件库模板；工具函数取 WuxiaFX.lib。
 * 本门素材包：assets/fx/am_v1/（WuxiaFX.assetDirs 登记，战斗与评审页统一加载）。概念帧与素材源：art_sources/fx_am/。
 * 正道盟剑法的共同意象是“协同”：短锋相照（一锋一弧、互为犄角）、同担一线（一条劲流把力点交给同伴）、明约合锋（两束锋线汇于一点、留下落点）。 */
(()=>{
 if(!window.WuxiaFX||!WuxiaFX.define)return;
 WuxiaFX.assetDirs.push('assets/fx/am_v1/');
 const L=WuxiaFX.lib,D=WuxiaFX.define;
 const {PI,TAU,win,accel,out3,inout,lerp,quad,fly,shed,motes,converge,ripple,drawHits,hurt,chest,RAMP,IMG,tinted}=L;
 RAMP.jiangqing=RAMP.jiangqing||['#1a0c1e','#3a1a3a','#2c5a78','#4f9ab8','#a8dcec','#f0fbff'];// 绛青劲流：深绛描边、青蓝主体
 // 把一张朝左的横向素材铺在 a→b 两点之间（尖端落在 b），clip 自 a 端向 b 端显现
 const span=(fx,layer,id,a,b,{al=1,k=1,sy=1}={})=>{const s=IMG[id];if(!s)return;const d=Math.hypot(b.x-a.x,b.y-a.y),ang=Math.atan2(b.y-a.y,b.x-a.x);
  fx.img(layer,id,(a.x+b.x)/2,(a.y+b.y)/2,{a:al,rot:ang-PI,sx:d/s.w,sy,clip:[1-out3(k),1]})};

 // 丙 · 短锋相照（剑·风；为一名同伴加轻减伤）：剑尖一点、身侧浮起弯护弧 → 短直青绿剑锋刺出，护弧同时飘到同伴身前 → 短直刺痕与青绿气流线，护弧一亮、同伴脚下一圈青绿风环 → 护弧留淡影，剑锋收回
 // 2026-10-11 升级：剑锋与刺痕加大并留一道残锋；护弧加高、到位时多一道回弧残影与风环（kit_ring 染风色，只作辅助层）；命中轻震。一锋一弧“互为犄角”的构图不变。
 D('am_s1',{grade:'丙',name:'短锋相照',dur:950,budget:520,ramp:'wind',lead:150,hitAt:330,boost:1.2,
  init(fx){const H=fx.A.hand,C=chest(fx);fx.s.p=quad([H.x-8,H.y],[(H.x+C.x)/2,C.y-4],[C.x+14,C.y])},
  update(fx,t,dt){const C=chest(fx),H=fx.A.hand,P=fx.allies()[0],R=fx.rand;
   if(t<160&&R()<dt/9)converge(fx,{x:H.x-8,y:H.y},'wind',1,{r0:10,r1:24,F:240,swirl:60,life:240});
   const k=win(t,150,330);if(k>0&&k<1){const [x,y,a]=fx.s.p(accel(k));shed(fx,x,y,a,'wind',2,{sp:60,life:280})}
   fx.once('h',t>=330,()=>{fx.pop('am_stab_mark',C.x+2,C.y,{life:560,sc:[.9,1.75],a:[1,0]});hurt(fx,C.x,C.y,30,'wind',{sc:.75,shake:3,hit:80});
    for(let i=0;i<16;i++){const u=PI+(R()-.5)*1.4;fx.spawn({x:C.x,y:C.y+(R()-.5)*14,vx:Math.cos(u)*(120+R()*160),vy:Math.sin(u)*(60+R()*70),drag:2.4,life:380,kind:'streak',len:.05,ramp:'wind'})}});
   fx.once('g',t>=380,()=>{fx.pop(tinted('kit_ring','wind'),P.gx-6,P.gy-4,{life:520,sc:[.4,1.15],a:[.9,0],layer:'back'});motes(fx,P.x-26,P.y,10,46,'wind',14,{vy:-22,life:520})});
   if(t>380&&t<760&&R()<dt/16)motes(fx,P.x-28,P.y,8,50,'wind',1,{vy:-18,life:460})},
  draw(fx,t){const H=fx.A.hand,P=fx.allies()[0],C=chest(fx),k=win(t,150,330);
   if(k>0&&k<1)fly(fx,'front','am_short_thrust',fx.s.p,accel(k),{sc:1.6,echo:3,gap:.07});
   // 残锋：刺到位后留在目标身前，随后收回
   const r=win(t,330,620);if(r>0&&r<1)fx.img('front','am_short_thrust',lerp(C.x+24,H.x-40,out3(win(t,460,620))),lerp(C.y,H.y,out3(win(t,460,620))),{a:.9*(1-r),sx:1.5-.6*win(t,460,620),sy:1.4});
   const m=out3(win(t,150,330)),cx=lerp(H.x+8,P.x-30,m),cy=lerp(H.y-36,P.y+2,m),flash=win(t,330,390)*(1-win(t,390,560)),ga=win(t,0,150)*(t<560?1:lerp(1,.45,win(t,560,720)))*(1-win(t,850,950));
   fx.img('front','am_guard_crescent',cx,cy,{a:ga+flash*.5,sx:.95+.18*flash,sy:.95+.18*flash});
   if(t>=330){const e=win(t,330,700);if(e<1)fx.img('back','am_guard_crescent',cx-10-e*14,cy,{a:.5*(1-e),sx:1.05+.2*e,sy:1.05+.2*e})}
   if(flash>0)fx.gdot(cx,cy,30,RAMP.wind[4],.7*flash);
   if(t<160)fx.gdot(H.x-6,H.y,12,RAMP.wind[4],.8*win(t,0,80));
   drawHits(fx,'front')}});

 // 乙 · 同担一线（我方·转赠 BP）：剑尖朝下，胸前凝出金色力点 → 一条绛青劲流托着力点平稳送往同伴 → 力点没入同伴兵器、一道金光自脚下升起，头顶三枚 BP 光格依次点亮 → 劲流从中间断开淡出
 // 2026-10-11 升级：劲流加厚并多一道贴底的淡影；起手力点外多一圈内息旋光、送达时同伴身上升起金色气柱与落点环（kit_qi / kit_rise / kit_ring 染金，辅助层）；三枚光格逐格点亮各算一拍。柔和，不震屏。
 D('am_s2',{grade:'乙',name:'同担一线',dur:1250,budget:600,ramp:'gold',lead:200,hitAt:700,side:'ally',boost:1.5,noBoost:['am_flow_ribbon','kit_rise','kit_ring','kit_qi'],
  init(fx){const H=fx.A.hand,P=fx.allies()[0],O={x:H.x+12,y:H.y+8},d=Math.hypot(P.x-O.x,P.y-O.y);fx.s.O=O;fx.s.near=d<50;
   fx.s.path=fx.s.near?quad([O.x,O.y],[O.x-20,O.y-80],[P.x-12,P.y-6]):quad([O.x,O.y],[(O.x+P.x)/2,Math.min(O.y,P.y)-40],[P.x-12,P.y-6])},
  update(fx,t,dt){const O=fx.s.O,P=fx.allies()[0],R=fx.rand;
   if(t<240&&R()<dt/7)converge(fx,O,'gold',1,{r0:14,r1:34,F:240,swirl:70,life:300});
   fx.once('o',t>=200,()=>{for(let i=0;i<12;i++){const u=R()*TAU;fx.spawn({x:O.x,y:O.y,vx:Math.cos(u)*46,vy:Math.sin(u)*40,drag:2.4,life:420,ramp:'gold',tone:5,glow:R()<.3?3:0})}});
   const k=win(t,250,700);if(k>0&&k<1){const [x,y]=fx.s.path(inoutK(k));if(R()<dt/5)fx.spawn({x:x+(R()-.5)*8,y:y+(R()-.5)*8,vx:(R()-.5)*14,vy:(R()-.5)*14+6,life:520,ramp:'jiangqing',tone:4,glow:R()<.2?3:0});
    if(R()<dt/9)fx.spawn({x,y,vx:(R()-.5)*20,vy:-10-R()*20,life:420,ramp:'gold',tone:5,kind:R()<.3?'star':'px',size:1})}
   fx.once('h',t>=700,()=>{fx.s.hit=t;fx.pop(tinted('kit_ring','gold'),P.x-12,P.y-6,{life:560,sc:[.3,1],a:[.9,0]});fx.pop(tinted('kit_ring','gold'),P.gx,P.gy-2,{life:700,sc:[.5,1.5],a:[.8,0],layer:'back'});
    for(let i=0;i<26;i++){const u=R()*TAU;fx.spawn({x:P.x-12,y:P.y-6,vx:Math.cos(u)*60,vy:Math.sin(u)*50-20,drag:1.8,life:700,ramp:'gold',tone:5,glow:R()<.3?3:0})}});
   [0,1,2].slice(0,fx.actualBP??3).forEach(i=>fx.once('pip'+i,t>=760+i*80,()=>{for(let q=0;q<6;q++)fx.spawn({x:P.x-22+i*22+(R()-.5)*6,y:P.y-74+(R()-.5)*6,vx:(R()-.5)*40,vy:-20-R()*30,drag:2,life:420,ramp:'gold',tone:5,kind:q?'px':'star',size:q?1:2})}));
   if(fx.s.hit&&t<fx.s.hit+420&&R()<dt/7)fx.spawn({x:P.gx+(R()-.5)*40,y:P.gy-R()*20,vx:(R()-.5)*8,vy:-60-R()*50,life:640,ramp:'gold',tone:5,fadeIn:60,glow:R()<.25?3:0});
   fx.once('br',t>=900,()=>{const E=fx.s.path(1),M={x:(O.x+E[0])/2,y:(O.y+E[1])/2};for(let i=0;i<10;i++)fx.spawn({x:M.x+(R()-.5)*20,y:M.y+(R()-.5)*14,vx:(R()-.5)*80,vy:(R()-.5)*30,drag:2,life:420,ramp:'jiangqing',tone:5})})},
  draw(fx,t){const O=fx.s.O,P=fx.allies()[0],s=fx.s,end=1-win(t,1000,1250);fx.tint=['#0a0c14',.26*Math.min(win(t,0,200),end)];fx.vig=.2*Math.min(win(t,0,250),end);
   // 劲流：一条绛青丝带从施法者铺向同伴（自施法者端显现），收势从中间断开：左右两半各自向两端退开淡出
   const k=win(t,200,620),br=win(t,900,1150),E=fx.s.path(1),A={x:O.x,y:O.y},B={x:E[0],y:E[1]};
   if(k>0){if(fx.s.near){const im=IMG.am_flow_ribbon;if(im){const hk=out3(k);for(const [dy,al,sy] of [[0,.95,1.4],[22,.45,1]]){if(br<=0)fx.img('back','am_flow_ribbon',O.x-30,O.y-92+dy,{a:al,sx:1,sy,clip:[1-hk,1]});else{fx.img('back','am_flow_ribbon',O.x-30-14*br,O.y-92+dy,{a:al*(1-br),sx:1,sy,clip:[0,.5-.3*br]});fx.img('back','am_flow_ribbon',O.x-30+14*br,O.y-92+dy,{a:al*(1-br),sx:1,sy,clip:[.5+.3*br,1]})}}}}
    else if(br<=0){span(fx,'back','am_flow_ribbon',A,B,{al:.95,k,sy:1.3});span(fx,'back','am_flow_ribbon',{x:A.x,y:A.y+18},{x:B.x,y:B.y+18},{al:.4,k,sy:.9})}
    else{const M={x:(A.x+B.x)/2,y:(A.y+B.y)/2},d=br*.3;span(fx,'back','am_flow_ribbon',{x:lerp(M.x,B.x,d),y:lerp(M.y,B.y,d)},B,{al:1-br,sy:1.3});span(fx,'back','am_flow_ribbon',A,{x:lerp(M.x,A.x,d),y:lerp(M.y,A.y,d)},{al:1-br,sy:1.3})}}
   const m=win(t,250,700);
   if(t<720){const [x,y]=m>0?fx.s.path(inoutK(m)):[O.x,O.y],g=win(t,0,200);fx.img('front',tinted('kit_qi','gold'),x,y,{a:.8*g*(1-win(t,640,720)),rot:t*.01,sx:.8+.2*g,sy:.8+.2*g});fx.img('front','am_power_orb',x,y,{a:Math.min(1,g*1.5),sx:.9+.6*g,sy:.9+.6*g});fx.gdot(x,y,20,RAMP.gold[4],.6*g)}
   if(t>=700){const g=win(t,700,800)*(1-win(t,800,1000));fx.gdot(P.x-12,P.y-6,24,RAMP.gold[4],.8*g);
    const up=out3(win(t,700,900)),ra=(1-win(t,960,1180));if(ra>0)fx.img('back',tinted('kit_rise','gold'),P.gx,P.gy+2,{a:.85*ra,ay:1,sx:1.1,sy:.4+.5*up});
    const p=win(t,720,960);fx.img('front','am_bp_pips',P.x,P.y-74,{a:(1-win(t,1120,1250)),clip:[0,Math.min((fx.actualBP??3)/3,.05+p)],sx:1.5,sy:1.5})}
   drawHits(fx,'front')}});
 const inoutK=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;

 // 明约合锋 am_s3：2026-10-18 用户否决本文件的纯程序版，实机改播素材版 am_s3_v2（js/faction-fx/fx-qihe-clash-v2.js）；旧版原文归档在 _attic/2026-10-19/。

})();
