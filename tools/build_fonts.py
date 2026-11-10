#!/usr/bin/env python3
"""按游戏实际用到的字裁剪字体（原版从 Google Fonts 在线取 Noto Serif SC 500/700、Noto Sans SC 400/500/700、ZCOOL XiaoWei）。
收字范围：原版 js/**/*.js、css、index.html、story/**/*.ink，加 ASCII 与常用标点、全部 GB2312 一级常用字作余量。
字体源（OFL）放在 tools/font_src/，不进工程；输出 game/fonts/*.ttf。用法：python3 tools/build_fonts.py <字体源目录>"""
import glob, os, sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, '../../xiaojianghu-legacy-prologue'))
OUT = os.path.join(HERE, '../game/fonts'); os.makedirs(OUT, exist_ok=True)
FS = sys.argv[1]
chars = set(chr(c) for c in range(0x20, 0x7f))
for pat in ['js/**/*.js', 'js/**/*.css', 'index.html', 'story/**/*.ink', 'docs/../js/story-data/*.js']:
    for f in glob.glob(os.path.join(SRC, pat), recursive=True):
        chars |= set(open(f, encoding='utf-8', errors='ignore').read())
# 2026-11-04 起只更新 Godot 版：Godot 自有剧本 story/*.ink 与脚本里的界面文字也要收进来
for f in glob.glob(os.path.join(HERE, '../story/**/*.ink'), recursive=True) + glob.glob(os.path.join(HERE, '../game/scripts/**/*.gd'), recursive=True):
    chars |= set(open(f, encoding='utf-8', errors='ignore').read())
for f in glob.glob(os.path.join(HERE, '../game/data/**/*.json'), recursive=True):
    chars |= set(open(f, encoding='utf-8', errors='ignore').read())
# 游戏里的字全部来自剧本与代码（主角名固定“萧白”，没有玩家输入），不再加常用字余量
chars |= set('，。！？、；：“”‘’（）【】《》〈〉…—·～「」『』')
text = ''.join(sorted(c for c in chars if c.isprintable() or c == ' '))
jobs = [('NotoSerifSC[wght].ttf', 500, 'NotoSerifSC-Medium.ttf'), ('NotoSerifSC[wght].ttf', 700, 'NotoSerifSC-Bold.ttf'),
        ('NotoSansSC[wght].ttf', 400, 'NotoSansSC-Regular.ttf'), ('NotoSansSC[wght].ttf', 500, 'NotoSansSC-Medium.ttf'),
        ('NotoSansSC[wght].ttf', 700, 'NotoSansSC-Bold.ttf'), ('ZCOOLXiaoWei-Regular.ttf', None, 'ZCOOLXiaoWei-Regular.ttf'),
        # 战斗界面毛笔字（原版 bui.js 在线加载 Ma Shan Zheng / Zhi Mang Xing）
        ('MaShanZheng-Regular.ttf', None, 'MaShanZheng-Regular.ttf'), ('ZhiMangXing-Regular.ttf', None, 'ZhiMangXing-Regular.ttf')]
for src, wght, out in jobs:
    f = TTFont(os.path.join(FS, src))
    if wght is not None:
        f = instancer.instantiateVariableFont(f, {'wght': wght})
    opt = subset.Options(); opt.layout_features = ['*']; opt.name_IDs = ['*']; opt.notdef_outline = True
    s = subset.Subsetter(opt); s.populate(text=text); s.subset(f)
    f.save(os.path.join(OUT, out)); print(out, os.path.getsize(os.path.join(OUT, out)) // 1024, 'KB')
print('字数', len(text))
