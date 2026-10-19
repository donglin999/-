/* Guiyun teaching terminates by observed actions; it never defeats the teacher. */
(()=>{'use strict';if(!isQiheEntry())return;
SKILLS.gy_zhou_teaching={name:'示范与叫停',kind:'剑',mp:0,pow:0,desc:'周砚考校专用示范，不向玩家授予武学。'};BSK.gy_zhou_teaching={t:'剑',tgt:'foe'};
const oldIntentLabel=intentLabel;intentLabel=function(u){if(B?.opt.training)return'示范 · 等你收招';if(u.guiyunGuardOnly)return'守住中线 · 陪练';return oldIntentLabel(u);};
const oldEnd=endCheck,oldFoe=foeAct,oldTick=tickBuffs,oldAttack=doAttack,oldSkill=doSkill,oldVictory=victory;
doAttack=async function(u){u.guiyunLastAction='attack';return oldAttack.apply(this,arguments);};
doSkill=async function(u){u.guiyunLastAction='skill';return oldSkill.apply(this,arguments);};
tickBuffs=function(u){if(B?.opt.training&&u.isHero){const t=B.opt.training;t.actions||=[];t.actions.push(u.defend?'guard':u.guiyunLastAction||'other');u.guiyunLastAction=null;}return oldTick.apply(this,arguments);};
endCheck=function(){const t=B?.opt.training;if(t?.calledStop&&t.actions.length>t.stopAfter){t.result=t.actions.at(-1)==='guard'?'steady':'hasty';return'win';}if(t?.actions?.length>=5){t.result='not_attempted';return'win';}return oldEnd();};
foeAct=async function(u){if(B?.opt.training||u.guiyunGuardOnly){const t=B.opt.training;if(t&&t.actions.some(a=>a==='attack'||a==='skill')){t.calledStop=true;t.stopAfter=t.actions.length;}showName(u,t?(t.calledStop?'停，先收住。':'先递一招，我再叫停。'):'方迟 · 守住中线');u.defend=true;VFX.act(u,t?.calledStop?'stop':'cast');await wait(450);return;}return oldFoe.apply(this,arguments);};
victory=async function(){if(B?.opt.training){await bigText('停 · 考校结束','#c7d9ba',650);return;}return oldVictory.apply(this,arguments);};
const makeFoe=mkFoe;mkFoe=function(t,i){const u=makeFoe(t,i);if(t.guiyunGuardOnly)u.guiyunGuardOnly=true;if(t.worldLevel){u.lv=t.worldLevel;u.teachingStatsLevel=t.teachingStatsLevel;u.name=t.name+' · 收力切磋';}return u;};
const trainingHurt=hurt;hurt=function(t,damage,...args){if(B?.opt.training&&t.side==='foe')damage=Math.min(damage,Math.max(0,t.hp-1));return trainingHurt.call(this,t,damage,...args);};
window.GuiyunCombat={trainingOptions(route){return {solo:true,noLose:true,noFlee:true,bg:'bb_qh_training_v1',training:{route,actions:[],result:null},foes:[{
 name:'周砚 · 示范与叫停',sp:'c_gy_zhouyan',weapon:'iron',lv:88,st:{str:9,con:10,agi:10,wil:10,wis:10},skills:{gy_zhou_teaching:1},hpMul:1,atkMul:0,shield:99,weak:[],exp:0,silver:0,drops:{}}]};},
 temporaryDou(){const u=statUnit({name:'卢小豆',lv:10,st:{str:3,con:3,agi:7,wil:3,wis:4},weapon:'wood'},'ally');Object.assign(u,{hp:u.mhp,mp:u.mmp,key:'guiyun_dou_temporary',art:'gy_luxiaodou',por:'gy_luxiaodou',skills:['gy_s1'],skLv:{gy_s1:1},atkType:'剑',atkName:'桃木剑'});return u;}};
})();
