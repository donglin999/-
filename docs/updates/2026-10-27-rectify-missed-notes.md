# 补做漏掉的模块卡意见（送礼不限次数、蔺管事重设计）、叶蘅跑步上评审台

状态：本地完成，待用户评审（评审台第二十四轮第 4、6 题）；未发布、未提交　日期：2026-10-27

## 起因

用户问“需要我评审的都放上去了吗”，核对时发现第二轮整改漏了用户写在模块卡上的两条意见（只看了题下的回答）：

- 蔺管事支线卡：「突然发现你这个人物和周好像啊，重新设计吧，并且在文档上面写死新人物创建或者立绘创建时需有较为鲜明的比对，不然很容易人物趋同」
- 新上图人物卡：「一个时段不设送礼次数」

## 改了什么

1. **送礼不限次数**：`js/qihe-gift.js` 去掉 `usedThisSlot`，新增 `givenTo`（送给这个人的总件数）；`js/qihe-npc-core.js` 的“礼”印不再灰成“本时段已送”；`js/qihe-gift-ui.js` 人物卡“本时段　还能送 1 次”改成“送过　N 件”，去掉“这个时段已经送过了”遮罩。刷分靠原有的同物递减（第二件减半、第三件起 0）。设计稿 `xiaojianghu/docs/design/npc-gifts-and-inventory.md` 第 3.6 节等处、`npc-interaction-v2.md` 第 138 行同步。新测试 `tests/qihe-gift-no-slot-limit.test.cjs`。实机图 `evidence/2026-10-27-gift-noslot/gift.png`。
2. **蔺管事重设计（只改长相）**：比对发现周砚、宋先生、程铎、原蔺管事几乎同脸；原因是 10-23 出图拿宋先生立绘当参考。出了两版候选（甲·老船头 剃净无须；乙·白髯先生 三绺白长髯），批次 `art_sources/qihe-lin-redesign-20261027/`（README 里有辨识表、比对图）。未登记、未接线；选定后补表情、地图小人，结局 3 CG 照新脸重画（10-27 那张 CG 作废）。
3. **新人物比对写成规则**：`rules.json` 新增 R-画风-05（用户原话即批准出处），`xiaojianghu/docs/art-pipeline.md` 加“新人物比对”一节（辨识表模板、参考图只取画风、附并排比对图）；`check_docs.py --approve-rules` 已登记指纹。
4. **自查补洞**：`xiaojianghu/tools_docs/check_review_batch.py` 给了 `--modules` 时检查模块卡 `userNote` 有没有在日志里用 `ack` 接住；`xiaojianghu/docs/review-desk.md` 写明合并时要看模块卡意见。用线上旧状态跑，正好报出这两条。
5. **评审台**：第二十四轮第 4 题改为“蔺管事重新设计：选哪张脸”（原 CG 题并入，模块“蔺管事形象与结局 3 CG”）；新增第 6 题“叶蘅跑步动画”（素材出自另一会话，见 [2026-10-28-ye-motion](2026-10-28-ye-motion.md)）；蔺管事、新上图人物两张模块卡各贴新整改并记 ack。自查脚本全台通过，浏览器里按美术筛过一遍。

## 测试

- `node --test tests/qihe-gift-no-slot-limit.test.cjs tests/qihe-npc-bag-v2.test.cjs` 通过。
- `python3 xiaojianghu/tools_docs/check_docs.py` 通过。

## 没做的

- 蔺管事新脸未定，`bible/人物/蔺晦之.md`、`story-atlas.json` 的长相描述等用户选定后再改。
