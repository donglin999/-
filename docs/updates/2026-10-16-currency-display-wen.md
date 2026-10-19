# 2026-10-16 货币显示统一为文

用户明确确认全作统一显示“文”，保留现有S.silver数额，不做货币换算。本轮只修改价格/余额/购买消息、旧通用商店和结算页的显示用语；没有调整价格、奖励、消费公式或存档键。

当前工作区涉及ui、story、quests、menu、qihe-chapter、npc-arts、bui、battle的货币文字；文档库的独立汉皋town-ui/town-core同步。历史输入、截图和旧音频原件保留，未重新生成素材。

已核对AGENTS、当前入口、正式素材索引、行囊V3及用户本轮确认。设计与另外26项补充见[补充总入口](../../../xiaojianghu/docs/design/system-completion-20261016/README.md)。这些新玩法仍为设计，不由本次货币改字一并实现。

验证：10份显示文件剔除中文/空白后与修改前完全相同，数字、ASCII运算与存储键无变化；现有汉皋交易规则16项通过，JS语法检查通过。正式8792真实隔离对练能结束并显示“铜钱＋0文”，控制台无错误，证据[截图](../../review/system-completion-20261016/currency-win.png)与[browser-evidence](../../review/system-completion-20261016/browser-evidence.json)。语音运行匹配检查通过，production资产1091项检查通过。

城市file协议原生预览被浏览器安全策略阻止，没有通过替代协议绕过；未把规则测试记成城市UI验收。普通玩家存档未用于测试，独立试玩沿专用saveKey。

本地完成；未提交、未推送、未线上发布。
