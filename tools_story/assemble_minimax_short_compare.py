#!/usr/bin/env python3
"""Verify sources, edited dialogue and path lengths before publishing the short comparison."""
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'review/cultivation-minimax-compare-20261012'
OUT = BASE / 'short-rewrite'
baseline = json.loads((BASE / 'baseline-current.json').read_text())
assert hashlib.sha256((ROOT.parent / baseline['source']).read_bytes()).hexdigest() == baseline['source_sha256']
casts = {'visitor_songfeng_route': {'hero', 'zhou', 'mo_songnian'}, 'gy_noodles': {'hero', 'shimu', 'dou', 'goose'}, 'gy_prelude_xinfa': {'hero', 'zhou', 'zhong'}, 'gy_m03': {'hero', 'ye', 'zhou'}}
limits = {'visitor_songfeng_route': (8, 12), 'gy_noodles': (14, 20), 'gy_prelude_xinfa': (12, 18), 'gy_m03': (9, 13)}
scenes, calls, rows, errors = [], [], [], []
for original in baseline['scenes']:
    sid = original['id']
    source_folder = BASE / 'free-rewrite' / sid
    meta = json.loads((source_folder / 'generation.json').read_text())
    assert meta['finish_reason'] == 'stop' and meta['returned_model'] == 'MiniMax-M3', sid
    assert hashlib.sha256((source_folder / 'minimax-original.txt').read_bytes()).hexdigest() == meta['output_sha256']
    edited = json.loads((OUT / 'edited-lines.json').read_text())[sid]
    def convert(lines):
        return [dict(speaker=sp, kind='line', text=text, condition='any') for sp, text in lines]
    scene = dict(id=sid, title=original['name'], opening=convert(edited['opening']),
                 branches=[dict(id=b['id'], label=b['label'], beats=convert(b['beats'])) for b in edited['branches']],
                 ending=convert(edited['ending']))
    branches = scene['branches']
    assert [b['id'] for b in branches] == (['verify_notes', 'route_questions'] if sid == 'visitor_songfeng_route' else [])
    for branch in branches or [dict(id='linear', beats=[])]:
        path = scene['opening'] + branch['beats'] + scene['ending']
        for b in path:
            assert b['speaker'] in casts[sid] | {'stage'}, (sid, b)
            assert b['kind'] in ('line', 'thought', 'stage', 'title'), (sid, b)
            assert b.get('condition', 'any') == 'any', (sid, b)
            assert isinstance(b['text'], str) and b['text'].strip()
        source = [l for l in original['lines'] if (not l['phase'].startswith('choice:') or l['phase'] == 'choice:' + branch['id']) and l['condition'] in ('所有条件', '未学步法') and l['speaker'] != 'title']
        old_chars = sum(len(l['text']) for l in source)
        new_chars = sum(len(b['text']) for b in path)
        spoken = [b for b in path if b['kind'] in ('line', 'thought')]
        stage = [b for b in path if b['kind'] in ('stage', 'title')]
        lo, hi = math.ceil(old_chars * .85), math.floor(old_chars * 1.15)
        okay = lo <= new_chars <= hi and limits[sid][0] <= len(spoken) <= limits[sid][1] and len(stage) <= 2 and all(len(b['text']) <= 15 for b in stage)
        row = dict(scene=sid, branch=branch['id'], original_chars=old_chars, chars=new_chars, ratio=round(new_chars/old_chars, 3), speech_count=len(spoken), stage_count=len(stage), min_chars=lo, max_chars=hi, pass_length=okay)
        rows.append(row)
        if not okay:
            errors.append(row)
    scenes.append(scene)
    calls.append(dict(scene=sid, **meta))
report = dict(status='fail' if errors else 'pass', paths=rows, source_unchanged=True, exact_api_text=False, post_editing=True, editor="Codex", errors=errors)
(OUT / 'length-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False))
if errors:
    raise SystemExit(1)
(OUT / 'edited.json').write_text(json.dumps(dict(scenes=scenes), ensure_ascii=False, indent=2) + '\n')
attempts = [dict(path=str(p.relative_to(OUT)), **json.loads(p.read_text())) for p in sorted(list(OUT.glob('*/generation.json')) + list(OUT.glob('*/attempt-*-generation.json')))]
(OUT / 'generation.json').write_text(json.dumps(dict(returned_model='MiniMax-M3', post_editing=True, editor='Codex', source_model='MiniMax-M3', assembly='Editorial shortening and factual correction of MiniMax candidate drafts; NOT unmodified API output', edited_source_sha256=hashlib.sha256((OUT / 'edited-lines.json').read_bytes()).hexdigest(), calls=calls, current_generation_attempts=attempts), ensure_ascii=False, indent=2) + '\n')
