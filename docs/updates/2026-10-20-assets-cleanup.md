# 2026-10-20 失效素材运行时核查与移出

状态：现行　最后核对：2026-10-20

## 需求

用户原话：“按你的建议顺序开始”。建议内容是先做一次运行时素材核查，只把确认没被请求的移进 _attic，不删除，可以一键还原。依据规则：R-清理-01（移入 _attic，写 manifest.json 与 restore.sh）、R-素材-01（登记同步，check_production 通过）、R-测试-01（结果不比改前差）、R-git-01（不提交）。

## 做法

1. **静态解析**：在 Node VM 里加载 index.html 的全部脚本，拦截 `Image`、`Audio`、`fetch` 与 `assetImagePath`，再调用 `loadAll`，并对全部场景调用 `ensureAsset`。收集全局数据里的所有字符串（不含 `PRODUCTION_ASSET_PATHS` 等登记表本身），以及 js/css/html/manifest 里的全部词元。命中某个词元的 key 按 `assetImagePath` 解析：登记表里有就用正式路径，没有就回退到 `assets/<key>.webp`。另外还看完整路径、相对后缀（如 `story-bg-v1/x.png`）、带扩展名的文件名，以及下面列出的拼名规则。
2. **运行时采集**：用一次性的 Playwright 上下文，不读写玩家浏览器里的正式存档，记录全部请求。走过的入口有：标题页、新开局开场（到遇狼战斗）、`?uiReview=1`（江湖行卷、各面板、13 个场景逐一进入）、`battleReview=ye/road/clash/voice/hero`、主角六种武器、`storyReview=procurement/steward`、`chapterPresentationReview=fixture/handoff/fire/refuge/water`、培养模式（四季、全部 `data-cu` 按钮点三轮），以及 `relationshipReview`。清理前请求了 557 个本站路径，其中 384 个是 assets 素材，全部落在静态判为“在用”的集合内。静态判为不可达的文件，运行时一个都没有被请求。
3. **判定**：静态可达或运行时被请求的都算在用。剩下的分三类。凡是被测试或工具读取的、元数据、拿不准的，一律保留。

### 发现的拼名规则

- `assetImagePath(key)`：正式登记 id 映射到 `assets/production/...`，未登记的 key 回退到 `assets/<key>.webp`；还要经过 `ART.sheetFile` 一层间接映射。
- core.js：`s_<CHARS>`、`p_<PORTS>`、`p_<角色>_<EXPR 表情>`（各剧情脚本还会往 EXPR 里追加角色）、行走/跑步/待机表 `s_<角色>_<walk|run|idle>` 及其 `_bright`、`s_<BRIGHT_CHARS>_bright`。
- 战斗：`BART[key].file`、`'bg_'+场景`、`bb_*` 背景表、`p_<por>_<hurt|worry|battle>`。
- 培养：household-v1 `<人>_<表情>.png` 按 `MOODS`/`FALLBACK`/状态档，经 `portraitFor` 求出；主角统一改走 hero-empty 的 `hero_<短/中/长>_empty_<表情>.png`；presentation 用 `hero_<发型>_<normal|smile|sad|angry>.png`；另有 `mood-avatars-v1/<心情>(_fx).png`、`place-icons-v1/<地点>.png`、`mail-v7/<物资>.png`、`animations/action_<id>_v2.png`、`bg_mountain_<季节>_v1.png`，以及场景表里的相对路径。
- 其他：`assets/r_qh_<资源>_v1.webp`、`assets/p_<宠物>.webp`、HUD 头像 `assets/p_opening_hero_<village|modern>.webp`、`ui/jianghu-v4/portraits/<id>.webp`、特效 `manifest.json` 加 `file`。
- 对白语音按台词全文匹配播放；战斗语音按角色身份和事件播放。

## 移出结果

共 214 个文件，约 115.5MB，移到 `_attic/2026-10-20-assets/files/`，保持原相对路径。逐项的原路径、大小、sha256 和判定理由都在 `manifest.json`；`restore.sh` 一键还原，会同时恢复清理前备份的 6 个登记文件。

| 类别 | 数量 | 体积 | 内容 |
| --- | --- | --- | --- |
| 被取代旧原件（supersedes） | 27 | 26.7MB | 正式目录里的旧整图 `m_qh_east/north/south/west/refuge.webp`、`m_qh_central_tiled_20261007`、`m_qh_central_fg_hd_20261005`、`m_prologue_backhill_v1`；14 张非 pixfix 的 `s_opening_*`，以及 `s_qh_bandit/merchant/oldman`、`s_qh_hero_initial_hd_20261007`、`s_ye_hd_20261007` |
| 已登记但不可达 | 139 | 63.4MB | 130 个登记条目，另有 9 个随条目一起移出的根目录原件。包括：襄阳演示归档后的 75 条 `xy.*` 对白语音；培养 household-v1 主角旧表情 17 张（已由 hero-empty 取代）；v5 旧图集 6 张；`mail-v7/study-hd.png`；被 hd_20261017 取代的旧战斗表 16 张；旧 HD 行走/跑步 4 张；整图前景 `m_qh_*_fg` 6 张（模块化地图已改用道具层）；已被夜间版取代的旧 CG 5 张 |
| 未登记且不可达 | 48 | 25.4MB | 根目录旧整图 `m_qh_*.webp` 7 张与 `m_qh_central_fg`；`p_ye_*` 旧表情 7 张；陆衡、周砚、程铎、乌魁的 `p_opening_*` 根目录副本 12 张；`s_opening_*` 等根目录小图；`production/maps/m_qh_central(_fg).webp`、`production/characters/s_ye.webp` |

登记同步：

- `docs/assets/production-assets.json` 删掉 130 条（1062 → 932）。supersedes/previous_adoption 指向已移走文件的 26 处，加注“已移入 _attic”。
- `js/production-assets.js` 按 organizer 的同一算法重生成，并已用 `organize_assets.py --adopt-reviewed --registered-only` 在副本里复核，结果逐字节相同。
- `production-assets.md` 删掉 130 行，末尾追加说明。
- `inventory.json` 去掉已移走的文件并重算计数。
- `assets/audio/voices/manifest.js` 删掉 75 条 `xy.*` 台词，台词全空的角色一并去掉。
- `index.html` 中这两个文件的 `?v=` 改为 `20261020-clean1`。

## 保留的拿不准项

- `assets/p_opening_hero_*`：按要求不动（状态栏头像在用）。
- `m_qihe_trial_v1(_fg)`：`SC.qihe_trial` 仍然声明它，`tools_scene/qihe/verify.cjs` 直接读取，check_production 也按 id 守卫，需要单独处理。
- `assets/audio/step1-3.mp3`：audio.js 写的是“暂不”播放，属于暂停而不是弃用。
- `b_qh_raider_rear_v1`（verify_chapter_battle_art 引用）、`cg_qh_fire_ignition_v2/v3`（test_cg_review 引用）、`clash_v2/contact.png`（特效与精灵工具会写同名文件）。
- 非 `xy.*` 的 23 条对白语音：台词全文与现行剧情对不上（opening.*、clash.whip.*），可能只是改写或标点差异，待剧情核对。
- 战斗语音整套保留：按角色身份触发，没法静态证明某个角色永远不会进战斗。
- 147 个根目录或 assets 内的登记原件：正式条目的 `original_path`，是 organizer 的硬依赖。
- 各类 `manifest.json` 元数据。

## 验证结果

- `python3 tools_assets/check_production.py`：pass（1062 → 932 项）。`node scripts/build-pages.cjs`：pass，dist 从 882M 降到 770M，压缩地图从 29 张降到 19 张。`check_docs.py`：0 处过时说法、0 条死链。
- `tools_scene/qihe/verify_*.cjs` 共 30 个，清理前后逐项对比。退出码全部相同，输出除时间戳外逐字相同。
  - 通过：audio、banter、battle_voice、cg_direction、chapter、chapter_battle、equipment_v3、expansion、faction_contacts、household、jianghu_ui、menu_fix、outsiders、portals、prologue、representatives、resources、saves、starter_equipment、startup、stranger、stun_status、ui_model。
  - 清理前就失败、失败点不变：verify_battle（“state restored”）、verify_chapter_battle_art、verify_grade_balance、verify_relationships、verify_faction_contacts_browser（脚本写死的 chromium_headless_shell-1228 不存在）。
  - verify_interactions：前后都在 “PASS chen_guest/phone” 之后挂起，前后都被强制结束。
  - verify_runtime_entry：读取的 xiaojianghu 旧原型文件已由文档库整体归档，按协调方要求在对比时排除，脚本未改动。
  - 附加：test_cg_review.py 清理前就失败，前后相同；verify_dialogue_voice.cjs 通过。
- 浏览器冒烟用无头 Chromium、一次性上下文，入口为 8792。覆盖：标题页、新开局遇狼战斗、进村（uiReview 进栖河村）、江湖行卷、13 个场景、5 种评审战斗及主角六武器、两段剧情评审、五种章节演出、培养模式。页面报错 0。
  - 清理前后各请求本站约 557 个路径，清理后没有新增失败。多出来的 2 条是战斗语音随机变体，不是新失败。
  - 唯一的 404 有 2 条，清理前就存在，与本次无关：`storyReview` 下请求 `production/portraits/p_qh_shenyanhui_story.webp` 和 `p_qh_xulingyi_story.webp`，这两个文件本来就不存在。
  - 截图在 `_attic/2026-10-20-assets/screens/`，请求记录、判定全表、采集脚本、前后测试输出在 `evidence/`。
- 说明：新开局自动推进停在遇狼战斗的教学指引，“进村”截图改用 uiReview 入口。

## 其他说明

art_sources 未改动（另：清理前我误跑了一次 `tools_scene/qihe/verify_chapter_asset_files.py`，它会按相同输入重写 `art_sources/qihe-chapter1-battle-v1/file-acceptance.json`，内容应与原来相同）。

## 状态

本地完成；未提交 git，未线上发布。
