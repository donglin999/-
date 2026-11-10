# -*- coding: utf-8 -*-
# 南村口土路去石块（第四十八轮评审第 2 题第 7 处）：路中间（离路边 ≥40 像素）的深色石块堆，
# 用附近一块干净土路纹理整块盖住（边缘羽化 2 像素），靠路边的石块和小碎粒保留。
# 用法：python3 cover.py <候选.json> <原图> <新图> <对照图>
import json, sys, random
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from scipy import ndimage
cand, src, dst, cmpf = sys.argv[1:5]
im = Image.open(src).convert('RGB'); A = np.array(im).astype(int)
r, g, b = A[..., 0], A[..., 1], A[..., 2]
mx = A.max(2); mn = A.min(2); sat = (mx - mn) / np.maximum(mx, 1)
dirt = (r > 150) & (g > 110) & (b < 150) & (r - b > 45) & (r >= g)
dirtR = ndimage.binary_opening(ndimage.binary_closing(dirt, iterations=8), iterations=12)
rock = ((mx < 170) & (sat < 0.45)) | ((g >= r) & (mx < 150))
clean = dirtR & ~ndimage.binary_dilation(rock, iterations=2)
out = im.copy(); done = []
random.seed(7)
for x, y, w, h, e, a in json.load(open(cand)):
    if e < 40 or (1190 <= x <= 1600 and 290 <= y <= 470): continue   # 靠路边的留着；北边破亭子台基不碰
    p = 4; X, Y, Wd, Ht = x - p, y - p, w + 2 * p, h + 2 * p
    best = None
    for _ in range(400):
        dx = random.choice([-1, 1]) * random.randint(Wd + 4, Wd + 90); dy = random.randint(-50, 50)
        sx, sy = X + dx, Y + dy
        if sx < 0 or sy < 0 or sx + Wd > im.width or sy + Ht > im.height: continue
        if clean[sy:sy + Ht, sx:sx + Wd].all():
            best = (sx, sy); break
    if not best: print('找不到干净的土：', x, y); continue
    patch = im.crop((best[0], best[1], best[0] + Wd, best[1] + Ht))
    mk = Image.new('L', (Wd, Ht), 0); ImageDraw.Draw(mk).rectangle((2, 2, Wd - 3, Ht - 3), fill=255)
    out.paste(patch, (X, Y), mk.filter(ImageFilter.GaussianBlur(1.5)))
    done.append((X, Y, Wd, Ht))
print('盖掉', len(done), '处')
out.save(dst, 'WEBP', quality=95) if dst.endswith('.webp') else out.save(dst)
c = Image.new('RGB', (im.width, im.height * 2 + 20), (240, 232, 214)); c.paste(im, (0, 0)); c.paste(out, (0, im.height + 20))
c.resize((c.width // 2, c.height // 2)).save(cmpf)
