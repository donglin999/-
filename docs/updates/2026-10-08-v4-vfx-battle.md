# 2026-10-08 技能特效 v4：群体、BP 加强、接入战斗；秘籍提案

## 特效

- **群体多目标**：`js/wuxia-fx.js` 的编排改为从 `fx.targets()`、`fx.allies()` 取目标。焚契破阵、松涛合阵、一曲安澜会对每个目标（或每名我方成员）分别命中。评审页可演示 3 个目标。
- **BP 起手加强**：起手窗口内，手部聚气和光晕随 BP 增强；BP≥2 时脚下出现涟漪，BP3 时轻微震屏。命中火花、震屏和粒子预算随 BP 增加。评审页可切换 BP 0～3。
- **接入战斗**：新增 `js/wuxia-battle.js`，`index.html` 在 `bfx.js` 之后加载它和 `wuxia-fx.js`。
  - 有 v4 编排的招式（含 `MOVE_ALIAS` 别名）由叠加模式接管施放和命中特效，并按角色尺度缩放。伤害数字仍由战斗显示。
  - 正式招式中，金针（`jinzhen→bh_s1`）已生效。另外 7 招在控制台临时注册后验证通过，要等 v3 新招式注册进战斗后才会在正式战斗中出现。
- **测试**：`battle-weakness-status` 10/10、`battle-auto` 1/1、`combat-sim` 6/6、`martial-lineage-v3` 7/7，`battle-error-regression` 通过。
- **说明**：见 `docs/design/v4-vfx-batch1.md` §5、§6。

## 秘籍（用户确认简化版）

- **规则**：拿到书与学会分开。满足前置重数和属性门槛时，点击秘籍即学会第一重，书不消失。不做研读进度和版本区分。设计见 `docs/design/secret-manuals.md`。
- **运行时**：
  - 新增 `js/martial-manuals.js`，注册 71 本秘籍道具。
  - `jianghu-model.js` 新增 `learnManual` 动作，`jianghu-ui.js` 的行囊页加研习按钮，`menu.js` 的行囊加“秘籍”分类。
  - `build_martial_lineage_v3.py` 把 `learnReq` 和 `prereq` 写进运行时数据，并重跑了整条生成链。
- **测试**：
  - 新增 `tests/martial-manuals.test.cjs`，4/4 通过。
  - 回归测试通过：`cultivation-jianghu-modern` 7/7，以及前述战斗和功法测试。
  - `menu-icons` 因本机缺少 playwright 模块无法运行，属于环境问题。
- **浏览器实测**：
  - 前置不足、属性不足时都会被拦下，并写明原因。
  - 满足后研习成功，功法一重，书保留，再点提示“已学会”。

## 秘籍投放与封面（2026-10-08 续）

- **投放表**：`docs/design/manual-placement.md`，由 `tools_docs/build_manual_placement.py` 生成。每本门派秘籍列出本门与外派两条途径，行囊里的道具说明显示“来源”。
- **个人技能只能请教**（用户确认）：唐照雪、岑霜、徐令仪的 4 门个人功法不出秘籍，投放表中写“请教”。现在共 67 本秘籍。
- **封面图标**：
  - 由 `tools_docs/gen_manual_icons.py` 生成，`tools_docs/build_manual_icons.py` 整理。
  - 运行时小图在 `assets/ui/manuals-v1/`，图标表为 `js/martial-manual-icons.js`。
  - 新旧两个行囊界面都已接入。
- **测试**：`tests/martial-manuals.test.cjs` 6/6 通过。
