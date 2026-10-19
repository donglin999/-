"""Make technical face crops for comparing existing art, never synthesize new faces."""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'art_sources/story_atlas_portraits_v5'
OUT = ROOT / 'review/story-atlas'
data = json.loads((ROOT / 'docs/design/story-atlas.json').read_text())
bounds = json.loads((BASE / 'face-crop-bounds.json').read_text())
bounds.update({'duan-mingtang':[430,124,600,291], 'yan-xiaolou':[472,179,611,341], 'tang-zhaoxue':[435,123,610,303]})
(BASE / 'face-crop-bounds.json').write_text(json.dumps(bounds, indent=2) + '\n')
(OUT / 'faces').mkdir(exist_ok=True)
women = [c for c in data['characters'] if c.get('type') == 'companion' and c.get('gender') == '女']
board = Image.new('RGB', (240 * 4, 280 * ((len(women) + 3) // 4)), '#eee7da')
draw = ImageDraw.Draw(board)
rows = []
for i, c in enumerate(women):
    cid = c['id']
    rec = json.loads((BASE / 'records' / f'{cid}.json').read_text())
    source = BASE / rec['source']
    crop = Image.open(source).convert('RGB').crop(bounds[cid])
    dest = OUT / 'faces' / f'{cid}-current.png'
    crop.save(dest)
    rev = hashlib.sha256(dest.read_bytes()).hexdigest()[:12]
    current = f'faces/{cid}-current.png?rev={rev}'
    before = current
    if rec.get('face_revision'):
        old = BASE / 'references' / f'{cid}-face-before.png'
        dest = OUT / 'faces' / f'{cid}-before.png'
        Image.open(old).convert('RGB').crop(bounds[cid]).save(dest)
        before = f'faces/{cid}-before.png?rev=' + hashlib.sha256(dest.read_bytes()).hexdigest()[:12]
    rows.append(dict(id=cid, name=c['name'], current=current, before=before, revised=bool(rec.get('face_revision')), newCharacter=bool(rec.get('new_character')),
                     description=c['faceIdentity']['face_shape']+'；'+c['faceIdentity']['eyes'],
                     observation=rec.get('face_observed'), full=c['image'], status=c['imageStatus']))
    thumb = ImageOps.contain(crop, (225, 242))
    x, y = i % 4 * 240, i // 4 * 280
    board.paste(thumb, (x+(240-thumb.width)//2, y))
    draw.text((x+7, y+250), cid, fill='black')
board.save(OUT / 'face-contact-sheet.jpg', quality=94)
(OUT / 'face-data.js').write_text('window.FACE_REVIEW = '+json.dumps(rows,ensure_ascii=False)+';\n')
print(json.dumps(dict(faces=len(rows), revised=sum(r['revised'] for r in rows)), ensure_ascii=False))
