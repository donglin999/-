# -*- coding: utf-8 -*-
"""第一章模块化地图（2026-10-07 起）：已正式采用的高清·AI修边档覆盖 build_expansion 的整图 bg/fg/fgp/mask。

每张图登记一个批次；批次 out/hd/scene.json 提供道具层（props/propK）、碰撞遮罩（mask）与水面闪光区（water）。
地面图与道具层的正式 ID 分别为 m_qh_<key>（沿用原 ID，正式文件改指向新图）与 m_qh_<key>_props。
build_expansion.py 编译时调用 apply()；锚点、起点、poly、objects、世界尺寸保持空间合同原值，批次必须与之一致。
"""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]
ADOPTED = {
    'south': 'art_sources/qihe-modular-pilot-20261007',
    'east': 'art_sources/qihe-modular-east-20261007',
    'west': 'art_sources/qihe-modular-west-20261007',
    'refuge': 'art_sources/qihe-modular-refuge-20261007',
    'north': 'art_sources/qihe-modular-north-20261007',
    'central': 'art_sources/qihe-modular-central-20261007',
}


def apply(compiled):
    for key, batch in ADOPTED.items():
        m = compiled[key]
        s = json.loads((ROOT / batch / 'out/hd/scene.json').read_text())
        if s['world'] != m['worldSize'] or s['start'] != m.get('start', m['anchors'].get('start')) or any(s['anchors'].get(k) != v for k, v in m['anchors'].items()):
            raise SystemExit(f'模块化地图 {key} 与空间合同不一致（世界尺寸/起点/锚点），拒绝覆盖')
        for k in ('fg', 'fgp'):
            m.pop(k, None)
        m.update(bg=f'm_qh_{key}', propImg=f'm_qh_{key}_props', propK=s['propK'], props=s['props'], mask=s['mask'], water=s['water'] or None,   # 无水域必须为 null：scene.js 对真值 water 抽样，空数组会出错
                 modular=batch)
    return compiled
