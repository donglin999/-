// 2026-10-28 隐藏奇遇 H1 北坡石洞、H2 老更夫、H3 帮众挑衅、H7 全村平安符的实机走查（js/qihe-hidden.js；设计 qihe-hidden-rewards.md 第 3、7 节）。
// 用法：先起本地 8792，再 node tools_scene/qihe/verify_hidden.cjs。用本机 Chrome 跑；对话框自动点过，选项按给定顺序选。
const path=require('node:path'),assert=require('node:assert/strict');
const dep=process.env.CODEX_NODE_MODULES||'/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {chromium}=require(path.join(dep,'playwright'));
const AUTO=`window.__picks=[];window.__auto=setInterval(()=>{const c=[...document.querySelectorAll('#dlg .choices > *')].filter(x=>x.offsetParent);if(c.length){c[window.__picks.length?window.__picks.shift():0]?.click();return}const d=document.getElementById('dlg');if(d&&d.offsetParent)d.click();document.querySelector('#bt-win')?.dispatchEvent(new PointerEvent('pointerdown'))},120);
 window.__wait=ms=>new Promise(r=>setTimeout(r,ms));window.npc=(sc,id)=>SC[sc].npcs.find(n=>n.id===id);`;
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1600,height:900}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 async function fresh(sc,xy){await p.goto('http://127.0.0.1:8792/#qihe-map');await p.waitForFunction(()=>typeof goScene==='function'&&!!SC?.qh_east&&!!window.QiheHidden,null,{timeout:60000});
  await p.evaluate(([sc,xy])=>{S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=2;S.qiheChapter.events={'c1-00b':true,'c1-s1':true};S.prologue=QihePrologue.fresh();S.silver=10;S.bag={};goScene(sc,xy)},[sc,xy]);
  await p.waitForTimeout(1300);await p.evaluate(()=>{const pn=document.getElementById('panel');if(pn)pn.hidden=true;mode='scene';busy=false;dlgBusy=false});await p.evaluate(AUTO)}
 const run=js=>p.evaluate(`(async()=>{${js}})()`);

 // H1：石洞先不启动（2026-10-28 用户）：北坡没有洞口，老人不提石洞，陈伯不借绳
 await fresh('qh_north',[15,6]);
 let r=await run(`return {mouth:!!npc('qh_north','hid-cave'),cave:JSON.stringify(S.qiheHidden?.cave||{})}`);
 assert.equal(r.mouth,false,'石洞关闭时不放洞口');

 // H2：换时段找梆子听旧事（第一回是第一夜送药）；同一时段不接着来；再换时段（第二天下午起）陪守一夜，得《南窗心法》
 await fresh('qihe_trial',[30,20]);
 r=await run(`S.prologue.errands={bowls:'done',cloth:'done',medicine:'done'};const e=npc('qihe_trial','elder');S.qiheChapter.halfDay=2;
  await e.act();const veg=S.qiheHidden.elder.veg;await e.act();const wait=!S.qiheHidden.elder.taught;
  S.qiheChapter.halfDay=3;await e.act();return {veg,wait,cave:S.qiheHidden.cave,taught:S.qiheHidden.elder.taught,book:S.bag.qh_nanchuang_xf}`);
 assert.equal(r.veg,true);assert.ok(r.wait,'收菜同一时段不接着守夜');assert.ok(!r.cave.heard,'老人不提石洞');assert.equal(r.taught,true);assert.equal(r.book,1);

 // H3（2026-10-29 新版，和新人阿炭比划）：第一次是原来那句，第二次木桩挨骂，第三次比一场；赢了得《扬灰手》，余波三选一，后果是实际数值
 const h3=async(pick)=>{await fresh('prologue_inn_interior',[10,12]);return run(`S.lv=12;const d=derived();S.hp=d.mhp;S.silver=10;S.qiheTown={version:1,tab:{stage:'none'}};const b=npc('prologue_inn_interior','bandit');
  const atanShown=!!npc('prologue_inn_interior','atan');
  await b.act();await b.act();const t2=S.qiheHidden.bandit.talks;window.__picks=[0];const f=b.act();for(let i=0;i<40&&!B;i++)await __wait(250);if(B){B.foes.forEach(x=>x.hp=1);B.auto=true;B.autoPending?.()}await f;
  const won=S.qiheHidden.bandit.won,book=S.bag.mj_art_gj_h1,bond=id=>QiheNpc.bond.get(id).score,before={atan:bond('atan'),cen:bond('censhuang'),gj:QiheJianghu.stage('guijintang').score};
  const pick='${pick}';
  if(pick==='no'){window.__picks=[1];await npc('qh_south','censhuang').act();window.__picks=[1];await npc('prologue_inn_interior','atan').act()}
  if(pick==='sell'){window.__picks=[0];await npc('qh_south','censhuang').act()}
  if(pick==='return'){window.__picks=[0];await npc('prologue_inn_interior','atan').act()}
  return {atanShown,t2,won,book,decided:S.qiheHidden.bandit.decided||null,still:S.bag.mj_art_gj_h1||0,silver:S.silver,returned:!!S.qiheHidden.flags.qh_recruit_returned,
   name:npc('prologue_inn_interior','atan').name,d:{atan:bond('atan')-before.atan,cen:bond('censhuang')-before.cen,gj:QiheJianghu.stage('guijintang').score-before.gj}}`)};
 r=await h3('no');assert.ok(r.atanShown,'新来的站在客栈');assert.equal(r.t2,2);assert.equal(r.won,true);assert.equal(r.book,1);
 assert.equal(r.decided,'keep','对岑霜说“不卖”不算处置，再跟新来的说“留着”才算');assert.equal(r.still,1);assert.equal(r.d.atan,-5);assert.equal(r.name,'新来的');
 r=await h3('sell');assert.equal(r.decided,'sell');assert.equal(r.still,0);assert.equal(r.silver,30);assert.equal(r.d.atan,-10);assert.ok(r.d.cen<0,'岑霜好感降');assert.ok(r.d.gj<=-3,'归烬堂声望 −3：'+r.d.gj);
 r=await h3('return');assert.equal(r.decided,'return');assert.equal(r.still,0);assert.ok(r.returned);assert.equal(r.d.atan,8);assert.equal(r.name,'阿炭');

 // H7：六人缺一个就不给；齐了在邻村由周婶给，只给一次；平安符每场保一次 1 点气血
 await fresh('qh_refuge',[20,14]);
 r=await run(`S.prologue.errands={bowls:'done',cloth:'done',medicine:'done'};S.qiheChapter.choices.market='help';S.prologue.outsiders||={};S.prologue.outsiders.quests={ledger:{stage:'checked'}};S.qiheChapter.stage='refuge';
  const a=npc('qh_refuge','aunt');const miss=!Object.values(QiheHidden.villageDeeds()).every(Boolean);
  S.prologue.outsiders.quests={ledger:{stage:'witnessed'}};await a.act();const got=S.bag.qh_baijia_charm;
  S.acc='qh_baijia_charm';delete S.bag.qh_baijia_charm;battle({solo:true,noLose:true,foes:[{name:'测',sp:'c_bandit',lv:1,st:{str:1,con:1,agi:1,wil:1,wis:1},hpMul:3,atkMul:0,exp:0,drops:{}}]});
  for(let i=0;i<40&&!B;i++)await __wait(250);const h=B.allies[0];h.hp=5;hurt(h,999,'#f00');const h1=h.hp;hurt(h,999,'#f00');return {miss,got,given:S.qiheHidden.village.given,h1,h2:h.hp}`);
 assert.ok(r.miss,'差役那件没做完不算');assert.equal(r.got,1);assert.equal(r.given,true);assert.equal(r.h1,1);assert.equal(r.h2,0);

 assert.deepEqual(errs,[],'页面报错：'+errs.join('；'));
 await b.close();console.log('PASS hidden encounters: H1 cave off, H2 night watchman, H3 bandit, H7 village charm');
})().catch(e=>{console.error(e);process.exit(1)});
