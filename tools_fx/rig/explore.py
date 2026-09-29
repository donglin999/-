"""探索动作（走/跑/待机）帧动画管线（工作流 K，docs/anim-pipeline.md §6）

程序 Q 版白模（qrig.py，4 方向）→ 生图参考「定妆图 + 白模」拼图 → 配准/像素化/质检 → 组表 s_{c}_{walk,run,idle}(_bright).webp。

子命令（仓库根目录）：
  python3 tools_fx/rig/explore.py rig hero                    # 白模总览/GIF → review/explore_v2/rig_hero_*.png|gif
  python3 tools_fx/rig/explore.py model hero suzhi            # Q 版 4 方向定妆图（左：立绘；右：4 个站姿白模）
  python3 tools_fx/rig/explore.py gen hero suzhi [--only walk_l_0,...]   # 动作条带（每张 ≤4 格，≤3 并发）；已有则跳过
  python3 tools_fx/rig/explore.py qa hero [--regen 2]         # 质检 + 选帧（不合格条带自动重生成）
  python3 tools_fx/rig/explore.py build hero                  # 组表 → assets/s_hero_{walk,run,idle}(_bright).webp、s_hero(_bright).webp
  python3 tools_fx/rig/explore.py review hero                 # 预览条带/GIF/管线对比 → review/explore_v2/
  python3 tools_fx/rig/explore.py compare                     # 与 NPC 同屏同尺度对比
中间产物：raw_anim/explore/<角色>/（model_*.png、gen/<条带>_<k>.png、cells.json、params.json、qa.json、frames.json）
"""
import argparse, glob, io, json, math, os, re, sys, time
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE); sys.path.insert(0, os.path.join(HERE, '..')); sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools_common'))
import qrig as Q  # noqa: E402

RAW = 'raw_anim/explore'
REV = os.environ.get('EXPLORE_REV', 'review/explore_v2')
OUTW, OUTH, REFW = 1536, 1024, 384
CW_PX, CH_PX = (OUTW - REFW) // 2, OUTH // 2          # 576×512 每格
CA_H = 54                                             # 每格高 = 54 美术像素
S = CH_PX / CA_H                                      # ≈9.48 生图像素 / 美术像素
CA_W = CW_PX / S                                      # ≈60.75
OX, OY = CA_W / 2, CA_H - 5                           # 白模地面原点（格内，美术像素）
CAN_W, CAN_H, CAN_OX, CAN_OY = 64, 54, 32, 49         # 规范帧（美术像素）：地面原点
CELL_H = 47                                           # 精灵表单元高（美术像素，×3 = 141，与 s_{c} 一致）
GEN_MODEL = os.environ.get('GEN_MODEL', 'gpt-image-2.5-flare')
GEN_QUALITY = os.environ.get('GEN_QUALITY', 'medium')
BGHEX = '#FF00FF'
ACTS = ('walk', 'run')
DIRN = {'d': 'FRONT view (walking toward the viewer, facing down/forward)', 'u': 'BACK view (walking away from the viewer, we see the back)',
        'l': 'side view facing LEFT (walking toward the left edge)', 'r': 'side view facing RIGHT (walking toward the right edge)'}
STYLE = ("cute chibi 16-bit pixel art RPG overworld sprite (SNES-era JRPG town map style), about 2.5 heads tall with a big round head "
         "and a small body, clean dark 1-pixel outline, limited palette, soft bright colors, simple cel shading with light from the upper-left")
DESC = {
    'hero': ("a 17-year-old Chinese young swordsman: BLACK hair tied in a HIGH PONYTAIL with a RED hair band, "
             "WHITE cross-collar martial robe reaching the knees, a wide VERMILION RED waist sash, white trousers, grey cloth wraps on the forearms, "
             "black cloth boots, a TEAL sword scabbard strapped diagonally across his back (the hilt sticks up above his RIGHT shoulder)"),
    'suzhi': ("Su Zhi, a gentle 20-year-old Chinese female physician: BLACK hair in an elegant UPDO BUN with a GREEN JADE HAIRPIN, "
              "STONE-GREEN (sage green) cross-collar dress with a long skirt to the ankles, a PALE CREAM open outer jacket with wide sleeves, "
              "a teal-blue waistband, a small brown cloth medicine pouch hanging at her LEFT hip on a strap from her right shoulder"),
}
DESC['dog'] = ("Da Huang (\"Big Yellow\"), a cute chubby Chinese village dog drawn as a chibi PUPPY on all four legs: warm butter-yellow / light golden fur, "
               "a paler cream muzzle, chest and belly, an oversized ROUND head (about half of its total height), soft FLOPPY rounded ears hanging at the sides of the head "
               "(slightly darker golden), big round dark eyes, a small dark-brown nose, short stubby legs with cream paws, and a fluffy TAIL CURLED UP over its back "
               "(the curl leans to its left side). No collar, no clothes, no harness")
STYLE_Q = ("cute chibi 16-bit pixel art RPG overworld sprite (SNES-era JRPG town map style) of a small four-legged animal, "
           "clean dark 1-pixel outline, limited palette, soft bright colors, simple cel shading with light from the upper-left")


def style(c): return STYLE_Q if quad(c) else STYLE


TH = dict(leg=.5, cover=.62, spill=.16, head=2.0, near=3.5, far=6.0, col=48)


# ───────── 帧定义 ─────────
def body(c): return Q.BODIES[c]


def quad(c): return getattr(body(c), 'kind', '') == 'quad'


def gdirs(c):
    """需要生图的方向：左右对称的角色（大黄）只生成 l，r 由 l 水平镜像"""
    return 'dlu' if getattr(body(c), 'mirror_r', False) else 'dlru'


def pose(c, act, i=0):
    return Q.gait_pose(body(c), act, Q.frames(act)[i])


def strips(c):
    """条带：{名: [(act, dir, i), ...]}（≤4 格，按帧序连续）"""
    out = {}
    for act in ACTS:
        n = len(Q.frames(act))
        for d in gdirs(c):
            idx = list(range(n))
            k = 0
            chunks = [idx[j:j + 4] for j in range(0, n, 4)]
            if n % 4 and len(chunks) > 1 and len(chunks[-1]) < 3:      # 10 → 4,3,3
                flat = idx; sz = [4] * (n // 4); r = n - 4 * (n // 4)
                sz = [4, 3, 3] if n == 10 else sz + [r]
                chunks, j = [], 0
                for z in sz: chunks.append(flat[j:j + z]); j += z
            for ch in chunks:
                out[f'{act}_{d}_{k}'] = [(act, d, i) for i in ch]; k += 1
    return out


def fkey(act, d, i): return f'{act}:{d}:{i}'


# ───────── 拼图 ─────────
def cell_xy(j):
    return REFW + (j % 2) * CW_PX, (j // 2) * CH_PX


def mann_tile(c, act, d, i, bg=Q.BG):
    return Q.draw(body(c), pose(c, act, i), d, S, CA_W, CA_H, OX, OY, bg=bg)


def load_rgb(path):
    """读生成图 → RGBA（模型常直接返回透明底 + 低 alpha 光晕；否则是品红底，alpha 全 255）"""
    return Image.open(path).convert('RGBA')


def cut_bg(rgba):
    """去背 → 前景掩码：有透明底时用 alpha≥128（光晕 alpha<32 自然去掉），否则品红色键（兼容白底）"""
    rgb = rgba[..., :3]
    if rgba.shape[-1] == 4 and (rgba[..., 3] < 128).mean() > .05:
        fg = rgba[..., 3] >= 128
        r, g, b = (rgb[..., i].astype(int) for i in range(3))
        fg &= ~((r - g > 60) & (b - g > 60) & (np.abs(r - b) < 100))
    else:
        r, g, b = (rgb[..., i].astype(int) for i in range(3))
        mag = (r - g > 60) & (b - g > 60) & (np.abs(r - b) < 100)
        white = (rgb.min(-1) > 238) & (rgb.max(-1).astype(int) - rgb.min(-1) < 14)
        lab, _ = ndi.label(white)
        border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        fg = ~(mag | np.isin(lab, list(border)))
    l2, k2 = ndi.label(fg)
    if k2 == 0: return fg
    sz = ndi.sum(fg, l2, range(1, k2 + 1))
    main = int(np.argmax(sz)) + 1
    near = ndi.binary_dilation(l2 == main, iterations=20)
    keep = [i + 1 for i, s_ in enumerate(sz) if s_ >= 30 and (i + 1 == main or (near & (l2 == i + 1)).any())]
    return ndi.binary_erosion(np.isin(l2, keep), iterations=1)


OLD_SHEET = {'dog': 'raw_anim/explore_old/dog/s_dog_bright.webp'}    # 旧 4 帧表（外观基准；assets/s_dog 会被本管线覆盖，故读备份）


def portrait_panel(c):
    panel = Image.new('RGB', (REFW, OUTH), Q.BG)
    if c in OLD_SHEET:                                 # 无立绘的动物：左栏竖排旧精灵表 4 个方向的站立帧（d/l/r/u）
        sh = Image.open(OLD_SHEET[c]).convert('RGBA')
        cw, ch = sh.width // 4, sh.height // 4
        k = min((REFW - 40) / cw, (OUTH / 4 - 8) / ch)
        for r in range(4):
            fr = sh.crop((0, r * ch, cw, (r + 1) * ch)).resize((int(cw * k), int(ch * k)), Image.NEAREST)
            bg = Image.new('RGBA', fr.size, Q.BG + (255,)); bg.alpha_composite(fr)
            panel.paste(bg.convert('RGB'), ((REFW - fr.width) // 2, int(r * OUTH / 4 + (OUTH / 4 - fr.height) / 2)))
        return panel
    p = Image.open(f'assets/p_{c}.webp').convert('RGBA')
    k = min((REFW - 16) / p.width, (OUTH - 40) / p.height)
    p = p.resize((int(p.width * k), int(p.height * k)), Image.LANCZOS)
    bg = Image.new('RGBA', p.size, Q.BG + (255,)); bg.alpha_composite(p)
    panel.paste(bg.convert('RGB'), ((REFW - p.width) // 2, (OUTH - p.height) // 2))
    return panel


def model_file(c):
    j = f'{RAW}/{c}/model.json'
    return json.load(open(j))['file'] if os.path.exists(j) else f'{RAW}/{c}/model_0.png'


def ref_panel(c, d):
    """条带左栏：定妆图里同方向那一格（与白模同比例、同地面高度），放在上半格"""
    panel = Image.new('RGB', (REFW, OUTH), Q.BG)
    mf = model_file(c)
    if not os.path.exists(mf): return panel
    im = load_rgb(mf)
    kx, ky = im.width / OUTW, im.height / OUTH
    j = 'dlru'.index(d)
    x, y = cell_xy(j)
    cx = x + OX * S
    crop = im.crop((int((cx - REFW / 2) * kx), int(y * ky), int((cx + REFW / 2) * kx), int((y + CH_PX) * ky))).resize((REFW, CH_PX), Image.LANCZOS)
    a = np.array(crop); fg = cut_bg(a)
    a = np.where(fg[..., None], a[..., :3], np.array(Q.BG, np.uint8)).astype(np.uint8)
    panel.paste(Image.fromarray(a), (0, 0))
    return panel


def render_model_guide(c):
    im = Image.new('RGB', (OUTW, OUTH), Q.BG)
    im.paste(portrait_panel(c), (0, 0))
    cells = []
    for j, d in enumerate('dlru'):
        x, y = cell_xy(j)
        im.paste(mann_tile(c, 'stand', d, 0).convert('RGB'), (x, y))
        cells.append(dict(key=fkey('stand', d, 0), act='stand', dir=d, i=0, x=x, y=y))
    ImageDraw.Draw(im).line([(REFW - 2, 0), (REFW - 2, OUTH)], fill=(40, 40, 40), width=4)
    return im, cells


def render_strip_guide(c, name):
    fl = strips(c)[name]
    d = fl[0][1]
    im = Image.new('RGB', (OUTW, OUTH), Q.BG)
    im.paste(ref_panel(c, d), (0, 0))
    cells = []
    for j, (act, d_, i) in enumerate(fl):
        x, y = cell_xy(j)
        im.paste(mann_tile(c, act, d_, i).convert('RGB'), (x, y))
        cells.append(dict(key=fkey(act, d_, i), act=act, dir=d_, i=i, x=x, y=y))
    ImageDraw.Draw(im).line([(REFW - 2, 0), (REFW - 2, OUTH)], fill=(40, 40, 40), width=4)
    return im, cells


def prompt_model(c):
    if quad(c): return prompt_model_q(c)
    return ("This image has two parts. LEFT PANEL (left of the dark vertical line): a painted portrait of the character — use it only for "
            "costume, hair, face and colors. RIGHT PART: 4 gray mannequins in a 2x2 grid on magenta: top-left = FRONT view (facing the viewer), "
            "top-right = facing LEFT (profile toward the left edge), bottom-left = facing RIGHT (profile toward the right edge), bottom-right = BACK view. "
            f"Redraw the RIGHT PART so that EVERY mannequin becomes this same character standing relaxed, full body, as a {STYLE}. "
            "Each figure must copy its mannequin EXACTLY: same size, same position, same big head size, feet at the same place. "
            "On the mannequins the dark gray part of the head is hair, the light part is the face (dots = eyes, small triangle = nose, showing where the face points); "
            "the small dark shapes on top/back of the head are the hair bun or ponytail; the thin line around the waist is the waist sash; "
            "lighter gray limbs are nearer to the viewer, darker gray limbs farther. "
            f"All four views must show the same character with identical costume and colors. Character: {DESC[c]}. "
            "Keep the LEFT PANEL unchanged. Background everywhere: flat pure magenta " + BGHEX +
            "; no shadows, no ground, no text, no effects, nothing else.")


Q_PARTS = ("On the mannequins: the big light-gray ball is the HEAD (dots = eyes, the small white bump with a black dot = muzzle and nose, showing where the face points), "
           "the dark-gray rounded flaps on the head are the floppy EARS, the medium-gray oval is the BODY, the thin gray hooked shape at the rear is the CURLED TAIL, "
           "the four capsule legs end in round paws; lighter gray legs are nearer to the viewer, darker gray legs farther away. ")


def prompt_model_q(c):
    return ("This image has two parts. LEFT PANEL (left of the dark vertical line): an old small pixel sprite of the character seen from four directions "
            "(top to bottom: front, facing left, facing right, back) — use it for the look, proportions, fur colors and the curled tail. RIGHT PART: 4 gray "
            "four-legged mannequins in a 2x2 grid on magenta: top-left = FRONT view (facing the viewer), top-right = facing LEFT (profile toward the left edge), "
            "bottom-left = facing RIGHT (profile toward the right edge), bottom-right = BACK view (we see its rump and tail). "
            f"Redraw the RIGHT PART so that EVERY mannequin becomes this same dog standing on all four paws, full body, as a {style(c)}, but cleaner and more detailed "
            "than the old sprite (smooth shapes, readable legs). Each dog must copy its mannequin EXACTLY: same size, same position, same big head size and placement, "
            "the four paws exactly where the mannequin's paws are. " + Q_PARTS +
            f"All four views must show the same dog with identical colors. Character: {DESC[c]}. "
            "Keep the LEFT PANEL unchanged. Background everywhere: flat pure magenta " + BGHEX +
            "; no shadows, no ground, no text, no effects, nothing else.")


def prompt_strip_q(c, name):
    fl = strips(c)[name]
    act, d = fl[0][0], fl[0][1]
    n = len(fl)
    what = ('trotting at a brisk pace (diagonal legs move together: left hind with right front, then right hind with left front)' if act == 'walk' else
            'running in a bounding gallop (both hind legs push off together, front legs reach far forward; some frames have all four paws in the air, '
            'body stretched or legs tucked under the belly)')
    grid = '2x2 grid' if n > 2 else '2-cell row'
    return ("This image has two parts. LEFT PANEL (left of the dark vertical line): the reference sprite of the dog, " + DIRN[d] + ". "
            f"RIGHT PART: {n} gray four-legged mannequins in a {grid} on magenta (read left-to-right, then top-to-bottom; any empty cell stays empty magenta): "
            f"consecutive animation frames of the dog {what}, {DIRN[d]}. "
            f"Redraw the RIGHT PART so that EVERY mannequin becomes EXACTLY the same dog as the reference sprite (same fur colors, big round head, floppy ears, "
            f"curled tail, head size and body size), full body, as a {style(c)}. Each dog must copy its mannequin EXACTLY: same pose, same leg positions "
            "(which paws are on the ground, which are lifted, how far each leg reaches forward or back), same head height, same tail position, same size, "
            "same position in its cell, paws exactly where the mannequin's paws are. " + Q_PARTS +
            f"Character: {DESC[c]}. Keep the LEFT PANEL unchanged. Background everywhere: flat pure magenta {BGHEX}; no shadows, no ground, "
            "no motion lines, no dust, no text, nothing else.")


def prompt_strip(c, name):
    if quad(c): return prompt_strip_q(c, name)
    fl = strips(c)[name]
    act, d = fl[0][0], fl[0][1]
    n = len(fl)
    what = 'walking' if act == 'walk' else 'running (fast, leaning forward, sometimes both feet in the air)'
    grid = '2x2 grid' if n > 2 else '2-cell row'
    return ("This image has two parts. LEFT PANEL (left of the dark vertical line): the reference sprite of the character, " + DIRN[d] + ". "
            f"RIGHT PART: {n} gray mannequins in a {grid} on magenta (read left-to-right, then top-to-bottom; any empty cell stays empty magenta): "
            f"consecutive animation frames of the character {what}, {DIRN[d]}. "
            f"Redraw the RIGHT PART so that EVERY mannequin becomes EXACTLY the same character as the reference sprite (same costume, hair, colors, "
            f"head size and body size), full body, as a {STYLE}. Each figure must copy its mannequin EXACTLY: same pose, same leg and arm positions "
            "(which leg is forward or lifted, where each hand is), same size, same position in its cell, feet exactly where the mannequin's feet are. "
            "Lighter gray limbs are nearer to the viewer, darker gray limbs farther away. The dark gray part of the head is hair, the light part is the face "
            "(dots = eyes, small triangle = nose). "
            f"Character: {DESC[c]}. Keep the LEFT PANEL unchanged. Background everywhere: flat pure magenta {BGHEX}; no shadows, no ground, "
            "no motion lines, no dust, no text, nothing else.")


def png_bytes(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()


def log_params(c, name, rec):
    p = f'{RAW}/{c}/params.json'
    d = json.load(open(p)) if os.path.exists(p) else {}
    d[name] = rec
    json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)


def submit_jobs(jobs):
    """jobs: [(char, name, guide_im, cells, prompt)] → 结果写 raw_anim/explore/<c>/gen/<name>_<k>.png"""
    import flatimg
    fj = []
    for c, name, guide, cells, prompt in jobs:
        od = f'{RAW}/{c}/gen' if not name.startswith('model') else f'{RAW}/{c}'
        os.makedirs(od, exist_ok=True)
        k = 0
        while os.path.exists(f'{od}/{name}_{k}.png') or os.path.exists(f'{od}/{name}_{k}.lock'): k += 1
        open(f'{od}/{name}_{k}.lock', 'w').close()
        guide.save(f'{od}/{name}_guide.png')
        cj = f'{RAW}/{c}/cells.json'
        allc = json.load(open(cj)) if os.path.exists(cj) else {}
        allc[name] = cells; json.dump(allc, open(cj, 'w'), indent=0)
        fj.append(dict(images=[('input.png', png_bytes(guide))], prompt=prompt, model=GEN_MODEL, size=f'{OUTW}x{OUTH}', quality=GEN_QUALITY,
                       output_format='png', _c=c, _name=name, _out=f'{od}/{name}_{k}.png'))

    def done(i, job, r, err):
        os.remove(job['_out'][:-4] + '.lock')
        if err is not None:
            print('失败', job['_c'], job['_name'], str(err)[:200], flush=True)
            log_params(job['_c'], os.path.basename(job['_out']), dict(error=str(err)[:300], prompt=job['prompt']))
            return
        open(job['_out'], 'wb').write(r.png)
        m = r.meta
        log_params(job['_c'], os.path.relpath(job['_out'], f'{RAW}/{job["_c"]}'),
                   dict(endpoint='edits/async', model=GEN_MODEL, quality=GEN_QUALITY, size=f'{OUTW}x{OUTH}', prompt=job['prompt'],
                        secs=m.get('seconds'), attempts=m.get('attempts'), errors=m.get('errors'), usage=m.get('usage'),
                        out_size=list(Image.open(io.BytesIO(r.png)).size)))
        print(time.strftime('%H:%M:%S'), '→', job['_out'], m.get('seconds'), 's', flush=True)
    t = time.time()
    res = flatimg.run_many(fj, on_done=done)
    ok = sum(1 for r in res if not isinstance(r, Exception))
    print(f'完成 {ok}/{len(fj)}，墙钟 {time.time() - t:.0f}s', flush=True)
    return [j['_out'] for j, r in zip(fj, res) if not isinstance(r, Exception)]


# ───────── 配准 / 像素化 ─────────
SUB = 2
_man_cache = {}


def man_sil(c, act, d, i, sub=SUB):
    k = (c, act, d, i, sub)
    if k not in _man_cache:
        _man_cache[k] = Q.silhouette(body(c), pose(c, act, i), d, CA_W, CA_H, S=sub, ox=OX, oy=OY)
    return _man_cache[k]


def crop_cell(path, cell):
    im = load_rgb(path)
    kx, ky = im.width / OUTW, im.height / OUTH
    return np.array(im.crop((int(cell['x'] * kx), int(cell['y'] * ky), int((cell['x'] + CW_PX) * kx), int((cell['y'] + CH_PX) * ky)))), ky


def register(c, path, cell, sc_fixed=None):
    """格内生成图 → 以白模地面原点为中心的缩放 + 平移搜索，最大化剪影 IoU"""
    rgb, ky = crop_cell(path, cell)
    fg = cut_bg(rgb)
    man = man_sil(c, cell['act'], cell['dir'], cell['i'])
    g = np.array(Image.fromarray((fg * 255).astype(np.uint8)).resize((man.shape[1], man.shape[0]), Image.BOX)) > 127
    ys, xs = np.nonzero(g)
    if len(ys) < 60: return None
    ox, oy = OX * SUB, OY * SUB
    best = (-1, 1, 0, 0)
    scs = [sc_fixed] if sc_fixed else np.arange(.80, 1.36, .025)
    for sc in scs:
        gs = np.zeros_like(man)
        yy = np.round((ys - oy) / sc + oy).astype(int); xx = np.round((xs - ox) / sc + ox).astype(int)
        ok = (yy >= 0) & (yy < man.shape[0]) & (xx >= 0) & (xx < man.shape[1])
        gs[yy[ok], xx[ok]] = True
        gs = ndi.binary_closing(gs, iterations=1)
        for dy in range(-7 * SUB, 7 * SUB + 1):
            sh = np.roll(gs, dy, 0)
            for dx in range(-8 * SUB, 8 * SUB + 1):
                s2 = np.roll(sh, dx, 1)
                iou = (s2 & man).sum() / max((s2 | man).sum(), 1)
                if iou > best[0]: best = (iou, sc, dx, dy)
    iou, sc, dx, dy = best
    return dict(rgb=rgb, fg=fg, Sg=S * ky, sc=float(sc), dx=dx / SUB, dy=dy / SUB, reg_iou=float(iou))


def to_art(c, e, cell, snap=True, shrink=1.0):
    """配准结果 → 规范帧 RGBA（CAN_W×CAN_H 美术像素，地面原点 (CAN_OX, CAN_OY)）。y 用脚底锚点：最低像素贴白模最低点"""
    rgb, fg, Sg, sc = e['rgb'][..., :3], e['fg'], e['Sg'], e['sc']
    k = shrink / (Sg * sc)
    H, W = fg.shape
    nw, nh = max(1, round(W * k)), max(1, round(H * k))
    a = fg.astype(float)
    pm = Image.fromarray(np.clip(rgb * a[..., None], 0, 255).astype(np.uint8)).resize((nw, nh), Image.BOX)
    am = Image.fromarray((a * 255).astype(np.uint8)).resize((nw, nh), Image.BOX)
    A = np.array(am).astype(float) / 255
    C = np.array(pm).astype(float) / np.maximum(A[..., None], 1e-3)
    small = np.zeros((nh, nw, 4), np.uint8)
    small[..., :3] = np.clip(C, 0, 255); small[..., 3] = (A > .5) * 255
    Px, Py = OX * Sg, OY * Sg                     # 缩放中心（生成图像素）
    offx = int(round(CAN_OX - Px * k + e['dx'] * shrink)); offy = int(round(CAN_OY - Py * k + e['dy'] * shrink))
    if snap:
        ys = np.nonzero(small[..., 3])[0]
        if len(ys):
            bot = Q.bottom_y(pose(c, cell['act'], cell['i']), cell['dir']) * shrink
            offy = int(round(CAN_OY + bot)) - 1 - ys.max()
    out = np.zeros((CAN_H, CAN_W, 4), np.uint8)
    y0, x0 = max(0, offy), max(0, offx)
    y1, x1 = min(CAN_H, offy + nh), min(CAN_W, offx + nw)
    if y1 > y0 and x1 > x0:
        out[y0:y1, x0:x1] = small[y0 - offy:y1 - offy, x0 - offx:x1 - offx]
    return out


def make_palette(c, n=32):
    """角色共用调色板：从定妆图 4 格前景像素中位切分 + kmeans；再按明亮画风微调（提亮暗部、略增饱和），与 NPC 明亮版对齐"""
    im = load_rgb(model_file(c))
    im = np.array(im.crop((int(REFW * im.width / OUTW) + 4, 0, im.width, im.height)))      # 只取右侧 4 格（左栏是立绘）
    fg = cut_bg(im)
    px = im[..., :3][fg]
    px = px[np.random.default_rng(0).choice(len(px), min(len(px), 120000), replace=False)]
    q = Image.fromarray(px[None].astype(np.uint8)).quantize(colors=n - 6, method=Image.Quantize.MEDIANCUT, kmeans=4)
    pal = np.array(q.getpalette()[:(n - 6) * 3], float).reshape(-1, 3)
    # 小面积高饱和色（剑鞘青、发带红、玉簪绿）在中位切分里容易被吞：高饱和像素另取 6 色
    sat = px.max(1).astype(int) - px.min(1)
    hs = px[sat > 60]
    if len(hs) > 200:
        q2 = Image.fromarray(hs[None].astype(np.uint8)).quantize(colors=6, method=Image.Quantize.MEDIANCUT, kmeans=4)
        pal = np.concatenate([pal, np.array(q2.getpalette()[:18], float).reshape(-1, 3)])
    pal = 255 * (pal / 255) ** GRADE['gamma']
    m = pal.mean(1, keepdims=True)
    pal = np.clip(m + (pal - m) * GRADE['sat'], 0, 255)
    return pal.astype(np.uint8)


GRADE = dict(gamma=.82, sat=1.1)
DOWN = os.environ.get('EXPLORE_DOWN', 'avg')       # 降采样：avg 平均色→调色板（默认，边缘干净）/ mode 众数


def to_art_mode(c, e, cell, pal, shrink=1.0, snap=True):
    """众数降采样：高清前景先映射到共用调色板，再按目标网格（精确相位：规范坐标直接取整）取票数最多的颜色；
    覆盖率 >.5 为不透明。比面积平均干净——不会混出脏的中间色，描边/五官不糊"""
    rgba, fg, Sg, sc = e['rgb'], e['fg'], e['Sg'], e['sc']
    k = shrink / (Sg * sc)
    vv, uu = np.nonzero(fg)
    col = rgba[vv, uu, :3].astype(int)
    P = pal.astype(int)
    idx = np.argmin(((col[:, None, :] - P[None]) ** 2).sum(-1), 1)
    Px, Py = OX * Sg, OY * Sg
    PAD = 16
    fx = CAN_OX + (uu - Px) * k + e['dx'] * shrink + PAD
    fy = CAN_OY + (vv - Py) * k + e['dy'] * shrink + PAD
    ix, iy = np.floor(fx).astype(int), np.floor(fy).astype(int)
    Wt, Ht = CAN_W + 2 * PAD, CAN_H + 2 * PAD
    ok = (ix >= 0) & (ix < Wt) & (iy >= 0) & (iy < Ht)
    ix, iy, idx = ix[ok], iy[ok], idx[ok]
    cellid = iy * Wt + ix
    NP = len(P)
    cnt = np.bincount(cellid * NP + idx, minlength=Wt * Ht * NP).reshape(Ht, Wt, NP)
    tot = cnt.sum(-1)
    area = 1 / (k * k)
    big = np.zeros((Ht, Wt, 4), np.uint8)
    on = tot > .5 * area
    if DOWN == 'mode':
        big[on, :3] = P[cnt.argmax(-1)[on]]
    else:                                                      # 'avg'：格内前景平均色 → 最近的调色板色
        colk = col[ok]
        avg = np.stack([np.bincount(cellid, weights=colk[:, j], minlength=Wt * Ht) for j in range(3)], -1).reshape(Ht, Wt, 3)
        avg = avg / np.maximum(tot[..., None], 1)
        a_on = avg[on]
        big[on, :3] = P[np.argmin(((a_on[:, None, :] - P[None]) ** 2).sum(-1), 1)]
    big[on, 3] = 255
    oy = 0
    if snap:
        ys = np.nonzero(on.any(1))[0]
        if len(ys):
            bot = Q.bottom_y(pose(c, cell['act'], cell['i']), cell['dir']) * shrink
            oy = int(round(CAN_OY + bot)) - 1 - (ys.max() - PAD)
    out = np.zeros((CAN_H, CAN_W, 4), np.uint8)
    src = big[PAD - oy:PAD - oy + CAN_H, PAD:PAD + CAN_W] if 0 <= PAD - oy <= PAD * 2 else None
    if src is not None: out[:src.shape[0]] = src
    return out


def can_man(c, act, d, i):
    return Q.silhouette(body(c), pose(c, act, i), d, CAN_W, CAN_H, S=1, ox=CAN_OX, oy=CAN_OY)


def head_cx(mask, rows=14):
    ys, xs = np.nonzero(mask)
    if not len(ys): return None
    top = ys.min()
    m = mask[top:top + rows]
    yy, xx = np.nonzero(m)
    return float(xx.mean())


def band_cols(img, n=3):
    a = img[..., 3] > 0
    ys = np.nonzero(a.any(1))[0]
    if not len(ys): return None
    y0, y1 = ys.min(), ys.max() + 1
    out = []
    for j in range(n):
        r0, r1 = y0 + (y1 - y0) * j // n, y0 + (y1 - y0) * (j + 1) // n
        m = a[r0:r1]
        out.append(img[r0:r1][m][:, :3].astype(float).mean(0) if m.any() else np.zeros(3))
    return np.array(out)


def metrics(c, art, act, d, i, ref=None):
    man = can_man(c, act, d, i)
    g = art[..., 3] > 0
    inter, uni = (g & man).sum(), (g | man).sum()
    cover = inter / max(man.sum(), 1)
    spill = (g & ~ndi.binary_dilation(man, iterations=2)).sum() / max(g.sum(), 1)
    dist = ndi.distance_transform_edt(~g)
    jerr = {}
    for k, (x, y, dep) in Q.joints_px(body(c), pose(c, act, i), d, CAN_OX, CAN_OY).items():
        xi, yi = int(np.clip(round(x), 0, CAN_W - 1)), int(np.clip(round(y), 0, CAN_H - 1))
        jerr[k] = (round(float(dist[yi, xi]), 2), 'far' if dep < -1.5 else 'near')
    lo = slice(int(CAN_OY - 8), CAN_H)                     # 腿脚区（地面原点以上 8 行起）：步态相位是否画对
    gl, ml = g[lo], ndi.binary_dilation(man, iterations=1)[lo]
    leg_iou = (gl & ml).sum() / max((gl | ml).sum(), 1)
    hx_g, hx_m = head_cx(g), head_cx(man)
    col = None
    if ref is not None:
        a, b = band_cols(art), band_cols(ref)
        if a is not None and b is not None: col = round(float(np.abs(a - b).mean(1).max()), 1)
    return dict(iou=round(float(inter / max(uni, 1)), 3), cover=round(float(cover), 3), spill=round(float(spill), 3),
                leg=round(float(leg_iou), 3), joints=jerr, head_dx=None if hx_g is None else round(hx_g - hx_m, 2), col=col)


def judge(m):
    bad = []
    if m['cover'] < TH['cover']: bad.append('cover')
    if m['spill'] > TH['spill']: bad.append('spill')
    if m.get('leg', 1) < TH['leg']: bad.append('leg')
    for k, (v, kind) in m['joints'].items():
        lim = TH['head'] if k == 'head' else TH[kind]
        if v > lim: bad.append(k)
    if m.get('col') is not None and m['col'] > TH['col']: bad.append('col')
    return bad


def score(m):
    return m['iou'] + .5 * m['cover'] - m['spill'] - .04 * sum(min(v, 8) for v, _ in m['joints'].values()) - .004 * (m.get('col') or 0)


# ───────── 质检 ─────────
QV = 4


def gen_files(c):
    """[(条带名, 文件)]，含定妆图"""
    out = []
    for f in sorted(glob.glob(f'{RAW}/{c}/gen/*_[0-9]*.png')):
        m = re.match(r'.*/(\w+?)_(\d+)\.png$', f)
        if m: out.append((m.group(1), f))
    return out


MARGIN = 3
MARGIN_C = dict(dog=5)                      # 大黄正面前爪投影在地面原点下 ≈5 行（腿根在躯干中心前 5.6 + 步幅）
STAND_H = dict(hero=41.0, suzhi=41.0)       # 站姿身高（美术像素，含发髻/马尾；NPC 为 45，留出跑步腾空与前脚的余量）
_manh = {}


def man_height(c, act, d, i):
    k = (c, act, d, i)
    if k not in _manh:
        ys = np.nonzero(can_man(c, act, d, i).any(1))[0]; _manh[k] = ys.max() - ys.min() + 1
    return _manh[k]


def height_sc(c, path, cell):
    """按身高归一的缩放：生成剪影高度 → 目标高度 = 站姿身高 + 白模该帧相对站姿的高度差（起伏/抬腿）。
    IoU 配准的缩放会被发型/衣摆带偏（各方向、各条带大小不一 → 转身/起步时人物忽大忽小），组表改用它"""
    rgb, ky = crop_cell(path, cell)
    fg = cut_bg(rgb)
    ys = np.nonzero(fg.any(1))[0]
    if not len(ys): return None
    hpx = ys.max() - ys.min() + 1
    base_h = STAND_H[c] - man_height(c, 'stand', cell['dir'], 0) if c in STAND_H else 0      # 未登记（大黄）：直接用白模该帧高度
    tgt = base_h + man_height(c, cell['act'], cell['dir'], cell['i'])
    return hpx / (S * ky * tgt)


def model_art(c, shrink=1.0, pal=None):
    """定妆图 4 方向站姿 → 规范帧（也是 idle 基帧与颜色参照）"""
    cells = json.load(open(f'{RAW}/{c}/cells.json'))['model']
    mf = model_file(c)
    out = {}
    for cell in cells:
        if pal is None:
            e = register(c, mf, cell); out[cell['dir']] = to_art(c, e, cell)
        else:
            e = register(c, mf, cell, sc_fixed=height_sc(c, mf, cell)); out[cell['dir']] = to_art_mode(c, e, cell, pal, **SHRINK_KW(c))
    return out


def run_qa(c):
    qp = f'{RAW}/{c}/qa.json'
    old = json.load(open(qp)) if os.path.exists(qp) else {}
    recs = old.get('all', {})
    allc = json.load(open(f'{RAW}/{c}/cells.json'))
    refs = model_art(c)
    for name, f in gen_files(c):
        cells = allc[name]
        todo = [cell for cell in cells if not (f'{os.path.basename(f)}:{cell["key"]}' in recs and recs[f'{os.path.basename(f)}:{cell["key"]}'].get('v') == QV)]
        if not todo: continue
        es = [register(c, f, cell) for cell in cells]
        scs = [e['sc'] for e in es if e]
        sc_med = float(np.median(scs)) if scs else None
        for cell, e in zip(cells, es):
            key = f'{os.path.basename(f)}:{cell["key"]}'
            if e is None:
                recs[key] = dict(v=QV, file=f, strip=name, cell=cell, m=None, bad=['empty'], score=-9); continue
            e2 = register(c, f, cell, sc_fixed=sc_med) if abs(e['sc'] - sc_med) > .02 else e       # 同条带统一缩放（同一次生成的大小一致）
            art = to_art(c, e2, cell)
            m = metrics(c, art, cell['act'], cell['dir'], cell['i'], refs.get(cell['dir']))
            m.update(sc=round(e2['sc'], 3), sc_free=round(e['sc'], 3), dx=e2['dx'], dy=e2['dy'], reg_iou=round(e2['reg_iou'], 3))
            bad = judge(m)
            recs[key] = dict(v=QV, file=f, strip=name, cell=cell, m=m, bad=bad, score=round(score(m), 3))
            print(f'{key:28s} leg {m["leg"]:.2f} iou {m["iou"]:.2f} cov {m["cover"]:.2f} sp {m["spill"]:.2f} sc {m["sc"]} col {m["col"]} hd {m["head_dx"]} '
                  f'{"OK" if not bad else "FAIL " + ",".join(bad)}', flush=True)
    pick = dict(old.get('pick_manual', {}))
    # 整条带选同一张生成图（同一次生成内帧间细节一致，避免拼接候选造成闪烁）：不合格帧最少、总分最高者
    byf = {}
    for k, r in recs.items(): byf.setdefault((r['strip'], r['file']), []).append(r)
    best = {}
    for (strip, f), rs in byf.items():
        key_ = (-sum(1 for r in rs if r['bad']), sum(r['score'] for r in rs))
        if strip not in best or key_ > best[strip][0]: best[strip] = (key_, rs)
    for strip, (_, rs) in best.items():
        for r in rs:
            if r['cell']['key'] not in pick: pick[r['cell']['key']] = r
    out = dict(old, all=recs, pick=pick, thresholds=TH, qv=QV)
    json.dump(out, open(qp, 'w'), ensure_ascii=False, indent=1)
    fails = {k: r['bad'] for k, r in pick.items() if r['bad']}
    n_all = len(recs); n_ok = sum(1 for r in recs.values() if not r['bad'])
    print(f'{c}: 候选 {n_all}，通过 {n_ok}（{n_ok / max(n_all, 1):.0%}）；选用帧不合格 {len(fails)}：{fails or "无"}')
    return fails


# ───────── 组表 ─────────
def color_clean(f):
    """孤立杂色点：上下左右 4 邻都不透明且颜色一致、而本像素不同 → 改成邻色（众数降采样的少量噪点）"""
    o = f.copy()
    H, W = f.shape[:2]
    c = f[..., :3].astype(int)
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if not f[y, x, 3]: continue
            nb = [(y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)]
            if not all(f[p][3] for p in nb): continue
            cs = [tuple(c[p]) for p in nb]
            best = max(set(cs), key=cs.count)
            if cs.count(best) >= 3 and best != tuple(c[y, x]): o[y, x, :3] = best
    return o


def palette_fx(frames, n=None):
    """帧已是共用调色板（to_art_mode）：去孤立像素 → 去杂色点 → 1px 深色外描边"""
    from foe_battle import despeckle
    import bsprite as bs
    return [bs.outline(color_clean(despeckle(f))) for f in frames]


def shift(img, dx=0, dy=0):
    out = np.zeros_like(img)
    H, W = img.shape[:2]
    ys, yd = (slice(max(0, -dy), H - max(0, dy)), slice(max(0, dy), H - max(0, -dy)))
    xs, xd = (slice(max(0, -dx), W - max(0, dx)), slice(max(0, dx), W - max(0, -dx)))
    out[yd, xd] = img[ys, xs]
    return out


def idle_frames(base, c, d):
    """站姿派生待机 6 帧（不让模型重画，避免细节闪烁）：呼吸 = 腰带以上整体上提 1px；衣摆 = 下摆两行横移 1px"""
    import bsprite as bs
    waist = int(round(CAN_OY - body(c).waist - 1))
    up = bs.bob(base, -1, waist)
    hem_y = int(round(CAN_OY - body(c).hem)) if body(c).hem else CAN_OY - 3
    def sway(img, k):
        o = img.copy()
        rows = slice(hem_y - 2, hem_y + 1)
        o[rows] = shift(img[rows], dx=k)
        # 只移衣摆：脚所在的最底 2 行保持不动
        return o
    f = 1 if d == 'l' else -1 if d == 'r' else 1
    return [base, base, up, up, sway(up, f), base]


def move_part(img, part, inv, under=False, fill=None):
    """把部件像素（part & 不透明）按逆映射 inv(y,x)→(sy,sx) 移动：原位置先挖空（落在 fill 蒙版内的洞用最近的剩余像素颜色补），
    再把变换后的部件贴回（under=True 时只贴在透明处 = 部件在身体后面）"""
    P = part & (img[..., 3] > 0)
    if not P.any(): return img.copy()
    out = img.copy(); out[P] = 0
    if fill is not None:
        hole = P & fill
        rem = out[..., 3] > 0
        if hole.any() and rem.any():
            _, (iy, ix) = ndi.distance_transform_edt(~rem, return_indices=True)
            out[hole] = out[iy[hole], ix[hole]]
    H, W = P.shape
    yy, xx = np.mgrid[0:H, 0:W].astype(float)
    sy, sx = inv(yy + .5, xx + .5)
    sy, sx = np.floor(sy).astype(int), np.floor(sx).astype(int)
    ok = (sy >= 0) & (sy < H) & (sx >= 0) & (sx < W)
    ok[ok] = P[sy[ok], sx[ok]]
    if under: ok &= out[..., 3] == 0
    out[ok] = img[sy[ok], sx[ok]]
    al = out[..., 3] > 0                               # 移动后身体内部留下的洞（否则描边会在洞里画出黑线）→ 邻近颜色补
    hole = ndi.binary_fill_holes(al) & ~al
    if hole.any():
        _, (iy, ix) = ndi.distance_transform_edt(~al, return_indices=True)
        out[hole] = out[iy[hole], ix[hole]]
    return out


def rot_inv(py, px, deg):
    a = math.radians(deg)
    ca, sa = math.cos(a), math.sin(a)
    def inv(y, x):                                   # 目标像素绕 (py,px) 反转 deg → 源像素
        dy, dx = y - py, x - px
        return py + dy * ca - dx * sa, px + dx * ca + dy * sa
    return inv


DOG_IDLE_MS = [170, 130, 210, 130, 200, 150]       # 大黄待机 6 帧（约 1s 一周：摇尾一来一回 + 呼吸 + 耳朵抖一下）


def quad_idle_frames(base, c, d):
    """四足待机 6 帧（站姿派生，不让模型重画）：摇尾 = 尾巴区域按行剪切平移（尾尖动得多、尾根不动，整行搬移不打乱像素）；
    呼吸 = 腰线以上上提 1px；耳动 = 正/背面头部两侧耳垂整体上抖 1px。部件区域来自白模站姿（规范坐标），
    挖空处用邻近颜色补。正面尾巴被身体挡住（定妆图正面不露尾），只做呼吸与耳动"""
    import bsprite as bs
    b = body(c); po = pose(c, 'stand')
    sil = lambda parts, it=0: (lambda m: ndi.binary_dilation(m, iterations=it) if it else m)(
        Q.silhouette(b, po, d, CAN_W, CAN_H, S=1, ox=CAN_OX, oy=CAN_OY, parts=parts))
    rest = sil({'body', 'head', 'leg'})
    alpha = base[..., 3] > 0
    tail = sil({'tail'}, 2 if d == 'u' else 3) & alpha
    if d == 'l': tail &= ~ndi.binary_erosion(rest, iterations=2)
    ty = np.nonzero(tail.any(1))[0]
    piv = Q.proj(po['joints']['tail0'], d)[1] + CAN_OY

    def wag(img, amp):
        if not amp or d == 'd' or not len(ty): return img.copy()
        span = max(piv - ty.min(), 1)
        out = img
        for y in ty:
            k = int(round(amp * np.clip((piv - y) / span, 0, 1)))
            if not k: continue
            row = np.zeros_like(tail); row[y] = tail[y]
            out = move_part(out, row, lambda yy, xx, k=k: (yy, xx - k), fill=rest)
        return out
    breath_row = int(round(CAN_OY - b.body_c[1]))
    breath = lambda img: bs.bob(img, -1, breath_row)
    hc = Q.proj(po['joints']['head'], d)
    cx, cy = hc[0] + CAN_OX, hc[1] + CAN_OY
    ear_band = np.zeros_like(alpha)
    ear_band[:int(cy + 5)] = True
    xs = np.arange(CAN_W)[None, :]
    ear_band &= np.abs(xs + .5 - cx) > b.head_r[0] * .78
    def ear(img):                                      # 耳垂上抖：两侧区域上移 1px 叠在原图上（不挖空 → 不留缺口）
        if d not in 'du': return img.copy()
        P = ear_band & (img[..., 3] > 0)
        out = img.copy()
        out[:-1][P[1:]] = img[1:][P[1:]]
        return out
    return [base.copy(), wag(base, 1), breath(wag(base, 2)), breath(wag(base, 1)), ear(base), wag(base, -1)]


SHRINK = dict(hero=float(os.environ.get('SHRINK_HERO', 0.9)), suzhi=float(os.environ.get('SHRINK_SUZHI', 0.9)))   # 组表时整体缩放（生成的发髻/马尾比白模高，需压进 47 行）
SHRINK_Q = dict(dog=float(os.environ.get('SHRINK_DOG', .93)))      # 大黄：生成的头/耳比白模略高，整体缩 7% 压进 47 行（人形不用此项，逐字保留旧行为）
SHRINK_KW = lambda c: dict(shrink=SHRINK_Q[c]) if c in SHRINK_Q else {}
IDLE_MS = [420, 180, 380, 200, 260, 200]           # 待机 6 帧节奏（呼吸约 1.6s 一周）


def build(c):
    qa = json.load(open(f'{RAW}/{c}/qa.json'))
    allc = json.load(open(f'{RAW}/{c}/cells.json'))
    arts, meta = {}, {}
    PAL = make_palette(c)
    json.dump(PAL.tolist(), open(f'{RAW}/{c}/palette.json', 'w'))
    cache = {}
    for key, rec in qa['pick'].items():
        cell = rec['cell']
        f = rec['file']
        # 逐帧按身高归一：头顶跟随白模起伏（脚底锚点 + 身高 = 头顶，两端都由白模决定）。
        # 只用条带中位数时，条带之间模型画的大小差 5–7% → 每 4 帧头顶跳 2–3px；逐帧归一后 ≤1px
        sc_f = height_sc(c, f, cell)
        if f not in cache:
            scs = [height_sc(c, f, cc) for cc in allc[rec['strip']]]
            cache[f] = float(np.median([x for x in scs if x]))
        sc_f = float(np.clip(sc_f or cache[f], cache[f] * .92, cache[f] * 1.08))
        e = register(c, f, cell, sc_fixed=sc_f)
        arts[key] = to_art_mode(c, e, cell, PAL, **SHRINK_KW(c))
        meta[key] = rec
    # 帧间稳定：头部水平重心相对白模的偏差按 (动作, 方向) 取中位数对齐（去掉配准的 ±1px 抖动）
    stab = {}
    for act in ACTS:
        for d in gdirs(c):
            ks = [fkey(act, d, i) for i in range(len(Q.frames(act)))]
            dev = {}
            for k in ks:
                a, _, i = k.split(':')
                hg, hm = head_cx(arts[k][..., 3] > 0), head_cx(can_man(c, act, d, int(i)))
                dev[k] = (hg - hm) if hg is not None else 0
            med = float(np.median(list(dev.values())))
            for k in ks:
                sx = -int(round(dev[k] - med))
                if sx: arts[k] = shift(arts[k], dx=sx)
                stab[k] = sx
    base = model_art(c, 1.0, PAL)
    if 'r' not in gdirs(c):                        # 镜像：r = l 水平翻转（规范帧宽 64、原点 32 → 列 x ↔ 63-x，原点不动）
        for k in list(arts):
            a_, d_, i_ = k.split(':')
            if d_ == 'l': arts[fkey(a_, 'r', int(i_))] = arts[k][:, ::-1].copy()
        base['r'] = base['l'][:, ::-1].copy()
    names = list(arts) + [f'stand:{d}' for d in 'dlru']
    frames = [arts[k] for k in arts] + [base[d] for d in 'dlru']
    if quad(c):                                    # 四足待机：描边前派生（部件移动后再统一描边）
        for d in 'dl' + 'u':
            for j, f in enumerate(quad_idle_frames(base[d], c, d)):
                names.append(f'idle:{d}:{j}'); frames.append(f)
    ncol = 30
    P = palette_fx(frames, ncol)
    A = dict(zip(names, P))
    rows = {}
    for act in ACTS:
        rows[act] = [[A[fkey(act, d, i)] for i in range(len(Q.frames(act)))] for d in 'dlru']
    if quad(c):
        rows['idle'] = [[A[f'idle:{d if d != "r" else "l"}:{j}'][:, ::-1] if d == 'r' else A[f'idle:{d}:{j}'] for j in range(6)] for d in 'dlru']
    else:
        rows['idle'] = [idle_frames(A[f'stand:{d}'], c, d) for d in 'dlru']
    # 单元：高 47（地面原点下留 m 行给前脚/近侧脚），宽按水平最大伸展对称
    allf = [f for act in rows for r in rows[act] for f in r]
    ys = np.nonzero(np.any([f[..., 3] > 0 for f in allf], axis=0).any(1))[0]
    bot = CAN_OY + MARGIN_C.get(c, MARGIN)                                  # 单元底边 = 地面原点下 MARGIN 行（正面前脚/背面后脚投影在地面原点之下）
    top = bot - CELL_H
    clip_bot = int(sum((f[bot:, :, 3] > 0).sum() for f in allf))
    clip = int(sum((f[:max(top, 0), :, 3] > 0).sum() for f in allf))
    info = dict(bottom_margin=int(bot - CAN_OY), top=int(top), top_min=int(ys.min()), low_max=int(ys.max()), clipped_px=clip, clipped_bottom_px=clip_bot, colors=ncol, stab=stab)
    import bsprite as bs
    out = {}
    for act in ('walk', 'run', 'idle'):
        fs = [f for r in rows[act] for f in r]
        xs = np.nonzero(np.any([f[..., 3] > 0 for f in fs], axis=0).any(0))[0]
        half = int(max(CAN_OX - xs.min(), xs.max() + 1 - CAN_OX)) + 1
        cells = [f[top:bot, CAN_OX - half:CAN_OX + half] for f in fs]
        n = len(rows[act][0])
        for suf in ('', '_bright'):
            size, cell = bs.save_sheet(cells, f'assets/s_{c}_{act}{suf}.webp', cols=n)
        out[act] = dict(frames=n, cell=list(cell), size=list(size))
        np.save(f'{RAW}/{c}/sheet_{act}.npy', np.array(cells))
    # 常规表 s_{c}：4×4（列 0 站立 = idle 基帧，1..3 = 行走 接触A/过渡/接触B，供 ART.frames 回退路径与菜单头像使用）
    wn = len(Q.frames('walk'))
    pick4 = [None, 0, wn // 4, wn // 2]
    fs = []
    for r, d in enumerate('dlru'):
        fs += [rows['idle'][r][0]] + [rows['walk'][r][j] for j in pick4[1:]]
    xs = np.nonzero(np.any([f[..., 3] > 0 for f in fs], axis=0).any(0))[0]
    half = int(max(CAN_OX - xs.min(), xs.max() + 1 - CAN_OX)) + 1
    cells = [f[top:bot, CAN_OX - half:CAN_OX + half] for f in fs]
    for suf in ('', '_bright'):
        size, cell = bs.save_sheet(cells, f'assets/s_{c}{suf}.webp', cols=4)
    out['sheet'] = dict(cell=list(cell), size=list(size))
    info['sheets'] = out
    json.dump(info, open(f'{RAW}/{c}/build.json', 'w'), indent=1)
    print(c, json.dumps({k: v for k, v in info.items() if k != 'stab'}, ensure_ascii=False))
    return info


# ───────── 预览 ─────────
DARK = (30, 28, 38)


def sheet_frames(c, act):
    return np.load(f'{RAW}/{c}/sheet_{act}.npy')


def review(c):
    os.makedirs(REV, exist_ok=True)
    info = json.load(open(f'{RAW}/{c}/build.json'))
    Z = 3
    for act in ('walk', 'run', 'idle'):
        F = sheet_frames(c, act)
        n = info['sheets'][act]['frames']
        h, w = F.shape[1:3]
        strip = Image.new('RGBA', (n * (w * Z + 4) + 4, 4 * (h * Z + 4) + 4), DARK + (255,))
        for r in range(4):
            gifs = []
            for i in range(n):
                im = Image.fromarray(F[r * n + i]).resize((w * Z, h * Z), Image.NEAREST)
                strip.alpha_composite(im, (4 + i * (w * Z + 4), 4 + r * (h * Z + 4)))
                g = Image.new('RGBA', (w * Z * 2, h * Z * 2), DARK + (255,))
                g.alpha_composite(im.resize((w * Z * 2, h * Z * 2), Image.NEAREST))
                gifs.append(g.convert('P', palette=Image.ADAPTIVE))
            d = 'dlru'[r]
            ms = idle_ms(c) if act == 'idle' else int(1000 / fps(c, act))
            gifs[0].save(f'{REV}/{c}_{act}_{d}.gif', save_all=True, append_images=gifs[1:], duration=ms, loop=0, disposal=2)
        strip.save(f'{REV}/{c}_{act}_strip.png')
    # 管线对比：每个动作×方向一张 白模 / 生成 / 像素化 / 叠合
    qa = json.load(open(f'{RAW}/{c}/qa.json'))
    for act in ACTS:
        for d in gdirs(c):
            n = len(Q.frames(act))
            Zp = 4
            tiles = []
            F = sheet_frames(c, act)
            h, w = F.shape[1:3]
            for i in range(n):
                rec = qa['pick'][fkey(act, d, i)]
                man = Q.draw(body(c), pose(c, act, i), d, Zp, w, h, ox=w / 2, oy=h - info['bottom_margin'], bg=(255, 255, 255)).convert('RGBA')
                rgb, ky = crop_cell(rec['file'], rec['cell'])
                gb = Image.new('RGBA', (rgb.shape[1], rgb.shape[0]), (255, 255, 255, 255)); gb.alpha_composite(Image.fromarray(rgb)); gen = gb
                gen = gen.crop((int(gen.width / 2 - gen.height * w / h / 2), 0, int(gen.width / 2 + gen.height * w / h / 2), gen.height)).resize(man.size)
                px = Image.fromarray(F['dlru'.index(d) * n + i]).resize(man.size, Image.NEAREST)
                pxb = Image.new('RGBA', man.size, DARK + (255,)); pxb.alpha_composite(px)
                ov = man.copy()
                al = np.array(px)[..., 3] > 0
                ovl = np.zeros((*al.shape, 4), np.uint8); ovl[al] = [255, 60, 60, 110]
                ov.alpha_composite(Image.fromarray(ovl))
                tiles.append((man, gen.convert('RGBA'), pxb, ov, rec))
            tw, th = tiles[0][0].size
            im = Image.new('RGBA', (n * (tw + 4) + 4, 4 * (th + 4) + 40), (50, 48, 58, 255))
            dr = ImageDraw.Draw(im)
            for i, t in enumerate(tiles):
                for j in range(4): im.alpha_composite(t[j], (4 + i * (tw + 4), 4 + j * (th + 4)))
                m = t[4].get('m') or {}
                dr.text((4 + i * (tw + 4), 4 * (th + 4) + 4), f"{i} iou{m.get('iou')}\n{'OK' if not t[4]['bad'] else ','.join(t[4]['bad'])}", fill=(230, 220, 200))
            im.save(f'{REV}/pipe_{c}_{act}_{d}.png')
    print('review →', REV)


FPS = {'walk': 17, 'run': 21}      # 常速下的实际播放帧率（stride 决定；GIF 预览同速）
FPS_C = {'dog': {'walk': 30, 'run': 30}}   # 大黄：跟随常速 283 px/s ÷ (.17×55.2) ≈ 30fps；奔跑追赶 ≈ 460–496 px/s ÷ (.29×55.2) ≈ 29–31fps


def fps(c, act): return FPS_C.get(c, FPS)[act]


def idle_ms(c): return DOG_IDLE_MS if quad(c) else IDLE_MS


def compare():
    """与 NPC 同屏同尺度：按 ART.scale 缩放（身高 92×scale 世界像素，×5/6 屏幕），深色底"""
    items = [('hero', 1), ('suzhi', .98), ('monk', 1.05), ('lady', .97), ('villager', 1), ('smith', 1.12), ('child', .75)]
    Hs = 92 * 5 / 6 * 1.5
    ims = []
    for c, sc in items:
        sh = Image.open(f'assets/s_{c}_bright.webp').convert('RGBA')
        cw = sh.width // 4
        for r in range(4 if c in ('hero', 'suzhi') else 2):
            fr = sh.crop((0, r * 141, cw, (r + 1) * 141))
            h = int(Hs * sc); w = int(cw * h / 141)
            ims.append(fr.resize((w, h), Image.NEAREST))
    W = sum(i.width for i in ims) + 10 * len(ims) + 10
    out = Image.new('RGBA', (W, int(Hs * 1.2) + 20), DARK + (255,))
    x = 10
    for i in ims:
        out.alpha_composite(i, (x, out.height - 10 - i.height)); x += i.width + 10
    out.save(f'{REV}/compare_npc.png'); print(f'{REV}/compare_npc.png', out.size)


def rig_review(c):
    os.makedirs(REV, exist_ok=True)
    Z = 6
    for act in ('stand', 'walk', 'run'):
        n = len(Q.frames(act))
        im = Image.new('RGB', (n * 50 * Z, 4 * CA_H * Z), Q.BG)
        for r, d in enumerate('dlru'):
            gif = []
            for i in range(n):
                t = Q.draw(body(c), pose(c, act, i), d, Z, 50, CA_H).convert('RGB')
                im.paste(t, (i * 50 * Z, r * CA_H * Z)); gif.append(t.resize((t.width // 2, t.height // 2)))
            if n > 1:
                gif[0].save(f'{REV}/rig_{c}_{act}_{d}.gif', save_all=True, append_images=gif[1:], duration=int(1000 / fps(c, act)), loop=0)
        im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
        im.save(f'{REV}/rig_{c}_{act}.png')
    print('rig →', REV)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['rig', 'model', 'gen', 'guide', 'qa', 'build', 'review', 'compare'])
    ap.add_argument('chars', nargs='*')
    ap.add_argument('--only', default='')
    ap.add_argument('--regen', type=int, default=0)
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--no-js', action='store_true')
    a = ap.parse_args()
    if a.cmd == 'compare': return compare()
    for c in a.chars: os.makedirs(f'{RAW}/{c}/gen', exist_ok=True)
    if a.cmd == 'rig':
        for c in a.chars: rig_review(c)
    elif a.cmd == 'guide':
        for c in a.chars:
            im, cells = render_model_guide(c); im.save(f'{RAW}/{c}/model_guide.png')
            for name in (a.only.split(',') if a.only else list(strips(c))[:1]):
                im, _ = render_strip_guide(c, name); im.save(f'{RAW}/{c}/gen/{name}_guide.png')
    elif a.cmd == 'model':
        jobs = []
        for c in a.chars:
            if glob.glob(f'{RAW}/{c}/model_[0-9]*.png') and not a.force: print('跳过', c); continue
            im, cells = render_model_guide(c)
            jobs.append((c, 'model', im, cells, prompt_model(c)))
        if jobs: submit_jobs(jobs)
    elif a.cmd == 'gen':
        jobs = []
        only = set(a.only.split(',')) if a.only else None
        for c in a.chars:
            for name in strips(c):
                if only and name not in only: continue
                if not a.force and glob.glob(f'{RAW}/{c}/gen/{name}_[0-9]*.png'): continue
                im, cells = render_strip_guide(c, name)
                jobs.append((c, name, im, cells, prompt_strip(c, name)))
        print('提交', len(jobs), '个条带', flush=True)
        if jobs: submit_jobs(jobs)
    elif a.cmd == 'qa':
        for c in a.chars:
            fails = run_qa(c)
            tries = {}
            while fails and a.regen:
                bad_strips = sorted({json.load(open(f'{RAW}/{c}/qa.json'))['pick'][k]['strip'] for k in fails})
                bad_strips = [s for s in bad_strips if tries.get(s, 0) < a.regen]
                if not bad_strips: break
                for s in bad_strips: tries[s] = tries.get(s, 0) + 1
                print('重生成', c, bad_strips, flush=True)
                submit_jobs([(c, s, *render_strip_guide(c, s), prompt_strip(c, s)) for s in bad_strips])
                fails = run_qa(c)
    elif a.cmd == 'build':
        for c in a.chars: build(c)
        if not a.no_js: write_artjs()
    elif a.cmd == 'review':
        for c in a.chars: review(c)



# ───────── 写 js/art.js ─────────
STRIDE = {'walk': .175, 'run': .23}
STRIDE_C = {'dog': {'walk': .17, 'run': .29}}   # 大黄（身高 55 世界像素）：快步 ≈2.5 周期/秒、奔跑 ≈3 周期/秒，见 docs/anim-pipeline.md §6.7   # 移动速度 SPEED .27 后同比放大（总控调整）；build 后需再跑 debob.py      # 每帧前进 = stride × 身高（世界像素）；取舍见 docs/anim-pipeline.md §6.4


DOG_NOTE = ("// 大黄（工作流 K2，Q 版四足骨骼）：walk 12 帧快步（对角步，duty .58）；run 10 帧半跳跑（两后腿蹬出→伸展腾空→两前腿着地→收拢腾空）；"
            "idle 6 帧（摇尾/呼吸/耳动，站姿派生）；r 行 = l 行镜像；脚底基线在单元底边上 5 像素（×3）\n")


def write_artjs(chars=None):
    """回写 ART.sheet[c]、ART.walk / ART.run / ART.idle（//@@EXPLORE … //@@END 区，整体替换旧的手写 walk/run 两行）。
    chars 缺省 = 所有已组表的角色（hero、suzhi 在前，行与旧版逐字相同；dog 追加在后）"""
    p = 'js/art.js'
    s = open(p).read()
    if chars is None:
        chars = [c for c in ('hero', 'suzhi', 'dog') if os.path.exists(f'{RAW}/{c}/build.json')]
    B = {c: json.load(open(f'{RAW}/{c}/build.json'))['sheets'] for c in chars}
    for c in chars:
        s = re.sub(r'"%s": \[\d+, 141\]' % c, '"%s": [%d, 141]' % (c, B[c]['sheet']['cell'][0]), s)
    wl, rl, il = [], [], []
    for c in chars:
        b = B[c]
        wl.append(f"{c}:{{frames:{b['walk']['frames']},cell:{b['walk']['cell']},rows:'dlru',file:'s_{c}_walk',bright:'s_{c}_walk_bright',"
                  f"order:{list(range(b['walk']['frames']))},stride:{STRIDE_C.get(c, STRIDE)['walk']},fps:{fps(c, 'walk')}}}")
        rl.append(f"{c}:{{frames:{b['run']['frames']},cell:{b['run']['cell']},rows:'dlru',file:'s_{c}_run',bright:'s_{c}_run_bright',"
                  f"order:{list(range(b['run']['frames']))},stride:{STRIDE_C.get(c, STRIDE)['run']},fps:{fps(c, 'run')}}}")
        il.append(f"{c}:{{frames:6,cell:{b['idle']['cell']},rows:'dlru',file:'s_{c}_idle',bright:'s_{c}_idle_bright',"
                  f"order:[0,1,2,3,4,5],ms:{idle_ms(c)}}}")
    blk = ("//@@EXPLORE 由 tools_fx/rig/explore.py build 生成（工作流 K：Q 版白模帧动画管线，docs/anim-pipeline.md §6），勿手改\n"
           "// 行走 12 帧（接触-下沉-过渡-腾起 ×2，单腿支撑 56%）；奔跑 10 帧（支撑 36% + 两次腾空）；4 行 d,l,r,u；脚底基线在单元底边上 3 像素（×3），与 s_{c} 一致\n"
           "// stride：每帧前进 stride×身高（世界像素）；walk .13 → 常速约 17fps、1.4 步态周期/秒；run .17 → 约 22fps、2.2 周期/秒（fps 字段仅供参考，帧按距离推进）\n"
           "ART.walk={" + ",\n  ".join(wl) + "};\n"
           "ART.run={" + ",\n  ".join(rl) + "};\n"
           "// 待机 6 帧（站姿派生：呼吸上提 1px + 衣摆 1px；ms 为逐帧毫秒）。运行时尚未读取：需 core.js walkSpec/sliceSheets 支持 kind='idle' 与 drawChar 静止时播放，见 docs/anim-pipeline.md §6.6\n"
           "ART.idle={" + ",\n  ".join(il) + "};\n" + DOG_NOTE * ('dog' in chars) + "//@@END")
    if '//@@EXPLORE' in s:
        s = re.sub(r'//@@EXPLORE.*?//@@END', lambda m: blk, s, flags=re.S)
    else:
        a = s.index('// [评审中] 主角 8 帧行走表')
        e = s.index('ART.run={'); e = s.index('};', s.index("suzhi:", e)) + 2
        s = s[:a] + blk + s[e:]
    open(p, 'w').write(s)
    print('js/art.js 已更新')


if __name__ == '__main__':
    main()
