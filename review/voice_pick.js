/* 音色确认与语音制作管理。服务器是正式绑定的唯一来源，localStorage 只存试听筛选。 */
const BASE='../assets/audio/voice_pick/', KEY='xjh.voice.preview.v2';
const $=id=>document.getElementById(id), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let preview={};try{preview=JSON.parse(localStorage.getItem(KEY))||{}}catch{}
const singlePage=document.body.dataset.voiceMode==='single';
const visibleCharacter=c=>c.id!=='hero'&&(singlePage?c.voice_mode==='single':c.voice_mode!=='single');
let namesById={},modesById={};
let lastError='';
let state={characters:(window.PICK?.chars||[]).filter(visibleCharacter).map(ch=>({...ch,cands:ch.cands.map(c=>({...c,preview_available:false,preview_status:'stale'}))})),bindings:{},lines:[],jobs:[]},online=false,busy=false,pending=null;
let cur=state.characters.find(c=>c.id===location.hash.slice(1))||state.characters[0];
const audio=new Audio();let token=0,finishAudio=null;
const pref=id=>(preview[id]??={star:{},out:{}});
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(preview))}catch{}};
const binding=id=>state.bindings?.[id];
const previewUrl=(ch,c,i)=>c.preview_urls?.[i]||`${BASE}${ch.id}/${c.slug}_${i}.mp3`;
const isMock=()=>state.mode==='mock'||state.provider==='mock';
function explainError(error){return /2061/.test(error||'')&&!String(error).includes('Token Plan')?'MiniMax 错误码 2061：当前 Token Plan 不支持此次模型或能力；属于套餐范围限制，剩余额度充足也可能被拒绝。':error||''}
const tweak=c=>[c.generation_mode==='design'?'AI 设计的新音色':c.generation_mode==='tune'?'按描述调校系统音色':'',c.style?`${c.style}方向 · 同基础音色调校版`:'',c.emotion_api_override?`情绪 ${c.emotion_api_override}`:'',c.voice_modify?'声音效果已调校':'',c.pitch?`音调 ${c.pitch>0?'+':''}${c.pitch}`:'',c.speed&&c.speed!==1?`语速 × ${c.speed}`:''].filter(Boolean).join(' · ');
const running=j=>['queued','running','pending'].includes(j.status);
const jobs=id=>(state.jobs||[]).filter(j=>j.character_id===id);
const linesRunning=id=>jobs(id).some(j=>j.type!=='preview'&&running(j));
const lines=id=>(state.lines||[]).filter(l=>l.character_id===id);
const productionLines=id=>lines(id).filter(l=>l.voice_enabled!==false);
const portraitSrc=ch=>ch.portrait_url||(ch.por?`../assets/${ch.por}.webp`:'');
const sourceLabel=l=>[l.scene,l.source?.event,l.id].filter(Boolean).join(' · ');
const counts=id=>{const all=productionLines(id);return {total:all.length,missing:all.filter(l=>l.status==='missing'||l.status==='unbound').length,stale:all.filter(l=>l.status==='stale').length,failed:all.filter(l=>l.status==='failed').length}};
const usersOf=c=>c.used_by||Object.entries(state.bindings||{}).filter(([,b])=>b.voice_id===c.voice_id).map(([id])=>id);
const voiceLocked=(c,id)=>c.voice_locked??(!singlePage&&usersOf(c).some(other=>other!==id&&modesById[other]!=='single'));
function ownerName(id){return namesById[id]||state.characters.find(c=>c.id===id)?.name||id}
function stop(){if($('playbackStatus'))$('playbackStatus').textContent='';token++;finishAudio?.();audio.pause();document.querySelectorAll('.playing,.now').forEach(e=>e.classList.remove('playing','now'))}
async function playSeq(items){
  stop();const t=token;
  for(const [index,item] of items.entries()){
    if(t!==token)return;
    const row=document.querySelector(`[data-audio="${CSS.escape(item.url)}"]`);row?.classList.add('now');
    $('playbackStatus').textContent=`正在试听 ${index+1} / ${items.length} · ${row?.textContent||cur.name}`;
    audio.src=item.url;
    const done=new Promise(resolve=>{const finish=ok=>{audio.onended=null;audio.onerror=null;finishAudio=null;resolve(ok)};finishAudio=()=>finish(false);audio.onended=()=>finish(true);audio.onerror=()=>finish(false);audio.onpause=null});
    try{await audio.play()}catch{finishAudio?.();row?.classList.remove('now');$('playbackStatus').textContent='音频无法播放，请重听或重试这一候选。';return}
    const completed=await done;row?.classList.remove('now');
    if(t!==token)return;
    if(!completed){$('playbackStatus').textContent=`第 ${index+1} 句播放失败，请重听或重试这一候选。`;return}
  }
  if(t===token)$('playbackStatus').textContent=`试听完成 ${items.length} / ${items.length} 句`;
}
async function api(path,body){const r=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'});const data=await r.json();if(!r.ok)throw Error(data.error||`请求失败 (${r.status})`);return data}
async function refresh(initial=false){try{const data=await api('/api/state');if(!Array.isArray(data.characters))throw Error('后台数据格式不正确');state=data;namesById=Object.fromEntries(state.characters.map(c=>[c.id,c.name]));modesById=Object.fromEntries(state.characters.map(c=>[c.id,c.voice_mode||'full']));state.characters=state.characters.filter(visibleCharacter);online=true;cur=state.characters.find(c=>c.id===(initial?location.hash.slice(1):cur?.id))||state.characters[0];render()}catch(e){online=false;$('serviceStatus').textContent='制作后台未连接，旧版无情绪试听不可用。请运行 python3 tools_audio/voice_server.py，再从该服务器打开本页。';$('serviceStatus').className='bar notice';render()}}
function renderList(){const count=state.characters.filter(c=>binding(c.id)).length;$('prog').textContent=`已确认 ${count} / ${state.characters.length}`;$('list').innerHTML='';let group;for(const ch of state.characters){if(ch.group!==group){group=ch.group;const g=document.createElement('div');g.className='grp';g.textContent=group||'剧情角色';$('list').append(g)}const b=binding(ch.id),el=document.createElement('div');el.className='ch'+(ch.id===cur?.id?' on':'');el.innerHTML=`${portraitSrc(ch)?`<img src="${esc(portraitSrc(ch))}" alt="">`:`<span class="portrait-missing">${esc(ch.name.slice(0,1))}</span>`}<div class="t"><div class="n">${esc(ch.name)}</div><div class="v${b?' ok':''}">${esc(b?'✓ '+(b.name||b.label||b.voice_id):'待确认音色')}</div></div>`;el.onclick=()=>go(ch);$('list').append(el)}}
function renderHead(){if(!cur)return;$('por').hidden=!portraitSrc(cur);if(portraitSrc(cur))$('por').src=portraitSrc(cur);else $('por').removeAttribute('src');$('cname').textContent=cur.name;$('persona').textContent=[cur.persona,cur.voice_direction].filter(Boolean).join(' · ');const b=binding(cur.id);$('pick').innerHTML=b?`已确认：<b>${esc(b.name||b.label||b.voice_id)}</b><code>${esc(b.voice_id)} ${esc(tweak(b))}</code>`:'尚未确认音色';$('bar').innerHTML='<span>同一句横向对比：</span>';for(const [i,l] of (cur.lines||[]).entries()){const btn=document.createElement('button');btn.textContent=`${i+1} · ${l.tag||'试听'}`;btn.title=`${l.text} · 情绪：${l.emotion_api||'未配置'} · ${l.delivery_notes||''}`;btn.onclick=()=>playSeq((cur.cands||[]).filter(c=>c.preview_available!==false&&!c.preview_is_mock&&!pref(cur.id).out[c.slug]&&(!$('onlyStar').checked||pref(cur.id).star[c.slug])).map(c=>({url:previewUrl(cur,c,i)})));$('bar').append(btn)}}
function previewState(c){return c.preview_status|| (c.preview_available?'ready':jobs(cur.id).filter(j=>j.type==='preview'&&j.candidate_slug===c.slug).at(-1)?.status)||'missing'}
function renderGrid(){if(!cur)return;const st=pref(cur.id),b=binding(cur.id);$('grid').innerHTML='';for(const c of cur.cands||[]){if($('onlyStar').checked&&!st.star[c.slug])continue;const ps=previewState(c),failed=ps==='failed'||ps==='interrupted',needsPreview=c.preview_available===false&&!['queued','running'].includes(ps),users=usersOf(c),locked=voiceLocked(c,cur.id),chosen=b?.voice_id===c.voice_id&&(!b.candidate_slug||b.candidate_slug===c.slug),el=document.createElement('div');el.className='card'+(chosen?' chosen':'')+(st.out[c.slug]?' out':'')+(locked?' locked':'');el.innerHTML=`<div class="hd"><button class="star${st.star[c.slug]?' on':''}" aria-label="收藏音色">★</button><span class="nm">${esc(c.name)}</span><span class="sp"></span><span class="id">${esc(c.voice_id)}</span></div><div class="sub">${esc(tweak(c))}</div>${c.prompt?`<div class="sub">描述：${esc(c.prompt)}</div>`:''}${c.preview_is_mock?'<div class="used">模拟试听为静音，仅验证流程，不能用于定稿。</div>':c.preview_available===false?`<div class="used">${failed?'试听准备失败，可在本候选重试，保留已创建音色。':needsPreview?'试听尚未完成，点击「补齐试听」继续制作。':isMock()?'当前模拟模式不会自动制作试听。':`正在自动准备多句试听${c.preview_total?`（${c.preview_ready_count||0} / ${c.preview_total}）`:''}，完成后即可连播。`}${c.preview_error?' '+esc(explainError(c.preview_error)):''}</div>`:''}${users.length?`<div class="used${locked?'':' shared'}">已使用：${users.map(id=>esc(ownerName(id))).join('、')} · ${locked?'主要角色不可共用':'NPC 可复用'}</div>`:''}<ol>${(cur.lines||[]).map((l,i)=>`<li data-audio="${esc(previewUrl(cur,c,i))}"><span class="tg">${esc(l.tag||'试听')} · ${esc(c.emotion_api_override||l.emotion_api||'未配置')}</span><span>${esc(l.text)}</span></li>`).join('')}</ol><div class="ft"><button class="all" ${c.preview_available===false||c.preview_is_mock?'disabled':''}>${singlePage?'▶ 试听这一句':`▶ 连播 ${(cur.lines||[]).length} 句`}</button>${needsPreview?`<button class="preview" ${!online||busy||jobs(cur.id).some(running)?'disabled':''}>${failed?'重试试听':'补齐试听'}</button>`:''}<button class="kill">${st.out[c.slug]?'恢复':'淘汰'}</button><button class="choose" ${!online||locked||chosen||busy||c.preview_available===false||c.preview_is_mock||jobs(cur.id).some(j=>running(j)&&j.type==='lines')?'disabled':''}>${chosen?'✓ 已确认':locked?'已被占用':'选择此音色'}</button></div>`;el.querySelector('.star').onclick=()=>{st.star[c.slug]=!st.star[c.slug];save();renderGrid()};el.querySelector('.kill').onclick=()=>{st.out[c.slug]=!st.out[c.slug];save();renderGrid()};el.querySelector('.all').onclick=()=>playSeq((cur.lines||[]).map((l,i)=>({url:previewUrl(cur,c,i)})));el.querySelectorAll('li').forEach(li=>li.onclick=()=>{if(c.preview_available!==false&&!c.preview_is_mock)playSeq([{url:li.dataset.audio}])});if(el.querySelector('.preview'))el.querySelector('.preview').onclick=()=>requestPreview(c);el.querySelector('.choose').onclick=()=>confirmCandidate(c);$('grid').append(el)}}
const statusName={casting_only:'试听稿 · 未接入剧情',missing:'待生成',pending:'排队中',queued:'排队中',running:'生成中',ready:'已生成',completed:'已完成',failed:'失败',stale:'待更新',mock:'模拟完成',mock_ready:'模拟完成',unbound:'待确认音色',interrupted:'已中断'};
function renderLines(){if(!cur)return;const all=lines(cur.id);$('showLines').textContent=`${singlePage?'查看对话与战斗语音':'查看全部语句'}（${all.length}）`;const search=$('lineSearch').value.trim(),filter=$('lineFilter').value;const selected=all.filter(l=>(!search||[l.text,sourceLabel(l),l.source?.file].some(x=>String(x||'').includes(search)))&&(filter==='all'||(filter==='battle'&&l.kind==='battle')||l.status===filter||(filter==='missing'&&['stale','pending','unbound'].includes(l.status))));const n=counts(cur.id);$('lineCount').textContent=`显示 ${selected.length} / ${all.length} 条 · 正式制作 ${n.total} 条 · 待生成 ${n.missing} · 待更新 ${n.stale} · 失败 ${n.failed}`;$('lineRows').innerHTML=selected.length?selected.map(l=>`<tr><td>${esc(l.kind==='battle'?('战斗 · '+({turn:'轮到行动',attack:'攻击',hurt:'受击',down:'倒地',support:'支援'}[l.battle_event]||l.battle_event)):l.kind==='casting'?'完整状态试听稿':l.kind==='emotion'?'情绪短句':l.kind==='dialogue'?'剧情台词':l.kind||'剧情台词')}<small>${esc(l.emotion||l.tag||'')} · ${esc(l.emotion_api||'未配置')}</small></td><td>${esc(l.text)}<small>${esc(sourceLabel(l))}</small><small>${esc(l.delivery_notes||'')}</small>${l.error?`<small class="notice">${esc(l.error)}</small>`:''}</td><td>${esc(statusName[l.status]||l.status||'待生成')}${l.is_mock||l.mock?' · 模拟':''}</td><td><button data-line="${esc(l.id)}" ${!l.audio_url||l.is_mock||l.mock?'disabled':''}>▶ 试听</button></td></tr>`).join(''):'<tr><td colspan="4">'+(online?'暂无匹配台词。台词清单更新后会显示在这里。':'连接制作后台后显示该角色全部台词。')+'</td></tr>';for(const btn of $('lineRows').querySelectorAll('button'))btn.onclick=()=>{const l=all.find(x=>x.id===btn.dataset.line);if(l?.audio_url)playSeq([{url:l.audio_url}])};const js=jobs(cur.id).filter(j=>j.type==='lines'),active=js.find(running),last=active||js.at(-1);$('jobStatus').textContent=n.total===0?'尚无正式采用的剧情台词；六状态示例用于选音，确认后只保存音色。':last?`${last.type==='preview'?'试听任务':'台词任务'}：${statusName[last.status]||last.status} · ${last.completed??last.done??0} / ${last.total??0} · 失败 ${last.failed??0}${last.error?' · '+last.error:''}`:'确认音色后自动启动补全；以后新增台词，点击「补全新增 / 缺失语音」。';$('fillMissing').disabled=!online||!binding(cur.id)||!!active||busy||n.total===0;$('retryFailed').disabled=!online||!binding(cur.id)||!!active||busy||!all.some(l=>l.status==='failed')}
function render(){if(online){const mock=isMock();$('serviceStatus').className='bar'+(mock?' notice':'');$('serviceStatus').textContent=lastError|| (mock?'当前为模拟模式：任务只验证制作流程，不产生正式可用语音。':`已连接 MiniMax 语音制作后台 · ${singlePage?'NPC 对话一句，战斗短句单列':'18位同伴与开篇重要角色多句试听'} · NPC 可复用音色`)}const a=state.auto_preview;$('previewProgress').textContent=a?`自动试听：${statusName[a.status]||a.status} · 完成 ${a.completed||0} / ${a.total||0} · 失败 ${a.failed||0}${a.current?' · 当前 '+(typeof a.current==='string'?a.current:JSON.stringify(a.current)):''}${a.error?' · '+a.error:''}`:'';renderList();renderHead();renderGrid();renderLines();renderExpansion()}
function go(ch){stop();cur=ch;history.replaceState(null,'','#'+ch.id);render()}
async function requestPreview(c){if(busy)return;busy=true;lastError='';render();try{await api('/api/previews',{character_id:cur.id,candidate_slug:c.slug});await refresh()}catch(e){lastError=e.message}finally{busy=false;render()}}
function confirmCandidate(c){stop();pending={character_id:cur.id,candidate_slug:c.slug};const previous=binding(cur.id);$('bindDetails').innerHTML=`<p><b>${esc(cur.name)}</b> → <b>${esc(c.name)}</b></p><code>${esc(c.voice_id)} ${esc(tweak(c))}</code>${previous?'<p class="notice">更换音色后，旧音色的语音需要更新。后台将补全当前台词。</p>':''}<p>${singlePage?`对话仅采用指定识别句并优先复用试听；另有 ${productionLines(cur.id).filter(l=>l.kind==='battle').length} 条已登记战斗短句，确认后沿同一音色补全。`:`本角色共有 ${productionLines(cur.id).length} 条正式制作语句；${productionLines(cur.id).length?'确认后自动补全。':'本次只保存音色，剧情采用台词后再补全。'}状态试听稿不会进入正式任务。`}${isMock()?'当前为模拟任务。':productionLines(cur.id).length?'将调用语音接口生成正式音频。':'当前没有正式台词，不调用正式语音生成。'}</p>`;$('bindDialog').showModal()}
$('cancelBind').onclick=()=>{$('bindDialog').close();pending=null};
$('confirmBind').onclick=async()=>{if(!pending||busy)return;busy=true;$('confirmBind').disabled=true;try{await api('/api/bind',{...pending,confirm:true});$('bindDialog').close();pending=null;await refresh()}catch(e){$('bindDetails').append(Object.assign(document.createElement('p'),{className:'notice',textContent:e.message}));await refresh()}finally{busy=false;$('confirmBind').disabled=false;render()}};
async function fill(mode){if(busy)return;lastError='';busy=true;renderLines();try{await api('/api/jobs',{character_id:cur.id,mode});await refresh()}catch(e){lastError=e.message}finally{busy=false;render()}}
$('fillMissing').onclick=()=>fill('missing');$('retryFailed').onclick=()=>fill('retry');$('onlyStar').onchange=renderGrid;$('lineSearch').oninput=renderLines;$('lineFilter').onchange=renderLines;
$('sumBtn').onclick=()=>{$('sumTbl').innerHTML='<tr><th>角色</th><th>已确认音色</th><th>基础音色 / 微调</th></tr>'+state.characters.map(ch=>{const b=binding(ch.id);return `<tr><td>${esc(ch.name)}</td><td>${esc(b?.name||b?.label||'未确认')}</td><td><code>${esc(b?.voice_id||'')}</code> ${esc(b?tweak(b):'')}</td></tr>`}).join('');$('sum').showModal()};$('closeSum').onclick=()=>$('sum').close();$('cpJson').onclick=async()=>{try{await navigator.clipboard.writeText(JSON.stringify(state.bindings,null,2));$('cpJson').textContent='已复制'}catch{$('cpJson').textContent='复制失败，请检查浏览器权限'}};
addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();stop()}const i=state.characters.indexOf(cur);if(e.key==='ArrowRight'&&i<state.characters.length-1)go(state.characters[i+1]);if(e.key==='ArrowLeft'&&i>0)go(state.characters[i-1])});
setInterval(()=>{if(!busy&&!document.hidden)refresh()},3000);

$('showLines').onclick=()=>document.querySelector('.lines-panel').scrollIntoView({behavior:'smooth'});
$('showCandidates').onclick=()=>$('grid').scrollIntoView({behavior:'smooth'});

let expandCid=null,expandRequestId=null,expandSignature=null;
function renderExpansion(){
  if(!cur)return;
  const job=jobs(cur.id).filter(j=>j.type==='expansion').at(-1);
  $('expandVoices').disabled=!online||busy||jobs(cur.id).some(running);
  const blocked=job?.generation_mode==='design'&&job.status==='failed'&&/2061|1008/.test(job.error||'');
  $('continueTune').hidden=!blocked;$('continueTune').disabled=$('expandVoices').disabled;
  $('expansionProgress').textContent=job?`按描述扩充：${statusName[job.status]||job.status} · ${job.generation_mode==='design'?'AI 设计':'系统调校'} · ${job.count} 个候选 · 试听 ${job.completed||0} / ${job.total||0}${job.phase==='design'&&running(job)?' · 正在设计基础声音':''}${job.error?' · '+explainError(job.error):''}${job.status==='interrupted'?' · 已保存候选可在卡片重试试听；AI 设计未返回的声音请查看账户记录后再提交。':''}`:'';
}
function expandHint(){
  const design=$('voiceExpandMode').value==='design',ch=state.characters.find(c=>c.id===expandCid);
  const latestDesign=(state.jobs||[]).filter(j=>j.generation_mode==='design').at(-1);
  const recentError=design&&latestDesign?.status==='failed'&&latestDesign.error?`最近设计请求失败：${explainError(latestDesign.error)} `:'';
  $('expandHint').textContent=recentError+(design?'完整描述将发送至 MiniMax Voice Design，设计及试听按账户计费；Token Plan 剩余额度不代表支持所有音色设计能力，接口拒绝会显示具体原因。':'按关键词选取系统声音并调整情绪、音高、语速与声音效果；支持凶狠、阴险、温柔、年轻、年长、低沉、清亮、快慢等方向。此方式增加调校候选。')+` 每个候选自动制作 ${ch?.lines?.length||1} 段带情绪试听；试听后仍需手动确认角色音色。`;
}
$('expandVoices').onclick=()=>{
  stop();expandCid=cur.id;expandRequestId=null;expandSignature=null;
  $('expandName').textContent=cur.name;$('expandError').textContent='';
  $('voicePrompt').value=localStorage.getItem('xjh.voice.prompt.'+cur.id)||cur.voice_direction||'';
  $('voiceExpandMode').value='tune';expandHint();$('expandDialog').showModal();$('voicePrompt').focus();
};
$('cancelExpand').onclick=()=>$('expandDialog').close();
$('continueTune').onclick=()=>$('expandVoices').click();
$('voiceExpandMode').onchange=expandHint;
for(const button of document.querySelectorAll('[data-voice-prompt]'))button.onclick=()=>{$('voicePrompt').value=button.dataset.voicePrompt;$('voicePrompt').focus()};
$('expandForm').onsubmit=async event=>{
  event.preventDefault();if(busy||!expandCid)return;
  const body={character_id:expandCid,prompt:$('voicePrompt').value.trim(),count:Number($('voiceExpandCount').value),mode:$('voiceExpandMode').value};
  const signature=JSON.stringify(body);
  if(signature!==expandSignature){expandSignature=signature;expandRequestId=crypto.randomUUID()}
  busy=true;$('submitExpand').disabled=true;$('expandError').textContent='';lastError='';
  try{
    await api('/api/candidates/expand',{...body,request_id:expandRequestId});
    try{localStorage.setItem('xjh.voice.prompt.'+expandCid,body.prompt)}catch{}
    $('onlyStar').checked=false;$('expandDialog').close();await refresh();
  }catch(e){$('expandError').textContent=e.message}
  finally{busy=false;$('submitExpand').disabled=false;render()}
};

render();refresh(true);

$('syncCatalog').onclick=async()=>{if(busy)return;busy=true;lastError='';$('syncCatalog').disabled=true;try{await api('/api/catalog/refresh',{});await refresh()}catch(e){lastError=e.message}finally{busy=false;$('syncCatalog').disabled=false;render()}};
