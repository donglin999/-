'use strict';
// 本机评审入口（2026-10-20）：?uiReview=1&cultivationScene=<剧情id>[&month=2][&phase=0][&facts=事实1,事实2]
// 用“界面验收”的独立存档直接进入培养模式并播放指定剧情，看真实界面里的演出（底部活动栏、对白气泡、双人 Q 版）。
// 不读写玩家存档；本文件登记在 scripts/build-pages.cjs 的 REVIEW_SCRIPTS，不进发布包。
(()=>{
 const p=new URLSearchParams(location.search),id=p.get('cultivationScene');
 if(!id||typeof isQiheUIReview!=='function'||!isQiheUIReview())return;
 const base=window.qiheTrialStart;
 window.qiheTrialStart=async function(){
  await base();
  const C=window.CultivationCore,s=C.initial();if(C.join)C.join(s);
  s.month=Number(p.get('month')||2);s.phase=Number(p.get('phase')||0);
  for(const f of (p.get('facts')||'').split(',').filter(Boolean))s.facts[f]=true; // 2026-10-21：&facts=gn_lamp_seen,... 补前置剧情事实，只用于本机评审
  for(const f of ['gy_noodles_seen','gy_prelude_tour_seen','gy_prelude_stance_seen','gy_prelude_xinfa_seen','gy_prelude_hair_seen','gy_night_return_seen'])s.facts[f]=true;
  const st=JSON.parse(JSON.stringify(S));st.cultivation=s;st.qiheChapter={...(st.qiheChapter||{}),stage:'cultivation'};
  Cultivation.start({state:st});
  try{C.start(Cultivation.state(),id,{story:true});}catch(e){console.error('评审：无法开始剧情 '+id,e);}
  Cultivation.render();
 };
})();
