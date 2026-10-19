# OC.11：萧白便衣四向走跑整改

状态：历史　最后核对：2026-10-19（2026-10-19 归档，只供追溯）

2026-10-04。当前默认动作已改为 OC.11。范围是开始部分的萧白便衣；叶蘅沿用已有素材，现代装保持固定演出。旧 OC.7～OC.10 仅保留显式对照入口。

入口：[动作与地图 GIF](../../../review/motion-oc11/index.html) · [本地技术检查](../../../review/motion-oc11/report.json) · [目视记录与限制](../../../review/motion-oc11/visual-review.json) · [生成来源及提示词索引](../../../art_sources/opening_motion_oc11/generation-manifest.json)。

## 制作与修复

1. 使用原 grid94 定妆与私人身体比例，程序输出四向走／跑白模、关节和接触相位。
2. 每批实际传入包含「同方向定妆＋4 个白模」的参考板，通过生图生成角色帧。共 64 帧；提示词、参考哈希、候选及局部重生成记录均保留。
3. 逐帧沿用原覆盖、溢出、腿部、关节及颜色门槛。向右跑后半循环、向左跑前半循环、正面跑后半循环曾失败，重新生成修复；没有降低验收阈值，也没有用身体零件拼接替代生成帧。
4. 配准、去背、采样后导出透明图集。旧 94 行画布会裁切向前伸出的鞋，扩为 **106 逻辑行、318 源像素高**；仍采用整数 3 倍像素、相同身体尺寸和 `footY=264`。这只是透明画布留边，不能当成角色放大或清晰度升级。
5. 运行按实际位移推进动作。走跑／转向时保持当前左右脚相位；停止时归零。步行与奔跑使用独立姿态，跑步包含前倾、屈肘和腾空。

本轮白模先做了独立姿态与关节检查，地图叠合复核在候选帧生成后补做；因此不能把本轮记录说成已经完整执行了“地图白模先验再生成”的顺序。后续新动作仍必须按[正式管线](../../anim-pipeline.md)先完成地图白模门。

## 地图与节奏

| 项目 | 当前值 |
|---|---:|
| 人物可见高度 | 92 世界单位，地图缩放后约 77 屏幕像素 |
| 步行水平速度／循环 | 115.48 世界单位／秒；420ms |
| 奔跑水平速度／循环 | 262.60 世界单位／秒；380ms |
| 水平周期位移 | 步行 48.50；跑步 99.79 |
| 纵向投影系数 | 0.5，与这版白模一致 |
| 穿过 1152 宽视口 | 步行约 9.98 秒；跑步约 4.39 秒 |

跑步达到此前候选穿屏目标，**步行仍未达到此前 6～8 秒的候选目标**。此处记录真实参数，不把放慢动作包装成全部手感目标已完成。纵向投影也尚未经过浏览器手感确认。

人物采用最近邻绘制；不额外插值肢体。8 帧保持期间仍存在离散的像素移动，不宣称鞋底零滑移；连续白模的支撑关节约束与成品像素接地分开记录。

## 地面反馈

- 四向走跑均有支撑脚接触阴影，腾空时主阴影减弱。
- 土路只在落脚时发出一粒淡尘，停止后消散；换方向、切动作不额外制造落脚。
- 栖河村在 `assets/opening-maps-v4.json` 的 `dustPolygons` 中标出五块土路，坐标使用该地图的 `sourceSize`。木桥及室内不扬尘，未标注地面也不默认扬尘。
- 未增加新的脚步或铃铛声音。

## 检查结论与边界

23 项相关回归测试通过：默认与旧版本隔离、64 帧加载／无裁切、走跑及转向相位、起停、跟随控制器、Shift 切换与失焦、交替落脚、木桥禁尘等。

补充角色注册、脚点和地图入口回归：14 项通过，`chapter1-maps.test.cjs` 在读取旧 `chapter1_scene_v1/village-spatial-check.json` 时失败（其已有 `status=fail`）。该测试读取旧版地图，未使用本轮修改的 `opening-maps-v4.json`；没有为凑全绿修改历史失败记录。

另使用生产 `sliceSheets`、`drawChar`、`updateScene`、地图栅格、`standOk`、`walkable` 和粒子代码，导出四向地图走→跑→停、正常／半速 GIF；检查撞墙后停住并反向离开。地图截帧与四向逐帧复查未见此前的断肢、固定前后腿抖动或裁脚问题，已接入默认入口。

**浏览器自动操作被当前工具策略拒绝，尚未完成实机键鼠／触屏、跨场景和完整剧情验收。** 本页图片是本地 Canvas 渲染，不是浏览器截图；`OpeningMotionTrial.browserVerified` 保持 `false`。本轮不能称为整套移动体验最终验收通过。

## 复现

```sh
python3 art_sources/opening_motion_oc11/pipeline.py qa run_r_1
python3 art_sources/opening_motion_oc11/pipeline.py build
node tools_scene/review_motion_oc11.cjs
python3 art_sources/opening_motion_oc11/white_map_review.py
node --test tests/opening-motion-controller.test.cjs tests/opening-motion-trial.test.cjs tests/opening-motion-v11.test.cjs tests/motion-grounding.test.cjs
```

组表要求全部 QA 通过；重新生成参考板用 `pipeline.py guides`，不得覆盖已冻结候选后继续沿用旧验收记录。运行复验脚本每次重置为待目视检查，不自动复用此前主观结论。

游戏操作：WASD／方向键移动，Shift 切换走跑，方向键双击也可临时奔跑。普通入口加载 OC.11；`motion=classic` 或 `motion=oc7/oc8/oc9/oc10` 仅作旧版对照。`motionTrial=1` 继续使用独立试玩存档。
