// 临时评审脚本：墨印会话里“谈”走 QiheChapter.guarded 后 busy 被清成 false；之后赠礼/易物面板开着时，江湖面板的 Esc 条件是否成立
const path=require('path');const {boot}=require(path.resolve(__dirname,'../../../../../tools_scene/qihe/harness.cjs'));
(async()=>{const {c,run,events}=await boot();c.choose=async(w,t,opts)=>opts.length-1;
 run("say=async()=>{}");
 run(`S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=1;S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true,originExpression:'A',greeted:{}};S.prologue.rested=true;S.prologue.relicSeen=true;S.bag={};S.silver=5;S.party=['ye'];S.qiheTown={version:1,tab:{stage:'done',thanked:true}};S.scene='prologue_inn_interior';cur=SC.prologue_inn_interior;buildGrid(cur);mode='scene';dlgBusy=false;keys={};`);
 run('busy=true');   // 墨印会话开始时 install() 设 busy=true
 await run("SC.prologue_inn_interior.npcs.find(n=>n.id==='innkeeper')").act();   // 墨印“谈”→ runAct → 店家原 act → QiheChapter.interact → guarded
 console.log('“谈”完回到墨印时 busy =',run('busy'),' dlgBusy =',run('dlgBusy'));
 // 模拟赠礼面板开着（QiheGiftUI keyFn 非空，墨印 keyHandler 为空，偷窃层隐藏）
 const cond=run(`mode==='scene'&&!busy&&!dlgBusy&&$('panel').hidden&&!window.QiheNpcUI?.open&&!(document.getElementById('qs-layer')&&!document.getElementById('qs-layer').hidden)`);
 console.log('江湖面板 Esc 抢键条件（赠礼面板开着时）成立 =',cond,'（成立即先弹系统菜单并 stopImmediatePropagation，赠礼面板收不到 Esc）');
 console.log('keydown 捕获监听注册顺序（index.html 加载顺序）：qihe-jianghu-ui.js → qihe-gift-ui.js → qihe-steal-ui.js → qihe-npc-ui.js');
 process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
