'use strict';
// ───────────────────────── 对话 ─────────────────────────
let dlgBusy=false;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const FOES=['bandit','chief','snake','wolf','liu','langli'];
// 主角、同伴及重要剧情人物使用立绘；普通服务和路人仍用探索小像。
const DIALOGUE_LEADS=new Set(['hero','ye','suzhi','monk','beggar','chief','liu','langli','zhou']);
function face(sp){if(!sp)return'none';const[k,e]=sp.replace(/^c_/,'').split(':');if(!DIALOGUE_LEADS.has(k)||!PORTS.includes(k))return'none';if(typeof OPT_PORTS!=='undefined'&&OPT_PORTS.includes(k)&&!ok(IMG['p_'+k]))return'none';
  const emotion=e==='neutral'?'':e==='firm'&&!(EXPR[k]||[]).includes('firm')?'angry':e;
  if(emotion&&ok(IMG[`p_${k}_${emotion}`]))return`url(${assetImagePath(`p_${k}_${emotion}`)})`;return`url(${assetImagePath('p_'+(k))})`}
function whoType(who,sp){if(!who)return'narr';const k=(sp||'').replace(/^c_/,'').replace(/[_:].*/,'');
  if(k==='hero'||(typeof S!=='undefined'&&who===S.name))return'hero';if(FOES.includes(k))return'foe';if(!sp)return'thing';return'npc'}
// 无立绘 NPC：把行走图正面站立帧画进小画框
// 2026-10-26：先按不透明像素裁出人形再放大，孩子这类小个子也能看清（以前按整帧缩放，人只占框的一小块）
function miniBox(im){try{const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,t=document.createElement('canvas');t.width=w;t.height=h;const g=t.getContext('2d');drawImageAsset(g,im,0,0,w,h);const d=g.getImageData(0,0,w,h).data;let x0=w,y0=h,x1=-1,y1=-1;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}return x1<0?null:{c:t,x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}}catch(e){return null}}
function miniSprite(sp){const im=IMG[sp+'_d']||IMG[sp+'_d_0']||IMG[sp];if(!im||!im.width&&!im.naturalWidth)return null;
  const c=document.createElement('canvas');c.width=96;c.height=96;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const b=miniBox(im);
  if(b){const s=Math.min(84/b.w,88/b.h,2.4);x.drawImage(b.c,b.x,b.y,b.w,b.h,(96-b.w*s)/2,94-b.h*s,b.w*s,b.h*s);return c}
  const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,s=Math.min(96/w,96/h,1.2);drawImageAsset(x,im,(96-w*s)/2,96-h*s-2,w*s,h*s);return c}
let lastSpeaker=null;
function dlgSetup(who,sp,chooseMode){const d=$('dlg');const wasHidden=d.hidden;d.hidden=false;const suppress=window.OpeningCharacters?.fullscreenCGActive()||false,f=suppress?'none':face(sp),fe=d.querySelector('.face'),mi=d.querySelector('.mini');
  d.dataset.cgPortraitSuppressed=String(suppress);
  d.dataset.portrait=f==='none'?'none':(sp||'').replace(/^c_/,'').split(':')[0];
  const key=(who||'')+'|'+(sp||'').split(':')[0]/* 仅换表情不重播入场动画 */;const changed=wasHidden||key!==lastSpeaker;lastSpeaker=key;
  fe.style.backgroundImage=f;fe.hidden=f==='none';d.classList.toggle('hasface',f!=='none');d.classList.toggle('choose',!!chooseMode);
  mi.innerHTML='';const ms=!suppress&&f==='none'&&sp?miniSprite(sp.split(':')[0]):null;if(ms)mi.appendChild(ms);mi.hidden=!ms;d.classList.toggle('hasmini',!!ms);
  window.DialogueStage?.render(d,who,sp,{suppress,primary:fe});
  const ty=whoType(who,sp);d.dataset.type=ty;d.classList.toggle('narr',ty==='narr');
  if(changed){for(const e of[fe,mi]){e.style.animation='none';void e.offsetWidth;e.style.animation=''}}
  d.querySelector('.who').textContent=who||'';d.querySelector('.choices').innerHTML='';d.querySelector('.more').hidden=!!chooseMode;return d}
const PAUSE={'，':90,'、':80,'；':120,'：':90,'。':220,'！':220,'？':220,'…':110,'—':60,'\n':160};
function say(who,text,sp){sp=window.OpeningCharacters?.dialogueSprite(who,text,sp)||sp;return new Promise(res=>{dlgBusy=true;const d=dlgSetup(who,sp,false);text=String(text);
  const t=d.querySelector('.txt'),m=d.querySelector('.more');let i=0,done=false,tm=0;t.textContent='';m.style.visibility='hidden';
  const fin=()=>{clearTimeout(tm);t.textContent=text;done=true;m.style.visibility=''};
  const step=()=>{i++;t.textContent=text.slice(0,i);if(i>=text.length){fin();return}tm=setTimeout(step,26+(PAUSE[text[i-1]]||0))};
  tm=setTimeout(step,40);
  const go=()=>{if(!done){fin();return}d.onclick=null;window.removeEventListener('keydown',kd);d.hidden=true;dlgBusy=false;
    window.DialogueStage?.closeLine();setTimeout(()=>{if(d.hidden)lastSpeaker=null},80);res()};
  const kd=e=>{if([' ','Enter','e','E'].includes(e.key)&&!e.repeat){e.preventDefault();go()}};
  d.onclick=go;setTimeout(()=>window.addEventListener('keydown',kd),50)})}
function choose(who,text,opts,sp){sp=window.OpeningCharacters?.dialogueSprite(who,text,sp)||sp;return new Promise(res=>{dlgBusy=true;const d=dlgSetup(who,sp,true);d.onclick=null;
  d.querySelector('.txt').textContent=text||'';
  const c=d.querySelector('.choices');
  opts.forEach((o,i)=>{const b=document.createElement('button');b.innerHTML=`<span class="n">${i+1}</span>${esc(o)}`;b.onmouseenter=()=>b.focus();b.onclick=e=>{e.stopPropagation();window.removeEventListener('keydown',kd);d.hidden=true;dlgBusy=false;lastSpeaker=null;window.DialogueStage?.closeLine();res(i)};c.appendChild(b)});
  const kd=e=>{const n=+e.key;if(n>=1&&n<=opts.length){e.preventDefault();c.children[n-1].click();return}
    const bs=[...c.children],k=bs.indexOf(document.activeElement);
    if(e.key==='ArrowDown'||e.key==='s'){e.preventDefault();bs[(k+1)%bs.length].focus()}
    if(e.key==='ArrowUp'||e.key==='w'){e.preventDefault();bs[(k-1+bs.length)%bs.length].focus()}
    if((e.key===' '||e.key==='e')&&k>=0){e.preventDefault();bs[k].click()}};
  window.addEventListener('keydown',kd);c.firstChild?.focus()})}
async function talk(npc,...lines){const play=async()=>{for(const l of lines)if(l)await say(npc.name,l,npc.sp)};if(!window.DialogueStage)return play();return DialogueStage.withCast({id:'talk:'+npc.id,cast:[{who:S.name||'萧白',sp:'c_hero',slot:'left'},{who:npc.name,sp:npc.sp,slot:'right'}]},play)}
const narr=t=>say('',t);
function gain(txt){return toast(txt,1200)}
function giveItem(k,n=1){S.bag[k]=(S.bag[k]||0)+n;return gain(`获得 ${ITEMS[k].name}${n>1?' ×'+n:''}`)}
function learn(k){if(S.skills[k])return;S.skills[k]=1;return toast(`习得武学「${SKILLS[k].name}」`,1600)}
function moral(d){S.moral=clamp(S.moral+d,0,30);return gain(`道德 ${d>0?'+':''}${d}`)}

// ───────────────────────── 面板通用 ─────────────────────────
const ICO={bun:'食',pill:'药',wine:'酒',shovel:'铲',book:'书',gall:'胆',token:'令',wood:'剑',iron:'剑',rusty:'剑',cloth:'衣',vest:'甲'};
// 图标：优先 ART.icons 图集（assets/production/icons-and-props/i_icons.webp），缺失回落文字字形
let icoImg=null,icoOK=false;
function icoAtlas(){if(!window.ART||!ART.icons)return false;if(!icoImg){icoImg=new Image();icoImg.onload=()=>{icoOK=true;if(!$('panel').hidden&&panelRedraw)panelRedraw()};icoImg.src='assets/production/icons-and-props/i_icons.webp'}return icoOK}
function icoHTML(k,glyph){const r=icoAtlas()&&ART.icons[k];
  if(r){const[x,y,w,h]=r,W0=icoImg.naturalWidth,H0=icoImg.naturalHeight;
    return`<div class="ico img"><i style="background-image:url(assets/production/icons-and-props/i_icons.webp);background-size:${W0/w*100}% ${H0/h*100}%;background-position:${W0===w?0:x/(W0-w)*100}% ${H0===h?0:y/(H0-h)*100}%"></i></div>`}
  return`<div class="ico">${glyph}</div>`}
const ico=k=>icoHTML(k,ICO[k]||(ITEMS[k]?.name||'?')[0]);
let panelRedraw=null,panelKind='';
addEventListener('keydown',e=>{if(panelKind!=='menu'||$('panel').hidden||dlgBusy||!panelRedraw)return;const k=e.key.toLowerCase(),i=TABS.findIndex(t=>t[0]===menuTab);
  let d=0;if(k==='q'||k==='arrowleft'||k==='pageup')d=-1;else if(k==='e'||k==='arrowright'||k==='pagedown'||(k==='tab'&&!e.shiftKey&&document.activeElement===document.body))d=1;
  else if(k>='1'&&k<='5'&&!e.target.matches('input')){menuTab=TABS[+k-1][0];e.preventDefault();panelRedraw();return}
  if(d){e.preventDefault();menuTab=TABS[(i+d+TABS.length)%TABS.length][0];panelRedraw();$('panel').querySelector('.tabs .on')?.focus()}});
let panelClose=null;
function openPanel(cls){const p=$('panel');p.className='ui panel'+(cls?' '+cls:'');p.hidden=false;return p}
function closePanel(){panelRedraw=null;panelKind='';const p=$('panel');p.hidden=true;p.className='ui panel';p.innerHTML='';const f=panelClose;panelClose=null;f&&f()}
addEventListener('keydown',e=>{if(e.key==='Escape'&&panelClose&&!$('panel').hidden&&!dlgBusy){e.preventDefault();closePanel()}});
function bar(label,v,max,cls=''){return`<span class="muted">${label}</span><div class="b ${cls}"><i style="width:${clamp(v/max*100,0,100)}%"></i></div><span>${v}/${max}</span>`}

// ───────────────────────── 商店（左货单 · 右详情 · 买入/卖出） ─────────────────────────
const KINDN=it=>it.weapon?'兵器':it.armor?'护甲':it.key?'要物':(it.heal||it.mp)?'药食':'杂物';
const stackable=k=>!(ITEMS[k].weapon||ITEMS[k].armor||ITEMS[k].key);
const dlt=v=>v==null?'':v>0?`<span class="d-up">↑${v}</span>`:v<0?`<span class="d-dn">↓${-v}</span>`:'<span class="d-eq">持平</span>';
function statRows(k){const it=ITEMS[k],d=derived(),L=[];
  if(it.weapon){const c=S.weapon?ITEMS[S.weapon].weapon:null,dd=it.weapon.atk-(c?c.atk:0);L.push(['攻击',`+${it.weapon.atk}`,dd,`${d.atk} → ${d.atk+dd}`]);
    const cc=c&&c.crit||0,nc=it.weapon.crit||0;if(cc||nc)L.push(['暴击',`+${nc}%`,nc-cc,`${d.crit}% → ${d.crit+nc-cc}%`]);L.push(['类别',it.weapon.kind,null,S.weapon?`现用 ${ITEMS[S.weapon].name}`:'现为空手'])}
  if(it.armor){const dd=it.armor-(S.armor?ITEMS[S.armor].armor:0);L.push(['防御',`+${it.armor}`,dd,`${d.def} → ${d.def+dd}`]);L.push(['部位','身',null,S.armor?`现穿 ${ITEMS[S.armor].name}`:'现无护甲'])}
  if(it.heal)L.push(['气血',`+${it.heal}`,null,`当前 ${S.hp}/${d.mhp}`]);
  if(it.mp)L.push(['内力',`+${it.mp}`,null,`当前 ${S.mp}/${d.mmp}`]);
  return L}
function equipItem(k){const it=ITEMS[k],s=it.weapon?'weapon':it.armor?'armor':null;if(!s||!S.bag[k])return;if(S[s])S.bag[S[s]]=(S.bag[S[s]]||0)+1;S[s]=k;S.bag[k]--}
function shop(n,list){return new Promise(res=>{const p=openPanel('shopx');const log={bought:[],sold:[],spent:0,earned:0};
  let tab='buy',sel=0,qty=1,conf=false,fresh=null,flash=0;
  const sellable=()=>Object.keys(S.bag).filter(k=>S.bag[k]>0&&ITEMS[k].price&&!ITEMS[k].key);
  const sp=k=>Math.floor(ITEMS[k].price/2);
  const kd=e=>{if(dlgBusy||$('panel').hidden||panelKind!=='shop')return;const L=tab==='buy'?list:sellable();
    if(e.key==='ArrowDown'||e.key==='s'){sel=(sel+1)%Math.max(1,L.length);qty=1;conf=false;e.preventDefault();draw()}
    else if(e.key==='ArrowUp'||e.key==='w'){sel=(sel-1+L.length)%Math.max(1,L.length);qty=1;conf=false;e.preventDefault();draw()}
    else if(e.key==='ArrowRight'||e.key==='d'){qty++;e.preventDefault();draw()}
    else if(e.key==='ArrowLeft'||e.key==='a'){qty--;e.preventDefault();draw()}
    else if(e.key==='Tab'||e.key==='q'){tab=tab==='buy'?'sell':'buy';sel=0;qty=1;conf=false;e.preventDefault();draw()}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();(p.querySelector('#sok')||p.querySelector('#sgo'))?.click()}};
  addEventListener('keydown',kd);
  panelClose=()=>{removeEventListener('keydown',kd);hud();res(log)};
  const draw=()=>{panelKind='shop';const L=tab==='buy'?list:sellable();sel=clamp(sel,0,Math.max(0,L.length-1));const k=L[sel],it=k&&ITEMS[k],own=k?S.bag[k]||0:0;
    const unit=k?(tab==='buy'?it.price:sp(k)):0,st=k&&stackable(k);
    const maxQ=!k?1:tab==='buy'?(st?Math.max(1,Math.min(20,Math.floor(S.silver/unit))):1):own;qty=clamp(qty,1,Math.max(1,maxQ));const tot=unit*qty;
    const why=!k?'':tab==='buy'?(it.key&&own?'此物你已经有了':S.silver<tot?`铜钱不足（还差 ${tot-S.silver} 文）`:''):'';
    const eqd=k&&(S.weapon===k||S.armor===k);
    const row=(k2,i)=>{const i2=ITEMS[k2],o=S.bag[k2]||0,pr=tab==='buy'?i2.price:sp(k2),poor=tab==='buy'&&(S.silver<pr||(i2.key&&o));
      return`<button class="srow${i===sel?' on':''}${poor?' poor':''}" data-i="${i}">${ico(k2)}<span class="nm">${i2.name}<small>${KINDN(i2)}</small></span><span class="own">${o?(tab==='buy'?'持 ':'×')+o:''}</span><span class="pr">${pr}<small>两</small></span></button>`};
    const det=!k?`<div class="empty">${tab==='buy'?'货已售罄':'行囊里没有可卖的东西'}</div>`:`
      <div class="dh">${ico(k).replace('class="ico','class="ico big')}<div><div class="dn">${it.name}</div><div class="dk">${KINDN(it)}　持有 ${own}${eqd?'　<span class="jade">已装备</span>':''}</div></div></div>
      <p class="dd">${it.desc}</p>
      <div class="stats">${statRows(k).map(([a,b,c,e])=>`<div><span class="k">${a}</span><b>${b}</b>${dlt(c)}<span class="cmp">${e}</span></div>`).join('')}</div>
      <div class="deal">${st&&maxQ>1?`<div class="qty"><span class="k">数量</span><button id="qm" aria-label="减一" ${qty<=1?'disabled':''}>－</button><b>${qty}</b><button id="qp" aria-label="加一" ${qty>=maxQ?'disabled':''}>＋</button><button id="qx" class="mx">最多</button></div>`:''}
        <div class="tot">${tab==='buy'?'共需':'可得'} <b>${tot}</b> 两<span class="muted">　${tab==='buy'?'单价 '+unit:'收价 '+unit+'（半价）'}</span></div>
        ${fresh===k&&tab==='buy'&&(it.weapon||it.armor)&&S.bag[k]&&statRows(k)[0][2]>0?`<button id="seq" class="pri">当场${it.weapon?'佩上':'穿上'}</button>`:''}
        ${conf?`<div class="cf">${tab==='buy'?'花':'换'} <b>${tot}</b> 两，${tab==='buy'?'购入':'卖掉'}「${it.name}」${qty>1?' ×'+qty:''}？</div><div class="btns"><button id="sok" class="pri">确认</button><button id="sno">再想想</button></div>`
          :`<button id="sgo" class="pri" ${why?'disabled':''}>${tab==='buy'?'买 下':'卖 出'}</button>`}
        ${why?`<div class="why">${why}</div>`:''}</div>`;
    p.innerHTML=`<div class="topbar frame"><span class="orn"></span>${esc(n.name)} · 铁器铺<span class="sub">铜钱 <b class="coin"><i class="cn"></i>${S.silver}</b>${flash?`<em class="fly${flash>0?' plus':''}">${flash>0?'+':'−'}${Math.abs(flash)}</em>`:''}</span></div>
      <div class="tabs"><button data-tab="buy" class="${tab==='buy'?'on':''}"><span class="ic">买</span>买入</button><button data-tab="sell" class="${tab==='sell'?'on':''}"><span class="ic">卖</span>卖出</button><span class="sp"></span><button id="pc"><span class="ic">✕</span>离开</button></div>
      <div class="shopw"><div class="slist frame">${L.length?L.map(row).join(''):`<div class="empty">${tab==='buy'?'':'无可卖之物'}</div>`}</div><div class="sdet frame">${det}</div></div>`;
    flash=0;panelRedraw=draw;
    p.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;sel=0;qty=1;conf=false;draw()});
    p.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{if(sel!==+b.dataset.i){sel=+b.dataset.i;qty=1;conf=false;draw()}});
    const on=(id,f)=>{const b=p.querySelector('#'+id);if(b)b.onclick=f};
    on('qm',()=>{qty--;conf=false;draw()});on('qp',()=>{qty++;conf=false;draw()});on('qx',()=>{qty=99;conf=false;draw()});
    on('sgo',()=>{conf=true;draw();p.querySelector('#sok')?.focus()});on('sno',()=>{conf=false;draw()});
    on('seq',()=>{equipItem(k);fresh=null;draw();toast(`${it.weapon?'佩上':'穿上'} ${it.name}`,900)});
    on('sok',()=>{conf=false;if(tab==='buy'){if(S.silver<tot)return;S.silver-=tot;S.bag[k]=(S.bag[k]||0)+qty;log.bought.push(k);log.spent+=tot;flash=-tot;fresh=k;toast(`购得 ${it.name}${qty>1?' ×'+qty:''}`,900)}
      else{S.bag[k]-=qty;S.silver+=tot;log.sold.push(k);log.earned+=tot;flash=tot;toast(`卖出 ${it.name}${qty>1?' ×'+qty:''} · 得 ${tot} 文`,1000)}qty=1;draw()});
    on('pc',closePanel)};draw()})}

// ───────────────────────── 街市小游戏：共用外壳（立绘 + 名牌 + 卷轴） ─────────────────────────
function gpShell(p,n,title,sub){return`<div class="gp-por"><img src="${assetImagePath('p_'+(n.sp.replace(/^c_/,'')))}" alt=""><div class="gp-tag frame">${esc(n.name)}</div></div>
  <div class="topbar frame"><span class="orn"></span>${title}<span class="sub">${sub||''}</span></div>`}
const seal=(s)=>`<span class="seal ${s}">${s==='ok'?'妙':s==='ng'?'拙':''}</span>`;

// 说书老伯：讲一段 → 问一题 → 评点；最后结算
function storyQuiz(n,Q,reward){return new Promise(res=>{const p=openPanel('gp shu');panelClose=null;let i=0,right=0,picked=null;const marks=[];
  const done=()=>{closePanel();hud();res(right)};
  const kd=e=>{if(dlgBusy||panelKind!=='quiz')return;const b=[...p.querySelectorAll('.qopt:not(:disabled)')];const m=+e.key;
    if(m>=1&&m<=b.length){e.preventDefault();b[m-1].click()}else if(e.key==='Enter'||e.key===' '||e.key==='e'){const x=p.querySelector('#qn');if(x){e.preventDefault();x.click()}}};
  addEventListener('keydown',kd);
  const draw=()=>{panelKind='quiz';const q=Q[i];
    if(!q){const rw=reward(right);removeEventListener('keydown',kd);
      p.innerHTML=gpShell(p,n,'说书 · 散场',`答对 <b>${right}</b> / ${Q.length}`)+`<div class="gp-main frame"><div class="sum">
        <div class="marks">${marks.map(m=>seal(m)).join('')}</div><h2>${right===Q.length?'满堂彩！':right?'尚可，尚可':'回去多听书'}</h2>
        <p class="line">「${rw.line}」</p>${rw.items.length?`<div class="rw">${rw.items.map(t=>`<span>${t}</span>`).join('')}</div>`:'<p class="muted">这回没有赏赐</p>'}
        <button id="qn" class="pri">谢过老伯</button></div></div>`;p.querySelector('#qn').onclick=done;p.querySelector('#qn').focus();return}
    const fb=picked==null?'':picked===q.a?`<div class="fb ok"><b>答对了！</b>${q.ok}</div>`:`<div class="fb ng"><b>不对。</b>正解是「${q.opts[q.a]}」——${q.ng}</div>`;
    p.innerHTML=gpShell(p,n,`说书 · 第${'一二三四五'[i]}回　${q.title}`,`<span class="marks sm">${Q.map((_,j)=>seal(marks[j]||(j===i?'cur':''))).join('')}</span>`)+
      `<div class="gp-main frame"><div class="story">${q.story.split('\n').map(s=>`<p>${s}</p>`).join('')}</div>
       <div class="ask"><span class="qk">问</span>${q.q}</div>
       <div class="qopts">${q.opts.map((o,j)=>`<button class="qopt${picked!=null?(j===q.a?' right':j===picked?' wrong':' dim'):''}" data-j="${j}" ${picked!=null?'disabled':''}><span class="n">${'甲乙丙'[j]}</span>${o}</button>`).join('')}</div>
       ${fb}${picked!=null?`<button id="qn" class="pri nx">${i+1<Q.length?'下一回 ▸':'听老伯收场 ▸'}</button>`:''}</div>`;
    p.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{picked=+b.dataset.j;const okk=picked===q.a;if(okk)right++;marks[i]=okk?'ok':'ng';draw()});
    const nx=p.querySelector('#qn');if(nx){nx.onclick=()=>{i++;picked=null;draw()};nx.focus()}else p.querySelector('.qopt')?.focus()};
  draw()})}

// 柳三娘对对子：右上联 · 左下联 · 中间三张候选
function coupletGame(n,list,reward){return new Promise(res=>{const p=openPanel('gp dui');panelClose=null;let i=0,right=0,picked=null,order=[0,1,2];const marks=[];
  const shuf=()=>{order=[0,1,2];for(let j=2;j>0;j--){const r=Math.floor(Math.random()*(j+1));[order[j],order[r]]=[order[r],order[j]]}};shuf();
  const done=()=>{closePanel();hud();res(right)};
  const kd=e=>{if(dlgBusy||panelKind!=='dui')return;const m=+e.key,b=[...p.querySelectorAll('.card:not(:disabled)')];
    if(m>=1&&m<=b.length){e.preventDefault();b[m-1].click()}else if(e.key==='Enter'||e.key===' '||e.key==='e'){const x=p.querySelector('#dn');if(x){e.preventDefault();x.click()}}};
  addEventListener('keydown',kd);
  const V=t=>t.split('').map(c=>`<i>${c}</i>`).join('');
  const draw=()=>{panelKind='dui';const c=list[i];
    if(!c){const rw=reward(right);removeEventListener('keydown',kd);
      p.innerHTML=gpShell(p,n,'对对子 · 收笔',`对上 <b>${right}</b> / ${list.length} 副`)+`<div class="gp-main frame"><div class="sum">
        <div class="marks">${marks.map(m=>seal(m)).join('')}</div><h2>${right===list.length?'才子！':right>=list.length-1?'好文采':'火候未到'}</h2>
        <p class="line">「${rw.line}」</p>${rw.items.length?`<div class="rw">${rw.items.map(t=>`<span>${t}</span>`).join('')}</div>`:''}
        <button id="dn" class="pri">多谢三娘</button></div></div>`;p.querySelector('#dn').onclick=done;p.querySelector('#dn').focus();return}
    const[up,...opts]=c,ok=picked!=null&&order[picked]===0,got=picked==null?'':ok?opts[0]:opts[0];
    p.innerHTML=gpShell(p,n,`对对子 · 第${'一二三四五六'[i]}副`,`<span class="marks sm">${list.map((_,j)=>seal(marks[j]||(j===i?'cur':''))).join('')}</span>`)+
      `<div class="gp-main frame"><div class="duiw">
        <div class="scroll lo${picked!=null?(ok?' win':' miss'):''}"><span class="lb">下联</span><div class="v">${picked!=null?V(got):V('　'.repeat(up.length)).replace(/<i>　<\/i>/g,'<i class="ph">　</i>')}</div></div>
        <div class="cards">${order.map((o,j)=>`<button class="card${picked!=null?(o===0?' right':j===picked?' wrong':' dim'):''}" data-j="${j}" ${picked!=null?'disabled':''}><span class="n">${j+1}</span><span class="v">${V(opts[o])}</span></button>`).join('')}</div>
        <div class="scroll up"><span class="lb">上联</span><div class="v">${V(up)}</div></div></div>
        <div class="dfoot">${picked==null?'<span class="muted">三娘出了上联，选一张下联对上。</span>':ok?`<span class="fb ok"><b>妙对！</b>${esc(c[4]||'字字相对，平仄也工整。')}</span>`:`<span class="fb ng"><b>不工。</b>三娘的下联是「${opts[0]}」。</span>`}
        ${picked!=null?`<button id="dn" class="pri">${i+1<list.length?'下一副 ▸':'收笔 ▸'}</button>`:''}</div></div>`;
    if(ok){const s=p.querySelector('.scroll.lo');s.insertAdjacentHTML('beforeend','<span class="stamp">妙</span>')}
    p.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{picked=+b.dataset.j;const okk=order[picked]===0;if(okk)right++;marks[i]=okk?'ok':'ng';draw()});
    const nx=p.querySelector('#dn');if(nx){nx.onclick=()=>{i++;picked=null;shuf();draw()};nx.focus()}else p.querySelector('.card')?.focus()};
  draw()})}

// 包打听：消息价目 + 江湖见闻簿（S.rumors 记已买）
function rumorBroker(n,R){return new Promise(res=>{const p=openPanel('gp bao');S.rumors=S.rumors||{};const got=[];let sel=R.findIndex(r=>!S.rumors[r.id]);if(sel<0)sel=0;let flash=0,newId=null;
  panelClose=()=>{hud();res(got)};
  const draw=()=>{panelKind='rumor';const r=R[sel];const known=R.filter(x=>S.rumors[x.id]);
    p.innerHTML=gpShell(p,n,'包打听 · 消息铺',`铜钱 <b class="coin"><i class="cn"></i>${S.silver}</b>${flash?`<em class="fly">−${flash}</em>`:''}`)+
      `<div class="gp-main frame"><div class="baow">
        <div class="menu"><h3>今日有售</h3>${R.map((x,j)=>{const k=S.rumors[x.id];return`<button class="rrow${j===sel?' on':''}${k?' known':''}" data-j="${j}"><span class="nm">${x.t}</span><span class="pr">${k?'已知':x.p+'<small>两</small>'}</span></button>`}).join('')}
          <div class="rbuy">${S.rumors[r.id]?`<span class="${r.id===newId?'jade':'muted'}">${r.id===newId?'已记入右侧「江湖见闻」。':'这条你已经听过了。'}</span>`:`<div class="hint2">${r.tease}</div><button id="rb" class="pri" ${S.silver<r.p?'disabled':''}>付 ${r.p} 文 · 打听</button>${S.silver<r.p?'<div class="why">铜钱不够</div>':''}`}</div></div>
        <div class="log"><h3>江湖见闻<small>${known.length}/${R.length}</small></h3>${known.length?known.map(x=>`<div class="note${x.id===newId?' new':''}"><div class="nt">${x.t}${x.tag?`<span class="tag">${x.tag}</span>`:''}</div><p>${x.txt}</p>${x.unlock?`<div class="ul">✦ ${x.unlock}</div>`:''}</div>`).join(''):'<div class="empty">尚未打听到任何消息</div>'}</div>
       </div></div><button id="pc" class="gp-close">离开</button>`;
    flash=0;panelRedraw=draw;
    p.querySelectorAll('[data-j]').forEach(b=>b.onclick=()=>{sel=+b.dataset.j;draw()});
    p.querySelector('#pc').onclick=closePanel;
    const b=p.querySelector('#rb');if(b)b.onclick=async()=>{if(S.silver<r.p)return;S.silver-=r.p;S.rumors[r.id]=1;got.push(r.id);flash=r.p;newId=r.id;r.on&&r.on();draw();
      p.querySelector('.note.new')?.scrollIntoView({block:'nearest'})}};
  draw()})}

// ───────────────────────── 江湖菜单（属性 / 武学 / 行囊 / 装备）─────────────────────────
const TABS=[['quest','任务','志'],['attr','属性','人'],['skill','武学','武'],['bag','行囊','囊'],['equip','装备','装'],['party','同伴','伴']];
let menuTab='attr';
function bagPanel(tab){if(tab)menuTab=tab;else if(S.pts)menuTab='attr';const p=openPanel();panelClose=()=>hud();
  const draw=()=>{const d=derived();panelKind='menu';
    p.innerHTML=`<div class="topbar frame"><span class="orn"></span>江湖 · ${TABS.find(t=>t[0]===menuTab)[1]}<span class="sub">铜钱 <b>${S.silver}</b>　道德 <b>${S.moral}</b></span></div>
    <div class="tabs">${TABS.map(([k,n,i])=>`<button data-t="${k}" class="${menuTab===k?'on':''}"><span class="ic">${i}</span>${n}${k==='attr'&&S.pts?' <span style="color:var(--red)">●</span>':''}</button>`).join('')}<span class="sp"></span><button id="pc"><span class="ic">✕</span>返回</button></div>
    <div class="pbody frame">${TAB[menuTab](d)}</div>`;
    panelRedraw=draw;p.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{menuTab=b.dataset.t;draw()});
    p.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{S.st[b.dataset.s]++;S.pts--;draw()});
    p.querySelectorAll('[data-x]').forEach(b=>b.onclick=()=>{const s=b.dataset.x;if(S[s]){S.bag[S[s]]=(S.bag[S[s]]||0)+1;S[s]=null;draw()}});
    p.querySelectorAll('[data-u]').forEach(b=>b.onclick=async()=>{const k=b.dataset.u,it=ITEMS[k];
      if(it.weapon){if(S.weapon)S.bag[S.weapon]=(S.bag[S.weapon]||0)+1;S.weapon=k;S.bag[k]--;toast(`装备 ${it.name}`,900)}
      else if(it.armor){if(S.armor)S.bag[S.armor]=(S.bag[S.armor]||0)+1;S.armor=k;S.bag[k]--;toast(`装备 ${it.name}`,900)}
      else if(it.book){const opts=Object.keys(S.skills).filter(s=>s!=='fist');if(!opts.length){toast('尚无可参悟的武学',1000);return}p.hidden=true;const c=await choose('','参悟哪门武学？',opts.map(s=>`${SKILLS[s].name}（${S.skills[s]} 重）`));S.skills[opts[c]]++;S.bag[k]--;await toast(`「${SKILLS[opts[c]].name}」精进至 ${S.skills[opts[c]]} 重`);p.hidden=false}
      else if(it.gall){S.mpBonus+=30;S.bag[k]--;toast('内力上限 +30',1000)}
      else{S.bag[k]--;const d=derived();if(it.heal)S.hp=Math.min(d.mhp,S.hp+it.heal);if(it.mp)S.mp=Math.min(d.mmp,S.mp+it.mp);toast(`服下 ${it.name}`,900)}
      draw()});
    $('pc').onclick=closePanel};draw()}
const TAB={
  attr:d=>`<div class="attr"><div class="hero"><img src="assets/production/portraits/p_hero.webp" alt=""><div class="foot"><div class="nm">${esc(S.name)}</div><div class="or">${ORIGINS[S.origin].name} · 等级 ${S.lv}</div>
    <div class="bars">${bar('气血',S.hp,d.mhp)}${bar('内力',S.mp,d.mmp,'mp')}${(S.lv>=100?'<div class="exp-cap">已满级 · 100级</div>':bar('修为',S.exp,S.lv*100,'xp'))}</div></div></div>
   <div><h3>根基${S.pts?`<span class="jade" style="letter-spacing:.05em">可分配 ${S.pts} 点</span>`:''}</h3>
    <div class="kv">${Object.keys(STATN).map(k=>`<div title="${STATD[k]}"><span class="k">${STATN[k]}</span><span><b>${S.st[k]}</b>${S.pts?`<button data-s="${k}" aria-label="${STATN[k]}加一">＋</button>`:''}</span></div>`).join('')}<div><span class="k">道德</span><b>${S.moral}</b></div></div>
    <h3>战斗</h3><div class="kv"><div><span class="k">攻击</span><b>${d.atk}</b></div><div><span class="k">防御</span><b>${d.def}</b></div><div><span class="k">暴击</span><b>${d.crit}%</b></div><div><span class="k">闪避</span><b>${d.dodge}%</b></div><div><span class="k">身速</span><b>${d.spd}</b></div><div><span class="k">移动</span><b>${d.move}</b></div></div>
    <p class="muted" style="font-size:.8em;margin-top:.8em;line-height:1.7">${Object.keys(STATN).map(k=>`<span class="nw">${STATN[k]}：${STATD[k]}</span>`).join(' ')}</p></div></div>`,
  skill:()=>`<div class="list">${Object.entries(S.skills).map(([k,l])=>{const s=SKILLS[k];return`<div class="item">${icoHTML(s.kind,s.kind)}<div><div class="nm">${s.name}<small>${l} 重</small></div><div class="ds">${s.desc||''}</div></div>
    <div class="rt muted" style="font-size:.82em">${s.mp?`内力 ${s.mp}`:'无耗'}　·　${s.range?`距离 ${s.range}`:'自身'}${s.needWeapon?`　·　需${s.needWeapon}`:''}</div></div>`}).join('')}</div>`,
  bag:()=>{const e=Object.entries(S.bag).filter(([,n])=>n>0);return e.length?`<div class="list">${e.map(([k,n])=>{const it=ITEMS[k];return`<div class="item">${ico(k)}<div><div class="nm">${it.name}<small>×${n}</small></div><div class="ds">${it.desc}</div></div>
    <div class="rt">${it.key?'<span class="muted" style="font-size:.8em">要物</span>':`<button data-u="${k}">${it.weapon||it.armor?'装备':'使用'}</button>`}</div></div>`}).join('')}</div>`:'<div class="empty">行囊空空如也</div>'},
  equip:d=>{const sl=[['weapon','兵器','刃'],['armor','护甲','甲']];const cand=Object.entries(S.bag).filter(([k,n])=>n>0&&(ITEMS[k].weapon||ITEMS[k].armor));
    return`<h3 style="margin-top:0">当前装备</h3><div class="list">${sl.map(([s,n,i])=>{const k=S[s];return`<div class="item">${k?ico(k):`<div class="ico">${i}</div>`}<div><div class="nm">${k?ITEMS[k].name:'<span class="muted">未装备</span>'}<small>${n}</small></div><div class="ds">${k?ITEMS[k].desc:'—'}</div></div><div class="rt">${k?`<button data-x="${s}">卸下</button>`:''}</div></div>`}).join('')}</div>
    <h3>可换装备</h3>${cand.length?`<div class="list">${cand.map(([k,n])=>`<div class="item">${ico(k)}<div><div class="nm">${ITEMS[k].name}<small>×${n}</small></div><div class="ds">${ITEMS[k].desc}</div></div><div class="rt"><button data-u="${k}">装备</button></div></div>`).join('')}</div>`:'<div class="empty" style="padding:1em">行囊中暂无可换装备</div>'}
    <p class="muted" style="font-size:.85em">攻击 <span class="gold">${d.atk}</span>　防御 <span class="gold">${d.def}</span>　暴击 <span class="gold">${d.crit}%</span></p>`},
  party:()=>`<div class="list"><div class="item"><div class="ico">侠</div><div><div class="nm">${esc(S.name)}<small>Lv ${S.lv}</small></div><div class="ds">${ORIGINS[S.origin].desc}</div></div><div class="rt muted" style="font-size:.85em">主角</div></div>
    ${S.party.includes('ye')?`<div class="item comp"><img class="por" src="${assetImagePath('p_ye')}" alt=""><div><div class="nm">叶蘅<small>Lv ${S.lv} · 乡村医者</small></div><div class="ds">与萧白同行赴汉皋。善辨脉象、用针护人；自己的去向由她决定。</div></div><div class="rt muted" style="font-size:.85em">同伴</div></div>`:''}
    ${S.party.includes('suzhi')?suzhiCard():''}
    ${S.pet==='dog'?`<div class="item"><div class="ico">犬</div><div><div class="nm">${DOG.name}<small>Lv ${S.lv}</small></div><div class="ds">自动参战；主角气血偏低时护主，危急时舔舐疗伤。</div></div><div class="rt muted" style="font-size:.85em">宠物</div></div>`:''}</div>
    ${S.party.length?'':'<div class="empty" style="padding:1em">江湖路远，尚无同行之人</div>'}`,
  quest:()=>{const q=window.questLog?questLog():[];return q.length?`<div class="list qlog">${q.map(e=>`<div class="item${e.done?' done':''}"><div class="ico">${e.done?'✔':'！'}</div><div><div class="nm">${esc(e.t)}<small>${e.done?'已完成':'进行中'}</small></div><div class="ds">${e.d}</div></div></div>`).join('')}</div>`:'<div class="empty">尚无要事</div>'}};
function suzhiCard(){const a=(S.aff&&S.aff.suzhi)||0,x=+(S.flags.xq||0);
  const bio=['游方医师，素衣布履，话极少，手极稳。']
  if(x>=3)bio.push('她认得「青蚨散」的气味，说那是她「以前」师门的东西。');
  if(S.flags.sz_white)bio.push('针包里的金针，针尾都刻着一只振翅的白鸟。');
  if(S.flags.chief_dead)bio.push('黑风寨覆灭那夜，她在洞口站了很久，什么也没说。');
  const lv=a>=8?'知己':a>=5?'信赖':a>=2?'熟络':a>=0?'生疏':'冷淡',ph=(typeof ok==='function'&&ok(IMG.p_suzhi))?'<img class="por" src="assets/production/portraits/p_suzhi.webp" alt="">':'<div class="ico">医</div>';
  return`<div class="item comp">${ph}<div><div class="nm">苏芷<small>Lv ${S.lv} · 医师</small></div><div class="ds">${bio.join('<br>')}</div>
    <div class="aff"><span class="muted">好感</span><span class="hearts">${'♥'.repeat(clamp(Math.ceil(a/2),0,10))}<i>${'♡'.repeat(10-clamp(Math.ceil(a/2),0,10))}</i></span><span class="muted">${lv} · ${a}</span></div></div><div class="rt muted" style="font-size:.85em">同伴</div></div>`}

// ───────────────────────── HUD：左上地名 + 右上「江湖」 ─────────────────────────
function hud(){const h=$('hud');if(mode!=='scene'){h.hidden=true;return}h.hidden=false;
  const ql=window.questLine?questLine():'';h.innerHTML=`<div class="loc">${esc(cur?.name||'')}${ql?`<div class="quest"><span>◆</span>${esc(ql)}</div>`:''}</div><button class="menu frame" id="hb" aria-label="打开江湖菜单"><span class="orn"></span>江湖${S.pts?'<span class="dot"></span>':''}</button>`;
  $('hb').onclick=()=>{if(!dlgBusy&&!busy&&$('panel').hidden)bagPanel()}}

// ───────────────────────── 开场（旧标题与建角已于 2026-10-19 随襄阳演示归档；首页见 qihe-startup.js）─────────────────────────
let mode='title';
function resetPanel(){const p=$('panel');p.className='ui panel';p.style.background='';p.style.border=''}
