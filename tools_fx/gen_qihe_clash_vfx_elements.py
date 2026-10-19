"""栖河交锋三招特效 v2 · 第 4 步：按定稿概念图逐个生成单体特效元素。
流程：xiaojianghu/docs/design/skill-vfx-pipeline.md 第 4 节。定稿见 art_sources/qihe-clash-vfx-concepts-v1/approved.json。
用法：python3 tools_fx/gen_qihe_clash_vfx_elements.py [--only id,id] [--force] [-j 3]
生图：xiaojianghu/tools_common/imggen.py（当前源 302ai-sunburst）；纯黑底元素传 --background opaque，透明底元素传 transparent。
产出：art_sources/qihe-clash-vfx-elements-v1/<id>.png、<id>.json 回执、prompts.json、refs/ 参考裁图。已存在的跳过（--force 重生前先把旧图移进 rejected/）。
"""
import argparse, concurrent.futures as cf, hashlib, json, os, shutil, subprocess, sys, time
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CON = os.path.join(ROOT, 'art_sources/qihe-clash-vfx-concepts-v1')
OUT = os.path.join(ROOT, 'art_sources/qihe-clash-vfx-elements-v1')
IMGGEN = os.path.join(os.path.dirname(ROOT), 'xiaojianghu/tools_common/imggen.py')
MODEL_LINE = 'Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）'

COMMON = """任务：为一款 2D 横版像素武侠游戏生成【一个单独的特效元素素材】（游戏运行时会把它叠到战斗画面上，再由程序控制运动）。这不是场景图、不是概念图。
附图只作画风与内容参考，不要在它上面修改，不要复制附图里的人物、地面、房屋或任何场景；第一张是定稿概念图全图，第二张是该元素所在区域的放大裁图。
画风与附图里对应的特效部分一致：高精细 16-bit 像素画，硬边像素、有限调色板、深色描边、多阶明暗、有序抖动过渡、局部发光、大量细碎光点；东方武侠剑气／气劲题材。
只画这一个元素，放在画面中央，四周留足空白，任何部分都不能被画面边缘裁切。画面里不要人物、兵器实体、地面、场景、文字、数字、签名、水印、界面元素。
禁止：魔法阵、符文圆环、五芒星、闪电、火焰燃烧、陨石、空间裂隙、龙、宗教符号、黑色碎石块、锁链节段。"""

BG = {
 'black': '背景要求：背景必须是纯黑 #000000 平涂，整块均匀纯黑，没有任何渐变、纹理、暗角、地面或雾；元素本身是发光体（游戏里会把亮度转成透明度做加色叠加），所以元素内部不要画纯黑描边块。',
 'alpha': '背景要求：背景必须是真正的 alpha 透明（transparent background，PNG 透明通道），不要画棋盘格、不要画底色、不要画阴影地面；元素自身可以有深色描边和暗部。',
}

# 元素表：id、来源概念图、参考裁框（概念图 1536×1024 像素）、背景、尺寸、描述（含朝向）
ELEMENTS = [
 dict(id='am3_fan_jiangqing', concept='am_s3_b-1', crop=(30, 190, 990, 820), bg='black', size='1536x1024', use='明约合锋 260–520 主锋面',
  desc="""元素：明约合锋的【绛青扇形锋面】。一整片由同一个起点放射展开的扇形剑气锋面。
朝向：扇根（共同起点，一个很小的亮点）在画面右侧正中；扇面向左张开，张角约 70 度，左端是一条向左凸出的弧形边缘。
配色层次：扇面主体为半透明的深绛青／青蓝色剑气（深靛→青蓝→浅青），内部有十余道从扇根放射到左缘的细锋线，锋线以金白为主、夹两三道细暗红线；扇面内有细碎的金白光点与淡淡的青白飞白丝；靠近扇根处锋线收拢变亮。
不要画左缘那道最亮的金白大弧（那是另一个素材），左缘只是自然的青色边。不要黑色碎块。"""),
 dict(id='am3_edge_arc', concept='am_s3_b-1', crop=(30, 190, 420, 820), bg='black', size='1024x1536', use='明约合锋 扇面前缘弧锋',
  desc="""元素：明约合锋扇面最前缘的【金白弧锋】。一道又长又细的弯月形剑气弧线。
朝向：竖直放置，弧线向左凸出（像一个开口朝右的“(”），上下两端尖细，上端略向右回勾。
配色层次：中芯近白，向外是暖金白、淡金，外缘有一圈极细的暗红与青蓝色描边光；弧线中段最粗（约为全长的 1/30），两端渐细成尖；弧外侧拖出少量细碎金色光点和几缕短飞白丝。"""),
 dict(id='am3_cross_hit', concept='am_s3_b-1', crop=(110, 540, 700, 720), bg='black', size='1024x1024', use='明约合锋 520 命中者交叉剑痕',
  desc="""元素：明约合锋命中目标时的【金白交叉剑痕光爆】。两道交叉成 X 形的短剑痕，交点有一个十字星芒光爆。
朝向：两道剑痕分别为左上→右下、左下→右上，夹角约 70 度，中心对称；交点在画面正中。
配色层次：剑痕中芯白、两侧金白，外缘一侧带极细的青蓝描边光、另一侧带极细暗红描边光；交点是明亮的白金四芒星芒，周围散布一圈细碎金色光点和短金色火花线（不是火焰）。整体紧凑，宽高大致相等。"""),
 dict(id='am3_blade_glint', concept='am_s3_a-1', crop=(800, 560, 1080, 700), bg='black', size='1536x1024', use='明约合锋 0–260 剑身凝芒',
  desc="""元素：明约合锋起手时【沿剑身凝聚的金白锋芒】。一条水平细长的金白光刃（只是光，不画剑的实体、剑柄、护手）。
朝向：水平，锋尖朝左；右端（剑柄一侧）稍粗且略散，左端锋尖处有一个明亮的小星芒。
配色层次：中芯近白，外层暖金、淡金，最外一圈极淡的金色辉光；光刃上下飘着少量细碎金色光点。长宽比约 12:1。"""),
 dict(id='cs1_wrist_lash', concept='cs_whip_s1_a-2', crop=(850, 520, 1070, 710), bg='alpha', size='1024x1024', use='缠腕短打 150–600 缠腕鞭影',
  desc="""元素：缠腕短打的【墨紫缠腕鞭影】。一道墨紫色鞭形气劲从右上方甩入，在画面中下部绕成一圈半封闭的缠绕环（像软鞭缠住手腕，但不画手腕和人）。
朝向：鞭梢的来路从画面右上角向左下延伸，缠绕环位于画面中央偏左下，环为横向椭圆、略向左下倾斜。
配色层次：鞭影为墨紫气劲：深墨紫描边（近黑紫）、中间紫、亮芯淡紫白；环的前段更亮，后段被遮住处偏暗；周围飘着少量紫色细丝和三四个细小紫色光点。线条是连续流畅的气劲，不是锁链、不分节。"""),
 dict(id='cs_copper_point', concept='cs_whip_s1_a-2', crop=(860, 560, 1040, 700), bg='black', size='1024x1024', use='缠腕/回身掠影 铜色作用点',
  desc="""元素：鞭劲命中处的【铜色作用点】。一个小而紧凑的铜色受力光点：中心亮、外圈铜橙，四周有六到八根短促的铜色细芒向外放射，再散落一些铜色像素碎点。
朝向：中心对称，略呈横向扁圆（宽高比约 1.3:1）。
配色层次：白黄中芯→亮铜橙→深铜褐描边光；没有火焰形状、没有烟。"""),
 dict(id='cs2_wisps', concept='cs_whip_s2_a-1', crop=(270, 330, 820, 700), bg='alpha', size='1536x1024', use='回身掠影 0–240 身周蓄势',
  desc="""元素：回身掠影起手时【施者身周的墨紫丝缕蓄势】。几道环绕一个空心中央的墨紫色螺旋丝缕（中央留空给人物，不画人物），夹两三道很细的暗红色丝线，并点缀十余个细小铜色微光点。
朝向：整体为横向椭圆环绕（宽约为高的 1.8 倍），丝缕逆时针盘旋，右下方的丝缕尾端向右下拖出一点。
配色层次：深墨紫描边→墨紫→浅紫亮缘；暗红丝线细而亮；铜色微光点 1–2 像素。不要画地面圈形，不要画斜贯全场的长气流。"""),
 dict(id='cs2_whip_arc', concept='cs_whip_s2_b-2', crop=(600, 260, 1536, 790), bg='alpha', size='1536x1024', use='回身掠影 240–920 墨紫长鞭大弧',
  desc="""元素：回身掠影的【墨紫长鞭大弧】。一条连续、流畅、柔软的墨紫鞭形气劲，划出一个横向的大椭圆弧（约 3/4 圈，不闭合）。
朝向：弧的起点（鞭柄端，较粗）在画面左侧中上方，沿上缘向右、绕过右端、再沿下缘向左回卷，终点（鞭梢，最细）在画面中下方偏右；整体宽约为高的 2.6 倍，右端最亮。
配色层次：气劲主体为墨紫：近黑紫的描边、深紫、亮紫，中芯一道淡紫白高光细线；外缘飘出少量墨紫烟丝和细碎紫色光点。务必是柔软连续的一条，像丝绸般顺滑；绝对不要画成规整节段、珠串或铁链；不要黑色碎块。"""),
 dict(id='cs2_ghost_red', concept='cs_whip_s2_b-2', crop=(700, 380, 1536, 780), bg='black', size='1536x1024', use='回身掠影 两道暗红残影',
  desc="""元素：回身掠影鞭弧后方的【暗红残影】。一道细长、略带弧度的暗红色光痕残影，像鞭子掠过后留下的余影。
朝向：横向，整体是一段向上拱起的弧（像一张拉开的弓，弓背朝上），左端细尖，右端略粗再收尖；宽约为高的 5 倍。
配色层次：中芯亮红偏粉白的细线，外层暗红、深酒红，外缘极淡的红色辉光；中段有两三处飞白断丝；不要火焰形状。"""),
 dict(id='cs_copper_sparks', concept='cs_whip_s2_b-2', crop=(1080, 560, 1520, 790), bg='black', size='1024x1024', use='回身掠影 520 三目标铜色碎点',
  desc="""元素：鞭劲扫过目标时溅起的【铜色碎点】。一簇向左右两侧（偏右上与偏右下）溅开的铜色细火花线与像素碎点，中心有一道短短的横向墨紫鞭痕亮线。
朝向：碎点主要向画面右侧扇形溅开（扇形张角约 120 度），左侧较少；中心在画面中央偏左。
配色层次：火花线为亮铜橙→铜褐，末端渐暗；碎点 1–3 像素；中心短鞭痕为亮紫白芯、墨紫外缘。不是火焰、没有烟。"""),
]


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def prompt_of(e):
    return '\n'.join([MODEL_LINE, COMMON, BG[e['bg']], e['desc']])


def ref_crop(e):
    os.makedirs(os.path.join(OUT, 'refs'), exist_ok=True)
    p = os.path.join(OUT, 'refs', e['id'] + '_crop.png')
    im = Image.open(os.path.join(CON, e['concept'] + '.png')).convert('RGB').crop(e['crop'])
    s = max(1, 768 // max(im.size))
    im.resize((im.width * s, im.height * s), Image.NEAREST).save(p)
    return p


def run(e, force=False):
    out = os.path.join(OUT, e['id'] + '.png')
    if os.path.exists(out) and not force:
        return e['id'], 'skip'
    if os.path.exists(out):
        os.makedirs(os.path.join(OUT, 'rejected'), exist_ok=True)
        shutil.move(out, os.path.join(OUT, 'rejected', f"{e['id']}-{int(time.time())}.png"))
    pf = os.path.join(OUT, 'prompts', e['id'] + '.txt')
    os.makedirs(os.path.dirname(pf), exist_ok=True)
    open(pf, 'w', encoding='utf-8').write(prompt_of(e))
    refs = [os.path.join(CON, e['concept'] + '.png'), ref_crop(e)]
    cmd = [sys.executable, IMGGEN, '--prompt-file', pf, '--out', out, '--size', e['size'], '--quality', 'high',
           '--background', 'opaque' if e['bg'] == 'black' else 'transparent']
    for r in refs:
        cmd += ['--ref', r]
    t = time.time()
    p = subprocess.run(cmd, capture_output=True, text=True)
    open(os.path.join(OUT, e['id'] + '.log'), 'w', encoding='utf-8').write(p.stdout + '\n' + p.stderr)
    if not os.path.exists(out):
        return e['id'], 'FAIL ' + (p.stdout + p.stderr)[-400:]
    im = Image.open(out)
    rec = {'id': e['id'], 'concept': e['concept'] + '.png', 'concept_sha256': sha(refs[0]), 'ref_crop': os.path.relpath(refs[1], ROOT),
           'crop_box': e['crop'], 'background': '纯黑 #000000（发光元素，运行时亮度转透明加色叠加）' if e['bg'] == 'black' else '真透明 PNG（实体/暗部元素，普通混合）',
           'use': e['use'], 'request_size': e['size'], 'size': list(im.size), 'mode': im.mode, 'sha256': sha(out),
           'seconds': round(time.time() - t), 'tool': 'xiaojianghu/tools_common/imggen.py（源 302ai-sunburst，接口模型 gpt-image-2.5-sunburst；提示词首行要求 gpt-image-2.5）',
           'imggen_stdout': p.stdout.strip()[-600:], 'prompt': prompt_of(e), 'date': time.strftime('%Y-%m-%d %H:%M')}
    json.dump(rec, open(os.path.join(OUT, e['id'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    return e['id'], f"ok {im.size} {im.mode} {rec['seconds']}s"


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--only'); ap.add_argument('--force', action='store_true'); ap.add_argument('-j', type=int, default=3)
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    json.dump({e['id']: {'concept': e['concept'], 'background': e['bg'], 'size': e['size'], 'use': e['use'], 'prompt': prompt_of(e)} for e in ELEMENTS},
              open(os.path.join(OUT, 'prompts.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    todo = [e for e in ELEMENTS if not a.only or e['id'] in a.only.split(',')]
    with cf.ThreadPoolExecutor(a.j) as ex:
        for fut in cf.as_completed([ex.submit(run, e, a.force) for e in todo]):
            print(*fut.result(), flush=True)


if __name__ == '__main__':
    main()
