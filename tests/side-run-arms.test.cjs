'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {sideRunArms}=require('../tools_scene/side_run_arms.cjs');
const cycle=require('../art_sources/opening_motion_oc8/cycle.json');
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
test('run arms retain lengths, bend toward the front and oppose the leading leg',()=>{
 for(let i=0;i<240;i++){
  const frame={phase:i/240,joints:cycle.frames[0].joints},arms=sideRunArms(frame);
  for(const side of ['L','R']){
   const a=arms[side];assert(Math.abs(dist(a.shoulder,a.elbow)-13)<1e-9);
   assert(Math.abs(dist(a.elbow,a.hand)-11)<1e-9);
   assert(a.bend>=74&&a.bend<=86);assert(a.hand[0]>a.elbow[0]);
   assert(a.hand[1]>frame.joints.head[1]+8,'hand must not punch through the face');
   const next=sideRunArms({...frame,phase:(i+1)%240/240})[side];
   assert(dist(a.hand,next.hand)<.5,'arm cycle must close continuously');
  }
  assert(Math.abs((arms.R.elbow[0]-arms.R.shoulder[0])+(arms.L.elbow[0]-arms.L.shoulder[0]))<1e-9);
 }
 for(const i of [0,4]){
  const f=cycle.frames[i],a=sideRunArms(f).R;
  assert((a.elbow[0]-a.shoulder[0])*(f.joints.toeR[0]-f.joints.hipR[0])<0);
 }
});
