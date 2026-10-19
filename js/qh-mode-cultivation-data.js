/* 养成内容首版：编号与 docs/design/cultivation-implementation.md 对应。 */
(function(root){
'use strict';
const categories=[['basic','基本功',5],['skill','招式',5],['production','生产',3],['arts','学艺',3],['chores','打杂',2],['mail','通信',1],['stroll','闲逛',4]].map(([id,name,cost])=>({id,name,cost}));
const actions=[
 {id:'B03',category:'basic',name:'站位与发力',teacher:'钟拙',place:'练武场',task:'先站稳，再练起手与收势。',learn:'stance',requires:['joined'],gain:'foundation',amount:8,choice:['先慢练，找准重心','请师父指出紧张处'],feedback:'周砚纠正了你的站位。收势时，脚下比开始更稳。'},
 {id:'B02',category:'basic',name:'步法与脱身',teacher:'周砚',place:'练武场',task:'练落脚、转向与退步后的站稳。',learn:'footwork',requires:['stance'],gain:'footwork',amount:8,feedback:'这次退步没有绊住自己，转向后仍能站稳。'},
 {id:'B01',category:'basic',name:'吐纳调息',teacher:'周砚',place:'竹径',task:'依照已受指导的方法，放松肩背并调匀气息。',learn:'breathing',requires:['stance'],gain:'breathing',amount:8,feedback:'你按指导放松肩背，练完后呼吸渐渐平稳。'},
 {id:'B04',category:'basic',name:'舒展与协调',teacher:'周砚',place:'练武场',task:'舒展肩背，练身体与步伐的配合。',learn:'coordination',requires:['stance'],gain:'foundation',amount:6,feedback:'动作还不熟，但肩背与步伐已经能接上。'},
 {id:'B05',category:'basic',name:'听声辨位',teacher:'殷红缨',place:'竹径',task:'闭眼站在竹林里，听小师叔的脚步从哪边来。',learn:'listening',requires:['footwork'],factRequires:['gy_night_return_seen'],factHint:'小师叔殷红缨回谷后才能教听声；她一月底回来。',gain:'observation',amount:8,choice:['先听风声，再分脚步','请小师叔放慢一次'],feedback:'你分清了脚步与竹叶的声音，第三次转身时，正对着小师叔。'},
 {id:'B06',category:'basic',name:'观察与察势',teacher:'周砚',place:'练武场',task:'留意起手与重心的变化，先说清看到什么。',requires:['stance'],gain:'observation',amount:6,feedback:'你分清了对方的起手与重心，不急着猜下一招。'},
 {id:'K01',category:'skill',name:'试锋剑法',teacher:'周砚',place:'练武场',task:'正式学习入门起手、收势与基本距离。训练器具由练武场提供。',learn:'sword',requires:['stance'],gain:'sword',amount:8,choice:['先分解动作','跟随师父慢练'],feedback:'你完成了试锋剑法指导。往后可以独练今天受教的部分。'},
 {id:'K02',category:'skill',name:'守拙拳法',teacher:'钟拙',place:'练武场',task:'练拳架的起手与收势；首次练习包含正式教学。',learn:'fist',requires:['stance'],gain:'fist',amount:8,choice:['先练收势','请师父带着走一遍'],feedback:'周砚带你拆开拳架。这一次教学已记下，之后可练熟。'},
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
 {id:'C01',category:'mail',name:'寄送近况信',teacher:'谷中通信',place:'书案',task:'选择当前可接信的往来人物，确认寄出近况信；回信在下一期。',mail:true,gain:'correspondence',amount:0,feedback:'信已交给捎信人。下一期可免费查看回信。'},
 {id:'C02',category:'mail',name:'赠送物品',teacher:'谷中通信',place:'书案',task:'选择可交互的人物，赠送一份自己的普通物品。',costOverride:2,mail:true,inputs:{food:1},gain:'correspondence',amount:0,feedback:'物品已经送出，并从你的行囊扣除。'},
 {id:'W01',category:'stroll',name:'归云谷院内',teacher:'周砚',place:'谷中住处',task:'就修习里的一个困难认真长谈，本次只展开这一段。',requires:['stance'],once:'talk_zhou',gain:'understanding',amount:6,choice:['谈练习里的困难','问怎样面对危险'],feedback:'师父听完你的难处。谈话留下下一次练习的方向。'},
 {id:'W02',category:'stroll',name:'药圃与晾架',teacher:'叶蘅',place:'药圃',task:'参加已知的整理邀约，听她说当前的生活安排。',requires:['ye'],once:'herb_labels',gain:'medical_notes',amount:4,choice:['帮她整理标签','先听她的安排'],feedback:'你与叶蘅一起整理普通标签，家传旧物仍由她保管。'},
 {id:'W03',category:'stroll',name:'回访乡邻',teacher:'乡邻',place:'邻村安置点',task:'听近况并记录普通需要，不自动领取全部委托。',requires:['village_visit'],once:'visit_neighbors',gain:'observation',amount:4,choice:['问问休养的近况','记下下次需要带的东西'],feedback:'乡邻说了近况；你记下普通所需，没有擅自替别人承诺。'},
 {id:'W04',category:'stroll',name:'溪畔与近山',teacher:'自然观察',place:'近山竹径',task:'观察已知近路，把受教的步法用在不同地面。',gain:'footwork',amount:4,feedback:'（这条近路走熟了。溪边那几块石头沾水就滑，下回落脚得避开。）'}
];
// First four months: classes carry short character beats, deep talks remain optional.
const courseBeats={
 B03:['萧白想再试一次证明自己。周砚让他先说出脚下哪里不稳。','周砚先听你指出困难，再调整今天的发力练习。'],
 B02:['周砚让你先看同伴站在哪里，再找自己的落脚点。','你先确认退路，再转向；这次没有只顾向前。'],
 B01:['周砚提醒：调息也是练习，不能靠憋气撑过疲倦。','叶蘅见你练完，提醒先歇一会儿；你没有再逞强加练。'],
 B04:['动作接不上时，先慢下来。承认生疏，师父才知道从哪里教。','周砚按你上次的困难改了练习，肩背与步伐逐渐接上。'],
 K02:['周砚拆开起手和收势。萧白终于有一门自己真正学过的拳脚。','师父看的是收势有没有留下余地，不是拳头打得多响。'],
 K01:['周砚交给你场地训练器具，先教距离与收势；器具不自动归你所有。','你重复已学的起手，先确认距离，再出剑。'],
 A03:['叶蘅留下一格空白：不是忘写，是还没问清。普通材料也不能凭相似猜。'],
 A04:['陆衡让你说清收件人和归期。顺路也有代价，不能替别人答应。'],
 A01:['周砚先问是谁提醒了那一步，再按实际经历安排下一次练习。'],
 B05:['殷红缨蒙上萧白的眼睛：“眼睛会骗人，耳朵不会。先听我在哪儿。”','小师叔这次换了三个方向。你没有急着转身，等脚步停下才判断。']
};
for(const a of actions)if(courseBeats[a.id])a.beats=courseBeats[a.id];
Object.assign(actions.find(a=>a.id==='W02'),{name:'药签上的空白',window:[1,9],choice:['把确定和待问分开','先整理架子，不补未知内容'],feedback:'你们把不确定的内容留待核实。下一次帮忙，先问清许可；家传旧物没有取用。'});
actions.push(
 {id:'W05',category:'stroll',name:'话别说得太满',teacher:'陆衡',place:'谷中院内',requires:['lu'],window:[8,11],once:'promise_scope',gain:'travel',amount:6,choice:['只列真正急的事，请他确认','回信说明改期，不替他答应'],feedback:'陆衡确认了本次委托的范围，仍要履行其他护运工作。你不再把顺路当作没有代价。'},
 {id:'W06',category:'stroll',name:'回来再说那半步',teacher:'周砚',place:'练武场',window:[13,17],factRequires:['first_delivery'],requires:['joined'],once:'escort_review',gain:'understanding',amount:6,choice:['解释当时的判断','请师父指出可以改的地方'],feedback:'你和师父按实际护送经历确定下一次练习方向；没有凭空学会进阶武学。'},
 {id:'W07',category:'stroll',name:'各自要办的事',teacher:'叶蘅',place:'谷中住处',window:[16,19],factRequires:['xiangyang_invitation'],requires:['ye'],once:'departure_goals',gain:'observation',amount:4,choice:['说清自己想检验的本领','问她需要哪些协助，不替她决定'],feedback:'二人分别写下出行目的。遗物仍由叶蘅决定是否携带，没有提前决定她的职业路线。'}
);
for(const a of actions)if(['W05','W06','W07'].includes(a.id)){a.presentation='dialogue';a.storyPortrait=giftPortrait(a.teacher);a.portraitRect=({"W05":[0, 0, 1024, 1536],"W06":[0, 0, 1024, 1536],"W07":[0, 0, 1024, 1536]})[a.id];}
function giftPortrait(teacher){return teacher==='陆衡'?'assets/production/cultivation/household-v1/lu.png':teacher==='周砚'?'assets/production/cultivation/household-v1/zhou.png':'assets/production/cultivation/household-v1/ye.png';}
Object.assign(actions.find(a=>a.id==='W03'),{name:'袋底的木屑',teacher:'叶蘅',place:'谷中住处',window:[2,11],choice:['核实真正缺少的东西','回信说明下次能带什么'],feedback:'你们记下实际需求和未确定的事项。读信没有让陈伯痊愈，也不算已经完成实地回访。'});
Object.assign(actions.find(a=>a.id==='W04'),{requires:['footwork'],costOverride:3,quota:true,quotaMessage:'本期观察成果已记录，可免费查看；下期再作新的观察。'});
for(const [id,line] of Object.entries({W02:'这格先留着，余下的我们再问清。下次不确定，先告诉我。',W03:'这一项邻村已经借了，不用再送。没定的先写清，别替人答应。',W05:'这次改过的，写给两边看。别让一边以为我明天还到。',W06:'这一步是谁提醒你的，就记着这份帮忙。下次先看同伴站在哪里。',W07:'我也写下了自己想问的事。你的打算，你来说；能帮什么，我们先说清。'}))actions.find(a=>a.id===id).resultLine=line;
// 2026-10-08 去掉旁白：闲逛剧情开场改为逐句台词；萧白的念头用括号心声。W06 按首次送药的实际方式换开场。
const strollIntro={
 W01:[['zhou','今天不练了，坐下说说。'],['zhou','修习里哪一处最难？挑一件，我们只把这一件谈透。']],
 W02:[['hero','（这张药签字都糊了……照旁边那张补上就是。）'],['ye','别动。这格还没问清，不能猜。']],
 W03:[['ye','乡邻来信了，陈伯还在信后批了几样器具。'],['hero','我念给你听：麻绳两捆，锄头一把，还有一口小铁锅……'],['ye','慢着。锅那一项，邻村那边已经解决了，不必重复寄送。']],
 W05:[['hero','陆大哥，乡邻那边还有几样东西，顺路的话能不能一并捎上？'],['lu','几件？送到哪儿？哪天要到？'],['lu','多走半天，也得有人知道我晚到半天。']],
 W06:[['zhou','护送的经过，从头说给我听。'],['zhou','那一步，是谁提醒你的？下一回出门，我先讲清你该负责哪一段。']],
 W07:[['ye','汉皋那边，有位受治者的见闻，我想当面核实。'],['ye','也想看看外地医者是怎么做的。我想去，不只是跟着你。']]
};
const say=lines=>lines.map(([speaker,text])=>({speaker,text}));
for(const [id,lines] of Object.entries(strollIntro))actions.find(a=>a.id===id).introLines=say(lines);
actions.find(a=>a.id==='W01').resultLine='你的难处我听明白了。下一回练习，就从这儿改起。';
actions.find(a=>a.id==='W06').introByDelivery={
 guided_footwork:say([['zhou','陆衡让你自己走的那一段，落脚点是怎么选的？'],['zhou','照实说就好。往后的练习，按你这回真走过的路来改。']]),
 assisted_carry:say([['zhou','你帮着分包的那一段，是在哪儿决定停下来求助的？'],['zhou','没练过的步法，路上走过一回也不算会了。这个要分清。']]),
 asked_for_guidance:say([['zhou','听说你路上请陆衡指点了。难在哪儿，先说清楚。'],['zhou','这份帮忙要记着。下一课，就从你遇到的实际问题开始。']])
};
const notices=[
 {slot:2,id:'village_news',text:'乡邻捎来近况，陈伯仍按实际伤势休养，当地医者继续照应；谷中读信不等于已经回访。'},
 {slot:5,id:'old_friend_letter',text:'叶蘅先读周砚旧识的回信：一位受治者相关的见闻尚待核实，不能据此认定父亲的结局。'},
 {slot:6,id:'lu_visit_notice',text:'陆衡将在二月下旬至三月上旬到谷，可请教行路常识，或谈清追加托运的范围。'},
 {slot:10,id:'escort_notice',text:'三月中旬随陆衡送普通药包，占用整期。练过的步法可以尝试；没有准备也可以请带队者指导。'},
 {slot:13,id:'escort_return',text:'护送结束，回谷继续培养。师父会按实际经历纠正练习；深入复盘可另选。'},
 {slot:15,id:'xiangyang_invitation',text:'周砚收到赴汉皋的邀请。第五月整月外出，第六月月初回谷；可在公开往来中核实受治者线索。'},
 {slot:19,id:'xiangyang_departure',text:'下月赴汉皋。萧白可以检验已学本领，叶蘅有自己的寻访与学习安排；家传物件的使用仍须她同意。'}
];
// 2026-10-08：这些必经剧情已有完整对白场面（household gy_m02…gy_m08），消息只静默写入事实，不再弹出。
for(const n of notices)if(['village_news','old_friend_letter','escort_notice','escort_return','xiangyang_invitation','xiangyang_departure'].includes(n.id))n.silent=true;
// 周砚首次长谈改由完整剧本“记住了，还是站不稳”（gy_z01）承担，旧的通用院内长谈不再列出。
actions.find(a=>a.id==='W01').hidden=true;
// 闲逛剧情的场景（地点＋时间），背景由 CultivationScenes 解析；place 可用地点键或中文地名。
for(const [id,place,time] of [['W01','谷中住处','day'],['W02','药圃','day'],['W03','谷中住处','day'],['W04','近山竹径','day'],['W05','谷中院内','day'],['W06','练武场','day'],['W07','谷中住处','dusk']])Object.assign(actions.find(a=>a.id===id),{place,time});
const giftRecipients=[{id:'zhou',name:'周砚',portrait:'assets/production/cultivation/household-v1/zhou.png'},{id:'ye',name:'叶蘅',portrait:'assets/production/cultivation/household-v1/ye.png'},{id:'lu',name:'陆衡',portrait:'assets/production/cultivation/household-v1/lu.png'},{id:'neighbor',name:'乡邻',portrait:'assets/production/cultivation/household-v1/neighbor.png'},{id:'shimu',name:'江采薇',portrait:'assets/production/cultivation/household-v1/shimu.png'},{id:'yin',name:'殷红缨',portrait:'assets/production/cultivation/household-v1/yin.png'},{id:'pei',name:'裴知古',portrait:'assets/production/cultivation/household-v1/pei.png'},{id:'zhong',name:'钟拙',portrait:'assets/production/cultivation/household-v1/zhong.png'},{id:'fang',name:'方迟',portrait:'assets/production/cultivation/household-v1/fang.png'},{id:'dou',name:'卢小豆',portrait:'assets/production/cultivation/household-v1/dou.png'},{id:'man',name:'周小满',portrait:'assets/production/cultivation/household-v1/man.png'}];

// 闲逛地点（2026-10-08）：闲逛先选地点；支线剧情按地点＋时间绑定，此刻没有可遇的事就是纯逛。
// gated：只在该地点此刻有剧情时才列出（谷外、接待廊）。缩略图用该地点的背景。
const SCN=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-scenes.js'):root.CultivationScenes;
for(const [place,name,idle,gated] of [
 ['courtyard','庭院','院子里静悄悄的，这会儿没遇到什么事。'],
 ['training_ground','练武场','练武场上没人，木人桩立在原地。'],
 ['herb_garden','药圃','药圃里只有风吹叶子的声音。'],
 ['kitchen','厨房','灶膛还温着，厨房里没人。'],
 ['study','书房','书房门掩着，案上的书码得整整齐齐。'],
 ['bamboo_path','近山竹径','竹径上只有鸟叫，走了一圈又回来了。'],
 ['reception','接待廊','接待廊空着，今天没有来客。',true],
 ['market_town','山下集市','集市上人来人往，没遇到熟人。',true],
 // 谷中人家：串门，和门派里的闲逛分开算（每个时段另可遇一段）。书屋内不单列，随书屋的剧情进出。
 ['bookhouse','溪东书屋','书屋门口晾着纸，屋里只有翻页的声音，没人抬头。'],
 ['terraces','谷口梯田','田里有人在忙，远远点了个头。'],
 ['watermill','水碓房','水碓一下一下地响，守碓的婆婆在打盹。']])
 actions.push({id:'SP_'+place,category:'stroll',name,place,time:'day',strollPlace:true,gated:!!gated,idle,teacher:'',task:'到'+name+'走走：此刻若有人有事就会遇上，没有就只是逛逛。',icon:'assets/production/cultivation/place-icons-v1/'+place+'.png',storyPortrait:SCN?SCN.resolve({place},'spring').src:undefined});
{const w=actions.find(a=>a.id==='W04');if(w)w.icon='assets/production/cultivation/place-icons-v1/stream.png';}
const V=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-visitors.js'):root.CultivationVisitors;
if(V){actions.push(...V.actions);notices.push(...V.notices);}
const data={schema_version:1,economyVersion:2,energyPerPeriod:12,categories,actions,notices,giftRecipients,phases:['月初','上旬','中旬','下旬','月底'],journeyMonths:[5,10,16,22,28,33],routes:[{id:'mountain',name:'归云谷',open:true},{id:'guijintang',name:'归烬堂',open:false},{id:'patrol',name:'巡江司',open:false}],resources:{grain:'普通食材',cloth:'普通布料',herb:'普通药材',food:'干粮',pouch:'日用布包'},progressNames:{listening:'听声',foundation:'站位与基础',footwork:'步法',breathing:'吐纳',observation:'察势',coordination:'协调',sword:'试锋剑法',fist:'守拙拳法',understanding:'武学理解',medical_notes:'医案记录',herbs:'辨药',cooking:'炊事',sewing:'缝补',travel:'行路',correspondence:'通信'}};
const T=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-dialogue.js'):root.CultivationDialogue;T.activities(data);
const B=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-balance.js'):root.CultivationBalance;B.install(data);
if(typeof module==='object'&&module.exports)module.exports=data;else root.CultivationData=data;
})(typeof globalThis!=='undefined'?globalThis:this);
