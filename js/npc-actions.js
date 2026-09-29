'use strict';
// NPC 的选项按模块组合；行动完成后重新计算条件，不缓存旧菜单。
const NPC_ACTION_GROUPS=['base','services','events','arts'];
function npcArtLevel(id){return Number(S.npcArts?.[id]||0)}
function npcAvailableActions(spec,n){
  const actions=[];
  for(const group of NPC_ACTION_GROUPS)for(const a of spec[group]||[]){
    if(a.art&&npcArtLevel(a.art)<(a.level||1))continue;
    if(a.when&&!a.when(S,n))continue;
    actions.push(a);
  }
  return actions;
}
async function npcActionMenu(n,spec){
  while(true){
    const actions=npcAvailableActions(spec,n);
    const pick=await choose(n.name,spec.prompt||'想做什么？',
      [...actions.map(a=>a.label),'告辞'],n.sp);
    if(pick<0||pick>=actions.length)return;
    await actions[pick].run(S,n);
    hud();
  }
}

// 只在 #xiangyang 测试入口开放；不会改变 #street 既有 NPC、任务与存档流程。
const npcSliceReviewStart=reviewStart;
reviewStart=function(){
  npcSliceReviewStart();
  if(location.hash==='#xiangyang')S.npcArts={...(S.npcArts||{}),inquire:1};
};
SC.street.npcs.push({
  id:'slice_herbalist',name:'城南铁铺伙计',sp:'c_merchant',x:23.8,y:34.9,dir:'d',verb:'交谈',
  show:()=>location.hash==='#xiangyang',
  async act(n){await npcActionMenu(n,{
    prompt:'铁铺伙计正拣着药材。',
    base:[{id:'talk',label:'闲谈',run:async()=>talk(n,'老周一倒下，街上的人都来问解毒药。苏姑娘正在看他的脉象。')}],
    services:[{id:'shop',label:'买卖药材',run:async()=>{await shop(n,['pill','bun','wine'])}}],
    events:[
      {id:'make',label:'帮忙试配一剂药',when:s=>!s.flags.npc_sample_made,
        run:async s=>{s.flags.npc_sample_made=1;await talk(n,'多谢搭手。这瓶金创药拿去，以后有伤用得上。');await giveItem('pill')}},
      {id:'ask',label:'核对渡口传闻',when:s=>!!s.flags.npc_sample_rumor,
        run:async()=>talk(n,'是东津渡来的药包。我只见到封绳，没见到送药的人。')}
    ],
    arts:[{id:'inquire',art:'inquire',label:'打探 · 药包的来路',when:s=>!s.flags.npc_sample_rumor,
      run:async s=>{s.flags.npc_sample_rumor=1;await talk(n,'听来送药的人提过东津渡。你可以再问我药包的样子。')}}]
  })}
});
