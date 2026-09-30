'use strict';
const NPC_ART_ICON={
  inquire:'<path d="M7 7h18v13H14l-5 5v-5H7z"/><path d="M12 11h9m-9 5h6"/>',
  persuade:'<path d="M5 8h13v10H9l-4 4zm13 5h9v12l-5-3h-4"/><path d="M9 12h5m8 5h2"/>',
  steal:'<path d="M9 27V15c0-3 4-3 4 0v3-10c0-3 4-3 4 0v9-7c0-3 4-3 4 0v9-4c0-3 4-3 4 0v9l-5 5z"/>',
  inspect:'<circle cx="14" cy="13" r="8"/><path d="m20 20 7 7M11 10l5 6m0-6-5 6"/>',
  spar:'<path d="m5 7 20 20m2-20L7 27M3 13l10-10m6 26 10-10M3 25l4 4m18-26 4 4"/>'
};
function npcArtIcon(id){return `<svg viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${NPC_ART_ICON[id]||NPC_ART_ICON.inspect}</svg>`}
function npcArtDialog(title,body,rows,book=false,n=null){return new Promise(resolve=>{
  const prior=dlgBusy;dlgBusy=true;keys={};let settled=false;
  const el=document.createElement('section');el.id='npc-art-panel';el.className=book?'arts-book':'arts-actions';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label',title);
  el.innerHTML=`<header><b>${esc(title)}</b><button type="button" data-close aria-label="关闭江湖手段">×</button></header><div class="arts-body">${body}</div><div class="arts-options">${rows.map((r,i)=>`<button type="button" data-row="${i}" ${r.disabled?'disabled':''} title="${esc(r.why||r.desc||'')}">${r.icon?npcArtIcon(r.icon):'<span class="arts-letter">'+esc(r.letter||'·')+'</span>'}<span><b>${esc(r.label)}</b><small>${esc(r.why||r.desc||'')}</small>${r.progress!=null?'<i class="arts-progress"><em style="width:'+r.progress+'%"></em></i>':''}</span></button>`).join('')}</div><footer>↑↓ 选择 · Enter 确认 · Esc 告辞</footer>`;
  const finish=value=>{if(settled)return;settled=true;removeEventListener('keydown',key,true);el.remove();dlgBusy=prior;keys={};resolve(value)};
  const buttons=()=>[...el.querySelectorAll('.arts-options button:not(:disabled)')];
  const key=e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(['Escape','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter',' ','Tab'].includes(e.key)||/^\d$/.test(e.key)){
      e.preventDefault();e.stopImmediatePropagation();const list=buttons();let at=list.indexOf(document.activeElement);
      if(e.key==='Escape')finish(null);else if(e.key==='Enter'||e.key===' '){if(at<0)at=0;list[at]?.click()}
      else if(/^\d$/.test(e.key)){const btn=el.querySelector(`[data-row="${Number(e.key)-1}"]`);if(btn&&!btn.disabled)btn.click()}
      else if(list.length){const d=e.key==='ArrowUp'||e.key==='ArrowLeft'||e.key==='Tab'&&e.shiftKey?-1:1;list[(at+d+list.length)%list.length].focus()}
    }
  };
  el.querySelector('[data-close]').onclick=()=>finish(null);
  el.querySelectorAll('[data-row]').forEach(b=>b.onclick=()=>finish(rows[Number(b.dataset.row)].value));
  el.onpointerdown=e=>e.stopPropagation();el.onclick=e=>e.stopPropagation();$('game').appendChild(el);
  if(!book&&n){const scale=$('game').clientWidth/960,x=(n.x*TS-cam.x)*ZOOM,y=(n.y*TS-cam.y)*ZOOM;
    const left=clamp(x<480?x+45:x-355,8,640),top=clamp(y-180,10,Math.max(10,530-el.offsetHeight/scale));
    el.style.left=(left/960*100)+'%';el.style.top=(top/540*100)+'%'}
  addEventListener('keydown',key,true);buttons()[0]?.focus();
})}
function npcArtsOverlay(n,spec){const rec=NPCArts.rec(n),rows=[{label:'交谈 / 原有事件与服务',letter:'谈',desc:'保留人物的原有剧情、买卖和任务',value:{id:'original'}}];
  for(const id of NPCArts.ids(spec)){const lv=NPCArts.level(id),why=NPCArts.why(id,n,spec);let desc=NPC_ARTS[id].desc;
    if(id==='steal')desc=spec.practice?'仅取许青同意的空练习囊，无品德处罚':`持物 ${spec.stock.filter(x=>!rec.taken[x.item]).map(x=>ITEMS[x.item].name).join('、')||'无'} · 动手前确认风险`;
    if(id==='persuade')desc=spec.persuade.reason+' · 成功率 '+NPCArts.chance(id,n,spec)+'%';
    rows.push({label:NPC_ARTS[id].name+' · '+NPC_ART_LEVEL[lv],icon:id,desc,why,disabled:!!why,value:{id}})
  }
  for(const id of(spec.teach||[]))if(!NPCArts.level(id))rows.push({label:'请教 · '+NPC_ARTS[id].name,icon:id,desc:id==='steal'?'空囊示范与风险教学，不默认开局拥有':'一次基础指导，无银两消耗',value:{id:'teach',art:id}});
  for(const id of(spec.teach||[]))if(NPCArts.level(id)){
    const lv=NPCArts.level(id),count=NPCArts.practiceState(id).counts[lv]||0,cap=NPCArts.practiceCap(id),examWhy=NPCArts.examWhy(id);
    rows.push({label:'指导练习 · '+NPC_ARTS[id].name,icon:id,desc:'情境判断与动作练习 · 本阶段 '+count+'/'+cap,disabled:lv>=3||count>=cap||!!rec.alert,why:lv>=3?'已专精 · 可继续实战':rec.alert?'先解除警觉':count>=cap?'本阶段指导已完成':'',value:{id:'practice',art:id}});
    rows.push({label:'晋级考核 · '+NPC_ARTS[id].name,icon:id,desc:'师傅检查熟练度、独立应用与判断',disabled:!!examWhy||!!rec.alert,why:rec.alert?'先解除警觉':examWhy,value:{id:'exam',art:id}})
  }
  if(rec.alert)rows.push({label:'道歉赔礼 · 十两',icon:'persuade',desc:'恢复此人的江湖手段，不重置已取得的物品或熟练',value:{id:'repair'}});
  rows.push({label:'生活技能与见闻',letter:'卷',desc:'查看掌握程度、学习来源和已记线索',value:{id:'book'}});
  const rel=S.npcArtRelations[NPCArts.key(n)]||0;
  return npcArtDialog(n.name+' · 生活技能',`<p>先问来意，再选手段。${rec.alert?'<strong>对方已警觉。</strong>':''}</p><p class="arts-meta">关系 ${rel>0?'+':''}${rel} · 每项有效成果仅计一次熟练</p>`,rows,false,n)
}
function npcArtsBook(){NPCArts.ensure();const rows=Object.entries(NPC_ARTS).map(([id,a])=>{const lv=NPCArts.level(id),xp=S.npcArtProgress[id]||0,next=lv<3?NPC_ART_XP[lv+1]:null;
  return{label:a.name+' · '+NPC_ART_LEVEL[lv],icon:id,progress:lv===3?100:lv?Math.min(100,100*xp/next):0,desc:lv?`${a.desc} 熟练度 ${xp}${next?' / '+next:' · 已专精'}；独立应用 ${NPCArts.realCount(id)} 次；师承：${S.npcArtLearning[id]?.teacher||'旧档习得（师承待补）'}。${lv<3?NPCArts.examWhy(id)||'可找师傅考核':''}`:'学习：'+a.source,disabled:true}});
  const notes=Object.values(S.npcArtNotes).map(x=>`<li><b>${esc(x.npc)} · ${esc(NPC_ARTS[x.art].name)}</b><span>${esc(x.text)}</span></li>`).join('');
  rows.push({label:'合上行卷',letter:'归',desc:'返回当前交互',value:{id:'leave'}});
  return npcArtDialog('生活技能与见闻',`<p>不会 → 入门 → 熟练 → 专精。累计熟练度达到 6 / 18，独立应用达到 1 / 2 次，再向师傅申请考核。入门/熟练的指导练习最多贡献 6/12 点；同一成果不重复计分。襄阳关卡暂时直接授予入门能力。</p><details ${notes?'open':''}><summary>已记见闻 · ${Object.keys(S.npcArtNotes).length}</summary><ul>${notes||'<li>尚未记录，向合适的人打探或辨识。</li>'}</ul></details>`,rows,true)
}
(function(){const st=document.createElement('style');st.textContent=`
#npc-art-panel{position:absolute;z-index:38;color:#eddec3;background:linear-gradient(135deg,#29221af5,#100f0efa);border:1px solid #a08351;box-shadow:0 0 0 3px #181512b8,0 12px 35px #0007;border-radius:4px;padding:12px;font:clamp(13px,1.35cqw,18px)/1.5 var(--serif);max-height:94%;overflow:auto;box-sizing:border-box}
#npc-art-panel.arts-actions{width:34%}#npc-art-panel.arts-book{width:68%;left:16%;top:4%}
#npc-art-panel header{display:flex;align-items:center;border-bottom:1px solid #a0835166;padding-bottom:8px;gap:8px}#npc-art-panel header b{flex:1;font-size:1.2em;color:#f6d594;letter-spacing:.08em}#npc-art-panel header button{padding:0 8px;color:#dbc8a5;background:none;border:0;font-size:1.5em}
#npc-art-panel p{margin:6px 0}#npc-art-panel .arts-meta{color:#b8ad9a;font-size:.85em}#npc-art-panel strong{color:#f0aa86}
#npc-art-panel .arts-options{display:grid;gap:5px;margin-top:8px}.arts-book .arts-options{grid-template-columns:1fr 1fr}
#npc-art-panel .arts-options button{display:flex;align-items:center;gap:10px;text-align:left;width:100%;padding:7px 9px;background:linear-gradient(90deg,#54412b55,#251e1744);border:1px solid #856b3b88;border-radius:2px;color:#eddec3;cursor:pointer;font:inherit}
#npc-art-panel .arts-options button svg{width:30px;height:30px;flex:none;color:#d9b97a}#npc-art-panel .arts-letter{width:30px;flex:none;text-align:center;color:#d9b97a;font-size:1.4em}
#npc-art-panel .arts-options button b{display:block;font-weight:normal;font-size:1.03em}#npc-art-panel .arts-options button small{display:block;font-size:.79em;color:#baad95;line-height:1.4}
#npc-art-panel .arts-options button:disabled{cursor:default;opacity:.65;border-color:#62574855}#npc-art-panel .arts-options button:not(:disabled):hover,#npc-art-panel .arts-options button:focus-visible{outline:1px solid #f6d594;background:#6c512555}
#npc-art-panel.arts-book .arts-options button:disabled{opacity:1}#npc-art-panel .arts-progress{display:block;height:3px;background:#75654a55;margin-top:7px}#npc-art-panel .arts-progress em{display:block;height:100%;background:#d6b474}
#npc-art-panel footer{margin-top:7px;color:#ab9b7e;font-size:.75em}#npc-art-panel details{max-height:24vh;overflow:auto}#npc-art-panel ul{padding:0;list-style:none}#npc-art-panel li{padding:5px;border-bottom:1px solid #a0835133}#npc-art-panel li span{display:block;color:#c5b89d;font-size:.88em}
#npc-arts-button{position:absolute;left:1.5%;bottom:3%;z-index:24;padding:6px 12px;border:1px solid #a08351;background:#241b13dd;color:#e7d2a7;font:clamp(13px,1.25cqw,17px) var(--serif);cursor:pointer}#npc-arts-button[hidden]{display:none}
`;document.head.appendChild(st);
  const button=document.createElement('button');button.id='npc-arts-button';button.hidden=true;button.textContent='生活技能 · 见闻';button.type='button';
  button.onclick=async e=>{e.stopPropagation();if(busy||dlgBusy||mode!=='scene')return;busy=true;try{await NPCArts.book()}finally{busy=false;keys={};hud()}};
  button.onpointerdown=e=>e.stopPropagation();$('game').appendChild(button);
  const original=updateScene;updateScene=function(dt){original(dt);button.hidden=!S||mode!=='scene'||busy||dlgBusy||!$('panel').hidden}
})();
