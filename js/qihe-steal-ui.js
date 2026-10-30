'use strict';
// 偷窃系统·界面：物品扇与袖里一按小游戏。
// 依据：../xiaojianghu/docs/design/npc-steal.md（第 4.5、6、7 节）与概念渲染 review/npc-steal/01、01b、02。
// 2026-10-27 重做（试玩反馈“太简陋、无法正常交互”）：
//  · 判定改成按“行程比例”算（0＝起、1＝止），金区、朱心不再有角度方向写反的问题；
//  · 任何结束方式（落针、没按、Esc、出错、超时）都走同一个 finish：先给结果反馈，再收起界面、清掉按键与鼠标接管；
//  · 键盘 E／空格／回车落针，Esc 缩手（算失手）；鼠标点击（按下即落针）；物品扇可点选、悬停聚焦；
//  · 图层按游戏区宽 /1600 缩放（同墨印、赠礼），窄窗口再把扇子与刻度弧放大到不小于 0.72 倍，看得清。
(()=>{
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;
 const ST=()=>window.QiheSteal;const D=()=>window.QIHE_STEAL_DATA;const Q=()=>window.QiheNpc;
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const CN=['一','二','三','四','五','六','七','八','九','十'];
 const cn=n=>CN[n-1]||String(n);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const safe=(fn,fb)=>{try{const v=fn();return v===undefined?fb:v}catch(e){return fb}};
 const raf=f=>(typeof requestAnimationFrame==='function'?requestAnimationFrame(f):setTimeout(f,16));
 const now=()=>(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();

 // ───── 纯计算（单元测试用） ─────
 // 金区、朱心按一趟行程的比例给（0＝起，1＝止）。金区宽＝goldRatio，位置随机；朱心在金区正中，宽＝金区×redRatio。
 function zones(goldRatio,redRatio,rnd=Math.random()){const w=clamp(+goldRatio||0,0,1),g0=(1-w)*clamp(rnd,0,1),rw=w*clamp(+redRatio||0,0,1),r0=g0+(w-rw)/2;
  return{g0,g1:g0+w,r0,r1:r0+rw}}
 // 落针位置 p（0～1）→ 妙手 great／得手 ok／失手 fail；p 为空（没按）算失手
 function judge(p,z){if(p==null||!isFinite(p)||p<0||p>1)return'fail';const e=1e-9;
  if(z.r1>z.r0&&p>=z.r0-e&&p<=z.r1+e)return'great';if(p>=z.g0-e&&p<=z.g1+e)return'ok';return'fail'}
 const combine=rs=>!rs.length||rs.includes('fail')?'fail':rs.every(r=>r==='great')?'great':'ok';
 // 几手、金区宽、朱心宽、针速（第 6 节）；数值由 qihe-steal.js 算，界面只用
 function params(chanceValue,tier,perks){const base=ST()?.minigame?ST().minigame(chanceValue,tier||{},perks||[]):null;
  const hands=base?.hands||tier?.hands||1,goldRatio=base?.goldRatio??(hands===1?chanceValue/100:Math.pow(chanceValue/100,1/hands));
  return{hands,goldRatio:clamp(goldRatio,0,1),redRatio:base?.redRatio??.25,needle:Math.max(.6,base?.needle||tier?.needle||2.5)}}

 // ───── 图层与按键接管 ─────
 let layer=null,Z=1,keyFn=null,closer=null,armedAt=0;
 const hasDom=()=>typeof HTMLElement!=='undefined'&&typeof document!=='undefined'&&!!document.getElementById?.('game')?.getBoundingClientRect;
 function fit(){const g=document.getElementById('game'),r=g?.getBoundingClientRect?.()||{width:1600,height:900};Z=r.width/1600||1;layer.style.zoom=Z;layer.style.height=(r.height/Z)+'px';
  layer.style.setProperty?.('--qs-boost',String(boost()))}
 const boost=()=>clamp(.72/Z,1,1.45);   // 窄窗口放大：保证扇子、刻度弧实际不小于 0.72 倍
 function ensure(){if(!layer){layer=document.createElement('div');layer.id='qs-layer';layer.hidden=true;document.getElementById('game').appendChild(layer);
   addEventListener('resize',()=>{if(layer&&!layer.hidden)fit()})}
  fit();layer.hidden=false;layer.innerHTML='';layer.className='';layer.onpointerdown=null;layer.onpointermove=null;layer.oncontextmenu=null;return layer}
 function shut(){keyFn=null;closer=null;if(layer){layer.innerHTML='';layer.hidden=true;layer.className='';layer.onpointerdown=null;layer.onpointermove=null;layer.oncontextmenu=null}}
 // 别的流程要强行收起时（读档、切图）：正在进行的扇子或小游戏按“罢手／失手”结束
 function close(){const c=closer;closer=null;if(c)c();else shut()}
 if(typeof addEventListener==='function')addEventListener('keydown',e=>{if(!keyFn)return;const k=String(e.key||'').toLowerCase();e.preventDefault?.();e.stopImmediatePropagation?.();
  if(e.repeat&&['e',' ','enter','escape'].includes(k))return;   // 长按自动重复（从墨印按 E 进来）不算一次按下
  if(now()<armedAt&&['e',' ','enter'].includes(k))return;       // 刚打开 0.18 秒内不收确认键，防止连按误触
  keyFn(k,e)},true);
 const arm=()=>{armedAt=now()+180};

 // ───── 坐标：世界 → 1600×900 设计坐标 ─────
 function toDesign(wx,wy){const c=document.getElementById('cv').getBoundingClientRect(),g=document.getElementById('game').getBoundingClientRect(),s=c.width/(W/ZOOM);
  return[(c.left-g.left+(wx-cam.x)*s)/Z,(c.top-g.top+(wy-cam.y)*s)/Z]}
 function anchorOf(npc){return safe(()=>{const p=typeof npcPos==='function'?npcPos(npc):{x:npc.x*TS,y:npc.y*TS},h=npcH(npc);
  const [x,y]=toDesign(p.x,p.y-h*.55),[,hy]=toDesign(p.x,p.y-h),[px,py]=toDesign(player.x,player.y-20);
  if(![x,y,hy,px,py].every(isFinite))return null;return{x,y,headY:hy,px,py}},null)}
 function heroAnchor(){return safe(()=>{const [px,py]=toDesign(player.x,player.y-20);return isFinite(px)&&isFinite(py)?{x:px,y:py,headY:py-40,px,py}:null},null)}

 // ───── 物品显示（第 7 节） ─────
 const hasItem=id=>!!id&&typeof ITEMS!=='undefined'&&!!ITEMS[id];
 const IMG_POUCH='assets/production/cultivation/mail-v7/pouch.png';
 // 2026-10-27 武侠样式部件（用户：界面“实体还是一些几何图案”）：物品圈换外圆内方铜钱框，刻度弧换漆木铜嵌回纹弧，指针换绣花银针（art_sources/qihe-steal-ui-wuxia-20261027）
 const UIA=k=>safe(()=>typeof assetImagePath==='function'?assetImagePath(k):`assets/${k}.webp`,`assets/${k}.webp`);
 const DIAL={k:'ui_qh_steal_dial_20261027',w:1536,cx:767.7,cy:833.8,r:640};
 const imgOf=id=>safe(()=>typeof assetImagePath==='function'?assetImagePath(id):`assets/${id}.webp`,`assets/${id}.webp`);
 function display(it,target){const tier=D().TIERS[it.g||'none']||D().TIERS.none;
  if(it.money)return{kind:'money',name:it.n||'钱袋'};
  if(target?.disguised||target?.conceal==='allButMoney')return{kind:'unseen',name:'看不清的一件'};
  if(tier.precious){const known=safe(()=>Q().recognize(it.key||it.n,it.g),false);if(!known)return{kind:'unknown',name:'未知物品'}}
  return{kind:'name',name:it.n||'？'}}
 function iconHTML(it,disp){
  if(disp.kind==='unknown')return`<img class="px" src="${esc(imgOf('r_qh_song_bundle_v1'))}" alt="">`;
  if(disp.kind==='unseen')return'<i class="qs-glyph dim">？</i>';
  if(disp.kind==='money'&&!it.silverBar)return`<img src="${esc(IMG_POUCH)}" alt="">`;
  if(hasItem(it.id)&&typeof mnIco==='function'){const h=safe(()=>mnIco(it.id,40),'');if(h)return h}
  return`<i class="qs-glyph">${esc(it.glyph||(it.n||'？')[0])}</i>`}
 function qtyText(it,disp){if(disp.kind==='unseen'||disp.kind==='unknown')return'';if(it.money)return it.silverBar?'一枚':`银两 ${it.money}`;return it.q>1?`${it.q} 份`:'一件'}

 // ───── 下手语境（物品扇与结算共用一份） ─────
 function context(npcId,target){const stLv=ST().stealLv(),perks=D().SKILL.find(sk=>sk.lv===stLv)?.perks||[];
  const hero={lv:S.lv||1,agi:S.agi||4,stealLv:stLv,perks:S.steal?.perks||{}};
  const tgt={lv:target.battle?.lv||target.stealLv||0,state:'normal',fighter:!!target.battle,villain:!!target.villain,flags:target.flags||{},patron:target.patron};
  const bond=safe(()=>Q().bond.get(npcId),{})||{};
  const ctx={hero,target:tgt,bond,rumor:{here:ST().rumor(S.scene||'m_qh_central')}};
  return{stLv,perks,hero,tgt,bond,ctx,grip:ST().grip(ctx)}}

 // ───── 物品扇（第 4.5、7 节；图 01、01b） ─────
 function pick(npcId,target,npc,X){X=X||context(npcId,target);
  return new Promise(resolve=>{
   const items=ST().listItems(npcId,target);if(!items.length){resolve(null);return}
   const L=ensure();arm();
   const A=anchorOf(npc)||{x:900,y:430,headY:380,px:820,py:450};
   const rows=items.map(it=>{const ch=ST().chance(npcId,it,X.grip,target),disp=display(it,target),tier=D().TIERS[it.g||'none']||D().TIERS.none;
    const off=(ch.gate||0)>X.stLv;return{it,ch,disp,tier,off}});
   // 摆在人物背对萧白的一侧；那一侧放不下（约 460 宽）就换边
   const B=boost(),need=470*B;let side=A.px!=null&&A.px>A.x?'left':'right';
   if(side==='right'&&A.x+need>1600)side='left';else if(side==='left'&&A.x-need<0)side='right';
   const dir=side==='left'?-1:1,n=rows.length,GAP=62,OFF=92;
   const R=Math.max(150,((n-1)*GAP/2)/Math.sin(50*Math.PI/180));
   const cy=clamp(A.y,120+(n-1)*GAP/2*B,780-(n-1)*GAP/2*B);
   const pts=rows.map((_,i)=>{const dy=(i-(n-1)/2)*GAP,t=Math.asin(clamp(dy/R,-1,1));return[A.x+dir*(OFF+R*(1-Math.cos(t))*.6),cy+dy]});
   L.className='side-'+side;
   // 人名地图上已画（画布名牌），这里不再叠一块
   let html=`<div class="qs-dim" style="--fx:${A.x}px;--fy:${A.y}px"></div>`;
   html+=`<div class="qs-fan" style="--ox:${A.x}px;--oy:${cy}px">`;
   // 金线刻度弧：贴着图标内侧把扇子串起来（同墨印外环），两端菱形
   const ax=i=>pts[i][0]-dir*36,top=pts[0][1]-GAP*.5,bot=pts[n-1][1]+GAP*.5,mid=A.x+dir*(OFF-36-R*.12);
   const dpath=`M${ax(0)} ${top} Q${mid} ${cy} ${ax(n-1)} ${bot}`;
   const dia=(x,y)=>`<rect x="${x-4}" y="${y-4}" width="8" height="8" transform="rotate(45 ${x} ${y})" fill="rgba(10,12,10,.6)"/><rect x="${x-2.5}" y="${y-2.5}" width="5" height="5" transform="rotate(45 ${x} ${y})" fill="#e2c27c"/>`;
   html+=`<svg class="qs-fanarc" width="1600" height="900"><path d="${dpath}" fill="none" stroke="rgba(10,12,10,.55)" stroke-width="3.4"/><path d="${dpath}" fill="none" stroke="#e2c27c" stroke-width="1.2"/>${dia(ax(0),top)}${dia(ax(n-1),bot)}</svg>`;
   rows.forEach((r,i)=>{const [x,y]=pts[i],cls='qs-it'+(r.off?' off':'')+(r.disp.kind==='unseen'||r.disp.kind==='unknown'?' veiled':'');
    const pos=side==='left'?`right:${1600-x-28}px`:`left:${x-28}px`;
    const grade=r.disp.kind==='unseen'?'':r.disp.kind==='unknown'?'<span class="qs-gr q">？</span>':r.it.g?`<span class="qs-gr">${esc(r.it.g)}</span>`:'';
    const diff=r.it.diff||1,df=`<span class="qs-df d${diff}">难${cn(diff)}</span>`,q=qtyText(r.it,r.disp);
    const pct=r.off?`<div class="qs-pct gate">窃术${cn(r.ch.gate)}级</div>`:`<div class="qs-pct">${r.ch.chance}<small>%</small></div>`;
    html+=`<div class="${cls}" data-i="${i}" style="${pos};top:${y-28}px"><div class="qs-ico" style="background-image:url(${esc(UIA('ui_qh_steal_coin_20261027'))})">${iconHTML(r.it,r.disp)}</div>${pct}<div class="qs-slip"><b>${esc(r.disp.name)}</b>${grade}${df}${q?`<em>${esc(q)}</em>`:''}</div></div>`});
   const lvGap=Math.max(0,X.tgt.lv-X.hero.lv),hy=pts[0][1]-28-44,fy=pts[n-1][1]+28+16,hx=side==='left'?`right:${1600-pts[0][0]-28}px`:`left:${pts[0][0]-28}px`,fx=side==='left'?`right:${1600-pts[n-1][0]-28}px`:`left:${pts[n-1][0]-28}px`;
   html+=`<div class="qs-fanhead" style="${hx};top:${hy}px"><span class="qs-seal">窃</span><span class="qs-t">挑一件下手</span></div>`;
   html+=`<div class="qs-fanfoot" style="${fx};top:${fy}px"><div>下手把握 <b>${X.grip}%</b> · 窃术 <b>${cn(X.stLv)}级</b> · 身法 <b>${X.hero.agi}</b>${lvGap?` · 他高你 <b>${lvGap}</b> 级`:''}</div>${(w=>w.lv?`<div class="qs-wary">他起了戒心${w.caught?`（被你失手惊动过 ${w.caught} 回）`:`（被你得手过 ${w.taken} 回）`} · 成功率打 ${Math.round(w.mult*100)/10} 折</div>`:'')(ST().wary(npcId))}
    <div class="qs-keys"><u>W</u><u>S</u>选 · <button type="button" data-k="go"><u>E</u>下手</button> · <button type="button" data-k="esc"><u>Esc</u>罢手</button></div><div class="qs-tip"></div></div>`;
   html+='</div>';
   L.innerHTML=html;
   const els=[...L.querySelectorAll('.qs-it')],tip=L.querySelector('.qs-tip');
   let focus=Math.max(0,rows.findIndex(r=>!r.off)),done=false;
   const render=()=>els.forEach((e,i)=>e.classList.toggle('focus',i===focus));
   const finish=v=>{if(done)return;done=true;shut();resolve(v)};
   const go=()=>{const r=rows[focus];if(!r)return;if(r.off){const e=els[focus];e?.classList.remove('nudge');void e?.offsetWidth;e?.classList.add('nudge');if(tip)tip.textContent=`这一件要窃术${cn(r.ch.gate)}级才下得了手`;return}finish(r.it)};
   const move=d=>{focus=(focus+d+rows.length)%rows.length;if(tip)tip.textContent='';render()};
   render();
   keyFn=k=>{if(k==='w'||k==='arrowup')move(-1);else if(k==='s'||k==='arrowdown')move(1);else if(k==='e'||k===' '||k==='enter')go();else if(k==='escape'||k==='q')finish(null)};
   els.forEach((e,i)=>{e.onpointerenter=()=>{if(focus!==i){focus=i;if(tip)tip.textContent='';render()}};e.onclick=ev=>{ev.stopPropagation();focus=i;render();go()}});
   L.querySelector('[data-k="go"]')?.addEventListener('click',ev=>{ev.stopPropagation();go()});
   L.querySelector('[data-k="esc"]')?.addEventListener('click',ev=>{ev.stopPropagation();finish(null)});
   L.oncontextmenu=ev=>{ev.preventDefault();finish(null)};
   closer=()=>finish(null);
  })}

 // ───── 小游戏：袖里一按（第 6 节；图 02） ─────
 // 一定 resolve 'fail'｜'ok'｜'great' 之一；Esc 缩手算 'fail'；无论怎么结束都先给反馈、再收起界面、清掉按键接管。
 // opts：{npc（地图上的人，用来定位）, item 显示用（disp、icon）}；不给就围着萧白摆。
 async function minigame(npcId,item,chanceValue,tier,perks,opts={}){
  // 2026-10-27 宋先生也弹小游戏（用户：“奖励丰厚也是因为游戏比较难”），不再按存档种子一次定局
  if(!hasDom())return Math.random()*100<chanceValue?'ok':'fail';   // 没有界面（VM 测试）：闭眼一按的机会就是成功率
  if(closer)close();
  const P=params(chanceValue,tier,perks);
  return new Promise(resolve=>{
   let done=false,timer=null,hand=0,pos=null,running=false,t0=0,z=null,results=[];
   const timers=new Set(),later=(f,ms)=>{const id=setTimeout(()=>{timers.delete(id);f()},ms);timers.add(id);return id};
   const end=r=>{if(done)return;done=true;keyFn=null;closer=null;running=false;timers.forEach(clearTimeout);timers.clear();shut();resolve(r==='great'||r==='ok'?r:'fail')};
   try{
    const L=ensure();arm();
    const A=(opts.npc&&anchorOf(opts.npc))||heroAnchor()||{x:800,y:450,headY:400,px:800,py:450};
    const B=boost(),R=200,DK=R/DIAL.r;   // R：弧槽中线半径（设计像素）；DK：弧框原图→界面的缩放
    const cx=clamp(A.px!=null?(A.x+A.px)/2:A.x,(R+90)*B,1600-(R+90)*B),cy=clamp(Math.max(A.y,A.py||A.y)+30,(R+110)*B,900-160*B);
    const deg=d=>d*Math.PI/180,Pt=(r,d)=>[cx+r*Math.cos(deg(d)),cy+r*Math.sin(deg(d))],a0=188,a1=352,ang=p=>a0+(a1-a0)*p;   // 弧框两端是祥云头，行程收在 188°～352°
    const f=v=>v.toFixed(1);
    const arc=(r,a,b)=>{const p=Pt(r,a),q=Pt(r,b);return`M${f(p[0])} ${f(p[1])} A${r} ${r} 0 ${b-a>180?1:0} 1 ${f(q[0])} ${f(q[1])}`};
    const disp=opts.disp||{name:item?.n||'？'},title=esc(disp.name||item?.n||'？');
    const sub=[tier?.precious?'甲级以上贵重':'',P.hands>1?'两手':'一手',`成功率 ${Math.round(chanceValue)}%`].filter(Boolean).join(' · ');
    // 刻度弧：漆木铜嵌回纹弧框是图（.qs-dialimg），这里只留金段、朱心两层
    let t='';
    t+=`<g class="qs-zone"></g>`;
    t+=`<g class="qs-needle"></g>`;
    const lab=(txt,d,r,cls)=>{const q=Pt(r,d);return`<span class="qs-lab ${cls}" style="left:${f(q[0])}px;top:${f(q[1])}px">${txt}</span>`};
    const beats=P.hands>1?`<div class="qs-beats">${['伸','收'].map((c,i)=>`<div class="qs-beat${i===0?' cur':''}" data-h="${i}"><span class="qs-sl">${c}</span>${c}手<em></em></div>`).join('')}</div>`:'';
    L.className='mini';
    L.innerHTML=`<div class="qs-dim" style="--fx:${f(cx)}px;--fy:${f(cy-40)}px"></div>
     <div class="qs-dial" style="--ox:${f(cx)}px;--oy:${f(cy)}px">
      <img class="qs-dialimg" alt="" src="${esc(UIA(DIAL.k))}" style="left:${f(cx-DIAL.cx*DK)}px;top:${f(cy-DIAL.cy*DK)}px;width:${f(DIAL.w*DK)}px">
      <svg class="qs-dialsvg" width="1600" height="900">${t}</svg><img class="qs-needleimg" alt="" src="${esc(UIA('ui_qh_steal_needle_20261027'))}">
      ${lab('起',a0,R-28,'end')}${lab('止',a1,R-28,'end')}<span class="qs-lab gold"></span><span class="qs-lab red"></span>
      <div class="qs-title" style="left:${f(cx)}px;top:${f(cy-R-80)}px"><span class="qs-tico">${opts.icon||'<i class="qs-glyph">'+esc((item?.n||'？')[0])+'</i>'}</span><b>${title}</b><em>${esc(sub)}</em></div>
      <div class="qs-under" style="left:${f(cx)}px;top:${f(cy+48)}px">${beats}
       <div class="qs-rule">墨针从“起”扫到“止”，只扫一趟。看准时机按下去${P.hands>1?'，<b>连按两手都中</b>才到手':''}：</div>
       <div class="qs-legend"><span><i class="z gold"></i>落在金色段：<b>得手</b>，东西到手</span><span><i class="z red"></i>金段正中的红点：<b>妙手</b>，到手，窃术经验多 1</span><span><i class="z out"></i>落在金段外或没按：<b>失手</b>，被他发觉</span></div>
       <div class="qs-keys"><button type="button" data-k="go"><u>E</u>／<u>空格</u>／点击 落手</button> · <button type="button" data-k="esc"><u>Esc</u> 缩手（算失手）</button></div>
      </div>
      <div class="qs-verdict" style="left:${f(cx)}px;top:${f(cy-R*.45)}px"></div>
     </div>`;
    const zoneG=L.querySelector('.qs-zone'),needleG=L.querySelector('.qs-needle'),verdict=L.querySelector('.qs-verdict'),labG=L.querySelector('.qs-lab.gold'),labR=L.querySelector('.qs-lab.red');
    const drawZone=()=>{if(!zoneG)return;const g0=ang(z.g0),g1=Math.max(ang(z.g1),g0+.8),r0=ang(z.r0),r1=Math.max(ang(z.r1),r0+.6);
     zoneG.innerHTML=`<path d="${arc(R,g0,g1)}" fill="none" stroke="rgba(236,196,104,.95)" stroke-width="9"/><path d="${arc(R,g0,g1)}" fill="none" stroke="rgba(255,244,210,.7)" stroke-width="1.5"/>`+(z.r1>z.r0?`<path d="${arc(R,r0,r1)}" fill="none" stroke="#c23b26" stroke-width="10"/><path d="${arc(R,r0,r1)}" fill="none" stroke="rgba(255,214,190,.7)" stroke-width="1.2"/>`:'');   // 画在弧框的槽里（槽宽约 10）
     const put=(el,d,show)=>{if(!el)return;const q=Pt(R-34,d);el.style.left=f(q[0])+'px';el.style.top=f(q[1])+'px';el.textContent=show;el.style.display=show?'':'none'};
     const gw=g1-g0,rm=(r0+r1)/2;
     if(gw>=34){put(labG,g0+Math.min(10,gw*.2),'金区');put(labR,rm+(rm-g0>22?4:0),z.r1>z.r0?'朱心':'')}
     else{put(labG,(g0+g1)/2,gw>=10?'金区':'');put(labR,0,'')}};
    const needleEl=L.querySelector('.qs-needleimg');
    const drawNeedle=p=>{const d=ang(clamp(p,0,1));let s='';
     for(let k=1;k<=4;k++){const dd=d-k*3;if(dd<a0-2)break;const a=Pt(R-7,dd),b=Pt(R+7,dd);s+=`<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" stroke="rgba(235,238,240,${(.4-k*.08).toFixed(2)})" stroke-width="${(3-k*.5).toFixed(1)}" stroke-linecap="round"/>`}   // 银针扫过的残影
     if(needleG)needleG.innerHTML=s;
     if(needleEl){const c=Pt(R,d);needleEl.style.left=f(c[0])+'px';needleEl.style.top=f(c[1])+'px';needleEl.style.transform=`translate(-50%,-50%) rotate(${f(d+90)}deg)`}};   // 针尖朝外、穿过弧槽
    const showVerdict=r=>{if(!verdict)return;const m={great:['妙','妙手','zhu','到手 · 窃术经验多 1'],ok:['得','得手','ink','东西到手'],fail:['失','失手','hol','被他发觉了']}[r];verdict.className='qs-verdict on '+m[2];verdict.innerHTML=`<span class="qs-sl big">${m[0]}</span><b>${m[1]}</b><em>${m[3]}</em>`};
    const markBeat=(i,r)=>{const b=L.querySelector(`.qs-beat[data-h="${i}"]`);if(!b)return;b.classList.remove('cur');b.classList.add('done',r);const e=b.querySelector('em');if(e)e.textContent=r==='great'?'妙手':r==='ok'?'得手':'失手';
     const nx=L.querySelector(`.qs-beat[data-h="${i+1}"]`);if(nx&&r!=='fail')nx.classList.add('cur')};
    let settling=false,final0='fail';
    const settle=async final=>{settling=true;final0=final;keyFn=k=>{if(k==='escape'||k==='e'||k===' '||k==='enter')end(final)};   // 反馈期间再按一下直接收起
     L.onpointerdown=()=>end(final);closer=()=>end(final);
     showVerdict(final);if(final!=='fail')L.classList.add('got');else L.classList.add('miss');
     later(()=>end(final),final==='fail'?760:820)};
    const press=src=>{if(!running||done||settling)return;running=false;const p=src==='timeout'?null:clamp((now()-t0)/(P.needle*1000),0,1);if(p!=null)drawNeedle(p);
     const r=judge(p,z);results.push(r);markBeat(hand,r);
     L.classList.remove('hit-great','hit-ok','hit-fail');void L.offsetWidth;L.classList.add('hit-'+r);
     if(r==='fail'||hand>=P.hands-1){later(()=>settle(combine(results)),r==='fail'?120:200);return}
     hand++;later(startHand,300+200)};   // 两手间隔 0.3 秒（加 0.2 秒看清第一手的落点）
    const cancel=()=>{if(done||settling)return;running=false;results.push('fail');markBeat(hand,'fail');settle('fail')};   // Esc／点“缩手”：算失手
    const tick=()=>{if(!running||done||settling)return;const p=(now()-t0)/(P.needle*1000);if(p>=1){drawNeedle(1);press('timeout');return}drawNeedle(p);raf(tick)};
    function startHand(){if(done||settling)return;z=zones(P.goldRatio,P.redRatio);drawZone();drawNeedle(0);L.classList.remove('hit-great','hit-ok','hit-fail');
     later(()=>{if(done||settling)return;t0=now();running=true;raf(tick)},hand===0?420:160)}
    keyFn=k=>{if(k==='e'||k===' '||k==='enter')press('key');else if(k==='escape')cancel()};
    L.onpointerdown=ev=>{if(ev.button===2)return;const b=ev.target?.closest?.('[data-k="esc"]');if(b){cancel();return}press('mouse')};
    L.oncontextmenu=ev=>{ev.preventDefault()};
    closer=()=>end('fail');
    startHand();
    // 看门狗：无论如何不会卡住（每手针程＋缓冲）
    later(()=>end(settling?final0:'fail'),P.hands*(P.needle*1000+900)+2600);
   }catch(err){console.error('袖里一按出错，已按失手收起',err);end('fail')}
  })}

 // ───── 主入口 ─────
 async function steal(npcId,target,npc){
  let X=context(npcId,target);
  const item=await pick(npcId,target,npc,X);if(!item)return null;
  X=context(npcId,target);
  const ch=ST().chance(npcId,item,X.grip,target);
  const tier=D().TIERS[item.g||'none']||D().TIERS.none;
  const disp=display(item,target);
  let result='fail';
  try{result=await minigame(npcId,item,ch.chance,tier,X.perks,{npc,disp,icon:iconHTML(item,disp)})}catch(e){console.error(e);result='fail'}
  shut();
  const s=ST().state();
  const resCtx={npcId,item,target:X.tgt,result,ruleset:ch.ruleset,
   ctx:{phase:'opening',mapId:S.scene||'m_qh_central',fixedScene:false},
   bond:safe(()=>Q().bond.get(npcId),X.bond),tier,
   caught:{count:(s.caught[npcId]?.count||0)+1}};
  await ST().resolve(resCtx);   // 先收起界面，再等结算（失手台词、敌对开战）演完
  if(result!=='fail'){const it=resCtx.item;window.toast?.('得手 · '+(it.money?'银两 '+it.money:(ITEMS[it.id]?.name||it.n)+(it.q>1?' ×'+it.q:'')),1800)}
  window.QihePrologue?.checkpoint?.();   // 2026-10-27 偷窃结果存档（流程评审 A11：原先不存，读档能反复刷）
  return{item,result};
 }

 window.QiheStealUI={steal,minigame,pick,close,zones,judge,combine,params,display,_active:()=>!!keyFn||!!(layer&&!layer.hidden)};   // minigame 也给小耗子的一课用（js/qihe-aqi.js）
})();
