"""生图：参考「定妆图 + 白模」生成角色帧（工作流 E，docs/anim-pipeline.md §3）

接口：异步 /images/edits/async、/images/generations/async（提交 202 → 轮询 /v1/images/tasks/<id> → 下载 image_url）。
接口实测（2026-09-28，FlatRouter，同步版）：
  · /images/edits 多图输入（重复 image[] 字段）：单图 low 28s 成功；同样请求带 2 张图在 421s 被服务端断开 → 视为**不可用**，
    改为**单张拼图输入**：左侧定妆图、右侧白模网格（≤4 格）。
  · 服务端约 421s 硬断连接；客户端超时 430s，同一请求最多重试 1 次（REQ_TRIES），避免空等。
  · 定妆图走 /images/generations 纯文字生成（比 edits 轻）。
背景：白模与生成都用品红色键 #FF00FF（主角白衣，白底去背会吃掉衣服）。

子命令（仓库根目录）：
  python3 tools_fx/rig/genframes.py model hero            # 定妆图 → raw_anim/hero/model.png（文字生成，侧身站姿）
  python3 tools_fx/rig/genframes.py grid hero atk base move   # [定妆图 | 白模网格] 拼图 → raw_anim/hero/gen/atk_<n>.png（≤3 并发）
  python3 tools_fx/rig/genframes.py grid hero atk --multi      # 多图输入 image[]：定妆图 + 白模网格
  python3 tools_fx/rig/genframes.py guide hero [网格]      # 只渲染输入图（不请求）
环境变量：GEN_MODEL（默认 gpt-image-2.5-sunburst）、GEN_QUALITY（默认 medium）。
所有请求记入 raw_anim/<角色>/params.json（提示词、耗时、尝试次数、错误）。
"""
import argparse, base64, io, json, os, sys, time, urllib.request, urllib.error
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, '..', '..', 'tools_por'))
try:
    from gen_por import load_env  # noqa: E402
except Exception:                  # 工作流 H 可能重构 tools_por：退回自己读 .env
    def load_env():
        env = {}
        pth = os.path.join(HERE, '..', '..', 'tools_por', '.env')
        if os.path.exists(pth):
            for line in open(pth):
                if '=' in line and not line.startswith('#'):
                    k, v = line.strip().split('=', 1); env[k] = v
        key = os.environ.get('FLATROUTER_API_KEY') or env.get('FLATROUTER_API_KEY')
        base = os.environ.get('FLATROUTER_BASE_URL') or env.get('FLATROUTER_BASE_URL') or 'https://api.flatrouter.com/v1'
        if not key: sys.exit('缺少 FLATROUTER_API_KEY（tools_por/.env）')
        return key, base.rstrip('/')
import rig as R  # noqa: E402
import poses as PS  # noqa: E402
import mannequin as M  # noqa: E402

MODEL = os.environ.get('GEN_MODEL', 'gpt-image-2.5-flare')
QUALITY = os.environ.get('GEN_QUALITY', 'medium')
TIMEOUT = 430
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
REQ_TRIES = 2
OUTW, OUTH = 1536, 1024
REFW = 384                      # 拼图左侧定妆图栏宽
CELL_ART = 100                  # 每格高 = 100 美术像素（身高 64 + 头顶/武器留白）
# 网格：≤4 格，右侧 1152×1024 按 cols×rows 分格
GRIDS = {
    'atk':   dict(poses=['wind', 'strike', 'follow', 'back'], cols=2, rows=2),
    'base':  dict(poses=['guard', 'hurt', 'cast', 'win'], cols=2, rows=2),
    'move':  dict(poses=['dash0', 'dash1', 'chamber', 'thrust'], cols=2, rows=2),
    'down':  dict(poses=['kneel', 'dead'], cols=1, rows=2),
}
BGHEX = '#FF00FF'

DESC = {
    'hero': "a 17-year-old handsome young Chinese swordsman (wuxia hero): sharp straight eyebrows, bright eyes, "
            "long black hair tied in a HIGH PONYTAIL with a red hair band, WHITE cross-collar (jiaoling) narrow-sleeved martial robe "
            "reaching the knees with side slits, a wide VERMILION RED waist sash with hanging ends, white trousers, "
            "grey cloth wraps on the forearms and shins, black cloth boots, a TEAL (celadon blue-green) sword scabbard strapped "
            "diagonally across his back, holding a drawn straight double-edged steel jian sword with a small golden guard",
    'suzhi': "Su Zhi, a beautiful gentle 20-year-old Chinese female physician with a graceful curvy full figure and slim waist: "
             "black hair in an elegant UPDO BUN with one GREEN JADE HAIRPIN, STONE-GREEN cross-collar ruqun dress with a high waistband "
             "and a long skirt to the ankles, a PALE CREAM open outer jacket (beizi) with wide sleeves, a small brown cloth medicine "
             "pouch on a strap from her right shoulder across the chest to her left hip; she holds thin silver acupuncture needles "
             "between her fingers",
}
STYLE = ("detailed 16-bit SNES-era pixel art battle sprite (like Octopath Traveler), realistic adult proportions about 6 heads tall "
         "(NOT chibi, small head, long legs), clean dark 1-pixel outline, limited palette, cel shading with light from the upper-left, "
         "muted natural colors")
# ── 工作流 I：敌人 / 动物 ──
DESC.update({
    'bandit': "a mountain bandit thug: burly muscular man about 35, black cloth head wrap, stubble and a scowling brutal face, "
              "black short jacket open at the chest over a dark red sash, dark trousers tied at the calves, straw sandals, "
              "wields a heavy broad-backed dao saber (single-edged, wide slightly curved steel blade) in one hand",
    'chief': "the bandit king 'One-Eyed Yama': a huge hulking warlord much bigger and broader than a normal man, black eye patch over one eye, "
             "thick curly black beard, black lamellar leather armor with iron studs and shoulder guards, a dark crimson cape, "
             "wields an enormous ghost-head broadsword (very wide heavy curved single-edged blade, ring pommel)",
    'monk': "an elderly Shaolin monk martial artist: bald head with ordination scars, long white eyebrows hanging beside the face and a short white beard, "
            "grey monk robe reaching the shins with an ochre kasaya draped over one shoulder, wooden prayer beads around the neck, straw sandals, "
            "fights bare-handed with palm strikes (no weapon)",
    'beggar': "a Beggar Sect elder: wiry old man with messy grey hair loosely tied, sharp shining eyes, ragged patched brown clothes, "
              "bare shins with straw sandals, a wine gourd hanging at the waist, fights with a long green bamboo staff (dog-beating staff)",
    'wolf': "a large grey mountain wolf (realistic animal proportions, not cute): lean and muscular, thick bristling grey fur with a paler belly, "
            "bushy tail, yellow eyes, bared fangs",
    'dog': "Da Huang, a loyal yellow Chinese village dog (medium size, realistic proportions, not chibi, not cartoon): short golden-yellow fur "
           "with a cream chest, pointed upright ears, a curled tail over the back, brave expression",
    'rooster': "a huge fierce fighting rooster (angry red cockerel) with REAL BIRD ANATOMY: only two wings and two scaly yellow legs, "
               "absolutely no human arms, no hands, no weapons, not anthropomorphic; big bright red comb and wattles, glossy red-orange hackles, "
               "dark green sickle tail plumes, sharp spurs and talons, puffed chest",
    'snake': "a giant blue-green scaled python serpent monster: thick body with visible scales, pale cream belly, cold yellow eyes, forked tongue",
})
BEAST_STYLE = ("detailed 16-bit SNES-era pixel art battle sprite (like Octopath Traveler), realistic animal anatomy (NOT chibi, NOT cartoon), "
               "clean dark 1-pixel outline, limited palette, cel shading with light from the upper-left, muted natural colors")
MODEL_POSE = {
    'hero': "standing in a relaxed battle-ready stance, knees slightly bent, sword held forward-low in his hand pointing left",
    'suzhi': "standing calmly in a battle-ready stance, one hand raised in front of her chest holding three silver needles",
    'bandit': "standing in a battle-ready stance, knees bent, the dao saber held forward in one hand with the blade pointing up and forward",
    'chief': "standing in a compact battle stance with the huge broadsword resting on his shoulder, blade pointing up and back behind him",
    'monk': "standing calmly in a low stance, one palm raised vertically in front of his chest, the other hand at his side",
    'beggar': "standing in a battle-ready stance holding the bamboo staff diagonally in front of him with the front end low",
    'wolf': "standing on all four legs in a snarling alert stance, head low, tail hanging down",
    'dog': "standing on all four legs, alert, tail curled up",
    'rooster': "standing tall with its chest puffed out, tail plumes arching up behind",
    'snake': "coiled on the ground with its head and upper body reared up high like a cobra",
}


def is_beast(char):
    return PS.CHARS[char].get('kind', 'human') != 'human'


def style_of(char):
    if is_beast(char): return BEAST_STYLE
    if char == 'chief': return STYLE.replace('about 6 heads tall', 'about 6 heads tall, hulking and massive')
    return STYLE


def face_of(char):
    return 'LEFT' if PS.CHARS[char]['facing'] == 'l' else 'RIGHT'


def grids(char):
    return PS.grids_of(char, None) or GRIDS


def cell_art(char):
    return PS.CHARS[char].get('cell_art', CELL_ART)


WPN = {'hero': "The steel-grey line in each mannequin's hand is the sword: draw it as the character's straight steel jian (silver blade, small golden guard).",
       'suzhi': "The short steel-grey lines at her hand are three thin silver acupuncture needles held between her fingers; "
                "separate short grey lines in front of her are needles flying through the air.",
       'bandit': "The steel-grey blade shape in each mannequin's hand is his broad-backed dao saber: draw it as a heavy single-edged steel saber.",
       'chief': "The big steel-grey blade shape (ring at the handle end) in his hand is his enormous ghost-head broadsword; "
                "the darker gray flap behind his back is his dark crimson cape.",
       'monk': "He is bare-handed: open palms, NO weapon. The pale gray trapezoid over his legs is his long monk robe.",
       'beggar': "The thin green line through his hand is his long green bamboo staff.",
       'wolf': "Light gray legs are the near side, dark gray legs the far side; the small triangle on the head is the ear, the tapered shape in front is the muzzle (open when the mannequin's jaw is open).",
       'dog': "Light gray legs are the near side, dark gray legs the far side; the small triangle on the head is the ear, the tapered shape in front is the muzzle.",
       'rooster': "Light gray legs/wing are the near side, dark gray the far side; the long curved strokes at the back are the tail plumes, "
                  "the round bumps on top of the head are the comb, the small blob under the beak is the wattle.",
       'snake': "It is one continuous snake body: the darker gray parts of the coils are the far side (behind), the mid gray parts in front; "
                "the head is at the upper end of the body (open jaws where the mannequin's mouth is open).",
}


def _post(req):
    """提交异步任务（/images/*/async → 202 {task_id, poll_url}）并轮询到完成，下载结果图。
    同步接口的长连接会在 ~421s 被网关切断；异步接口提交即返回，轮询每 4s 一次（尊重 Retry-After），单任务最长 30 分钟。"""
    with urllib.request.urlopen(req, timeout=120) as r:
        sub = json.load(r)
    if sub.get('data'):                                   # 服务端直接同步返回
        item = sub['data'][0]
        if item.get('b64_json'): return base64.b64decode(item['b64_json']), {k: v for k, v in sub.items() if k != 'data'}
    tid = sub.get('task_id') or sub.get('id')
    poll = sub.get('poll_url') or f'/v1/images/tasks/{tid}'
    root = req.full_url.split('/v1/')[0]
    t0 = time.time(); wait = 4
    while time.time() - t0 < 1800:
        time.sleep(wait)
        try:
            with urllib.request.urlopen(urllib.request.Request(root + poll, headers={'Authorization': req.get_header('Authorization'), 'User-Agent': UA}),
                                        timeout=60) as r:
                d = json.load(r)
                ra = r.headers.get('Retry-After')
                wait = min(15, max(3, int(ra))) if ra and ra.isdigit() else 4
        except Exception as e:
            print('   poll err', repr(e)[:100], flush=True); continue
        st = d.get('status')
        if st == 'processing' or st == 'queued' or st == 'pending': continue
        if st == 'completed':
            url = d.get('image_url') or ((d.get('result') or {}).get('data') or [{}])[0].get('url')
            item = ((d.get('result') or {}).get('data') or [{}])[0]
            if item.get('b64_json'): return base64.b64decode(item['b64_json']), dict(task=tid, usage=(d.get('result') or {}).get('usage'))
            dl = urllib.request.Request(url, headers={'User-Agent': UA})   # 图床在 Cloudflare 后面，默认 Python-urllib UA 会被 1010 拒绝
            for _ in range(5):
                try:
                    with urllib.request.urlopen(dl, timeout=120) as r:
                        return r.read(), dict(task=tid, url=url, usage=(d.get('result') or {}).get('usage'))
                except Exception as e:
                    print('   download err', repr(e)[:100], flush=True); time.sleep(5)
            raise RuntimeError(f'下载失败 {url}')
        raise RuntimeError(f'任务 {tid} {st}: {json.dumps(d.get("error"), ensure_ascii=False)[:200]}')
    raise RuntimeError(f'任务 {tid} 超时')


def req_edit(key, base, images, prompt, size):
    boundary = '----e' + str(time.time_ns())
    fields = dict(model=MODEL, prompt=prompt, size=size, quality=QUALITY, n='1', output_format='png', response_format='b64_json')
    body = b''
    for k, v in fields.items():
        body += f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
    field = 'image[]' if len(images) > 1 else 'image'
    for fn, data in images:
        body += (f'--{boundary}\r\nContent-Disposition: form-data; name="{field}"; filename="{fn}"\r\n'
                 f'Content-Type: image/png\r\n\r\n').encode() + data + b'\r\n'
    body += f'--{boundary}--\r\n'.encode()
    return urllib.request.Request(base + '/images/edits/async', data=body, method='POST',
                                  headers={'Authorization': 'Bearer ' + key,
                                           'Content-Type': 'multipart/form-data; boundary=' + boundary})


def req_gen(key, base, prompt, size):
    body = json.dumps(dict(model=MODEL, prompt=prompt, size=size, quality=QUALITY, n=1, output_format='png',
                           response_format='b64_json')).encode()
    return urllib.request.Request(base + '/images/generations/async', data=body, method='POST',
                                  headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})


def call(mk, tries=REQ_TRIES):
    """mk() → Request；串行重试。返回 (bytes, meta, 尝试次数, 错误列表, 秒)
    账号级并发上限（约 3 个任务，与其他工作流共享）：提交时报 "Concurrency limit exceeded" / 429 → 退避 20–60s 重新提交，不计入 tries（最多 40 次）。"""
    errs = []
    i = 0; busy = 0
    t00 = time.time()
    while i < tries:
        t = time.time()
        try:
            img, meta = _post(mk())
            print(time.strftime('%H:%M:%S'), f'  ok {time.time() - t:.0f}s', flush=True)
            return img, meta, i + 1, errs, round(time.time() - t)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors='replace')[:300]
            if (e.code == 429 or 'oncurrency' in msg) and busy < 40:
                busy += 1
                w = min(60, 20 + 5 * busy)
                print(time.strftime('%H:%M:%S'), f'   并发已满，{w}s 后重交（第 {busy} 次）', flush=True)
                time.sleep(w); continue
            errs.append(f'HTTP {e.code}: {msg} @{time.time() - t:.0f}s')
            print(time.strftime('%H:%M:%S'), '  ', errs[-1], flush=True)
            if e.code in (400, 401, 403, 413, 422): break
        except Exception as e:
            if 'oncurrency' in repr(e) and busy < 40:
                busy += 1; time.sleep(min(60, 20 + 5 * busy)); continue
            errs.append(f'{repr(e)[:160]} @{time.time() - t:.0f}s')
            print(time.strftime('%H:%M:%S'), '  错误', errs[-1], flush=True)
        i += 1
        time.sleep(15)
    raise RuntimeError('生成失败: ' + ' | '.join(errs))


def png(im):
    b = io.BytesIO(); im.save(b, 'PNG'); return b.getvalue()


def grid_cells(char, gname):
    g = grids(char)[gname]
    cw, ch = (OUTW - REFW) // g['cols'], OUTH // g['rows']
    S = ch / cell_art(char)
    body = PS.body_of(char); chd = PS.CHARS[char]
    cells = []
    for i, n in enumerate(g['poses']):
        fr = R.fk(body, chd['poses'][n], chd['facing'])
        x0, x1, top = M.bbox_art(fr, body)
        sx = -(x0 + x1) / 2                               # 白模包围盒居中（剑伸出去的姿势不出格）
        cells.append(dict(pose=n, x=REFW + (i % g['cols']) * cw, y=(i // g['cols']) * ch, w=cw, h=ch, S=S, sx=round(sx, 2),
                          gw=OUTW, gh=OUTH))
    return cells


def model_panel(char, model_file='model.png'):
    """左栏：定妆图（抠出人物后按高度放入 REFW×OUTH，品红底）"""
    panel = Image.new('RGB', (REFW, OUTH), M.BG)
    p = f'raw_anim/{char}/{model_file}'
    if not os.path.exists(p): return panel
    import numpy as np
    from assemble import cut_bg, load_rgb
    im = load_rgb(p)
    a = np.array(im); fg = cut_bg(a)
    ys, xs = np.nonzero(fg)
    box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    fig = Image.fromarray(np.where(fg[..., None], a, np.array(M.BG, np.uint8)).astype(np.uint8)).crop(box)
    k = min((REFW - 24) / fig.width, (OUTH * .8) / fig.height)
    fig = fig.resize((int(fig.width * k), int(fig.height * k)), Image.LANCZOS)
    panel.paste(fig, ((REFW - fig.width) // 2, OUTH - 60 - fig.height))
    return panel


def render_grid(char, gname, model_file='model.png'):
    from PIL import ImageDraw
    body = PS.body_of(char); chd = PS.CHARS[char]
    im = Image.new('RGB', (OUTW, OUTH), M.BG)
    if model_file: im.paste(model_panel(char, model_file), (0, 0))
    cells = grid_cells(char, gname)
    for c in cells:
        fr = R.fk(body, chd['poses'][c['pose']], chd['facing'])
        tile = M.render(fr, body, c['S'], c['w'] / c['S'], c['h'] / c['S'], sx=c['sx']).convert('RGB')
        im.paste(tile, (c['x'], c['y']))
    ImageDraw.Draw(im).line([(REFW - 2, 0), (REFW - 2, OUTH)], fill=(40, 40, 40), width=4)   # 左栏分隔线
    return im, cells


def log(char, name, rec):
    p = f'raw_anim/{char}/params.json'
    d = json.load(open(p)) if os.path.exists(p) else {}
    d[name] = rec
    json.dump(d, open(p, 'w'), ensure_ascii=False, indent=1)


def cmd_model(char, a, key, base):
    od = f'raw_anim/{char}'; os.makedirs(od, exist_ok=True)
    pose = MODEL_POSE[char]
    F = face_of(char)
    prompt = (f"Character reference sheet: ONE full-body {style_of(char)}. {DESC[char]}. Pose: {pose}. "
              f"Strict side view facing {F} (profile looking toward the {F.lower()} edge of the image). The whole figure fits in the frame "
              f"with margin, feet visible. Background: completely flat pure magenta {BGHEX} (RGB 255,0,255), no ground, no shadow, "
              f"no text, no border, only this one character.")
    size = '1536x1024' if is_beast(char) else '1024x1536'
    t = time.time()
    img, meta, tries, errs, secs = call(lambda: req_gen(key, base, prompt, size))
    out = f'{od}/model{("_" + a.tag) if a.tag else ""}.png'
    open(out, 'wb').write(img)
    log(char, os.path.basename(out), dict(kind='model', endpoint='generations/async', model=MODEL, quality=QUALITY, size=size,
                                          prompt=prompt, tries=tries, errors=errs, secs=secs, usage=meta.get('usage')))
    print('→', out, f'{time.time() - t:.0f}s')


import threading
_LOCK = threading.Lock()


def run_grid(char, gname, key, base, model_file='model.png', multi=False):
    """生成一张动作网格。multi=False：单张拼图（左定妆右白模）；multi=True：image[] 两张图（定妆图、白模网格）"""
    od = f'raw_anim/{char}/gen'; os.makedirs(od, exist_ok=True)
    guide, cells = render_grid(char, gname, None if multi else model_file)
    g = grids(char)[gname]; n = len(g['poses'])
    what = 'gray animal mannequins' if is_beast(char) else 'gray mannequins'
    ST = style_of(char)
    if multi:
        head = (f"Image 1 is the reference sprite of the character. Image 2 is a pose guide: {n} {what} in a "
                f"{g['cols']}-column x {g['rows']}-row grid on magenta (the empty magenta strip on its left stays empty), each on a thin dark ground line. "
                f"Redraw image 2 so that EVERY gray mannequin becomes the character from image 1, full body, as a {ST}. ")
        tail = "Background everywhere: flat pure magenta " + BGHEX + "; remove the ground lines; no shadows, no text, no effects, nothing else."
    else:
        head = (f"This image has two parts. LEFT PANEL (left of the dark vertical line): the reference sprite of the character. "
                f"RIGHT PART: {n} {what} in a {g['cols']}-column x {g['rows']}-row grid on magenta, each standing on a thin dark ground line. "
                f"Redraw the RIGHT PART so that EVERY gray mannequin becomes this same character, full body, as a {ST}. ")
        tail = ("Keep the LEFT PANEL unchanged. Background everywhere: flat pure magenta " + BGHEX +
                "; remove the ground lines; no shadows, no text, no effects, nothing else.")
    if is_beast(char):
        body_rule = (f"head where the mannequin's head is, strict side view facing {face_of(char)}. {WPN[char]} "
                     f"Every figure must match the reference in colors, markings and proportions. Character: {DESC[char]}. ")
    else:
        body_rule = (f"head where the mannequin's head is, side view facing {face_of(char)} (the small triangle on the mannequin head is the nose). "
                     f"Light gray limbs are the near side, dark gray limbs the far side. {WPN[char]} "
                     f"Every figure must match the reference in costume, hair, colors, face and proportions. Character: {DESC[char]}. ")
    prompt = (head + "Each figure must copy its mannequin EXACTLY: same pose and limb angles, same size, same position, feet on its ground line, "
              + body_rule + tail)
    with _LOCK:
        k = 0
        while os.path.exists(f'{od}/{gname}_{k}.png') or os.path.exists(f'{od}/{gname}_{k}.lock'): k += 1
        open(f'{od}/{gname}_{k}.lock', 'w').close()
        guide.save(f'{od}/{gname}_guide.png')
        json.dump(cells, open(f'{od}/{gname}_cells.json', 'w'), indent=0)
    out = f'{od}/{gname}_{k}.png'
    print(time.strftime('%H:%M:%S'), f'生成 {char}/{gname} #{k} ({MODEL}, {QUALITY}, {"multi" if multi else "composite"}) ...', flush=True)
    data = png(guide)
    images = [('model.png', png(Image.open(f'raw_anim/{char}/{model_file}').convert('RGB'))), ('pose.png', data)] if multi else [('input.png', data)]
    try:
        img, meta, tries, errs, secs = call(lambda: req_edit(key, base, images, prompt, f'{OUTW}x{OUTH}'))
        open(out, 'wb').write(img)
        with _LOCK:
            log(char, f'gen/{gname}_{k}.png', dict(kind='grid', endpoint='edits/async', grid=gname, poses=g['poses'], model=MODEL,
                                                   quality=QUALITY, size=f'{OUTW}x{OUTH}', ref=model_file,
                                                   input='multi' if multi else 'composite', prompt=prompt, tries=tries, errors=errs,
                                                   secs=secs, usage=meta.get('usage')))
        print(time.strftime('%H:%M:%S'), '→', out, f'{secs}s', flush=True)
        return out
    finally:
        os.remove(f'{od}/{gname}_{k}.lock')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['model', 'grid', 'guide'])
    ap.add_argument('char')
    ap.add_argument('grid', nargs='*', help='网格名（可多个，最多 3 个并发提交；同名重复 = 多个候选）')
    ap.add_argument('--multi', action='store_true', help='多图输入（image[]：定妆图 + 白模网格），默认单张拼图')
    ap.add_argument('--tag', default='')
    ap.add_argument('--model', default='model.png', help='raw_anim/<角色>/ 下的定妆图文件名')
    a = ap.parse_args()
    if a.cmd == 'guide':
        os.makedirs(f'raw_anim/{a.char}/gen', exist_ok=True)
        for gname in (a.grid or grids(a.char)):
            im, cells = render_grid(a.char, gname, a.model); im.save(f'raw_anim/{a.char}/gen/{gname}_guide.png')
            json.dump(cells, open(f'raw_anim/{a.char}/gen/{gname}_cells.json', 'w'), indent=0)
        print('ok'); return
    key, base = load_env()
    if a.cmd == 'model':
        return cmd_model(a.char, a, key, base)
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=3) as ex:
        futs = [ex.submit(run_grid, a.char, gname, key, base, a.model, a.multi) for gname in a.grid]
        for f in futs:
            try: f.result()
            except Exception as e: print('失败', e, flush=True)


if __name__ == '__main__':
    main()
