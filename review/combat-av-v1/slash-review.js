'use strict';
const stage=document.querySelector('#stage'),out=stage.getContext('2d'),buf=document.createElement('canvas');buf.width=640;buf.height=360;const ctx=buf.getContext('2d'),slash=new SlashImpact();
const images={};for(const [k,f]of Object.entries({bg:'bb_street',hero:'b_hero',foe:'b_bandit'})){images[k]=new Image();images[k].src='../../assets/'+f+'.webp'}
let time=0,last=null,running=false,stopped=false,sounds=[];
function silence(){sounds.forEach(a=>a.pause());sounds=[]}
function sound(name){if(!document.querySelector('#sound').checked)return;const a=new Audio('../../assets/audio/combat_review_v2/'+name+'.wav');a.volume=name==='swish_blade'?.3:.45;a.playbackRate=+document.querySelector('#speed').value;sounds.push(a);a.play().catch(()=>{})}
function play(){silence();slash.reset();time=0;last=null;running=true;stopped=false}
function seek(t){silence();if(!slash.active)slash.reset();running=false;stopped=false;time=Math.max(0,Math.min(1800,t));slash.last=time}
function stop(){silence();slash.clear();time=1800;running=false;stopped=true}
function draw(){const hold=document.querySelector('#hold').checked,s=slash.state(time,hold);ctx.imageSmoothingEnabled=false;ctx.drawImage(images.bg,0,0,640,360);ctx.fillStyle='rgba(5,10,26,.48)';ctx.fillRect(0,0,640,360);
 ctx.save();if(!stopped&&s.age>=0&&s.age<55)ctx.filter='brightness(1.8)';ctx.drawImage(images.foe,s.foeFrame*360,0,360,204,200-204*.61+(stopped?0:s.foeOffset),278-204*.61,360*.61,204*.61);ctx.restore();ctx.drawImage(images.hero,s.heroFrame*396,0,396,210,480-145.5*.61+(stopped?0:s.heroOffset),278-210*.61,396*.61,210*.61);
 const count=slash.draw(ctx,time,{hold,shards:document.querySelector('#shards').checked});out.imageSmoothingEnabled=false;out.drawImage(buf,0,0,1280,720);document.querySelector('#phase').textContent=`${stopped?'已停止':time>=1800?'演示结束':s.phase} · ${(time/1000).toFixed(3)} s · ${count} 个刃片/粒子`;document.querySelector('#scrub').value=time}
function frame(now){const dt=last===null?0:Math.min(100,now-last);last=now;if(running){time=Math.min(1800,time+dt*+document.querySelector('#speed').value);for(const e of slash.advance(time)){if(e.name==='release')sound('swish_blade');else{sound('sword_08');sound('punch_09')}}if(time>=1800)running=false}draw();requestAnimationFrame(frame)}
document.querySelector('#play').onclick=play;document.querySelector('#stop').onclick=stop;document.querySelector('#scrub').oninput=e=>seek(+e.target.value);document.querySelector('#sound').onchange=silence;document.querySelector('#speed').onchange=play;document.querySelector('#hold').onchange=play;document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;silence();last=null}});
window.SlashReview={slash,play,seek,stop,get time(){return time},get running(){return running}};
Promise.all(Object.values(images).map(i=>i.decode())).then(()=>{play();requestAnimationFrame(frame)}).catch(()=>document.querySelector('#phase').textContent='场景加载失败');
