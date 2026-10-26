/* Procedural pixel atlas + deterministic one-shot slash. No external VFX assets.
   Contact, sound, actor reaction and optional hold share the same timeline. */
(function(root){
 const clamp=x=>Math.max(0,Math.min(1,x));
 class SlashImpact{
  constructor(){this.contact=660;this.duration=1800;this.atlas=this.makeAtlas();this.reset()}
  reset(){let seed=731;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296};this.bits=[];for(let i=0;i<310;i++){const a=Math.PI+(random()-.5)*1.25,speed=170+random()*570;this.bits.push({delay:random()*48,life:110+random()*380,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-35,x:(random()-.5)*10,y:(random()-.5)*32,size:random()<.8?1:2.5,gold:random()>.68})}this.charges=Array.from({length:95},()=>({angle:random()*6.283,radius:16+random()*45,offset:random(),size:random()<.8?1:2}));this.active=true;this.events=[];this.last=-1}
  clear(){this.active=false;this.events=[];this.last=-1}
  advance(time){const events=[];if(!this.active)return events;for(const [at,name]of [[480,'release'],[660,'impact']])if(this.last<at&&time>=at)events.push({at,name});this.last=time;this.events.push(...events);return events}
  time(raw,hold=true){return raw<=660||!hold?raw:raw<715?660:raw-55}
  state(raw,hold=true){const t=this.time(raw,hold),age=t-this.contact,p=clamp((t-480)/180),q=p*p*p;return{t,age,p,headX:465+(232-465)*q,heroFrame:t<180?0:t<480?6:t<550?7:t<800?8:t<1000?9:0,heroOffset:t<480?6*clamp((t-180)/300):t<800?-13:t<1030?-13*(1-clamp((t-800)/230)):0,foeFrame:age>=0&&age<340?12:0,foeOffset:age<0?0:-16*Math.sin(Math.PI*clamp(age/340))*Math.exp(-age/500),phase:t<480?'蓄势':t<660?'刃口切入':t<715?'接触 · 崩裂':t<1000?'受击回弹':'碎屑消散'}}
  makeAtlas(){const frames=[];for(let stage=0;stage<9;stage++){const c=document.createElement('canvas');c.width=112;c.height=176;const g=c.getContext('2d'),pixels=g.createImageData(112,176);for(let y=0;y<176;y++)for(let x=0;x<112;x++){const v=(y-88)/83,edge=24+51*v*v,w=22*Math.pow(Math.max(0,1-v*v),.6),d=x-edge;if(Math.abs(v)>=1||d<0||d>w)continue;const hash=((Math.imul(x+31,y+19)*741103597)>>>0)%997/997;const erosion=stage/9;if(hash<erosion*.88+(d/w)*.18)continue;const streak=Math.sin(y*.48+x*.19)>-.45;const core=d<3.3&&stage<5;const col=core?[229,255,250]:streak?[73,207,235]:[32,110,172];const i=(y*112+x)*4;pixels.data.set([...col,Math.round((core?1:.78)*(1-erosion*.6)*255)],i)}g.putImageData(pixels,0,0);frames.push(c)}return frames}
  draw(ctx,raw,{hold=true,shards=true}={}){if(!this.active)return 0;const s=this.state(raw,hold),t=s.t;let live=0;ctx.save();ctx.imageSmoothingEnabled=false;
   if(t>=180&&t<480){const q=(t-180)/300;for(const p of this.charges){const r=p.radius*(1-q*.85),a=p.angle+q*1.5;ctx.fillStyle='#77d5ec';ctx.globalAlpha=.25+q*.4;ctx.fillRect(Math.round(449+Math.cos(a)*r),Math.round(205+Math.sin(a)*r*.55),p.size,p.size);live++}}
   if(t>=480&&t<855){const erosion=clamp((t-670)/185),stage=Math.min(8,Math.floor(erosion*9));
    // Texture-shaped particles: a sharp primary blade and two staggered ghosts.
    for(let i=2;i>=0;i--){const past=Math.max(480,t-i*19),p=clamp((past-480)/180),x=t>=660?232:465-233*p*p*p;ctx.globalAlpha=(i? .19:.95)*(1-erosion);ctx.drawImage(this.atlas[Math.min(8,stage+i)],Math.round(x-56+i*9),123+i*3);live++}
   }
   const age=s.age;if(age>=0&&age<90){ctx.globalAlpha=1-age/90;ctx.strokeStyle='#fff7d0';ctx.lineWidth=age<25?3:1;ctx.beginPath();ctx.moveTo(216,173);ctx.lineTo(185,248);ctx.stroke();ctx.fillStyle='#e8ffff';ctx.fillRect(193,203,12,12)}
   if(shards&&age>=0){for(const p of this.bits){const a=age-p.delay;if(a<0||a>p.life)continue;live++;const sec=a/1000,k=a/p.life,dist=(1-Math.exp(-2*sec))/2,x=200+p.x+p.vx*dist,y=211+p.y+p.vy*dist+100*sec*sec;ctx.fillStyle=p.gold?'#ffcf76':'#8aeaff';ctx.globalAlpha=(1-k)*(1-k)*.9;ctx.fillRect(Math.round(x),Math.round(y),p.size,p.size);ctx.globalAlpha*=.4;const tail=Math.min(9,Math.abs(p.vx)*.011);ctx.fillRect(Math.round(x+3),Math.round(y),tail,1)}}
   ctx.restore();return live;
  }
 }
 root.SlashImpact=SlashImpact;
})(window);
