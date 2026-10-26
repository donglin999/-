/* Seeded trajectory particles: each mote has a birth, velocity, curl and lifetime.
   Paths only guide emission; no filled ribbons, swords or rings are drawn. */
(function(root){
class SwordParticleField {
 constructor(){this.particles=[];this.duration=0}
 reset(){this.particles=[]}
 build(level,hits){this.reset();let seed=731;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296},tau=Math.PI*2;
 const emit=(count,start,span,path,opts={})=>{for(let i=0;i<count;i++){const u=rand(),birth=start+u*span,point=path(u),theta=rand()*tau,spread=opts.spread||4,offset=(rand()+rand()+rand()-1.5)*spread;this.particles.push({birth,life:(opts.life||650)*(.55+rand()*.7),x:point.x+Math.cos(theta)*offset,y:point.y+Math.sin(theta)*offset,vx:(point.vx||0)+(rand()-.5)*(opts.scatter||25),vy:(point.vy||0)+(rand()-.5)*(opts.scatter||25),curl:rand()*tau,spin:(rand()-.5)*8,size:(opts.size||1)*(rand()<.8?1:1.6),layer:opts.layer||'front',color:opts.gold?'gold':rand()<.16?'core':opts.tone||'blue',alpha:(.35+rand()*.65)*(opts.alpha||1),drag:opts.drag||1,gravity:opts.gravity||0});}};
 if(level>=3){SwordChoreography.build(level,emit,hits);this.particles.sort((a,b)=>a.birth-b.birth);return}
 // Inward motes gather around the sword hand, with an asymmetric spiral wake.
 emit(500,0,hits[0]-200,u=>{const a=u*19,r=65*(1-u)+8;return{x:463+Math.cos(a)*r,y:208+Math.sin(a)*r*.6,vx:-Math.cos(a)*r*2,vy:-Math.sin(a)*r}}, {life:450,spread:3});
 for(let j=0;j<hits.length;j++){const hit=hits[j],last=j===hits.length-1,large=level===2&&last;
 if(level===2){
 // Seven independent routes: slowly open around the caster, then accelerate
 // into the same contact anchor. Endpoint and sound share the hit timestamp.
 const bend=[-158,112,-108,80,-58,42,0][j%7],flight=1450-j*75;
 const route=u=>{
   const q=.10*u+.90*Math.pow(u,3.8),dq=.10+3.42*Math.pow(u,2.8);
   return {x:466-266*q,y:211+Math.sin(Math.PI*q)*bend,
     vx:-266*dq/flight*1000*.16,vy:Math.cos(Math.PI*q)*Math.PI*bend*dq/flight*1000*.16};
 };
 // A broad lower-luminance mantle carries mass around the granular core.
 emit(large?2800:1700,hit-flight,flight,route,
   {life:720,spread:large?70:45,scatter:50,drag:2.2,size:3,alpha:.27});
 emit(large?3000:1600,hit-flight,flight,route,
   {life:large?650:520,spread:large?30:19,scatter:25,drag:2.4,size:2,alpha:.7});
 for(let strand=0;strand<5;strand++)emit(230,hit-flight,flight,u=>{
   const p=route(u),envelope=Math.sin(Math.PI*(.10*u+.90*Math.pow(u,3.8)));
   p.y+=(strand-2)*13*envelope;return p;
 },{life:420,spread:3,scatter:12,drag:3,size:1.5,alpha:.65});
 }else{
 // Sweep a broad crescent from the caster, past the target, up into a torn wake.
 emit(large?2700:1100+level*160,hit-340,330,u=>{const a=-.65+u*3.3,rx=large?190:155,ry=large?112:74,x=327+Math.cos(a)*rx,y=178+Math.sin(a)*ry;return{x,y,vx:-Math.sin(a)*100,vy:Math.cos(a)*65}}, {life:large?750:500,spread:large?14:8,scatter:48,drag:2.5});
 // Thin secondary filaments travel alongside the main arc with broken spacing.
 for(let strand=0;strand<4;strand++)emit(180,hit-340+strand*14,320,u=>{const a=-.65+u*3.3,r=150+strand*9;return{x:327+Math.cos(a)*r,y:178+Math.sin(a)*(65+strand*9),vx:-Math.sin(a)*70,vy:Math.cos(a)*40}},{life:350,spread:1.5,scatter:15});
 }
 if(level===2){
 // Wide particulate pressure front expands from the contact; no solid disc.
 emit(large?2100:550,hit,100,u=>{const a=u*tau,speed=(large?420:255)*(.65+rand()*.5);return{x:200,y:225,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed*.58}},
   {life:large?1100:650,spread:18,scatter:40,drag:1.5,size:2.4,alpha:.45});
 }
 // Contact fans tangentially across the body, followed by falling hot fragments.
 emit(large?1300:440,hit,65,u=>{const a=-2.8+u*2.5,speed=(large?260:155)*( .4+rand());return{x:200,y:211,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed}},{life:large?1050:700,spread:18,scatter:120,drag:1.7,gravity:140,gold:true,size:level===2?2:1,alpha:.8});
 emit(large?700:200,hit+45,130,u=>{const a=u*tau;return{x:200+Math.cos(a)*8,y:271+Math.sin(a)*2,vx:Math.cos(a)*(large?260:160),vy:Math.sin(a)*35}},{life:650,spread:3,scatter:20,drag:2});
 }
 this.particles.sort((a,b)=>a.birth-b.birth);
 }
 draw(ctx,time,layer=null){let active=0;ctx.globalCompositeOperation='lighter';for(const p of this.particles){const age=time-p.birth;if(age<0)break;if(age>p.life||(layer&&p.layer!==layer))continue;active++;const k=age/p.life,s=age/1000,travel=(1-Math.exp(-p.drag*s))/p.drag,curl=Math.sin(p.curl+s*p.spin)*9*s;const x=p.x+p.vx*travel+curl,y=p.y+p.vy*travel+p.gravity*s*s*.5;const a=Math.min(1,age/35)*Math.pow(1-k,1.4)*p.alpha;
 const colors=p.color==='gold'?['#fff1bb','#f5be54','#bd6429']:p.color==='violet'?['#b7c0ff','#767ccb','#424c86']:p.color==='core'?['#e2fdff','#a4edff','#488ac9']:['#73d6ef','#388eca','#285183'];ctx.fillStyle=colors[Math.min(2,Math.floor(k*3))];ctx.globalCompositeOperation=p.color==='core'?'lighter':'source-over';
 // Short discrete history trails keep texture; no continuous stroked geometry.
 for(let h=3;h>=0;h--){const back=h*.016;ctx.globalAlpha=a*(h? .23:1);ctx.fillRect(Math.round(x-p.vx*back),Math.round(y-p.vy*back),p.size,p.size)}
 }ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';return active}
}
root.SwordParticleField=SwordParticleField;
})(window);
