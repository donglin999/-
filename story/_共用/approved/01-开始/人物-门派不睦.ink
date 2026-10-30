// 风起栖河 · 门派不睦：萧白和某一方闹到“厌恶”以下，这一方的门人不肯和他换东西、指点、过招，点灰印时说一句（faction-reputation.md 7.2；knot 名 npc_<人物 id>_faction_no，js/qihe-npc-core.js menuFor 挂上）。
// 戏眼：门人不是记恨萧白本人，是自家那一方吃过他的亏、上头传过话；一句话把门关上，不解释来龙去脉。
// 2026-10-27 我写：开始部分已上图的四个门人各一句（R-剧情-06 不撞句）；管事、乌魁、采办使还没上图，上图时再补。改动等剧情评审。
// 2026-10-29 逻辑排查（评审台，用户授权 Claude 代评剧情）：差役自己是巡江司的，改“我们巡江司”。
INCLUDE ../_共用/externals.ink

=== npc_aide_faction_no ===
采办随从：上头交代过，你的事我们司里不沾。别耽误我送货。 #id:QN-aide
-> END

=== npc_bailiff_faction_no ===
差役：你跟我们巡江司那笔账还没清，我不好替你开口子。 #id:QN-bailiff
-> END

=== npc_retainer_faction_no ===
护院：盟里有话，跟你少打交道。请回吧。 #id:QN-retainer
-> END

=== npc_bandit_faction_no ===
帮众：堂里的兄弟都记着你呢。滚远点，别让我动手。 #id:QN-bandit
-> END
