process.env.PW_TEST_SCREENSHOT_NO_FONTS_READY='1';
const {chromium}=require('/Users/wuxiuxiang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=process.argv[2];fs.mkdirSync(out,{recursive:true});
const maxSteps=+process.argv[3]||3000;
(async()=>{const b=await chromium.launch({executablePath:'/Users/wuxiuxiang/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell'});
const p=await b.newPage({viewport:{width:1280,height:720}});
const log={errors:[],console:[],bad:[],imgs:new Set()};
p.on('pageerror',e=>log.errors.push(e.message));
p.on('console',m=>{if(['error','warning'].includes(m.type()))log.console.push(m.text())});
p.on('response',r=>{const u=r.url();if(r.status()>=400)log.bad.push(r.status()+' '+u);if(/\.(png|webp|jpg|svg)/.test(u))log.imgs.add(u.replace(/^.*?8792\//,''))});
p.on('requestfailed',r=>log.bad.push('FAIL '+r.url()+' '+r.failure()?.errorText));
await p.addInitScript(()=>localStorage.setItem('xjh.save','FINALE_SENTINEL'));await p.goto('http://127.0.0.1:8792/?battleReview=clash&tail=1&play=1#qihe-map');await p.waitForTimeout(2500);
await p.screenshot({path:path.join(out,'000-title.png')});
await p.mouse.click(20,20);await p.waitForTimeout(2000);
const seen=new Set();let n=1,idle=0,bidle=0;const done=new Set();
for(let i=0;i<maxSteps;i++){
 const s=await p.evaluate(()=>{const d=document.getElementById('dlg');
 const q=window.QiheChapter?.state?.();
 const vis=e=>{const r=e.getBoundingClientRect();return r.width>8&&r.height>8&&getComputedStyle(e).visibility!=='hidden'&&e.offsetParent!==null};
 const imgs=[...document.querySelectorAll('img')].filter(vis).map(i=>{const r=i.getBoundingClientRect();return {src:i.src.replace(/^.*?8792\//,'').slice(0,90),w:Math.round(r.width),h:Math.round(r.height),nw:i.naturalWidth,nh:i.naturalHeight,ok:i.complete&&i.naturalWidth>0,fit:getComputedStyle(i).objectFit}});
 const bgs=[...document.querySelectorAll('*')].filter(vis).map(e=>{const m=getComputedStyle(e).backgroundImage.match(/url\("([^"]+)"\)/);return m&&!m[1].startsWith('data:')?m[1].replace(/^.*?8792\//,''):null}).filter(Boolean);
 return{stage:q?.stage,half:q?.halfDay,mode:typeof mode!=='undefined'?mode:null,map:typeof cur!=='undefined'&&cur?.id,dlg:d&&!d.hidden,name:d&&!d.hidden?(d.querySelector('.nm,.name,.who')?.textContent||''):'',text:d?.querySelector('.txt')?.textContent?.slice(0,50),options:d&&!d.hidden?[...d.querySelectorAll('.choices button')].map(x=>x.textContent):[],imgs,bgs:[...new Set(bgs)],busy:typeof busy!=='undefined'&&busy,running:window.QiheChapter?.running,auto:!!document.querySelector('#bt-auto:not([hidden]):not(.on)'),cg:document.querySelector('#qh-fire-cg')?.dataset?.shot,clash:!!window.QiheFactionClash?.playing}});
 const key=JSON.stringify([s.map,s.mode,s.name,s.cg,s.imgs.map(x=>x.src).sort(),s.bgs.sort()]);
 if(!seen.has(key)){seen.add(key);const f=String(n++).padStart(3,'0')+'-'+(s.stage||'x')+'-'+(s.map||'')+'-'+(s.name||'').replace(/[\/\s]/g,'');await p.screenshot({path:path.join(out,f+'.png')});fs.appendFileSync(path.join(out,'states.jsonl'),JSON.stringify({f,...s})+'\n')}
 if(s.stage==='cultivation'&&!s.dlg&&!s.busy)break;
 if(s.options.length){let idx=s.options.findIndex(x=>/开始|现在开始|继续/.test(x));await p.locator('#dlg .choices button').nth(idx<0?0:idx).click().catch(()=>{});idle=0}
 else if(s.dlg){await p.locator('#dlg').click({force:true,position:{x:300,y:60}}).catch(()=>{});idle=0}
 else if(s.mode==='battle'&&s.clash){idle=0;if(s.auto)await p.click('#bt-auto').catch(()=>{})}
 else if(s.mode==='battle'){bidle++;if(s.auto){await p.click('#bt-auto').catch(()=>{})}else{await p.keyboard.press('Enter');}
   if(bidle>25){await p.evaluate(()=>{try{B.foes.forEach(u=>u.hp=0)}catch(e){}});} idle=0}
 else if(s.busy||s.running){idle++;await p.keyboard.press('Space').catch(()=>{});if(idle>60){await p.keyboard.press('Space')}}
 else {bidle=0;idle++;
  if(idle>3){idle=0;const act=await p.evaluate((doneArr)=>{const q=QiheChapter.state();
   if(q.stage==='days'){for(const a of QiheChapter.activities){if(!q.choices[a[0]]&&QiheChapter.activityOpen(a[0])&&!doneArr.includes('act-'+a[0])){QiheChapter.activity(a[0]);return 'act-'+a[0]}}
     const m=QiheChapter.mainStep(q);if(m){const tag='main-'+m.to+'-'+(q.mainDismissed??'');if(cur.id===m.scene){delete q.mainDismissed;QiheExpansion.refresh();QiheChapter.interact(m.npc);return 'talk-'+m.to+'-'+Date.now()}
       if(m.scene.startsWith('prologue_'))QihePrologue.goLocal(m.scene.replace('prologue_',''));else QiheExpansion.go(m.scene.replace('qh_',''));return 'go-'+m.scene+'-'+Date.now()}
     QiheChapter.rest();return 'rest'}
   QiheChapter.rest();return 'rest-'+q.stage+'-'+Date.now()},[...done]);
   done.add(act);fs.appendFileSync(path.join(out,'actions.log'),i+' '+act+'\n');await p.waitForTimeout(800)}}
 await p.waitForTimeout(250);
}
const fin=await p.evaluate(()=>({stage:window.QiheChapter?.state?.(),map:cur?.id}));
fs.writeFileSync(path.join(out,'log.json'),JSON.stringify({...log,imgs:[...log.imgs],fin},null,1));
await b.close()})();
