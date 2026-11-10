# 生图出的旧册页纸（paper.png）→ 菜单整页纸底 album_paper.webp：裁成 16:9、去透明、颜色往预览图 B 的纸色拉（略减黄）
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
im = im.crop((0, 80, 1536, 944))
r, g, b = im.split()
r = r.point(lambda v: min(255, int(v * 0.975)))
g = g.point(lambda v: min(255, int(v * 0.99)))
b = b.point(lambda v: min(255, int(v * 1.035)))
Image.merge('RGB', (r, g, b)).save(out, 'WEBP', quality=90)
