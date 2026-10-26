'use strict';
// Explicit battle entry with its own save slot; ordinary play never enters here.
(()=>{
 if(!isQiheBattleReview())return;
 const start=qiheTrialStart,kind=new URLSearchParams(location.search).get('battleReview');
 const recorder=document.createElement('button');recorder.id='battle-sfx-record';recorder.textContent='记录战斗音效';
 recorder.style.cssText='position:fixed;right:8px;bottom:8px;z-index:900;font-size:12px;opacity:.65';
 let recording=false;recorder.onclick=()=>{if(!recording){recording=!!window.__audio?.beginSfxCapture();recorder.textContent='下载音效记录'}else{
  const data=window.__audio?.endSfxCapture();recording=false;recorder.textContent='记录战斗音效';if(!data)return;
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='qihe-battle-sfx.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}};
 if(kind!=='clash'&&kind!=='hero')document.body.appendChild(recorder);
 if(kind==='ye'&&new URLSearchParams(location.search).get('poseReview')==='1'){
  const panel=document.createElement('div');panel.id='ye-pose-review';panel.style.cssText='position:fixed;left:6px;top:6px;z-index:901;background:#171b20e8;padding:5px;color:#eee;font-size:12px';
  panel.append('叶蘅动作检查 · ');
  for(const [k,label] of Object.entries({idle:'待机',dash:'移动',atk:'出针',atk2:'快甩',cast:'凝神',needle_skill:'金针',hurt:'受伤',brk:'破势',dead:'倒地',win:'胜利'})){
   const b=document.createElement('button');b.textContent=label;b.onclick=()=>{const u=B?.allies.find(u=>u.art==='ye_initial');if(!u||B.auto)return;const spec=BART.ye_initial.anim[k];
    const i=k==='dash'?0:k==='dead'?spec.f.length-1:spec.projectile?.release??0;BFXI.act(u,k,true);u._reviewFrame=spec.f[i];};panel.appendChild(b);
  }
  document.body.appendChild(panel);
  document.addEventListener('click',e=>{if(e.target.closest?.('#bt-auto'))for(const u of B?.allies||[]){delete u._reviewFrame;u.anim=null;}},true);
 }
 // 2026-10-23 差役战斗表采用验收：?battleReview=bailiff 单挑差役（切磋系统未开发前的唯一入口），可加 poseReview=1 逐个看动作。
 if(kind==='bailiff'&&new URLSearchParams(location.search).get('poseReview')==='1'){
  const panel=document.createElement('div');panel.id='bailiff-pose-review';panel.style.cssText='position:fixed;left:6px;top:6px;z-index:901;background:#171b20e8;padding:5px;color:#eee;font-size:12px';
  panel.append('差役动作检查 · ');
  for(const [k,label] of Object.entries({idle:'待机',dash:'移动',atk:'下劈',atk2:'直戳',cast:'横杆护身',hurt:'受击',brk:'破势',dead:'倒地',win:'收势'})){
   const b=document.createElement('button');b.textContent=label;b.dataset.anim=k;b.onclick=()=>{const u=B?.foes.find(u=>u.art==='qh_bailiff');if(!u)return;const spec=BART.qh_bailiff.anim[k];
    const i=k==='dash'?0:k==='dead'?spec.f.length-1:spec.hit??0;BFXI.act(u,k,true);u._reviewFrame=spec.f[i];};panel.appendChild(b);
  }
  document.body.appendChild(panel);
 }
 window.qiheTrialStart=async function(){
  S=newState();S.name='萧白';S.prologue=QihePrologue.fresh();
  S.prologue.arrival.stage='done';S.prologue.arrival.borrowed=true;
  S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';
  S.scene=kind==='clash'?'qh_east':'qh_west';S.x=SC[S.scene].start[0]*TS;S.y=SC[S.scene].start[1]*TS;
  S.party=[];S.pet=null;S.bag={bun:5,pill:3};
  QiheChapter.grantLesson();const d=derived();S.hp=d.mhp;S.mp=d.mmp;save();
  await start();busy=true;keys={};player.path=null;
  document.title='小江湖 · '+(kind==='road'?'药车守路战':'陆衡对练')+'试用';
  try{if(kind==='hero'){document.title='小江湖 · 主角多武器独立试玩';await HeroMultiweaponReview.play()}else if(kind==='clash'){document.title='小江湖 · 第一章领队交锋';if(new URLSearchParams(location.search).get('tail')==='1'){S.qiheChapter.stage='fire';S.qiheChapter.halfDay=6;S.qiheChapter.events['xu-meeting']=true;S.qiheChapter.events['three-meeting']=true;busy=false;await QiheChapter.resume()}else if(new URLSearchParams(location.search).get('holdReview')!=='1')await QiheFactionClash.play()}else if(kind==='voice'||kind==='ye'){document.title='小江湖 · '+(kind==='ye'?'叶蘅针法战斗验收':'战斗语音隔离验收');await PrologueStoryBattle.play({autoReview:kind==='ye'})}else if(kind==='bailiff'){document.title='小江湖 · 差役战斗形象验收';const foe=window.QiheSparFoes?.bailiff;if(!foe||!BART.qh_bailiff)throw Error('差役战斗档未加载');await battle({allowAuto:true,solo:true,noLose:true,noFlee:true,heroArt:'hero_village',heroPor:'opening_hero_village',bg:QiheChapterBattleArt.backgrounds.road,foes:[{...foe}]})}else await QiheChapter.storyBattle(kind);toast('战斗结束 · 刷新页面可再试一场',3000)}
  catch(e){console.error(e);toast('战斗未能打开：'+e.message,5000)}
  finally{busy=false;keys={};hud()}
 };
})();
