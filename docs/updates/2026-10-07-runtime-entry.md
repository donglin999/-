# 2026-10-07 · 当前游戏默认入口与防误入

## 需求与核对

用户反馈今天仍会因入口弄错进入旧游戏，要求彻底处理。核对顶层及两工作区AGENTS、AI导入、[现行启动](../design/qihe-map/startup.md)、[正式素材](../assets/production-assets.md)、两份2026-10-06入口记录、实际服务进程与工作目录。

当前工作区为xiaojianghu-legacy-prologue / 8792。旧目录xiaojianghu同时在8766、8786、8123运行静态服务；IDE配置默认用8123服务旧目录。此前入口守卫仅处理8766的#prologue/#chapter1，空首页、其他端口及file入口没有收口。8765是语音后台，8794是文档书阁，本轮未停止或重启它们。

## 实际整改

先编写[唯一入口合同](../design/runtime-entry.md)，再改实现：

- 固定启动器scripts/serve-current.py以自身绝对位置定位当前工作区，固定127.0.0.1:8792，增加运行身份接口、当前中央图哈希核验与no-store响应。任意cwd启动仍服务当前目录；被错误服务占用时拒绝启动，不换端口。
- 核验原PID15841确实是本工作区的8792普通静态服务后，仅替换此本机服务。新服务从/tmp启动成功；[替换证据](evidence/2026-10-07-runtime-entry/server-replacement.json)。
- 增加js/runtime-entry.js为入口守卫唯一源，scripts/sync-runtime-entry.py同步到旧目录及已存在的本地dist快照。两份index最早加载守卫并标明身份；跨端口/localhost统一到127.0.0.1:8792。旧入口进入首页，不携带旧fixture或play；当前旅程跨origin仅带合法ID，重新选择继续。
- 当前未知hash归入栖河首页，避免旧titleScreen分支。8792若错误指向历史目录，拒绝启动并提示，不循环跳转。守卫缺失时两引擎不启动。
- 历史原型必须显式runtimePrototype=1，兼容openingPrototype=1，显示常驻标识和当前游戏链接；review页面不跳转。开篇素材页的第一章演出链接明确标为历史原型。
- 首页与设置加入「栖河试玩 · 四向地图版」。根目录一键启动、当前工作区一键启动和IDE配置调用固定启动器；两个工作区AGENTS与导入/入口/发布文档同步。
- 旧目录默认构建拒绝，显式--prototype只输出dist-prototype，避免默认产物指向旧游戏。未执行生产构建或发布。

本轮没有采用/删除/替换图片，当前地图ID与主角人物映射不变；三位女主候选及剧情迁移状态不因入口修复而改为已采用。没有迁移、删除或强制清空存档。实际浏览器继续原有旅程并通过正常保存返回首页；不是字节不变测试。

## 验证与证据

- [路由检查](evidence/2026-10-07-runtime-entry/route-tests.json)：10组检查通过，105个跨端口/hash组合；另含file、合法旅程、原型显式预览、未知hash、错误工作区占据8792时拒绝、守卫一致性与引擎启动门槛。
- [启动与存档VM](evidence/2026-10-07-runtime-entry/startup-tests.json)：10项通过；新建旅程不会覆盖原记录、读取/继续/检查点刷新、损坏档保留、评审隔离。首次运行原VM没有路由守卫需要的DOM接口；将入口DOM层移交独立路由测试和真实浏览器，原VM只测引擎。入口测试初版路径多上一层，修正后复跑通过。
- [服务检查](evidence/2026-10-07-runtime-entry/server-tests.json)：7项HTTP只读核对通过，当前身份、no-store、三个旧静态服务最新守卫、书阁与语音页面可用。旧目录默认构建退出1为预期保护；普通静态8792占用时启动器也确实拒绝，替换后--check和重复启动均核验成功。
- [浏览器记录](evidence/2026-10-07-runtime-entry/browser-review.json)：空旧首页、8786、8123、8766第一章/襄阳、localhost、未知hash、旧dist都进入当前启动页；显式历史预览显示标识，可返回当前首页；继续原旅程、刷新、设置确认保存返回首页通过。[首页](evidence/2026-10-07-runtime-entry/homepage.png)、[当前地图人物](evidence/2026-10-07-runtime-entry/current-map.png)、[设置版本标识](evidence/2026-10-07-runtime-entry/settings.png)。实际meta为qihe-current，加载当前production-assets.js。当前页无警告/错误；显式历史原型有1条既有VFX等级自检警告，原样记录，未当作当前页错误，也未修历史战斗特效。
- [正式素材检查](evidence/2026-10-07-runtime-entry/production-check.json)：481项通过、0错误。入口副本一致性检查2份通过。

上述浏览器验证是入口与存档闭环，不是整章剧情或全部美术复验。file入口由路由VM验证，未通过实际file浏览器入口测试。已发布Cloudflare站点未验证或更新，本轮只统一本机开发入口。

## 交付状态

本地修改完成、固定8792服务运行、统一首页已在浏览器保留。未Git提交、未推送、未线上发布。其他会话后续应从同一启动器及--check入手；单个静态服务端口不能作为版本身份依据。
