'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),library=path.resolve(root,'../xiaojianghu');
// 2026-10-20：文档库旧原型已整体归档（_attic/2026-10-20-prototype），那边已没有游戏页面；文档库一侧的守卫检查只在原型页面还在时才做。
const libraryPages=fs.existsSync(path.join(library,'index.html'));
const source=fs.readFileSync(path.join(root,'js/runtime-entry.js'),'utf8'),checks=[];
function entry(url,id='archive-prototype'){
 const parsed=new URL(url),nodes=[],ready=[];
 const location={href:parsed.href,hostname:parsed.hostname,origin:parsed.origin,protocol:parsed.protocol,hash:parsed.hash,search:parsed.search,replace(target){this.replaced=target}};
 const document={readyState:'loading',documentElement:{dataset:{}},querySelector:()=>({content:id}),addEventListener:(_e,f)=>ready.push(f),
  createElement:tag=>({tag,style:{},append(...children){this.children=(this.children||[]).concat(children)}}),createTextNode:text=>({text}),
  head:{append:e=>nodes.push(e)},body:{append:e=>nodes.push(e)}};
 const history={replaceState(_s,_t,target){location.href=target;location.hash=new URL(target).hash;location.search=new URL(target).search}};
 const context={window:{},location,document,history,URL,URLSearchParams};vm.runInNewContext(source,context);ready.forEach(f=>f());
 return {location,nodes,runtime:context.window.XJHRuntime};
}
function check(name,fn){fn();checks.push(name)}
check('guard copies and early HTML identities agree',()=>{
 if(libraryPages)assert.equal(fs.readFileSync(path.join(library,'js/local-game-entry.js'),'utf8'),source);
 for(const [dir,id,script] of [[root,'qihe-current','runtime-entry.js'],...(libraryPages?[[library,'archive-prototype','local-game-entry.js']]:[])]){
  const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');assert(html.includes(`name="xjh-runtime" content="${id}"`));assert(html.indexOf(script)<html.indexOf('js/art.js'));
 }
});
let routes=0;
check('every local library port and default hash reaches current homepage',()=>{
 for(const host of ['127.0.0.1','localhost','[::1]'])for(const port of [8766,8786,8123,8794,8000])for(const hash of ['','#prologue','#chapter1','#cultivation','#xiangyang','#qihe-map','#obsolete']){
  const r=entry(`http://${host}:${port}/index.html?play=1&openingReview=1&journey=abcdefgh${hash}`);
  assert.equal(r.location.replaced,'http://127.0.0.1:8792/#qihe-map');assert(r.runtime.redirecting);assert(r.nodes.some(n=>n.id==='xjh-entry-gate'));routes++;
 }
});
check('wrong workspace on the canonical port fails closed without a redirect loop',()=>{
 const r=entry('http://127.0.0.1:8792/#qihe-map');assert(r.runtime.redirecting);assert(!r.location.replaced);assert(r.nodes.find(n=>n.id==='xjh-entry-gate').children.some(n=>n.textContent?.includes('指向了历史目录')));
});
check('file-opening either workspace reaches current origin without playing',()=>{
 for(const id of ['archive-prototype','qihe-current'])assert.equal(entry('file:///tmp/index.html?play=1#prologue',id).location.replaced,'http://127.0.0.1:8792/#qihe-map');
});
check('current alternate origin preserves only a valid journey and does not auto-resume',()=>{
 const r=entry('http://localhost:8792/index.html?journey=abcdefgh&play=1&uiReview=1#prologue','qihe-current');
 assert.equal(r.location.replaced,'http://127.0.0.1:8792/?journey=abcdefgh#qihe-map');
 assert(!entry('http://127.0.0.1:8000/?journey=invalid&play=1','qihe-current').location.replaced.includes('journey'));
});
check('current canonical fresh, continue and review URLs remain unchanged',()=>{
 for(const suffix of ['','?journey=abcdefgh&play=1#qihe-map','?uiReview=1#qihe-map','?battleReview=road#qihe-map','?storyReview=wukui#prologue','?chapterPresentationReview=fixture#qihe-map']){
  const url='http://127.0.0.1:8792/'+suffix,r=entry(url,'qihe-current');assert.equal(r.location.href,url);assert(!r.location.replaced);assert(!r.runtime.redirecting);
 }
});
check('unknown current hashes cannot boot the old title or carry play/review flags',()=>{
 for(const hash of ['#chapter1','#cultivation','#xiangyang','#street','#obsolete']){
  const r=entry('http://127.0.0.1:8792/index.html?journey=abcdefgh&play=1&uiReview=1&openingReview=1'+hash,'qihe-current');
  assert.equal(r.location.href,'http://127.0.0.1:8792/index.html?journey=abcdefgh#qihe-map');
 }
});
check('explicit historical preview remains available with a permanent current-game link',()=>{
 for(const flag of ['runtimePrototype','openingPrototype'])for(const hash of ['#prologue','#chapter1','#cultivation','#xiangyang']){
  const r=entry(`http://127.0.0.1:8766/index.html?${flag}=1${hash}`);assert(!r.location.replaced);assert(r.runtime.prototype);
  const banner=r.nodes.find(n=>n.id==='xjh-runtime-preview');assert(banner);assert(banner.children.some(n=>n.href==='http://127.0.0.1:8792/'));
 }
});
check('hosted runtimes do not redirect visitors to their own localhost',()=>{
 for(const id of ['archive-prototype','qihe-current'])assert(!entry('https://example.com/index.html#prologue',id).location.replaced);
});
check('both engines refuse to initialize gameplay while redirecting',()=>{
 for(const dir of [root,...(libraryPages?[library]:[])])assert(fs.readFileSync(path.join(dir,'js/main.js'),'utf8').includes('if(window.XJHRuntime&&!window.XJHRuntime.redirecting)'));
});
const result={passed:checks.length,route_cases:routes,scope:'entry guard VM and source contracts; browser and server checks recorded separately',checks};
const out=path.join(root,'docs/updates/evidence/2026-10-07-runtime-entry');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'route-tests.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
