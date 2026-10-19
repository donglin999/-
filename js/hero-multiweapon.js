/* Guiyun protagonist: approved pixel body, actual equipment and action families. */
(function(root){'use strict';
const families=['fist','sword_wood','sword_steel','dao','staff','needle'];
function familyFor(weapon,items,kind){
 const item=items?.[weapon],type=kind||item?.weapon?.kind||'拳';
 if(['拳','掌','腿','拳掌','拳套','内','医'].includes(type))return'fist';
 if(type==='剑')return item?.weapon?.visualFamily==='sword_wood'||weapon==='wood'||weapon==='eq_practice_sword'||/桃木|木剑|练剑/.test(item?.name||'')?'sword_wood':'sword_steel';
 return {'刀':'dao','棍':'staff','暗器':'needle'}[type]||null;
}
function inStage(state){const c=state?.cultivation;return !!(c?.facts?.gy_hair_long||c?.joined&&(c.month>1||c.phase>0));}
function artFor(state,items,kind){const family=familyFor(state?.weapon,items,kind);return family?'gy_hero_'+family:null;}
const API={families,familyFor,inStage,artFor};
if(typeof module==='object'&&module.exports){module.exports=API;return;}
root.HeroMultiweapon=API;if(typeof isQiheEntry!=='function'||!isQiheEntry())return;
const data=root.HeroMultiweaponArtData;if(!data)throw Error('主角多武器动作数据缺失');
for(const [key,art]of Object.entries(data)){BART[key]=art;BATTLE_ADULT.add(key);BATTLE_ADULT_RATIO[key]=1;if(!ASSETS.includes(art.file))ASSETS.push(art.file);}
const isHero=u=>u?.isHero&&/^gy_hero_/.test(u.art||'');
const oldHero=mkHero;mkHero=function(){const u=oldHero.apply(this,arguments);if(inStage(S)){u.art=artFor(S,ITEMS)||u.art;u.por='gy_hero_long';}return u;};
const oldBattle=battle;battle=async function(options={}){
 const use=options.guiyunHero||/^gy_hero_/.test(options.heroArt||'')||inStage(S)&&!options.heroArt;
 if(use){const art=artFor(S,ITEMS);if(!art)throw Error('当前兵器尚无对应的主角动作：'+(ITEMS[S.weapon]?.name||S.weapon));
  options={...options,heroArt:art,heroPor:options.heroPor||'gy_hero_long'};
  // Unarmed skills may be used while a sword is equipped; load their complete
  // body before the battle rather than briefly showing a legacy fallback.
  for(const key of [art,'gy_hero_fist']){const file=BART[key].file;if(!ok(IMG[file]))await loadOpt(file,file);if(!ok(IMG[file]))throw Error('主角动作加载失败：'+key);}
 }
 return oldBattle.call(this,options);
};
const oldSkill=doSkill;doSkill=async function(u,k,tgs,bp){
 if(!isHero(u))return oldSkill.apply(this,arguments);
 const before=u.art,kind=SKILLS[k]?.kind,type=['拳','掌','腿'].includes(kind)?'拳':null;
 const actionArt=type?artFor(S,ITEMS,type):before;
 if(actionArt!==before){const file=BART[actionArt].file;if(!ok(IMG[file]))await loadOpt(file,file);if(!ok(IMG[file]))throw Error('徒手招式动作加载失败');u.art=actionArt;u.anim=null;}
 try{return await oldSkill.apply(this,arguments);}finally{u.art=before;u.anim=null;}
};
})(typeof globalThis!=='undefined'?globalThis:this);
