/* 养成内容首版：编号与 docs/design/cultivation-implementation.md 对应。 */
(function(root){
'use strict';
const categories=[['basic','基本功',5],['skill','招式',5],['production','生产',3],['arts','学艺',3],['chores','打杂',2],['mail','通信',4],['stroll','闲逛',6]].map(([id,name,cost])=>({id,name,cost}));
const actions=[
 {id:'B03',category:'basic',name:'站位与发力',teacher:'周砚',place:'练武场',task:'先站稳，再练起手与收势。',learn:'stance',requires:['joined'],gain:'foundation',amount:8,choice:['先慢练，找准重心','请师父指出紧张处'],feedback:'周砚纠正了你的站位。收势时，脚下比开始更稳。'},
 {id:'B02',category:'basic',name:'步法与脱身',teacher:'周砚',place:'练武场',task:'练落脚、转向与退步后的站稳。',learn:'footwork',requires:['stance'],gain:'footwork',amount:8,feedback:'这次退步没有绊住自己，转向后仍能站稳。'},
 {id:'B01',category:'basic',name:'吐纳调息',teacher:'周砚',place:'竹径',task:'依照已受指导的方法，放松肩背并调匀气息。',learn:'breathing',requires:['stance'],gain:'breathing',amount:8,feedback:'你按指导放松肩背，练完后呼吸渐渐平稳。'},
 {id:'B04',category:'basic',name:'舒展与协调',teacher:'周砚',place:'练武场',task:'舒展肩背，练身体与步伐的配合。',learn:'coordination',requires:['stance'],gain:'foundation',amount:6,feedback:'动作还不熟，但肩背与步伐已经能接上。'},
 {id:'B05',category:'basic',name:'听声辨位',teacher:'后续指导',place:'竹径',task:'等待正式课程，不凭查看介绍学会。',locked:'后续听声课程尚未编排。'},
 {id:'B06',category:'basic',name:'观察与察势',teacher:'周砚',place:'练武场',task:'留意起手与重心的变化，先说清看到什么。',requires:['stance'],gain:'observation',amount:6,feedback:'你分清了对方的起手与重心，不急着猜下一招。'},
 {id:'K01',category:'skill',name:'入门剑式',teacher:'周砚',place:'练武场',task:'正式学习入门起手、收势与基本距离。训练器具由练武场提供。',learn:'sword',requires:['stance'],gain:'sword',amount:8,choice:['先分解动作','跟随师父慢练'],feedback:'你完成了入门剑式指导。往后可以独练今天受教的部分。'},
 {id:'K02',category:'skill',name:'粗浅拳脚',teacher:'周砚',place:'练武场',task:'练拳架的起手与收势；首次练习包含正式教学。',learn:'fist',requires:['stance'],gain:'fist',amount:8,choice:['先练收势','请师父带着走一遍'],feedback:'周砚带你拆开拳架。这一次教学已记下，之后可练熟。'},
 {id:'P01',category:'production',name:'照料药圃',teacher:'叶蘅',place:'药圃',task:'在许可范围整理普通药材，每期只采一份。',requires:['herb_lesson','ye'],quota:true,gain:'herbs',amount:4,outputs:{herb:1},feedback:'你照料晾架并收好一份普通药材，没有动叶家的样品。'},
 {id:'P02',category:'production',name:'准备干粮',teacher:'周砚',place:'厨房',task:'使用一份自己的普通食材，做两份可携带的干粮。',requires:['cooking'],inputs:{grain:1},outputs:{food:2},gain:'cooking',amount:4,feedback:'干粮晾凉后装好，外出时可以带上。'},
 {id:'P03',category:'production',name:'缝制普通布包',teacher:'叶蘅',place:'药圃边',task:'用一份普通布料缝一个日用布包。',requires:['sewing','ye'],inputs:{cloth:1},outputs:{pouch:1},gain:'sewing',amount:4,feedback:'布包的接缝收紧了，可以装普通日用物。'},
 {id:'A01',category:'arts',name:'武学常识与复盘',teacher:'周砚',place:'书房',task:'拿今天已练的课题，请师父解释一个具体问题。',requires:['stance'],gain:'understanding',amount:6,feedback:'周砚把问题讲回你已经练过的动作，下一次更有头绪。'},
 {id:'A02',category:'arts',name:'医案记录入门',teacher:'叶蘅',place:'药圃',task:'练习整理观察与记录，由叶蘅负责判断。',learn:'medical_notes',requires:['ye'],gain:'medical_notes',amount:6,choice:['整理观察顺序','问清记录的边界'],feedback:'你练的是记录与整理，医疗判断仍交给叶蘅。'},
 {id:'A03',category:'arts',name:'普通药材辨识',teacher:'叶蘅',place:'药圃',task:'看她允许使用的普通样品，学习标签与保存。',learn:'herb_lesson',requires:['ye'],gain:'herbs',amount:6,choice:['先看标签','先听保存要求'],feedback:'叶蘅说明了普通样品的标签和采集范围，药圃工作已开放。'},
 {id:'A04',category:'arts',name:'行路与护送常识',teacher:'陆衡',place:'院内',task:'趁来访请教路况与行囊收束。',requires:['lu'],gain:'travel',amount:6,feedback:'陆衡指出行囊的松处，也讲了路不好走时怎样求援。'},
 {id:'A05',category:'arts',name:'家常炊事',teacher:'周砚',place:'厨房',task:'认识厨房器具与普通食材，做一道家常食物。',learn:'cooking',gain:'cooking',amount:6,feedback:'你受过家常炊事指导，可以在厨房准备普通干粮。'},
 {id:'A06',category:'arts',name:'布料与行囊照护',teacher:'叶蘅',place:'药圃边',task:'用普通布料练基础缝补，不取用她的针囊。',learn:'sewing',requires:['ye'],gain:'sewing',amount:6,feedback:'你完成了基础缝补指导，普通布包制作已开放。'},
 {id:'D01',category:'chores',name:'挑水',teacher:'谷中日常',place:'溪边',task:'补好廊下用水，分担今天的家务。',gain:'foundation',amount:2,feedback:'廊下水缸添好了，大家少跑了一趟。'},
 {id:'D02',category:'chores',name:'扫院与整理练场',teacher:'谷中日常',place:'院内',task:'收好公用器具，扫净练武场边的落叶。',gain:'coordination',amount:2,feedback:'器具归位，练场边也清爽了。'},
 {id:'D03',category:'chores',name:'整理晾架与标签',teacher:'叶蘅',place:'药圃',task:'按叶蘅允许的范围整理普通材料。',requires:['ye'],gain:'medical_notes',amount:2,feedback:'普通材料按标签放回，叶蘅清点时更方便。'},
 {id:'D04',category:'chores',name:'磨墨与整理书案',teacher:'周砚',place:'书房',task:'准备读写器具，不擅自翻看私人物件。',gain:'understanding',amount:2,feedback:'书案收整好，墨也备下了。'},
 {id:'D05',category:'chores',name:'修补竹篓',teacher:'谷中日常',place:'廊下',task:'处理一次小破损，收好公用竹篓。',gain:'sewing',amount:2,feedback:'竹篓边缘的小破损修好了。'},
 {id:'C01',category:'mail',name:'托陆衡捎信',teacher:'陆衡的捎信渠道',place:'书案',task:'给已认识的陆衡写信，说明近况或问候乡邻；回信在下一期。',mail:true,gain:'correspondence',amount:2,feedback:'信已交给捎信人。下一期可免费查看回信。'},
 {id:'C02',category:'mail',name:'寄送普通干粮',teacher:'陆衡的捎信渠道',place:'书案',task:'送一份自己的普通干粮，附上问候。',mail:true,inputs:{food:1},gain:'correspondence',amount:2,feedback:'一份干粮与信一同送出，物品已经从你的行囊扣除。'},
 {id:'W01',category:'stroll',name:'归云谷院内',teacher:'周砚',place:'谷中住处',task:'就修习里的一个困难认真长谈，本次只展开这一段。',requires:['stance'],once:'talk_zhou',gain:'understanding',amount:6,choice:['谈练习里的困难','问怎样面对危险'],feedback:'师父听完你的难处。谈话留下下一次练习的方向。'},
 {id:'W02',category:'stroll',name:'药圃与晾架',teacher:'叶蘅',place:'药圃',task:'参加已知的整理邀约，听她说当前的生活安排。',requires:['ye'],once:'herb_labels',gain:'medical_notes',amount:4,choice:['帮她整理标签','先听她的安排'],feedback:'你与叶蘅一起整理普通标签，家传旧物仍由她保管。'},
 {id:'W03',category:'stroll',name:'回访乡邻',teacher:'乡邻',place:'邻村安置点',task:'听近况并记录普通需要，不自动领取全部委托。',requires:['village_visit'],once:'visit_neighbors',gain:'observation',amount:4,choice:['问问休养的近况','记下下次需要带的东西'],feedback:'乡邻说了近况；你记下普通所需，没有擅自替别人承诺。'},
 {id:'W04',category:'stroll',name:'溪畔与近山',teacher:'自然观察',place:'近山竹径',task:'观察已知近路，把受教的步法用在不同地面。',gain:'footwork',amount:4,feedback:'你走过熟悉的近路，记下几处湿滑的落脚点。'}
];
const data={schema_version:1,categories,actions,phases:['月初','上旬','中旬','下旬','月底'],journeyMonths:[5,10,16,22,28,33],routes:[{id:'mountain',name:'归云谷',open:true},{id:'guijintang',name:'归烬堂',open:false},{id:'patrol',name:'巡江司',open:false}],resources:{grain:'普通食材',cloth:'普通布料',herb:'普通药材',food:'干粮',pouch:'日用布包'},progressNames:{foundation:'站位与基础',footwork:'步法',breathing:'吐纳',observation:'察势',coordination:'协调',sword:'入门剑式',fist:'粗浅拳脚',understanding:'武学理解',medical_notes:'医案记录',herbs:'辨药',cooking:'炊事',sewing:'缝补',travel:'行路',correspondence:'通信'}};
if(typeof module==='object'&&module.exports)module.exports=data;else root.CultivationData=data;
})(typeof globalThis!=='undefined'?globalThis:this);
