'use strict';
// ───────────────────────── 战斗（横版回合制 · 护盾/破势/蓄势） ─────────────────────────
// API：await battle({foes:[mk(..)], bg, boss, noLose, tutorial, intro}) → 'win' | 'lose' | 'flee'；异常时清理战斗现场并向调用方抛出
// 机制：
//  · 行动顺序按身法（+小幅随机），顶部同时预告「本回合 / 下回合」。
//  · 护盾/破势：敌人有盾值与弱点（兵刃 刀剑拳棍暗器 + 内劲 阳阴毒雷），弱点初始为「？」，命中后揭示。
//    命中弱点扣 1 盾；盾归零 → 破势：本回合与下回合无法行动，受伤 ×2，蓄力被打断；恢复后盾值回满。
//  · 蓄势(BP)：我方每回合 +1（本回合蓄势过则不加），上限 5；一次行动最多投入 3 点：
//    普攻 = 1+BP 连击；武学 = 威力/治疗量提升（多段武学增加段数）。
// 模板可选字段：shield(盾值) weak:[..](弱点) drops:{item:百分比} hpMul atkMul
let B=null;
const WTYPES=['刀','剑','拳','棍','暗器','阳','阴','毒','雷'];
const WCOL={刀:'#d8d2c0',剑:'#9fd4ee',拳:'#f0a868',棍:'#c89a60',暗器:'#b6c2d6',阳:'#ff8a3a',阴:'#9aa6ff',毒:'#86d65e',雷:'#ffe25a'};
const FOE_DEF={
  bandit:{shield:3,weak:['拳','棍','暗器','阳'],drops:{bun:25}},
  wolf:{shield:2,weak:['刀','剑','暗器','阳'],drops:{bun:10}},
  snake:{shield:5,weak:['刀','暗器','雷']},
  chief:{shield:6,weak:['刀','暗器','阳']}};
// 武学在战斗中的类别：t 兵刃 e 内劲 tgt foe|foes|ally|allies|self hits 段数 reveal 揭示弱点数
const BSK={
  fist:{t:'拳'},fuhu:{t:'拳',e:'阳',hits:2},liuye:{t:'剑',tgt:'foes'},jingxin:{tgt:'self'},
  shuaibei:{t:'拳',e:'阴',stun:1},bianfa:{t:'棍',tgt:'foes'},lianhua:{t:'拳',e:'毒',bleed:1},guafeng:{t:'拳',e:'雷',tgt:'foes'},
  bite:{t:'刀'},lick:{tgt:'ally'},peck:{t:'刀',hits:2},blade:{t:'刀'},ghost:{t:'刀',tgt:'foes'},coil:{t:'拳',stun:1},palm_m:{t:'拳'},staff:{t:'棍'},
  jinzhen:{t:'暗器',reveal:1},huichun:{tgt:'ally'},baicao:{tgt:'allies'},dingshen:{tgt:'ally',buff:1},sniff:{t:'刀',reveal:2}};
Object.assign(SKILLS,{
  jinzhen:SKILLS.jinzhen||{name:'金针刺穴',kind:'暗器',mp:4,pow:1.0,desc:'银针点穴，并看破敌人一处弱点。'},
  huichun:SKILLS.huichun||{name:'回春散',kind:'医',mp:6,pow:0,heal:0.38,desc:'为一名同伴回复气血。'},
  baicao:SKILLS.baicao||{name:'百草露',kind:'医',mp:10,pow:0,heal:0.2,desc:'为全体同伴回复少量气血。'},
  dingshen:SKILLS.dingshen||{name:'定神',kind:'医',mp:5,pow:0,desc:'令一名同伴心神安定：三回合内攻防提升。'},
  sniff:SKILLS.sniff||{name:'嗅探',kind:'咬',mp:4,pow:.7,desc:'大黄嗅出敌人两处弱点。'}});
const PARTY_DEF={
  suzhi:{name:'苏芷',art:['suzhi','lady'],por:['suzhi','lady'],st:{str:3,con:4,agi:6,wil:6,wis:6},skills:['jinzhen','huichun','baicao','dingshen'],atkType:'暗器',atkName:'飞针'},
  dog:{name:'大黄',art:['dog'],por:['dog'],st:{str:4,con:5,agi:7,wil:3,wis:2},skills:['sniff','lick'],atkType:'刀',atkName:'撕咬'}};
const FOE_SLOTS=[[335,452],[200,402],[105,488],[70,408],[235,505]];
const ALLY_SLOTS=[[735,432],[848,398],[852,470],[640,470]];
const bsfx=(n,v,r)=>{try{window.__audio&&__audio.sfx(n,v,r)}catch(e){}};
const artKey=u=>u.art;
function hasArt(k){return ok(IMG[`c_${k}_l_0`])||ok(IMG[`c_${k}_l`])||ok(IMG[`c_${k}_d_0`])}
function pickArt(list){for(const k of list)if(hasArt(k))return k;return list[0]}
function unitImg(u,dir){const k=u.art;return[`c_${k}_${dir}_0`,`c_${k}_${dir}`,`c_${k}_${dir==='l'?'r':'l'}_0`,`c_${k}_d_0`].find(n=>ok(IMG[n]))||null}

// ───────── 单位构造 ─────────
function statUnit(src,side){const d=derived({st:src.st,lv:src.lv||1,weapon:src.weapon||null,armor:src.armor||null,atkBonus:src.atkBonus||0,mpBonus:src.mpBonus||0});
  return{side,name:src.name,lv:src.lv||1,mhp:d.mhp,mmp:d.mmp,atk:d.atk,def:d.def,spd:d.spd,crit:d.crit,dodge:d.dodge,
    bp:1,boosted:false,buffs:{},alpha:1,id:Math.random()}}
function mkHero(){const u=statUnit({...S,name:S.name},'ally');const d=derived();Object.assign(u,{mhp:d.mhp,mmp:d.mmp,atk:d.atk,def:d.def,spd:d.spd,crit:d.crit,dodge:d.dodge});
  u.hp=clamp(S.hp,1,u.mhp);u.mp=clamp(S.mp,0,u.mmp);u.isHero=true;u.art=pickArt(['hero']);u.por='hero';
  const w=S.weapon&&ITEMS[S.weapon]&&ITEMS[S.weapon].weapon;u.atkType=w?w.kind:'拳';u.atkName=w?ITEMS[S.weapon].name:'拳脚';
  u.skills=Object.keys(S.skills).filter(k=>SKILLS[k]&&k!=='fist');u.skLv=S.skills;return u}
function mkAlly(key){const P=PARTY_DEF[key];if(!P)return null;const u=statUnit({name:P.name,st:P.st,lv:Math.max(1,S.lv)},'ally');
  u.hp=u.mhp;u.mp=u.mmp;u.art=pickArt(P.art);u.por=P.por.find(p=>ok(IMG['p_'+p]))||P.por[0];u.key=key;u.atkType=P.atkType;u.atkName=P.atkName;u.skills=P.skills.slice();u.skLv={};return u}
function mkFoe(t,i){const k=(t.sp||'').replace(/^c_/,''),D=FOE_DEF[k]||{};const u=statUnit(t,'foe');
  u.mhp=Math.round(u.mhp*(t.hpMul||.45)*1.8);u.hp=u.mhp;u.atk=Math.round(u.atk*(t.atkMul||.62));u.art=k;u.key=k;
  u.maxShield=t.shield||D.shield||3;u.shield=u.maxShield;u.weak=(t.weak||D.weak||['拳','刀']).slice();u.known=new Set();
  u.skills=Object.keys(t.skills||{blade:1}).filter(s=>SKILLS[s]);u.drops=t.drops||D.drops||{};u.exp=t.exp||u.lv*20;u.silver=t.silver||0;
  u.bossy=!!t.boss||k==='chief';u.h=(t.h||160);return u}
// 站位（bstage.js 覆盖）：设置每个单位的 u.x/u.y（脚底），可顺带写 u.depth 等
function layoutUnits(allies,foes,opt){
    allies.forEach((u,i)=>{const s=ALLY_SLOTS[i]||ALLY_SLOTS[0];u.x=s[0];u.y=s[1]});
    foes.forEach((u,i)=>{const s=FOE_SLOTS[i]||[80+i*40,450];u.x=s[0];u.y=s[1];if(opt.boss&&i===0){u.bossy=true;u.x=240;u.y=450}});
    if(opt.boss&&foes.length>1){foes.slice(1).forEach((u,i)=>{const s=[[120,405],[125,490],[40,445]][i]||[60,450];u.x=s[0];u.y=s[1]})}}
function unitH(u){const s=window.ART&&ART.scale&&ART.scale[u.art];const base=u.side==='foe'&&u.bossy?1.12:1;return 150*(s||(u.h?u.h/170:1))*base}

// ───────── 样式与 DOM ─────────
function battleCSS(){if($('battle-css'))return;const st=document.createElement('style');st.id='battle-css';st.textContent=`
#bt{position:absolute;left:0;top:0;width:960px;height:540px;transform-origin:0 0;pointer-events:none;font-family:var(--serif);color:var(--paper)}
#bt[hidden]{display:none}
#bt .frame{pointer-events:auto}
#bt-cmd{position:absolute;width:214px;padding:10px 8px 8px;font-size:15px}
#bt-cmd .hd{display:flex;align-items:center;justify-content:space-between;padding:0 4px 6px;margin-bottom:4px;border-bottom:1px solid rgba(163,138,94,.35)}
#bt-cmd .hd b{font-family:var(--brush);font-size:19px;color:var(--hi);letter-spacing:.1em;font-weight:normal}
#bt-cmd .row{display:flex;align-items:center;gap:6px;padding:5px 8px;cursor:pointer;border:1px solid transparent;letter-spacing:.08em;line-height:1.25}
#bt-cmd .row .r{margin-left:auto;font-size:12px;color:var(--dim)}
#bt-cmd .row.sel{border-color:var(--gold);background:linear-gradient(90deg,rgba(224,191,120,.22),rgba(224,191,120,.04));color:var(--hi)}
#bt-cmd .row.sel::before{content:'▶';position:absolute;left:-2px;color:var(--gold);font-size:11px}
#bt-cmd .row{position:relative}
#bt-cmd .row.dis{opacity:.4;cursor:default}
#bt-cmd .ty{display:inline-block;min-width:1.4em;padding:0 3px;font-size:11px;line-height:16px;text-align:center;border:1px solid currentColor;border-radius:2px}
#bt-cmd .ft{margin-top:6px;padding:6px 4px 0;border-top:1px solid rgba(163,138,94,.35);display:flex;align-items:center;gap:6px;font-size:12px;color:var(--dim)}
#bt-cmd .ft button{padding:0 .5em;font-size:14px;line-height:22px;letter-spacing:0}
#bt-cmd .pips{display:flex;gap:3px;margin-left:auto}
.bt-pip{width:11px;height:11px;transform:rotate(45deg);border:1px solid #7a6344;background:#1a130d;display:inline-block}
.bt-pip.on{background:#d88a2c;border-color:#ffcf73;box-shadow:0 0 5px #ff9a2c}
.bt-pip.use{background:#fff1b0;border-color:#fff;box-shadow:0 0 8px #ffd24a}
#bt-cards{position:absolute;right:8px;bottom:6px;display:flex;gap:6px}
.bt-card{width:150px;height:62px;display:flex;gap:6px;padding:5px 6px;font-size:12px;cursor:pointer;transition:transform .15s}
.bt-card.cur{border-color:var(--gold);transform:translateY(-6px);box-shadow:0 0 12px rgba(224,191,120,.45),inset 0 0 0 2px rgba(0,0,0,.55)}
.bt-card.tgt{border-color:#8fe0a8;box-shadow:0 0 12px rgba(127,224,160,.6)}
.bt-card.dead{filter:grayscale(1) brightness(.6)}
.bt-card .fc{width:48px;height:50px;flex:none;background:#0c0906 center top/cover no-repeat;border:1px solid var(--bz)}
.bt-card .inf{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.bt-card .nm{display:flex;justify-content:space-between;font-size:13px;color:var(--hi);letter-spacing:.06em}
.bt-card .bar{height:5px;background:#000;border:1px solid #3a2e20;position:relative}
.bt-card .bar i{position:absolute;left:0;top:0;bottom:0;background:#6fbf6f}
.bt-card .bar .gh{position:absolute;left:0;top:0;bottom:0;background:#f3e0b0}
#bt-cmd .kn{display:inline-block;width:1.1em;font-size:10px;color:var(--dim);font-family:sans-serif}
#bt-hint .pv{color:#fff3e0}#bt-hint .wk{color:#ffe25a;font-weight:bold;animation:wkp .6s ease-in-out infinite alternate}
@keyframes wkp{from{opacity:.55}to{opacity:1}}
.bt-card .bar.mp i{background:#5a8fc4}
.bt-card .nums{display:flex;gap:4px;white-space:nowrap;justify-content:space-between;color:var(--dim);font-size:10.5px;line-height:1}
.bt-card .pips{display:flex;gap:4px;padding-left:2px;margin-top:1px}
.bt-card .pips .bt-pip{width:8px;height:8px}
#bt-hint{position:absolute;left:50%;top:66px;transform:translateX(-50%);padding:5px 16px;font-size:14px;white-space:nowrap;letter-spacing:.06em}
#bt-hint[hidden]{display:none}
#bt-hint .w{display:inline-block;margin:0 1px;padding:0 3px;font-size:12px;border:1px solid currentColor}
#bt-win{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:360px;padding:18px 26px;text-align:center}
#bt-win h2{margin:0 0 8px;font-family:var(--brush);font-size:40px;font-weight:normal;color:var(--hi);letter-spacing:.4em;text-shadow:0 0 12px rgba(224,191,120,.5)}
#bt-win .ln{display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px dashed rgba(163,138,94,.3);font-size:15px}
#bt-win .ln b{color:var(--hi);font-weight:normal}
#bt-win .lv{color:#ffd24a;margin-top:6px;font-size:15px}
#bt-win .go{margin-top:12px;color:var(--dim);font-size:12px}
#bt-help{position:absolute;left:8px;bottom:6px;font-size:11px;color:rgba(233,220,192,.55);letter-spacing:.04em;text-shadow:0 1px 2px #000}
`;document.head.appendChild(st)}
function battleDom(){battleCSS();let el=$('bt');if(!el){el=document.createElement('div');el.id='bt';el.hidden=true;
    el.innerHTML='<div id="bt-cards"></div><div id="bt-hint" class="frame" hidden></div><div id="bt-cmd" class="frame" hidden></div><div id="bt-help"></div>';
    const fadeE=$('fade');fadeE.parentNode.insertBefore(el,$('dlg'));
    const fit=()=>{const gm=$('game');el.style.transform=`scale(${gm.clientWidth/960})`};fit();
    try{new ResizeObserver(fit).observe($('game'))}catch(e){addEventListener('resize',fit)}}
  return el}
function tyTag(t){return t?`<span class="ty" style="color:${WCOL[t]||'#ccc'}">${t}</span>`:''}
function pips(n,use,max=5){let s='';for(let i=0;i<max;i++)s+=`<i class="bt-pip ${i<n?(i>=n-use?'use':'on'):''}"></i>`;return s}
function renderCards(){const el=$('bt-cards');if(!el||!B)return;
  el.innerHTML=B.allies.map((u,i)=>{const cur=B.cur===u,use=cur?B.bpUse:0;
    return`<div class="bt-card frame ${cur?'cur':''} ${u.hp<=0?'dead':''} ${B.tgtList&&B.tgtList.includes(u)&&(B.tgtAll||B.tgtList[B.tsel]===u)?'tgt':''}" data-i="${i}">
    <div class="fc"></div><div class="inf">
    <div class="nm"><span>${esc(u.name)}</span><span style="color:var(--dim);font-size:11px">${u.defend?'防御':u.buffs.ding?'定神':u.stun?'眩晕':''}</span></div>
    <div class="bar"><b class="gh" style="width:${100*(u.gh??u.hp)/u.mhp}%"></b><i style="width:${100*u.hp/u.mhp}%;${u.hp<u.mhp*.3?'background:#d9553a':''}"></i></div>
    <div class="nums"><span>气血 ${u.hp}/${u.mhp}</span><span>内 ${u.mp}</span></div>
    <div class="bar mp"><i style="width:${100*u.mp/u.mmp}%"></i></div>
    <div class="pips">${pips(u.bp,use)}</div></div></div>`}).join('');
  el.querySelectorAll('.bt-card').forEach(c=>porFill(c.querySelector('.fc'),B.allies[+c.dataset.i]));
  el.querySelectorAll('.bt-card').forEach(c=>c.onpointerdown=e=>{e.stopPropagation();const u=B.allies[+c.dataset.i];if(B.tgtList&&B.tgtList.includes(u)&&B.pickCard)B.pickCard(u)})}
// 有表情差分的角色：战斗中用持械姿态，气血 <30% 换负伤/担忧
function porKey(u){const e=EXPR[u.por];if(!e)return u.por;const w=u.hp<u.mhp*.3?(e.includes('hurt')?'hurt':'worry'):'battle';return ok(IMG[`p_${u.por}_${w}`])?`${u.por}_${w}`:u.por}
function porFill(el,u){const k=porKey(u);if(ok(IMG['p_'+k])){el.style.backgroundImage=`url(assets/p_${k}.webp)`;return}
  const im=IMG[`c_${u.art}_l_0`]||IMG[`c_${u.art}_d_0`];if(!ok(im))return;const c=document.createElement('canvas');c.width=96;c.height=100;c.style.cssText='width:100%;height:100%;display:block';const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const iw=im.naturalWidth,ih=im.naturalHeight,cs=Math.min(iw,ih)*.8;x.drawImage(im,(iw-cs)/2,ih*.05,cs,cs*100/96,0,0,96,100);el.appendChild(c)}
function hint(html){const h=$('bt-hint');if(!h)return;if(!html){h.hidden=true;return}h.hidden=false;h.innerHTML=html}

// ───────── 主入口 ─────────
async function battle(opt={}){
  const prevMode=mode;const el=battleDom();const tp=$('tpad'),tpd=tp?tp.style.display:'';
  const hpBefore=S.hp,mpBefore=S.mp,bagBefore={...(S.bag||{})};
  const bgKey=opt.bg||('bg_'+(S.scene||'street'));
  if(opt.bg&&!ok(IMG[bgKey]))await loadOpt(bgKey,bgKey);   // 未指定背景时由 bstage 按场景解析 bb_*（只请求登记过的文件，见 docs/battle-v2.md §4）
  const ports=['p_hero',...(S.party||[]).flatMap(k=>(PARTY_DEF[k]||{por:[]}).por.filter(p=>PORTS.includes(p)).map(p=>'p_'+p))];   // 只预载登记过的立绘（大黄无立绘，头像取战斗精灵）
  ports.push(...ports.flatMap(p=>(EXPR[p.slice(2)]||[]).map(e=>p+'_'+e)));
  await Promise.all(ports.filter(p=>!IMG[p]).map(p=>loadOpt(p,p)));
  await fade(async()=>{mode='battle';$('prompt').hidden=true;$('hud').hidden=true;if(tp)tp.style.display='none';
    ['blog','border','bhud'].forEach(i=>{if($(i))$(i).hidden=true});
    const allies=[mkHero()];if(!opt.tutorial){for(const k of(S.party||[])){const a=mkAlly(k);if(a)allies.push(a)}if(S.pet&&typeof mkPet==='function'){const p=mkPet(S.pet);if(p)allies.push(p)}}
    const foes=opt.foes.map((f,i)=>mkFoe(f,i));
    layoutUnits(allies,foes,opt);
    B={opt,allies,foes,units:[...allies,...foes],bg:bgKey,round:0,fx:[],parts:[],shake:0,cur:null,order:[],next:[],done:new Set(),bpUse:0,
      jit:new Map(),key:null,click:null,hover:null,tgtList:null,tsel:0,t0:performance.now(),log:''};
    el.hidden=false;$('bt-help').textContent='↑↓ 选择 · Enter/Z 确定 · Esc/X 返回 · Q/E 或 ←→ 蓄势 · 可点按';
    VFX.reset();newJit();renderCards()});
  bsfx('whoosh');
  if(opt.intro){for(const l of[].concat(opt.intro))typeof l==='function'?await l():await say('',l)}
  if(opt.tutorial){await say('','【教学】敌人脚下的格子是它的「弱点」，初时显示为「？」。用对应的兵刃或内劲击中弱点，便会削去一层护盾。');
    await say('','护盾削光即「破势」：敌人本回合与下回合无法行动，且受到双倍伤害。');
    await say('','每回合积攒一点「蓄势」（菱形）。出招前按 E / → 或点「＋」投入蓄势：普攻变为连击，武学威力大增。')}
  let result;try{result=await battleLoop()}catch(e){
    console.error('战斗循环异常，已中止结算：',e);
    // 异常可能发生在任意行动中。恢复入场状态，且不执行胜负结算，避免误发奖励或推进任务。
    S.hp=hpBefore;S.mp=mpBefore;S.bag=bagBefore;
    B.key=null;B.click=null;B.pickCard=null;B.redraw=null;
    $('bt-cmd').hidden=true;hint('');
    await fade(async()=>{el.hidden=true;mode=prevMode==='map'||prevMode==='battle'?'scene':prevMode;B=null;if(tp)tp.style.display=tpd});
    hud();await toast('战斗发生错误，请重试');
    throw e;
  }
  // 结算
  const hero=B.allies[0],d=derived();
  S.hp=clamp(hero.hp,1,d.mhp);S.mp=clamp(hero.mp,0,d.mmp);
  $('bt-cmd').hidden=true;hint('');
  if(result==='win'){await victory()}
  else if(result==='lose'){await bigText('败','#d9553a',1100);
    if(!opt.noLose){await fade(async()=>{el.hidden=true;B=null;mode='scene'});
      await narr('你眼前一黑，倒在了地上……');await narr('醒来时，你已躺在羊太傅庙中。老僧说，是一位路过的船夫把你背了回来。');
      S.hp=d.mhp;S.mp=d.mmp;S.silver=Math.floor(S.silver/2);if(tp)tp.style.display=tpd;await goScene('temple',[24,20.5]);hud();return'lose'}
    S.hp=Math.max(S.hp,Math.round(d.mhp*.3))}
  else{await bigText('脱身','#9fd4ee',900)}
  await fade(async()=>{el.hidden=true;mode=prevMode==='map'||prevMode==='battle'?'scene':prevMode;B=null;if(tp)tp.style.display=tpd});hud();return result}

// ───────── 回合 ─────────
const aliveOf=side=>B.units.filter(u=>u.hp>0&&(!side||u.side===side));
function newJit(){B.jit=new Map(B.units.map(u=>[u,rnd(0,3)]))}
function calcOrder(){return aliveOf().slice().sort((a,b)=>((b.prio?100:0)+b.spd+B.jit.get(b))-((a.prio?100:0)+a.spd+B.jit.get(a)))}
async function battleLoop(){
  while(true){B.round++;B.done=new Set();
    for(const u of B.allies)if(u.hp>0){if(B.round>1&&!u.boosted)u.bp=Math.min(5,u.bp+1);u.boosted=false}
    for(const u of B.foes)if(u.broken&&B.round>u.brokenUntil){u.broken=false;u.shield=u.maxShield;floatTxt(u,'护盾恢复','#9fd4ee',18)}
    B.order=calcOrder();for(const u of B.order)u.prio=false;newJit();B.next=calcOrder();
    for(const u of B.foes)if(u.hp>0)planIntent(u);
    renderCards();await wait(250);
    for(const u of B.order){if(u.hp<=0){B.done.add(u);continue}
      const r=endCheck();if(r)return r;
      B.cur=u;renderCards();
      if(u.side==='foe'){if(u.broken){floatTxt(u,'破势中','#aaa',18);await wait(450)}
        else{await foeAct(u);if(u.bossy&&u.hp>0&&u.hp<u.mhp*.5&&!u.broken&&!endCheck()){planIntent(u);await wait(300);await foeAct(u)}}}
      else{u.defend=false;
        if(u.stun){u.stun=false;floatTxt(u,'眩晕','#e0c0ff',20);await wait(600)}
        else{const r2=u.pet?await petTurn(u):await allyTurn(u);if(r2==='flee')return'flee'}}
      tickBuffs(u);B.done.add(u);B.cur=null;renderCards();
      const r3=endCheck();if(r3)return r3;await wait(160)}
    B.cur=null}}
function endCheck(){if(!aliveOf('foe').length)return'win';if(!aliveOf('ally').length)return'lose';return null}
function tickBuffs(u){if(u.buffs.ding&&--u.buffs.ding<=0)delete u.buffs.ding;
  if(u.bleedN>0&&u.hp>0){const d=Math.max(1,Math.round(u.mhp*.06));u.hp=Math.max(0,u.hp-d);u.bleedN--;floatTxt(u,'毒 '+d,'#86d65e',20)}}

// ───────── 敌人 AI（出手意图预告） ─────────
function planIntent(u){const al=aliveOf('ally');if(!al.length)return;const has=k=>u.skills.includes(k);
  if(u.charging){u.intent={sk:'ghost',all:true};return}
  if(has('ghost')&&!u.broken&&B.round>1&&Math.random()<(u.hp<u.mhp*.6?.5:.3)){u.intent={charge:true};return}
  let sk=u.skills.filter(k=>k!=='ghost');sk=sk.length?sk[ri(0,sk.length-1)]:'blade';
  let tgt;if(u.art==='wolf'||(BSK[sk]&&BSK[sk].stun))tgt=al.slice().sort((a,b)=>a.hp/a.mhp-b.hp/b.mhp)[0];else tgt=al[ri(0,al.length-1)];
  if(u.art==='wolf'&&Math.random()<.4)tgt=al[ri(0,al.length-1)];
  u.intent={sk,tgt}}
function intentLabel(u){const it=u.intent;if(!it)return'';if(it.charge)return'蓄力中 · 下回合全体攻击';const n=SKILLS[it.sk]?SKILLS[it.sk].name:'攻击';return it.all?`‼ ${n} · 全体`:`${n} → ${it.tgt?it.tgt.name:''}`}
async function foeAct(u){const it=u.intent||{};u.intent=null;
  if(it.charge){u.charging=true;floatTxt(u,'蓄力！','#ffe25a',24);bsfx('whoosh',.8,.7);await wait(700);u.intent={sk:'ghost',all:true};return}
  u.charging=false;const sk=SKILLS[it.sk]||SKILLS.blade,info=BSK[it.sk]||{t:'刀'};
  const al=aliveOf('ally');if(!al.length)return;
  let tg=it.all?al:[it.tgt&&it.tgt.hp>0?it.tgt:al[ri(0,al.length-1)]];
  showName(u,sk.name);if(it.sk==='ghost')await VFX.cast(u,'ghost',tg,0);await lunge(u,tg[0]);
  const hits=info.hits||1;
  for(let h=0;h<hits;h++){for(const t of tg){if(t.hp<=0)continue;
      if(!it.all&&chance(t.dodge*.6)){floatTxt(t,'闪','#bcd',24);continue}
      let dmg=(u.atk*(sk.pow||1)*(hits>1?.65:1)*(it.all?.85:1))-t.def*.5;if(t.buffs.ding)dmg*=.8;if(t.defend)dmg*=.5;
      dmg=Math.max(1,Math.round(dmg*rnd(.9,1.1)));hurt(t,dmg,'#ff9c80');VFX.hit(u,t,info.t,it.sk,0);
      if(info.stun&&t.hp>0&&chance(sk.stun||25)){t.stun=true;floatTxt(t,'眩晕','#e0c0ff',20)}}
    renderCards();await wait(260)}
  await wait(250)}

// ───────── 我方回合 ─────────
function allyTurn(u){return new Promise(res=>{B.bpUse=0;const cmd=$('bt-cmd');
  // 菜单放在我方站位左侧（我方最左 x≈640），不遮挡任何我方单位，也不压到敌人盾行（敌方最右 ≈395）
  const place=()=>{const lx=Math.min(...B.allies.map(a=>a.x))-unitH(u)*.25;cmd.style.left=Math.max(400,Math.min(lx-222,600))+'px';cmd.style.top='';cmd.style.bottom='82px'};
  const done=async(fn,nob)=>{cmd.hidden=true;B.key=null;hint('');if(nob)B.bpUse=0;const use=B.bpUse;if(use){u.bp-=use;u.boosted=true}B.bpUse=use;renderCards();const r=await fn(use);B.bpUse=0;res(r)};
  const boostCtl=()=>`<div class="ft"><span>蓄势</span><button data-b="-1">－</button><span style="color:var(--hi);min-width:1em;text-align:center">${B.bpUse}</span><button data-b="1">＋</button><span class="pips">${pips(u.bp,B.bpUse)}</span></div>`;
  const setBp=d=>{const n=clamp(B.bpUse+d,0,Math.min(3,u.bp));if(n!==B.bpUse){B.bpUse=n;bsfx('select',.6,1+n*.15);renderCards();B.redraw&&B.redraw()}};
  // 通用菜单
  const menu=(title,rows,back,onSel)=>{let sel=Math.max(0,rows.findIndex(r=>!r.dis));
    const draw=()=>{cmd.hidden=false;place();cmd.innerHTML=`<div class="hd"><b>${esc(u.name)}</b><span style="font-size:12px;color:var(--dim)">${title}</span></div>`+
      rows.map((r,i)=>`<div class="row ${i===sel?'sel':''} ${r.dis?'dis':''}" data-i="${i}"><span class="kn">${i<9?i+1:''}</span>${r.ico||''}<span>${r.label}</span><span class="r">${r.right||''}</span></div>`).join('')+(title==='道具'?'':boostCtl());
      cmd.querySelectorAll('.row').forEach(e=>{e.onpointerenter=()=>{const i=+e.dataset.i;if(i!==sel&&!rows[i].dis){sel=i;draw()}};e.onclick=()=>pick(+e.dataset.i)});
      cmd.querySelectorAll('[data-b]').forEach(b=>b.onclick=e=>{e.stopPropagation();setBp(+b.dataset.b)});
      const r=rows[sel];hint(r&&r.desc?r.desc:'')};
    const pick=i=>{if(rows[i].dis){bsfx('menu_close',.5);return}bsfx('select');onSel(rows[i].val)};
    B.redraw=draw;draw();
    B.key=k=>{if(k==='up'||k==='down'){const d=k==='up'?-1:1;let i=sel;for(let n=0;n<rows.length;n++){i=(i+d+rows.length)%rows.length;if(!rows[i].dis)break}sel=i;draw();bsfx('blip',.6)}
      else if(k==='ok')pick(sel);else if(k==='back'&&back){bsfx('menu_close',.6);back()}else if(k==='left')setBp(-1);else if(k==='right')setBp(1);else if(k==='bm')setBp(-1);else if(k==='bp')setBp(1);
      else if(k[0]==='n'){const i=+k.slice(1)-1;if(rows[i]&&!rows[i].dis){sel=i;draw();pick(i)}}}};
  // 目标选择
  const target=(side,all,back,go,desc)=>{const list=side==='foe'?aliveOf('foe'):aliveOf('ally');if(!list.length){back();return}
    cmd.hidden=true;B.tgtList=list;B.tgtAll=all;B.tsel=side==='foe'?0:Math.max(0,list.indexOf(u));
    const fin=()=>{const tl=B.tgtList;B.tgtList=null;B.click=null;B.pickCard=null;B.pv=null;return tl};
    const info=()=>{const t=list[B.tsel];let s=`<span style="color:var(--gold)">${desc}</span> · `;
      if(all)s+=side==='foe'?'全体敌人':'全体同伴';else{s+=esc(t.name);if(side==='foe')s+=' '+t.weak.map(w=>t.known.has(w)?`<span class="w" style="color:${WCOL[w]}">${w}</span>`:'<span class="w" style="color:#888">？</span>').join('')}
      if(side==='foe'&&B.pv){const v=B.pv(B.bpUse),ts=all?list:[t];const ests=ts.map(x=>estDmg(u,x,v));const wk=ts.some(x=>hitsWeak(x,v));
        s+=` · <span class="pv">预计 ${Math.min(...ests)}${ests.length>1||v.hits>1?'':''}${Math.max(...ests)!==Math.min(...ests)?'~'+Math.max(...ests):''}${v.hits>1?' ×'+v.hits:''}</span>`+(wk?' <span class="wk">弱点！</span>':'')}
      hint(s+`<span style="color:var(--dim);font-size:12px"> · 蓄势 ${B.bpUse}</span>`);renderCards()};
    B.redraw=info;info();
    const ok2=()=>{const tl=fin();bsfx('select');go(all?tl:[tl[B.tsel]])};
    B.key=k=>{if(k==='left'||k==='up'){if(!all){B.tsel=(B.tsel-1+list.length)%list.length;bsfx('blip',.6)}info()}
      else if(k==='right'||k==='down'){if(!all){B.tsel=(B.tsel+1)%list.length;bsfx('blip',.6)}info()}
      else if(k==='ok')ok2();else if(k==='back'){fin();bsfx('menu_close',.6);back()}else if(k==='bm')setBp(-1);else if(k==='bp')setBp(1)};
    B.click=(x,y)=>{const hit=unitAt(x,y);if(hit&&list.includes(hit)){if(all||list[B.tsel]===hit)ok2();else{B.tsel=list.indexOf(hit);info()}}};
    B.pickCard=hit=>{if(all||list[B.tsel]===hit)ok2();else{B.tsel=list.indexOf(hit);info()}}};
  const main=()=>{B.tgtList=null;const flee=!B.opt.boss&&!B.opt.tutorial&&!B.opt.noFlee;
    const inv=Object.entries(S.bag||{}).filter(([k,n])=>n>0&&ITEMS[k]&&(ITEMS[k].heal||ITEMS[k].mp));
    menu('第 '+B.round+' 回合',[
      {label:'攻击',val:'atk',ico:tyTag(u.atkType),right:u.atkName,desc:`以${u.atkName}出手（${u.atkType}）· 蓄势可连击 ${1+B.bpUse} 次`},
      {label:'武学',val:'sk',ico:tyTag('武'),dis:!u.skills.length,desc:'施展武学，消耗内力'},
      {label:'道具',val:'it',ico:tyTag('药'),dis:!inv.length,desc:'使用行囊中的药物'},
      {label:'防御',val:'def',ico:tyTag('守'),desc:'本回合受伤减半，下回合率先行动'},
      ...(flee?[{label:'逃跑',val:'run',ico:tyTag('走'),desc:'试图脱离战斗'}]:[])],null,v=>{
      if(v==='atk'){B.pv=bp=>({t:u.atkType,pow:1,hits:1+bp})}
      if(v==='atk')target('foe',false,main,t=>done(bp=>doAttack(u,t[0],bp)),u.atkName+(B.bpUse?` ×${1+B.bpUse}`:''));
      else if(v==='sk')skills();else if(v==='it')items(inv);
      else if(v==='def')done(async()=>{u.defend=true;u.prio=true;floatTxt(u,'防御','#9fd4ee',22);await wait(450)},1);
      else if(v==='run')done(async()=>{const fs=aliveOf('foe'),ps=aliveOf('ally');const p=clamp(55+(avg(ps,'spd')-avg(fs,'spd'))*6,20,90);
        if(chance(p)){bsfx('whoosh');return'flee'}floatTxt(u,'逃跑失败','#aaa',22);await wait(600)},1)})};
  const skills=()=>{menu('武学',u.skills.map(k=>{const sk=SKILLS[k],bi=BSK[k]||{},need=sk.needWeapon&&u.isHero&&u.atkType!==sk.needWeapon;
      return{label:sk.name,val:k,ico:tyTag(bi.t||(sk.heal||bi.buff?'医':'内'))+(bi.e?tyTag(bi.e):''),right:sk.mp?sk.mp+' 内':'',dis:u.mp<(sk.mp||0)||need,desc:(sk.desc||'')+(need?`（需装备${sk.needWeapon}）`:'')}}),main,k=>{
      const bi=BSK[k]||{},tg=bi.tgt||(SKILLS[k].heal?'ally':'foe');
      const go=t=>done(bp=>doSkill(u,k,t,bp));B.pv=bp=>skillPv(u,k,bp);
      if(tg==='self')go([u]);else target(tg==='foe'||tg==='foes'?'foe':'ally',tg==='foes'||tg==='allies',skills,go,SKILLS[k].name)})};
  const items=inv=>{menu('道具',inv.map(([k,n])=>({label:ITEMS[k].name,val:k,right:'×'+n,desc:ITEMS[k].desc})),main,k=>target('ally',false,()=>items(inv),t=>done(async()=>{
      const it=ITEMS[k];S.bag[k]--;const x=t[0];await lunge(u,x,.3);if(it.heal){heal(x,it.heal)}if(it.mp){x.mp=Math.min(x.mmp,x.mp+it.mp);floatTxt(x,'内力+'+it.mp,'#8cf',22)}renderCards();await wait(500)},1),ITEMS[k].name))};
  main()})}
const avg=(l,f)=>l.reduce((s,u)=>s+u[f],0)/Math.max(1,l.length);

// ───────── 出手结算 ─────────
async function doAttack(u,t,bp){const hits=1+bp;if(bp)await boostFx(u,bp);
  showName(u,u.atkName+(hits>1?` ×${hits}`:''));VFX.act(u,'atk');await lunge(u,t);
  for(let h=0;h<hits;h++){if(t.hp<=0)break;if(h)VFX.act(u,'atk2');strike(u,t,{pow:1,t:u.atkType});VFX.hit(u,t,u.atkType,null,bp);await wait(hits>1?190:300)}
  await wait(300)}
async function doSkill(u,k,tgs,bp){const sk=SKILLS[k],bi=BSK[k]||{};u.mp-=sk.mp||0;renderCards();if(bp)await boostFx(u,bp);showName(u,sk.name);
  const lvM=1+.15*(((u.skLv||{})[k]||1)-1);
  if(sk.heal||bi.buff){VFX.act(u,'cast');await VFX.cast(u,k,tgs,bp)}
  if(sk.heal){await lunge(u,tgs[0],.3);for(const t of tgs)if(t.hp>0)heal(t,Math.round(t.mhp*sk.heal*lvM*(1+bp*.5)));await wait(600);return}
  if(bi.buff){await lunge(u,tgs[0],.3);for(const t of tgs){t.buffs.ding=2+bp;floatTxt(t,'定神 · 攻防提升','#ffe7a0',20)}renderCards();await wait(600);return}
  const hits=(bi.hits||1)+(bi.hits?bp:0),pow=(sk.pow||1)*lvM*(bi.hits?1/Math.sqrt(bi.hits):1)*(bi.hits?1:1+bp*.8);
  VFX.act(u,'atk');await VFX.cast(u,k,tgs,bp);await lunge(u,tgs[0]);
  for(let h=0;h<hits;h++){if(h)VFX.act(u,'atk2');for(const t of tgs){if(t.hp<=0)continue;strike(u,t,{pow,t:bi.t,e:bi.e});VFX.hit(u,t,bi.t,k,bp);
      if(h===0&&bi.reveal&&t.hp>0)reveal(t,bi.reveal+(bp?1:0));
      if(bi.bleed&&t.hp>0)t.bleedN=3;
      if(bi.stun&&t.hp>0&&!t.broken&&chance(sk.stun||25)){t.intent=null;floatTxt(t,'眩晕 · 失去行动','#e0c0ff',18)}}
    await wait(hits>1?200:300)}
  await wait(300)}
// 预估（与 doSkill/strike 同公式，不含暴击与浮动）
function skillPv(u,k,bp){const sk=SKILLS[k],bi=BSK[k]||{},lvM=1+.15*(((u.skLv||{})[k]||1)-1);if(sk.heal||bi.buff)return null;
  return{t:bi.t,e:bi.e,hits:(bi.hits||1)+(bi.hits?bp:0),pow:(sk.pow||1)*lvM*(bi.hits?1/Math.sqrt(bi.hits):1)*(bi.hits?1:1+bp*.8)}}
const hitsWeak=(t,v)=>!!v&&[v.t,v.e].some(w=>w&&t.weak.includes(w)&&t.known.has(w));
function estDmg(u,t,v){if(!v)return 0;let d=u.atk*v.pow*(u.buffs.ding?1.3:1)-t.def*.5;if(hitsWeak(t,v))d*=1.25;if(t.broken)d*=2;return Math.max(1,Math.round(d))}
function reveal(t,n){const hid=t.weak.filter(w=>!t.known.has(w));for(let i=0;i<n&&hid.length;i++){const w=hid.splice(ri(0,hid.length-1),1)[0];t.known.add(w);floatTxt(t,'看破：'+w,WCOL[w],20,1)}}
function strike(u,t,{pow,t:ty,e}){
  let weakHit=false;if(t.side==='foe'){for(const w of[ty,e])if(w&&t.weak.includes(w)){weakHit=true;if(!t.known.has(w)){t.known.add(w);t.revealT=performance.now()}}}
  let dmg=u.atk*pow*(u.buffs.ding?1.3:1)-t.def*.5;if(weakHit)dmg*=1.25;if(t.broken)dmg*=2;
  const cr=chance(u.crit);if(cr)dmg*=1.5;dmg=Math.max(1,Math.round(dmg*rnd(.92,1.08)));
  if(weakHit){bpop(t,'WEAK','#ffe25a');if(!t.broken&&t.shield>0){t.shield--;t.shieldHit=performance.now();if(t.shield===0)doBreak(t)}}
  hurt(t,dmg,cr?'#ffd24a':t.broken?'#ff6a4a':'#fff3e0',cr)}
function doBreak(t){VFX.brk(t);t.broken=true;t.brokenUntil=B.round+1;t.charging=false;t.intent=null;t.breakT=performance.now();B.shake=14;bsfx('whoosh',1,.6);
  bpop(t,'破 势','#ff7a3a',1);for(let i=0;i<26;i++){const a=rnd(0,Math.PI*2),s=rnd(2,7);B.parts.push({x:t.x,y:t.y-unitH(t)*.55,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,r:rnd(3,9),rot:rnd(0,6),vr:rnd(-.3,.3),life:rnd(40,70),c:Math.random()<.5?'#bfe6ff':'#ffe7a0'})}}
function hurt(t,dmg,col,big){t.hp=Math.max(0,t.hp-dmg);t.flash=performance.now();t.ghT=performance.now();if(t.isHero&&t.hp>0)VFX.act(t,'hurt');t.kb=performance.now();B.shake=Math.max(B.shake,big?8:4);bsfx('advance',.9,.7+Math.random()*.2);
  floatTxt(t,String(dmg),col,big?34:28);if(t.hp<=0){t.dieT=performance.now();t.intent=null;if(t.side==='ally'){t.bp=0;t.defend=false;t.stun=false}}renderCards()}
function heal(t,n){const h=Math.min(n,t.mhp-t.hp);t.hp+=h;floatTxt(t,'+'+h,'#7fe0a0',28);for(let i=0;i<10;i++)B.parts.push({x:t.x+rnd(-25,25),y:t.y-rnd(10,80),vx:0,vy:-rnd(.6,1.6),r:rnd(2,4),life:rnd(30,50),c:'#9ff0b0',glow:1});bsfx('chime',.5);renderCards()}
async function boostFx(u,bp){B.boostT=performance.now();B.boostU=u;floatTxt(u,'蓄势 '+'◆'.repeat(bp),'#ffcf73',22);bsfx('chime',.6,1+bp*.1);await wait(420)}
function showName(u,n){B.banner={t:n,side:u.side,t0:performance.now()}}
async function lunge(u,t,k=1){const dx=t&&t!==u?(t.x-u.x):0;u.lunge={t0:performance.now(),dx:dx?Math.sign(dx)*Math.min(Math.abs(dx)-90,260)*k:0};await wait(230)}
function floatTxt(u,t,c,size=26,slow){B.fx.push({x:u.x+rnd(-14,14),y:u.y-unitH(u)*.7-B.fx.filter(f=>f.u===u&&performance.now()-f.t0<300).length*22,t,c,size,t0:performance.now(),life:slow?1500:1000,u})}
function bpop(u,t,c,big){B.fx.push({x:u.x,y:u.y-unitH(u)*(big?.5:1.12),t,c,size:big?38:22,t0:performance.now(),life:big?1300:800,pop:1,u})}
async function bigText(t,c,ms){B.big={t,c,t0:performance.now(),ms};await wait(ms)}

// ───────── 胜利结算 ─────────
async function victory(){bsfx('chime');await bigText('胜','#f3d58e',900);
  let exp=0,sil=0;const drops={};for(const f of B.foes){exp+=f.exp;sil+=f.silver;for(const[k,p]of Object.entries(f.drops||{}))if(ITEMS[k]&&chance(p))drops[k]=(drops[k]||0)+1}
  exp=Math.round(exp*(B.opt.tutorial?.5:1));S.exp+=exp;S.silver+=sil;for(const[k,n]of Object.entries(drops))S.bag[k]=(S.bag[k]||0)+n;
  const lvl=[];while(S.exp>=S.lv*100){S.exp-=S.lv*100;S.lv++;S.pts+=3;const d=derived();S.hp=d.mhp;S.mp=d.mmp;lvl.push(S.lv)}
  if(sil)bsfx('coin');
  const w=document.createElement('div');w.id='bt-win';w.className='frame';
  w.innerHTML=`<h2>胜</h2><div class="ln"><span>修为</span><b>+${exp}</b></div><div class="ln"><span>银两</span><b>+${sil}</b></div>
    <div class="ln"><span>战利品</span><b>${Object.entries(drops).map(([k,n])=>ITEMS[k].name+'×'+n).join('、')||'—'}</b></div>
    ${lvl.map(l=>`<div class="lv">境界突破 · 第 ${l} 层 &nbsp;<span style="color:var(--dim);font-size:12px">属性点 +3</span></div>`).join('')}
    <div class="go">点击或按 Enter 继续</div>`;
  $('bt').appendChild(w);await wait(350);
  await new Promise(r=>{const f=()=>{removeEventListener('keydown',kf,true);w.removeEventListener('pointerdown',f);B.click=null;r()};
    const kf=e=>{if(['Enter',' ','z','Z','Escape'].includes(e.key)){e.preventDefault();e.stopPropagation();f()}};
    addEventListener('keydown',kf,true);w.addEventListener('pointerdown',f);B.click=()=>f()});
  bsfx('select');w.remove()}

// ───────── 输入 ─────────
function unitAt(x,y){let best=null;for(const u of aliveOf()){const h=unitH(u),w=Math.max(40,h*.32);if(Math.abs(x-u.x)<w&&y<u.y+30&&y>u.y-h){if(!best||u.y>best.y)best=u}}return best}
function cellAt(x,y){return CAM.toWorld(x,y)} // main.js 以 B.click(...cellAt(x,y)) 分发画布点击
addEventListener('keydown',e=>{if(mode!=='battle'||!B||!B.key||(typeof dlgBusy!=='undefined'&&dlgBusy))return;const k=e.key.toLowerCase();
  const m={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right',enter:'ok',' ':'ok',z:'ok',j:'ok',escape:'back',x:'back',backspace:'back',k:'back',q:'bm',e:'bp',pageup:'bm',pagedown:'bp',1:'n1',2:'n2',3:'n3',4:'n4',5:'n5',6:'n6',7:'n7',8:'n8',9:'n9'}[k];
  if(!m)return;e.preventDefault();if(e.repeat&&(m==='ok'||m==='back'))return;B.key(m)});

// ───────── 绘制 ─────────
function drawBattleBg(){const k=B.bg;
  if(ok(IMG[k])){g.drawImage(IMG[k],0,0,W,H)}
  else{const m=IMG['m_'+(S.scene||'street')];g.fillStyle='#1d1812';g.fillRect(0,0,W,H);
    if(ok(m)){const s=Math.max(W/m.naturalWidth,H/m.naturalHeight)*1.1;g.save();g.filter='blur(4px) brightness(.5) saturate(.8)';g.drawImage(m,(W-m.naturalWidth*s)/2,(H-m.naturalHeight*s)/2,m.naturalWidth*s,m.naturalHeight*s);g.restore()}}
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(8,5,3,.55)');gr.addColorStop(.18,'rgba(8,5,3,.1)');gr.addColorStop(.62,'rgba(8,5,3,.05)');gr.addColorStop(1,'rgba(8,5,3,.55)');g.fillStyle=gr;g.fillRect(0,0,W,H);
  // 地面线
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(0,372,W,H-372);g.strokeStyle='rgba(243,213,142,.18)';g.beginPath();g.moveTo(0,372.5);g.lineTo(W,372.5);g.stroke()}
function headChip(u,x,y,s,dim){g.save();g.beginPath();g.rect(x,y,s,s);g.clip();g.fillStyle=u.side==='foe'?'#3a1a14':'#14261c';g.fillRect(x,y,s,s);
  const im=IMG[`c_${u.art}_d_0`]||IMG[`c_${u.art}_d`];
  if(ok(im)){const iw=im.naturalWidth,ih=im.naturalHeight,cs=Math.min(iw,ih*.55)*(u.art==='dog'||u.art==='wolf'||u.art==='snake'?1:.62);const sx=(iw-cs)/2,sy=u.art==='dog'||u.art==='wolf'||u.art==='snake'?ih*.2:ih*.02;g.imageSmoothingEnabled=false;g.drawImage(im,sx,sy,cs,cs,x,y,s,s);g.imageSmoothingEnabled=true}
  else{g.fillStyle='#000';g.beginPath();g.arc(x+s/2,y+s*.62,s*.34,0,7);g.fill();g.fillStyle='#ddd';g.font=`${s*.4}px var(--serif),serif`;g.textAlign='center';g.fillText(u.name[0],x+s/2,y+s*.7)}
  if(dim){g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x,y,s,s)}g.restore();
  g.strokeStyle=u.side==='foe'?'#c4462f':'#5fa27c';g.lineWidth=1.5;g.strokeRect(x+.5,y+.5,s-1,s-1);g.lineWidth=1}
function drawOrderBar(t){const x0=12,y0=10,s=34;if(!B.round)return;
  g.fillStyle='rgba(12,9,6,.82)';g.fillRect(0,0,W,56);g.strokeStyle='rgba(163,138,94,.55)';g.beginPath();g.moveTo(0,56.5);g.lineTo(W,56.5);g.stroke();
  g.font='15px "ZCOOL XiaoWei","Noto Serif SC",serif';g.textAlign='left';g.fillStyle='#e0bf78';g.fillText('第'+B.round+'回',x0,y0+23);
  let x=x0+56;const draw=(list,cur)=>{for(const u of list){if(u.hp<=0&&!cur)continue;const done=cur&&(B.done.has(u)||u.hp<=0),isCur=cur&&u===B.cur,sk=u.side==='foe'&&u.broken;
      const sz=isCur?s+8:s,yy=isCur?y0-3:y0+1;headChip(u,x,yy,sz,done||sk);
      if(isCur){g.strokeStyle='#ffd24a';g.lineWidth=2;g.strokeRect(x-1,yy-1,sz+2,sz+2);g.lineWidth=1}
      if(sk){g.fillStyle='#ff7a3a';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText('破',x+sz/2,yy+sz-3)}
      x+=sz+5}};
  draw(B.order,true);x+=10;g.fillStyle='rgba(224,191,120,.5)';g.fillRect(x,8,1,40);x+=10;
  g.fillStyle='#9c8b70';g.font='12px "Noto Serif SC",serif';g.textAlign='left';g.fillText('下回合',x,y0+22);x+=44;
  g.globalAlpha=.75;draw(B.next.filter(u=>u.hp>0&&!(u.side==='foe'&&u.broken&&u.brokenUntil>=B.round+1)),false);g.globalAlpha=1}
function drawShieldRow(u,t){const y=u.y+10,cwf=w=>w.length>1&&u.known.has(w)?30:19,w0=26+u.weak.reduce((a,w)=>a+cwf(w)+2,0),x=u.x-w0/2;
  g.fillStyle='rgba(8,6,4,.78)';g.fillRect(x-3,y-2,w0+6,24);g.strokeStyle='rgba(163,138,94,.6)';g.strokeRect(x-2.5,y-1.5,w0+5,23);
  // 盾
  const sx=x+11,sy=y+10,hitA=u.shieldHit?Math.max(0,1-(t-u.shieldHit)/300):0;
  g.save();g.translate(sx,sy);if(hitA)g.scale(1+hitA*.4,1+hitA*.4);g.beginPath();g.moveTo(-9,-9);g.lineTo(9,-9);g.lineTo(9,1);g.quadraticCurveTo(9,8,0,11);g.quadraticCurveTo(-9,8,-9,1);g.closePath();
  g.fillStyle=u.broken?'#555':'#2c5f8a';g.fill();g.strokeStyle=u.broken?'#999':'#bfe6ff';g.stroke();
  g.fillStyle=u.broken?'#ff7a3a':'#fff';g.font='bold 12px sans-serif';g.textAlign='center';g.fillText(u.broken?'✕':u.shield,0,4);g.restore();
  let cx0=x+26;u.weak.forEach((w,i)=>{const cw=cwf(w),cx=cx0,kn=u.known.has(w);cx0+=cw+2;g.fillStyle=kn?'rgba(40,30,20,.95)':'rgba(30,30,30,.9)';g.fillRect(cx,y+1,cw,cw);
    g.strokeStyle=kn?WCOL[w]:'#555';g.strokeRect(cx+.5,y+1.5,cw-1,cw-1);
    const pv=B.pv&&B.tgtList&&B.tgtList.includes(u)?B.pv(B.bpUse):null;if(kn&&pv&&(pv.t===w||pv.e===w)){const a=.55+.45*Math.sin(t/110);g.save();g.strokeStyle=`rgba(255,226,90,${a})`;g.lineWidth=2;g.strokeRect(cx-1,y-1,cw+2,cw+4);g.fillStyle=`rgba(255,226,90,${a})`;g.beginPath();g.moveTo(cx+cw/2-4,y-7);g.lineTo(cx+cw/2+4,y-7);g.lineTo(cx+cw/2,y-2);g.fill();g.restore()}g.fillStyle=kn?WCOL[w]:'#888';g.font='13px "Noto Serif SC",serif';g.fillText(kn?w:'?',cx+cw/2,y+15)});
  // 血条
  g.fillStyle='#000';g.fillRect(x,y+24,w0,4);g.fillStyle='#f3e0b0';g.fillRect(x,y+24,w0*(u.gh??u.hp)/u.mhp,4);g.fillStyle=u.broken?'#ff7a3a':'#c4462f';g.fillRect(x,y+24,w0*u.hp/u.mhp,4)}
// 残血：受击后 0.4s 再缓慢回落，便于看清这一下打掉多少
function ghostTick(u,now){if(u.gh==null||u.gh<u.hp)u.gh=u.hp;if(u.gh>u.hp&&now-(u.ghT||0)>400)u.gh=Math.max(u.hp,u.gh-u.mhp*.012)}
function syncCardGhost(){const el=$('bt-cards');if(!el)return;B.allies.forEach((u,i)=>{const e=el.querySelector(`.bt-card[data-i="${i}"] .gh`);if(e)e.style.width=100*(u.gh??u.hp)/u.mhp+'%'})}
// 我方选择指令时，用虚线标出每个敌人本回合的出手目标
function drawIntentLines(now){if(!B.cur||B.cur.side!=='ally')return;g.save();g.setLineDash([6,6]);g.lineDashOffset=-now/40;g.lineWidth=2;
  for(const f of B.foes){const it=f.intent;if(!it||f.hp<=0||f.broken||it.charge)continue;const ts=it.all?aliveOf('ally'):it.tgt&&it.tgt.hp>0?[it.tgt]:[];
    for(const t of ts){const x0=f.x,y0=f.y-unitH(f)*.95,x1=t.x,y1=t.y-unitH(t)*.95,mx=(x0+x1)/2,my=Math.min(y0,y1)-60;
      g.strokeStyle=it.all?'rgba(255,90,60,.5)':'rgba(255,140,110,.38)';g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(mx,my,x1,y1);g.stroke()}}
  g.restore()}
function drawUnit(u,t){const now=t,h=unitH(u);let x=u.x,y=u.y,alpha=1;
  if(u.hp<=0){const k=u.dieT?(now-u.dieT)/600:1;if(u.side==='foe'){if(k>=1)return;alpha=1-k}else alpha=.45}
  if(u.lunge){const k=(now-u.lunge.t0)/420;if(k>=1)u.lunge=null;else x+=u.lunge.dx*Math.sin(Math.min(1,k)*Math.PI)}
  if(u.kb){const k=(now-u.kb)/260;if(k>=1)u.kb=null;else x+=(u.side==='foe'?-1:1)*10*Math.sin(k*Math.PI)}
  const isCur=B.cur===u,tg=B.tgtList&&B.tgtList.includes(u)&&(B.tgtAll||B.tgtList[B.tsel]===u);
  if(isCur&&u.side==='ally'){g.strokeStyle='rgba(255,210,74,.8)';g.lineWidth=2;g.beginPath();g.ellipse(x,y,44,11,0,0,7);g.stroke();g.lineWidth=1}
  if(u.side==='ally'&&B.cur===u&&B.bpUse>0){const r=40+B.bpUse*8+Math.sin(now/90)*3;const gr=g.createRadialGradient(x,y-h*.45,5,x,y-h*.45,r+h*.3);gr.addColorStop(0,'rgba(255,190,80,.0)');gr.addColorStop(.6,`rgba(255,160,40,${.12+B.bpUse*.08})`);gr.addColorStop(1,'rgba(255,120,20,0)');g.fillStyle=gr;g.fillRect(x-r-h*.3,y-h*1.2,(r+h*.3)*2,h*1.4)}
  if(u.charging){const r=50+Math.sin(now/80)*6;const gr=g.createRadialGradient(x,y-h*.5,5,x,y-h*.5,r+h*.3);gr.addColorStop(0,'rgba(255,60,40,0)');gr.addColorStop(.6,'rgba(255,60,30,.25)');gr.addColorStop(1,'rgba(255,40,20,0)');g.fillStyle=gr;g.fillRect(x-r-h*.4,y-h*1.2,(r+h*.4)*2,h*1.4)}
  const key=unitImg(u,u.side==='foe'?'r':'l');
  if(u.broken&&u.hp>0)g.filter='grayscale(.7) brightness(.75)';
  const flash=u.flash&&now-u.flash<200&&((now-u.flash)/50|0)%2===0;
  if(u.isHero&&VFX.drawHero(u,x,y,h,alpha,flash,now)){}
  else if(key){
    g.save();if(u.broken&&u.hp>0){g.translate(x,y);g.rotate(u.side==='foe'?-.08:.08);g.translate(-x,-y)}
    // 没有专用战斗表的同伴沿用探索精灵；按不透明轮廓配齐可见身高与脚底，
    // 否则同为成人、unitH 数值相近却会因源图留白显得矮一截。
    const raw=IMG[key],fit=u.side==='ally'&&!(window.BART&&BART[u.art])&&raw;
    const box=fit&&charBounds(raw),ih=raw&&(raw.naturalHeight||raw.height);
    const dh=box?h*ih/box.height:h;
    const foot=box?(ih-box.bottom)*dh/ih:0;
    if(fit)g.imageSmoothingEnabled=false;
    drawSprite(key,x,y+foot,dh,false,{breath:now/420+u.id*9,alpha,flash});g.restore()}
  else{g.save();g.globalAlpha=alpha*.9;g.fillStyle='#0b0806';g.beginPath();g.ellipse(x,y-h*.35,h*.18,h*.35,0,0,7);g.arc(x,y-h*.82,h*.12,0,7);g.fill();g.restore()}
  g.filter='none';
  if(u.broken&&u.hp>0){for(let i=0;i<3;i++){const a=now/300+i*2.1;g.fillStyle='#ffe25a';g.font='14px serif';g.textAlign='center';g.fillText('✦',x+Math.cos(a)*24,y-h-4+Math.sin(a)*6)}}
}
function drawUnitUI(u,now){const h=unitH(u),x=u.x,y=u.y;const tg=B.tgtList&&B.tgtList.includes(u)&&(B.tgtAll||B.tgtList[B.tsel]===u);
  if(u.side==='foe'&&u.hp>0){drawShieldRow(u,now);
    const lab=intentLabel(u);if(lab&&!u.broken){g.font='13px "Noto Serif SC",serif';const tw=g.measureText(lab).width+14,ly=y-h-26;
      g.fillStyle=u.intent&&(u.intent.charge||u.intent.all)?'rgba(90,20,12,.88)':'rgba(10,8,6,.78)';g.fillRect(x-tw/2,ly-14,tw,20);g.strokeStyle=u.intent&&(u.intent.charge||u.intent.all)?'#ff7a3a':'rgba(163,138,94,.6)';g.strokeRect(x-tw/2+.5,ly-13.5,tw-1,19);
      g.fillStyle='#eee2c6';g.textAlign='center';g.fillText(lab,x,ly+1)}}
  if(tg){const by=y-h-(u.side==='foe'?48:14)+Math.sin(now/140)*4;g.fillStyle=u.side==='foe'?'#ffd24a':'#8fe0a8';g.beginPath();g.moveTo(x-10,by-12);g.lineTo(x+10,by-12);g.lineTo(x,by);g.closePath();g.fill();g.strokeStyle='#000';g.stroke()}}
// ───────── 绘制管线 ─────────
// 各层都是独立的全局函数，可在 bstage.js / bui.js / bfx.js 中重新定义覆盖（分工见 docs/battle-v2.md），不要在这里改层内实现。
// 2D 镜头：update 每帧推进，apply 在世界层绘制前变换 g，toWorld 把画布坐标换回世界坐标（点击/悬停用）。bstage.js 覆盖。
let CAM={update(now){},apply(){},toWorld(x,y){return[x,y]}};
function drawStageFront(now){}   // 世界层前景（雾/尘/光束等），在单位与特效之后、单位 UI 之前（bstage.js）
function drawParts(now){
  // 粒子
  for(const p of B.parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.glow?0:.25;p.life--;p.rot=(p.rot||0)+(p.vr||0);g.globalAlpha=Math.min(1,p.life/25);g.fillStyle=p.c;
    g.save();g.translate(p.x,p.y);g.rotate(p.rot);if(p.glow){g.beginPath();g.arc(0,0,p.r,0,7);g.fill()}else{g.beginPath();g.moveTo(-p.r,0);g.lineTo(0,-p.r*.6);g.lineTo(p.r,p.r*.3);g.closePath();g.fill()}g.restore()}
  g.globalAlpha=1;B.parts=B.parts.filter(p=>p.life>0);
}
function drawBreakFlash(now){
  // 破势闪光
  for(const u of B.foes)if(u.breakT&&now-u.breakT<350){g.fillStyle=`rgba(255,240,200,${.35*(1-(now-u.breakT)/350)})`;g.fillRect(0,0,W,H)}
}
function drawFloats(now){
  // 浮字
  for(const f of B.fx){const k=(now-f.t0)/f.life;if(k>=1)continue;let y=f.y-k*30,sc=1;
    if(/^\d+$/.test(f.t)){const e=now-f.t0,BO=[0,-12,-20,-24,-22,-20];y=f.y+(e<300?BO[Math.min(5,e/50|0)]:-20-(e-300)*.025);sc=e<70?1.4:1}if(f.pop){y=f.y-Math.min(k*3,1)*16;sc=k<.15?.6+k/.15*.6:1.2-Math.min(.2,(k-.15))}
    g.globalAlpha=k>.75?(1-k)/.25:1;g.font=`bold ${Math.round(f.size*sc)}px "ZCOOL XiaoWei","Noto Serif SC",serif`;g.textAlign='center';g.lineWidth=f.pop?5:4;g.strokeStyle='#120a04';g.strokeText(f.t,f.x,y);g.fillStyle=f.c;g.fillText(f.t,f.x,y)}
  g.globalAlpha=1;B.fx=B.fx.filter(f=>now-f.t0<f.life);g.lineWidth=1;
}
function drawBanner(now){
  // 招式名横幅
  if(B.banner){const k=(now-B.banner.t0)/1100;if(k>=1)B.banner=null;else{const a=k<.1?k/.1:k>.8?(1-k)/.2:1;g.globalAlpha=a;const y=86,fo=B.banner.side==='foe';
      const gr=g.createLinearGradient(W/2-200,0,W/2+200,0);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(.5,fo?'rgba(80,16,10,.85)':'rgba(20,14,8,.88)');gr.addColorStop(1,'rgba(0,0,0,0)');
      g.fillStyle=gr;g.fillRect(W/2-220,y-20,440,34);g.font='22px "ZCOOL XiaoWei","Noto Serif SC",serif';g.textAlign='center';g.fillStyle=fo?'#ffb49a':'#f3d58e';g.fillText(B.banner.t,W/2,y+5);g.globalAlpha=1}}
}
function drawBig(now){
  if(B.big){const k=(now-B.big.t0)/B.big.ms;if(k<1.4){const a=Math.min(1,k*4)*(k>1?Math.max(0,(1.4-k)/.4):1);g.globalAlpha=a;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,H/2-60,W,110);
    g.font='bold 86px "ZCOOL XiaoWei","Noto Serif SC",serif';g.textAlign='center';g.lineWidth=6;g.strokeStyle='#000';g.strokeText(B.big.t,W/2,H/2+28);g.fillStyle=B.big.c;g.fillText(B.big.t,W/2,H/2+28);g.globalAlpha=1;g.lineWidth=1}}
}
function drawBattle(t){if(!B)return;const now=performance.now();
  CAM.update(now);
  g.save();CAM.apply();if(B.shake>0){g.translate(rnd(-B.shake,B.shake),rnd(-B.shake,B.shake)*.6);B.shake*=.85;if(B.shake<.5)B.shake=0}
  drawBattleBg();
  drawIntentLines(now);
  for(const u of B.units.slice().sort((a,b)=>a.y-b.y))drawUnit(u,now);
  VFX.draw(now);
  drawParts(now);
  drawStageFront(now);
  for(const u of B.units){ghostTick(u,now);if(u.hp>0)drawUnitUI(u,now)}
  drawFloats(now);
  drawBreakFlash(now);
  g.restore();
  syncCardGhost();
  vignette();drawOrderBar(now);drawBanner(now);drawBig(now);
  // 悬停选择目标
  if(B.tgtList&&B.hover&&!B.tgtAll&&B.hover!==B.lastHover){B.lastHover=B.hover;const h=unitAt(...B.hover);if(h&&B.tgtList.includes(h)&&B.tgtList[B.tsel]!==h){B.tsel=B.tgtList.indexOf(h);B.redraw&&B.redraw()}}}
