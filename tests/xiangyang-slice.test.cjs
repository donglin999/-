'use strict';
// node tests/xiangyang-slice.test.cjs
const assert=require('node:assert/strict');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require('/private/tmp/claude-501/pw/node_modules/playwright');
const executablePath=path.join(os.homedir(),'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const url='file://'+path.resolve(__dirname,'../index.html');

(async()=>{
  const browser=await chromium.launch({executablePath});
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(url);await page.evaluate(()=>localStorage.setItem('xjh.save','formal-sentinel'));
    await page.goto(url+'#xiangyang');await page.reload();
    await page.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene');
    const state=await page.evaluate(()=>{
      save();return{name:S.name,origin:S.origin,party:S.party.slice(),ye:PARTY_DEF.ye.name,
        formal:localStorage.getItem('xjh.save'),review:!!sessionStorage.getItem('xjh.review.save')}
    });
    assert.deepEqual(state,{name:'萧白',origin:'modern',party:['ye'],ye:'叶蘅',formal:'formal-sentinel',review:true});
    const formation=await page.evaluate(()=>{S.party.push('suzhi');adoptPet('dog');return{people:S.party.slice(),pet:S.pet,follow:partyHere(),yeSkill:mkAlly('ye').skills}});
    assert.deepEqual(formation.people,['ye','suzhi']);
    assert.equal(formation.pet,'dog');
    assert.deepEqual(formation.follow,['ye','suzhi','dog']);
    assert.ok(formation.yeSkill.includes('huichun'));
    const notice=await page.evaluate(async()=>{
      const testNpc={name:'测试伙计',x:22,y:37,act:async()=>{await giveItem('pill');await gain('任务完成')}};
      await interact(testNpc);
      return{busy,visible:document.getElementById('toast').classList.contains('on'),
        bag:S.bag.pill,queued:toastQueue.length,mode};
    });
    assert.deepEqual(notice,{busy:false,visible:true,bag:1,queued:1,mode:'scene'});
    await page.evaluate(()=>{ending('good')});
    await page.waitForSelector('#panel [data-a="roam"]');
    const result=await page.evaluate(()=>({text:document.getElementById('panel').innerText,
      flag:S.flags.xiangyang_result,chapter:S.chapter||1,map:S.bag.canglong_map||0,
      formal:localStorage.getItem('xjh.save')}));
    assert.equal(result.flag,'破案');assert.equal(result.chapter,1);assert.equal(result.map,0);
    assert.equal(result.formal,'formal-sentinel');
    assert.match(result.text,/襄阳片段/);assert.doesNotMatch(result.text,/第二章|苍龙/);
    await page.click('#panel [data-a="roam"]');
    assert.equal(await page.evaluate(()=>mode),'scene');
    await page.evaluate(()=>{S.flags.xiangyang_result=null;ending('evil')});
    await page.waitForSelector('#panel [data-a="reset"]');
    await page.click('#panel [data-a="reset"]');
    await page.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene'&&S.flags.xiangyang_slice===1);
    const reset=await page.evaluate(()=>({xq:S.flags.xq||0,result:S.flags.xiangyang_result||null,
      party:S.party.slice(),formal:localStorage.getItem('xjh.save')}));
    assert.deepEqual(reset,{xq:0,result:null,party:['ye'],formal:'formal-sentinel'});
    assert.deepEqual(errors,[]);
    process.stdout.write('xiangyang slice: fixture, formation, live notice input, isolated save, local ending and reset OK\n');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
