const{boot}=require('./harness.cjs'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const {c,run,root,events,cv,canvas}=await boot(),report={scope:'Local production pointer handlers, movement controller and interaction promises, synthetic coordinates. Not browser hit-testing/layout.',checks:[],issues:[]};
 c.say=async()=>{};c.choose=async(w,t,opts)=>opts.length-1;c.PrologueDog.play=async()=> 'win';await c.QihePrologue.start(true);
 for(const key of Object.keys(c.QIHE_ROOMS))for(const n of c.npcsOf(c.rt.SC['prologue_'+key])){
  const label=key+'/'+n.id;try{
   await c.QihePrologue.goLocal(key);run('busy=false;dlgBusy=false;keys={};');
   const original=n.act;let done=false,error=null;n.act=async(...a)=>{try{return await original(...a)}catch(e){error=e;throw e}finally{done=true}};
   try{
    const pos=run(`[( ${n.x}*TS-cam.x)*ZOOM*1280/960,(${n.y}*TS-8-cam.y)*ZOOM*720/540]`);
    assert(pos[0]>=0&&pos[0]<1280&&pos[1]>=0&&pos[1]<720,'target not visible from doorway');
    const event={clientX:pos[0],clientY:pos[1],pointerType:'mouse',preventDefault(){},stopImmediatePropagation(){}};
    events['cv:pointerdown'].find(f=>String(f).includes('const[x,y]=toLocal'))(event);
    for(let frame=0;frame<3500&&!done;frame++){
     if(!run('busy')){c.updateScene(50);assert(c.standOk(c.rt.player.x,c.rt.player.y),'controller left walk plane')}
     await new Promise(r=>setTimeout(r,0));
    }
    assert(done,'click never reached interaction');if(error)throw error;await new Promise(r=>setTimeout(r,1));assert.equal(run('busy||dlgBusy'),false,'input not released');assert(c.standOk(c.rt.player.x,c.rt.player.y),'transition landing invalid');
    report.checks.push({name:label,pass:true});console.log('PASS '+label);
   }finally{n.act=original}
  }catch(e){report.issues.push({name:label,error:e.stack});console.log('FAIL '+label+' '+e.message)}
 }
 // Snapshot the modern fixed scene and lodging supporting cast through actual drawScene.
 run("S.prologue.arrival.stage='encounter';S.prologue.arrival.borrowed=false;PXS=4/3;");await c.PrologueBackhill.show();run('g.setTransform(PXS,0,0,PXS,0,0);');c.drawScene(1800);
 const out=path.join(root,'art_sources/qihe-prologue/qa');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'backhill.png'),cv.toBuffer('image/png'));
 await c.QihePrologue.goLocal('clinic_interior');c.PrologueBackhill.clinic();run('g.setTransform(PXS,0,0,PXS,0,0);');c.drawScene(1800);fs.writeFileSync(path.join(out,'lodging-cast.png'),cv.toBuffer('image/png'));
 c.PrologueBackhill.clearClinic();c.PrologueBackhill.release();
 // Staging contract uses actual DialogueStage, not dialogue stubs.
 const token=c.DialogueStage.begin({id:'four-cast-test',cast:[{who:'萧白',sp:'c_hero',slot:'left'},{who:'叶蘅',sp:'c_ye',slot:'right'},{who:'周砚',sp:'c_zhou',slot:'center'},{who:'和尚',sp:'c_monk',slot:'rail'}]});
 c.DialogueStage.enter('和尚','c_monk');const cast=c.DialogueStage.layout();assert.equal(cast.find(a=>a.id==='hero').displaySlot,'left');assert.equal(cast.find(a=>a.id==='ye').displaySlot,'right');assert.equal(cast.find(a=>a.id==='monk').displaySlot,'center');assert.equal(cast.find(a=>a.id==='opening_zhouyan').displaySlot,'rail');c.DialogueStage.end(token);report.checks.push({name:'four character stable left/right/center/rail',pass:true});
 report.status=report.issues.length?'FAIL':'PASS_LOCAL';fs.writeFileSync(path.join(out,'interaction-report.json'),JSON.stringify(report,null,2));if(report.issues.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
