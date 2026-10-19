'use strict';
// 战斗手感探针（docs/vfx.md §2、§2.3）：沙箱加载真实 vfx.js 与 bfx.js，量普攻／暴击／各档招式／金针／破势的震屏与顿帧，
// 校验无“低档比高档强”的倒挂；用 battle.js 的 shakeStep 模拟 60/120/144Hz 震屏时长；量击退曲线。
// 用法：node tests/battle-feel-probe.test.cjs
//      FEEL_BEFORE=<目录> node tests/battle-feel-probe.test.cjs   从 <目录>/js 读改动前的 vfx/bfx/battle.js，只打印对照、不断言
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const OLD=process.env.FEEL_BEFORE||'';
const CHANGED=['js/vfx.js','js/bfx.js','js/battle.js'];
const src=f=>fs.readFileSync(OLD&&CHANGED.includes(f)?path.join(OLD,f):f,'utf8');

function sandbox(){
  let clock=1000;const perf={now:()=>clock};
  const stub=new Proxy(function(){},{get:(t,k)=>k==='canvas'?{width:640,height:360}:stub,apply:()=>stub,set:()=>true});
  const ctx={console,Math,performance:perf,setTimeout:()=>0,clearTimeout(){},
    document:{createElement:()=>({width:0,height:0,getContext:()=>stub})},
    B:{shake:0,units:[],parts:[]},IMG:{},ok:()=>false,g:stub,W:960,H:540,
    unitH:()=>150,wait:()=>Promise.resolve(),bsfx(){},floatTxt(){},renderCards(){},rnd:(a,b)=>(a+b)/2};
  ctx.window=ctx;vm.createContext(ctx);
  // 招式表与品阶：core.js 的 SKILLS + battle.js 的补表 + qihe-grades.js（品阶影响档位上限）
  const core=src('js/core.js'),i=core.indexOf('const SKILLS={'),j=core.indexOf('}};',i);
  vm.runInContext(core.slice(i,j+3).replace('const SKILLS=','var SKILLS='),ctx);
  const bat=src('js/battle.js'),k=bat.indexOf('Object.assign(SKILLS,{'),l=bat.indexOf('}});',k);
  vm.runInContext(bat.slice(k,l+4)+';var XINFA={};',ctx);vm.runInContext(src('js/qihe-grades.js'),ctx);
  vm.runInContext(src('js/vfx.js'),ctx);
  vm.runInContext(src('js/bfx.js').replace('return{now,bw,','return{_offOf:(u,t)=>offOf(u,t),now,bw,'),ctx);
  let stops=[];const realStop=ctx.BT.stop.bind(ctx.BT);ctx.BT.stop=ms=>{stops.push(ms);realStop(ms)};
  return{ctx,adv:ms=>{clock+=ms},reset(){ctx.B.shake=0;stops=[];clock+=5000;vm.runInContext("VFX.reset()",ctx)},
    read:()=>({shake:+ctx.B.shake.toFixed(2),stop:stops.length?Math.max(...stops):0})};
}
const S=sandbox(),{ctx}=S,G=n=>vm.runInContext(n,ctx);
const mk=(side,x)=>({side,x,y:400,hp:999,mhp:999,id:side==='foe'?2:1});
const ally=mk('ally',700),foe=mk('foe',300);
// 一次命中 = VFX 命中特效（招式档位预算）+ hurt() 受击保底；震屏取两者大值，顿帧取请求的最大值
function strike({key=null,ty='拳',crit=false,impact,needle=false}){S.reset();foe.hp=999;
  if(needle){ctx.hurt(foe,1,'#fff',crit,'needle_hit_20261012');G("VFX").needleImpact(foe,key,0)}
  else{ctx.hurt(foe,1,'#fff',crit,impact);G("VFX").hit(ally,foe,ty,key,0)}
  return S.read()}
const tierOf=k=>{const b=G("VFX").budget(k,ctx.SKILLS[k]?.mp||0,0);return b.T.name};
const cases=[
  ['普攻（拳）',{},'T0'],['普攻（刀）',{ty:'刀'},'T0'],['敌·撕咬 bite',{key:'bite',ty:'咬'},'T0'],
  ['初叶·银针普攻',{needle:true},'T0'],['初叶·银针暴击',{needle:true,crit:true},'T0·暴击'],
  ['普攻暴击（拳）',{crit:true},'T0·暴击'],
  ['金针刺穴 jinzhen',{key:'jinzhen',ty:'暗器'},'T1'],['伏虎拳 fuhu',{key:'fuhu'},'T1'],['摔碑手 shuaibei',{key:'shuaibei'},'T1'],
  ['柳叶剑法 liuye',{key:'liuye',ty:'剑'},'T2'],['莲花落 lianhua',{key:'lianhua'},'T2'],['刮风脚 guafeng',{key:'guafeng'},'T2'],
  ['鬼头斩 ghost',{key:'ghost',ty:'刀'},'T3'],['鬼头斩暴击',{key:'ghost',ty:'刀',crit:true},'T3·暴击']];
const rows=cases.map(([n,o,band])=>({n,band,tier:o.key?tierOf(o.key):'T0 普攻',...strike(o)}));
S.reset();ctx.doBreak(foe);rows.push({n:'破势（系统）',band:'系统',tier:'系统',...S.read()});
console.log(OLD?'== 改动前':'== 改动后（工作区）');
console.log('招式'.padEnd(18),'档位'.padEnd(8),'震屏峰值'.padStart(8),'顿帧ms'.padStart(8));
for(const r of rows)console.log(r.n.padEnd(18),r.band.padEnd(8),String(r.shake).padStart(8),String(r.stop).padStart(8));

// 震屏时长：从峰值衰减到 0 所需真实时间
const bsrc=src('js/battle.js');let sim;
if(!OLD){const m=bsrc.match(/let shakeLast=0;\nfunction shakeStep\(now\)\{[\s\S]*?\n  B\.shake\*=[^\n]*\}/);assert.ok(m,'shakeStep 未找到');
  sim=(v,hz)=>{const c={B:{shake:v},g:{translate(){}},Math};vm.createContext(c);vm.runInContext(m[0]+';globalThis.step=shakeStep',c);
    const t0=1000;let t=t0;c.step(t);c.B.shake=v;let n=0;while(c.B.shake>0&&n<1e4){t+=1000/hz;c.step(t);n++}return Math.round(t-t0)}}
else sim=(v,hz)=>{let s=v,n=0;while(s>0){s*=.85;if(s<.5)s=0;n++}return Math.round(n*1000/hz)};
console.log('\n震屏时长 ms（峰值 → 0）     60Hz  120Hz  144Hz');
const dur={};for(const v of [2,3,5,8,12,14]){dur[v]=[60,120,144].map(hz=>sim(v,hz));console.log(('峰值 '+v).padEnd(24),dur[v].map(x=>String(x).padStart(6)).join(''))}

// 击退曲线（12px），以 hurt() 记录的 kbT 为准，e 为距受击瞬间的战斗时钟毫秒
S.reset();ctx.hurt(foe,1,'#fff',false);const t0=ctx.BT.now(),kb=e=>+Math.abs(G("BFXI")._offOf(foe,t0+e).x).toFixed(1);
const kbs=[0,10,40,100,160,229,260].map(e=>[e,kb(e)]);
console.log('\n击退位移 px（距受击 ms）',kbs.map(([e,x])=>e+'ms:'+x).join('  '));

if(OLD)process.exit(0);
// ── 断言 ──
const by=n=>rows.find(r=>r.n===n),grp=b=>rows.filter(r=>r.band===b);
const rank=['T0','T1','T2','T3'];
for(let i=1;i<rank.length;i++){const lo=grp(rank[i-1]),hi=grp(rank[i]);
  for(const a of lo)for(const b of hi){assert.ok(a.shake<=b.shake,`震屏倒挂：${a.n}(${a.shake}) > ${b.n}(${b.shake})`);assert.ok(a.stop<=b.stop,`顿帧倒挂：${a.n}(${a.stop}) > ${b.n}(${b.stop})`)}}
assert.ok(by('普攻暴击（拳）').shake<=by('鬼头斩 ghost').shake,'暴击普攻不得压过 T3 鬼头斩');
assert.ok(by('普攻暴击（拳）').shake<=by('鬼头斩暴击').shake);
for(const r of grp('T0'))assert.ok(r.shake<=3,`${r.n} 超出 T0 震屏上限 3`);
assert.equal(by('金针刺穴 jinzhen').stop,45,'金针顿帧 45ms');
assert.ok(by('破势（系统）').stop>=250&&by('破势（系统）').shake===14,'破势保持系统演出');
// 与连续衰减的理论时长 τ·ln(v/0.5)（τ=16.67/−ln0.85≈103ms）相比，每个刷新率下误差不超过该刷新率的一帧
const tau=(1000/60)/-Math.log(.85);
for(const v in dur){const ideal=tau*Math.log(v/.5);[60,120,144].forEach((hz,i)=>assert.ok(dur[v][i]>=ideal-1&&dur[v][i]<=ideal+1000/hz+1,`峰值 ${v} 在 ${hz}Hz 震屏 ${dur[v][i]}ms，理论 ${ideal.toFixed(0)}ms`))}
// 注意 offOf 在 e≥260 时会清掉 kbT，故用上面按时间顺序取好的样本
const K=Object.fromEntries(kbs);
assert.ok(K[0]>=11,'受击瞬间（顿帧定格）已可见后坐');assert.ok(K[10]>=K[0]&&K[10]>=11.9,'约 10ms 达满幅');assert.ok(K[100]<K[40]&&K[160]<K[100]&&K[229]<1&&K[260]===0,'40–260ms 回位');
console.log('\nbattle feel probe: 无档位倒挂、金针顿帧 45ms、震屏时长与刷新率无关、击退快出慢回 OK');
