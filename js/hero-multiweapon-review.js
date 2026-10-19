/* Explicit review fixture only; ordinary saves and ordinary starts never enter here. */
(()=>{'use strict';if(!isQiheBattleReview()||new URLSearchParams(location.search).get('battleReview')!=='hero')return;
const choices={fist:['空手',null],sword_wood:['木剑','wood'],sword_steel:['钢剑','iron'],dao:['刀','knife'],staff:['棍','club'],needle:['暗器','needles']};
const raw=new URLSearchParams(location.search).get('weapon'),family=choices[raw]?raw:'sword_steel';
const bar=document.createElement('aside');bar.id='hero-weapon-review';bar.style.cssText='position:fixed;left:8px;top:6px;z-index:950;background:#172322ed;border:1px solid #8faea0;padding:7px 10px;color:#e7ecdf;font:12px sans-serif;max-width:calc(100% - 36px)';
bar.innerHTML='<b>独立试玩 · 萧白归云阶段</b>　'+Object.entries(choices).map(([id,[name]])=>`<a style="color:${id===family?'#ffdfa1':'#b4d4c7'};margin-right:9px" href="?battleReview=hero&weapon=${id}&play=1#qihe-map">${name}</a>`).join('')+'<a style="color:#b4d4c7" href="review/character-completion-20261014/">动作总览</a>';
document.body.appendChild(bar);
window.HeroMultiweaponReview={async play(){
 S.cultivation=CultivationCore.initial();S.cultivation.joined=true;S.cultivation.facts.gy_hair_long={period:0};S.cultivation.month=4;S.cultivation.phase=2;
 S.lv=6;S.st={str:5,con:5,agi:5,wil:5,wis:5};S.party=[];S.pet=null;S.bag={wood:1,iron:1,knife:1,club:1,needles:1,bun:3};S.weapon=choices[family][1];S.skills={fist:1};S.load=[];
 if(family.startsWith('sword')){S.skills.gy_s1=1;S.load=['gy_s1'];S.cultivation.learned.sword={source:'review'};}
 else if(family==='fist'){S.skills.gy_p1=1;S.load=['gy_p1'];S.cultivation.learned.fist={source:'review'};}
 const d=derived();S.hp=d.mhp;S.mp=d.mmp;save();
 const f=CultivationHousehold.definitions.find(d=>d.id==='gy_spar_dou').fight;
 const result=await battle({...JSON.parse(JSON.stringify(f)),guiyunHero:true,heroPor:'gy_hero_long',solo:true,noLose:true,noFlee:true,allowAuto:true});window.__heroWeaponReviewResult={family,result};return result;
}};
})();
