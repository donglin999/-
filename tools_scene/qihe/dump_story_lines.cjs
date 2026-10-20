// 把培养模式里所有剧情台词导出成 JSON，供文档库的剧情文案检查（xiaojianghu/tools_docs/story_lint.py）使用。
// 用法：node tools_scene/qihe/dump_story_lines.cjs > 输出.json
// 每条：{source, scene, title, window, speaker, text, mood, moods, part}；part 为 intro／choice／branch／closing／result／letter。
// 2026-10-20 起走游戏实际播出的路径 CultivationVisitors.script()：被进城前完善版（qh-pre-hangao-data.js）接管的场次，
// 导出的是真正播出的那一版，不再是 household 里不播的旧稿（排查报告 docs/updates/2026-10-20-pre-city-story-audit.md T-1）。
// 同一场戏按武学路线、送药方式、裴家结果、关系高低、陈伯伤情、有无兵器、是否满十八等上下文各取一遍再去重。
// 信件内容卡（speaker 为 narrator 且带 letterAuthor）按“信·写信人”导出，不当成旁白。
const path = require('path');
const root = path.resolve(__dirname, '../../js');
const V = require(path.join(root, 'qh-mode-cultivation-visitors.js'));
const H = V.household;
const D = require(path.join(root, 'qh-mode-cultivation-data.js'));
let B = null; try { B = require(path.join(root, 'qihe-banter.js')); } catch (e) {}
let R = null; try { R = require(path.join(root, 'qh-mode-cultivation-relations.js')); } catch (e) {}
const out = [], seen = new Set();
const push = (row) => { const k = [row.source, row.scene, row.part, row.speaker, row.text].join('|'); if (seen.has(k)) return; seen.add(k); out.push(row); };
const REL_KEYS = ['yin', 'ye', 'shimu', 'zhong', 'fang', 'dou', 'man', 'pei', 'zhou', 'lu'];
function state(v) {
  const relations = Object.fromEntries(REL_KEYS.map(k => [k, { score: v.rel }]));
  return { month: v.month, phase: 2, joined: true,
    learned: { footwork: v.route !== 'none', fist: v.route === 'fist' || v.route === 'both', sword: v.route === 'sword' || v.route === 'both' },
    facts: { first_delivery: v.delivery ? { method: v.delivery } : undefined, gn_chests_choice: v.chests, gn_lamp_seen: v.chests ? {} : undefined,
      departure_goals: v.rel > 0, herb_labels: v.rel > 0, gy_ledger_seen: v.rel > 0, spar_log: { wins: v.rel > 0 ? 6 : 0 } },
    relations, qhOrigin: { chenCare: v.chen }, preHangao: { weapon: v.weapon, participants: [] } };
}
const variants = [];
for (const route of ['none', 'sword', 'fist', 'both']) for (const delivery of [null, 'guided_footwork', 'assisted_carry', 'asked_for_guidance'])
  for (const chests of [null, 'own', 'other']) for (const chen of ['擦伤已照护', '腿伤待照护', null]) for (const weapon of [null, 'staff'])
    for (const [rel, month] of [[0, 4], [90, 4], [95, 14]]) variants.push({ route, delivery, chests, chen, weapon, rel, month });
const contexts = variants.map(v => ({ s: state(v), v }));
function contextFor(id, s) {
  let c; try { c = { ...V.snapshot(s), ...(H && H.has(id) ? H.extra(s) : {}) }; } catch (e) { c = V.snapshot(s); }
  if (H && H.has(id)) c.rel = Object.fromEntries(Object.entries(s.relations).map(([k, x]) => [k, x.score]));
  return c;
}
const defs = V.all().filter(d => !d.hidden);
for (const d of defs) {
  const base = { source: d.neighbor ? 'neighbors' : d.side ? 'side' : d.id.startsWith('visitor_') ? 'visitors' : 'household', scene: d.id, title: d.name, window: d.window || null };
  for (const { s } of contexts) {
    let x; try { x = V.script(d.id, contextFor(d.id, s)); } catch (e) { continue; }
    if (!x) continue;
    const line = (part, l, extra = {}) => {
      if (l.letterAuthor) return push({ ...base, ...extra, part: 'letter', speaker: '信·' + l.letterAuthor, text: l.text, mood: null, moods: null });
      push({ ...base, ...extra, part, speaker: l.speaker, text: l.text, mood: l.mood || null, moods: l.moods || null });
    };
    for (const l of x.intro || []) line('intro', l);
    for (const ch of x.choices || []) {
      if (ch.text && !ch.auto) push({ ...base, part: 'choice', speaker: 'hero', text: ch.text, mood: null, moods: null, key: ch.key });
      for (const l of ch.lines || []) line('branch', l, { branch: ch.key });
    }
    for (const l of x.closing || []) line('closing', l);
  }
}
for (const a of D.actions) {
  const base = { source: 'activity', scene: a.id, title: a.name, window: a.window || null };
  for (const l of a.introLines || []) push({ ...base, part: 'intro', speaker: l.speaker, text: l.text, mood: null, moods: null });
  for (const ls of Object.values(a.introByDelivery || {})) for (const l of ls) push({ ...base, part: 'intro', speaker: l.speaker, text: l.text, mood: null, moods: null });
  if (a.resultLine) push({ ...base, part: 'result', speaker: a.actor || a.teacher || '', text: typeof a.resultLine === 'string' ? a.resultLine : a.resultLine.text, mood: null, moods: null });
}
if (R) for (const [name, p] of Object.entries(R.profiles)) {
  const base = { source: 'relations', scene: 'rel_' + p.id, title: name + '·往来回应', window: null };
  const texts = [['letter', p.letter], ['repeat', p.repeat], ...Object.entries(p.gifts || {}), ['return', p.returnText]];
  for (const [part, text] of texts) if (text) push({ ...base, part, speaker: name, text, mood: null, moods: null });
}
if (B) for (const b of B.list) for (const l of b.lines) push({ source: 'banter', scene: b.id, title: b.title, window: null, part: 'intro', speaker: l.speaker, text: l.text, mood: l.mood || null, moods: null });
process.stdout.write(JSON.stringify({ generated: new Date().toISOString(), lines: out }, null, 0));
