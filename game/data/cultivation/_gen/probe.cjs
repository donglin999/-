// 探测：各剧情脚本读取了 context 的哪些路径
const J='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/js/';
globalThis.window=globalThis;
const V=require(J+'qh-mode-cultivation-visitors.js');
const H=V.household;
function track(obj,path,reads){return new Proxy(obj,{get(t,k){if(typeof k==='symbol')return t[k];const p=path?path+'.'+k:k;const v=t[k];if(v&&typeof v==='object'&&!Array.isArray(v))return track(v,p,reads);reads.add(p);return v;}});}
const ids=V.all().map(d=>d.id);
const out={};
for(const id of ids){const reads=new Set();const base={footwork:false,fist:false,sword:false,delivery:null,preHangao:{facts:{},weapon:null,pei:'new',participants:[],route:'life'},rel:{},adult:false,pei:{chests:null},yinJoined:false,sparWins:0,learned:{footwork:false,fist:false,sword:false},opening:{chen_injury:'unknown'},first_delivery:{method:null},facts:{pre_departure_talk_seen:false,first_ye_work_seen:false},yinScore:0,major:null,go:null,ledger:false};
 try{V.script(id,track(base,'',reads));out[id]=[...reads];}catch(e){out[id]='ERR '+e.message;}}
const all={};for(const r of Object.values(out))if(Array.isArray(r))for(const k of r)all[k]=(all[k]||0)+1;
console.log(Object.keys(out).length);console.log(JSON.stringify(all));
for(const [k,v] of Object.entries(out))if(!Array.isArray(v))console.log(k,v);
