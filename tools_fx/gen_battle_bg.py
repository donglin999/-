"""战斗专用背景 bb_{scene}.webp（工作流 A，见 docs/battle-v2.md）

HD-2D 式战斗舞台：地平线压低（约 55–60% 高度）、中场空旷供左右两侧站位、两侧建筑/山石框景、黄昏或夜色偏暗。
用法（仓库根目录为工作目录）：
  python3 tools_fx/gen_battle_bg.py gen street            # 生图 → raw_battle/A/bb_street.png（已存在则跳过，--force 覆盖）
  python3 tools_fx/gen_battle_bg.py px street             # 像素化 → assets/bb_street.webp（960×540，3px 像素）
  python3 tools_fx/gen_battle_bg.py all                   # 全部场景：生图（异步接口，≤3 并发）+ 像素化
  python3 tools_fx/gen_battle_bg.py all temple gate road --raw S2   # 原图存 raw_battle/S2/（工作流 S2 补齐的一批）
生图：tools_common/flatimg.py（FlatRouter 异步接口，密钥 tools_por/.env），模型 gpt-image-2.5-sunburst；原图与 params.json 存 raw_battle/{--raw}/（默认 A）。
场景键 = bb_{键}；运行时映射（bg_*/m_* → bb_*）见 js/bstage.js BB_ALIAS 与 docs/battle-v2.md。
"""
import argparse, json, os, sys, time
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, 'tools_common'))
import flatimg  # noqa: E402  FlatRouter 异步生图客户端
RAW = os.path.join(ROOT, 'raw_battle', 'A')   # --raw 可改（工作流 S2 用 raw_battle/S2）
OUT = os.path.join(ROOT, 'assets')

PARAMS = dict(model='gpt-image-2.5-sunburst', size='1536x1024', quality='high',
              background='opaque', output_format='png', n=1)

STYLE = (
    "高品质 2D 像素画游戏战斗背景（HD-2D 风格，类似《八方旅人》的战斗场景），中国南宋武侠世界。"
    "横版回合制战斗舞台，镜头为平视略微俯视的正面视角，画面左右对称感强。"
    "构图要求（非常重要）：地平线（远处地面与背景的交界线）位于从上往下约百分之五十五的高度；"
    "画面下方约百分之四十五是大片平坦、空旷、干净的地面，地面上没有任何人物、动物、箱子、杂物、道具，"
    "画面正中央与左右两侧的地面都完全空着，用来站立战斗角色；"
    "只在画面最左和最右边缘各有少量建筑或山石树木作为框景，且只占画面宽度各约百分之十二，不要延伸到中间；"
    "中间是层次分明的远景（近景、中景、远景逐层变淡、带空气透视和薄雾）。"
    "光线：{light}，整体偏暗、低饱和、有氛围感，局部暖色光源点缀，地面有柔和的光影明暗变化。"
    "画面中没有任何人物、没有文字、没有 UI、没有水印、没有边框。"
)

SCENES = {
    'street': dict(light="黄昏入夜时分，天空是深蓝紫到暗橙的渐变，灯笼亮起暖橙色的光",
                   desc="南宋襄阳城的商业街市：左右两侧边缘是木结构二层店铺的屋檐与挂着的红灯笼、布招牌；"
                        "远景是笔直延伸的街道尽头，远处有城楼剪影与层叠屋顶；地面是宽阔的青石板街面"),
    'temple_out': dict(light="傍晚，夕阳余晖从远处斜射，天空橙紫色，古庙前有石灯笼微光",
                       desc="破旧古庙（羊太傅庙）前的空地：左右边缘是斑驳的庙墙一角与古老的松树，"
                            "远景是庙宇山门与台阶、后方远山；地面是开阔的夯土与碎石板空地，零星落叶"),
    'alley': dict(light="夜晚，月光清冷蓝灰色，远处一两盏昏黄灯笼",
                  desc="城中僻静的小巷口转角的宽阔小空地：左右边缘是高高的白墙青瓦与木门，墙上有斑驳痕迹，"
                       "远景是巷子深处与层叠的马头墙屋脊、晾衣竹竿剪影；地面是湿润泛光的旧石板"),
    'ferry': dict(light="黄昏，落日低垂在江面上，天空橙红到深紫，江面反射金色波光",
                  desc="襄阳城东汉水边的东津渡口：左边缘是木质码头栈桥与系着的小船一角、右边缘是芦苇丛与柳树，"
                       "远景是宽阔江面、对岸远山与帆影；地面是开阔的木板码头与泥土岸边空地"),
    'bandit_gate': dict(light="暮色，天空阴沉暗红，寨门上火把燃着橙色火光",
                        desc="山贼山寨寨门前：左右边缘是粗木栅栏与瞭望木塔、火把，"
                             "远景是高大的木质寨门与两侧山崖、山林剪影；地面是开阔的泥土与碎石空地"),
    'bandit_cave': dict(light="洞穴内幽暗，岩壁上火把与火盆发出摇曳的橙红火光，洞顶缝隙透下一束冷色微光",
                        desc="完全封闭在山体内部的大山洞（画面里看不到天空、看不到树木、看不到远山，四周与头顶都是岩石洞顶）："
                             "左右边缘是嶙峋的岩壁与钟乳石、挂着的兽皮与火把，头顶是低垂的岩石洞顶与倒挂的钟乳石；"
                             "远景是洞穴深处更暗的岩层、山贼堆放赃物的木架与木箱、一张铺着虎皮的木交椅；地面是开阔平整的岩石地面"),
    # ── 工作流 S2 补齐 ──
    'temple': dict(light="夜晚，破庙内昏暗，神像前一堆小篝火发出暖橙色的光，破窗透进一缕冷蓝月光",
                   desc="荒废的羊太傅庙正殿内部（室内，看不到天空）：左右边缘是斑驳掉漆的朱红木柱与挂着蛛网的残破帷幔，"
                        "远景是正殿深处高台上端坐的文官石像（晋代儒将，头戴进贤冠、身披朝服、面目平和）与积灰的供桌、香炉，"
                        "石像后方是暗色木板墙与梁架；地面是开阔的旧青砖地面，散落少许干草"),
    'gate': dict(light="黄昏入夜，天空深蓝紫到暗橙，城楼上的灯笼与火把亮着暖橙色的光",
                 desc="南宋襄阳城南门外的官道空地：远景正中是高大的青砖城墙与重檐城门楼、城门洞，城墙前是宽阔的护城河与一座石桥，"
                      "城墙上插着红色军旗；左边缘是守军的木拒马与兵器架，右边缘是路边的老柳树与一座候验商旅歇脚的茅草凉棚；"
                      "地面是开阔的夯土官道空地，有车辙"),
    'road': dict(light="暮色，天空灰蓝到暗橙，林间有淡淡的薄雾",
                 desc="襄阳城外通往汉水渡口的荒僻山道：左右边缘是茂密的松树与杂木林、嶙峋的山石，"
                      "远景是层叠起伏的丘陵与远处一线汉水的微光；地面是开阔的黄土山道与枯草空地，零星碎石"),
    # ── 工作流 F：渡江（江心截船，docs/design/01 §5.5）──
    'river': dict(light="黄昏，天空阴沉的橙灰色，江风大，远处乌云压着对岸，江面反射暗金色的碎光",
                  desc="汉水江心一条宽大的木渡船的甲板上：画面下方约百分之四十五是这条渡船宽阔、平坦、空旷的旧木板甲板（木板横向铺开，近处船舷低矮），"
                       "左边缘是船尾的竹篷一角与一支长橹，右边缘是船头高起的木舷与一卷缆绳；甲板之外是宽阔翻涌的江面，"
                       "远景是对岸低矮的芦苇滩与远山剪影、江上两三条黑色小快船的剪影（远处，很小，没有人）"),
}

PX = 3            # 一个像素单位 = 3 屏幕像素（与战斗精灵同密度）
NCOL = 40         # 调色板颜色数


def prompt_of(k):
    s = SCENES[k]
    return STYLE.format(light=s['light']) + "\n场景：" + s['desc'] + "。"


def _save(k, img, p, secs, tid):
    out = os.path.join(RAW, f'bb_{k}.png')
    open(out, 'wb').write(img)
    lp = os.path.join(RAW, 'params.json')
    log = json.load(open(lp)) if os.path.exists(lp) else {}
    log[k] = dict(PARAMS, prompt=p, time=time.strftime('%Y-%m-%d %H:%M:%S'))
    json.dump(log, open(lp, 'w'), ensure_ascii=False, indent=1)
    print(f'  → {out} {len(img)//1024}KB {secs:.0f}s {tid}')
    return out


def gen_many(keys, force=False):
    """并发生成多个场景（flatimg 异步接口，≤3 并发）；返回失败的场景名列表。"""
    os.makedirs(RAW, exist_ok=True)
    jobs = []
    for k in keys:
        out = os.path.join(RAW, f'bb_{k}.png')
        if os.path.exists(out) and not force:
            print('跳过', out); continue
        print(f'生成 {k} ...', flush=True)
        jobs.append(dict(PARAMS, prompt=prompt_of(k), _k=k))
    failed = []

    def done(i, job, r, err):
        if err: print(f'  ✗ {job["_k"]} 失败：{err}'); failed.append(job['_k']); return
        _save(job['_k'], r.png, job['prompt'], r.meta['seconds'], r.meta['task_id'])

    if jobs: flatimg.run_many(jobs, on_done=done)
    return failed


def gen(k, force=False):
    if gen_many([k], force): raise RuntimeError('生成失败 ' + k)
    return os.path.join(RAW, f'bb_{k}.png')


def grade(a):
    """统一调色：压暗、降饱和、暗部偏冷蓝、亮部保留暖色（HD-2D 夜色/黄昏感）。a: float 0..1 RGB"""
    lum = a @ np.array([.299, .587, .114])
    sat = .9
    a = lum[..., None] + (a - lum[..., None]) * sat
    a = np.clip(a, 0, 1) ** 1.04 * .97
    sh = np.clip(1 - lum * 1.6, 0, 1)[..., None]           # 暗部权重
    a = a * (1 - .12 * sh) + np.array([.05, .06, .11]) * .12 * sh * 2.2
    hi = np.clip((lum - .6) * 2.5, 0, 1)[..., None]         # 高光微暖
    a = a + hi * np.array([.03, .012, -.02])
    return np.clip(a, 0, 1)


def pixelate(k, crop_top=None):
    src = os.path.join(RAW, f'bb_{k}.png')
    im = Image.open(src).convert('RGB')
    w, h = im.size
    th = round(w * 9 / 16)
    # 裁成 16:9：默认保留中下部（地面），上方天空多裁一些
    y0 = int((h - th) * (.55 if crop_top is None else crop_top))
    im = im.crop((0, y0, w, y0 + th))
    lw, lh = 960 // PX, 540 // PX
    # 先轻度锐化再用面积平均缩小，保留结构
    small = im.resize((lw * 2, lh * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 60, 2)).resize((lw, lh), Image.BOX)
    a = np.asarray(small).astype(np.float32) / 255
    a = grade(a)
    small = Image.fromarray((a * 255 + .5).astype(np.uint8))
    q = small.quantize(colors=NCOL, method=Image.MEDIANCUT, kmeans=3, dither=Image.NONE).convert('RGB')
    big = q.resize((lw * PX, lh * PX), Image.NEAREST)
    dst = os.path.join(OUT, f'bb_{k}.webp')
    big.save(dst, lossless=True, method=6)
    print('像素化 →', dst, os.path.getsize(dst) // 1024, 'KB')
    return dst


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['gen', 'px', 'all'])
    ap.add_argument('names', nargs='*')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--crop', type=float, default=None, help='16:9 裁切的纵向位置 0=顶 1=底')
    ap.add_argument('--raw', default='A', help='原图目录 raw_battle/<raw>')
    a = ap.parse_args()
    global RAW
    RAW = os.path.join(ROOT, 'raw_battle', a.raw)
    names = a.names or list(SCENES)
    failed = gen_many(names, a.force) if a.cmd in ('gen', 'all') else []
    for k in names:
        if a.cmd in ('px', 'all') and k not in failed:
            pixelate(k, a.crop)


if __name__ == '__main__':
    main()
