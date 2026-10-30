// 2026-10-27 偷窃界面实机截图（评审台附图用，R-评审-01）：物品扇、袖里一按（一手／宋先生两手）、结果印。
// 用法：先起本地 8792（scripts/serve-current.py），再 node tools_scene/qihe/shot_steal.cjs <输出目录> [人物 id…]
// 不给人物 id 就截采办随从的整套流程＋宋先生；给了就只截这些人的物品扇（在他本人身边）。
const path=require('node:path'),fs=require('node:fs');
const dep=process.env.CODEX_NODE_MODULES||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(dep,'playwright'));
const out=process.argv[2]||'evidence/steal-shots';fs.mkdirSync(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});   // 用本机 Chrome，免得 playwright 自带浏览器版本对不上
 const p=await b.newPage({viewport:{width:1600,height:900}});
 await p.goto('http://127.0.0.1:8792/#qihe-map');await p.waitForFunction(()=>window.QiheStealUI&&typeof goScene==='function'&&typeof SC!=='undefined'&&!!SC.qh_east,null,{timeout:60000});
 await p.evaluate(async()=>{S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events={'c1-00b':true,'c1-s1':true};
  S.prologue=QihePrologue.fresh();S.silver=10;S.bag={};S.steal={version:1,lv:1,exp:0};goScene('qh_east',[20.5,12.4])});
 await wait(1500);await p.keyboard.press('2');await wait(400);
 const open=async(id)=>p.evaluate(id=>{mode='scene';busy=false;dlgBusy=false;const pn=document.getElementById('panel');pn.hidden=true;pn.className='ui panel';
  const n=SC.qh_east.npcs.find(x=>x.id==='aide');player.x=(n.x-1.2)*TS;player.y=(n.y+0.3)*TS;QiheStealUI.steal(id,QIHE_NPC_DATA.PEOPLE[id],n)},id);
 const only=process.argv.slice(3);
 if(only.length){for(const id of only){const ok=await p.evaluate(async id=>{const P=QIHE_NPC_DATA.PEOPLE[id];const names=P.npc||[P.name];
   const sk=Object.keys(SC).find(k=>SC[k].npcs?.some(n=>names.includes(n.name)||n.id===id));if(!sk)return false;const n=SC[sk].npcs.find(n=>names.includes(n.name)||n.id===id);
   goScene(sk,[n.x-1.2,n.y+0.3]);await new Promise(r=>setTimeout(r,1200));mode='scene';busy=false;dlgBusy=false;const pn=document.getElementById('panel');pn.hidden=true;pn.className='ui panel';
   QiheStealUI.steal(id,P,n);return true},id);
  if(!ok){console.log('找不到',id);continue}await wait(700);await p.screenshot({path:path.join(out,`物品扇-${id}.png`)});await p.evaluate(()=>QiheStealUI.close());await wait(200)}
  await b.close();console.log('截图已存到',out);return}
 await open('aide');await wait(600);await p.screenshot({path:path.join(out,'01-物品扇.png')});
 await p.keyboard.press('s');await p.keyboard.press('s');await p.keyboard.press('s');await wait(200);await p.keyboard.press('e');
 await wait(1300);await p.screenshot({path:path.join(out,'02-袖里一按-一手.png')});
 await p.keyboard.press('e');await wait(250);await p.screenshot({path:path.join(out,'03-结果印.png')});
 await wait(3000);await p.evaluate(()=>QiheStealUI.close());await wait(300);
 await open('song');await wait(600);await p.screenshot({path:path.join(out,'04-宋先生物品扇.png')});
 await p.keyboard.press('e');await wait(1300);await p.screenshot({path:path.join(out,'05-宋先生-两手.png')});
 await b.close();console.log('截图已存到',out);
})().catch(e=>{console.error(e);process.exit(1)});
