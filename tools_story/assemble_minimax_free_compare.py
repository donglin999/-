#!/usr/bin/env python3
"""Validate and combine four independent API scripts without rewriting their content."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'review/cultivation-minimax-compare-20261012'
OUT = BASE / 'free-rewrite'
ids = ['visitor_songfeng_route', 'gy_noodles', 'gy_prelude_xinfa', 'gy_m03']
casts = [set(['hero', 'zhou', 'mo_songnian']), set(['hero', 'shimu', 'dou', 'goose']),
         set(['hero', 'zhou', 'zhong']), set(['hero', 'ye', 'zhou'])]
baseline = json.loads((BASE / 'baseline.json').read_text())
source = ROOT.parent / baseline['source']
assert hashlib.sha256(source.read_bytes()).hexdigest() == baseline['source_sha256']
scenes, calls, counts = [], [], []
for sid, cast in zip(ids, casts):
    folder = OUT / sid
    meta = json.loads((folder / 'generation.json').read_text())
    assert meta['finish_reason'] == 'stop', sid
    assert meta['returned_model'] == 'MiniMax-M3', sid
    for name, key in [('request.json', 'request_sha256'), ('minimax-original.txt', 'output_sha256')]:
        assert hashlib.sha256((folder / name).read_bytes()).hexdigest() == meta[key], sid
    raw = (folder / 'minimax-original.txt').read_text().strip()
    if raw.startswith('```'):
        raw = raw.split('\n', 1)[1].rsplit('```', 1)[0].strip()
    result = json.loads(raw)
    assert result == json.loads((folder / 'minimax.json').read_text())
    assert len(result['scenes']) == 1 and result['scenes'][0]['id'] == sid
    scene = result['scenes'][0]
    beats = scene['opening'] + [b for branch in scene['branches'] for b in branch['beats']] + scene['ending']
    assert scene['opening'] and isinstance(scene['title'], str)
    assert [b['id'] for b in scene['branches']] == (['verify_notes', 'route_questions'] if sid == ids[0] else [])
    for beat in beats:
        assert beat['speaker'] in cast | {'stage'}, (sid, beat)
        assert beat['kind'] in ['line', 'thought', 'stage', 'title'], (sid, beat)
        assert beat.get('condition', 'any') in ['any', 'footwork', 'no_footwork'], (sid, beat)
        assert isinstance(beat['text'], str) and beat['text'].strip()
    scenes.append(scene)
    calls.append(dict(scene=sid, **meta))
    counts.append(dict(scene=sid, total_blocks=len(beats), speech_blocks=sum(b['kind'] in ['line', 'thought'] for b in beats), stage_blocks=sum(b['kind'] in ['stage', 'title'] for b in beats)))
(OUT / 'minimax.json').write_text(json.dumps(dict(scenes=scenes), ensure_ascii=False, indent=2) + '\n')
(OUT / 'generation.json').write_text(json.dumps(dict(returned_model='MiniMax-M3', status='candidate_needs_revision', post_editing=False, assembly='Concatenation of four model-authored scenes; text unchanged', calls=calls), ensure_ascii=False, indent=2) + '\n')
report = dict(structure='pass', provenance='pass', content_review='needs_revision', scenes=counts,
              source_unchanged=True, no_original_game_dialogue_sent=True,
              notes='Structural validation is not literary approval. See editorial-notes.json.')
(OUT / 'validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False))
