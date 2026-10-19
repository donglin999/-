"""Pack generated transparent props; retain source alpha and nearest pixel sampling."""
from pathlib import Path
from PIL import Image
import json, hashlib

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'art_sources/qihe-resources-v1'
sizes = {'branch': (48, 26), 'herb': (38, 38), 'reed': (32, 54)}
report = {}
for kind, size in sizes.items():
    path = SOURCE / (kind + '.png')
    im = Image.open(path).convert('RGBA')
    # Bounding the substantial alpha leaves the generated edges intact; no redraw.
    box = im.getchannel('A').point(lambda a: 255 if a > 128 else 0).getbbox()
    assert box, kind
    tile = im.crop(box)
    tile.thumbnail(size, Image.Resampling.NEAREST)
    sheet = Image.new('RGBA', (64, 64))
    sheet.paste(tile, ((64 - tile.width) // 2, 60 - tile.height))
    output = ROOT / ('assets/r_qh_' + kind + '_v1.webp')
    sheet.save(output, lossless=True, exact=True)
    report[kind] = dict(source_sha256=hashlib.sha256(path.read_bytes()).hexdigest(), crop=box,
                        content_size=tile.size, cell=[64,64], anchor=[32,60],
                        output=str(output.relative_to(ROOT)), sha256=hashlib.sha256(output.read_bytes()).hexdigest())
(SOURCE / 'build.json').write_text(json.dumps(report, indent=2))
print('Packed 3 transparent resource props')
