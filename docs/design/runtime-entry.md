# 当前游戏入口与防误入规则

状态：现行　最后核对：2026-10-19

[设计目录](README.md) · [启动与存档](qihe-map/startup.md) · [正式素材](../assets/production-assets.md)

## 唯一默认入口

本机当前游戏为 **xiaojianghu-legacy-prologue / 栖河四向地图版**，固定入口 [开始游戏](http://127.0.0.1:8792/)。首页让玩家选择「从序章开始」或已有进度；入口不能默认带 `play=1`，不能自动清档。

2026-10-07再次误入的原因：此前只拦截兄弟目录8766的两个章节hash。空首页、其他本地端口、file打开及启动配置8123仍能进入历史原型。

## 实施合同

- `scripts/serve-current.py`根据自身文件位置定位当前工作区，固定127.0.0.1:8792；从其他目录启动也不能改变服务根目录。端口占用时核验身份，错误服务必须报错，不能换端口或当成启动成功。
- `/__runtime.json`返回实际工作区、当前地图ID及素材哈希；响应使用no-store。首页及设置显示「栖河试玩 · 四向地图版」。
- 两个工作区的HTML标明身份，并在最早阶段加载同一份入口守卫。当前源文件为本目录`js/runtime-entry.js`，兄弟目录副本通过同步工具维护，检查副本必须一致。
- 历史工作区的本地首页、所有默认游戏hash、任意本地端口，以及file打开，统一转到127.0.0.1:8792。当前工作区若从其他本地端口或localhost打开也统一到同一origin，避免存档按端口分裂。
- 旧入口跳转进入首页，不携带旧原型的play、评审fixture或章节状态；当前工作区自身跨origin时仅保留格式合法的旅程ID，必须重新选择继续。当前8792的普通新建/继续/返回首页/刷新保持原有行为。
- 当前8792未识别的游戏hash转为栖河首页；不能落入旧标题画面。专项UI/战斗/剧情评审仍按现行独立存档处理。
- 8792若错误服务了历史目录，页面拒绝启动并提示重新启动，不自我跳转循环；入口守卫缺失时引擎不启动。
- 历史原型必须显式带`runtimePrototype=1`（兼容旧`openingPrototype=1`），并常驻「历史原型预览」与返回当前游戏的链接。专项历史养成评审同样需要显式选择原型（历史襄阳评审已随襄阳演示撤除，见下）。
- 素材、剧情审阅网站、语音后台和文档书阁保留原地址；它们的默认游戏链接均由守卫收口。不能重启语音任务或更改其计费队列。
- 根目录一键启动及IDE默认启动配置调用同一启动器。兄弟目录构建旧原型需要显式参数，普通构建不能静默输出旧游戏。

## 2026-10-19 弃用入口撤除与发布包分离

- 襄阳演示 `#street`、`#streetbright`、`#xiangyang` 及旧标题／建角流程已撤除，代码与素材移入 `_attic/2026-10-19-deprecated/`。`js/core.js` 在载入时把任何非栖河 hash（含 `#chapter1`、`#cultivation` 等旧链接）改写为 `#qihe-map`，**线上同样生效**；本机 8792 仍先由本页的入口守卫改写并去掉评审参数。入口守卫 `js/runtime-entry.js` 本轮未改（它与文档库副本须保持一致）。
- `?pixel90=backhill` 及其 `pixel90roam`、`pixel90mask`、`heroRun`、`heroWalk`、`runVariant`、`heroMotion` 预览已撤除；下文「本地角色试用」各链接只作历史记录，现在打开即普通首页。
- 评审工具只供本机使用。`scripts/build-pages.cjs` 构建发布包时：不复制评审专用脚本（`qihe-ui-review.js`、`qihe-story-review.js`、`qihe-battle-review.js`、`hero-multiweapon-review.js`、`qihe-chapter-presentation-review.js`、`qihe-relationship-review.js`），并在页面最早阶段注入一段脚本删掉评审／测试参数（`battleReview`、`storyReview`、`uiReview`、`chapterPresentationReview`、`relationshipReview`、`martialCapacity`、`poseReview`、`holdReview`、`tail`、`weapon`、`uitheme`、`debug`、`pixel90` 系列、`runtimePrototype`、`openingPrototype` 等）。`journey`、`play` 保留。新增评审脚本或 URL 开关时同步登记到构建脚本的两张表。
- 培养模式没有独立 hash 入口：从首页继续处于培养阶段的旅程即进入培养。

## 边界与验收

2026-10-10 已按用户「更新到正式版」要求采用蓝灰主角完整 C 包。普通首页新旅程、既有村落进度均通过正式目录加载同套站/走/跑，不需要 pixel90 或 heroRun 参数。保留角色逻辑 ID、原正式人物尺度与走跑世界周期；穿越开场仍是现代服装。采用合同见[蓝灰主角正式入口](qihe-map/hero-blue-adoption.md)，验证和状态见[正式采用记录](../updates/2026-10-10-hero-blue-formal-adoption.md)。以下为此前候选试用沿革，所述「正式映射不变」是各历史批次当时的状态。

本地角色试用：`?pixel90=backhill&heroRun=blue&pixel90roam=1&play=1#qihe-map` 为90格后山实际游戏引擎中的蓝灰主角跑步候选入口，直接自由跑动并可切换原版。仅显式参数加载候选，沿用90格预览会话存档；普通首页与正式角色映射不变。接入和动作质量边界见[实机试用记录](../updates/2026-10-09-hero-run-blue-game-preview.md)。

较小步幅对照：上述入口加 `runVariant=compact` 默认 B 较小步幅；顶部步幅菜单在同一位置切换 A 当前/B 较小，刷新保留版本。独立页 `/art_sources/hero-run-blue-20261009/demo/?review=small-stride` 可同步周期并排和逐帧比较。来源、步距校准及验证见[较小步幅试用记录](../updates/2026-10-09-hero-run-small-stride.md)。

独立步行对照（2026-10-10）：`?pixel90=backhill&heroRun=blue&runVariant=compact&heroWalk=initial&pixel90roam=1&play=1#qihe-map` 默认走路，Shift切换跑步，顶部按钮在同一位置切换初版主角。蓝灰慢走现用初版姿势约束的新12帧步行，跑步沿原A/B8帧；之前蓝灰试跑入口切换慢走也使用这套独立步行。并排页 `/art_sources/hero-walk-blue-20261010/demo/` 可同步初版节奏逐帧查看。只接本机显式预览，记录见[独立步行试用](../updates/2026-10-10-hero-blue-dedicated-walk.md)。

初版跑步姿势换装（2026-10-10）：用户随后明确要求保留蓝灰外观并复用初版跑步。`?pixel90=backhill&heroRun=blue&runVariant=initial&heroWalk=initial&heroMotion=run&pixel90roam=1&play=1#qihe-map` 默认跑步，C候选按正式初版四向10帧各帧编辑衣装，保留原帧序、相对鞋底步相及实际周期；Shift慢走仍用独立12帧。顶部“跑步动作”切换A/B/C，原版按钮保留。并排页 `/art_sources/hero-run-initial-blue-20261010/demo/` 同步初版原速，可检查AI编辑带来的局部姿态差异。来源与验证见[初版跑步制作记录](../updates/2026-10-10-hero-initial-run-retarget.md)。

走跑身份统一（同日随后修正）：用户指出C跑步与走路是两个模型。当前同一`runVariant=initial`入口已改为完整C统一包`art_sources/hero-motion-unified-blue-20261010/out/package.json`；C10帧跑步像素不改，步行重新选用既有大头侧面稿并按C身体基准导出，补同身份四向站姿。站/走/跑共同身份、单元和脚原点绑定，顶部D修正前可在原位置比较旧组合；A/B及原版保留。新同屏页`/art_sources/hero-motion-unified-blue-20261010/demo/`检查三动作的身份差异，旧孤立跑步页保留来源对照。当前状态及本轮证据见[走跑身份修正](../updates/2026-10-10-hero-walk-run-identity.md)。

真实标签页核对（同日）：用户再次截图显示旧站/走与C跑步混用，实际IAB标签页仍为旧脚本，虽与新包入口同URL却未刷新。已直接刷新当前试玩标签页并核对C统一外观/D修正前UI及真实包加载；后续测试链接追加heroReview=identity-20261010-1以区分交付URL，同屏页的游戏链接也带此标记。该标记不改变素材与存档规则。实际页证据与限制见[当前标签页未刷新记录](../updates/2026-10-10-hero-active-tab-stale.md)。

本次统一本机入口，不把兄弟目录的剧情或素材自动迁入当前游戏，不替换已确认地图和人物，不迁移、删除或覆盖其他origin的存档。已发布Cloudflare站点是另一发布状态，本轮不发布。

验收覆盖空首页、序章/风起栖河段/培养/襄阳/未知hash、多端口、localhost、file、显式原型、错误端口占用、任意cwd启动、刷新及存档选择。浏览器证据要确认当前地图文件和人物映射，不能仅凭URL判断成功。
