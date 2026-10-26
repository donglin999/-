// 2026-10-08 乔装账房「宋先生」：三场后山对话、竹匾、周砚站位与对证分支。函数测试，不代替浏览器验收。
// 2026-10-21 用户改定：整条线可选、可拒绝，不挡主线、不补播（xiaojianghu/docs/design/opening-pei-disguise.md）；本测试改测答应／拒绝／从没上山三条路线。
const {boot}=require('./harness.cjs'),assert=require('node:assert/strict');
(async()=>{const {c,run}=await boot();c.Cultivation.start=()=>{};/* 领队交锋（2026-10-13 起插在起火前，updates/2026-10-13-faction-clash.md）是独立战斗演出，要真实解码动作表，本测试环境的 Image 是空壳；与 verify_chapter 一样跳过演出，只测剧情流程 */c.QiheFactionClash.play=async()=>'stopped';let lines=[],decisions=[];
// 2026-10-17 主线改为找人推进：自由走访阶段找当前主线人物、选【主线】并确认；其他阶段仍走 rest()。
const advanceMain=async()=>{const m=c.QiheChapter.mainStep?.();return m?c.QiheChapter.interact(m.npc):c.QiheChapter.rest()};
c.say=async(w,t)=>{lines.push({w,t,scene:run('S.scene')})};c.choose=async(w,t,opts)=>{const n=decisions.length?decisions.shift():0;assert(n<opts.length,t);return n};c.battle=async()=>'win';const shots=[];const play=c.QiheFireCinematic.play;c.QiheFireCinematic.play=async(id,rows)=>{shots.push(id);return play(id,rows)};
function fresh(){run("S=newState();S.name='萧白';S.hp=80;S.mp=20;S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true,originExpression:'A',greeted:{}};S.prologue.rested=true;S.prologue.relicSeen=true;S.scene='qihe_trial';cur=SC.qihe_trial;buildGrid(cur);spawnWanderers();mode='scene';busy=false;dlgBusy=false;keys={};");lines=[];decisions=[]}
const node=(scene,id)=>run(`npcsOf(SC.${scene}).find(n=>n.id===${JSON.stringify(id)})||null`);
const p=()=>c.QiheChapter.state(),said=s=>lines.some(r=>r.t.includes(s));
// 1. 主动上山：C1-00 后周婶托竹匾；拾竹匾触发 C1-00B；之后主动回话 C1-S1。
fresh();await c.QiheChapter.begin();assert(said('后山倒木那儿晾着我一只竹匾'));run('S.lv=1;S.exp=0;S.pts=0;S.bag.pill=0');assert.equal(c.QiheChapter.strangerPending(),'c1-00b');
assert(node('qh_north','stranger'));assert(node('qh_north','stranger-basket'));assert.equal(node('qh_north','stranger').sp,'c_qh_song_seated');assert(node('qh_north','stranger').mark());assert(run("mnIco('qh_song_coat',30)").includes('i_qh_song_gifts_v1'));assert(!run("mnIco('pill',30)").includes('i_qh_song_gifts_v1'));assert.notEqual(c.QiheNavigation.guide().title,'去后山收回竹匾','可选剧情不抢行程指引');assert(c.questLog().some(q=>q.t==='去后山收回竹匾（可选）'&&q.group==='支线'));
for(const id of['stranger','stranger-basket']){const n=node('qh_north',id);assert(c.standOk(n.x*40,n.y*40),id+' blocked')}
lines=[];decisions=[1,0];/* 先问为什么→再答应 */await c.QiheChapter.interact('stranger-basket');assert(said('衣领下露出一截红绳'));assert(said('明早我还在这儿'));
assert.equal(p().records.stranger_deal,'asked_first');assert.equal(run('S.bag.pill'),2);assert.equal(run('S.exp'),30);assert(said('修为 +30'));assert.equal(p().records.basket,true);assert.equal(p().halfDay,0);assert(!node('qh_north','stranger-basket'));assert(node('qh_north','stranger'));assert.equal(c.QiheChapter.strangerPending(),null);
lines=[];await c.QiheChapter.interact('stranger');assert.equal(lines.length,1);assert.equal(p().halfDay,0);
lines=[];await advanceMain();assert.equal(p().halfDay,2);assert(said('她临走前看了我一眼'));assert(!lines.some(r=>r.w==='宋先生'),'00B 不应重播');
// 周砚第二日在西田埂，不在陈伯家，也不在后山。
assert(c.QiheChapter.zhouAtWest());assert(node('qh_west','zhouyan'));assert(!node('prologue_chen_hall','zhouyan'));assert(!c.npcsOf(c.rt.SC.qh_north).some(n=>n.name==='周砚'));
assert.equal(c.QiheChapter.strangerPending(),'c1-s1');assert.notEqual(c.QiheChapter.mainStep().npc,'stranger','后山不是主线前置');
lines=[];decisions=[1];await c.QiheChapter.interact('stranger');assert(said('徐令仪亲自来了'));assert(said('周砚……他也来了'));assert.equal(p().records.stranger_report,'partial');assert.equal(run('S.bag.qh_song_coat'),1);assert.equal(run('S.exp'),60);assert.equal(run('ITEMS.qh_song_coat.q'),2);for(const id of['qh_song_coat','qh_song_abacus'])assert(!/正道盟|裴嵩/.test(run('ITEMS.'+id+'.desc')));
lines=[];await c.QiheChapter.interact('stranger');assert.equal(run('S.bag.qh_song_coat'),1,'谢礼只发一次');assert.equal(p().halfDay,2);
// 2. 第二日傍晚 C1-02：岑、沈各自疑萧白，放行后才让乌魁报信。
lines=[];await advanceMain();assert.equal(p().halfDay,4);assert(said('这两天在路口数人的，是你吧'));assert(said('这双眼睛是谁家的，先弄清楚再说'));
const wi=lines.findIndex(r=>r.t.includes('这双眼睛是谁家的')),ni=lines.findIndex(r=>r.t.includes('没人要把东西交给正道盟'));assert(ni>=0&&wi>ni);
// 3. 第三日上午不上山：不再补播 C1-S2，直接进 C1-03 翻开夹层；错过的一段之后也不会再有。
assert.equal(node('qh_north','stranger').sp,'c_qh_song_story');assert(node('qh_north','stranger').mark());assert(c.QiheChapter.zhouAtWest());lines=[];decisions=[0,1];/* 确认→收拾药箱的选择（2026-10-21 起不再有【主线】选项） */await advanceMain();
assert(!said('叶家今晚是不是要从装卸侧口走'));assert(!p().events['c1-s2']);assert(!run('S.bag.qh_song_abacus'));assert.equal(run('S.lv'),1);assert.equal(run('S.exp'),60);assert(!lines.some(r=>r.w==='宋先生'),'不补播');assert(!node('qh_north','stranger'),'第三日下午起宋先生不在');
assert(said('签下面没有药'));assert(shots.includes('relics'));assert(said('是放过一只匣子'));assert.equal(p().packing,'ask');assert(!said('残谱'));assert.equal(p().halfDay,5);assert(!c.QiheChapter.zhouAtWest());assert(node('prologue_chen_hall','zhouyan'));
// 4. 村火、对证（说出宋先生）、章末红绳。
lines=[];decisions=[0,0];await advanceMain();assert.equal(p().stage,'refuge');assert(!node('qh_north','stranger'));
lines=[];decisions=[0,3];await c.QiheChapter.routes();assert.equal(p().records.told_about_stranger,true);assert(said('盟里没派过'));assert(said('宋姓账房，后山倒木'));assert(said('我只卖过罐子'));assert.equal(p().evidence.strangerNamed,true);assert(said('这青绫行衣，是他给你的'));assert.equal(run('S.lv'),2);assert.equal(run('S.exp'),10);assert.equal(run('S.bag.qh_song_coat'),1);assert.deepEqual(Object.keys(p().records.stranger_gifts).sort(),['c1-00b','c1-07','c1-s1']);assert.equal(p().evidence.relicsAbsent,true);
lines=[];decisions=[0,0];await c.QiheChapter.routes();assert(said('木缝里卡着一截打了结的红绳'));assert(said('他没来。'));assert.equal(shots.at(-1),'rope');assert(!lines.some(r=>/残谱|药样与玉匣/.test(r.t)));assert.equal(p().stage,'cultivation');
console.log('PASS accepted, skipped S2 without replay, Zhou west, told branch');
// 5. 拒绝：竹匾那场选不掺和；不给谢礼，后两段、装卸路与对证的“路口数人”、红绳都没有。
fresh();await c.QiheChapter.begin();run('S.lv=1;S.exp=0;S.pts=0;S.bag.pill=0');lines=[];decisions=[2];await c.QiheChapter.interact('stranger-basket');
assert(said('替人盯梢这种事，我做不来'));assert(!said('明早我还在这儿'));assert.equal(p().records.stranger_deal,'declined');assert.equal(p().records.basket,true);assert.equal(run('S.bag.pill'),0);assert.equal(run('S.exp'),0);assert(p().events['c1-00b']);
lines=[];await c.QiheChapter.interact('stranger');assert(said('竹匾拿回去吧'));
lines=[];await advanceMain();assert.equal(p().halfDay,2);assert.equal(c.QiheChapter.strangerPending(),null);assert(!node('qh_north','stranger'));
lines=[];await advanceMain();assert.equal(p().halfDay,4);assert(!said('在路口数人'));assert(said('别再掀人家的药包'));assert.equal(c.QiheChapter.strangerPending(),null);
lines=[];decisions=[0,0];await advanceMain();lines=[];decisions=[0,0];await advanceMain();assert.equal(p().stage,'refuge');
lines=[];decisions=[3];/* 没有说不说出宋先生那一问；先选“我再想想” */await c.QiheChapter.routes();assert(p().events['evidence-v2']);assert(!said('路口数人的那个'));assert(!said('外乡人，自称借住'));assert(said('我只卖过罐子'));assert(!p().records.told_about_stranger);
lines=[];decisions=[0,0];await c.QiheChapter.routes();assert(!said('红绳'));assert(!p().events['backhill-rope']);assert.equal(p().stage,'cultivation');
console.log('PASS declined: no follow-ups, baseline lines');
// 6. 从没上山：第一天上午不去后山，宋先生之后不再出现，任何人都不把萧白当眼线。
fresh();await c.QiheChapter.begin();assert.equal(c.QiheChapter.mainStep().npc,'ye');lines=[];await advanceMain();assert.equal(p().halfDay,2);assert(!lines.some(r=>r.w==='宋先生'));assert(!p().events['c1-00b']);assert.equal(c.QiheChapter.strangerPending(),null);assert(!node('qh_north','stranger'));assert(!node('qh_north','stranger-basket'));
lines=[];await advanceMain();assert(!said('在路口数人'));
console.log('PASS never visited');
process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
