// 2026-10-29 挂轴式商店实机截图（评审台附图用，R-评审-01）：店家买入页、货郎买入页、货郎卖出页、确认层。
// 用法：先起本地 8792（scripts/serve-current.py），再 node tools_scene/qihe/shot_shop.cjs <输出目录>
const path=require('node:path'),fs=require('node:fs');
const dep=process.env.CODEX_NODE_MODULES||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(dep,'playwright'));
const out=process.argv[2]||'evidence/shop-shots';fs.mkdirSync(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});
 const p=await b.newPage({viewport:{width:1600,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://127.0.0.1:8792/#qihe-map');await p.waitForFunction(()=>window.QiheTown&&window.QiheGiftUI&&typeof goScene==='function'&&typeof SC!=='undefined'&&!!SC.qh_east,null,{timeout:60000});
 await p.evaluate(async()=>{S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events={'c1-00b':true,'c1-s1':true};
  S.prologue=QihePrologue.fresh();S.silver=60;S.bag={qh_wild_herb:3,qh_river_reed:2};goScene('qh_east',[20.5,12.4])});
 await wait(1500);await p.keyboard.press('2');await wait(400);   // 进场会问“进入下一时段”，选“再等等”
 // 不等它结束：面板开着时截图
 const open=pid=>p.evaluate(pid=>{mode='scene';busy=false;dlgBusy=false;QiheTown.shop(pid)},pid);
 // 店家没有立绘：走进他所在的场景再开，验证放大地图小人的兜底
 await p.evaluate(async()=>{const P=QIHE_NPC_DATA.PEOPLE.innkeeper,names=P.npc||[P.name];const sk=Object.keys(SC).find(k=>SC[k].npcs?.some(n=>names.includes(n.name)));
  if(sk){const n=SC[sk].npcs.find(n=>names.includes(n.name));goScene(sk,[n.x-1.2,n.y+0.3]);await new Promise(r=>setTimeout(r,1500))}});
 await open('innkeeper');await wait(800);await p.screenshot({path:path.join(out,'01-店家-买入.png')});
 await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');await wait(200);await p.keyboard.press('Enter');await wait(300);
 await p.screenshot({path:path.join(out,'02-确认层.png')});
 await p.keyboard.press('Escape');await wait(150);await p.keyboard.press('Escape');await wait(400);
 await open('peddler');await wait(800);await p.screenshot({path:path.join(out,'03-货郎-买入.png')});
 await p.keyboard.press('e');await wait(300);await p.screenshot({path:path.join(out,'04-货郎-卖出.png')});
 await p.keyboard.press('Escape');await wait(300);
 console.log(errs.length?'页面报错：\n'+errs.join('\n'):'页面无报错');
 await b.close();console.log('截图已存到',out);
})().catch(e=>{console.error(e);process.exit(1)});
