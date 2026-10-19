'use strict';
// Optional prologue errands. Knowledge is earned through witnesses, never assumed.
(()=>{
 if(!isQiheEntry())return;
 // 台词在 ink 剧本 story/01-开始/三方-跑腿-*.ink（2026-10-19 三方批次迁入）：<键>_offer 托付、_wait 提醒、_check 核对、_turnin 回话、_done 办完后；
 // 这里只留任务名、行程说明、给多少路费和办完后的摘要（行程面板文字）。
 const defs={
  letter:{name:'一封未落款的拜帖',owner:'徐令仪',flag:'skill',reward:6,
   steps:{accepted:'去村子东北的陈伯家，请陈伯看看拜帖该给谁。',checked:'回南村口联络院门前，把陈伯的话带给徐令仪。'},
   summary:'徐令仪托你送一封空着收帖人的拜帖。陈伯看出帖上写着“旧谱登记”，让你带话：东西有主人，要问就问叶蘅本人。'},
  account:{name:'旧罐与玉匣',owner:'岑霜',flag:'box',reward:8,
   steps:{accepted:'去南村口药摊，问药商那笔账到底买的是什么。',checked:'把药商的话带给岑霜：第二天傍晚前她在南村车道旁，之后在东埠装卸路。'},
   summary:'岑霜托你核乌魁带回的旧货账：药商只卖过六只旧药罐，玉匣他连见都没见过。'},
  ledger:{name:'药单上的两道数',owner:'沈雁回',flag:'inspection',reward:6,
   steps:{accepted:'去村子东边的药棚，问周婶那几篓药各是什么。',checked:'回东埠核货点，请差役一起看看验收栏，再回话给沈雁回。',witnessed:'回东埠核货点，把核对的结果告诉沈雁回。'},
   summary:'沈雁回托你核药单：两篓货药、一篓病人药包分开记；“已验”那栏没人签字，采办报的数还要再查。'}
 };
 const sprites={萧白:'c_hero',陈伯:'c_opening_chen',药商:'c_opening_apothecary',周婶:'c_opening_aunt',差役:'c_opening_bailiff',...QiheRepresentatives.sprites};
 const representatives={xulingyi:'letter',censhuang:'account',shenyanhui:'ledger'};
 const representativeKey=id=>representatives[id];
 const handles=id=>['steward','wukui','procurement'].includes(id);
 const keyFor=id=>representativeKey(id)||({steward:'letter',wukui:'account',procurement:'ledger'})[id];
 const available=()=>!!S?.prologue&&S.prologue.arrival?.stage==='done'&&!S.prologue.ending&&(!S.qiheChapter||['opening','days'].includes(S.qiheChapter.stage));
 const store=()=>S.prologue.outsiders||(S.prologue.outsiders={version:1,quests:{}});
 const get=k=>store().quests[k]||(store().quests[k]={stage:'none',choice:null,rewarded:false});
 const contactState=()=>store().contacts||(store().contacts={stage:'opening',events:{},questions:{}});
 const errandLabel=id=>{const k=representativeKey(id),q=S.prologue.outsiders?.quests?.[k],n=defs[k].name;return q?.stage==='done'?'“上回「'+n+'」那件事……”':!q||q.stage==='none'?'“有什么要我帮忙的吗？”':'“「'+n+'」的事，我来回话。”'};
 const location=id=>id==='xulingyi'?'南村口 · 联络院门前':id==='shenyanhui'?'东埠 · 采办核货点':S.qiheChapter?.halfDay>=4?'东埠 · 装卸路':'南村口 · 车道旁';
 function contactRecords(){if(!available())return[];const questions=S.qiheChapter?.questions||S.prologue.outsiders?.contacts?.questions||{};return Object.entries(representatives).map(([id,k])=>({t:({xulingyi:'正道盟',censhuang:'归烬堂',shenyanhui:'巡江司'})[id]+'对接 · '+defs[k].owner,group:'三方对接',d:'找'+defs[k].owner+'聊聊：问问她是什么人、来村里做什么，或者帮她跑跑腿。',where:location(id)+' · '+defs[k].owner,chapterNpc:id,done:!!questions[id+'-dispute']}));}
 const savePoint=()=>QihePrologue.checkpoint();let running=false;
 const cast=who=>[{who:S.name||'萧白',sp:'c_hero',slot:'left'},...(sprites[who]&&who!=='萧白'?[{who,sp:sprites[who],slot:'right'}]:[])];
 async function lines(rows){const names=[...new Set(rows.map(r=>r[0]).filter(w=>w!=='萧白'&&sprites[w]))];return DialogueStage.withCast({id:'outsider-scene',cast:[{who:S.name||'萧白',sp:'c_hero',slot:'left'},...names.map(w=>({who:w,sp:sprites[w]}))]},async()=>{for(const[w,t]of rows)await say(w,t)})}
 const ask=(who,text,options)=>DialogueStage.withCast({id:'outsider-choice',cast:cast(who)},()=>choose(who,text,options));
 const story=(k,part,externals={},vars={})=>QiheRepresentatives.play('qihe_errand_'+k+'_'+part,{say:lines,ask},externals,vars);
 async function guarded(fn){if(running)return;running=true;const wasBusy=busy;busy=true;keys={};player.path=null;try{return await fn()}finally{running=false;busy=wasBusy;keys={};savePoint()}}
 async function owner(k){const d=defs[k],q=get(k);if(q.stage==='done')return story(k,'done');
  if(k==='ledger'&&q.stage==='checked')await check(k,'差役',true);
  if(q.stage==='none'){let taken=false;await story(k,'offer',{errand_accept:()=>{taken=true;q.stage='accepted';savePoint()}});if(taken)toast('已接：'+d.name,1600);return}
  const ready=k==='ledger'?'witnessed':'checked';if(q.stage!==ready)return story(k,'wait',{},k==='ledger'?{checked:q.stage==='checked'}:{});
  let choice=0;await story(k,'turnin',{errand_choice:n=>{choice=n}});
  q.choice=choice;q.stage='done';if(!q.rewarded){S.silver=(S.silver||0)+d.reward;q.rewarded=true}savePoint();toast(d.name+' · 已完成 · 路费 '+d.reward+' 文',2000);
 }
 async function check(k,role,fromOwner=false){const q=get(k),d=defs[k];if(role==='差役'){if(q.stage!=='checked')return;await story(k,'witness',{},{from_owner:fromOwner});q.stage='witnessed';S.prologue.heard.inspection=true}
  else{if(q.stage!=='accepted')return;await story(k,'check');q.stage='checked';if(k!=='ledger')S.prologue.heard[d.flag]=true}
  q.evidence=k==='ledger'&&q.stage==='checked'?'周婶说一篓是病人药包，且无人查验；还需向差役核实签字。':d.summary;savePoint();toast('行程已更新：'+d.name,1500);
 }
 const talk=id=>{const k=keyFor(id);return k&&available()?guarded(()=>owner(k)):undefined};
 const checks={陈伯:['letter'],药商:['account'],周婶:['ledger'],差役:['ledger']};
 function pendingFor(who){return(checks[who]||[]).filter(k=>get(k).stage===(who==='差役'?'checked':'accepted'))}
 // Add a branch to the existing NPC interaction, keeping their original errands reachable.
 for(const [id,sc] of Object.entries(SC)){if(!/^(qh_|qihe_|prologue_)/.test(id))continue;for(const npc of sc.npcs||[]){if(!checks[npc.name])continue;const original=npc.act;if(!original)continue;
  npc.act=async function(...args){if(!available())return original.apply(this,args);const pending=pendingFor(npc.name);if(!pending.length)return original.apply(this,args);
   const token=DialogueStage.begin({id:'outsider-npc:'+npc.id,cast:cast(npc.name)});try{const i=await ask(npc.name,'找我有事？',[...pending.map(k=>'“我来问问「'+defs[k].name+'」的事。”'),'“没别的，就来看看。”','“打扰了。”']);if(i<pending.length)return await guarded(()=>check(pending[i],npc.name));if(i===pending.length)return await original.apply(this,args)}finally{DialogueStage.end(token)}};
 }
 }
 const priorQuests=mnQuests;mnQuests=function(){const old=priorQuests();if(!isQiheEntry()||!S?.prologue)return old;return old.concat(Object.entries(defs).flatMap(([k,d])=>{const q=S.prologue.outsiders?.quests?.[k];if(!q||q.stage==='none')return[];const closed=!!S.qiheChapter&&!['opening','days'].includes(S.qiheChapter.stage)&&q.stage!=='done',id=Object.keys(representatives).find(id=>representatives[id]===k),target=q.stage==='accepted'?({letter:'chen-door',account:'merchant',ledger:'clinic-door'})[k]:id;return[{t:d.name,d:esc(q.stage==='done'?d.summary:closed?'随撤离中止；已知线索保留，不影响主线。':d.steps[q.stage]),giver:d.owner,where:q.stage==='accepted'?({letter:'村内东北 · 陈伯家门厅',account:'南村口 · 药商',ledger:'村内东侧 · 药棚'})[k]:closed||q.stage==='done'?'栖河 · 委托记录':location(id)+' · '+d.owner,chapterNpc:closed||q.stage==='done'?null:target,done:q.stage==='done',closed}]}))};
 window.QiheOutsiders={defs,available,handles,talk,get,check,pendingFor,representativeKey,errandLabel,contactState,contactRecords,location,get running(){return running}};
})();
