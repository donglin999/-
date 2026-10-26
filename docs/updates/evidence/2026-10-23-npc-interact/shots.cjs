// 人物交互框架（开发一，2026-10-23）浏览器验收：8792，Playwright 无头 Chromium 1248，1600×900（与渲染图同尺寸）。
// 用法：node shots.cjs [输出目录，缺省为本目录]
// 拍：靠近徐令仪弹墨印、陆衡聚焦“教”、请教卷、查看徐令仪（萧白 1 级）、查看叶蘅（一眼看穿）、邻村护院切磋邀请卷、差距过大拒绝、第一夜南村口无三方三人；
// 另跑一场护院切磋（自动战斗）核对收益与“学会切磋”。结果写 verification.json。
process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const EXE='/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const out=process.argv[2]||__dirname;fs.mkdirSync(out,{recursive:true});
const URL='http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map';
(async()=>{const b=await chromium.launch({executablePath:EXE});try{const report={date:'2026-10-23',entry:URL,viewport:[1600,900],shots:[],checks:{},errors:[]};
 const ctx=await b.newContext({viewport:{width:1600,height:900}});const p=await ctx.newPage();globalThis.__p=p;
 p.on('pageerror',e=>report.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text())});
 await p.setDefaultTimeout(30000);await p.goto(URL,{waitUntil:'load',timeout:120000});
 await p.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene'&&window.QiheExpansion&&window.QiheNpcUI,null,{timeout:90000});
 await p.waitForTimeout(800);
 const shot=async(name,note)=>{console.log('拍',name);await p.waitForTimeout(450);const file=name+'.png';await p.screenshot({path:path.join(out,file)});report.shots.push({file,note})};
 // 站位：把主角放在某个 NPC 旁边（dx 为正＝主角在右，墨印绕到左侧），再按 E（走全局 interact，与玩家按键同一路径）
 const setup=async(fn)=>p.evaluate(fn);
 const near=async(scene,id,dx=62,dy=6)=>(console.log('站到',scene,id),p.evaluate(async([scene,id,dx,dy])=>{if(S.scene!==QiheExpansion.ids[scene])await QiheExpansion.go(scene);QiheExpansion.refresh();
  const n=cur._npcs.find(n=>n.id===id);if(!n)throw Error('图上没有 '+id+'：'+cur._npcs.map(n=>n.id).join(','));
  for(const d of[[dx,dy],[dx,dy+20],[dx,dy-20],[-dx,dy],[dx*.8,dy+30]]){if(!standOk(n.x*TS+d[0],n.y*TS+d[1]))continue;Object.assign(player,{x:n.x*TS+d[0],y:n.y*TS+d[1],path:null,goal:null,trail:[]});if(nearest()?.o===n)break}
  if(nearest()?.o!==n)throw Error('站不到 '+id+' 身边：最近的是 '+nearest()?.o?.name);
  wanderers=[];snapCam();await new Promise(r=>setTimeout(r,250));return{npc:[n.x*TS,n.y*TS],player:[player.x,player.y]}},[scene,id,dx,dy]));
 const pressE=async()=>{console.log('按 E');await p.keyboard.press('e');await p.waitForTimeout(500)};
 const ringState=()=>p.evaluate(()=>{const r=QiheNpcUI.ring.current;return{items:r.items.map(i=>i.ch+':'+i.st+':'+(i.note||'')),focus:r.focus.id}});
 const focus=id=>p.evaluate(id=>{QiheNpcUI.ring.current.focus=id},id);
 const esc=async(n=1)=>{for(let i=0;i<n;i++){await p.keyboard.press('Escape');await p.waitForTimeout(260)}};
 const base=()=>setup(()=>{const c=S.qiheChapter;Object.assign(c,{stage:'days',halfDay:0,events:{},choices:{},pendingEvent:undefined});delete c.pendingEvent;delete S.qiheNpc;delete S.qiheBond;S.lv=1;S.hp=derived().mhp;S.prologue.outsiders={version:1,quests:{}};});

 // ① 第一夜：还没进风起（无主线存档），南村口没有三方三人（errands 0.3）
 const night=await p.evaluate(async()=>{const keep=S.qiheChapter;delete S.qiheChapter;await QiheExpansion.go('south');QiheExpansion.refresh();const south=cur._npcs.map(n=>n.name);
  await QiheExpansion.go('east');QiheExpansion.refresh();const east=cur._npcs.map(n=>n.name);window.__keep=keep;return{south,east}});
 report.checks.firstNight=night;assert(!night.south.some(n=>['徐令仪','岑霜','沈雁回'].includes(n)),'第一夜南村口不应有三方三人');assert(!night.east.some(n=>['徐令仪','岑霜','沈雁回'].includes(n)));
 assert(night.south.includes('护院')&&night.south.includes('帮众'),'随从照旧在');
 await p.evaluate(async()=>{await QiheExpansion.go('south');QiheExpansion.refresh();const n=cur._npcs.find(n=>n.name==='护院');player.x=n.x*TS+40;player.y=n.y*TS+120;wanderers=[];snapCam()});
 await shot('07-first-night-south','第一夜南村口：只有随从（护院、帮众）与店家、药商，徐令仪、岑霜不在图上');
 await p.evaluate(()=>{S.qiheChapter=window.__keep});await base();
 // 第一天白天同样不在；第一天傍晚《徐令仪上门》之后徐令仪才上图
 report.checks.day1=await p.evaluate(async()=>{QiheExpansion.refresh();await QiheExpansion.go('south');QiheExpansion.refresh();const a=cur._npcs.map(n=>n.name);S.qiheChapter.halfDay=2;S.qiheChapter.events['xu-meeting']=true;QiheExpansion.refresh();const b2=cur._npcs.map(n=>n.name);
  return{day1:a.filter(n=>['徐令仪','岑霜'].includes(n)),afterXu:b2.filter(n=>['徐令仪','岑霜'].includes(n)),letterOpen:QiheOutsiders.questOpen('letter'),accountOpen:QiheOutsiders.questOpen('account')}});
 assert.deepEqual(report.checks.day1.day1,[]);assert.deepEqual(report.checks.day1.afterXu,['徐令仪']);assert(report.checks.day1.letterOpen&&!report.checks.day1.accountOpen);

 // ② 南村口靠近徐令仪：托（拜帖跑腿）朱印排第一，教、比淡墨（图 08）
 await near('south','xulingyi',48,4);await pressE();
 const xu=await ringState();report.checks.ringXu=xu;assert.equal(xu.focus,'tuo');assert(xu.items[0].startsWith('托:story'));
 await shot('01-ring-xu','南村口靠近徐令仪：托（拜帖跑腿）朱印聚焦；教、比为淡墨空心印');
 await focus('bi');await shot('01b-ring-xu-bi','同上，转到“比”：小签写原因（还不懂讨教的规矩）');
 // ③ 查看徐令仪（萧白 1 级，差 21 级：看个大概）
 await focus('guan');await pressE();await p.waitForSelector('.qn-page');
 report.checks.profileXu=await p.evaluate(()=>({tier:QiheNpc.view(QiheNpc.people.xulingyi).tier.id,text:document.querySelector('.qn-page .pl').textContent,bag:[...document.querySelectorAll('.qn-page .bag .nm')].map(e=>e.textContent)}));
 assert.equal(report.checks.profileXu.tier,'rough');await shot('03-profile-xu-far','查看徐令仪（萧白 1 级）：装备、随身物品看得见；武学只认路数；根基只分高中低；等级“高你许多”');
 await esc(2);

 // ④ 西田埂陆衡：聚焦“教”（图 07），展开请教卷（图 05b）
 await setup(()=>{S.qiheChapter.halfDay=0;S.qiheChapter.events={};});
 await near('west','luheng',64,4);await pressE();await focus('jiao');
 report.checks.ringLu=await ringState();await shot('02-ring-luheng-teach','西田埂陆衡：聚焦“教”（护路棍法 · 丙）；“比”淡墨（还不懂讨教的规矩）');
 await pressE();await p.waitForSelector('.qn-scroll');await shot('02b-teach-luheng','请教卷：护路棍法一重·横杆护身，条件与所得；拜请指点进现有学棍过场');
 await esc(2);

 // ⑤ 查看叶蘅（3 级，萧白 1 级，差 2：一眼看穿）
 const ye=await p.evaluate(async()=>{S.qiheChapter.mainDismissed=S.qiheChapter.halfDay;await QihePrologue.goLocal('clinic_interior');QiheExpansion.refresh();return cur._npcs.map(n=>n.id+':'+n.name)});
 report.checks.clinic=ye;
 report.checks.yePos=await p.evaluate(async()=>{const n=cur._npcs.find(n=>n.name==='叶蘅');for(const d of[[56,4],[-56,4],[50,30],[-50,30],[0,56],[40,-20],[-40,-20]]){const x=n.x*TS+d[0],y=n.y*TS+d[1];if(!standOk(x,y))continue;player.x=x;player.y=y;if(nearest()?.o===n)break}snapCam();return{scene:S.scene,near:nearest()?.o?.name}});
 await pressE();await focus('guan');await pressE();await p.waitForSelector('.qn-page');
 report.checks.profileYe=await p.evaluate(()=>({tier:QiheNpc.view(QiheNpc.people.ye).tier.id,text:document.querySelector('.qn-page .pl').textContent}));
 assert.equal(report.checks.profileYe.tier,'clear');await shot('04-profile-ye-clear','查看叶蘅（萧白 1 级、叶蘅 3 级）：一眼看穿，根基精确');
 await esc(2);

 // ⑥ 邻村对证之后：护院切磋邀请卷（首场，朱印“比”，徐令仪已点头）
 await setup(()=>{Object.assign(S.qiheChapter,{stage:'refuge',halfDay:6});S.qiheChapter.events={'xu-meeting':true,'three-meeting':true,'evidence-v2':true,arrival:true};S.lv=2;S.hp=derived().mhp});
 await near('refuge','retainer-refuge',64,4);await pressE();
 report.checks.ringRetainer=await ringState();assert.equal(report.checks.ringRetainer.focus,'bi');
 await shot('05a-ring-retainer','邻村护院：剧情首场“比”为朱印，小签“徐令仪已点头”；邻村没有现成台词，不出“谈”');
 await pressE();await p.waitForSelector('.qn-scroll');await shot('05-spar-invite-retainer','切磋邀请卷：对手档位、收手规则、经验三档与历练、学会切磋');
 // 打这一场（开自动战斗），核对收益
 await p.keyboard.press('e');
 await p.waitForFunction(()=>mode==='battle'&&B&&B.round>=1,null,{timeout:60000});
 await p.evaluate(()=>{B.auto=true});
 await p.waitForFunction(()=>document.querySelector('.qn-result'),null,{timeout:240000});
 report.checks.sparResult=await p.evaluate(()=>({text:document.querySelector('.qn-result').textContent,learned:!!S.qiheNpc.skills.spar,insight:S.jianghuInsight.receipts,rec:S.qiheNpc.spar.retainer,hp:[S.hp,derived().mhp]}));
 assert(report.checks.sparResult.learned,'打完护院首场应学会切磋');
 await shot('05b-spar-result','护院首场打完：胜／平／败、经验、历练，学会切磋');
 await p.keyboard.press('e');await p.waitForTimeout(500);

 // ⑦ 学会切磋后：徐令仪差距过大拒绝（d=20）；差役可切磋（d=8）
 await near('refuge','xulingyi',-60,4);await pressE();await focus('bi');
 report.checks.ringXuRefuse=await ringState();assert(report.checks.ringXuRefuse.items.some(s=>s.startsWith('比:off:差距过大')));
 await shot('06-spar-refuse-xu','学会切磋后，徐令仪（22 级）差距过大：“比”淡墨，小签“差距过大 · 她不接”');
 await esc();
 await near('refuge','bailiff-refuge',64,4);await pressE();
 report.checks.ringBailiff=await ringState();assert(report.checks.ringBailiff.items.some(s=>s.startsWith('比:normal')));
 await focus('bi');await pressE();await p.waitForSelector('.qn-scroll');await shot('06b-spar-invite-bailiff','差役（10 级）可切磋：普通邀请卷');
 await esc(2);
 report.errors=report.errors.filter(e=>!/favicon/.test(e));
 fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(report,null,1));console.log(JSON.stringify({shots:report.shots.length,errors:report.errors,checks:Object.keys(report.checks)}));
 }catch(e){const p=globalThis.__p;await p.screenshot({path:path.join(require('os').tmpdir(),'qn-fail.png')}).catch(()=>{});console.log('失败时状态',await p.evaluate(()=>JSON.stringify({scene:S.scene,busy,dlgBusy,mode,ring:!!QiheNpcUI.open,near:nearest()?.o?.name,player:[player.x,player.y]})).catch(e=>e.message));throw e}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
