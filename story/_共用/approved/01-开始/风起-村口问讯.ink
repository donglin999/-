// 风起栖河 · 村中活动：问讯（C1-A-inquiry）
// 地点：陈伯家门厅或西田埂（周砚）／东埠（沈雁回）　在场：萧白、叶蘅，周砚或沈雁回
// 戏眼：萧白想替叶蘅弄清来人到底要什么；问的人各有来意。散场时叶蘅知道周砚是来找父亲的，或沈雁回答应先放病人的药。
// 2026-10-19 风起主线批次：从 js/qihe-chapter.js activityBody('inquiry') 搬入。
// 2026-10-19 剧情三道关改写（戏眼卡 xiaojianghu/docs/design/scripts/briefs/fengqi-main-actors-brief.json）：周砚已在药棚门口自我介绍过时，不再把来意重说一遍，改由叶蘅问父亲最后的消息（新增 C1-A-inquiry-A1b～A3b）；沈雁回的三句保持她的口吻不动。
INCLUDE ../_共用/externals.ink
INCLUDE ../_共用/externals-风起主线.ink
VAR shen_open = false // 参数：第二天起（halfDay>=2）沈雁回已到东埠
VAR zhou_west = false // 参数：周砚这时在西田埂（不用去陈伯家）
VAR met_zhou = false // 参数：周砚已在药棚门口见过叶蘅（xu-meeting 之后）

=== fq_act_inquiry ===
萧白：（叶蘅家的事，先去问谁好？） #id:C1-A-inquiry-01
* [“去问问周先生。”]
    ~ set_flag("qiheChapter.choices.inquiry", "friend")
    { not zhou_west:
        ~ fq_go_local("chen_hall", "")
    }
    { met_zhou:
        叶蘅：周先生，您上回说认得我父亲。您最后一回见他，或是收到他的信，是什么时候？ #id:C1-A-inquiry-A1b
        周砚：我也好些年没他的信了。这回来，就是想问他回来过没有。 #id:C1-A-inquiry-A2b
        叶蘅：……要是有了他的消息，请先告诉我。 #id:C1-A-inquiry-A3b
    - else:
        周砚：你是叶姑娘吧？我早年认得你父亲温行舟，来问问他的消息——不是来收箱子的。 #id:C1-A-inquiry-A1
        叶蘅：要是有他的消息，请先告诉我。 #id:C1-A-inquiry-A2
    }
    周砚：那是自然。 #id:C1-A-inquiry-A3
* {shen_open} [“去问问查药的沈姑娘。”]
    ~ set_flag("qiheChapter.choices.inquiry", "court")
    ~ fq_go_area("east", "chengduo")
    沈雁回：我替程巡检查这趟药。可采办那张单子说药早验过了，还说叶家答应交样——我正要找当初看药的大夫对一对。 #id:C1-A-inquiry-B1
    叶蘅：这几天没有查药的人来过药棚，怎么就验过了？我也没答应过什么。 #id:C1-A-inquiry-B2
    沈雁回：好，我记下了。病人的药先放行，单子的事我再查。 #id:C1-A-inquiry-B3
- -> END
