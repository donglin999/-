/* Observe one real skill selected in the isolated hero review, then restore hooks. */
(()=>{
 if(new URLSearchParams(location.search).get('battleReview')!=='hero')throw Error('isolated hero review required');
 const saved={skill:doSkill,act:BFXI.act,begin:BFXI.beginSkillPose,motion:Object.fromEntries(['dashTo','hopBack','stepFwd','stepBack','lunge','aimReach'].map(k=>[k,BFXI[k]]))};
 const probe=window.__characterActionProbe={status:'armed',poses:[],moves:[],samples:[]};let active=false;
 BFXI.beginSkillPose=function(u){const r=saved.begin.apply(this,arguments);if(active&&u.isHero){probe.castStart={x:u.x,y:u.y,bx:u.bx,pose:u.anim?.k};function sample(){if(!active)return;probe.samples.push({x:u.x,y:u.y,pose:u.anim?.k||'idle'});requestAnimationFrame(sample)}sample()}return r};
 BFXI.act=function(u,k,...args){if(active&&u.isHero)probe.poses.push(k);return saved.act.call(this,u,k,...args)};
 for(const k of Object.keys(saved.motion))BFXI[k]=function(u,...args){if(active&&u.isHero)probe.moves.push(k);return saved.motion[k].call(this,u,...args)};
 doSkill=async function(u,k,targets,bp){
  if(!u.isHero)return saved.skill.apply(this,arguments);active=true;probe.skill=k;probe.before={x:u.x,y:u.y,bx:u.bx,stepO:u.stepO,mp:u.mp,hp:targets[0]?.hp};
  try{return await saved.skill.apply(this,arguments)}finally{
   probe.after={x:u.x,y:u.y,mp:u.mp,hp:targets[0]?.hp};probe.status='complete';active=false;doSkill=saved.skill;BFXI.act=saved.act;BFXI.beginSkillPose=saved.begin;Object.assign(BFXI,saved.motion);
  }
 };
})();
