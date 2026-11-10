#!/usr/bin/env python3
"""把特效帧贴进战斗底图，输出同尺寸、同帧率的比对帧。
用法：compose.py <档> <版本> [--sheet 精灵表.json] [--frames 目录]
特效帧：640×360 特效像素空间里的 RGBA，按 meta.origin 对准锚点；放大 3 倍最近邻贴到 1920×1080 底图。"""
import json, os, sys, glob
from PIL import Image
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAP = os.path.join(S, 'cap')
TIERS = {
  # 底图目录、时间窗、对齐（底图时刻→特效 t=0 的时刻）、锚点（特效像素）、裁切框（1920 空间）
  'low':  dict(on='lon', off='loff', t0=10233, t1=10900, zero_on=10367, zero_off=10400, anchor=(140, 283), box=(100, 560, 1060, 1040)),
  'mid':  dict(on='on', off='off', t0=3300, t1=4433, zero_on=3328, zero_off=3328, anchor=(402, 228), box=(120, 330, 1800, 1050)),
  'high': dict(on='on', off='off', t0=7120, t1=8587, zero_on=7146, zero_off=7146, anchor=(402, 228), box=(120, 330, 1800, 1050)),
}
FPS = 30

def plate_times(d, k):
    fs = sorted(int(f[2:-4]) for f in os.listdir(os.path.join(CAP, d)))
    return [t for t in fs if TIERS[k]['t0'] - 40 <= t <= TIERS[k]['t1'] + 40]

def existing(k, out):
    T = TIERS[k]; os.makedirs(out, exist_ok=True); n = 0
    for t in plate_times(T['on'], k):
        Image.open(os.path.join(CAP, T['on'], 'f_%d.png' % t)).convert('RGB').crop(T['box']).save(os.path.join(out, '%03d.png' % n)); n += 1
    return n

def load_sheet(js):
    J = json.load(open(js)); img = Image.open(os.path.join(os.path.dirname(js), J['meta']['image'])).convert('RGBA')
    fr = J['frames']; items = fr if isinstance(fr, list) else list(fr.values())
    frames = [img.crop((f['frame']['x'], f['frame']['y'], f['frame']['x'] + f['frame']['w'], f['frame']['y'] + f['frame']['h'])) for f in items]
    px = J['meta']['pixelfx']; return frames, tuple(px['pivot'] if isinstance(px['pivot'], list) else (px['pivot']['x'], px['pivot']['y'])), px['fps']

def load_frames(d):
    """目录形式：frames.json {fps, pivot:[x,y], frames:[文件名…], add:[可选，加色层文件名…]}"""
    J = json.load(open(os.path.join(d, 'frames.json')))
    fr = [Image.open(os.path.join(d, f)).convert('RGBA') for f in J['frames']]
    add = [Image.open(os.path.join(d, f)).convert('RGB') if f else None for f in J.get('add', [])] or None
    return fr, tuple(J['pivot']), J['fps'], add, J.get('t_offset', 0.0)

def add_rgb(base, layer):
    import numpy as np
    a = np.asarray(base, dtype=np.int32) + np.asarray(layer, dtype=np.int32)
    return Image.fromarray(np.clip(a, 0, 255).astype('uint8'))

def compose(k, frames, pivot, fps, out, add=None, t_offset=0.0):
    T = TIERS[k]; os.makedirs(out, exist_ok=True); n = 0
    for t in plate_times(T['off'], k):
        base = Image.open(os.path.join(CAP, T['off'], 'f_%d.png' % t)).convert('RGB')
        et = (t - T['zero_off']) / 1000.0 + t_offset; i = int(round(et * fps))
        if 0 <= i < len(frames):
            f = frames[i]; X = (T['anchor'][0] - pivot[0]) * 3; Y = (T['anchor'][1] - pivot[1]) * 3
            if f.size == (640, 360): X = Y = 0   # 已是整屏特效像素空间
            big = f.resize((f.width * 3, f.height * 3), Image.NEAREST)
            if add and i < len(add) and add[i] is not None:
                L = Image.new('RGB', base.size); L.paste(add[i].resize((f.width * 3, f.height * 3), Image.NEAREST), (X, Y)); base = add_rgb(base, L)
            layer = Image.new('RGBA', base.size, (0, 0, 0, 0)); layer.paste(big, (X, Y)); base = Image.alpha_composite(base.convert('RGBA'), layer).convert('RGB')
        base.crop(T['box']).save(os.path.join(out, '%03d.png' % n)); n += 1
    return n

if __name__ == '__main__':
    k, ver = sys.argv[1], sys.argv[2]; out = os.path.join(S, 'out', k, ver)
    for f in glob.glob(os.path.join(out, '*.png')): os.remove(f)
    if ver == 'existing': print(existing(k, out))
    elif '--sheet' in sys.argv:
        fr, pv, fps = load_sheet(sys.argv[sys.argv.index('--sheet') + 1]); print(compose(k, fr, pv, fps, out))
    else:
        fr, pv, fps, add, off = load_frames(sys.argv[sys.argv.index('--frames') + 1]); print(compose(k, fr, pv, fps, out, add, off))
