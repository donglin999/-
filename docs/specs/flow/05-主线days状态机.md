# 05 主线：清晨开场与 days（三天六时段）状态机

源：`qihe-chapter.js`（`beginBody/mainStep/MAIN_STEPS/mainOffer/arrive/rest/advanceEvents/event/activityBody/interact/guarded/play`）；`qihe-aqi.js`（`pending/AQI_STEP/call`）；剧本 `风起-次日药摊.ink`、`风起-主线找人.ink`、`风起-学棍/修车认路/药棚帮忙/集市帮忙/赠物/随口一句.ink`。

## 1. 主线剧本运行器 `QiheChapter.play(knot, externals, vars)`

- `vars` 只传本剧本 JSON 里声明过 `"VAR=":"<名>"` 的键。
- 台词按段攒 `buf`，遇到选项、任意外部函数或剧本结束时 `flush()` → `sayAll(rows)`：先 `placeCast()` 临时在玩家周围摆最多 5 名配角（优先用其原站位，距玩家 <250px；否则依次试偏移 `[-110,-25][110,-30][-190,70][180,75][0,-125][-80,110][90,120][-210,-100][210,-90]`，要求 `standOk` 且与已摆的人距离 >55），朝向面向玩家，`cast:true`（被遮挡半透明）；演完还原。`QiheStaging.active()` 时不摆；`QiheOffstage` 集合中的人（画外音）不摆。别名 `蔺管事→算命先生`、`阿炭→新来的`。
- 立绘情绪：剧本台词 `#mood:x` ⇒ 立绘 `castSprites[who]+':'+x`。选项框情绪取上一句 `mark(id)` 对应的 mood。
- 通用 externals：`fq_beat`（分段）、`fq_go_area(key,anchor='entry')`=`QiheExpansion.go`、`fq_go_local(place,anchor)`=`QihePrologue.goLocal`、`fq_cg_begin(shot)`/`fq_cg_end()`（期间台词进插画，结束 `QiheFireCinematic.play(shot,rows)`；shot ∈ relics/ignition/evacuation/rope）、`checkpoint`、`fq_answer(v)`（返回值，不写档）。
- 陈伯在 stage ∈ {refuge,mountain,ended,cultivation} 时立绘换 `c_qh_chen_rest_story`。

## 2. `guarded(fn)`（所有主线入口的外壳）

`running` 时直接忽略；进入：`busy=true`、清键与寻路、`DialogueStage.begin({id:'qh-chapter'})`；异常 ⇒ `storyFailed(e)`：`p.storyError={key:pendingEvent||stage||'主线开始前',count(同 key 连续+1),message,at}`，toast“剧情续接出错（key，连续第 n 次）：msg。进度停在出错前，可稍后重试；反复出现请反馈。”6000ms，**不跳过**。成功且 `storyError.key` 已不等于当前 key 时删除。finally：恢复进入时的 `busy/dlgBusy`、隐藏 `#dlg`、`savePoint()`、`QiheExpansion.refresh()`。

## 3. 清晨开场 `begin()` → `beginBody()`

触发：过夜后再点客房榻（04 §6）。`stage!=='opening'` ⇒ `resumeBody()`。
`initial()`：`{version:2,storyRevision:2,stage:'opening',halfDay:0,choices:{},events:{},consent:{},questions:{...S.prologue.outsiders.contacts.questions},coreOwner:'叶蘅',coreIntact:true,chenCare:null,roadResult:null,granted:false}`（`state()` 首次调用时创建）。
剧本 `fq_morning`：`fq_go_area("south","merchant")` →“【次日 · 南村药摊】”→ 叶蘅/药商/陆衡对话 → `fq_days_begin()`（`stage='days'`）→ 周婶给短打 → `fq_starter_gear()`：`grantStarterEquipment()`（arrival→`cloth` 粗布衣），有新得物显示“获得：<名> ×1 · 江湖→装备，双击穿戴。”；叶蘅入队：`S.party` 无 `'ye'` 且长度<3 则 push，`S.qiheRoster.members` 同步；存档 → 周婶托收竹匾（可选，见 13）。
其后：`QiheAqi.call()`（小耗子远处喊一声，仅一次，`aqiTeach.called=true`）→ 旁白“可以在村里自由走动、帮忙和问话。主线的下一步写在左上角行程里；想学武，去西田埂找陆衡。”。

## 4. 时段与主线步骤

`halfDay`：0=第一天白天，2=第一天傍晚后（第二天白天），4=第二天傍晚后（第三天上午），5=第三天收拾药箱后，6=离村。

`MAIN_STEPS`：
| to | npc | who | title | where | scene |
|---|---|---|---|---|---|
| 2 | ye | 叶蘅 | 去药棚见来客 | 村中药棚（周婶那里） | prologue_clinic_interior |
| 4 | ye | 叶蘅 | 陪叶蘅去东埠送药 | 东埠装卸路 | qh_east |
| 5 | ye | 叶蘅 | 回叶家收拾药箱 | 村西北 · 叶家 | prologue_ye_house |
| 6 | luheng | 陆衡 | 傍晚随药车离村 | 西田埂 | qh_west |

`mainStep(p)`：非 days ⇒ null；`QiheAqi.pending()`（days 且 halfDay===0 且未学会“窃”）⇒ `AQI_STEP={aqi:true,npc:'aqi',who:'小耗子',title:'客栈门口的小耗子在喊你',where:'中央村落 · 客栈门口',scene:null}`（不推进时段）；否则第一个 `to>halfDay` 的步骤。

推进方式两种：
1. **走进场景**：上述 4 个 scene 的 `enter` 被包装，进场后 `arrive(id)`：非 `running`、days、`mainDismissed!==halfDay`、`mainStep.scene===id` ⇒ `guarded(mainOffer)`。
2. **找人说话**：`interact(id)` 中 `m.npc===id`（且非 aqi 步）⇒ 先 `play('fq_main_'+m.to)`（一句），再 `mainOffer`；若选“再等等”，叶蘅转 `clinic` 活动、陆衡转 `practice` 活动（仍开放且未做时）。

`mainOffer(m)`：`ask('主线','进入下一时段：'+title+'。'+(to===6?'离村后就不能再回村里了。':''),['开始','再等等'])`；再等等 ⇒ `mainDismissed=halfDay` 存档；开始 ⇒ 删 `mainDismissed`、`halfDay=m.to`、存档、`advanceEvents()`。

## 5. `advanceEvents()` 与 `event(id,fn)`

`event`：已 `events[id]` 跳过；否则 `pendingEvent=id` 存档 → fn → `events[id]=true`、删 `pendingEvent`、存档（读档时由 `resumeBody` 重进）。
顺序：
- `halfDay>=2`：`xu-meeting` = `goLocal('village','clinic')` + `QiheRepresentatives.pressure()`（剧本 `qihe_reps_xu`，`reps_note(key,v)` 写 `p.questions[key]`）；`events.steward=true`。
- `halfDay>=4`：`three-meeting` = `go('east','loading')` + `medicine()`（`qihe_reps_medicine`，VAR `watched` = 答应过宋先生且线未断）；`S.prologue.wolf_cause_testimony_heard=true`，`wolf_testimony_source='陆衡转述北坡车夫见闻'`，`events.medicine=true`。
- `halfDay>=5`：`packing` = `goLocal('ye_house')` + `fq_packing`（插画 relics；选项写 `qiheChapter.packing`=`wrap|ask`）。
- `halfDay>=6`：`stage='fire'` 存档 → `fireBody()`（06）。否则旁白“可以继续在村里走动。主线的下一步写在左上角行程里。”。

## 6. 可选活动（不推进时段，有时限）

`activities`：`[clinic 药棚帮忙 central 4]`、`[transport 修车认路 west 4]`、`[practice 学习丙级《护路棍法》 west 4]`、`[market 集市帮忙 south 5]`；开放 = days 且 `halfDay < 时限`。时限标签 `{2:'第一天傍晚前',4:'第二天傍晚前',5:'第三天收拾药箱前'}`。
`activityBody(id)`：非 days ⇒ `fq_act_busy`；已做 ⇒ `fq_act_done`；过时 ⇒ `fq_act_late`；确认 `ask('行程', 名称+'。'+(practice?'陆衡会传授第一层，赠送练习棍与本人笔记。':''),['现在开始','再想想'])` → 剧本：
- `fq_act_practice`：“来吧！”⇒ `fq_lesson_battle`（见 06 §5 对练战，输了 `fq_lesson_retry`：again/stop）；“我先把招式记熟。”跳过战斗；随后 `fq_grant_lesson`：`S.skills.qh_hulu_staff=max(1,…)`，`bag.qh_practice_staff+1`、`bag.qh_staff_notes+1`，无武器则直接装备练习棍，`granted=true`，`skillSource='陆衡·栖河西田埂'`；`choices.practice='learned'`；旁白“已学：丙级《护路棍法》第一层 · 横杆护身。守路战及后续招式培养可使用。”。
- `fq_act_transport`：`choices.transport='cart'|'elders'`（elders 后村口老人不再出现）；之后旁白“行程：陈伯托人带话：得空去他家门厅一趟。”（短棍待领）。
- `fq_act_clinic`：`choices.clinic='pack'|'visits'` → 发 `needles` 铜针囊 → `fq_gift_needles` +“铜针囊 ×1 · 装备页切换人物，再双击穿戴。”。
- `fq_act_market`：`choices.market='help'|'rumor'`。
结束统一“行程：这件事办完了。”。
技能定义：`qh_hulu_staff={name:'横杆护身',grade:'丙',kind:'棍',key:'str',req:{str:3},needWeapon:'棍',shape:'single',mp:3,pow:1.1}`（弱点削盾1；至本人下次行动前减伤15%）。物品：`qh_practice_staff{q:0,weapon:{kind:'棍',atk:1}}`、`qh_staff_notes{key:1}`。

## 7. 初始装备 `grantStarterEquipment(opt)`

仅 days。行 `[arrival,cloth,true]`、`[transport,club,choices.transport&&opt.club]`、`[clinic,needles,choices.clinic]`；已领（`equipmentRewards[key]`）跳过；已拥有（包里/身上/队友装备）记 `already-owned` 不发，否则 +1 记 `granted`。写入失败回滚 S 并 toast。`clubPending()`=days 且做过 transport 且未领 → 门厅陈伯“!”，交谈 `fq_gift_club` 后发枣木短棍，“枣木短棍 ×1 · 可替换练习棍，仍可施展横杆护身。”。
店家装备店 `STARTER_STOCK=['club','cloth','needles','charm','knife','mianjia']`，价格读 `ITEMS[id].price`，铜钱不足“铜钱不足，需要 N 文”。
