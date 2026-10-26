'use strict';
// 赠礼／赔礼面板、易物面板（2026-10-26 开发二）。规则在 js/qihe-gift.js，台词在 ink（story/01-开始/人物-收礼与易物.ink）。
// 照用户确认的样子做：赠礼＝渲染图 ../xiaojianghu/review/batch2-ui/01、01b、02（第十六轮第三版，照大侠立志传送礼界面）；
//               易物＝可交互原型 ../xiaojianghu/review/batch2-ui/trade-physics/index.html 第 4 版（照大侠立志传易物界面）。
// 画面按 1600×900 写，整层按游戏区宽度等比缩放（同 js/qihe-npc-ui.js）。
(()=>{
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;
 const G=()=>window.QiheGift,Q=()=>window.QiheNpc;
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 let layer=null,Z=1,keyFn=null,active=null;   // active：当前这一轮面板的收尾函数（外部 close 时也要结束它，免得定时器回头重画）
 function fit(){const game=document.getElementById('game'),r=game.getBoundingClientRect();Z=r.width/1600||1;layer.style.zoom=Z;layer.style.height=(r.height/Z)+'px'}
 function ensure(){if(!layer){layer=document.createElement('div');layer.id='qg-layer';document.getElementById('game').appendChild(layer);addEventListener('resize',()=>{if(!layer.hidden)fit()})}fit();layer.hidden=false;layer.innerHTML='';return layer}
 function close(){if(active){const f=active;active=null;f('closed');return}if(layer){layer.innerHTML='';layer.hidden=true}keyFn=null}
 function shut(){active=null;if(layer){layer.innerHTML='';layer.hidden=true}keyFn=null}
 // 拦下整次按键（stopImmediatePropagation）：关面板后墨印菜单会在同一次按键里重新打开，不拦的话它会接着收到这个 Esc 又关掉
 addEventListener('keydown',e=>{if(!keyFn)return;e.preventDefault();e.stopImmediatePropagation();keyFn(e)},true);
 // 采集物用资源点图标（地图上捡的就是这几样），其余用江湖页同一套物品图标；外面套一层定尺寸的框，免得字形占位撑出格子
 const RES_ICON={qh_wild_herb:'r_qh_herb_v1',qh_dry_branch:'r_qh_branch_v1',qh_river_reed:'r_qh_reed_v1'};
 const icon=(id,sz)=>{let h='';if(RES_ICON[id])h=`<img src="${esc(assetImagePath(RES_ICON[id]))}" alt="">`;else{try{if(typeof mnIco==='function')h=mnIco(id,sz)}catch(e){}}
  if(!h)h=`<span class="qg-gl">${esc((ITEMS[id]?.name||'？')[0])}</span>`;return`<span class="qg-ic" style="width:${sz}px;height:${sz}px">${h}</span>`};
 const tierCls=t=>t>=3?'q2':t>=2?'q1':'q0';
 function face(p,npc){if(p.portrait)return`<img src="${esc(assetImagePath(p.portrait))}" alt="">`;
  try{const c=miniSprite((npc?.sp||'').split(':')[0]);if(c)return`<img class="px" src="${c.toDataURL()}" alt="">`}catch(e){}return''}
 const LOCK=(open,c)=>`<svg class="qg-lock" viewBox="0 0 20 20"><path d="${open?'M6 9V6a4 4 0 0 1 7.6-1.7':'M6 9V6a4 4 0 0 1 8 0v3'}" fill="none" stroke="${c}" stroke-width="2"/><rect x="3.5" y="9" width="13" height="9" rx="2" fill="${c}"/></svg>`;

 // ════════ 赠礼／赔礼 ════════
 async function gift(npc,p){const L=ensure();let res,done=false;const finish=v=>{if(done)return;done=true;shut();setTimeout(()=>res(v),0)};/* 等这次按键分发完再交回，免得重新打开的墨印菜单接着收到同一个 Esc */const out=new Promise(r=>res=r);active=finish;
  let focus=0,logs=[],bubble='',busy=false;
  async function draw(){const b=Q().bond.get(p.id),neg=b.score<0,used=G().usedThisSlot(p),bag=G().bagFor(p),known=G().state().known[p.id]||{},he=p.she?'她':'他';
   const likes=Object.entries(known).filter(([,v])=>v==='xi'||v==='no').slice(0,3);while(likes.length<3)likes.push(null);
   const perks=G().perks(p),cur=b.score;
   const perkRow=r=>{const on=cur>=r.min&&(r.max==null||cur<=r.max);const st=on?(r.min<0?'bad':'on'):'';return`<div class="qg-pk ${st}">${LOCK(on,on?(r.min<0?'#f0a18a':'#8fd19a'):'#6d665a')}<span>${esc(r.text)}</span><span class="t">${r.tier}</span></div>`};
   const cells=bag.map((it,i)=>{const j=neg?G().judge(p,it.id):null,off=neg?j.keep:it.known==='no',why=off?(neg?(j.why==='no'?'不收':'不收'):'不收'):'';
    return`<button type="button" class="qg-it ${tierCls(it.tier)}${off?' off':''}${i===focus?' hov':''}" data-i="${i}" aria-label="${esc(it.name)}">${icon(it.id,56)}${it.known==='xi'?'<span class="like">喜</span>':''}<span class="n">${it.n}</span>${why?`<span class="why">${why}</span>`:''}</button>`}).join('')+'<div class="qg-it empty"></div>'.repeat(Math.max(0,15-bag.length));
   const fo=bag[focus],pv=fo&&G().preview(p,fo.id);
   const tip=fo?`<div class="qg-tip" style="left:${1000+(focus%5)*90>1180?880:1000}px;top:${300+Math.floor(focus/5)*90}px"><h4>${esc(fo.name)}<s>${G().TIER_NAME[fo.tier]} · ${esc(fo.tag)}</s></h4><p>${esc(ITEMS[fo.id]?.desc||'')}</p><div class="pv${pv?'':' q'}">${pv?esc((neg?`${he}喜欢的：`:`${he}喜欢的：`)+pv.text):'送了才知道'+he+'喜不喜欢'}</div></div>`:'';
   const hint=G().hint(p);
   L.innerHTML=`<div class="qg-catch"></div><div class="qg-pn" style="left:300px;top:150px;width:1120px;height:600px"><div class="bd"></div><div class="eave"></div><div class="foot"></div><button type="button" class="x" aria-label="关闭">×</button><div class="ttl">${neg?'赔礼':'赠礼'}</div></div>
    <div class="qg-card" style="left:340px;top:190px"><div class="av">${face(p,npc)}</div><div class="kv"><div class="nm">${esc(p.name)}<small>${esc(p.role||'')}</small></div>
     <span>关系</span><b class="stg${neg?' neg':''}">${b.stage}　${b.score}${draw.delta?`<span class="plus${draw.delta<0?' minus':''}">${draw.delta>0?'＋':''}${draw.delta}</span>`:''}</b><span>本时段</span><b${used?' class="dim"':''}>${used?'已送过':neg?'还能赔 1 次':'还能送 1 次'}</b>
     <span>喜好</span><div class="likes">${likes.map(x=>x?`<b class="${x[1]==='no'?'no':''}">${esc(x[0][0])}</b>`:'<b class="q">？</b>').join('')}</div></div></div>
    ${bubble?`<div class="qg-say">${esc(bubble)}</div>`:''}
    <div class="qg-perks" style="left:340px;top:360px"><div class="cap">你们现在是“${b.stage}”${b.score>=0?'，关系能换来这些':''}</div>${perks.map(perkRow).join('')}${hint?`<div class="qg-hint${neg?' neg':''}">${esc(hint)}</div>`:''}</div>
    <div class="qg-rhead" style="left:900px;top:190px">${neg?'选一件赔给'+he:'选一件送'+he}<i>${neg?he+'只收厚礼或'+he+'喜欢的':'点一下就送出 · 停在上面看详情'}</i></div>
    <div class="qg-grid" style="left:904px;top:232px">${cells||''}</div>
    ${used||b.stage==='仇视'?`<div class="qg-mask">${b.stage==='仇视'?esc(he+'不收你的东西了，要请中人说和'):'这个时段已经送过了，下个时段再来'}</div>`:tip}
    ${bag.length?'':'<div class="qg-mask">行囊里没有能送的东西</div>'}
    <div class="qg-log">${logs.map((l,i)=>`<div class="${i<logs.length-1?'old':''}">${l}</div>`).join('')}</div>
    <div class="qg-keys"><span><u>↑↓←→</u>选</span><span><u>E</u>${neg?'赔上':'送出'}</span><span><u>Esc</u>关</span><span>鼠标：点一下${neg?'赔上':'送出'} · 停在上面看详情</span></div>`;
   L.querySelector('.x').onclick=()=>finish('again');
   L.querySelectorAll('.qg-it[data-i]').forEach(el=>{el.onmouseenter=()=>{const i=+el.dataset.i;if(i!==focus){focus=i;draw()}};el.onclick=()=>pick(+el.dataset.i)});
   draw.delta=0}
  async function pick(i){if(busy)return;const it=G().bagFor(p)[i];if(!it||G().usedThisSlot(p))return;const b=Q().bond.get(p.id);if(b.stage==='仇视')return;
   if(it.tier>=3&&!await confirmBox(`真要把${it.name}${b.score<0?'赔':'送'}给${p.she?'她':'他'}？`))return draw();
   busy=true;const r=G().give(p,it.id);
   const kind=r.kind==='amend-ok'?'amend-ok':r.kind==='amend-no'?'amend-no':r.kind;
   const ln=await G().lineFor('qh_gift_line',{pid:p.id,kind,who:p.name});bubble=ln?.text||'';
   if(!r.keep){logs.push(`失去 1 个<b>${esc(r.name)}</b>`);const d=r.after-r.before;if(d)logs.push(`与${esc(p.name)}关系${d>0?'提升':'下降'} <span class="${d>0?'g':'r'}">${Math.abs(d)}</span> 点`);
    if(r.stage!==r.stageBefore)logs.push(`与${esc(p.name)}关系到了<b>${r.stage}</b>`);if(r.firstKnown&&r.kind==='xi')logs.push(`摸清了：${esc(p.name)}喜欢<b>${esc(r.firstKnown)}</b>`);if(r.returned)logs.push(`${esc(p.name)}回赠你 1 个<b>${esc(r.returned.name)}</b>`);draw.delta=d}
   else if(r.firstKnown)logs.push(`摸清了：${esc(p.name)}不收<b>${esc(r.firstKnown)}</b>`);
   logs=logs.slice(-4);busy=false;draw();setTimeout(()=>{logs=[];if(!done)draw()},3200)}
  function confirmBox(text){return new Promise(r=>{const c=document.createElement('div');c.className='qg-confirm';c.innerHTML=`<p>${esc(text)}</p><div><button type="button" class="ok">送</button><button type="button">算了</button></div>`;L.appendChild(c);
   const [a,b2]=c.querySelectorAll('button');const end=v=>{c.remove();keyFn=keys;r(v)};a.onclick=()=>end(true);b2.onclick=()=>end(false);keyFn=e=>{if(e.key==='Escape')end(false);else if(['e','E','Enter',' '].includes(e.key))end(true)}})}
  function keys(e){const n=G().bagFor(p).length;if(e.key==='Escape')return finish('again');if(!n)return;
   const mv={ArrowLeft:-1,ArrowRight:1,ArrowUp:-5,ArrowDown:5,a:-1,d:1,w:-5,s:5}[e.key];if(mv!=null){focus=Math.max(0,Math.min(n-1,focus+mv));return draw()}
   if(['e','E','Enter',' '].includes(e.key))pick(focus)}
  keyFn=keys;await draw();return out}

 // ════════ 易物（大侠立志传做法） ════════
 const SCALE={stand:'ui_qh_trade_scale_stand',beam:'ui_qh_trade_scale_beam',panL:'ui_qh_trade_scale_panL',panR:'ui_qh_trade_scale_panR'};
 const scaleImg={};function scaleArt(){for(const [k,id] of Object.entries(SCALE))if(!scaleImg[k]){const i=new Image();i.src=assetImagePath(id);scaleImg[k]=i}return scaleImg}
 async function trade(npc,p){const L=ensure();let res,done=false,raf=0;const out=new Promise(r=>res=r);const finish=v=>{if(done)return;done=true;cancelAnimationFrame(raf);shut();setTimeout(()=>res(v),0)};active=finish;
  const put=[new Map(),new Map()],MAX=6,art=scaleArt();let say='',sayKind='',heroSay='让我看看你都有什么！';
  const mine=()=>[...put[0]],theirs=()=>[...put[1]];
  const myGoods=()=>Object.entries(S.bag||{}).filter(([id,n])=>n>0&&G().GOODS[id]&&ITEMS[id]).map(([id,n])=>({id,n,tier:G().tierOf(id),ok:G().accepts(p,id)}));
  const theirGoods=()=>Object.entries(G().stockOf(p)).filter(([id,n])=>n>0&&ITEMS[id]).map(([id,n])=>({id,n,tier:G().tierOf(id),ok:true}));
  async function updateSay(){const k=G().mood(p,mine(),theirs());if(k===sayKind)return;sayKind=k;const ln=await G().lineFor('qh_trade_line',{pid:p.id,kind:k});say=ln?.text||'';const el=L.querySelector('#qg-say');if(el)el.textContent=say;
   const d=L.querySelector('.qg-deal');if(d)d.disabled=!G().dealOk(p,mine(),theirs())}
  const cell=(g,count,side,where)=>`<button type="button" class="qg-sl ${tierCls(g.tier)}" data-id="${g.id}" data-side="${side}" data-where="${where}" ${g.ok?'':'disabled'} aria-label="${esc(ITEMS[g.id].name)}" title="${esc(ITEMS[g.id].name)}">${icon(g.id,56)}${count?`<span class="n">${count}</span>`:''}${g.ok?'':`<span class="why">${p.she?'她':'他'}不收</span>`}</button>`;
  function draw(){const left=myGoods(),right=theirGoods();
   const inv=(list,side)=>list.map(g=>{const k=put[side].get(g.id)||0;return cell(g,g.n-k>0?g.n-k:'',side,'inv')}).join('')+'<div class="qg-sl empty"></div>'.repeat(Math.max(0,12-list.length));
   const zone=side=>[...put[side]].map(([id,k])=>cell({id,tier:G().tierOf(id),ok:true},k,side,'pan')).join('');
   L.innerHTML=`<div class="qg-catch"></div>
    <div class="qg-pn wood" style="left:80px;top:120px;width:330px;height:640px"><div class="bd"></div><div class="eave"></div><div class="foot"></div></div>
    <div class="qg-head" style="left:104px;top:146px"><div class="av">${face({portrait:'p_opening_hero_village'},null)}</div><div><div class="nm">${esc(S.name||'萧白')}</div><div class="say">${esc(heroSay)}</div></div></div>
    <div class="qg-tg" style="left:126px;top:246px">${inv(left,0)}</div>
    <div class="qg-paper"><h3>易物</h3></div><canvas class="qg-scale" width="720" height="640"></canvas>
    <div class="qg-zone" id="qg-zL"><div class="qg-tg">${zone(0)}</div></div><div class="qg-zone" id="qg-zR"><div class="qg-tg">${zone(1)}</div></div>
    <div class="qg-full">放不下了</div><div class="qg-thint"><b>提示：按住图标可以快速增减数量</b></div>
    <button type="button" class="qg-deal" ${G().dealOk(p,mine(),theirs())?'':'disabled'}>成交</button>
    <div class="qg-pn wood" style="left:1190px;top:120px;width:330px;height:640px"><div class="bd"></div><div class="eave"></div><div class="foot"></div></div>
    <div class="qg-head r" style="left:1214px;top:146px"><div class="av">${face(p,npc)}</div><div><div class="nm">${esc(p.name)}</div><div class="say" id="qg-say">${esc(say)}</div></div></div>
    <div class="qg-tg" style="left:1236px;top:246px">${inv(right,1)}</div>
    <button type="button" class="x qg-x" aria-label="关闭">×</button>
    <div class="qg-keys"><span>点一下放上秤一件 · 按住连放 · 点托区里的东西拿回一件</span><span><u>Esc</u>不换了</span></div>`;
   L.querySelector('.qg-x').onclick=()=>finish('again');L.querySelector('.qg-deal').onclick=onDeal;
   L.querySelectorAll('.qg-sl[data-id]').forEach(el=>hold(el,()=>el.dataset.where==='inv'?add(el.dataset.id,+el.dataset.side):sub(el.dataset.id,+el.dataset.side)));
   updateSay()}
  function add(id,side){const avail=side?G().stockOf(p)[id]||0:S.bag[id]||0,m=put[side],k=m.get(id)||0;if(k>=avail)return false;if(!m.has(id)&&m.size>=MAX){const f=L.querySelector('.qg-full');f.style.opacity=1;setTimeout(()=>f.style.opacity=0,1200);return false}
   m.set(id,k+1);beam.w+=(side?1:-1)*.06;draw();return true}
  function sub(id,side){const m=put[side],k=m.get(id)||0;if(!k)return false;if(k===1)m.delete(id);else m.set(id,k-1);beam.w-=(side?1:-1)*.06;draw();return k>1}
  async function onDeal(){if(!G().deal(p,mine(),theirs()))return;put[0].clear();put[1].clear();sayKind='done';const ln=await G().lineFor('qh_trade_line',{pid:p.id,kind:'done'});say=ln?.text||'';draw();sayKind='done'}
  // 秤：线描秤纹四件，秤杆按价值轻斜、缓缓到位；托区挂在秤盘下面跟着走
  const S0=.86,OX=(720-768*S0)/2,OY=44,PV={x:385,y:117.5},HK=[{x:155,y:129},{x:612.5,y:129}],TH=6*Math.PI/180;const beam={th:0,w:0};let last=performance.now();
  function frame(now){const dt=Math.min(.033,(now-last)/1000);last=now;const a=G().valueOf(mine()),b=G().valueOf(theirs(),G().tradeRate(p)),t=a+b?TH*Math.tanh((b-a)/Math.max(4,(a+b)*.35)):0;
   beam.w+=(3.2*3.2*(t-beam.th)-2*.55*3.2*beam.w)*dt;beam.th+=beam.w*dt;
   const cv=L.querySelector('.qg-scale');if(cv){const cx=cv.getContext('2d'),w=768*S0,h=512*S0,pv={x:OX+PV.x*S0,y:OY+PV.y*S0};cx.clearRect(0,0,720,640);cx.globalAlpha=.5;
    if(art.stand.complete)cx.drawImage(art.stand,OX,OY,w,h);if(art.beam.complete){cx.save();cx.translate(pv.x,pv.y);cx.rotate(beam.th);cx.drawImage(art.beam,OX-pv.x,OY-pv.y,w,h);cx.restore()}
    for(let i=0;i<2;i++){const dy=(HK[i].x-PV.x)*S0*Math.sin(beam.th),im=i?art.panR:art.panL;if(im.complete)cx.drawImage(im,OX,OY+dy,w,h);
     const z=L.querySelector(i?'#qg-zR':'#qg-zL');if(z)z.style.transform=`translate(${440+OX+HK[i].x*S0-131}px,${120+OY+322*S0+dy}px)`}cx.globalAlpha=1}
   raf=requestAnimationFrame(frame)}
  keyFn=e=>{if(e.key==='Escape')finish('again')};
  draw();raf=requestAnimationFrame(frame);return out}
 // 按住连放／连拿（界面每次重画会换掉按钮，所以“松手停止”挂在整页上）
 let h1=0,h2=0;const stopHold=()=>{clearTimeout(h1);clearInterval(h2)};for(const ev of ['pointerup','pointercancel','blur'])addEventListener(ev,stopHold);
 function hold(el,fn){el.addEventListener('pointerdown',e=>{if(el.disabled)return;e.preventDefault();stopHold();fn();h1=setTimeout(()=>{h2=setInterval(()=>{if(fn()===false)stopHold()},90)},350)})}

 // 易印：先在对话框里选“以物易物”还是“买卖”（R-交互-01：不加新印）；买卖保持现在的买卖对话（用户：「商店还是不变」）
 async function yi(npc,p){const i=await choose(p.name,'',['以物易物','买卖','算了']);if(i===0)return trade(npc,p);if(i===1)return'buy';return'again'}
 window.QiheGiftUI={gift,trade,yi,close,get open(){return!!keyFn}};
})();
