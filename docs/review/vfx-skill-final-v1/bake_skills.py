#!/usr/bin/env python3
"""第二批招式命中成品烘焙（伏虎拳、横杆护身），做法同 vfx-hit-final-v1/bake_hits.py：
关键帧条（2×2 透明底）→ 切格 → 按接触点锚定 → 缩到战斗特效像素 → 锁色 24 色、alpha 5 阶 → 横排精灵表 → data/battle/fx_skills.json。
用法：python3 bake_skills.py（输出 game/assets/fx/skills/<招>.png；预览 preview/<招>.png）"""
import json, os, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('bh', os.path.join(HERE, '../vfx-hit-final-v1/bake_hits.py')); bh = importlib.util.module_from_spec(spec); spec.loader.exec_module(bh)
GAME = bh.GAME; OUT = os.path.join(GAME, 'assets/fx/skills'); os.makedirs(OUT, exist_ok=True)
F = bh.F
HEAVY = [(0, F, 0, 1, 1), (F, 2.4 * F, 1, 1, 1), (2.4 * F, 4.2 * F, 2, 1, 1), (4.2 * F, 6.4 * F, 3, 1, 0)]   # 伏虎：热浪多停半拍
KINDS = {
    'fuhu':          dict(strip='raw/fuhu.png', scale=0.17, dir=1, keys=HEAVY, stop=70, shake=5, name='fuhu'),
    'qh_hulu_staff': dict(strip='raw/hulu.png', scale=0.22, dir=1, keys=bh.STD, stop=60, shake=4, name='hulu'),
}
bh.OUT = OUT; bh.HERE = HERE
out = {'_说明': '招式命中成品（docs/review/vfx-skill-final-v1/bake_skills.py 生成，不手改）。键是招式 id；格式同 fx_hits.json。'}
for k, cfg in KINDS.items():
    bh.NAME[k] = cfg['name']
    d = bh.bake(k, cfg); d['sheet'] = 'assets/fx/skills/%s.png' % cfg['name']
    out[k] = d; print(k, d['fw'], d['fh'], '锚点', d['anchor'][0])
json.dump(out, open(os.path.join(GAME, 'data/battle/fx_skills.json'), 'w'), ensure_ascii=False, indent=1)
