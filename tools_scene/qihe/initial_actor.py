"""Isolated whitebox pipeline configuration; no API calls and no legacy sprite overwrite."""
from pathlib import Path
import sys,json,os
from PIL import Image
ROOT=Path(__file__).resolve().parents[2];os.chdir(ROOT)
sys.path.insert(0,str(ROOT/'tools_fx/rig'))
import explore as E
import qrig as Q
C='qh_hero_initial'
E.RAW='art_sources/qihe-initial-motion';E.REV='art_sources/qihe-initial-motion/review'
E.CELL_H=49; E.MARGIN_C[C]=4
Q.BODIES[C]=Q.QBody(hem=9.0,ponytail=False)
E.DESC[C]='Xiao Bai, young adult Chinese man, SHORT natural messy black hair, NO ponytail NO bun; charcoal gray-blue coarse short cross-collar tunic, off-white inner collar, narrow tan cloth belt, dark gray loose trousers, dark cloth shoes, no weapons or bags. Same character as portrait.'
old=E.portrait_panel
def panel(c):
 if c!=C:return old(c)
 p=Image.open('assets/p_opening_hero_village.webp').convert('RGBA');p.thumbnail((E.REFW-16,E.OUTH-40))
 im=Image.new('RGBA',(E.REFW,E.OUTH),Q.BG+(255,));im.alpha_composite(p,((E.REFW-p.width)//2,(E.OUTH-p.height)//2));return im.convert('RGB')
E.portrait_panel=panel
base=Path(E.RAW)/C;base.mkdir(parents=True,exist_ok=True);(base/'gen').mkdir(exist_ok=True,parents=True)
cmd=sys.argv[1] if len(sys.argv)>1 else 'prepare'
if cmd=='prepare':
 im,cells=E.render_model_guide(C);im.save(base/'model_guide.png');(base/'cells.json').write_text(json.dumps({'model':cells},indent=2));(base/'model-prompt.txt').write_text(E.prompt_model(C)+' Match the old approved small game character reference for proportions and crisp pixel clusters, not an oversized round-faced mascot. Keep exact white mannequin joints, short hair and initial costume. Highest coherent quality.');E.rig_review(C)
elif cmd=='strips':
 cells=json.loads((base/'cells.json').read_text())
 for key in E.strips(C):
  im,cc=E.render_strip_guide(C,key);im.save(base/'gen'/f'{key}_guide.png');cells[key]=cc
  (base/'gen'/f'{key}_prompt.txt').write_text(E.prompt_strip(C,key)+' Exact phase and opposite arm/leg swing must match whitebox. Short hair, plain gray-blue tunic, dark pants. No sword, ponytail or red sash. Maintain same palette and face.')
 (base/'cells.json').write_text(json.dumps(cells,indent=2))
elif cmd=='qa':E.run_qa(C)
elif cmd=='build':E.build(C);E.review(C)
print(base)
