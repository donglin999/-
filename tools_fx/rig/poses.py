"""动作关键帧库（工作流 E，docs/anim-pipeline.md §2）
POSES[set][名] = 关节角字典（语义见 rig.py，按"朝右"书写，朝左由 fk 镜像）
ACTIONS[set][动作] = dict(frames=[帧…], ms=…, loop=…, hit=…)
  帧 = 姿势名（生图帧）或 ('bob', 姿势名, dy) / ('lean', 姿势名, k) / ('air', 姿势名, dy)（由生成帧程序派生的小位移帧：
  呼吸、喘息、前倾 1–2 像素这类微动作不值得让模型重画，重画反而引入细节漂移）
CHARS[角色] = 骨骼参数与动作集。
"""
from rig import Body

# ───────── 人形·长剑（主角） ─────────
SWORD = dict(
    guard=dict(lean=6, head=-4, aN=[50, 42, 8], wpn=-18, aF=[35, 95, 0], lN=[20, 16, 0], lF=[-20, 18, 0]),
    dash0=dict(lean=30, head=-24, aN=[-35, 55, 0], wpn=78, aF=[55, 85, 0], lN=[62, 80, 0], lF=[-38, 38, 40]),
    dash1=dict(lean=32, head=-26, aN=[-45, 45, 0], wpn=80, aF=[35, 90, 0], lN=[-24, 60, 50], lF=[50, 60, 0], air=2),
    wind=dict(lean=-12, head=-4, aN=[200, 45, 0], wpn=-75, aF=[192, 52, 0], lN=[28, 24, 0], lF=[-26, 26, 0]),
    strike=dict(lean=18, head=-14, aN=[112, 4, 0], wpn=-4, aF=[-45, 25, 0], lN=[62, 72, 0], lF=[-48, 4, 20]),
    follow=dict(lean=30, head=4, aN=[70, 0, 0], wpn=-40, aF=[-55, 35, 0], lN=[66, 80, 0], lF=[-46, 6, 20]),
    back=dict(lean=10, head=-2, aN=[40, 30, 6], wpn=-22, aF=[25, 80, 0], lN=[26, 22, 0], lF=[-24, 18, 0]),
    chamber=dict(lean=-4, head=-6, aN=[-22, 108, 0], wpn=0, aF=[45, 75, 0], lN=[18, 14, 0], lF=[-28, 22, 0]),
    thrust=dict(lean=22, head=-18, aN=[112, 0, 0], wpn=0, aF=[-62, 12, 0], lN=[64, 76, 0], lF=[-50, 4, 20]),
    hurt=dict(lean=-24, head=-18, aN=[-18, 35, 0], wpn=-60, aF=[72, 40, 0], lN=[28, 14, 0], lF=[-8, 28, 0]),
    cast=dict(lean=0, head=6, aN=[60, 95, 0], wpn=65, aF=[72, 84, 0], lN=[4, 4, 0], lF=[-5, 4, 0]),   # 横剑胸前、剑指抹剑
    kneel=dict(lean=24, head=28, aN=[72, 12, 0], wpn=58, aF=[25, 45, 0], lN=[82, 88, 0], lF=[-8, 104, 40]),
    dead=dict(lean=0, head=-10, aN=[12, 6, 0], wpn=0, aF=[-8, 10, 0], lN=[10, 16, 80], lF=[-4, 20, 80], lie=88),
    win=dict(lean=-2, head=-6, aN=[-6, 8, 0], wpn=172, aF=[20, 118, 0], lN=[8, 4, 0], lF=[-8, 4, 0]),   # 收剑：反手持剑贴臂后，另一手立掌胸前
)

# ───────── 人形·银针（苏芷） ─────────
NEEDLE = dict(
    guard=dict(lean=4, head=-2, aN=[58, 92, 0], wpn=-40, aF=[8, 28, 0], lN=[12, 10, 0], lF=[-12, 12, 0]),
    dash0=dict(lean=24, head=-16, aN=[-40, 60, 0], wpn=40, aF=[40, 80, 0], lN=[48, 62, 0], lF=[-34, 34, 0]),
    dash1=dict(lean=26, head=-18, aN=[-30, 50, 0], wpn=40, aF=[20, 80, 0], lN=[-18, 45, 0], lF=[40, 48, 0], air=2),
    wind=dict(lean=-12, head=-4, aN=[212, 60, 0], wpn=-20, aF=[60, 30, 0], lN=[22, 14, 0], lF=[-22, 18, 0]),
    strike=dict(lean=16, head=-10, aN=[104, 0, 0], wpn=-10, aF=[-35, 25, 0], lN=[42, 45, 0], lF=[-36, 6, 0],
                proj=[(12, -2, 0), (16, -5, -8), (15, 1, 6)]),
    follow=dict(lean=24, head=0, aN=[34, 8, 0], wpn=-10, aF=[-40, 30, 0], lN=[44, 50, 0], lF=[-34, 6, 0]),
    back=dict(lean=8, head=-2, aN=[50, 70, 0], wpn=-40, aF=[10, 30, 0], lN=[16, 14, 0], lF=[-16, 12, 0]),
    chamber=dict(lean=-6, head=-4, aN=[-30, 120, 0], wpn=-30, aF=[50, 70, 0], lN=[16, 12, 0], lF=[-20, 16, 0]),
    thrust=dict(lean=14, head=-10, aN=[96, 20, 0], wpn=-10, aF=[-30, 30, 0], lN=[34, 36, 0], lF=[-30, 6, 0],
                proj=[(10, -4, -10), (13, 0, 0)]),
    hurt=dict(lean=-22, head=-16, aN=[95, 90, 0], wpn=-50, aF=[-25, 30, 0], lN=[24, 12, 0], lF=[-8, 26, 0]),
    cast=dict(lean=0, head=10, aN=[42, 112, 0], wpn=-80, aF=[46, 112, 0], lN=[3, 3, 0], lF=[-3, 3, 0]),
    kneel=dict(lean=22, head=30, aN=[40, 10, 0], wpn=60, aF=[20, 60, 0], lN=[82, 90, 0], lF=[-6, 112, 30]),
    dead=dict(lean=0, head=-10, aN=[14, 10, 0], wpn=0, aF=[-6, 10, 0], lN=[10, 10, 80], lF=[-4, 16, 80], lie=88),
    win=dict(lean=-2, head=-8, aN=[34, 138, 0], wpn=-6, aF=[10, 60, 0], lN=[10, 6, 0], lF=[-10, 6, 0]),
)

# 动作（两套共用同一时序结构）
ACTIONS = dict(
    idle=dict(frames=['guard', ('bob', 'guard', 1), ('bob', 'guard', 2), ('lean', 'guard', -1)],
              seq=[0, 1, 2, 1, 0, 3], ms=[200, 180, 220, 180, 200, 240], loop=True),
    dash=dict(frames=['dash0', 'dash1'], ms=[90, 120]),
    atk=dict(frames=['wind', 'strike', 'follow', 'back'], ms=[150, 70, 170, 130], hit=1),
    atk2=dict(frames=['chamber', 'thrust', 'back'], ms=[80, 70, 150], hit=1),
    hurt=dict(frames=['hurt'], ms=320),
    cast=dict(frames=['cast', ('bob', 'cast', 1)], ms=[260, 260]),
    brk=dict(frames=['kneel', ('bob', 'kneel', 1)], ms=[420, 420], loop=True),
    dead=dict(frames=['hurt', 'kneel', 'dead'], ms=[140, 160, 400]),
    win=dict(frames=['win', ('bob', 'win', 1), 'win'], ms=[240, 280, 400]),
)

CHARS = dict(
    hero=dict(body=dict(H=64, heads=6.0, build='m', weapon=dict(kind='sword', len=3.0 * 64 / 6, grip=.16, hand='N')),
              poses=SWORD, facing='l'),
    suzhi=dict(body=dict(H=62, heads=6.0, build='f', weapon=dict(kind='needle', len=.55 * 62 / 6, grip=0, hand='N')),
               poses=NEEDLE, facing='l'),
)


def body_of(char):
    b = CHARS[char]['body']
    kind = CHARS[char].get('kind', 'human')
    if kind != 'human':
        import rig_beast
        return rig_beast.BODIES[kind](**b)
    return Body(**b)


def actions_of(char):
    return CHARS[char].get('actions', ACTIONS)


def unique_poses(char):
    """该角色需要生图的姿势（按首次出现顺序）"""
    seen = []
    for a in actions_of(char).values():
        for f in a['frames']:
            n = f if isinstance(f, str) else f[1]
            if n not in seen: seen.append(n)
    return seen


# ═════════ 工作流 I：敌人 / 动物（朝右书写，敌方 facing='r' 不镜像；dog 为我方 facing='l'） ═════════
# 人形敌人动作：12 个生图姿势（dash 只生成 dash0，腾空帧程序上提派生），3 张 2×2 网格
FOE_ACTIONS = dict(
    idle=dict(frames=['guard', ('bob', 'guard', 1), ('bob', 'guard', 2), ('lean', 'guard', -1)],
              seq=[0, 1, 2, 1, 0, 3], ms=[200, 180, 220, 180, 200, 240], loop=True),
    dash=dict(frames=['dash0', ('air', 'dash0', 2)], ms=[90, 120]),
    atk=dict(frames=['wind', 'strike', 'follow', 'back'], ms=[160, 70, 170, 130], hit=1),
    atk2=dict(frames=['chamber', 'thrust', 'back'], ms=[90, 70, 150], hit=1),
    hurt=dict(frames=['hurt'], ms=320),
    cast=dict(frames=['cast', ('bob', 'cast', 1)], ms=[260, 260]),
    brk=dict(frames=['kneel', ('bob', 'kneel', 1)], ms=[420, 420], loop=True),
    dead=dict(frames=['hurt', 'kneel', 'dead'], ms=[140, 160, 400]),
)
FOE_GRIDS = {
    'atk':  dict(poses=['wind', 'strike', 'follow', 'back'], cols=2, rows=2),
    'base': dict(poses=['guard', 'hurt', 'cast', 'dead'], cols=2, rows=2),
    'move': dict(poses=['dash0', 'chamber', 'thrust', 'kneel'], cols=2, rows=2),
}

# 通用受击 / 跪地 / 倒地（武器角各自覆盖）
_HURT = dict(lean=-24, head=-18, aN=[-18, 35, 0], aF=[72, 40, 0], lN=[28, 14, 0], lF=[-8, 28, 0])
_KNEEL = dict(lean=24, head=28, aN=[72, 12, 0], aF=[25, 45, 0], lN=[82, 88, 0], lF=[-8, 104, 40])
_DEAD = dict(lean=0, head=-10, aN=[12, 6, 0], aF=[-8, 10, 0], lN=[10, 16, 80], lF=[-4, 20, 80], lie=88)

# ───────── 山贼：厚背大刀（单手，劈砍） ─────────
SABER = dict(
    guard=dict(lean=10, head=-6, aN=[38, 48, 0], wpn=-62, aF=[40, 80, 0], lN=[30, 34, 0], lF=[-26, 30, 0]),
    dash0=dict(lean=30, head=-24, aN=[-30, 40, 0], wpn=60, aF=[55, 85, 0], lN=[62, 80, 0], lF=[-38, 38, 40]),
    wind=dict(lean=-10, head=-6, aN=[190, 50, 0], wpn=-60, aF=[60, 70, 0], lN=[30, 28, 0], lF=[-26, 26, 0]),
    strike=dict(lean=24, head=-14, aN=[100, 10, 0], wpn=18, aF=[-40, 30, 0], lN=[62, 72, 0], lF=[-46, 6, 20]),
    follow=dict(lean=32, head=0, aN=[40, 10, 0], wpn=-60, aF=[-50, 35, 0], lN=[66, 80, 0], lF=[-46, 6, 20]),
    back=dict(lean=12, head=-4, aN=[45, 40, 0], wpn=-60, aF=[30, 80, 0], lN=[30, 28, 0], lF=[-24, 22, 0]),
    chamber=dict(lean=-4, head=-6, aN=[-40, 100, 0], wpn=-40, aF=[50, 70, 0], lN=[20, 16, 0], lF=[-28, 22, 0]),
    thrust=dict(lean=24, head=-16, aN=[92, 0, 0], wpn=-26, aF=[-55, 20, 0], lN=[64, 76, 0], lF=[-50, 4, 20]),
    hurt=dict(_HURT, wpn=-40),
    cast=dict(lean=6, head=-4, aN=[30, 150, 0], wpn=-76, aF=[60, 60, 0], lN=[36, 40, 0], lF=[-30, 34, 0]),  # 刀扛肩、马步蓄力
    kneel=dict(_KNEEL, wpn=-20),
    dead=dict(_DEAD, wpn=0),
)

# ───────── 独眼阎罗：鬼头大刀（双手重劈），头目蓄力 = cast（大刀后拖、沉身蓄力） ─────────
GHOST = dict(
    guard=dict(lean=4, head=-4, aN=[34, 150, 0], wpn=-44, aF=[40, 90, 0], lN=[22, 22, 0], lF=[-22, 20, 0]),     # 刀扛右肩，刃朝后上
    dash0=dict(lean=26, head=-20, aN=[-20, 40, 0], wpn=40, aF=[50, 80, 0], lN=[58, 76, 0], lF=[-36, 34, 30]),
    wind=dict(lean=-12, head=-8, aN=[185, 60, 0], wpn=-60, aF=[170, 70, 0], lN=[28, 26, 0], lF=[-24, 22, 0], hand='N'),
    strike=dict(lean=26, head=-12, aN=[88, 8, 0], wpn=10, aF=[80, 20, 0], lN=[58, 70, 0], lF=[-44, 6, 20]),
    follow=dict(lean=34, head=2, aN=[30, 8, 0], wpn=-60, aF=[28, 16, 0], lN=[62, 78, 0], lF=[-44, 6, 20]),
    back=dict(lean=8, head=-4, aN=[36, 146, 0], wpn=-46, aF=[40, 90, 0], lN=[26, 26, 0], lF=[-24, 22, 0]),
    chamber=dict(lean=8, head=-6, aN=[-30, 60, 0], wpn=-20, aF=[-20, 70, 0], lN=[26, 26, 0], lF=[-28, 24, 0]),
    thrust=dict(lean=22, head=-12, aN=[78, 0, 0], wpn=-34, aF=[70, 10, 0], lN=[60, 72, 0], lF=[-46, 6, 20]),   # 横扫
    hurt=dict(_HURT, wpn=-60),
    cast=dict(lean=18, head=-14, aN=[-45, 30, 0], wpn=10, aF=[60, 90, 0], lN=[46, 60, 0], lF=[-40, 36, 0]),    # 蓄力：刀拖身后、弓步沉身
    kneel=dict(_KNEEL, wpn=-10),
    dead=dict(_DEAD, wpn=0),
)

# ───────── 老僧：徒手掌法 ─────────
PALM = dict(
    guard=dict(lean=4, head=-2, aN=[78, 60, -70], aF=[30, 105, 0], lN=[24, 22, 0], lF=[-22, 20, 0]),     # 单掌立胸前
    dash0=dict(lean=26, head=-18, aN=[-40, 60, 0], aF=[40, 90, 0], lN=[56, 70, 0], lF=[-36, 34, 30]),
    wind=dict(lean=-8, head=-2, aN=[-30, 110, 0], aF=[70, 50, -60], lN=[26, 26, 0], lF=[-26, 24, 0]),     # 掌收腰间
    strike=dict(lean=18, head=-10, aN=[92, 0, -75], aF=[-30, 100, 0], lN=[58, 66, 0], lF=[-44, 6, 20]),  # 推掌
    follow=dict(lean=22, head=-6, aN=[80, 10, -60], aF=[-30, 90, 0], lN=[60, 70, 0], lF=[-44, 6, 20]),
    back=dict(lean=6, head=-2, aN=[70, 70, -70], aF=[25, 100, 0], lN=[26, 24, 0], lF=[-22, 20, 0]),
    chamber=dict(lean=-4, head=-4, aN=[20, 130, 0], aF=[20, 130, 0], lN=[20, 18, 0], lF=[-24, 20, 0]),   # 双掌收胸
    thrust=dict(lean=16, head=-8, aN=[88, 0, -75], aF=[84, 6, -75], lN=[56, 64, 0], lF=[-44, 6, 20]),    # 双掌齐推
    hurt=dict(_HURT),
    cast=dict(lean=2, head=8, aN=[10, 128, -20], aF=[12, 126, -20], lN=[4, 4, 0], lF=[-5, 4, 0]),          # 合十
    kneel=dict(_KNEEL),
    dead=dict(_DEAD),
)

# ───────── 丐帮长老：竹棒（打狗棒，握中段） ─────────
STAFF = dict(
    guard=dict(lean=8, head=-4, aN=[48, 40, 0], wpn=12, aF=[55, 70, 0], lN=[28, 30, 0], lF=[-24, 26, 0]),     # 棒斜指前下
    dash0=dict(lean=30, head=-22, aN=[20, 50, 0], wpn=-30, aF=[40, 80, 0], lN=[60, 78, 0], lF=[-38, 36, 40]),
    wind=dict(lean=-10, head=-6, aN=[185, 40, 0], wpn=-80, aF=[160, 60, 0], lN=[28, 26, 0], lF=[-24, 24, 0]),  # 举棒过顶
    strike=dict(lean=24, head=-12, aN=[100, 10, 0], wpn=26, aF=[70, 30, 0], lN=[60, 70, 0], lF=[-44, 6, 20]), # 下劈
    follow=dict(lean=28, head=-4, aN=[60, 20, 0], wpn=-20, aF=[40, 40, 0], lN=[62, 76, 0], lF=[-44, 6, 20]),
    back=dict(lean=8, head=-4, aN=[50, 40, 0], wpn=12, aF=[55, 70, 0], lN=[28, 28, 0], lF=[-24, 24, 0]),
    chamber=dict(lean=-6, head=-4, aN=[-10, 100, 0], wpn=-10, aF=[40, 80, 0], lN=[22, 20, 0], lF=[-28, 22, 0]),
    thrust=dict(lean=26, head=-16, aN=[96, 0, 0], wpn=-20, aF=[60, 30, 0], lN=[64, 76, 0], lF=[-50, 4, 20]),   # 平棒直戳
    hurt=dict(_HURT, wpn=-40),
    cast=dict(lean=0, head=4, aN=[40, 60, 0], wpn=100, aF=[50, 110, 0], lN=[6, 6, 0], lF=[-6, 6, 0]),         # 拄棒调息
    kneel=dict(_KNEEL, wpn=-40),
    dead=dict(_DEAD, wpn=18),
)

_FOE = lambda poses, body, **kw: dict(kind='human', body=body, poses=poses, facing='r', actions=FOE_ACTIONS, grids=FOE_GRIDS, **kw)
CHARS.update(
    bandit=_FOE(SABER, dict(H=62, heads=6.3, build='m', bulk=1.18, weapon=dict(kind='saber', len=3.0 * 62 / 6.3, grip=.14, hand='N')),
                tier='minion', colors=26, cell_art=100),
    chief=_FOE(GHOST, dict(H=104, heads=6.2, build='m', bulk=1.4, cape=True,
                           weapon=dict(kind='ghost', len=3.0 * 104 / 6.2, grip=.18, hand='N')),
               tier='boss', colors=36, cell_art=165),
    monk=_FOE(PALM, dict(H=58, heads=6.2, build='m', bulk=1.05, robe=.7), tier='minion', colors=26, cell_art=96),
    beggar=_FOE(STAFF, dict(H=60, heads=6.3, build='m', bulk=.94, weapon=dict(kind='staff', len=5.6 * 60 / 6.3, grip=.42, hand='N')),
                tier='elite', colors=28, cell_art=100),
)


def grids_of(char, default=None):
    return CHARS[char].get('grids', default)


# ───────── 四足（狼 / 大黄） ─────────
QUAD_ACTIONS = dict(
    idle=dict(frames=['stand', ('bob', 'stand', 1), ('bob', 'stand', 2), ('lean', 'stand', -1)],
              seq=[0, 1, 2, 1, 0, 3], ms=[200, 180, 220, 180, 200, 240], loop=True),
    dash=dict(frames=['run', ('air', 'run', 2)], ms=[90, 120]),
    atk=dict(frames=['crouch', 'leap', 'bite', 'stand'], ms=[150, 90, 170, 130], hit=2),     # 蓄 → 扑 → 咬 → 收
    atk2=dict(frames=['crouch', 'bite', 'stand'], ms=[90, 150, 130], hit=1),
    hurt=dict(frames=['hurt'], ms=320),
    cast=dict(frames=['crouch', ('bob', 'crouch', 1)], ms=[260, 260]),                          # 伏身低吼
    brk=dict(frames=['low', ('bob', 'low', 1)], ms=[420, 420], loop=True),
    dead=dict(frames=['hurt', 'low', 'dead'], ms=[140, 160, 400]),
)
QUAD = dict(
    stand=dict(dy=1, pitch=2, neck=-22, head=30, jaw=8, tail=[-38, -8, -4], fN=[8, 0, 0], fF=[-10, 4, 0],
               hN=[22, 70, 62], hF=[38, 72, 60]),
    run=dict(dy=0, pitch=-2, neck=-8, head=18, jaw=0, tail=[-10, -4, 0], fN=[55, 30, 30], fF=[20, 80, 60],
             hN=[-20, 60, 30], hF=[-45, 40, 10], air=1),
    crouch=dict(dy=6, pitch=-8, neck=-8, head=28, jaw=18, tail=[-30, -6, 0], fN=[40, -30, 0], fF=[20, -10, 0],
                hN=[40, 100, 90], hF=[50, 100, 88]),
    leap=dict(pitch=6, neck=-10, head=14, jaw=40, tail=[-2, 4, 4], fN=[85, 10, 20], fF=[70, 30, 20],
              hN=[-50, 20, 0], hF=[-65, 12, 0], air=7),
    bite=dict(dy=3, pitch=-10, neck=4, head=16, jaw=38, tail=[-20, -4, 0], fN=[50, -20, 0], fF=[30, 10, 0],
              hN=[10, 70, 55], hF=[-15, 60, 40]),
    hurt=dict(dx=-2, dy=0, pitch=16, neck=-45, head=-10, jaw=30, tail=[-50, -10, 0], fN=[30, 60, 30], fF=[5, 20, 0],
              hN=[30, 80, 70], hF=[45, 85, 70]),
    low=dict(dy=9, pitch=-6, neck=22, head=8, jaw=0, tail=[-50, -8, 0], fN=[70, -60, 0], fF=[60, -50, 0],
             hN=[70, 130, 100], hF=[75, 130, 100]),
    dead=dict(dy=12, pitch=0, neck=25, head=20, jaw=10, tail=[-5, -5, 0], fN=[88, 10, 0], fF=[70, 20, 0],
              hN=[-80, 20, 0], hF=[-60, 30, 0]),
)
QUAD_G = {'atk': dict(poses=['crouch', 'leap', 'bite', 'run'], cols=2, rows=2),
          'base': dict(poses=['stand', 'hurt', 'low', 'dead'], cols=2, rows=2)}

# ───────── 禽（斗鸡） ─────────
BIRD_ACTIONS = dict(
    idle=dict(frames=['stand', ('bob', 'stand', 1), ('bob', 'stand', 2), ('lean', 'stand', -1)],
              seq=[0, 1, 2, 1, 0, 3], ms=[200, 180, 220, 180, 200, 240], loop=True),
    dash=dict(frames=['run', ('air', 'run', 2)], ms=[90, 120]),
    atk=dict(frames=['rear', 'peck', 'stand'], ms=[180, 80, 200], hit=1),       # 扬翅后仰 → 啄
    atk2=dict(frames=['rear', 'kick', 'stand'], ms=[120, 80, 200], hit=1),      # 扑腾飞踢
    hurt=dict(frames=['hurt'], ms=320),
    cast=dict(frames=['rear', ('bob', 'rear', 1)], ms=[260, 260]),
    brk=dict(frames=['low', ('bob', 'low', 1)], ms=[420, 420], loop=True),
    dead=dict(frames=['hurt', 'low', 'dead'], ms=[140, 160, 400]),
)
BIRD = dict(
    stand=dict(pitch=12, neck=[12, 4], head=0, beak=0, wingN=[4, 0], wingF=[8, 0], tail=0, lN=[-14, -34], lF=[-26, -26]),
    run=dict(pitch=-10, neck=[50, 20], head=6, beak=10, wingN=[25, .5], wingF=[35, .4], tail=-15, lN=[20, -50], lF=[-40, -10], air=1),
    rear=dict(pitch=30, neck=[-18, -12], head=-10, beak=12, wingN=[70, 1], wingF=[80, 1], tail=10, lN=[-24, -30], lF=[-36, -24]),
    peck=dict(pitch=-24, neck=[80, 40], head=26, beak=26, wingN=[20, .5], wingF=[30, .4], tail=-20, lN=[-4, -40], lF=[-44, -12]),
    kick=dict(pitch=34, neck=[-6, -8], head=4, beak=20, wingN=[95, 1], wingF=[105, 1], tail=0, lN=[70, -30], lF=[50, -20], air=10),
    hurt=dict(dx=-2, pitch=40, neck=[-40, -20], head=-30, beak=30, wingN=[60, .8], wingF=[40, .8], tail=25, lN=[-10, -40], lF=[-40, -10]),
    low=dict(dy=8, pitch=-6, neck=[70, 60], head=40, beak=0, wingN=[-20, .3], wingF=[-15, .3], tail=-35, lN=[40, -130], lF=[30, -130]),
    dead=dict(pitch=-10, neck=[105, 15], head=70, beak=14, wingN=[-5, .9], wingF=[10, .7], tail=-70, lN=[92, 0], lF=[80, 5]),   # 扑倒：颈贴地、双爪僵直前伸、翅摊开
)
BIRD_G = {'atk': dict(poses=['rear', 'peck', 'kick', 'run'], cols=2, rows=2),
          'base': dict(poses=['stand', 'hurt', 'low', 'dead'], cols=2, rows=2)}

# ───────── 蛇（样条链） ─────────
from rig_beast import coil as _coil  # noqa: E402
SNAKE_ACTIONS = dict(
    idle=dict(frames=['coil', ('bob', 'coil', 1), ('bob', 'coil', 2), ('lean', 'coil', -1)],
              seq=[0, 1, 2, 1, 0, 3], ms=[220, 200, 240, 200, 220, 260], loop=True),
    dash=dict(frames=['slither', ('bob', 'slither', 1)], ms=[100, 120]),
    atk=dict(frames=['rear', 'strike', 'coil'], ms=[200, 90, 220], hit=1),      # 后缩 → 扑咬
    atk2=dict(frames=['rear', 'wrap', 'coil'], ms=[140, 200, 220], hit=1),      # 缠绕
    hurt=dict(frames=['hurt'], ms=320),
    cast=dict(frames=['rear', ('bob', 'rear', 1)], ms=[260, 260]),
    brk=dict(frames=['low', ('bob', 'low', 1)], ms=[420, 420], loop=True),
    dead=dict(frames=['hurt', 'low', 'dead'], ms=[140, 160, 400]),
)
_BASE = _coil(-4, -6, 18, 5.5, 150, 720, dy=-10, drx=-5)       # 盘两圈，终点在右前方
SNAKE = dict(
    coil=dict(pts=_BASE + [[8, -20], [2, -34], [-4, -46], [0, -58], [8, -64]], head=12),
    rear=dict(pts=_BASE + [[8, -22], [0, -38], [-10, -50], [-12, -62], [-6, -70]], head=20, jaw=20),
    strike=dict(pts=_BASE + [[20, -18], [32, -26], [44, -30], [56, -28]], head=10, jaw=45),
    wrap=dict(pts=_BASE + [[18, -18], [28, -30], [40, -40], [48, -32], [44, -22], [34, -22], [30, -32, 1], [36, -44, 1],
                           [46, -48], [56, -44]], head=10, jaw=35),
    slither=dict(pts=[[-44, -2], [-34, -5], [-24, -2], [-14, -6], [-4, -2], [6, -6], [16, -3], [26, -8], [34, -12]], head=10, jaw=0),
    hurt=dict(pts=_BASE + [[6, -22], [-2, -36], [-14, -46], [-22, -52]], head=-40, jaw=35),
    low=dict(pts=_coil(-4, -4, 17, 3.5, 150, 720, dy=-4, drx=-3) + [[16, -8], [24, -8], [32, -4]], head=16, jaw=0),
    dead=dict(pts=[[-46, -2], [-36, -4], [-26, -2], [-14, -4], [-2, -2], [10, -4], [22, -2], [32, -3]], head=6, jaw=10),
)
SNAKE_G = {'atk': dict(poses=['rear', 'strike', 'wrap', 'slither'], cols=2, rows=2),
           'base': dict(poses=['coil', 'hurt', 'low', 'dead'], cols=2, rows=2)}

QJ = ['head', 'nose', 'pawFN', 'pawHN', 'pawFF', 'pawHF', 'tail']
CHARS.update(
    wolf=dict(kind='quad', body=dict(H=36, s=1.0, tail='hang'), poses=QUAD, facing='r', actions=QUAD_ACTIONS, grids=QUAD_G,
              tier='minion', colors=24, cell_art=62, qa_joints=QJ),
    dog=dict(kind='quad', body=dict(H=30, s=.8, tail='curl', ears=.85, snout=.85), poses=dict(QUAD, stand=dict(QUAD['stand'], tail=[40, 50, 40], jaw=0),
             run=dict(QUAD['run'], tail=[30, 40, 30]), crouch=dict(QUAD['crouch'], tail=[20, 40, 30])),
             facing='l', actions=QUAD_ACTIONS, grids=QUAD_G, tier='party', colors=24, cell_art=52, qa_joints=QJ),
    rooster=dict(kind='bird', body=dict(H=50, s=1.0), poses=BIRD, facing='r', actions=BIRD_ACTIONS, grids=BIRD_G,
                 tier='elite', colors=28, cell_art=78, qa_joints=['head', 'beak', 'toeN', 'toeF', 'tail']),
    snake=dict(kind='snake', body=dict(H=71, s=1.0, thick=9.0), poses=SNAKE, facing='r', actions=SNAKE_ACTIONS, grids=SNAKE_G,
               tier='elite', colors=28, cell_art=100, qa_joints=['head', 'snout', 'tail']),
)

for _c in ('bandit', 'chief', 'monk', 'beggar', 'wolf', 'dog', 'rooster', 'snake'):
    CHARS[_c]['sc_max'] = 1.62          # 生成图常比白模小，配准缩放放宽到 1.6
CHARS['chief']['can_w'] = 240
CHARS['chief']['qa_th'] = dict(spill=.30)      # 披风随动作外飘，白模只画了贴身披风
