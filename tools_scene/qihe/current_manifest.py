from pathlib import Path
import json,hashlib,re
from PIL import Image
r=Path(__file__).resolve().parents[2];out=r/'art_sources/qihe-expansion-v1';report={
 'version':'QH-EXP-01','status':'playable-prototype','browserAccepted':False,'productionReady':False,
 'implemented':['six exterior scenes','four central exits','initial hero 4-direction whitebox walk/run/idle','matching static supporting cast','normal two-wolf tutorial','chapter1 six half-days and evacuation','mountain first night','chapter2 first cultivation period'],
 'remaining':['browser DOM/native input/audio/performance acceptance','formal door-scale/texture-density/foreground artwork review','cultivation months beyond first period'],
 'tests':{},'files':{}}
for f in ['art_sources/qihe-expansion-v1/review/report.json','art_sources/qihe-expansion-v1/chapter-test.json','art_sources/qihe-expansion-v1/chapter-battle-test.json','art_sources/qihe-expansion-v1/portal-test.json','art_sources/qihe-prologue/qa/report.json','art_sources/qihe-prologue/qa/battle-report.json','art_sources/qihe-prologue/qa/interaction-report.json']:
 p=r/f;data=json.loads(p.read_text());assert not data.get('issues');report['tests'][f]=dict(sha256=hashlib.sha256(p.read_bytes()).hexdigest(),issues=len(data.get('issues',[])))
files=[r/'index.html',*list((r/'js').glob('qihe-*.js')),r/'js/scene.js',r/'js/bfx.js',r/'js/battle.js',r/'js/prologue-story-battle.js',r/'js/prologue-arrival.js',r/'js/prologue-backhill.js',*list((r/'assets').glob('s_qh_*.webp')),*list((r/'assets').glob('m_qh_*.webp'))]
for p in files:report['files'][str(p.relative_to(r))]={'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),**({'size':list(Image.open(p).size)} if p.suffix=='.webp' else{})}
(out/'acceptance.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print('Current prototype manifest:',len(files),'files,',len(report['tests']),'test reports; browser pending')
