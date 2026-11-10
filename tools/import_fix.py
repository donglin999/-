#!/usr/bin/env python3
"""导入设置修正：原版程序化水墨纹理（data/bui/）要无损，避免墨迹边缘出压缩噪点。导入一次后运行，再 godot --import。"""
import glob, os
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '../game')
n = 0
for p in glob.glob(os.path.join(GAME, 'data/bui/*.png.import')):
    s = open(p).read(); t = s.replace('compress/mode=1', 'compress/mode=0')
    if t != s: open(p, 'w').write(t); n += 1
print('改为无损', n)
