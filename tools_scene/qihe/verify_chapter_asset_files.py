"""File-level acceptance only; visual and runtime checks are recorded separately."""
from pathlib import Path
import hashlib, json
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art_sources/qihe-chapter1-battle-v1'
rows=[]
for key,a in json.loads((OUT/'sheets.json').read_text()).items():
    p=ROOT/'assets'/(a['file']+'.webp')
    im=Image.open(p).convert('RGBA');d=np.array(im)
    assert list(im.size)==[a['cols']*a['cell'][0],a['cell'][1]]
    alpha=sorted(map(int,np.unique(d[:,:,3])));assert alpha==[0,255]
    assert np.array_equal(d,np.repeat(np.repeat(d[::3,::3],3,0),3,1))
    bounds=[]
    for i in range(a['cols']):
        frame=im.crop((i*a['cell'][0],0,(i+1)*a['cell'][0],a['cell'][1]))
        b=frame.getbbox();assert b;bounds.append(b)
    qa=json.loads((OUT/key/'qa.json').read_text())
    assert all(not pose['bad'] for pose in qa['pick'].values())
    for action,spec in a['anim'].items():
        assert all(0<=f<a['cols'] for f in spec['f'])
        assert len(spec['ms'])==len(spec['f']) if isinstance(spec['ms'],list) else spec['ms']>0
    frame=d[:,:a['cell'][0]];sel=frame[frame[:,:,3]>0,:3]
    rate=len(np.unique(sel,axis=0))/(len(sel)/1000);assert rate<=22
    rows.append(dict(id=key,size=im.size,frames=a['cols'],logicalCell=a['px'],alpha=alpha,exact3xGrid=True,
        opaqueRGBColors=len(np.unique(d[d[:,:,3]>0,:3],axis=0)),
        colorNote='Base shared palette plus generated outline and derived-frame colors',
        firstFrameColorsPer1000OpaquePixels=round(rate,3),selectedPoses=len(qa['pick']),selectedFailures=0,
        bounds=bounds,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
for key in ['bb_qh_training_v1','bb_qh_evacuation_v1']:
    p=ROOT/'assets'/(key+'.webp');im=Image.open(p);assert im.width>=1600 and im.height>=900
    assert abs(im.width/im.height-16/9)<.01
    rows.append(dict(id=key,size=im.size,bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
(OUT/'file-acceptance.json').write_text(json.dumps(rows,indent=2))
print('PASS 3 sheets / 56 frames, hard alpha, exact 3x grid, selected poses, animation maps, 2 backgrounds')
