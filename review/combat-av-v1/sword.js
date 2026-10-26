'use strict';
// Choreography data is separate from the shared ribbon / blade / array primitives.
const STUDIES=[
 {grade:'丁',name:'碧霄一线',desc:'青蓝粒子卷斩，碎芒沿弧形剑路散开。',colors:['#edffff','#74f9ff','#189bff'],duration:1600,charge:200,hits:[420],mode:0},
 {grade:'丙',name:'双虹照影',desc:'双次粒子卷斩，观察剑流衔接和金色命中碎屑。',colors:['#fff9e9','#ff88d7','#7e65ff'],duration:2100,charge:280,hits:[480,780],mode:1},
 {grade:'乙',name:'七流穿云',desc:'已确认基准：七路宽厚粒子剑气，先慢后快，集中命中。',duration:4700,charge:1250,hits:[1700,2120,2440,2670,2830,2940,3010]},
 {grade:'甲',name:'紫阙星河',desc:'双流缓慢成阵，八剑从上下两层加速汇击；留出一拍，再以两道宽阔交叉斩收束。',...SwordChoreography.profiles[3]},
 {grade:'绝',name:'万象归墟',desc:'三层气流展开天地剑域，十二剑雨递进；万流回吸蓄势后，主剑与两道辅流贯空，三层余波扩散。',...SwordChoreography.profiles[4]}
];
const canvas=document.querySelector('#stage'),out=canvas.getContext('2d'),buf=document.createElement('canvas');buf.width=640;buf.height=360;const g=buf.getContext('2d');
const light=document.createElement('canvas');light.width=640;light.height=360;const fx=light.getContext('2d');
const engine=new ParticleFX.Engine({maxParticles:1600});
const images={};for(const [k,file] of Object.entries({bg:'bb_street',hero:'b_hero',foe:'b_bandit'})){images[k]=new Image();images[k].src='../../assets/'+file+'.webp'}
let selected=4,t=0,last=0,running=false,reviewing=false,sequence=false,sounded=new Set(),audios=[];
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-Math.pow(1-clamp(x),3),mix=(a,b,k)=>a+(b-a)*k;
const palette=['#62f3ff','#8391ff','#da7bff','#ff84b3','#ffd97a','#6cffe3'];
const field=new SwordParticleField();
function silence(){audios.forEach(a=>a.pause());audios=[]}
function play(i=selected,keepSequence=false){selected=i;sequence=keepSequence;t=0;running=true;reviewing=false;sounded.clear();silence();engine.reset();field.build(i,STUDIES[i].hits);document.querySelector('#name').textContent=STUDIES[i].name;document.querySelector('#desc').textContent=STUDIES[i].desc;document.querySelectorAll('#choices button').forEach((b,j)=>b.classList.toggle('active',i===j))}
function sound(file,volume){if(!document.querySelector('#sound').checked)return;audios=audios.filter(a=>!a.ended&&!a.paused);while(audios.length>=6)audios.shift().pause();const a=new Audio('../../assets/audio/combat_review_v2/'+file+'.wav');a.volume=volume;a.playbackRate=Number(document.querySelector('#speed').value);audios.push(a);a.play().catch(()=>{});}
let moteCount=0;
function draw(s,time,layer){fx.clearRect(0,0,640,360);const count=field.draw(fx,time,layer);if(layer==='back')moteCount=count;else moteCount+=count;g.save();g.globalCompositeOperation='screen';g.globalAlpha=.28;g.filter='blur(4px)';g.drawImage(light,0,0);g.restore();g.drawImage(light,0,0)}
function frame(now){let dt=last?Math.min(50,now-last):0;last=now;let s=STUDIES[selected];if(running){t+=dt*Number(document.querySelector('#speed').value);engine.update(dt*Number(document.querySelector('#speed').value));for(let i=0;i<s.hits.length;i++){if(t>=s.hits[i]&&!sounded.has(i)){sounded.add(i);sound(i%2?'sword_04':'sword_08',i>=s.hits.length-(selected===4?3:2)?.32:.18);sound('punch_09',i>=s.hits.length-(selected===4?3:2)?.2:.09)}}if(t>=s.duration){if(sequence&&selected<4){play(selected+1,true);s=STUDIES[selected]}else{running=false;sequence=false}}}
 g.clearRect(0,0,640,360);g.imageSmoothingEnabled=false;g.drawImage(images.bg,0,0,640,360);g.fillStyle='rgba(5,10,26,.58)';g.fillRect(0,0,640,360);const hitAge=Math.min(...s.hits.map(h=>t>=h?t-h:9999));
 draw(s,t,'back');
 g.save();if(hitAge<100)g.filter='brightness(2)';g.drawImage(images.foe,(hitAge<180?12:0)*360,0,360,204,200-204*.61,278-204*.61,360*.61,204*.61);g.restore();g.drawImage(images.hero,13*396,0,396,210,480-145.5*.61,278-210*.61,396*.61,210*.61);
 draw(s,t,'front');out.imageSmoothingEnabled=false;out.drawImage(buf,0,0,1280,720);
 document.querySelector('#phase').textContent=!running&&!reviewing?'演示结束':s.phases?s.phases.filter(p=>t>=p[0]).at(-1)[1]:t<s.charge?'蓄势 · 成形':t<s.hits.at(-1)+100?'释放 · 命中':'余韵 · 消散';document.querySelector('#progress').value=clamp(t/s.duration);if(running)document.querySelector('#scrub').value=clamp(t/s.duration);document.querySelector('#stats').textContent=`${(t/1000).toFixed(2)} s · ${moteCount} 粒子`;requestAnimationFrame(frame)}
STUDIES.forEach((s,i)=>{const b=document.createElement('button');b.innerHTML=`${s.grade} · ${s.name}<small>${(s.duration/1000).toFixed(1)} 秒 / ${['单次卷斩','双次卷斩','已确认的乙等基准','双流 · 八剑 · 双斩','剑域 · 剑雨 · 贯空'][i]}</small>`;b.onclick=()=>play(i);document.querySelector('#choices').append(b)});
document.querySelector('#replay').onclick=()=>play();document.querySelector('#sequence').onclick=()=>play(0,true);document.querySelector('#stop').onclick=()=>{running=false;reviewing=false;sequence=false;t=STUDIES[selected].duration;engine.reset();field.reset();silence()};document.querySelector('#sound').onchange=silence;document.querySelector('#speed').onchange=()=>play();document.addEventListener('visibilitychange',()=>{if(document.hidden){running=false;sequence=false;silence()}});
function seek(time){if(!field.particles.length)field.build(selected,STUDIES[selected].hits);running=false;reviewing=true;sequence=false;t=clamp(time/STUDIES[selected].duration)*STUDIES[selected].duration;silence()}
document.querySelector('#scrub').oninput=e=>seek(Number(e.target.value)*STUDIES[selected].duration);
window.SwordReview={play,seek,engine,field,studies:STUDIES,get time(){return t},get running(){return running}};
Promise.all(Object.values(images).map(i=>i.decode())).then(()=>{play(4);requestAnimationFrame(frame)}).catch(()=>document.querySelector('#phase').textContent='场景加载失败，请通过本地评审服务器打开');
