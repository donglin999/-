'use strict';
const DATA=COMBAT_AV.entries,grades=['#b5b1a7','#5b97ac','#9a7abc','#c69c52','#c76a58'];
const images={},STORE='xjh.combat-av-v2';let saved={};try{saved=JSON.parse(localStorage.getItem(STORE)||'{}')||{}}catch{}
let family='palm',active=null,serial=0,nowPlaying=null;
for(const id of ['hero','ye','bandit','monk']){const img=new Image();img.src='../../assets/b_'+id+'.webp';images[id]=img}
const background=new Image();background.src='../../assets/bb_street.webp';
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>1-(1-clamp(v))**3;
const $=s=>document.querySelector(s);
function sprite(c,id,x,y,key,time,alpha=1){
 const A=BART[id],img=images[id];if(!img?.naturalWidth)return;
 const anim=A.anim[key]||A.anim.idle,ms=Array.isArray(anim.ms)?anim.ms:anim.f.map(()=>anim.ms);
 let t=Math.max(0,time),i=0;if(anim.loop)t%=ms.reduce((a,b)=>a+b,0);
 while(i<ms.length-1&&t>=ms[i]){t-=ms[i];i++}
 const f=anim.f[i],scale=id==='monk'?.70:.61,anchor=id==='hero'?145.5:id==='ye'?196.5:id==='monk'?96:204;
 c.save();c.globalAlpha=alpha;c.translate(Math.round(x/2)*2,Math.round(y/2)*2);if(id==='monk')c.scale(-1,1);
 c.drawImage(img,f*A.cell[0],0,A.cell[0],A.cell[1],Math.round(-anchor*scale),Math.round(-A.cell[1]*scale),Math.round(A.cell[0]*scale),Math.round(A.cell[1]*scale));c.restore();
}
function shadow(c,x,y){c.fillStyle='#151b20';c.fillRect(Math.round(x)-28,y-2,56,6);c.fillRect(Math.round(x)-20,y-4,40,10)}
function render(e,c,t,showEffects=true){
 c.imageSmoothingEnabled=false;c.clearRect(0,0,640,360);
 if(background.naturalWidth)c.drawImage(background,0,0,640,360);
 c.fillStyle='rgba(8,15,23,.40)';c.fillRect(0,0,640,360);
 const age=Math.min(...e.hits.filter(h=>h<=t).map(h=>t-h)),impact=clamp(1-age/130),hitstop=32+e.tier*7;
 const melee=e.family!=='needle',dash=melee?ease((t-e.release_ms+60)/Math.max(100,e.hit_ms-e.release_ms+60)):0;
 const back=ease((t-e.hits.at(-1)-155)/210),x=480-220*dash*(1-back),actor=e.family==='needle'?'ye':e.family==='palm'?'monk':'hero';
 c.save();if($('#shake').checked&&showEffects&&impact)c.translate(Math.round(Math.sin(t*.1)*impact*(e.family==='needle'?1:2+e.tier)),Math.round(Math.cos(t*.14)*impact*1.5));
 const target=184-(impact>0?Math.round(Math.sin(clamp(age/130)*Math.PI)*5):0);
 shadow(c,target,278);shadow(c,x,278);
 sprite(c,'bandit',target,278,impact?'hurt':'idle',impact?40:t);
 const next=e.hits.find(h=>h>=t-95)??e.hits.at(-1);
 const attacking=t>=e.release_ms&&t<e.hits.at(-1)+110;
 const pose=t<e.start_ms?'idle':t<e.release_ms?'cast':attacking?'atk':'idle';
 const firstFrame=actor==='monk'?160:150;
 const animationTime=pose==='atk'?(t<next?clamp((t-next+110)/110)*firstFrame:firstFrame+(t-next<hitstop?0:t-next-hitstop)):t-e.start_ms;
 if(showEffects&&e.tier>=4&&attacking&&e.family==='blade')sprite(c,actor,x+22,278,pose,animationTime,.18);
 sprite(c,actor,x,278,pose,animationTime);
 if(showEffects)c.drawImage(CombatPixels.draw(e,t,x),0,0,640,360);
 c.restore();c.fillStyle='#b4c2c8';c.font='11px system-ui';c.fillText('襄阳 · 声画试演',18,24);
 c.fillStyle='#91a4ac';c.fillText(e.family==='needle'?'叶蘅 · 攻击针法':e.family==='palm'?'空手动作试演':'萧白 · 刀剑试演',454,329);
}
function status(s){$('#status').textContent=s}
function stop(){serial++;const previous=active;active=null;nowPlaying=null;if(previous){previous.audio.pause();previous.finish()};document.querySelectorAll('.playing').forEach(c=>c.classList.remove('playing'))}
async function play(e){
 stop();const token=serial,card=document.getElementById(e.id),mode=$('#mode').value,rate=+$('#speed').value,c=card.querySelector('canvas').getContext('2d'),audio=new Audio(e.audio);
 audio.volume=+$('#volume').value;audio.playbackRate=rate;audio.preservesPitch=true;
 let done;const finished=new Promise(r=>done=r);active={audio,finish:done};nowPlaying=e.id;card.classList.add('playing');status(`播放：${e.family_name} · ${e.grade} · ${e.title}`);
 const fail=()=>{if(serial===token){stop();status('音效加载失败，请检查本机预览服务后重试。')}};audio.onerror=fail;
 const loadingTimer=setTimeout(fail,7000);
 if(mode!=='visual'){try{await audio.play()}catch{clearTimeout(loadingTimer);fail();return}}
 clearTimeout(loadingTimer);if(token!==serial){audio.pause();return}
 const started=performance.now();
 function tick(){
  if(serial!==token)return;
  if(performance.now()-started>e.total_ms/rate+5000){fail();return}
  const t=mode==='visual'?(performance.now()-started)*rate:audio.currentTime*1000;
  render(e,c,mode==='audio'?0:t,mode!=='audio');card.querySelector('.scrub').value=Math.round(t);
  const phase=t<e.start_ms?'待机':t<e.release_ms?'起手':t<e.hit_ms?'释放':t<e.hits.at(-1)+110?'命中':'收势';
  card.querySelector('.tag').textContent=phase+' · '+Math.round(t)+'ms';
  card.querySelectorAll('.timeline span').forEach(s=>s.classList.toggle('on',s.dataset.phase===phase));
  if(t>=e.total_ms||audio.ended){audio.pause();card.classList.remove('playing');active=null;nowPlaying=null;status(`完成：${e.family_name} · ${e.grade} · ${e.title}`);done();return}
  requestAnimationFrame(tick);
 }
 tick();await finished;
}
function grid(){
 stop();$('#grid').innerHTML='';
 for(const e of DATA.filter(e=>e.family===family).sort((a,b)=>family==='palm'?(b.tier===5?1:0)-(a.tier===5?1:0):0)){
  const card=document.createElement('article');card.id=e.id;card.className='card'+(e.family==='palm'&&e.tier===5?' featured':'');card.style.setProperty('--grade',grades[e.tier-1]);
  card.innerHTML=`<div class="heading"><span class="badge">${e.grade}</span><div><h2>${e.title}</h2><div class="meta">${e.theme}</div></div><span class="window">${e.duration}ms</span></div><div class="canvas-wrap"><canvas width="640" height="360"></canvas><span class="tag">命中预览 · 点击播放</span></div><div class="timeline"><span data-phase="起手">起手</span><span data-phase="释放">释放 ${e.release_ms}ms</span><span data-phase="命中">命中 ${e.hits.join(' / ')}ms</span><span data-phase="收势">收势</span></div><label class="scrubber">逐帧查看 <input class="scrub" type="range" min="0" max="${e.total_ms}" value="${e.hit_ms+25}" step="1" aria-label="逐帧查看 ${e.title}"></label><div class="controls"><button class="play">▶ 播放</button><button class="hold">定格命中</button><select aria-label="评审结论"><option value="">待评审</option><option value="keep">保留方向</option><option value="revise">需要修改</option><option value="reject">不采用</option></select></div><div class="note"><textarea rows="2" placeholder="记录声音、招式轨迹和命中反馈的修改意见…" aria-label="修改意见"></textarea></div>`;
  $('#grid').append(card);card.querySelector('.play').onclick=()=>play(e);
  const freeze=t=>{stop();render(e,card.querySelector('canvas').getContext('2d'),t);card.querySelector('.tag').textContent='定格 · '+Math.round(t)+'ms';card.querySelector('.scrub').value=t};
  card.querySelector('.hold').onclick=()=>freeze(e.hit_ms+25);card.querySelector('.scrub').oninput=event=>freeze(+event.target.value);
  const choice=card.querySelector('select'),note=card.querySelector('textarea');choice.value=saved[e.id]?.choice||'';note.value=saved[e.id]?.note||'';
  const save=()=>{saved[e.id]={choice:choice.value,note:note.value};try{localStorage.setItem(STORE,JSON.stringify(saved))}catch{status('浏览器无法保存意见，请及时导出。')}};choice.onchange=save;note.oninput=save;
  render(e,card.querySelector('canvas').getContext('2d'),e.hit_ms+25);
 }
 document.querySelectorAll('#families button').forEach(b=>b.classList.toggle('active',b.dataset.id===family));
}
for(const [id,name] of [['blade','刀剑'],['palm','拳掌'],['needle','叶蘅针法']]){const b=document.createElement('button');b.textContent=name;b.dataset.id=id;b.onclick=()=>{family=id;grid()};$('#families').append(b)}
$('#stop').onclick=()=>{stop();status('已停止')};$('#mode').onchange=stop;$('#speed').onchange=stop;
$('#volume').oninput=e=>{if(active)active.audio.volume=+e.target.value};
$('#sequence').onclick=async()=>{const button=$('#sequence');button.disabled=true;try{for(const e of DATA.filter(e=>e.family===family)){const expected=serial+1;await play(e);if(serial!==expected)break}}finally{button.disabled=false}};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({batch:'combat-av-v2',reviews:saved},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='功法声画评审-v2.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
for(const source of COMBAT_AV.sources){
 const row=document.createElement('div');row.className='source-row';
 const button=document.createElement('button');button.textContent='▶ '+source.label;button.onclick=async()=>{stop();const token=serial,audio=new Audio(source.audio);audio.volume=+$('#volume').value;active={audio,finish:()=>{}};nowPlaying=source.id;status('源音效试听：'+source.label);audio.onended=()=>{if(serial===token){stop();status('源音效试听完成')}};audio.onerror=()=>{if(serial===token){stop();status('源音效加载失败')}};try{await audio.play();if(token!==serial)audio.pause()}catch{if(token===serial){stop();status('无法播放源音效')}}};
 const link=document.createElement('a');link.href=source.source;link.target='_blank';link.rel='noopener';link.textContent=source.author+' · CC0';row.append(button,link);$('#sources').append(row);
}
addEventListener('keydown',e=>{if(e.code==='Space'&&!/TEXTAREA|INPUT|SELECT|BUTTON/.test(e.target.tagName)){e.preventDefault();stop()}});
addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
Promise.all([...Object.values(images),background].map(i=>i.decode())).then(grid).catch(()=>status('场景素材加载失败，请检查本地预览服务。'));
window.AVReview={get family(){return family},get active(){return nowPlaying},play,stop,render,entries:DATA};
