'use strict';
// 偷窃系统·核心管线（2026-10-27 开发三子任务一）：下手把握、列表、成功率、结算。不认识任何具体人物或物品 id。
// 依据：../xiaojianghu/docs/design/npc-steal.md（第 4、6、8、11 节）。
(()=>{
 if(typeof isQiheEntry==='function'&&!isQiheEntry())return;
 const D=window.QIHE_STEAL_DATA;if(!D)throw Error('偷窃数据表未加载：js/qihe-steal-data.js');
 const Q=()=>window.QiheNpc;

 // ───── 工具 ─────
 const get=(obj,path)=>{const k=path.split('.');let v=obj;for(const p of k){if(v==null)return undefined;v=v[p]}return v};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 const round=v=>Math.round(v);

 // ───── 存档 ─────
 function state(){const s=S.steal||(S.steal={version:1});s.lv||=1;s.exp||=0;s.taken||={};s.alert||={};s.caught||={};s.rumor||={};
  return s}

 // ── 窃术等级（第 5 节）
 function stealLv(){const s=state(),ex=s.exp;for(let i=D.SKILL.length-1;i>=0;i--)if(ex>=D.SKILL[i].exp)return D.SKILL[i].lv;return 1}
 function addExp(n){const s=state(),before=s.exp;s.exp+=n;const beforeLv=D.SKILL.find(sk=>before>=sk.exp)?.lv||1,afterLv=stealLv();
  if(afterLv>beforeLv)return{levelUp:true,lv:afterLv};return{levelUp:false}}

 // ── 警觉、风声（第 8.1 节）
 function isAlert(npcId){const s=state(),rec=s.alert[npcId];if(!rec)return false;
  const CP=S.qiheChapter;if(!CP)return false;const seg=CP.halfDay||0;return rec.until==='nextSegment'&&rec.at===seg}
 function setAlert(npcId){const s=state(),CP=S.qiheChapter;if(!CP)return;s.alert[npcId]={until:'nextSegment',at:CP.halfDay||0}}
 function rumor(mapId){return state().rumor[mapId]||0}
 function addRumor(mapId,delta){const s=state();s.rumor[mapId]=(s.rumor[mapId]||0)+delta;s.rumor[mapId]=clamp(s.rumor[mapId],0,3)}

 // ── 条件匹配（第 11.2 节）
 const CMP={eq:(a,b)=>a===b,in:(a,b)=>b.includes(a),notIn:(a,b)=>!b.includes(a),gte:(a,b)=>a>=b,lte:(a,b)=>a<=b,not:(a,b)=>a!==b};
 const match=(when,ctx)=>Object.entries(when).every(([path,want])=>{
  const [op,arg]=(want!==null&&typeof want==='object')?Object.entries(want)[0]:['eq',want];
  return CMP[op](get(ctx,path),arg)});

 // ── 取值函数登记表（第 11.2 节）
 const TERM={
  const:t=>t.v,
  table:(t,c)=>{const arr=D[t.table];if(!arr)return 0;const idx=get(c,t.key)-1;if(idx<0||idx>=arr.length)return 0;return arr[idx][t.field]},
  linear:(t,c)=>t.k*(get(c,t.src)+t.offset),
  diff:(t,c)=>clamp(get(c,t.a)-get(c,t.b),t.min,t.max),
  pick:(t,c)=>{if(t.mute&&match(t.mute,c))return 0;return t.map[get(c,t.src)]||0},
  flag:(t,c)=>get(c,t.src)?t.v:0,
  step:(t,c)=>get(c,t.src)>=t.gte?t.v:0
 };

 // ── 差距系数（第 4.2 节）
 function gapFactor(ctx){const d=get(ctx,'target.lv')-get(ctx,'hero.lv');if(d<=0)return 1;
  const s=D.GAP.scaleBase+D.GAP.scalePerLv*get(ctx,'hero.stealLv');return 1/(1+Math.pow(d/s,2))}

 // ── 下手把握（第 4.1 节）
 function grip(ctx){const base=D.GRIP_TERMS.reduce((sum,t)=>sum+TERM[t.op](t,ctx),0);
  return clamp(round(base*gapFactor(ctx)),...D.GAP.clamp)}

 // ── 物品列表（第 7、10 节）：调用 bagOf 获得可见物品，再应用偷窃过滤规则
 // 2026-10-27 主会话：读原始随身物品表（n、c、diff、money 数额）；原先读查看页加工过的条目（name、story、money:true），剧情物没被排除、难度全按 1 算、偷到钱会把 true 加进银两
 function listItems(npcId,target){if(target.noSteal)return[];const bag=(target.bag||[]).map(x=>({...x,n:x.n||(x.money?'钱袋':'？')}));if(!bag.length)return[];
  const s=state(),lv=stealLv(),perks=D.SKILL.find(sk=>sk.lv===lv)?.perks||[];
  const showHidden=perks.some(p=>p.op==='showHidden'),showPrecious=perks.some(p=>p.op==='showPrecious');
  return bag.filter(it=>{
   if(it.c==='剧'&&!it.stealable)return false;  // 剧情物默认不可窃，除非标 stealable
   if(it.look||it.worn)return false;            // 只可见、已穿戴的不进列表
   if(it.c==='贴'&&!showHidden)return false;    // 贴身物窃术 5 级起才显示
   if(it.c==='贵'&&!showPrecious&&it.gate!==0)return false;  // 贵重物窃术 7 级起才显示；标 gate:0 的（宋先生五件、簪、剑诀）开始部分也能试
   if(s.taken[npcId]?.[it.id||it.n])return false;  // 已偷过的不再出现
   if(it.when||it.until){const ctx={item:it,flags:S};if(!Q().test(it.when))return false;if(it.until&&Q().test(it.until))return false}
   return true})}

 // ── 戒心：被你偷走过、失手被发觉过的人会警惕起来，成功率逐级打折（D.WARY）
 function wary(npcId){const s=state(),W=D.WARY||{perTaken:1,perCaught:2,mult:.85,max:6};const taken=Object.keys(s.taken[npcId]||{}).length,caught=s.caught[npcId]?.count||0;
  const lv=Math.min(W.max,taken*W.perTaken+caught*W.perCaught);return{lv,taken,caught,mult:Math.pow(W.mult,lv)}}
 // ── 单件成功率与门槛（第 4.3、4.4 节）
 function chance(npcId,item,gripValue,target){const override=D.OVERRIDES[npcId+'_'+item.id];if(override)return{chance:override.chance,gate:0,ruleset:override.ruleset||'main'};
  const tier=D.TIERS[item.g||'none'];if(!tier)return{chance:1,gate:1,ruleset:'main'};
  const diff=item.diff||1,coef=D.DIFFICULTY[diff]||1,w=wary(npcId);let ch=clamp(round(gripValue*coef*w.mult),...D.GAP.clamp);
  const gate=item.gate??target.gate??tier.gate;
  return{chance:ch,gate,ruleset:'main'}}

 // ── 小游戏参数（第 6 节）
 function minigame(chanceValue,tier,perks){const hands=tier.hands===2&&perks.some(p=>p.op==='hands'&&p.tier==='甲'&&p.set===1)?1:tier.hands;
  const goldRatio=hands===1?chanceValue/100:Math.pow(chanceValue/100,1/hands);
  const redPerk=perks.find(p=>p.op==='redCore');const redRatio=redPerk?redPerk.ratio:0.25;
  return{hands,goldRatio,redRatio,needle:tier.needle}}

 
 // ── 效果登记表（第 11 节）
 const EFFECTS={
  take:(e,c)=>{const s=state();s.taken[c.npcId]||={};s.taken[c.npcId][c.item.id||c.item.n]=true;
   if(c.item.id){S.bag||={};S.bag[c.item.id]=(S.bag[c.item.id]||0)+(c.item.q||1)}
   else if(c.item.money){S.silver=(S.silver||0)+c.item.money}},
  moral:(e,c)=>{const v=e.from?get(c,e.from):e.v;if(typeof window.moral==='function')moral(v)},   // 2026-10-27 原写 morality，函数不存在，扣品德从来没生效
  exp:(e,c)=>{const v=e.from?get(c,e.from):e.v;addExp(v)},
  expBonus:(e,c)=>{if(e.when&&!match(e.when,c))return;addExp(e.v)},
  firstFrom:(e,c)=>{},  // 首次偷到奖励：待主会话接入
  stamp:(e,c)=>{},      // 妙手印记：待主会话接入
  advanceQuest:(e,c)=>{const parts=e.key.split('.');let obj=S;for(let i=0;i<parts.length-1;i++){obj[parts[i]]||={};obj=obj[parts[i]]}
   const last=parts[parts.length-1];obj[last]=(obj[last]||0)+1},
  say:async(e,c)=>{const knot=e.knot.replace('{npc}',c.npcId);if(window.STORY_DATA?.[knot]&&window.QiheChapter?.play)await QiheChapter.play(knot)},   // 走主线 play（站位、等播完）；剧本没有就不说
  alert:(e,c)=>{setAlert(c.npcId);const s=state();s.caught[c.npcId]||={count:0};s.caught[c.npcId].count=(s.caught[c.npcId].count||0)+1},
  bond:(e,c)=>{const tgt=e.target?get(c,e.target):c.npcId;if(!tgt)return;
   const v=e.table?D[e.table][c.caught.count===1?1:'more']:e.v;
   if(Q().bond)Q().bond.add(tgt,v,e.reason?{reason:e.reason}:undefined)},
  rumor:(e,c)=>{const mapId=c.ctx.mapId;if(!mapId)return;if(e.setMax)addRumor(mapId,999);else addRumor(mapId,e.v)},
  emit:(e,c)=>{if(window.QiheJianghu?.emit)QiheJianghu.emit(e.event,{npcId:c.npcId,mapId:c.ctx.mapId,tier:c.tier,repeat:c.caught.count>1,victimIsVillain:c.target.villain})},
  set:(e,c)=>{const parts=e.path.split('.');let obj=S;for(let i=0;i<parts.length-1;i++){obj[parts[i]]||={};obj=obj[parts[i]]}obj[parts[parts.length-1]]=e.v},
  copy:(e,c)=>{const v=get(S,e.from);const parts=e.to.split('.');let obj=S;for(let i=0;i<parts.length-1;i++){obj[parts[i]]||={};obj=obj[parts[i]]}obj[parts[parts.length-1]]=v},
  fight:async(e,c)=>{const p=Q().data.PEOPLE[c.npcId];if(!p||!p.battle)return;
   const b=Q().battleOf(p);if(!b)return;
   const spec={...b.spec,name:p.name+' · 失手被发现',exp:0,silver:0,drops:{}};
   try{const result=await battle({allowAuto:false,solo:true,heroArt:'hero_village',heroPor:'opening_hero_village',foes:[spec]});
    if(result==='lose'){S.hp=Math.max(1,Math.floor((S.mhp||20)*0.3));S.silver=Math.floor((S.silver||0)*0.9)}}catch(err){console.error('敌对开战出错',err)}},
  markHostile:(e,c)=>{const s=state();s.caught[c.npcId]||={};s.caught[c.npcId].hostile=true}
 };

 // ── 结算（第 8、11 节）
 async function resolve(ctx){const queue=[];
  for(const r of D.OUTCOME_RULES.filter(r=>r.set===ctx.ruleset&&match(r.when,ctx))){
   queue.push(...r.effects);if(r.final)break}
  for(const e of queue.filter(e=>!e.skipWhen||!match(e.skipWhen,ctx))){await EFFECTS[e.op](e,ctx)}}

 
 // ── 教学接口（第 3.3 节）：小耗子三道关固定成功率，按教学规则结算（不扣关系、不发事件）
 function teach(step,result){const ctx={result,ruleset:'teach',npcId:'aqi',item:{n:'教学道具'},target:{},ctx:{},bond:{},tier:D.TIERS.none,caught:{}};resolve(ctx)}
 
 window.QiheSteal={state,stealLv,addExp,isAlert,rumor,grip,listItems,chance,wary,minigame,resolve,teach};
})();
