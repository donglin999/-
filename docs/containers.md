# 场景容器实现与发布

2026-09-30。目标清单见[探索容器规范](design/exploration-containers.md)，本篇记录实现与发布验收。

## 运行结构

- `js/containers.js`：现有 10 张探索地图、20 个固定容器；位置按地图功能区登记，不随机落点；奖励清单、开放条件、碰撞、蓝闪、点击/靠近交互及领取写回。
- `js/container-art.js` 与 `assets/containers_v1.webp`：9 类、27 个状态，统一地面锚点；酒桶另有酒瓶状态。
- `scene.js`：将容器接入同一深度排序、E 键目标、实体碰撞和寻路；人类 NPC 交互保持现有入口。
- `main.js`：实际物件点击命中，远处寻路到合法站位；鼠标悬停名称与取空状态。
- `S.containers[id].claimed`：稳定 ID 持久记录；存档成功才提交资源与已领取状态，失败不发奖。评审仍用会话档，与正式档隔离。
- 领取后短暂展示有物开盖态，随后空态；蓝闪同帧消失，右侧图标奖励提示不阻止移动。固定闭门实体占地避免开门后 nav 缓存与碰撞不同步。

## 开放条件

| 条件 | 代码依据 |
| --- | --- |
| 柴角事件已解决 | `S.quests.q_book.stage>=2` 或 done；分赃 end=split 不开放 |
| 船夫正义解围 | ferry_ev 且非 ferry_split |
| 东岸可安全搜查 | bf_east=fight；冒充/放过/入伙不当作水匪退场 |
| 黑风寨肃清 | chief_dead |
| 普通公开/遗弃容器 | 无任务门槛；实际探索模式、距离、路径和可达站位仍须合法 |

现有私人老僧箱、巨蟒奖励、西草坡挖酒、供桌选择和证物调查均不注册为新奖励点。

## 验收证据

`tests/containers.test.cjs` 覆盖每点真实移动/领取、奖励差额、重复领取、分支条件、实际鼠标点击和评审档隔离；结果写入 `/tmp/container-acceptance/results.json`。截图与其他回归结果在本批完成后补记。测试前置直接配置任务旗标，不宣称重跑全部任务剧情；地图移动与领取使用真实循环。


本批结果：20 个点均从各自地图入口经真实寻路与移动领取，资源差额正确，重复领取不发奖；7 组关闭条件、实际鼠标点击、存档写入失败不发奖、`loadSave()` 读回与正式档隔离通过。浏览器 `pageerror=[]`。1280×720 已查看 10 地图容器镜头；1920×1080 实际 E 键领取、奖励期间移动与面板截图通过。截图位于 `/tmp/container-gameplay/`、`/tmp/container-acceptance/`，持久预览在 `review/container-hint/gameplay/`。这不是全剧情和平衡验收，任务前置由测试设置。

既有 `tests/xiangyang-slice.test.cjs`、`tests/battle-error-regression.cjs` 回归通过。生成源图与规格记录：[容器源素材](../art_sources/exploration_containers_v1/README.md)。

比例修订：按用户反馈将箱桶实体约缩至首批的 59%–64%，衣柜约 63%；元数据、碰撞、点击范围同源缩小，闪烁提示保持批准版本。

## 发布记录

2026-09-30，运行版本 `c5d2000` 已推送 main，并从该提交的干净归档构建、发布 Cloudflare Pages `luotuo`。生产入口：https://luotuo-36x.pages.dev/#xiangyang；本次部署：https://cb03dd74.luotuo-36x.pages.dev。

线上首页、容器脚本、图集元数据、场景/主循环脚本和容器图集均逐字节匹配发布构建。线上浏览器重新执行 `tests/containers.test.cjs` 的完整容器验收：20 点真实移动领取、奖励差额、重复领取、7 组门槛关闭、实际鼠标点击、存档失败不发奖、读回及评审档隔离通过，`pageerror=[]`。任务前置仍由测试设置，不代表全剧情重跑。
