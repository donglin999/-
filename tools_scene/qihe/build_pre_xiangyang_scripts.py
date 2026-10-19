# -*- coding: utf-8 -*-
"""把文档库襄阳前逐句剧本（xiaojianghu/docs/design/scripts/pre-xiangyang.json）转成培养运行模块
js/qh-mode-cultivation-scripts.js。只转本工作区尚未实装的场景；条件表达式编译成 JS 函数，变体按存档事实选取。
以工作区根目录运行：python3 tools_scene/qihe/build_pre_xiangyang_scripts.py"""
from pathlib import Path
import json, re
ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT.parent / 'xiaojianghu/docs/design/scripts/pre-xiangyang.json'
WANT = ['M-02', 'M-03', 'M-04', 'M-05', 'M-06', 'M-07', 'M-08', 'M-09', 'Z-01', 'Y-02', 'L-02', 'Y-03', 'Z-03']
SPK = {'萧白': 'hero', '叶蘅': 'ye', '周砚': 'zhou', '陆衡': 'lu', '旁白': 'narrator', '收件人': 'recipient'}
EMO = {'happy': 'smile', 'fearful': 'worry', 'sad': 'sad', 'angry': 'angry'}

def cond_js(c):
    if c == 'always': return 'true'
    s = c
    s = re.sub(r"(\S+) not in (\[[^\]]*\])", r"!\2.includes(\1)", s)
    s = s.replace(' and ', ' && ').replace(' or ', ' || ')
    s = re.sub(r"\b(opening|learned|first_delivery|facts)\.", r"c.\1.", s)
    s = re.sub(r"(?<![\w.])(choice|relationship_choice)\b", r"c.\1", s)
    s = s.replace('==', '===').replace('!===', '!==')
    return s

d = json.loads(SRC.read_text())
out = {}
for sc in d['scenes']:
    if sc['id'] not in WANT: continue
    blocks = []
    for b in sc['blocks']:
        m = re.search(r"choice == '(\w+)'", b['condition'])
        lines = []
        for l in b['lines']:
            sp = SPK.get(l['speaker'])
            if not sp: raise SystemExit('未知说话人 ' + l['speaker'])
            ln = {'speaker': sp, 'text': l['text']}
            if l.get('mood'): ln['mood'] = l['mood']   # 2026-10-16 返工稿直接写运行表情
            elif l.get('emotion_api') in EMO: ln['mood'] = EMO[l['emotion_api']]
            lines.append(ln)
        blocks.append({'key': b['key'], 'kind': b['kind'], 'group': b.get('group'), 'label': b['label'],
                       'choice': m.group(1) if (b['kind'] == 'branch' and m) else None, 'cond': cond_js(b['condition']),
                       'effects': b.get('effects', []), 'lines': lines})
    out[sc['id']] = {'title': sc['title'], 'stage': sc['stage'], 'window': sc['window'], 'blocks': blocks}

js = ["/* 由 tools_scene/qihe/build_pre_xiangyang_scripts.py 生成，勿手改。来源：文档库 scripts/pre-xiangyang.json（"
      + d['version'] + "，" + d['status'] + "）。 */",
      "(function(root){'use strict';", "const S={"]
for sid, sc in out.items():
    bl = []
    for b in sc['blocks']:
        bl.append('{key:%s,kind:%s,group:%s,label:%s,choice:%s,when:c=>(%s),effects:%s,lines:%s}' % (
            json.dumps(b['key']), json.dumps(b['kind']), json.dumps(b['group']), json.dumps(b['label'], ensure_ascii=False),
            json.dumps(b['choice']), b['cond'], json.dumps(b['effects'], ensure_ascii=False), json.dumps(b['lines'], ensure_ascii=False)))
    js.append(' %s:{title:%s,stage:%s,window:%s,blocks:[\n  %s]},' % (json.dumps(sid), json.dumps(sc['title'], ensure_ascii=False),
              json.dumps(sc['stage'], ensure_ascii=False), json.dumps(sc['window']), ',\n  '.join(bl)))
js.append('};')
js.append(r"""// 运行时把一场剧本展开成对白引擎需要的 intro / choices / closing。
// 分支前的块（含按存档选取的变体）→ intro；choice 相同的分支块合并为一个选项；分支后的块 → closing。
// 没有分支的场景（必经剧情）用单一自动分支直通，不让玩家做选择。
function pick(blocks,c){const out=[],seen=new Set();for(const b of blocks){if(b.kind==='main'){if(b.when(c))out.push(...b.lines);continue;}
 if(seen.has(b.group))continue;const list=blocks.filter(x=>x.group===b.group&&x.kind!=='branch'),hit=list.find(x=>x.kind==='variant'&&x.when(c))||list.find(x=>x.kind==='fallback'&&x.when(c));seen.add(b.group);if(hit)out.push(...hit.lines);}return out;}
function expand(id,c0){const sc=S[id];if(!sc)return null;const c={...c0,learned:{...(c0?.learned||{})},opening:{chen_injury:'unknown',...(c0?.opening||{})},first_delivery:{method:null,...(c0?.first_delivery||{})},facts:{...(c0?.facts||{})}};const bs=sc.blocks,first=bs.findIndex(b=>b.kind==='branch'),last=bs.length-1-[...bs].reverse().findIndex(b=>b.kind==='branch');
 if(first<0){const all=pick(bs,c);if(all.length<3)throw Error('剧本过短：'+id);return {intro:all.slice(0,-2),choices:[{key:'linear',text:'',auto:true,lines:[all[all.length-2]]}],closing:[all[all.length-1]]};}
 const intro=pick(bs.slice(0,first),c),closing=pick(bs.slice(last+1),c),keys=[...new Set(bs.slice(first,last+1).filter(b=>b.kind==='branch').map(b=>b.choice))];
 const choices=keys.map(k=>{const own=bs.slice(first,last+1).filter(b=>b.kind==='branch'&&b.choice===k),cc={...c,choice:k},hit=own.filter(b=>b.when(cc));return {key:k,text:own[0].label.split('：')[0],lines:hit.flatMap(b=>b.lines),effects:hit.flatMap(b=>b.effects)};});
 // 分支内若有夹在中间的变体（如 Z-02 方式回响）已归入 intro；closing 不能为空，否则引擎无句可播。
 if(!closing.length)closing.push({speaker:'narrator',text:'……'});
 return {intro:intro.length?intro:[{speaker:'narrator',text:sc.stage}],choices,closing};}
const API={scenes:S,expand,ids:Object.keys(S)};if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationScripts=API;
})(typeof globalThis!=='undefined'?globalThis:this);""")
(ROOT / 'js/qh-mode-cultivation-scripts.js').write_text('\n'.join(js) + '\n')
print('scenes', len(out), list(out))
