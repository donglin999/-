# 路线：fq_aide（01-开始/风起-随口一句.ink）

生成物，由 tools_story/build_ink.cjs 遍历标记取值与全部选项得到，不手改。共 3 条路线。

## 路线 1：qiheChapter.talkCycle=0

- 采办随从：我就是个点篓子的。药单的事，你问沈姑娘去。
  〔set_flag("qiheChapter.talkCycle", 1)〕

## 路线 2：qiheChapter.talkCycle=1

- 采办随从：三篓、两篓……别跟我说话，一打岔又数乱了。
  〔set_flag("qiheChapter.talkCycle", 2)〕

## 路线 3：qiheChapter.talkCycle=2

- 采办随从：上头只说来收药，谁知道一来就撞上这么多事。
  〔set_flag("qiheChapter.talkCycle", 0)〕
