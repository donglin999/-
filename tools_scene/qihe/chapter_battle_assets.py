"""Chapter-specific white-model -> built-in imagegen sources -> strict QA -> sheets.

No network requests here. Generation prompts/results are archived separately.
Uses the project's approved deterministic sprite packing pipeline.
"""
from pathlib import Path
import argparse, copy, json, os, shutil, sys
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
os.chdir(ROOT)
OUT = ROOT / 'art_sources/qihe-chapter1-battle-v1'
sys.path.insert(0, str(ROOT / 'tools_fx/rig'))
import poses as P
import genframes as G
import assemble as A
import qa as Q

CHARS = ['qh_luheng_v1', 'qh_raider_front_v1', 'qh_raider_rear_v1']
FACE_CROPS = dict(zip(CHARS, [[146,93,60,60], [153,36,60,60], [171,24,60,60]]))
BASE_EXTRACT=A.extract
EXTRACT_CACHE={}
def final_grid_registration(char, file, cells, pose):
    """Choose registration by FINAL rounded/grounded pixels, without relaxing QA.

    Legacy extraction optimizes pre-grounding silhouette IoU, which can shrink
    raised hands into the torso to match loose trousers. We evaluate the same
    uniform scale/translation candidates AFTER to_art and require every existing
    coverage/joint threshold. No body-part warp or pose repair is performed.
    """
    key=(char,file,pose)
    if key in EXTRACT_CACHE:return EXTRACT_CACHE[key]
    # The first down candidate faces the wrong anatomical direction. Geometry
    # alone cannot approve a visually rejected pose.
    if char=='qh_luheng_v1' and Path(file).name=='down_0.png' and pose=='dead':
        EXTRACT_CACHE[key]=None;return None
    e=BASE_EXTRACT(char,file,cells,pose)
    if e is None:return None
    before=A.metrics(char,e,A.to_art(e))
    if Q.judge(before,char):
        candidates=[]
        for sc in np.arange(.82,1.60,.03):
            for dx in range(-8,9):
                c=dict(e,sc=float(sc),dx=dx)
                m=A.metrics(char,c,A.to_art(c))
                if not Q.judge(m,char):candidates.append((Q.score(m),c,m))
        if candidates:
            _,e,after=max(candidates,key=lambda c:c[0])
            fileout=OUT/char/'registration.json'
            records=json.loads(fileout.read_text()) if fileout.exists() else {}
            records[Path(file).name+':'+pose]={'before':before,'after':after,'scale':e['sc'],'dx':e['dx'],'method':'uniform scale + horizontal translation; final-pixel QA, thresholds unchanged'}
            fileout.write_text(json.dumps(records,indent=2))
    EXTRACT_CACHE[key]=e
    return e

def register():
    A.extract=final_grid_registration
    Q.QV=8
    lu = copy.deepcopy(P.CHARS['beggar'])
    lu.update(facing='l', tier='party', colors=32, actions=copy.deepcopy(P.ACTIONS), grids=copy.deepcopy(G.GRIDS))
    lu['body'].update(H=64, heads=6.3, bulk=1.03, robe=.25,
                      weapon=dict(kind='staff', len=56, grip=.42, hand='N'))
    lu['poses']['dash1'] = dict(lu['poses']['dash0'], lN=[-24,60,50], lF=[50,60,0], air=2)
    lu['poses']['win'] = dict(lu['poses']['cast'], lean=-2, head=-5)
    P.CHARS[CHARS[0]] = lu
    for char, bulk in zip(CHARS[1:], [1.1, .98]):
        cfg = copy.deepcopy(P.CHARS['bandit'])
        cfg['body'].update(H=64, bulk=bulk)
        cfg['body']['weapon']['len']=30
        cfg.update(colors=28)
        P.CHARS[char] = cfg

def prepare():
    sources={r['id']:Path(r['path']) for r in json.loads((OUT/'outputs.json').read_text())}
    def archived(key,destination):
        # Prefer checked-in originals; imagegen temporary paths need not survive.
        if not destination.exists():
            if not sources[key].exists():raise FileNotFoundError('Missing archived source: '+str(destination))
            shutil.copy2(sources[key],destination)
    for key, filename in [('bg_lesson','bb_qh_training_v1'),('bg_road','bb_qh_evacuation_v1')]:
        archived(key,OUT/(key+'.png'))
        Image.open(OUT/(key+'.png')).convert('RGB').save(ROOT/'assets'/(filename+'.webp'),quality=95)
    (ROOT/'raw_anim').mkdir(exist_ok=True)
    for char,key in zip(CHARS,['model_luheng','model_raider_front','model_raider_rear']):
        folder=OUT/char;folder.mkdir(exist_ok=True)
        link=ROOT/'raw_anim'/char
        if not link.exists():link.symlink_to(os.path.relpath(folder,link.parent), target_is_directory=True)
        archived(key,folder/'model.png')
        (folder/'gen').mkdir(exist_ok=True)
        (folder/'rig-config.json').write_text(json.dumps(P.CHARS[char],indent=2))
        for group in G.grids(char):
            im,cells=G.render_grid(char,group)
            im.save(folder/'gen'/(group+'_guide.png'))
            (folder/'gen'/(group+'_cells.json')).write_text(json.dumps(cells,indent=2))
        print(char,list(G.grids(char)))

def check(chars):
    fails={}
    for char in chars:
        errors=Q.run(char)
        data=json.loads((OUT/char/'qa.json').read_text())
        missing=set(P.unique_poses(char))-set(data['pick'])
        if errors or missing:fails[char]={'bad':errors,'missing':sorted(missing)}
    (OUT/'qa-summary.json').write_text(json.dumps(fails,indent=2))
    return fails

def build(chars):
    if check(chars):raise SystemExit('Selected frames failed strict QA; not exporting')
    manifest={}
    for char in chars:
        A.build(char)
        A.pipe_sheet(char,'all',str(OUT/char/'pipeline.png'))
        shutil.copy2(ROOT/A.review_dir(char)/('b_'+char+'.png'),OUT/char/'contact.png')
        manifest[char]=json.loads((ROOT/'raw_battle/I/sheets.json').read_text())[char]
        manifest[char]['faceCrop']=FACE_CROPS[char]
    existing=json.loads((OUT/'sheets.json').read_text()) if (OUT/'sheets.json').exists() else {}
    existing.update(manifest)
    (OUT/'sheets.json').write_text(json.dumps(existing,indent=2))

if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('command',choices=['prepare','qa','build']);ap.add_argument('chars',nargs='*');args=ap.parse_args()
    register()
    if args.command=='prepare':prepare()
    elif args.command=='qa':raise SystemExit(1 if check(args.chars or CHARS) else 0)
    else:build(args.chars or CHARS)
