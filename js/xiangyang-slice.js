'use strict';
// 襄阳单片段测试配置：不启动村庄、三年培养或白鹇谷正式剧情。
// #street 保留旧流程回归；#xiangyang 使用新人物关系的最小测试阵容。
if(location.hash==='#xiangyang')ORIGINS.modern={name:'异乡来客',desc:'萧白，二十四岁，来自现代；在此地尚无师承。',bonus:{},skill:'fist',silver:40};
PARTY_DEF.ye={name:'叶蘅',art:['ye'],por:['ye'],st:{str:3,con:4,agi:5,wil:5,wis:6},
  skills:['huichun','baicao'],atkType:'暗器',atkName:'药针'};
MN_MEM.ye={wk:['暗器','剑'],slots:['weapon','armor','acc'],learn:['医','内','暗器'],teachAff:3,role:'乡村医者'};
MN_PREF.ye=['wis','wil','con','wis','agi','con'];
window.COMPANIONS=Object.assign(window.COMPANIONS||{},{ye:{name:'叶蘅',sp:'c_ye',role:'医者'}});

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
    const line=!S.flags.suzhi_met?'街心围了人。我们先去看看。':(S.flags.xq||0)<3?'老周的脉还能撑一阵。先查茶碗、问经手的人。':(S.flags.xq||0)<4?'解药拿到了。快交给苏芷，我来扶住老周。':S.scene==='ferry'||S.scene==='ferry_e'||S.scene==='crossing'?'账簿只写到渡口。再往上游追，得看货签。':'苏芷说可以转交医案。我会自己想好，再决定走哪条路。';
    const expression=!S.flags.suzhi_met?'surprise':(S.flags.xq||0)<4?'worry':'smile';
    await say('叶蘅',line,'c_ye:'+expression);
    return;
  }
  return sliceCompanionTalk?.(id);
};

const sliceEnding=ending;
ending=async function(kind){
  if(location.hash!=='#xiangyang')return sliceEnding(kind);
  if(S.flags.xiangyang_result&&!(kind==='good'&&S.flags.xiangyang_result==='救人结案'))return;
  S.flags.xiangyang_result=kind==='good'?'破案':kind==='local'?'救人结案':'入伙';save();
  await fade(async()=>{mode='end';$('hud').hidden=true;$('prompt').hidden=true});
  mnCSS();
  const p=openPanel('jm jm-end');panelClose=null;panelKind='end';
  const title=kind==='good'?'深追结案':kind==='local'?'老周脱险':'另一种结果';
  const report=kind==='good'?'账簿与东津渡货签证实铁臂帮向黑风寨送货。老周获救，疤脸刘经手毒案的责任已有证据；青蚨散的制作者仍待查明。':kind==='local'?`老周获救。解药、账簿${S.bag.tea_bowl?'、茶碗':''}和街坊证言足以记录疤脸刘经手毒案的责任；东津渡及上游药源可继续追查。`:'你选择与黑风寨同行。老周的毒案仍影响襄阳百姓，这一选择留下了后果。';
  p.innerHTML=`<section class="jm-sheet jm-endw" style="background-image:url(${mnPaper()})">
    <div class="ttl">襄阳片段 · ${title}</div>
    <p>${report}</p>
    <p>叶蘅与苏芷共同救下老周。苏芷愿代转医案，叶蘅保留自行决定去向的权利。</p>
    <p class="jm-dim">地方事件已记录；三年培养与白鹇谷入门尚未接入。</p>
    <div class="jm-acts" style="justify-content:center"><button class="jm-b ghost" data-a="roam">继续游历</button><button class="jm-b" data-a="reset">重测片段</button></div>
  </section>`;
  p.onclick=e=>{const b=e.target.closest('[data-a]');if(!b)return;
    if(b.dataset.a==='reset'){sessionStorage.removeItem('xjh.review.save');location.reload();return}
    p.hidden=true;resetPanel();mode='scene';hud()};
};
