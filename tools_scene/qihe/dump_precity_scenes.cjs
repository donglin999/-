'use strict';
// 2026-10-29 进城前培养阶段逐场导出（供 302 Opus 逻辑初筛 xiaojianghu/tools_story/minimax_logic_review.py 逐场读）。
// 每场一个 md：场次信息（期数窗口、地点、在场、前置、是否可选）＋所有分支台词。
// 同一场按两套情境各取一遍：剑路线＋可选全看过、拳路线＋可选都没看；第二套里和第一套不同的句子标【另一版本】。
// 用法（工作区根目录）：node tools_scene/qihe/dump_precity_scenes.cjs --out <目录> [--until 20]
const path = require('path'), fs = require('fs'), root = path.resolve(__dirname, '../..');
const C = require(path.join(root, 'js/qh-mode-cultivation-core.js'));
const H = require(path.join(root, 'js/qh-mode-cultivation-household.js'));
const PH = require(path.join(root, 'js/qh-pre-hangao.js'));
const V = require(path.join(root, 'js/qh-mode-cultivation-visitors.js'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const until = Number(arg('until', 20)), outDir = arg('out', null);
if (!outDir) throw Error('要 --out <目录>');
fs.mkdirSync(outDir, { recursive: true });
// 说话人代号 → 名字（同 tools_story/build_pre_hangao_review.py），初筛工具按名字找人物卡
const NAMES = { hero: '萧白', hero_short: '萧白', hero_mid: '萧白', hero_long: '萧白', ye: '叶蘅', zhou: '周砚', zhong: '钟拙', shimu: '江采薇', yin: '殷红缨', fang: '方迟', dou: '卢小豆', man: '周小满', pei: '裴知古', peishu: '裴述', goose: '将军（鹅）', lu: '陆衡', recipient: '接药人', mo_songnian: '莫松年', meng_zhiwei: '孟知微', zhaochuan_courier: '照川来客' };
const N = { ...(require(path.join(root, 'js/qh-mode-cultivation-story.js')).labels), ...NAMES, title: '【字幕卡】', narrator: '【信】' };
const defs = H.definitions.map(d => ({ ...d })); PH.definitions(defs);
const visitorIds = ['visitor_songfeng_route', 'visitor_whiteheron_records', 'visitor_zhaochuan_greeting'];
const scenes = [...new Map(defs.filter(d => d.window && d.window[0] <= until && !d.hidden && !d.heart && !d.personal && !d.adultOnly).map(d => [d.id, d])).values()];
const vis = visitorIds.map(id => ({ id, visitor: true, ...(V.definitions ? V.definitions.find(x => x.id === id) || {} : {}) }));
const all = [...scenes, ...vis].sort((a, b) => (a.window?.[0] ?? 99) - (b.window?.[0] ?? 99));
const optional = scenes.filter(d => !d.auto).map(d => d.id);
function state(seenAll, route) {
  const s = C.initial(); C.join(s); s.learned = { footwork: true, sword: route === 'sword', fist: route === 'fist' };
  if (seenAll) for (const id of optional) s.facts[id + '_seen'] = { period: 0 };
  for (const d of all) s.facts[d.id + '_seen'] = s.facts[d.id + '_seen'] || (d.auto ? { period: d.window?.[0] || 0 } : s.facts[d.id + '_seen']);
  return s;
}
function lines(d, seenAll, route) {
  const s = state(seenAll, route);
  const ctx = { ...(H.extra ? H.extra(s) : PH.extra(s)), footwork: true, sword: route === 'sword', fist: route === 'fist', opening: { chen_injury: 'unknown' }, delivery: 'guided_footwork' };
  let x; try { x = V.script(d.id, ctx); } catch (e) { return ['（取稿失败：' + e.message + '）']; }
  if (!x) return ['（无台词）'];
  const L = l => (N[l.speaker] || l.speaker) + '：' + l.text, out = [];
  for (const l of x.intro || []) out.push(L(l));
  for (const c of x.choices || []) { out.push(`【选项${c.key ? ' ' + c.key : ''}】${c.text || ''}${c.effects ? '　（结果：' + JSON.stringify(c.effects) + '）' : ''}`); for (const l of c.lines || []) out.push('　' + L(l)); }
  for (const l of x.closing || []) out.push(L(l));
  return out;
}
const index = [];
for (const d of all) {
  const a = lines(d, true, 'sword'), b = lines(d, false, 'fist'), seenA = new Set(a);
  const extra = b.filter(l => !seenA.has(l));
  const meta = { id: d.id, 名称: d.name, 期数窗口: d.window, 地点: d.place, 时段: d.time, 固定或可选: d.visitor ? '来客' : d.auto ? '固定' : '可选', 在场: d.cast, 前置: d.requires, 前置事实: d.factRequires };
  const md = [`=== ${d.id} ===`, `# ${d.name}（${d.id}）`, '', '场次信息：' + JSON.stringify(meta, null, 0), '', '## 台词（剑路线、可选剧情都看过）', ...a,
    ...(extra.length ? ['', '## 【另一版本】拳路线、可选剧情都没看时不同的句子', ...extra] : [])].join('\n') + '\n';
  const f = path.join(outDir, `${String(d.window?.[0] ?? 99).padStart(2, '0')}-${d.id}.md`); fs.writeFileSync(f, md);
  index.push(`${path.basename(f)}　${d.name}（${meta.固定或可选}）`);
}
fs.writeFileSync(path.join(outDir, '_index.txt'), index.join('\n') + '\n');
console.log(index.length + ' 场');
