#!/usr/bin/env python3
"""把原版运行时会引用到的素材复制进 Godot 工程（game/assets/，保持原相对路径），只读原版目录。

判定“会引用到”：素材的相对路径、文件名或去扩展名的文件名，出现在原版运行代码（js/**/*.js、js/*.css、index.html，
不含 review 评审脚本）的字符串里。偏宽松：宁可多带，不漏图。另外按 EXTRA 补上代码里用模板拼出来的名字。
用法：python3 tools/sync_assets.py [--dry]
"""
import os, re, glob, shutil, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.normpath(os.path.join(HERE, '../../xiaojianghu-legacy-prologue'))
DST = os.path.normpath(os.path.join(HERE, '../game'))
dry = '--dry' in sys.argv

def code_text():
    t = []
    for f in glob.glob(os.path.join(SRC, 'js/**/*.js'), recursive=True) + glob.glob(os.path.join(SRC, 'js/*.css')) + [os.path.join(SRC, 'index.html')]:
        if 'review' in os.path.basename(f):
            continue
        t.append(open(f, encoding='utf-8', errors='ignore').read())
    return '\n'.join(t)

def main():
    txt = code_text()
    used, size = [], 0
    for root, _, files in os.walk(os.path.join(SRC, 'assets')):
        for f in files:
            if f.startswith('.') or f.endswith(('.md', '.json', '.txt', '.py')):
                continue
            p = os.path.join(root, f)
            rel = os.path.relpath(p, SRC)
            b = os.path.splitext(f)[0]
            if rel in txt or f in txt or re.search(r'[\'"`/]' + re.escape(b) + r'[\'"`.]', txt):
                used.append(rel); size += os.path.getsize(p)
    # 代码里用模板拼出来的文件名（培养模式的家务、立绘差分等）按子任务统计的清单补上
    # 另：交锋特效的 manifest.json 由 WuxiaFX.load 按目录读取（tools/missing_assets_fx.txt）
    for extra in [os.path.join(DST, 'data/cultivation/missing_assets.txt'), os.path.join(os.path.dirname(__file__), 'missing_assets_fx.txt')]:
        if not os.path.exists(extra): continue
        for l in open(extra, encoding='utf-8'):
            l = l.strip()
            if l and not l.startswith('#') and l not in used and os.path.exists(os.path.join(SRC, l)):
                used.append(l); size += os.path.getsize(os.path.join(SRC, l))
    copied = 0
    for rel in used:
        s, d = os.path.join(SRC, rel), os.path.join(DST, rel)
        if os.path.exists(d) and os.path.getsize(d) == os.path.getsize(s) and os.path.getmtime(d) >= os.path.getmtime(s):
            continue
        copied += 1
        if not dry:
            os.makedirs(os.path.dirname(d), exist_ok=True); shutil.copy2(s, d)
    if not dry:
        json.dump(sorted(used), open(os.path.join(DST, 'data/asset_manifest.json'), 'w'), ensure_ascii=False, indent=0)
    print(f'引用素材 {len(used)} 个，{size/1e6:.0f} MB；本次复制 {copied} 个')

main()

# Godot 只认未压缩 PCM 的 WAV；原版有的 WAV 是压缩编码，复制进来后就地转成 16 位 PCM（原版文件不动）
import subprocess, wave
for root, _, files in os.walk(os.path.join(DST, 'assets')):
    for f in files:
        if not f.endswith('.wav'): continue
        p = os.path.join(root, f)
        try:
            wave.open(p).close(); continue
        except Exception:
            pass
        tmp = p + '.pcm.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', p, '-acodec', 'pcm_s16le', tmp], check=True)
        os.replace(tmp, p); print('转为 PCM：', os.path.relpath(p, DST))
