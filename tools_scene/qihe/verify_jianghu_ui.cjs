// Real UI controller + model, synthetic DOM event/geometry adapter.
// This verifies rendered markup and interaction contracts, NOT browser layout/pixels.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {boot}=require('./harness.cjs');
(async()=>{
 const h=await boot(),{c,run,nodes,node}=h,checks=[];
 const root=node('panel');
 root.contains=()=>true;
 c.document.activeElement=null;
 const query=root.querySelector;
 root.querySelector=sel=>{const el=query(sel);el.isConnected=true;el.focus=()=>{c.document.activeElement=el};return el};
 function check(name,fn){fn();checks.push(name)}
 function markup(){return [root,...nodes.values()].map(n=>n.innerHTML||'').join('\n')}
 function click(action,data={}){const el={dataset:{qj:action,...data},disabled:false,closest(){return this},focus(){c.document.activeElement=this},isConnected:true};root.onclick({target:el,pointerType:'mouse',stopPropagation(){}})}
 function key(key,target={tagName:'BODY'}){const e={key,target,preventDefault(){this.prevented=true},stopImmediatePropagation(){this.stopped=true}};for(const fn of h.events.keydown||[])fn(e);return e}
 function state(){return c.QiheJianghuUI.state()}
 function snapshot(){return run('JSON.stringify(S)')}
 run("S=newState();S.prologue={arrival:{borrowed:true}};S.party=['ye','suzhi'];S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.pts=3;S.st={str:3,con:3,agi:3,wil:3,wis:3};S.bag={bun:3,club:1,cloth:1,charm:1,qh_wild_herb:2};S.skills={fist:1,fuhu:1};mode='scene';busy=false;dlgBusy=false;mnEnsure();S.hp=60;S.mp=30;player.x=S.x;player.y=S.y||0;S.y=player.y;");
 root.hidden=true;
 const inputHandlers=h.events.keydown.length,before=snapshot();
 c.QiheJianghuUI.open();
 check('I 首次打开队伍；位置一致时读取不修改存档',()=>{assert.equal(state().page,'party');assert.equal(snapshot(),before);assert.match(root.innerHTML,/当前出战人物/);assert.equal((root.innerHTML.match(/class="qj-cast-person/g)||[]).length,3)});
 click('page',{id:'bag'});
 check('现有物品位图图集不被通用图标覆盖',()=>{const grid=node('panel .qj-grid').innerHTML;for(const id of ['bun','club','cloth','charm']){const tile=grid.match(new RegExp('data-id=\"'+id+'\"[^>]*>[\\s\\S]*?</button>'))?.[0];assert.ok(tile,'物品格存在：'+id);assert.match(tile,/jm-pxi/);assert.match(tile,/assets\/(?:production\/icons-and-props\/)?i_jianghu.webp/);assert.doesNotMatch(tile,/qj-painted-icon/)}});
 click('category',{id:'装备'});click('slotFilter',{id:'armor'});check('行囊部位筛选排除其他装备',()=>{assert.match(node('panel .qj-grid').innerHTML,/data-id="cloth"/);assert.doesNotMatch(node('panel .qj-grid').innerHTML,/data-id="club"/)});click('resetFilter');
 click('page',{id:'skill'});
 check('已学功法保留正式招式美术，基础操作不计目录',()=>{const html=root.innerHTML;for(const id of ['fuhu']){const card=html.match(new RegExp('data-id=\"'+id+'\"[^>]*>[\\s\\S]*?</button>'))?.[0];assert.ok(card);assert.match(card,/assets\/(?:production\/icons-and-props\/)?i_jianghu.webp/);assert.doesNotMatch(card,/qj-painted-icon/)}});
 check('目录双列入口、搜索、固定运转概览存在且无江湖题字',()=>{assert.match(root.innerHTML,/qj-skill-search/);assert.match(root.innerHTML,/qj-inner-overview/);assert.doesNotMatch(root.innerHTML,/qj-brand/);assert.doesNotMatch(root.innerHTML,/data-qj="catalogSkill" data-id="fist"/)});
 const skillSearch=node('panel #qj-skill-search');skillSearch.value='不存在的功法';skillSearch.oninput();check('搜索空结果清理详情与当前修习',()=>{assert.match(root.innerHTML,/没有匹配的武学/);assert.equal(state().skillId,null);assert.doesNotMatch(node('panel .qj-martial-detail').innerHTML,/<h2>伏虎拳/)});skillSearch.value='伏虎';skillSearch.oninput();check('中文搜索恢复真实目录且不修改存档',()=>{assert.match(root.innerHTML,/data-id="fuhu"/);assert.equal(snapshot(),before)});skillSearch.value='';skillSearch.oninput();click('skillConditions',{id:'fuhu'});check('提升条件读取真实成长门槛',()=>assert.match(node('panel .qj-overlay').innerHTML,/熟练 0 \/ 6/));click('detailClose');
 click('page',{id:'party'});
 click('actor',{id:'ye'});
 check('点击切换人物，仅改变界面对象',()=>{assert.equal(state().actor,'ye');assert.equal(snapshot(),before);assert.match(root.innerHTML,/叶蘅/) });
 click('actor',{id:'hero'});
 check('队伍页取消重复装备栏',()=>assert.doesNotMatch(root.innerHTML,/class="qj-equipment"/));
 click('page',{id:'attr'});check('属性页取消重复装备栏',()=>assert.doesNotMatch(root.innerHTML,/class="qj-equipment"/));
 check('属性页展示全体出战者，切人不改变同屏人数',()=>{assert.equal((root.innerHTML.match(/class="qj-cast-person/g)||[]).length,3);click('actor',{id:'ye'});assert.equal((root.innerHTML.match(/class="qj-cast-person/g)||[]).length,3)});click('actor',{id:'hero'});
 click('page',{id:'equip'});check('装备页数值图标与音律显示，无分组和底部对比区',()=>{assert.match(root.innerHTML,/qj-equip-slots/);assert.match(root.innerHTML,/气血上限/);assert.match(root.innerHTML,/音律/);assert.doesNotMatch(root.innerHTML,/qj-equip-preview|兵刃造诣/);assert.equal((root.innerHTML.match(/qj-numeric-icon/g)||[]).length,24)});click('equipSlot',{slot:'armor'});
 check('空槽位不隐性过滤装备目录',()=>{assert.equal(state().equipCategory,'all');assert.match(node('panel .qj-equip-candidates').innerHTML,/data-id="club"/);assert.match(node('panel .qj-equip-candidates').innerHTML,/data-id="cloth"/)});
 click('equipCategory',{id:'armor'});check('显式护具分类筛选',()=>{assert.match(node('panel .qj-equip-candidates').innerHTML,/data-id="cloth"/);assert.doesNotMatch(node('panel .qj-equip-candidates').innerHTML,/data-id="club"/)});
 click('equipPick',{id:'cloth'});check('单击装备只选择，不出现底部对比或修改存档',()=>{assert.equal(snapshot(),before);assert.equal(state().selected,'cloth');assert.doesNotMatch(root.innerHTML,/qj-equip-preview/)});click('equipCategory',{id:'all'});
 click('page',{id:'bag'});click('item',{id:'bun'});click('itemCommit');
 check('物品选中与确认前不消费',()=>{assert.equal(snapshot(),before);assert.equal(state().confirm,true)});
 click('confirmCancel');check('取消使用不消费',()=>assert.equal(snapshot(),before));
 click('itemCommit');click('confirmAccept');
 check('确认使用一次写入并正确恢复',()=>{assert.equal(run('S.bag.bun'),2);assert.ok(run('S.hp')>60);assert.equal(state().confirm,false)});
 click('category',{id:'装备'});click('item',{id:'club'});click('itemCommit');click('confirmAccept');
 check('换装单次转移且消耗为零清理选中',()=>{assert.equal(run('S.weapon'),'club');assert.equal(run('S.bag.club'),0);assert.equal(state().selected,null)});
 click('page',{id:'party'});click('formation');click('formationRemove',{index:'2'});
 check('編成草稿不提前修改阵容',()=>{assert.equal(run('S.party.length'),2);assert.equal(state().draft.length,2)});
 click('detailClose');click('guardContinue');
 check('继续编辑保留草稿',()=>assert.equal(state().draft.length,2));
 click('formationApply');check('应用编成保存',()=>assert.equal(run('S.party.length'),1));
 click('formation');click('candidate',{id:'hero'});click('formationSlot',{index:'1'});check('剧情锁位不能在草稿中移走',()=>assert.equal(state().draft[0],'hero'));click('candidate',{id:'suzhi'});click('formationSlot',{index:'2'});click('detailClose');click('guardDiscard');
 check('放弃编成不新增出战成员',()=>assert.equal(run('S.party.length'),1));
 click('allocate');click('pointPlus',{id:'str'});
 check('加点显示派生预览但不先写入',()=>{assert.equal(run('S.st.str'),3);assert.match(node('panel .qj-overlay').innerHTML,/气血上限/)});
 click('pointApply');check('加点事务单次生效',()=>{assert.equal(run('S.st.str'),4);assert.equal(run('S.pts'),2)});
 click('page',{id:'skill'});click('basicAttack');click('skillBP',{id:'fist',bp:'3'});check('基本攻击独立可查看并显示 BP 连击',()=>assert.match(node('panel .qj-martial-detail').innerHTML,/4 次攻击/));click('catalogSkill',{id:'fuhu',kind:'active'});const bp0=node('panel .qj-martial-detail').innerHTML;click('skillBP',{id:'fuhu',bp:'3'});const bp3=node('panel .qj-martial-detail').innerHTML;
 check('BP 档位真实改变详情，不消耗资源',()=>{assert.notEqual(bp0,bp3);assert.match(bp3,/威力/)});
 click('skillTab',{id:'inner'});
 check('内功明确锁定（不写阶段名，2026-10-19）',()=>assert.match(root.innerHTML,/暂未开放/));
 click('page',{id:'bag'});click('category',{id:'药食'});check('行囊没有立绘且保留搜索与目标选择',()=>{assert.doesNotMatch(root.innerHTML,/qj-bag-person|qj-person /);assert.match(root.innerHTML,/qj-search/);assert.match(root.innerHTML,/qj-target/)});click('item',{id:'bun'});run('S.hp=1');click('itemCommit');
 const oldSet=c.localStorage.setItem;c.localStorage.setItem=()=>{throw Error('fixture storage denied')};const oldFailure=snapshot();click('confirmAccept');c.localStorage.setItem=oldSet;
 check('存储失败不扣物品，不残留阻挡确认框',()=>{assert.equal(snapshot(),oldFailure);assert.equal(node('panel .qj-overlay').hidden,true);assert.match(node('panel .qj-live').textContent,/fixture storage denied/)});
 run("for(let i=0;i<500;i++){ITEMS['ui_fixture_'+i]={name:'测试物品'+String(i).padStart(3,'0'),desc:'大库存测试',key:true};S.bag['ui_fixture_'+i]=1}");
 click('category',{id:'要物'});
 check('500 项大库存仅渲染可视范围',()=>{const grid=node('panel .qj-grid').innerHTML;assert.ok((grid.match(/class="qj-item /g)||[]).length<80);assert.match(node('panel .qj-bag-count').textContent,/500/)});
 const sc=node('panel .qj-grid-scroll');sc.scrollTop=4800;sc.onscroll();
 check('滚动后渲染后段条目',()=>assert.match(node('panel .qj-grid').innerHTML,/ui_fixture_3/));
 const input=node('panel #qj-search');input.value='测试物品499';input.oninput();check('中文搜索准确且清理旧选中',()=>{assert.match(node('panel .qj-bag-count').textContent,/1 类/);assert.match(node('panel .qj-grid').innerHTML,/ui_fixture_499/);assert.equal(state().selected,null)});
 const sk=key('e',{tagName:'INPUT'});check('输入框快捷键不切页',()=>{assert.equal(state().page,'bag');assert.ok(sk.stopped)});
 click('page',{id:'quest'});/* 2026-10-19 起行记不写阶段名：正在做的主线叫“眼下”，完成的事件按概括名字记入“江湖经历”（updates/2026-10-19-event-titles.md） */check('任务默认进行中，主线为“眼下”且不写阶段名',()=>{assert.match(root.innerHTML,/眼下/);assert.doesNotMatch(root.innerHTML,/开始 · |山村来客|风起栖河/);/* 新版行记只收已承办事项，村中活动做过后才列出 */});
 click('questFilter',{id:'done'});check('完成分类按“江湖经历”记已完成事件',()=>{assert.match(root.innerHTML,/江湖经历/);assert.match(root.innerHTML,/后山遇狼/);assert.match(root.innerHTML,/栖河第一夜/);assert.doesNotMatch(root.innerHTML,/山村来客/)});
 /* 2026-10-10 行记只分“正在进行／已完成”两类（updates/2026-10-10-quest-codex-adoption.md），已无“中止”分类；未知分类回到进行中且不残留已完成条目的详情 */click('questFilter',{id:'closed'});check('未知任务分类回到进行中，不残留旧详情',()=>{assert.equal(state().questFilter,'active');assert.doesNotMatch(root.innerHTML,/事项结果/)});
 click('page',{id:'attr'});click('actor',{id:'ye'});click('formation');click('formationRemove',{index:'1'});click('formationApply');check('换下当前人物后仅主角同屏并回退选中',()=>{assert.equal(state().actor,'hero');assert.equal((root.innerHTML.match(/class="qj-cast-person/g)||[]).length,1)});
 run("S.chapter=2;S.lv=25;S.sect='taihe';S.st={str:10,con:10,agi:10,wil:10,wis:10};S.skills.qh_hulu_staff=3;S.xinfa={known:['tuna','th_xin','th_zuo'],main:'tuna',subs:[],lv:{tuna:2,th_xin:1,th_zuo:1},prog:{tuna:2},unstable:0};S.mp=20;mnEnsure()");
 click('page',{id:'skill'});click('skillTab',{id:'all'});check('护路功法与招式同一条目录，真实内外功共同展示',()=>{assert.equal((root.innerHTML.match(/data-qj="catalogSkill" data-id="qh_hulu_staff"/g)||[]).length,1);assert.match(root.innerHTML,/护路棍法/);assert.match(root.innerHTML,/横杆护身/);/* 2026-10-12 培养改版起 tuna 显示为《吐故纳新篇》（updates/2026-10-12-cultivation-balance.md） */assert.match(root.innerHTML,/吐故纳新篇/)});
 click('innerOverview',{id:'tuna'});check('固定内功区进入配置并切到内功目录',()=>{assert.equal(state().skillTab,'inner');assert.equal(state().skillId,'tuna');assert.match(node('panel .qj-martial-detail').innerHTML,/当前主修/)});
 click('catalogSkill',{id:'th_xin',kind:'inner'});const beforeSwap=snapshot();click('innerMain',{id:'th_xin'});click('confirmCancel');check('主修改修取消不修改内力和配置',()=>assert.equal(snapshot(),beforeSwap));click('innerMain',{id:'th_xin'});click('confirmAccept');check('主修改修确认执行内力清空及三场不稳',()=>{assert.equal(run('S.mp'),0);assert.equal(run('S.xinfa.main'),'th_xin');assert.equal(run('S.xinfa.unstable'),3);assert.match(root.innerHTML,/气脉未稳 3 场/)});
 click('catalogSkill',{id:'th_zuo',kind:'inner'});click('innerSub',{id:'th_zuo'});check('辅修运转更新固定概览且可停止',()=>{assert.equal(run("S.xinfa.subs.includes('th_zuo')"),true);click('innerSub',{id:'th_zuo'});assert.equal(run("S.xinfa.subs.includes('th_zuo')"),false)});
 c.QiheJianghuUI.close();for(let i=0;i<20;i++){root.hidden=true;c.QiheJianghuUI.open();c.QiheJianghuUI.close()}
 check('重复开关 20 次不叠加键盘监听',()=>assert.equal(h.events.keydown.length,inputHandlers));
 const report={kind:'controller-event-contract',browserLayoutVerified:false,passed:checks.length,checks};
 const out=path.join(h.root,'art_sources/qihe-ui-implementation');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'frontend-contract-results.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
