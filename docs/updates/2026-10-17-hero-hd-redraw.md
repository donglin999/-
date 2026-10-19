# 2026-10-17 主角战斗精灵高密度重画（第一批）

## 需求

用户认为主角的战斗精灵也还不够清晰。按交锋领队试点（[2026-10-17-clash-leaders-redraw.md](2026-10-17-clash-leaders-redraw.md)）的高密度规格重画：第一章实际在用的主角战斗表，加上归云阶段的钢剑表。

## 第一章主角用的战斗表（按代码核对）

| 场合 | 入口 | art | 旧表 |
|---|---|---|---|
| 序章后山（现代装，木杆） | `PrologueStoryBattle`，验收 `?battleReview=voice` | `hero_modern` | `b_hero_modern`（20 帧，3 倍） |
| 第一章练棍课 / 护路战（村装，长棍） | `QiheChapter.storyBattle('lesson'/'road')` | `hero_village` | `b_hero_village_staff_combo_20261010`（30 帧，3 倍，长短棍混用） |
| 第一章领队交锋 | `QiheFactionClash` | 主角不上场 | — |
| 归云阶段装备钢剑 | `HeroMultiweapon`，验收 `?battleReview=hero` | `gy_hero_sword_steel` | `b_gy_hero_sword_steel_20261014`（16 帧，3 倍） |

## 改动

- 三张新表（每帧 480×324，2 倍最近邻，逻辑 240×162，待机身高 94–95 逻辑像素，48 色，alpha 0/255，16 帧）：
  - `assets/production/battle/b_hero_village_staff_hd_20261017.webp`
  - `assets/production/battle/b_hero_modern_hd_20261017.webp`
  - `assets/production/battle/b_gy_hero_sword_steel_hd_20261017.webp`
- 生图走 `codex exec` 内置 image_gen，每张两份候选择一；提示词请求 gpt-image-2.5，实际后端未披露。身份参考：村装/现代装立绘；归云钢剑表只从 `p_gy_hero_long` 取脸部特征，战斗服装保持用户已确认的旧战斗表（短衫、白双发带），没有换成立绘的长袍。棍、木杆、剑都是图里生成的。
- 配置：`js/qihe-cast-art.js`（`hero_village`，含新 faceCrop）、`js/prologue-modern-art.js`（`hero_modern`）、`js/prologue-story-battle.js`（预载检查改认新文件名）、`js/hero-multiweapon-art-data.js`（只换 `gy_hero_sword_steel`）。动作结构、节奏、命中帧序号与旧配置一致，命中点按新帧重标。
- 登记：`docs/assets/production-assets.json/.md`，重生成 `js/production-assets.js`。
- `index.html` 只改了 `qihe-cast-art.js`、`prologue-modern-art.js`、`prologue-story-battle.js`、`hero-multiweapon-art-data.js`、`production-assets.js` 五个缓存版本号；`bfx.js?v=20261017-sharp1`、`qihe-faction-clash.js?v=20261017-skip2` 未动。
- `tests/hero-staff-grip.test.cjs` 原本写死旧图集几何（第 24 帧、480×360、锚点 324、伸距 176），改成从配置读取，断言含义不变。
- 旧图集全部保留。

## 显示大小

运行时按第 0 帧中央人体 alpha 高归一到 unitH，实测 unitH 不变（序章 93.8，练棍课 96.6，护路战 93.8，归云 96.6）。各表“直立胜利帧 ÷ 第 0 帧”的高度比：村装 1.046→1.042、现代装 1.156→1.128、钢剑 1.016→1.043，差别都在 3% 以内。每个美术像素约从 2.2 屏幕像素降到 1.47–1.49。

## 对比

- `art_sources/hero-hd-redraw-20261017/compare.png`：三套各 9 种动作的旧/新对比，同尺度。
- `art_sources/hero-hd-redraw-20261017/compare-ingame.png`：六个待机姿势并排，统一按人物显示高 140 屏幕像素。

## 验证

- `python3 tools_assets/check_production.py`：pass（1096 项）。
- `node --test tests/hero-staff-grip.test.cjs tests/hero-staff-combo.test.cjs tests/hero-multiweapon.test.cjs`：8/8 通过。其余非浏览器测试中，containers、menu-icons、npc-arts-actions、xiangyang-* 因本机缺 `/private/tmp/claude-501/pw` 的 Playwright 模块失败，cultivation-balance-combat、dou-sword-combat、guiyun-performance-bounds 因找不到旧路径 `chromium_headless_shell-1228` 失败，cultivation-rework 是剧情台词断言不符；都与本次改动无关，未修。
- 浏览器（8792，正式配置不注入）：`?battleReview=voice|lesson|road|hero&play=1#qihe-map`，1280 与 1920 各一轮，共 8 次。每次截图待机、冲刺、普攻、第二攻击、施放、受击、破势、倒地、胜利，再强制显示命中帧，最后走一次真实 `doAttack`（冲刺→接触→结算→收势）。8 次全部完成；无页面错误、控制台错误或请求失败；普通存档哨兵未变。截图与记录在 `art_sources/hero-hd-redraw-20261017/browser/`。

## 未做 / 影响说明

- **多武器分层**：`hero-multiweapon-production-20261014/layers/` 的身体/武器/握持遮挡分层只对应旧 3 倍表，新钢剑表没有分层。运行时只读整帧，不受影响；预览页 `review/character-completion-20261014/` 用自己的 data.json，仍显示旧表与旧分层。以后要按新规格做“换武器”编辑源，需要用新整表重做去武器身体层（image_gen 去兵器 → 重新抠握持遮挡），每套约 1 次生成加人工核对。
- **混合密度**：归云阶段装备钢剑时，徒手功法会临时切到 `gy_hero_fist`（仍是 3 倍表），显示高度一致，但像素颗粒会在两张表之间跳变；木剑、刀、棍、暗器、拳掌，以及 pre-hangao 的两套变体都还是旧规格。
- 第一章主角的地图行走/奔跑精灵不在本批范围。
- 未 Git 提交，未线上发布。

---

# 第二批（同日追加）：主角其余武器与第一章同屏角色

## 需求

按同一高密度规格和流程继续重画：主角归云阶段其余五种武器（拳掌优先，消除钢剑切徒手功法时的像素粗细跳变），以及第一章与主角同屏的叶蘅、陆衡、护路战敌人、交锋护院。

## 核对结果（按代码）

- 陆衡在第一章用的是 `qh_luheng_v1`（`js/qihe-chapter-battle-art.js`，练棍课与护路战），不是 `b_luheng`。
- 护路战敌人：`qh_raider_front_v1`（乌魁）、`qh_raider_rear_v1`（归烬堂堂众）；两人也出现在交锋里。
- 交锋里的两名“正道盟护院”原来用全局 `bandit` 表（`js/bart.js`，其他模式也在用）。本次不改全局表，新增 `qh_clash_guard` 键。

## 改动

- 10 张新表（每帧 480×324，2 倍最近邻，逻辑 240×162，待机身高 95 逻辑像素，≤48 色，alpha 0/255，16 帧），全部在 `assets/production/battle/`：
  - `b_gy_hero_fist_hd_20261017`、`b_gy_hero_sword_wood_hd_20261017`、`b_gy_hero_dao_hd_20261017`、`b_gy_hero_staff_hd_20261017`、`b_gy_hero_needle_hd_20261017`
  - `b_ye_initial_needle_hd_20261017`、`b_qh_luheng_hd_20261017`、`b_qh_raider_front_hd_20261017`、`b_qh_raider_rear_hd_20261017`、`b_qh_clash_guard_hd_20261017`
- 生图走 `codex exec` 内置 image_gen，每张生成一份，人工检查服装、比例、透明底、无文字后采用；提示词请求 gpt-image-2.5，实际后端未披露。身份参考：叶蘅 `p_ye_battle`、陆衡 `p_opening_luheng`、乌魁 `p_opening_wukui`；主角各武器以第一批已采用的新钢剑表定脸和服装；堂众、护院没有立绘，按旧战斗帧服装。
- 配置：
  - `js/hero-multiweapon-art-data.js`：替换五种武器。
  - `js/qihe-battle-art.js`：替换 `ye_initial`。
  - `js/prologue-story-battle.js`：叶蘅预载检查改为新文件名、480×324、16 帧。
  - `js/qihe-chapter-battle-art.js`：替换陆衡与两名敌人。
  - `js/qihe-faction-clash-art.js`：新增 `qh_clash_guard`，并加入普通成人身高集合。
  - `js/qihe-faction-clash-data.js`：两名护院的 art 由 `bandit` 改为 `qh_clash_guard`。
  - `js/bstage.js`：叶蘅身高系数 `ye_initial` 从 .98 调到 .90。新待机是微蹲，按第 0 帧归一后站直会大约 9%；调整后站直显示高度约 93.3，旧版约 93.0。
- 叶蘅 21 帧压成 16 帧，保留全部状态和三种飞针的命中时刻（430/220/450 毫秒，与旧表一致）。主角五种武器的动作结构与节奏不变，接触点与暗器出手点按新帧重标。陆衡、乌魁、堂众、护院沿用旧配置的无接触点结算。
- 登记：`docs/assets/production-assets.json/.md`，重生成 `js/production-assets.js`。
- `index.html` 只改了 `production-assets.js`、`qihe-battle-art.js`、`qihe-chapter-battle-art.js`、`prologue-story-battle.js`、`qihe-faction-clash-data.js`、`qihe-faction-clash-art.js`、`hero-multiweapon-art-data.js`、`bstage.js` 的版本号。
- 没有碰台词相关文件（qihe-chapter、qihe-representatives、qihe-map-trial、qihe-outsiders、qihe-expansion、qihe-prologue-actions、prologue-arrival、prologue-water）。旧图集全部保留。

## 对比与验证

- 对比图：`art_sources/battle-hd-redraw-batch2-20261017/compare.png`（10 套 × 6 种动作，旧/新同尺度）、`compare-ingame.png`（20 个待机，统一按人物显示高 140 屏幕像素）。
- `python3 tools_assets/check_production.py`：pass（1106 项）。
- `node --test` 跑 hero-multiweapon、ye-needle-battle、hero-staff-grip、hero-staff-combo、qihe-faction-clash：17/17 通过。
- 浏览器（8792，正式配置不注入）：
  - 入口：`?battleReview=ye`、`lesson`、`road`、`clash`，以及 `hero&weapon=fist|sword_wood|dao|staff|needle`，1280 与 1920 各一轮，共 18 次。
  - 每次逐角色摆拍九态，强制显示命中帧，并让每个重画角色真实普攻一次（陆衡、乌魁、堂众、护院、叶蘅及五种武器全部出手）。
  - 全部完成；无页面错误、控制台错误或请求失败；普通存档哨兵未变。
  - 调整叶蘅身高系数后，单独复测了 1280 的叶蘅入口和针法测试。
  - 截图与记录在 `art_sources/battle-hd-redraw-batch2-20261017/browser/`。

## 未做 / 影响

- 主角归云阶段的六种武器现在都是 2 倍高密度，钢剑切徒手功法时不再有粗细跳变。pre-hangao 的两套变体（`gy_hero_sword_prehangao_*`、`gy_hero_fist_prehangao_*`）仍是旧规格。
- 多武器分层编辑源（身体/武器/握持遮挡）仍只对应旧 3 倍表；运行时不受影响。预览页 `review/character-completion-20261014/` 仍显示旧表。
- 全局 `bandit`、`b_luheng`、`b_ye_initial` 等旧表在其他模式里仍在用，没改。
- 第二批每张只生成一份（检查合格），没有做多候选比较。
- 未 Git 提交，未线上发布。
