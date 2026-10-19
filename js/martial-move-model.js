/* Offline design evaluator. Does not grant skills or replace live combat. */
(function(root){
'use strict';
function estimate(move,actor={},target={},options={}){
 const c=move.combat,bp=options.bp??0,level=options.level??1;
 if(!Number.isInteger(bp)||bp<0||bp>3||!Number.isInteger(level)||level<1||level>c.max_level)throw Error('BP或重数越界');
 const band=c.bp[bp];if(!band.available)return{available:false,reason:'绝级需要3BP',damage:0,heal:0,hits:[]};
 const A=actor.attack??40,D=Math.max(0,target.defense??18),M=1+c.mastery_per_level*(level-1),flags=options.flags||{};
 let bonus=0;for(const e of band.effects)if(e.type==='conditional_damage'&&flags[e.condition])bonus+=e.value;
 bonus=Math.min(.30,bonus+Math.max(0,actor.damage_bonus||0));
 let shield=Math.max(0,target.shield||0),shieldUsed=0,total=0;const hits=[];
 for(let i=0;i<band.hits;i++){
  const brokenBefore=target.broken===true||shield===0&&target.shield>0;
  let conditional=0;
  for(const e of band.effects){
   if(e.type==='last_hit_bonus'&&i===band.hits-1&&(e.condition==='target_broken_before_hit'?brokenBefore:flags[e.condition]))conditional+=e.value;
   if(e.type==='last_hit_bonus_per_revealed_type'&&i===band.hits-1)conditional+=e.value*Math.min(5,target.revealed_types||0);
  }
  const scale=(target.matches_weakness?1.1:1)*(brokenBefore?1.5:1)*(options.critical?1.25:1);
  const damage=A*band.total_power/band.hits*M*(1+Math.min(.30,bonus+conditional))*scale*60/(60+D);
  total+=damage;let loss=0;
  if(target.matches_weakness&&shield>0&&shieldUsed<band.shield_cap){loss=1;for(const e of band.effects)if(e.type==='extra_shield_damage'&&i===0&&(!e.condition.includes('charging')||flags.charging)&&(!e.condition.includes('revealed')||target.revealed_types>0))loss+=e.value;loss=Math.min(loss,shield,band.shield_cap-shieldUsed);shield-=loss;shieldUsed+=loss;}
  hits.push({damage,shield_loss:loss,broken_before:brokenBefore});
 }
 const T=12+4*(actor.wisdom??6)+.1*(actor.max_mp??50);let healing=0;
 for(const e of band.effects)if(e.type==='heal_coefficient'||e.type==='regen_coefficient_per_tick')healing+=T*e.value*band.heal_multiplier*(1+Math.min(.30,Math.max(0,actor.heal_bonus||0)));
 const maxHp=target.max_hp??210,missing=Math.max(0,maxHp-(target.hp??0));const heal=Math.min(missing,maxHp*.35,Math.round(healing));
 return{available:true,damage:Math.round(total),heal,hits,shield_used:shieldUsed,mp:c.mp,action_cost:1,duration:band.duration_recipient_actions,regen_total_uncapped:band.effects.some(e=>e.type==='regen_coefficient_per_tick')?heal*band.duration_recipient_actions:0};
}
const api={version:3,estimate};if(typeof module==='object'&&module.exports)module.exports=api;else root.MartialMoveModel=api;
})(typeof window==='object'?window:globalThis);
