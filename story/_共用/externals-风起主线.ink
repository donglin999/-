// ── 2026-10-19 风起主线批次：js/qihe-chapter.js 绑定（QiheChapter 的 play()）──
// 台词按段攒起来交给场景原有的 sayAll（站位规则不变）；遇到选项或下列动作前，先把攒下的台词演完。
EXTERNAL fq_beat()                  // 分段：先把攒下的台词演完（相当于原来两次 sayAll 之间的停顿）
EXTERNAL fq_go_area(key, anchor)    // 换到风起栖河的外区地图（QiheExpansion.go）：south/east/west/north/refuge，锚点名
EXTERNAL fq_go_local(place, anchor) // 换到村中室内（QihePrologue.goLocal）：chen_hall、ye_house 等；锚点可写 ""
EXTERNAL fq_cg_begin(shot)          // 插画：之后的台词放进插画里演（QiheFireCinematic 的镜头 id：relics、ignition、evacuation、rope）
EXTERNAL fq_cg_end()                // 播放插画，并演完插画里的台词
EXTERNAL fq_answer(value)           // 把选项结果交回 JS 流程（不写存档），如 "main"／"normal"／"again"／"stop"／"go"
EXTERNAL fq_track(npc)              // 行程追踪某个人（QiheNavigation.trackNpc），如 "stranger"
EXTERNAL fq_days_begin()            // 次日药摊之后：主线进入自由走访（stage=days）
EXTERNAL fq_starter_gear()          // 发初始装备并显示“获得”，叶蘅入队，存档
EXTERNAL fq_song_gift(key)          // 宋先生的谢礼（c1-00b／c1-s1／c1-s2），只发一次，显示“获得”
EXTERNAL fq_lesson_battle()         // 陆衡对练：打到赢或玩家说“今天先到这儿”（中间播 fq_lesson_retry）
EXTERNAL fq_grant_lesson()          // 学会《护路棍法》第一层，给练习棍与笔记
