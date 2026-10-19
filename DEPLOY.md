> 构建前必须完成 docs/update-workflow.md 的文档核对与本轮更新记录；素材一致性检查失败会阻止构建。

# 静态发布

状态：现行　最后核对：2026-10-19

> 2026-10-17：<https://luotuo-36x.pages.dev/> 已换成当前栖河试玩版（预览分支 `qihe` 同一内容）。下文关于襄阳片段的说明是旧记录；旧部署可在 Cloudflare 控制台回滚。构建后注意 `assets/audio/bgm_qh_cultivation_v5_short.wav` 超过单文件 25MB，需要先在 `dist/` 里转成 16 位、44.1kHz 再上传。

当前本机游戏唯一入口：[栖河试玩](http://127.0.0.1:8792/)；用`python3 scripts/serve-current.py`启动并用`--check`核验身份。完整规则见[防误入合同](docs/design/runtime-entry.md)。以下Cloudflare链接为既有发布记录，不能当成本目录现行栖河已上线的证据；2026-10-07本轮没有线上发布。

本仓库根目录就是游戏项目。运行时文件为 `index.html`、`js/` 和 `assets/`；`docs/`、`tests/`、生成工具不发布。

## Cloudflare Pages

目前站点使用 **Direct Upload**：<https://luotuo-36x.pages.dev/>。它与 GitHub 仓库 `donglin999/-` 分开管理；推送 `main` **不会自动发布**。

2026-10-19 起：`#xiangyang`、`#street`、`#streetbright` 襄阳演示入口已撤除（代码与素材在 `_attic/2026-10-19-deprecated/`），任何旧 hash 都进入栖河首页。评审工具只供本机 8792：`node scripts/build-pages.cjs` 构建时不复制评审专用脚本，并注入一段脚本删掉 `battleReview`、`storyReview`、`uiReview`、`chapterPresentationReview`、`pixel90` 等评审／测试参数，线上加这些后缀只会进入正常试玩。清单见 `scripts/build-pages.cjs` 的 `REVIEW_SCRIPTS`、`REVIEW_PARAMS` 与[弃用入口清理](docs/updates/2026-10-19-deprecated-entries.md)。

## 在其他设备游玩

手机、平板或电脑打开 <https://luotuo-36x.pages.dev/> 即进入栖河试玩（下一次发布后，旧的 `#xiangyang` 链接也会落到这里）。需要联网，建议手机横屏；触屏设备会显示方向与互动按钮。音频须先点按页面一次才会启动，也可以点喇叭按钮静音。

进度保存到该设备浏览器的本地存储，不会经 GitHub 或 Cloudflare 自动同步到另一台设备；换设备或换浏览器会从头开始。（旧的襄阳体验会话存档已随入口撤除，不再读取。）

更新站点时，在仓库根目录运行：

```bash
node scripts/build-pages.cjs
npx wrangler pages deploy dist --project-name luotuo --branch main
```

构建输出位于 `dist/`，只含浏览器运行所需文件；评审图、语音候选和本地凭据不会上传。首次发布对应源码提交 `799d6a3`。如果以后需要 GitHub 推送即自动发布，需要另行配置 CI 或创建 Git 集成 Pages 项目。
