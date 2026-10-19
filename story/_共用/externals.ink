// 游戏函数声明（EXTERNAL）：ink 只调用，具体实现在 js/story-runtime.js 绑定到现有游戏函数。
// 新增函数要同时在这里声明、在 story-runtime.js 绑定；构建检查会拦住未声明的调用。

EXTERNAL flag(path)                 // 读存档标记，路径如 "prologue.arrival.borrowed"；须在 flags.json 登记
EXTERNAL set_flag(path, value)      // 写存档标记；取值须在 flags.json 登记范围内
EXTERNAL go_scene(scene, anchor)    // 换场：场景 id、地图锚点名
EXTERNAL checkpoint()               // 存档点
EXTERNAL toast(text)                // 屏幕提示
EXTERNAL mark(id)                   // 记录进度编号（给行记、测试用）
EXTERNAL clinic_stage()             // 药棚内摆好叶蘅、陈伯等人的站位
EXTERNAL change_into_village_clothes()  // 淡出换装：现代装→粗布衣，并存档

// ── 2026-10-18 第 2 期（开始部分其余场景）──
EXTERNAL toast_for(text, ms)        // 屏幕提示，指定停留毫秒数（原 JS 里各处时长不同，原样保留）
// 后山（js/prologue-arrival.js 绑定）
EXTERNAL backhill_show(shot)        // 后山站位："encounter" 相遇／"dog" 遇狼
EXTERNAL backhill_guard(on)         // 萧白抄木杆戒备（true）／放下（false）
EXTERNAL backhill_retreat()         // 狼群退走
EXTERNAL wolf_battle()              // 后山遇狼战斗；输了弹“重新挑战／稍后再试”，选稍后再试则本段中止
EXTERNAL water_scene()              // 播递水剧本（含唯一 CG），并把三选一结果记入 prologue.arrival.originExpression
// 递水（js/prologue-water.js 绑定）
EXTERNAL hide_water_cg()            // 收起递水 CG
EXTERNAL water_branch(branch)       // 把三选一结果（"A"/"B"/"C"）交回调用方；本身不写存档
// 第一夜（js/qihe-map-trial.js 绑定）
EXTERNAL carry(item, count)         // 给受托物品：S.prologue.carry[item]=count（bowls 碗、cloth 布包、medicine 药包、basket 竹篮）
EXTERNAL uncarry(item)              // 交出受托物品：从 S.prologue.carry 删除
EXTERNAL night_falls()              // 淡出，画面转夜色
EXTERNAL hand_off_first_night()     // 第一夜收尾：清空随身受托物，写风起栖河交接记录 S.prologue.handoff
