# 室内局部重画后同步前景层（*_fg，压在人物上面做遮挡）：在改动框里，前景层只保留和新底图一致的像素，
# 其余清成透明——否则底图上去掉的家具在游戏里还看得见（第四十八轮踩过，docs/playtest-review.md 第三节）。
# 用法：python3 fg_sync.py <旧底图> <新底图> <前景层（原地改写）> x,y,w,h [x,y,w,h ...]
import sys
import numpy as np
from PIL import Image
old, new, fg = sys.argv[1:4]
O = np.array(Image.open(old).convert('RGB')).astype(int)
N = np.array(Image.open(new).convert('RGB')).astype(int)
F = np.array(Image.open(fg).convert('RGBA'))
n = 0
for b in sys.argv[4:]:
    x, y, w, h = [int(v) for v in b.split(',')]
    sl = (slice(y, y + h), slice(x, x + w))
    changed = np.abs(O[sl] - N[sl]).sum(2) > 24          # 底图这里被改过
    fgrgb = F[sl][..., :3].astype(int)
    same = np.abs(fgrgb - N[sl]).sum(2) <= 30            # 前景像素和新底图一致就留
    kill = changed & ~same & (F[sl][..., 3] > 0)
    a = F[sl][..., 3]; a[kill] = 0; F[sl][..., 3] = a
    n += int(kill.sum())
Image.fromarray(F).save(fg, 'WEBP', lossless=True) if fg.endswith('.webp') else Image.fromarray(F).save(fg)
print('前景层清掉', n, '像素')
