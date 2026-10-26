// ── 2026-10-19 三方批次（三方代表与跑腿）：js/qihe-representatives.js、js/qihe-outsiders.js 绑定 ──
// 这些剧本由 QiheRepresentatives.play() 播放：台词按段攒起来交给场景原有的 sayAll（站位不变），选项交给原有的 ask。
EXTERNAL reps_beat()                // 分段：把攒下的台词先演完（相当于原来两次 sayAll 之间的停顿）
EXTERNAL cg_begin(shot)             // 起火插画：之后的台词进插画（QiheFireCinematic 的镜头 id，如 "cen"）
EXTERNAL cg_end()                   // 播放插画，并把这段台词放在插画里演
EXTERNAL reps_note(key, value)      // 记三方对话进度：ctx.p.questions[key]=value（如 "xu"=0/1，"xulingyi-dispute"=true）
EXTERNAL reps_told(told)            // 对证时是否说出宋先生：ctx.p.records.told_about_stranger
EXTERNAL reps_stranger_gift()       // 说出宋先生后：沈雁回只记样子不收东西，并补发宋先生谢礼（c1-07，修为 50）
EXTERNAL reps_errand()              // 找人交谈时选“跑腿”：转到 QiheOutsiders.talk(id)
EXTERNAL reps_evidence()            // 找人交谈时选“把三张附页放一起对一对”：转到主线对证
EXTERNAL errand_accept()            // 跑腿：答应帮忙（任务记为已接）
EXTERNAL errand_choice(n)           // 跑腿：回话时的二选一（记入任务 choice）
// ── 2026-10-23 对证断线版与归烬堂支线（蔺管事线，剧本三；JS 未接，接口见共用笔记 42-剧本三.md）──
EXTERNAL reps_hand_roster()         // 对证时交出后山记人笺：从随身物品移走 qh_song_roster，记 records.roster_given=true（偷窃稿第 8.4 节）
EXTERNAL lamp_omen()                // 算命摊测字：给一种小吉兆（地图可交互物稿第 5.5 节，行／安／归三类之一，约一天）
EXTERNAL lamp_reward(kind)          // 蔺管事酬谢，只发一次并显示“获得”："blade"《守烛心经》＋铜灯牌＋经验；"book"《薪火功》；"fare" 路费 10 两
