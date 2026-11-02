// 师承线（师母、二师叔、小师叔的闲逛学艺，2026-11-02）：门槛、学习、练功、关系推进、闲逛额度、行动预算。纯状态机。
const assert=require('node:assert/strict');
const C=require('../js/qh-mode-cultivation-core.js'),D=require('../js/qh-mode-cultivation-data.js'),H=require('../js/qh-mode-cultivation-household.js'),R=require('../js/qh-mode-cultivation-relations.js'),B=require('../js/qh-mode-cultivation-balance.js'),G=require('../js/qh-mode-cultivation-growth.js'),V=require('../js/qh-mode-cultivation-visitors.js'),L=require('../js/qh-mode-cultivation-library.js');
const LINES={shimu:[['ms_thread','art_jc_n1','courtyard'],['ms_hand','art_jc_n2','kitchen'],['ms_sleeve','art_jc_n3','kitchen']],zhong:[['mz_bucket','art_zz_p1','training_ground'],['mz_dummy','art_zz_p2','training_ground'],['mz_notch','xf_danxue','courtyard']],yin:[['my_twig','art_yh_s1','bamboo_path'],['my_wrist','art_yh_s2','bamboo_path'],['my_step','art_yh_b1','courtyard']]};
const action=id=>D.actions.find(a=>a.id===id),play=(s,id,pick=0)=>{C.start(s,id,{story:true});let g=0;while(s.pending.stage!=='result'&&g++<200){if(s.pending.visitor.phase==='choice')C.visitorChoose(s,pick);else C.visitorNext(s);}assert.equal(s.pending.stage,'result',id);const r=s.pending.result;C.closeResult(s);return r;};
function base(month=3,phase=1){const s=C.initial();C.join(s);s.month=month;s.phase=phase;s.learned.stance={};s.learned.sword={};Object.assign(s.facts,{gy_noodles_seen:{},gy_night_return_seen:{},gy_fist_or_sword_seen:{},gy_prelude_tour_seen:{},xiangyang_invitation:true});return s;}
const practise=(s,id,xp)=>{s.martialXp[id]=Math.max(s.martialXp[id]||0,xp);};
const T=[];const check=(n,f)=>{f();T.push(n);console.log('PASS',n);};

check('九门新功法都有招式合同或心法，招式数合 v3 规范（丁丙各一招），只能由本人亲授',()=>{
 for(const a of L.arts.filter(a=>a.sceneTaught)){
  assert.ok(['丁','丙'].includes(a.grade),a.id);
  if(a.type==='external'){assert.equal(a.moves.length,1,a.id);const m=L.moves[a.moves[0].id];assert.ok(m,a.id);assert.equal(m.s.grade,a.grade);assert.equal(m.b.bp.length,4);assert.ok(m.s.descV4);}else assert.ok(L.hearts[a.id],a.id);
  const tr=action(a.action);assert.ok(tr,a.action);assert.equal(tr.teacher,a.teacher);
  const s=base();const why=C.availability(s,tr);assert.match(why,/亲自教/,a.id);assert.ok(!s.learned[a.key]);}
 assert.equal(L.arts.filter(a=>a.sceneTaught).length,9);});

check('数值守住现有曲线：丁≤基础招，丙≤现行丙乙之间；前五个月封顶丁三重、丙四重、内功二层',()=>{
 const pow=id=>L.moves[id].b.bp[0][0];
 for(const id of ['jc_n1','zz_p1','yh_s1'])assert.ok(pow(id)<=L.moves.gy_s1.b.bp[0][0],id);
 for(const id of ['jc_n2','zz_p2','yh_s2'])assert.ok(pow(id)>=L.moves.gy_s2.b.bp[0][0]-.1&&pow(id)<L.moves.gy_s3.b.bp[0][0],id);
 const s=base(4,0);for(const[id,cap]of [['art_jc_n1',3],['art_jc_n2',4],['xf_danxue',2]]){const a=B.artById(id);s.learned[a.key]={};s.martialXp[id]=9999;assert.equal(B.cap(s,a),cap,id);assert.equal(B.level(s,a),cap,id);}
 s.month=6;assert.equal(B.cap(s,B.artById('art_jc_n2')),10);assert.equal(B.cap(s,B.artById('xf_danxue')),5);});

for(const[who,line]of Object.entries(LINES))check(who+'：三步按练功程度一步步开，每步学会一门，关系推进',()=>{
 const name={shimu:'江采薇',zhong:'钟拙',yin:'殷红缨'}[who],s=base(4,0);
 s.relations={};R.story(s,name,6,'开场积累');const before=R.inspect(s,name).score;
 const [a,b,c]=line;
 assert.equal(C.availability(s,action(b[0])).includes('练到'),true,'第二步要先学会第一步');
 assert.ok(C.strollPool(s,a[2]).some(x=>x.id===a[0]),'第一步在该地点可遇');
 play(s,a[0]);assert.ok(s.learned[a[1]],a[1]);assert.match(C.availability(s,action(b[0])),/练到3重/);
 practise(s,a[1],75);assert.equal(C.availability(s,action(b[0])),'');
 const r2=play(s,b[0],1);assert.ok(s.learned[b[1]]);assert.ok(r2.taught,'结果面板要写学会什么');
 assert.match(C.availability(s,action(c[0])),/练到3重/);practise(s,b[1],75);
 assert.equal(C.availability(s,action(c[0])),'','程度够、关系够就开第三步');play(s,c[0]);assert.ok(s.learned[c[1]],c[1]);
 assert.ok(R.inspect(s,name).score>before,'关系有推进');});

check('学会后世界同步：技能、心法、礼物进存档，练功栏出现并能实际练',()=>{
 const s=base(3,1),world={cultivation:s,st:{str:3,con:3,agi:3,wil:3,wis:3},skills:{},bag:{},party:[]};
 play(s,'ms_thread');play(s,'mz_bucket');play(s,'my_twig');C.reconcileWorld(world);
 for(const k of ['jc_n1','zz_p1','yh_s1'])assert.equal(world.skills[k],1,k);
 assert.equal(world.bag.needles,1);assert.equal(world.bag.wood,1);C.reconcileWorld(world);assert.equal(world.bag.needles,1,'礼物只发一次');
 s.energy=12;C.start(s,'TR_art_jc_n1',{directResult:true});const r=C.resolve(s,undefined,{directResult:true});assert.ok(r.learning.xp>0);assert.equal(r.gainKey,'hidden');C.closeResult(s);
 assert.ok(s.martialXp.art_jc_n1>0);assert.ok(G.growth(s,D.actions).zy['暗器']>0,'针路给暗器造诣');
 s.martialXp.art_zz_p2=75;s.learned.art_zz_p2={};s.facts.xiangyang_invitation=true;s.month=4;s.phase=0;R.story(s,'钟拙',20,'t');play(s,'mz_notch');C.reconcileWorld(world);assert.ok(world.xinfa.known.includes('xf_danxue'));assert.notEqual(world.xinfa.main,'xf_danxue','不抢主修，玩家自己换');});

check('师承另算额度：同一时段闲逛遇一段之外，还能再遇一段师承；两者各只一段',()=>{
 const s=base(3,0);s.learned.footwork={};s.facts.gy_ledger_seen={};s.facts.herb_labels={};s.facts.gy_l02_seen={};
 const first=C.stroll(s,'SP_training_ground');assert.ok(first.story);const a1=action(first.story);C.visitorNext;for(let i=0;i<200&&s.pending.stage!=='result';i++){if(s.pending.visitor.phase==='choice')C.visitorChoose(s,0);else C.visitorNext(s);}C.closeResult(s);
 assert.equal(s.facts[a1.mentor?'mentor_met':'stroll_met'],C.period(s));
 assert.ok(!C.strollPool(s,'training_ground').some(x=>!!x.mentor===!!a1.mentor),'同类本时段不再遇');});

check('不漏看：只做一条线、一条都不做，固定剧情照常可走，别的线不受影响；窗口到出门前都开着',()=>{
 for(const[,line]of Object.entries(LINES))for(const[id]of line){const d=H.definitions.find(x=>x.id===id);assert.ok(d.mentor);assert.ok(!d.auto);assert.ok(d.window[1]>=19,id);}
 const s=base(4,0);play(s,'ms_thread');practise(s,'art_jc_n1',75);assert.ok(C.strollPool(s,'training_ground').some(x=>x.id==='mz_bucket'));assert.ok(!Object.keys(s.facts).some(k=>k.startsWith('if_')));});

check('行动预算：第 1～4 月体力够把三条线全部学完，还剩大半；全走完不超过可用自由期',()=>{
 const free=19,energy=free*D.energyPerPeriod,E=7,xpPerLesson=5*E;/* 实机第 3 月效率 7，一次 35 经验 */let lessons=0;
 for(const line of Object.values(LINES)){lessons+=Math.ceil(75/xpPerLesson)*2;}
 const cost=lessons*5;assert.ok(cost<=90&&cost<energy*.4,'三线全修占比 '+cost+'/'+energy);});

check('台词：九场都有两个以上选择，第一年无暧昧用词，所有说话人在场且表情存在',()=>{
 for(const id of [...Object.values(LINES).flat().map(x=>x[0]),'ys_two_needles','ys_lu_rope','ys_wine']){const d=H.definitions.find(x=>x.id===id);assert.ok(d,id);const x=V.script(id,{yinScore:0,learned:{sword:true,fist:false,footwork:false}});assert.ok(x.choices.length>=2,id);
  for(const l of [...x.intro,...x.closing,...x.choices.flatMap(c=>c.lines)]){if(l.speaker==='title')continue;assert.ok(d.cast.includes(l.speaker),id+' '+l.speaker);assert.ok(l.text.length<=64,id+' '+l.text);assert.ok(!/喜欢你|心上人|娘子|情意/.test(l.text),l.text);}}});

check('三方代表书信：读过善后回信才开放，三封依次回，闹翻的不开',()=>{
 const s=base(3,1);assert.ok(!C.letterRecipients(s).some(n=>n.name==='岑霜'));s.facts.hg_aftercare_seen={};
 for(const name of ['徐令仪','岑霜','沈雁回'])assert.ok(C.letterRecipients(s).some(n=>n.name===name),name);
 const bodies=[];for(let i=0;i<3;i++){s.pending=null;s.energy=12;C.start(s,'C01',{theme:'近况',recipient:'岑霜',directResult:true});C.resolve(s,0,{directResult:true});bodies.push(s.letters.at(-1).body);C.closeResult(s);s.history.at(-1).period-=i+1;s.month+=0;s.phase=(s.phase+1)%5;}
 assert.equal(new Set(bodies).size,3);assert.ok(bodies[0].includes('乌魁'));
 globalThis.S={qiheBond:{censhuang:{hostile:true}}};assert.ok(!C.letterRecipients(s).some(n=>n.name==='岑霜'));delete globalThis.S;});

check('三方当面戏：已开放；台词说话人都在场，第一次窗口够长，第二次要先看第一次，闹翻了不出现',()=>{
 const MT=require('../js/qh-mode-cultivation-mentors.js');
 assert.equal(MT.REPS_ART_READY,true);assert.equal(H.definitions.filter(d=>d.id.startsWith('rep_')).length,6);assert.equal(MT.repDefinitions.length,6);
 for(const d of MT.repDefinitions){const x=MT.scripts[d.id]({});assert.ok(x.choices.length>=2,d.id);assert.ok(d.mentor);
  for(const l of [...x.intro,...x.closing,...x.choices.flatMap(c=>c.lines)]){if(l.speaker==='title')continue;assert.ok(d.cast.includes(l.speaker),d.id+' '+l.speaker);assert.ok(l.text.length<=64,l.text);}
  for(const c of x.choices)assert.ok(MT.bonds[d.id]?.[c.key],d.id+c.key);}
 const by=Object.fromEntries(MT.repDefinitions.map(d=>[d.id,d]));
 for(const [a,b] of [['rep_shen_stall','rep_shen_sign'],['rep_cen_pay','rep_cen_gate'],['rep_xu_note','rep_xu_speak']]){assert.ok(by[b].factRequires.includes(a+'_seen'));assert.ok(by[a].window[1]>=by[b].window[0],a);}
 const s=base(4,1);s.facts.hg_aftercare_seen={};assert.ok(C.strollPool(s,'terraces').some(x=>x.id==='rep_cen_pay'));play(s,'rep_cen_pay');assert.ok(R.inspect(s,'岑霜').score>0);
 assert.ok(C.strollPool(s,'terraces').some(x=>x.id==='rep_cen_gate'));
 globalThis.QIHE_NPC_DATA={PEOPLE:{censhuang:{name:'岑霜'}}};globalThis.S={qiheBond:{censhuang:{hostile:true}}};assert.ok(!C.strollPool(s,'terraces').some(x=>x.id==='rep_cen_gate'));delete globalThis.S;delete globalThis.QIHE_NPC_DATA;});

console.log(JSON.stringify({status:'pass',checks:T.length}));
