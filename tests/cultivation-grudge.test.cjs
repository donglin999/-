'use strict';
// 2026-10-27 好感底线：开始部分已敌对的人，培养阶段的可选剧情不触发；日历必看剧情照常。
const assert=require('node:assert/strict');
const C=require('../js/qh-mode-cultivation-core'),D=require('../js/qh-mode-cultivation-data');
globalThis.QIHE_NPC_DATA={PEOPLE:{ye:{name:'叶蘅'}}};
const ready=()=>{const s=C.initial();C.join(s);s.month=6;return s;};
const opt=D.actions.find(a=>a.once&&!a.auto&&!a.main&&(a.teacher==='叶蘅'||(a.cast||[]).includes('ye')));
assert.ok(opt,'应有一段和叶蘅有关的可选剧情');
const s=ready();
globalThis.S={qiheBond:{ye:{score:-40,hostile:true}}};
assert.match(C.availability(s,opt),/闹翻/,'敌对时不触发：'+opt.id);
globalThis.S={qiheBond:{ye:{score:10,hostile:false}}};
assert.doesNotMatch(C.availability(s,opt)||'',/闹翻/,'不敌对时不拦');
const auto=D.actions.find(a=>a.auto&&(a.cast||[]).includes('ye'));
if(auto){globalThis.S={qiheBond:{ye:{score:-40,hostile:true}}};assert.doesNotMatch(C.availability(s,auto)||'',/闹翻/,'日历必看剧情不受影响')}
console.log('PASS 好感底线：',opt.id,auto?.id||'');
