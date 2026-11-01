'use strict';
// 2026-11-01 用户“很多角色还是老版素材”：村里这批人对话时只显示地图小人的小框，定稿立绘（2026-10-30 通用立绘、新人物、蔺管事）只在查看页。这里接进对话框。
// 表：运行键 → [立绘素材, 眼线, 下巴（按 640 高）, 性别]。立绘后期规格见 art_sources/*/finalize.py。
(()=>{
 if(!isQiheEntry())return;
 const G='p_qh_generic_',D='_20261030';
 const T={qh_oldman:[G+'elder'+D,128,181,'m'],opening_aunt:[G+'aunt'+D,105,159,'f'],opening_chen:[G+'chen'+D,121,176,'m'],qh_chen_rest_story:[G+'chen'+D,121,176,'m'],qh_merchant:[G+'innkeeper'+D,116,171,'m'],opening_apothecary:[G+'apothecary'+D,120,176,'m'],opening_retainer:[G+'retainer'+D,141,196,'m'],qh_bandit:[G+'bandit'+D,105,160,'m'],opening_bailiff:[G+'bailiff'+D,114,169,'m'],opening_procurement_aide:[G+'bailiff'+D,114,169,'m'],
  qh_atan:['p_qh_atan_hd_20261029',112,166,'m'],qh_aqi:['p_qh_aqi_hd_20261023',100,155,'m'],qh_ashuan:['p_qh_ashuan_hd_20261023',157,205,'m'],qh_xiaohe:['p_qh_xiaohe_hd_20261023',172,222,'f'],qh_huolang:['p_qh_huolang_hd_20261023',127,172,'m'],qh_chuanjia:['p_qh_chuanjia_hd_20261023',127,172,'m'],qh_linhuizhi:['p_qh_linhuizhi_hd_20261023',120,160,'m']};
 for(const[k,[asset,eye,chin,g]]of Object.entries(T)){window.PRODUCTION_ASSET_PATHS['p_'+k]=window.PRODUCTION_ASSET_PATHS[asset];if(!PORTS.includes(k))PORTS.push(k);DIALOGUE_LEADS.add(k);ASSETS.push('p_'+k);DialogueStage.frame(k,eye,chin,g)}
})();
