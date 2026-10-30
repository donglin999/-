// 临时评审脚本：中央村落里叫“村口老人”的节点有几个，挂药那一步各自显不显示
const path=require('path');const {boot}=require(path.resolve(__dirname,'../../../../../tools_scene/qihe/harness.cjs'));
(async()=>{const {run}=await boot();
 run(`S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=0;S.prologue=QihePrologue.fresh();S.aqiTeach={step:3};S.scene='qihe_trial';cur=SC.qihe_trial`);
 console.log(run(`SC.qihe_trial.npcs.filter(n=>n.name==='村口老人').map(n=>n.id+' @'+Math.round(n.x*TS)+','+Math.round(n.y*TS)+' show='+(!n.show||n.show())+' cast='+!!n.cast).join(' | ')`));
 console.log('npcsOf 可见：',run(`npcsOf(SC.qihe_trial).filter(n=>n.name==='村口老人').length`));
 process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
