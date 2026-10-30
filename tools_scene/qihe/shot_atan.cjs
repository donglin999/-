// 2026-10-29 阿炭实机截图：客栈里站在帮众旁边、对话框立绘（名牌“新来的”）、还册子后名牌改“阿炭”。
// 用法：先起本地 8792（scripts/serve-current.py），再 node tools_scene/qihe/shot_atan.cjs [输出目录]
const path=require('node:path'),fs=require('node:fs');
const dep=process.env.CODEX_NODE_MODULES||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(dep,'playwright'));
const out=process.argv[2]||'evidence/2026-10-29-atan';fs.mkdirSync(out,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1600,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://127.0.0.1:8792/#qihe-map');
 await p.waitForFunction(()=>window.QiheChapter&&typeof goScene==='function'&&typeof SC!=='undefined'&&!!SC.prologue_inn_interior,null,{timeout:60000});
 await p.evaluate(async()=>{S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events={'c1-00b':true,'c1-s1':true};
  S.prologue=QihePrologue.fresh();S.prologue.rested=true;const a=SC.prologue_inn_interior.npcs.find(n=>n.id==='atan');await goScene('prologue_inn_interior',[a.x-1.6,a.y+1]);mode='scene';busy=false;closePanel();$('hud').hidden=false});
 await wait(1500);
 await p.screenshot({path:path.join(out,'01-客栈里的新来的.png')});
 // 对话框：第二回（木桩挨骂）跑到“新来的”开口那句时截图
 await p.evaluate(()=>{mode='scene';busy=false;dlgBusy=false;S.qiheHidden={version:1,bandit:{talks:1}};SC.prologue_inn_interior.npcs.find(n=>n.id==='bandit').act()});
 for(let i=0;i<8;i++){await wait(500);const t=await p.evaluate(()=>document.body.innerText);if(t.includes('我再去桩上练'))break;await p.keyboard.press('Space')}
 await wait(400);await p.screenshot({path:path.join(out,'02-对话框立绘.png')});
 for(let i=0;i<10;i++){await p.keyboard.press('Space');await wait(250)}
 // 还册子以后：名牌改“阿炭”
 await p.evaluate(()=>{mode='scene';busy=false;dlgBusy=false;S.qiheHidden.bandit={talks:2,won:true,decided:'return'}});
 await wait(600);await p.screenshot({path:path.join(out,'03-还册子后名牌.png')});
 console.log(errs.length?'页面报错：\n'+errs.join('\n'):'页面无报错');await b.close();console.log('截图已存到',out);
})().catch(e=>{console.error(e);process.exit(1)});
