'use strict';
// Context adaptation for the existing Jianghu menu; new visual design awaits review.
(()=>{
 if(!isQiheEntry())return;
 const title=()=>window.QiheMilestones?.latest(S)||'江湖行卷';
 const portraitKey=w=>w==='hero'?(window.GuiyunHero?.longHair()?'gy_hero_long':S?.prologue?.arrival?.borrowed?'opening_hero_village':'opening_hero_modern'):null;
 const previousLog=questLog;
 // 2026-10-21：宋先生线改为可选（支线）；村中活动删去整理旧屋、村口问讯。
 questLog=function(){
  const list=previousLog(),p=S?.qiheChapter,contacts=window.QiheOutsiders?.contactRecords()||[];if(!p)return[...list,...contacts];
  const ended=['ended','cultivation'].includes(p.stage),refugeOrLater=['refuge','mountain','ended','cultivation'].includes(p.stage),passedMeetings=['fire','escape','refuge','mountain','ended','cultivation'].includes(p.stage);
  const records=[...contacts];
  const stranger=p.stage==='days'?QiheChapter.strangerPending?.():null;if(stranger||p.events?.['c1-00b'])records.push({t:stranger==='c1-00b'?'去后山收回竹匾（可选）':stranger?'后山有人等你回话（可选）':'后山的账房 · 宋先生',group:'支线',d:stranger==='c1-00b'?'周婶托你得空去后山倒木那儿收回晒药的竹匾。不耗时间，不去也不影响主线；过了今天上午就不在了。':stranger?'宋先生说「明早还在这儿」，等你回话。不耗时间，不去也不影响主线。':p.records?.stranger_deal==='declined'?'自称跑账的宋先生想托萧白记下来人、人数和站位，萧白没答应。':'自称跑账的宋先生托萧白记下来人、人数和站位，答应沿路打听叶蘅父亲的下落。'+(p.events['c1-s2']?'第三日他问起装卸侧口，萧白从没跟他说过这个地方。':''),where:'后山采药路 · 倒木',done:!stranger,chapterNpc:stranger?'stranger':null});
  if(p.halfDay>=2)records.push({t:'正道盟的请求 · 徐令仪',group:'主线记录',d:'徐令仪上门要谱，被叶蘅当面拒绝。周砚说自己是温行舟的旧友。徐令仪仍留了护院守路，回去查那张委托。',where:p.stage==='days'?'南村联络点 · 徐令仪':'栖河 · 第一日傍晚',done:!!p.events['xu-meeting']||(passedMeetings&&!!p.events.steward),chapterNpc:p.stage==='days'?'xulingyi':null});
  if(p.halfDay>=4)records.push({t:'玉匣与查验 · 岑霜、沈雁回',group:'主线记录',d:'岑声称叶家愿还玉匣；沈受程铎委办，却过度相信已验、同意交样的附页。普通药先送，两人仍各自限制药箱；邻村接应尚在准备。',where:p.stage==='days'?'东埠装卸路 · 岑霜 / 沈雁回':'栖河 · 第二日傍晚',done:!!p.events['three-meeting']||(passedMeetings&&!!p.events.medicine),chapterNpc:p.stage==='days'?'censhuang':null});
  if(refugeOrLater)records.push({t:'三张附页与第十七号底单',group:'主线线索',d:(p.events['evidence-v2']||p.evidenceReviewed)?(p.evidenceReviewed&&!p.events['evidence-v2']?'已补读旧进度对证记录：':'已对证：')+'原底单上只有六只旧药罐。三张附页却都约在第三夜戌时的装卸侧口，分别写成交谱、还匣、交样——叶家本来就没有这些东西。三家各自认了错，背后是谁还不知道。'+(p.records?.told_about_stranger?'宋姓账房已列为待问经手人。':''):'先安置伤者，再核对徐令仪、岑霜、沈雁回的附页。对证不需要完成可选跑腿，也不需要交出遗物。',where:'邻村接应院 · 核对点',done:!!(p.events['evidence-v2']||p.evidenceReviewed),chapterEvidence:true,chapterEvidenceLabel:p.stage==='refuge'&&!p.events['evidence-v2']?'对一对三张附页':'查看栖河对证记录'});
  const history=(window.QiheMilestones?.list(S)||[]).map(m=>({t:m.t,group:'江湖经历',d:m.d,done:true}));
  return [...list.filter(q=>q.t!=='眼下'&&q.group!=='江湖经历'),...(ended&&p.stage!=='cultivation'?[]:[{t:'眼下',d:esc(questLine()),done:false}]),...history,...records,
   ...(p.stage==='days'?QiheChapter.activities.map(a=>({t:a[1],group:'村中活动',chapterActivity:a[0],d:(!p.choices[a[0]]&&!QiheChapter.activityOpen(a[0])?'错过了时候，没办成。':'在当地与人物交谈后开展；不消耗时间，不自动推进主线。时限：'+QiheChapter.activityDeadline(a[0])+'。'+({transport:'完成后获得枣木短棍。',clinic:'完成后获得铜针囊。',market:'店家同时出售普通装备。'}[a[0]]||'')),closed:!p.choices[a[0]]&&!QiheChapter.activityOpen(a[0]),where:({clinic:'村中药棚 · 叶蘅',transport:'西田埂 · 药车',practice:'西田埂 · 陆衡',market:'南村口 · 店家'})[a[0]],done:!!p.choices[a[0]]})):[]),
   ...(!['opening','days'].includes(p.stage)?[{t:'丙级 · 护路棍法',group:'支线',d:p.granted?'已向陆衡学得第一层，招式和笔记仍可使用。':'离村前未向陆衡学习，本次村中活动已结束。山居安顿后，可向周砚请教基础功夫。',where:'栖河西田埂 · 离村前',done:!!p.granted,closed:!p.granted}]:[]),
   ];
 };
 const previousSides=mnQuests;mnQuests=function(){return previousSides().filter(q=>!q.d.startsWith('可选 · 尚未接受'))};
 addEventListener('keydown',e=>{if(e.key.toLowerCase()==='j'&&!e.defaultPrevented&&!e.repeat&&!e.isComposing&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target?.isContentEditable&&!['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName)&&S&&mode==='scene'&&!busy&&!dlgBusy&&$('panel').hidden){e.preventDefault();QihePrologue.journal()}});
 window.QiheMenu={title,portraitKey};
})();
