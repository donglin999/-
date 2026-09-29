"""立绘统一生成（FlatRouter / gpt-image-2.5）

所有角色共用同一套 STYLE + PARAMS，只替换角色描述 CHARS[k]，保证画风、构图、尺寸一致。
用法（以仓库根目录为工作目录）：
  python3 tools_por/gen_por.py                    # 生成全部 → raw_por/p_*.png
  python3 tools_por/gen_por.py hero monk          # 只生成指定角色
  python3 tools_por/gen_por.py hero:all suzhi_shy   # 表情差分（以 raw_por/p_hero.png 为参考图）
  python3 tools_por/gen_por.py --model gpt-image-2.5-sunburst --out raw_por/test hero
  -j/--jobs N 并发任务数（默认 3，账号上限）；接口为 FlatRouter 异步生图（tools_common/flatimg.py）。
密钥读取 tools_por/.env（FLATROUTER_API_KEY / FLATROUTER_BASE_URL），勿提交。
"""
import argparse, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'tools_common'))
import flatimg  # noqa: E402  异步生图客户端（提交 → 轮询 → 下载）

# ---------- 统一生成参数 ----------
PARAMS = dict(
    model='gpt-image-2.5-sunburst',   # flare 画风相近但慢约 2.5 倍
    size='1024x1536',          # 2:3 竖版，后处理缩到 ≤480×640
    quality='high',
    background='opaque',       # 该模型不支持真透明（会画出假棋盘格），改纯白底 + 洪泛去背（墨线闭合，不会吃掉白衣）
    output_format='png',
    n=1,
)

STYLE = (
    "中国武侠游戏角色立绘，南宋年间。"
    "画风：传统国画工笔白描结合淡彩平涂——毛笔墨线勾勒轮廓，线条有粗细顿挫与飞白；"
    "上色为低饱和平涂加少量晕染，颜色取自国画矿物色（赭石、花青、石绿、朱砂、藤黄、墨色），"
    "面部五官简洁，以线条表现而非光影。"
    "禁止：厚涂、写实皮肤质感、轮廓光、镜面高光、3D 渲染感、CG 光泽、景深虚化、过度细节。"
    "构图：单人，腰部以上半身像，身体朝画面右侧约四分之三侧身，头部略转向观者，"
    "头顶到画面上边缘留约百分之五空白，人物水平居中，人物宽度不超过画面宽度的四分之三，左右两侧都留出白色空白，肩膀和手臂完整不被画框裁切，画面下缘在腰部以下自然截断。"
    "背景：纯白色 #FFFFFF 的平整底色（不是透明棋盘格），无纸张纹理、无场景、无地面、无投影、无文字、无印章、无水印、无边框。"
)

CHARS = {
    'hero':    "主角，十七八岁少年侠客，剑眉星目，黑发高束马尾，白色交领窄袖劲装，朱红腰带，背负一柄青鞘长剑（剑柄露出右肩后），神情坚毅略带少年意气",
    'suzhi':   ("苏芷，二十岁左右年轻女医师，温婉清秀的美人，身材高挑丰满、曲线玲珑，胸部丰满，腰肢纤细，"
                "乌发挽髻插一支青玉簪，石绿色交领襦裙束高腰带、外罩浅色褙子，衣着端庄合身；"
                "斜挎一只布制药囊：一条宽约两指的布背带从右肩斜跨过胸前压到左腰，背带紧贴身体、随身形起伏并压出衣褶，"
                "药囊由背带承重、贴靠在左侧腰胯处，背带两端缝在药囊上，受力合理，不是悬空吊着；神情沉静"),
    'monk':    "年迈老僧，慈眉善目，白色长眉垂到脸侧，光头有戒疤，灰色僧袍外披赭色袈裟，双手合十挂一串木念珠",
    'soldier': "南宋襄阳守城军士，三十岁上下，头戴宋式铁兜鍪，身穿宋代札甲（甲片编缀）外罩红色战袍，手握长枪，面容严肃坚毅",
    'gossip':  "市井包打听，四十岁精瘦男子，头戴黑色瓜皮小帽，八字胡，眯眼狡黠笑容，褐色长衫，手摇一把半开的折扇",
    'oldman':  "说书老人，白发白须，慈眉善目，褐色旧长衫，一手持醒木，神态悠然",
    'smith':   "豪爽铁匠大汉，络腮胡，赤膊露出结实臂膀，系厚皮围裙，肩扛一柄大铁锤，爽朗大笑",
    'lady':    "泼辣爽利的中年茶摊老板娘，盘发插木簪，朱红色短襦系围裙，双手叉腰，挑眉笑",
    'beggar':  "深藏不露的丐帮长老，蓬乱花白头发，满是补丁的破旧衣衫，腰挂酒葫芦，手持竹棒，眼神精光四射",
    'boatman': "饱经风霜的老船夫，头戴竹斗笠，身披棕色蓑衣，皮肤黝黑满脸皱纹，手握船篙",
    'bandit':  "凶恶山贼，黑布包头，横肉脸，短打黑衣敞怀，肩扛一柄厚背大刀，面露凶光",
    'chief':   "凶悍的山寨大王，独眼戴黑眼罩，虬髯，身穿中式黑色皮甲外披暗红披风，手提鬼头大刀，杀气腾腾",
}


# 表情差分：以 raw_por/p_{角色}.png 为参考图走 edits（异步），只改表情与手势，输出 p_{角色}_{差分}.png
VARIANT_BASE = ("以参考图为准，保持完全相同的角色（同一张脸、五官、发型、年龄、身材）、同一套服装与配饰、"
                "同一画风（国画白描淡彩）、同一构图、取景、人物大小与位置、纯白背景；只改变表情、视线与手部动作：")
VARIANTS = {
    'hero': {
        'smile':    "嘴角上扬的爽朗笑容，眼神明亮，一手握拳轻抵胸前",
        'angry':    "剑眉倒竖、咬紧牙关的怒容，眼神凌厉，右手握住肩后剑柄准备拔剑",
        'surprise': "睁大双眼、微张嘴的惊讶神情，身体略向后仰，一只手半抬",
        'think':    "若有所思，目光低垂看向一侧，一手托着下巴",
        'hurt':     "负伤咬牙强撑，眉头紧皱，额头有汗，嘴角渗一丝血，一手捂着侧腹",
        'battle':   "战斗姿态，已拔出长剑斜举于身前，剑尖向上，目光锐利坚定",
    },
    'suzhi': {
        'smile':    "温柔浅笑，眉眼弯弯，双手交叠在身前",
        'shy':      "害羞脸红，目光躲闪看向一旁，一手轻掩嘴边",
        'angry':    "微嗔薄怒，柳眉微蹙、双颊微鼓，双手叉腰",
        'worry':    "担忧神情，眉头轻蹙、眼含关切，双手捧在胸前",
        'surprise': "惊讶，杏眼圆睁、樱唇微张，一手抬到胸前",
        'battle':   "战斗姿态，神情凛然，右手指间夹着三枚银针举到身前",
    },
}


def load_env():
    """兼容旧调用（tools_fx/rig/genframes.py 等仍 import 它）：返回 (key, base)，实现见 tools_common/flatimg.py。"""
    return flatimg.load_env()


def generate(key, base, prompt, params, retries=2):
    """兼容旧签名：文字生图 → PNG bytes。实际走 flatimg 异步接口（key/base 由 flatimg 从 .env 读取）。"""
    return flatimg.generate(prompt, attempts=retries, **params).png


def edit(key, base, ref_path, prompt, params, retries=2):
    """兼容旧签名：以 ref_path 为参考图编辑 → PNG bytes（edits 不支持 background，自动去掉）。"""
    p = {k: v for k, v in params.items() if k != 'background'}
    return flatimg.edit([ref_path], prompt, attempts=retries, **p).png


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('names', nargs='*')
    ap.add_argument('--model')
    ap.add_argument('--out', default='raw_por')
    ap.add_argument('--ref', default='raw_por', help='差分参考图所在目录')
    ap.add_argument('--force', action='store_true', help='覆盖已存在的输出')
    ap.add_argument('-j', '--jobs', type=int, default=3, help='并发任务数（账号上限约 3）')
    a = ap.parse_args()
    params = dict(PARAMS)
    if a.model: params['model'] = a.model
    names = a.names or list(CHARS)
    # 'hero:all' 展开为该角色全部差分
    names = [x for n in names for x in ([f'{n[:-4]}_{v}' for v in VARIANTS[n[:-4]]] if n.endswith(':all') else [n])]
    flatimg.load_env()
    os.makedirs(a.out, exist_ok=True)
    log_p = os.path.join(a.out, 'params.json')
    log = json.load(open(log_p)) if os.path.exists(log_p) else {}
    jobs = []
    for n in names:
        out = os.path.join(a.out, f'p_{n}.png')
        if os.path.exists(out) and not a.force:
            print('跳过', out); continue
        if n in CHARS:
            prompt = f'{STYLE}\n角色：{CHARS[n]}。'
            print(f'生成 {n} ({params["model"]}) ...', flush=True)
            jobs.append(dict(params, prompt=prompt, _name=n, _out=out))
        else:
            c, v = n.split('_', 1)
            ref = os.path.join(a.ref, f'p_{c}.png')
            prompt = f'{VARIANT_BASE}{VARIANTS[c][v]}。\n{STYLE}\n角色：{CHARS[c]}。'
            print(f'差分 {n} ← {ref} ({params["model"]}) ...', flush=True)
            jobs.append(dict({k: v for k, v in params.items() if k != 'background'}, images=[ref], prompt=prompt,
                             _name=n, _out=out))
    failed = []

    def done(i, job, r, err):   # 串行回调：写图、更新 params.json（格式同旧版：参数 + prompt）
        n, out = job['_name'], job['_out']
        if err:                  # 单张失败不中断整批，末尾汇总
            print(f'  ✗ {n} 失败：{err}'); failed.append(n); return
        open(out, 'wb').write(r.png)
        log[n] = dict(params, prompt=job['prompt'])
        json.dump(log, open(log_p, 'w'), ensure_ascii=False, indent=1)
        print(f'  → {out}  {len(r.png) // 1024}KB  {r.meta["seconds"]:.0f}s  {r.meta["task_id"]}', flush=True)

    if jobs: flatimg.run_many(jobs, max_workers=a.jobs, on_done=done)
    if failed: print('失败：', ' '.join(failed))


if __name__ == '__main__':
    main()
