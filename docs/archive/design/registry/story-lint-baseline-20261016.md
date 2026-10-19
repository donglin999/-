# 剧情文案自动检查

状态：历史　最后核对：2026-10-19（2026-10-19 归档，只供追溯）

检查台词 3506 条；需处理 11 条，提示 119 条。

自动检查只覆盖能机器判断的部分；逻辑、动机、人物口吻请按 docs/design/story-writing.md 第一节人工审读。

## 需处理（11）

### MECHANIC · 1 条 · 台词里出现游戏数值或系统用语（关系值、好感、收益、体力值、熟练度、解锁……），人物不会这么说话

- `D-C01-result-02`《寄送近况信》旁白：玩家确认寄出且后台事务成功后，显示已交给捎信人。失败保留原稿与资源，不宣称已送达。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json

### NARRATOR · 7 条 · 旁白句。剧情不用旁白，改成人物台词、心里话或字幕卡（用户 2026-10-08）

- `apprenticeship-1`《》旁白：次日清晨，萧白在院中找到周砚。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `Y-01-end-01`《药签上留着的空白》旁白：两人收好获许可整理的普通材料。叶家旧物仍在叶蘅自己的房间。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `V-01-end-04`《袋底的木屑》旁白：两人保留信与需求草稿；没有自动执行寄物，也没有完成实地回访。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `D-C01-result-02`《寄送近况信》旁白：玩家确认寄出且后台事务成功后，显示已交给捎信人。失败保留原稿与资源，不宣称已送达。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `D-C02-result-02`《赠送普通物品》旁白：选择收件人物与实际物品图卡，确认后才提交。叶家遗物和样品从可送列表排除。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `D-C02-neighbor-01`《赠送普通物品》旁白：物品交给当前可接收的乡邻。这里只确认收到，不把赠物当作伤势痊愈、满意或额外托运承诺。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `D-W04-result-02`《溪畔与近山》旁白：萧白观察已知近路并返回，没有踏进新地图，也没有因此学会高级身法。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json

### RULE_ECHO · 3 条 · 像把设计约束原样塞进台词（codex 稿常见）：“亲见／听说分开记”“不写成一定能办成”“注明来源”“交接”“边界”……一场里出现多次就要怀疑是在凑指标

- `gy_l02`《多出来的半天》hero：交接后也要再对一次？  ← xiaojianghu-legacy-prologue/js（household）
- `gy_l02`《多出来的半天》hero：请教交接怎样写清  ← xiaojianghu-legacy-prologue/js（household）
- `gy_l02`《多出来的半天》hero：交接这页，我想自己写一回。您看哪里还缺。  ← xiaojianghu-legacy-prologue/js（household）

## 提示（119）

### LONG · 47 条 · 一句 41 字，超过 40

- `gy_noodles`《拜师面》shimu：坐。拜师面，一人一碗，谁也不许剩。萧白，你那碗卧了两个蛋——头一天入门，多吃一个。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_noodles`《拜师面》shimu：一，饭桌上不谈打打杀杀。二，受了伤先来报给我，不许硬扛。三，来客无论正邪，先奉一杯茶。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_prelude_tour`《熟悉谷中》zhong：起了起了！师兄说了，头两个月归我管。先认地方，再认活——谷里每块石头我都摸过，跟紧了！  ← xiaojianghu-legacy-prologue/js（household）
- `gy_prelude_tour`《熟悉谷中》zhong：以前种过药，没人会伺候。叶姑娘要是不嫌弃，那块地归你。我明儿给你搭个新晾架，比原来那个高三寸！  ← xiaojianghu-legacy-prologue/js（household）
- `gy_prelude_xinfa`《初识心法》zhou：坐下。不必盘得好看，腰背挺直，肩放松。吸气的时候，想着气沉到脐下三寸；吐气的时候，想着它像云一样散开。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_ledger`《师母的账本》shimu：谷里的米、盐、布、药，都从这本账上出。你师父只管练功，你二师叔只管做东西，没人管钱——所以我管。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_ledger`《师母的账本》hero：把卖出的、赊账的、送人的分成三栏，每栏单独加总……差的三十文，是上个月赊给王婶的两只竹篮。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_night_return`《夜归人》yin：我叫殷红缨，你师父的小师妹。往后叫小师叔。手劲还行，就是反应慢了半拍——下次有人翻墙，先往旁边躲，别往前凑。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_night_return`《夜归人》yin：我是殷红缨，你师父的小师妹。白天的步法别拿来晚上乱用——不过有这份胆子，比你那个只会喊的小师兄强。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_fist_or_sword`《拳先还是剑先》zhong：我再说一遍：先练拳！拳是根，剑是梢。根都没扎稳，剑能往哪儿使？挑一个月水，再出拳，这叫笨功夫——  ← xiaojianghu-legacy-prologue/js（household）
- `gy_fist_or_sword`《拳先还是剑先》yin：笨功夫练出来的就是笨人。他十七了，筋骨都长开了。再挑一个月水，江湖上的人可不等他。先学剑，见过真东西，才知道自己缺什么。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_m05`《雨后这段路》recipient：我替你带话，他愿意说再捎信给你。温先生后来去了哪里，我也说不上。那本旧谱，更没见过。  ← xiaojianghu-legacy-prologue/js（household）
- `gn_chests`《两箱残稿》pei：书里记了一家大族占了民田，又把民夫修的堤报成自家的功劳。后来那一族得了势，告他“谤讪”。书版劈了，学生散了。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gy_goose_steps`《回岚步与鹅》yin：它是谷里最快的东西，比你小师兄还快。规矩很简单：让它追你一炷香，不许被啄到，也不许出这个院子。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_ye_mother`《叶青的手》shimu：……二十年前，我走镖在荆襄翻了车，胳膊折成三段。是一位姓叶的女大夫，在路边给我接上的。她不收诊金，只要了我半袋干粮。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_mid_autumn`《中秋家宴》shimu：萧白，你那身练衣袖口都磨破了，这件冬天套在外头。叶蘅的这件没有门派标记，就是件家常衣裳，天冷了穿。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_mid_autumn`《中秋家宴》yin：……谷里太好了。人一习惯了好，就会怕失去。我怕哪天回来，这个家散了，所以干脆少回来。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_dou_runaway`《小豆想下山》dou：萧白你来了以后，师父天天教你，师叔们抢着教你……我想，我是不是该走了，给你腾地方。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_yin_past`《十几年前的寿宴》yin：那年我十七，头一回跟师父下山赴寿宴。席上有位执事，当众笑一个过世的郎中“私藏秘方，死有余辜”。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_yin_past`《十几年前的寿宴》yin：我掀了。回来以后，师父罚我跪了三天，然后跟我说：红缨，你做得对，可往后归云谷的人去哪儿都要被人多看一眼了。  ← xiaojianghu-legacy-prologue/js（household）
- `visitor_songfeng_route-choice-route_questions-02-989ab9`《近路之外》mo_songnian：独自走，和背着两包药走，是两回事。这坡我前日才看过，眼下还滑；你若赶时辰，宁可多走两里。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `visitor_zhaochuan_greeting-choice-rules_first-02-7bde59`《礼数之外》zhaochuan_courier：先站在绳外看。叫停就得收手——这一条，参赛的和看热闹的都得记着。你若想报名，到了找门口执事。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_noodles-intro-03-f48166`《拜师面》shimu：坐。拜师面，一人一碗，谁也不许剩。萧白，你那碗卧了两个蛋——头一天入门，多吃一个。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_noodles-choice-linear-02-eea45f`《拜师面》shimu：一，饭桌上不谈打打杀杀。二，受了伤先来报给我，不许硬扛。三，来客无论正邪，先奉一杯茶。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_prelude_tour-intro-02-f0ea85`《熟悉谷中》zhong：起了起了！师兄说了，头两个月归我管。先认地方，再认活——谷里每块石头我都摸过，跟紧了！  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_prelude_tour-choice-linear-06-feb637`《熟悉谷中》zhong：以前种过药，没人会伺候。叶姑娘要是不嫌弃，那块地归你。我明儿给你搭个新晾架，比原来那个高三寸！  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_m05-closing-06-750bd6`《雨后这段路》recipient：我替你带话，他愿意说再捎信给你。温先生后来去了哪里，我也说不上。那本旧谱，更没见过。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_ledger-intro-02-3692a5`《师母的账本》shimu：谷里的米、盐、布、药，都从这本账上出。你师父只管练功，你二师叔只管做东西，没人管钱——所以我管。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_ledger-choice-columns-01-622156`《师母的账本》hero：把卖出的、赊账的、送人的分成三栏，每栏单独加总……差的三十文，是上个月赊给王婶的两只竹篮。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_night_return-choice-polite-03-e927fb`《夜归人》yin：我叫殷红缨，你师父的小师妹。往后叫小师叔。手劲还行，就是反应慢了半拍——下次有人翻墙，先往旁边躲，别往前凑。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_night_return-choice-counter-03-c784c6`《夜归人》yin：我是殷红缨，你师父的小师妹。白天的步法别拿来晚上乱用——不过有这份胆子，比你那个只会喊的小师兄强。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_fist_or_sword-intro-01-8bf47f`《拳先还是剑先》zhong：我再说一遍：先练拳！拳是根，剑是梢。根都没扎稳，剑能往哪儿使？挑一个月水，再出拳，这叫笨功夫——  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_fist_or_sword-intro-02-7f6255`《拳先还是剑先》yin：笨功夫练出来的就是笨人。他十七了，筋骨都长开了。再挑一个月水，江湖上的人可不等他。先学剑，见过真东西，才知道自己缺什么。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_goose_steps-intro-04-40b548`《回岚步与鹅》yin：它是谷里最快的东西，比你小师兄还快。规矩很简单：让它追你一炷香，不许被啄到，也不许出这个院子。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_ye_mother-intro-06-f534b0`《叶青的手》shimu：……二十年前，我走镖在荆襄翻了车，胳膊折成三段。是一位姓叶的女大夫，在路边给我接上的。她不收诊金，只要了我半袋干粮。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_mid_autumn-intro-07-3f8153`《中秋家宴》shimu：萧白，你那身练衣袖口都磨破了，这件冬天套在外头。叶蘅的这件没有门派标记，就是件家常衣裳，天冷了穿。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_dou_runaway-choice-race-05-ad81e8`《小豆想下山》yin：真的。可你才跑三里，馒头就掉了两个。出门哪能这么毛躁？包扎好，等出师那年，我带你走。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_dou_runaway-choice-talk-01-d4ba67`《小豆想下山》dou：萧白你来了以后，师父天天教你，师叔们抢着教你……我想，我是不是该走了，给你腾地方。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_yin_past-intro-04-3f55b1`《十几年前的寿宴》yin：那年我十七，头一回跟师父下山赴寿宴。席上有位执事，当众笑一个过世的郎中“私藏秘方，死有余辜”。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_yin_past-intro-07-cb0b6b`《十几年前的寿宴》yin：我掀了。回来以后，师父罚我跪了三天，然后跟我说：红缨，你做得对，可往后归云谷的人去哪儿都要被人多看一眼了。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gn_words-closing-03-24de9d`《认字》pei：我送你到溪边。……刚才那三百个人……我九岁时也问过。你往后翻到他们的消息，记得喊我。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gn_chests-intro-04-d5435c`《两箱残稿》pei：书里记了一家大族占了民田，又把民夫修的堤报成自家的功劳。后来那一族得了势，告他“谤讪”。书版劈了，学生散了。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gn_chests-intro-04-d5435c`《》pei：书里记了一家大族占了民田，又把民夫修的堤报成自家的功劳。后来那一族得了势，告他“谤讪”。书版劈了，学生散了。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `visitor_zhaochuan_greeting-choice-rules_first-02-7bde59`《》zhaochuan_courier：先站在绳外看。叫停就得收手——这一条，参赛的和看热闹的都得记着。你若想报名，到了找门口执事。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `M-05-handoff-06`《雨后这段路》收件人：我替你带话，他愿意说再捎信给你。温先生后来去了哪里，我也说不上。那本旧谱，更没见过。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `D-C01-result-02`《寄送近况信》旁白：玩家确认寄出且后台事务成功后，显示已交给捎信人。失败保留原稿与资源，不宣称已送达。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `D-C02-neighbor-01`《赠送普通物品》旁白：物品交给当前可接收的乡邻。这里只确认收到，不把赠物当作伤势痊愈、满意或额外托运承诺。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json

### MOOD_CHURN · 40 条 · 同一个人连着三句换表情；表情只在情绪转折处换（用户 2026-10-11）

- `gy_prelude_xinfa`《初识心法》hero_mid：（三十五……三十六……三十七……）  ← xiaojianghu-legacy-prologue/js（household）
- `gy_prelude_xinfa`《初识心法》zhou：让他睡。把我那件外衣拿来，给他披上。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_prelude_hair`《两月满》shimu：头发拢起一半……好了。再把这个戴上。  ← xiaojianghu-legacy-prologue/js（household）
- `gn_lamp`《隔溪的灯》hero：溪里那些白的，都是你晾的？  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_lamp`《隔溪的灯》pei：是前年受潮的抄本。我想着今天日头好……然后看到第三页有个字不对，就看进去了。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_lamp`《隔溪的灯》pei：像是从一本我没读过的书里抄下来的。——我叫裴知古。那本书，哪天借我看看。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gy_man_herbs`《小满认药》man：你练功的时候脸一会儿红一会儿白，像萝卜。白萝卜。  ← xiaojianghu-legacy-prologue/js（household）
- `gn_terraces`《田头的账》pei：这个我得回去想。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_words`《认字》peishu：所以我才知道这法子管用。来，从这一行起。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_dou_copy`《罚抄》dou：差不多嘛！  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_chests`《两箱残稿》pei：书里记了一家大族占了民田，又把民夫修的堤报成自家的功劳。后来那一族得了势，告他“谤讪”。书版劈了，学生散了。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_chests`《两箱残稿》pei：我想写——那三百个人，后来呢。可这得出谷才知道。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_chests`《两箱残稿》pei：我走路慢，会看着路边的碑就站住。先同你说一声。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_mill`《水碓房》pei：说师祖当年进谷，只带了一把剑和一口锅。锅先坏的。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_mill`《水碓房》pei：十四年了。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gy_zhong_kit`《出门的家伙》zhong：不多不多，三天三夜！……咳，也就两天。  ← xiaojianghu-legacy-prologue/js（household）
- `gn_depart`《托你带一句话》peishu：你方才答应的时候，眼睛在看萧白背上的包袱。  ← xiaojianghu-legacy-prologue/js（household）
- `gn_ye_ink`《方子上的字》pei：洇开之前，这一笔是往左收的。草头底下是“今”，不是“令”。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_ye_ink`《方子上的字》ye：黄芩。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_eyes`《父亲的眼睛》pei：所以我不能写错。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gn_eyes`《父亲的眼睛》pei：明晚灯还亮着。你要是练功回来路过，喊一声。  ← xiaojianghu-legacy-prologue/js（neighbors）
- `gy_ye_lamp`《灯下的方子》ye：都不用。……你坐着就好。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_ye_lamp`《灯下的方子》ye：萧白。这方子的事、我爹的事，往后我查到什么，都先跟你说。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_ye_lamp`《灯下的方子》ye：萧白。往后我查到什么，都先跟你说。  ← xiaojianghu-legacy-prologue/js（household）
- `gs_bandage`《大师兄教包扎》fang：万一哪天你在外头，身边没有大夫。  ← xiaojianghu-legacy-prologue/js（side）
- `gs_snow_roof`《雪夜屋顶》yin：坐。雪夜不喝酒，喝茶。  ← xiaojianghu-legacy-prologue/js（side）
- `gs_winter_garden`《冬天的药圃》ye：这一年……这块地是我在谷里第一样自己照料的东西。  ← xiaojianghu-legacy-prologue/js（side）
- `gy_yin_past`《十几年前的寿宴》yin：那年我十七，头一回跟师父下山赴寿宴。席上有位执事，当众笑一个过世的郎中“私藏秘方，死有余辜”。  ← xiaojianghu-legacy-prologue/js（household）
- `gs_pickles`《一缸咸菜》shimu：盐要一层一层撒，撒匀了才不烂。  ← xiaojianghu-legacy-prologue/js（side）
- `gs_waterwheel`《水车又卡住了》zhong：你扛住，我敲。腰往下沉，别用胳膊硬顶。  ← xiaojianghu-legacy-prologue/js（side）
- `gs_bamboo_sword`《竹林里的剑声》yin：别出声，站那儿看。……站近一点也行。  ← xiaojianghu-legacy-prologue/js（side）
- `gs_escort_flag`《箱底的镖旗》shimu：走了十年镖，最后一趟翻了车，旗子就收进箱底了。  ← xiaojianghu-legacy-prologue/js（side）
- `gs_fishing`《溪里的鱼》dou：哎——滑了！  ← xiaojianghu-legacy-prologue/js（side）
- `yy_herb_wine`《药和酒》yinhongying：行。下回我受伤，你下手轻点就算报答了。  ← xiaojianghu-legacy-prologue/js（banter）
- `yy_pharmacy`《汉皋的药铺》ye：……那不叫讲价。我自己来。  ← xiaojianghu-legacy-prologue/js（banter）
- `yy_hand`《那只手》ye：好。等您手好了，我来问。  ← xiaojianghu-legacy-prologue/js（banter）
- `yy_way_home`《回谷的路》yinhongying：现在是你问我，我才发现自己还记着。……过年一道回去。  ← xiaojianghu-legacy-prologue/js（banter）
- `hy_city_patient`《城里的病人》ye：……你现在比我会找由头了。走。  ← xiaojianghu-legacy-prologue/js（banter）
- `hy_roadside`《路边的草》hero：这算夸我？  ← xiaojianghu-legacy-prologue/js（banter）
- `hn_back_to_back`《背后》yinhongying：看这么仔细。往后那边就归你了，别让给别人。  ← xiaojianghu-legacy-prologue/js（banter）

### REPEAT · 7 条 · 同一句出现在 2 场戏里

- `gy_m06-intro-04-efd38e`《回来，先放下包》zhou：陆衡说了。脚滑了肯停，算你没白练。明早我看看你那一步。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_m06-intro-05-1da9b4`《回来，先放下包》zhou：今日先歇着。经过慢慢说，别一回来就想着加练。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `X-01-A-01`《这趟各自要办的事》萧白：我想看看初学的人怎样切磋。能参加什么，按我真的学过的来。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `T-B03`《站位与发力》（演出说明）：练武场，首次教学使用双人静态对白；教师指向当前器具或脚位。重复课只给短反馈，不额外生成动作图或重复关键语音。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `T-A02`《医案记录入门》（演出说明）：药圃，首次教学使用双人静态对白；教师指向当前器具或脚位。重复课只给短反馈，不额外生成动作图或重复关键语音。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `D-P01`《照料药圃》（演出说明）：药圃。纯文字结果或已有静态形象；实际课程与资源条件沿现有活动配置。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `D-D01`《挑水》（演出说明）：廊下。纯文字结果或已有静态形象；实际课程与资源条件沿现有活动配置。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json

### RULE_ECHO · 25 条 · 像把设计约束原样塞进台词（codex 稿常见）：“亲见／听说分开记”“不写成一定能办成”“注明来源”“交接”“边界”……一场里出现多次就要怀疑是在凑指标

- `gy_y02`《饭还在锅里》hero：分清今晚要交接的事  ← xiaojianghu-legacy-prologue/js（household）
- `gy_m07`《帖子上有几件不同的事》zhou：襄阳来了一封帖。旧友办寿宴，也有物资交接和公开试艺，我五月去一趟。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_m07`《帖子上有几件不同的事》zhou：愿意去吗？我去赴宴、交接物资，你们也看看外面的江湖。  ← xiaojianghu-legacy-prologue/js（household）
- `gy_z03`《帖子上的名字》hero：先帮普通交接  ← xiaojianghu-legacy-prologue/js（household）
- `gs_ye_letter`《没寄出的信》ye：问我娘那时候说过的话。亲耳听见的，和后来听人说的，我想分开记。  ← xiaojianghu-legacy-prologue/js（side）
- `W07`《各自要办的事》ye：襄阳那边，有位受治者的见闻，我想当面核实。  ← xiaojianghu-legacy-prologue/js（activity）
- `gy_m07-intro-01-7ceb94`《帖子上有几件不同的事》zhou：襄阳来了一封帖。旧友办寿宴，也有物资交接和公开试艺，我五月去一趟。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_m07-intro-03-54472b`《帖子上有几件不同的事》zhou：愿意去吗？我去赴宴、交接物资，你们也看看外面的江湖。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_l02-choice-check-03-b0e3e0`《多出来的半天》hero：交接后也要再对一次？  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gy_l02-choice-learn-01-9787ca`《多出来的半天》hero：交接这页，我想自己写一回。您看哪里还缺。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `gs_ye_letter-choice-listen-02-855192`《没寄出的信》ye：问我娘那时候说过的话。亲耳听见的，和后来听人说的，我想分开记。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `None`《》ye：襄阳那边，有位受治者的见闻，我想当面核实。  ← xiaojianghu/docs/design/scripts/chapter-two-dialogue.json
- `M-05`《雨后这段路》（演出说明）：三月中旬指定近路短篇。陆衡带队，叶蘅看普通药包，萧白负责经选择明确的一段。路况、分包与交接只用静态对白和场景切换。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `M-06`《回来，先放下包》（演出说明）：三月下旬回谷院内，周砚接人。陆衡已完成指定路线上的交接并按自己的行程离开，不在slot13作为常驻角色出现；深谈由Z2另触发。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `M-07-main-01`《帖子上有几件不同的事》周砚：襄阳来了一封帖。旧友办寿宴，也有物资交接和公开试艺，我五月去一趟。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `M-07-main-03`《帖子上有几件不同的事》周砚：愿意去吗？我去赴宴、交接物资，你们也看看外面的江湖。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `Y-01-end-01`《药签上留着的空白》旁白：两人收好获许可整理的普通材料。叶家旧物仍在叶蘅自己的房间。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `L-02-A-03`《多出来的半天》萧白：交接后也要再对一次？  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `L-02-B-01`《多出来的半天》萧白：交接这页，我想自己写一回。您看哪里还缺。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `Z-02`《回来再说那半步》（演出说明）：护送后练场边。周砚先放下示范木剑，问经过；萧白说明判断，叶蘅只在选择请她补充时说自己亲见的部分。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `X-01-main-04`《这趟各自要办的事》叶蘅：赴宴是一件。核实旧见闻、看诊疗，是我想做的另外两件。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `X-01-B-02`《这趟各自要办的事》叶蘅：普通的日期和交接，你帮我核。家里的问题让我自己问，私下的答话我也可能只想自己听。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `T-K01-first-03`《试锋剑法》周砚：不是。先把起手和收势学会，出游用什么，再说明来源。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `T-A02-first-02`《医案记录入门》萧白：拿不准的，不写成已经确定？  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
- `T-A02-repeat-02`《医案记录入门》萧白：听说的，我挪到另一栏。  ← xiaojianghu/docs/design/scripts/pre-xiangyang.json
