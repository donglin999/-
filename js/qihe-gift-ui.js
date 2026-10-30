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
 let openedAt=0;   // 2026-10-27：忽略长按自动重复；打开 0.2 秒内不收确认键（墨印上按住 E 会误送）
 addEventListener('keydown',e=>{if(!keyFn)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;const k=e.key.toLowerCase();if(['e','enter',' '].includes(k)&&performance.now()-openedAt<200)return;keyFn(e)},true);
 // 物品图标统一走江湖页那套（2026-10-27 起采集物也是手绘图标，不再用地图上的像素小图）；外面套一层定尺寸的框，免得字形占位撑出格子
 const icon=(id,sz)=>{let h='';try{if(typeof mnIco==='function')h=mnIco(id,sz)}catch(e){}
  if(!h)h=`<span class="qg-gl">${esc((ITEMS[id]?.name||'？')[0])}</span>`;return`<span class="qg-ic" style="width:${sz}px;height:${sz}px">${h}</span>`};
 const tierCls=t=>t>=3?'q2':t>=2?'q1':'q0';
 function face(p,npc){if(p.portrait)return`<img src="${esc(assetImagePath(p.portrait))}" alt="">`;
  try{const c=miniSprite((npc?.sp||'').split(':')[0]);if(c)return`<img class="px" src="${c.toDataURL()}" alt="">`}catch(e){}return''}
 const LOCK=(open,c)=>`<svg class="qg-lock" viewBox="0 0 20 20"><path d="${open?'M6 9V6a4 4 0 0 1 7.6-1.7':'M6 9V6a4 4 0 0 1 8 0v3'}" fill="none" stroke="${c}" stroke-width="2"/><rect x="3.5" y="9" width="13" height="9" rx="2" fill="${c}"/></svg>`;

 // ════════ 赠礼／赔礼 ════════
 async function gift(npc,p){const L=ensure();let res,done=false;const finish=v=>{if(done)return;done=true;shut();setTimeout(()=>res(v),0)};/* 等这次按键分发完再交回，免得重新打开的墨印菜单接着收到同一个 Esc */const out=new Promise(r=>res=r);active=finish;
  let focus=0,logs=[],bubble='',busy=false;
  async function draw(){const b=Q().bond.get(p.id),neg=b.score<0,given=G().givenTo(p),bag=G().bagFor(p),known=G().state().known[p.id]||{},he=p.she?'她':'他';
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
     <span>关系</span><b class="stg${neg?' neg':''}">${b.stage}　${b.score}${draw.delta?`<span class="plus${draw.delta<0?' minus':''}">${draw.delta>0?'＋':''}${draw.delta}</span>`:''}</b><span>送过</span><b${given?'':' class="dim"'}>${given?given+' 件':'还没送过'}</b>
     <span>喜好</span><div class="likes">${likes.map(x=>x?`<b class="${x[1]==='no'?'no':''}">${esc(x[0][0])}</b>`:'<b class="q">？</b>').join('')}</div></div></div>
    ${bubble?`<div class="qg-say">${esc(bubble)}</div>`:''}
    <div class="qg-perks" style="left:340px;top:360px"><div class="cap">你们现在是“${b.stage}”${b.score>=0?'，关系能换来这些':''}</div>${perks.map(perkRow).join('')}${hint?`<div class="qg-hint${neg?' neg':''}">${esc(hint)}</div>`:''}</div>
    <div class="qg-rhead" style="left:900px;top:190px">${neg?'选一件赔给'+he:'选一件送'+he}<i>${neg?he+'只收厚礼或'+he+'喜欢的':'点一下就送出 · 停在上面看详情'}</i></div>
    <div class="qg-grid" style="left:904px;top:232px">${cells||''}</div>
    ${b.stage==='仇视'?`<div class="qg-mask">${esc(he+'不收你的东西了，要请中人说和')}</div>`:tip}
    ${bag.length||b.stage==='仇视'?'':'<div class="qg-mask">行囊里没有能送的东西</div>'}
    <div class="qg-log">${logs.map((l,i)=>`<div class="${i<logs.length-1?'old':''}">${l}</div>`).join('')}</div>
    <div class="qg-keys"><span><u>↑↓←→</u>选</span><span><u>E</u>${neg?'赔上':'送出'}</span><span><u>Esc</u>关</span><span>鼠标：点一下${neg?'赔上':'送出'} · 停在上面看详情</span></div>`;
   L.querySelector('.x').onclick=()=>finish('again');
   L.querySelectorAll('.qg-it[data-i]').forEach(el=>{el.onmouseenter=()=>{const i=+el.dataset.i;if(i!==focus){focus=i;draw()}};el.onclick=()=>pick(+el.dataset.i)});
   draw.delta=0}
  // 2026-10-27 已经有“要请中人”遮罩时，不再叠“行囊里没有能送的东西”（两行字会叠在一起）
  async function pick(i){if(busy)return;const it=G().bagFor(p)[i];if(!it)return;const b=Q().bond.get(p.id);if(b.stage==='仇视')return;
   if(it.tier>=3&&!await confirmBox(`真要把${it.name}${b.score<0?'赔':'送'}给${p.she?'她':'他'}？`))return draw();
   busy=true;const r=G().give(p,it.id);
   const kind=r.kind==='amend-ok'?'amend-ok':r.kind==='amend-no'?'amend-no':r.kind;
   const ln=await G().lineFor('qh_gift_line',{pid:p.id,kind,why:r.why||'',who:p.name});/* why：差役、护院婉拒按原因说（2026-10-29） */bubble=ln?.text||'';
   if(!r.keep){logs.push(`失去 1 个<b>${esc(r.name)}</b>`);const d=r.after-r.before;if(d)logs.push(`与${esc(p.name)}关系${d>0?'提升':'下降'} <span class="${d>0?'g':'r'}">${Math.abs(d)}</span> 点`);
    if(r.stage!==r.stageBefore)logs.push(`与${esc(p.name)}关系到了<b>${r.stage}</b>`);if(r.firstKnown&&r.kind==='xi')logs.push(`摸清了：${esc(p.name)}喜欢<b>${esc(r.firstKnown)}</b>`);if(r.returned)logs.push(`${esc(p.name)}回赠你 1 个<b>${esc(r.returned.name)}</b>`);draw.delta=d}
   else if(r.firstKnown)logs.push(`摸清了：${esc(p.name)}不收<b>${esc(r.firstKnown)}</b>`);
   logs=logs.slice(-4);busy=false;draw();setTimeout(()=>{logs=[];if(!done)draw()},3200)}
  function confirmBox(text){return new Promise(r=>{const c=document.createElement('div');c.className='qg-confirm';c.innerHTML=`<p>${esc(text)}</p><div><button type="button" class="ok">送</button><button type="button">算了</button></div>`;L.appendChild(c);
   const [a,b2]=c.querySelectorAll('button');const end=v=>{c.remove();keyFn=keys;r(v)};a.onclick=()=>end(true);b2.onclick=()=>end(false);openedAt=performance.now();keyFn=e=>{if(e.key==='Escape')end(false);else if(['e','E','Enter',' '].includes(e.key))end(true)}})}
  function keys(e){const n=G().bagFor(p).length;if(e.key==='Escape')return finish('again');if(!n)return;
   const mv={ArrowLeft:-1,ArrowRight:1,ArrowUp:-5,ArrowDown:5,a:-1,d:1,w:-5,s:5}[e.key];if(mv!=null){focus=Math.max(0,Math.min(n-1,focus+mv));return draw()}
   if(['e','E','Enter',' '].includes(e.key))pick(focus)}
  openedAt=performance.now();keyFn=keys;await draw();return out}

 // ════════ 易物（大侠立志传做法） ════════
 const SCALE={stand:'ui_qh_trade_scale_stand',beam:'ui_qh_trade_scale_beam',panL:'ui_qh_trade_scale_panL',panR:'ui_qh_trade_scale_panR'};
 const scaleImg={};function scaleArt(){for(const [k,id] of Object.entries(SCALE))if(!scaleImg[k]){const i=new Image();i.src=assetImagePath(id);scaleImg[k]=i}return scaleImg}
 async function trade(npc,p){const L=ensure();let res,done=false,raf=0;const out=new Promise(r=>res=r);const finish=v=>{if(done)return;done=true;cancelAnimationFrame(raf);shut();setTimeout(()=>res(v),0)};active=finish;
  const put=[new Map(),new Map()],MAX=6,art=scaleArt();let say='',sayKind='',heroSay=(await G().lineFor('qh_trade_hero',{}))?.text||'';   // 台词在 story/01-开始/人物-易物开口.ink
  const mine=()=>[...put[0]],theirs=()=>[...put[1]];
  const myGoods=()=>Object.entries(S.bag||{}).filter(([id,n])=>n>0&&G().GOODS[id]&&ITEMS[id]).map(([id,n])=>({id,n,tier:G().tierOf(id),ok:G().accepts(p,id)}));
  const theirGoods=()=>Object.entries(G().stockOf(p)).filter(([id,n])=>n>0&&ITEMS[id]).map(([id,n])=>({id,n,tier:G().tierOf(id),ok:true}));
  async function updateSay(){const k=G().mood(p,mine(),theirs());if(k===sayKind)return;sayKind=k;const ln=await G().lineFor('qh_trade_line',{pid:p.id,kind:k});say=ln?.text||'';const el=L.querySelector('#qg-say');if(el)el.textContent=say;
   const d=L.querySelector('.qg-deal');if(d)d.disabled=!G().dealOk(p,mine(),theirs())}
  const cell=(g,count,side,where)=>`<button type="button" class="qg-sl ${tierCls(g.tier)}" data-id="${g.id}" data-side="${side}" data-where="${where}" ${g.ok?'':'disabled'} aria-label="${esc(ITEMS[g.id].name)}" title="${esc(ITEMS[g.id].name)}">${icon(g.id,56)}${count?`<span class="n">${count}</span>`:''}${g.ok?'':`<span class="why">${p.she?'她':'他'}不收</span>`}</button>`;
  function draw(){const left=myGoods(),right=theirGoods();
   const none=!right.length?`<div class="qg-empty">${p.she?'她':'他'}身上没有肯换的东西了</div>`:'';
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
    <div class="qg-tg" style="left:1236px;top:246px">${none}${inv(right,1)}</div>
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
  openedAt=performance.now();keyFn=e=>{if(e.key==='Escape')finish('again')};
  draw();raf=requestAnimationFrame(frame);return out}
 // 按住连放／连拿（界面每次重画会换掉按钮，所以“松手停止”挂在整页上）
 let h1=0,h2=0;const stopHold=()=>{clearTimeout(h1);clearInterval(h2)};for(const ev of ['pointerup','pointercancel','blur'])addEventListener(ev,stopHold);
 function hold(el,fn){el.addEventListener('pointerdown',e=>{if(el.disabled)return;e.preventDefault();stopHold();fn();h1=setTimeout(()=>{h2=setInterval(()=>{if(fn()===false)stopHold()},90)},350)})}

 // 易印：先在对话框里选“以物易物”还是“买卖”（R-交互-01：不加新印）；买卖保持现在的买卖对话（用户：「商店还是不变」）
 // 随身物品 v2（赠礼稿第 11 节）：没有货单的寻常人（barter）直接上秤；功能人物先选。秤上只有对方随身物里肯换的，商店货只在“买卖”里
 async function yi(npc,p){const bs=G().barterState(p);if(!p.shop)return bs.off||bs.hidden?'again':trade(npc,p);
  const i=await choose('','跟'+p.name+'以物易物，还是买卖？',['以物易物','买卖','算了'],undefined,2);if(i===0)return bs.off?'again':trade(npc,p);if(i===1){if(window.QiheTown?.shop&&window.QIHE_NPC_ITEMS?.SHOPS?.[p.id]){await QiheTown.shop(p.id);return'again'}return'buy'}return'again'}
 // ════════ 买卖：挂轴式商店（2026-10-29 用户第二次继续改：“之前不是有一个卷轴商店的 ui 吗？为什么要用这个这么丑”）════════
 // 照 10-09 用户确认的挂轴式商店规范做（../xiaojianghu/docs/design/shop-ui-standard.md，预览 art_sources/hangao_shopkeeper_20261009/preview-shop-ui-v2.png，
 // 原型 review/hangao-town）：左店主＋对话框，上方木牌页签，两根木轴间的深褐纸面上一行一件货，下方持有银两木牌与关系横幅，花钱先过确认层。
 // 画面按 1920×1080 写，整块缩到本层的 1600×900。没有立绘的店家先放放大的地图小人（无立绘人物怎么处理待第二十四轮第 1 题定）。
 // opts：{list:[{id,price}], buys:{物品id:收价}, off:{物品id:折后价}, offNote, say}；返回时已结算（银两、行囊都在这里改）。
 const QC=k=>{const it=ITEMS[k],q=it?.q||0;return q>=2?'g-b':q===1?'g-c':typeof mnSlot==='function'&&mnSlot(k)?'g-d':'g-m'};
 const QN=k=>{let q='',c='';try{q=mnSlot(k)?(mnQ(k)[0]||''):'';c=mnCat(k)}catch(e){}return[q,c].filter(Boolean).join(' · ')};
 const stackable=k=>{try{return!mnSlot(k)&&!ITEMS[k]?.key}catch(e){return true}};
 async function shop(npc,p,opts){const L=ensure();let res,done=false;const out=new Promise(r=>res=r);const finish=v=>{if(done)return;done=true;shut();setTimeout(()=>res(v),0)};active=finish;
  let tab='buy',focus=0,msg='',conf=null;const list=opts.list.filter(x=>ITEMS[x.id]),buys=opts.buys||null,off=opts.off||{};
  const priceOf=x=>off[x.id]??x.price,silver=()=>S.silver||0,have=id=>S.bag?.[id]||0;
  const sellList=()=>Object.keys(buys||{}).filter(id=>ITEMS[id]&&have(id)>0).map(id=>({id,price:buys[id]}));   // 只列身上有的
  const rows=()=>tab==='buy'?list:sellList();
  const he=p.she?'她':'他';
  // 这一行能做的事：[{k,label,cls,n}]，第一个是主操作（Enter）
  function acts(x){if(tab==='sell'){const n=have(x.id);if(!n)return[{k:'none',label:'没有',cls:'gr'}];return[{k:'sell',label:'出售',cls:'bl',n:1},...(n>1?[{k:'sellall',label:'全部',cls:'og',n}]:[])]}
   const pr=priceOf(x);if(pr>silver())return[{k:'none',label:'不足',cls:'gr'}];
   const o=[{k:'buy',label:'买入',cls:'bl',n:1}];
   if(typeof mnSlot==='function'&&mnSlot(x.id))o.push({k:'wear',label:'装上',cls:'og',n:1});
   else if(stackable(x.id)&&pr*5<=silver())o.push({k:'buy5',label:'买五',cls:'og',n:5});return o}
  function rel(){let t='';try{const b=Q().bond.get(p.id);t=`与${esc(p.name)}的关系：<b>${esc(b.stage)}</b>（好感 ${b.score}）`}catch(e){}
   return[t,opts.offNote?`<span class="cut">${esc(opts.offNote)}</span>`:''].filter(Boolean).join('<i>|</i>')}
  function por(){if(p.portrait)return`<img src="${esc(assetImagePath(p.portrait))}" alt="">`;
   try{const c=miniSprite((npc?.sp||'').split(':')[0]);if(c)return`<img class="px" src="${c.toDataURL()}" alt="">`}catch(e){}return''}
  function tip(x,i){const it=ITEMS[x.id];let cmp='';
   try{const sl=mnSlot(x.id);if(sl)cmp=mnCmp('hero',{eq:{[sl]:x.id}}).filter(r=>r[3]).slice(0,3).map(([a,o,n,d])=>`<div>${esc(MN_FXN[a]||a)} ${o}→${n} <span class="${d>0?'up':'dn'}">${d>0?'▲':'▼'}${Math.abs(d)}</span></div>`).join('')||'<div class="mute">与现在用的持平</div>'}catch(e){}
   const pr=tab==='buy'?(off[x.id]!=null?`售价 ${priceOf(x)} 两（原价 ${x.price}，${esc(opts.offNote||'优惠')}）`:`售价 ${x.price} 两`):`收价 ${x.price} 两 · 你有 ${have(x.id)}`;
   return`<div class="qs2-tip"><h4 class="${QC(x.id)}">${esc(it.name)}${QN(x.id)?`<s>${esc(QN(x.id))}</s>`:''}</h4>${it.desc?`<p>${esc(it.desc)}</p>`:''}${cmp}<div class="pr">${pr}</div></div>`}
  function row(x,i){const it=ITEMS[x.id],pr=tab==='buy'?priceOf(x):x.price,cut=tab==='buy'&&off[x.id]!=null,bad=tab==='buy'&&pr>silver();
   return`<div class="qs2-r${i===focus?' cur':''}${bad?' dim':''}" data-i="${i}"><div class="nmc"><span class="ic ${QC(x.id)}">${icon(x.id,68)}</span><span class="nm ${QC(x.id)}">${esc(it.name)}<small>${esc(QN(x.id))}</small></span></div>
    <div class="pr${bad?' bad':''}"><i class="coin"></i>${cut?`<s>${x.price}</s>`:''}${pr}</div><div class="qt">${tab==='buy'?(have(x.id)?`持 ${have(x.id)}`:'—'):`×${have(x.id)}`}</div>
    <div class="acts">${acts(x).slice().reverse().map(a=>`<button type="button" class="bt ${a.cls}" data-a="${a.k}" data-i="${i}" ${a.k==='none'?'disabled':''}>${a.label}</button>`).join('')}</div></div>`}
  function confBox(){const x=rows()[conf.i],it=ITEMS[x.id],n=conf.n,unit=tab==='buy'?priceOf(x):x.price,tot=unit*n;let swap='';
   if(conf.k==='wear'){try{const sl=mnSlot(x.id),cur=S[sl]||mnEq?.('hero')?.[sl];swap=cur&&ITEMS[cur]?`替下「${esc(ITEMS[cur].name)}」，放回行囊`:'这一格现在空着'}catch(e){}}
   const title={buy:'买入',buy5:'买入',wear:'买下并装上',sell:'出售',sellall:'全部出售'}[conf.k];
   return`<div class="qs2-cf"><div class="box"><div class="plq">${title}</div>
    <div class="ln"><span class="ic ${QC(x.id)}">${icon(x.id,56)}</span><b class="${QC(x.id)}">${esc(it.name)}</b>${n>1?` ×${n}`:''}</div>
    <div class="ln">${tab==='buy'?'共需':'可得'} <b class="gold">${tot}</b> 两　·　${tab==='buy'?'剩':'之后有'} ${tab==='buy'?silver()-tot:silver()+tot} 两</div>${swap?`<div class="ln mute">${swap}</div>`:''}
    <div class="btns"><button type="button" class="bt gr" data-c="no">再想想</button><button type="button" class="bt ${conf.k==='wear'?'og':'bl'}" data-c="ok">${title}</button></div></div></div>`}
  function draw(){const rs=rows();focus=Math.max(0,Math.min(focus,rs.length-1));const cur=rs[focus];
   const tabs=[['buy','买入'],...(buys?[['sell','卖出']]:[])];
   L.innerHTML=`<div class="qg-catch qs2-dim"></div><div class="qs2${p.portrait?'':' px'}"><div class="qs2-por">${por()}</div>
    <div class="qs2-say"><b>${esc(p.name)}</b>${esc(msg||opts.say||'')}</div>
    <div class="qs2-tags" role="tablist">${tabs.map(([k,n],j)=>`<button type="button" role="tab" class="tagb" data-t="${k}" aria-selected="${tab===k}">${n}</button>`).join('')}</div>
    <i class="cord" style="left:700px"></i><i class="cord" style="left:1720px"></i><div class="rod t"></div>
    <div class="paper"><div class="thead"><span>名称</span><span>价格</span><span>${tab==='buy'?'持有':'数量'}</span><span></span></div>
     <div class="rows">${rs.map(row).join('')}${rs.length<5?`<div class="empty">${tab==='sell'?`${he}收${Object.keys(buys).map(id=>ITEMS[id]?.name).filter(Boolean).join('、')}，你身上${rs.length?'别的没有了':'暂时没有'}`:'暂时没有别的货'}</div>`:''}</div>
     <button type="button" class="close" aria-label="离开（Esc）">✕</button></div><div class="rod b"></div>
    <div class="coins"><i></i><i></i><i></i><b></b></div><div class="lamp"></div>
    ${cur&&!conf?tip(cur,focus):''}
    <div class="money">萧白持有银两：<b>${silver()}</b></div><div class="rel">${rel()}</div>
    <div class="keys"><span><u>↑↓</u>选</span><span><u>Enter</u>${tab==='buy'?'买入':'出售'}</span>${buys?'<span><u>Q E</u>换页</span>':''}<span><u>Esc</u>离开</span></div>
    ${conf?confBox():''}</div>`;
   L.querySelector('.close').onclick=()=>finish('done');
   L.querySelectorAll('.tagb').forEach(b=>b.onclick=()=>setTab(b.dataset.t));
   L.querySelectorAll('.qs2-r').forEach(r=>r.onclick=e=>{if(e.target.closest('[data-a]'))return;focus=+r.dataset.i;draw()});
   L.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{focus=+b.dataset.i;ask(b.dataset.a)});
   L.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>b.dataset.c==='ok'?deal():(conf=null,draw()));
   L.querySelector('.qs2-r.cur')?.scrollIntoView({block:'nearest'})}
  function setTab(t){if(t===tab||t==='sell'&&!buys)return;tab=t;focus=0;msg='';conf=null;draw()}
  function ask(k){const x=rows()[focus];if(!x)return;const a=acts(x).find(a=>a.k===k)||acts(x)[0];if(a.k==='none'){msg=tab==='buy'?'银两不够。':'你身上没有这样东西。';return draw()}conf={k:a.k,n:a.n,i:focus};draw()}
  function deal(){const x=rows()[conf.i],it=ITEMS[x.id],n=conf.n,k=conf.k;conf=null;
   if(tab==='buy'){const tot=priceOf(x)*n;if(tot>silver()){msg='银两不够。';return draw()}S.silver=silver()-tot;S.bag||={};S.bag[x.id]=(S.bag[x.id]||0)+n;
    if(k==='wear'){try{mnEquip('hero',x.id)}catch(e){}msg=`${it.name}，穿戴好了。`}else msg=`${it.name}${n>1?` ${n} 份`:''}，您拿好。`}
   else{const m=Math.min(n,have(x.id));if(!m)return draw();S.bag[x.id]-=m;S.silver=silver()+x.price*m;msg=`${it.name}${m>1?` ${m} 件`:''}收下了，${x.price*m} 两。`}
   try{QihePrologue.checkpoint()}catch(e){}draw()}
  keyFn=e=>{const k=e.key.toLowerCase(),n=rows().length;
   if(conf){if(k==='escape'){conf=null;return draw()}if(['enter',' ','e'].includes(k))return deal();return}
   if(k==='escape')return finish('done');
   if(k==='q'||k==='e'||k==='1'||k==='2'){if(buys)setTab(k==='1'||k==='q'?'buy':'sell');return}
   if(['arrowdown','s'].includes(k))focus=(focus+1)%Math.max(1,n);else if(['arrowup','w'].includes(k))focus=(focus-1+n)%Math.max(1,n);
   else if(['enter',' '].includes(k))return ask(acts(rows()[focus]||{id:''})[0]?.k);draw()};
  openedAt=performance.now();draw();return out}
 window.QiheGiftUI={gift,trade,yi,shop,close,get open(){return!!keyFn}};
})();
