'use strict';
// 宠物独立于人类同伴：存档、成长和战斗决策都由这里管理。
const PET_DEF={dog:{guardMp:6,guardRatio:.5,healRatio:.3,growth:['str','agi','con']}};
let petLive=null;
function petEnsure(){
  if(!S)return;
  S.party=S.party||[];S.pets=S.pets||{};
  const oldDog=S.party.includes('dog');
  if(oldDog){S.party=S.party.filter(k=>k!=='dog');if(!S.pet)S.pet='dog'}
  if(!S.pet||!PET_DEF[S.pet])return;
  const id=S.pet,P=PARTY_DEF[id],old=S.mates&&S.mates[id];
  let p=S.pets[id];
  if(!p){p=S.pets[id]={st:{...(old&&old.st||P.st)},lvSeen:old&&old.lvSeen||1,
    hp:old&&old.hp!=null?old.hp:null,mp:old&&old.mp!=null?old.mp:null,
    equip:{acc:old&&old.equip&&old.equip.acc||null}}}
  p.st=p.st||{...P.st};p.equip=p.equip||{acc:null};
  // 旧档未分配的属性点一并按物种倾向自动投入。
  const levels=Math.max(0,(S.lv||1)-(p.lvSeen||1));
  let points=(old&&old.pts||0)+levels*3;
  const growth=PET_DEF[id].growth;
  for(let i=0;i<points;i++)p.st[growth[i%growth.length]]++;
  p.lvSeen=Math.max(p.lvSeen||1,S.lv||1);
  if(levels){p.hp=null;p.mp=null}
  if(S.mates&&S.mates[id])delete S.mates[id];
}
function adoptPet(id){if(!PET_DEF[id]||!S)return false;S.pet=id;petEnsure();if(typeof resetFollowers==='function')resetFollowers();save();return true}
function petStats(id=S.pet){petEnsure();const p=S.pets[id];if(!p)return null;return derived({st:p.st,lv:S.lv,weapon:null,armor:null,acc:p.equip.acc,xw:null})}
function petHealth(id=S.pet){const d=petStats(id),p=S.pets[id];return d?{hp:p.hp==null?d.mhp:clamp(p.hp,0,d.mhp),mp:p.mp==null?d.mmp:clamp(p.mp,0,d.mmp),d}:null}
function mkPet(id){petEnsure();const P=PARTY_DEF[id],p=S.pets[id];if(!P||!p)return null;
  const d=petStats(id),u=statUnit({name:P.name,st:p.st,lv:S.lv},'ally');
  Object.assign(u,{mhp:d.mhp,mmp:d.mmp,atk:d.atk,def:d.def,spd:d.spd,crit:d.crit,dodge:d.dodge,block:d.block,
    hp:p.hp==null?d.mhp:clamp(p.hp,0,d.mhp),mp:p.mp==null?d.mmp:clamp(p.mp,0,d.mmp),
    art:pickArt(P.art),por:P.por[0],key:id,pet:true,atkType:P.atkType,atkName:P.atkName,
    skills:P.skills.slice(),skLv:{}});
  petLive=u;return u}
function petTarget(){return aliveOf('foe').sort((a,b)=>a.hp/a.mhp-b.hp/b.mhp)[0]}
async function petTurn(u){
  const hero=B.allies.find(a=>a.isHero),cfg=PET_DEF[u.key],foe=petTarget();
  if(!hero||!foe)return;
  B.key=null;B.click=null;B.tgtList=null;
  const ratio=hero.hp/hero.mhp;
  if(ratio<=cfg.guardRatio&&u.mp>=cfg.guardMp&&(!hero.guardBy||hero.guardBy.hp<=0||hero.guardUntil<B.round)){
    u.mp-=cfg.guardMp;hero.guardBy=u;hero.guardUntil=B.round+1;
    showName(u,'护主');floatTxt(hero,'大黄护主','#9fe0b5',21);renderCards();await wait(450);return}
  if(ratio<=cfg.healRatio&&u.mp>=(SKILLS.lick.mp||0)&&hero.hp<hero.mhp){
    await doSkill(u,'lick',[hero],0);return}
  if(u.mp>=(SKILLS.sniff.mp||0)&&foe.known&&foe.known.size<foe.weak.length){
    await doSkill(u,'sniff',[foe],0);return}
  await doAttack(u,foe,0)
}
// 护主把主角受到的一半直接伤害转给宠物。只在敌方行动时触发。
const petHurt0=hurt;
hurt=function(t,dmg,col,big){
  if(t.isHero&&B&&B.cur&&B.cur.side==='foe'&&t.guardBy&&t.guardBy.hp>0&&t.guardUntil>=B.round&&dmg>1){
    const saved=Math.floor(dmg/2),guard=t.guardBy;
    floatTxt(guard,'护主','#9fe0b5',19);
    petHurt0(guard,saved,col,false);
    return petHurt0(t,dmg-saved,col,big)
  }
  return petHurt0(t,dmg,col,big)
};
const petBattle0=battle;
battle=async function(opt={}){petLive=null;let result;
  try{result=await petBattle0.call(this,opt);return result}
  finally{if(result&&S&&petLive&&S.pets&&S.pets[petLive.key]){
    const p=S.pets[petLive.key];
    if(result==='lose'&&!opt.noLose){p.hp=null;p.mp=null}
    else{p.hp=petLive.hp>=petLive.mhp?null:petLive.hp;p.mp=petLive.mp>=petLive.mmp?null:petLive.mp}
    save()
  }petLive=null}
};
