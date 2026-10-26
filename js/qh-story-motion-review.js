'use strict';
// 本机试验面板（2026-10-20）：在真实剧情画面上手动触发立绘动感。动作本身已进正式样式 qh-mode-cultivation-story.css，规范见 xiaojianghu/docs/design/dialogue-staging.md「立绘动感」。
// 用法：?uiReview=1&cultivationScene=gn_lamp&storyMotion=1
// 右下角面板选“谁”和“动作”，在真实剧情画面上试；“按表情自动”会在每句台词出现时按表情挑一个动作，看连起来的节奏。
// 本文件登记在 scripts/build-pages.cjs 的 REVIEW_SCRIPTS，参数 storyMotion 登记在 REVIEW_PARAMS，不进发布包。
(()=>{
 const p=new URLSearchParams(location.search);
 if(!p.has('storyMotion')||typeof isQiheUIReview!=='function'||!isQiheUIReview())return;
 const css=`
#sm-panel{position:fixed;right:12px;bottom:12px;z-index:99999;background:rgba(20,16,12,.88);color:#f3e9d8;font:13px/1.4 system-ui,sans-serif;padding:10px 12px;border-radius:8px;max-width:330px;box-shadow:0 4px 16px rgba(0,0,0,.4)}
#sm-panel b{display:block;margin-bottom:6px;font-size:14px}
#sm-panel .row{display:flex;flex-wrap:wrap;gap:4px;margin:4px 0}
#sm-panel button{background:#3d3328;color:#f3e9d8;border:1px solid #6d5c48;border-radius:5px;padding:4px 8px;cursor:pointer;font:inherit}
#sm-panel button[aria-pressed=true]{background:#b5853e;border-color:#e0b36a;color:#1a140e}
#sm-panel small{opacity:.7;display:block;margin-top:4px}`;
 const MOTIONS=[['knock','挨打后撤'],['flee','吓得逃开'],['startle','吓一跳'],['step','上前一步'],['drag','被拖走（斜角）'],['shake','发抖'],['slump','泄气'],['nod','点头'],['enter','从侧边登场']];
 // 按表情自动挑动作（只为试节奏，正式规则以后再定）
 const AUTO={surprise:'startle',angry:'step',sad:'slump',worry:'shake',hurt_normal:'knock',fun:'startle'};
 let target='speaker',auto=false;
 const actors=()=>[...document.querySelectorAll('#cultivation .cu-visitor-story .cu-story-actor')];
 function setDir(list){list.forEach((el,i)=>{const n=list.length,side=n===1?0:i===0?-1:i===n-1?1:0;el.style.setProperty('--away',String(side||(i<n/2?-1:1)));el.style.setProperty('--toward',String(-(side||(i<n/2?-1:1))));});}
 function play(motion,el){if(!el)return;el.removeAttribute('data-motion');void el.offsetWidth;el.dataset.motion=motion;}
 function pick(){const list=actors();setDir(list);if(target==='left')return list[0];if(target==='right')return list[list.length-1];return list.find(e=>e.dataset.speaking==='true')||list[0];}
 function boot(){
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const box=document.createElement('div');box.id='sm-panel';
  box.innerHTML=`<b>立绘动感试验</b><div class="row" data-g="t">${[['speaker','说话人'],['left','左边'],['right','右边']].map(([k,l])=>`<button data-t="${k}" aria-pressed="${k===target}">${l}</button>`).join('')}</div><div class="row">${MOTIONS.map(([k,l])=>`<button data-m="${k}">${l}</button>`).join('')}</div><div class="row"><button data-reset>复位</button><button data-auto aria-pressed="false">按表情自动</button></div><small>只在本机评审画面生效；点“继续”换句时动作会重置。</small>`;
  box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
   if(b.dataset.t){target=b.dataset.t;box.querySelectorAll('[data-t]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}
   else if(b.dataset.m)play(b.dataset.m,pick());
   else if('reset' in b.dataset)actors().forEach(a=>a.removeAttribute('data-motion'));
   else if('auto' in b.dataset){auto=!auto;b.setAttribute('aria-pressed',String(auto));}});
  document.body.appendChild(box);
  // 每句台词渲染出新的场景节点：自动模式下按说话人的表情放一个动作
  new MutationObserver(()=>{if(!auto)return;const list=actors();setDir(list);const sp=list.find(e=>e.dataset.speaking==='true');if(!sp||sp.dataset.motion)return;const m=AUTO[sp.dataset.mood];if(m)play(m,sp);}).observe(document.body,{childList:true,subtree:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
