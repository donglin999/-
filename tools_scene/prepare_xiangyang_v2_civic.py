"""Split authored civic atlas rectangles, preserving generated alpha."""
from pathlib import Path
import json
from PIL import Image
P=Path(__file__).resolve().parents[1]/'art_sources/xiangyang_city_v2'
spec=json.loads((P/'civic-crops.json').read_text())
im=Image.open(P/spec['source']).convert('RGBA')
assert list(im.size)==spec['sourceSize']
for name,rect in spec['rectangles'].items():
    tile=im.crop(rect)
    bounds=tile.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    assert bounds,name
    # This atlas wall was rejected for a diagonal baseline. Never overwrite
    # the corrected independent horizontal production source on a rebuild.
    target=name+'-diagonal-rejected' if name in ['citywall_h','fence_v'] else name
    tile.crop(bounds).save(P/(target+'.png'))
