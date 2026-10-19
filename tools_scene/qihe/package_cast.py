"""Import audited stage-specific cast; build bandit static poses against same whitebox."""
from pathlib import Path
from PIL import Image
import json,re,shutil,sys,os,hashlib,numpy as np
R=Path(__file__).resolve().parents[2];os.chdir(R);src=R.parent/'xiaojianghu';out=R/'art_sources/qihe-initial-motion';sys.path.insert(0,str(R/'tools_fx/rig'))
import explore as E, qrig as Q
E.RAW='art_sources/qihe-initial-motion';c='qh_bandit';Q.BODIES[c]=Q.QBody(hem=9,ponytail=False)
b=out/c;b.mkdir(exist_ok=True);shutil.copy(out/'bandit-guide.png',b/'model_guide.png');shutil.copy('/Users/wuxiuxiang/.codex/generated_images/01a0f11e-a6c7-7941-8197-4087ab0c885b/exec-8a7118c0-3607-4a51-955b-f01b368aa8bb.png',b/'model_0.png');shutil.copy(out/'qh_hero_initial/cells.json',b/'cells.json')
arts=E.model_art(c);rows=[];report={}
for d in 'dlru':
 a=arts[d];m=E.metrics(c,a,'stand',d,0);report[d]=dict(metrics=m,bad=E.judge(m));rows.append(a)
# Full canonical canvas preserves shoe/hair bounds, no fabricated movement.
can=Image.new('RGBA',(64*3*4,54*3*4))
for y,a in enumerate(rows):
 im=Image.fromarray(a).resize((192,162),Image.Resampling.NEAREST)
 for x in range(4):can.paste(im,(x*192,y*162))
can.save(R/'assets/s_qh_bandit.webp',lossless=True);(b/'qa.json').write_text(json.dumps(report,indent=2));print('bandit', {d:v['bad'] for d,v in report.items()})
m=json.loads(re.search(r'window.OPENING_CHARACTER_ART=(.*);\n', (src/'js/opening-character-data.js').read_text()).group(1));files=set()
for id,s in m['sprites'].items():
 if id!='hero_village':files.add(s['file'])
for id,expressions in m['portraits'].items():
 files.add('p_opening_'+id)
 for e in expressions:
  if e!='neutral':files.add('p_opening_'+id+'_'+e)
files.update(m['avatars'].values())
for id,meta in m.get('battles',m.get('battle',{})).items():files.add(meta['file'])
for f in files:
 p=src/'assets'/f'{f}.webp'
 if p.exists():shutil.copy(p,R/'assets'/p.name)
# Battle metadata sits under battle; import the initial protagonist and Lu only.
print('metadata keys',list(m))
hero=json.loads((out/'qh_hero_initial/build.json').read_text());assert hero['clipped_px']==hero['clipped_bottom_px']==0
sheets=hero['sheets'];js=['"use strict";','(()=>{if(!isQiheEntry())return;']
for id,s in m['sprites'].items():
 if id=='hero_village':continue
 k='opening_'+id;js.append(f"CHARS.push('{k}');ASSETS.push('{s['file']}');ART.sheet.{k}={s['cell']};ART.frames.{k}=4;ART.scale.{k}=1;")
js.append("CHARS.push('qh_hero_initial','qh_bandit');ART.frames.qh_hero_initial=4;ART.frames.qh_bandit=4;ART.scale.qh_hero_initial=1;ART.scale.qh_bandit=1;ART.sheet.qh_bandit=[192,162];ASSETS.push('s_qh_bandit','s_qh_hero_initial');")
js.append('ART.sheet.qh_hero_initial='+json.dumps(sheets['sheet']['cell'])+';')
for kind in ['walk','run','idle']:
 x=sheets[kind];spec=dict(frames=x['frames'],cell=x['cell'],rows='dlru',file='s_qh_hero_initial_'+kind,bright='s_qh_hero_initial_'+kind+'_bright',order=list(range(x['frames'])))
 if kind=='idle':spec['ms']=[420,180,380,200,260,200]
 else:spec['stride']=.175 if kind=='walk' else .23
 js.append(f'ART.{kind}.qh_hero_initial='+json.dumps(spec)+';')
# Fixed canonical origin avoids dynamically stretching frames/re-grounding airborne feet.
js.append('ART.motionAnchor=ART.motionAnchor||{};ART.motionAnchor.qh_hero_initial={body:129,foot:135};')
for id,ex in m['portraits'].items():
 k='opening_'+id;js.append(f"if(!PORTS.includes('{k}'))PORTS.push('{k}');DIALOGUE_LEADS.add('{k}');EXPR['{k}']={json.dumps([x for x in ex if x!='neutral'])};")
for f in sorted(files):
 if (R/'assets'/f'{f}.webp').exists() and not f.startswith('s_'):js.append(f"ASSETS.push('{f}');")
for id,bm in m.get('battle',m.get('battles',{})).items():
 if id in ['hero_village','luheng']:
  shutil.copy(src/'assets'/f"{bm['file']}.webp",R/'assets'/f"{bm['file']}.webp");js.append('BART['+json.dumps(id)+']='+json.dumps(bm)+';ASSETS.push('+json.dumps(bm['file'])+');')
js.append('})();');(R/'js/qihe-cast-art.js').write_text('\n'.join(js)+'\n');(out/'import-manifest.json').write_text(json.dumps({f:hashlib.sha256((R/'assets'/f'{f}.webp').read_bytes()).hexdigest() for f in files if (R/'assets'/f'{f}.webp').exists()},indent=2))
