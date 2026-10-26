/* Original procedural pixel effects. Integer raster only; no canvas paths, blur or gradients. */
'use strict';
window.CombatPixels=(()=>{
 const layer=document.createElement('canvas');layer.width=320;layer.height=180;
 const ctx=layer.getContext('2d');
 const palettes={blade:['#243c63','#397a98','#62b6c5','#b4e9de','#ffffde'],palm:['#683e41','#aa6040','#e9a14a','#ffe19a','#fffde5'],needle:['#625246','#ad8956','#d4bb78','#f4e3b1','#ffffe5']};
 const clamp=x=>Math.max(0,Math.min(1,x));
 const rand=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 function dot(x,y,color,size=1){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),size,size)}
 function segment(x0,y0,x1,y1,col,w=1){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),sx=x0<x1?1:-1,dy=-Math.abs(y1-y0),sy=y0<y1?1:-1;let err=dx+dy;for(let n=0;n<1200;n++){dot(x0-(w>>1),y0-(w>>1),col,w);if(x0===x1&&y0===y1)break;const e=err*2;if(e>=dy){err+=dy;x0+=sx}if(e<=dx){err+=dx;y0+=sy}}}
 function polygon(points,col){ctx.fillStyle=col;const min=Math.max(0,Math.floor(Math.min(...points.map(p=>p[1])))),max=Math.min(179,Math.ceil(Math.max(...points.map(p=>p[1]))));for(let y=min;y<=max;y++){const xs=[];for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y+.5)!==(b[1]>y+.5))xs.push(a[0]+(y+.5-a[1])*(b[0]-a[0])/(b[1]-a[1]))}xs.sort((a,b)=>a-b);for(let i=0;i+1<xs.length;i+=2){const left=Math.ceil(xs[i]);ctx.fillRect(left,y,Math.max(1,Math.floor(xs[i+1])-left+1),1)}}}
 function transform(x,y,a,points,sx=1,sy=1){const ca=Math.cos(a),sa=Math.sin(a);return points.map(([u,v])=>[x+u*sx*ca-v*sy*sa,y+u*sx*sa+v*sy*ca])}
 // A filled, tapered blade ribbon. Each layer has its own thickness, never a stroked circle.
 function slash(x,y,r,a,progress,pal,strength=1,flip=1){const sweep=clamp(progress/0.32),decay=clamp((progress-.32)/.68),head=-2.3+3.45*sweep,tail=head-(2.7-decay*1.7);for(let l=0;l<4;l++){
  const outer=[],inner=[],width=(9-l*2)*(1-decay)*strength;
  for(let i=0;i<=28;i++){const q=i/28,angle=tail+(head-tail)*q,thick=width*Math.sin(q*Math.PI)**.65;outer.push([Math.cos(angle)*r,Math.sin(angle)*r*.77*flip]);inner.unshift([Math.cos(angle)*(r-thick),Math.sin(angle)*(r-thick)*.77*flip])}
  polygon(transform(x,y,a,outer.concat(inner)),pal[l+1]);
 }
 if(progress<.6){const ex=x+Math.cos(head)*r*Math.cos(a)-Math.sin(head)*r*.77*flip*Math.sin(a),ey=y+Math.cos(head)*r*Math.sin(a)+Math.sin(head)*r*.77*flip*Math.cos(a);dot(ex,ey,pal[4],2)}
 }
 function spike(x,y,a,len,width,color){polygon(transform(x,y,a,[[0,-width*.4],[len*.23,-width],[len,0],[len*.2,width],[0,width*.25]]),color)}
 function burst(x,y,age,pal,size,seed=1){if(age<0||age>210)return;const q=age/210,flash=age<55;for(let i=0;i<9;i++){const angle=i*Math.PI*2/9+rand(seed+i)*.3,len=size*(.55+rand(i+seed*7)*.7)*(1-q),start=q*size*.35;spike(x+Math.cos(angle)*start,y+Math.sin(angle)*start,angle,len,Math.max(1,(flash?5:3)*(1-q)),pal[flash?2:1])}if(flash){polygon([[x-8,y],[x-2,y-3],[x,y-9],[x+3,y-2],[x+9,y],[x+2,y+3],[x,y+8],[x-3,y+2]],pal[3]);dot(x-2,y-2,pal[4],4)}}
 function debris(x,y,age,pal,count,seed,scale=1){if(age<0||age>380)return;const q=age/380;for(let i=0;i<count;i++){if(q>.6&&i%3===Math.floor(q*16)%3)continue;const a=rand(i+seed)*6.283,speed=(12+rand(i*3+seed)*29)*scale,dx=Math.cos(a)*speed,dy=Math.sin(a)*speed*.7;const px=x+dx*q,py=y+dy*q+13*q*q;if(i%3===0&&q<.6)segment(px-dx*.1,py-dy*.1,px,py,pal[2]);else dot(px,py,pal[i%2?1:3],i%4?1:2)}}
 function dust(x,y,age,k){if(age<0||age>420)return;const q=age/420;for(let i=0;i<5+k;i++){const sign=i%2?1:-1,dx=sign*(7+rand(i+19)*25)*q,dy=-Math.sin(q*Math.PI)*(2+rand(i+83)*6),w=Math.max(1,Math.round((3+rand(i+3)*4)*(1-q)));polygon([[x+dx-w,y+dy],[x+dx-w/2,y+dy-w],[x+dx+w/2,y+dy-w-1],[x+dx+w,y+dy],[x+dx,y+dy+1]],q<.45?'#897866':'#594e46')}}

 function dragon(e,t){
  const begin=e.release_ms-110,end=e.hits.at(-1)+170;if(t<begin||t>end)return;
  const travel=clamp((t-begin)/(e.hit_ms-begin)),fade=clamp((t-e.hits.at(-1))/170),hx=225-132*(1-(1-travel)**2),hy=91+Math.sin(t*.009)*2;
  const gold=['#59372d','#a86030','#d69235','#f7c65a','#ffe79a','#fff5ce'],points=[];
  const length=50+travel*97;
  for(let i=0;i<=48;i++){const u=i/48,x=hx+u*length,y=hy+Math.sin(u*9-t*.007)*Math.sin(u*Math.PI)*17+u*8;points.push([x,y])}
  // Moving tapered silhouette, warm belly, scales and articulated dorsal spines.
  const edge=(r,shift=0)=>points.map(([x,y],i)=>[x,y+shift-r*(1-i/53)]).concat([...points].reverse().map(([x,y],j)=>[x,y+shift+r*(1-(48-j)/53)]));
  polygon(edge(10),gold[0]);polygon(edge(8),gold[2]);polygon(edge(3,4),gold[4]);
  for(let i=3;i<46;i+=3){const [x,y]=points[i],r=8*(1-i/53);polygon([[x-2,y-r+1],[x+2,y-r-7*(1-i/55)],[x+6,y-r+2]],i%2?gold[1]:'#6e8873');polygon([[x-2,y-3],[x+2,y-5],[x+4,y-2],[x+1,y]],gold[1]);dot(x,y-3,gold[4]);if(i<28){polygon([[x,y+1],[x+3,y-1],[x+5,y+2],[x+2,y+4]],gold[3])}}
  for(const index of [13,30]){const [x,y]=points[index];const sway=Math.sin(t*.013+index)*4;segment(x,y+4,x-6,y+12,gold[1],4);segment(x-6,y+12,x-15,y+13+sway,gold[3],3);for(let j=0;j<3;j++){segment(x-14+j*3,y+12+sway,x-19+j*3,y+18+sway,gold[4]);dot(x-19+j*3,y+18+sway,gold[5])}}
  // Bristled mane behind the skull.
  polygon([[hx+3,hy-12],[hx+16,hy-20],[hx+12,hy-10],[hx+23,hy-9],[hx+14,hy-3],[hx+22,hy+6],[hx+11,hy+3],[hx+13,hy+14],[hx+2,hy+9]],gold[1]);
  polygon([[hx+4,hy-10],[hx+12,hy-15],[hx+9,hy-7],[hx+16,hy-5],[hx+9,hy],[hx+14,hy+6],[hx+5,hy+7]],gold[3]);
  // Dragon skull, square snout, open jaw, teeth and a high-contrast eye.
  polygon([[hx-12,hy-7],[hx-4,hy-13],[hx+7,hy-10],[hx+9,hy+4],[hx+3,hy+12],[hx-12,hy+10],[hx-21,hy+5],[hx-21,hy-2]],gold[0]);
  polygon([[hx-13,hy-5],[hx-3,hy-11],[hx+6,hy-8],[hx+6,hy+2],[hx-6,hy+4],[hx-21,hy+1],[hx-21,hy-3]],gold[3]);
  polygon([[hx-19,hy+5],[hx-8,hy+7],[hx+4,hy+3],[hx+1,hy+10],[hx-11,hy+11]],gold[4]);
  segment(hx-20,hy-4,hx-10,hy-4,gold[5],2);dot(hx-20,hy-2,gold[0],2);
  polygon([[hx-10,hy-7],[hx-1,hy-8],[hx-4,hy-4],[hx-10,hy-4]],gold[5]);dot(hx-7,hy-6,'#602d29',2);segment(hx-10,hy-9,hx-1,hy-10,gold[0],2);
  polygon([[hx-15,hy+2],[hx-12,hy+2],[hx-13,hy+5]],gold[5]);polygon([[hx-5,hy+3],[hx-2,hy+2],[hx-3,hy+6]],gold[5]);
  // Two branching antlers, flowing whiskers and beard: identifiable Chinese dragon.
  for(let j=0;j<2;j++){const x=hx+1+j*6,y=hy-10+j*2;segment(x,y,x+6,y-12,gold[1],3);segment(x+6,y-12,x+17,y-19,gold[4],2);segment(x+9,y-14,x+8,y-22,gold[4]);segment(x+14,y-17,x+20,y-15,gold[4])}
  for(let j=0;j<2;j++){let last=[hx-17,hy+3+j*3];for(let i=1;i<=15;i++){const u=i/15,pt=[hx-17-u*22,hy+3+j*3+Math.sin(u*4+t*.012+j)*5+u*8];segment(...last,...pt,gold[j?3:5]);last=pt}}
  polygon([[hx-3,hy+10],[hx+3,hy+11],[hx+1,hy+22],[hx-4,hy+17],[hx-8,hy+21]],gold[3]);
  // Pixels shed behind the body instead of fading the whole dragon into a blurry glow.
  for(let i=0;i<22;i++){const u=rand(i+18),x=hx+u*length,y=hy+Math.sin(u*9-t*.007)*15+(rand(i+42)-.5)*48;if(i%3===Math.floor(t/70)%3)dot(x,y,gold[i%2?2:4],i%4?1:2)}
  if(fade>0){ctx.globalCompositeOperation='destination-out';for(let y=55;y<132;y++)for(let x=Math.max(0,Math.floor(hx-44));x<Math.min(320,hx+length+12);x++){if(rand(x+y*321)<fade)ctx.fillRect(x,y,1,1)}ctx.globalCompositeOperation='source-over'}
 }
 function draw(e,t,actorX=480){ctx.clearRect(0,0,320,180);const p=palettes[e.family],k=e.tier,hit=e.hit_ms,release=e.release_ms,tx=92,ty=105,ax=actorX/2,frame=Math.floor(t/1000*24);t=frame*1000/24;
 const wind=clamp((t-e.start_ms)/(release-e.start_ms));
 if(t>=e.start_ms&&t<release){for(let i=0;i<k+1;i++){const a=(i*2.4+.3),r=16*(1-wind)+4;segment(ax-12+Math.cos(a)*r,104+Math.sin(a)*r*.65,ax-12+Math.cos(a)*(r-3),104+Math.sin(a)*(r-3)*.65,p[1])}if(k>=3)dot(ax-14,103,p[3],2)}
 if(e.family==='blade'){
  for(let i=0;i<e.hits.length;i++){const h=e.hits[i],age=t-h,begin=h-105,phase=(t-begin)/265,final=i===e.hits.length-1;
   if(phase>=0&&phase<1){const angle=i%2?-.65:.35;slash(111,106,26+k*2,angle,phase,p,1,i%2?-1:1);if(k>=4&&phase>.15)slash(115,106,32+k*2,angle,clamp(phase-.13),[p[0],p[0],p[1],p[1],p[2]],.36,i%2?-1:1)}
   burst(tx,ty,age,p,10+k*1.6,13+i);debris(tx,ty,age,p,5+k*2,12+i);
   if(k===5&&final&&age>=0&&age<160){const q=age/160;polygon([[48+q*20,90],[135,112],[133,115],[49+q*20,93]],age<60?p[4]:p[2]);for(let j=0;j<3;j++)segment(53+j*9+q*20,93+j*3,62+j*9+q*20,95+j*3,p[1])}
  }
 }else if(e.family==='palm'){
  for(let i=0;i<e.hits.length;i++){const h=e.hits[i],age=t-h,pre=clamp((t-(h-100))/100);
   if(t>=h-100&&age<20){for(let j=0;j<3;j++){const y=100+j*5;polygon([[ax-12,y],[ax-1,y-2],[ax-30-15*pre,y+1],[ax-23-15*pre,y+3]],p[j===1?3:1])}}
   burst(tx,ty,age,p,16+k*2.5,5+i*8);debris(tx,ty,age,p,7+k*3,i+57,1.15);dust(tx,139,age,k);
   if(k>=3&&age>=35&&age<200){const q=(age-35)/165;for(let j=0;j<4;j++){const a=j*1.57+.4;spike(tx+Math.cos(a)*q*15,ty+Math.sin(a)*q*9,a,17*(1-q),2,p[1])}}
   if(k>=4&&i===e.hits.length-1&&age>=0&&age<180){const q=age/180;for(let j=0;j<3;j++){const x=tx-12-j*6-q*10;segment(x,ty-13+j*3,x-4,ty-3,p[j?1:2]);segment(x-4,ty-3,x,ty+10-j*2,p[j?1:2])}}
  }
 }else{
  for(let i=0;i<e.hits.length;i++){const h=e.hits[i],group=k>=4?2:1,launch=i?e.hits[i-1]+25:release;
   for(let j=0;j<group;j++){const y=101+(i-1)*5+j*4,progress=clamp((t-launch)/(h-launch)),x=223+(tx-223)*progress;
    if(t>=launch&&t<h){const length=9+k*2;segment(x+length,y,x,y,p[2]);segment(x+4,y,x,y,p[4]);if(k>=3)for(let n=0;n<3;n++)segment(x+length+5+n*9,y,x+length+8+n*9,y,p[0])}
    const age=t-h;if(age>=0&&age<150){const q=age/150;segment(tx-4*(1-q),y,tx+5*(1-q),y,p[3]);segment(tx,y-4*(1-q),tx,y+4*(1-q),p[4]);if(age<50)dot(tx-1,y-1,p[4],2);debris(tx,y,age,p,3+k,i*17+j,0.42)}
   }
  }
  if(k>=4&&t>e.hits.at(-1)&&t<e.hits.at(-1)+200){const q=(t-e.hits.at(-1))/200;for(let i=0;i<3;i++){dot(tx,96+i*5,p[q<.4?3:1]);if(k===5)segment(tx+q*55,96+i*5,tx+q*55+3,96+i*5,p[1])}}
 }
 if(e.family==='palm'&&e.tier===5)dragon(e,t);
 return layer;
 }
 return {draw,palettes,resolution:[320,180],version:2};
})();
