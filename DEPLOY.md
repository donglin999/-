# 静态发布

本仓库根目录就是游戏项目。运行时文件为 `index.html`、`js/` 和 `assets/`；`docs/`、`tests/`、生成工具不发布。

## Cloudflare Pages

- 连接 GitHub 仓库 `donglin999/-`，生产分支选 `main`。
- Framework preset 选 `None`。
- Build command：`node scripts/build-pages.cjs`。
- Build output directory：`dist`。
- Root directory 留空（仓库根目录）。

本地可先运行 `node scripts/build-pages.cjs`，输出位于 `dist/`。发布后访问站点根路径可打开原型；加上 `#xiangyang` 可直接测试襄阳片段。

构建脚本只复制浏览器运行所需的文件，排除评审图、语音候选和本地凭据。Pages 绑定 GitHub 后，推送 `main` 会触发后续发布。
