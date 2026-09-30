"""Prepare generated container states with the existing scene pixelization pipeline."""
import json
from pathlib import Path
from PIL import Image
from build_scene import pixelize
ROOT=Path(__file__).resolve().parent.parent
sources=ROOT/'art_sources/exploration_containers_v1'
# Source-map sizes; world rendering uses the existing factor 3.
rows=[('medicine',20),('food',19),('barrel',14),('clothes',22),
      ('wardrobe',20),('cavewardrobe',19),('wreck',18),('cache',14)]
atlas=Image.new('RGBA',(80*3,100*9))
meta={}
for sheet in range(2):
    im=Image.open(sources/('containers-a.png' if sheet==0 else 'containers-b.png')).convert('RGBA')
    cw,ch=im.width//3,im.height//4
    for r in range(4):
        kind,width=rows[sheet*4+r]
        cuts=[]
        for col in range(3):
            cell=im.crop((col*cw,r*ch,(col+1)*cw,(r+1)*ch))
            mask=cell.getchannel('A').point(lambda a:255 if a>=120 else 0)
            box=mask.getbbox()
            if not box:raise ValueError((kind,col,'empty alpha'))
            cell=cell.crop(box);cuts.append(cell)
        scale=width/cuts[0].width
        meta[kind]={'row':sheet*4+r,'width':width,'states':[]}
        for col,cell in enumerate(cuts):
            sprite=pixelize(cell,round(cell.width*scale),ncol=40)
            if sprite.width>78 or sprite.height>94:raise ValueError((kind,sprite.size))
            x=col*80+40-sprite.width//2;y=(sheet*4+r)*100+94-sprite.height
            atlas.alpha_composite(sprite,(x,y))
            meta[kind]['states'].append([sprite.width,sprite.height])
im=Image.open(sources/'wine-barrel.png').convert('RGBA')
cuts=[]
for col in range(3):
    cell=im.crop((col*im.width//3,0,(col+1)*im.width//3,im.height))
    box=cell.getchannel('A').point(lambda a:255 if a>=120 else 0).getbbox()
    cuts.append(cell.crop(box))
scale=14/cuts[0].width
meta['winebarrel']={'row':8,'width':14,'states':[]}
for col,cell in enumerate(cuts):
    sprite=pixelize(cell,round(cell.width*scale),ncol=40)
    atlas.alpha_composite(sprite,(col*80+40-sprite.width//2,894-sprite.height))
    meta['winebarrel']['states'].append([sprite.width,sprite.height])
atlas.save(ROOT/'assets/containers_v1.webp',lossless=True,exact=True)
(ROOT/'js/container-art.js').write_text("'use strict';\nconst CONTAINER_ART="+json.dumps({'cell':[80,100],'anchor':[40,94],'kinds':meta},ensure_ascii=False,separators=(',',':'))+';\n')
(sources/'atlas-metadata.json').write_text(json.dumps(meta,indent=2))
print('Built 9 container kinds, 27 states:',atlas.size)
