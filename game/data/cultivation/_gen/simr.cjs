// 随机策略模拟（原版），输出整份养成存档到 /tmp/cu_web_<seed>.json，与 Godot 的 CuSelftest.random 对照
require('./load_web.cjs');const C=globalThis.CultivationCore,D=globalThis.CultivationData;
const seed0=+process.argv[2]||1;let seed=seed0;const R=n=>{seed=(seed*48271)%2147483647;return Math.floor(seed/2147483647*n);};
const S=globalThis.S={bag:{},skills:{},st:{},flags:{}};const s=C.initial();S.cultivation=s;C.syncMode(s);C.join(s);
const pick=arr=>arr[R(arr.length)];let steps=0,log=[];
try{while(s.mode!=='complete'&&steps<6000){steps++;
 if(s.pending){const p=s.pending;if(p.stage==='result')C.closeResult(s);else if(p.visitor){if(p.visitor.phase==='choice')C.visitorChoose(s,R(C.dueStory?globalThis.CultivationVisitors.current(p).choices.length:1));else C.visitorNext(s);}else{const a=D.actions.find(x=>x.id===p.action);C.resolve(s,p.stage==='choice'?R(a.choice.length):undefined);}}
 else if(s.mode==='journey_ready'){const d=C.dueStory(s);if(d)C.start(s,d.id,{story:true});else C.depart(s);}
 else if(s.mode==='journey'){if(R(2))C.visit(s,pick(['gate','street','alley','ferry']));C.returnJourney(s);}
 else if(s.mode==='story'){const d=C.dueStory(s);if(d)C.start(s,d.id,{story:true});else C.completeStory(s,pick(['协同行路','请陆衡指导']));}
 else{s.summary=null;const d=C.dueStory(s);if(d){C.start(s,d.id,{story:true});continue;}
  const un=s.letters.filter(l=>!l.read&&l.due<=C.period(s));if(un.length&&R(2)){C.readLetter(s,un[0].id);continue;}
  const r=R(10);
  if(r<2){const pl=D.actions.filter(a=>a.strollPlace);const res=C.stroll(s,pick(pl).id);if(!res.story&&R(3)===0)C.advance(s);continue;}
  if(r===2){const rs=C.letterRecipients(s);if(rs.length){const o={theme:pick(['近况','问候乡邻','外出准备']),recipient:pick(rs).name};if(!C.availability(s,D.actions.find(a=>a.id==='C01'),o)){C.start(s,'C01',o);continue;}}}
  if(r===3){const rs=C.giftRecipients(s);if(rs.length){const o={theme:'近况',gift:pick(['food','herb','pouch']),recipient:pick(rs).name};if(!C.availability(s,D.actions.find(a=>a.id==='C02'),o)){C.start(s,'C02',o);continue;}}}
  const av=D.actions.filter(a=>!a.once&&!a.strollPlace&&!a.mail&&!a.visitor&&!C.availability(s,a));
  if(av.length&&R(5)){C.start(s,pick(av).id,{});}else C.advance(s);}
 C.reconcileWorld(S);}}catch(e){console.log('错误',steps,s.month,s.phase,e.message);}
require('fs').writeFileSync('/tmp/cu_web_'+seed0+'.json',JSON.stringify({steps,S}));
console.log('web seed',seed0,'steps',steps,s.month,s.phase,s.mode,Object.keys(s.facts).length);
