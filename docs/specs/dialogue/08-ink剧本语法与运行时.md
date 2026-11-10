# 08 ink 剧本语法、构建检查与运行时

源：`story/**/*.ink`、`story/_共用/`（`externals*.ink`、`flags*.json`、`speakers.json`、`approved.json`）、`tools_story/build_ink.cjs`、`js/story-runtime.js`、`js/qihe-chapter.js` `play`、`js/qihe-representatives.js` `play`/`linesOf`。

Godot 方案：用 GodotInk（ink 官方 C# 运行时）直接加载 `.ink.json`，保持同一套剧本；下列解析与调度规则在 GDScript/C# 里重写。

## 1. 文件约定

- 位置：`story/01-开始|02-培养|03-游历|04-终局/*.ink`；`_共用/` 下文件不单独编译。当前只有 `01-开始`（约 50 个文件，1403 句）。
- 文件头必须有一行 `// 戏眼：……`，其余 `//` 注释任意。
- 头部 `INCLUDE ../_共用/externals.ink`（及需要的 `externals-风起主线.ink`、`externals-三方.ink`）。
- 参数变量：`VAR 名 = false // 参数` 或 `VAR 名 = "" // 参数`，由 JS 在开演前写入（`vars`）。
- 结构：`=== knot ===`（场景入口）、`= stitch`（子段）、`=== function f() ===`（ink 函数）、隧道 knot（含 `->->`，只能被调用）。一个文件可有多个 knot；编译产物 `js/story-data/<首个 knot>.js` 把所有 knot 名都挂到同一份 JSON：`STORY_DATA[k1]=STORY_DATA[k2]=…=<json>`，并写 `window.STORY_EXTERNALS=[全部声明的 EXTERNAL 名]`。

## 2. 台词行语法

```
说话人：台词 #id:编号 [#mood:表情]
【字幕卡文本】 #id:编号
```

- 说话人：行首 1–12 个不含 `：【（` 的字符，后接全角冒号 `：`。必须在 `speakers.json` 里。
- 字幕/旁白：整行以 `【` 开头，运行时去掉首尾 `【】`，说话人为空 → 走旁白样式（03 §1）。用于时间地点卡，如 `【第三夜 · 药棚装卸侧口】`。
- 内心独白：照常写说话人，台词用全角括号，如 `萧白：（嗓子眼儿总算不冒火了。）`，样式无特殊处理。
- 说话人带后缀：`叶蘅 · 心想：……`（名牌照显示，立绘取 `叶蘅`）。
- `#id:` 必填且全局唯一（如 `P-01-08`、`C1-04-04`、`R3-01`）；`#mood:` 选填，必须在该说话人登记表情内。
- `#cast:萧白,叶蘅`：写在 knot 第一行的说明性标签，**运行时不读**（站位以 11 的站位表为准）。
- 选项：`* [选项文字]`（一次性）或 `+ [选项文字]`（可重复）；方括号内文字是按钮文本，不会作为台词再显示。
- 逻辑行：`~ 函数(...)` 调用 EXTERNAL；`{ 条件: … - else: … }` 分支；`-> 目标`、`-> END`。

## 3. 构建检查（`build_ink.cjs`，Godot 侧可做成编辑器工具）

逐行（去掉 `//` 注释后）：
- 调用的函数必须在 `externals*.ink` 用 `EXTERNAL f(` 声明，或是本文件 ink 函数，或 ink 内建（`CHOICE_COUNT|TURNS|TURNS_SINCE|SEED_RANDOM|RANDOM|INT|FLOAT|FLOOR|LIST_*`）。
- `flag("路径")`/`set_flag("路径", 值)` 的路径必须在 `flags*.json` 登记；`set_flag` 的值必须在登记 `values` 内；登记的 `part` 不得晚于当前文件所属部分。
- 非逻辑行（不以 `~ * + - = { } INCLUDE EXTERNAL VAR CONST #` 开头）视为台词，须有说话人或以 `【` 开头；说话人须存在；须有不重复的 `#id`；`#mood` 须登记。
- 编译用 inkjs Compiler；断线检查（读而无人写、写而无人读）；路线穷举（只对本 knot 读到的标记分支，布尔参数各跑真假，字符串参数取比较过的字面值，上限 400 条），每句台词至少被一条路线覆盖。
- 已批准剧本指纹（sha256）变动则构建失败，需 `--approve`。
- 产出：`js/story-data/*.js`、`docs/story-lines.csv`（编号,部分,剧本,场景,说话人,表情,台词）、`docs/story-routes/<knot>.md`、`speakers.json`（从 `xiaojianghu/bible/人物/*.md` 的 frontmatter `姓名`、`表情`、`名牌别称` 生成）。

## 4. 运行时 `StoryRuntime.play(knot, {line, externals, vars})`

1. 取 `STORY_DATA[knot]`，没有则抛 `剧本未编译或未加载：<knot>`。新建 `inkjs.Story`，写入 `vars`。
2. 函数实现 = 默认 ∪ externals（后者覆盖）：
   - `flag(p)`：读 `S` 上的点路径，`null/undefined` → `false`。
   - `set_flag(p,v)`：写点路径，途中缺对象自动建 `{}`。
   - `checkpoint()`：`S.x=player.x;S.y=player.y;save()`。
   - `toast(t)`：`toast(t, 2800)`；`toast_for(t, ms)`：`toast(t, ms)`；`mark()`：空。
   - 例外：主线开始前（`S.qiheChapter` 不存在）读写 `qiheChapter.*` 路径时只记在内存表 `early`，不建出 `S.qiheChapter`。
   - `STORY_EXTERNALS` 里本场没提供的函数绑成“调用即抛错 `剧本 <knot> 调用了本场没有提供的游戏函数 <name>`”。
3. **同步→异步调度**：ink 外部函数是同步的。绑定时：
   - `flag`：允许 lookahead（唯一的 `LOOKAHEAD_SAFE`）；若该路径有待写入的 `set_flag`，返回待写值（先写后读一致）。
   - `set_flag`：记入 `pending`，把真正写入排进 `queue`，返回 null。
   - 其他函数：把调用排进 `queue`，返回 null（**ink 拿不到返回值**；需要回传的用 `fq_answer` 之类写进 JS 变量）。
4. 主循环：
   ```
   ChoosePathString(knot)
   loop:
     while canContinue:
       text = Continue(); await 依次执行 queue
       空白行跳过
       l = parse(text, currentTags)
       若 !canContinue 且有选项：mark(l.id)；i = await choose(l.who, l.text, 选项文本)；ChooseChoiceIndex(i)；continue
       await show(l)   // line(id, who, text, {mood}) 或 say(who, text)
     await 执行 queue
     无选项 → 结束
     i = await choose('', ' ', 选项文本)；ChooseChoiceIndex(i)
   ```
   即：**选项前最后一句台词就是选择框的题干**（不单独播放），题干的说话人立绘照常显示；没有题干时题干为一个空格的旁白。
5. `parse(text, tags)`：`text.trim()` 匹配 `/^([^：【（]{1,12})：(.*)$/s` → `who`、`text`；否则 `who=''`、`text` 去首尾 `【】`。`id`/`mood` 取 `id:`、`mood:` 标签。

## 5. 场景包装层（台词怎么被演出）

- **序章**（`prologue-arrival.js`、`prologue-water.js`、`qihe-map-trial.js`）：`line(id,who,text)` = `mark(id)`（发 `prologue-arrival-step`/`prologue-cg-step` 事件）+ `say(who,text)`，逐句即时演出。
- **主线** `QiheChapter.play(knot, externals, vars)`（`qihe-chapter.js`）：
  - `vars` 只保留本剧本 JSON 里声明过的变量（检测 `"VAR=":"名"`）。
  - `line` 不立即演，把 `[who, text, spriteWithMood(who,mood)]` 推入 `buf`；在 `fq_cg_begin` 与 `fq_cg_end` 之间推入 `cgRows`。
  - `flush()`：把 `buf` 交给 `sayAll(rows)` 一次演完（地图临时站位 + 立绘作用域，见 07/11）。
  - 任何 EXTERNAL（含 `fq_beat`、`checkpoint` 等）执行前先 `flush()`；`choose` 被临时替换为“先 flush，再在 `qh-choice` 作用域里出选项，题干表情取 `moods[题干id]`”。
  - `fq_answer(v)` 把值存为 `play` 的返回值；`mark(id)` 记题干 id。
- **三方** `QiheRepresentatives.play(knot, {say, ask}, externals, vars)`：同样攒 `buf`，`reps_beat` 即 flush，`cg_begin` 先 flush 再进 CG 模式，`choose` 替换为 flush 后调场景的 `ask`（支持嵌套 `depth`）；`line` 不带表情。
- `linesOf(knot)`：不演出，同步跑完无选项的 knot 返回 `[[who,text],...]`（EXTERNAL 全部绑空函数，`flag` 恒 false）。用于 `fireDemand`/`fireCollision`。
- 剧情出错：主线 `guarded()` 捕获后记录 `S.qiheChapter.storyError {key,count,message,at}`，toast 6000ms `剧情续接出错（key，连续第 n 次）：message。进度停在出错前，可稍后重试；反复出现请反馈。`，最后恢复 `busy/dlgBusy`、隐藏对话、存档。
