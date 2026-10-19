/* Independent character XP and persistent conditions. No automatic recruitment. */
(function(root){'use strict';
const cap=100;
function ensure(m,id){
 const floor=id==='ye'?3:1;
 if(!Number.isFinite(m.lv)){m.lv=Math.max(floor,Math.min(cap,m.lvSeen||floor));m.levelMigration={from:'legacy_shared_level',level:m.lv};}
 m.lv=Math.max(floor,Math.min(cap,Math.floor(m.lv)));m.exp=Math.max(0,Number(m.exp)||0);m.xpFraction=Math.max(0,Number(m.xpFraction)||0);m.pts=m.pts||0;
 if(m.lv===cap){m.exp=0;m.xpFraction=0}return m;
}
function level(world,id){return id==='hero'?world.lv:(world.mates?.[id]?.lv||(id==='ye'?3:world.mates?.[id]?.lvSeen||1))}
function awardBattle(world,base,ids,settle){
 if(!Number.isFinite(base)||base<0)throw Error('Invalid battle experience');
 const participants=[...new Set(ids)].filter(id=>world.mates?.[id]&&id!=='dog'&&id!=='pei'&&id!=='peizhigu'&&world.mates[id].growthMode!=='witness');
 for(const id of participants)ensure(world.mates[id],id);
 const before=world.lv;const report={hero:null,mates:[]};
 for(const id of ['hero',...participants]){
  const r=id==='hero'?world:world.mates[id],factor=id==='hero'||before-level(world,id)>=5?1.2:1;
  if(r.lv>=cap){r.exp=0;r.xpFraction=0;const row={id,amount:0,factor,levels:[]};if(id==='hero')report.hero=row;else report.mates.push(row);continue}
  const raw=base*factor+(r.xpFraction||0),amount=Math.floor(raw+1e-9);r.xpFraction=Math.max(0,raw-amount);r.exp=(r.exp||0)+amount;
  const levels=settle(r,id);if(r.lv>=cap)r.xpFraction=0;
  const row={id,amount,factor,levels};if(id==='hero')report.hero=row;else report.mates.push(row);
 }
 return report;
}
const definitions={
 fatigue:{name:'疲惫',icon:'◔',source:'奔波或连续活动',recovery:'休息后解除',cleanse:'rest',negative:true,mul:{atk:.9,spd:.9}},
 minor_wound:{name:'轻伤',icon:'✚',source:'受伤',recovery:'治疗后解除',cleanse:'treatment',negative:true,mul:{mhp:.85}},
 rested:{name:'休整充足',icon:'☀',source:'充分休整',recovery:'下一场战后消退',cleanse:'battle_end',negative:false,mul:{def:1.1}},
 yin_old_injury:{name:'旧伤未愈',icon:'◇',source:'旧年右臂与经脉损伤',recovery:'专门疗伤与人物事件；普通休息、净化无效',cleanse:'story',negative:true,
 stages:[{name:'旧伤未愈',mul:{mhp:.45,mmp:.35,atk:.4,spd:.8}},{name:'伤势缓解',mul:{mhp:.65,mmp:.6,atk:.65,spd:.9}},{name:'经脉渐复',mul:{mhp:.85,mmp:.8,atk:.85,spd:1}}]}
};
function inspect(record){return (record?.conditions||[]).flatMap(c=>{const d=definitions[c.id];if(!d)return[];const stage=d.stages?d.stages[Math.max(0,Math.min(d.stages.length-1,c.stage||0))]:d;return[{id:c.id,name:stage.name||d.name,icon:d.icon,source:c.source||d.source,recovery:d.recovery,cleanse:d.cleanse,negative:d.negative,mul:{...stage.mul}}]})}
function apply(d,record){const out={...d},low={},high={};for(const c of inspect(record))for(const[k,v]of Object.entries(c.mul)){if(v<1)low[k]=Math.min(low[k]??1,v);else high[k]=Math.max(high[k]??1,v)}for(const k of new Set([...Object.keys(low),...Object.keys(high)]))if(Number.isFinite(out[k]))out[k]=Math.max(k==='mmp'?0:1,Math.round(out[k]*(low[k]??1)*(high[k]??1)));return out}
function stabilizeHealth(record,base){
 if(!base){if(record.st)throw Error('State changes require unmodified base stats');return}
 const prior=apply(base,record);record.hp=record.hp==null?prior.mhp:Math.min(record.hp,prior.mhp);record.mp=record.mp==null?prior.mmp:Math.min(record.mp,prior.mmp);
}
function clampHealth(record,base){if(!base)return;const next=apply(base,record);record.hp=Math.min(record.hp,next.mhp);record.mp=Math.min(record.mp,next.mmp)}
function set(record,id,stage=0,source,base){if(!definitions[id])throw Error('Unknown condition');if(id==='yin_old_injury'&&record.conditionHistory?.yin_old_injury)throw Error('Recovered old injury cannot be reapplied');if(!Number.isInteger(stage)||stage<0||stage>=(definitions[id].stages?.length||1))throw Error('Invalid condition stage');stabilizeHealth(record,base);record.conditions=(record.conditions||[]).filter(c=>c.id!==id&&!(['fatigue','rested'].includes(id)&&['fatigue','rested'].includes(c.id)));record.conditions.push({id,stage,...(source?{source}:{})});clampHealth(record,base);}
function clear(record,method,base){stabilizeHealth(record,base);record.conditions=(record.conditions||[]).filter(c=>!definitions[c.id]||definitions[c.id].cleanse==='story'||definitions[c.id].cleanse!==method);clampHealth(record,base)}
function healOldInjury(record,eventId,base){if(eventId!=='yin_recovery_completed')throw Error('Required recovery event missing');stabilizeHealth(record,base);record.conditionHistory||={};record.conditionHistory.yin_old_injury=eventId;record.conditions=(record.conditions||[]).filter(c=>c.id!=='yin_old_injury');clampHealth(record,base)}
const growth={ensure,level,awardBattle,cap},condition={definitions,inspect,apply,set,clear,healOldInjury};
if(typeof module==='object'&&module.exports)module.exports={growth,condition};else{root.CharacterGrowth=growth;root.CharacterCondition=condition}
})(typeof globalThis!=='undefined'?globalThis:this);
