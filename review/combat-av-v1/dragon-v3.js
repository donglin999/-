'use strict';
(()=>{
const $=s=>document.querySelector(s),canvas=$('#stage'),c=canvas.getContext('2d'),W=640,H=360,DURATION=4800,HIT=2380;
const fx=document.createElement('canvas');fx.width=W;fx.height=H;const f=fx.getContext('2d');
const light=document.createElement('canvas');light.width=160;light.height=90;const l=light.getContext('2d');
const mask=document.createElement('canvas');mask.width=396;mask.height=210;const m=mask.getContext('2d');
const images={};for(const id of ['monk','bandit']){const im=new Image();im.src='../../assets/b_'+id+'.webp';images[id]=im}const bg=new Image();bg.src='../../assets/bb_street.webp';
const audio=new Audio('../../assets/audio/combat_review_v2/dragon_v3.wav');audio.preload='auto';
const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)},lerp=(a,b,q)=>a+(b-a)*q,rand=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
let time=1830,running=false,token=0,start=0,offset=0,ready=false;
function pix(x,y,color,size=1,alpha=1){f.globalAlpha=clamp(alpha);f.fillStyle=color;f.fillRect(Math.round(x),Math.round(y),size,size);f.globalAlpha=1}
function line(x,y,u,v,color,width=1,alpha=1){x=Math.round(x);y=Math.round(y);u=Math.round(u);v=Math.round(v);const dx=Math.abs(u-x),sx=x<u?1:-1,dy=-Math.abs(v-y),sy=y<v?1:-1;let err=dx+dy;for(let n=0;n<1200;n++){pix(x,y,color,width,alpha);if(x===u&&y===v)break;const e=err*2;if(e>=dy){err+=dy;x+=sx}if(e<=dx){err+=dx;y+=sy}}}
function poly(ps,color,alpha=1){f.fillStyle=color;f.globalAlpha=clamp(alpha);const lo=Math.max(0,Math.floor(Math.min(...ps.map(p=>p[1])))),hi=Math.min(H-1,Math.ceil(Math.max(...ps.map(p=>p[1]))));for(let y=lo;y<=hi;y++){const xs=[];for(let i=0,j=ps.length-1;i<ps.length;j=i++){const a=ps[i],b=ps[j];if((a[1]>y+.5)!==(b[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]))}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2){const x=Math.ceil(xs[i]);f.fillRect(x,y,Math.max(1,Math.floor(xs[i+1])-x),1)}}f.globalAlpha=1}
function glow(x,y,r,color,strength){if(strength<=0)return;l.globalCompositeOperation='lighter';const g=l.createRadialGradient(x/4,y/4,0,x/4,y/4,r/4);g.addColorStop(0,`rgba(${color},${clamp(strength)})`);g.addColorStop(.3,`rgba(${color},${clamp(strength*.35)})`);g.addColorStop(1,`rgba(${color},0)`);l.fillStyle=g;l.fillRect((x-r)/4,(y-r)/4,r/2,r/2)}
function arc(x,y,rx,ry,a0,a1,col,alpha=1,jitter=0){let prev=null;for(let i=0;i<=100;i++){const a=lerp(a0,a1,i/100),r=1+Math.sin(a*11)*jitter,p=[x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r];if(prev)line(...prev,...p,col,1,alpha);prev=p}}
function sprite(id,x,y,frame,flash=0,alpha=1){const A=BART[id],im=images[id],scale=id==='monk'?.74:.63,anchor=id==='monk'?96:204;c.save();c.globalAlpha=alpha;c.translate(Math.round(x),y);if(id==='monk')c.scale(-1,1);c.drawImage(im,frame*A.cell[0],0,...A.cell,-anchor*scale,-A.cell[1]*scale,A.cell[0]*scale,A.cell[1]*scale);if(flash){m.clearRect(0,0,396,210);m.globalCompositeOperation='source-over';m.drawImage(im,frame*A.cell[0],0,...A.cell,0,0,...A.cell);m.globalCompositeOperation='source-in';m.fillStyle=`rgba(255,247,205,${flash})`;m.fillRect(0,0,396,210);m.globalCompositeOperation='source-over';c.drawImage(mask,0,0,...A.cell,-anchor*scale,-A.cell[1]*scale,A.cell[0]*scale,A.cell[1]*scale)}c.restore()}
function field(t){const power=smooth(t/900)*(1-smooth((t-1250)/500));if(power<=0)return;glow(463,224,90,'255,172,54',power*.6);for(let i=0;i<145;i++){const phase=(t*.00065+rand(i))%1,a=rand(i+53)*Math.PI*2+phase*2.8,r=(1-phase)*(24+rand(i+102)*84),x=461+Math.cos(a)*r,y=223+Math.sin(a)*r*.7;pix(x,y,i%4?'#c59d4d':'#fff4ba',i%5?1:2,power*phase);if(i%7===0)line(x,y,x+Math.cos(a)*4,y+Math.sin(a)*3,'#997943',1,power*.7)}for(let j=0;j<3;j++)arc(478,286,35+j*12,7+j*3,t*.004+j,t*.004+j+3.8,j===0?'#edd58b':'#866637',power*(1-j*.2),.02);const r=3+power*4;poly([[459-r,223],[459,223-r],[459+r,223],[459,223+r]],'#fff5c5',power)}
function dragon(t){if(t<780||t>3370)return;
 const form=smooth((t-780)/630),flight=smooth((t-1450)/930),fade=smooth((t-2660)/650),x=lerp(420,169,flight),y=lerp(167,224,flight)-Math.sin(flight*Math.PI)*52,length=lerp(135,306,flight),reveal=form*(1-fade);
 if(reveal<=0)return;
 const path=[];for(let i=0;i<=84;i++){const s=i/84,depth=Math.sin(s*8.4-t*.0033),px=x+s*length+Math.sin(s*Math.PI*2)*15*(1-flight),py=y+Math.sin(s*8.4-t*.0033)*Math.sin(Math.PI*s)*37+s*(28-35*flight);path.push({x:px,y:py,r:(13*(1-s)**.65+1)*(1+depth*.18),depth})}
 // Connected ribbons keep the body volumetric across bends; scales follow its tangent.
 const count=Math.max(2,Math.floor(84*form));
 for(let i=0;i<=84;i++){const a=path[Math.max(0,i-1)],b=path[Math.min(84,i+1)],d=Math.hypot(b.x-a.x,b.y-a.y)||1;path[i].nx=-(b.y-a.y)/d;path[i].ny=(b.x-a.x)/d}
 const band=(lo,hi,col)=>{const ps=[];for(let i=0;i<=count;i++){const a=path[i];ps.push([a.x+a.nx*a.r*lo,a.y+a.ny*a.r*lo])}for(let i=count;i>=0;i--){const a=path[i];ps.push([a.x+a.nx*a.r*hi,a.y+a.ny*a.r*hi])}poly(ps,col,reveal)};
 band(-1.15,1.15,'#69431f');band(-1,1,'#b27a30');band(-.85,.58,'#dbaa4c');band(-.7,-.22,'#efd07b');band(.45,.78,'#f4d78c');band(.77,.94,'#ac7c32');
 for(let i=2;i<count;i+=2){const a=path[i],s=i/84,nx=a.nx,ny=a.ny,tx=ny,ty=-nx;const at=(u,v)=>[a.x+tx*u+nx*v,a.y+ty*u+ny*v];
  for(const row of [-.5,.07,.6]){const v=a.r*row;poly([at(-2,v),at(1,v-2),at(4,v),at(1,v+3)],row===.6?'#b98a3a':'#a97930',reveal*.8);const p=at(-2,v),q=at(1,v-2);line(...p,...q,row===-.5?'#fff0b0':'#ebc568',1,reveal*.7)}
  if(i%4===2){const rx=a.x-nx*a.r,ry=a.y-ny*a.r;poly([[rx-tx*2,ry-ty*2],[rx-nx*7-tx*3,ry-ny*7-ty*3],[rx+tx*6,ry+ty*6]],'#b98537',reveal);line(rx-nx*7-tx*3,ry-ny*7-ty*3,rx+tx*6,ry+ty*6,'#f3d082',1,reveal)}
 }
 // Four bent limbs with knuckles and three separate claws.
 for(const [idx,side] of [[17,1],[30,-1],[48,1],[62,-1]]){if(idx/84>form||fade>.5)continue;const a=path[idx],bend=Math.sin(t*.006+idx)*5,px=a.x,py=a.y+side*a.r*.55;line(px,py,px-5,py+side*14,'#805021',5,reveal);line(px-5,py+side*14,px-19,py+side*(19+bend),'#d5a048',4,reveal);for(let j=0;j<3;j++){line(px-19+j*4,py+side*(18+bend),px-26+j*5,py+side*(25+bend),'#ffe4a1',1,reveal)}}
 // Head follows the neck, facing into its travel; all features are attached in local space.
 const angle=Math.atan2(path[5].y-y,path[5].x-x)*.4;
 const tr=ps=>ps.map(([u,v])=>[x+u*Math.cos(angle)-v*Math.sin(angle),y+u*Math.sin(angle)+v*Math.cos(angle)]);
 const hp=(ps,col,a=1)=>poly(tr(ps),col,a*reveal),hl=(u,v,q,r,col,w=1)=>{const a=tr([[u,v],[q,r]]);line(...a[0],...a[1],col,w,reveal)};
 // Jagged mane has distinct shadow and lit strands, not a solid triangular block.
 for(let i=0;i<11;i++){const a=-1.5+i*.30,root=[7+Math.cos(a)*12,Math.sin(a)*14],tip=[root[0]+16+Math.sin(t*.011+i)*4,root[1]+Math.sin(a)*13];hp([root,[tip[0],tip[1]],[root[0]+4,root[1]+5]],i%2?'#d69939':'#895029');hl(root[0],root[1],tip[0]-3,tip[1],'#f6d17a')}
 hp([[-23,-7],[-13,-17],[1,-19],[14,-11],[15,7],[5,17],[-15,13],[-31,5],[-32,-2]],'#694025');
 hp([[-24,-7],[-12,-15],[0,-16],[11,-10],[9,3],[-4,7],[-18,5],[-33,0],[-33,-5]],'#d4a04c');
 hp([[-22,-8],[-10,-13],[0,-13],[4,-8],[-7,-6],[-17,-4],[-31,-4]],'#fff0bb');
 hp([[-31,3],[-19,5],[-4,3],[7,0],[2,9],[-13,10],[-27,7]],'#493a26');
 hp([[-28,8],[-13,11],[2,9],[8,4],[4,14],[-12,15],[-23,11]],'#d5a34b');hl(-26,9,-12,12,'#fff0bb');
 hp([[-15,-8],[-2,-7],[-6,-3],[-14,-4]],'#493a28');hl(-13,-6,-6,-5,'#fff3c1');hl(-9,-6,-8,-5,'#b05c19');hl(-16,-11,-1,-12,'#8f5828',2);hl(-31,-3,-27,-3,'#6e4629',2);
 for(const i of [-24,-4])hp([[i,4],[i+3,4],[i+1,9]],'#fff2c4');hp([[-5,-13],[7,-9],[5,-2],[-1,-5]],'#b57f35');hp([[-29,-3],[-20,-6],[-17,-3],[-24,0]],'#eecb7b');
 // Branched swept antlers, curled whiskers and a tapered beard.
 for(const j of [0,1]){hl(j*8-1,-15,j*8+9,-30,'#a77539',4);hl(j*8+9,-30,j*8+25,-39,'#ffe5a0',2);hl(j*8+15,-33,j*8+15,-43,'#f0c778');hl(j*8+22,-37,j*8+31,-34,'#f0c778')}
 for(let j=0;j<3;j++){let old=[-29,4+j*2];for(let i=1;i<=24;i++){const s=i/24,p=[-29-s*38,4+j*3+Math.sin(s*5+t*.009+j)*7+s*6];hl(...old,...p,j===0?'#fff0b7':'#c99743');old=p}}
 for(let j=0;j<5;j++)hp([[-8+j*3,17],[-10+j*4+Math.sin(t*.01+j)*3,35-j*2],[-3+j*3,18]],j%2?'#ba8138':'#f0c576');
 // Thin luminous trails bridge the creature and the caster's palm.
 for(let j=0;j<4;j++){let old=null;for(let i=5;i<84;i++){const p=path[i],a=[p.x,p.y+Math.sin(i*.12+j+t*.006)*(16+j*5)];if(old&&i%11<8)line(...old,...a,j%2?'#ddab4f':'#ffe9a3',1,reveal*.45);old=a}}
 glow(x-8,y,80,'255,177,51',reveal*.65);for(let i=12;i<80;i+=18)glow(path[i].x,path[i].y,43,'236,147,29',reveal*.3);
 for(let i=0;i<190;i++){const u=rand(i+77),p=path[Math.floor(u*83)],age=((t*.0008+rand(i))%1),dx=age*(25+fade*130),dy=(rand(i+9)-.5)*(18+fade*110);pix(p.x+dx,p.y+dy,i%3?'#d49c45':'#ffeab0',i%9?1:2,reveal*(1-age)*.85)}
}
function impact(t){const age=t-HIT;if(age<0||age>1900)return;const q=age/1900,blast=Math.exp(-age/160),x=166,y=227;
 glow(x,y,135,'255,183,73',blast);glow(x,282,160,'247,133,31',Math.exp(-age/500)*.5);
 if(age<220){for(let i=0;i<17;i++){const a=i*6.283/17+rand(i)*.25,r=(22+rand(i+66)*48)*(1-age/260);poly([[x+Math.cos(a-.12)*8,y+Math.sin(a-.12)*8],[x+Math.cos(a)*r,y+Math.sin(a)*r],[x+Math.cos(a+.12)*9,y+Math.sin(a+.12)*9]],i%3?'#f9d981':'#fff8d9',1-age/230)}poly([[x-9,y],[x-3,y-8],[x+6,y-7],[x+12,y+1],[x+3,y+10],[x-7,y+6]],'#fff8e4',blast)}
 for(let j=0;j<3;j++){const a=age-j*95;if(a<0||a>650)continue;const r=10+a*.16;arc(x,284,r,r*.24,.2+j,5.9+j,j===0?'#ffe4a0':'#b78749',(1-a/650)*.7,.018)}
 for(let i=0;i<165;i++){const life=420+rand(i+88)*900;if(age>life)continue;const a=rand(i)*6.283,v=35+rand(i+44)*185,dt=age/1000,px=x+Math.cos(a)*v*dt,py=y+Math.sin(a)*v*.68*dt+75*dt*dt,alpha=1-age/life;if(i%4===0)line(px,py,px-Math.cos(a)*9,py-Math.sin(a)*7,'#fbe2a0',1,alpha);else pix(px,py,i%3?'#c69c5f':'#fff0be',i%6?1:2,alpha)}
 for(let i=0;i<27;i++){const dt=age/1000,u=rand(i+410),dir=i%2?1:-1,px=x+dir*(13+u*87)*Math.min(1.6,dt),py=283-Math.sin(clamp(dt/1.5)*Math.PI)*(5+rand(i+32)*13),r=(4+rand(i+3)*7)*(1-q);poly([[px-r,py],[px-r*.8,py-r],[px,py-r*1.3],[px+r,py-r*.5],[px+r,py+2],[px-r*.4,py+3]],i%3?'#877768':'#b9a384',(1-q)*.45)}
}
function render(t){if(!ready)return;time=Math.max(0,Math.min(DURATION,t));f.clearRect(0,0,W,H);l.clearRect(0,0,160,90);c.imageSmoothingEnabled=false;c.drawImage(bg,0,0,W,H);
 const energy=smooth((t-300)/800)*(1-smooth((t-3300)/1000));c.fillStyle=`rgba(3,12,26,${.3+energy*.24})`;c.fillRect(0,0,W,H);
 const age=t-HIT,flash=age>=0&&age<170?Math.max(0,1-age/170):0,shake=$('#camera').checked&&age>=0&&age<300?(1-age/300)*5:0;
 c.save();c.translate(Math.round(Math.sin(t*.09)*shake),Math.round(Math.cos(t*.13)*shake*.5));
 c.fillStyle='#080f19aa';c.fillRect(452,283,63,7);c.fillRect(140,283,58,7);
 const recoil=age>=0?Math.sin(clamp(age/520)*Math.PI)*15:0;
 sprite('bandit',170-recoil,287,age>=0&&age<650?12:Math.floor(t/240)%3,flash>.35?1:flash*.5);
 const pose=t<350?0:t<1450?13:t<2350?6:t<2670?7:t<3060?8:t<3500?9:0;
 sprite('monk',480-(t>1450&&t<3060?5:0),287,pose);
 field(t);dragon(t);impact(t);
 c.save();c.imageSmoothingEnabled=true;c.globalCompositeOperation='screen';c.drawImage(light,0,0,W,H);c.restore();c.drawImage(fx,0,0);
 if(flash>.55){c.fillStyle=`rgba(255,223,157,${flash*.065})`;c.fillRect(0,0,W,H)}c.restore();
 const phase=t<1000?'聚劲成形':t<HIT?'龙形扑出':t<2860?'掌劲爆发':'余劲消散';$('#phase').textContent=phase;$('#clock').textContent=(t/1000).toFixed(2)+' / 4.80 s';$('#seek').value=t;
 document.querySelectorAll('.beats button').forEach((b,i)=>b.classList.toggle('active',i===(t<1000?0:t<HIT?1:t<2860?2:3)));
}
function pause(){running=false;token++;audio.pause();$('#play').textContent='▶ 播放完整招式'}
async function play(from=0){pause();if(!ready)return;const id=token;offset=from;audio.volume=+$('#volume').value;audio.playbackRate=+$('#speed').value;audio.preservesPitch=true;audio.currentTime=from/1000;if($('#sound').checked){try{await audio.play()}catch{if(id===token)$('#status').textContent='音效无法播放；可关闭音效查看动画。';return}}if(id!==token)return;running=true;start=performance.now();$('#status').textContent='播放中';$('#play').textContent='↻ 重新播放';const tick=()=>{if(!running||id!==token)return;const t=$('#sound').checked?audio.currentTime*1000:offset+(performance.now()-start)*Number($('#speed').value);render(t);if(t>=DURATION-10||($('#sound').checked&&audio.ended)){pause();render(DURATION);$('#status').textContent='播放完成，可以拖动时间条检查细节。';return}if(performance.now()-start>12000){pause();$('#status').textContent='音效播放中断，请重试。';return}requestAnimationFrame(tick)};tick()}
$('#play').onclick=()=>play(0);$('#pause').onclick=()=>{if(running){pause();$('#pause').textContent='继续'}else{play(time>=DURATION?0:time);$('#pause').textContent='暂停'}};
$('#restart').onclick=()=>{pause();render(0)};$('#seek').oninput=e=>{pause();render(+e.target.value)};for(const b of document.querySelectorAll('[data-time]'))b.onclick=()=>{pause();render(+b.dataset.time)};
$('#volume').oninput=()=>audio.volume=+$('#volume').value;$('#speed').onchange=()=>{const resume=running;pause();if(resume)play(time)};$('#sound').onchange=()=>{const resume=running;pause();if(resume)play(time)};$('#camera').onchange=()=>{if(!running)render(time)};
try{$('#notes').value=localStorage.getItem('xjh-dragon-v3-notes')||''}catch{}$('#notes').oninput=e=>{try{localStorage.setItem('xjh-dragon-v3-notes',e.target.value)}catch{}};
audio.onerror=()=>{pause();$('#status').textContent='音效加载失败，可关闭音效查看特效。'};document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
Promise.all([bg,...Object.values(images)].map(i=>i.decode())).then(()=>{ready=true;render(1830);$('#status').textContent='已就绪。点击播放完整招式，或选择四个关键阶段。'}).catch(()=>$('#status').textContent='场景素材加载失败，请检查本地预览服务。');
window.DragonReview={render,play,pause,get time(){return time},get running(){return running},duration:DURATION,hit:HIT};
})();
