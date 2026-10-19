"""Check the review contract; NOT calendar solvability or implementation verification."""
from pathlib import Path
import json
R=Path(__file__).resolve().parent;D=json.loads((R/'story.json').read_text());B={s['id']:s for s in D['scenes']}
base=json.loads((R/'base-20261014.json').read_text());old={s['id']:s for s in base['scenes']}
assert len(B)==len(D['scenes'])==36
for s in B.values():
 for r in s['requires']+s.get('requiresAny',[]):assert r in B,(s['id'],r)
 gs=s['segments']+sum((c['segments'] for c in s['choices']),[])+sum((v['segments'] for v in s['variants']),[])
 assert s['choices'] and all(c['label'] and c['effect'] for c in s['choices'])
 for g in gs:
  assert g['place'] and g['cast']
  for l in g['lines']:assert l['speaker']=='旁白' or l['speaker'] in g['cast'],(s['id'],l)
 for f in ['knowledge','trigger','goal','tension','effects','recovery','cost']:assert s[f],(s['id'],f)
seen=set()
def visit(k,stack):
 assert k not in stack,stack
 if k in seen:return
 for p in B[k]['requires']+B[k].get('requiresAny',[]):visit(p,stack+[k])
 seen.add(k)
for k in B:visit(k,[])
def ancestors(k):return {k}.union(*(ancestors(p) for p in B[k]['requires']))
assert not any(k.startswith('QF') or k.startswith('J') for k in ancestors('L07'))
assert not any(k.startswith('L') or k.startswith('J') for k in ancestors('QF06C'))
for k in old:
 assert B[k]['requires']==old[k]['requires'],k
 assert B[k].get('requiresFlags')==old[k].get('requiresFlags'),k
assert D['meta']['recruitment']==base['meta']['recruitment']
assert len(B['J06']['variants'])==3 and len(B['J08']['variants'])==2
assert B['J01']['choices'][1]['requiresFacts']==['main.M05.complete']
assert B['J07']['choices'][1]['requiresFacts']==['escort.second_team_ready']
assert 'travel.both_arrived' in B['J06']['defaultRequiresFacts']
for id,absent in [('liu-only','秦绯鸢'),('qin-only','柳含烟'),('neither','秦绯鸢')]:
 v=next(v for v in B['J06']['variants'] if v['id']==id)
 assert all(absent not in g['cast'] for g in v['segments'])
for sp in D['meta']['spaces']:
 assert all(k in B for k in sp['scenes'])
assert all(k in B for k in D['meta']['mysteryGuide']['recommended'])
report=dict(status='pass',scenes=len(B),revised=sum(s['revision']=='R2重写' for s in B.values()),new=sum(s['revision']=='R2新增' for s in B.values()),mainLines=sum(len(g['lines']) for s in B.values() for g in s['segments']),variantCount=sum(len(s['variants']) for s in B.values()),independentRecruitmentPreserved=True,absentSpeakers=0,scope='Schema, DAG including alternative edges, source recruitment parity, speaking cast, explicit knowledge/action gates. No calendar, gameplay or narrative approval claim.')
(R/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
