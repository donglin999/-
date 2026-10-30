'use strict';
// 门派关系与声誉：「关系」页第三版渲染（faction-reputation.md 第 9 节，评审图 xiaojianghu/review/faction-reputation/01*.png）
// 2026-10-27 整改：声誉秤杆按容器百分比画、恶左侠右、标记与刻度同一套换算；空状态；成员头像与“见过”判定；村镇称呼。
(()=>{
 if(typeof isQiheEntry!=='function'||!isQiheEntry())return;
 const D=window.QiheJianghuData,J=window.QiheJianghu;if(!D||!J)return;
 const h=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const sg=v=>v>0?'+'+v:v<0?'−'+Math.abs(v):String(v);
 const tc=k=>`var(--qjr-${k})`;
 const part=()=>S?.prologue?.part||S?.part||'kaishi';
 const people=()=>window.QIHE_NPC_DATA?.PEOPLE||{};
 const ui={closed:{},logAll:false};   // 页内状态（折叠的门类、近事展开）；选中的势力仍记在江湖菜单的 s.repSel
 const pct=n=>Math.round(n*1000)/1000+'%';

 // ───── 声誉秤杆：七段等宽，从左（恶名昭著）到右（侠名远扬）；刻度、段名、标记、上下限都走 famePos ─────
 const FAME_ASC=()=>D.FAME_STAGES.slice().sort((a,b)=>a.min-b.min).map((z,k,arr)=>({...z,lo:z.min,hi:k<arr.length-1?arr[k+1].min-1:100}));
 // 分数 → 0～100 的位置；edge='lo'／'hi' 取这一分所在格子的左缘／右缘（画上下限用），否则取格子中点
 function famePos(v,edge){const A=FAME_ASC(),n=A.length,k=Math.max(0,A.findIndex(z=>v>=z.lo&&v<=z.hi)),z=A[k],span=z.hi-z.lo+1,off=edge==='lo'?0:edge==='hi'?1:.5;return (k+(v-z.lo+off)/span)/n*100}
 function fameBar(score,lock){const A=FAME_ASC(),n=A.length,cur=A.find(z=>score>=z.lo&&score<=z.hi)||A[0];
  let s=`<div class="qjr-fhead"><div class="qjr-seal qjr-seal-red"><span>名</span></div><div class="qjr-flab"><small>声誉 · 江湖人称</small><b>${h(cur.name)}<em>${sg(score)}</em></b></div></div>`;
  s+=`<div class="qjr-fwrap"><div class="qjr-seal qjr-seal-sm qjr-seal-ink"><span>恶</span></div><div class="qjr-fscale"><div class="qjr-rod"></div>`;
  for(let k=1;k<n;k++)s+=`<i class="qjr-tick" style="left:${pct(k/n*100)}"></i>`;
  A.forEach((z,k)=>s+=`<span class="qjr-seg${z.id===cur.id?' qjr-cur':''}" style="left:${pct((k+.5)/n*100)}">${h(z.name)}</span>`);
  if(lock){const L=D.PART_LIMITS[lock]?.fame;if(L){const a=famePos(L[0],'lo'),b=famePos(L[1],'hi');
   if(a>0)s+=`<i class="qjr-fog" style="left:0;width:${pct(a)}"></i><span class="qjr-lim qjr-lim-l" style="left:${pct(a)}">◂ 开始部分到此</span>`;
   if(b<100)s+=`<i class="qjr-fog" style="left:${pct(b)};right:0"></i><span class="qjr-lim qjr-lim-r" style="left:${pct(b)}">到此 ▸</span>`}}
  s+=`<i class="qjr-mk" style="left:${pct(famePos(score))}" title="${h(cur.name)} ${sg(score)}"></i></div><div class="qjr-seal qjr-seal-sm qjr-seal-red"><span>侠</span></div></div>`;
  s+=`<p class="qjr-fnote">声誉只记被人看见的事；门派、村镇各记各的账。</p>`;return s}

 // ───── 势力行的细墨线：中线是 0，往右朱、往左墨；开始部分上下限画虚线 ─────
 function rbar(v,lock){const p=x=>50+x/2,fl=v>=0?`left:50%;width:${v/2}%`:`left:${p(v)}%;width:${-v/2}%`;let s=`<div class="qjr-rbar"><i class="qjr-fill ${v>=0?'qjr-up':'qjr-down'}" style="${fl}"></i><i class="qjr-z"></i>`;if(lock){const L=D.PART_LIMITS[lock]?.faction;if(L)s+=`<i class="qjr-lk" style="left:${p(L[0])}%"></i><i class="qjr-lk" style="left:${p(L[1])}%"></i>`}return s+'</div>'}

 function groups(){const j=J.ensure(),list=Object.entries(D.FACTIONS).filter(([id])=>j.faction[id]?.met).map(([id,def])=>{const st=J.stage(id);return{id,n:def.name,g:def.glyph,c:def.color,v:st.score,t:st.name,tk:st.id,grp:def.group,tag:def.tag,sub:def.sub,pin:def.pin}});
  list.sort((a,b)=>(b.pin?1:0)-(a.pin?1:0)||b.v-a.v);
  const closed=ui.closed;return['sect','town','guan','other'].map(k=>({k,n:D.GROUP_NAME?.[k]||k,open:!closed[k],items:list.filter(x=>x.grp===k)}))}

 // ───── 见过谁：只读现成记录，不新造存档字段 ─────
 // 同伴（S.party／S.qiheRoster）；行记的相识表 QiheJournal.knowledge(S).met（按主线事件、问候、跑腿推出，id 用行记 CAST 的叫法）；
 // 有过往来：S.qiheBond 分数不为 0、收过礼、解锁过；切磋、请教（S.qiheNpc）；送礼（S.qiheGift）；地图小事（S.qiheTown 断扁担、酒钱）
 const JOURNAL_ID={innkeeper:'merchant',aide:'procurement_aide',guanshi:'steward',caibanshi:'procurement'};
 function metCtx(){let jm={};try{jm=window.QiheJournal?.knowledge?.(S)?.met||{}}catch(e){}return{jm}}
 function metOf(id,ctx=metCtx()){
  if((S.party||[]).includes(id)||(S.qiheRoster?.members||[]).includes(id))return true;
  if(ctx.jm[JOURNAL_ID[id]||id])return true;
  const b=S.qiheBond?.[id];if(b&&typeof b==='object'&&(b.score||b.gifts?.length||b.unlocked||b.bonus))return true;
  const n=S.qiheNpc;if(n?.spar?.[id]?.count||n?.spar?.[id]?.first||n?.teach?.[id])return true;
  const g=S.qiheGift;if(Object.keys(g?.given?.[id]||{}).length||Object.keys(g?.known?.[id]||{}).length||g?.returned?.[id])return true;
  const t=S.qiheTown;if(id==='peddler'&&t?.pole?.stage&&t.pole.stage!=='none'||id==='innkeeper'&&t?.tab?.stage&&t.tab.stage!=='none')return true;
  return !!(S.encounteredNpcs?.includes?.(id)||S.qiheEncountered?.[id]);
 }
 // 个人关系档位：用赠礼稿的个人关系轴（QIHE_NPC_DATA.BOND.stages，从高到低排），不用门派档位表
 const BOND_KEY={托付:'tuo',信赖:'xin',熟络:'shu',初识:'chu',冷淡:'leng',厌恶:'yan',仇视:'chou'};
 const BOND_FALLBACK=[{min:80,name:'托付'},{min:50,name:'信赖'},{min:20,name:'熟络'},{min:0,name:'初识'},{min:-19,name:'冷淡'},{min:-49,name:'厌恶'},{min:-100,name:'仇视'}];
 function memberStage(v){const T=(window.QIHE_NPC_DATA?.BOND?.stages||BOND_FALLBACK).slice().sort((a,b)=>b.min-a.min),st=T.find(s=>v>=s.min)||T[T.length-1];return{n:st.name,k:BOND_KEY[st.name]||'chu'}}
 const revealed=()=>!!S.flags?.jianghuLinguanshiRevealed;
 function members(fid){const ctx=metCtx(),grp=D.FACTIONS[fid]?.group||'sect',RN=D.RANK_NAME?.[grp]||D.RANK_NAME?.sect||{};
  return Object.entries(D.MEMBERS).filter(([,def])=>(def.faction===fid||def.shownIn===fid)&&(!def.hidden||revealed())).map(([id,def])=>{
   const P=people()[id]||{},isBoss=D.FACTIONS[fid]?.boss===id,v=(x=>Number(typeof x==='object'?x?.score:x)||0)(S.bond?.[id]??S.qiheBond?.[id]),st=memberStage(v);
   const rank=def.title||RN[def.rank]||'',role=P.disguised&&def.hidden&&!revealed()?'':P.role||'';
   return{id,n:P.name||({guanshi:'管事',wukui:'乌魁',caibanshi:'采办使'})[id]||id,r:[rank,role].filter(Boolean).join(' · '),v,st:st.n,stk:st.k,boss:isBoss,met:metOf(id,ctx),por:P.portrait||null}})}

 // ───── 头像：有高清立绘的裁脸（hydrate 里按立绘实际头顶位置校准），没有的用像素小人，再没有用姓氏印 ─────
 const SPRITE_NAME={guanshi:'管事',wukui:'乌魁',caibanshi:'采办使'};
 function spriteOf(id,name){try{return window.OpeningCharacters?.dialogueSprite?.(SPRITE_NAME[id]||name,'',null)||null}catch(e){return null}}
 const miniCache=new Map();
 function avatar(m){
  if(m.por){const src=typeof assetImagePath==='function'?assetImagePath(m.por):'assets/production/portraits/'+m.por+'.webp';
   return `<div class="qjr-av qjr-av-por" data-por="${h(src)}" style="background-image:url('${h(src)}')"></div>`}
  const sp=spriteOf(m.id,m.n);if(sp&&typeof miniSprite==='function'){let url=miniCache.get(sp);if(!url){try{const c=miniSprite(sp);url=c?c.toDataURL():''}catch(e){url=''}if(url)miniCache.set(sp,url)}
   if(url)return `<div class="qjr-av qjr-av-px"><img alt="" src="${url}"></div>`}
  return `<div class="qjr-av qjr-av-seal"><span>${h(m.n[0])}</span></div>`}
 // 立绘都是 960×1280、眼到下巴已归一（R-画风-03），只是人站的位置、头顶高低不同：按 alpha 找头顶和头部中线，取头顶下方一块方形
 const cropCache=new Map();
 function faceCrop(src){if(cropCache.has(src))return cropCache.get(src);const pr=new Promise(res=>{const im=new Image();im.onload=()=>{try{const W=120,H=160,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(im,0,0,W,H);const d=x.getImageData(0,0,W,H).data,op=(i,j)=>d[(j*W+i)*4+3]>110;
    let top=0;for(let j=0;j<H;j++){let n=0;for(let i=0;i<W;i++)if(op(i,j))n++;if(n>=3){top=j;break}}
    const xs=[];for(let j=top;j<Math.min(H,top+22);j++)for(let i=0;i<W;i++)if(op(i,j))xs.push(i);xs.sort((a,b)=>a-b);
    const cx=(xs.length?xs[xs.length>>1]:W/2)/W,cy=(top+24)/H;res({cx,cy})}catch(e){res(null)}};im.onerror=()=>res(null);im.src=src});cropCache.set(src,pr);return pr}
 function placeFace(el,f){const box=el.clientWidth||56,win=400,s=box/win,W=960*s,H=1280*s,cx=(f?.cx??.5)*W,cy=(f?.cy??.2)*H;el.style.backgroundSize=`${W}px ${H}px`;el.style.backgroundPosition=`${box/2-cx}px ${box/2-cy}px`}
 function hydrate(){document.querySelectorAll('.qjr-av-por[data-por]').forEach(el=>{placeFace(el,null);faceCrop(el.dataset.por).then(f=>{if(f&&el.isConnected)placeFace(el,f)})})}

 function plist(gs,sel,lock){let s='';gs.forEach(g=>{s+=`<div class="qjr-grp" data-qjr="group" data-id="${g.k}"><span class="qjr-pm"><i>${g.open?'−':'+'}</i></span><b>${h(g.n)}</b><span class="qjr-gn">${g.items.length}</span>${g.items.length?'':`<small class="qjr-gnote">${g.k==='other'?'帮会、山寨、江湖散人（尚无）':'尚无'}</small>`}</div>`;if(!g.open)return;g.items.forEach(f=>{s+=`<div class="qjr-row ${f.id===sel?'qjr-sel':''}" data-qjr="faction" data-id="${f.id}"><div class="qjr-seal qjr-seal-row" style="--fc:${f.c}"><span>${h(f.g)}</span></div><div class="qjr-nm"><div class="qjr-l1"><b>${h(f.n)}</b>${f.pin?'<span class="qjr-tg qjr-ben">本门</span>':f.tag?`<small class="qjr-sub">${h(f.tag)}</small>`:''}<span class="qjr-tier" style="color:${tc(f.tk)}">${h(f.t)}<em>（${sg(f.v)}）</em></span></div>${rbar(f.v,lock)}</div></div>`})});return s}
 function jumps(gs){const all=gs.reduce((a,g)=>a+g.items.length,0);return `<div class="qjr-jumps">${gs.map(g=>`<button type="button" class="qjr-jump${g.items.length?'':' qjr-off'}" data-qjr="jump" data-id="${g.k}" ${g.items.length?'':'disabled'}>${h(g.n)} <em>${g.items.length}</em></button>`).join('')}<span class="qjr-total">共 ${all} 方</span></div>`}
 function mcards(list){const seen=list.filter(m=>m.met),unk=list.length-seen.length;
  let s=seen.map(m=>`<div class="qjr-mc">${avatar(m)}<div class="qjr-mi"><b>${h(m.n)}</b><small>${h(m.r)}</small><span class="qjr-pt2" style="color:${tc(m.stk)}">${h(m.st)}<em>（${sg(m.v)}）</em></span></div>${m.boss?'<span class="qjr-boss">主事</span>':''}</div>`).join('');
  if(unk)s+=`<div class="qjr-mc qjr-unk"><div class="qjr-av qjr-av-unk"><span>？</span></div><div class="qjr-mi"><b>另有 ${unk} 人</b><small>还未相识</small></div></div>`;
  return s||'<div class="qjr-empty qjr-empty-sm">还没有见过这里的人</div>'}
 // 「眼下／再升／再落」三句：从档位效果表 GATE 生成，不写剧情文字
 function gateText(id,grp){const g=D.GATE[id]||{},who=grp==='town'?'乡里人':grp==='guan'?'公人':'门人',out=[];
  if(g.trade)out.push(`${who}不肯交易、请教、切磋、托事`);
  if(g.priceMul)out.push(g.priceMul>1?`买卖贵一成`:`买卖${({0.9:'九折',0.85:'八五折'})[g.priceMul]||Math.round(g.priceMul*100)+'%'}`);
  if(g.firstMeet)out.push(`${who}初见 ${sg(g.firstMeet)}`);
  return out.length?out.join('，')+'。':`${who}初见照常，买卖原价。`}
 function outlook(fid,st,lock){const grp=D.FACTIONS[fid].group,i=D.STAGES.findIndex(z=>z.id===st.id),up=D.STAGES[i-1],dn=D.STAGES[i+1],L=lock?D.PART_LIMITS[lock]?.faction:null;
  let s=`<div class="qjr-ol"><span class="qjr-olk">眼下</span><span>${h(gateText(st.id,grp))}</span></div>`;
  if(up){const capped=L&&up.min>L[1];s+=`<div class="qjr-ol"><span class="qjr-olk">再升</span><span>到「${h(up.name)}」（${sg(up.min)}）：${h(gateText(up.id,grp))}${capped?`<em>开始部分最高到 ${sg(L[1])}，这一档要到培养才开。</em>`:''}</span></div>`}
  if(dn){const floor=Math.max(L?L[0]:-100,D.FACTIONS[fid].floor??-100),dmax=st.score>=0&&st.id==='chu'?-1:(D.STAGES[i]?.min??0)-1;s+=`<div class="qjr-ol"><span class="qjr-olk qjr-olk-dn">再落</span><span>到「${h(dn.name)}」（${sg(dmax)}）：${h(gateText(dn.id,grp))}${dmax<floor?`<em>开始部分最低到 ${sg(floor)}，落不到这一档。</em>`:''}</span></div>`}
  return s}
 function recent(){const all=J.ensure().log.slice().reverse(),n=ui.logAll?8:2,log=all.slice(0,n);if(!log.length)return'<span class="qjr-none">尚无近事</span>';return log.map(x=>{const nm=x.kind==='fame'?'声誉':D.FACTIONS[x.id]?.name||'关系';return `<span class="qjr-log"><b>${h(nm)} ${sg(x.delta)}</b> ${h(D.REASON_TEXT?.[x.reason]||'其他')}</span>`}).join('')+(all.length>2?`<button type="button" class="qjr-more" data-qjr="log">${ui.logAll?'收起':'…全部'}</button>`:'')}
 function render(sel){const fl=J.fameLevel(),gs=groups(),lock=part()==='kaishi'?'kaishi':null,met=gs.flatMap(g=>g.items);
  if(!sel||!met.some(f=>f.id===sel))sel=(gs.find(g=>g.open&&g.items.length)||gs.find(g=>g.items.length))?.items[0]?.id||null;   // 默认选第一个势力（9.3）
  let s=`<section class="qjr-rep"><div class="qjr-fame">${fameBar(fl.score,lock)}</div><aside class="qjr-aside"><div class="qjr-ah"><b>势力</b><small>见过才列出 · 组内按关系高低</small></div>`;
  s+=met.length?`${jumps(gs)}<div class="qjr-plist">${plist(gs,sel,lock)}</div>`:`<div class="qjr-plist qjr-plist-empty"><div class="qjr-ring"></div><p>还没有和哪一方打过交道。</p><small>在江湖上见过的门派、村镇、官府会列在这里；和其中的人往来、结怨，都会记到这一方头上。</small></div>`;
  s+=`</aside><main class="qjr-main">`;
  if(sel&&D.FACTIONS[sel]){const f=D.FACTIONS[sel],st=J.stage(sel),ms=members(sel),grp=D.GROUP_NAME?.[f.group]||'';
   s+=`<div class="qjr-title"><div class="qjr-seal qjr-seal-lg" style="--fc:${f.color}"><span>${h(f.glyph)}</span></div><div class="qjr-tt"><h2>${h(f.name)}</h2><small>${h([grp,f.tag,D.REGION_NAME?.[f.region]].filter(Boolean).join(' · '))}</small></div><div class="qjr-big" style="--tc:${tc(st.id)}"><b>${h(st.name)}</b><em>${sg(st.score)}</em></div></div>`;
   s+=`<div class="qjr-outlook">${outlook(sel,st,lock)}</div>`;
   s+=`<div class="qjr-mh"><b>${f.group==='town'?'村中人物':f.group==='guan'?'司中人物':'门中人物'}</b><small>各人和你的私交另算；只列见过的人</small></div><div class="qjr-members">${mcards(ms)}</div>`}
  else s+=`<div class="qjr-blank"><div class="qjr-ring"></div><p>选一方势力，看门中人物和你的关系</p></div>`;
  s+=`<div class="qjr-recent"><b>近事</b>${recent()}</div></main></section>`;
  setTimeout(hydrate,0);return s}
 function handleClick(e,state,draw){const b=e.target.closest('[data-qjr]');if(!b)return;const a=b.dataset.qjr,id=b.dataset.id;
  if(a==='faction')state.repSel=id;
  else if(a==='group')ui.closed[id]=!ui.closed[id];
  else if(a==='jump'){ui.closed[id]=false;const g=groups().find(x=>x.k===id);if(g?.items[0])state.repSel=g.items[0].id}
  else if(a==='log')ui.logAll=!ui.logAll;
  else return;draw()}
 window.QiheJianghuRepUI={render,handleClick,_test:{famePos,memberStage,metOf,members,gateText}};
})();
