// 用无头 Chrome 截「关系」页 1280×720。用法：node shot-rep.mjs <输出目录>
import {spawn} from 'node:child_process';import fs from 'node:fs';
const out=process.argv[2],Wd=+(process.argv[3]||1280),Hd=+(process.argv[4]||720);fs.mkdirSync(out,{recursive:true});
const prof='/private/tmp/claude-501/-Users-wuxiuxiang-project-luotuozhuan/8caadf52-134e-4a03-a05f-d5912b8a159b/scratchpad/rep/prof';
const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-port=9334',`--window-size=${Wd},${Hd}`,'--user-data-dir='+prof,'--no-first-run','about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let tgt;for(let i=0;i<50;i++){try{const l=await (await fetch('http://127.0.0.1:9334/json')).json();tgt=l.find(t=>t.type==='page');if(tgt)break}catch(e){}await sleep(200)}
const ws=new WebSocket(tgt.webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);let id=0;const wait=new Map();
ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&wait.has(d.id)){wait.get(d.id)(d);wait.delete(d.id)}};
const cmd=(method,params={})=>new Promise(r=>{const i=++id;wait.set(i,r);ws.send(JSON.stringify({id:i,method,params}))});
const ev=async js=>{const r=await cmd('Runtime.evaluate',{expression:js,awaitPromise:true,returnByValue:true});if(r.result?.exceptionDetails)console.log('ERR',JSON.stringify(r.result.exceptionDetails).slice(0,800));return r.result?.result?.value};
const shot=async(name,clip)=>{const r=await cmd('Page.captureScreenshot',{format:'png',...(clip?{clip:{...clip,scale:clip.scale||1}}:{})});fs.writeFileSync(out+'/'+name,Buffer.from(r.result.data,'base64'));console.log('shot',name)};
await cmd('Network.enable');await cmd('Network.setCacheDisabled',{cacheDisabled:true});
await cmd('Emulation.setDeviceMetricsOverride',{width:Wd,height:Hd,deviceScaleFactor:1,mobile:false});
await cmd('Page.navigate',{url:'http://127.0.0.1:8792/?uiReview=1&play=1#qihe-map'});await sleep(7000);
const base=`S=newState();S.name='萧白';S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';`;
const hideHint=`document.querySelectorAll('.qh-hint,#hint,.hint').forEach(e=>e.style.display='none');`;
// A 新档：一方都没遇到
console.log(await ev(base+`QiheJianghuUI.open('rep');new Promise(r=>setTimeout(()=>r(document.querySelector('.qjr-fl')?'old':'ok'),900))`));
await shot('01-新档-空状态.png');
await shot('01z-声誉条-zoom.png',{x:0,y:80,width:1280,height:90,scale:1.5});
await shot('01t-页签图标-zoom.png',{x:300,y:0,width:680,height:84,scale:2});
console.log('fame box',await ev(`JSON.stringify([...document.querySelectorAll('.qjr-flab,.qjr-fscale,.qjr-mk,.qjr-seg.qjr-cur')].map(e=>{const r=e.getBoundingClientRect();return [e.className,Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}))`));
await ev(`QiheJianghuUI.close?.();1`);
// B 有关系变化：叶蘅在队伍、周婶 +12、帮众 −15、护院 −10、声誉 +12
console.log(await ev(base+`S.party=['ye'];QiheNpc.bond.add('aunt',12);QiheNpc.bond.add('bandit',-15);QiheNpc.bond.add('retainer',-10);QiheNpc.bond.add('boatman',6);QiheJianghu.settle('story',{faction:{qihe:7,patrol:2},fame:12});QiheJianghuUI.open('rep');new Promise(r=>setTimeout(()=>r(JSON.stringify(QiheJianghu.ensure().faction)),900))`));
await shot('02-有关系-默认选中.png');
await ev(`document.querySelector('[data-qjr="faction"][data-id="qihe"]').click();1`);await sleep(1200);await shot('03-栖河村.png');
await shot('03z-成员卡-zoom.png',{x:460,y:250,width:820,height:300,scale:1.5});
console.log('qihe members',await ev(`JSON.stringify(QiheJianghuRepUI._test.members('qihe').map(m=>[m.n,m.r,m.st,m.v,m.met]))`));
await ev(`document.querySelector('[data-qjr="faction"][data-id="guijintang"]').click();1`);await sleep(1000);await shot('04-归烬堂.png');
await ev(`document.querySelector('[data-qjr="faction"][data-id="alliance"]').click();1`);await sleep(1000);await shot('05-正道盟.png');
await ev(`document.querySelector('[data-qjr="group"][data-id="sect"]').click();1`);await sleep(600);await shot('06-门派组收起.png');
// C 声誉负值、−25
console.log(await ev(base+`QiheJianghu.ensure().fame=-25;QiheNpc.bond.add('wukui'in QIHE_NPC_DATA.PEOPLE?'wukui':'bandit',-30);QiheNpc.bond.add('censhuang',-8);QiheJianghuUI.close?.();QiheJianghuUI.open('rep');new Promise(r=>setTimeout(()=>r(1),900))`));
await shot('07-声誉负值.png');
console.log('errors',await ev(`JSON.stringify(window.__errs||null)`));
ws.close();chrome.kill();process.exit(0);
