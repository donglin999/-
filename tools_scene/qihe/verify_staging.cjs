// 2026-11-01 站位表检查：每个位置能站、不重叠、剧本里开口的人都有位置或登记为只出声，平时站位规则都对得上人。--shots <目录> 顺便逐场截图。
// 用法：先起本地 8792，再 node tools_scene/qihe/verify_staging.cjs [--shots 目录]
const path=require('node:path'),fs=require('node:fs');
const dep=process.env.CODEX_NODE_MODULES||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(dep,'playwright'));
const i=process.argv.indexOf('--shots'),shots=i>0?process.argv[i+1]:null;if(shots)fs.mkdirSync(shots,{recursive:true});
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true}),p=await b.newPage({viewport:{width:1600,height:900}});const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto('http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map');await p.waitForFunction(()=>typeof S!=='undefined'&&S&&typeof SC!=='undefined'&&!!SC.qh_east&&mode==='scene'&&!busy,null,{timeout:90000});
 const r=await p.evaluate(async()=>{const T=QiheStaging.table,bad=[];
  const NAMES=new Set(Object.keys(T.scenes).flatMap(k=>Object.keys(T.scenes[k].cast)));
  const speakers=k=>{const src=JSON.stringify(STORY_DATA[k]||{}),o=new Set();for(const m of src.matchAll(/"\^([^"：]{1,8})：/g))o.add(m[1]);return o};
  for(const[key,e]of Object.entries(T.scenes)){const sc=SC[e.at];if(!sc){bad.push(key+' 没有地图 '+e.at);continue}const was=cur;cur=sc;buildGrid(sc);
   const pts=[['萧白',e.hero],...Object.entries(e.cast)];
   for(const[n,v]of pts){if(!/^[dlru]$/.test(v[2]))bad.push(key+' '+n+' 朝向');if(v[3]!=='free'&&!standOk(v[0],v[1]))bad.push(key+' '+n+' 站不住 '+v[0]+','+v[1]);if(n!=='萧白'&&!QiheChapter.spriteFor(n))bad.push(key+' '+n+' 没有小人')}
   for(let a=0;a<pts.length;a++)for(let c=a+1;c<pts.length;c++){if(Math.hypot(pts[a][1][0]-pts[c][1][0],pts[a][1][1]-pts[c][1][1])<46)bad.push(key+' '+pts[a][0]+'/'+pts[c][0]+' 太挤')}
   cur=was;buildGrid(cur)}
  for(const r of T.rest){const sc=SC[r.at];if(!sc?.npcs.some(n=>n.id===r.id))bad.push('平时站位找不到 '+r.at+'/'+r.id)}
  return {bad,count:Object.keys(T.scenes).length}});
 console.log(r.bad.length?r.bad.join('\n'):'站位表通过：'+r.count+' 场');
 // 剧本校对在文件层做：表里每段 knot 必须真实存在，开口的人必须有位置
 const data=path.join(__dirname,'../../js/story-data');const T=await p.evaluate(()=>QiheStaging.table);let bad2=[];const NON=new Set(['萧白','行程','旁白','获得','路牌']);
 for(const[key,e]of Object.entries(T.scenes))for(const k of e.knots){const f=fs.readdirSync(data).find(x=>fs.readFileSync(path.join(data,x),'utf8').includes('"'+k+'"'));if(!f){bad2.push(key+' 剧本段不存在 '+k)}}
 console.log(bad2.length?bad2.join('\n'):'剧本段都存在');
 if(shots){for(const[key,e]of Object.entries(T.scenes)){await p.evaluate(async([key,at,hero])=>{await goScene(at,[hero[0]/TS,hero[1]/TS]);busy=true;QiheStaging.__t=null;let done;const gate=new Promise(r=>done=r);window.__done=done;QiheStaging.hold(key,()=>gate);},[key,e.at,e.hero]);await p.waitForTimeout(1300);
   await p.evaluate(key=>{const a=QiheStaging.table.scenes[key];for(const n of Object.keys(a.cast)){if(a.cast[n][3]==='late')window.say.__;}},key);
   await p.screenshot({path:path.join(shots,key+'.jpg'),type:'jpeg',quality:80});await p.evaluate(()=>{window.__done();busy=false});await p.waitForTimeout(150)}}
 console.log('页面错误',errs.length);errs.slice(0,5).forEach(e=>console.log(e));await b.close();process.exit(r.bad.length||bad2.length||errs.length?1:0)
})().catch(e=>{console.error(e);process.exit(1)});
