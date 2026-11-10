// 生成 game/data/cultivation/scripts.json：原版 CultivationVisitors.script(id, context) 的决策表。
// 原版剧情脚本是 JS 函数（按 context 分支拼台词）。这里在 node 里直接跑原版函数，
// 用 Proxy 记录每段剧情读到的 context 路径，按路径的取值域穷举，得到“取值组合 → 脚本”的表；Godot 端按同样的 context 查表。
// 用法：node gen_scripts.cjs （只读原版目录）
const fs=require('fs'),path=require('path');
const J='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/js/';
globalThis.window=globalThis;
const V=require(J+'qh-mode-cultivation-visitors.js');
const ids=V.all().map(d=>d.id);
const DELIV=[null,'guided_footwork','assisted_carry','asked_for_guidance'];
const base=()=>({footwork:false,fist:false,sword:false,delivery:null,preHangao:{facts:{},weapon:null,pei:'new',participants:[],route:'life'},rel:{},adult:false,pei:{chests:null},yinJoined:false,sparWins:0,learned:{footwork:false,fist:false,sword:false},opening:{chen_injury:'unknown'},first_delivery:{method:null},facts:{pre_departure_talk_seen:false,first_ye_work_seen:false},yinScore:0,major:null,go:null,ledger:false});
// 每段剧情的选项键（facts.X_choice 的取值域）
const choiceKeys={};for(const id of ids){try{choiceKeys[id]=V.script(id,base()).choices.map(c=>c.key);}catch(e){choiceKeys[id]=[];}}
const SRC=fs.readdirSync(J).filter(f=>/cultivation|hangao|pei-/.test(f)&&f.endsWith('.js')).map(f=>fs.readFileSync(J+f,'utf8')).join('\n');
function numCuts(leaf){const re=new RegExp('\\b'+leaf.replace(/[.$]/g,'\\$&')+'\\s*(?:\\|\\|0)?\\)?\\s*(>=|<=|>|<|===|!==)\\s*(\\d+)','g');const set=new Set([0]);let m;
 // 关系阈值写在 {who,min} 字面量里（REL_ALT／CHOICE_NEED），全部收作切点
 if(/^(rel\.|yinScore)/.test(leaf)||true){const re2=/\bmin:(\d+)/g;let k;while((k=re2.exec(SRC))){const n=+k[1];set.add(n);set.add(n-1);}}
 while((m=re.exec(SRC))){const n=+m[2];set.add(n);set.add(n+1);if(n>0)set.add(n-1);}return [...set].sort((a,b)=>a-b);}
function strValues(leaf){const re=new RegExp('\\b'+leaf.replace(/[.$]/g,'\\$&')+"\\s*(?:===|!==)\\s*'([^']+)'",'g');const set=new Set();let m;while((m=re.exec(SRC)))set.add(m[1]);
 const re2=new RegExp("'([^']+)'\\s*(?:===|!==)\\s*(?:c\\.)?"+leaf.replace(/[.$]/g,'\\$&'),'g');while((m=re2.exec(SRC)))set.add(m[1]);return [...set];}
function domain(p){const leaf=p.split('.').pop();
 if(['delivery','first_delivery.method'].includes(p))return DELIV;
 if(p==='opening.chen_injury')return ['unknown','light','rest'];
 if(p==='preHangao.route')return ['life','sword','fist'];
 if(p==='preHangao.pei')return ['new','known','close'];
 if(p==='preHangao.weapon')return [null,'ready'];
 if(p==='major')return [null,'sword','fist','both'];
 if(p==='go')return [null,...choiceKeys.gy_go_in_stead];
 if(p==='pei.chests')return [null,...(choiceKeys.gn_chests||[]),...strValues('chests')].filter((v,i,a)=>a.indexOf(v)===i);
 if(['yinScore','sparWins'].includes(p)||p.startsWith('rel.'))return {num:numCuts(leaf)};
 if(p.startsWith('preHangao.facts.')){const k=p.slice(16);const m=k.match(/^(.*)_choice$/);if(m)return [undefined,...new Set([...(choiceKeys[m[1]]||[]),...strValues(k)])];
  const sv=strValues(k);if(sv.length)return [undefined,...sv];return [undefined,true];}
 if(p==='preHangao.participants')return null;
 return [false,true];}
function setPath(o,p,v){const a=p.split('.');let t=o;for(const k of a.slice(0,-1))t=t[k]||={};t[a.at(-1)]=v;}
function run(id,assign){const reads=new Set();const c=base();for(const[p,v]of Object.entries(assign))setPath(c,p,v);
 const track=(obj,pp)=>new Proxy(obj,{get(t,k){if(typeof k==='symbol')return t[k];const p=pp?pp+'.'+k:k;const v=t[k];if(v&&typeof v==='object'&&!Array.isArray(v))return track(v,p);reads.add(p);return v;}});
 const out=V.script(id,track(c,''));return {out,reads};}
// 剪枝：随机背景下改变某变量看结果是否变化；不影响结果的变量不进表（查不到时 Godot 端按缺省值处理）。
let seed=12345;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const vals=p=>{const d=domain(p);return d.num?d.num:d;};
function relevant(id,vars){const keep=new Set();
 for(let t=0;t<200;t++){const bg={};for(const p of vars){const v=vals(p);bg[p]=t===0?v[0]:v[Math.floor(rnd()*v.length)];}
  for(const p of vars){if(keep.has(p))continue;let ref=null;for(const v of vals(p)){const js=JSON.stringify(run(id,{...bg,[p]:v}).out);if(ref===null)ref=js;else if(js!==ref){keep.add(p);break;}}}}
 return vars.filter(p=>keep.has(p));}
const result={};let total=0;
for(const id of ids){let vars=[];let guard=0;
 while(guard++<8){const nv=new Set();
  // 先收集可能读到的变量（随机赋值多跑几次）
  for(let t=0;t<60;t++){const a={};for(const p of vars){const v=vals(p);a[p]=v[Math.floor(rnd()*v.length)];}for(const r of run(id,a).reads)if(!vars.includes(r)&&domain(r))nv.add(r);}
  if(!nv.size)break;vars=[...vars,...nv];}
 const rel=relevant(id,vars);
 const combos=rel.map(vals).reduce((acc,d)=>acc.flatMap(a=>d.map(v=>[...a,v])),[[]]);
 if(combos.length>50000){console.error('组合过多',id,rel,combos.length);process.exit(1);}
 const seen=new Map(),table={};
 for(const combo of combos){const assign={};rel.forEach((p,i)=>assign[p]=combo[i]);const js=JSON.stringify(run(id,assign).out);if(!seen.has(js))seen.set(js,seen.size);table[combo.map((v,i)=>vals(rel[i]).indexOf(v)).join(',')]=seen.get(js);}
 result[id]={vars:rel.map(p=>{const d=domain(p);return d.num?{path:p,num:d.num}:{path:p,values:d.map(v=>v===undefined?'__undef':v)};}),table,scripts:[...seen.keys()].map(s=>JSON.parse(s))};total+=seen.size;}
const outp=path.join(__dirname,'..','scripts.json');fs.writeFileSync(outp,JSON.stringify(result));
console.log('剧情',Object.keys(result).length,'脚本版本',total,'字节',fs.statSync(outp).size);
