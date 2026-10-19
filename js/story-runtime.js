'use strict';
// ink 剧本运行时（迁移方案 xiaojianghu/docs/design/story-source-migration.md §4.3）
// 剧本原文在 story/**/*.ink，经 tools_story/build_ink.cjs 编译为 js/story-data/<knot>.js（window.STORY_DATA）。
// 本文件只负责“台词从哪来”：逐句取出剧本，交给现有的 line()/choose() 演出；立绘、对话框、换场、存档代码一律不动。
// 用法：await StoryRuntime.play('qihe_lodging', {line, externals:{go_scene:async(...)=>…}, vars:{resuming:true}})
//   line(id, 说话人, 台词, {mood})：场景自己的台词函数（通常是 mark+say）；不给时用全局 say。
//   externals：本场用到的游戏函数实现，可以是 async；未给的通用函数（flag、set_flag、checkpoint、toast、toast_for、mark）用下方默认实现。
//   vars：开演前写入的 ink 参数变量（剧本里写作 VAR x = false // 参数）。
// 2026-10-18 第 2 期补充（向后兼容试点）：
//   - set_flag 仍按剧本顺序排队执行，但排队期间 flag() 读到的是刚写入的值（先写后读不会读到旧值）；
//   - 选择框前那句台词的编号交给本场的 mark（试点时误用了空的默认 mark）；
//   - flag() 遇到 null 也当 false 返回（ink 不接受空值）；新增 vars、toast_for；
//   - 剧本文件里声明过、本场没提供的游戏函数绑成“调用即报错”（名单由构建写入 window.STORY_EXTERNALS）。
window.StoryRuntime=(()=>{
 const has=knot=>!!window.STORY_DATA?.[knot];
 // 存档标记路径 "prologue.arrival.borrowed" → S.prologue.arrival.borrowed
 // 2026-10-19：主线开始前（还没有 S.qiheChapter）剧本写 qiheChapter.* 标记（如路人搭话轮换 qiheChapter.talkCycle），
 // 不能因此建出半截主线状态（会让主线被当成已开始）；这类标记先记在内存里，主线开始后照常写进存档。
 const early={},isEarly=p=>p.startsWith('qiheChapter.')&&typeof S!=='undefined'&&!!S&&!S.qiheChapter;
 const getPath=p=>isEarly(p)?early[p]:p.split('.').reduce((o,k)=>o==null?undefined:o[k],typeof S==='undefined'?undefined:S);
 const setPath=(p,v)=>{if(isEarly(p)){early[p]=v;return}const ks=p.split('.'),last=ks.pop();let o=S;for(const k of ks)o=o[k]??(o[k]={});o[last]=v};
 const defaults={
  flag:p=>{const v=getPath(p);return v==null?false:v},
  set_flag:(p,v)=>{setPath(p,v)},
  checkpoint:()=>{if(typeof save==='function'){S.x=player.x;S.y=player.y;save()}},
  toast:t=>{if(typeof toast==='function')toast(t,2800)},
  toast_for:(t,ms)=>{if(typeof toast==='function')toast(t,ms)},
  mark:()=>{}
 };
 // 只读、无副作用的函数可以让 ink 提前求值；其余都要等到真正执行到那一句
 const LOOKAHEAD_SAFE=new Set(['flag']);
 function parse(text,tags){
  const t=text.trim(),m=t.match(/^([^：【（]{1,12})：(.*)$/s),tag=k=>(tags.find(x=>x.startsWith(k+':'))||'').slice(k.length+1).trim();
  return {who:m?m[1]:'',text:m?m[2]:t.replace(/^【|】$/g,''),id:tag('id'),mood:tag('mood')};
 }
 async function play(knot,{line,externals={},vars={}}={}){
  const data=window.STORY_DATA?.[knot];if(!data)throw Error('剧本未编译或未加载：'+knot+'（运行 node tools_story/build_ink.cjs）');
  const story=new inkjs.Story(data),queue=[],pending=new Map();
  const impl={...defaults,...externals};
  for(const [k,v] of Object.entries(vars))story.variablesState[k]=v;
  // 同一剧本文件里别的 knot 用到、本场没提供的游戏函数也要绑上（inkjs 开演时会检查整份剧本），真被调用到才报错
  for(const name of window.STORY_EXTERNALS||[])if(!impl[name])impl[name]=()=>{throw Error('剧本 '+knot+' 调用了本场没有提供的游戏函数 '+name)};
  // ink 的外部函数是同步调用：有副作用的动作先排队，台词显示前按顺序 await，保证“换场→台词”的先后与剧本一致
  for(const name of Object.keys(impl)){
   story.BindExternalFunction(name,(...a)=>{
    if(name==='flag'){if(pending.has(a[0])){const v=pending.get(a[0]);return v==null?false:v}return impl.flag(...a)}
    if(name==='set_flag'){pending.set(a[0],a[1]);queue.push(async()=>{await impl.set_flag(...a);if(pending.get(a[0])===a[1])pending.delete(a[0])});return null}
    queue.push(()=>impl[name](...a));return null
   },LOOKAHEAD_SAFE.has(name));
  }
  const flush=async()=>{while(queue.length)await queue.shift()()};
  const show=async(l,choices)=>{
   if(choices){const i=await choose(l.who,l.text,choices.map(c=>c.text));return i}
   if(line)return line(l.id,l.who,l.text,{mood:l.mood});return say(l.who,l.text);
  };
  story.ChoosePathString(knot);
  while(true){
   while(story.canContinue){
    const text=story.Continue();await flush();
    if(!text.trim())continue;
    const l=parse(text,story.currentTags||[]);
    // 选项前的最后一句就是选择框里的提问
    if(!story.canContinue&&story.currentChoices.length){if(l.id)impl.mark(l.id);story.ChooseChoiceIndex(await show(l,story.currentChoices));continue}
    await show(l);
   }
   await flush();
   if(!story.currentChoices.length)break;
   story.ChooseChoiceIndex(await choose('',' ',story.currentChoices.map(c=>c.text)));
  }
 }
 return {has,play};
})();
