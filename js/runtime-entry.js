'use strict';
// Canonical source: current Qihe workspace. Sync the library copy with sync-runtime-entry.py.
(() => {
 const canonical='http://127.0.0.1:8792/';
 const identity=document.querySelector('meta[name="xjh-runtime"]')?.content||'archive-prototype';
 const params=new URLSearchParams(location.search);
 const local=location.protocol==='file:'||['127.0.0.1','localhost','[::1]','::1'].includes(location.hostname);
 const prototype=params.get('runtimePrototype')==='1'||params.get('openingPrototype')==='1';
 const current=identity==='qihe-current';
 const runtime=window.XJHRuntime={id:identity,canonical,prototype,redirecting:false};
 const onReady=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
 function previewBanner(){
  onReady(()=>{
   const banner=document.createElement('aside');banner.id='xjh-runtime-preview';
   banner.style.cssText='position:fixed;top:0;left:0;right:0;z-index:2147483647;background:#432b23;color:#fff4d8;padding:8px 16px;text-align:center;font:14px/1.5 sans-serif';
   banner.append(document.createTextNode('历史原型预览 · '));
   const link=document.createElement('a');link.href=canonical;link.textContent='返回当前栖河游戏';link.style.color='#ffe6a2';banner.append(link);document.body.append(banner);
  });
 }
 if(prototype){previewBanner();return}
 if(!local){if(!current)previewBanner();return}
 if(!current||location.origin!=='http://127.0.0.1:8792'){
  const wrongCanonical=!current&&location.origin==='http://127.0.0.1:8792';
  const target=new URL(canonical);target.hash='qihe-map';
  const journey=params.get('journey');
  if(current&&/^[a-z0-9-]{8,64}$/.test(journey||''))target.searchParams.set('journey',journey);
  runtime.redirecting=true;
  document.documentElement.dataset.xjhRedirecting='1';
  const style=document.createElement('style');style.textContent='html[data-xjh-redirecting] body>*:not(#xjh-entry-gate){display:none!important}';document.head.append(style);
  onReady(()=>{
   const gate=document.createElement('div');gate.id='xjh-entry-gate';gate.style.cssText='position:fixed;inset:0;display:grid;place-content:center;gap:16px;background:#191611;color:#eee1c3;text-align:center;font:18px/1.7 sans-serif';
   const text=document.createElement('p');text.textContent=wrongCanonical?'8792指向了历史目录，请用“启动游戏”重新启动当前版本。':'正在进入栖河试玩 · 四向地图版';gate.append(text);
   const link=document.createElement('a');link.href=target.href;link.textContent='打开当前游戏首页';link.style.color='#e6c88c';gate.append(link);document.body.append(gate);
  });
  if(!wrongCanonical)location.replace(target.href);return;
 }
 // Unknown/deprecated chapter links must never fall through to the old title screen.
 if(!['','#qihe-map','#prologue'].includes(location.hash)){
  const target=new URL(location.href);target.hash='qihe-map';
  for(const key of ['play','openingReview','cultivationReview','chapterPresentationReview','uiReview','storyReview','battleReview'])target.searchParams.delete(key);
  history.replaceState(null,'',target.href);
 }
})();
