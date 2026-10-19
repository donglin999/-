'use strict';
// 第一章人物统一比例（2026-10-07 用户确认）：同一美术像素大小 + 整体缩小 15%。
// 规则：ART.scale = 单元格高 / 3 × 2 / 92 × 0.85，即 1 美术像素 = 1.7 世界单位；成人可见身高约 92→80。
// 来源 art_sources/character-pixel-20261007/audit.json；只覆盖第一章出场人物，其他章节不变。
// 2026-10-07 像素统一 + AI 修边采用（art_sources/character-pixel-fix-20261007/adopt.json）：引擎按每帧可见包围盒缩放，实测 1 美术像素 = 1.949 世界单位、成人可见高约 80；
// 叶蘅、店家、老人、帮众按该密度更新；主角按用户决定保持 0.905434（可见高约 83）。叶蘅、主角已撤回 82 规格高清表（qihe-ch1-hd-sprites.js 不再加载）。
Object.assign(ART.scale,{"ye":0.826113,"opening_zhouyan":0.868478,"opening_luheng":0.868478,"opening_chengduo":0.868478,"opening_censhuang":0.868478,"opening_wukui":0.868478,"opening_aunt":0.868478,"opening_chen":0.868478,"opening_apothecary":0.868478,"opening_steward":0.868478,"opening_retainer":0.868478,"opening_procurement":0.868478,"opening_procurement_aide":0.868478,"opening_bailiff":0.868478,"qh_bandit":0.857887,"qh_hero_initial":0.905434,"qh_merchant":0.868478,"qh_oldman":0.868478,"opening_hero_modern":0.868478});
// 故事版代表人物（qh_*_story，见 qihe-representatives-art.js）原为 ART.scale=1、陈伯休息 .78；同样整体缩小 15%。
// 这 4 张表原生约 82 像素高（1 美术像素≈1 世界单位），像素密度与上面 19 人不同，待重绘统一。
for(const[k,v]of Object.entries({qh_xulingyi_story:1,qh_censhuang_story:1,qh_shenyanhui_story:1,qh_chen_rest_story:.78}))if(ART.sheet[k])ART.scale[k]=v*.85;
