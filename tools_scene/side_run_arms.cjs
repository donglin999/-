'use strict';
// Side-view arms stay in the sagittal plane. The projected 3D skeleton's
// depth-dependent elbow offsets must not be translated onto these 2D shoulders.
function sideRunArms(frame){
 const walking=frame.gait==='walk',lean=(frame.lean??17)*Math.PI/180,waist=frame.joints.waist,result={};
 for(const side of ['L','R']){
  const local=side==='R'?[-8,-14]:[10,-14];
  const shoulder=[waist[0]+local[0]*Math.cos(lean)-local[1]*Math.sin(lean),waist[1]+local[0]*Math.sin(lean)+local[1]*Math.cos(lean)];
  const phase=frame.phase*2*Math.PI+(side==='L'?Math.PI:0);
  const swing=-(walking?24:42)*Math.cos(phase)*Math.PI/180;
  const bend=(walking?20+4*Math.sin(phase):100+6*Math.sin(phase))*Math.PI/180;
  const elbow=[shoulder[0]+13*Math.sin(swing),shoulder[1]+13*Math.cos(swing)];
  const hand=[elbow[0]+11*Math.sin(swing+bend),elbow[1]+11*Math.cos(swing+bend)];
  result[side]={shoulder,elbow,hand,bend:180-bend*180/Math.PI};
 }
 return result;
}
module.exports={sideRunArms};
