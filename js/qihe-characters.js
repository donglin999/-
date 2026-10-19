"use strict";
// 2026-10-19：叶蘅的同伴定义原写在 js/xiangyang-slice.js，该文件随襄阳演示归档（updates/2026-10-19-deprecated-entries.md）后丢失，
// 致栖河队伍、菜单、战斗里叶蘅被剔除。原样移回此处（硬依赖），数值与原定义一致。
PARTY_DEF.ye={name:'叶蘅',art:['ye'],por:['ye'],st:{str:3,con:4,agi:5,wil:5,wis:6},
  skills:['huichun','baicao'],atkType:'暗器',atkName:'药针'};
MN_MEM.ye={wk:['暗器','剑'],slots:['weapon','armor','acc'],learn:['医','内','暗器'],teachAff:3,role:'乡村医者'};
MN_PREF.ye=['wis','wil','con','wis','agi','con'];
window.COMPANIONS=Object.assign(window.COMPANIONS||{},{ye:{name:'叶蘅',sp:'c_ye',role:'医者'}});
(()=>{
 if(!isQiheEntry())return;
 const active=()=>!!S?.prologue&&S.prologue.version===2;
 const modern=()=>active()&&S.prologue.arrival&&!S.prologue.arrival.borrowed;
 DIALOGUE_LEADS.add('opening_hero_modern');PORTS.push('opening_hero_modern');
 const names={药商:'c_opening_apothecary',管事:'c_opening_steward',护院:'c_opening_retainer',采办使:'c_opening_procurement',陆衡:'c_opening_luheng',程铎:'c_opening_chengduo',岑霜:'c_qh_censhuang_story',乌魁:'c_opening_wukui',叶蘅:'c_ye',周婶:'c_opening_aunt',陈伯:'c_opening_chen',周砚:'c_opening_zhouyan',店家:'c_merchant',村口老人:'c_oldman',差役:'c_opening_bailiff',采办随从:'c_opening_procurement_aide',帮众:'c_bandit'};
 const applyScene=sc=>{if(sc&&active())sc.playerSp=modern()?'opening_hero_modern':'qh_hero_initial'};
 window.OpeningCharacters={active,modernEvent:false,applyScene,
  dialogueSprite(who,text,sp){if(!active())return sp;if(who.startsWith('叶蘅 ·'))return'c_ye';return who===(S.name||'萧白')?(modern()?'c_opening_hero_modern':'c_opening_hero_village'):names[who]||sp},
  fullscreenCGActive(){const el=document.getElementById('prologue-cg');return document.body.classList.contains('qh-cinematic')||!!el&&!el.hidden}
 };
 const spawn=spawnWanderers;spawnWanderers=function(){applyScene(cur);return spawn()};
})();
