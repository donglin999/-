// 把培养模式里所有剧情台词导出成 JSON，供文档库的剧情文案检查（xiaojianghu/tools_docs/story_lint.py）使用。
// 用法：node tools_scene/qihe/dump_story_lines.cjs > 输出.json
// 每条：{source, scene, title, window, speaker, text, mood, moods, part}；part 为 intro／choice／branch／closing／result。
// 同一场戏在不同上下文（关系高低、萧白是否满十八）下台词会换版本，这里各取一遍再去重。
const path = require('path');
const root = path.resolve(__dirname, '../../js');
const H = require(path.join(root, 'qh-mode-cultivation-household.js'));
const D = require(path.join(root, 'qh-mode-cultivation-data.js'));
let B = null; try { B = require(path.join(root, 'qihe-banter.js')); } catch (e) {}
const out = [], seen = new Set();
const push = (row) => { const k = [row.source, row.scene, row.part, row.speaker, row.text].join('|'); if (seen.has(k)) return; seen.add(k); out.push(row); };
const contexts = [
  { rel: {}, adult: false, learned: {}, opening: {}, first_delivery: {}, facts: {}, yinScore: 0, sparWins: 0 },
  { rel: { yin: 90, ye: 90, shimu: 90, zhong: 90, fang: 90, dou: 90, man: 90, pei: 90 }, adult: false, learned: { sword: true, fist: true, footwork: true }, opening: {}, first_delivery: {}, facts: {}, yinScore: 90, sparWins: 6 },
  { rel: { yin: 95, ye: 95, pei: 95 }, adult: true, learned: { sword: true }, opening: {}, first_delivery: {}, facts: {}, yinScore: 95, sparWins: 6 },
];
for (const d of H.definitions) {
  for (const c of contexts) {
    let x; try { x = H.script(d.id, c); } catch (e) { continue; }
    if (!x) continue;
    const base = { source: d.neighbor ? 'neighbors' : d.side ? 'side' : 'household', scene: d.id, title: d.name, window: d.window || null };
    for (const l of x.intro || []) push({ ...base, part: 'intro', speaker: l.speaker, text: l.text, mood: l.mood || null, moods: l.moods || null });
    for (const ch of x.choices || []) {
      if (ch.text) push({ ...base, part: 'choice', speaker: 'hero', text: ch.text, mood: null, moods: null, key: ch.key });
      for (const l of ch.lines || []) push({ ...base, part: 'branch', branch: ch.key, speaker: l.speaker, text: l.text, mood: l.mood || null, moods: l.moods || null });
    }
    for (const l of x.closing || []) push({ ...base, part: 'closing', speaker: l.speaker, text: l.text, mood: l.mood || null, moods: l.moods || null });
  }
}
for (const a of D.actions) {
  const base = { source: 'activity', scene: a.id, title: a.name, window: a.window || null };
  for (const l of a.introLines || []) push({ ...base, part: 'intro', speaker: l.speaker, text: l.text, mood: null, moods: null });
  if (a.resultLine) push({ ...base, part: 'result', speaker: a.actor || a.teacher || '', text: typeof a.resultLine === 'string' ? a.resultLine : a.resultLine.text, mood: null, moods: null });
}
if (B) for (const b of B.list) for (const l of b.lines) push({ source: 'banter', scene: b.id, title: b.title, window: null, part: 'intro', speaker: l.speaker, text: l.text, mood: l.mood || null, moods: null });
process.stdout.write(JSON.stringify({ generated: new Date().toISOString(), lines: out }, null, 0));
