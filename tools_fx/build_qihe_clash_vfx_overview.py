"""第 7 步总览图：每招“定稿概念图 | 实际特效关键帧截图”左右对照 → art_sources/qihe-clash-vfx-elements-v1/review-overview.png
概念图 1536×1024 上下各有 80px 黑边（参考场景 = 游戏画布 ×1.6、下移 80），裁成 1536×864 后与游戏画布截图同一取景。"""
import os
from PIL import Image, ImageDraw, ImageFont
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CON = os.path.join(ROOT, 'art_sources/qihe-clash-vfx-concepts-v1')
SH = os.path.join(ROOT, 'art_sources/qihe-clash-vfx-elements-v1/review-shots')
ROWS = [('am_s3_a-1', 'am_s3_v2_180', '明约合锋 · 起手凝芒（180ms）'), ('am_s3_b-1', 'am_s3_v2_520', '明约合锋 · 扇面命中（520ms）'),
        ('cs_whip_s1_a-2', 'cs_whip_s1_v2_320', '缠腕短打 · 缠腕命中（320ms）'),
        ('cs_whip_s2_a-1', 'cs_whip_s2_v2_180', '回身掠影 · 身周蓄势（180ms）'), ('cs_whip_s2_b-2', 'cs_whip_s2_v2_540', '回身掠影 · 大弧命中（540ms）')]
W, H, PAD, TH = 768, 432, 12, 34
font = ImageFont.truetype('/System/Library/Fonts/Hiragino Sans GB.ttc', 20)
c = Image.new('RGB', (PAD * 3 + W * 2, PAD + len(ROWS) * (H + TH + PAD) + 40), (28, 26, 32))
d = ImageDraw.Draw(c)
d.text((PAD, 8), '左：定稿概念图　｜　右：v2 实际特效（8792 交锋舞台，画布原像素）', font=font, fill=(236, 226, 196))
y = 44
for con, shot, label in ROWS:
    a = Image.open(os.path.join(CON, con + '.png')).convert('RGB').crop((0, 80, 1536, 944)).resize((W, H), Image.LANCZOS)
    b = Image.open(os.path.join(SH, shot + '.png')).convert('RGB').resize((W, H), Image.LANCZOS)
    d.text((PAD, y + 4), f'{label}　概念 {con}', font=font, fill=(236, 214, 160))
    c.paste(a, (PAD, y + TH)); c.paste(b, (PAD * 2 + W, y + TH))
    y += H + TH + PAD
out = os.path.join(ROOT, 'art_sources/qihe-clash-vfx-elements-v1/review-overview.png')
c.save(out); print(out, c.size)
