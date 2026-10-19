'use strict';
/* 归烬堂逐招专属特效（docs/design/v4-vfx-per-skill.md）。用 WuxiaFX.define(id, def) 注册，覆盖组件库模板；工具函数取 WuxiaFX.lib。
 * 本门素材包：assets/fx/gj_v1/（WuxiaFX.assetDirs 登记，战斗与评审页统一加载）。设计表见 xiaojianghu/docs/archive/design/vfx/gj.md。 */
(()=>{
 if(!window.WuxiaFX||!WuxiaFX.define)return;
 WuxiaFX.assetDirs.push('assets/fx/gj_v1/');
 const L=WuxiaFX.lib,D=WuxiaFX.define;
 const {PI,TAU,W,RAMP,win,accel,out3,inout,lerp,quad,fly,shed,motes,converge,ripple,drawHits,hurt,mid,chest,STC,tinted}=L;
 const me=fx=>({x:fx.A.hand.x+20,y:fx.A.hand.y+20,gx:fx.A.foot.x,gy:fx.A.foot.y});
 const embers=(fx,x,y,n,{ramp='fire',sp=150,ay=90,life=900,dir=0}={})=>{const R=fx.rand;for(let i=0;i<n;i++){const u=dir?dir+(R()-.5)*1.2:-PI*(.1+R()*.8),s=dir?1:(R()<.5?-1:1);fx.spawn({x:x+(R()-.5)*20,y:y+(R()-.5)*20,vx:Math.cos(u)*(50+R()*sp)*s,vy:Math.sin(u)*(50+R()*sp*.8),ay,drag:1.2,life:life*(.6+R()*.6),ramp,tone:4,glow:R()<.25?3:0})}};
 const ash=(fx,x,y,n,{rx=40,ry=30,vy=16,life=1200}={})=>{const R=fx.rand;for(let i=0;i<n;i++)fx.spawn({x:x+(R()-.5)*rx*2,y:y+(R()-.5)*ry*2,vx:(R()-.5)*20,vy:vy*(.4+R()),drag:.6,life:life*(.6+R()*.6),ramp:'dust',tone:5,add:false,fadeIn:80,size:R()<.3?2:1})};

 // 丁 · 藏锋短刺（刀·无属性·流血）：施法者身前折角阴影 → 目标身侧也翻出折角阴影，短锋从中偏斜刺出
 D('gj_s1',{grade:'丁',name:'藏锋短刺',dur:600,budget:160,ramp:'plain',lead:100,hitAt:260,leadAura:false,boost:1.15,
  update(fx,t,dt){const C=chest(fx),R=fx.rand;
   fx.once('h',t>=260,()=>{fx.pop('gj_stab_burst',C.x-2,C.y+12,{life:380,sc:[.6,1.3],a:[1,0]});hurt(fx,C.x,C.y+10,26,'plain',{status:'流血',sc:.7,shake:0,hit:70});
    for(let i=0;i<2;i++)fx.spawn({x:C.x,y:C.y+12,vx:-30-R()*40,vy:-20-R()*30,ay:160,life:500,ramp:'red',tone:3,size:2})})},
  draw(fx,t){const C=chest(fx),H=fx.A.hand;
   const r=win(t,0,60)*(1-win(t,150,260));if(r>0){fx.gdot(H.x,H.y,10,'#c8423a',.8*r);fx.img('front','gj_fold_shade',H.x-18,H.y+6,{a:.9*r,sx:.7,sy:.7})}
   const sa=win(t,90,160)*(1-win(t,420,600)),sx=C.x+40,sy=C.y+4;if(sa>0)fx.img('back','gj_fold_shade',sx,sy,{a:.92*sa,sx:.6+.5*out3(win(t,90,180)),sy:.6+.5*out3(win(t,90,180))});
   const k=win(t,140,260),rt=win(t,330,520);if(k>0&&rt<1){const tip=lerp(sx,C.x-6,accel(k))+rt*40;fx.img('front','gj_short_stab',tip,lerp(sy,C.y+12,accel(k)),{a:1-rt,ax:0,clip:[0,Math.min(1,.25+k)]})}
   drawHits(fx,'front')}});

 // 丙 · 燃隙刀（刀·炎）：护身气环敞开缺口（暴露）→ 加粗铜红斩弧劈落 → 尾部断两截余烬
 D('gj_s2',{grade:'丙',name:'燃隙刀',dur:900,budget:300,ramp:'fire',lead:150,hitAt:380,leadAura:false,boost:1.1,
  update(fx,t,dt){const C=chest(fx),H=fx.A.hand,R=fx.rand;
   if(t<380&&R()<dt/7)fx.spawn({x:H.x+4+(R()-.5)*14,y:H.y-12-R()*20,vx:(R()-.5)*14,vy:-50-R()*40,life:420,ramp:'fire',tone:4});
   fx.once('h',t>=380,()=>{hurt(fx,C.x,C.y,48,'fire',{sc:.95,shake:3,hit:110,ang:-2.3});embers(fx,C.x,C.y,12);
    fx.pop('gj_ember_halves',C.x-26,C.y+44,{life:520,delay:120,sc:[1,1],a:[1,0],vy:30,ease:k=>k})})},
  draw(fx,t){const C=chest(fx),M=me(fx);
   const ea=win(t,80,180)*(1-win(t,520,800));if(ea>0)fx.img('front','gj_expose',M.x,M.y-6,{a:ea,sx:1+.25*(1-out3(win(t,80,260))),sy:1+.25*(1-out3(win(t,80,260)))});
   const k=win(t,150,380),f=1-win(t,460,760);if(k>0&&f>0)fx.img('front','gj_thick_arc',C.x+10,C.y-4,{a:f,clip:[1-inout(k),1],sx:1,sy:1});
   drawHits(fx,'front')}});

})();
