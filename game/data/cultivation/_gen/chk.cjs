const J='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/js/';globalThis.window=globalThis;
const V=require(J+'qh-mode-cultivation-visitors.js');const H=V.household;let diff=0;
for(const d of H.definitions.filter(d=>d.src)){const c={footwork:false,fist:false,sword:false,delivery:null,preHangao:{facts:{},route:'life',pei:'new'},opening:{},first_delivery:{},facts:{},learned:{},rel:{},pei:{}};const a=H.script(d.id,c).choices.map(x=>JSON.stringify([x.key,x.effects])).join();const b=V.script(d.id,c).choices.map(x=>JSON.stringify([x.key,x.effects])).join();if(a!==b){diff++;console.log(d.id,a,'\n  ',b);}}
console.log('diff',diff);
