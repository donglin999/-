"""Review-draft validation only. No claim about gameplay or full calendar solvability."""
from pathlib import Path
import json
R=Path(__file__).resolve().parent
D=json.loads((R/'story.json').read_text());sc=D['scenes'];by={s['id']:s for s in sc};errors=[]
assert len(by)==len(sc)
for s in sc:
 for req in s['requires']+s.get('requiresAny',[]):
  if req not in by:errors.append(f"{s['id']}: unknown dependency {req}")
 segments=list(s['segments'])
 for c in s['choices']:segments+=c['segments'];assert c['effect'] and c['label']
 for v in s['variants']:segments+=v['segments'];assert v['condition'] and v['effects']
 for g in segments:
  assert g['place'] and g['cast']
  for line in g['lines']:
   if line['speaker']!='旁白' and line['speaker'] not in g['cast']:errors.append(f"{s['id']}: absent speaker {line['speaker']} at {g['place']}")
 for field in ['trigger','goal','tension','effects','repeat','space_note','knowledge','recovery','cost']:assert s[field],(s['id'],field)
seen=set();stack=set()
def visit(id):
 if id in stack:raise AssertionError('cyclic dependency '+id)
 if id in seen:return
 stack.add(id)
 for r in by[id]['requires']:visit(r)
 stack.remove(id);seen.add(id)
for id in by:visit(id)
def ancestors(id):
 result={id}
 for r in by[id]['requires']:result |= ancestors(r)
 return result
liu=ancestors('L07');qin=ancestors('QF06C')
assert not any(x.startswith('QF') or x=='QY02' for x in liu),liu
assert not any(x.startswith('L') or x=='QY03' for x in qin),qin
assert 'qin.delivery_complete' in by['QF06C']['requiresFlags']
assert 56-48==8 and 24+8==32 and 48+32==80
for sp in D['meta']['spaces']:
 for x in sp['scenes']:assert x in by
assert len(sc)==24
report=dict(status='fail' if errors else 'pass',scope='draft schema, dependency DAG, speaking-cast presence, independent recruitment ancestors, explicit notice and illustrative arithmetic; NOT runtime or full calendar validation',scenes=len(sc),mainLines=sum(len(g['lines']) for s in sc for g in s['segments']),branchLines=sum(len(g['lines']) for s in sc for c in s['choices'] for g in c['segments']),variantCount=sum(len(s['variants']) for s in sc),liuDependencyPath=sorted(liu),qinDependencyPath=sorted(qin),errors=errors)
(R/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
if errors:raise SystemExit(1)
