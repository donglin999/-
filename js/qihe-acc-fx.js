'use strict';
// 功能类佩饰（目录 xiaojianghu/docs/design/martial-review/equipment.md「功能类」，效果口径 armor-acc-stats.md）：不加战力，只改买卖、银两、掉落、战后回复、药食回复。
// 数值写在物品的 func 字段：buy 买价折扣、silver 银两获得、drop 掉落率、postHeal 战后回复气血与内力的比例、heal 药食恢复量、skillHeal 治疗招式（医具，占兵器位）、lastStand 挨上致命一击保住 1 点气血（每场一次，百家平安符）。
// 买价、银两、掉落是全队的事：按队里戴着的人取最高一份（同一件不叠）；战后回复、药食恢复只算戴着的那个人。
(()=>{
 const of=w=>{try{const e=typeof mnEq==='function'?mnEq(w):null;if(!e)return{};const o={};for(const k of [e.weapon,e.acc])for(const[f,v]of Object.entries(ITEMS[k]?.func||{}))o[f]=(o[f]||0)+v;return o}catch(e){return{}}};   // 兵器、佩饰两格的 func 相加
 const team=key=>{try{return typeof mnMembers==='function'?Math.max(0,...mnMembers().map(w=>of(w)[key]||0)):0}catch(e){return 0}};
 const buy=price=>{const d=team('buy');return d?Math.max(1,Math.round(price*(1-d))):price};
 const silver=n=>n>0?Math.round(n*(1+team('silver'))):n;
 const drop=p=>Math.min(100,p*(1+team('drop')));   // 掉落几率是百分数（core.js chance）
 const heal=(w,n)=>n>0?Math.round(n*(1+(of(w).heal||0))):n;
 const skillHeal=(w,n)=>n>0?Math.round(n*(1+(of(w).skillHeal||0))):n;
 // 致命一击保 1 点：每个战斗单位每场一次（单位每场新建，记在单位上）
 const lastStand=(u,dmg)=>{if(!u||u.side!=='ally'||u.lastStood||dmg<u.hp||u.hp<=1)return dmg;if(!of(u.isHero?'hero':u.key).lastStand)return dmg;u.lastStood=true;try{floatTxt(u,'平安符','#f3d58e',20)}catch(e){}return u.hp-1};
 if(typeof hurt==='function'){const h0=hurt;hurt=function(t,dmg,...a){return h0.call(this,t,lastStand(t,dmg),...a)}}
 window.QiheAccFx={of,team,buy,silver,drop,heal,skillHeal,lastStand};
})();
