// 临时评审脚本：客栈里箱笼、当面要账时，店家离萧白超过 250 像素，剧本站位会再放一个“店家”
const path=require('path');const {boot}=require(path.resolve(__dirname,'../../../../../tools_scene/qihe/harness.cjs'));
(async()=>{const {c,run}=await boot();let decisions=[];c.choose=async(w,t,opts)=>{const i=decisions.length?decisions.shift():0;return i>=opts.length?opts.length-1:i};
 run(`window.__log=[];say=async(w,t)=>{const st=(cur.npcs||[]).filter(n=>n.cast).map(n=>n.name+'@'+Math.round(n.x*TS)+','+Math.round(n.y*TS));__log.push(S.scene+' '+w+'：'+String(t).slice(0,20)+' | 站位：'+st.join(' '))}`);
 run(`S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=1;S.prologue=QihePrologue.fresh();S.bag={};S.silver=50;S.qiheTown={version:1,tab:{stage:'offered'}};S.scene='prologue_inn_interior';cur=SC.prologue_inn_interior;buildGrid(cur);mode='scene';busy=false;dlgBusy=false;player.x=400;player.y=560;cur._npcs=npcsOf(cur)`);
 decisions=[0];await run("SC.prologue_inn_interior.npcs.find(n=>n.id==='bandit')").act();
 run(`player.x=990;player.y=530`);decisions=[0];await run("SC.prologue_inn_interior.npcs.find(n=>n.id==='inn-chest')").act();
 for(const l of run('__log'))console.log(l);
 console.log('地图上的店家仍在：',run("(n=>n.show()+' @'+Math.round(n.x*TS)+','+Math.round(n.y*TS))(SC.prologue_inn_interior.npcs.find(n=>n.id==='innkeeper'))"));
 process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
