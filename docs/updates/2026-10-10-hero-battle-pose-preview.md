> **状态（2026-10-10 标记）：** 本记录对应的战斗动作候选（`art_sources/chapter1-hero-pose-preview-20261010/`）握法已被用户否定，未采用，不启用。 不得作为画风、规格或流程的参考；正式依据与替代做法见[弃用／不启用的测试方法清单](../assets/deprecated-tests.md)。

# 2026-10-10 第一章萧白战斗动画独立对比

## 用户要求与工作区

用附件`pose-pixel-animation.zip`制作第一章主角的战斗动画供比较，暂不替换。工作区为xiaojianghu-legacy-prologue；启动器`--check`核验8792为qihe-current，当前中央图SHA-256为`29131902cd53c5a97d3367caf5e550aa5eab1fbbfe08577de2d5e3e74b1b10a4`。

核对AI导入、当前AGENTS、design目录、正式素材入口/登记、第一章战斗素材、battle-sprite-spec、anim-pipeline与附件skill/workflow/assembly；现用第一章 `hero_village` 与 `b_hero_village` 属于借衣短发木棍阶段，探索蓝灰C包已采用不表示战斗表已替换。

## 本地改动

- 先写[设计责任页](../archive/design/qihe-map/hero-battle-pose-preview.md)，原始8姿势灰度草稿与时序JSON/SVG，使用内置imagegen三次生成/局部编辑，保留提示词及所有候选。
- 先后纠正大头体型、木棍长度；用等长棍握点图改约束。最后剔除不佳姿势，选5个独立关键姿势、6段曝光，1070ms压身进步直刺。首尾复用同一准备帧；触达与随势以同帧停留表示。
- 共同缩放、后脚配准、32色、硬透明与3×最近邻；不程序绘制最终人物，不逐帧按包围盒缩放。Aseprite 1.3.18.6-dev通过skill自带打包器输出PNG/JSON/可编辑工程。
- 新增[并排动画页](http://127.0.0.1:8792/review/chapter1-hero-pose-preview-20261010/index.html)、GIF、逐帧图及来源记录。没有更改实际游戏入口、剧情、存档或战斗注册。

## 验证

- Aseprite组装通过：6帧、1标签、384×264单元、1152×528图集，32色，alpha仅0/255；标签、时长和源/导出可见像素等价。
- 实际使用源格覆盖、源哈希、共同倍率、非空及安全边界、精确3×网格、首尾同像素检查通过。可见木棍端点最长/最短比1.0436；是人工代理，不认证隐藏骨长。
- 真实浏览器加载旧表、新图集和JSON；验证原速与0.25×、暂停、重播、上/下帧、时间控制、1×与3×显示、深浅底。六段DOM状态与原生截图留在批次browser目录；控制台warn/error为0。测试发现控件label匹配问题后加明确aria-label并重测通过。
- `node --check review/chapter1-hero-pose-preview-20261010/preview.js`通过。
- `python3 tools_assets/check_production.py`通过：696项，0错误。正式 `b_hero_village` 原哈希未改变。

## 采用、未验证与交付

仅独立候选预览。初版/第二版未直接打包，第三版坏格保留而不采用；正式素材没有替换。未做完整动作包、项目正式姿势IoU/关节误差验收、游戏命中窗口/伤害/碰撞验证、实体设备测试。

底层实际模型未披露；所有提示词按项目约定请求gpt-image-2.5，不伪称工具已验证这个模型。未调用用户API。

本地完成；没有Git提交、推送或线上发布。页面作为本轮交付保持打开。
