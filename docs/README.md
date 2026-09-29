# 小江湖 · 开发文档

> [新剧情与三年培养设计短链](design/README.md)是目标设计入口。下文记录**目前可运行的原型**；正式开局与三年培养尚未迁移。襄阳测试入口已先行接入新人物关系。

襄阳单片段测试可打开 `index.html#xiangyang`：萧白与叶蘅初始同行，结算为地方事件，评审存档写入会话存储，不覆盖普通存档。`#street` 保留旧流程回归入口。

《小江湖》目前可运行的襄阳原型。纯原生 JavaScript，**无构建步骤**：`index.html` 用经典 `<script>` 依次加载 `js/` 模块，模块之间通过全局变量协作。目标剧情与素材审核入口见[设计短链](design/README.md)。

## 当前状态

| 项目 | 现行实现与边界 |
|---|---|
| 襄阳城 | `SC.gate`（南门外）、`SC.street`（街市）、`SC.alley`（偏巷）均采用程序排布的 `m_*_v2` 底图、单体图集与碰撞 mask。街市北门本片段封闭，南口接南门，东口接偏巷；场景拓扑见[襄阳城设定](design/xiangyang-city.md) |
| 渡口与寨子 | `SC.ferry`、`SC.crossing`、`SC.ferry_e`、`SC.bgate`、`SC.cave` 等仍为旧剧情流程中的可玩场景；目标案件允许救人后不打穿山寨 |
| 角色和剧情 | 普通开局仍有羊太傅庙旧流程；`#xiangyang` 使用成年萧白和叶蘅初始同行，已接入青蚨散调查、共同救治和地方案件结算。三年培养尚未实现，细节见[襄阳章节脚本](design/xiangyang-chapter.md) |
| 美术 | 探索场景使用明亮的三分之四俯视像素画；叶蘅、老周、疤脸刘、浪里鳅和关键证物已有独立素材，叶蘅另有七张表情差分，见[襄阳素材规范](design/xiangyang-art.md) |
| 音频 | 街市已有 BGM、环境音、打铁与倒茶点声源；其他城市场景差异音景尚待制作 |
| 存档 | `#street`、`#streetbright`、`#xiangyang` 为评审入口，保存到 `sessionStorage['xjh.review.save']`；普通游戏使用 `localStorage['xjh.save']` |

## 本地运行

无需构建。任选其一：

```bash
# 1) 直接双击/用浏览器打开（file:// 下可运行，音频也用 HTMLAudioElement，无需 fetch）
xdg-open index.html

# 2) 静态服务
cd /home/user/xiaojianghu && python3 -m http.server 8000
# → http://localhost:8000/
```

入口 hash（`js/main.js` 资源加载完成后判断）：

| URL | 行为 |
|---|---|
| `index.html` | 标题画面 → 继续江湖（读档 `xjh.save`）/ 初入江湖（建角 → 羊太傅庙） |
| `index.html#street` | **评审直达**：`reviewStart()` 以默认角色「萧白」（银两 40、已通过城门盘查）直接进入襄阳街市，不读档 |
| `index.html#streetbright` | 与 `#street` 相同的历史别名；明亮模式现已由 `BRIGHT=true` 常开 |
| `index.html#xiangyang` | 襄阳单片段测试入口：成年萧白与叶蘅初始同行，调查并救治老周，可地方结案或继续深追 |

注意：评审入口仍会自动保存，但使用独立的会话存档，不覆盖普通 `xjh.save`。

## 目录结构

```
index.html            页面骨架 + 全部 UI CSS + <script> 加载顺序
js/
  art.js              美术清单 window.ART（sheet/walk/run/scale/icons/frames）
  core.js             资源加载、精灵表切片、工具函数、数据表(ORIGINS/SKILLS/ITEMS)、存档、画面基础
  ui.js               对话(say/choose)、大地图、面板(商店/小游戏/江湖菜单)、HUD、标题与建角
  scene.js            俯视探索：碰撞/寻路/镜头/路人/同伴/深度排序绘制/氛围特效/reviewStart
  story.js            第一章所有场景定义 SC.*、剧情、敌人模板 mk()、结局、街市「青蚨散」支线、同伴闲谈
  battle.js           战斗系统 battle(opt)（含自带 CSS 注入 #battle-css）
  main.js             输入（键盘/点击/触屏）、主循环 frame()、启动、自动存档
  audio.js            自包含音频层：包裹全局函数挂音效、场景音景、静音按钮
assets/               运行时资源（webp/mp3）；assets/review/ 为评审备选与明亮化前的原表
  audio/              15 个 mp3（见 audio.md）
docs/                 本文档
*.py, tools_bright/, tools_audio/   美术/音频生成管线（见 art-pipeline.md / audio.md）
tools_scene/          探索场景管线 v2（素材生图/抠图/程序排布/mask）与审计脚本（见 art-pipeline.md §场景管线 v2、testing.md §2）
raw*/ frames/ review/ *.json *.log  管线输入/中间产物/评审图/出图任务
game.js, game.v2.js   拆分模块前的旧单文件版本，index.html 不再加载
```

## 文档索引

| 文档 | 内容 |
|---|---|
| [design/README.md](design/README.md) | 新故事、叶蘅分支、三年休闲培养及各系统的短链入口 |
| [design/xiangyang-city.md](design/xiangyang-city.md) | 襄阳城地理、生活、角色、案件与现行实现边界 |
| [design/xiangyang-art.md](design/xiangyang-art.md) | 襄阳场景、角色、证物和音景的素材规格与验收 |
| [architecture.md](architecture.md) | 模块职责与加载顺序、全局状态、主循环、场景生命周期、存档、坐标系、绘制顺序、输入/寻路、同伴跟随、音频钩子 |
| [content-guide.md](content-guide.md) | 如何新增/修改内容：场景字段、对话 API、任务、道具、武学、敌人、同伴、青蚨散剧情、小游戏 |
| [battle.md](battle.md) | 战斗系统规格 |
| [art-pipeline.md](art-pipeline.md) | 资源格式与命名、出图与处理管线、重建顺序、已知美术问题 |
| [audio.md](audio.md) | 音频设计、素材、增益、钩子、重新生成 |
| [testing.md](testing.md) | Playwright 测试、碰撞审计、截图评审、发布检查 |
| [roadmap.md](roadmap.md) | 已知问题、后续计划、打磨轮次 changelog |
