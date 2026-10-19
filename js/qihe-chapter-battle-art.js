'use strict';
// Generated chapter-specific sheets; source/QA: art_sources/qihe-chapter1-battle-v1.
(() => {
 if(!isQiheEntry())return;
 const sheets={"qh_luheng_v1":{"file":"b_qh_luheng_hd_20261017","cell":[480,324],"cols":16,"px":[240,162],"body":95,"h":324,"tier":"party","facing":"l","anchor":[240,304],"anim":{"idle":{"f":[0,1,0],"ms":[380,420,380],"loop":true},"dash":{"f":[2,3],"ms":[90,120]},"atk":{"f":[4,5,6,7],"ms":[150,70,170,130],"hit":1},"atk2":{"f":[8,9,10],"ms":[80,70,150],"hit":1},"hurt":{"f":[12],"ms":320},"cast":{"f":[11],"ms":[520]},"brk":{"f":[13],"ms":[840],"loop":true},"dead":{"f":[12,13,14],"ms":[140,160,400]},"win":{"f":[15],"ms":[920]}},"frames":["guard","guard-breath","dash-a","dash-b","wind","strike","follow","back","chamber","thrust","recover","cast","hurt","kneel","dead","win"],"pixelScale":2,"faceCrop":[223,112,57,60]},"qh_raider_front_v1":{"file":"b_qh_raider_front_hd_20261017","cell":[480,324],"cols":16,"px":[240,162],"body":95,"h":324,"tier":"minion","facing":"r","anchor":[240,304],"anim":{"idle":{"f":[0,1,0],"ms":[380,420,380],"loop":true},"dash":{"f":[2,3],"ms":[90,120]},"atk":{"f":[4,5,6,7],"ms":[160,70,170,130],"hit":1},"atk2":{"f":[8,9,10],"ms":[90,70,150],"hit":1},"hurt":{"f":[12],"ms":320},"cast":{"f":[11],"ms":[520]},"brk":{"f":[13],"ms":[840],"loop":true},"dead":{"f":[12,13,14],"ms":[140,160,400]}},"frames":["guard","guard-breath","dash-a","dash-b","wind","strike","follow","back","chamber","thrust","recover","cast","hurt","kneel","dead","taunt"],"pixelScale":2,"faceCrop":[252,112,57,60]},"qh_raider_rear_v1":{"file":"b_qh_raider_rear_hd_20261017","cell":[480,324],"cols":16,"px":[240,162],"body":95,"h":324,"tier":"minion","facing":"r","anchor":[240,304],"anim":{"idle":{"f":[0,1,0],"ms":[380,420,380],"loop":true},"dash":{"f":[2,3],"ms":[90,120]},"atk":{"f":[4,5,6,7],"ms":[160,70,170,130],"hit":1},"atk2":{"f":[8,9,10],"ms":[90,70,150],"hit":1},"hurt":{"f":[12],"ms":320},"cast":{"f":[11],"ms":[520]},"brk":{"f":[13],"ms":[840],"loop":true},"dead":{"f":[12,13,14],"ms":[140,160,400]}},"frames":["guard","guard-breath","dash-a","dash-b","wind","strike","follow","back","chamber","thrust","recover","cast","hurt","kneel","dead","taunt"],"pixelScale":2,"faceCrop":[189,112,57,60]}};
 Object.assign(BART,sheets);
 const backgrounds={lesson:'bb_qh_training_v1',road:'bb_qh_evacuation_v1'};
 ASSETS.push(...Object.values(sheets).map(a=>a.file),...Object.values(backgrounds));
 for(const id of Object.keys(sheets))BATTLE_ADULT.add(id);
 async function preload(kind){
  if(!backgrounds[kind])throw Error('未知第一章战斗：'+kind);
  const ids=kind==='lesson'?['hero_village','qh_luheng_v1']:['hero_village',...Object.keys(sheets)];
  for(const id of ids){const a=BART[id];if(!a||!a.anim||!a.cell||sheets[id]&&a.file!==sheets[id].file)throw Error('第一章战斗表未就绪：'+id)}
  const files=[backgrounds[kind],...ids.map(id=>BART[id].file),'p_opening_hero_village','p_opening_luheng'];
  await Promise.all(files.map(async key=>{if(!ok(IMG[key]))await loadOpt(key,key);if(!ok(IMG[key]))throw Error('无法载入第一章专用战斗素材：'+key)}));
  for(const id of ids){const a=BART[id],im=IMG[a.file];if(im.width!==a.cell[0]*a.cols||im.height!==a.cell[1])throw Error('第一章战斗表尺寸不符：'+id)}
 }
 window.QiheChapterBattleArt={backgrounds,preload,sheets};
})();
