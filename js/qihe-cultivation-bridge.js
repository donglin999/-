'use strict';
// Adopted 2026-10-05 snapshot; this workspace owns the free-practice adaptation.
(()=>{
 if(!isQiheEntry())return;
 window.CultivationStory.enabled=true;window.CultivationRigTrial.enabled=true;
 const start=qiheTrialStart;
 CultivationData.progressNames.qh_staff='护路棍法熟练';CultivationData.actions.push({id:'QH01',category:'skill',costOverride:5,name:'护路棍法复盘',teacher:'陆衡的本人笔记',requires:['joined','qh_hulu_staff'],learn:'qh_hulu_staff',gain:'qh_staff',amount:8,feedback:'照本人笔记复盘握持与收势。熟练增加，不凭空晋层。',beats:['护路棍法 · 本人笔记复盘'],storyPortrait:assetImagePath('p_opening_luheng'),portraitRect:[0,0,480,640]});
 CultivationDialogue.activities(CultivationData);

 function migrate(){if(S.cultivation?.qhImported)return;const old=S.qiheCultivation;if(old?.pending){if(old.pending.stage!=='result')QiheLegacyCultivationCore.resolve(old,0);QiheChapter.applyCultivationReward();QiheLegacyCultivationCore.closeResult(old);}const s=S.cultivation||CultivationCore.initial();s.qhImported=true;s.qhOrigin={rescue:S.qiheChapter?.rescue,chenCare:S.qiheChapter?.chenCare,supplies:S.qiheChapter?.supplies,coreOwner:'叶蘅'};
 if(old){s.joined=!!old.joined;s.facts.joined=s.joined;s.progress={...old.progress};s.resources={...s.resources,...old.resources};s.learned={...old.learned};s.history=(old.history||[]).map(h=>({...h,freePractice:true,nominalCost:['B01','B02','B03','B04','B05','B06','K01','K02'].includes(h.action)?5:h.cost}));s.sequence=Math.max(old.sequence||0,s.history.length);s.staffApplied=s.history.filter(h=>h.action==='QH01').map(h=>h.id);}
 s.joined=true;s.facts.joined=true;if(S.skills?.qh_hulu_staff)s.learned.qh_hulu_staff={source:'陆衡·栖河第一章',period:-1};S.cultivation=s;}
 // 旧版培养导入出错不阻断进入；培养读档本身的修复与出口在 Cultivation.start 里（2026-10-16 审查 P0）。
 function enter(){try{migrate()}catch(e){console.error('旧版培养进度导入失败：',e);toast('旧版培养进度导入失败：'+e.message+'。原记录保留未动。',5000)}S.qiheChapter.stage='cultivation';S.chapter=Math.max(2,S.chapter||1);S.sect='guiyun';QihePrologue.checkpoint();Cultivation.start({inherit:true});}
 function openMartial(){const root=$('cultivation');root.hidden=true;mode='scene';QiheJianghuUI.open('skill','hero');const close=panelClose;panelClose=()=>{close?.();mode='cultivation';Cultivation.start({inherit:true});};}
 // 养成界面点头像：打开江湖页（队伍页），关闭后回到养成。
 function openJianghu(tab='party'){const root=$('cultivation');root.hidden=true;mode='scene';QiheJianghuUI.open(tab,'hero');const close=panelClose;panelClose=()=>{close?.();mode='cultivation';Cultivation.start({inherit:true});};}
 window.QiheCultivationBridge={enter,migrate,openMartial,openJianghu};
 window.qiheTrialStart=async function(){await start();if(S?.qiheChapter?.stage==='cultivation')enter();};
 const baseEnsure=mnEnsure;mnEnsure=function(...args){if(S?.cultivation){S.zy||=Object.fromEntries(MN_ZY.map(k=>[k,MN_ZY0[S.origin]?.[k]||0]));S.ji||={yi:0,du:0,shi:0,...(MN_JI0[S.origin]||{})};CultivationCore.reconcileWorld(S);}return baseEnsure(...args)};
 const baseDerived=derived;derived=function(u=S){
  if(u===S)mnEnsure();
  const raw=window.CharacterCondition?{...u,conditions:[],...(u===S?{xw:'hero'}:{})}:u;
  let d=baseDerived(raw);
  if((u===S||u.xw==='hero')&&S?.cultivation){const b=CultivationCore.growth(S.cultivation).bonuses;d={...d};for(const[k,n]of Object.entries(b))d[k]=(d[k]||0)+n;}
  return window.CharacterCondition?CharacterCondition.apply(d,u):d;
 };
})();
