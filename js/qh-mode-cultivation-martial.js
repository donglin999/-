/* 8792 local adoption of existing Guiyun move contracts, with shared cultivation XP. */
(()=>{'use strict';if(!isQiheEntry())return;
const N=CultivationBalance,L=CultivationLibrary;
for(const a of L.arts){if(a.type!=='external')continue;for(const m of a.moves){const d=L.moves[m.id];if(!d)continue;SKILLS[m.id]={...d.s,artName:a.name,systemId:a.id,maxLevel:10,desc:d.s.descV4||d.s.desc};BSK[m.id]={...d.b};FXDEF[m.id]={tier:d.fx[0],cls:d.fx[1],hit:d.b.t||d.b.e||'拳'};if(window.MENU_ICONS)MENU_ICONS.skill[m.id]=MENU_ICONS.skill[a.path==='剑'?'liuye':'fist'];}}
for(const [k,f]of Object.entries(L.hearts))XINFA[k]=JSON.parse(JSON.stringify(f));
MN_SECT.guiyun='归云谷';
// The current battle UI consumes guard offensively; its separate defensive-choice UI is deferred.
XINFA.xf_wanhe.desc='气血、内力上限每层+3%；防御或援护得到守势，消耗守势的招式伤害额外+15%；五层最多存2枚守势。';
XINFA.xf_wanhe.passiveText=XINFA.xf_wanhe.desc;

window.CultivationMartial={courses:N.library.arts,lineage:{sword:['system_gy_foundation_s','art_gy_s2','art_gy_s3','system_gy_s','art_gy_s_jue'],fist:['system_gy_foundation_p','art_gy_p2','art_gy_p3','system_gy_p','art_gy_p_jue'],inner:['tuna','xf_guiyun','xf_guanlan','xf_wanhe']}};
// Numerical BP/multi-hit contracts use total power / hit count, not sqrt scaling.
N.skillEffects=function(u,k,bp=0){const d=L.moves[k];if(!d)return null;const v=Math.max(0,Math.min(3,Math.trunc(bp)||0)),b=d.b.bp[v]||[0,0,0,1],lm=1+.15*((u.skLv?.[k]||1)-1);return{bp:v,t:d.b.t,e:d.b.e,power:b[0]*lm/Math.max(1,b[1]),hits:b[1],shield:b[2],restricted:!d.b.bp[v],multiplier:lm};};
// Lu Xiaodou's sword spar uses its own fixed profile; this is a basic attack,
// not a new teachable martial art. Its dedicated sheet is in guiyun-battle-finish.js.
const DOU_PROFILE='gy_dou_sword_v1';
SKILLS.gy_dou_basic={name:'点步直刺',kind:'剑',mp:0,pow:1,desc:'卢小豆以桃木剑短促直刺；普通剑击，不是可学习功法。'};
BSK.gy_dou_basic={t:'剑',tgt:'foe'};
FXDEF.gy_dou_basic={tier:0,cls:'dmg',hit:'剑'};
const baseMakeSparFoe=mkFoe,basePlanSpar=planIntent;
mkFoe=function(t,i){const u=baseMakeSparFoe.apply(this,arguments);if(t.combatProfile===DOU_PROFILE){Object.assign(u,{combatProfile:DOU_PROFILE,atkType:'剑',atkName:'桃木剑',mp:u.mmp,skLv:{...t.skills},sparActions:0});}return u;};
planIntent=function(u){const result=basePlanSpar.apply(this,arguments);if(u.combatProfile===DOU_PROFILE&&u.intent&&!u.intent.charge){const next=u.sparActions%2===1?'gy_s1':'gy_dou_basic';u.intent.sk=u.mp>=(SKILLS[next].mp||0)?next:'gy_dou_basic';}return result;};
const baseSkill=doSkill,baseAttack=doAttack,baseStrike=strike,baseHurt=hurt,baseReveal=reveal,baseTick=tickBuffs,baseFoe=foeAct;
function heart(u){const r=u.mw==='hero'?S:S?.mates?.[u.mw];return r?.xinfa;}
function token(u,n=1){u.cuTokens=Math.min(heart(u)?.main==='xf_wanhe'&&!heart(u).unstable&&(heart(u).lv.xf_wanhe||1)>=5?2:1,(u.cuTokens||0)+n);}
function startAction(u){u.cuUnload=0;u.cuCounter=null;for(const t of B?.allies||[])if(t.cuIntercept===u)t.cuIntercept=null;}
function mainBonus(u){const x=heart(u),n=x?.lv?.[x.main]||1;return x?.unstable>0?0:x?.main==='xf_guiyun'?[.08,.08,.12,.12,.16][n-1]:x?.main==='xf_wanhe'?.15:0;}
function addGuard(u){if(!heart(u)?.unstable&&['xf_guiyun','xf_wanhe'].includes(heart(u)?.main))token(u);}
N.battleWhy=function(u,k){const d=L.moves[k];if(!d)return '';if(d.b.def)return '装配后选择防御时自动触发';if(u.cuCooldown?.[k])return '还需调息'+u.cuCooldown[k]+'次行动';if(d.b.ult&&(u.bp+(B?.cur===u?B.bpUse||0:0)<3||u.cuUltRest))return u.cuUltRest?'本次行动须先调息':'绝招需要3点蓄势';return '';};
function support(u,k,list,bp){const es=L.moves[k].b.ef?.[bp]||[],find=t=>es.find(e=>e[0]===t),unload=find('unload');if(unload)for(const t of list)t.cuUnload=unload[1];if(find('guard_token'))token(u,find('guard_token')[1]);const next=find('next_attack_bonus');if(next)u.cuNextBoost={ratio:next[1],system:next[2]==='next_same_art_move_once'?SKILLS[k].systemId:null};if(find('counter_power'))u.cuCounter=find('counter_power')[1];if(find('intercept')){delete u.cuCounter;for(const t of list)if(t!==u){t.cuIntercept=u;t.cuInterceptReduction=.25+.05*bp;}}}
doAttack=async function(u,...args){startAction(u);u.cuPreviousGuard=false;if(u.cuNextBoost&&!u.cuNextBoost.system){u.cuAttackBoost=u.cuNextBoost.ratio;delete u.cuNextBoost;}try{return await baseAttack.call(this,u,...args);}finally{delete u.cuAttackBoost;}};
foeAct=async function(u){B.cuFoeAll=!!u.intent?.all;try{
 if(u.combatProfile===DOU_PROFILE&&u.intent&&!u.intent.charge&&aliveOf('ally').length){
  if(!['gy_dou_basic','gy_s1'].includes(u.intent.sk)||u.mp<(SKILLS[u.intent.sk]?.mp||0))u.intent.sk='gy_dou_basic';
  u.mp-=SKILLS[u.intent.sk].mp||0;u.sparActions++;
 }
 return await baseFoe.apply(this,arguments);
}finally{B.cuFoeAll=false;}};
function firstReveal(u,t,prior){const x=u&&heart(u);if(t.known?.size>prior&&x?.subs?.includes('xf_guanlan')&&(x.lv.xf_guanlan||1)>=5&&!u.cuFirstReveal){u.cuFirstReveal=true;u.mp=Math.min(u.mmp,u.mp+2);}}
strike=function(u,t,o){const prior=t.known?.size||0,x=heart(u),observed=x?.subs?.includes('xf_guanlan')&&prior?.02*(x.lv.xf_guanlan||1):0;const r=baseStrike.call(this,u,t,{...o,pow:o.pow*(1+(u.cuAttackBoost||0)+observed)});firstReveal(u,t,prior);return r;};
doSkill=async function(u,k,tgs,bp=0){const d=L.moves[k];if(!d){startAction(u);return baseSkill.apply(this,arguments);}if(window.QiheUIModel&&u.side==='ally'&&QiheUIModel.skillWhy(u,k))return;if(d.b.ult&&bp!==3)return;
 startAction(u);if(typeof BFXI!=='undefined')BFXI.beginSkillPose(u);else{u.stationarySkill=true;u.stepO=0;if(u.bx!=null)u.x=u.bx;}u.cuCooldown||={};if(d.b.cd)u.cuCooldown[k]=d.b.cd+1;if(d.b.ult)u.cuUltRest=2;const e=N.skillEffects(u,k,bp),list=tgs.filter(t=>t.hp>0),effects=d.b.ef?.[e.bp]||[],has=type=>effects.find(x=>x[0]===type);u.mp-=QiheUIModel.skillCost(u,k);renderCards();if(bp)await boostFx(u,bp);showName(u,SKILLS[k].name);VFX.act(u,'cast');await VFX.cast(u,k,list,bp);
 if(!e.hits){support(u,k,k==='gy_p5b'?list.filter(t=>t!==u).concat(list.filter(t=>t===u)).slice(0,2):list,bp);u.cuPreviousGuard=false;await wait(400);renderCards();return;}
 let extra=0;const conditional=has('conditional_damage');if(conditional){if(conditional[2]==='previous_self_guard'&&u.cuPreviousGuard)extra+=conditional[1];if(conditional[2]==='consume_one_self_guard_token'&&u.cuTokens){u.cuTokens--;extra+=conditional[1]+mainBonus(u);}}
 if(u.cuNextBoost&&(!u.cuNextBoost.system||u.cuNextBoost.system===SKILLS[k].systemId)){extra+=u.cuNextBoost.ratio;delete u.cuNextBoost;}
 const shieldBonus=has('extra_shield_damage');let extraShield=0;if(shieldBonus&&u.cuTokens){u.cuTokens--;extraShield=shieldBonus[1];extra+=mainBonus(u);}
 const lastEffect=has('last_hit_bonus');let lastGuard=false;if(lastEffect?.[2]==='consume_one_guard_token'&&u.cuTokens){u.cuTokens--;lastGuard=true;extra+=mainBonus(u);}
 const staged=typeof BFXI!=='undefined';
 if(staged&&list.length)BFXI.camOn([u,...list],list.length>1?1.08:1.16);
 if(staged)await BFXI.bw(180);else await wait(180);
 try{for(let h=0;h<e.hits;h++){
  const resolve=t=>{let bonus=extra;if(conditional?.[2]==='target_broken'&&t.broken)bonus+=conditional[1];const last=has('last_hit_bonus');if(last&&h===e.hits-1&&((last[2]==='target_broken_before_hit'&&t.broken)||(last[2]==='actual_intercept_damage_this_round'&&u.cuInterceptRound===B.round)||(last[2]==='consume_one_guard_token'&&lastGuard)))bonus+=last[1];
   strike(u,t,{pow:e.power*(1+bonus),t:d.b.t,e:d.b.e});if(h===0&&extraShield&&t.shield>0){t.shield=Math.max(0,t.shield-extraShield);if(t.shield===0&&!t.broken)doBreak(t);}if(h===0&&d.b.reveal&&t.hp>0)reveal(t,d.b.reveal);if(h===0&&k==='gy_p5a'&&t.hp>0&&!t.bossy&&(t.broken||chance(35+10*bp))){t.stun=true;t.intent=null;}};
  const alive=list.filter(t=>t.hp>0);if(!alive.length)break;
  for(const t of alive){resolve(t);VFX.hit(u,t,d.b.t,k,bp);}
  if(staged)await BFXI.bw(e.hits>1?200:300);else await wait(e.hits>1?200:300);
 }}finally{u.anim=null;if(staged)BFXI.camReset();}
 u.cuPreviousGuard=false;renderCards();};
// Preserve the actual battle's proficiency receipts for imported moves as well.
const adoptedSkill=doSkill;
doSkill=async function(u,k,tgs,bp){if(!L.moves[k])return adoptedSkill.apply(this,arguments);const snap=(tgs||[]).filter(t=>t.side==='foe').map(t=>[t,t.shield,!!t.broken]),mp=u.mp;const r=await adoptedSkill.apply(this,arguments);if(u.side==='ally'&&u.mw&&S&&(u.mp!==mp||SKILLS[k].mp===0)){let weak=0,brk=0;for(const[t,sh,b]of snap){if(!b&&t.broken)brk++;if((!b&&t.broken)||t.shield<sh)weak=1;}const log=mnProfLog[u.mw]||={};log[k]=(log[k]||0)+1+weak+brk;}return r;};

hurt=function(t,dmg,...args){const u=t.cuIntercept;if(u&&u.hp>0&&B?.cur?.side==='foe'&&!B.cuFoeAll&&t!==u){t.cuIntercept=null;u.cuInterceptRound=B.round;addGuard(u);const r=baseHurt.call(this,u,Math.max(1,Math.round(dmg*(1-(t.cuInterceptReduction||.25)))),...args);floatTxt(u,'援护','#bfd4b1',20);const power=L.moves.gy_p4.b.ef[0].find(e=>e[0]==='counter_power')[1];strike(u,B.cur,{pow:power,t:'拳'});return r;}
 if(t.cuUnload&&dmg>0){dmg=Math.max(1,Math.round(dmg*(1-t.cuUnload)));t.cuUnload=0;}
 const counter=t.cuCounter,foe=B?.cur?.side==='foe'&&!B.cuFoeAll?B.cur:null;const r=baseHurt.call(this,t,dmg,...args);if(counter&&foe&&t.hp>0){t.cuCounter=null;strike(t,foe,{pow:counter,t:'拳'});}return r;};
reveal=function(t,n){const prior=t.known?.size||0,r=baseReveal.apply(this,arguments);firstReveal(B?.cur,t,prior);return r;};
tickBuffs=function(u){for(const k of Object.keys(u.cuCooldown||{}))u.cuCooldown[k]=Math.max(0,u.cuCooldown[k]-1);if(u.cuUltRest)u.cuUltRest--;if(u.defend){startAction(u);u.cuPreviousGuard=true;const guards=(u.skills||[]).filter(k=>L.moves[k]?.b.def);for(const k of guards)support(u,k,[u],0);if(!guards.some(k=>L.moves[k].b.ef[0].some(e=>e[0]==='guard_token')))addGuard(u);}else u.cuPreviousGuard=false;return baseTick.apply(this,arguments);};
// Local target adaptation: guard both available companions automatically; no two-target selector exists here.
BSK.gy_p5b.tgt='allies';
SKILLS.gy_p5b.desc='最多护住两名同伴（按出战顺序，优先本人以外），各卸力一次25%（每BP+5%，最高40%）；本人得一枚守势，冷却2次行动。';
for(const k of ['gy_s5b','gy_p3'])SKILLS[k].desc=SKILLS[k].desc.replace(/；命中后.*?。BP/, '；BP');
SKILLS.gy_p5a.desc=SKILLS.gy_p5a.desc.replace('首领免疫','首领免疫眩晕');
})();
