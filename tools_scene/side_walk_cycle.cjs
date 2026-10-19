'use strict';
// A planted shoe moves backwards by exactly the root travel during support.
// Units are the 128x94 logical sprite grid; scale is measured from the idle sheet.
function sideWalkFrame(phase,scale){
 const travel=108/scale,beta=.54,amp=travel*beta/2,j={},feet={};
 const bob=1.2*Math.cos(phase*4*Math.PI),waist=[64,49+bob];j.waist=waist;
 for(const [side,offset] of [['R',0],['L',.5]]){
  const p=(phase+offset)%1,ground=side==='R'?88:85,hip=[64,60+bob-(side==='L'?2:0)];
  let x,lift=0;
  if(p<beta)x=amp-travel*p;
  else{const q=(p-beta)/(1-beta);x=-amp+2*amp*(q*q*(3-2*q));lift=6*Math.sin(Math.PI*q);}
  const ankle=[64+x,ground-4-lift],dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],d=Math.hypot(dx,dy),length=19;
  if(d>=length*2)throw Error('Unreachable walk foot target');
  const half=d/2,height=Math.sqrt(length*length-half*half);
  const knee=[hip[0]+dx/2+dy/d*height,hip[1]+dy/2-dx/d*height];
  Object.assign(j,{['hip'+side]:hip,['knee'+side]:knee,['ankle'+side]:ankle,['heel'+side]:[ankle[0]-3,ground-3-lift],['toe'+side]:[ankle[0]+8,ground-3-lift]});
  feet[side]={support:p<beta,x:ankle[0]-64,y:ground-88,lift};
 }
 return {phase,joints:j,lean:3,gait:'walk',feet,travelWorld:108,scale};
}
module.exports={sideWalkFrame};
