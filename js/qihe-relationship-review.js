'use strict';
// 独立验证资源，不写普通玩家档。只有显式两个评审参数同时存在才生效。
(()=>{const p=new URLSearchParams(location.search);if(p.get('relationshipReview')!=='1'||!p.get('chapterPresentationReview')||!isQiheEntry())return;
const previous=qiheTrialStart;window.qiheTrialStart=async function(){await previous();if(!S.cultivation){S.cultivation=CultivationCore.initial();S.cultivation.joined=true;S.cultivation.facts.joined=true;Object.assign(S.cultivation.resources,{food:3,herb:3,pouch:3});S.cultivation.qhImported=true;S.qiheChapter.stage='cultivation';save();}QiheCultivationBridge.enter();};})();
