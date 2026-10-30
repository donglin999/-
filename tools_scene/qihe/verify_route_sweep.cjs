// 2026-10-30 开始部分全路线扫描：宋先生线、蔺管事线、对证说不说、救谁的组合，从主线走到进培养，不许报错或卡住。函数测试，不代替浏览器验收。
const {boot}=require('./harness.cjs'),assert=require('node:assert/strict');
(async()=>{const {c,run}=await boot();c.Cultivation.start=()=>{};/* 领队交锋（2026-10-13 起插在起火前，updates/2026-10-13-faction-clash.md）是独立战斗演出，要真实解码动作表，本测试环境的 Image 是空壳；与 verify_chapter 一样跳过演出，只测剧情流程 */c.QiheFactionClash.play=async()=>'stopped';let lines=[],decisions=[];
// 2026-10-17 主线改为找人推进：自由走访阶段找当前主线人物、选【主线】并确认；其他阶段仍走 rest()。
const advanceMain=async()=>{const m=c.QiheChapter.mainStep?.();return m?c.QiheChapter.interact(m.npc):c.QiheChapter.rest()};
c.say=async(w,t)=>{lines.push({w,t,scene:run('S.scene')})};c.choose=async(w,t,opts)=>{const n=decisions.length?decisions.shift():0;assert(n<opts.length,t);return n};c.battle=async()=>'win';const shots=[];const play=c.QiheFireCinematic.play;c.QiheFireCinematic.play=async(id,rows)=>{shots.push(id);return play(id,rows)};
function fresh(){run("S=newState();S.name='萧白';S.aqiTeach={wage:1};/* 2026-10-30 小耗子一课排在主线前（qihe-aqi.js），这里跳过 */S.hp=80;S.mp=20;S.prologue=QihePrologue.fresh();S.prologue.arrival={version:1,stage:'done',borrowed:true,originExpression:'A',greeted:{}};S.prologue.rested=true;S.prologue.relicSeen=true;S.scene='qihe_trial';cur=SC.qihe_trial;buildGrid(cur);spawnWanderers();mode='scene';busy=false;dlgBusy=false;keys={};");lines=[];decisions=[]}
const node=(scene,id)=>run(`npcsOf(SC.${scene}).find(n=>n.id===${JSON.stringify(id)})||null`);

const p=()=>c.QiheChapter.state();
const combos=[];
for(const deal of [null,'declined','accepted','asked_first'])for(const broken of [false,true])for(const told of [0,1])for(const ending of ['none','noticed','blade'])for(const rescue of [0,1]){
 if(!deal&&(broken||told))continue; if(deal==='declined'&&(broken||told))continue; if(broken&&ending==='blade')continue; if(!deal&&ending==='blade')continue;
 combos.push({deal,broken,told,ending,rescue});}
let bad=0,ok=0,errs={},tally={};const orig=console.error;
for(const k of combos){
 fresh();await c.QiheChapter.begin();run('S.aqiTeach={wage:1}');Object.assign(p(),{stage:'days',halfDay:0});
 const r=p().records||(p().records={});if(k.deal){r.stranger_deal=k.deal;r.basket=true}
 if(k.broken)run("S.qiheSong=Object.assign(S.qiheSong||{},{broken:true,brokenAt:1})");
 if(k.ending!=='none'){r.lamp=Object.assign(r.lamp||{},{met:true,taught:true});if(k.ending==='blade')Object.assign(r.lamp,{hidden_watch:true,seal:'seen',porter_seen:true,deduce:'ok',handoff:'blade_order'});r.stranger_report=r.stranger_report||'partial'}
 let captured=null;console.error=(...a)=>{captured=a.map(String).join(' ').slice(0,200)};
 lines=[];let tick=0;decisions=[];
 c.choose=async(w,t,opts)=>{tick++;if(/说|宋|外乡/.test(t+opts.join(''))&&opts.some(o=>/说出|宋/.test(o))){const i=opts.findIndex(o=>/说出|宋/.test(o));return k.told?Math.max(i,0):(i===0?1:0)}return 0};
 try{let guard=0;while(p().stage==='days'&&guard++<8){await advanceMain();if(captured)break}
  guard=0;while(['refuge','mountain'].includes(p().stage)&&guard++<8){await c.QiheChapter.routes();if(captured)break}
  const good=['cultivation','ended'].includes(p().stage)&&!captured;
  const got=p().records.lamp?.ending||'无';tally[got]=(tally[got]||0)+1;if(shots.at(-1)==='rope')tally.红绳=(tally.红绳||0)+1;if(run('S.bag.qh_shouzhu_jing')>0)tally.赏书=(tally.赏书||0)+1;if(k.ending==='blade'&&k.deal!=='declined'&&got!=='blade')tally.完美未中=(tally.完美未中||0)+1;shots.length=0;
  if(good)ok++;else{bad++;const key=captured||('停在 '+p().stage+' half='+p().halfDay);(errs[key]=errs[key]||[]).push(JSON.stringify(k))}
 }catch(e){bad++;const key='抛错 '+String(e.message).slice(0,160);(errs[key]=errs[key]||[]).push(JSON.stringify(k))}
 console.error=orig;
}
console.log('组合',combos.length,'通',ok,'不通',bad,JSON.stringify(tally));for(const[k,v]of Object.entries(errs))console.log(k,'\n  x'+v.length,v.slice(0,3).join(' '));
process.exit(bad?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
