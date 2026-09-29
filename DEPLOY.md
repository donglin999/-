# 静态发布

本仓库根目录就是游戏项目。运行时文件为 `index.html`、`js/` 和 `assets/`；`docs/`、`tests/`、生成工具不发布。

## Cloudflare Pages

目前站点使用 **Direct Upload**：<https://luotuo-36x.pages.dev/>。加上 `#xiangyang` 可直接测试襄阳片段。它与 GitHub 仓库 `donglin999/-` 分开管理；推送 `main` **不会自动发布**。

更新站点时，在仓库根目录运行：

```bash
node scripts/build-pages.cjs
npx wrangler pages deploy dist --project-name luotuo --branch main
```

构建输出位于 `dist/`，只含浏览器运行所需文件；评审图、语音候选和本地凭据不会上传。首次发布对应源码提交 `799d6a3`。如果以后需要 GitHub 推送即自动发布，需要另行配置 CI 或创建 Git 集成 Pages 项目。
