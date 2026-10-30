'use strict';
// 关系变化的地图提示（faction-reputation.md 第 8 节、渲染图 review/faction-reputation/02-map-toast.png，第七轮已确认）。
// 两层：① 人物头顶小签——只写他本人的关系变化与落在哪一档（“−10 冷淡”）；
//      ② 右上角纸签——势力、声誉的变化逐条滑入，跨档时多一枚朱印“落入××”，停 4 秒收起。地图不暂停。
// 2026-10-27 接线（用户第二十轮 23 看不懂“纸签、头顶小签没接”，这次做出来附截图）。
(()=>{
 if(typeof isQiheEntry!=='function'||!isQiheEntry())return;
 const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
 const sign=n=>(n>0?'+':'−')+Math.abs(n);
 let box=null;
 function ensure(){const g=document.getElementById('game');if(!g)return null;if(!box||!box.isConnected){box=document.createElement('div');box.id='qj-slips';g.appendChild(box)}return box}
 // 右上纸签：rows=[{glyph,name,delta,reason,cross,color}]
 function slips(rows){try{slipsRaw(rows)}catch(e){}}
 function slipsRaw(rows){const b=ensure();if(!b||!rows.length)return;
  for(const r of rows){const el=document.createElement('div');el.className='qj-slip'+(r.delta<0?' neg':' pos');
   el.innerHTML=`<i class="qj-g" style="background:${esc(r.color||'#3a3a32')}">${esc(r.glyph)}</i><b>${esc(r.name)}</b><em>${esc(sign(r.delta))}</em><span>${esc(r.reason||'')}</span>${r.cross?`<u>${esc(r.cross)}</u>`:''}`;
   b.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
   setTimeout(()=>{el.classList.remove('on');el.classList.add('off');setTimeout(()=>el.remove(),400)},4000)}
  while(b.children.length>4)b.firstElementChild.remove()}
 // 头顶小签：跟着人物在画面上的位置（人物站着不走，取一次位置即可）
  // 提示只是表现：任何一步出错都吞掉，不能拖垮好感、偷窃的结算（测试环境没有样式接口）
 function head(npcId,text,kind){try{headRaw(npcId,text,kind)}catch(e){}}
 function headRaw(npcId,text,kind){const g=document.getElementById('game'),cv=document.getElementById('cv');if(!g||!cv||!cur?.npcs)return;
  const names=window.QIHE_NPC_DATA?.PEOPLE?.[npcId]?.npc||[];const n=(cur._npcs||cur.npcs).find(x=>x.id===npcId||names.includes(x.name));if(!n)return;
  const c=cv.getBoundingClientRect(),r=g.getBoundingClientRect(),s=c.width/(W/ZOOM),p=typeof npcPos==='function'?npcPos(n):{x:n.x*TS,y:n.y*TS},h=typeof npcH==='function'?npcH(n):80;
  const el=document.createElement('div');el.className='qj-head '+(kind||'');el.textContent=text;
  const k=window.UIScale?.zoom||1;   // #game 的界面子元素统一 zoom＝--ui-zoom（index.html、js/ui-scale.js）：屏幕像素要除回去
  el.style.left=(c.left-r.left+(p.x-cam.x)*s)/k+'px';el.style.top=((c.top-r.top+(p.y-h-cam.y)*s)/k-18)+'px';g.appendChild(el);
  requestAnimationFrame(()=>el.classList.add('on'));setTimeout(()=>{el.classList.remove('on');setTimeout(()=>el.remove(),400)},2600)}
 window.QiheJianghuSlips={slips,head,sign};
})();
