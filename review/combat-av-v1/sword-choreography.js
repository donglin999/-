/* High-grade review scripts. Times are milliseconds; positions use 640×360.
   Emitters share one clock with hit cues, with deliberate gaps between acts. */
(function(root){
 const profiles={
 3:{duration:6100,charge:1600,hits:[2050,2350,2590,2770,2900,2990,3060,3120,3550,3670],phases:[[0,'双流聚势'],[1600,'八剑加速汇击'],[3250,'交叉双斩'],[3800,'余波消散']]},
 4:{duration:8100,charge:1900,hits:[2350,2650,2880,3060,3200,3310,3390,3460,3520,3570,3610,3640,4680,4800,4960],phases:[[0,'天地聚气'],[1900,'十二剑雨'],[3850,'万流回吸'],[4300,'主剑贯空'],[5100,'三层余波']]}
 };
 const fast=u=>.07*u+.93*Math.pow(u,3.6),tau=Math.PI*2;
 function build(level,emit,hits){
 const ultimate=level===4;
 function stream(start,span,a,b,bend,width,count=2000,tone='blue',layer='front'){
  const path=u=>{const q=fast(u),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,v=(.07+3.348*Math.pow(u,2.6))*1000/span*.12;return{x:a[0]+dx*q+nx*Math.sin(Math.PI*q)*bend,y:a[1]+dy*q+ny*Math.sin(Math.PI*q)*bend,vx:(dx+nx*Math.cos(Math.PI*q)*Math.PI*bend)*v,vy:(dy+ny*Math.cos(Math.PI*q)*Math.PI*bend)*v}};
  emit(count,start,span,path,{life:520,spread:width,scatter:25,drag:2.3,size:3,alpha:.24,tone,layer});
  emit(Math.floor(count*.65),start,span,path,{life:400,spread:width*.3,scatter:12,drag:2.8,size:2,alpha:.65,tone,layer});
 }
 function impact(at,power=1){
  emit(850*power,at,65,u=>{const a=u*tau,r=230*power;return{x:200,y:211,vx:Math.cos(a)*r,vy:Math.sin(a)*r*.55}},{life:650,spread:15,scatter:65,drag:2,size:2.2,alpha:.65,gold:true});
 }
 // Opposing slow currents visibly occupy different planes, behind the fighters.
 for(let j=0;j<(ultimate?3:2);j++)emit(2600,100+j*130,ultimate?1700:1450,u=>{const a=u*tau*(j%2?-1:1)+j*2,r=ultimate?205:165;return{x:315+Math.cos(a)*r,y:170+Math.sin(a)*(ultimate?105:80),vx:-Math.sin(a)*24,vy:Math.cos(a)*12}},{life:650,spread:15,size:2.5,alpha:.35,tone:j%2?'violet':'blue',layer:'back'});
 if(!ultimate){
  // Eight spokes approach from alternating upper and lower planes.
  for(let j=0;j<8;j++){
   const origin=j%2?[440-j*20,300]:[470-j*28,45];
   stream(hits[j]-1050,1050,origin,[200,211],(j%2?1:-1)*45,38,1500,j%2?'violet':'blue');impact(hits[j],.5);
  }
  // A deliberate 430 ms separation distinguishes the finishing crossed cuts.
  stream(3290,260,[520,45],[200,211],-25,78,4300,'blue');
  stream(3410,260,[515,305],[200,211],25,68,3600,'violet');
  impact(3550,1.4);impact(3670,1.6);
 }else{
  // Twelve descending paths land faster and faster; ambient orbit remains slow.
  for(let j=0;j<12;j++){
   const origin=[90+j*39,25+(j%3)*17],flight=1150-j*30;
   stream(hits[j]-flight,flight,origin,[200,211],(j%2?1:-1)*(45+j*3),32,1250,j%3?'blue':'violet');impact(hits[j],.35);
  }
  // Particles reverse toward an elevated focus after the barrage clears.
  for(let j=0;j<6;j++){const a=j*tau/6;stream(3870,390,[315+Math.cos(a)*210,175+Math.sin(a)*120],[390,95],20,18,650,'violet','back')}
  // Wide diagonal main torrent, bracketed by two delayed supporting currents.
  stream(4330,350,[580,30],[200,211],-25,100,6200,'blue');
  stream(4450,350,[530,60],[200,211],72,68,4200,'violet');
  stream(4610,350,[530,285],[200,211],-65,65,3800,'blue');
  impact(4680,2);impact(4800,1.1);impact(4960,1.6);
 }
 const final=hits.at(-1);
 // Delayed pressure fronts: fast thin edge, slower heavy spray, floating debris.
 for(let j=0;j<(ultimate?3:2);j++)emit(ultimate?2300:1500,final+j*120,100,u=>{const a=u*tau,v=(ultimate?490:360)-j*95;return{x:200,y:260,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.29}},{life:900+j*150,spread:10+j*7,size:2.5+j*.4,alpha:.4-j*.06,drag:1.5,tone:j%2?'violet':'blue'});
 emit(900,final+140,280,u=>({x:85+u*330,y:255,vx:(u-.5)*50,vy:-45-50*Math.sin(u*Math.PI)}),{life:1250,spread:20,size:1.5,alpha:.45,gravity:40,drag:1.2,gold:true});
 }
 root.SwordChoreography={profiles,build};
})(window);
