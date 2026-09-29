const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const vm=require('node:vm');

function harness(hash='#xiangyang'){
  const menus=[],picks=[],spoken=[],shops=[];
  const state={bag:{},flags:{},npcArts:{}};
  const context=vm.createContext({
    S:state,SC:{street:{npcs:[]}},location:{hash},
    reviewStart(){},
    async choose(_name,_prompt,options){menus.push(options);const label=picks.shift()||'告辞';const index=options.indexOf(label);assert.notEqual(index,-1,`missing ${label}`);return index},
    async talk(_npc,...lines){spoken.push(...lines)},
    async shop(_npc,items){shops.push(items)},
    async giveItem(item){state.bag[item]=(state.bag[item]||0)+1},
    hud(){},
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../js/npc-actions.js'),'utf8')+
    '\nglobalThis.actionsFor=npcAvailableActions;',context);
  return{context,state,menus,picks,spoken,shops,npc:context.SC.street.npcs[0]};
}

test('sample NPC exists only in Xiangyang slice and gained art is available',()=>{
  const h=harness();
  assert.equal(h.npc.show(),true);
  h.context.reviewStart();
  assert.equal(h.state.npcArts.inquire,1);
  const old=harness('#street');
  old.context.reviewStart();
  assert.equal(old.npc.show(),false);
  assert.equal(old.state.npcArts.inquire,undefined);
});

test('actions refresh after one-time reward and inquiry, with no repeat grant',async()=>{
  const h=harness();h.context.reviewStart();
  h.picks.push('帮忙试配一剂药','打探 · 药包的来路','告辞');
  await h.npc.act(h.npc);
  assert.equal(h.state.bag.pill,1);
  assert.equal(h.menus[0].includes('买卖药材'),true);
  assert.equal(h.menus[0].includes('打探 · 药包的来路'),true);
  assert.equal(h.menus[1].includes('帮忙试配一剂药'),false);
  assert.equal(h.menus[2].includes('打探 · 药包的来路'),false);
  assert.equal(h.menus[2].includes('核对渡口传闻'),true);
  await h.npc.act(h.npc);
  assert.equal(h.state.bag.pill,1);
});

test('service is composed with dialogue and hidden art stays hidden when unlearned',async()=>{
  const h=harness();
  h.picks.push('买卖药材','告辞');
  await h.npc.act(h.npc);
  assert.equal(h.shops.length,1);
  assert.equal(h.menus[0].includes('闲谈'),true);
  assert.equal(h.menus[0].includes('打探 · 药包的来路'),false);
});
