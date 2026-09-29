# 静态发布

本仓库根目录就是游戏项目。运行时文件为 `index.html`、`js/` 和 `assets/`；`docs/`、`tests/`、生成工具不发布。

## Cloudflare Pages

目前站点使用 **Direct Upload**：<https://luotuo-36x.pages.dev/>。加上 `#xiangyang` 可直接测试襄阳片段。它与 GitHub 仓库 `donglin999/-` 分开管理；推送 `main` **不会自动发布**。

## 在其他设备游玩

手机、平板或电脑打开 <https://luotuo-36x.pages.dev/#xiangyang>，即进入已更新的襄阳体验章节；打开不带 `#xiangyang` 的首页则是仍在保留的旧原型开局。需要联网，建议手机横屏；触屏设备会显示方向与互动按钮。音频须先点按页面一次才会启动，也可以点喇叭按钮静音。

襄阳体验入口保存到**当前浏览器标签的会话存储**，普通旧原型保存到该设备浏览器的本地存储。它们都不会经 GitHub 或 Cloudflare 自动同步到另一台设备；换设备或换浏览器会从头开始。体验章节的“重测片段”会清除该标签的体验存档。

更新站点时，在仓库根目录运行：

```bash
node scripts/build-pages.cjs
npx wrangler pages deploy dist --project-name luotuo --branch main
```

构建输出位于 `dist/`，只含浏览器运行所需文件；评审图、语音候选和本地凭据不会上传。首次发布对应源码提交 `799d6a3`。如果以后需要 GitHub 推送即自动发布，需要另行配置 CI 或创建 Git 集成 Pages 项目。
