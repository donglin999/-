import json,copy,sys
from pathlib import Path
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'tools_scene'))
from check_chapter1_walls import check,check_alpha
b=json.load(open(ROOT/'art_sources/chapter1_scene_v1/authoring-board-village.json'))
assert check(b)['status']=='pass'
for key in ['wallRuns','wallOpenings']:
 bad=copy.deepcopy(b);bad.pop(key,None);assert check(bad)['status']=='fail',key+' missing must fail'
bad=copy.deepcopy(b);bad['wallRuns']=[];assert check(bad)['status']=='fail','empty runs with real walls must fail'
bad=copy.deepcopy(b);bad['objects'].append(dict(id='orphan_wall',asset='wall_h',visualRect=[900,1100,1000,1142],footprintRect=[900,1132,1000,1142]));assert check(bad)['status']=='fail','unowned real wall must fail'
bad=copy.deepcopy(b);bad['wallOpenings'].append(copy.deepcopy(bad['wallOpenings'][0]));r=check(bad);assert r['status']=='fail' and any('duplicate opening id' in e for e in r['errors']),'duplicate opening cannot be overwritten'
bad=copy.deepcopy(b);bad['wallConnections']=[p for p in bad['wallConnections'] if 'clinic_w_head' not in p];assert check(bad)['status']=='fail','junction without explicit run/building connections must fail'
for id in ['clinic_wall_e','chen_side_w','clinic_side_e_n']:
 bad=copy.deepcopy(b);bad['objects']=[o for o in bad['objects'] if o['id']!=id];r=check(bad);assert r['status']=='fail',id+' removed must fail';assert any(id in e for e in r['errors'])
bad=copy.deepcopy(b);bad['wallOpenings']=[o for o in bad['wallOpenings'] if o['id']!='chen_return'];assert check(bad)['status']=='fail','unregistered courtyard back gap must fail'
image=Image.new('RGBA',(80,42),(100,90,70,255));assert check_alpha(image,'wall_h')['status']=='pass'
cut=image.copy();ImageDraw.Draw(cut).rectangle([30,0,35,41],fill=(0,0,0,0));assert check_alpha(cut,'wall_h')['status']=='fail','missing bricks must fail'
cap=image.copy();ImageDraw.Draw(cap).rectangle([68,0,79,41],fill=(0,0,0,0));assert check_alpha(cap,'wall_h')['status']=='fail','missing end cap must fail'
bad=copy.deepcopy(b);wall=next(o for o in bad['objects'] if o['id']=='clinic_side_w_n')['footprintRect'];next(o for o in bad['objects'] if o['id']=='clinic_water')['footprintRect']=[wall[0]+1,wall[1]+12,wall[2]-1,wall[1]+28];assert check(bad)['status']=='fail','barrel/wall penetration must fail'
source=Image.new('RGBA',(450,141),(110,110,100,255));sd=ImageDraw.Draw(source);sd.rectangle([0,0,57,140],fill=(150,100,50,255));sd.rectangle([392,0,449,140],fill=(150,100,50,255));naked=Image.new('RGBA',(80,42),(110,110,100,255));assert check_alpha(naked,'wall_h',source)['status']=='fail','solid bare brick endpoint must fail full cap template'
print('Wall contract deletion / unregistered opening / missing alpha / missing cap negative cases: PASS')
