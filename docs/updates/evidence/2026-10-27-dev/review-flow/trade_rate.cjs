// 临时评审脚本：易物折扣（个人关系熟络九折）与门派价格倍率取较差一档；易物货架里有没有商店货；偷到无 id 物品得到什么
const path=require('path');const {boot}=require(path.resolve(__dirname,'../../../../../tools_scene/qihe/harness.cjs'));
(async()=>{const {c,run}=await boot();
 run(`S=newState();S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.qiheChapter.halfDay=1;S.prologue=QihePrologue.fresh();S.bag={};S.silver=50;S.scene='qihe_trial'`);
 const P=id=>`QIHE_NPC_DATA.PEOPLE.${id}`;
 run(`QiheNpc.bond.raw('innkeeper').score=30`);
 console.log('店家关系：',run(`QiheNpc.bond.get('innkeeper').stage`),' 门派 priceMul =',run(`QiheJianghu.priceMul('innkeeper')`),' 易物 tradeRate =',run(`QiheGift.tradeRate(${P('innkeeper')})`),'（设计：熟络九折 0.9）');
 console.log('店家易物货架：',JSON.stringify(run(`QiheGift.stockOf(${P('innkeeper')})`)),' 店家商店 STARTER_STOCK =',JSON.stringify(run('QiheChapter.starterStock')));
 console.log('货郎易物货架：',JSON.stringify(run(`QiheGift.stockOf(${P('peddler')})`)),' 货郎商店 GOODS =',JSON.stringify(run('QiheTown.GOODS')));
 run(`S.steal={version:1,lv:1,exp:0}`);
 for(const [who,n] of [['innkeeper','火折子'],['chen','麻绳'],['censhuang','燃隙刀'],['apothecary','行诊药囊']]){
  run(`(()=>{const p=${P(who)},it=p.bag.find(x=>x.n==='${n}');window.__b=JSON.stringify(S.bag);window.__s=S.silver;QiheSteal.resolve({npcId:'${who}',item:it,target:{},result:'ok',ruleset:'main',ctx:{mapId:'x'},bond:{},tier:QIHE_STEAL_DATA.TIERS[it.g||'none'],caught:{count:1}})})()`);
  await new Promise(r=>setTimeout(r,10));
  console.log(`偷到 ${who} 的「${n}」：行囊前 ${run('__b')} → 后 ${JSON.stringify(run('S.bag'))}，银两 ${run('__s')}→${run('S.silver')}，已记偷过=${!!run(`S.steal.taken.${who}?.['${n}']`)}`)}
 console.log('偷走店家笼饼后，易物货架仍有：',(run(`(()=>{const p=${P('innkeeper')},it=p.bag.find(x=>x.id==='bun');QiheSteal.resolve({npcId:'innkeeper',item:it,target:{},result:'ok',ruleset:'main',ctx:{mapId:'x'},bond:{},tier:QIHE_STEAL_DATA.TIERS.none,caught:{count:1}});return JSON.stringify(QiheGift.stockOf(p))})()`)));
 console.log('查看页随身物品仍列笼饼：',run(`QiheNpc.bagOf(${P('innkeeper')},{civil:true}).map(x=>x.name).join('、')`));
 console.log('window.morality 存在：',run('typeof window.morality'));
 process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
