'use strict';
// 门派关系与声誉：表驱动单元测试
const assert=require('assert');
const vm=require('vm');const fs=require('fs');
const ctx=vm.createContext({window:{},console,Array,Object,Map,Set,Number,String,Math,Date});
function load(path){vm.runInContext(fs.readFileSync(path,'utf8'),ctx)}
ctx.isQiheEntry=()=>true;ctx.S={};ctx.toast=()=>{};
load('js/qihe-jianghu-data.js');load('js/qihe-jianghu-rep.js');
const {QiheJianghuData:D,QiheJianghu:J}=ctx.window;

function reset(part='kaishi'){ctx.S={prologue:{part},scene:'test_seg1',segmentId:'test_seg1',bond:{},qiheBond:{},encounteredNpcs:[],flags:{}}}
function clamp(n,lo,hi){return Math.max(lo,Math.min(hi,Math.round(n)))}

console.log('# 规则表：每条规则验证');
reset();J.settle('steal_caught',{npcId:'guanshi',victimIsVillain:false});
assert.strictEqual(ctx.S.jianghu.fame,-2,'偷窃失手扣声誉−2');
reset();J.settle('steal_caught',{npcId:'guanshi',victimIsVillain:true});
assert.strictEqual(ctx.S.jianghu.fame,-1,'偷恶人扣−1');
reset();J.settle('hostile_start',{npcId:'guanshi',byPlayer:true});
assert.strictEqual(ctx.S.jianghu.faction.alliance.score,-5,'敌对开战扣门派−5');
assert.strictEqual(ctx.S.jianghu.fame,-3,'玩家触发扣声誉−3');
reset();J.settle('hostile_start',{npcId:'guanshi',byPlayer:false});
assert.strictEqual(ctx.S.jianghu.fame,0,'NPC触发不扣声誉');
reset();J.settle('hostile_win',{npcId:'guanshi',byPlayer:false});
assert.strictEqual(ctx.S.jianghu.fame,1,'赢敌对战声誉+1');
reset();J.settle('spar_first_win',{npcId:'guanshi'});
assert.strictEqual(ctx.S.jianghu.fame,1,'首胜声誉+1');
reset();J.settle('spar_first_win',{npcId:'guanshi'});J.settle('spar_first_win',{npcId:'guanshi'});
assert.strictEqual(ctx.S.jianghu.fame,1,'同人只算一次');
console.log('✓ 规则表每条都按设计执行');

console.log('\n# 折算：个人→门派四舍五入');
reset();J.settle('bond',{npcId:'guanshi',delta:-10,reason:'test'});
assert.strictEqual(ctx.S.jianghu.faction.alliance.score,-1,'−10÷10=−1');
reset();J.settle('bond',{npcId:'guanshi',delta:-14,reason:'test'});
assert.strictEqual(ctx.S.jianghu.faction.alliance.score,-1,'−14÷10四舍五入−1');
reset();J.settle('bond',{npcId:'guanshi',delta:-15,reason:'test'});
assert.strictEqual(ctx.S.jianghu.faction.alliance.score,-2,'−15÷10四舍五入−2');
reset();J.settle('bond',{npcId:'bandit',delta:-10,reason:'test'});
assert.strictEqual(ctx.S.jianghu.faction.guijintang.score,-1,'喽啰−10÷20四舍五入−1');
reset();J.settle('bond',{npcId:'bandit',delta:-2,reason:'test'});
assert.strictEqual(ctx.S.jianghu.faction.guijintang.score,-1,'负向不足1记−1');
reset();J.settle('bond',{npcId:'guanshi',delta:8,reason:'test'});
assert.strictEqual(ctx.S.jianghu.faction.alliance.score,0,'正向不足1不记');
console.log('✓ 折算四舍五入、负向不足1记−1、正向不足1不记');

console.log('\n# 牵连：对门人失手牵连主事');
reset();J.settle('bond',{npcId:'guanshi',delta:-10,reason:'hostile_win'});
const before=ctx.S.jianghu.faction.alliance.score;
assert.strictEqual(before,-4,'管事−10折入门派−1并牵连主事−3');
assert(ctx.S.jianghu.bossHit['alliance:test_seg1']==='test_seg1','记录主事人牵连');
reset();J.settle('bond',{npcId:'guanshi',delta:-10,reason:'hostile_win'});
J.settle('bond',{npcId:'retainer',delta:-10,reason:'hostile_win'});
assert.strictEqual(ctx.S.jianghu.faction.alliance.score,-1-1-3,'两个门人折−2，只牵连主事一次−3');
console.log('✓ 牵连每段落一次');

console.log('\n# 差役不牵连沈雁回');
reset();J.settle('bond',{npcId:'bailiff',delta:-10,reason:'hostile_win'});
assert.strictEqual(ctx.S.jianghu.faction.patrol.score,-1,'差役折入巡江司');
assert(!ctx.S.jianghu.bossHit['patrol:test_seg1'],'不记录沈雁回');
console.log('✓ 差役 boss:null 不牵连');

console.log('\n# 宋先生不牵连任何势力');
reset();J.settle('bond',{npcId:'song',delta:-10,reason:'test'});
assert.strictEqual(ctx.S.jianghu.faction.alliance?.score||0,0,'不折进正道盟');
console.log('✓ 宋先生 faction:null 不进表');

console.log('\n# 开始部分夹限−10～14、−29～29');
reset('kaishi');ctx.S.jianghu={ver:2,faction:{alliance:{score:10,met:true}},fame:25};
J.settle('bond',{npcId:'guanshi',delta:50,reason:'test'});
assert.strictEqual(ctx.S.jianghu.faction.alliance.score,14,'门派最高14');
J.settle('bond',{npcId:'guanshi',delta:-300,reason:'test'});
assert.strictEqual(ctx.S.jianghu.faction.alliance.score,-10,'门派最低−10');
ctx.S.jianghu.fame=25;for(let i=0;i<10;i++)J.settle('spar_first_win',{npcId:'test'+i});
assert.strictEqual(ctx.S.jianghu.fame,29,'声誉最高29');
ctx.S.jianghu.fame=-25;for(let i=0;i<10;i++)J.settle('steal_caught',{npcId:'test',victimIsVillain:false});
assert.strictEqual(ctx.S.jianghu.fame,-29,'声誉最低−29');
console.log('✓ 开始部分夹限生效');

console.log('\n# 旧档迁移');
reset();ctx.S.jianghu={xia:10,e:3};J.migrate();
assert.strictEqual(ctx.S.jianghu.fame,7,'xia−e迁移到fame');
assert.strictEqual(ctx.S.jianghu.ver,2,'版本号升到2');
reset();ctx.S.jianghu={};J.migrate();
assert.strictEqual(ctx.S.jianghu.fame,0,'缺省fame=0');
assert(ctx.S.jianghu.faction.alliance,'势力表已初始化');
console.log('✓ 旧档迁移不重发事件');

console.log('\n# 档位查询');
reset();ctx.S.jianghu={ver:2,faction:{alliance:{score:-6,met:true}},fame:0};
const g=J.gate('guanshi','trade');
assert.strictEqual(g.ok,false,'厌恶档不交易');
assert.strictEqual(g.why,'faction_hate','返回原因');
ctx.S.jianghu.faction.alliance.score=0;
const g2=J.gate('guanshi','trade');
assert.strictEqual(g2.ok,true,'初识档可交易');
console.log('✓ gate查表正确');

console.log('\n# 价格倍率');
reset();ctx.S.jianghu={ver:2,faction:{alliance:{score:-1,met:true}},fame:0};ctx.S.bond={guanshi:0};
assert.strictEqual(J.priceMul('guanshi'),1.1,'冷淡贵10%');
ctx.S.jianghu.faction.alliance.score=15;
assert.strictEqual(J.priceMul('guanshi'),0.9,'熟络便宜10%');
console.log('✓ priceMul取较差一档');

console.log('\n# 初见好感');
reset();ctx.S.jianghu={ver:2,faction:{alliance:{score:15,met:true}},fame:10};
assert.strictEqual(J.firstMeet('guanshi'),2+2,'熟络+2、侠名有人提起+2');
ctx.S.jianghu.faction.alliance.score=-1;ctx.S.jianghu.fame=-10;
assert.strictEqual(J.firstMeet('guanshi'),-2-2,'冷淡−2、有人嘀咕−2，合计−4');
ctx.S.jianghu.fame=-100;
const clamped=J.firstMeet('guanshi');
assert(clamped>=-10&&clamped<=10,'夹限−10～10');
console.log('✓ firstMeet合并门派与声誉');

console.log('\n# 日志最近60条');
reset('peiyang');for(let i=0;i<70;i++)J.settle('bond',{npcId:'guanshi',delta:-1,reason:'test'+i});
assert.strictEqual(ctx.S.jianghu.log.length,60,'只保留60条');
console.log('✓ 日志限60条');

console.log('\n# 「关系」页：声誉秤杆换算（2026-10-27 整改）');
load('js/qihe-jianghu-rep-ui.js');
const T=ctx.window.QiheJianghuRepUI._test,N=D.FAME_STAGES.length,near=(a,b)=>Math.abs(a-b)<1e-9;
assert(near(T.famePos(-100,'lo'),0)&&near(T.famePos(100,'hi'),100),'两端：−100 在最左、100 在最右');
assert(near(T.famePos(0),50),'0 分“无闻”标记在正中');
assert(T.famePos(-60)<T.famePos(60),'恶在左、侠在右');
let last=-1;for(let v=-100;v<=100;v++){const p=T.famePos(v);assert(p>last,'位置随分数单调增：'+v);last=p;
 const seg=Math.min(N-1,Math.floor(p/(100/N))),asc=D.FAME_STAGES.slice().sort((a,b)=>a.min-b.min),want=asc.findIndex((z,k)=>v>=z.min&&(k===N-1||v<asc[k+1].min));
 assert.strictEqual(seg,want,'标记落在本档那一段：'+v)}
assert(near(T.famePos(D.PART_LIMITS.kaishi.fame[0],'lo'),2/N*100)&&near(T.famePos(D.PART_LIMITS.kaishi.fame[1],'hi'),5/N*100),'开始部分上下限落在段界');
console.log('✓ 标记、刻度、上下限同一套换算');

console.log('\n# 「关系」页：成员档位、称呼、见过');
[[0,'初识'],[12,'初识'],[25,'熟络'],[55,'信赖'],[90,'托付'],[-10,'冷淡'],[-30,'厌恶'],[-60,'仇视']].forEach(([v,n])=>assert.strictEqual(T.memberStage(v).n,n,'个人关系 '+v+' → '+n));
reset();ctx.window.QIHE_NPC_DATA={PEOPLE:{boatman:{name:'船家',role:'东埠小码头'},peddler:{name:'货郎'},aqi:{name:'小耗子'},ye:{name:'叶蘅'},fortune:{name:'算命先生',disguised:true}}};
const town=T.members('qihe');
assert(town.every(m=>!/主事|门人|喽啰/.test(m.r)),'栖河村不用主事／门人／喽啰');
['boatman','peddler','aqi'].forEach(id=>assert(town.some(m=>m.id===id),id+' 列在栖河村'));
assert(!T.members('guijintang').some(m=>m.id==='fortune'),'算命先生揭露前不列');
ctx.S.flags.jianghuLinguanshiRevealed=true;assert(T.members('guijintang').some(m=>m.id==='fortune'),'揭露后列进归烬堂');
reset();J.settle('bond',{npcId:'boatman',delta:-10,reason:'test'});assert.strictEqual(ctx.S.jianghu.faction.qihe.score,-1,'船家折进栖河村');
reset();J.settle('bond',{npcId:'peddler',delta:-10,reason:'test'});J.settle('bond',{npcId:'aqi',delta:-10,reason:'test'});assert.strictEqual(ctx.S.jianghu.faction.qihe?.score||0,-2,'货郎、小耗子折进栖河村（2026-10-27 用户第二十二轮 9）');
reset();assert.strictEqual(T.metOf('ye'),false,'没有记录不算见过');
ctx.S.party=['ye'];assert.strictEqual(T.metOf('ye'),true,'同伴算见过');
ctx.S.qiheBond={aunt:{score:3,gifts:[]}};assert.strictEqual(T.metOf('aunt'),true,'有过个人关系往来算见过');
ctx.S.qiheBond={chen:{score:0,gifts:[]}};assert.strictEqual(T.metOf('chen'),false,'只是查询过（分数 0、无往来）不算');
console.log('✓ 成员档位按个人关系轴、村镇称呼、见过判定');

console.log('\n✅ 全部测试通过');
