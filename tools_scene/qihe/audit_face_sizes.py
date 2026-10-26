# -*- coding: utf-8 -*-
"""按配准结果核对每张剧情立绘在舞台上的脸高、脸线（2026-10-21 用户：大小不均一）。
以本人“平常”档的锚点为准（docs/assets/cultivation-actor-layout.json 的 actors.*.face），用 register_faces.py 把锚点换算到同一人的每一档
（含朝左版 *_left、萧白空手版 hero-empty），再按当前站位 CSS 的 top／height 算出舞台上的脸高和脸线，与目标（脸高 FACE、脸线 LINE）比较。
以工作区根目录运行：python3 tools_scene/qihe/audit_face_sizes.py 人物id,... 输出.json
输出每张：配准锚点、当前舞台脸高与脸线、偏差。"""
from pathlib import Path
import json, sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_actor_layout as L
from register_faces import register

HV = Path('assets/production/cultivation/household-v1'); HE = Path('assets/production/cultivation/hero-empty')


def files_for(k):
    if k.startswith('hero_'):
        return HV / f'{k}_normal.png', sorted(HE.glob(f'{k}_empty_*.png'))
    ref = HV / f'{k}_normal.png'
    if not ref.exists(): ref = HV / f'{k}.png'
    fs = [p for p in sorted(HV.glob(f'{k}*.png')) if p.stem == k or (p.stem.startswith(k + '_') and not any(p.stem.startswith(o + '_') or p.stem == o for o in OTHERS.get(k, ())))]
    return ref, fs


OTHERS = {'pei': ('peishu',), 'hero': ()}


def stage_of(layout, k, p):
    stem = p.stem
    if p.parent == HE: return layout['actors'][k]
    if stem.endswith('_left'):
        m = stem[len(k) + 1:-5] or 'fun'; return layout['facing_left'].get(f'{k}_{m}') or layout['actors'][k]
    m = stem[len(k) + 1:] or 'fun'
    return layout['moods'].get(f'{k}_{m}') or layout['actors'][k]


def main():
    layout = json.loads(Path('docs/assets/cultivation-actor-layout.json').read_text())
    out = {}
    for k in sys.argv[1].split(','):
        ref, fs = files_for(k); a = layout['actors'][k]['face']
        tgt_h = L.FACE * L.FACE_SCALE.get(k, 1); tgt_line = L.LINE + L.SHORTER.get(k, 0)
        for p in fs:
            r = register(ref, a, p); st = stage_of(layout, k, p)
            fh = (r['y1'] - r['y0']) * st['height']; line = st['top'] + (r['y0'] + r['y1']) / 2 * st['height']
            out[p.stem] = dict(person=k, path=str(p), ref=ref.stem, **r, stage_h=round(fh, 2), stage_line=round(line, 2),
                               target_h=round(tgt_h, 2), target_line=tgt_line, dh=round((fh / tgt_h - 1) * 100, 1), dline=round(line - tgt_line, 2))
            o = out[p.stem]; print(f"{p.stem:30s} 分{o['score']:.2f} 脸高{o['stage_h']:6.2f}({o['dh']:+.1f}%) 脸线{o['stage_line']:6.2f}({o['dline']:+.2f})")
    Path(sys.argv[2]).write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')


if __name__ == '__main__': main()
