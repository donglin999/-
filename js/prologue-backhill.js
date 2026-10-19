'use strict';
// PI-2026-10-04.2: a fixed-foot scene, never a modern-costume exploration map.
(() => {
 const id='prologue_backhill',asset='m_prologue_backhill_v1';
 const P=window.PROLOGUE_BACKHILL_PROPS;   // 模块化道具层（js/prologue-backhill-props.js）；缺失时退回整图
 if(isQiheEntry()){for(const f of [asset,P?.propImg])if(f&&!ASSETS.includes(f))ASSETS.push(f)}
 const k=1/ZOOM,point=p=>p.map(v=>v*k),at=p=>point(p).map(v=>v/TS);
 // Keep the complete static figures above the dialogue panel, on the path.
 const poses={encounter:{hero:[490,330],ye:[620,315]},dog:{hero:[580,330],ye:[740,315],dog:[350,330]}};
 let locked=false,pose='encounter',pending=null,dogVisible=false,clinicCast=null,hintNode=null,oldHint=null;
 const sc=SC[id]={name:'栖河村后山 · 午后',bg:asset,...(P?{propImg:P.propImg,propK:P.propK,props:P.props}:{}),gw:W*k/TS,gh:H*k/TS,
  mapv:1,previewKey:'prologue_backhill',artMapKey:'prologue_backhill',start:at(poses.encounter.hero),startDir:'r',
  arrivalWalk:false,noFollow:true,playerSp:'opening_hero_modern',walk:[[0,0,W*k/TS,H*k/TS]],block:[],exits:[],npcs:[],
  surfaceHeight:()=>0,under(){if(ok(IMG[asset]))return;g.fillStyle='#66755a';g.fillRect(0,0,W*k,H*k);
   g.fillStyle='#b2a080';g.beginPath();g.moveTo(180*k,H*k);g.lineTo(410*k,140*k);g.lineTo(700*k,140*k);g.lineTo(830*k,H*k);g.fill();},
  fx(){if(!ok(IMG[asset]))sc.under();if(sc.holdingRod){g.save();g.strokeStyle='#725132';g.lineWidth=5*k;
   g.beginPath();g.moveTo(player.x-18*k,player.y-39*k);g.lineTo(player.x+28*k,player.y-44*k);g.stroke();g.restore();}}
 };
 const fixedScene=()=>locked||cur===sc||(S?.scene?.startsWith('prologue_')&&S.prologue?.arrival?.borrowed===false&&S.prologue.arrival.stage!=='done');
 function fixed(){keys={};player.path=null;player.goal=null;player.talkTo=null;player.vx=player.vy=0;player.walk=0;player.moving=false;player.running=false;player.runK=0;}
 function sceneHint(enabled){hintNode||=document.querySelector?.('.hint');if(!hintNode)return;
  if(oldHint===null)oldHint=hintNode.textContent;
  hintNode.textContent=enabled?'点击对白 / 空格推进 · 点击选项或按数字选择':oldHint;
 }
 function registerStaticDog(){const meta=window.PROLOGUE_MODERN_ART?.wilddog||{file:'s_prologue_wilddog_v1',facing:'r',footY:96},im=IMG[meta.file];if(!ok(im))return false;
  // A single right-facing pose, not a fabricated four-direction animation sheet.
  IMG['c_prologue_wilddog_'+meta.facing]=im;
  if(typeof charBounds==='function'){const box=charBounds(im);im._charBounds={...box,bottom:meta.footY,height:Math.max(1,meta.footY-box.top)}}
  return true;
 }
 // 2026-10-17 试玩反馈：后山两只狼原来用的是 Q 版小狼（c_wolf），和写实人物不搭、显得好笑。
 // 改为取战斗灰狼 b_wolf 的待机第 0 帧做静态站姿，地图和战斗是同一种狼。
 // 2026-10-17 灰狼战斗表换成高密度版后，格子尺寸与文件名都从 BART.wolf 读，不再写死。
 // 新格子上下留白多（狼身只占格高约 40%），地图绘制会把它当成非直立精灵按整格缩放而变得很小；
 // 所以裁到第 0 帧不透明范围（四周留 2px），让狼身高度仍等于 NPC 的 h。
 const wolfArt=()=>window.BART&&BART.wolf;
 function registerStaticWolf(){const A=wolfArt(),im=A&&IMG[A.file];if(!ok(im))return false;if(IMG.c_backhill_wolf_r)return true;
  const [cw,ch]=A.cell,f=document.createElement('canvas');f.width=cw;f.height=ch;const fx=f.getContext('2d',{willReadFrequently:true});fx.drawImage(im,0,0,cw,ch,0,0,cw,ch);
  const a=fx.getImageData(0,0,cw,ch).data;let x0=cw,y0=ch,x1=0,y1=0;for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(a[(y*cw+x)*4+3]>=48){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<x0){x0=0;y0=0;x1=cw-1;y1=ch-1}x0=Math.max(0,x0-2);y0=Math.max(0,y0-2);x1=Math.min(cw-1,x1+2);const w=x1-x0+1,h=y1-y0+1;
  const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(f,x0,y0,w,h,0,0,w,h);
  c.complete=true;c.naturalWidth=w;c.naturalHeight=h;IMG.c_backhill_wolf_r=c;if(typeof charBounds==='function')c._charBounds=charBounds(c);return true;
 }
 function camera(){if(cur!==sc)return;cam.x=0;cam.y=0;camC.x=W*k/2;camC.y=H*k/2;}
 async function ready(){if(pending)return pending;pending=(async()=>{
  const files=[asset,'s_opening_hero_modern','s_prologue_wilddog_v1',wolfArt()?.file||'b_wolf',...(P?[P.propImg]:[])];
  const results=await Promise.all(files.map(f=>ok(IMG[f])?true:loadOpt(f,f)));
  if(results[1]||results[2])sliceSheets();
  registerStaticDog();registerStaticWolf();
  if(!results.every(Boolean))toast('部分后山素材暂未载入，可先继续对白；再次进入会重试。',2600);
  return results.every(Boolean);
 })();try{return await pending}finally{pending=null}}
 function actors(){const p=poses[pose],n=[{id:'pb_ye',name:'叶蘅',sp:'c_ye',x:at(p.ye)[0],y:at(p.ye)[1],dir:'l',fixed:true,staticScene:true,act:async()=>{}}];
  if(dogVisible)n.push({id:'pb_wilddog',name:'受惊灰狼',sp:IMG.c_backhill_wolf_r?'c_backhill_wolf':'c_wolf',x:at(p.dog)[0],y:at(p.dog)[1],h:52,dir:'r',fixed:true,staticScene:true,act:async()=>{}});
  if(dogVisible)n.push({...n[n.length-1],id:'pb_wolf2',x:at([430,330])[0],y:at([430,330])[1]});
  sc.npcs=n;sc._npcs=npcsOf(sc);
 }
 async function show(next='encounter',{dog=next==='dog',rod=false,transition=true}={}){
  locked=true;fixed();if(window.OpeningCharacters)OpeningCharacters.modernEvent=true;
  await ready();pose=next;dogVisible=dog;sc.holdingRod=rod;actors();
  if(cur!==sc){await goScene(id,at(poses[pose].hero),'r');busy=true}
  else if(transition)await fade(()=>{const p=point(poses[pose].hero);player.x=p[0];player.y=p[1]});
  const p=point(poses[pose].hero);player.x=p[0];player.y=p[1];player.dir=dog?'l':'r';
  player.alpha=ok(IMG.s_opening_hero_modern)?1:0;fixed();camera();
  document.body.classList?.add('prologue-fixed-scene');
  sceneHint(true);
  return sc;
 }
 function guard(value=true){sc.holdingRod=value;fixed()}
 async function retreat(){if(cur!==sc)return;await fade(()=>{dogVisible=false;actors()});busy=true;fixed();camera()}
 function clinic(){if(!cur||clinicCast)return;const m=window.CHAPTER1_V2_MAPS?.clinic_interior;
  if(!m?.anchors.cot_side)return;
  // Image-reviewed floor points in m_opening_v4_clinic_interior.png (1536×1024):
  // Ye stands south-west of the screen, Chen east of the guest bench/water table.
  // Neither inherits a furniture interaction anchor as an actor's standing point.
  const scale=(m.worldW||m.worldSize?.[0]||1536*.72)/1536;
  const foot=m.anchors.cot_side.map(v=>v*3),ye=[400,600].map(v=>v*scale),chen=[650,670].map(v=>v*scale);
  clinicCast={scene:cur,npcs:cur.npcs};player.x=foot[0];player.y=foot[1];player.dir='r';fixed();
  cur.npcs=[...cur.npcs,{id:'pa_clinic_ye',name:'叶蘅',sp:'c_ye',x:ye[0]/TS,y:ye[1]/TS,dir:'u',fixed:true,staticScene:true,act:async()=>{}},
   {id:'pa_clinic_chen',name:'陈伯',sp:'c_opening_chen',x:chen[0]/TS,y:chen[1]/TS,dir:'l',fixed:true,staticScene:true,act:async()=>{}}];
  cur._npcs=npcsOf(cur);snapCam();
 }
 function clearClinic(){if(!clinicCast)return;const c=clinicCast;clinicCast=null;c.scene.npcs=c.npcs;c.scene._npcs=npcsOf(c.scene)}
 function release(){locked=false;sc.holdingRod=false;fixed();document.body.classList?.remove('prologue-fixed-scene');sceneHint(fixedScene())}
 const oldPath=setPath;setPath=function(...args){if(fixedScene()&&mode==='scene'){fixed();return null}return oldPath(...args)};
 const oldUpdate=updateScene;updateScene=function(dt){if(!fixedScene()||mode!=='scene')return oldUpdate(dt);
  const wasBusy=busy;fixed();busy=true;try{return oldUpdate(dt)}finally{busy=wasBusy;fixed();camera()}};
 if(typeof npcIdle==='function'){const oldIdle=npcIdle;npcIdle=function(n,...args){return n.staticScene?null:oldIdle(n,...args)}}
 if(typeof npcIdleFx==='function'){const oldFx=npcIdleFx;npcIdleFx=function(n,...args){if(!n.staticScene)return oldFx(n,...args)}}
 // Dialogue choice navigation continues to receive arrows. The scene mover is frozen above.
 if(typeof cv!=='undefined')cv.addEventListener('pointerdown',e=>{if(fixedScene()&&mode==='scene'){e.preventDefault();e.stopImmediatePropagation()}},true);
 if(typeof questLine==='function'){const oldQuest=questLine;questLine=function(){return cur===sc?(pose==='dog'?'与叶蘅配合，观察狼的行动意图。':'先站稳，跟叶姑娘说话。'):oldQuest()};window.questLine=questLine}
 window.PrologueBackhill={id,asset,poses,ready,show,guard,retreat,clinic,clearClinic,release,fixed,camera,registerStaticDog,get locked(){return locked},get pose(){return pose},get dogVisible(){return dogVisible}};
})();
