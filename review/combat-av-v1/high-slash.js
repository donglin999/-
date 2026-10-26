/* High-grade choreography reuses the approved procedural slash atlas.
   Each entry is a discrete cut, not a continuous stream emitter. */
(function(root){
 const hit=(at,angle,size,color='blue')=>({at,angle,size,color});
 const profiles=[
 {grade:'乙',name:'七刃穿云',duration:3500,phases:[[0,'七刃蓄势'],[750,'交错连斩'],[1700,'重剑收束'],[2200,'碎光消散']],cuts:[hit(900,-.45,.85),hit(1190,.45,.9),hit(1400,-.7,1),hit(1550,.7,1),hit(1670,-.25,1.1),hit(1770,.25,1.1),hit(2050,0,1.65,'gold')]},
 {grade:'甲',name:'天阙交锋',duration:4400,phases:[[0,'剑阵展开'],[1000,'八剑突进'],[2200,'双刃贯场'],[2900,'余刃崩解']],cuts:[...Array.from({length:8},(_,i)=>hit(1250+[0,230,420,570,690,790,870,940][i],(i%2?1:-1)*(.25+(i%4)*.18),.95+i*.05,i%2?'violet':'blue')),hit(2540,-.58,2.05),hit(2680,.58,2.05,'violet')]},
 {grade:'绝',name:'万剑开天',duration:5600,phases:[[0,'十二刃悬阵'],[1200,'群剑齐发'],[2750,'收静 · 聚锋'],[3260,'巨刃开天'],[3800,'三重崩裂']],cuts:[...Array.from({length:12},(_,i)=>hit(1500+[0,200,380,540,670,780,870,945,1010,1065,1110,1150][i],-.9+i*.165,.8+(i%3)*.18,i%3===0?'gold':i%2?'violet':'blue')),hit(3470,-.12,2.65,'gold'),hit(3650,-.65,1.9),hit(3790,.65,1.9,'violet')]}
 ];
 class HighSlash{
 constructor(){this.slash=new SlashImpact();this.palettes={blue:this.slash.atlas};for(const key of ['gold','violet'])this.palettes[key]=this.slash.atlas.map(src=>{const c=document.createElement('canvas');c.width=src.width;c.height=src.height;const g=c.getContext('2d');g.drawImage(src,0,0);const im=g.getImageData(0,0,c.width,c.height);for(let i=0;i<im.data.length;i+=4){if(im.data[i+1]>245)continue;const v=im.data[i+2];im.data[i]=key==='gold'?v:Math.round(v*.85);im.data[i+1]=key==='gold'?Math.round(v*.77):Math.round(v*.62);im.data[i+2]=key==='gold'?Math.round(v*.3):v}g.putImageData(im,0,0);return c});this.reset(2)}
 reset(index){this.index=index;this.profile=profiles[index];this.last=-1;this.events=[];this.active=true;this.slash.reset()}
 clear(){this.active=false;this.slash.clear()}
 time(raw,hold=true){const at=this.profile.cuts.at(-1).at;return !hold||raw<=at?raw:raw<at+70?at:raw-70}
 advance(raw,hold=true){if(!this.active)return[];const t=this.time(raw,hold),events=[];this.profile.cuts.forEach((c,i)=>{for(const [at,type]of [[c.at-180,'release'],[c.at,'impact']])if(this.last<at&&t>=at)events.push({at,type,index:i,heavy:c.size>=1.6})});events.sort((a,b)=>a.at-b.at);this.events.push(...events);this.last=t;return events}
 state(raw,hold=true){const t=this.time(raw,hold),cuts=this.profile.cuts,last=cuts.filter(c=>c.at<=t).at(-1),next=cuts.find(c=>c.at>t),age=last?t-last.at:9999;return{t,age,hero:next&&next.at-t<180?7:age<160?8:next?6:age<400?9:0,foe:age<290?12:0,offset:age<290?-Math.sin(Math.PI*age/290)*(last.size>=1.6?19:10):0,phase:this.profile.phases.filter(p=>t>=p[0]).at(-1)[1]}}
 draw(ctx,raw,{hold=true,shards=true,layer='front'}={}){if(!this.active)return 0;const{t}=this.state(raw,hold),p=this.profile;let count=0;ctx.save();ctx.imageSmoothingEnabled=false;
 if(layer==='back'){
 // A static, articulated array establishes scale before the fast moving blades.
 const finish=p.cuts[0].at-90,fade=Math.min(1,t/450)*Math.max(0,Math.min(1,(finish-t)/240));
 if(fade>0){const n=this.index===0?7:this.index===1?10:14;for(let i=0;i<n;i++){const a=-Math.PI*.92+i/(n-1)*Math.PI*.88,r=this.index===2?245:195,x=420+Math.cos(a)*r,y=254+Math.sin(a)*165;ctx.save();ctx.translate(x,y);ctx.rotate(a-Math.PI);ctx.globalAlpha=fade*.75;ctx.drawImage(this.palettes[i%3===0?'gold':'blue'][0],-12,-40,24,80);ctx.restore();count++}}
 }else{
 for(const c of p.cuts){const local=t-c.at+660;if(local<480||local>1200)continue;ctx.save();ctx.translate(200,211);ctx.rotate(c.angle);ctx.scale(c.size,c.size);ctx.translate(-200,-211);this.slash.atlas=this.palettes[c.color];count+=this.slash.draw(ctx,local,{hold:false,shards});ctx.restore()}
 // Sparse delayed debris, not a sustained luminous wave.
 const age=t-p.cuts.at(-1).at;if(shards&&age>130&&age<900){for(let i=0;i<80;i++){const k=age/900,x=200+Math.sin(i*19)*k*200,y=255-Math.abs(Math.cos(i*7))*Math.sin(k*Math.PI)*95;ctx.globalAlpha=(1-k)*.6;ctx.fillStyle=i%3?'#85dcf4':'#f8d38a';ctx.fillRect(Math.round(x),Math.round(y),i%4?1:3,2);count++}}
 }
 ctx.restore();return count}
 }
 root.HighSlash=HighSlash;root.HighSlashProfiles=profiles;
})(window);
