// Real battle loop + actual Canvas renderer. This is not browser DOM verification.
const {boot}=require('./harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const {c,run,root,cv,canvas}=await boot(),out=path.join(root,'art_sources/qihe-chapter1-battle-v1/runtime');fs.mkdirSync(out,{recursive:true});
 c.renderCards=()=>{};c.say=async()=>{};
 run("S=newState();S.name='萧白';S.hp=80;S.mp=20;S.prologue=QihePrologue.fresh();S.prologue.arrival.borrowed=true;S.prologue.arrival.stage='done';S.qiheChapter=QiheChapter.initial();S.scene='qh_west';cur=SC.qh_west;buildGrid(cur);spawnWanderers();mode='scene';busy=true;");
 const report={scope:'Local VM real battleLoop + actual Canvas renderer; DOM menus and browser inputs not captured',battles:[],renders:[],missingAssetBlocked:false};
 function capture(kind,b){
  const oldNow=c.performance.now,oldBT=c.BT.now,saved=b.units.map(u=>({...u})),t=c.BT.now();let serial=0;
  const samples=[['idle',80],['dash',60],['atk',50],['atk',160],['atk',260],['atk',440],['atk2',110],['hurt',140],['cast',170],['brk',150],['dead',450],['win',300]];
  try{for(const width of [1280,1920]){
   cv.width=width;cv.height=width*9/16;run(`PXS=${width/960};g.setTransform(PXS,0,0,PXS,0,0)`);
   const contact=canvas.createCanvas(1920,1080),cg=contact.getContext('2d');
   for(let i=0;i<samples.length;i++){
    const [action,elapsed]=samples[i],now=t+ ++serial*1000;c.performance.now=()=>now;c.BT.now=()=>now;
    for(const u of b.units){u.anim={k:action,t0:now-elapsed,hold:true};u.mv=null;u._tr=[];u.dashing=false;u._boT=null;u._tT=null;u.broken=false;u._bT=null;u._dT=null;u._drawn=null;}
    c.drawBattle(now);
    cg.drawImage(cv,(i%4)*480,Math.floor(i/4)*360,480,270);
    cg.fillStyle='#e5dac2';cg.font='20px sans-serif';cg.fillText(action+' '+elapsed+' ms',(i%4)*480+12,Math.floor(i/4)*360+300);
    if(i===0||i===3){const name=`${kind}-${width}-${action}.png`;fs.writeFileSync(path.join(out,name),cv.toBuffer('image/png'));report.renders.push(name)}
   }
   fs.writeFileSync(path.join(out,`${kind}-${width}-actions.png`),contact.toBuffer('image/png'));
  }}finally{c.performance.now=oldNow;c.BT.now=oldBT;for(let i=0;i<saved.length;i++){for(const k of Object.keys(b.units[i]))delete b.units[i][k];Object.assign(b.units[i],saved[i])}cv.width=1280;cv.height=720;run('PXS=4/3;g.setTransform(PXS,0,0,PXS,0,0);CAM.reset(0)')}
 }
 for(const[kind,learned]of[['lesson',false],['road',false],['road',true]]){
  if(learned)c.QiheChapter.grantLesson();const before=run('JSON.stringify(S)');let done=false,result,checked=false,used=false;
  const task=c.QiheChapter.storyBattle(kind).then(r=>{result=r;done=true});const start=Date.now();
  while(!done){if(Date.now()-start>30000)throw Error('timeout '+kind);const b=run('B');if(b?.key){
   if(!checked){assert.equal(b.bg,c.QiheChapterBattleArt.backgrounds[kind]);assert.deepEqual(Array.from(b.foes,u=>u.art),kind==='lesson'?['qh_luheng_v1']:['qh_raider_front_v1','qh_raider_rear_v1']);assert.deepEqual(Array.from(b.allies,u=>u.art),kind==='lesson'?['hero_village']:['hero_village','qh_luheng_v1']);
    for(const u of b.units){const a=c.rt.BFXI.artOf(u);assert.equal(a.file,'b_'+u.art);assert(!a.legacy);assert(Math.abs(c.unitH(u)/u.dscale-105)<.001);for(const action of ['atk','atk2']){const spec=a.anim[action];assert.equal(spec.hit,1);assert.equal(c.rt.BFXI.impactMs(u,action),spec.ms[0])}}
    if(!learned)capture(kind,b);checked=true;
   }
   if(b.tgtList)b.key('ok');else if(b.opt.storyLesson.uiStep==='skill-menu')b.key('n1');else if(b.cur.isHero&&b.cur.mp>=3&&b.cur.skills.includes('qh_hulu_staff')){b.key('n2');used=true}else{b.key('bp');b.key('n1')}
  }await new Promise(r=>setTimeout(r,2))}
  await task;assert.equal(result,'win');assert.equal(run('JSON.stringify(S)'),before);report.battles.push({kind,learned,result,usedSkill:used,correctAssets:true,stateRestored:true});console.log('PASS',kind,learned);
 }
 // Asset failure must stop before battle, not fall back to an old character/map.
 const key='b_qh_raider_rear_v1',im=c.rt.IMG[key],oldLoad=c.loadOpt,before=run('JSON.stringify(S)');delete c.rt.IMG[key];c.loadOpt=async()=>false;
 try{await assert.rejects(()=>c.QiheChapter.storyBattle('road'),/无法载入第一章专用战斗素材/);assert.equal(run('JSON.stringify(S)'),before);assert.equal(run('B'),null);report.missingAssetBlocked=true}finally{c.rt.IMG[key]=im;c.loadOpt=oldLoad}
 fs.writeFileSync(path.join(out,'test.json'),JSON.stringify(report,null,2));console.log('PASS asset failure blocks fallback; renders saved');
})().catch(e=>{console.error(e);process.exitCode=1});
