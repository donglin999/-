'use strict';
// Fixed scene-source positions. Coordinates are multiplied by the scene pipeline's 3.
const CONTAINERS=[
 ['temple_guest_clothes','temple','wardrobe',155,223,'借宿衣柜',{cloth:1},0,'free','借宿衣物，可取一件。'],
 ['temple_food','temple','food',188,287,'借宿干粮箱',{bun:1},0,'free','留给借宿人的一份干粮。'],
 ['temple_out_medicine','temple_out','medicine',477,224,'行路药箱',{pill:1},0,'free','老僧备给行路人的伤药。'],
 ['temple_out_food','temple_out','barrel',488,175,'行粮桶',{bun:1},0,'free','庙外备下的一份行粮。'],
 ['gate_relief','gate','food',675,385,'茶棚施食箱',{bun:1},0,'free','候验旅人，每人一份。'],
 ['gate_drift','gate','wreck',120,349,'岸边破木匣',{},6,'free','漂来的废匣，木缝里卡着几枚铜钱。'],
 ['street_relief','street','food',393,307,'茶铺施食箱',{bun:1},0,'free','柳三娘给行人的一份施食。'],
 ['street_discard','street','wreck',711,313,'弃货木箱',{},6,'free','退货区的弃箱，铜钱遗在破板缝里。'],
 ['alley_old_clothes','alley','clothes',197,391,'赠衣箱',{cloth:1},0,'free','晾晒架旁整理出的旧衣，赠与行人。'],
 ['alley_wall_cache','alley','cache',205,344,'墙根藏匣',{},8,'book','泼皮私藏的零碎盘缠。'],
 ['ferry_travel','ferry','barrel',447,337,'渡口行粮桶',{bun:1},0,'free','船夫留给受困旅人的行粮。'],
 ['ferry_aid','ferry','medicine',136,299,'船夫药箱',{pill:1},0,'ferry','船夫解围后开放的备用药箱。'],
 ['crossing_food','crossing','barrel',211,154,'船上行粮桶',{bun:1},0,'free','汤老舵允许同行客人取一份行粮。',.85],
 ['ferry_e_store','ferry_e','food',591,220,'窝棚补给箱',{bun:1,wine:1},0,'east','守哨水匪存放的干粮与酒。'],
 ['ferry_e_drift','ferry_e','wreck',352,135,'芦苇岸木匣',{},8,'free','截船后漂到岸上的废匣，只剩零散铜钱。'],
 ['bgate_guard_supply','bgate','medicine',486,231,'守夜药箱',{pill:1},0,'chief','守寨者备用的伤药。'],
 ['bgate_food','bgate','barrel',538,245,'守夜行粮桶',{bun:3},0,'chief','留给守夜喽啰的行粮。'],
 ['cave_wine','cave','winebarrel',264,192,'聚饮酒桶',{wine:1},0,'chief','聚饮区留下一份可带走的酒。'],
 ['cave_aid','cave','medicine',605,204,'后勤药箱',{pill:1},0,'chief','押货与守寨人员用的成品伤药。'],
 ['cave_clothes','cave','cavewardrobe',649,328,'喽啰衣柜',{cloth:1},4,'chief','换洗的粗衣，柜角还有一点私钱。']
].map(([id,scene,kind,x,y,name,items,silver,access,reason,scale=1])=>({id,scene,kind,px:x*3,py:y*3,x:x*3/TS,y:y*3/TS,name,items,silver,access,reason,scale,loot:true,verb:'打开',sp:null}));
ASSETS.push('containers_v1');
const ContainerSystem=(()=>{
 let hover=null,receiptTimer=0;const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const sceneNodes=new Map(Object.values(SC).map(sc=>[sc,CONTAINERS.filter(c=>SC[c.scene]===sc)]));
 const nodes=sc=>sceneNodes.get(sc)||[];
 const claimed=c=>!!(S&&S.containers&&S.containers[c.id]&&S.containers[c.id].claimed);
 function allowed(c){if(!S)return false;
  if(c.access==='chief')return !!S.flags.chief_dead;
  if(c.access==='east')return S.flags.bf_east==='fight';
  if(c.access==='ferry')return !!S.flags.ferry_ev&&!S.flags.ferry_split;
  if(c.access==='book'){const q=S.quests&&S.quests.q_book;return !!(q&&(q.stage>=2||q.done)&&q.end!=='split')}
  return true}
 function bounds(c){const m=CONTAINER_ART.kinds[c.kind],s=m.states[claimed(c)?2:0],k=3*c.scale;
  return {x:c.px-s[0]*k/2,y:c.py-s[1]*k,w:s[0]*k,h:s[1]*k}}
 function blocks(sc,x,y){return nodes(sc).some(c=>{const m=CONTAINER_ART.kinds[c.kind],state=m.states[0],k=3*c.scale,b={w:state[0]*k,h:state[1]*k},depth=Math.min(b.h*.38,22*c.scale*3);return x>=c.px-b.w*.4&&x<=c.px+b.w*.4&&y>=c.py-depth&&y<=c.py+2})}
 function lockedReason(c){return c.access==='book'?'先解决柴角泼皮事件':c.access==='ferry'?'船夫尚未允许取用':c.access==='east'?'水匪仍控制着这处补给':'寨子尚未肃清'}
 function canInteract(c){return cur===SC[c.scene]&&mode==='scene'&&!busy&&!dlgBusy&&$('panel').hidden}
 function approach(c){const b=bounds(c),points=[[c.px,c.py+25],[c.px-b.w*.6-12,c.py+15],[c.px+b.w*.6+12,c.py+15]];
  return points.filter(([x,y])=>standOk(x,y)&&!npcBlock(x,y))}
 function click(c){if(!canInteract(c))return;
  if(Math.hypot(c.px-player.x,c.py-player.y)<80&&lineOk(player.x,player.y,c.px,c.py+18)){interact(c);return}
  for(const [x,y]of approach(c)){const p=setPath(x,y);if(p){player.talkTo=c;return}}
  toast('这里暂时无法靠近',1100)}
 function targetAt(x,y){return nodes(cur).slice().sort((a,b)=>b.py-a.py).find(c=>{const b=bounds(c);return x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h})||null}
 function setHover(x,y){hover=targetAt(x,y);cv.style.cursor=hover?'pointer':''}
 function notify(c){let e=document.getElementById('loot-receipt');if(!e){e=document.createElement('div');e.id='loot-receipt';e.setAttribute('role','status');document.body.appendChild(e)}
  const rows=Object.entries(c.items).map(([id,n])=>`<div>${mnIco(id,36)}<span>${esc(ITEMS[id].name)} <b>×${n}</b></span></div>`);
  if(c.silver)rows.push(`<div><span class="loot-coin">银</span><span>银两 <b>+${c.silver}</b></span></div>`);
  e.innerHTML=`<strong>${esc(c.name)}</strong>${rows.join('')}`;e.classList.add('on');clearTimeout(receiptTimer);receiptTimer=setTimeout(()=>e.classList.remove('on'),2600)}
 function claim(c){if(!canInteract(c))return false;
  if(claimed(c)){toast('已取空 · '+c.name,900);return false}
  if(!allowed(c)){toast(lockedReason(c),1200);return false}
  if(Math.hypot(c.px-player.x,c.py-player.y)>=80||!standOk(player.x,player.y)||!lineOk(player.x,player.y,c.px,c.py+18)){toast('先走到容器旁',900);return false}
  const bag={...S.bag};for(const[id,n]of Object.entries(c.items)){if(!ITEMS[id]||!Number.isInteger(n)||n<=0)throw Error('Invalid container reward '+c.id);bag[id]=(bag[id]||0)+n}
  const silver=(S.silver||0)+c.silver,containers={...(S.containers||{}),[c.id]:{claimed:true}};
  const next={...S,bag,silver,containers};
  try{(isReviewEntry()?sessionStorage:localStorage).setItem(isReviewEntry()?'xjh.review.save':'xjh.save',JSON.stringify(next))}
  catch(e){toast('领取未保存，请稍后再试',1300);return false}
  Object.assign(S,{bag,silver,containers});c.openAt=performance.now();notify(c);window.__audio?.sfx('chime',.5);hud();return true}
 function draw(c,t,near){const im=IMG.containers_v1;if(!ok(im))return;
  const m=CONTAINER_ART.kinds[c.kind],k=3*c.scale,justOpened=claimed(c)&&t-(c.openAt||-1e9)<320,col=claimed(c)?(justOpened?1:2):0;
  g.save();g.imageSmoothingEnabled=false;g.drawImage(im,col*80,m.row*100,80,100,c.px-40*k,c.py-94*k,80*k,100*k);
  const focused=hover===c||(near&&near.o===c),b=bounds(c);
  if(allowed(c)&&!claimed(c)){
   // User-approved larger sparkle: local halo and five stars, no whole-screen flash.
   const hash=[...c.id].reduce((a,v)=>a+v.charCodeAt(0),0),phase=hash%2100;
   const tm=reducedMotion.matches?525:t+phase,base=(1-Math.cos(tm/2100*Math.PI*2))/2,x=c.px,y=c.py-Math.min(b.h*.45,28*c.scale);
   const r=34/ZOOM,halo=g.createRadialGradient(x,y,0,x,y,r);halo.addColorStop(0,`rgba(158,223,255,${(.32+.68*base)*.55})`);halo.addColorStop(1,'rgba(158,223,255,0)');g.fillStyle=halo;g.fillRect(x-r,y-r,r*2,r*2);
   for(const[dx,dy,s,p]of[[0,0,6,0],[26,-24,3,.65],[-25,20,3,1.35],[23,19,2,2.1],[-18,-27,2,2.7]]){const q=(1-Math.cos(tm/2100*Math.PI*2+p))/2,z=s/ZOOM,xx=x+dx/ZOOM,yy=y+dy/ZOOM;
    g.globalAlpha=.22+.78*q;g.fillStyle='#9edfff';g.fillRect(xx-z/2,yy-z*2,z,z*4);g.fillRect(xx-z*2,yy-z/2,z*4,z);g.fillStyle='#d7f4ff';g.fillRect(xx-z/2,yy-z/2,z,z)}
   g.globalAlpha=1;
  }
  if(focused){g.strokeStyle='rgba(158,223,255,.42)';g.lineWidth=1.5;g.strokeRect(b.x-2,b.y-2,b.w+4,b.h+4);const state=claimed(c)?'已取空':allowed(c)?'打开':lockedReason(c);label(`${c.name} · ${state}`,c.px,b.y-10)}g.restore()}
 const css=document.createElement('style');css.textContent='#loot-receipt{position:fixed;right:24px;bottom:100px;padding:14px 18px;background:rgba(24,34,40,.94);border:1px solid #9edfff80;border-radius:6px;color:#e5f4fa;pointer-events:none;opacity:0;transition:opacity .18s;z-index:75;font-size:17px;min-width:190px}#loot-receipt.on{opacity:1}#loot-receipt strong{display:block;font-size:15px;color:#9edfff;margin-bottom:7px}#loot-receipt>div{display:flex;align-items:center;gap:12px;margin:5px 0}#loot-receipt .loot-coin{display:grid;place-items:center;width:36px;height:36px;border:1px solid #b9a772;border-radius:50%;color:#e1c981}';document.head.appendChild(css);
 return {nodes,claimed,allowed,bounds,blocks,approach,click,targetAt,setHover,claim,draw};
})();
