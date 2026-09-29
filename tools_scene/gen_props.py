#!/usr/bin/env python3
"""街景单体素材生图：每个建筑 / 物件单独生成（品红底），供 cut_props.py 抠图像素化、build_scene.py 程序排布。

用法（仓库根目录）：
  python3 tools_scene/gen_props.py                 # 生成 PROPS 中全部缺失项
  python3 tools_scene/gen_props.py shop_a tea_shed # 只生成指定项
  python3 tools_scene/gen_props.py --force shop_a  # 覆盖
  python3 tools_scene/gen_props.py --noref ...     # 不带风格参考图（走 generations）
输出 raw_scene/props/<key>.png，参数与提示词记录在 raw_scene/props/params.json。
走 tools_common/flatimg.py（异步接口，进程内 ≤3 并发，账号级与其它脚本共享 3 个名额）。
风格参考图 raw_scene/style_ref.png：由现有街市明亮地图裁切放大得到（统一像素密度、屋顶/墙面配色与光向）。
"""
import os, sys, json, argparse, time
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
sys.path.insert(0, os.path.join(ROOT, 'tools_common'))
import flatimg  # noqa: E402

OUT = os.path.join(ROOT, 'raw_scene', 'props')
REF = os.path.join(ROOT, 'raw_scene', 'style_ref.png')

PARAMS = dict(model='gpt-image-2.5-sunburst', size='1024x1024', quality='high', background='opaque', output_format='png', n=1)

STYLE = (
    "Pixel art game asset for a top-down Chinese wuxia RPG, in exactly the same pixel art style, palette and lighting as the reference image "
    "(the reference is only a style sample — do NOT copy its layout). "
    "Camera: classic JRPG 3/4 top-down view looking north from the south at about 45 degrees, so roofs are seen from above and the south-facing front facade is visible; "
    "no perspective vanishing, orthographic-looking, the object stands upright and square to the viewer (not rotated diagonally). "
    "Setting: Southern Song dynasty (13th century) Xiangyang city market street. "
    "Look: dark blue-grey glazed ceramic tile roofs with curved eaves, cream / off-white plaster walls, warm brown timber posts and lattice windows, "
    "bright warm daylight from the upper left, crisp dark pixel outlines, limited palette, clean pixel clusters, no blur, no gradients banding noise. "
    "Composition: ONE single isolated object, centered, fully inside the frame with a generous empty margin on every side. "
    "Background: completely flat solid pure magenta #FF00FF everywhere around the object. "
    "No ground tiles, no grass, no floor patch, no cast shadow on the background, no people, no text, no watermark, no border."
)
SHEET = (
    "Pixel art game asset sheet for a top-down Chinese wuxia RPG, in exactly the same pixel art style, palette and lighting as the reference image "
    "(style sample only — do not copy its layout). Classic JRPG 3/4 top-down view from the south at about 45 degrees, objects upright and square to the viewer. "
    "Southern Song dynasty Xiangyang market. Bright warm daylight from the upper left, crisp dark pixel outlines, limited palette. "
    "Arrange the objects listed below in a loose grid, each object clearly separated from the others by wide empty space (never touching or overlapping), all drawn at the same consistent scale "
    "(a standing adult person would be about 1/9 of the image height). "
    "Background: completely flat solid pure magenta #FF00FF. No ground, no floor patches, no cast shadows on the background, no people, no text, no labels, no watermark."
)

# key: (提示词描述, 附加参数)。建筑单张 1024²；物件表格 1536x1024
PROPS = {
    # ── 建筑 ──
    'shop_a': ("A two-storey Song dynasty shop house, about 3 bays wide: ground floor has an open shop front with wooden shutters taken down, a counter with goods, "
               "a hanging vertical wooden signboard (blank, no characters) and a dark red cloth awning; upper floor has lattice windows and a small balcony rail; "
               "hip-and-gable roof of dark blue-grey tiles with upturned eave corners.", {}),
    'shop_b': ("A single-storey narrow Song dynasty shop, 2 bays wide, deep tiled roof, open front with a wooden counter full of pottery jars and baskets, "
               "a blue cloth shop banner (blank) hanging on a bamboo pole at one side.", {}),
    'inn': ("A large, grand two-storey Song dynasty restaurant tavern (jiulou), 5 bays wide, the widest building in town: ground floor open hall with red lacquered posts and tables visible inside, "
            "upper floor wraparound balcony with red railings and paper lanterns, double-eave dark blue-grey tiled roof with ornate ridge ends, "
            "a tall festive 'caimen' decorated gateway frame of wooden poles with colorful ribbons in front of the entrance, a long blank cloth wine flag hanging from a pole.", {}),
    'smithy': ("A Song dynasty blacksmith workshop: single storey, tiled roof, the whole front wall open, inside a glowing brick forge furnace with fire and a chimney hood, "
               "an anvil, racks of swords, spears and tools on the side walls, a stack of charcoal sacks; sturdy dark timber.", {}),
    'medicine': ("A Song dynasty herbal medicine shop, one and a half storeys, neat and clean: open front with a long counter and a tall wall of small wooden drawers behind it, "
                 "hanging dried herb bundles and a gourd sign, tiled roof, green-tinted window lattices.", {}),
    'teahouse': ("A Song dynasty roadside tea pavilion: an open-sided timber pavilion with four posts and a light thatched-and-tile roof, no walls, "
                 "inside two low square tea tables with stools, a charcoal stove with a kettle on one side, a hanging paper lantern and a blank tea banner.", {}),
    'storystage': ("A small open-air storyteller's platform for a Song dynasty market: a low raised wooden stage with a table covered in red cloth, a folding fan and wooden gavel on it, "
                   "a simple fabric canopy on two poles above, two rows of long wooden benches in front of the stage.", {}),
    'gate_tower': ("The inner (north-facing) side of a Song dynasty city gate: a massive grey brick city wall section with a tall arched gate tunnel in the middle (dark opening), "
                   "a wide stone ramp on each side going up to the wall top, and a grand two-storey gate tower building with double-eave dark tiled roof and red posts standing on top of the wall above the arch. "
                   "Viewed from inside the city, from the north-west-ish top-down 3/4 angle, symmetric, wall extends horizontally to both image edges.", {'size': '1536x1024'}),
    'cloth_shop': ("A Song dynasty cloth and silk shop (buzhuang), two storeys, 3 bays: open ground floor front with shelves of folded colorful fabric bolts and a long counter, "
                   "long vertical cloth banners in indigo and red hanging at the front (blank, no characters), upper floor with lattice windows, dark tiled roof.", {}),
    'pawnshop': ("A Song dynasty pawnshop / money house: sturdy single storey with a tall solid front wall, a high wooden counter window with bars, heavy dark doors, "
                 "a large blank round signboard hanging, dark tiled roof with a straight ridge.", {}),
    'residence': ("A modest Song dynasty residential house: single storey, 3 bays, white plaster walls, dark wooden door in the middle and two lattice windows, "
                  "dark blue-grey tiled gable roof, a couple of potted plants by the door.", {}),
    'court_gate': ("A Song dynasty courtyard entrance gatehouse (menlou) set in a white-washed courtyard wall: a small tiled gate roof with upturned eaves, "
                   "a pair of red double doors standing open showing a stone threshold, two small stone drums at the sides, short pieces of the white wall with dark tile coping extending left and right.", {}),
    'paifang': ("A Song dynasty timber memorial archway (paifang / pailou) spanning a street: three openings, four red lacquered wooden posts on stone bases, "
                "a tiered dark tiled roof on top with ornate brackets, a blank horizontal plaque in the middle. The openings are empty so people can walk through.", {'size': '1536x1024'}),
    'bridge': ("A small Song dynasty arched stone bridge crossing a narrow canal, seen from the 3/4 top-down view with the walkway running from bottom to top of the image (north-south), "
               "grey granite with carved balustrade railings on the left and right sides, steps at both ends. Show only the bridge itself, no water, no banks.", {}),
    'hut': ("A poor Song dynasty commoner's cottage in a back alley: single storey, mud-brick and timber walls with patches, a thick weathered straw thatched roof, "
            "a crooked wooden door and one small window with a bamboo blind, a clay water jar and a broom leaning by the door.", {}),
    'hut_b': ("A small humble Song dynasty lean-to house with grey tile roof partly broken and patched with straw, whitewashed walls stained with age, "
              "a low wooden door, strings of dried peppers and garlic hanging under the eave.", {}),
    'ruin_wall': ("A crumbling old grey brick courtyard wall segment, about four times as wide as tall, with a collapsed gap in the middle full of broken bricks, "
                  "moss and weeds growing on top, dark tile coping partly missing. Straight horizontal wall seen from the front.", {'size': '1536x1024'}),
    'sampan': ("A Chinese wupeng boat (sampan with a curved black woven bamboo canopy in the middle), wooden hull, a long sculling oar at the stern, "
               "lying horizontally (bow to the left, stern to the right), seen from the classic 3/4 top-down view so the deck inside is visible. Only the boat, no water.", {'size': '1536x1024'}),
    'junk': ("A small Song dynasty river cargo junk with one tall mast and a tan batten sail raised, wooden hull loaded with a few sacks and crates, "
             "lying horizontally (bow to the right), seen from the classic 3/4 top-down view. Only the boat, no water.", {'size': '1536x1024'}),
    # ── 物件表 ──
    'sheet_alley': ("Objects: 1) a wooden chicken coop with a small ramp, 2) a tall stacked woodpile of split firewood, 3) a tiny roadside earth-god shrine of grey brick with a little tiled roof and incense, "
                    "4) a stone millstone on a round base, 5) a wooden drying rack with clothes and blue cloth hanging, 6) a broken abandoned wooden cart with one wheel off, "
                    "7) a low bamboo fence section, 8) a pile of old grey roof tiles and bricks, 9) a big clay pickle jar with a lid, 10) a straw mat with drying vegetables.", {'size': '1536x1024'}),
    'sheet_trees': ("Objects: 1) a large leafy weeping willow tree, 2) a big round Chinese scholar tree (huai) with dense green canopy, 3) a smaller round green tree, "
                    "4) a flowering pink peach tree, 5) a tall clump of green bamboo, 6) a low green shrub. Every tree shows its trunk base at the bottom.", {'size': '1536x1024'}),
    'sheet_stalls': ("Objects: 1) a vegetable stall with a cloth canopy and baskets of green vegetables and radishes, 2) a fruit stall with a cloth parasol and baskets of peaches and pears, "
                     "3) a cloth merchant stall with bolts of colored fabric, 4) a steamed bun stall with bamboo steamer stacks and steam, 5) a candied hawthorn / toy vendor stand, "
                     "6) a pottery stall with jars on the ground on a mat.", {'size': '1536x1024'}),
    'sheet_props': ("Objects: 1) a stone water well with a wooden windlass frame, 2) a large glazed water vat, 3) a pair of wooden barrels, 4) a stack of wooden crates, "
                    "5) a two-wheeled wooden hand cart, 6) a long wooden bench, 7) a square wooden table with four stools, 8) a stone lion statue, 9) a wooden lantern post with a red paper lantern, "
                    "10) a haystack, 11) a pile of bamboo baskets, 12) a stone horse-tethering post.", {'size': '1536x1024'}),
    'sheet_river': ("Objects: 1) a tall dense clump of river reeds with brown plumes, 2) a smaller reed clump, 3) a wooden mooring post with rope, 4) a bamboo rack with a fishing net hung to dry, "
                    "5) a pile of burlap grain sacks, 6) a stack of wooden cargo crates tied with rope, 7) a coil of thick rope, 8) a small upturned rowboat on the ground, "
                    "9) a tall pole with a ferry signal flag (blank), 10) a willow tree leaning.", {'size': '1536x1024'}),
    # 2026-09 场景 v3（docs/design/02）：战前城防 / 挑夫 / 榜文
    'sheet_war': ("Objects: 1) a wooden cheval-de-frise road barricade (juma) of crossed sharpened logs, wide and low, 2) a second smaller cheval-de-frise barricade, "
                  "3) a neat stack of grey fired bricks for repairing a city wall, 4) a pile of long timber logs and planks tied with rope, "
                  "5) a wooden public notice board on two posts with a small tiled roof and a few pasted paper notices (no readable text), "
                  "6) a porter's carrying pole (bian dan) lying on the ground with two round bamboo baskets of goods at its ends, "
                  "7) a wooden weapon rack holding spears and halberds, 8) a stack of sandbags / earth-filled straw bags.", {'size': '1536x1024'}),
    # ═══ 2026-09 工作流 S1：旧 5 图重建（docs/design/02 §4.1/4.1b/4.3/4.6/4.7）═══
    # setting 覆盖 STYLE/SHEET 里的"城市街市"设定（山中 / 庙内 / 山洞），光向、像素风格与街市一致；夜景由运行时 dark/lights 实现，素材本身画白昼光
    'temple_shrine': ("The central shrine of a small, old memorial temple dedicated to Yang Hu, a Western Jin dynasty general and governor (NOT a Buddha, NOT a monk): "
                      "a painted clay statue of a dignified bearded Chinese official-general seated upright on a chair, wearing a dark red official robe and a black scholar's cap (jinxian guan), hands folded, "
                      "inside a wooden niche (shrine cabinet) with a small tiled canopy roof and faded yellow curtains tied at the sides, raised on a brick pedestal; "
                      "in front of it a long wooden altar table with a bronze incense burner, two candle sticks, a plate of copper coins and a few fruit offerings. "
                      "Old, a little dusty, faded paint, but still cared for. Front view, symmetric.", {'size': '1024x1024', 'setting': 'temple'}),
    'temple_wall': ("The interior back (north) wall of an old, poor Song dynasty temple hall, seen from inside the hall: a horizontal wall of weathered dark timber posts and beams framing "
                    "plaster panels that are cracked and peeling in places, one wooden lattice window with a few broken slats, faded red paint on the posts, a low wooden skirting at the bottom, "
                    "exposed roof beams at the top edge. Straight horizontal wall facing the viewer, uniform along its length, extends horizontally to both image edges. No floor.", {'size': '1536x1024', 'setting': 'temple'}),
    'sheet_temple': ("Objects: 1) a thick round red-lacquered wooden temple pillar with peeling paint standing on a round stone base (tall, about 2.5 times a person's height), "
                     "2) a campfire of burning logs inside a ring of stones, with a small iron pot hanging from a wooden tripod over the flames, "
                     "3) a round woven straw meditation cushion (pu tuan), 4) a straw sleeping mat on the floor with a folded patched quilt and a small cloth bundle, "
                     "5) a low wooden side table with a clay teapot, two cups and a small oil lamp, 6) a small old wooden chest with a few rolled scrolls on top, "
                     "7) a bundle of stacked firewood, 8) a big clay water jar with a wooden ladle, "
                     "9) a pile of fallen broken roof tiles and a broken beam, 10) a tall bronze standing incense burner (ding) on three legs.", {'size': '1536x1024', 'setting': 'temple'}),
    'temple_hall': ("A small, old and somewhat dilapidated memorial temple hall (Yang Hu's shrine, 'Yang Taifu Miao') on a mountainside: single storey, 3 bays wide, "
                    "weathered dark grey tile hip-and-gable roof with upturned eave corners, a few tiles missing and tufts of grass growing on the roof, faded red timber posts, "
                    "grey brick side walls, the central double doors standing wide open showing a dark interior, a blank horizontal wooden plaque above the doors, "
                    "a lattice window on each side bay, raised on a low stone platform with three wide stone steps in the center front. Symmetric, front view.", {'size': '1536x1024', 'setting': 'mountain'}),
    'sheet_mount': ("Objects: 1) a tall old pine tree with a dark green layered canopy and a thick trunk, 2) a slimmer cypress tree, 3) a half-broken ancient stone stele "
                    "(tall stone tablet with the top part broken off, lying slightly tilted, moss on it, weathered unreadable carving, no readable text), "
                    "4) a small clay medicine stove (a tiny brick charcoal stove with a clay herbal medicine pot on top, a fan leaning on it), "
                    "5) a large stone incense burner on a pedestal (courtyard censer), 6) a stone lantern, 7) a cluster of big grey mountain boulders with moss, "
                    "8) a single medium boulder, 9) a withered dead tree, 10) a low stone wall segment of piled field stones, 11) a small vegetable patch bed with green leafy vegetables in rows, "
                    "12) a bamboo drying rack with hanging herbs.", {'size': '1536x1024', 'setting': 'mountain'}),
    'gate_south': ("The OUTER (south-facing, outside the city) side of a Southern Song dynasty city gate of Xiangyang: a massive, tall grey brick city wall with crenellated battlements (merlons) along the top, "
                   "a slightly projecting brick gate bastion in the middle with a tall arched gate tunnel (dark opening, heavy wooden gate doors swung open inside), "
                   "and a grand two-storey gate tower building with double-eave dark blue-grey tiled roof and red posts standing on top of the wall above the arch; "
                   "no ramps (ramps are on the inner side). Symmetric front view from the south, the plain wall extends horizontally to both image edges.", {'size': '1536x1024'}),
    'moat_bridge': ("A lowered drawbridge crossing a city moat, seen from the 3/4 top-down view with the walkway running from the bottom to the top of the image (north-south): "
                    "a long, fairly flat and wide bridge of heavy wooden planks with iron bands, resting on grey stone piers, low wooden railings along the left and right sides, "
                    "at the top (north) end two thick timber posts with iron chains. Only the bridge itself, no water, no banks.", {'size': '1024x1024'}),
    'sheet_gate': ("Objects: 1) a small wooden sentry shed for gate guards with a little dark tiled roof, open front with a bench inside, 2) a tall military flag pole with a long red banner (blank, no characters), "
                   "3) a loaded two-wheeled ox cart piled with bulging salt sacks (no ox), 4) a long low wooden railing / queue barrier fence section, "
                   "5) a stone road milestone marker (blank), 6) a pair of stacked wooden travel chests with a carrying pole, "
                   "7) a small roadside wooden shelter with a thatched roof over a bench, 8) a wooden water trough for horses.", {'size': '1536x1024'}),
    'bandit_gate': ("The main gate of a mountain bandit stronghold: a heavy wooden gate of lashed logs standing open in the middle (dark opening), "
                    "flanked left and right by two tall wooden watchtowers on thick log stilts with small thatched roofs, railings and a ladder, a tattered dark flag on a pole (blank), "
                    "a short piece of sharpened-log palisade wall on each side. Rough, crude timber and rope, a few animal skulls. Symmetric front view from the south.", {'size': '1536x1024', 'setting': 'bandit'}),
    'palisade': ("A long straight palisade wall of vertical sharpened wooden logs lashed together with rope and two horizontal cross beams, some logs taller than others, "
                 "rough bark, seen from the front; uniform along its length, extends horizontally to both image edges.", {'size': '1536x1024', 'setting': 'bandit'}),
    'sheet_bandit': ("Objects: 1) a burning fire brazier (iron basin with flames) on a tall iron tripod, 2) a crude lean-to guard shed of logs with a thatched roof, "
                     "3) a stack of wine jars with red cloth covers, 4) a rack of drying animal pelts on poles, 5) a wooden signboard on a post (blank, no text) with a skull hung on it, "
                     "6) a tall dark green pine tree, 7) a cluster of large grey mountain boulders, 8) a chopping block stump with an axe stuck in it, "
                     "9) a pile of logs, 10) a wooden rack of spears and bows.", {'size': '1536x1024', 'setting': 'bandit'}),
    'cave_wall': ("The back wall of a big natural rock cave hall, seen from inside: a horizontal face of rough layered grey-brown rock with cracks, ledges and some hanging roots, "
                  "the top edge dark and irregular; uniform along its length, extends horizontally to both image edges. No floor.", {'size': '1536x1024', 'setting': 'cave'}),
    'sheet_cave': ("Objects: 1) a big wooden chieftain's armchair covered with a striped tiger skin, on a low wooden dais with two steps, 2) a burning fire brazier on an iron tripod, "
                   "3) a long rough wooden feast table with wine jars, bowls and a roast leg of meat, 4) a long rough wooden bench, "
                   "5) a stack of plundered wooden treasure chests, the top one open showing silver ingots and bolts of silk, 6) a wooden rack of broad sabres (dao) and spears, "
                   "7) a cluster of large clay wine jars, 8) a low wooden desk with open account ledger books, an abacus and an ink stone, "
                   "9) a wooden frame with a big hide map hanging on it (river lines drawn, no readable text), 10) a pile of straw and animal furs used as a bed, "
                   "11) a cluster of stalagmite rocks, 12) a single old iron-bound wooden chest.", {'size': '1536x1024', 'setting': 'cave'}),
    # ═══ 2026-09 工作流 F：渡江情节（docs/design/01 §5.5、02 §4.5b §4.5c）═══
    'ferry_boat': ("A large flat-bottomed Southern Song dynasty river ferry boat (du chuan) for carrying passengers and goods across the Han river: "
                   "a long, wide open wooden deck of weathered planks with low gunwales all around (the deck is flat and empty so people can stand on it), "
                   "a small arched woven-bamboo canopy (peng) at the stern end, a long sculling oar (yuloh) sticking out behind the stern, a coiled rope and a wooden bucket near the bow, "
                   "a raised square bow; lying horizontally (bow to the RIGHT, stern to the LEFT), seen from the classic 3/4 top-down view so the whole deck surface is visible. "
                   "About 10 times as long as a standing person is tall. Only the boat, no water, no waves, no people.", {'size': '1536x1024', 'setting': 'river'}),
    'sheet_reed': ("Objects: 1) a crude reed-thatched fishermen's lean-to shack on short wooden stilts with a reed mat door, 2) a tall bamboo lookout platform tower on four poles with a ladder and a tiny thatched roof, "
                   "3) a small narrow fast wooden skiff lying horizontally (bow to the right), empty, 4) a pile of stolen cargo: wooden crates, bales and jars under a tarred dark oilcloth tied down with rope, "
                   "5) a wooden rack of drying fish on strings, 6) a small campfire ring of stones with an iron pot, 7) a short section of wooden plank walkway boards laid on mud, "
                   "8) a row of wooden stakes stuck in mud with a torn fishing net between them, 9) a very wide dense clump of tall green-brown river reeds with plumes.", {'size': '1536x1024', 'setting': 'river'}),
}


# setting 覆盖：STYLE / SHEET 里写死的"城市街市"设定句按场景替换（S1 · 旧 5 图重建）
SETTINGS = {
    'temple': "Setting: interior of an old, poor Southern Song dynasty memorial temple hall on Mount Xian near Xiangyang (13th century); weathered timber, faded red lacquer, grey brick.",
    'mountain': "Setting: a quiet pine-covered mountainside (Mount Xian) outside Southern Song dynasty Xiangyang (13th century); grey stone, dark green pines, earthy paths.",
    'bandit': "Setting: a crude mountain bandit stronghold in the forested hills southwest of Southern Song dynasty Xiangyang (13th century); rough logs, rope, thatch, grey rock.",
    'river': "Setting: the reedy banks of the wide Han river near the Dongjin ferry east of Southern Song dynasty Xiangyang (13th century); weathered wood, reed thatch, mud, rope.",
    'cave': "Setting: a large natural rock cave used as the hideout hall of a mountain bandit gang in Southern Song dynasty China (13th century); grey-brown rock, rough timber, loot.",
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('keys', nargs='*')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--noref', action='store_true')
    ap.add_argument('--quality', default=None)
    ap.add_argument('--model', default=None)
    ap.add_argument('--suffix', default='')
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    keys = a.keys or list(PROPS)
    pj = os.path.join(OUT, 'params.json')
    log = json.load(open(pj)) if os.path.exists(pj) else {}
    jobs = []
    for k in keys:
        dst = os.path.join(OUT, k + a.suffix + '.png')
        if os.path.exists(dst) and not a.force:
            print('skip', k); continue
        desc, extra = PROPS[k]
        base = SHEET if k.startswith('sheet_') else STYLE
        extra = dict(extra); st = extra.pop('setting', None)
        if st:
            base = base.replace("Setting: Southern Song dynasty (13th century) Xiangyang city market street. ", SETTINGS[st] + " ")
            base = base.replace("Southern Song dynasty Xiangyang market. ", SETTINGS[st] + " ")
            if st != 'temple':
                base = base.replace("Look: dark blue-grey glazed ceramic tile roofs with curved eaves, cream / off-white plaster walls, warm brown timber posts and lattice windows, ", "Look: ")
        prompt = base + '\n\n' + ('Objects to draw: ' if k.startswith('sheet_') else 'The object: ') + desc
        p = dict(PARAMS); p.update(extra)
        if a.quality: p['quality'] = a.quality
        if a.model: p['model'] = a.model
        job = dict(prompt=prompt, _key=k, _dst=dst, **p)
        if not a.noref and os.path.exists(REF): job['images'] = [REF]
        jobs.append(job)
    if not jobs: return
    flatimg.load_env()

    def done(i, job, r, err):
        if err:
            print('FAIL', job['_key'], err); return
        open(job['_dst'], 'wb').write(r.png)
        log[os.path.basename(job['_dst'])[:-4]] = dict(prompt=job['prompt'], ref=bool(job.get('images')), time=time.strftime('%F %T'),
                                                         **{k: v for k, v in job.items() if k not in ('prompt', 'images') and not k.startswith('_')}, meta=r.meta)
        json.dump(log, open(pj, 'w'), ensure_ascii=False, indent=1)
        print('OK', job['_key'], r.meta.get('seconds'))
    flatimg.run_many(jobs, on_done=done)


if __name__ == '__main__':
    main()
