# 去掉起火时的救人二选一（2026-11-02）

状态：本地完成；未提交、未发布。

用户：“起火时救谁：救陈伯，或帮陆衡护车。我感觉这个情节无关紧要啊，推进不了任何东西，要不就去掉吧”

## 改动

- 剧本里不再选“救陈伯”还是“护车”。现在固定是萧白跟叶蘅去救陈伯，车由陆衡带出来。
  - `story/01-开始/风起-起火.ink`：删掉选择段 `fq_rescue_choice`。`fq_rescue` 只留救陈伯三句（C1-05-A1～A3）。撤离第一句改成“陆衡：车我推出来了，药包也收齐了，大家从西边走！”（C1-05-A5），原来护车那支的 B1～B5 一并删去。
  - `story/01-开始/三方-侧口对峙.ink`：R3-R10 由“陈伯倒在药架边，车也卡住了——”改成“陈伯倒在药架边了——跟我来！”。
  - `story/01-开始/风起-随口一句.ink`：在接应院问叶蘅陈伯的伤，只剩“擦伤包好了”这一句。“腿伤得重新包”那一句和 `chen_ok` 参数删去。
  - 以上三份剧本已按用户这句话重新批准（`build_ink --approve`），构建通过。
- `js/qihe-chapter.js`：
  - 起火流程不再弹选择，新档写入 `rescue='chen'`、`chenCare='擦伤已照护'`。
  - 去掉从没被读过的 `supplies` 计算。
  - 旧档已经选过护车的，保留原来的记录。培养模式“陈伯仍需休养”那段变体只会在这种旧档里出现。
- `js/qihe-staging-data.js`：起火站位表的剧本段列表里去掉 `fq_rescue_choice`。
- `story/_共用/flags-风起主线.json`：`qiheChapter.rescue` 改成只记录、不进剧本分支，删掉 supplies 的说明。
- 测试：
  - `verify_cg_direction`、`verify_representatives`、`tests/qihe-finale-browser.cjs` 改成只跑救陈伯一条。
  - 这些测试不再断言护车分支和物资数。

## 验证

- 构建：`build_ink` 通过，错误 0。
- 剧情流程：`verify_cg_direction`、`verify_representatives`、`verify_chapter` 通过。
- 站位：`verify_staging` 24 场全过。
- 实机：`qihe-finale-browser` 从起火一路跑到第二天清晨对证，5 张插画和路上一仗都正常。

## 留意

- R3-R10 的旧配音和新台词对不上了。配音目前整体关着（[2026-11-02-voice-off.md](2026-11-02-voice-off.md)），以后重新开配音时要重录这一句。`docs/design/qihe-map/scripts/representatives-voice-plan.*` 里还是旧台词，没有改。
