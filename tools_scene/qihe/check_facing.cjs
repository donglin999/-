'use strict';
// 检查培养 Q 版剧场里人物是否面对面（规范：xiaojianghu/docs/design/dialogue-staging.md「人物朝向」）。
// 用真实的 composition() 排出每句的大立绘站位：左位的人不能朝左、右位的人不能朝右（背对对方）。
// 有朝左版的人（Q.LEFT_READY）站右位时运行时自动换图，按朝左算。
// 剧情需要背对（转身走开、赌气）的台词写 facingAway:true 豁免。
// 用法（工作区根目录）：node tools_scene/qihe/check_facing.cjs [--list]
const path=require('path'),root=path.resolve(__dirname,'../..');
const Q=require(path.join(root,'js/qh-mode-cultivation-story.js')),D=require(path.join(root,'js/qh-pre-hangao-data.js'));
const F=require(path.join(root,'docs/assets/cultivation-actor-facing.json'));
const facing=(id,duoSrc)=>id==='duo'?F.duo[(duoSrc||'').split('/').pop().replace(/\.\w+$/,'')]:F.actors[id];
let total=0;const hits=[],unknown=new Set();
for(const s of D.scenes){
 const lines=[...s.opening,...s.ending,...(s.choices||[]).flatMap(c=>c.lines||[])];
 for(const l of lines){
  if(['title','narrator'].includes(l.speaker)||l.facingAway)continue;
  if(l.duo&&!l.duoCast)continue;                       // 整画面双人图：两人在同一张图里，构图本身决定
  const cast=l.cast||s.cast,inD=a=>!!l.duoCast?.includes(a);
  const fg=Q.composition(l.duoCast?[...cast.filter(a=>!inD(a)),'duo']:cast,inD(l.speaker)?'duo':l.speaker,null).foreground;
  if(fg.length<2)continue;total++;
  for(const id of fg)if(!facing(id,l.duo))unknown.add(id==='duo'?l.duo:id);
  const L=fg[0],R=fg.at(-1),bad=[];
  if(facing(R,l.duo)==='R'&&!Q.LEFT_READY.has(R))bad.push(`${R} 在右位却朝右`);
  if(facing(L,l.duo)==='L')bad.push(`${L} 在左位却朝左`);
  if(bad.length)hits.push({scene:s.id,line:l.id,text:l.text.slice(0,20),bad});
 }
}
const by={};for(const h of hits)for(const b of h.bad)by[b]=(by[b]||0)+1;
console.log(`多人台词 ${total} 句，背对 ${hits.length} 句，涉及 ${new Set(hits.map(h=>h.scene)).size} 场`);
for(const [k,v] of Object.entries(by).sort((a,b)=>b[1]-a[1]))console.log(`  ${k}：${v} 句`);
if(unknown.size)console.log('未登记朝向：',[...unknown].join('、'));
if(process.argv.includes('--list'))for(const h of hits)console.log(h.scene,h.line,h.text,h.bad.join('；'));
process.exitCode=hits.length||unknown.size?1:0;
