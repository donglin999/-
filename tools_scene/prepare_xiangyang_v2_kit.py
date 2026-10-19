"""Split the generated city atlas, preserving source alpha and native pixels."""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, binary_dilation

P = Path(__file__).resolve().parents[1] / 'art_sources/xiangyang_city_v2'
spec = json.loads((P / 'kit-crops.json').read_text())
atlas = Image.open(P / spec['source']).convert('RGBA')
assert list(atlas.size) == spec['sourceSize']
for name, rect in spec['rectangles'].items():
    cut = atlas.crop(rect)
    if name == 'coop':
        # An adjacent cart sack intrudes into this grid cell; segment ownership.
        a = np.array(cut)
        labels, _ = label(a[:, :, 3] >= 128)
        sizes = np.bincount(labels.ravel()); sizes[0] = 0
        owned = binary_dilation(labels == sizes.argmax(), iterations=1)
        a[~owned, 3] = 0
        cut = Image.fromarray(a)
    bounds = cut.getchannel('A').point(lambda a: 255 if a >= 128 else 0).getbbox()
    assert bounds, name
    cut.crop(bounds).save(P / (name + '.png'))
