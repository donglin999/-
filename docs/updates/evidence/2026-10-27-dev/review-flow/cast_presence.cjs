// 临时评审脚本：播剧本时谁被临时站到萧白身边（staged-*），和地图上原本那人在哪
const path=require('path');const {boot}=require(path.resolve(__dirname,'../../../../../tools_scene/qihe/harness.cjs'));
(async()=>{const {c,run}=await boot();let decisions=[];c.choose=async(w,t,opts)=>{const i=decisions.length?decisions.shift():0;return i>=opts.length?opts.length-1:i};
 run(`window.__log=[];say=async(w,t)=>{const st=(cur.npcs||[]).filter(n=>n.cast).map(n=>n.name+'@'+Math.round(n.x*TS)+','+Math.round(n.y*TS));__log.push({scene:S.scene,who:w,t:String(t).slice(0,24),staged:st.join(' '),player:Math.round(player.x)+','+Math.round(player.y)})}`);
 c.QiheStealUI.minigame=async()=>'ok';
 const fresh=(half=0)=>run(`S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=${half};S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true,originExpression:'A',greeted:{}};S.prologue.rested=true;S.prologue.relicSeen=true;S.bag={};S.silver=50;S.party=['ye'];mode='scene';busy=false;dlgBusy=false;keys={};`);
 const at=(sc,x,y)=>run(`S.scene='${sc}';cur=SC['${sc}'];buildGrid(cur);player.x=${x};player.y=${y};cur._npcs=npcsOf(cur)`);
 const dump=title=>{console.log('\n## '+title);for(const l of run('__log'))console.log(` [${l.scene}] ${l.who||'旁白'}：${l.t}  | 临时站位：${l.staged||'无'} | 萧白@${l.player}`);run('__log.length=0')};
 const npc=(sc,id)=>run(`SC['${sc}'].npcs.find(n=>n.id==='${id}')`);
 // 1 挂药
 fresh();run('S.aqiTeach={step:3,wage:null,called:true}');at('qihe_trial',1331,1420);
 console.log('门口老人 show=',run("SC.qihe_trial.npcs.find(n=>n.id==='elder').show()"),' 位置=',run("(n=>Math.round(n.x*TS)+','+Math.round(n.y*TS))(SC.qihe_trial.npcs.find(n=>n.id==='elder'))"));
 await npc('qihe_trial','aqi-door').act();dump('fq_aqi_door 挂药（老人应在屋里）');
 // 2 小耗子喊一声：fq_morning 散场后
 fresh();run("S.qiheChapter.stage='opening'");at('qihe_trial',900,700);
 try{await c.QiheChapter.begin()}catch(e){console.log('begin err',e.message)}
 console.log('喊声时：');for(const l of run('__log').filter(l=>l.who==='小耗子'))console.log(` [${l.scene}] ${l.who}：${l.t} | 临时站位：${l.staged} | 萧白@${l.player}`);run('__log.length=0');
 // 3 客栈里柜上少钱
 fresh(2);run('S.aqiTeach={step:4,wage:"said",called:true}');at('prologue_inn_interior',734,470);decisions=[0];await npc('prologue_inn_interior','innkeeper').act();dump('fq_aqi_hint_name 客栈里（小耗子原站客栈门外）');
 // 4 灯一回话：算命先生→蔺管事
 fresh(1);run("S.qiheChapter.records={lamp:{met:true,meetPlayed:true,boatman:true}}");at('qihe_trial',915,420);decisions=[0];await c.QiheLamp.fortuneTalk();dump('qh_lamp_report1（同一人换名条）');
 // 5 跟脚夫
 fresh(4);run("S.qiheChapter.records={lamp:{met:true,meetPlayed:true,boatman:true,briefed:true}}");at("qh_east",1210,680);decisions=[0,0];await c.QiheLamp.boatmanTalk();dump('qh_lamp_tail（东埠播，后山与三家落脚处的人开口）');
 // 6 灯四交给岑霜
 fresh(4);run("S.qiheChapter.records={lamp:{met:true,meetPlayed:true,boatman:true,briefed:true,report1Done:true,porter_seen:true}};S.qiheChapter.events={'three-meeting':true}");at('qihe_trial',915,420);decisions=[0,2,0,3];await c.QiheLamp.fortuneTalk();dump('qh_lamp_report2→handoff 告诉岑姑娘（台词说【东埠】）');
 console.log('此时东埠岑霜 show=',run("SC.qh_east.npcs.find(n=>n.id==='censhuang').show()"));
 // 7 结局场：邻村
 fresh();run("S.qiheChapter.stage='refuge';S.qiheChapter.records={lamp:{met:true,briefed:true,ending:'noticed',seal:'seen'}}");at('qh_refuge',600,600);await c.QiheLamp.endScene();dump('qh_lamp_end_note（台词说【邻村·渡口】）');
 process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
