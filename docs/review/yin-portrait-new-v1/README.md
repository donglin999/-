# 殷红缨全身立绘重画 · 第一版

状态：等用户选　日期：2026-11-09

- 问题：现行立绘（`portraits/yinhongying.webp`、对话 `p_gy_yinhongying*.webp` 六张，原图 `xiaojianghu-legacy-prologue/art_sources/guiyun-inkcloud-cn-20261008/yin/p_gy_yinhongying_cn.png`）另一条腿只画了一截黑靴筒，没有膝盖和大腿，看起来只有一条腿。用户 11-09 指出。
- 先试过在原图上局部修腿（`../yin-legs-fix-v1/`，只换下半身），用户说“重新生成一张吧，不要在原图上继续纠结”，改为整张重画。
- 做法：`prompt.txt`，参考图只给原图对照脸、发型、身材、服装款式；明确要求两条腿结构完整、双脚落地、双手五指；透明底直出（`--opaque-fix`）。四张候选在 `raw/`，总览 `_sheet.jpg`（最左是原图），腿部放大 `_legs.jpg`。四张两条腿都完整。
- 背景板试样暂用 new1。选定后还要：六张对话表情按新图重出，菜单立绘和对话立绘一起替换，地图小人不受影响。
