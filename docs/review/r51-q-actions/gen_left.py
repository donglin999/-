# -*- coding: utf-8 -*-
"""动作差分的朝左版（站右位时用）：照 legacy qihe-reps-q-20261102/gen_left.py——先水平翻转，再让模型把衣襟改回右衽，其余不变。
输出名按游戏里的情绪名：xu_paper、xu_point、cen_tea、cen_fan、shen_herb、shen_note（+_left）。"""
import subprocess, pathlib, shutil, concurrent.futures as cf
from PIL import Image
D = pathlib.Path(__file__).resolve().parent
IMGGEN = '/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu/tools_common/imggen.py'
NAME = {'xu_hand_paper': 'xu_paper', 'xu_point': 'xu_point', 'cen_tea': 'cen_tea', 'cen_fan': 'cen_fan', 'shen_medicine': 'shen_herb', 'shen_note': 'shen_note'}
T = """Model: gpt-image-2.6（使用 gpt-image-2.6 生图模型）

对参考图1做编辑。参考图1是本游戏 Q 版剧情立绘水平翻转后的结果，人物朝向画面左侧，这个朝向要保留。
只改一处：翻转后衣襟方向反了，把交领改回中国古代的右衽（穿着者的左襟压在右襟上，从观者看领口交叉线从左上到右下）。
其余全部保持完全相同：脸、表情、视线方向、发型、服装配色和细节、手里的道具、姿势、画风、画布尺寸与取景。不要加文字和新道具。

真正的透明背景！actual RGBA alpha=0 outside the character and inside empty hair gaps.
眼白、牙齿、衣服保留不透明，头发间背景空隙完全透明。
"""
pf = D / 'prompts' / 'left.txt'; pf.write_text(T, encoding='utf-8')
def run(src):
    name = NAME[src.stem]
    shutil.copy2(src, D / 'final' / f'{name}.png')
    fl = D / 'flip' / f'{name}.png'; Image.open(src).transpose(Image.FLIP_LEFT_RIGHT).save(fl)
    r = subprocess.run(['python3', IMGGEN, '--prompt-file', str(pf), '--out', str(D / 'final' / f'{name}_left.png'), '--ref', str(fl), '--size', '1024x1536', '--opaque-fix'], capture_output=True, text=True)
    return name, r.returncode, r.stderr[-200:]
with cf.ThreadPoolExecutor(6) as ex:
    for x in ex.map(run, sorted((D / 'raw').glob('*.png'))):
        print(x, flush=True)
