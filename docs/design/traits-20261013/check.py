"""Design-source audit. Planned route closures are not runtime/schedule passes."""
from pathlib import Path
import json,subprocess,hashlib
B=Path(__file__).resolve().parent;R=B.parents[3]
d=json.loads((B/'catalog.json').read_text());rs=json.loads((B/'routes.json').read_text())['routes'];routes={r['id']:r for r in rs};traits={t['id']:t for t in d['traits']}
assert len(traits)==len(d['traits'])==20 and len(routes)==7
refs={e for r in rs for st in r['steps'] for e in st['events']}
refs.update((t.get('origin_event')or t['trigger'])['event']for t in d['traits'])
refs.update(t['event']for t in d['transitions']);refs.discard(None)
run="const H=require('./xiaojianghu-legacy-prologue/js/qh-mode-cultivation-household.js');const wanted="+json.dumps(list(refs))+";console.log(JSON.stringify(H.definitions.filter(x=>wanted.includes(x.id)).map(x=>({id:x.id,window:x.window,cast:x.cast,choices:H.script(x.id,{facts:{},rel:{},pei:{},opening:{},first_delivery:{},learned:{}}).choices.map(c=>c.key)}))));"
actual={x['id']:x for x in json.loads(subprocess.check_output(['node','-e',run],cwd=R,text=True))}
chapter=(R/'xiaojianghu-legacy-prologue/js/qihe-chapter.js').read_text();known={'hero','ye','yin','fang','pei','zhou','shimu','peishu','xulingyi','censhuang','shenyanhui','lu','suzhi'};norm=lambda n:'hero'if n.startswith('hero')else n
for t in d['traits']:
 assert t['effects'] and set(t['owners'])<=known
 for fx in t['effects']:
  assert isinstance(fx['value'],(int,float)) and fx['channel']
  if fx['unit']in ['ratio','probability_delta']:assert -1<=fx['value']<=2
 for speaker,line in t['dialogue']:assert speaker in {norm(x)for x in t['trigger']['cast']} and len(line)<85
 g=t.get('origin_event')or t['trigger']
 if g['kind']=='existing_cultivation_event':
  a=actual[g['event']];assert a['window']==g['window'];assert set(g['choices'])<=set(a['choices']);assert {norm(x)for x in g['cast']}<={norm(x)for x in a['cast']}
 elif g['kind']=='existing_story_event':assert "event('"+g['event']+"'"in chapter
 elif g['kind']=='existing_action':assert 'function advance('in(R/g['source']).read_text()
 if t['category']=='acquired':
  a=t['acquisition'];r=routes[a['route_id']];assert t['trigger']['kind']=='route_completion';assert a['require_all_steps']and a['rewards_per_route']==1;assert a['choice']in r['final_event']['choices'];assert t['id']in r['rewards'];assert t['trigger']['event']==r['final_event']['id']
for r in rs:
 assert len(r['steps'])>=4 and len({s['id']for s in r['steps']})==len(r['steps'])
 assert r['final_event']['status']=='planned_not_runtime' and r['final_event']['cost']in [0,4]
 assert set(r['rewards'])<=set(traits) and r['makeup']
 for st in r['steps']:
  for e in st['events']:assert e in actual or "event('"+e+"'"in chapter,(r['id'],e)
 if len(r['rewards'])>1:assert len({traits[id]['stacking']['group']for id in r['rewards']})==1
for t in d['transitions']:
 assert t['trait']in traits
 for speaker,line in t['lines']:assert speaker in {norm(x)for x in actual[t['event']]['cast']}
assert sum(t['category']=='acquired'for t in d['traits'])==9
assert not {'road_experience','herb_sorting','rations_ready','year_foundation'}&set(traits)
assert next(t for t in d['transitions']if t['event']=='gy_yin_past')['operation']=='none'
report={'status':'pass','version':d['version'],'traits':len(traits),'routes':len(routes),'routeResults':9,'retiredRewards':4,'catalog_sha256':hashlib.sha256((B/'catalog.json').read_bytes()).hexdigest(),'scope':'existing source/branch/cast references; route gate structure; no single-event positive acquired rewards','not_verified':['new route episode implementation','joint calendar feasibility','runtime trait grants','combat balance','old-save migration implementation']}
(B/'audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
