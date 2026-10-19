'use strict';
// Isolated UI contract test: no real voice server, provider requests, or saved bindings.
// Run: node tests/voice-admin.test.cjs
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
let playwright;
try { playwright = require(process.env.XJH_PLAYWRIGHT_MODULE || 'playwright'); }
catch { playwright = require('/private/tmp/claude-501/pw/node_modules/playwright'); }
const root = path.resolve(__dirname, '..');
const executablePath = process.env.XJH_BROWSER_EXE || path.join(os.homedir(), 'Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const candidate = { slug: 'soft', voice_id: 'voice_a', name: '柔声', pitch: 0, speed: 1, preview_available: true };
const state = {
  mode: 'real', provider: 'minimax', auto_preview: {status: 'running', total: 6, completed: 3, failed: 1}, bindings: {}, jobs: [],
  characters: [
    { id: 'suzhi', name: '苏芷', por: 'p_suzhi', lines: [{ text: '按住肩。', tag: '急救' }, { text: '别松。', tag: '急切' }, { text: '稳住了。', tag: '安心' }], cands: [candidate] },
    { id: 'ye', name: '叶蘅', por: 'p_ye', lines: [{ text: '我来。', tag: '坚定' }, { text: '你别急。', tag: '安慰' }, { text: '好些了吗？', tag: '担心' }], cands: [candidate, { ...candidate, slug: 'new', voice_id: 'voice_b', preview_available: false, preview_status: 'failed' }] },
  ],
  lines: [
    { id: 's1', character_id: 'suzhi', text: '按住肩。', kind: 'dialogue', status: 'missing', source: { scene: 'street', event: 'rescue' } },
    { id: 's2', character_id: 'suzhi', text: '别松。', kind: 'emotion', status: 'failed', emotion: '急切' },
    { id: 's3', character_id: 'suzhi', text: '慢慢来。', kind: 'dialogue', status: 'mock_ready', mock: true, audio_url: '/api/audio/s3' },
    { id: 'y1', character_id: 'ye', text: '我来扶住他。', kind: 'dialogue', status: 'unbound' },
  ],
};
(async () => {
  const server = http.createServer(async (request, response) => {
    try {
      const filename = path.resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
      if (!filename.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
      const bytes = await fs.readFile(filename);
      response.setHeader('Content-Type', filename.endsWith('.js') ? 'application/javascript' : filename.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream');
      response.end(bytes);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await playwright.chromium.launch({ executablePath });
    const page = await browser.newPage();
    const errors = [], posts = [];
    let rejectExpansionOnce=false;
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', async route => {
      const request = route.request(), pathname = new URL(request.url()).pathname;
      let result = state;
      if (request.method() === 'POST') {
        const body = request.postDataJSON();
        posts.push({ pathname, body });
        if(pathname==='/api/candidates/expand'&&rejectExpansionOnce){rejectExpansionOnce=false;await route.fulfill({status:409,json:{error:'本角色已有任务，请完成后再增加候选'}});return}
        if (pathname === '/api/bind') {
          state.bindings[body.character_id] = { ...candidate, candidate_slug: body.candidate_slug };
          const job = { id: 'binding-job', character_id: body.character_id, status: 'completed', total: 3, completed: 3, failed: 0, type: 'lines' };
          state.jobs.push(job);
          result = { binding: state.bindings[body.character_id], job };
        } else {
          result = { job: { id: 'isolated-job' } };
        }
      }
      await route.fulfill({ json: result });
    });
    await page.goto(`http://127.0.0.1:${server.address().port}/review/voice_pick.html`);
    await page.waitForFunction(() => document.querySelector('#serviceStatus').textContent.includes('MiniMax'));
    assert.match(await page.locator('#previewProgress').innerText(), /完成 3 \/ 6/);
    assert.equal(posts.length, 0, 'opening the page does not ask users to trigger initial audition preparation');
    await page.evaluate(() => {
      window.__previewPlayed = [];window.__previewEnded=[];
      Object.defineProperty(HTMLMediaElement.prototype,'src',{configurable:true,get(){return this.__fakeSrc},set(v){this.__fakeSrc=new URL(v,location.href).href}});
      HTMLMediaElement.prototype.play = function () { window.__previewPlayed.push(this.src); setTimeout(()=>this.onpause?.(),3);setTimeout(() => {window.__previewEnded.push(this.src);this.onended?.()}, 10); return Promise.resolve(); };
      HTMLMediaElement.prototype.pause = function () { this.onpause?.(); };
    });
    assert.match(await page.locator('.all').first().innerText(), /连播 3 句/);
    await page.locator('.all').first().click();
    await page.waitForFunction(() => window.__previewEnded.length === 3);
    assert.deepEqual(await page.evaluate(() => window.__previewPlayed.map(u => new URL(u).pathname.split('/').at(-1))), ['soft_0.mp3','soft_1.mp3','soft_2.mp3'], 'one click auditions all three distinct sample sentences');
    assert.deepEqual(await page.evaluate(() => window.__previewEnded.map(u => new URL(u).pathname.split('/').at(-1))), ['soft_0.mp3','soft_1.mp3','soft_2.mp3'], 'pause events cannot advance before each sentence has ended');
    assert.equal(await page.locator('#lineRows tr').count(), 3, 'all current-role utterances are listed');
    assert.match(await page.locator('#lineRows').innerText(), /按住肩。/);
    assert.match(await page.locator('#lineRows').innerText(), /别松。/);
    assert.match(await page.locator('#lineRows').innerText(), /模拟完成/);
    assert.equal(await page.locator('[data-line="s3"]').isDisabled(), true, 'mock audio must not look like playable production audio');
    assert.equal(await page.locator('#fillMissing').isDisabled(), true, 'cannot fill without a confirmed binding');
    state.jobs.push({id:'preview-busy',character_id:'suzhi',type:'preview',candidate_slug:'another',status:'running',total:3,completed:1});
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#serviceStatus').textContent.includes('MiniMax'));
    assert.equal(await page.locator('.choose').isDisabled(), false, 'a ready voice can be chosen while another audition is generating');
    await page.locator('.choose').click();
    assert.equal(posts.length, 0, 'candidate choice must not commit before explicit confirmation');
    await page.locator('#confirmBind').click();
    await page.waitForFunction(() => document.querySelector('#pick').textContent.includes('已确认'));
    assert.deepEqual(posts[0], { pathname: '/api/bind', body: { character_id: 'suzhi', candidate_slug: 'soft', confirm: true } });
    assert.equal(await page.locator('#fillMissing').isDisabled(), false, 'background audition does not block incremental formal dialogue generation');
    await page.locator('#fillMissing').click();
    await page.waitForFunction(() => !document.querySelector('#fillMissing').disabled);
    assert.deepEqual(posts[1], { pathname: '/api/jobs', body: { character_id: 'suzhi', mode: 'missing' } }, 'fill submits only the current character');
    await page.locator('#retryFailed').click();
    await page.waitForFunction(() => !document.querySelector('#retryFailed').disabled);
    assert.deepEqual(posts[2], { pathname: '/api/jobs', body: { character_id: 'suzhi', mode: 'retry' } });
    await page.locator('.ch').filter({ hasText: '叶蘅' }).click();
    assert.equal(await page.locator('#lineRows tr').count(), 1, 'changing character changes the complete utterance list');
    assert.match(await page.locator('#lineRows').innerText(), /我来扶住他。/);
    assert.equal(await page.locator('.choose').nth(0).isDisabled(), true, 'another character cannot take an occupied base voice');
    assert.equal(await page.locator('.choose').nth(1).isDisabled(), true, 'a voice without audition samples cannot be confirmed');
    await page.locator('.preview').click();
    await page.waitForFunction(() => !document.querySelector('.preview').disabled);
    assert.equal(posts.length, 4, 'failed audition retry submits directly without another confirmation modal');
    assert.deepEqual(posts[3], { pathname: '/api/previews', body: { character_id: 'ye', candidate_slug: 'new' } });
    state.characters.push({id:'lady',name:'柳三娘',voice_mode:'single',lines:[{text:'哎哟，才子又来啦？',tag:'热络'}],cands:[{...candidate,slug:'npc',voice_id:'voice_a',used_by:['suzhi','ye'],voice_locked:false,preview_urls:['/api/preview/lady/npc/2?v=test']}]});
    state.lines.push({id:'npc.one',character_id:'lady',text:'哎哟，才子又来啦？',kind:'emotion',status:'unbound'});
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#serviceStatus').textContent.includes('MiniMax'));
    assert.doesNotMatch(await page.locator('#list').innerText(), /柳三娘/, 'single NPCs belong to their separate page');
    await page.goto(`http://127.0.0.1:${server.address().port}/review/voice_npc.html#lady`);
    await page.waitForFunction(() => document.querySelector('#cname').textContent==='柳三娘');
    assert.equal(await page.locator('.ch').count(),1);
    assert.equal(await page.locator('#lineRows tr').count(),1);
    assert.match(await page.locator('.all').innerText(), /试听这一句/);
    assert.equal(await page.locator('.choose').isDisabled(),false,'NPC may reuse a used voice');
    assert.match(await page.locator('#grid .used').innerText(),/苏芷、叶蘅/,'show every voice user by name');
    assert.doesNotMatch(await page.locator('#list').innerText(), /苏芷|叶蘅/);
    await page.locator('.choose').click();
    assert.equal(posts.length,4,'NPC voice still requires explicit confirmation');
    assert.match(await page.locator('#bindDetails').innerText(),/本角色仅配这一句/);
    await page.locator('#confirmBind').click();
    await page.waitForFunction(() => document.querySelector('#pick').textContent.includes('已确认'));
    assert.deepEqual(posts[4],{pathname:'/api/bind',body:{character_id:'lady',candidate_slug:'npc',confirm:true}});
    const beforeExpand=posts.length;
    await page.locator('#expandVoices').click();
    assert.match(await page.locator('#expandName').innerText(),/柳三娘/);
    await page.locator('#voicePrompt').fill('成熟温柔，亲切柔和');
    await page.locator('#voiceExpandCount').selectOption('2');
    await page.locator('#voiceExpandMode').selectOption('design');
    assert.match(await page.locator('#expandHint').innerText(),/Voice Design/);
    await page.locator('#cancelExpand').click();
    assert.equal(posts.length,beforeExpand,'canceling an expansion never calls the provider');
    await page.locator('#expandVoices').click();
    await page.getByRole('button',{name:'阴险冷酷',exact:true}).click();
    await page.locator('#voiceExpandCount').selectOption('3');
    rejectExpansionOnce=true;
    await page.locator('#submitExpand').click();
    await page.waitForFunction(()=>document.querySelector('#expandError').textContent.includes('已有任务'));
    assert.equal(await page.locator('#expandDialog').evaluate(el=>el.open),true,'errors remain visible inside the dialog');
    const failedRequest=posts.at(-1);
    await page.locator('#submitExpand').click();
    await page.waitForFunction(()=>!document.querySelector('#expandDialog').open);
    assert.deepEqual(posts.at(-1).body,failedRequest.body,'submission retry retains the same idempotency token');
    const expansion=posts.at(-1);
    assert.equal(expansion.pathname,'/api/candidates/expand');
    assert.equal(expansion.body.character_id,'lady');
    assert.equal(expansion.body.mode,'tune');
    assert.equal(expansion.body.count,3);
    assert.match(expansion.body.prompt,/阴险/);
    assert.match(expansion.body.request_id,/^[a-f0-9-]{36}$/);
    assert.equal(posts.filter(p=>p.pathname==='/api/bind').length,2,'adding candidates does not bind a voice');
    assert.deepEqual(errors, [], 'UI must not raise browser exceptions');
    console.log('voice admin: confirmation, voice exclusivity, full utterance list, incremental fill, direct audition retry and multi-sentence playback contracts OK');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
