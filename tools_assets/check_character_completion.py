"""Integrity checks for this adopted character batch and editable layer delivery."""
from pathlib import Path
import hashlib,json,zipfile
from PIL import Image
import numpy as np
R=Path(__file__).resolve().parents[1];H=R/'art_sources/hero-multiweapon-production-20261014';D=R/'review/character-completion-20261014'
review=json.loads((D/'data.json').read_text());notes=json.loads((D/'choreography.json').read_text());layers=json.loads((H/'layers/manifest.json').read_text())
rows=[]
for a in review['actors']:
 p=R/a['file'].lstrip('/');im=Image.open(p).convert('RGBA');arr=np.asarray(im);colors=len(np.unique(arr[:,:,:3][arr[:,:,3]>0],axis=0));assert colors<=32,(a['id'],colors)
 assert set(np.unique(arr[:,:,3]))<=set([0,255]);small=arr[::3,::3];assert np.array_equal(arr,np.repeat(np.repeat(small,3,axis=0),3,axis=1))
 assert im.size==(a['art']['cols']*480,324)
 assert set(notes[a['id']])==set(a['art']['anim'])
 for key,s in a['art']['anim'].items():
  c=notes[a['id']][key];assert [v['frame'] for v in c['steps']]==s['f'];assert all(v['duration_ms']>0 for v in c['steps']);assert c['total_ms']==sum(s['ms'])
 rows.append(dict(actor=a['id'],frames=a['art']['cols'],colors=colors,alpha='binary',exact_3x=True))
for family,a in layers['families'].items():
 merged=Image.new('RGBA',(7680,324))
 for k in layers['order']:merged.alpha_composite(Image.open(H/'layers'/a['layers'][k]).convert('RGBA'))
 actual=np.asarray(merged);baked=np.asarray(Image.open(H/'out'/f'b_gy_hero_{family}_20261014.webp').convert('RGBA'))
 visible=lambda x:np.where(x[:,:,3,None]>0,x,0)
 assert np.array_equal(visible(actual),visible(baked)),family
with zipfile.ZipFile(H/'hero-layered-source.zip') as z:
 assert z.testzip() is None
 assert len([n for n in z.namelist() if n.endswith('.png')])==18
 assert json.loads(z.read('manifest.json'))==layers
for p in review['portraits']:
 im=Image.open(R/p['file'].lstrip('/'));assert im.size==(1024,1536);assert im.mode=='RGBA'
report=dict(status='pass',battle_frames=sum(r['frames'] for r in rows),actors=rows,action_contracts=sum(map(len,notes.values())),portraits=len(review['portraits']),layers=dict(frames=96,atlases=18,recomposition='visible RGBA exact',zip_sha256=hashlib.sha256((H/'hero-layered-source.zip').read_bytes()).hexdigest()))
(D/'evidence/integrity.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(H/'layers-verification.json').write_text(json.dumps(dict(status='pass',frames=96,families=6,layer_atlases=18,visible_rgba_recomposition_all=True,zip_sha256=report['layers']['zip_sha256']),indent=2)+'\n')
print(json.dumps({k:v for k,v in report.items() if k!='actors'},ensure_ascii=False))
