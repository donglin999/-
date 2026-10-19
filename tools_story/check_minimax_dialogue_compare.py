#!/usr/bin/env python3
"""Check candidate provenance and one-to-one coverage without calling any API."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'review/cultivation-minimax-compare-20261012'
baseline = json.loads((OUT / 'baseline.json').read_text())
candidate = json.loads((OUT / 'minimax.json').read_text())
meta = json.loads((OUT / 'generation.json').read_text())
source = ROOT.parent / baseline['source']
assert hashlib.sha256(source.read_bytes()).hexdigest() == baseline['source_sha256'], 'Current source changed after snapshot'
assert hashlib.sha256((OUT / 'request.json').read_bytes()).hexdigest() == meta['request_sha256']
assert hashlib.sha256((OUT / 'minimax-original.txt').read_bytes()).hexdigest() == meta['output_sha256']
raw = (OUT / 'minimax-original.txt').read_text().strip()
if raw.startswith('```'):
    raw = raw.split('\n', 1)[1].rsplit('```', 1)[0].strip()
assert json.loads(raw) == candidate, 'Candidate differs from API output'
assert meta['finish_reason'] == 'stop' and meta['returned_model'] == meta['requested_model'] == 'MiniMax-M3'
assert [s['id'] for s in baseline['scenes']] == [s['id'] for s in candidate['scenes']]
total = 0
unchanged = 0
long_lines = []
for original, generated in zip(baseline['scenes'], candidate['scenes']):
    assert [l['id'] for l in original['lines']] == [l['id'] for l in generated['lines']], original['id']
    for old, new in zip(original['lines'], generated['lines']):
        assert isinstance(new['text'], str) and new['text'].strip(), new['id']
        assert set(new) == {'id', 'text'}, new['id']
        if old['speaker'] in ('title', 'goose'):
            assert old['text'] == new['text'], new['id']
        else:
            assert old['speaker'] in old['cast'], new['id']
        total += 1
        unchanged += old['text'] == new['text']
        if len(new['text']) > 85:
            long_lines.append(new['id'])
report = dict(status='pass', scenes=len(candidate['scenes']), lines=total,
              changed_lines=total-unchanged, unchanged_lines=unchanged, long_lines=long_lines,
              exact_api_output=True, formal_dialogue_unchanged=True,
              model=meta['returned_model'], scope='Provenance and structure; see editorial-notes.json for human-readable content review')
(OUT / 'validation.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False))
