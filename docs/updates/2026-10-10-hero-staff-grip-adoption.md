# 萧白端握动作接入与第一章自动战斗实录

## 用户需求与入口

用户要求替换游戏，并提供第一章末尾遭遇战的自动战斗视频。工作区为 `xiaojianghu-legacy-prologue`，启动器身份核验8792通过；核对AI导入、AGENTS、正式素材清单、角色战斗规格、第一章战斗页与握棍候选来源，先建立[采用合同](../archive/design/qihe-map/hero-staff-grip-adoption.md)。

## 改动

- 新26帧版本化表正式登记，旧素材与失败源稿保留。BART的准备、普通攻击、连击改用已审端握姿势；其余状态保留原像素，仅固定平移配准。
- 增加可选身体锚点与兵器触达距离。长棍按真实棍尖位置停步；不套用短兵器贴身距离。伤害按第24帧触达开始290ms结算，收势播完整后回位。
- 第一章守路遭遇战显式允许智能自动。其他教学入口继续禁用。仍使用原策略及正常指令提交，不改变战斗数值。
- 实录入口使用已有隔离战斗保存槽；不覆盖普通旅程。第一次录制用于发现停步问题，最终视频来自修复后的第二次完整战斗。

## 验证与证据

- `python3 scripts/serve-current.py --check`：qihe-current、8792、m_qh_central身份与正式地图哈希通过。
- `python3 tools_assets/check_production.py`：876项通过。
- `node tests/battle-auto.test.cjs`：原策略、教学禁用/显式遭遇战开启、清理和过期回调通过。
- `node tests/battle-error-regression.cjs`：胜负、异常与同伴/宠物状态恢复通过。
- `node tests/hero-staff-grip.test.cjs`：调用真实BFX时序/裁切/停步函数，命中帧、290ms时序、510ms完整收势、身体锚点、脚底与长棍距离通过。函数合同不计作人工姿势生成认证。
- 浏览器实际自动守路战完成获胜；控制台警告/错误0。实际查看同屏身体高度、两脚、兵器、准备与受击过渡、命中及胜利。
- [来源与像素证据](../../art_sources/hero-staff-grip-adoption-20261010/manifest.json)、[最终录像时间戳](../../art_sources/hero-staff-grip-adoption-20261010/video-final/capture.json)、[视频](../../art_sources/hero-staff-grip-adoption-20261010/video-final/chapter1-final-auto-battle.mp4)。755张实际浏览器帧、约18.3秒、1280×720；视频30fps H264，无音轨。没有重新生成完整受击/倒地/运功包，未宣称正式IoU或隐藏骨骼认证。

## 交付状态

本地已完成；Git未提交；线上未发布。
