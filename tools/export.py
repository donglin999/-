#!/usr/bin/env python3
"""生成导出配置并导出 Web（主包＋分包）与 macOS 版。
- Web：主包只带代码、数据、字体、界面、标题与序章后山的图；其余素材按区域分成几个 .pck（packs/），进游戏后后台下载。
- macOS：全部素材打进一个包。
用法：python3 tools/export.py [web|mac|all]   输出到 build/web/ 与 build/mac/"""
import time, os, sys, glob, json, subprocess, shutil, fnmatch
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.normpath(os.path.join(HERE, '..')); GAME = os.path.join(ROOT, 'game')
GODOT = shutil.which('godot') or '/opt/homebrew/bin/godot'
# 分包：(包名, 匹配规则)；按顺序后台下载。没匹配到的留在主包。
PACKS = [
    # 序章：标题页显示时就开始下，“从头开始”只等这一包
    ('prologue', ['assets/production/maps/m_prologue_backhill*', 'assets/production/shared/cg_p_water*', 'assets/cg_p_water*',
                  'assets/production/portraits/p_opening_hero_modern*', 'assets/production/portraits/p_ye*', 'assets/production/portraits/p_opening_hero_village*',
                  'assets/production/battle/b_wolf*', 'assets/production/battle/b_hero_modern*', 'assets/production/battle/b_ye*', 'assets/production/battle/bb_prologue_backhill*',
                  'assets/production/characters/*', 'assets/s_opening_hero_modern*', 'assets/s_prologue_wilddog*', 'assets/audio/*.mp3']),
    ('village', ['assets/production/maps/m_qh_central*', 'assets/production/maps/m_qihe_*', 'assets/production/maps/town-props-*/*', 'assets/m_qihe_*']),
    ('battle', ['assets/production/battle/*', 'assets/production/fx/*', 'assets/production/fx/**/*', 'assets/b_*', 'assets/bb_*', 'assets/fx_*', 'assets/audio/*.wav']),
    ('portraits', ['assets/production/portraits/*']),
    ('wild', ['assets/production/maps/*', 'assets/production/maps/**/*', 'assets/m_qh_*', 'assets/r_qh_*']),
    ('cg', ['assets/production/shared/*']),
    ('cultivation', ['assets/production/cultivation/*', 'assets/production/cultivation/**/*', 'assets/production/pre-hangao/*', 'assets/production/pre-hangao/**/*']),
    ('misc', ['assets/*', 'assets/**/*']),
]
# 主包里一定要留的：标题页、界面小图（HUD 与菜单同步加载）
KEEP = ['assets/ui/*', 'assets/ui/**/*', 'assets/bg_title*', 'assets/production/shared/bg_title*', 'assets/audio/bgm_qh_daily*']
def files():
    out = []
    for p in glob.glob(os.path.join(GAME, 'assets/**/*'), recursive=True):
        if os.path.isfile(p) and not p.endswith('.import'):
            out.append(os.path.relpath(p, GAME))
    return sorted(out)
def assign():
    packs = {n: [] for n, _ in PACKS}
    for f in files():
        if any(fnmatch.fnmatch(f, k) for k in KEEP): continue
        for n, pats in PACKS:
            if any(fnmatch.fnmatch(f, p) for p in pats): packs[n].append('res://' + f); break
    return packs
def preset(i, name, platform, path, filt, files_, extra=''):
    fl = ', '.join('"%s"' % f for f in files_)
    return f'''[preset.{i}]

name="{name}"
platform="{platform}"
runnable=true
export_filter="{filt}"
export_files=PackedStringArray({fl})
include_filter="data/*,data/**/*"
exclude_filter="scripts/tests/*,addons/gdUnit4/*,test/*"
export_path="{path}"

[preset.{i}.options]
{extra}
'''
WEB_OPT = '''html/custom_html_shell="res://web/shell.html"
variant/extensions_support=false
variant/thread_support=false
vram_texture_compression/for_desktop=true
vram_texture_compression/for_mobile=false
html/canvas_resize_policy=2
html/focus_canvas_on_start=true
html/experimental_virtual_keyboard=false
progressive_web_app/enabled=false
'''
MAC_OPT = '''binary_format/architecture="universal"
application/bundle_identifier="com.luotuozhuan.xiaojianghu"
application/short_version="0.1"
application/version="0.1"
codesign/codesign=1
notarization/notarization=0
'''
def main(which):
    packs = assign()
    json.dump({'order': [n for n, _ in PACKS], 'ver': time.strftime('%Y%m%d%H%M%S'), 'files': packs}, open(os.path.join(GAME, 'data/packs.json'), 'w'), ensure_ascii=False)
    all_pack_files = [f for v in packs.values() for f in v]
    cfg = preset(0, 'Web', 'Web', '../build/web/index.html', 'exclude', all_pack_files, WEB_OPT)
    cfg += preset(1, 'macOS', 'macOS', '../build/mac/小江湖.zip', 'all_resources', [], MAC_OPT)
    for i, (n, _) in enumerate(PACKS):
        cfg += preset(2 + i, 'Pack ' + n, 'Web', f'../build/web/packs/{n}.pck', 'resources', packs[n], WEB_OPT)
    open(os.path.join(GAME, 'export_presets.cfg'), 'w').write(cfg)
    os.makedirs(os.path.join(ROOT, 'build/web/packs'), exist_ok=True); os.makedirs(os.path.join(ROOT, 'build/mac'), exist_ok=True)
    run = lambda *a: subprocess.run([GODOT, '--headless', '--path', GAME, *a], check=False)
    if which in ('web', 'all'):
        # macOS 用不到 packs.json；Web 主包里带着它
        run('--export-release', 'Web', os.path.join(ROOT, 'build/web/index.html'))
        for n, _ in PACKS:
            run('--export-pack', 'Pack ' + n, os.path.join(ROOT, f'build/web/packs/{n}.pck'))
    if which in ('mac', 'all'):
        os.rename(os.path.join(GAME, 'data/packs.json'), os.path.join(GAME, 'data/packs.json.off'))
        try: run('--export-release', 'macOS', os.path.join(ROOT, 'build/mac/小江湖.zip'))
        finally: os.rename(os.path.join(GAME, 'data/packs.json.off'), os.path.join(GAME, 'data/packs.json'))
    for root, _, fs in [x for d in ('build/web', 'build/mac') for x in os.walk(os.path.join(ROOT, d))]:
        for f in fs:
            p = os.path.join(root, f); print(f'{os.path.getsize(p)/1e6:8.1f} MB  {os.path.relpath(p, ROOT)}')
if __name__ == '__main__':
    argv = [a for a in sys.argv[1:] if not a.startswith('--')]
    # 2026-11-05 起导出前先跑全套自测（tools/selftest.py），不过不导出；--skip-selftest 跳过（只在用户明确同意时用）
    if '--skip-selftest' not in sys.argv:
        r = subprocess.run([sys.executable, os.path.join(HERE, 'selftest.py'), '--for-export'])
        if r.returncode != 0:
            print('全套自测没通过，不导出。报告见 build/selftest/latest/report.md'); sys.exit(1)
    main(argv[0] if argv else 'all')
