// 风起栖河 · 倒木旁再搭话（宋先生）
// 地点：后山采药路倒木旁　在场：宋先生、萧白
// 戏眼：本该回话的事已经说完，萧白又凑过去；宋先生只想把他打发走、别在这儿多待。散场时什么都没变，宋先生照旧翻账。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js strangerTalk() 搬入。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink
VAR first_day = false // 参数：第一天（halfDay=0）

=== fq_song_idle ===
{ first_day:
    宋先生：明早我还在这儿。她父亲的事，我记着。 #id:C1-S-idle-01
- else:
    宋先生：说了记着。明早还在这儿。 #id:C1-S-idle-02
}
-> END
