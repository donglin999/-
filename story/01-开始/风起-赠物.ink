// 风起栖河 · 村中活动后的赠物（枣木短棍、铜针囊）
// 地点：枣木短棍在陈伯家门厅（修车认路做完后回去找他），铜针囊随药棚帮忙所在处　在场：陈伯或叶蘅、萧白
// 戏眼：帮过忙的人顺手把用得上的东西塞给萧白。散场时萧白多一件初始装备。“获得”提示是游戏界面，留在 JS。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js activityBody() 末尾搬入。
// 2026-10-23 剧本一：切磋稿 npc-spar-and-insight.md P8「A」——枣木短棍改由陈伯本人在他家门厅当面给（原为陆衡转交）；修车、送老人两支都一样给。铜针囊不动。
//   运行侧已改（2026-10-27）：修车认路做完后门厅的陈伯挂任务标记，找他才播 fq_gift_club 并发短棍（js/qihe-chapter.js clubGift、js/qihe-expansion.js）。2026-10-27 用户授权 Claude 代审，已冷读、批准（--approve）。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink

=== fq_gift_club ===
陈伯：回来了？来，这根枣木短棍我给你削好了。沉手，赶路时防个身也好。 #id:C1-A-gift-club
-> END

=== fq_gift_needles ===
叶蘅：这袋铜针搁着也是落灰。你收着，路上防个身。 #id:C1-A-gift-needles
-> END
