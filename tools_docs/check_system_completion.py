#!/usr/bin/env python3
"""Check the 26-item document delivery and design scenarios; never edit runtime state."""
import argparse,json,re,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; D=ROOT/'docs/design/system-completion-20261016'
def validate_case(c):
 b,a=c['before'],c['after'];k=c['kind'];errors=[]
 if k=='town_activity':
  if a['clock']!=b['clock']:errors.append('ordinary town action advanced time')
  if a['energy']!=b['energy']:errors.append('town action consumed cultivation energy')
  if a['currency']!=b['currency']-c['cost']:errors.append('currency charge differs')
 elif k in ('duplicate','storage_failure'):
  if a!=b:errors.append('retry or failed persistence mutated state')
 elif k=='advance':
  if not c.get('confirmed') or not c.get('expiry_preview'):errors.append('advance lacks confirmation or expiry preview')
 elif k=='actor_presence':
  if any(x['party'] and x['location']!=c['party_location'] for x in a['actors'].values()):errors.append('party actor has conflicting location')
 elif k=='cultivation_activity':
  if a['clock']!=b['clock']:errors.append('ordinary cultivation action advanced period')
  if a['energy']!=b['energy']-c['cost'] or a['energy']<0:errors.append('energy charge differs')
 elif k=='information':
  i=c['claim']
  if not i.get('source'):errors.append('information source missing')
  if i['kind']=='verified' and not i.get('verificationRefs'):errors.append('verification evidence missing')
 else:errors.append('unknown scenario kind')
 return errors

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--out',required=True);args=ap.parse_args();out=Path(args.out).resolve()
 if out.is_relative_to(ROOT) or out.is_relative_to(ROOT.parent/'xiaojianghu-legacy-prologue'):raise SystemExit('output must be outside both repositories')
 errors=[];rows=[]
 baseline=json.loads((ROOT/'docs/design/systems-benchmark-20261016/findings.json').read_text())['findings']
 manifest=json.loads((D/'coverage.json').read_text());ids=[v['id']for v in manifest['items']]
 if len(ids)!=len(set(ids)) or set(ids)!={v['id']for v in baseline}:errors.append('coverage must match all 26 source IDs exactly')
 for v in manifest['items']:
  if not (D/v['contract']).is_file():errors.append('missing contract: '+v['contract'])
  if v['runtime_status']!='unchanged_not_completed_by_this_design':errors.append('runtime status overclaim: '+v['id'])
 for p in D.glob('*.md'):
  for dst in re.findall(r'\]\(([^)]+)\)',p.read_text()):
   if dst.startswith(('http://','https://','#')):continue
   if not (p.parent/dst.split('#')[0]).exists():errors.append(f'missing local link: {p.name}: {dst}')
 fixtures=json.loads((D/'contract-fixtures.json').read_text())
 for c in fixtures['cases']:
  found=validate_case(c);valid=not found;ok=valid==c['expect_valid'];rows.append({'id':c['id'],'pass':ok,'expected_valid':c['expect_valid'],'diagnostics':found})
  if not ok:errors.append('scenario mismatch: '+c['id'])
 report={'status':'pass' if not errors else 'fail','kind':'design_contract_validation_not_game_test','coverage':len(ids),'scenarios':rows,'errors':errors,'documents':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(D.glob('*.md'))}}
 out.mkdir(parents=True,exist_ok=True);(out/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'status':report['status'],'coverage':len(ids),'scenarios':len(rows),'errors':errors},ensure_ascii=False))
 raise SystemExit(bool(errors))
if __name__=='__main__':main()
