'use strict';
// 江湖经历（2026-10-19 用户要求）：界面不写“第几章”、不显示固定的部分或环节名；
// 像《大侠立志传》那样，事件完成之后才记下一条概括名字。行卷标题与存档栏显示最近完成的一条。
(()=>{
 const after=(c,...st)=>!!c&&st.includes(c.stage);
 function list(s=window.S){
  const p=s?.prologue,c=s?.qiheChapter,out=[];if(!p)return out;
  const add=(t,d)=>out.push({t,d});
  if(p.arrival?.stage==='done'||p.rested||c)add('后山遇狼','在后山被狼逼到采药路上，和叶蘅一起把它赶走，随她下山进村。');
  if(p.rested||c)add('栖河第一夜','在陈伯家的客房借宿，在栖河度过了第一夜。');
  if(c?.events?.['xu-meeting'])add('正道盟上门要谱','徐令仪拿着委托上门要谱，叶蘅当面说自己从没托过人。');
  if(c?.events?.['three-meeting'])add('玉匣与药样','岑霜说叶家愿还玉匣，沈雁回要查验药样，叶蘅都没答应过。');
  if(after(c,'fire','escape','refuge','mountain','ended','cultivation'))add('栖河起火','第三夜村里起了火。');
  if(after(c,'refuge','mountain','ended','cultivation'))add('护送乡邻离村','随乡邻与药车撤出栖河，到邻村落脚。');
  if(c?.events?.['evidence-v2']||c?.evidenceReviewed)add('对证三张附页','陈伯拿出原底单，只有六只旧药罐；三家各自认了错。');
  if(after(c,'mountain','ended','cultivation'))add('山居安身','乡邻得到接应，随周砚上山暂住。');
  return out;
 }
 const latest=s=>{const l=list(s);return l.length?l[l.length-1].t:null};
 window.QiheMilestones={list,latest};
})();
