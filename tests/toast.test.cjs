const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function harness() {
  const classNames = new Set();
  const toastEl = {
    textContent: '',
    classList: {
      add: name => classNames.add(name),
      remove: name => classNames.delete(name),
      contains: name => classNames.has(name),
    },
  };
  let now = 0;
  let timers = [];
  const context = vm.createContext({
    document: {getElementById: id => id === 'cv' ? {getContext: () => ({})} : id === 'toast' ? toastEl : {}},
    window: {},
    setTimeout(fn, delay) { timers.push({at: now + delay, fn}); },
  });
  const source = fs.readFileSync(path.join(__dirname, '../js/core.js'), 'utf8');
  vm.runInContext(`${source}\nglobalThis.testToast = toast;`, context);
  function advance(ms) {
    const end = now + ms;
    while (true) {
      timers.sort((a, b) => a.at - b.at);
      if (!timers.length || timers[0].at > end) break;
      const timer = timers.shift();
      now = timer.at;
      timer.fn();
    }
    now = end;
  }
  return {toast: context.testToast, toastEl, advance};
}

test('await toast releases interaction before the visual duration ends', async () => {
  const h = harness();
  let busy = true;
  await h.toast('新目标', 1500);
  busy = false;
  assert.equal(busy, false);
  assert.equal(h.toastEl.textContent, '新目标');
  assert.equal(h.toastEl.classList.contains('on'), true);
  h.advance(1500);
  assert.equal(h.toastEl.classList.contains('on'), false);
});

test('back-to-back item and quest notices both display in order', async () => {
  const h = harness();
  await h.toast('获得 药', 500);
  await h.toast('支线完成', 700);
  assert.equal(h.toastEl.textContent, '获得 药');
  h.advance(500);
  assert.equal(h.toastEl.classList.contains('on'), false);
  h.advance(180);
  assert.equal(h.toastEl.textContent, '支线完成');
  assert.equal(h.toastEl.classList.contains('on'), true);
  h.advance(700);
  assert.equal(h.toastEl.classList.contains('on'), false);
});
