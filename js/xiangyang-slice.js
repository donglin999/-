'use strict';
// 襄阳单片段测试配置：不启动村庄、三年培养或白鹇谷正式剧情。
// #street 保留旧流程回归；#xiangyang 使用新人物关系的最小测试阵容。
if(location.hash==='#xiangyang')ORIGINS.modern={name:'异乡来客',desc:'萧白，二十四岁，来自现代；在此地尚无师承。',bonus:{},skill:'fist',silver:40};
PARTY_DEF.ye={name:'叶蘅',art:['lady'],por:['lady'],st:{str:3,con:4,agi:5,wil:5,wis:6},
  skills:['huichun','baicao'],atkType:'暗器',atkName:'药针'};
MN_MEM.ye={wk:['暗器','剑'],slots:['weapon','armor','acc'],learn:['医','内','暗器'],teachAff:3,role:'医者 · 测试占位'};
MN_PREF.ye=['wis','wil','con','wis','agi','con'];
window.COMPANIONS=Object.assign(window.COMPANIONS||{},{ye:{name:'叶蘅',sp:'c_lady',role:'医者'}});

const sliceReviewStart=reviewStart;
reviewStart=function(){
  sliceReviewStart();
  if(location.hash!=='#xiangyang')return;
  S.name='萧白';S.origin='modern';S.skills={fist:1};S.party=['ye'];S.flags.xiangyang_slice=1;
  mnEnsure();resetFollowers();hud();
};

const sliceCompanionTalk=window.onCompanionTalk;
window.onCompanionTalk=async function(id){
  if(id==='ye'){
    await say('叶蘅',S.flags.suzhi_met?'先把老周的毒解了。苏芷的针法，我还想再看一遍。':'那人气息很急。先过去看看。','c_lady');
    return;
  }
  return sliceCompanionTalk?.(id);
};

const sliceEnding=ending;
ending=async function(kind){
  if(location.hash!=='#xiangyang')return sliceEnding(kind);
  if(S.flags.xiangyang_result)return;
  S.flags.xiangyang_result=kind==='good'?'破案':'入伙';save();
  await fade(async()=>{mode='end';$('hud').hidden=true;$('prompt').hidden=true});
  mnCSS();
  const p=openPanel('jm jm-end');panelClose=null;panelKind='end';
  p.innerHTML=`<section class="jm-sheet jm-endw" style="background-image:url(${mnPaper()})">
    <div class="ttl">襄阳片段 · ${kind==='good'?'结案':'另一种结果'}</div>
    <p>${kind==='good'?'老周获救，铁臂帮与黑风寨的供毒线索留在案卷里。苏芷认得这味毒，叶蘅也记下了她的针法。':'你选择与黑风寨同行。老周的毒案仍会影响襄阳百姓，这一选择留下了后果。'}</p>
    <p class="jm-dim">当前只测试襄阳片段；后续三年培养尚未接入。</p>
    <div class="jm-acts" style="justify-content:center"><button class="jm-b ghost" data-a="roam">继续游历</button><button class="jm-b" data-a="reset">重测片段</button></div>
  </section>`;
  p.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;
    if(b.dataset.a==='reset'){sessionStorage.removeItem('xjh.review.save');location.reload();return}
    p.hidden=true;resetPanel();mode='scene';hud()};
};
