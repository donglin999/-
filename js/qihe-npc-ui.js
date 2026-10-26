'use strict';
// 人物交互框架·界面（2026-10-23 开发一）：贴身墨印菜单（甲「金石朱印」）、逸剑式查看页、请教卷、切磋卷与结果。
// 照 ../xiaojianghu/docs/design/npc-interaction-v2.md 第 2.1、4、5 节与渲染图 review/npc-interaction-v2/02、03、05b、07、08、09，review/npc-spar/01。
// 接入方式：包一层全局 interact()——靠近人物表里的人按 E 先弹墨印，“谈／托”仍调用该 NPC 原来的 act（现有 ink 场次），其余项走本框架。
// 不在浏览器（VM 测试）或地址带 npcRing=0 时不接管，行为与原来一样。
(()=>{
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;
 const Q=window.QiheNpc,D=Q.data;
 const enabled=()=>typeof HTMLElement!=='undefined'&&!!document.getElementById('game')?.getBoundingClientRect&&!/[?&]npcRing=0/.test(location.search);
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));

 // ───── 图层与坐标 ─────
 let layer=null,Z=1;
 function fit(){const game=document.getElementById('game'),r=game.getBoundingClientRect();Z=r.width/1600||1;layer.style.zoom=Z;layer.style.height=(r.height/Z)+'px'}
 function ensure(){if(!layer){layer=document.createElement('div');layer.id='qn-layer';layer.hidden=true;document.getElementById('game').appendChild(layer)}fit();layer.hidden=false;return layer}
 function clear(){if(layer){layer.innerHTML='';layer.hidden=true}}
 function toDesign(wx,wy){const cvs=document.getElementById('cv'),c=cvs.getBoundingClientRect(),g=document.getElementById('game').getBoundingClientRect(),s=c.width/(W/ZOOM);return[(c.left-g.left+(wx-cam.x)*s)/Z,(c.top-g.top+(wy-cam.y)*s)/Z]}
 function anchorOf(npc){const h=npcH(npc),x=npc.x*TS,y=npc.y*TS,[cx,cy]=toDesign(x,y-h*.5),[,hy]=toDesign(x,y-(spKey?.(npc.sp)==='zhou'?h*.42:h));return{cx,cy,headY:hy,px:toDesign(player.x,player.y)[0]}}

 // ───── 一枚印 ─────
 // 残边：每枚印的外沿与内框各取一组固定的小缺口（按字与序号定，不随帧变），像手盖的石印。
 function edge(seed,amp){let s=seed*9301+49297;const rnd=()=>(s=(s*9301+49297)%233280)/233280;const pts=[];
  const side=(x0,y0,x1,y1)=>{for(let i=0;i<4;i++){const t=i/4,j=(rnd()-.5)*amp,k=rnd()<.25?amp*1.6:0;const x=x0+(x1-x0)*t,y=y0+(y1-y0)*t;pts.push([x+(y0===y1?0:(x0<50?1:-1)*(j+k)),y+(x0===x1?0:(y0<50?1:-1)*(j+k))])}};
  side(0,0,100,0);side(100,0,100,100);side(100,100,0,100);side(0,100,0,0);
  return'polygon('+pts.map(([x,y])=>`${Math.max(0,Math.min(100,x)).toFixed(1)}% ${Math.max(0,Math.min(100,y)).toFixed(1)}%`).join(',')+')'}
 function sealEl(ch,st,i=0,focus=false){const el=document.createElement('div');el.className='qn-seal '+(st||'normal')+(focus?' focus':'');const seed=ch.charCodeAt(0)+i*7;
  el.style.setProperty('--edge',edge(seed,5));el.style.setProperty('--edge2',edge(seed+3,2.5));el.style.setProperty('--rot',[-3,2,-1.5,3,-2,1,-2.5,2.5][i%8]+'deg');
  el.innerHTML=`<span class="face"></span><span class="g">${esc(ch)}</span>`;return el}
 const sealHTML=(ch,st,i)=>sealEl(ch,st,i).outerHTML;

 // ───── 名牌：乌木描金挂匾（含红绳） ─────
 function plaque(name){return`<svg width="104" height="44" viewBox="0 0 104 44"><path d="M38 14 L52 2 L66 14" fill="none" stroke="#9e2d22" stroke-width="1.6"/><circle cx="52" cy="3" r="2.2" fill="#b8382b"/>
  <rect x="3" y="13" width="98" height="29" rx="3" fill="#1a120e" stroke="#b8975a" stroke-width="1.2"/><rect x="7" y="16.5" width="90" height="22" rx="2" fill="url(#qnwood)" stroke="#8c6f3e" stroke-width=".7"/>
  <defs><linearGradient id="qnwood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#33241b"/><stop offset="1" stop-color="#170f0b"/></linearGradient></defs>
  <circle cx="11" cy="27.5" r="1.3" fill="#c9a865"/><circle cx="93" cy="27.5" r="1.3" fill="#c9a865"/></svg><b>${esc(name)}</b>`}

 // ───── 墨印菜单 ─────
 const R=96,R2=122,STEP=29;
 function ringGeom(n,side){const step=n>1?Math.min(STEP,135/(n-1)):0,top=Math.min(220,160+(n-1)*step/2);const left=Array.from({length:n},(_,i)=>top-i*step);return side==='left'?left:left.map(a=>180-a)}
 function arcSVG(cx,cy,angles,fa){const ext=24,a0=Math.min(...angles)-ext,a1=Math.max(...angles)+ext,S=2*R+80,ox=cx-S/2,oy=cy-S/2,rad=d=>d*Math.PI/180;
  const p=(r,d)=>[(cx+r*Math.cos(rad(d))-ox).toFixed(1),(cy+r*Math.sin(rad(d))-oy).toFixed(1)];
  const arc=(r,s,e)=>{const A=p(r,s),B=p(r,e);return`M${A} A${r} ${r} 0 ${e-s>180?1:0} 1 ${B}`};
  const segs=[];let c=null;for(let d=a0-6;d<=a1+6;d+=1){const ok=Math.abs(d-fa)>14;if(ok&&c===null)c=d;if(!ok&&c!==null){segs.push([c,d-1]);c=null}}if(c!==null)segs.push([c,a1+6]);
  let ticks='';for(let d=Math.ceil((a0-6)/5)*5;d<=a1+6;d+=5){if(Math.abs(d-fa)<=14)continue;const L=d%15===0?6:3,A=p(R2,d),B=p(R2-L,d);ticks+=`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}"/>`}
  const dia=(r,d,s,f)=>{const q=p(r,d);return`<rect x="${q[0]-s/2}" y="${q[1]-s/2}" width="${s}" height="${s}" transform="rotate(${d+45} ${q[0]} ${q[1]})" fill="${f}"/>`};
  const outer=segs.map(([x,y])=>`<path d="${arc(R2,x,y)}"/>`).join('');
  return{left:ox,top:oy,S,html:`<g fill="none" stroke="rgba(10,12,10,.5)" stroke-width="3.4"><path d="${arc(R,a0,a1)}"/>${outer}</g><g stroke="rgba(10,12,10,.55)" stroke-width="3" stroke-linecap="round">${ticks}</g>
   <g fill="none" stroke="#e2c27c" stroke-width="1.3"><path class="draw" style="--len:${Math.ceil((a1-a0)*R*Math.PI/180)}" d="${arc(R,a0,a1)}"/></g><g fill="none" stroke="#e2c27c" stroke-width=".9" stroke-opacity=".85">${outer}</g>
   <g stroke="#e2c27c" stroke-width="1" stroke-linecap="round">${ticks}</g>${dia(R2,a0-6,8,'rgba(10,12,10,.6)')}${dia(R2,a0-6,5,'#e2c27c')}${dia(R2,a1+6,8,'rgba(10,12,10,.6)')}${dia(R2,a1+6,5,'#e2c27c')}${dia(R,a0,8,'rgba(10,12,10,.6)')}${dia(R,a0,5,'#e2c27c')}${dia(R,a1,8,'rgba(10,12,10,.6)')}${dia(R,a1,5,'#e2c27c')}`}}

 let keyHandler=null;
 function captureKeys(fn){keyHandler=fn}
 addEventListener('keydown',e=>{if(!keyHandler)return;const k=e.key.toLowerCase();e.preventDefault();e.stopImmediatePropagation();if(e.repeat&&['e','enter',' ','escape'].includes(k))return;keyHandler(k,e)},true);
 addEventListener('keyup',e=>{if(keyHandler){e.stopImmediatePropagation()}},true);

 // 打开墨印：返回选中的项（对象），Esc 收起返回 null。
 function ring(npc,p,items,focusId){return new Promise(resolve=>{
  const L=ensure();L.innerHTML='';const a=anchorOf(npc);
  let side=a.px>=a.cx?'left':'right';let angles=ringGeom(items.length,side);
  const pos=ang=>[a.cx+R*Math.cos(ang*Math.PI/180),a.cy+R*Math.sin(ang*Math.PI/180)];
  if(angles.some(g=>{const[x]=pos(g);return x<70||x>1530})){side=side==='left'?'right':'left';angles=ringGeom(items.length,side)}
  const catchEl=document.createElement('div');catchEl.className='qn-catch';L.appendChild(catchEl);
  const root=document.createElement('div');root.className='qn-ring';L.appendChild(root);
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('qn-arc');root.appendChild(svg);
  const name=document.createElement('div');name.className='qn-name';name.innerHTML=plaque(p.name);name.style.left=a.cx+'px';name.style.top=(a.headY-2-44)+'px';root.appendChild(name);
  let fi=Math.max(0,items.findIndex(x=>x.id===focusId));if(focusId==null){const s=items.findIndex(x=>x.st==='story');fi=s>=0?s:Math.max(0,items.findIndex(x=>x.st!=='off'))}
  const seals=items.map((it,i)=>{const el=sealEl(it.ch,it.st,i,false);const[x,y]=pos(angles[i]);el.style.left=x+'px';el.style.top=y+'px';el.style.setProperty('--delay',i*30+'ms');
   el.onmouseenter=()=>{fi=i;draw()};el.onclick=ev=>{ev.stopPropagation();fi=i;pick()};root.appendChild(el);return el});
  let lab=null;const keysEl=document.createElement('div');keysEl.className='qn-keys';keysEl.innerHTML='<kbd>W</kbd><kbd>S</kbd>转 · <kbd>E</kbd>定 · <kbd>Esc</kbd>收';root.appendChild(keysEl);
  {const xs=angles.map(g=>pos(g)[0]),ys=angles.map(g=>pos(g)[1]);const mx=side==='left'?Math.min(...xs)-10:Math.max(...xs)+10;keysEl.style.top=(Math.max(...ys)+44)+'px';keysEl.style.left=(side==='left'?mx-10:mx-150)+'px'}
  function draw(){seals.forEach((el,i)=>el.classList.toggle('focus',i===fi));const it=items[fi],g=arcSVG(a.cx,a.cy,angles,angles[fi]);
   svg.setAttribute('width',g.S);svg.setAttribute('height',g.S);svg.style.left=g.left+'px';svg.style.top=g.top+'px';svg.innerHTML=g.html;
   lab?.remove();lab=document.createElement('div');lab.className='qn-lab '+(side==='left'?'l':'r')+(it.st==='off'?' off':'');lab.innerHTML=`<b>${esc(it.lab)}</b>${it.note?`<i>${esc(it.note)}</i>`:''}`;root.appendChild(lab);
   const[x,y]=pos(angles[fi]),w=lab.offsetWidth;lab.style.top=(y-17)+'px';lab.style.left=(side==='left'?x-24-14-w:x+24+14)+'px';
   svg.querySelectorAll('.draw').forEach(el=>{el.style.animation='none'})}
  draw();svg.querySelectorAll('.draw').forEach(el=>{el.style.animation=''});
  let done=false;
  const finish=async v=>{if(done)return;done=true;captureKeys(null);root.classList.add('closing');await sleep(v?120:150);L.innerHTML='';resolve(v)};
  async function pick(){const it=items[fi],el=seals[fi];if(it.st==='off'){el.classList.remove('nudge');void el.offsetWidth;el.classList.add('nudge');return}el.classList.add('press');await sleep(100);finish(it)}
  const move=d=>{fi=(fi+d+items.length)%items.length;draw()};
  captureKeys(k=>{if(['w','arrowup','a','arrowleft'].includes(k))move(-1);else if(['s','arrowdown','d','arrowright'].includes(k))move(1);else if(['e','enter',' '].includes(k))pick();else if(['escape','q','x','backspace'].includes(k))finish(null)});
  catchEl.onclick=()=>finish(null);catchEl.onwheel=e=>{move(e.deltaY>0?1:-1)};root.onwheel=catchEl.onwheel;
  ring.current={npc,p,items,get focus(){return items[fi]},set focus(id){const i=items.findIndex(x=>x.id===id);if(i>=0){fi=i;draw()}},pick,close:()=>finish(null)};
 })}

 // ───── 查看页（图 02、03） ─────
 const KEYS=['str','con','agi','wil','wis'],KN=['臂力','根骨','身法','定力','悟性'];
 const hasItem=id=>!!id&&typeof ITEMS!=='undefined'&&!!ITEMS[id];
 const icon=(id,glyph,dim)=>{if(hasItem(id)&&typeof mnIco==='function')return mnIco(id,54);return`<span class="gl${dim?' dim':''}">${esc(glyph||'？')}</span>`};
 const slotHTML=it=>`<div class="it"><div class="qn-ico" style="--r:${(it.name.charCodeAt(0)%60)-30}deg">${icon(it.id,it.glyph,it.dim)}${it.qty?`<span class="qty">${esc(it.qty)}</span>`:''}${it.story?'<span class="mk">剧情</span>':it.look?'<span class="mk look">只可见</span>':''}</div>
   <div class="nm${it.dim?' dim':''}">${esc(it.name)}${it.grade?`<span class="grade g-${esc(it.grade)}">${esc(it.grade)}</span>`:''}</div>${it.sub?`<div class="sb">${esc(it.sub)}</div>`:''}</div>`;
 function statMode(v){if(v.civil)return'civil';if(!v.battle.st)return'none';return v.tier.stats}
 function radar(v){const mode=statMode(v),st=v.battle?.st,cx=150,cy=128,RR=92;const pt=(i,r)=>{const a=(-90+i*72)*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a)]};
  const grid=[.33,.66,1].map(k=>`<polygon points="${KN.map((_,i)=>pt(i,RR*k).join(',')).join(' ')}" fill="none" stroke="rgba(31,28,22,.22)" stroke-width="1"/>`).join('');
  const tri=x=>D.STAT_TRI.find(([m])=>x<=m)[1],band=x=>`${Math.max(0,x-D.STAT_BAND)}～${x+D.STAT_BAND}`;let shape='',val=()=> '？';
  if(mode==='exact'){shape=`<polygon points="${KEYS.map((k,i)=>pt(i,RR*Math.min(1,st[k]/14)).join(',')).join(' ')}" fill="rgba(61,111,98,.28)" stroke="#2f5a4f" stroke-width="2.4" stroke-linejoin="round"/>`;val=k=>st[k]}
  else if(mode==='band2'){shape=`<polygon points="${KEYS.map((k,i)=>pt(i,RR*Math.min(1,st[k]/14)).join(',')).join(' ')}" fill="rgba(31,28,22,.14)" stroke="rgba(47,90,79,.45)" stroke-width="6" stroke-linejoin="round" filter="url(#qnb1)"/>`;val=k=>band(st[k])}
  else if(mode==='tri'){const m={低:.35,中:.62,高:.9};shape=`<polygon points="${KEYS.map((k,i)=>pt(i,RR*m[tri(st[k])]).join(',')).join(' ')}" fill="rgba(31,28,22,.16)" stroke="rgba(31,28,22,.35)" stroke-width="9" stroke-linejoin="round" filter="url(#qnb1)"/>`;val=k=>tri(st[k])}
  else shape=`<circle cx="${cx}" cy="${cy}" r="58" fill="rgba(31,28,22,.13)" filter="url(#qnb2)"/>`;
  const exact=mode==='exact';
  const labels=KN.map((n,i)=>{const[x,y]=pt(i,RR+24);return`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="15" fill="#1f1c16">${n} <tspan font-weight="700" fill="${exact?'#2f5a4f':'#7a7060'}">${esc(mode==='civil'?'—':val(KEYS[i]))}</tspan></text>`}).join('');
  return`<svg width="300" height="262" viewBox="0 0 300 262" overflow="visible"><defs><filter id="qnb1"><feGaussianBlur stdDeviation="3"/></filter><filter id="qnb2"><feGaussianBlur stdDeviation="14"/></filter></defs>${grid}${shape}${labels}</svg>`}
 function powerHTML(p,v){if(v.civil)return{seal:'常人',cls:' civil',pl:'不习武',sub:'看不出武功，本就不会'};
  const hero=S.lv||1,t=v.tier;let pl,sub;
  if(p.disguised){pl=D.TIER_TEXT.abyss;sub=`你 ${hero} 级 · 看不透`}
  else if(v.party){pl='等级 '+v.battle.lv;sub='同伴 · 一眼看穿'}
  else{pl=t.lv==='exact'?'等级 '+v.battle.lv:D.TIER_TEXT[t.lv];const d=v.d;sub=`你 ${hero} 级 · ${d>0?'差 '+d+' 级':d<0?'低你 '+(-d)+' 级':'同级'}：${({clear:'一眼看穿',see:'看得出',rough:'看个大概',opaque:'看不透'})[t.id]}`}
  return{seal:t.seal,cls:'',pl,sub,eye:v.eye}}
 function equipHTML(p,v){const b=v.battle;const rows=[];
  const w=b?.weapon;rows.push(w?{slot:'兵器',name:w.name,id:w.id,glyph:({剑:'剑',刀:'刀',棍:'棍',鞭:'鞭'})[w.kind]||'兵',grade:w.grade||'',sub:w.atk!=null?`${w.kind==='棍'?'长兵':w.kind} · 攻击 ${w.atk}${w.crit?' · 暴击 '+w.crit+'%':''}`:'数值待登记'}:
   p.tools?{slot:'兵器',name:p.tools,glyph:'具',sub:''}:{slot:'兵器',name:'—',glyph:'—',dim:true});
  rows.push({slot:'护具',name:'常服',glyph:'—',dim:true});
  const acc=b?.acc;rows.push(acc?{slot:'佩饰',name:acc.name,glyph:'饰',grade:acc.grade||''}:{slot:'佩饰',name:'无',glyph:'—',dim:true});
  return rows.map(r=>`<div class="eq">${slotHTML({...r,id:hasItem(r.id)?r.id:null})}<div class="sl">${r.slot}</div></div>`).join('')}
 function artsHTML(p,v){if(v.civil)return{note:'',html:'<div class="empty">不习武</div>'};const t=v.tier,arts=v.battle.arts||[];
  if(t.art==='hidden')return{note:t.artNote,html:`<div class="art"><div class="an"><b class="dim">武学</b><span class="lv dim">看不透</span></div></div><div class="art"><div class="an"><b class="dim">内功</b><span class="lv dim">看不透</span></div></div>`};
  const rows=arts.map(a=>{const lvTxt=a.lv==null?'重数未登记':['','一','二','三','四','五','六','七','八','九','十'][a.lv]+'重';
   let lv,mv,lvDim=false,mvDim=false;
   if(t.art==='full'){lv=lvTxt;mv=a.moves?.length?'招式：'+a.moves.join(' · '):'';lvDim=a.lv==null}
   else if(t.art==='grade'){lv=lvTxt;lvDim=a.lv==null;mv='招式看不出';mvDim=true}
   else{lv='几重 ？';lvDim=true;mv='招式看不出';mvDim=true}
   return`<div class="art"><div class="an"><b>${esc(a.name)}</b>${a.grade?`<span class="grade g-${esc(a.grade)}">${esc(a.grade)}</span>`:''}<span class="lv${lvDim?' dim':''}">${esc(lv)}</span></div>${mv?`<div class="mv${mvDim?' dim':''}">${esc(mv)}</div>`:''}</div>`}).join('');
  const inner=t.inner==='hidden'?'<span class="lv dim">看不出</span>':'<span class="lv dim">未登记</span>';
  const innerSub=t.inner==='hidden'?'':'<div class="mv dim">战斗档里还没有登记内功</div>';
  return{note:t.artNote,html:(rows||'<div class="empty">外功未登记</div>')+`<div class="art"><div class="an"><b>内功</b>${inner}</div>${innerSub}</div>`}}
 function portraitHTML(p,npc){if(p.portrait)return`<img class="por" alt="" src="${esc(assetImagePath(p.portrait))}">`;
  return`<div class="por-wash"></div><canvas class="por px" data-sp="${esc(npc?.sp||'')}"></canvas>`}
 function paintSprite(el){const sp=el.dataset.sp;const im=IMG[sp+'_d_0']||IMG[sp+'_d']||IMG[sp];if(!im)return;const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;if(!w)return;el.width=w;el.height=h;const x=el.getContext('2d');x.imageSmoothingEnabled=false;drawImageAsset(x,im,0,0,w,h);el.style.width=Math.min(360,w*360/h*1.4)+'px'}
 function nearbyPeople(){const out=[];for(const n of cur?._npcs||[]){const p=Q.personFor(n);if(!p)continue;if(Math.hypot(n.x*TS-player.x,n.y*TS-player.y)>320)continue;if(out.some(o=>o.p===p))continue;out.push({npc:n,p})}return out}
 // 返回 {act:菜单项, npc, p}（在查看页底部选了交互印）或 null（Esc 返回）。
 function profile(p,npc){return new Promise(resolve=>{const L=ensure();
  const render=()=>{const v=Q.view(p),pw=powerHTML(p,v),art=artsHTML(p,v),bag=Q.bagOf(p,v),acts=Q.menuFor(p,npc).filter(x=>x.id!=='guan');
   const sm=statMode(v),statNote=v.civil?'':sm==='none'?'未登记':v.tier.statNote;
   L.innerHTML=`<div class="qn-page" data-person="${esc(p.id)}"><div class="wash"></div>${portraitHTML(p,npc)}
    <div class="namecol"><div class="vname big">${esc(p.name)}</div><div class="vname idt">${esc(p.faction+' · '+p.role)}</div></div>
    <div class="topbar"><span class="t">查看</span><span class="place">${esc(cur?.name||'')}</span></div>
    <div class="esc" data-k="esc">${sealHTML('返','normal',0)}<span>Esc</span></div>
    <div class="col mid"><div class="power"><div class="eye${pw.cls}" title="${pw.eye?'悟性过人，看清了一档':''}">${esc(pw.seal)}${pw.eye?'<sup>眼</sup>':''}</div><div><div class="pl">${esc(pw.pl)}</div><div class="small">${esc(pw.sub)}</div></div></div>
     <h3>装备<span class="hs">随时看得见</span></h3><div class="brush"></div><div class="eqrow">${equipHTML(p,v)}</div>
     <h3 style="margin-top:22px">根基<span class="hs">${esc(statNote)}</span></h3><div class="brush"></div><div class="radar">${radar(v)}</div></div>
    <div class="col right"><h3>武学<span class="hs">${esc(art.note)}</span></h3><div class="brush"></div><div class="arts">${art.html}</div>
     <h3 style="margin-top:18px">随身物品<span class="hs">看得见的都列出</span></h3><div class="brush"></div><div class="bag">${bag.length?bag.map(slotHTML).join(''):'<div class="empty">身上没带什么</div>'}</div></div>
    <div class="acts">${acts.map((a,i)=>`<div class="act${a.st==='off'?' off':''}" data-i="${i}">${sealHTML(a.ch,a.st,i)}<div class="al">${esc(a.lab)}${a.st!=='normal'&&a.note?`<i>${esc(a.note)}</i>`:''}</div></div>`).join('')}<span class="swap">Q / E 换人（只列身边的人）</span></div></div>`;
   L.querySelectorAll('canvas.por').forEach(paintSprite);
   L.querySelector('.esc').onclick=()=>finish(null);
   L.querySelectorAll('.act').forEach(el=>el.onclick=()=>choose(+el.dataset.i));
   state.acts=acts;state.fi=-1};
  const state={acts:[],fi:-1};
  const choose=i=>{const a=state.acts[i];if(!a)return;if(a.st==='off'){const el=L.querySelectorAll('.act')[i]?.querySelector('.qn-seal');el?.classList.remove('nudge');void el?.offsetWidth;el?.classList.add('nudge');return}finish({act:a,p,npc})};
  const focusAct=d=>{const n=state.acts.length;if(!n)return;state.fi=(state.fi+d+n)%n;L.querySelectorAll('.act').forEach((el,i)=>el.classList.toggle('focus',i===state.fi))};
  const swap=d=>{const list=nearbyPeople();if(list.length<2)return;const i=list.findIndex(o=>o.p===p);const o=list[(i+d+list.length)%list.length];p=o.p;npc=o.npc;render()};
  let done=false;const finish=v=>{if(done)return;done=true;captureKeys(null);L.innerHTML='';resolve(v)};
  render();captureKeys(k=>{if(['escape','x','backspace'].includes(k))finish(null);else if(k==='q')swap(-1);else if(k==='e')swap(1);else if(['a','arrowleft'].includes(k))focusAct(-1);else if(['d','arrowright'].includes(k))focusAct(1);else if(['enter',' '].includes(k)&&state.fi>=0)choose(state.fi)});
 })}

 // ───── 卷：请教（图 05b）、切磋（npc-spar 图 01） ─────
 function scrollBox(npc,w,h,html,prefer){const L=ensure();L.innerHTML='';const a=anchorOf(npc);
  const c=document.createElement('div');c.className='qn-catch dim';c.style.setProperty('--fx',(a.cx/16)+'%');c.style.setProperty('--fy',(a.cy/9)+'%');L.appendChild(c);
  // 卷放在人物另一侧，不遮主角与对方（第 5 节）
  const right=prefer?prefer==='right':a.px>=a.cx;/* 卷与主角同侧、在主角外面（墨印绕在另一侧） */let left=right?a.cx+150:a.cx-150-w;left=Math.max(40,Math.min(1600-40-w,left));let top=Math.max(40,Math.min(900-40-h,a.cy-h/2));
  const el=document.createElement('div');el.className='qn-scroll';el.style.cssText=`left:${left}px;top:${top}px;width:${w}px;height:${h}px;padding:44px 52px 0 58px`;el.innerHTML=html;L.appendChild(el);return{L,el,c}}
 function twoButtons(el,c,resolve,yesLabel,yesCh){const btns=[...el.querySelectorAll('.qn-btn')];let fi=0;const paint=()=>btns.forEach((b,i)=>b.classList.toggle('focus',i===fi));paint();
  let done=false;const finish=v=>{if(done)return;done=true;captureKeys(null);clear();resolve(v)};
  btns[0].onclick=()=>finish(true);btns[1].onclick=()=>finish(false);c.onclick=()=>finish(false);
  captureKeys(k=>{if(['a','arrowleft','w','arrowup'].includes(k)){fi=0;paint()}else if(['d','arrowright','s','arrowdown'].includes(k)){fi=1;paint()}else if(['e','enter',' '].includes(k))finish(fi===0);else if(['escape','x','backspace','q'].includes(k))finish(false)})}
 function teach(npc,p){return new Promise(resolve=>{const ts=Q.teachState(p),t=ts.t;const sk=t.skill&&typeof SKILLS!=='undefined'?SKILLS[t.skill]:null;
  const reqRows=t.req.filter(([c])=>!(/^(stage|halfDay)/.test(c)&&Q.test(c))).map(([c,txt])=>`${esc(txt)}<span class="${Q.test(c)?'ok">够':'no">未够'}</span>`);   /* 时限类条件满足时不写，卷上只留要紧的 */
  if(sk?.req)for(const[k,n]of Object.entries(sk.req)){const have=(()=>{try{return derived().st[k]}catch(e){return S.st?.[k]||0}})();reqRows.unshift(`${KN[KEYS.indexOf(k)]} ${have} / 需 ${n}<span class="${have>=n?'ok">够':'no">未够'}</span>`)}
  const html=`<div class="ph"><b>请教</b><span>${esc(p.name)}肯教你的</span></div>
   <div class="row"><div class="qn-ico">${icon(t.skill?'qh_staff_notes':null,t.title[0])}</div><div>
    <div class="t1">${esc(t.title)}<span class="grade g-${esc(t.grade)}">${esc(t.grade)}</span><small>${esc(t.sub)}</small></div>
    <div class="d">${esc(sk?sk.desc.replace(/BP.*$/,'').replace(/^[^。]*第一式。/,''):t.line)}</div>
    <div class="req">${[...reqRows,...(t.info?[esc(t.info)]:[])].join('　·　')}</div><div class="gain">${esc(t.gain.startsWith('学会得')?t.gain:'学会得：'+t.gain)}</div></div></div>
   <div class="foot"><button class="qn-btn">${sealHTML('学','story',0)}拜请指点</button><button class="qn-btn">${sealHTML('罢','normal',1)}作罢</button><div class="tip">${esc(t.tip||'每人只教一次\n请教不耗时')}</div></div>`;
  const{el,c}=scrollBox(npc,580,330,html);twoButtons(el,c,resolve)})}
 function spar(npc,p){return new Promise(resolve=>{const q=Q.sparQuote(p),v=Q.view(p),hero=S.lv||1;
  const tierTxt=({clear:'一眼看穿',see:'看得出',rough:'看个大概',opaque:'看不透'})[v.tier?.id]||'';
  const lvTxt=v.tier?.lv==='exact'?q.lv+' 级':D.TIER_TEXT[v.tier?.lv]||'';
  const rel=v.tier?.lv==='exact'?(q.d>0?`${p.she?'她':'他'}高你 ${q.d} 级`:q.d<0?`你高${p.she?'她':'他'} ${-q.d} 级`:'同级'):'';
  const exp=q.spent?`<dd>${p.she?'她':'他'}已摸透你的路数，这一场没有收益</dd>`:`<dd>胜 <b>${q.exp.win}</b>　·　平 <b>${q.exp.draw}</b>　·　败 <b>${q.exp.lose}</b></dd>`;
  const ins=[q.insight.first?`初次与${p.she?'她':'他'}切磋 <b>+${q.insight.first}</b>`:'',q.insight.firstWin?`第一次赢${p.she?'她':'他'}再 <b>+${q.insight.firstWin}</b>`:''].filter(Boolean).join('　·　')||'已领过';
  const tip=q.story?`${esc(p.spar.firstNote||'')} · 本场不占次数\n本时段还可切磋 ${q.left} 次`:`本时段还可切磋 ${q.left} 次`;
  const html=`<div class="ph"><b>切磋</b><span>点到为止 · 不伤和气</span></div>
   <div class="who"><b style="font-size:19px;letter-spacing:4px">${esc((p.faction&&p.faction.length<=4&&!p.name.includes(p.faction)?p.faction:'')+p.name)}</b><span>${esc(lvTxt)}</span><span class="tier">${esc(tierTxt)}</span><span class="small" style="font-size:13px;color:#7a7060">你 ${hero} 级${rel?' · '+esc(rel):''}</span></div>
   <div class="rule">单人上场。谁先掉到三成气血、或打满八回合，就收手。打完气血内力复原，用掉的药不还；不掉对方物品。</div>
   <dl><dt>经验</dt>${exp}<dt>江湖历练</dt><dd>${ins}</dd></dl>
   ${q.story&&!Q.state().skills.spar?'<div class="first">打完这一场，学会「切磋」：此后可向大多数习武的人讨教。</div>':''}
   <div class="foot"><button class="qn-btn">${sealHTML('比',q.story?'story':'normal',0)}抱拳请教</button><button class="qn-btn">${sealHTML('罢','normal',1)}作罢</button><div class="tip">${tip}</div></div>`;
  const{el,c}=scrollBox(npc,640,410,html);el.style.padding='42px 54px 0 60px';twoButtons(el,c,resolve)})}
 function result(p,r){return new Promise(resolve=>{const L=ensure();L.innerHTML='';const c=document.createElement('div');c.className='qn-catch';L.appendChild(c);
  const el=document.createElement('div');el.className='qn-scroll qn-result';
  el.innerHTML=`<h4>${({win:'胜',draw:'平',lose:'败'})[r.result]}</h4><p>与${esc(p.name)}切磋 · 经验 +${r.exp}${r.insight?' · 江湖历练 +'+r.insight:''}</p>${r.learned?'<p style="color:#8a3a2b;font-weight:700">学会「切磋」：此后可向大多数习武的人讨教。</p>':''}<div class="go">按 E 或点击继续</div>`;L.appendChild(el);
  let done=false;const finish=()=>{if(done)return;done=true;captureKeys(null);clear();resolve()};c.onclick=el.onclick=finish;captureKeys(k=>{if(['e','enter',' ','escape'].includes(k))finish()})})}

 // ───── 流程 ─────
 const visible=n=>(!n.show||n.show())&&cur?._npcs?.includes(n);
 async function runAct(npc){const pos=npcPos(npc);player.dir=faceTo(pos.x-player.x,pos.y-player.y);await npc.act(npc)}
 const canReopen=(npc,scene)=>mode==='scene'&&!dlgBusy&&S.scene===scene&&!S.qiheChapter?.pendingEvent&&!window.QiheChapter?.running&&$('panel').hidden&&visible(npc)&&Math.hypot(npc.x*TS-player.x,npc.y*TS-player.y)<130;
 // 执行一项；返回 'again' 表示回到墨印（谈完、查看页 Esc、卷上作罢），其余结束。
 async function execute(it,p,npc){const scene=S.scene;
  switch(it.run){
   case 'act':await runAct(npc);if(cur)cur._npcs=npcsOf(cur);return it.id==='tan'&&canReopen(npc,scene)?'again':'end';
   case 'errand':await QiheOutsiders.talk(p.chapter);return'end';
   case 'profile':{const r=await profile(p,npc);if(!r)return'again';if(r.p!==p)return{switch:r};return execute(r.act,p,npc)}
   case 'teach':if(!await teach(npc,p))return'again';await Q.doTeach(p);return'end';
   case 'spar':{if(!await spar(npc,p))return'again';clear();const r=await Q.runSpar(p);await result(p,r);return'end'}
   case 'gift':clear();await QiheGiftUI.gift(npc,p);return canReopen(npc,scene)?'again':'end';   // 2026-10-26 开发二
   case 'yi':{clear();const r=await QiheGiftUI.yi(npc,p);if(r==='buy'){await runAct(npc);return'end'}return canReopen(npc,scene)?'again':'end'}
  }return'end'}
 async function session(npc,p){let focus=null;
  for(let guard=0;guard<40;guard++){const items=Q.menuFor(p,npc);if(!items.length)return runAct(npc);
   const it=await ring(npc,p,items,focus);if(!it)return;focus=it.id;
   let r=await execute(it,p,npc);
   while(r&&r.switch){p=r.switch.p;npc=r.switch.npc;focus=null;r=await execute(r.switch.act,p,npc)}
   if(r!=='again')return;
   await sleep(0)}
 }
 function install(){if(window.__qnInstalled)return;window.__qnInstalled=true;const base=window.interact;
  window.interact=async function(target){if(!enabled()||busy||dlgBusy||mode!=='scene')return base(target);
   const n=target?{type:'npc',o:target}:nearest();const p=n&&n.type==='npc'&&!n.o.loot&&Q.personFor(n.o);if(!p)return base(target);
   busy=true;$('prompt').hidden=true;player.path=null;player.goal=null;player.talkTo=null;keys={};const pos=npcPos(n.o);player.dir=faceTo(pos.x-player.x,pos.y-player.y);
   try{await session(n.o,p)}catch(e){console.error('人物交互出错：',e);toast('人物交互出错，已收起',2200)}
   finally{captureKeys(null);clear();busy=false;keys={};if(cur)cur._npcs=npcsOf(cur);hud()}};
  addEventListener('resize',()=>{if(layer&&!layer.hidden)fit()})}
 install();
 window.QiheNpcUI={ring,profile,teach,spar,result,session,clear,get open(){return!!keyHandler},get layer(){return layer},enabled};
})();
