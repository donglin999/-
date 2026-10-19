'use strict';
/* 第一章尾声“领队交锋”三招特效 v2（2026-10-18 用户确认，已接入实机）：am_s3_v2 明约合锋、cs_whip_s1_v2 缠腕短打、cs_whip_s2_v2 回身掠影。
 * 流程：xiaojianghu/docs/design/skill-vfx-pipeline.md 第 6 步。定稿概念图 art_sources/qihe-clash-vfx-concepts-v1/approved.json；
 * 单体素材 assets/production/fx/qihe-clash/clash_v2/（原图 art_sources/qihe-clash-vfx-elements-v1/）。时间轴、配色、预算照
 * xiaojianghu/docs/design/chapter1-clash-jia-20261014.md「特效交接」。
 * 分工：素材负责主形（扇面锋、前缘弧锋、交叉剑痕、剑身金芒、缠腕鞭影、长鞭大弧、暗红残影、身周丝缕、铜色作用点/碎点），
 * 程序只负责显隐、运动、节奏、少量粒子点缀与压暗；不用程序画主形。
 * 坐标：特效空间里施者在右、目标在左（岑霜为敌方，交锋层整体水平镜像）。素材按概念图画面朝向生成：
 *   am 系素材（徐在右向左出招）直接使用；cs 系大弧/残影/碎点/丝缕按“岑在左向右”生成，特效空间里用 sx<0 翻转，镜像后与概念图一致；
 *   缠腕鞭影的来路朝右上＝特效空间里朝施者，故不翻转。
 * 接入约定同旧版：fx.T 实际目标、fx.pred 预判命中（决定压身/擦过）、fx.outcome 真实结算；主声、轻震、顿帧由交锋层每组合并一次。
 * 2026-10-18 用户评审通过，实机交锋改播 v2（index.html 加载本文件，交锋数据 fxId 指向 *_v2）；旧程序版已于 2026-10-19 撤下归档（_attic/2026-10-19/）。 */
(()=>{
 if(!window.WuxiaFX||!WuxiaFX.define)return;
 const L=WuxiaFX.lib,D=WuxiaFX.define;
 const {PI,TAU,RAMP,IMG,win,accel,out3,inout,lerp,clamp,converge,motes,drawHits,tinted}=L;
 RAMP.jiangqing=RAMP.jiangqing||['#1a0c1e','#3a1a3a','#2c5a78','#4f9ab8','#a8dcec','#f0fbff'];
 RAMP.inkp=RAMP.inkp||['#0d0612','#24102c','#43204d','#6a3a76','#a675b0','#e2cbe6'];
 RAMP.darkred=RAMP.darkred||['#160305','#3a0a10','#62161f','#8c2733','#b85660','#e2a4a6'];
 RAMP.copper=RAMP.copper||['#24100a','#552a14','#86481f','#b9733a','#e2a866','#f7dcb2'];
 const res=(fx,k)=>{const v=fx[k];return v===undefined?fx.targets().map(()=>true):v};
 const outOf=fx=>fx.outcome||fx.s.out||res(fx,'pred');
 const IW=id=>IMG[id]?IMG[id].w:1,IH=id=>IMG[id]?IMG[id].h:1;
 const ARC_SY=1.35;// 长鞭大弧纵向放开，接近概念图 cs_whip_s2_b-2 的椭圆开口
 const centroid=T=>T.reduce((a,p)=>({x:a.x+p.x/T.length,y:a.y+p.y/T.length}),{x:0,y:0});

 // ───────── 甲 · 明约合锋 v2 ─────────
 // 0–260 剑身金芒（am3_blade_glint，由柄向尖显出）＋绛青气流向左铺开作扇根（复用 am_flow_ribbon）
 // 260–520 绛青扇面锋（am3_fan_jiangqing）自共同起点向全部实际目标展开；金白前缘弧锋（am3_edge_arc）随前缘推进，较扇面滞后一拍＝“先开线、后接锋”
 // 520 仅实际命中者出交叉剑痕光爆（am3_cross_hit）＋金白作用点；闪避者只有锋线从头侧擦过的几道白芒
 // 520–1000 扇面与弧锋前送少许后消退；1000–1250 收尽。累计粒子≤90。
 D('am_s3_v2',{grade:'甲',name:'明约合锋',dur:1250,budget:90,ramp:'jiangqing',lead:260,hitAt:520,leadAura:false,group:true,
  init(fx){const H=fx.A.hand,T=fx.targets(),P=res(fx,'pred');const O={x:H.x-6,y:H.y-2};fx.s.O=O;
   const m=centroid(T),ang=Math.atan2(m.y-O.y,m.x-O.x);fx.s.ang=ang;fx.s.fang=ang+.14;/* 概念图 am_s3_b-1 的扇面整体向上张开：扇面中线比目标中心方向向上偏约 8° */
   // 扇面长度：到最远目标再多 46px；扇面张开高度覆盖目标纵向分布并高出头顶
   const far=Math.max(...T.map(p=>Math.hypot(p.x-O.x,p.y-O.y)));fx.s.len=far+46;
   const spread=Math.max(...T.map(p=>Math.abs(-(p.x-O.x)*Math.sin(ang)+(p.y-O.y)*Math.cos(ang))));
   const fanH=Math.max(150,spread*2+150);fx.s.sx=fx.s.len/(IW('am3_fan_jiangqing')*.97);fx.s.sy=fanH/(IH('am3_fan_jiangqing')*.55);
   fx.s.miss=T.map((p,i)=>!P[i])},
  update(fx,t,dt){const O=fx.s.O,R=fx.rand,T=fx.targets(),low=!!fx.low;
   if(t<240&&R()<dt/(low?40:20))converge(fx,{x:O.x-14,y:O.y},'gold',1,{r0:8,r1:22,F:220,swirl:40,life:220});
   // 扇面推进时前缘掉落少量金白/绛青碎光
   const k=accel(win(t,260,520));if(k>.1&&t<540&&R()<dt/(low?30:15)){const L=fx.s.len*k,u=fx.s.ang+(R()-.5)*1.1;fx.spawn({x:O.x+Math.cos(u)*L,y:O.y+Math.sin(u)*L*1.1,vx:(R()-.5)*24,vy:(R()-.5)*24,life:320,ramp:R()<.5?'gold':'jiangqing',tone:5,size:R()<.2?2:1})}
   const out=fx.outcome||res(fx,'pred');
   fx.once('h',t>=520&&!!out,()=>{fx.s.hitT=t;fx.s.out=out.slice();T.forEach((p,i)=>{
     if(!out[i]){for(let q=0;q<(low?2:3);q++)fx.spawn({x:p.x-6,y:p.y-30+(R()-.5)*6,vx:-130-R()*80,vy:-26+(R()-.5)*20,drag:3,life:240,kind:'streak',len:.04,ramp:'white'});return}
     fx.pop('am3_cross_hit',p.x,p.y,{life:480,sc:[.8,1.6],a:[1,0]});
     fx.pop(tinted('kit_burst','gold'),p.x,p.y,{life:260,sc:[.3,.7],a:[.9,0]});
     for(let q=0;q<(low?4:9);q++){const u=(q%2?-.9:.9)+(R()-.5)*.6+(R()<.5?0:PI);fx.spawn({x:p.x,y:p.y,vx:Math.cos(u)*(70+R()*90),vy:Math.sin(u)*(60+R()*70),drag:3,life:240+R()*180,kind:q%3?'streak':'px',len:.03,ramp:'gold',tone:5})}})})},
  draw(fx,t){const O=fx.s.O,ang=fx.s.ang,end=1-win(t,1000,1250);
   fx.tint=['#0a0c14',.22*Math.min(win(t,0,200),end)];
   // 起手：剑身金芒（右端＝柄，锋尖朝左）自柄向尖显出；绛青气流在人物后层向左铺开作扇根
   const c=out3(win(t,0,220)),cf=1-win(t,300,460);
   if(c>0&&cf>0){fx.img('front','am3_blade_glint',O.x+6,O.y,{a:cf,ax:1,ay:.5,rot:ang-PI,sx:1.1,sy:1.1,clip:[1-c,1]});fx.gdot(O.x-30*c,O.y,10+10*c,RAMP.gold[4],.55*c*cf)}
   const rb=out3(win(t,60,320)),ra=.7*(1-win(t,360,620));if(rb>0&&ra>0)fx.img('back','am_flow_ribbon',O.x-60*rb,O.y+16,{a:ra,ax:.75,ay:.5,rot:ang-PI+.12,sx:.75,sy:.8,clip:[1-rb,1]});
   // 扇面：锚在扇根（素材右端），向左显出；520 后前送少许、淡出
   const k=accel(win(t,260,520)),fade=1-win(t,600,1000),push=out3(win(t,520,1000));
   if(k>0&&fade>0){const sx=fx.s.sx*(1+.06*push),sy=fx.s.sy*(.55+.45*out3(Math.min(1,k*1.3)))*(1+.05*push);
    fx.img('back','am3_fan_jiangqing',O.x,O.y,{a:fade,ax:.98,ay:.536,rot:fx.s.fang-PI,sx,sy,clip:[1-k,1]});
    fx.img('front','am3_fan_jiangqing',O.x,O.y,{a:.3*fade,ax:.98,ay:.536,rot:fx.s.fang-PI,sx,sy,clip:[1-k,1]})}
   // 前缘弧锋：随扇面前缘推进（滞后一拍），高度随扇面张开；命中后再前送 18px 淡出
   const ke=accel(win(t,300,520)),ea=Math.min(1,ke*2.5)*(1-win(t,560,900));
   if(ke>.08&&ea>0){const fa=fx.s.fang,Lf=fx.s.len*(ke*.97+.03)+18*push,x=O.x+Math.cos(fa)*Lf,y=O.y+Math.sin(fa)*Lf,s=fx.s.sy*IH('am3_fan_jiangqing')*.55/IH('am3_edge_arc')*(.5+.5*ke);
    fx.img('front','am3_edge_arc',x,y,{a:ea,ax:.12,ay:.5,rot:fa-PI,sx:s*.9,sy:s});fx.img('front','am3_edge_arc',x,y,{a:.5*ea,ax:.12,ay:.5,rot:fa-PI,sx:s*.9,sy:s});/* 叠一层提亮，接近概念图前缘亮度 */fx.gdot(x,y,26,RAMP.gold[4],.35*ea)}
   // 命中者的金白作用点辉光
   if(fx.s.hitT!=null){const e=t-fx.s.hitT;fx.targets().forEach((p,i)=>{if(!outOf(fx)[i])return;fx.gdot(p.x,p.y,18,RAMP.gold[5],.8*(1-win(e,0,220)))})}
   drawHits(fx,'front')}});

 // ───────── 乙 · 缠腕短打 v2 ─────────
 // 0–150 手边墨紫内息微聚 → 150–300 缠腕鞭影（cs1_wrist_lash）自施者一侧的来路甩入，按横向显隐“梢先到” → 300 命中：缠环收紧一下＋铜色作用点（cs_copper_point）；闪避：鞭影整体抬到头侧擦过、无作用点
 // → 360–900 来路自柄端收回、缠环淡出。累计粒子≤60。
 D('cs_whip_s1_v2',{grade:'乙',name:'缠腕短打',dur:900,budget:60,ramp:'inkp',lead:150,hitAt:300,leadAura:false,
  init(fx){const p=fx.targets()[0],hit=res(fx,'pred')[0];fx.s.W=hit?{x:p.x+16,y:p.y+14}:{x:p.x+4,y:p.y-30};fx.s.hitP=hit},
  update(fx,t,dt){const R=fx.rand,Hd=fx.A.hand,Wr=fx.s.W,low=!!fx.low;
   if(t<140&&R()<dt/(low?40:20))converge(fx,Hd,'inkp',1,{r0:8,r1:20,F:200,swirl:-60,life:220});
   const out=fx.outcome||res(fx,'pred');
   fx.once('h',t>=300&&!!out,()=>{fx.s.hitT=t;fx.s.hit=!!out[0];
    if(fx.s.hit){fx.pop('cs_copper_point',Wr.x,Wr.y,{life:360,sc:[.7,1.4],a:[1,0]});for(let i=0;i<(low?5:10);i++){const u=R()*TAU,v=40+R()*80;fx.spawn({x:Wr.x,y:Wr.y,vx:Math.cos(u)*v,vy:Math.sin(u)*v-20,ay:120,drag:2.2,life:260+R()*200,ramp:'copper',tone:5,size:R()<.25?2:1})}}
    else for(let i=0;i<(low?2:4);i++)fx.spawn({x:Wr.x-10,y:Wr.y,vx:-90-R()*60,vy:(R()-.5)*30,drag:3,life:220,kind:'streak',len:.04,ramp:'inkp',tone:4})})},
  draw(fx,t){const Wr=fx.s.W,Hd=fx.A.hand;
   const g=win(t,0,120)*(1-win(t,150,260));if(g>0)fx.gdot(Hd.x,Hd.y,10,RAMP.inkp[4],.7*g);
   // 素材：来路在右上（朝施者），缠环在左下；clip 自右向左显出＝鞭梢从施者一侧甩入
   const k=accel(win(t,150,300)),back=out3(win(t,380,760)),a=1-win(t,640,880);
   if(k>0&&a>0){const hitNow=fx.s.hitT!=null&&(fx.outcome?fx.outcome[0]:fx.s.hit),e=fx.s.hitT!=null?t-fx.s.hitT:0,tight=hitNow?lerp(1.18,1,out3(win(e,0,140))):1;
    fx.img('front','cs1_wrist_lash',Wr.x,Wr.y,{a,ax:.39,ay:.69,sx:tight,sy:tight,clip:[1-k,1-.62*back]});
    if(t<330){fx.gdot(lerp(Wr.x+60,Wr.x,k),lerp(Wr.y-50,Wr.y,k),8,RAMP.inkp[5],.6)}
    if(hitNow)fx.gdot(Wr.x,Wr.y,12,RAMP.copper[4],.7*(1-win(e,0,240)))}
   drawHits(fx,'front')}});

 // ───────── 甲 · 回身掠影 v2 ─────────
 // 0–240 施者身周墨紫丝缕（cs2_wisps）微旋聚起，暗红细丝、铜色微光在素材里 → 240–520 墨紫长鞭大弧（cs2_whip_arc）在敌阵上方自近侧向远侧展开，
 // 下缘压过每个实际目标（闪避者处整体略高、只擦过头侧）；两道暗红残影（cs2_ghost_red）滞后展开（一条整体轨迹，不是单体刀光复制三份）
 // → 520 实际命中者出铜色碎点（cs_copper_sparks，含短鞭痕）＋铜色作用点 → 520–920 大弧自梢回卷到约三成、施者胸前一次局部“破绽”缺环（程序点缀）
 // → 920–1250 残余从梢向柄收尽。累计粒子≤90。
 D('cs_whip_s2_v2',{grade:'甲',name:'回身掠影',dur:1250,budget:90,ramp:'inkp',lead:240,hitAt:520,leadAura:false,group:true,
  init(fx){const T=fx.targets(),P=res(fx,'pred'),Hd=fx.A.hand;fx.s.me={x:Hd.x+14,y:Hd.y+4};fx.s.body={x:fx.A.foot.x,y:Hd.y+6};
   const xs=T.map(p=>p.x),ys=T.map(p=>p.y),c=centroid(T),spread=Math.max(80,Math.max(...xs)-Math.min(...xs));
   const allMiss=P.every(v=>!v);
   // 大弧宽度≈目标横向分布的 2.05 倍（概念图约 2.4 倍；再宽远端会超出特效层留白被截断），下缘落在目标胸口一线；中心偏向施者
   const Wa=Math.max(300,spread*2.05),s=Wa/IW('cs2_whip_arc');fx.s.arc={x:c.x+Wa*.16,y:Math.max(...ys)-IH('cs2_whip_arc')*s*ARC_SY*.36-(allMiss?26:0),s}},
  update(fx,t,dt){const R=fx.rand,Hd=fx.A.hand,T=fx.targets(),low=!!fx.low,A=fx.s.arc;
   if(t<220&&R()<dt/(low?36:18))converge(fx,Hd,'inkp',1,{r0:8,r1:22,F:200,swirl:-60,life:220});
   const k=accel(win(t,240,520));if(k>.05&&t<520&&R()<dt/(low?40:20)){const w=IW('cs2_whip_arc')*A.s,x=A.x+w/2-w*k,y=A.y+(R()-.3)*IH('cs2_whip_arc')*A.s*.6;fx.spawn({x,y,vx:(R()-.5)*20,vy:(R()-.5)*20,life:260,ramp:R()<.6?'inkp':'darkred',tone:4})}
   const out=fx.outcome||res(fx,'pred');
   fx.once('h',t>=520&&!!out,()=>{fx.s.hitT=t;fx.s.out=out.slice();T.forEach((p,i)=>{if(!out[i])return;
    fx.pop('cs_copper_sparks',p.x,p.y+2,{life:460,sc:[1,1.6],a:[1,0],flip:true});fx.pop('cs_copper_point',p.x,p.y+2,{life:320,sc:[.9,1.6],a:[1,0]});
    for(let q=0;q<(low?3:6);q++){const u=R()*TAU,v=40+R()*90;fx.spawn({x:p.x,y:p.y+2,vx:Math.cos(u)*v,vy:Math.sin(u)*v-20,ay:120,drag:2.2,life:260+R()*200,ramp:'copper',tone:5,size:R()<.25?2:1})}})})},
  draw(fx,t){const A=fx.s.arc,me=fx.s.me,B=fx.s.body,low=!!fx.low;
   fx.tint=['#0c0610',.2*Math.min(win(t,0,200),1-win(t,950,1250))];
   // 蓄势丝缕：身周、在人物后层为主，前层淡一层；240 后散开淡出
   const wa=win(t,0,180)*(1-win(t,260,480)),wg=out3(win(t,0,240));
   if(wa>0){const s=.8+.14*wg+.12*win(t,240,480);fx.img('back','cs2_wisps',B.x,B.y,{a:wa,sx:-s,sy:s});fx.img('front','cs2_wisps',B.x,B.y,{a:.35*wa,sx:-s,sy:s})}
   // 大弧：素材左＝柄（近施者一侧，翻转后在特效空间右侧），clip [0,head] 自柄向梢显出；520–920 回卷到三成；920–1250 收尽
   const k=accel(win(t,240,520)),head=t<520?k:t<920?1-.7*out3(win(t,520,920)):.3*(1-out3(win(t,920,1230))),a=t<920?1-.3*win(t,600,920):.7*(1-win(t,980,1240));
   // 暗红残影：滞后、错位，在人物后层
   const ghosts=low?[[.14,10,.7]]:[[.1,8,.75],[.22,22,.5]];
   for(const [lag,dy,ga] of ghosts){const h=t<520?Math.max(0,k-lag):Math.max(0,head-lag*.6),gA=ga*(1-win(t,520,880));
    if(h>0&&gA>0){const s=A.s*1.05;fx.img('back','cs2_ghost_red',A.x-4,A.y+IH('cs2_whip_arc')*A.s*.18+dy,{a:gA,sx:-s,sy:s*.9,clip:[0,h]})}}
   if(head>0&&a>0){fx.img('front','cs2_whip_arc',A.x,A.y,{a,sx:-A.s,sy:A.s*ARC_SY,clip:[0,head]})}
   if(fx.s.hitT!=null){const e=t-fx.s.hitT;fx.targets().forEach((p,i)=>{if(!outOf(fx)[i])return;fx.gdot(p.x,p.y+2,14,RAMP.copper[4],.7*(1-win(e,0,220)))})}
   // 破绽：施者胸前一次局部缺环（程序点缀，暗红带缺口），不追加伤害
   const ex=win(t,600,700)*(1-win(t,860,1000));if(ex>0){const c=fx.cx.front,s=lerp(1.3,1,out3(win(t,600,720)));c.save();c.globalAlpha=ex;c.lineWidth=2;
    for(const [col,r] of [[RAMP.darkred[1],13],[RAMP.darkred[4],12]]){c.strokeStyle=col;c.beginPath();c.arc(me.x,me.y,r*s,-PI*.15,PI*1.35);c.stroke()}c.restore();fx.gdot(me.x-10,me.y-6,8,RAMP.darkred[4],.6*ex)}
   drawHits(fx,'front')}});
})();
