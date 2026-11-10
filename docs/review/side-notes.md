# 开始部分可选内容与村镇杂项 · 移植记录

状态：现行　最后核对：2026-11-03

## 文件与原版对应

| Godot | 原版 | 内容 |
| --- | --- | --- |
| `game/scripts/flow/side.gd` | 各模块共用的 guarded/gain/play、`qihe-milestones.js`、`qihe-navigation.js`（目标选择部分） | 子模块装载、chapter.gd 调用的接口、江湖经历、行程追踪 |
| `side_outsiders.gd` | `qihe-outsiders.js` | 三方跑腿 |
| `side_lamp.gd` | `qihe-lamp-watcher.js` | 蔺管事／算命先生、船家 |
| `side_town.gd` | `qihe-town.js` | 客栈（店家、帮众、住客簿、灶台、箱笼、三天酒钱、风声）、菜牌、木桶、古井、算命摊、东埠摆设、货郎（买卖、断扁担、换话）、孩子猜字谜、商店 |
| `side_treasure.gd` | `qihe-treasure.js` | 14 处宝箱／隐藏点的开放与奖励 |
| `side_aqi.gd` | `qihe-aqi.js` | 小耗子的一课、“窃”教学、行记条目 |
| `side_resources.gd` | `qihe-resources.js` | 16 处物资点采集、交付配方、野外行囊面板 |
| `side_hidden.gd` | `qihe-hidden.js` | 老更夫、北坡石洞（原版 CAVE_ON=false，同样关着）、帮众挑衅／阿炭、百家平安符 |
| `side_banter.gd` | `qihe-banter.js` | 闲话与交情规则（静态函数，数据读 `data/npc/banter.json`） |

装载顺序与原版 index.html 一致：outsiders → lamp → town → treasure → aqi → resources → hidden；后装的包裹前装的 act。

## 已知差异与待办

- **宝箱存档字段**：原版存 `S.qiheTown.chests`，`Flow.chest_opened` 读 `S.qiheTown.opened`。现在两处都写、读时任一为真即算开过；建议主会话把 `Flow.chest_opened` 改读 `chests`，与原版存档兼容。
- **偷窃小游戏**：原版 `QiheStealUI.minigame`。这里调用 `Npc.steal_minigame(npcId, item, rate, tier, perks)`（人物交互子任务提供），没有时按成功处理。
- **交易面板**：原版 `QiheGiftUI.shop`。这里调用 `Npc.shop(npc, person, opts)`，没有时退回原版旧的选项框（逐行“名字 · 价 两”）。
- **好感**：`Npc.bond_add(id, d, opt)`；**江湖声望**：`Menu.jianghu_settle(kind, opt)`（卖《扬灰手》给岑霜时归烬堂 −3）。都没有时跳过。
- **阿炭比划**：走 `Flow.run_battle`，战斗模块未就绪时按胜利处理。
- **野外行囊面板**：原版 `qihe-hud.css` 隐藏了按钮，B 键也因 `QiheJianghuUI` 存在而不响应，实际进不去。照移植了面板，入口是 `Side.resource_inventory()`，没有绑 B 键。
- **货郎担换图**：原版用 getter，这里在 show 里同步 `n.prop`。
- `qh_refuge` 的 `retainer-refuge` 归主线扩展模块，本模块不挂。
- 小地图画面归 HUD；本模块只给 `nav_guide / nav_target_node / nav_track_npc / nav_track_activity`。

## 检查

- 九个脚本都能加载、实例化；七个子模块挂上后，村中、南村口、东埠、西田埂、北坡、邻村、客栈内的节点都已换成 Callable（只剩上面那一个）。
- 用新存档做过逻辑抽查：时段判断、宝箱显示、物资点、行程目标、江湖经历返回值都正常。对白流程与界面需要主会话在窗口里截图对照。
