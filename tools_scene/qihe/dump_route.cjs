'use strict';
// 按“玩家看过哪些可选剧情”导出一条实际会播的剧情路线全文，供冷读审读“漏看可选剧情后，固定剧情还说得通吗”。
// 规范：xiaojianghu/docs/design/optional-story-dependencies.md
// 用法（工作区根目录）：
//   node tools_scene/qihe/dump_route.cjs --seen none            只看固定剧情（所有可选都没触发）
//   node tools_scene/qihe/dump_route.cjs --seen all             全部可选都看了
//   node tools_scene/qihe/dump_route.cjs --seen gn_lamp,gn_cook 只看了列出的可选剧情
//   可加 --until 20（只导到第几期，默认 20＝进城）--list（只列场次不出台词）--out 文件
// 规则：固定剧情（auto）总会出现；可选剧情只在列入 --seen、且自身前置事实满足时出现。按窗口起点、同期按运行时顺序排列。
const path = require('path'), fs = require('fs'), root = path.resolve(__dirname, '../..');
const C = require(path.join(root, 'js/qh-mode-cultivation-core.js'));
const H = require(path.join(root, 'js/qh-mode-cultivation-household.js'));
const PH = require(path.join(root, 'js/qh-pre-hangao.js'));
const V = require(path.join(root, 'js/qh-mode-cultivation-visitors.js'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const until = Number(arg('until', 20)), seenArg = arg('seen', 'none'), listOnly = process.argv.includes('--list'), route = arg('route', 'sword');  // --route sword|fist：武学路线，拳剑那场按此选
const N = { hero: '萧白', title: '【字幕卡】', narrator: '【信】', ...(require(path.join(root, 'js/qh-mode-cultivation-story.js')).labels) };
const defs = H.definitions.map(d => ({ ...d })); PH.definitions(defs);
const uniq = [...new Map(defs.filter(d => d.window && d.window[0] <= until && !d.hidden && !d.heart && !d.personal && !d.adultOnly).map(d => [d.id, d])).values()];
const optional = uniq.filter(d => !d.auto).map(d => d.id);
const want = seenArg === 'all' ? new Set(optional) : seenArg === 'none' ? new Set() : new Set(seenArg.split(','));
const rank = { gy_m08: 1, gn_depart: 2, hg_road: 4, hg_gate: 5 };
uniq.sort((a, b) => a.window[0] - b.window[0] || (rank[a.id] || 0) - (rank[b.id] || 0));
const s = C.initial(); C.join(s); s.learned = { footwork: true, sword: route === 'sword', fist: route === 'fist' };
const out = [`# 剧情路线：看过的可选剧情＝${seenArg}；武学路线＝${route}（到第 ${until} 期）`, '', '固定剧情总会出现；【可选】是本路线看了的可选剧情；【漏】是可选但本路线没看的（只列名字）。', ''];
for (const d of uniq) {
  const isOpt = !d.auto, factsOk = (d.factRequires || []).every(f => s.facts[f]) && (d.requires || []).every(r => ['joined', 'stance', 'herb_labels', 'promise_scope', 'first_delivery', 'xiangyang_invitation'].includes(r) || s.facts[r]);
  const forced = isOpt && want.has(d.id) && !factsOk && seenArg === 'all' && (d.factRequires || []).every(f => !f.endsWith('_seen'));  // 前置事实来自其他剧情的结算（本工具不跑结算），全看路线照样导出
  if (isOpt && !(want.has(d.id) && (factsOk || forced))) { out.push(`- 【漏】${d.name}（${d.id}）${want.has(d.id) && !factsOk ? '：想看但前置没满足 ' + JSON.stringify(d.factRequires || []) : ''}`); continue; }
  out.push('', `## ${isOpt ? '【可选】' : ''}${d.name}（${d.id}，第 ${d.window[0]}～${d.window[1]} 期）${forced ? '（前置事实由其他剧情结算产生，按已满足导出）' : ''}`);
  if (!listOnly) {
    let x; try { const ctx = { ...H.extra ? H.extra(s) : PH.extra(s), footwork: true, sword: route === 'sword', fist: route === 'fist', opening: { chen_injury: 'unknown' }, delivery: 'guided_footwork' }; x = V.script(d.id, ctx); } catch (e) { out.push('（取稿失败：' + e.message + '）'); }
    if (x) { const L = l => (N[l.speaker] || l.speaker) + '：' + l.text;
      for (const l of x.intro) out.push(L(l)); const c = (d.id === 'gy_fist_or_sword' && x.choices.find(k => k.key === route)) || x.choices[0]; if (c) { if (c.text) out.push('【选项】' + c.text); for (const l of c.lines) out.push('　' + L(l)); } for (const l of x.closing) out.push(L(l)); }
  }
  s.facts[d.id + '_seen'] = { period: d.window[0] }; if (d.id === 'gn_depart') s.facts['hg.pre.farewell_seen'] = true;
  if (d.id === 'gy_m07') { s.facts.xiangyang_invitation = true; s.facts.hangao_invitation = true; }
}
const text = out.join('\n') + '\n', file = arg('out', null);
if (file) fs.writeFileSync(file, text); else process.stdout.write(text);
