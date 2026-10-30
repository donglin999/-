// 2026-10-27 通用实机截图（评审台附图用，R-评审-01）：到某张图某个位置，执行一段页面脚本，等一会儿截图。
// 用法：先起本地 8792，再 node tools_scene/qihe/shot_js.cjs <输出 png> <场景 id> <x,y（格）> [页面脚本] [等待毫秒]
// 页面脚本在开局状态（第一天白天、风起阶段）就绪后执行，当函数体用（可 await，要看结果就写 return）；返回值打印出来方便核对。
const path=require('node:path'),fs=require('node:fs');
const dep=process.env.CODEX_NODE_MODULES||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(dep,'playwright'));
const [,,out,scene,at,js='',waitMs='800']=process.argv;
if(!out||!scene||!at){console.error('用法：shot_js.cjs <输出 png> <场景 id> <x,y> [页面脚本] [等待毫秒]');process.exit(2)}
fs.mkdirSync(path.dirname(out),{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});   // 用本机 Chrome
 const p=await b.newPage({viewport:{width:1600,height:900}});
 p.on('pageerror',e=>console.error('页面报错',e.message));
 await p.goto('http://127.0.0.1:8792/#qihe-map');await p.waitForFunction(()=>typeof goScene==='function'&&typeof SC!=='undefined'&&!!SC.qh_east,null,{timeout:60000});
 await p.evaluate(([sc,xy])=>{S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events={'c1-00b':true,'c1-s1':true};
  S.prologue=QihePrologue.fresh();S.silver=10;S.bag={};S.steal={version:1,lv:1,exp:0};goScene(sc,xy.split(',').map(Number))},[scene,at]);
 await wait(1300);await p.keyboard.press('2').catch(()=>{});await wait(300);
 await p.evaluate(()=>{const pn=document.getElementById('panel');if(pn){pn.hidden=true;pn.className='ui panel'}mode='scene';busy=false;dlgBusy=false});await wait(500);
 if(js){const r=await p.evaluate(`(async()=>{${js}})()`).catch(e=>'出错：'+e.message);console.log('脚本返回',typeof r==='string'?r:JSON.stringify(r)?.slice(0,300))}
 await wait(+waitMs);await p.screenshot({path:out});await b.close();console.log('截图',out);
})().catch(e=>{console.error(e);process.exit(1)});
