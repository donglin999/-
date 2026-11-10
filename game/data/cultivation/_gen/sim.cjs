// 原版逻辑同策略模拟，用来与 Godot 的 cu_selftest.gd 结果对照
const J='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/js/';globalThis.window=globalThis;
require('./load_web.cjs');
const C=globalThis.CultivationCore;
const S=globalThis.S={bag:{},skills:{},st:{},flags:{}};const s=C.initial();S.cultivation=s;C.syncMode(s);C.join(s);
const plan=['B03','B02','B01','P01','A01','D01','K01'];const D=globalThis.CultivationData;let steps=0,stories=0;const A=id=>D.actions.find(a=>a.id===id);
try{while(s.mode!=='complete'&&steps<4000){steps++;
 if(s.pending){const p=s.pending;if(p.stage==='result')C.closeResult(s);else if(p.visitor){if(p.visitor.phase==='choice')C.visitorChoose(s,0);else C.visitorNext(s);}else C.resolve(s,p.stage==='choice'?0:undefined);}
 else if(s.mode==='journey_ready'){const d=C.dueStory(s);if(d){C.start(s,d.id,{story:true});stories++;}else C.depart(s);}
 else if(s.mode==='journey')C.returnJourney(s);
 else if(s.mode==='story'){const d=C.dueStory(s);if(d){C.start(s,d.id,{story:true});stories++;}else C.completeStory(s,'协同行路');}
 else{s.summary=null;const d=C.dueStory(s);if(d){C.start(s,d.id,{story:true});stories++;}else{let done=false;for(const id of plan)if(!C.availability(s,A(id))){C.start(s,id,{});done=true;break;}if(!done)C.advance(s);}}
 C.reconcileWorld(S);}}catch(e){console.log('错误',steps,s.month,s.phase,e.message);}
console.log(`结束：步数=${steps} 月=${s.month} 期=${s.phase} 模式=${s.mode} 剧情=${stories} 关系=${JSON.stringify(Object.keys(s.relations))}`);
console.log('进度：',JSON.stringify(s.progress));console.log('st=',JSON.stringify(S.st),'party=',JSON.stringify(S.party));
console.log('facts',Object.keys(s.facts).filter(k=>k.endsWith('_seen')).length);
