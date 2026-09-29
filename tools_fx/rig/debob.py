"""探索移动表去"蹦"：压缩帧间身体上下起伏（K 的步态骨盆起伏在 47px Q 版上显得过大）。
按每帧头顶高度相对该行中位数的偏差，反向平移 (1-KEEP) 倍（以 3 画布像素 = 1 美术像素为单位取整），只保留 KEEP 比例的律动。
  人形（hero / suzhi）：整帧平移（历史行为，逐字保留）。
  四足（dog）：只平移"腿根线"以上（躯干 + 头 + 尾），腿脚区不动 → 脚掌仍贴地，不因去蹦而陷地/悬空。
用法（explore.py build 之后运行一次；**非幂等**，重复运行会继续压缩）：
  python3 tools_fx/rig/debob.py              # 缺省 = hero suzhi（原行为）
  python3 tools_fx/rig/debob.py dog          # 只处理大黄
原表备份在 raw_anim/explore_prebob/。
"""
import glob, os, shutil, sys, numpy as np
from PIL import Image
KEEP = .4; PX = 3
SPEC = {'walk': 12, 'run': 10}
QUAD_SPLIT = {'dog': 5 + 7}        # 四足：单元底边以上 (底边距 5 + 腿根高 7) 美术像素以下为腿脚区，不平移
chars = sys.argv[1:] or ['hero', 'suzhi']
for f in sorted(glob.glob('assets/s_*_walk*.webp') + glob.glob('assets/s_*_run*.webp')):
    c = next((c for c in chars if os.path.basename(f).startswith(f's_{c}_')), None)
    if c is None: continue
    os.makedirs('raw_anim/explore_prebob', exist_ok=True)
    bk = 'raw_anim/explore_prebob/' + os.path.basename(f)
    if c in QUAD_SPLIT or not os.path.exists(bk): shutil.copy(f, bk)       # 人形旧备份不覆盖
    n = SPEC['walk' if '_walk' in f else 'run']
    im = np.array(Image.open(f).convert('RGBA')); H = im.shape[0] // 4; W = im.shape[1] // n
    out = np.zeros_like(im)
    for r in range(4):
        cells = [im[r*H:(r+1)*H, i*W:(i+1)*W] for i in range(n)]
        tops = [np.where((c_[..., 3] > 0).any(1))[0].min() for c_ in cells]
        med = float(np.median(tops))
        for i, c_ in enumerate(cells):
            dy = int(round((med - tops[i]) * (1 - KEEP) / PX)) * PX      # 头偏高(top 小) → 下移
            if c in QUAD_SPLIT:
                split = H - QUAD_SPLIT[c] * PX
                sh = c_.copy()
                if dy:
                    up = c_[:split].copy()
                    sh[:split] = 0
                    if dy > 0:                                           # 上身下沉：叠在腿上
                        sh[dy:split + dy] = np.where(up[..., 3:] > 0, up, sh[dy:split + dy])
                    else:                                                # 上身上提：接缝用原行补齐
                        sh[:split + dy] = up[-dy:]
                        sh[split + dy:split] = c_[split + dy:split]
            else:
                sh = np.zeros_like(c_)
                if dy > 0: sh[dy:] = c_[:-dy]
                elif dy < 0: sh[:dy] = c_[-dy:]
                else: sh = c_
            out[r*H:(r+1)*H, i*W:(i+1)*W] = sh
    Image.fromarray(out).save(f, lossless=True)
    print(f)
