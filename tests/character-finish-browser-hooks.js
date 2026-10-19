/* Read-only observation hooks for the explicit local review. Injected by CUA. */
(()=>{if(!/battleReview=hero|chapterPresentationReview=character-finish/.test(location.search))throw Error('isolated review required');
const report=window.CharacterFinishObservation={started:Date.now(),events:[],flights:[],frames:{},normalBefore:Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.includes('review')&&!k.includes('preview')))};
const old=strike;strike=function(u,t,o){const before={hp:t.hp,shield:t.shield},action=u.anim?.k,elapsed=u.anim?BT.now()-u.anim.t0:null,expected=BFXI.impactMs(u,action||'atk');const result=old.apply(this,arguments);
 if(u.isHero){const i=report.events.length;report.events.push({art:u.art,action,elapsed,expected,weapon:S.weapon,before,after:{hp:t.hp,shield:t.shield}});requestAnimationFrame(()=>requestAnimationFrame(()=>{report.frames[i]=document.getElementById('cv').toDataURL('image/png')}));}return result;};
const flight=VFX.needleFlight;VFX.needleFlight=function(hand,target,ms,bp){report.flights.push({time:BT.now(),flightMs:ms,hand,target:{x:target.x,y:target.y}});return flight.apply(this,arguments);};
report.snapshot=()=>({events:report.events,flights:report.flights,hero:B?.allies[0]?.art,mode,saveKey:saveKey(),normalUnchanged:JSON.stringify(report.normalBefore)===JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([k])=>!k.includes('review')&&!k.includes('preview'))))});
return true;})();
