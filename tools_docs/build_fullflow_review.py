#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build a read-only full-story review and a design-only flow contract."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/design/fullflow-story-20261016'
OUT = ROOT / 'review/fullflow-story-20261016'


def read_extra_cards(filename, prefix, kind):
    text = (SOURCE / filename).read_text()
    headings = list(re.finditer(r'^### (' + prefix + r'-\d{2}) (.+)$', text, re.M))
    result = []
    for i, h in enumerate(headings):
        body = text[h.end():headings[i+1].start() if i+1 < len(headings) else len(text)]
        def field(label):
            m = re.search(r'\*\*' + re.escape(label) + r'：\*\*\s*(.*?)(?=\n\n\*\*|\n##|\Z)', body, re.S)
            return m.group(1).strip() if m else ''
        anchor = 'P2-05' if kind == 'city_scene' else field('插入位置')
        anchor_match = re.search(r'P[1-4]-\d{2}', anchor)
        anchor = anchor_match.group() if anchor_match else anchor
        key, title = h.groups()
        result.append(dict(id=key, title=title, kind=kind, part=int(anchor[1]) if anchor.startswith('P') else 0,
                           anchor=anchor, time=field('时间'), location=field('地点'), actors=field('人物'),
                           story=field('发生的事'), player=field('玩家行动与推进'),
                           nextReason=field('结果与回收'), source=filename, status='design_only',
                           operation=dict(title=key+' '+title, player=field('玩家行动与推进'),
                                          implementation=field('实施与成本'), recovery=field('错过与恢复'))))
    return result


def build():
    story = (SOURCE / 'story.md').read_text()
    implementation = (SOURCE / 'implementation-plan.md').read_text()
    side_text = (SOURCE / 'companions-and-side-stories.md').read_text()
    side_names = dict(re.findall(r'^### (SIDE-[A-Z]+)：([^\n]+)', side_text, re.M))
    life_names = dict(re.findall(r'^### (LIFE-\d{2})《([^》]+)》', side_text, re.M))
    sections = list(re.finditer(r'^### ((?:P[1-4]|N)-\d{2}) (.+)$', story, re.M))
    operations = {}
    for line in implementation.splitlines():
        if not re.match(r'^\| (?:P[1-4]-\d{2}|N-\d{2}|LIFE-\d{2}|SIDE-[A-Z]+-\d{2})\b', line):
            continue
        cells = [x.strip() for x in line.strip().strip('|').split('|')]
        key = cells[0].split()[0]
        if key in operations:
            raise ValueError('Duplicate operation: ' + key)
        title = cells[0]
        if title == key:
            title = key + ' ' + (life_names.get(key) or side_names.get(key.rsplit('-', 1)[0], '独立故事') + ' · ' + str(int(key.rsplit('-', 1)[1])))
        operations[key] = dict(title=title, player=cells[1], implementation=cells[2], recovery=cells[3])
    nodes = []
    for i, match in enumerate(sections):
        key, title = match.groups()
        text = story[match.end():sections[i + 1].start() if i + 1 < len(sections) else len(story)]
        def field(label):
            found = re.search(r'\*\*' + re.escape(label) + r'：\*\*\s*(.*?)(?=\n\n\*\*|\n##|\Z)', text, re.S)
            return found.group(1).strip() if found else ''
        place = re.search(r'\*\*地点：(.*?)\*\*', text, re.S)
        nodes.append({'id': key, 'title': title, 'part': int(key[1]) if key.startswith('P') else 4,
                      'kind': 'main' if key.startswith('P') else 'final_action', 'time': field('时间'),
                      'location': place.group(1).strip('。') if place else '依所选末段行动进入',
                      'story': field('发生的事') or field('目标与动作'),
                      'player': field('玩家行动与推进') or field('目标与动作'),
                      'nextReason': field('下一步') or field('所得与代价'),
                      'branchOutcome': field('所得与代价'), 'source': 'story.md',
                      'operation': operations.get(key, {}), 'status': 'design_only'})
    extras = read_extra_cards('hangao-year2.md', 'HG2', 'city_scene') + read_extra_cards('companion-weight-and-vignettes.md', 'MINI', 'vignette')
    for n in extras:
        operations[n['id']] = n['operation']
    weight_doc = (SOURCE / 'companion-weight-and-vignettes.md').read_text()
    weights = json.loads(re.search(r'```json\s*([\s\S]*?)```', weight_doc).group(1))
    main = [n for n in nodes if n['kind'] == 'main']
    for i, n in enumerate(main):
        n['requires'] = {'all': [main[i-1]['id']]} if i else {'all': []}
        n['next'] = [main[i+1]['id']] if i+1 < len(main) else []
    by = {n['id']: n for n in nodes}
    branches = ['N-01', 'N-02', 'N-03']
    by['P4-06']['next'] = branches
    by['P4-07']['requires'] = {'any': branches}
    for key in branches:
        by[key]['requires'] = {'all': ['P4-06'], 'selectedAction': key}
        by[key]['next'] = ['P4-07']
    choices = [
        {'node': 'P3-01', 'key': 'identity_disclosed', 'values': ['early', 'later'],
         'laterNodes': ['P3-02', 'P4-03'], 'contract': '早揭穿后改为争功，不重演熟人认错。'},
        {'node': 'P3-04', 'key': 'rigged_match', 'values': ['prevented', 'exposed_after'],
         'laterNodes': ['P4-03', 'P4-08'], 'contract': '提前制止则武馆免于既定倒闭，不借后文抹掉选择。'},
        {'node': 'P3-06', 'key': 'funeral_commitment', 'values': ['escort', 'investigate_only'],
         'laterNodes': ['P3-07', 'P3-08', 'P3-10', 'P4-07'], 'contract': '调查者可旁听和走岸路，不自动取得护棺职责。'},
        {'node': 'P4-03', 'key': 'aqi_duel', 'values': ['win', 'lose', 'decline'],
         'laterNodes': ['P4-04', 'P4-08'], 'contract': '胜负真实，拒战不把姓名判给别人；技术异常不是败北。'},
        {'node': 'P4-06', 'key': 'final_action', 'values': branches,
         'laterNodes': ['P4-07', 'P4-08'], 'contract': '同一周目仅选一项，实际救援群体和未完成结果分开。'},
    ]
    catalog = json.loads((ROOT / 'docs/design/calendar/mountain-events.json').read_text())
    windows = {e['id']: e.get('window') for e in catalog['events']}
    bindings = {
        'P2-01': ['entry_join', 'spring_escort'], 'P2-02': ['journey_m5'], 'P2-03': [],
        'P2-04': ['journey_m10', 'year1_assessment', 'ye_future'],
        'P2-05': ['old_visitor', 'journey_m16'], 'P2-06': ['pressure', 'journey_m22'],
        'P2-07': ['truth_a', 'truth_b', 'journey_m28'], 'P2-08': [],
        'P2-09': ['journey_m33', 'ending_a'], 'P2-10': ['ending_b'],
    }
    calendar = [{ 'node': key, 'existingEvents': ids, 'existingWindows': [windows[x] for x in ids],
                 'registration': 'windows_in_catalog_actors_partial', 'newExclusivePeriods': 0} for key, ids in bindings.items()]
    result = {'schema': 'xjh.fullflow.design.v2', 'status': 'design_not_runtime',
              'version': 'fullflow-20261016.3', 'parts': ['开始', '培养', '游历', '终局'],
              'start': main[0]['id'], 'end': main[-1]['id'], 'nodes': nodes,
              'operations': operations, 'choices': choices, 'calendarBindings': calendar,
              'extraScenes': extras, 'companionWeights': weights,
              'sidePolicy': '所有LIFE/SIDE均可选；不作主干前置，迟到按现场补初识。',
              'timePolicy': '培养36月；游历与城市由明确剧情时间点推进，不模拟全局昼夜。'}
    (SOURCE / 'flow.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    OUT.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(result, ensure_ascii=False).replace('</', '<\\/')
    page = r'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>从栖河到白石 · 全流程剧情稿</title><style>
    :root{color-scheme:light;--ink:#26352e;--muted:#6d736a;--line:#d9ddcf;--green:#345d47}*{box-sizing:border-box}body{margin:0;background:#f6f3e9;color:var(--ink);font-family:system-ui,-apple-system,"PingFang SC",sans-serif;line-height:1.8}header,main{max-width:960px;margin:auto;padding:28px 28px}header{padding-top:38px;padding-bottom:18px}h1{font-family:serif;font-size:32px;letter-spacing:.04em;margin:5px 0 12px}h2{font-size:22px;line-height:1.5;margin:8px 0 14px}.eyebrow,.meta{font-size:13px;color:var(--muted)}.lead{max-width:810px;font-size:17px}.status{display:inline-block;border:1px solid var(--line);padding:2px 10px;border-radius:20px;font-size:12px}nav{position:sticky;top:0;background:#f6f3e9f5;border-block:1px solid var(--line);z-index:2}.navinner{max-width:960px;margin:auto;padding:10px 28px;display:flex;gap:8px;flex-wrap:wrap}button{font:inherit;font-size:14px;border:1px solid var(--line);background:#faf9f4;color:var(--ink);border-radius:6px;padding:7px 15px;cursor:pointer}button[aria-pressed=true]{background:var(--green);color:white;border-color:var(--green)}.counter{font-size:13px;color:var(--muted);margin:0 0 20px}.card{padding:24px 26px;background:#fffdf7;border:1px solid var(--line);border-radius:10px;margin-bottom:22px}.card p{margin:12px 0;font-size:17px}.card details{border-top:1px solid var(--line);padding-top:12px;margin-top:18px}.card summary{cursor:pointer;color:var(--green);font-size:14px}.card details p{font-size:15px}.next{color:#657161;border-left:3px solid #a1b09a;padding-left:14px;font-size:15px!important}a{color:var(--green);text-underline-offset:3px}.links{display:flex;gap:14px;flex-wrap:wrap;font-size:14px}.empty{padding:30px}.timeline{font-size:14px;background:#e9eddf;border-left:3px solid #859771;padding:14px 18px;margin-bottom:22px}.timeline p{margin:6px 0}.time{display:block;color:#47614c;font-size:14px;margin:5px 0}.badge{display:inline-block;font-size:12px;border:1px solid #d4cbbb;border-radius:12px;padding:0 8px;margin-left:8px}.weights{width:100%;border-collapse:collapse;font-size:14px}.weights td,.weights th{text-align:left;padding:12px;border-bottom:1px solid var(--line);vertical-align:top}.weights .score{white-space:nowrap;font-weight:600}.weights th{white-space:nowrap}.weights td:first-child{white-space:nowrap;min-width:86px}.weights td:last-child{min-width:160px}.weights td:last-child a{white-space:nowrap}.tablewrap{overflow:auto}.weightnote{font-size:15px;padding:16px 20px;background:#fffdf7;border:1px solid var(--line);margin-bottom:18px}footer{max-width:960px;margin:0 auto 40px;padding:0 28px;color:var(--muted);font-size:13px}@media(max-width:640px){header,main{padding:20px 16px}h1{font-size:27px}.card{padding:18px}nav .navinner{padding:9px 16px;gap:6px}button{padding:6px 10px}.card p{font-size:16px}}
    </style></head><body><header><div class="eyebrow">小江湖 · 完整故事与游玩流程</div><h1>从栖河到白石</h1><span class="status">设计阅读稿 · 新增内容尚未接入游戏</span><p class="lead">第一年五月初访汉皋，第二年正月在城里结识众人、试艺、替人解围。名字先被人记住，阿七才有借名的机会。三年末开始独立游历；同伴的短篇穿插在各年、各地与返乡途中。</p><div class="links"><a href="../../docs/design/fullflow-story-20261016/story.md">完整剧情原稿</a><a href="../../docs/design/fullflow-story-20261016/companions-and-side-stories.md">19位同伴与支线</a><a href="../../docs/design/fullflow-story-20261016/implementation-plan.md">制作与实现清单</a><a href="../../docs/design/fullflow-story-20261016/README.md">设计总览</a></div></header><nav><div class="navinner" id="nav"></div></nav><main><section class="timeline"><b>培养期也会下山</b><p>年一五月 · 汉皋药案 → 年一十月 · 合川遇雨 → <strong>年二正月 · 汉皋群像与扬名</strong> → 年二十月 · 再赴比试 → 年三四月、九月 · 历练访查 → 年三末 · 独立游历</p></section><p class="counter" id="count"></p><div id="cards"></div></main><footer>每个主干编号是一个可包含探索、对白和战斗的事件包。剧情选择需要实际保存与读取；本页用于审阅，不会访问或修改游戏存档。</footer><script id="data" type="application/json">__PAYLOAD__</script><script>
    const data=JSON.parse(document.getElementById('data').textContent);let selected=new URLSearchParams(location.search).get('view')||'all';const esc=s=>String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
    const extra=data.extraScenes;const ordered=data.nodes.filter(n=>n.kind==='main').flatMap(n=>[n,...extra.filter(x=>x.anchor===n.id),...(n.id==='P4-06'?data.nodes.filter(x=>x.kind==='final_action'):[])]);
    const filters=[['all','全程'],['1','一 · 开始'],['2','二 · 培养'],['3','三 · 游历'],['4','四 · 终局'],['city','二年正月 · 汉皋'],['short','人物短篇'],['weight','角色权重'],['side','原有独立故事']];
    if(!filters.some(x=>x[0]===selected))selected='all';
    function card(n){return '<article class="card" id="'+esc(n.id)+'"><div class="meta">'+esc(n.id)+' · '+esc(n.location)+(n.kind==='vignette'?'<span class="badge">可选短篇</span>':n.kind==='city_scene'?'<span class="badge">正月城市篇</span>':n.kind==='final_action'?'<span class="badge">三选一行动</span>':'')+'</div>'+(n.time?'<span class="time">'+esc(n.time)+'</span>':'')+'<h2>'+esc(n.title)+'</h2>'+String(n.story||'').split(/\n\n/).map(p=>'<p>'+esc(p)+'</p>').join('')+(n.nextReason?'<p class="next">'+esc(n.nextReason)+'</p>':'')+'<details><summary>玩的时候要做什么</summary><p>'+esc(n.player)+'</p><p><b>失败与重放：</b>'+esc(n.operation.recovery)+'</p><p><b>所需实现：</b>'+esc(n.operation.implementation)+'</p><p><a href="../../docs/design/fullflow-story-20261016/'+esc(n.source||'implementation-plan.md')+'">查看负责文档</a></p></details></article>';}
    function weightView(){return '<div class="weightnote"><b>权重衡量已写出的个人戏，不能代替故事质量。</b><br>100分由有效场景30、本人主动20、选择后果20、跨部分覆盖15、完整个人矛盾收束15组成；露脸、提名和同一句回应不计分。旧招募概述按证据包保守计分，不等于原来没有剧情。<br><a href="../../docs/design/fullflow-story-20261016/companion-weight-and-vignettes.md">查看公式、逐人证据、保留缺口与全部短篇</a></div><div class="tablewrap"><table class="weights"><thead><tr><th>角色</th><th>现有→补后</th><th>具体缺口</th><th>新增短篇</th></tr></thead><tbody>'+data.companionWeights.map(w=>'<tr><td>'+esc(w.name)+'</td><td class="score">'+esc(w.before)+' → '+esc(w.after)+'</td><td>'+esc(w.gap)+'</td><td>'+(w.newScenes||[]).map(id=>'<a href="?view=short#'+esc(id)+'">'+esc(id)+'</a>').join('、')+'</td></tr>').join('')+'</tbody></table></div>';}
    function render(){document.getElementById('nav').innerHTML=filters.map(x=>'<button data-view="'+x[0]+'" aria-pressed="'+(selected===x[0])+'">'+x[1]+'</button>').join('');let list=selected==='side'?Object.entries(data.operations).filter(x=>x[0].startsWith('SIDE-')||x[0].startsWith('LIFE-')).map(([id,op])=>({id,title:op.title.replace(id,'').trim(),location:'独立可选内容',story:op.player,player:op.player,operation:op})):selected==='city'?extra.filter(n=>n.kind==='city_scene'):selected==='short'?extra.filter(n=>n.kind==='vignette'):ordered.filter(n=>selected==='all'||String(n.part)===selected);document.getElementById('count').textContent=selected==='weight'?'19位可入队角色 · 比较设计覆盖，查看证据与补强':selected==='side'?'原有10条可选故事 · 41场内容，未完成不会锁主线':selected==='city'?'第二年正月 · 8场连续城市剧情，共占原有5期外出预算':selected==='short'?'新增16篇 · 培养6、游历8、终局回访2；不要求一周目做齐':'34个主干事件包 · 汉皋包内8场展开 · 新增16篇分散穿插，本视图共 '+list.length+' 项';document.getElementById('cards').innerHTML=selected==='weight'?weightView():list.map(card).join('');document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{selected=b.dataset.view;history.replaceState(null,'','?view='+selected);render();window.scrollTo({top:0,behavior:'auto'});});}render();if(location.hash)requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView());
    </script></body></html>'''
    (OUT / 'index.html').write_text(page.replace('__PAYLOAD__', payload))
    print(json.dumps({'main': len(main), 'branches': len(nodes)-len(main), 'operations': len(operations), 'extraScenes': len(extras), 'weights': len(weights),
                      'html': str(OUT / 'index.html')}, ensure_ascii=False))


if __name__ == '__main__':
    build()
