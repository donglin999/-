# 2026-10-11 谷中人家与裴知古的谷内剧情

用户 2026-10-11：把裴知古进城前的培养闲逛剧情“加入进去吧，需要补的素材同时生成”。设定见文档库 `xiaojianghu/docs/design/companions/pei-zhigu-valley.md`，实现说明见 `docs/design/qihe-map/expansion/guiyun-household.md`“谷中人家”一节。

## 改了什么

- 新增 `js/qh-mode-cultivation-neighbors.js`：11 段剧情（进城前四段主干、三段串门小事；进城后四段）。
- 场景、闲逛地点、关系档案：`qh-mode-cultivation-scenes.js`、`-data.js`、`-relations.js`、`-household.js`、`-core.js`（串门与门派闲逛分开计）、`-story.css`（两人立绘的头部对齐）、`index.html`。
- 素材批次 `art_sources/guiyun-neighbors-20261011`：背景 5 张、裴知古与裴述的 Q 版底图各 1 张、表情各 6 张，全部由 codex exec 内置生图产出（提示词请求 gpt-image-2.5，实际模型工具未披露），已登记正式清单。
- 测试：`verify_household.cjs` 的节奏模拟加了串门一档；`verify_relationships.cjs` 的人数断言改为按档案数。

## 立绘返工（用户反馈）

- 第一版知古底图胸部画平了，也没有呆的感觉：按设定重出（体态丰腴；眼镜滑在鼻梁、嘴微张、眼神放空、头顶呆毛）。
- 第二版领口合拢，与写实设定图差得多：按设定图的穿法再出一版（外衫松垮滑肩、低领内搭），程度以设定图为准。表情随之重出。
- 弃用稿留在批次目录：`base/base_pei_r1_small_chest.png`、`base/base_pei_r3_closed_collar.png`、`rejected/`。

## 没做的

- 她入队后的战斗：队伍名册、战斗小人、五招、册子兵器、见闻成长都没有，现在只记了入队事实。
- 第二年以后的谷内剧情、她的个人篇。
- 新对白没有配音；两人没有场景小人。
- 游戏里五月去的城还是原来的襄阳片段，汉皋城未接入；对白里只说“进城”。
