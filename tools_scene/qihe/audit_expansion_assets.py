"""Read-only source inspection for the Qihe expansion design; never adopts assets."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image

BRANCH = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--source', type=Path, default=BRANCH.parent / 'xiaojianghu')
args = parser.parse_args()
source = args.source.resolve()
card_path = source / 'docs/design/opening-character-assets.json'
cards = json.loads(card_path.read_text())
ids = {'hero', 'ye', 'zhouyan', 'luheng', 'censhuang', 'chengduo', 'wukui',
       'aunt', 'chen', 'steward', 'retainer', 'procurement', 'procurement_aide', 'henchman'}
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
rows = []
for c in cards['characters']:
    if c['character_id'] not in ids:
        continue
    files = []
    for a in c['assets']:
        for f in a['files']:
            p, b = source / f, BRANCH / f
            item = {'path': f, 'asset_group': a['group'], 'recorded_status': a['status'],
                    'source_exists': p.is_file(), 'branch_exists': b.is_file()}
            if p.is_file():
                item['sha256'] = sha(p)
                expected = a.get('files_sha256', {}).get(f)
                item['matches_recorded_hash'] = item['sha256'] == expected if expected else None
                try:
                    with Image.open(p) as im:
                        item['dimensions'] = list(im.size)
                except Exception:
                    pass
            files.append(item)
    rows.append({'id': c['character_id'], 'stage': c['stage_id'], 'name': c['name'],
                 'source_role': c['role_type'], 'source_presence': c['exploration_presence'],
                 'files': files})
extras = []
for f in ('assets/s_wolf.webp', 'assets/b_wolf.webp'):
    p, b = source / f, BRANCH / f
    row = {'path': f, 'source_exists': p.is_file(), 'branch_exists': b.is_file()}
    if p.is_file():
        row['sha256'] = sha(p)
        with Image.open(p) as im:
            row['dimensions'] = list(im.size)
    extras.append(row)
references = {}
for f in ['docs/design/map-development-standard.md', 'docs/design/role-assets.md',
          'docs/design/character-walk-quality.md', 'docs/anim-pipeline.md',
          'docs/design/chapter1-activities.md', 'docs/design/chapter1-pressure.md',
          'docs/design/chapter1-mountain.md', 'docs/design/protagonist-sect.md',
          'docs/design/cultivation.md', 'docs/archive/design/ye-routes.md']:
    p = source / f
    references[f] = sha(p) if p.is_file() else None
report = {'date': '2026-10-04', 'scope': 'design inspection, not production acceptance',
          'source_root': str(source), 'branch_root': str(BRANCH),
          'card_sha256': sha(card_path), 'source_documents_sha256': references,
          'characters': rows, 'wolf_candidates': extras,
          'runtime_evidence': {'file': 'js/qihe-characters.js',
                               'sha256': sha(BRANCH / 'js/qihe-characters.js'),
                               'borrowed_clothes_sprite': 'hero',
                               'henchman_dialogue': 'c_bandit',
                               'procurement_aide_dialogue': 'c_villager'},
          'limits': ['File presence and old acceptance do not approve new scene style.',
                     'A reference sheet is not a walking animation.',
                     'No assets or game scripts were changed by this audit.']}
out = BRANCH / 'docs/design/qihe-map/expansion/asset-audit.json'
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'characters': len(rows), 'files': sum(len(c['files']) for c in rows),
                  'missing_source': sum(not f['source_exists'] for c in rows for f in c['files']),
                  'hash_mismatch': sum(f.get('matches_recorded_hash') is False for c in rows for f in c['files']),
                  'output': str(out)}, ensure_ascii=False))
