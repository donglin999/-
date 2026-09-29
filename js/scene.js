'use strict';
// ───────────────────────── 场景（俯视探索 · 镜头跟随） ─────────────────────────
// 每张地图的世界尺寸为 WW×WH，按 48×27 格（每格 40px）标注：walk 为可走矩形并集，block 为障碍矩形，[c0,r0,c1,r1] 含端点
// npc: {id,name,sp(角色名),x,y(格),dir,show(),act(),mark()}  exit: {r:[c0,r0,c1,r1],label,to,at:[c,r],show()}
// 镜头缩放 ZOOM=5/6：地图源图 1600×900 绘制到 1920×1080 世界，再×5/6 → 屏幕上与源图像素 1:1（像素风不走样）。
// 画布 960×540 可见 1152×648 世界像素（约 60%×60% 地图），与原作「一屏约半个场景」的取景接近。
const TS=40,ZOOM=5/6,VW=W/ZOOM,VH=H/ZOOM;
// 世界尺寸按场景配置：sc.gw×sc.gh 格（缺省 48×27 = 1920×1080）。切换场景时 setDims(sc) 更新；地图底图按 WW×WH 绘制
let GW=48,GH=27,WW=GW*TS,WH=GH*TS;
function setDims(sc){const gw=(sc&&sc.gw)||48,gh=(sc&&sc.gh)||27;if(gw!==GW||gh!==GH){GW=gw;GH=gh;WW=GW*TS;WH=GH*TS}}
const sceneW=sc=>((sc&&sc.gw)||48)*TS,sceneH=sc=>((sc&&sc.gh)||27)*TS;
// 主角世界高度（≈ 屏幕 77px，约为门洞高度的 0.6~0.8，参照原作人物与门、桌椅的比例）
const CHAR_H=92;
// 相对主角身高（ART.scale 优先）；动物明显更小
const SIZE={hero:1,monk:1.02,soldier:1.06,gossip:.97,oldman:.95,smith:1.08,lady:.97,beggar:.97,boatman:1,bandit:1.04,chief:1.14,
  villager:1,child:.76,merchant:1.01,dog:.5,rooster:.4,snake:.66,wolf:.58};
const SPEED=.27,FOLLOW_GAP=52,RUN_MUL=1.7,RUN_PATH=8*40,RUN_PATH_TOUCH=5*40;
const SC={};
let cur=null,player={x:0,y:0,dir:'d',walk:0,vx:0,vy:0,moving:false,path:null,goal:null,trail:[],talkTo:null,running:false,runPath:false,runK:0},
  keys={},particles=[],cam={x:0,y:0},camC={x:0,y:0},wanderers=[],followers=[];
function npcsOf(sc){return(sc.npcs||[]).filter(n=>!n.show||n.show())}
function exitsOf(sc){return(sc.exits||[]).filter(n=>!n.show||n.show())}
const inR=(c,r,R)=>c>=R[0]&&c<=R[2]&&r>=R[1]&&r<=R[3];
// 精细碰撞（可选）：sc.mask = {w,h,d:base64 位图}，每位 = (WW/w) 世界像素见方（1 可走）；有 mask 时 walk/block 只用于出口等格判定
function buildGrid(sc){setDims(sc);if(sc.grid)return;sc.grid=[];for(let r=0;r<GH;r++)for(let c=0;c<GW;c++)sc.grid[r*GW+c]=(sc.walk||[]).some(R=>inR(c,r,R))&&!(sc.block||[]).some(R=>inR(c,r,R));
  if(sc.mask&&!sc._m){const M=sc.mask,b=atob(M.d),a=new Uint8Array(M.w*M.h);for(let i=0;i<a.length;i++)a[i]=(b.charCodeAt(i>>3)>>(7-(i&7)))&1;sc._m=a;sc._ms=WW/M.w;
    for(let r=0;r<GH;r++)for(let c=0;c<GW;c++)sc.grid[r*GW+c]=mOk(sc,c*TS+TS/2,r*TS+TS/2)}}
function mOk(sc,x,y){const s=sc._ms,c=Math.floor(x/s),r=Math.floor(y/s),w=sc.mask.w;return c>=0&&r>=0&&c<w&&r<sc.mask.h&&sc._m[r*w+c]===1}
const cellOk=(c,r)=>c>=0&&r>=0&&c<GW&&r<GH&&cur.grid[r*GW+c];
const ptOk=(x,y)=>cur._m?mOk(cur,x,y):cellOk(Math.floor(x/TS),Math.floor(y/TS));
// 脚底碰撞盒：左右各 7px，前后 3/5px（宽松：宁可略微贴边重叠，也不要空气墙）
const FOOT_X=7;
function standOk(x,y){return ptOk(x,y)&&ptOk(x-FOOT_X,y)&&ptOk(x+FOOT_X,y)&&ptOk(x,y+3)&&ptOk(x,y-5)}
const spKey=sp=>sp.replace(/^c_/,'');
function charH(sp){const k=spKey(sp),a=window.ART&&ART.scale&&ART.scale[k];return CHAR_H*(a||SIZE[k]||1)}
function npcH(n){return n.sp?(n.h||charH(n.sp)):24}
// 与 NPC 的碰撞（椭圆，纵向压扁）
function npcBlock(px,py,self){const ns=cur._npcs;for(let i=0;i<ns.length;i++){const n=ns[i];if(!n.sp||n===self)continue;const r=Math.max(12,npcH(n)*.15);
  const dx=n.x*TS-px,dy=(n.y*TS-py)*1.8;if(dx*dx+dy*dy<r*r){
    // 主角已与该 NPC 重叠（如 NPC 刚出现在主角身上）时，允许向外挪动脱困
    if(!self||self===player){const ex=n.x*TS-player.x,ey=(n.y*TS-player.y)*1.8;if(ex*ex+ey*ey<r*r&&dx*dx+dy*dy>=ex*ex+ey*ey)continue}
    return true}}
  // 路人（含站桩听书/看摊的）不再硬挡主角：主角挤过去时他们会侧身让开（见 updateWanderers）
  if(self&&self!==player)for(const w of wanderers){if(w.mode!=='stand'||w===self)continue;const dx=w.x-px,dy=(w.y-py)*1.8;if(dx*dx+dy*dy<18*18)return true}return false}
function walkable(px,py,self){return standOk(px,py)&&!npcBlock(px,py,self)}
const npcPos=n=>({x:n.x*TS,y:n.y*TS});
// E/空格 的最近目标：只在场景 NPC / 互动点里选。跟随中的同伴（大黄、苏芷…）不参与——与同伴交谈走江湖菜单·队伍页（window.onCompanionTalk），
// 需要同伴在某场景里作为剧情角色出现时，请在该场景 npcs 里另放一个带 show() 条件的 NPC（docs/design/02 §3.5）
function nearest(){let best=null,bd=80;for(const n of cur._npcs){const d=Math.hypot(n.x*TS-player.x,n.y*TS-player.y);if(d<bd){bd=d;best={type:'npc',o:n}}}return best}
const compName=id=>(window.COMPANIONS&&COMPANIONS[id]&&COMPANIONS[id].name)||{suzhi:'苏芷',dog:'阿黄'}[id]||'同伴';
function occupied(x,y,self,rad){if(Math.hypot(player.x-x,(player.y-y)*1.6)<rad+12)return true;
  for(const n of cur._npcs)if(n.sp&&Math.hypot(n.x*TS-x,(n.y*TS-y)*1.6)<rad+12)return true;
  for(const w of wanderers)if(w!==self&&Math.hypot(w.x-x,(w.y-y)*1.6)<rad+8)return true;
  for(const f of followers)if(Math.hypot(f.x-x,(f.y-y)*1.6)<rad)return true;return false}
// 路人（纯氛围，不可交互）：extras 项 {sp,mode:'stand'|'wander'|'run'|'patrol',x,y,dir,box:[c0,r0,c1,r1],pts:[[c,r]..],barks:[..],show()}
// 旧格式 crowd:[[sp,c0,r0,c1,r1]] 视为 wander
// 存档坐标迁移 + 防卡墙（每次进场/读档都经过 spawnWanderers）：
// 场景改版时给 sc.mapv 升版本；旧档（S.mapv[id] 不等）在该场景时按 sc.migrate(x,y,旧版本号)（世界像素→世界像素）换算，
// 之后若站位不可站或落在出口区内，吸附到最近的可站且不在出口区的点
function placeFix(){if(!S||!cur)return;const id=Object.keys(SC).find(k=>SC[k]===cur);S.mapv=S.mapv||{};
  if(cur.mapv&&S.mapv[id]!==cur.mapv){if(cur.migrate&&S.scene===id){const p=cur.migrate(player.x,player.y,S.mapv[id]);player.x=p[0];player.y=p[1]}S.mapv[id]=cur.mapv}
  const inEx=(x,y)=>exitsOf(cur).some(e=>inR(Math.floor(x/TS),Math.floor(y/TS),e.r));
  player.x=clamp(player.x,8,WW-8);player.y=clamp(player.y,8,WH-8);
  if(standOk(player.x,player.y)&&!inEx(player.x,player.y))return;
  let best=null,bd=1e18;for(let y=4;y<WH;y+=8)for(let x=4;x<WW;x+=8){const d=(x-player.x)**2+(y-player.y)**2;if(d<bd&&standOk(x,y)&&!inEx(x,y)){bd=d;best=[x,y]}}
  if(best){player.x=best[0];player.y=best[1]}}
function spawnWanderers(){placeFix();cur._npcs=npcsOf(cur);wanderers=[];bubbles.length=0;ambInit();
  const list=[...(cur.crowd||[]).map(([sp,c0,r0,c1,r1])=>({sp,mode:'wander',box:[c0,r0,c1,r1]})),...(cur.extras||[]).filter(e=>!e.show||e.show())];
  for(const e of list){const w={sp:e.sp,mode:e.mode||'wander',box:e.box,pts:e.pts,pi:0,x:0,y:0,dir:e.dir||'d',face:e.dir,walk:0,moving:false,tx:null,ty:0,
      wait:rnd(300,2500),ph:Math.random()*9,barks:e.barks,bt:rnd(1500,6000),step:0,
      spd:e.mode==='run'?.13:e.mode==='patrol'?.05:.06};
    if(e.x!=null){w.x=e.x*TS;w.y=e.y*TS}
    else if(e.pts){w.x=e.pts[0][0]*TS;w.y=e.pts[0][1]*TS;w.pi=1}
    else{const[c0,r0,c1,r1]=e.box;for(let k=0;k<30;k++){w.x=(c0+.5+Math.random()*(c1-c0))*TS;w.y=(r0+.5+Math.random()*(r1-r0))*TS;if(standOk(w.x,w.y)&&!occupied(w.x,w.y,w,26))break}
      if(!e.dir)w.dir='dlru'[ri(0,3)]}
    wanderers.push(w)}resetFollowers()}
// sc.noFollow：同伴在该场景以剧情 NPC 身份出现（02 §3.5，如渡船 crossing），不再跟随
const partyHere=()=>{if(cur&&cur.noFollow)return[];if(S&&typeof petEnsure==='function')petEnsure();
  // 跟随队列按主角 → 人物同伴 → 宠物排列；宠物固定在队尾，不参与人物排序。
  const people=(S&&S.party||[]).filter(k=>k!==S.pet);return S&&S.pet?[...people,S.pet]:people};
function resetFollowers(){followers=[];const party=partyHere();if(!party.length)return;seedTrail(FOLLOW_GAP*(party.length+1));party.forEach((m,i)=>{followers.push(makeFollower(m,i))})}
// 入场：沿主角背后铺一段可走的虚拟足迹，同伴排在身后，之后自然接上真实足迹
function seedTrail(len){if(player.trail.length>2)return;const back={d:[0,-1],u:[0,1],l:[1,0],r:[-1,0]}[player.dir]||[0,-1];player.trail=[[player.x,player.y,player.dir]];
  let x=player.x,y=player.y;for(let s=4;s<=len;s+=4){const nx=player.x+back[0]*s,ny=player.y+back[1]*s;if(!standOk(nx,ny))break;x=nx;y=ny;player.trail.push([x,y,player.dir])}}
function trailAt(want){const tr=player.trail;if(!tr.length)return[player.x,player.y];let acc=Math.hypot(player.x-tr[0][0],player.y-tr[0][1]);if(acc>=want)return[tr[0][0],tr[0][1]];
  for(let k=0;k<tr.length-1;k++){const a=tr[k],b=tr[k+1],seg=Math.hypot(a[0]-b[0],a[1]-b[1]);if(acc+seg>=want){const u=(want-acc)/(seg||1);return[a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u]}acc+=seg}
  const l=tr[tr.length-1];return[l[0],l[1]]}
function makeFollower(m,i){const[x,y]=trailAt(FOLLOW_GAP*(i+1));return{m,x,y,dir:player.dir,walk:0,moving:false,running:false,idle:0,ph:i*2.3}}
// ── 场景切换（docs/design/02 §3 场景衔接规则）──
// 出口方向 exitDir(e)：e.dir 显式给出（门洞等内部出口必须写），否则按出口矩形贴哪条边推断。
// 走出：主角沿出口方向再走 EXIT_WALK 像素并淡出 → 黑场 → 新场景里从入口点背后 ENTER_WALK 像素处、朝同一方向走到入口点并淡入。
// 规则：相邻两图的出入方向一致——在 A 图向下走出，到 B 图也是向下走进（B 图回 A 的出口在 B 的上方/门洞，方向为 'u'）。审计 audit.cjs 会检查。
const EXIT_WALK=44,ENTER_WALK=52,DV={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]},OPP={u:'d',d:'u',l:'r',r:'l'};
function exitDir(e,sc=cur){if(e.dir)return e.dir;const[c0,r0,c1,r1]=e.r,gw=(sc&&sc.gw)||48,gh=(sc&&sc.gh)||27;
  return c0<=0?'l':c1>=gw-1?'r':r1>=gh-1?'d':r0<=0?'u':'u'}
// 入场方向：显式 dir，否则取本场景通往 map 的出口里离入口点最近的一个，方向取反（从那条边走进来）
function entryDir(sc,at,dir){if(dir)return dir;let best=null,bd=1e9;for(const e of(sc.exits||[]))if(e.to==='map'){const[c0,r0,c1,r1]=e.r,d=Math.hypot(clamp(at[0],c0,c1+1)-at[0],clamp(at[1],r0,r1+1)-at[1]);if(d<bd){bd=d;best=e}}
  return best?OPP[exitDir(best,sc)]:(sc.startDir||'u')}
// 主角脚本行走（无视碰撞/出口判定，busy 期间由 updateScene 推进）：返回 Promise
function animWalk(dx,dy,ms,a0,a1){return new Promise(res=>{player.anim={x0:player.x,y0:player.y,dx,dy,ms,t:0,a0,a1,res}})}
function stepAnim(dt){const A=player.anim;if(!A)return false;A.t=Math.min(A.ms,A.t+dt);const k=A.t/A.ms,ox=player.x,oy=player.y;
  player.x=A.x0+A.dx*k;player.y=A.y0+A.dy*k;player.alpha=A.a0+(A.a1-A.a0)*k;const md=Math.hypot(player.x-ox,player.y-oy);player.moving=md>0;player.walk+=md;if(md>0)footDust(player,'hero');
  if(md>0){const t0=player.trail[0];if(!t0||Math.hypot(t0[0]-player.x,t0[1]-player.y)>=4){player.trail.unshift([player.x,player.y,player.dir]);if(player.trail.length>90)player.trail.pop()}}
  if(A.t>=A.ms){player.anim=null;player.moving=false;player.walk=0;A.res()}return true}
// 大地图入场点：sc.mapIn（格）给出时，大地图节点（ui.js NODES）的 at 一律换成 mapIn——场景改版换了网格/出口位置时不必同步改 NODES（02 §3.2）
const mapNodeAt=(id,at)=>at&&typeof NODES!=='undefined'&&NODES.some(n=>n.to===id&&n.at===at);
async function goScene(id,at,dir){let enter=null;
  if(SC[id]&&SC[id].mapIn&&mapNodeAt(id,at))at=SC[id].mapIn;
  await fade(async()=>{cur=SC[id];buildGrid(cur);S.scene=id;if(cur.mapv)(S.mapv=S.mapv||{})[id]=cur.mapv;const p=at||cur.start;
    const d=at?entryDir(cur,p,dir):(cur.startDir||player.dir),v=DV[d];player.dir=d;
    player.x=p[0]*TS;player.y=p[1]*TS;player.vx=player.vy=0;player.path=null;player.goal=null;player.trail=[];player.anim=null;particles=[];spawnWanderers();S.unlocked[cur.region||id]=1;
    // 入场：从入口点背后走进来（placeFix 之后的落点为终点）
    const tx=player.x,ty=player.y;if(at){player.x=tx-v[0]*ENTER_WALK;player.y=ty-v[1]*ENTER_WALK;player.alpha=0;enter=animWalk(v[0]*ENTER_WALK,v[1]*ENTER_WALK,520,0,1)}
    camC.x=tx;camC.y=ty-CHAR_H*.45;cam.x=clamp(camC.x-VW/2,0,WW-VW);cam.y=clamp(camC.y-VH/2,0,WH-VH);save()});
  if(enter){busy=true;await enter;busy=false}player.alpha=1;
  placeName(cur.name);hud();if(cur.enter){busy=true;await cur.enter();busy=false;hud()}}
let busy=false;
const faceTo=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u');
async function interact(target){if(busy||dlgBusy||mode!=='scene')return;const n=target?{type:'npc',o:target}:nearest();if(!n)return;
  if(n.type==='comp'){const f=n.o;busy=true;$('prompt').hidden=true;player.path=null;player.goal=null;player.talkTo=null;player.dir=faceTo(f.x-player.x,f.y-player.y);f.dir=faceTo(player.x-f.x,player.y-f.y);f.talk=1;
    try{await window.onCompanionTalk?.(f.m)}finally{busy=false;f.talk=0;hud()}return}
  busy=true;$('prompt').hidden=true;player.path=null;player.goal=null;player.talkTo=null;
  const p=npcPos(n.o),dx=p.x-player.x,dy=p.y-player.y;player.dir=faceTo(dx,dy);
  if(n.o.sp&&!n.o.fixed){n.o.dir0=n.o.dir0||n.o.dir||'d';n.o.dir=faceTo(-dx,-dy)}
  try{await n.o.act(n.o)}finally{busy=false;if(n.o.dir0){n.o.dir=n.o.dir0}if(cur)cur._npcs=npcsOf(cur);hud()}}
async function takeExit(e){busy=true;player.path=null;player.goal=null;player.vx=player.vy=0;keys={};$('prompt').hidden=true;
  const d=exitDir(e),v=DV[d];player.dir=d;
  try{await animWalk(v[0]*EXIT_WALK,v[1]*EXIT_WALK,300,1,0);   // 走进出口方向并淡出（门洞里不会被建筑"吞"掉）
    if(e.to==='map')await openMap();else await goScene(e.to,e.at,d)}finally{player.alpha=1;busy=false;hud()}}
// 直线可达（用于路径拉直）
function lineOk(x0,y0,x1,y1){const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/8);for(let i=1;i<=n;i++){const t=i/n;if(!standOk(x0+(x1-x0)*t,y0+(y1-y0)*t))return false}return true}
// A*：规划网格 NS（有精细 mask 时 16px，按脚底碰撞盒判可站；否则 40px 格），二叉堆开放表
function navOf(){if(cur._nav)return cur._nav;const NS=cur._m?16:TS,nw=Math.ceil(WW/NS),nh=Math.ceil(WH/NS),ok=new Uint8Array(nw*nh);
  for(let r=0;r<nh;r++)for(let c=0;c<nw;c++)ok[r*nw+c]=cur._m?(standOk(c*NS+NS/2,r*NS+NS/2)?1:0):(cellOk(c,r)?1:0);return cur._nav={NS,nw,nh,ok}}
function findPath(tx,ty){const{NS,nw,nh,ok:ok0}=navOf();
  // 寻路时把站立的剧情 NPC 视为障碍（目标点附近除外），避免路径穿人后卡死
  const ok=ok0.slice?ok0.slice():Array.from(ok0);for(const n of cur._npcs){if(!n.sp)continue;const r=Math.max(12,npcH(n)*.15)+8,nx=n.x*TS,ny=n.y*TS;
    if(Math.hypot(nx-tx,ny-ty)<r+NS)continue;if(Math.hypot(nx-player.x,ny-player.y)<r+2)continue;
    for(let yy=Math.floor((ny-r/1.8)/NS);yy<=Math.floor((ny+r/1.8)/NS);yy++)for(let xx=Math.floor((nx-r)/NS);xx<=Math.floor((nx+r)/NS);xx++)if(xx>=0&&yy>=0&&xx<nw&&yy<nh)ok[yy*nw+xx]=0}
  const okc=(c,r)=>c>=0&&r>=0&&c<nw&&r<nh&&ok[r*nw+c]===1;
  let sc=Math.floor(player.x/NS),sr=Math.floor(player.y/NS);let tc=Math.floor(tx/NS),tr=Math.floor(ty/NS);
  const near=(c0,r0)=>{let best=null,bd=1e9;for(let r=0;r<nh;r++)for(let c=0;c<nw;c++)if(ok[r*nw+c]){const d=(c-c0)**2+(r-r0)**2;if(d<bd){bd=d;best=[c,r]}}return best};
  if(!okc(sc,sr)){const b=near(sc,sr);if(b)[sc,sr]=b}
  if(!okc(tc,tr)){const b=near(tc,tr);if(!b)return null;[tc,tr]=b;tx=tc*NS+NS/2;ty=tr*NS+NS/2}
  if(!standOk(tx,ty)){tx=tc*NS+NS/2;ty=tr*NS+NS/2}
  const N=nw*nh,gs=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N),heap=[],hf=[];
  const push=(k,f)=>{heap.push(k);hf.push(f);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(hf[p]<=hf[i])break;[heap[p],heap[i]]=[heap[i],heap[p]];[hf[p],hf[i]]=[hf[i],hf[p]];i=p}};
  const pop=()=>{const k=heap[0],lk=heap.pop(),lf=hf.pop();if(heap.length){heap[0]=lk;hf[0]=lf;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<heap.length&&hf[l]<hf[m])m=l;if(r<heap.length&&hf[r]<hf[m])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];[hf[m],hf[i]]=[hf[i],hf[m]];i=m}}return k};
  const s0=sr*nw+sc,goal=tr*nw+tc;gs[s0]=0;push(s0,0);let found=false;
  while(heap.length){const k=pop();if(closed[k])continue;closed[k]=1;if(k===goal){found=true;break}const c=k%nw,r=(k/nw)|0;
    for(const[dc,dr]of NB8){const nc=c+dc,nr=r+dr;if(!okc(nc,nr))continue;if(dc&&dr&&(!okc(c+dc,r)||!okc(c,r+dr)))continue;const nk=nr*nw+nc,ng=gs[k]+(dc&&dr?1.414:1);
      if(ng<gs[nk]){gs[nk]=ng;from[nk]=k;push(nk,ng+Math.hypot(nc-tc,nr-tr))}}}
  if(!found)return null;
  const cells=[];let kk=goal;while(kk!==s0&&kk>=0){cells.unshift(kk);kk=from[kk]}
  const pts=cells.map(k=>[(k%nw)*NS+NS/2,((k/nw)|0)*NS+NS/2]);if(pts.length)pts[pts.length-1]=[tx,ty];else pts.push([tx,ty]);
  // 拉直：从当前点起尽量跳到最远的可直达路点
  // 拉直时同样避开剧情 NPC（只查 standOk 会把路径拉成直线穿过站着的 NPC，走到跟前被挡住卡死）
  const lineN=(x0,y0,x1,y1)=>{if(!lineOk(x0,y0,x1,y1))return false;const d=Math.hypot(x1-x0,y1-y0),n=Math.ceil(d/8);
    for(let i=1;i<n;i++){const t=i/n,c=Math.floor((x0+(x1-x0)*t)/NS),r=Math.floor((y0+(y1-y0)*t)/NS);if(!okc(c,r)&&ok0[r*nw+c])return false}return true};
  const out=[];let px=player.x,py=player.y,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!lineN(px,py,pts[j][0],pts[j][1]))j--;out.push(pts[j]);[px,py]=pts[j];i=j+1}
  return out}
const NB8=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function setPath(tx,ty,run){const p=findPath(tx,ty);player.path=p;player.goal=p?{x:p[p.length-1][0],y:p[p.length-1][1],t:0}:null;
  if(p){let L=0,px=player.x,py=player.y;for(const q of p){L+=Math.hypot(q[0]-px,q[1]-py);px=q[0];py=q[1]}player.runPath=run===true||L>(run==='touch'?RUN_PATH_TOUCH:RUN_PATH)}return p}
// 8 向移动 → 4 向朝向（带迟滞，斜走时不来回抖）
function dirOf(vx,vy,d){const ax=Math.abs(vx),ay=Math.abs(vy);if(ax<1e-4&&ay<1e-4)return d;
  const m=Math.hypot(vx,vy);if((d==='l'&&vx<-.38*m)||(d==='r'&&vx>.38*m)||(d==='u'&&vy<-.38*m)||(d==='d'&&vy>.38*m))return d;
  return ax>ay?(vx>0?'r':'l'):(vy>0?'d':'u')}
const camFocusY=()=>player.y-CHAR_H*.45;
// 开场运镜（可选）：sc.intro={at:[x,y] 世界像素焦点, hold:ms, pan:ms, when:()=>bool}。snapCam 时 when() 为真：镜头先对准 at 停 hold 毫秒，
// 再用 pan 毫秒缓动到主角（序章：先看神龛与篝火，再落到醒来的主角，02 §4.1）
let camIntro=null;
function snapCam(){camC.x=player.x;camC.y=camFocusY();const I=cur&&cur.intro;camIntro=null;
  if(I&&(!I.when||I.when())){camIntro={x:I.at[0],y:I.at[1],t:0,hold:I.hold||1500,pan:I.pan||2500};camC.x=I.at[0];camC.y=I.at[1]}
  cam.x=clamp(camC.x-VW/2,0,WW-VW);cam.y=clamp(camC.y-VH/2,0,WH-VH)}
function updateCam(dt){
  if(camIntro){const I=camIntro;I.t+=dt;const u=clamp((I.t-I.hold)/I.pan,0,1),k=u<.5?2*u*u:1-(-2*u+2)**2/2;
    camC.x=I.x+(player.x-I.x)*k;camC.y=I.y+(camFocusY()-I.y)*k;cam.x=clamp(camC.x-VW/2,0,WW-VW);cam.y=clamp(camC.y-VH/2,0,WH-VH);
    if(u>=1||player.moving)camIntro=null;return}const DZX=VW*.07,DZY=VH*.06,fx=player.x+player.vx*260,fy=camFocusY()+player.vy*200;
  let tx=camC.x,ty=camC.y;if(fx-tx>DZX)tx=fx-DZX;else if(tx-fx>DZX)tx=fx+DZX;if(fy-ty>DZY)ty=fy-DZY;else if(ty-fy>DZY)ty=fy+DZY;
  const k=1-Math.exp(-dt/170);camC.x+=(tx-camC.x)*k;camC.y+=(ty-camC.y)*k;
  cam.x=clamp(camC.x-VW/2,0,WW-VW);cam.y=clamp(camC.y-VH/2,0,WH-VH)}
function updateWanderers(dt){for(const w of wanderers){
  updBark(w,dt);
  // 站桩者：主角靠近时转头看一眼，走开后恢复原朝向
  if(w.mode==='stand'){if(w.hx==null){w.hx=w.x;w.hy=w.y}const d=Math.hypot(w.x-player.x,w.y-player.y);w.dir=d<90?faceTo(player.x-w.x,player.y-w.y):(w.face||w.dir);w.moving=false;
    // 被主角挤到：顺势侧身让开（最多离原位 26px）；主角走远后慢慢回到原位
    const px=w.x-player.x,py=(w.y-player.y)*1.6,pd=Math.hypot(px,py);
    if(pd<26){const ux=pd>.5?px/pd:(w.x>=player.x?1:-1),uy=pd>.5?py/pd*.6:0,st=dt*.12,nx=w.x+ux*st,ny=w.y+uy*st;
      if(Math.hypot(nx-w.hx,ny-w.hy)<26&&standOk(nx,ny)){w.x=nx;w.y=ny}}
    else if(pd>60){const bx=w.hx-w.x,by=w.hy-w.y,bd=Math.hypot(bx,by);if(bd>.5){const st=Math.min(bd,dt*.03);w.x+=bx/bd*st;w.y+=by/bd*st}}
    continue}
  // 主角靠近时让路
  const px=w.x-player.x,py=(w.y-player.y)*1.6,pd=Math.hypot(px,py);
  if(pd<34&&pd>0){const nx=w.x+px/pd*dt*.07,ny=w.y+py/pd*dt*.05;if(standOk(nx,ny)){stepW(w,Math.hypot(nx-w.x,ny-w.y));w.x=nx;w.y=ny;w.moving=true;w.dir=dirOf(px,py,w.dir);w.tx=null;w.wait=rnd(600,1500);continue}}
  if(w.tx==null){w.wait-=dt;w.moving=false;if(w.wait<=0){
      if(w.pts){const p=w.pts[w.pi];w.pi=(w.pi+1)%w.pts.length;w.tx=p[0]*TS;w.ty=p[1]*TS}
      else{const[c0,r0,c1,r1]=w.box;const tx=(c0+.5+Math.random()*(c1-c0))*TS,ty=(r0+.5+Math.random()*(r1-r0))*TS;if(standOk(tx,ty)&&lineOk(w.x,w.y,tx,ty)){w.tx=tx;w.ty=ty}else w.wait=250}}continue}
  const dx=w.tx-w.x,dy=w.ty-w.y,d=Math.hypot(dx,dy);if(d<2){w.tx=null;w.wait=w.mode==='run'?rnd(200,900):w.pts?rnd(1800,3200):rnd(1500,4500);w.moving=false;
      if(w.pts&&w.mode==='patrol')w.dir='dlru'[ri(0,3)];continue}
  const s=Math.min(d,dt*w.spd),nx=w.x+dx/d*s,ny=w.y+dy/d*s;
  if(standOk(nx,ny)&&!occupied(nx+dx/d*10,ny+dy/d*10,w,22)){w.x=nx;w.y=ny;stepW(w,s);w.moving=true;w.dir=dirOf(dx,dy,w.dir)}else{w.tx=null;w.wait=rnd(500,1400);w.moving=false;if(w.pts)w.pi=(w.pi+w.pts.length-1)%w.pts.length}}}
function stepW(w,s){w.walk+=s;footDust(w,w.sp)}
// 同伴：沿主角足迹按间距跟随，主角停下时停在身后
// 同伴（逸剑风云决式）：沿主角足迹成链跟随，间距 FOLLOW_GAP；只走主角走过的路线故不穿墙，也不被路人挡；主角停下时停在身后、转向主角
function updateFollowers(dt){const party=partyHere();if(followers.length!==party.length||followers.some((f,i)=>f.m!==party[i]))resetFollowers();
  for(let i=0;i<followers.length;i++){const f=followers[i];if(f.talk){f.moving=false;continue}
    const[tx,ty]=trailAt(FOLLOW_GAP*(i+1)),dx=tx-f.x,dy=ty-f.y,d=Math.hypot(dx,dy);
    if(d>400){f.x=tx;f.y=ty;f.moving=false;continue}
    if(d>1.5){const lead=player.running||d>FOLLOW_GAP*.9,cap=SPEED*(lead?RUN_MUL*1.08:1.05),sp=Math.min(d,dt*Math.min(cap,SPEED*(.3+d/14)));
      f.x+=dx/d*sp;f.y+=dy/d*sp;f.walk+=sp;f.running=sp>dt*SPEED*1.25;footDust(f,f.m);f.dir=dirOf(dx,dy,f.dir);f.moving=sp>dt*.02;f.idle=0}
    else{f.moving=false;f.running=false;f.idle+=dt;
      if(f.idle>350&&!player.moving){const hx=player.x-f.x,hy=player.y-f.y;f.dir=Math.hypot(hx,hy)>6?faceTo(hx,hy):player.dir}}
    if(!f.moving)f.walk=0}}
function updateScene(dt){setDims(cur);
  cur._npcs=npcsOf(cur);
  const anim=stepAnim(dt);
  updateWanderers(dt);updateFollowers(dt);updateCam(dt);
  if(anim)return;
  if(player.goal)player.goal.t+=dt;
  const frozen=busy||dlgBusy||!$('panel').hidden;
  let ix=0,iy=0,arrive=1;
  if(!frozen){ix=(keys.right?1:0)-(keys.left?1:0);iy=(keys.down?1:0)-(keys.up?1:0);
    if(ix||iy){player.path=null;player.goal=null;player.talkTo=null}
    else if(player.path&&player.path.length){const[tx,ty]=player.path[0];const dx=tx-player.x,dy=ty-player.y,d=Math.hypot(dx,dy),last=player.path.length===1;
      if(d<(last?2:10)){player.path.shift();if(!player.path.length)endPath()}else{ix=dx/d;iy=dy/d;if(last)arrive=Math.min(1,d/28+.15)}}}
  const kbd=!frozen&&(keys.left||keys.right||keys.up||keys.down),wantRun=!frozen&&(kbd?!!(keys.shift||keys.run):!!(player.path&&player.runPath));
  player.runK+=((wantRun?1:0)-player.runK)*(1-Math.exp(-dt/(wantRun?220:160)));
  const spd=SPEED*(1+(RUN_MUL-1)*player.runK),l=Math.hypot(ix,iy),tvx=l?ix/l*spd*arrive:0,tvy=l?iy/l*spd*arrive:0;
  const k=1-Math.exp(-dt/(l?70:45));player.vx+=(tvx-player.vx)*k;player.vy+=(tvy-player.vy)*k;
  if(Math.hypot(player.vx,player.vy)<.004){player.vx=player.vy=0}
  const ox=player.x,oy=player.y;
  if(player.vx||player.vy){const nx=player.x+player.vx*dt,ny=player.y+player.vy*dt,stuck=!standOk(player.x,player.y);
    if(stuck||walkable(nx,ny))
      {player.x=nx;player.y=ny}
    else{// 沿墙滑动：分轴尝试；轴向被挡则给一点沿墙分量
      let moved=false;
      if(Math.abs(player.vx)>.01&&walkable(nx,player.y)){player.x=nx;player.vy*=.5;moved=true}
      else if(Math.abs(player.vy)>.01&&walkable(player.x,ny)){player.y=ny;player.vx*=.5;moved=true}
      if(!moved){player.vx=player.vy=0;if(player.path){const tt=player.talkTo;endPath(tt&&Math.hypot(tt.x*TS-player.x,tt.y*TS-player.y)<110)}}}}
  const md=Math.hypot(player.x-ox,player.y-oy);player.moving=md>dt*.015;player.running=player.moving&&md>dt*SPEED*1.3;
  if(md>0){player.walk+=md;footDust(player,'hero');if(l)player.dir=dirOf(ix||player.vx,iy||player.vy,player.dir);
    const t0=player.trail[0];if(!t0||Math.hypot(t0[0]-player.x,t0[1]-player.y)>=4){player.trail.unshift([player.x,player.y,player.dir]);if(player.trail.length>90)player.trail.pop()}}
  if(!player.moving&&!(ix||iy)){player.walk=0;player.running=false}
  if(frozen)return;
  const c=Math.floor(player.x/TS),r=Math.floor(player.y/TS);const ex=exitsOf(cur).find(e=>inR(c,r,e.r));if(ex){takeExit(ex);return}
  const n=nearest(),p=$('prompt');if(n){const txt=n.type==='comp'?`<kbd>E</kbd> 交谈 · ${compName(n.o.m)}`:`<kbd>E</kbd> ${n.o.verb||'交谈'} · ${n.o.name}`;if(p.hidden)p.hidden=false;if(p._t!==txt){p._t=txt;p.innerHTML=txt}}else if(!p.hidden)p.hidden=true}
function endPath(talk=true){player.path=null;player.goal=null;const t=player.talkTo;player.talkTo=null;if(t&&talk)interact(t)}
// ───────── 绘制角色：行走帧按走过的距离推进；静止时站立帧 + 轻微呼吸 ─────────
function charImg(k,dir,f){const n=window.ART&&ART.frames&&ART.frames[k];
  if(n){const im=IMG[`c_${k}_${dir}_${f<n?f:0}`];if(ok(im))return im;const i0=IMG[`c_${k}_${dir}_0`];if(ok(i0))return i0}
  const im=IMG[`c_${k}_${dir}`];if(ok(im))return im;return null}
// 4 帧（站/左脚/过渡/右脚）按 左-过渡-右-过渡 循环
const CYCLE4=[1,2,3,2];
function drawChar(sp,x,y,dir='d',walk=0,t=0,opts={}){const k=spKey(sp),h=opts.h||charH(sp),n=(window.ART&&ART.frames&&ART.frames[k])|0;
  const moving=opts.moving!==undefined?opts.moving:walk>0;
  let f=0,im=null,flip=false;
  // 专用行走表（ART.walk）：按走过的距离推进，每帧步幅≈0.16×身高（可由 ART.walk[char].stride 覆盖）；站立仍用常规表第 0 帧
  // 跑步：优先 ART.run 表（r_*，步幅默认 .24×身高）；否则用行走表但步幅放大（腿频随速度升高而不致滑步）
  const rk=opts.running&&RUN[k],wk=rk||WALK[k],pre=rk?'r':'w',st=wk&&(wk.stride||(rk?.24:.16))*(opts.running&&!rk?1.2:1);
  if(moving&&wk&&wk.order.length){const i=Math.floor(walk/(h*st)),wf=wk.order[i%wk.order.length];
    im=IMG[`${pre}_${k}_${dir}_${wf}`];if(!ok(im)&&(dir==='l'||dir==='r')){im=IMG[`${pre}_${k}_${dir==='l'?'r':'l'}_${wf}`];flip=ok(im)}if(!ok(im))im=null}
  // 待机表（ART.idle）：静止时按时间逐帧播放（opts.ph 错开相位）
  if(!moving&&IDLE[k]&&IDLE[k].order.length){const I=IDLE[k],ms=I.ms&&I.ms.length?I.ms:[200],T=ms.reduce((a,b)=>a+b,0);let tt=((t+(opts.ph||0)*400)%T+T)%T,j=0;while(j<ms.length-1&&tt>=ms[j]){tt-=ms[j];j++}
    const fi=I.order[j%I.order.length];im=IMG[`i_${k}_${dir}_${fi}`];if(!ok(im)&&(dir==='l'||dir==='r')){im=IMG[`i_${k}_${dir==='l'?'r':'l'}_${fi}`];flip=ok(im)}if(!ok(im)){im=null;flip=false}}
  if(!im){if(moving&&n>1){const i=Math.floor(walk/(h*.17));f=n===4?CYCLE4[i&3]:1+i%(n-1)}
  im=charImg(k,dir,f);flip=false;
  if(!im&&(dir==='l'||dir==='r')){im=charImg(k,dir==='l'?'r':'l',f);flip=!!im}
  if(!im)im=charImg(k,'d',0)}
  if(!im&&OPT_CHARS.includes(k))return;
  const w=im?h*im.naturalWidth/im.naturalHeight:h*.45;
  // 脚底阴影
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y,Math.min(w*.42,h*.3),h*.07,0,0,7);g.fill();
  if(!im){if(!OPT_CHARS.includes(k)){g.fillStyle='#b88';g.fillRect(x-w/2,y-h,w,h)}return}
  let bob=0,sy=1,sx=1;
  if(moving){if(n<=1&&!wk){const ph=walk/(h*.1);bob=Math.abs(Math.sin(ph))*h*.035;sy=1+Math.sin(ph*2)*.015;sx=1/sy}}
  else if(!IDLE[k]){const b=Math.sin(t/650+(opts.ph||0));sy=1+b*.012;sx=1-b*.005}
  if(CHAR_GRADE_OK&&!BRIGHT)im=graded(im,(cur&&cur.grade)||CHAR_GRADE);g.save();g.translate(x,y);if(flip)sx=-sx;g.scale(sx,sy);g.drawImage(im,-w/2,-h-bob,w,h);g.restore()}
// 角色调色：略压亮度/饱和、微暖，让干净的精灵融入地图（场景可用 grade 覆盖）
// 调色结果按 (帧,调色) 缓存成离屏画布：逐帧逐角色走 ctx.filter 很贵（软件渲染下人多的场景掉帧一半）
function graded(im,f){const c=im._gr||(im._gr={});let o=c[f];if(o)return o;o=document.createElement('canvas');o.width=im.naturalWidth||im.width;o.height=im.naturalHeight||im.height;
  const x=o.getContext('2d');x.filter=f;x.drawImage(im,0,0);o.naturalWidth=o.width;o.naturalHeight=o.height;o.complete=true;return c[f]=o}
const CHAR_GRADE='brightness(.9) saturate(.84) sepia(.1)',CHAR_GRADE_OK='filter' in CanvasRenderingContext2D.prototype;
function label(txt,x,y,col='#f3e2b8'){g.font='18px "Noto Serif SC",serif';g.textAlign='center';g.lineWidth=3.5;g.strokeStyle='rgba(10,6,2,.85)';g.strokeText(txt,x,y);g.fillStyle=col;g.fillText(txt,x,y)}
// 深度排序用的复用列表（避免每帧分配闭包）
const DL=[];let DLn=0;
function dlPush(y,kind,o){let e=DL[DLn];if(!e){e={y:0,kind:0,o:null};DL[DLn]=e}e.y=y;e.kind=kind;e.o=o;DLn++}
const dlCmp=(a,b)=>a.y-b.y;
function drawMarker(t){const gl=player.goal;if(!gl)return;const a=Math.min(1,gl.t/120),p=(gl.t%900)/900;
  g.save();g.globalAlpha=.85*a;g.strokeStyle='#ffe2a0';g.lineWidth=2;
  g.beginPath();g.ellipse(gl.x,gl.y,14-p*6,5.5-p*2.3,0,0,7);g.stroke();
  g.globalAlpha=(1-p)*.6*a;g.beginPath();g.ellipse(gl.x,gl.y,8+p*14,3+p*5.5,0,0,7);g.stroke();
  const b=Math.sin(t/160)*3;g.globalAlpha=.9*a;g.fillStyle='#ffe2a0';g.beginPath();g.moveTo(gl.x-6,gl.y-22+b);g.lineTo(gl.x+6,gl.y-22+b);g.lineTo(gl.x,gl.y-13+b);g.closePath();g.fill();g.restore()}
function drawNpc(n,t,near){const x=n.x*TS,y=n.y*TS;
  if(n.sp){const h=npcH(n),id=typeof npcIdle==='function'?npcIdle(n,t,near):null;   // 待机活动见 js/idle.js
    drawChar(n.sp,x+(id?id.dx:0),y+(id?id.dy:0),id?id.dir:(n.dir||'d'),id?id.walk:0,t,{h,moving:!!(id&&id.moving),ph:n.x*1.7});if(id)npcIdleFx(n,t,x,y,h,near,id);const ty=y-h-8;
    if(near&&near.o===n)label(n.name,x,ty);else if(n.mark&&n.mark()){const b=Math.sin(t/200)*2;g.fillStyle='#e9a23b';g.beginPath();g.arc(x,ty-6+b,10,0,7);g.fill();g.strokeStyle='#2a1a0a';g.lineWidth=2;g.stroke();g.fillStyle='#2a1a0a';g.font='bold 16px serif';g.textAlign='center';g.fillText('!',x,ty+b)}
    return}
  const a=.45+Math.sin(t/260+n.x)*.4;g.fillStyle=`rgba(255,226,140,${a})`;
  for(const[dx,dy,s]of SPARK){g.fillRect(x+dx-s/2,y+dy-s*2,s,s*4);g.fillRect(x+dx-s*2,y+dy-s/2,s*4,s)}
  if(near&&near.o===n)label(n.name,x,y-22)}
const SPARK=[[0,0,4],[-9,6,2],[8,-7,2]];
let lastDraw=0;
function drawScene(t){setDims(cur);if(!cur._npcs)cur._npcs=npcsOf(cur);const fdt=Math.min(50,lastDraw?t-lastDraw:16);lastDraw=t;
  const cx=Math.round(cam.x*ZOOM)/ZOOM,cy=Math.round(cam.y*ZOOM)/ZOOM;
  g.save();g.scale(ZOOM,ZOOM);g.translate(-cx,-cy);
  // sc.under(t,dt)：画在底图之下（底图该处透明），用于渡船场景的程序化江面与卷动远岸（02 §4.5b）
  if(cur.under)cur.under(t,fdt);
  if(ok(IMG[cur.bg])){g.imageSmoothingEnabled=false;g.drawImage(IMG[cur.bg],0,0,WW,WH);g.imageSmoothingEnabled=true}else if(!cur.under){g.fillStyle='#1d1812';g.fillRect(0,0,WW,WH)}
  g.imageSmoothingQuality='high';
  if(cur.fx)cur.fx(t);
  drawWater(t,fdt);drawDucks(t,fdt);
  drawExits(t,0);
  drawMarker(t);
  const near=nearest();DLn=0;
  for(const n of cur._npcs)dlPush(n.y*TS,0,n);
  for(const w of wanderers)dlPush(w.y,1,w);
  for(const f of followers)dlPush(f.y,2,f);
  dlPush(player.y,3,player);
  const fgi=cur.fg&&IMG[cur.fg],fgOk=ok(fgi);
  if(fgOk&&cur.fgp)for(const q of cur.fgp)if(q[0]<cam.x+VW&&q[0]+q[2]>cam.x&&q[1]<cam.y+VH&&q[1]+q[3]>cam.y)dlPush(q[4],4,q);
  if(cur.cloths)for(const q of cur.cloths)dlPush(q[5]??q[1]+q[3],5,q);
  const pim=cur.props&&IMG[cur.propImg];if(ok(pim))for(const q of cur.props){const k=cur.propK||3;if(q[4]<cam.x+VW&&q[4]+q[2]*k>cam.x&&q[5]<cam.y+VH&&q[5]+q[3]*k>cam.y)dlPush(q[6],6,q)}
  DL.length=DLn;DL.sort(dlCmp);const list=DL;
  for(let i=0;i<list.length;i++){const e=list[i],o=e.o;
    if(e.kind===0)drawNpc(o,t,near);
    else if(e.kind===1)drawChar(o.sp,o.x,o.y,o.dir,o.walk,t,{moving:o.moving,ph:o.ph});
    else if(e.kind===2){const a=player.alpha??1;if(a<1)g.globalAlpha=a;drawChar(o.m,o.x,o.y,o.dir,o.walk,t,{moving:o.moving,running:o.running,ph:o.ph});g.globalAlpha=1}
    else if(e.kind===4)drawFg(fgi,o);
    else if(e.kind===5)drawCloth(o,t);
    else if(e.kind===6)drawProp(pim,o,cur.propK||3);
    else{const a=player.alpha??1;if(a<=0)continue;if(a<1)g.globalAlpha=a;drawChar('hero',o.x,o.y,o.dir,o.walk,t,{moving:o.moving,running:o.running});g.globalAlpha=1}}
  if(fgOk&&!cur.fgp)drawFg(fgi,[0,0,WW,WH]);
  drawExits(t,1);   // 出口标签画在建筑/树之上，不被遮挡
  updParticles(t);drawParticles(t);drawBirds(t,fdt);drawBubbles(fdt);
  g.restore();drawLights(t);vignette(cur.tint)}
// 前景遮挡层：fg 图与地图同尺寸（透明处为空），fgp 把它切成若干块 [x,y,w,h,底边y]（世界像素），各块按底边 y 参与深度排序：
// 站在底边以北（y 更小）的角色被屋檐/树冠/灯笼盖住，走到底边以南则画在其前面（与原作一致）
// 单体素材（建筑/树/摊位…）：props:[[atlasX,atlasY,w,h,worldX,worldY,底边y]]（atlas 为源像素，世界尺寸 ×propK，缺省 3）。
// 底图已烘焙同样的像素，这里按底边 y 与角色深度排序重画一遍：角色走到底边以北即被屋檐/树冠遮住
function drawProp(im,q,k){g.imageSmoothingEnabled=false;g.drawImage(im,q[0],q[1],q[2],q[3],q[4],q[5],q[2]*k,q[3]*k);g.imageSmoothingEnabled=true}
function drawPropsTo(x,sc,K){const im=IMG[sc.propImg];if(!ok(im))return;const k=sc.propK||3;x.imageSmoothingEnabled=false;for(const q of sc.props)x.drawImage(im,q[0],q[1],q[2],q[3],q[4]*K,q[5]*K,q[2]*k*K,q[3]*k*K)}
function drawFg(im,q){const k=im.naturalWidth/WW;g.imageSmoothingEnabled=false;g.drawImage(im,q[0]*k,q[1]*k,q[2]*k,q[3]*k,q[0],q[1],q[2],q[3]);g.imageSmoothingEnabled=true}
// 随风摆动的布（晾衣/摊布/招幌）：cloths:[[x,y,w,h,'#色',底边y?,相位?]]，上沿固定，下沿像素化摆动
function drawCloth(q,t){const[x,y,w,h,c]=q,ph=q[6]||x*.013,P=3;
  for(let yy=0;yy<h;yy+=P){const u=yy/h,off=Math.round((Math.sin(t/520+ph+u*2.2)*2.2+Math.sin(t/190+ph*1.7)*.8)*u*u/P*1.6)*P;
    g.fillStyle=yy%(P*4)<P?shade(c,-18):c;g.fillRect(Math.round(x+off),Math.round(y+yy),w,P)}
  g.fillStyle='rgba(20,12,6,.55)';g.fillRect(Math.round(x-1),Math.round(y-2),w+2,2)}
const _sh={};function shade(c,d){const k=c+d;if(_sh[k])return _sh[k];const n=parseInt(c.slice(1),16),f=v=>clamp(v+d,0,255);return _sh[k]=`rgb(${f(n>>16)},${f((n>>8)&255)},${f(n&255)})`}
function embers(x,y,c='#ffb050'){if(Math.random()<.5)particles.push({x:x+rnd(-12,12),y,vx:rnd(-.3,.3),vy:rnd(-1.1,-.4),life:50,max:50,s:rnd(2,3),c})}
function motes(){if(Math.random()<.15)particles.push({x:cam.x+rnd(0,VW),y:cam.y+rnd(0,VH),vx:rnd(-.2,.2),vy:rnd(-.2,.1),life:200,max:200,s:2,c:'rgba(255,240,200,.5)'})}

// 挖掘点
function digSpot(id,x,y,reward){return{id,name:'可疑的土堆',sp:null,x,y,verb:'挖掘',show:()=>!hasFlag('dig_'+id),
  async act(){if(!S.bag.shovel){await narr('土堆下似乎埋着什么，得找把铲子才行。');return}setFlag('dig_'+id);await reward()}}}

// ───────────────────────── 氛围：光照 / 粒子 / 水面 / 飞鸟 / 路人闲话 ─────────────────────────
// 场景可选字段（世界像素）：
//   dark:'rgba(..)'  夜色遮罩（光源处挖亮）          lights:[[x,y,r,'r,g,b',flicker]]  火光/灯笼
//   dust:true|[[c0,r0,c1,r1]]  脚下起尘的土地          water:[[c0,r0,c1,r1]]  水面粼光区域
//   ducks:[[x,y,x0,x1]]  水鸭                           birds:true  偶尔飞过的鸟群
//   leaves:true  落叶                                   smoke:[[x,y]]  炊烟/火烟
const bubbles=[];let amb={sparks:[],ducks:[],birds:[],bt:0};
let lc=null,lx=null;
function ambInit(){amb={sparks:[],ducks:(cur.ducks||[]).map(([x,y,x0,x1])=>({x,y,x0,x1,v:rnd(.012,.025)*(Math.random()<.5?-1:1),ph:Math.random()*9})),birds:[],bt:rnd(2000,6000)};
  if(cur.water)for(let i=0;i<46;i++)amb.sparks.push(newSpark(Math.random()))}
function newSpark(t0){const R=cur.water[ri(0,cur.water.length-1)];return{x:(R[0]+Math.random()*(R[2]-R[0]+1))*TS,y:(R[1]+Math.random()*(R[3]-R[1]+1))*TS,w:ri(2,6)*3,t:t0||0,d:rnd(.0006,.0012)}}
function onDirt(x,y){const d=cur.dust;if(!d)return false;if(d===true)return true;const c=Math.floor(x/TS),r=Math.floor(y/TS);return d.some(R=>inR(c,r,R))}
// 每迈一步在脚下扬起一小团土
function footDust(o,sp){const h=charH(sp),i=Math.floor(o.walk/(h*.34));if(i===o.step)return;o.step=i;if(!onDirt(o.x,o.y)||particles.length>260)return;
  for(let k=0;k<2;k++)particles.push({x:o.x+rnd(-8,8),y:o.y-rnd(0,3),vx:rnd(-.25,.25),vy:rnd(-.25,-.05),life:28,max:28,s:3,c:cur.dustC||'rgba(214,190,140,.55)',kind:1})}
function smokeAt(x,y){if(Math.random()<.08)particles.push({x:x+rnd(-6,6),y,vx:rnd(-.05,.2),vy:rnd(-.5,-.3),life:150,max:150,s:rnd(5,8),c:'rgba(150,140,130,.16)',kind:2})}
function leaves(){if(Math.random()<.05)particles.push({x:cam.x+rnd(-100,VW),y:cam.y-10,vx:rnd(.3,.7),vy:rnd(.35,.6),life:520,max:520,s:3,c:['#c8742c','#a4501e','#d99a3c','#7d6a2a'][ri(0,3)],kind:3,ph:Math.random()*9})}
function fireflies(){if(Math.random()<.03)particles.push({x:cam.x+rnd(0,VW),y:cam.y+rnd(VH*.3,VH),vx:rnd(-.15,.15),vy:rnd(-.15,.05),life:260,max:260,s:2,c:'#e8f59a',kind:4,ph:Math.random()*9})}
function updParticles(t){for(const p of particles){p.life--;
    if(p.kind===3){p.x+=p.vx+Math.sin(t/500+p.ph)*.6;p.y+=p.vy}
    else if(p.kind===4){p.x+=p.vx+Math.sin(t/700+p.ph)*.2;p.y+=p.vy+Math.cos(t/900+p.ph)*.2}
    else{p.x+=p.vx;p.y+=p.vy;if(p.kind===2){p.s+=.08;p.vx+=.002}}}
  if(particles.some(p=>p.life<=0))particles=particles.filter(p=>p.life>0)}
function drawParticles(t){for(const p of particles){const a=Math.max(0,p.life/p.max);
    if(p.kind===2){g.globalAlpha=Math.min(1,a*1.6)*(1-a*.3);g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.s,0,7);g.fill();continue}
    if(p.kind===4){g.globalAlpha=(.5+.5*Math.sin(t/180+p.ph))*Math.min(1,a*3);g.fillStyle=p.c;g.fillRect(Math.round(p.x),Math.round(p.y),2,2);continue}
    g.globalAlpha=p.kind===3?Math.min(1,a*4):a;g.fillStyle=p.c;
    if(p.kind===3){const w=Math.abs(Math.sin(t/260+p.ph))*4+1;g.fillRect(Math.round(p.x),Math.round(p.y),Math.round(w),3)}
    else if(p.kind===1){const s=p.s+(1-a)*3;g.fillRect(Math.round(p.x-s/2),Math.round(p.y-s/2),Math.round(s),Math.round(s))}
    else g.fillRect(p.x,p.y,p.s,p.s)}g.globalAlpha=1}
// 水面粼光：短横线闪烁
function drawWater(t,dt){if(!cur.water)return;g.fillStyle='#ffe9c0';
  for(let i=0;i<amb.sparks.length;i++){const s=amb.sparks[i];s.t+=s.d*dt;if(s.t>=1){amb.sparks[i]=newSpark(0);continue}
    const a=Math.sin(s.t*Math.PI);g.globalAlpha=a*.55;const w=Math.round(s.w*(.5+a*.5));g.fillRect(Math.round(s.x-w/2),Math.round(s.y),w,2)}
  g.globalAlpha=1}
// 水鸭（像素块拼成，左右游，身后拖水纹）
function drawDucks(t,dt){for(const d of amb.ducks){d.x+=d.v*dt;if(d.x<d.x0||d.x>d.x1){d.v=-d.v;d.x=clamp(d.x,d.x0,d.x1)}
  const x=Math.round(d.x),y=Math.round(d.y+Math.sin(t/400+d.ph)*1.2),f=d.v>0?1:-1;
  g.strokeStyle='rgba(255,235,200,.35)';g.lineWidth=1.5;const k=(t/900+d.ph)%1;g.globalAlpha=1-k;g.beginPath();g.ellipse(x-f*4,y+3,8+k*16,2+k*4,0,0,7);g.stroke();g.globalAlpha=1;
  // 鸭身按 3 世界像素一格绘制（与角色像素密度一致，约为主角身高的 1/4）
  g.save();g.translate(x,y);g.scale(f*3,3);
  g.fillStyle='#1e160e';g.fillRect(-6,-3,11,5);g.fillRect(2,-8,4,6);
  g.fillStyle='#4a3a26';g.fillRect(-5,-2,9,3);g.fillStyle='#7a6444';g.fillRect(-4,-3,6,2);g.fillStyle='#3a2c1c';g.fillRect(-6,-3,2,2);
  g.fillStyle='#2f5a3a';g.fillRect(3,-7,2,4);g.fillStyle='#d8d0b8';g.fillRect(3,-3,2,1);
  g.fillStyle='#d09038';g.fillRect(5,-6,2,1);g.fillStyle='#0c0a08';g.fillRect(4,-6,1,1);g.restore()}}
// 鸟群：偶尔从画面一侧飞过，翅膀扇动 + 地面投影
function drawBirds(t,dt){if(!cur.birds)return;amb.bt-=dt;
  if(amb.bt<=0){amb.bt=rnd(7000,15000);const dir=Math.random()<.5?1:-1,y=cam.y+rnd(40,VH*.5),n=ri(3,5);
    for(let i=0;i<n;i++)amb.birds.push({x:dir>0?cam.x-40-i*rnd(18,30):cam.x+VW+40+i*rnd(18,30),y:y+rnd(-24,24)+i*6,v:dir*rnd(.14,.18),vy:rnd(-.02,.01),ph:Math.random()*9})}
  for(const b of amb.birds){b.x+=b.v*dt;b.y+=b.vy*dt;const fl=Math.sin(t/70+b.ph),x=Math.round(b.x),y=Math.round(b.y);
    g.fillStyle='rgba(0,0,0,.14)';g.fillRect(x-4,y+120,8,2);
    g.fillStyle='#2a2018';g.fillRect(x-1,y-1,3,3);const wy=Math.round(fl*4);g.fillRect(x-6,y-1-wy,5,2);g.fillRect(x+3,y-1-wy,5,2)}
  if(amb.birds.length)amb.birds=amb.birds.filter(b=>b.x>cam.x-400&&b.x<cam.x+VW+400)}
// 夜色 + 光源：离屏画布铺暗色，按光源挖出光池，再叠一层暖色辉光
function drawLights(t){const L=cur.lights||[];if(!cur.dark&&!L.length)return;
  if(!lc){lc=document.createElement('canvas');lc.width=W;lc.height=H;lx=lc.getContext('2d')}
  const sx=x=>(x-cam.x)*ZOOM,sy=y=>(y-cam.y)*ZOOM;
  const fl=(l,i)=>l[2]*(1+Math.sin(t/90+i*2.1)*.03*(l[4]??1)+Math.sin(t/37+i)*.02*(l[4]??1))*ZOOM;
  if(cur.dark){lx.globalCompositeOperation='source-over';lx.clearRect(0,0,W,H);lx.fillStyle=cur.dark;lx.fillRect(0,0,W,H);lx.globalCompositeOperation='destination-out';
    const pl=[...L.map((l,i)=>[sx(l[0]),sy(l[1]),fl(l,i)*1.25]),[sx(player.x),sy(player.y-40),(cur.heroLight||110)*ZOOM]];
    for(const[x,y,r]of pl){if(x<-r||x>W+r||y<-r||y>H+r)continue;const gr=lx.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.45,'rgba(0,0,0,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=gr;lx.fillRect(x-r,y-r,r*2,r*2)}
    g.drawImage(lc,0,0)}
  g.save();g.globalCompositeOperation='lighter';
  L.forEach((l,i)=>{const x=sx(l[0]),y=sy(l[1]),r=fl(l,i);if(x<-r||x>W+r||y<-r||y>H+r)return;const gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,`rgba(${l[3]||'255,150,60'},.30)`);gr.addColorStop(.35,`rgba(${l[3]||'255,150,60'},.12)`);gr.addColorStop(1,`rgba(${l[3]||'255,150,60'},0)`);g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)});
  g.restore()}
// 路人闲话：主角走近时偶尔冒一句（像素气泡），同屏最多两个
function updBark(w,dt){if(!w.barks||!w.barks.length)return;w.bt-=dt;if(w.bt>0)return;
  const d=Math.hypot(w.x-player.x,w.y-player.y);
  if(d>230||bubbles.length>=2||busy||dlgBusy){w.bt=rnd(600,1500);return}
  bubbles.push({w,txt:w.barks[ri(0,w.barks.length-1)],t:0,dur:3400});w.bt=rnd(9000,16000)}
function drawBubbles(dt){g.font='15px "Noto Serif SC",serif';g.textAlign='center';g.textBaseline='middle';
  for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i];b.t+=dt;if(b.t>b.dur||!wanderers.includes(b.w)){bubbles.splice(i,1);continue}
    const a=Math.min(1,b.t/180,(b.dur-b.t)/300),h=charH(b.w.sp),tw=Math.ceil(g.measureText(b.txt).width)+18,th=26,
      x=Math.round(clamp(b.w.x,cam.x+tw/2+6,cam.x+VW-tw/2-6)),y=Math.round(b.w.y-h-24-(1-Math.min(1,b.t/180))*6),x0=Math.round(x-tw/2),y0=y-th/2;
    g.globalAlpha=a;
    g.fillStyle='#1b130c';g.fillRect(x0-2,y0,tw+4,th);g.fillRect(x0,y0-2,tw,th+4);
    g.fillStyle='#efe2c4';g.fillRect(x0,y0,tw,th);g.fillStyle='#d8c7a2';g.fillRect(x0,y0+th-3,tw,3);
    const tx=Math.round(clamp(b.w.x,x0+10,x0+tw-10));g.fillStyle='#1b130c';g.fillRect(tx-5,y0+th+2,10,2);g.fillRect(tx-3,y0+th+4,6,2);g.fillRect(tx-1,y0+th+6,2,2);
    g.fillStyle='#efe2c4';g.fillRect(tx-3,y0+th,6,2);g.fillRect(tx-1,y0+th+2,2,2);
    g.fillStyle='#3a2616';g.fillText(b.txt,x,y+1)}
  g.globalAlpha=1;g.textBaseline='alphabetic'}
// 出口标记：同目的地的多个出口矩形只标一次，标签放在出口区内离屏幕中心最近的点，带方向箭头
function drawExits(t,pass){const seen={},a=.3+Math.sin(t/300)*.2,cx=cam.x+VW/2,cy=cam.y+VH/2;
  for(const e of exitsOf(cur)){const[c0,r0,c1,r1]=e.r;if(!pass){g.fillStyle=`rgba(236,200,120,${a*.3})`;g.fillRect(c0*TS,r0*TS,(c1-c0+1)*TS,(r1-r0+1)*TS);continue}
    const k=e.to+'|'+e.label,px=clamp(cx,c0*TS,(c1+1)*TS),py=clamp(cy,r0*TS,(r1+1)*TS),d=Math.hypot(px-cx,py-cy);
    if(!seen[k]||d<seen[k].d)seen[k]={e,px,py,d}}
  for(const k in seen){const{e,px,py}=seen[k],[c0,r0,c1,r1]=e.r;
    const dir=exitDir(e);
    // 左右出口：标签贴画面边缘、居出口区纵向中点（不与站在出口旁的主角重叠）
    const side=dir==='l'||dir==='r',my=(r0+r1+1)/2*TS;
    const x=side?(dir==='l'?cam.x+62:cam.x+VW-62):clamp(px,cam.x+80,cam.x+VW-80),y=clamp(side?(r1+1)*TS-24:dir==='d'?py-36:py+44,cam.y+50,cam.y+VH-40);
    g.font='18px "Noto Serif SC",serif';const tw=g.measureText(e.label).width,ax=x-tw/2-14,ay=y-6,b=Math.sin(t/220)*2.5;
    label(e.label,x+8,y,'#ffe2a0');
    g.save();g.translate(Math.round(ax),Math.round(ay));g.rotate({d:0,u:Math.PI,l:Math.PI/2,r:-Math.PI/2}[dir]);g.translate(0,b);
    g.fillStyle='rgba(10,6,2,.85)';g.beginPath();g.moveTo(-8,-6);g.lineTo(8,-6);g.lineTo(0,7);g.closePath();g.fill();
    g.fillStyle='#ffe2a0';g.beginPath();g.moveTo(-5,-4);g.lineTo(5,-4);g.lineTo(0,3);g.closePath();g.fill();g.restore()}}

// 评审直达：index.html#street 跳过标题与建角，以默认角色直接进入襄阳街市
function reviewStart(){S=newState();S.name='萧白';S.st={str:4,con:4,agi:4,wil:3,wis:3};S.silver=40;S.skills.jingxin=1;
  S.flags.gate_ok=1;S.unlocked.xiangyang=1;const d=derived();S.hp=d.mhp;S.mp=d.mmp;
  mode='scene';cur=SC.street;buildGrid(cur);S.scene='street';if(cur.mapv)(S.mapv=S.mapv||{}).street=cur.mapv;player.x=cur.start[0]*TS;player.y=cur.start[1]*TS;player.dir=cur.startDir||'u';player.trail=[];spawnWanderers();snapCam();hud();placeName(cur.name)}
