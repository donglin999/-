# 第二章培养收益、人物关系与逐句对白整改

用户要求每项培养有实际用途、人物关系可见、逐句重新设计台词，并映射已有功法及分级心法。正式工作区 `xiaojianghu-legacy-prologue`，8792 / qihe-current；权威设计与编辑源在 sibling xiaojianghu。核对根／正式AGENTS、AI导入、更新流程、基础功法合同、传承／招式机器清单、归云谷家人、当前正式及弃用素材。中央图 m_qh_central，SHA256 29131902cd53c5a97d3367caf5e550aa5eab1fbbfe08577de2d5e3e74b1b10a4。

实际问题：旧成长只统计前20期六门课；多种gain无人消费，菜单另有派生公式，真实关系未展示。开篇对白叫“归云心法”而实际学tuna，基础拳课误复用人人都会的fist。

本轮新增单一培养收益合同与绝对差量账本，缺失进度从真实历史回填、不重复叠加；观察／听声归并为察势，转暴击和闪避；五维、造诣、医术、生产与全部36个月成长生效。结果显示累计、实际增量及下一档差额。模型快照纯读取副本，实战与菜单共享合同，同伴没有主角增益。关系在图鉴、同伴摘要与属性详情可见，阶段上限保留；师门人物按实际见面入录，小传不透未来剧情。

K01／K02映射丁《试锋剑法》gy_s1／《守拙拳法》gy_p1，普通fist独立；旧剑重数、熟练和装配迁移。首次实际授一门，交叉修习待专门剧情，旧档实际学过两门保留。入门内功用《吐故纳新篇》tuna，正式授课前不因chapter=2赠送，当前新授课上限二层，基础拳剑三重。高阶设计依现有传承身份另列；十套外功与全部招式／重数／属性／目标特效逐项映射见总方案附表，未实现授课不显示已学。现有动作、命中特效与BP复用，**无生图、无正式资产替换**。

权威文档：[总方案](../../../xiaojianghu/docs/design/cultivation-rework-20261012/README.md)、[逐句稿](../../../xiaojianghu/docs/design/cultivation-rework-20261012/dialogue.md)、[JSON编辑源](../../../xiaojianghu/docs/design/scripts/chapter-two-dialogue.json)。90场／1,255条条件对白、32项活动、66条信件收礼、13条直接教学／拜师衔接；90条演出句修订记录及20条信件改写，其余逐句明确采用并说明接话目的。参考链接与原创取舍见总方案。生成器只编译，库存导出另写review，不覆盖编辑源。

验证与证据（review/cultivation-rework-20261012）：

- `node tests/cultivation-rework.test.cjs`：90场×384组条件465,120次逐句对照与演员存在性，实际属性／旧档／别名／读档幂等／生产／拳剑迁移／教学门槛通过。
- `node tests/cultivation-rework-browser.test.cjs`：正式页面派生数字一致、快照不写S、同伴无主角加成、旧护路棍法无重复熟练、入门心法授课和二层上限、实际第二章拜师7句与关系图鉴通过。三个真实页面截图与browser-audit.json。
- `node tests/cultivation-rework-preview.test.cjs`：独立实际游戏预览五种切换、收益累计、人物关系、武学、全文搜索通过；preview-audit.json、preview.png、dialogue-viewer.png。
- `node --test tests/qihe-journal.test.cjs tests/qihe-journal-notices.test.cjs tests/guiyun-performance.test.cjs`：19项回归通过。
- `python3 tools_story/build_cultivation_dialogue.py --check`：权威源／完整文稿／运行文本一致。
- `python3 tools_assets/check_production.py`：936项正式资源通过。
- `python3 scripts/serve-current.py --check`：当前8792身份及中央图不变。

测试均用独立浏览器上下文和明确review键，未接触玩家存档。高阶授课及其专属目标动画、正式出师仍待实施，三年通盘战斗平衡尚未全程试玩。未提交、未线上发布，未访问远端 .6。
