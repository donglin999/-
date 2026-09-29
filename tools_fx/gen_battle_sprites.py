"""战斗精灵原图生成（工作流 D，FlatRouter / gpt-image-2.5-sunburst）

每个敌人一次请求：一张 3×2 网格的"动作设定图"（6 个姿势、同一比例、侧身朝右、纯白底），
后续由 tools_fx/foe_battle.py 切分、去背、像素化、限色、描边、组表。
用法（仓库根目录）：
  python3 tools_fx/gen_battle_sprites.py bandit            # → raw_battle/D/bandit.png
  python3 tools_fx/gen_battle_sprites.py bandit --force --tag b   # → raw_battle/D/bandit_b.png（候选）
参数与提示词写入 raw_battle/D/params.json。走 tools_common/flatimg.py 异步接口，多个敌人 ≤3 并发，失败自动重试。
"""
import argparse, json, os, sys, time

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools_common'))
import flatimg  # noqa: E402  FlatRouter 异步生图客户端

OUT = 'raw_battle/D'
PARAMS = dict(model='gpt-image-2.5-sunburst', size='1536x1024', quality='high',
              background='opaque', output_format='png', n=1)

STYLE = (
    "2D side-view action game character sprite sheet, Southern Song dynasty Chinese wuxia setting. "
    "Style: detailed 16-bit SNES-era pixel art (like Octopath Traveler / Chrono Trigger battle sprites), "
    "realistic adult body proportions (about 6.5 heads tall for humans, NOT chibi, NOT big-head, small head), "
    "clean dark 1-pixel outline around the whole figure, limited palette, cel shading with light coming from the upper-left, "
    "muted earthy colors. "
    "Layout: exactly 6 poses of the SAME character arranged in a 3-column x 2-row grid, every pose at the SAME scale, "
    "each pose full body with feet visible, generous white space between poses so they do not touch or overlap, "
    "the character ALWAYS faces RIGHT (profile / three-quarter side view looking to the right side of the image). "
    "Poses in reading order: "
    "1) battle-ready stance (weapon held ready), "
    "2) attack wind-up (weapon pulled back / raised high, body coiled), "
    "3) attack strike at full extension (weapon swung forward to the right, lunging), "
    "4) hurt recoil (knocked back, leaning away to the left, grimacing), "
    "5) exhausted / broken guard: dropped to one knee, slumped, weapon lowered to the ground, "
    "6) defeated: lying collapsed on the ground on its side. "
    "Background: pure flat white #FFFFFF, no ground, no shadows, no text, no labels, no numbers, no borders, no grid lines, no effects."
)

CHARS = {
    'bandit': "a mountain bandit thug: burly muscular man, black cloth head wrap, stubble and scowling brutal face, "
              "black short jacket open at the chest over a dark red sash, dark trousers tied at the calves, straw sandals, "
              "wields a heavy broad-backed dao saber in his right hand",
    'chief':  "the bandit king 'One-Eyed Yama': huge hulking warlord much bigger than a normal man, black eye patch over one eye, "
              "thick curly beard, black lamellar leather armor with iron studs, dark crimson cape, "
              "wields an enormous ghost-head broadsword (heavy curved blade with a demon-skull pommel), menacing aura. "
              "IMPORTANT for pose 1: the broadsword rests on his right shoulder with the blade pointing up and backwards behind him, "
              "compact silhouette, the blade must NOT extend forward in front of him; only poses 2 and 3 swing it",
    'wolf':   "a large grey mountain wolf (realistic animal proportions, not cute), lean and muscular, bristling fur, "
              "yellow eyes, bared fangs; poses: 1) snarling crouched stance 2) coiled ready to pounce 3) leaping bite forward "
              "4) yelping recoil 5) staggering low, head down 6) lying on its side defeated",
    'snake':  "a giant blue-green scaled python / serpent monster, thick body with visible scales, pale belly, "
              "rearing its head and upper body high above its coils like a cobra, forked tongue, cold yellow eyes; "
              "poses: 1) reared up coiled stance 2) pulling head back to strike 3) lunging bite forward with open jaws "
              "4) recoiling in pain 5) coils sagging, head drooping to the ground 6) lying limp stretched out",
    'monk':   "an elderly Shaolin monk martial artist: bald head with ordination scars, long white eyebrows and short white beard, "
              "grey monk robe with an ochre kasaya over one shoulder, wooden prayer beads, straw sandals, "
              "fights bare-handed with palm strikes (no weapon); calm dignified posture",
    'beggar': "a Beggar Sect elder: wiry old man with messy grey hair, ragged patched brown clothes, bare shins, "
              "wine gourd at the waist, fights with a long green bamboo staff (dog-beating staff); sharp shining eyes",
    'dog':    "a loyal yellow Chinese village dog (medium size, realistic proportions, not chibi, not cute cartoon), short golden-yellow fur, "
              "pointed ears, curled tail, brave expression; poses: 1) alert growling stance 2) crouched ready to pounce 3) leaping bite forward "
              "4) yelping recoil 5) lying low exhausted, head down 6) lying on its side defeated",
    'rooster':"a huge fierce fighting rooster (angry red cockerel) drawn with REAL BIRD ANATOMY: only two wings and two scaly bird legs, "
              "absolutely NO human arms, NO hands, NO fists, NO weapons, NOT anthropomorphic; big bright red comb and wattles, "
              "glossy red-orange hackles and dark green sickle tail plumes, sharp spurs and talons, puffed chest; poses: 1) aggressive stance 2) wings flared, rearing back 3) flying kick forward with talons "
              "4) feathers ruffled recoil 5) crouched exhausted, wings drooping 6) lying on its side defeated",
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('names', nargs='*')
    ap.add_argument('--force', action='store_true')
    ap.add_argument('--tag', default='')
    a = ap.parse_args()
    flatimg.load_env()
    os.makedirs(OUT, exist_ok=True)
    log_p = os.path.join(OUT, 'params.json')
    jobs = []
    for n in a.names or list(CHARS):
        name = n + ('_' + a.tag if a.tag else '')
        out = os.path.join(OUT, name + '.png')
        if os.path.exists(out) and not a.force:
            print('跳过', out); continue
        prompt = f'{STYLE}\nCharacter: {CHARS[n]}.'
        print(f'生成 {name} ...', flush=True)
        jobs.append(dict(PARAMS, prompt=prompt, _name=name, _out=out))

    def done(i, job, r, err):
        name, out = job['_name'], job['_out']
        if err: print('  放弃', name, err); return
        open(out, 'wb').write(r.png)
        log = json.load(open(log_p)) if os.path.exists(log_p) else {}
        log[name] = dict(PARAMS, prompt=job['prompt'])
        json.dump(log, open(log_p, 'w'), ensure_ascii=False, indent=1)
        print(f'  → {out} {len(r.png) // 1024}KB {r.meta["seconds"]:.0f}s {r.meta["task_id"]}', flush=True)

    if jobs: flatimg.run_many(jobs, on_done=done)

if __name__ == '__main__':
    main()
