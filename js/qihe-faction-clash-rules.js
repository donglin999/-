/* NPC-only scene rules. No player state, storage, reward or DOM access. */
(function(root){'use strict';
const D=typeof module==='object'&&module.exports?require('./qihe-faction-clash-data.js'):root.QiheClashData;
function stats(p){const s=p.st;return{mhp:60+s.con*14+p.lv*12,mmp:30+s.wil*7+s.wis*2+p.lv*5,atk:8+s.str*3+p.lv*2+p.weapon.atk,def:s.con+s.wil*2,spd:s.agi,crit:5+s.wis*2+(p.weapon.crit||0),dodge:Math.round(s.agi*1.5)}}
function create(){const units={};for(const[key,p]of Object.entries(D.profiles)){const d=stats(p);units[key]={...d,key,name:p.name,art:p.art,por:p.portrait?.replace(/^p_/,''),side:p.side,lv:p.lv,hp:d.mhp,mp:d.mmp,bp:1,actionN:0,cooldowns:{},buffs:{},skills:Object.keys(p.skillLevels),skLv:{...p.skillLevels},artLv:{...p.artLevels},atkType:p.weapon.kind,atkName:p.weapon.name,weak:['剑','棍'],maxShield:4,shield:4,known:new Set(),id:Object.keys(units).length/10+.1,alpha:1,bleed:0}}return{units,log:[],round:1}}
function cost(u,k){const c=D.skills[k]?.combat;if(!c)return 0;return Math.max(0,c.mp+((u.skLv[k]||1)>=10?(c.mastery_bonus?.mp||(['am_s1','am_s2'].includes(k)?-1:0)):0))}
function targets(state,u,skill,primary){return D.skills[skill]?.combat.target==='all_foes'?Object.values(state.units).filter(t=>t.side!==u.side&&t.hp>0):[primary]}
function begin(state,step){
 const u=state.units[step.actor],target=state.units[step.target],sk=D.skills[step.skill];
 if(!u||!target||u.hp<=0||target.hp<=0)throw Error('交锋目标不存在或已离场');
 const bp=step.bp||0,next=u.actionN+1;if(!Number.isInteger(bp)||bp<0||bp>3||bp>u.bp)throw Error('蓄势不足');
 if(sk){
  if(!u.skills.includes(step.skill))throw Error('未掌握此招');
  const unlock=sk.art_unlock_level||1;if((u.skLv[step.skill]||1)<unlock||(u.artLv[sk.system_id]??u.skLv[step.skill]??1)<unlock)throw Error('功法重数不足，招式尚未开启');
  if(u.mp<cost(u,step.skill))throw Error('内力不足');if(next<(u.cooldowns[step.skill]||0))throw Error('招式尚在冷却');
  if(step.skill==='am_s2'&&(target===u||target.side!==u.side||u.receivedBPRound===state.round))throw Error('不能自赠、赠敌或本回合再转赠');
  if(step.skill==='am_s1'&&(!state.units[step.support]||state.units[step.support]===u||state.units[step.support].side!==u.side||state.units[step.support].hp<=0))throw Error('缺少另一名受护同伴');
 }else if(!['attack','defend'].includes(step.skill))throw Error('未知交锋动作');
 if(step.skill==='defend'&&target!==u)throw Error('防御只能作用于自己');
 if(!['am_s2','defend'].includes(step.skill)&&target.side===u.side)throw Error('攻击不能指向同伴');
 const victims=targets(state,u,step.skill,target);if(!victims.length)throw Error('没有合法目标');
 u.actionN=next;u.defend=false;
 if(u.clashExposureUntil&&u.clashExposureUntil<=next){delete u.clashExposure;delete u.clashExposureUntil}
 const outgoingDown=u.clashBlunted||0;delete u.clashBlunted;
 for(const t of Object.values(state.units)){
  if(t.clashUnload?.caster===u.key&&t.clashUnload.expires<=next)delete t.clashUnload;
  if(t.clashFollow&&t.clashFollow.expiresRound<state.round)delete t.clashFollow;
 }
 const mp=cost(u,step.skill);u.mp-=mp;u.bp-=bp;if(sk?.combat.cooldown_self_actions)u.cooldowns[step.skill]=next+sk.combat.cooldown_self_actions+1;
 const record={actor:u.key,skill:step.skill,target:target.key,targets:victims.map(t=>t.key),support:step.support||null,bp,mp,hits:[],effects:[],before:{hp:target.hp,mp:u.mp,bp:target.bp,targetHp:Object.fromEntries(victims.map(t=>[t.key,t.hp]))},applied:false};state.log.push(record);
 return{state,step,u,target,targets:victims,sk,bp,record,outgoingDown};
}
function impact(a,rolls={hit:.01,crit:.99,status:.99}){
 if(a.record.applied)throw Error('同一动作不可重复结算');const{state,step,u,target,sk,bp,record:r}=a;r.applied=true;
 if(step.skill==='defend'){u.defend=true;r.effects.push({kind:'defend',unit:u.key});return r}
 if(step.skill==='am_s2'){const effect=sk.combat.bp[bp].effects.find(x=>x.type==='bp_transfer'),gain=Math.min(5-target.bp,effect.value);target.bp+=gain;target.receivedBPRound=state.round;r.effects.push({kind:'bp',unit:target.key,value:gain});return r}
 const c=sk?.combat,level=u.skLv[step.skill]||1,n=c?c.bp[bp].hits:1+bp,power=c?c.bp[bp].total_power*(1+(level-1)*c.mastery_per_level)*(level>=10?1+(c.mastery_bonus?.damage||0):1):1,type=sk?.weapon||u.atkType;
 for(const t of a.targets){
  if(t.hp<=0)continue;
  const mark=t.clashFollow,follow=mark&&mark.side===u.side&&mark.caster!==u.key&&mark.expiresRound>=state.round?mark.value:0;let markUsed=false;
  for(let i=0;i<n;i++){
   if(t.hp<=0)break;
   const roll=typeof rolls==='function'?rolls(t,i):rolls,hit=roll.hit<(c?.accuracy??1)-t.dodge/100;
   if(!hit){r.hits.push({target:t.key,damage:0,miss:true});continue}
   const weak=t.weak.includes(type),critical=roll.crit<u.crit/100;
   let damage=Math.max(1,u.atk*(c?power/n:power)-t.def*.5)*(1-(a.outgoingDown||0));
   if(follow){damage*=1+follow;if(!markUsed){delete t.clashFollow;markUsed=true;r.effects.push({kind:'followUsed',unit:t.key,value:follow})}}
   if(weak)damage*=1.25;if(critical)damage*=1.5;if(t.broken)damage*=2;if(t.defend)damage*=.5;
   if(t.clashUnload){damage*=1-t.clashUnload.value;delete t.clashUnload}
   if(t.clashExposure){damage*=1+t.clashExposure;delete t.clashExposure;delete t.clashExposureUntil}
   damage=Math.max(1,Math.round(damage));t.hp=Math.max(0,t.hp-damage);
   if(weak&&!t.broken){t.known.add(type);t.shield=Math.max(0,t.shield-1);if(!t.shield){t.broken=true;t.brokenUntil=state.round+1}}
   r.hits.push({target:t.key,damage,weak,critical,hp:t.hp});
  }
  const landed=r.hits.some(h=>h.target===t.key&&!h.miss);
  if(step.skill==='cs_whip_s1'&&landed){t.clashBlunted=.1;r.effects.push({kind:'blunted',unit:t.key,value:.1})}
  if(step.skill==='am_s3'&&landed){const value=c.bp[bp].effects.find(e=>e.type==='next_ally_same_target_damage').value;t.clashFollow={value,caster:u.key,side:u.side,expiresRound:state.round+1};r.effects.push({kind:'follow',unit:t.key,value})}
 }
 if(step.skill==='am_s1'){const other=state.units[step.support];other.clashUnload={value:.1,caster:u.key,expires:u.actionN+1};r.effects.push({kind:'unload',unit:other.key,value:.1})}
 if(step.skill==='cs_whip_s2'){u.clashExposure=.1;u.clashExposureUntil=u.actionN+1;r.effects.push({kind:'exposure',unit:u.key,value:.1})}
 return r;
}
function simulate(){const s=create();for(const step of D.sequence)impact(begin(s,step));return s}
const api={data:D,stats,create,cost,targets,begin,impact,simulate};if(typeof module==='object'&&module.exports)module.exports=api;else root.QiheClashRules=api;
})(typeof globalThis!=='undefined'?globalThis:this);
