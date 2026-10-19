# 蓝灰主角接入本机正式版

- 用户需求：把当前完整蓝灰主角更新到正式版供实际游玩。
- 工作区：xiaojianghu-legacy-prologue，8792 普通入口；先通过 serve-current.py --check 核验身份。
- 已核对：AI onboarding、工作区 AGENTS、update-workflow、设计目录与 runtime-entry、正式素材入口和原主角登记、当前完整包与生成/选择来源。
- 实施合同：[蓝灰萧白正式入口采用](../design/qihe-map/hero-blue-adoption.md)。
- 采用来源：hero-motion-unified-blue-20261010 完整 C 包；四向站姿、12 帧步行、10 帧跑步共同单元和脚原点，初版衣装编辑原件仍保留。
- 实际实施：新增主角注册文件 `js/qihe-hero-blue-art.js`，沿现有逻辑 ID；基础/明亮表支持显式正式素材 ID 映射，避免覆盖旧原件。动作规格共同单元 96×116、脚原点 (48,108)、body=90；保持 ART.scale=.905434、走/跑 stride=.175/.23。首页为脚本加版本参数，防止继续读到旧脚本。预览切换按钮改称「正式主角」。
- 正式采用：`s_qh_hero_blue_20261010`、idle/walk/run 三个日期版本动作 ID，四份 PNG 来源无损导出（基础表为四向站姿机械重复四列）。完整 RGBA 解码像素相等，旧初版九份登记 SHA256 不变。来源、尺寸、像素验收和授权见 [manifest](../../art_sources/hero-blue-formal-20261010/manifest.json)。`organize_assets.py --adopt-reviewed` 同步清单、Markdown、映射和盘点，675 项正式检查通过；中央图与其他人物未更换。
- 浏览器验证：`node art_sources/hero-blue-formal-20261010/verify-formal.cjs` 通过。1920×1080、1280×720 的普通首页实际继续旧格式村落档；四方向分别走/跑，完整遍历 12/10 帧，每方向每动作至少 2.79 周期；捕获实际 drawImageAsset 证明走/跑/停均为正式新表，共同脚原点误差小于 1e-8。覆盖连续走→跑→走、菜单、保存/刷新、旧档物品和银两、新旅程现代开场及旧旅程保留。没有 pixel90 或 art_sources 请求，页面错误/失败请求均 0。[详细结果](../../art_sources/hero-blue-formal-20261010/browser/verification.json)、两视口截图与录屏保留；已目视检查正式站姿及走/跑截图。
- 启动回归：`node tools_scene/qihe/verify_startup.cjs` 10 项通过，含新旅程/旧档恢复、异常档保留和专项存档隔离。
- 用户实际标签页：从新开的普通首页点击「继续进度」，进入用户原有 `qh_south`（南村口·客栈外院）；CDP 只读确认身高 83.299928、三动作从 assets/production/characters 新表加载、没有预览模块。[实际页数据](../../art_sources/hero-blue-formal-20261010/browser/actual-tab.json)和[真实截图](../../art_sources/hero-blue-formal-20261010/browser/actual-formal-game.jpg)留存，已把正式游戏页留给用户。
- 检查过程：整理工具尚在写盘点时提前执行一次正式检查，暂时报告四份新增资源尚未写到 Markdown；等待工具完整结束后重新检查 675 项通过，没有刷新旧哈希或覆盖旧稿来掩盖差异。
- 边界：本轮是采用已存在 C 包，没有重新生成脸部/发丝，也不宣称所有帧局部形象差异消除；自然度仍供用户实际试看。完整序章剧情、战斗与线上站点未执行发布验收。
- 状态：本地完成；未 Git 提交、未线上发布。
