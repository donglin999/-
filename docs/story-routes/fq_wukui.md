# 路线：fq_wukui（01-开始/风起-随口一句.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 3 条路线。

## 路线 1：qiheChapter.talkCycle=0

- 乌魁：瞅什么？没见过人？
  〔set_flag("qiheChapter.talkCycle", 1)〕

## 路线 2：qiheChapter.talkCycle=1

- 乌魁：滚远点！老子这会儿没空跟你磨牙。
  〔set_flag("qiheChapter.talkCycle", 2)〕

## 路线 3：qiheChapter.talkCycle=2

- 乌魁：哼，上回那笔账还没算完……你又替谁跑腿？
  〔set_flag("qiheChapter.talkCycle", 0)〕
