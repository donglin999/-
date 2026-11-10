# 第五十轮第 1 题验收“继续改”（11-10）：用户说实机和预览图 B 样式、背景不一样。
# 隔水竖条、页面上下的金色锦边直接从预览图 B（我们自己生图出的）上裁下来，保证和预览一模一样。
# 用法：python3 cut_bands.py <B.png> <输出目录>
import sys
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
p = Image.open(src).convert('RGB')
# 竖隔水：左边那条 x 596..619，y 150..950（避开梅竹）
v = p.crop((596, 150, 620, 950))
v.save(out + '/album_strip_v.png')
# 横锦边：页眉下沿 y 98..115，取右栏上方那段 x 1100..1400（上下没有装饰）
h = p.crop((1100, 97, 1400, 117))
# 左右镜像拼接，平铺无缝
w = h.width
hh = Image.new('RGB', (w * 2, h.height)); hh.paste(h, (0, 0)); hh.paste(h.transpose(Image.FLIP_LEFT_RIGHT), (w, 0))
hh.save(out + '/album_band_h.png')
# 栏线（头像列和人物栏之间那条细线）用颜色画，不裁
print(v.size, hh.size)
# 立绘画框上下的青灰锦纹边：直接裁预览图那两段，拉到画框宽（不平铺，没有接缝）
p.crop((619, 114, 1052, 144)).save(out + '/album_mount_top.png')
p.crop((619, 935, 1052, 975)).save(out + '/album_mount_bot.png')
