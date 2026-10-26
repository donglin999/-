'use strict';
// 三方代表（徐令仪、岑霜、沈雁回）的剧情入口。台词在 ink 剧本 story/01-开始/三方-*.ink（2026-10-19 三方批次迁入），
// 本文件只留游戏函数绑定和流程入口；主线 qihe-chapter.js 负责存档与事件顺序，调用接口不变。
(()=>{
 if(!isQiheEntry())return;
 const sprites={徐令仪:'c_qh_xulingyi_story',岑霜:'c_qh_censhuang_story',沈雁回:'c_qh_shenyanhui_story'};
 // 播放一段三方剧本：台词按段攒起来交给场景原有的 sayAll（站位与原来逐段 sayAll 相同），
 // 选项交给场景原有的 ask；reps_beat() 分段，cg_begin()/cg_end() 之间的台词放进起火插画里演。
 let depth=0,realChoose=null;
 async function play(knot,{say:sayRows,ask:askFn},externals={},vars={}){
  let buf=[],cgShot=null,cgRows=[];
  const flush=async()=>{if(!buf.length)return;const rows=buf;buf=[];await sayRows(rows)};
  const ext={reps_beat:flush};
  for(const[k,f]of Object.entries(externals))ext[k]=async(...a)=>{await flush();return f(...a)};
  ext.cg_begin=async shot=>{await flush();cgShot=shot;cgRows=[]};
  ext.cg_end=async()=>{const shot=cgShot,rows=cgRows;cgShot=null;cgRows=[];await QiheFireCinematic.play(shot,rows)};
  if(!depth++)realChoose=window.choose;
  const outer=window.choose,mine=async(who,text,opts)=>{await flush();window.choose=realChoose;try{return await askFn(who,text,opts)}finally{window.choose=mine}};
  window.choose=mine;
  try{await StoryRuntime.play(knot,{line:(id,who,text)=>{(cgShot?cgRows:buf).push([who,text])},externals:ext,vars});await flush()}
  finally{window.choose=outer;if(!--depth)realChoose=null}
 }
 // 没有选项、没有演出动作的剧本段，同步取出台词（主线 qihe-chapter.js 仍按 rows.fireDemand / fireCollision 取用）
 function linesOf(knot){
  const story=new inkjs.Story(STORY_DATA[knot]);for(const name of window.STORY_EXTERNALS||[])story.BindExternalFunction(name,()=>name==='flag'?false:null,true);
  story.ChoosePathString(knot);const rows=[];
  while(story.canContinue){const t=story.Continue().trim();if(!t)continue;const m=t.match(/^([^：【（]{1,12})：(.*)$/s);rows.push(m?[m[1],m[2]]:['',t.replace(/^【|】$/g,'')])}
  return rows;
 }
 const rows={get fireDemand(){return linesOf('qihe_reps_fire_demand')},get fireCollision(){return linesOf('qihe_reps_fire_collision')}};
 const scene=ctx=>({say:ctx.sayAll,ask:ctx.ask});
 const note=ctx=>(key,value)=>{ctx.p.questions||={};ctx.p.questions[key]=value};
 async function pressure(ctx){await play('qihe_reps_xu',scene(ctx),{reps_note:note(ctx)})}
 async function medicine(ctx){await play('qihe_reps_medicine',scene(ctx),{},{watched:!!window.QiheChapter?.strangerAccepted?.(ctx.p)})}
 async function rescueOrders(ctx){await play('qihe_reps_rescue',scene(ctx),{},{clash:!!ctx.p.clashVersion})}
 async function evidence(ctx){
  const kept=ctx.ownsStrangerGifts?.()||[];
  await play('qihe_reps_evidence',scene(ctx),{
   reps_told:told=>{(ctx.p.records||={}).told_about_stranger=told},
   reps_stranger_gift:()=>ctx.strangerGift?.('c1-07',50)
  },{met:!!ctx.p.events['three-meeting'],watched:!!window.QiheChapter?.strangerAccepted?.(ctx.p),clash:!!ctx.p.clashVersion,has_coat:kept.includes('青绫行衣'),has_abacus:kept.includes('乌木算珠')});
  ctx.p.evidence={version:2,receipt:'旧药罐六只',number:17,authorization:false,forgerySuspected:true,mastermindKnown:false,relicsAbsent:true,strangerNamed:!!ctx.p.records?.told_about_stranger,originalsReturned:true,responsible:['徐令仪','岑霜','沈雁回']};
 }
 const names={xulingyi:'徐令仪',censhuang:'岑霜',shenyanhui:'沈雁回'};
 // 找人说话：对方先按当下情形开口，再给选项（2026-10-17 试玩反馈）；跑腿选项由 QiheOutsiders 提供。
 async function interact(id,ctx){if(!names[id])return false;const after=ctx.p.stage==='refuge'&&!!ctx.p.events['evidence-v2'];
  const errand=!!(window.QiheOutsiders?.available()&&QiheOutsiders.representativeKey(id)),q=errand&&S.prologue.outsiders?.quests?.[QiheOutsiders.representativeKey(id)],stage=q?.stage||'none';const open=errand&&QiheOutsiders.questOpen(QiheOutsiders.representativeKey(id));
  await play('qihe_reps_talk_'+id,scene(ctx),{reps_note:note(ctx),reps_errand:()=>QiheOutsiders.talk(id),reps_evidence:()=>ctx.evidence()},{
   after,refuge:ctx.p.stage==='refuge',met:!!ctx.p.events[id==='xulingyi'?'xu-meeting':'three-meeting'],
   errand_new:open&&stage==='none',errand_active:open&&stage!=='none'&&stage!=='done',errand_done:errand&&stage==='done'});
  return true;
 }
 window.QiheRepresentatives={sprites,rows,play,pressure,medicine,rescueOrders,evidence,interact,names};
})();
