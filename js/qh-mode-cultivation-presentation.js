/* V8 原生六帧整幅原画；游戏使用独立审图页的同套素材与节奏，不再扭曲旧图。 */
(function(root){
'use strict';
// 萧白头像随入谷过渡的发型阶段切换（短发→半长→长发）。
const HQ='assets/production/cultivation/household-v1/',heroForms={short:{file:HQ+'hero_short.png',rect:[60,0,720,720],noBlink:true},mid:{file:HQ+'hero_mid.png',rect:[170,90,600,600],noBlink:true},long:{file:HQ+'hero_long.png',rect:[90,0,680,680],noBlink:true}};
const base='assets/production/cultivation/v5/',atlas={
 frame:{file:base+'guidance-atlas.png',rect:[564,176,544,462]},
 hero:{file:'assets/production/cultivation/household-v1/hero_long.png',rect:[90,0,680,680],noBlink:true},
 blink:{file:base+'avatar-atlas.png',rect:[566,207,357,350]},
 B05:{file:base+'basic-atlas.png',rect:[1053,748,100,126]},
 return:{file:'assets/production/cultivation/mail-v7/return.png',rect:[0,0,1254,1254]},
 gift:{file:'assets/production/cultivation/mail-v7/pouch.png',rect:[0,0,1254,1254]}
};
const actionLoops=root.CultivationActionArt,images=new Map(),durations=[280,220,240,340,420,500];let raf=0;
const effects={B01:'qi'},qiHandAnchors=[[.5389,.7437],[.5417,.6909],[.5385,.6609],[.5457,.6177],[.5401,.6833],[.5382,.7310]];
function loopPhase(elapsed,clip=null){const ms=clip?.durations||durations,total=ms.reduce((a,b)=>a+b,0),position=((elapsed%total)+total)%total;let t=position;for(let i=0;i<ms.length;i++){if(t<ms[i])return {frame:clip?.order?.[i]??i,beat:i,mix:t/ms[i],elapsed:position};t-=ms[i];}return {frame:clip?.order?.[ms.length-1]??ms.length-1,beat:ms.length-1,mix:0,elapsed:position};}
function elapsedFor(c,now){const frame=c.closest('.cu-training-frame');if(frame?.classList.contains('cu-playing'))return frame.dataset.startedAt?Math.max(0,now-Number(frame.dataset.startedAt)):0;if(c._start===undefined)c._start=now;return now-c._start;}
function imageFor(file){if(images.has(file))return images.get(file);const im=new Image();im.failed=false;im.onerror=()=>{im.failed=true;};im.src=file;images.set(file,im);return im;}
function fit(ctx,im,rect,w,h,scale=1,offset=null){const [x,y,sw,sh]=rect,unit=Math.min(w/sw,h/sh),k=unit*scale,box={x:(w-sw*k)/2+(offset?.dx||0)*unit,y:(h-sh*k)/2+(offset?.dy||0)*unit,width:sw*k,height:sh*k};ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x,y,sw,sh,box.x,box.y,box.width,box.height);return box;}
function fitLoop(ctx,im,clip,frame,w,h){const sw=im.naturalWidth/clip.columns,sh=im.naturalHeight/clip.rows,rect=[frame%clip.columns*sw,Math.floor(frame/clip.columns)*sh,sw,sh],registration=clip.registration,offset=registration?.frames[frame];
 if(!clip.presentation)return fit(ctx,im,rect,w,h,registration?.commonScale||1,offset);
 // Fit one union of all registered frames. The camera stays fixed while the
 // moving hand/bucket remains inside the frame; transparent sheet margins do
 // not decide the displayed character size.
 const [bx,by,bw,bh]=clip.presentation.bounds,unit=Math.min(w/bw,h/bh),scale=registration.commonScale,k=unit*scale;
 const box={x:(w-bw*unit)/2-bx*unit+(sw-sw*scale)/2*unit+offset.dx*unit,y:(h-bh*unit)/2-by*unit+(sh-sh*scale)/2*unit+offset.dy*unit,width:sw*k,height:sh*k};
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,...rect,box.x,box.y,box.width,box.height);return box;
}
function still(action){if(action.storyPortrait)return {file:action.storyPortrait,rect:action.portraitRect};const clip=actionLoops[action.id];return clip?{file:clip.file,rect:[0,0,512,512]}:atlas[action.id];}
function fallback(c){c.classList.add('cu-art-missing');if(!c.dataset.failed){c.setAttribute('aria-label',(c.getAttribute('aria-label')||'素材')+'（画面暂缺）');c.dataset.failed='true';}}
function draw(c,now,reduced){
 // 静态图标直接采样到实际显示密度，避免先拉成512再被CSS二次缩小。
 if(['icon','return','gift'].includes(c.dataset.art)){const r=c.getBoundingClientRect(),size=Math.max(1,Math.min(1024,Math.round(r.width*(root.devicePixelRatio||1))));if(c.width!==size||c.height!==size){c.width=size;c.height=size;c._drawn=null;}}

 // 头像按实际显示尺寸及屏幕像素比采样，避免先放大到512再缩成几十像素造成碎线。
 if(c.dataset.art==='avatar'){const size=Math.max(1,Math.min(512,Math.round(c.getBoundingClientRect().width*(root.devicePixelRatio||1))));if(c.width!==size||c.height!==size){c.width=size;c.height=size;}}
 const ctx=c.getContext('2d'),id=c.dataset.art;let w=c.width,h=c.height;
 if(id==='avatar'){
  // 心情头像是独立的一套美术（2026-10-11 用户）：高兴、正常、低落、烦躁四张，直接铺满圆框；图没到位时退回下面的旧画法。
  {const state=c.closest('.cu-mood')?.dataset.mood||'calm',mv=imageFor('assets/production/cultivation/mood-avatars-v1/'+state+'.png');
   if(!mv.failed){if(!mv.complete||!mv.naturalWidth)return;if(c._drawn===mv&&c._avatarSize===w)return;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.clearRect(0,0,w,h);ctx.save();ctx.beginPath();ctx.arc(w/2,h/2,w*.49,0,Math.PI*2);ctx.clip();ctx.drawImage(mv,0,0,w,h);ctx.restore();c._drawn=mv;c._avatarSize=w;c._poseBox={x:0,y:0,width:w,height:h};return;}}
  const form=root.CultivationHousehold?.heroForm?.(typeof S!=='undefined'?S?.cultivation:null),spec=heroForms[form]||atlas.hero,avatarMood={calm:'normal',happy:'smile',low:'sad',annoyed:'angry'}[c.closest('.cu-mood')?.dataset.mood]||'normal',moodIm=heroForms[form]?imageFor(HQ+'hero_'+form+'_'+avatarMood+'.png'):null,im=moodIm&&!moodIm.failed?moodIm:imageFor(spec.file),closed=imageFor(atlas.blink.file);if(im.failed){fallback(c);return;}if(!im.complete||!im.naturalWidth)return;
  const phase=now%4200,blink=!spec.noBlink&&!reduced&&phase>3400&&phase<3550;if(c._drawn===im&&c._avatarBlink===blink&&c._avatarSize===w)return;
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.clearRect(0,0,w,h);ctx.save();ctx.beginPath();ctx.arc(w/2,h/2,w*.49,0,Math.PI*2);ctx.clip();
  // 使用已确认头像审图中的完整发束与肩部，等比取景；眨眼只替换两只眼睛。
  const box=c._poseBox=fit(ctx,im,spec.rect,w,h);
  if(blink&&closed.complete&&closed.naturalWidth){for(const r of [[150,180,73,61],[253,201,72,63]]){const [x,y,sw,sh]=r,k=box.width/spec.rect[2];ctx.save();ctx.beginPath();ctx.ellipse(box.x+(x+sw/2)*k,box.y+(y+sh/2)*k,sw*k/2,sh*k/2,0,0,Math.PI*2);ctx.clip();ctx.drawImage(closed,atlas.blink.rect[0]+x,atlas.blink.rect[1]+y,sw,sh,box.x+x*k,box.y+y*k,sw*k,sh*k);ctx.restore();}}
  ctx.restore();c.dataset.frame=blink?'1':'0';c._drawn=im;c._avatarBlink=blink;c._avatarSize=w;return;
 }
 const clipId=c.dataset.action||(id==='guidance'?'G01':id==='ye-hand'?'G02':id),clip=actionLoops[clipId];
 if(clip){
  if(clip.presentation||root.CultivationStory?.enabled){const r=c.getBoundingClientRect(),density=Math.min(root.devicePixelRatio||1,2048/Math.max(r.width,r.height,1)),cw=Math.max(1,Math.round(r.width*density)),ch=Math.max(1,Math.round(r.height*density));if(c.width!==cw||c.height!==ch){c.width=cw;c.height=ch;c._frame=undefined;c._drawn=null;}w=c.width;h=c.height;}
  const im=imageFor(clip.file);c.dataset.clip=clipId;c.dataset.source=clip.file;
  if(im.failed){fallback(c);return;}if(!im.complete||!im.naturalWidth)return;
  const board=c.closest('.cu-training-frame'),playing=board&&(board.classList.contains('cu-playing')||board.classList.contains('cu-story-frame'));
  const phase=loopPhase(elapsedFor(c,now),clip),frame=reduced?0:playing?phase.frame:board?.dataset.finished==='true'?(clip.restFrame??5):0;
  if(c._frame!==frame||c._drawn!==im){ctx.clearRect(0,0,w,h);c._poseBox=fitLoop(ctx,im,clip,frame,w,h);c._drawn=im;c._frame=frame;}
  c.dataset.motion=playing&&!reduced?'six-frame-sprite':'static';c.dataset.frame=String(frame);c.dataset.beat=String(phase.beat);c.dataset.motionVersion=clip.motionVersion||'redraw-v8';return;
 }
 let spec=atlas[id];if(id==='icon')spec={file:'assets/production/cultivation/ui/dock_icons_v3.png',rect:CultivationMotion.iconRects[+c.dataset.index]};
 if(!spec){fallback(c);return;}const im=imageFor(spec.file);if(im.failed){fallback(c);return;}if(!im.complete||!im.naturalWidth||c._drawn===im)return;
 ctx.clearRect(0,0,w,h);
 if(id==='frame'){
  // 木边只绘一次，中央纯色由 CSS 独立提供。
  const [x,y,sw,sh]=spec.rect,b=16,dx=b/sw*w,dy=b/sh*h;
  ctx.drawImage(im,x,y,sw,b,0,0,w,dy);ctx.drawImage(im,x,y+sh-b,sw,b,0,h-dy,w,dy);
  ctx.drawImage(im,x,y+b,b,sh-2*b,0,dy,dx,h-2*dy);ctx.drawImage(im,x+sw-b,y+b,b,sh-2*b,w-dx,dy,dx,h-2*dy);
 }else c._poseBox=fit(ctx,im,spec.rect,w,h);
 c._drawn=im;c.dataset.frame='0';
}
function ensureEffects(host){for(const frame of host.querySelectorAll('.cu-training-frame')){const actor=frame.querySelector('[data-art="action"]');if(actor?.dataset.action!=='B01'||frame.querySelector('.cu-environment'))continue;const c=document.createElement('canvas');c.className='cu-environment';c.width=544;c.height=462;c.dataset.effect='qi';c._actor=actor;c.setAttribute('aria-hidden','true');frame.appendChild(c);}}
function environment(c,now,reduced){
 const ctx=c.getContext('2d'),w=c.width,h=c.height,a=c._actor;ctx.clearRect(0,0,w,h);if(reduced||!a?._drawn||a.dataset.motion==='static'){c.dataset.motion='static';return;}
 const phase=loopPhase(elapsedFor(a,now)),levels=[.16,.45,1,.9,.4,.16],gain=levels[phase.frame]+(levels[(phase.frame+1)%6]-levels[phase.frame])*phase.mix;
 // 光锚从实际 Canvas 的含图区域转换到画框，宽屏/窄屏均准确跟随掌间。
 const ar=a.getBoundingClientRect(),fr=c.getBoundingClientRect(),b=a._poseBox,anchor=qiHandAnchors[phase.frame];if(!fr.width||!fr.height)return;
 const x=(ar.left-fr.left+(b.x+b.width*anchor[0])*ar.width/a.width)*w/fr.width,y=(ar.top-fr.top+(b.y+b.height*anchor[1])*ar.height/a.height)*h/fr.height,radius=w*(.012+.024*gain);
 c.dataset.motion='environment';c.dataset.frame=String(phase.frame);c.dataset.anchor=JSON.stringify([x,y]);ctx.save();ctx.beginPath();ctx.rect(w*.04,h*.04,w*.92,h*.92);ctx.clip();
 const aura=ctx.createRadialGradient(x,y,0,x,y,w*.14);aura.addColorStop(0,`rgba(247,204,78,${.035+.18*gain})`);aura.addColorStop(.55,`rgba(239,188,49,${.02+.13*gain})`);aura.addColorStop(1,'rgba(239,188,49,0)');ctx.fillStyle=aura;ctx.fillRect(x-w*.14,y-w*.14,w*.28,w*.28);
 const glow=ctx.createRadialGradient(x,y,0,x,y,radius);glow.addColorStop(0,`rgba(255,254,215,${.30+.65*gain})`);glow.addColorStop(.25,`rgba(255,241,143,${.24+.56*gain})`);glow.addColorStop(1,'rgba(232,167,33,0)');ctx.fillStyle=glow;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);ctx.restore();
}
function stop(){cancelAnimationFrame(raf);raf=0;}
function renderReviewFrame(host,elapsed){stop();ensureEffects(host);const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;for(const c of host.querySelectorAll('canvas[data-art]')){c._start=0;const frame=c.closest('.cu-training-frame');if(frame?.classList.contains('cu-playing'))frame.dataset.startedAt='0';draw(c,elapsed,reduced);}for(const c of host.querySelectorAll('.cu-environment'))environment(c,elapsed,reduced);}
function mount(host,onTick){stop();CultivationMotion.stop();ensureEffects(host);const canvases=[...host.querySelectorAll('canvas[data-art]')],fx=[...host.querySelectorAll('.cu-environment')];
 function tick(){if(!host.isConnected||host.hidden){stop();return;}const now=Date.now(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;for(const c of canvases)draw(c,now,reduced);for(const c of fx)environment(c,now,reduced);if(onTick?.(now))return;raf=requestAnimationFrame(tick);}raf=requestAnimationFrame(tick);
}
root.CultivationPresentation={atlas,poseFor:still,actionLoops,effects,qiHandAnchors,loopPhase,imageFor,mount,stop,renderReviewFrame};
})(window);
