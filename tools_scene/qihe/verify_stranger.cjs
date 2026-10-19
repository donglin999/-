// 2026-10-08 乔装账房「宋先生」：三场后山对话、竹匾、补播、周砚站位与对证分支。函数测试，不代替浏览器验收。
const {boot}=require('./harness.cjs'),assert=require('node:assert/strict');
(async()=>{const {c,run}=await boot();c.Cultivation.start=()=>{};/* 领队交锋（2026-10-13 起插在起火前，updates/2026-10-13-faction-clash.md）是独立战斗演出，要真实解码动作表，本测试环境的 Image 是空壳；与 verify_chapter 一样跳过演出，只测剧情流程 */c.QiheFactionClash.play=async()=>'stopped';let lines=[],decisions=[];
// 2026-10-17 主线改为找人推进：自由走访阶段找当前主线人物、选【主线】并确认；其他阶段仍走 rest()。
const advanceMain=async()=>{let m=c.QiheChapter.mainStep?.();if(m?.pre){await c.QiheChapter.interact(m.npc);m=c.QiheChapter.mainStep?.();if(m?.pre)return}return m?c.QiheChapter.interact(m.npc):c.QiheChapter.rest()};
c.say=async(w,t)=>{lines.push({w,t,scene:run('S.scene')})};c.choose=async(w,t,opts)=>{const n=decisions.length?decisions.shift():0;assert(n<opts.length,t);return n};c.battle=async()=>'win';const shots=[];const play=c.QiheFireCinematic.play;c.QiheFireCinematic.play=async(id,rows)=>{shots.push(id);return play(id,rows)};
function fresh(){run("S=newState();S.name='萧白';S.hp=80;S.mp=20;S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true,originExpression:'A',greeted:{}};S.prologue.rested=true;S.prologue.relicSeen=true;S.scene='qihe_trial';cur=SC.qihe_trial;buildGrid(cur);spawnWanderers();mode='scene';busy=false;dlgBusy=false;keys={};");lines=[];decisions=[]}
const node=(scene,id)=>run(`npcsOf(SC.${scene}).find(n=>n.id===${JSON.stringify(id)})||null`);
const p=()=>c.QiheChapter.state(),said=s=>lines.some(r=>r.t.includes(s));
// 1. 主动上山：C1-00 后周婶托竹匾；拾竹匾触发 C1-00B；之后主动回话 C1-S1。
fresh();await c.QiheChapter.begin();assert(said('后山倒木那儿晾着我一只竹匾'));run('S.lv=1;S.exp=0;S.pts=0;S.bag.pill=0');assert.equal(c.QiheChapter.strangerPending(),'c1-00b');
assert(node('qh_north','stranger'));assert(node('qh_north','stranger-basket'));assert.equal(node('qh_north','stranger').sp,'c_qh_song_seated');assert(node('qh_north','stranger').mark());assert(run("mnIco('qh_song_coat',30)").includes('i_qh_song_gifts_v1'));assert(!run("mnIco('pill',30)").includes('i_qh_song_gifts_v1'));assert.equal(c.QiheNavigation.guide().title,'去后山收回竹匾');
for(const id of['stranger','stranger-basket']){const n=node('qh_north',id);assert(c.standOk(n.x*40,n.y*40),id+' blocked')}
lines=[];decisions=[1];await c.QiheChapter.interact('stranger-basket');assert(said('衣领下露出一截红绳'));assert(said('明早我还在这儿'));
assert.equal(p().records.stranger_deal,'asked_first');assert.equal(run('S.bag.pill'),2);assert.equal(run('S.exp'),30);assert(said('修为 +30'));assert.equal(p().records.basket,true);assert.equal(p().halfDay,0);assert(!node('qh_north','stranger-basket'));assert(node('qh_north','stranger'));assert.equal(c.QiheChapter.strangerPending(),null);
lines=[];await c.QiheChapter.interact('stranger');assert.equal(lines.length,1);assert.equal(p().halfDay,0);
lines=[];await advanceMain();assert.equal(p().halfDay,2);assert(said('她临走前看了我一眼'));assert(!lines.some(r=>r.w==='宋先生'),'00B 不应重播');
// 周砚第二日在西田埂，不在陈伯家，也不在后山。
assert(c.QiheChapter.zhouAtWest());assert(node('qh_west','zhouyan'));assert(!node('prologue_chen_hall','zhouyan'));assert(!c.npcsOf(c.rt.SC.qh_north).some(n=>n.name==='周砚'));
assert.equal(c.QiheNavigation.guide().title,'后山有人等你回话');
lines=[];decisions=[1];await c.QiheChapter.interact('stranger');assert(said('徐令仪亲自来了'));assert(said('周砚……他也来了'));assert.equal(p().records.stranger_report,'partial');assert.equal(run('S.bag.qh_song_coat'),1);assert.equal(run('S.exp'),60);assert.equal(run('ITEMS.qh_song_coat.q'),2);for(const id of['qh_song_coat','qh_song_abacus'])assert(!/正道盟|裴嵩/.test(run('ITEMS.'+id+'.desc')));
lines=[];await c.QiheChapter.interact('stranger');assert.equal(run('S.bag.qh_song_coat'),1,'谢礼只发一次');assert.equal(p().halfDay,2);
// 2. 第二日傍晚 C1-02：岑、沈各自疑萧白，放行后才让乌魁报信。
lines=[];await advanceMain();assert.equal(p().halfDay,4);assert(said('这两天在路口数人的，是你吧'));assert(said('这双眼睛是谁家的，先弄清楚再说'));
const wi=lines.findIndex(r=>r.t.includes('这双眼睛是谁家的')),ni=lines.findIndex(r=>r.t.includes('没人要把东西交给正道盟'));assert(ni>=0&&wi>ni);
// 3. 第三日上午不上山：继续主线前自动补播 C1-S2，然后 C1-03 翻开夹层。
assert.equal(node('qh_north','stranger').sp,'c_qh_song_story');assert(node('qh_north','stranger').mark());assert(c.QiheChapter.zhouAtWest());lines=[];decisions=[1,0,0,1];/* 宋先生问走不走→选【主线】→确认→收拾药箱的选择 */await advanceMain();
assert(said('叶家今晚是不是要从装卸侧口走'));assert.equal(p().records.stranger_told_departure,false);assert.equal(run('S.bag.qh_song_abacus'),1);assert.equal(run('S.lv'),2);assert.equal(run('S.exp'),10);assert.equal(run('S.pts'),3);assert(said('境界突破 · 第 2 层'));assert(p().events['c1-s2']);assert(!node('qh_north','stranger'),'C1-S2 后宋先生离开');
assert(said('签下面没有药'));assert(shots.includes('relics'));assert(said('是放过一只匣子'));assert.equal(p().packing,'ask');assert(!said('残谱'));assert.equal(p().halfDay,5);assert(!c.QiheChapter.zhouAtWest());assert(node('prologue_chen_hall','zhouyan'));
const si=lines.findIndex(r=>r.w==='宋先生'),pi=lines.findIndex(r=>r.t.includes('签下面没有药'));assert(si>=0&&si<pi,'补播须在 C1-03 之前');
// 4. 村火、对证（说出宋先生）、章末红绳。
lines=[];decisions=[0,0];await advanceMain();assert.equal(p().stage,'refuge');assert(!node('qh_north','stranger'));
lines=[];decisions=[0,3];await c.QiheChapter.routes();assert.equal(p().records.told_about_stranger,true);assert(said('盟里没派过'));assert(said('宋姓账房，后山倒木'));assert(said('我只卖过罐子'));assert.equal(p().evidence.strangerNamed,true);assert(said('东西不收'));assert.equal(run('S.exp'),60);assert.equal(run('S.bag.qh_song_coat')+run('S.bag.qh_song_abacus'),2);assert.deepEqual(Object.keys(p().records.stranger_gifts).sort(),['c1-00b','c1-07','c1-s1','c1-s2']);assert.equal(p().evidence.relicsAbsent,true);
lines=[];decisions=[0,0];await c.QiheChapter.routes();assert(said('木缝里卡着一截打了结的红绳'));assert(said('他没来。'));assert.equal(shots.at(-1),'rope');assert(!lines.some(r=>/残谱|药样与玉匣/.test(r.t)));assert.equal(p().stage,'cultivation');
console.log('PASS active visits, fallback S2, Zhou west, told branch');
// 5. 全程不上山：三场都在确认前补播；对证选不说出。
fresh();await c.QiheChapter.begin();decisions=[0,0];await advanceMain();assert(p().events['c1-00b']);assert.equal(p().records.stranger_deal,'accepted');assert.equal(p().halfDay,2);
lines=[];await advanceMain();assert(p().events['c1-s1']);assert.equal(p().records.stranger_report,'full');assert(said('四个护院'));/* 2026-10-17 起宋先生各段是主线前置一步“去后山倒木旁见宋先生”，由玩家自己走去后山交谈，不再自动传送到后山补播（updates/2026-10-17-playtest-rework.md）；本测试直接调 interact，故不再断言场景 */
await advanceMain();assert(p().events['c1-s2']);assert.equal(p().records.stranger_told_departure,true);
await advanceMain();assert.equal(p().stage,'refuge');lines=[];decisions=[1,3];await c.QiheChapter.routes();assert.equal(p().records.told_about_stranger,false);assert(said('外乡人，自称借住'));assert(!said('盟里没派过'));assert(!p().records.stranger_gifts['c1-07']);assert.equal(p().records.stranger_gifts['c1-s1'].exp,40);
lines=[];decisions=[0,0];await c.QiheChapter.routes();/* 2026-10-19 红绳一场按 ink 重写（story/01-开始/风起-红绳.ink，updates/2026-10-19-rewrite-风起主线.md；R-剧情-04） */assert(said('先跟上大家'));assert(!said('他没来。'));
console.log('PASS all fallback, silent branch');
// 6. 旧档：已在第二日且没见过宋先生时，不补 C1-S1，对证跳过外乡人段落。
fresh();await c.QiheChapter.begin();Object.assign(p(),{halfDay:2,events:{'xu-meeting':true}});assert.equal(c.QiheChapter.strangerPending(),null);assert(!node('qh_north','stranger'));
lines=[];await advanceMain();assert(!lines.some(r=>r.w==='宋先生'));assert(!said('在路口数人'));
console.log('PASS old save without stranger');
process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
