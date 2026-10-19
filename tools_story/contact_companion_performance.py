#!/usr/bin/env python3
"""Technical QA contact sheets; never modify native art."""
import argparse,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'art_sources/companion_performance_20261004'
p=argparse.ArgumentParser();p.add_argument('--character');p.add_argument('--baselines',action='store_true');a=p.parse_args()
d=json.loads((OUT/'manifest.json').read_text());qa=OUT/'qa';qa.mkdir(exist_ok=True)
def cell(path,size,bg):
 im=Image.open(ROOT/path).convert('RGBA');im.thumbnail(size)
 canvas=Image.new('RGB',size,bg);canvas.paste(im,((size[0]-im.width)//2,(size[1]-im.height)//2),im)
 return canvas
def sheet(jobs,cols,size,name,crop=False):
 rows=(len(jobs)+cols-1)//cols;canvas=Image.new('RGB',(cols*size[0],rows*(size[1]+26)),'#c7c7c7');dr=ImageDraw.Draw(canvas)
 for i,(title,path) in enumerate(jobs):
  x=(i%cols)*size[0];y=(i//cols)*(size[1]+26)
  if path is None:continue
  im=Image.open(ROOT/path).convert('RGBA')
  if crop:
   # Fixed whole-canvas head region, same coordinates for all expression variants.
   im=im.crop((180,0,840,500));im.thumbnail(size)
   tile=Image.new('RGB',size,'#ede6d8');tile.paste(im,((size[0]-im.width)//2,(size[1]-im.height)//2),im)
  else:tile=cell(path,size,'#f1eadc' if (i//cols)%2==0 else '#172834')
  canvas.paste(tile,(x,y));dr.text((x+5,y+size[1]+5),title,fill='#181818')
 file=qa/name;canvas.save(file,quality=94);print(file)
def doubled(jobs,cols):
 padded=jobs+[(None,None)]*((-len(jobs))%cols)
 return padded+padded
if a.baselines:
 for start in range(0,len(d['characters']),4):
  group=d['characters'][start:start+4];jobs=[(c['character_id'],c['jobs'][0]['native_file']) for c in group if c['jobs'][0].get('native_file')]
  sheet(doubled(jobs,4),4,(300,450),f'baselines-{start:02d}-light-dark.jpg')
if a.character:
 c=next(c for c in d['characters'] if c['character_id']==a.character);poses=[j for j in c['jobs'] if j['kind']=='pose' and j.get('native_file')];exps=[c['jobs'][0]]+[j for j in c['jobs'] if j['kind']=='expression' and j.get('native_file')]
 sheet(doubled([(j['id'].split('/')[-1],j['native_file']) for j in poses],5),5,(300,450),f'{a.character}-poses-light-dark.jpg')
 sheet([(j['id'].split('/')[-1],j['native_file']) for j in exps],7,(280,250),f'{a.character}-expression-faces.jpg',crop=True)
 sheet(doubled([(j['id'].split('/')[-1],j['native_file']) for j in exps],7),7,(210,315),f'{a.character}-expression-bodies.jpg')
