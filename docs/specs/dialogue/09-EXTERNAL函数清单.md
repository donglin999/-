# 09 EXTERNAL 函数清单与 JS 实现

源：`story/_共用/externals.ink`、`externals-三方.ink`、`externals-风起主线.ink`（声明）；实现见各行“绑定”。所有函数在 ink 中都无返回值（`flag` 除外），实际执行时机为“下一句台词显示前”按调用顺序 `await`（08 §4.3）。主线/三方包装层还会在执行前先演完攒下的台词（08 §5）。本篇只写对演出/状态的影响；战斗、奖励数值的细节归其他规格书。

## 1. 通用（默认实现在 `js/story-runtime.js`）

| 函数 | 作用 |
|---|---|
| `flag(path)` | 读 `S` 点路径；空→false；可提前求值 |
| `set_flag(path, value)` | 写 `S` 点路径（排队执行，期间 `flag` 读到新值） |
| `checkpoint()` | 记录玩家坐标并存档（主线绑 `QihePrologue.checkpoint()`） |
| `toast(text)` | 提示 2800ms |
| `toast_for(text, ms)` | 提示指定毫秒 |
| `mark(id)` | 默认空；序章用来派发进度事件；主线用来记选择题干 id |

## 2. 序章（`externals.ink`）

| 函数 | 绑定 | 实现 |
|---|---|---|
| `go_scene(scene, anchor)` | `prologue-arrival.js` lodging | 忽略参数，切到 `prologue_clinic_interior`，落点 = `CHAPTER1_V2_MAPS.clinic_interior.anchors.entry_front × 3 / TS`（格），切完 `busy=true` |
| 同上 | `qihe-map-trial.js` | `goLocal(scene 去掉 prologue_ 前缀, anchor)`；过夜剧本里另设 `busy=true` |
| `clinic_stage()` | `prologue-arrival.js` | `PrologueBackhill.clinic()` 摆药棚站位（11 §4），`player.alpha=1`，刷新主角服装 |
| `change_into_village_clothes()` | `prologue-arrival.js` | `fade()` 黑场中：`arrival.borrowed=true`、`modernEvent=false`、主角换 `qh_hero_initial`、解除后山锁定、存档 |
| `backhill_show(shot)` | `PrologueBackhill.show` | `"encounter"`/`"dog"` 后山定点站位（11 §4） |
| `backhill_ye()` | `PrologueBackhill.showYe` | 叶蘅出现，萧白转向右 |
| `backhill_guard(on)` | `PrologueBackhill.guard` | true：主角隐身、画持棍站姿；false：恢复 |
| `backhill_retreat()` | `PrologueBackhill.retreat` | 黑场中撤掉两只狼 |
| `wolf_battle()` | `prologue-arrival.js` | 循环 `PrologueDog.play()`；败/未完成弹 `choose('', 文本, ['重新挑战','稍后再试'])`，文本：输 `两人暂时退开，重新稳住脚步。可以重试，不损失物品。`，其他 `战斗未能完成，重新挑战可恢复到开战前。`；选“稍后再试”抛错中止本段 |
| `water_scene()` | `prologue-arrival.js` | 播递水 CG 剧本（10 §3），结果 `['A','B','C'][branch]` 写 `arrival.originExpression` |
| `hide_water_cg()` | `prologue-water.js` | 收起递水 CG |
| `water_branch(b)` | `prologue-water.js` | 记 `branch = 'ABC'.indexOf(b)` |
| `carry(item, n)` / `uncarry(item)` | `qihe-map-trial.js` | `S.prologue.carry[item]=n` / 删除；item：bowls、cloth、medicine、basket |
| `night_falls()` | `qihe-map-trial.js` | `fade()` 中设 `cur.dark='rgba(13,22,32,.32)'`（夜色叠色） |
| `hand_off_first_night()` | `qihe-map-trial.js` | 清空 carry；写 `p.handoff={chapter:'风起栖河',origin,heard,noteOwner:'叶蘅',relicOwner:'叶蘅',lodging:'陈伯独立客房'}` |

## 3. 三方（`externals-三方.ink`，`js/qihe-representatives.js` 等）

| 函数 | 实现 |
|---|---|
| `reps_beat()` | flush：把攒下的台词交给 `sayAll` 演完 |
| `cg_begin(shot)` | 先 flush，之后台词进 `cgRows` |
| `cg_end()` | `QiheFireCinematic.play(shot, cgRows)`（10 §4） |
| `reps_note(key, value)` | `ctx.p.questions[key]=value` |
| `reps_told(told)` | `ctx.p.records.told_about_stranger=told` |
| `reps_stranger_gift()` | `strangerGift('c1-07', 50)`：宋先生谢礼，修为 50，只发一次 |
| `reps_errand()` | `QiheOutsiders.talk(id)` 转跑腿对话 |
| `reps_evidence()` | 转主线对证 `ctx.evidence()` |
| `errand_accept()` | `q.stage='accepted'`，存档；之后 toast `已接：<任务名>` 1600ms |
| `errand_choice(n)` | 记交差时二选一结果 |
| `reps_hand_roster()` | 背包 `qh_song_roster` −1，`records.roster_given=true` |
| `lamp_omen()` | `giveOmen('归')` |
| `fortune_omen(kind)` | `giveOmen(kind)`，kind∈行/安/归：记入灯支线状态 `luck`，toast `得了一句吉利话 · 先生说：…` 2200ms；三句为 行`这两天跟人过招，不吃亏`、安`磕了碰了也好得快`、归`这两天跟人好好处，人家记你的好`；无数值加成 |
| `lamp_reward(kind)` | 只发一次：blade＝《守烛心经》+铜灯牌+修为 60；book＝《薪火功》；fare＝银两 10；显示获得 |

## 4. 风起主线（`externals-风起主线.ink`，`js/qihe-chapter.js` `play` 的 `base` 与各调用处）

| 函数 | 实现 |
|---|---|
| `fq_beat()` | flush（无其他动作） |
| `fq_go_area(key, anchor)` | `QiheExpansion.go(key, anchor||'entry')`；key∈south/east/west/north/refuge |
| `fq_go_local(place, anchor)` | `QihePrologue.goLocal(place[, anchor])`（anchor 为空串时不传） |
| `fq_cg_begin(shot)` | 先 flush（base 里所有函数都被包成“先演完攒下的台词再执行”），记 shot，之后台词进 `cgRows` |
| `fq_cg_end()` | `QiheFireCinematic.play(shot, cgRows)` |
| `fq_answer(value)` | 存为 `play()` 返回值（如 main/normal/again/stop/go） |
| `fq_days_begin()` | `S.qiheChapter.stage='days'` |
| `fq_starter_gear()` | 发初始装备；有所得时 `line('获得', '<物品> ×1、… · 江湖→装备，双击穿戴。')`（名牌“获得”，灰色）；叶蘅入队（队伍<3）；存档 |
| `fq_song_gift(key)` | 宋先生谢礼 `c1-00b/c1-s1/c1-s2`，修为默认 40（报告不全 30），只发一次 |
| `fq_lesson_battle()` | 循环 `storyBattle('lesson')` 直到赢；每败播 `fq_lesson_retry`，其 `fq_answer` 为 `stop` 时结束 |
| `fq_grant_lesson()` | 学《护路棍法》第一层 `qh_hulu_staff`，给练习棍、笔记，无武器时自动装备练习棍，存档 |
| `fq_aqi_steal(key)` | `qihe-aqi.js lesson`：偷窃小游戏直到成功；失败播 `fq_aqi_again`；累计 3 次失败播 `fq_aqi_pity` 并算教会；`aqi_lesson_coin` 一次成功播 `fq_aqi_quick` 并好感 +5 |
| `fq_aqi_learn()` | 学会“窃”，窃术经验 +3，存档，toast `学会“窃” · 窃术一级 · 墨印菜单第八枚印已开` 2400ms |
| `checkpoint()` | 主线版 `QihePrologue.checkpoint()` |

## 5. CG 镜头 id 使用处

| 函数 | 剧本 | shot |
|---|---|---|
| `cg_begin` | 三方-侧口对峙 / 三方-对证 | `cen`、`shen`、`xu` |
| `fq_cg_begin` | 奇遇-北坡石洞 | `cave` |
| | 支线-蔺管事-赏书 | `lamp_blade` |
| | 风起-收拾药箱 | `relics` |
| | 风起-红绳 | `rope` |
| | 风起-起火 | `ignition`、`evacuation` |

## 6. Godot 实现要点

- 用一个 `StoryDirector` 节点承接所有 EXTERNAL：ink 回调里只入队，`Continue()` 之后、显示台词之前逐个 `await`。
- 按“场景包装层”（序章 / 主线 / 三方）注入不同实现表；未提供的声明函数调用即报错。
- `flag` 必须支持 lookahead 且读取待写值。
