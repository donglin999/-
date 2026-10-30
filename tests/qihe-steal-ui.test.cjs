'use strict';
// 偷窃界面测试（2026-10-27 重做袖里一按）：金区判定、取消与各种结束方式都收起界面、清掉按键接管。
// 用一个极小的假 DOM 跑 js/qihe-steal-ui.js，不需要浏览器。
const test=require('node:test'),assert=require('node:assert/strict');

// ── 假 DOM ──
const keyListeners=[];
function el(id){return{id,hidden:true,innerHTML:'',className:'',offsetWidth:0,children:[],style:{setProperty(k,v){this[k]=v}},
 classList:{add(){},remove(){},toggle(){},contains:()=>false},appendChild(c){this.children.push(c);return c},
 querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){},getBoundingClientRect:()=>({width:1280,height:720,left:0,top:0})}}
const game=el('game');
global.HTMLElement=class{};
global.document={getElementById:id=>id==='game'?game:null,createElement:()=>el('qs-layer')};
global.addEventListener=(type,fn,capture)=>{if(type==='keydown')keyListeners.push(fn)};
global.requestAnimationFrame=f=>setTimeout(f,16);
global.isQiheEntry=()=>true;
global.window=global;
global.S={lv:2,agi:4,scene:'qh_east',steal:{version:1,lv:1,exp:0}};
global.QiheNpc={bond:{get:()=>({score:0,stage:'冷淡'})},test:()=>true,recognize:()=>false};
require('../js/qihe-steal-data.js');
require('../js/qihe-steal.js');
require('../js/qihe-steal-ui.js');
const UI=global.QiheStealUI,D=global.QIHE_STEAL_DATA;
const layer=()=>game.children[0];
function press(key){const e={key,repeat:false,prevented:false,preventDefault(){this.prevented=true},stopImmediatePropagation(){}};keyListeners.forEach(f=>f(e));return e}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

test('金区判定：金区、朱心里落针不再判失手（修正 goldStart/goldEnd 写反）',()=>{
 for(const gold of [.01,.1,.33,.5,.85,1])for(const rnd of [0,.3,.77,1]){
  const z=UI.zones(gold,.25,rnd);
  assert.ok(z.g0>=0&&z.g1<=1+1e-9&&Math.abs(z.g1-z.g0-gold)<1e-9,'金区宽等于成功率');
  assert.ok(z.r0>=z.g0&&z.r1<=z.g1+1e-9,'朱心在金区里');
  assert.equal(UI.judge((z.r0+z.r1)/2,z),'great','朱心正中＝妙手');
  if(gold>=.1){assert.equal(UI.judge(z.g0+(z.r0-z.g0)/2,z),'ok','金区里、朱心外＝得手')}
  if(z.g0>.02)assert.equal(UI.judge(z.g0-.02,z),'fail','金区之前＝失手');
  if(z.g1<.98)assert.equal(UI.judge(z.g1+.02,z),'fail','金区之后＝失手');
 }
 assert.equal(UI.judge(null,UI.zones(.5,.25,.5)),'fail','没按＝失手');
 const full=UI.zones(1,.25,.5);for(const p of [0,.2,.5,.9,1])assert.notEqual(UI.judge(p,full),'fail','100% 整趟都是金区');
});

test('闭眼乱按的成功率就是界面上写的数（一手、两手）',()=>{
 let s=1;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
 for(const [chance,tier] of [[40,D.TIERS['丁']],[33,D.TIERS['甲']]]){const P=UI.params(chance,tier,[]);let ok=0;const N=40000;
  for(let i=0;i<N;i++){const rs=[];for(let h=0;h<P.hands;h++)rs.push(UI.judge(rnd(),UI.zones(P.goldRatio,P.redRatio,rnd())));if(UI.combine(rs)!=='fail')ok++}
  assert.ok(Math.abs(ok/N-chance/100)<.015,`成功率 ${chance}% 实测 ${(ok/N*100).toFixed(1)}%`)}
});

test('Esc 缩手：判失手、收起界面、清掉按键接管',async()=>{
 const p=UI.minigame('aide',{n:'钱袋'},60,D.TIERS.none,[]);await sleep(50);
 assert.equal(layer().hidden,false,'小游戏打开了');
 assert.equal(press('a').prevented,true,'进行中按键被接管');
 press('Escape');
 assert.equal(await p,'fail');
 assert.equal(layer().hidden,true,'界面收起');
 assert.equal(press('w').prevented,false,'之后按键不再被吞');
 assert.equal(UI._active(),false);
});

test('E 落针（100% 整趟金区）→ 得手或妙手，结束后收起',async()=>{
 const p=UI.minigame('aqi',{n:'钱袋'},100,D.TIERS.none,[]);await sleep(600);
 press('e');const r=await p;
 assert.ok(r==='ok'||r==='great',r);assert.equal(layer().hidden,true);assert.equal(press('e').prevented,false);
});

test('一直不按：针走完判失手，收起界面',async()=>{
 const p=UI.minigame('x',{n:'钱袋'},50,{needle:.6,hands:1},[]);
 assert.equal(await p,'fail');assert.equal(layer().hidden,true);assert.equal(UI._active(),false);
});

test('两手：第一手中了、第二手前 Esc 也只会是失手；外部 close() 也收得起',async()=>{
 const p=UI.minigame('x',{n:'未知物品'},100,{needle:.6,hands:2,precious:true},[]);await sleep(600);
 press('e');await sleep(60);press('Escape');assert.equal(await p,'fail');assert.equal(layer().hidden,true);
 const q=UI.minigame('x',{n:'钱袋'},50,D.TIERS.none,[]);await sleep(30);UI.close();
 assert.equal(await q,'fail');assert.equal(layer().hidden,true);assert.equal(UI._active(),false);
});

test('物品扇：Esc 罢手返回 null，收起界面、清掉按键接管',async()=>{
 const target={name:'采办随从',bag:[{n:'竹叶青',diff:2,id:'wine',q:1},{money:20,diff:2}]};
 const p=UI.pick('aide',target,null);await sleep(250);
 assert.equal(layer().hidden,false);press('Escape');
 assert.equal(await p,null);assert.equal(layer().hidden,true);assert.equal(press('w').prevented,false);
});

test('物品扇：E 下手返回聚焦的那件；看不清、未知物品按设计稿显示',async()=>{
 const target={name:'采办随从',bag:[{n:'竹叶青',diff:2,id:'wine',q:1},{money:20,diff:2}]};
 const p=UI.pick('aide',target,null);await sleep(250);press('s');press('e');
 const it=await p;assert.equal(it.money,20);assert.equal(layer().hidden,true);
 assert.equal(UI.display({n:'寒魄符',g:'甲',c:'贵'},{disguised:true}).name,'看不清的一件');
 assert.equal(UI.display({n:'银铤一枚',money:600},{disguised:true}).name,'银铤一枚');
 assert.equal(UI.display({n:'蜻蜓翠簪',g:'甲',c:'贵'},{}).name,'未知物品');
});
