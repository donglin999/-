/* Browser integration; generic combat remains unchanged for other characters. */
(()=>{'use strict';if(!isQiheEntry())return;const P=PeiCompanion;
ITEMS.pei_sujian={name:'素笺',desc:'裴知古的绑定空册；不可卸下、替换或出售。见闻在实际参与事件时记录。',weapon:{kind:'书',atk:0},boundTo:P.id,key:true,icon:'assets/production/pre-hangao/sujian-icon.png'};
ITEMS.guiyun_wood_loan={...ITEMS.wood,name:'桃木剑（归云谷借用）',desc:'归云谷教学借用，返谷时归还；不可出售、送礼或拆解。',price:0,key:true,loanOwner:'guiyun'};
MN_MEM[P.id]={wk:['书'],slots:['weapon','armor','acc'],learn:[],role:'书生 · 见闻成长'};
PARTY_DEF[P.id]={name:'裴知古',initialLevel:3,art:['gy_peizhigu'],por:['gy_peizhigu'],st:P.fresh().st,skills:['pei_zhi'],atkType:null,atkName:'护书轻触'};
PORTS.push('gy_peizhigu');ASSETS.push('p_gy_peizhigu');
ART.portraitFile||={};ART.portraitFile.p_gy_peizhigu='assets/production/cultivation/household-v1/pei_normal.png';
for(const [id,sk]of Object.entries(P.skills)){SKILLS[id]={...sk,pow:0,personalOwner:P.id};BSK[id]={tgt:sk.tgt,buff:true};FXDEF[id]={tier:0,cls:'buff'};}
const oldCan=mnCan,oldUnequip=mnUnequip,oldSkillWhy=QiheUIModel.skillWhy;
mnCan=function(w,k){if(ITEMS[k]?.boundTo&&ITEMS[k].boundTo!==w)return'此册只属于裴知古';if(w===P.id&&mnSlot(k)==='weapon')return'素笺为绑定书册，不能替换';return oldCan(w,k);};
mnUnequip=function(w,slot){if(w===P.id&&slot==='weapon')return false;return oldUnequip(w,slot);};
QiheUIModel.skillWhy=function(u,k){if(P.skills[k]){if(u.key!==P.id)return'这是裴知古的人物技能';if((u.peiCooldown?.[k]||0)>(u.peiTurns||0))return'还需调息';}return oldSkillWhy(u,k);};
const oldAlly=mkAlly;mkAlly=function(key){if(key===P.id)P.ensure(S);const u=oldAlly(key);if(u&&key===P.id){u.atkType=null;u.atk=2;u.crit=0;u.atkName='护书轻触';u.seenEnemyTypes=Object.keys(S.mates[P.id].enemyTypes||{});}return u;};
const oldAttack=doAttack,oldSkill=doSkill,oldHurt=hurt,oldTick=tickBuffs,oldFoe=foeAct,oldPlan=planIntent;
const oldAllyTurn=allyTurn;allyTurn=function(u){P.actionStart(u);return oldAllyTurn.apply(this,arguments);};
doAttack=async function(u,t,bp=0){if(u.key!==P.id)return oldAttack.apply(this,arguments);u.stationarySkill=false;const hits=1+Math.max(0,Math.min(3,bp));if(bp)await boostFx(u,bp);showName(u,'护书轻触'+(hits>1?' ×'+hits:''));await BFXI.dashTo(u,t);for(let i=0;i<hits&&t.hp>0;i++)await playAttackPose(u,i?'atk2':'atk',[t],null,null,bp,x=>hurt(x,1+Math.floor(Math.random()*2),'#eee6d1',false),180);await BFXI.hopBack(u);};
doSkill=async function(u,k,targets,bp){if(!P.skills[k])return oldSkill.apply(this,arguments);if(QiheUIModel.skillWhy(u,k))return;
 BFXI.beginSkillPose(u);showName(u,SKILLS[k].name);VFX.act(u,k);const cue=BFXI.impactMs(u,k);await BFXI.bw(cue);
 const results=P.cast(u,k,targets,bp,{turn:u.peiTurns||0,lockIntent:t=>{
  const current=t.intent;oldPlan(t);const next=t.intent;t.intent=current;t.peiLockedIntent=next;t.peiLockedPhase={phase:t.phase||0,hpBand:t.hp<t.mhp*.5};return next;
 }});
 renderCards();
 for(let i=0;i<targets.length;i++){const t=targets[i],r=results[i];if(r.weak)floatTxt(t,'看破：'+r.weak,'#cfbd8d',20);else if(r.intent)floatTxt(t,'下一步：'+(SKILLS[r.intent.sk]?.name||'攻击'),'#cfbd8d',20);else floatTxt(t,k==='pei_shen'?'慎行 · 护持一次':'破绽 · 下一击','#cfbd8d',20);}
 const spec=BART[u.art]?.anim?.[k],duration=spec?(Array.isArray(spec.ms)?spec.ms.reduce((a,b)=>a+b,0):(spec.ms||120)*spec.f.length):500;await BFXI.bw(Math.max(0,duration-cue));
};
planIntent=function(u){if(u.peiLockedIntent){const valid=u.peiLockedPhase?.phase===(u.phase||0)&&u.peiLockedPhase?.hpBand===(u.hp<u.mhp*.5);if(valid){u.intent=u.peiLockedIntent;delete u.peiLockedIntent;return;}delete u.peiLockedIntent;floatTxt(u,'阶段已变 · 预告失效','#cab790',18);}return oldPlan.apply(this,arguments);};
hurt=function(t,damage,...args){if(B?.cur?.buffs?.peiWeaken){damage=Math.round(damage*B.cur.buffs.peiWeaken.mul);delete B.cur.buffs.peiWeaken;}const resist=t.buffs?.peiCare?.displacement;const result=oldHurt(t,P.consumeIncoming(t,damage),...args);if(resist)t.kb=0;return result;};
tickBuffs=function(u){if(u.key===P.id){u.peiTurns=(u.peiTurns||0)+1;if(u.defend)P.defend(u,B?.round||0);}P.expire(u,B?.round||0);return oldTick.apply(this,arguments);};
foeAct=async function(u){P.actionStart(u);for(const a of B?.allies||[])if(a.key===P.id){a.seenEnemyTypes||=[];const type=u.key||u.name;if(!a.seenEnemyTypes.includes(type))a.seenEnemyTypes.push(type);const m=S.mates?.[P.id];if(m){m.enemyTypes||={};m.enemyTypes[type]=true;}}return oldFoe.apply(this,arguments);};
})();
