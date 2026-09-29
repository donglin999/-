'use strict';
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
    await page.goto(url+'#xiangyang');
    await page.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene');
    const art=await page.evaluate(()=>Object.fromEntries(['ye','liu','zhou','langli'].map(id=>[id,{
      portrait:!!IMG['p_'+id]?.naturalWidth,sprite:!!IMG['s_'+id]?.naturalWidth,
      frame:!!IMG['c_'+id+'_d_0']?.naturalWidth
    }])));
    assert.ok(Object.values(art).every(a=>a.portrait&&a.sprite&&a.frame),JSON.stringify(art));
    await page.waitForFunction(()=>EXPR.ye.every(e=>IMG['p_ye_'+e]?.naturalWidth));
    const expressions=await page.evaluate(()=>({
      count:EXPR.ye.length,smile:face('c_ye:smile'),battle:porKey({por:'ye',hp:100,mhp:100}),hurt:porKey({por:'ye',hp:20,mhp:100})
    }));
    assert.equal(expressions.count,7);
    assert.ok(expressions.smile.includes('p_ye_smile.webp'));
    assert.equal(expressions.battle,'ye_battle');assert.equal(expressions.hurt,'ye_hurt');
    const cgDone=page.evaluate(()=>xyCG('assets/cg_zhou_rescue.webp','街心救治'));
    await page.waitForSelector('.xy-cg img');
    assert.ok(await page.locator('.xy-cg img').evaluate(img=>img.naturalWidth>0));
    await page.click('.xy-cg button');await cgDone;
    assert.equal(await page.locator('.xy-cg').count(),0);
    await page.evaluate(()=>{
      window.__xy={choices:[],fights:[],lines:[]};
      choose=async()=>{if(!__xy.choices.length)throw Error('missing choice');return __xy.choices.shift()};
      say=async(w,t,sp)=>{__xy.lines.push(w+':'+t+'|'+(sp||''))};
      xyCG=async()=>{};
      toast=async()=>{};gain=async()=>{};battle=async()=>__xy.fights.shift()||'win';
    });
    const act=async(id,choices=[],fights=[])=>page.evaluate(async({id,choices,fights})=>{
      __xy.choices=choices;__xy.fights=fights;
      const n=SC.street.npcs.find(n=>n.id===id);await n.act(n);
      if(__xy.choices.length)throw Error('unused choices '+__xy.choices);
    },{id,choices,fights});
    await act('zhou',[0]);
    await act('gossip');
    await act('lady',[0]);
    let state=await page.evaluate(()=>({xq:XQ(),party:S.party.slice(),bowl:S.bag.tea_bowl,ye:hasFlag('ye_referral_offer'),lines:__xy.lines.slice()}));
    assert.equal(state.xq,2);assert.deepEqual(state.party,['ye']);assert.equal(state.bowl,1);
    assert.ok(state.lines.some(s=>s.includes('叶蘅:')));
    assert.ok(state.lines.some(s=>s.endsWith('|c_ye:worry')));
    await act('liu',[0,0],['win']);
    state=await page.evaluate(()=>({xq:XQ(),antidote:S.bag.jieyao,ledger:S.bag.ledger,fate:S.flags.xq_fate}));
    assert.deepEqual(state,{xq:3,antidote:1,ledger:1,fate:'guard'});
    await act('suzhi',[0,0]);
    state=await page.evaluate(()=>({xq:XQ(),party:S.party.slice(),saved:hasFlag('xq_saved'),referral:hasFlag('ye_referral_offer'),ferry:S.unlocked.ferry,antidote:S.bag.jieyao}));
    assert.deepEqual(state,{xq:5,party:['ye','suzhi'],saved:true,referral:true,ferry:1,antidote:0});
    assert.ok(await page.evaluate(()=>__xy.lines.some(s=>s.endsWith('|c_ye:shy'))));
    assert.equal(await page.evaluate(()=>SC.street.npcs.find(n=>n.id==='xy_caseboard').show()),true);
    await act('xy_caseboard',[0]);
    await page.waitForSelector('#panel [data-a="roam"]');
    assert.equal(await page.evaluate(()=>S.flags.xiangyang_result),'救人结案');
    await page.click('#panel [data-a="roam"]');
    assert.equal(await page.evaluate(()=>mode),'scene');
    // A local closure can be upgraded by a later deep chase. Su Zhi may have
    // stayed in town, so the cave scene must not give her off-screen dialogue.
    await page.evaluate(async()=>{
      S.party=S.party.filter(id=>id!=='suzhi');__xy.lines=[];
      const chief=SC.cave.npcs.find(n=>n.id==='chief');await chief.act(chief);
    });
    assert.equal(await page.evaluate(()=>S.flags.xiangyang_result),'破案');
    assert.equal(await page.evaluate(()=>S.bag.ferry_tag),1);
    assert.equal(await page.evaluate(()=>__xy.lines.some(s=>s.startsWith('苏芷:'))),false);
    assert.deepEqual(errors,[]);
    const other=await browser.newPage();const otherErrors=[];other.on('pageerror',e=>otherErrors.push(e.message));
    await other.goto(url+'#xiangyang');await other.waitForFunction(()=>typeof mode!=='undefined'&&mode==='scene');
    await other.evaluate(()=>{
      window.__xy2={choices:[],lines:[]};
      choose=async()=>__xy2.choices.shift();say=async(w,t)=>__xy2.lines.push(w+':'+t);
      xyCG=async()=>{};
      toast=async()=>{};gain=async()=>{};battle=async()=> 'win';
    });
    const actOther=(id,choices=[])=>other.evaluate(async({id,choices})=>{
      __xy2.choices=choices;
      const n=SC.street.npcs.find(n=>n.id===id);await n.act(n);
      if(__xy2.choices.length)throw Error('unused choices '+__xy2.choices);
    },{id,choices});
    await actOther('zhou',[0]);await actOther('gossip');await actOther('oldman');
    await actOther('liu',[0,0]);await actOther('suzhi',[0,1]);
    assert.deepEqual(await other.evaluate(()=>({xq:XQ(),party:S.party,bowl:S.bag.tea_bowl||0,ferry:S.unlocked.ferry})),
      {xq:4,party:['ye'],bowl:0,ferry:1});
    assert.equal(await other.evaluate(()=>__xy2.lines.some(s=>s.includes('碗我留着'))),false);
    await actOther('xy_caseboard',[0]);
    const report2=await other.locator('#panel').innerText();
    assert.ok(report2.includes('老周获救'));assert.ok(!report2.includes('茶碗'));
    assert.deepEqual(otherErrors,[]);await other.close();
    process.stdout.write('Xiangyang chapter: art, rescue, evidence, local closure and deep-chase upgrade OK\n');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
