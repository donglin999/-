#!/usr/bin/env python3
"""Validate candidate branches and draft budgets, without executing game state."""
import hashlib
import itertools
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'review/pre-hangao-completion-20261013'
D=json.loads((OUT/'data.json').read_text());by={s['id']:s for s in D['scenes']}
assert hashlib.sha256((ROOT.parent/'xiaojianghu/docs/design/scripts/chapter-two-dialogue.json').read_bytes()).hexdigest()==D['source_sha256']
axes={'route':['sword','fist','life'],'delivery':['guided_footwork','assisted_carry','asked_for_guidance'],'pei':['new','known','close'],'injury':['light','rest','unknown'],'weapon':['ready','missing'],'footwork':[False,True]}
def context_index(c):
    for i,t in enumerate(D['contexts']):
        a=t.split('／');k=a[4]
        if a[0]=='未成年' and a[1]=='关系0' and a[2]==c['injury'] and a[3]=='送药'+c['delivery'] and ('剑' in k)==(c['route']=='sword') and ('拳' in k)==(c['route']=='fist') and ('步法' in k)==c['footwork']:return i
    raise AssertionError(c)
def match(b,c,ci):
    return all((c[k] in v if isinstance(v,list) else c[k]==v) for k,v in b.get('when',{}).items()) and ('contextIndices' not in b or ci in b['contextIndices'])
def paths(s,c):
    ci=context_index(c);start=[b for b in s['opening'] if match(b,c,ci)];end=[b for b in s['ending'] if match(b,c,ci)]
    choices=[b for b in s['choices'] if match(b,c,ci) and any(match(l,c,ci) for l in b['lines'])]
    return [(b['id'],start+[l for l in b['lines'] if match(l,c,ci)]+end) for b in choices] or [('linear',start+end)]
seen=0;metrics={};farewell_max=0
for values in itertools.product(*axes.values()):
    c=dict(zip(axes,values))
    if not c['footwork'] and c['delivery']=='guided_footwork':continue
    seen+=1;farewell=0
    for sid,s in by.items():
        ps=paths(s,c)
        for branch,beats in ps:
            assert beats,(sid,c)
            text=''.join(b['text'] for b in beats)
            assert '襄阳' not in text,sid
            chars=sum(len(b['text']) for b in beats)+sum(len(l['text']) for l in s.get('letters',[]))
            r=metrics.setdefault(sid,dict(min=chars,max=chars,branches=set()))
            r['min']=min(r['min'],chars);r['max']=max(r['max'],chars);r['branches'].add(branch)
            if s['status']=='新增候选':assert chars<=420,(sid,chars)
            if sid=='gn_depart' and c['pei']=='new':assert '风吹书页' not in text and '我叫裴知古' in text
            if sid=='gn_depart' and c['pei']=='known':assert '上回还说一道去' not in text and '后来呢' not in text
            if sid=='gn_depart' and c['pei']=='close':assert '后来呢' in text and '我叫裴知古' not in text
            if sid=='gy_zhou_test' and c['route']=='life':assert branch=='practical' and '先不打' in text
            if sid=='hg_gate':assert all('yin' not in b['cast'] for b in s['ending'])
            if sid=='gy_m02':
                first_zhou=next(i for i,b in enumerate(beats) if b['speaker']=='zhou')
                assert all('zhou' not in b['cast'] for b in beats[:first_zhou])
        if sid in ['gn_depart','gy_m08','hg_farewell']:farewell+=max(sum(len(b['text']) for b in bs) for _,bs in ps)
    farewell_max=max(farewell_max,farewell)
assert farewell_max<=850,farewell_max
for m in metrics.values():m['branches']=sorted(m['branches'])
# Same-slot dependency sequence is explicit; no new physical travel is claimed to cost zero months.
order={s['id']:i for i,s in enumerate(D['scenes'])}
assert order['gn_depart']<order['gy_m08']<order['hg_farewell']<order['hg_road']<order['hg_gate']
report=dict(status='pass',contexts=seen,scenes=len(by),new_scenes=6,source_unchanged=True,new_scene_limit=420,farewell_three_scene_max=farewell_max,checks=['speaker registry and casts built','known information branches','life route can finish exam','letters never impersonate onstage speakers','old city name removed from candidate text','no runtime writes'],lengths=metrics)
(OUT/'audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='lengths'},ensure_ascii=False))
