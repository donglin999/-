'use strict';
// Run with: node tests/battle-error-regression.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const source=fs.readFileSync(path.join(__dirname,'../js/battle.js'),'utf8');

async function run(outcome){
  const elements={};
  const element=id=>elements[id]??(elements[id]={hidden:false,style:{display:''},textContent:''});
  const initial={hp:73,mp:12,exp:40,silver:18};
  const S={...initial,scene:'street',party:[],bag:{bun:2},lv:1};
  const calls={victory:0,loseText:0,fleeText:0,hud:0,toast:[]};
  const context=vm.createContext({
    SKILLS:{},window:{},IMG:{p_hero:{}},PORTS:[],EXPR:{},S,mode:'scene',
    $:element,ok:()=>true,loadOpt:async()=>{},wait:async()=>{},
    derived:()=>({mhp:100,mmp:30}),clamp:(v,min,max)=>Math.max(min,Math.min(max,v)),
    fade:async fn=>fn(),hud:()=>{calls.hud++},
    toast:async message=>{calls.toast.push(message)},
    performance:{now:()=>1},console:{error:()=>{}},addEventListener:()=>{},
    VFX:{reset:()=>{}},Math,Set,Map,
  });
  vm.runInContext(source,context,{filename:'battle.js'});
  const failure=new Error('injected battle failure');
  context.__failure=failure;
  context.__calls=calls;
  context.__battleElement=element('bt');
  vm.runInContext(`
    battleDom=()=>__battleElement;
    mkHero=()=>({hp:48,mp:4,side:'ally'});
    mkFoe=()=>({hp:1,side:'foe'});
    layoutUnits=()=>{};
    newJit=()=>{};
    renderCards=()=>{};
    bigText=async(t)=>{if(t==='败')__calls.loseText++;else __calls.fleeText++};
    victory=async()=>{__calls.victory++;S.exp+=25;S.silver+=8};
    battleLoop=async()=>{if(${JSON.stringify(outcome)}==='error'){S.bag.bun=1;throw __failure}return ${JSON.stringify(outcome)}};
  `,context);
  let result,error;
  try{result=await vm.runInContext('battle({foes:[{}],noLose:true})',context)}catch(e){error=e}
  if(outcome==='error'){
    assert.equal(error,failure,'异常必须传给调用方，中断后续剧情');
    assert.deepEqual({hp:S.hp,mp:S.mp,exp:S.exp,silver:S.silver},initial,'异常不得扣血或发奖励');
    assert.equal(S.bag.bun,2,'异常不得消耗战斗道具');
    assert.equal(calls.victory,0);
    assert.deepEqual(calls.toast,['战斗发生错误，请重试']);
  }else if(outcome==='win'){
    assert.equal(result,'win');assert.equal(calls.victory,1);
    assert.equal(S.exp,65);assert.equal(S.silver,26);
  }else{
    assert.equal(result,'lose');assert.equal(calls.victory,0);
    assert.equal(calls.loseText,1);assert.equal(S.exp,40);assert.equal(S.silver,18);
  }
  assert.equal(vm.runInContext('mode',context),'scene');
  assert.equal(vm.runInContext('B',context),null);
  assert.equal(element('bt').hidden,true);
  assert.equal(element('tpad').style.display,'');
  assert.equal(element('bt-cmd').hidden,true);
  assert.ok(calls.hud>0);
}

async function wrapperRegression(){
  const menu=fs.readFileSync(path.join(__dirname,'../js/menu.js'),'utf8');
  const pets=fs.readFileSync(path.join(__dirname,'../js/pets.js'),'utf8');
  const menuWrapper=menu.slice(menu.indexOf('const mnBattle0=battle;'),menu.indexOf('// ───────── 武学养成'));
  const petWrapper=pets.slice(pets.indexOf('const petBattle0=battle;'));
  const error=new Error('injected combat exception');
  const stats={settle:0,saves:0};
  const S={lv:2,mates:{ye:{hp:77,mp:35}},pets:{dog:{hp:62,mp:19}},virtue:{yong:5}};
  const ctx=vm.createContext({S,console,SKILLS:{},toast:async()=>{},setTimeout:()=>{},
    mnSettle:()=>{stats.settle++;return[]},mnEnsure:()=>{},mnDimEnsure:()=>{},
    save:()=>{stats.saves++},__error:error});
  vm.runInContext(`
    let mnLive=[],mnProfLog={},mnZyLog={},mnSettled=false,petLive=null;
    async function battle(){
      mnLive.push(['ye',{hp:1,mp:0,mhp:100}]);
      petLive={key:'dog',hp:1,mp:0,mhp:100,mmp:40};
      throw __error;
    }
  `,ctx);
  vm.runInContext(menuWrapper,ctx,{filename:'menu-battle-wrapper.js'});
  vm.runInContext(petWrapper,ctx,{filename:'pet-battle-wrapper.js'});
  await assert.rejects(vm.runInContext('battle({})',ctx),e=>e===error);
  assert.equal(stats.settle,0,'异常不得结算武学熟练');
  assert.equal(stats.saves,0,'异常不得持久化宠物残血');
  assert.deepEqual(S.mates,{ye:{hp:77,mp:35}},'异常不得写回同伴残血');
  assert.deepEqual(S.pets,{dog:{hp:62,mp:19}},'异常不得写回宠物残血');
}

(async()=>{
  for(const outcome of ['win','lose','error'])await run(outcome);
  await wrapperRegression();
  process.stdout.write('battle regression: win, lose, injected error, companion/pet rollback OK\n');
})().catch(e=>{console.error(e);process.exitCode=1});
