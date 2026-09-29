"""Generate missing reviewed Jianghu v2 icon originals.

Run from repo root: python3 tools_scene/gen_menu_icons_v2.py
Output originals and metadata to ignored raw_menu_icons/. Existing files are skipped.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools_common'))
import flatimg  # noqa: E402

MANIFEST = ROOT / 'tools_scene/menu_icons_v2_manifest.json'
RAW = ROOT / 'raw_menu_icons'
REFERENCE = ROOT / 'tools_scene/menu_icon_style_ref.png'
PARAMS = dict(model='gpt-image-2.5-sunburst', size='1024x1024', quality='high', output_format='png', n=1)
STYLE = (
    'ONE standalone premium hand-painted 2D inventory icon for a grounded Southern Song wuxia RPG. '
    'Use attached sword ONLY as a reference for painterly rendering quality, warm upper-left light, '
    'cool shadows and restrained mineral pigments; make a completely different object. '
    'One centered subject occupies about 80 percent of the square canvas. Bold unique silhouette '
    'readable at 48 pixels. Refined ink-and-gouache detail and authentic material texture. '
    'Pure flat white #FFFFFF background, no floor shadow. No text, letters, numbers, UI, border, '
    'medallion, scenery, pixels, chunky black outline, glowing magic or fantasy gems. Subject: '
)


def main() -> None:
    RAW.mkdir(exist_ok=True)
    entries = json.loads(MANIFEST.read_text(encoding='utf-8'))['entries']
    jobs = []
    for entry in entries:
        dest = RAW / f"{entry['kind']}_{entry['id']}.png"
        if dest.exists():
            continue
        jobs.append(dict(_dest=str(dest), _key=f"{entry['kind']}/{entry['id']}",
                         images=[str(REFERENCE)], prompt=STYLE + entry['prompt'], **PARAMS))
    print(f'{len(jobs)} icon originals pending; {len(entries) - len(jobs)} existing', flush=True)
    log_path = RAW / 'generation-log.json'
    log = json.loads(log_path.read_text()) if log_path.exists() else {}

    def on_done(i, job, result, error):
        key = job['_key']
        if error:
            print(f'FAIL {key}: {error}', flush=True)
            log[key] = {'error': str(error)[:300]}
        else:
            Path(job['_dest']).write_bytes(result.png)
            log[key] = {'prompt': job['prompt'], 'params': PARAMS, 'task_id': result.meta.get('task_id'),
                        'seconds': result.meta.get('seconds'), 'bytes': len(result.png)}
            print(f'OK {key} ({len(result.png)//1024} KiB, {result.meta.get("seconds")} s)', flush=True)
        log_path.write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding='utf-8')

    results = flatimg.run_many(jobs, max_workers=3, on_done=on_done)
    failures = [jobs[i]['_key'] for i, r in enumerate(results) if isinstance(r, Exception)]
    print(f'Done: {len(jobs)-len(failures)} generated, {len(failures)} failed', flush=True)
    if failures:
        raise SystemExit('Failed keys: ' + ', '.join(failures))


if __name__ == '__main__':
    main()
