#!/usr/bin/env python3
"""Production export only: crop transparent padding, uniform resize, restore safe margin.
Never alter subjects, colors, original images, or generation receipts.
"""
from pathlib import Path
from PIL import Image
import json,hashlib
ROOT=Path(__file__).resolve().parents[1];DOC=ROOT/'docs/design/martial-review';c=json.loads((DOC/'catalog.json').read_text());assets={r['id']:r for r in json.loads((ROOT/'art_sources/martial_icons_full_v1/manifest.json').read_text())};out=ROOT/'assets/ui/martial-moves-v3';out.mkdir(parents=True,exist_ok=True);records=[]
for r in c['skills']:
 a=assets[r['id']];source=ROOT/a['path'];assert hashlib.sha256(source.read_bytes()).hexdigest()==a['sha256']
 im=Image.open(source);assert im.mode=='RGBA' and min(im.size)>=512;alpha=im.getchannel('A');box=alpha.getbbox();assert box and alpha.histogram()[0]>0
 ink=im.crop(box);ratio=384/max(ink.size);scaled=ink.resize((max(1,round(ink.width*ratio)),max(1,round(ink.height*ratio))),Image.Resampling.LANCZOS);frame=Image.new('RGBA',(512,512));frame.alpha_composite(scaled,((512-scaled.width)//2,(512-scaled.height)//2));path=out/(r['id']+'.png');frame.save(path,optimize=True)
 visible=frame.getchannel('A').getbbox();margins=[visible[0],visible[1],512-visible[2],512-visible[3]];assert min(margins)>=64,(r['id'],margins)
 rec={'id':r['id'],'name':r['name'],'path':str(path.relative_to(ROOT)),'size':[512,512],'mode':'RGBA','sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'source':a['path'],'source_sha256':a['sha256'],'source_tool':a.get('tool'),'processing':'transparent trim + uniform Lanczos resize to longest edge384 + 512 clear frame','margins':margins,'original_approval':a.get('review_status'),'visual_review':'agent_contact_sheet_review_passed; not_user_approval'};records.append(rec);r['production_icon']=rec
(DOC/'catalog.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n');(out/'manifest.json').write_text(json.dumps({'version':'MOVE-ICON-3','expected':64,'generated':64,'records':records},ensure_ascii=False,indent=2)+'\n')
# Serve production icons in real learned move menus. Aliases preserve old save IDs.
aliases={'jinzhen':'bh_s1','huichun':'bh_s2','baicao':'bh_s4'}
icons={r['id']:r['path'] for r in records};icons.update({k:icons[v] for k,v in aliases.items()})
(ROOT/'js/martial-move-icons.js').write_text('window.MartialMoveIcons='+json.dumps(icons,ensure_ascii=False,indent=2)+';\n')
print('64 original generated icons exported; safe margin and SHA checks passed.')
