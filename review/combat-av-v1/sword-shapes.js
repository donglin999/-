/* Four independent silhouettes, cached as pixel atlases. No crescent reuse.
   All positions are in a 640×360 stage; event times are milliseconds. */
(function(root){
'use strict';
const clamp=x=>Math.max(0,Math.min(1,x)),lerp=(a,b,t)=>a+(b-a)*t;
const profiles=[
 {name:'破风 · 直刺',duration:1900,release:490,hits:[{at:690,x:200,y:211,angle:Math.PI}],hold:50,desc:'尖头剑芒沿直线贯穿，后方短尾撕裂，碎片沿入射方向崩开。',phases:[[0,'收锋蓄势'],[490,'直线贯穿'],[690,'穿透 · 崩裂'],[1020,'余屑消退']]},
 {name:'断岳 · 快斩',duration:2050,release:550,hits:[{at:710,x:200,y:211,angle:-2.6}],hold:65,desc:'一道斜向切痕骤然撕开，暗色切面托住亮刃，再沿切口断裂。',phases:[[0,'压剑蓄势'],[550,'瞬斩'],[710,'断面显现'],[1050,'切痕侵蚀']]},
 {name:'七曜 · 剑雨',duration:3300,release:1000,hits:[{at:1250,x:120,y:272,angle:1.5},{at:1470,x:270,y:274,angle:1.8},{at:1650,x:155,y:276,angle:1.5},{at:1800,x:240,y:279,angle:1.8},{at:1920,x:175,y:269,angle:1.5},{at:2020,x:218,y:272,angle:1.7},{at:2180,x:200,y:221,angle:Math.PI/2}],hold:60,desc:'七柄细长剑影逐把成形，先悬停再下坠；落地爆点各自发生，中央重剑压轴。',phases:[[0,'七剑凝形'],[1000,'错列落剑'],[2020,'中央重剑'],[2450,'剑影解体']]},
 {name:'裂穹 · 裂空',duration:3400,release:1200,hits:[{at:1410,x:200,y:211,angle:-2.7},{at:1550,x:200,y:211,angle:2.7}],hold:85,desc:'碎点先收成细线，贯场裂口突然张开；亮边、暗面与崩块分层错开，最后闭合。',phases:[[0,'碎星收线'],[1200,'裂线贯场'],[1410,'裂口张开'],[1720,'碎面崩解'],[2350,'残光归静']]}
];
function hash(x,y){return ((Math.imul(x+713,y+317)^Math.imul(x+11,73856093))>>>0)%1009/1009}
function atlas(kind){const w=kind==='sword'?36:kind==='thrust'?200:500,h=kind==='sword'?144:kind==='thrust'?64:kind==='cut'?110:210,frames=[];
 for(let f=0;f<8;f++){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),im=g.createImageData(w,h),erode=f/8;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let color=null,alpha=1;const noise=hash(x,y);
  if(kind==='thrust'){
   const center=32+Math.sin(x*.1)*Math.min(2,x/50),width=x<43?x*.28:12*Math.pow(1-(x-43)/157,1.25),d=Math.abs(y-center);
   if(d<width&&noise>erode*.8+(x/200)*.15){color=d<1.7&&x<125?[232,255,255]:d<width*.48?[118,230,244]:[36,119,185];alpha=(1-x/260)*(1-erode)}
  }else if(kind==='sword'){
   const d=Math.abs(x-18);let blade=y>=35&&y<134&&d<(y<118?5.5:(134-y)*.36),guard=y>=29&&y<35&&d<15,handle=y>=8&&y<29&&d<2.5;
   if((blade||guard||handle)&&noise>erode*.85){color=guard||handle?[245,197,112]:d<1.5?[242,253,238]:x<18?[94,207,232]:[39,109,170]}
  }else if(kind==='cut'){
   const u=x/499,center=55+Math.sin(x*.065)*2+Math.sin(x*.21)*1.5,width=Math.pow(Math.sin(u*Math.PI),.6)*7,d=y-center;
   if(Math.abs(d)<width&&noise>erode*.92){color=Math.abs(d)<width*.40?[8,16,28]:d<0&&Math.abs(d)<width*.65?[228,252,244]:d<0?[71,193,229]:[41,99,145]}
  }else{
   const u=x/499,center=132-x*.12+Math.sin(x*.058)*6+Math.sin(x*.19)*2,width=Math.pow(Math.sin(Math.PI*u),.65)*(21+Math.sin(x*.075)*7),d=y-center;
   if(Math.abs(d)<width&&noise>erode*.92){color=Math.abs(d)<width*.65?[5,7,17]:Math.abs(d)<width*.80?[203,221,255]:d<0?[97,134,233]:[135,91,197]}
  }
  if(color){const i=(y*w+x)*4;im.data.set([...color,Math.round(alpha*255)],i)}
 }g.putImageData(im,0,0);frames.push(c)}return frames
}
class SwordShapes{
 constructor(){this.atlases={thrust:atlas('thrust'),cut:atlas('cut'),sword:atlas('sword'),rift:atlas('rift')};this.reset(0)}
 reset(index){this.index=index;this.profile=profiles[index];this.last=-1;this.events=[];this.active=true;let seed=513;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};this.shards=[];
 for(const [j,e]of this.profile.hits.entries())for(let i=0;i<(index===3?230:170);i++){const dir=index===2?-Math.PI/2+(rand()-.5)*2.8:e.angle+(rand()-.5)*1.35;this.shards.push({hit:j,delay:rand()*45,life:180+rand()*520,angle:dir,speed:100+rand()*(index===3?550:360),offset:(rand()-.5)*15,size:rand()>.9?3:1,gold:rand()>.7})}this.motes=Array.from({length:130},()=>({a:rand()*6.283,r:20+rand()*100,v:rand(),size:rand()>.8?2:1}))}
 clear(){this.active=false;this.events=[]}
 time(raw,hold=true){const hit=this.profile.hits.at(-1).at,d=this.profile.hold;return !hold||raw<=hit?raw:raw<hit+d?hit:raw-d}
 advance(raw,hold=true){if(!this.active)return[];const t=this.time(raw,hold),ev=[];if(this.last<this.profile.release&&t>=this.profile.release)ev.push({name:'release',at:this.profile.release});this.profile.hits.forEach((e,i)=>{if(this.last<e.at&&t>=e.at)ev.push({name:'impact',at:e.at,index:i})});this.last=t;this.events.push(...ev);return ev}
 state(raw,hold=true){const t=this.time(raw,hold),last=this.profile.hits.filter(e=>e.at<=t).at(-1),age=last?t-last.at:9999;return {t,age,phase:this.profile.phases.filter(p=>t>=p[0]).at(-1)[1],hero:t<this.profile.release?(t<150?0:this.index===2?13:6):age<170?8:t<this.profile.hits.at(-1).at?7:age<360?9:0,foe:age<300?12:0,offset:age<300?-14*Math.sin(Math.PI*age/300):0}}
 draw(ctx,raw,{hold=true,shards=true,layer='front'}={}){if(!this.active)return 0;const{t}=this.state(raw,hold),p=this.profile;let count=0;ctx.save();ctx.imageSmoothingEnabled=false;
 if(layer==='back'){
  if(t<p.release){const k=clamp(t/p.release);for(const m of this.motes){const r=m.r*(1-k*.8),x=this.index===3?lerp(80,550,m.v):445+Math.cos(m.a+k)*r,y=this.index===3?lerp(235,155,m.v)+Math.sin(m.a)*r*(1-k):206+Math.sin(m.a+k)*r*.55;ctx.globalAlpha=k*.6;ctx.fillStyle=this.index===3?'#bfaaff':'#9fe5ee';ctx.fillRect(Math.round(x),Math.round(y),m.size,m.size);count++}}
  // Landing marks are short jagged strokes, not repeated circles.
  if(this.index===2)for(const e of p.hits){const age=t-e.at;if(age>0&&age<800){ctx.strokeStyle='#9dc8d3';ctx.globalAlpha=.4*(1-age/800);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(e.x-13,e.y+3);ctx.lineTo(e.x,e.y);ctx.lineTo(e.x+19,e.y+5);ctx.stroke();count++}}
 }else{
  if(this.index===0&&t>=490&&t<990){const k=clamp((t-490)/200),x=465-265*k*k*k,age=Math.max(0,t-700),f=Math.min(7,Math.floor(age/36));for(let j=2;j>=0;j--){ctx.globalAlpha=(j?.14:1)*(1-clamp(age/280));ctx.drawImage(this.atlases.thrust[Math.min(7,f+j)],Math.round(x+j*24),179,200,64);count++}}
  if(this.index===1&&t>=550&&t<1150){const k=t<710?.52*clamp((t-550)/160):.52+.48*clamp((t-710)/90),age=Math.max(0,t-725),f=Math.min(7,Math.floor(age/52));ctx.save();ctx.translate(200,211);ctx.rotate(-.50);ctx.globalAlpha=1-clamp(age/400);ctx.beginPath();ctx.rect(260-500*k,-65,500*k,130);ctx.clip();ctx.drawImage(this.atlases.cut[f],-240,-55);ctx.restore();count++}
  if(this.index===2)for(const[j,e]of p.hits.entries()){
   const born=150+j*90,release=e.at-220;if(t<born||t>e.at+650)continue;const formation=clamp((t-born)/230),q=clamp((t-release)/220),size=j===6?1.05:.67,x=e.x+(1-q*q*q)*(j%2?28:-28),tip=lerp(j===6?154:115+j%2*18,e.y,q*q*q),age=Math.max(0,t-e.at-100),f=Math.min(7,Math.floor(age/75));
   ctx.save();ctx.translate(x,tip);ctx.rotate(j%2?-.12:.12);ctx.globalAlpha=formation*(1-clamp(age/530));ctx.drawImage(this.atlases.sword[f],-18*size,-134*size,36*size,144*size);ctx.restore();count++;
   if(q>0&&q<1){ctx.globalAlpha=.25;ctx.fillStyle='#9bdff0';ctx.fillRect(Math.round(x-1),Math.round(tip-140*size),2,80*size)}
  }
  if(this.index===3&&t>=1200&&t<2530){const k=clamp((t-1200)/210),age=Math.max(0,t-1680),opening=t<1410?.10:1+Math.sin(clamp((t-1410)/200)*Math.PI)*.45,f=Math.min(7,Math.floor(age/108));ctx.save();ctx.translate(320,184);ctx.rotate(-.23);ctx.globalAlpha=1-clamp(age/850);ctx.beginPath();ctx.rect(-260,-140,520*k,300);ctx.clip();ctx.drawImage(this.atlases.rift[f],-250,-120*opening,500,210*opening);ctx.restore();count++;
   if(t>=1490&&t<2070)for(let j=0;j<12;j++){const a=(t-1490)/580,side=j%2?1:-1,x=85+j*40,y=224-j*6+side*a*70;ctx.save();ctx.translate(x,y);ctx.rotate(side*a*.5);ctx.fillStyle=j%3?'#253559':'#9eb8f1';ctx.globalAlpha=(1-a)*.85;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(6,-6);ctx.lineTo(13,3);ctx.lineTo(-5,6);ctx.fill();ctx.restore();count++}
  }
  for(const e of p.hits){const age=t-e.at;if(age>=0&&age<75){ctx.globalAlpha=1-age/75;ctx.strokeStyle='#f2f9df';ctx.lineWidth=age<22?3:1;ctx.beginPath();ctx.moveTo(e.x-14,e.y+23);ctx.lineTo(e.x+12,e.y-23);ctx.stroke();ctx.fillStyle='#ecffff';ctx.fillRect(e.x-4,e.y-4,8,8);count++}}
  if(shards)for(const s of this.shards){const e=p.hits[s.hit],age=t-e.at-s.delay;if(age<0||age>s.life)continue;const k=age/s.life,sec=age/1000,d=s.speed*(1-Math.exp(-2*sec))/2,x=e.x+Math.cos(s.angle)*d,y=e.y+s.offset+Math.sin(s.angle)*d+90*sec*sec;ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(s.angle);ctx.globalAlpha=(1-k)*(1-k)*.85;ctx.fillStyle=s.gold?'#f6ce7c':'#9cdeef';ctx.fillRect(-Math.min(15,s.speed*.02)*(1-k),0,Math.max(s.size,Math.min(15,s.speed*.02)*(1-k)),s.size);ctx.restore();count++}
 }
 ctx.restore();return count}
}
root.SwordShapes=SwordShapes;root.SwordShapeProfiles=profiles;
})(window);
