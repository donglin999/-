#!/usr/bin/env python3
"""Read-only asset and storyboard consistency checks; writes one review report."""
from collections import Counter
from pathlib import Path
import hashlib
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'art_sources/martial_icons_full_v1'
DOC = ROOT / 'docs/design/martial-review'

catalog = json.loads((DOC / 'catalog.json').read_text())
rows = catalog['skills'] + catalog['hearts']
assets = json.loads((OUT / 'manifest.json').read_text())
vfx = json.loads((DOC / 'vfx/catalog.json').read_text())['entries']
expected = {r['id'] for r in rows}
assert len(expected) == len(rows) == 82
assert len(assets) == len(vfx) == 82
assert {r['id'] for r in assets} == {r['id'] for r in vfx} == expected
by_id = {r['id']: r for r in rows}
by_asset = {r['id']: r for r in assets}
sizes = Counter()
margin_pending = []
hashes = []
for a in assets:
    path = ROOT / a['path']
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    assert digest == a['sha256'], a['id']
    hashes.append(digest)
    assert a['prompt'].strip(), a['id']
    with Image.open(path) as im:
        assert im.mode == 'RGBA' and min(im.size) >= 512, a['id']
        alpha = im.getchannel('A')
        hist = alpha.histogram()
        assert hist[0] > 0 and sum(hist[1:]) > 0, a['id']
        box = alpha.point(lambda p: 255 if p > 16 else 0).getbbox()
        w, h = im.size
        if min(box[0], box[1], w-box[2], h-box[3]) < min(w,h)*.08:
            margin_pending.append(a['id'])
        sizes[f'{w}x{h}'] += 1
assert len(set(hashes)) == 82, 'Duplicate image files'
for v in vfx:
    r = by_id[v['id']]
    assert v['icon_id'] == r['icon_id']
    assert v['icon_reference'] == by_asset[v['id']]['path'], v['id']
    assert v['base_hits'] == r.get('base_hits', 0), v['id']
    timeline = v['timeline']
    assert len(timeline) == 4 and timeline[0]['start_ms'] == 0
    assert timeline[-1]['end_ms'] == v['budget']['duration_ms']
    for i, phase in enumerate(timeline):
        assert phase['description'].strip() and phase['start_ms'] < phase['end_ms']
        if i:
            assert timeline[i-1]['end_ms'] == phase['start_ms']
    hits = [e for e in v['events'] if e['name'] == 'present_hit']
    assert len(hits) == v['base_hits'], v['id']
    assert all(0 <= e['at_ms'] <= v['budget']['duration_ms'] for e in v['events'])
    if r['kind'] == 'heart' or not v['base_hits']:
        assert v['budget']['shake_px'] == v['budget']['hitstop_once_ms'] == 0
report = {
    'date': '2026-10-06', 'icons': 82, 'skills': 64, 'hearts': 18,
    'sha_and_rgba_passed': 82, 'unique_files': 82, 'actual_sizes': dict(sizes),
    'vfx_consistency_passed': 82, 'user_approved_style_samples': 10,
    'new_icons_pending_user_review': 72,
    'margin_under_8_percent_count': len(margin_pending),
    'margin_under_8_percent_ids': margin_pending,
    'runtime_integrated': 0,
    'production_move_icons': sum(bool(r.get('production_icon')) for r in catalog['skills']),
    'limitations': 'Metadata checks do not constitute visual approval. 64 move production icons have independent safe-margin exports; original-source margin flags are preserved. Full future move combat and VFX remain unimplemented.'
}
(OUT / 'audit.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(json.dumps(report, ensure_ascii=False))
