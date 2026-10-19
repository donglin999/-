# 路线：fq_bandit（01-开始/风起-随口一句.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 6 条路线。

## 路线 1：late=false，qiheChapter.talkCycle=0

- 帮众：看什么看？有事找我们岑姑娘去，她就在南村车道旁。
  〔set_flag("qiheChapter.talkCycle", 1)〕

## 路线 2：late=false，qiheChapter.talkCycle=1

- 帮众：别在这儿晃。岑姑娘交代过，不许跟村里人起冲突——你别逼我。
  〔set_flag("qiheChapter.talkCycle", 2)〕

## 路线 3：late=false，qiheChapter.talkCycle=2

- 帮众：这破村子，连口像样的酒都没有。……你也是来打听那只匣子的？
  〔set_flag("qiheChapter.talkCycle", 0)〕

## 路线 4：late=true，qiheChapter.talkCycle=0

- 帮众：看什么看？有事找我们岑姑娘去，她在东埠装卸路。
  〔set_flag("qiheChapter.talkCycle", 1)〕

## 路线 5：late=true，qiheChapter.talkCycle=1

- 帮众：别在这儿晃。岑姑娘交代过，不许跟村里人起冲突——你别逼我。
  〔set_flag("qiheChapter.talkCycle", 2)〕

## 路线 6：late=true，qiheChapter.talkCycle=2

- 帮众：这破村子，连口像样的酒都没有。……你也是来打听那只匣子的？
  〔set_flag("qiheChapter.talkCycle", 0)〕
