# 入汉皋前设计预览收尾

2026-10-13。本地完成；未 Git 提交、推送或线上发布。

用户已选“先补齐完整设计、台词和演出方案，再看预览”，本轮继续完成中断工作。8792独立入口：[完整预览](http://127.0.0.1:8792/review/pre-hangao-completion-20261013/)。设计由兄弟文档库维护，详情见[完整交付与验证记录](../../../xiaojianghu/docs/updates/2026-10-13-pre-hangao-completion.md)。

## 实际更新

- 完成`review/pre-hangao-completion-20261013/`：46场阅读、逐句分镜、条件切换、总方案、知古交接、演出清单、接入验收、6类课程短句与全量稿下载。
- `tools_story/build_pre_hangao_review.py`按开场→署名信→分支→收束导出全文，自动同步五份设计文档及`documents.json`。
- 分镜只选择本句在场的发言/接话人，最多三幅大图；其余显示旁席头像。周砚入场与殷红缨退场跟随本句演员名单。
- 知古残稿分支的测试按实际内容判定，避免引号样式误报；新增可重跑浏览器检查`tests/pre-hangao-review-browser.cjs`。
- 正式`js/`、游戏入口、台词权威源、日历和玩家存档未因本轮预览发生改动。

更新前已读本工作区`AGENTS.md`、更新流程、设计入口、素材入口与正式登记，以及文档库AI导入、事件排期、人物/演出/接入合同。人物图与场景只引用正式登记项，无新采用、替换或弃用；山路、书房、汉皋南门等未映射背景明确以灰盒示意。

## 验证

```bash
python3 scripts/serve-current.py --check
python3 tools_story/build_pre_hangao_review.py
python3 tools_story/check_pre_hangao_review.py
node tests/pre-hangao-review-browser.cjs
python3 tools_assets/check_production.py
```

全部通过：8792身份正确；46场/18修订/6新增/22保留，270组有效条件；浏览器75条分支路径、892句分镜，页面与资源错误0。四月底连续三段最长504字。桌面/手机无横向溢出，隔离浏览器存储未被写入，正式素材957项通过。

证据在`review/pre-hangao-completion-20261013/`的`build-report.json`、`audit.json`、`browser-check.json`与五张截图。人工查看过阅读、知古/送行分镜及手机分镜。

剩余正式制作与接入依[接入合同](../../../xiaojianghu/docs/design/pre-hangao-completion-20261013/implementation.md)进行；本轮没有执行正式游戏迁移、真实队伍结算、完整战斗或新动画验收。独立预览通过不表示正式游戏已采用。
