# 战斗精灵清晰度方案试验（向八方旅人 / 逸剑风云决靠）

状态：历史　最后核对：2026-10-23

> 2026-10-23 归档：用户答复“复杂技能弃用”“复杂招式弃用”“不采用的候选移到 attic”，本记录涉及的来源批次与评审页已移入 `_attic/2026-10-23-motion-candidates/`（见其中 manifest.json，`restore.sh` 可还原）。下文路径已改指归档位置。

工作区：xiaojianghu-legacy-prologue（来源批次）＋ xiaojianghu（评审页）。只出候选与模拟图，未改游戏代码与规格，未登记、未提交、未发布。

## 需求

用户：“第一章虽然大概轮廓没啥毛病，但是还是不够清晰，没能达到类似八方旅人或者是逸剑风云决的效果，我想要达成的两者类似的效果，给我一个方案然后生成一轮比对给我看”。

## 发现

- 渲染：成人身体固定约 105 世界像素，95 像素的表落到屏幕是 1.75 倍（1080p）这类非整数倍，`bfx.js` 会平滑缩放，像素边糊。
- 美术：95 像素、48 色、细节过碎，缩到战斗大小成噪点。
- 场景：人物与同色系的细碎地面分不开。

## 结果

- 第一章护路战四人，按 A（逸剑风云决向，56 像素 24 色）、B（八方旅人向，54 像素 18 色）重画并清理，另做 C（不重画只后期），在实机背景与站位上出 1920×1080 模拟图，并加一版 HD-2D 场景处理。
- 推荐 B ＋ 场景处理；方案分三步：整数倍渲染、新精灵规格、场景处理。须用户拍板后才改规格与代码。
- 详情：[_attic/2026-10-23-motion-candidates/files/xiaojianghu-legacy-prologue/art_sources/clarity-spec-trial-20261023/README.md](../../../_attic/2026-10-23-motion-candidates/files/xiaojianghu-legacy-prologue/art_sources/clarity-spec-trial-20261023/README.md)；评审页 `_attic/2026-10-23-motion-candidates/files/xiaojianghu/review/clarity-spec-trial/index.html`。

## 验证

- 8792 护路战实机截取画布确认像素被平滑。
- 8797 打开评审页：场景切换、局部放大、三组攻击动画正常，图片全部加载，控制台无错误。

## 续：和原作截图对照

- 用户要求拿八方旅人、逸剑风云决的战斗场景直接对照。对照页 `_attic/2026-10-23-motion-candidates/files/xiaojianghu/review/clarity-spec-trial/refs.html` 引用 Steam 商店官方截图地址（未下载入库），与我们的现状、B、新增的 D（34 像素 14 色 ×5）做整屏和同倍率局部对照。
- 量出原作人物约 28～36 像素高、每像素 4～5 屏幕像素、约三头身；B 是半步，D 是原作尺度，D 若要更像还需改成更 Q 的比例。
