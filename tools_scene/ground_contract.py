"""Black Wind Fortress: visible bare ground must agree with the walk mask.

Run after changing map layout: python3 tools_scene/ground_contract.py
"""
import numpy as np

from build_scene import bgate, cave


def check(factory, material, top):
    scene = factory()
    scene.compose()
    occupied = np.zeros((scene.h, scene.w), dtype=bool)
    for item in scene.items:
        occupied |= item['fp']
    yy = np.arange(scene.h)[:, None]
    bare = (scene.mat == material) & ~occupied & (yy >= top) & (yy < 392)
    blocked = bare & ~scene.walkmask
    print(f'{scene.id}: bare={bare.sum()} blocked_without_object={blocked.sum()}')
    assert not blocked.any(), f'{scene.id}: bare ground blocked without a visible object'


if __name__ == '__main__':
    check(bgate, 4, 176)  # 寨门前草坡
    check(cave, 7, 118)   # 洞内岩地
