/* 实际UV序列在 Canvas 中播放；图像不参与养成数值结算。 */
(function(root){
'use strict';
const clips={};
const dense=typeof module==='object'&&module.exports?require('./cultivation-motion-data.js'):root.CultivationMotionData;
for(const id of ['basic','breathing','skill','fist','production','herbs','food','arts','chores','water','mail','stroll'])clips[id]={file:'assets/production/cultivation/animations/action_'+id+'_v2.png',durations:[500,500,500,500],loop:false};
clips.basic={file:'assets/production/cultivation/animations/action_basic_v4.png',frames:dense.basic,durations:Array.from({length:48},(_,i)=>Math.round((i+1)*2000/48)-Math.round(i*2000/48)),loop:false,sourceHeight:157};
const actionOverrides={B01:'breathing',K02:'fist',P01:'herbs',P02:'food',D01:'water'};
const actionClip=a=>actionOverrides[a.id]||a.category;
// 实际物件外框，避开相邻格侵入的碎片；保持各物件自身比例。
const iconRects=[[35,145,349,355],[408,124,355,380],[782,134,349,368],[1152,167,354,334],[27,525,357,392],[393,584,350,310],[769,540,356,375],[1152,554,373,365]];
const uiRects=[[88,56,382,466],[590,98,372,359],[1169,14,205,518],[91,545,370,447],[590,580,362,387],[1131,582,329,395]];
for(const [id,row] of Object.entries({calm:0,select:1,train:2,happy:3,tired:4,low:5}))clips['mood_'+id]={file:'assets/production/cultivation/animations/avatar_gestures_v4.png',frames:dense.avatar.slice(row*8,row*8+8),durations:[800,100,100,100,100,100,100,600],loop:true,sourceHeight:161,avatar:true};
function frameAt(clip,time,reduced=false){if(reduced)return 0;const d=clip.durations,total=d.reduce((a,b)=>a+b,0);let t=clip.loop?Math.max(0,time)%total:Math.min(total-1,Math.max(0,time));for(let i=0;i<d.length;i++){if(t<d[i])return i;t-=d[i];}return d.length-1;}
const images=new Map();let raf=0;
function imageFor(file){if(images.has(file))return images.get(file);const im=new Image();im.src=file;im.onerror=()=>{im.failed=true;};images.set(file,im);return im;}
function stop(){cancelAnimationFrame(raf);raf=0;}
function mount(host,onTick){stop();const born=Date.now(),canvases=[...host.querySelectorAll('canvas[data-clip],canvas[data-ui-icon],canvas[data-ui-piece]')],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function tick(){if(!host.isConnected||host.hidden){stop();return;}const now=Date.now();for(const canvas of canvases){if(canvas.dataset.uiIcon!==undefined||canvas.dataset.uiPiece!==undefined){const piece=canvas.dataset.uiPiece!==undefined,im=imageFor(piece?'assets/production/cultivation/ui/interaction_ui_v4.png':'assets/production/cultivation/ui/dock_icons_v3.png'),rect=(piece?uiRects:iconRects)[Number(piece?canvas.dataset.uiPiece:canvas.dataset.uiIcon)];if(im.failed){canvas.classList.add('cu-icon-missing');continue;}if(!rect||!im.complete||!im.naturalWidth||canvas._drawn===im)continue;const[x,y,w,h]=rect,scale=Math.min(canvas.width/w,canvas.height/h)*.93,ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(im,x,y,w,h,(canvas.width-w*scale)/2,(canvas.height-h*scale)/2,w*scale,h*scale);canvas._drawn=im;continue;}const clip=clips[canvas.dataset.clip];if(!clip)continue;const elapsed=now-Number(canvas.dataset.startedAt||born),frame=canvas.dataset.stillFrame!==undefined?Number(canvas.dataset.stillFrame):frameAt(clip,elapsed,reduced),im=imageFor(clip.file);canvas.dataset.frame=frame;
if(im.failed){canvas.classList.add('cu-sprite-missing');canvas.setAttribute('aria-label',canvas.dataset.label+'（演出素材暂缺，活动仍继续）');continue;}
if(!im.complete||!im.naturalWidth)continue;if(canvas._frame===frame&&canvas._drawn===im&&canvas._clip===canvas.dataset.clip)continue;canvas._frame=frame;canvas._clip=canvas.dataset.clip;canvas._drawn=im;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);
if(clip.frames){const f=clip.frames[frame];if(!f)continue;const[x,y,w,h]=f.rect,scale=canvas.height*.88/clip.sourceHeight,dx=canvas.width/2-f.anchor_x*scale,dy=clip.avatar?canvas.height*.06:canvas.height*.94-h*scale;ctx.drawImage(im,x,y,w,h,dx,dy,w*scale,h*scale);}else{const w=im.naturalWidth/2,h=im.naturalHeight/2;ctx.drawImage(im,(frame%2)*w,Math.floor(frame/2)*h,w,h,0,0,canvas.width,canvas.height);}}
if(onTick?.(now))return;raf=requestAnimationFrame(tick);}
raf=requestAnimationFrame(tick);}
const API={clips,actionClip,frameAt,iconRects,uiRects,mount,stop};if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationMotion=API;
})(typeof globalThis!=='undefined'?globalThis:this);
