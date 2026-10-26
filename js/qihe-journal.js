'use strict';
// Save-derived journal and codex. Snapshot methods never write to the player's state.
(() => {
 if (typeof isQiheEntry === 'function' && !isQiheEntry()) return;
 // 2026-10-21 整改：立绘 2026-10-17 换成 *_hd_20261017 后旧路径 404，改从正式素材登记取路径。
 const portrait=k=>window.PRODUCTION_ASSET_PATHS?.[k]||'assets/production/portraits/'+k+'.webp';
 const avatar=k=>'assets/production/icons-and-props/'+k+'.webp';
 const CAST={
  xulingyi:{name:'徐令仪',faction:'正道盟',role:'正道盟文议执事',art:portrait('p_qh_xulingyi_story'),full:true},
  censhuang:{name:'岑霜',faction:'归烬堂',role:'对外交涉者',art:portrait('p_qh_censhuang_story'),full:true},
  shenyanhui:{name:'沈雁回',faction:'巡江司委办',role:'受程巡检委办的查验人',art:portrait('p_qh_shenyanhui_story'),full:true},
  ye:{name:'叶蘅',faction:'栖河村',role:'叶家姑娘 · 药棚照料者',art:'assets/ui/jianghu-v4/portraits/ye-menu-v2.png',full:true},
  chen:{name:'陈伯',faction:'栖河村',role:'村中长者',art:avatar('a_opening_chen'),bio:'栖河的村中长者，照应初来村里的萧白。村中日常与乡邻的往来，都有他熟悉的规矩。'},
  aunt:{name:'周婶',faction:'栖河村',role:'药棚照料者',art:avatar('a_opening_aunt'),bio:'照看村里的药棚，熟悉送来的药物和病人所需，也常托人帮着处理药棚的临时差事。'},
  zhouyan:{name:'周砚',faction:'叶家旧友',role:'行路旧友',art:avatar('a_opening_zhouyan'),bio:'来到栖河的行路人，与村里的乡邻往来。'},
  luheng:{name:'陆衡',faction:'栖河村',role:'护路与药车照应者',art:avatar('a_opening_luheng'),bio:'熟悉药车和村外道路，照应乡邻出入。能用普通棍棒护路，也愿意指点初学的人。'},
  song:{name:'宋先生',faction:'行路人',role:'自称跑账的账房',art:portrait('p_qh_song_story'),full:true,bio:'在后山遇见的宋姓账房，自称往来跑账。他托萧白记下来人的人数与站位，并答应沿路打听叶父的消息。'},
  apothecary:{name:'药商',faction:'村口集市',role:'药货商人',art:avatar('a_opening_apothecary'),bio:'在村口做药货生意，熟悉当地旧货的往来。'},
  merchant:{name:'店家',faction:'栖河村',role:'客栈与集市店家',bio:'村中经营日常生意的店家，也替药棚照应晾布等杂事。'},
  elder:{name:'村口老人',faction:'栖河村',role:'村中乡邻',bio:'住在村口的老人，与药棚有送药和归还竹篮的往来。'},
  bailiff:{name:'差役',faction:'巡江司',role:'现场差役',art:avatar('a_opening_bailiff'),bio:'参与河埠现场的查验与签记。'},
  steward:{name:'管事',faction:'正道盟来人',role:'联络院随行管事',art:avatar('a_opening_steward'),bio:'跟着徐令仪来栖河的管事。'},
  retainer:{name:'护院',faction:'正道盟来人',role:'随行护院',art:avatar('a_opening_retainer'),bio:'随正道盟来人进入栖河的护院。'},
  wukui:{name:'乌魁',faction:'归烬堂来人',role:'旧货账经手人',art:avatar('a_opening_wukui'),bio:'带着旧货账进入栖河，与旧罐的买卖往来有关。'},
  procurement:{name:'采办使',faction:'采办队',role:'药物采办经手人',art:avatar('a_opening_procurement'),bio:'参与栖河药物采办的来人。'},
  procurement_aide:{name:'采办随从',faction:'采办队',role:'采办随行人',art:avatar('a_opening_procurement_aide'),bio:'随采办队来到栖河的随从。'},
  bandit:{name:'帮众',faction:'村外来人',role:'随行帮众',bio:'进入村里的帮众，出现在来人的往来中。'},
  chengduo:{name:'程铎',faction:'巡江司',role:'程巡检',art:avatar('a_opening_chengduo'),bio:'巡江司的巡检，负责相关查验事务。'}
 };
 const nameId=Object.fromEntries(Object.entries(CAST).map(([id,p])=>[p.name,id]));
 const questDef={
  letter:{title:'一封未落款的拜帖',owner:'xulingyi',reward:6,origin:'徐令仪请你转问联络院递来的未落款拜帖，辨认来处与受帖人的意思。',summary:'陈伯提醒旧物有主人，登记与保管不能代替叶蘅同意。徐令仪已收到口信。',target:'chen-door',place:'村内东北 · 陈伯家门厅',first:'去陈伯家门厅，辨认拜帖的来处。'},
  account:{title:'旧罐与玉匣',owner:'censhuang',reward:8,origin:'岑霜托你向药商核对乌魁带来的旧货账，把收钱、卖货和玉匣传闻分开问。',summary:'药商只卖过六只旧药罐，玉匣他连见都没见过。罐子钱和玉匣是两回事。',target:'merchant',place:'南村口 · 药商',first:'找药商核对旧货账，不去叶家取物。'},
  ledger:{title:'药单上的两道数',owner:'shenyanhui',reward:6,origin:'沈雁回受程巡检委办查验药物。收验册载三篓，东埠实见两篓；她托你向药棚核对数量与用途。',summary:'两篓货药、一篓病人药包分栏；“已验”无签名，沈雁回已保留未验注明与争议记录。',target:'clinic-door',place:'村内东侧 · 药棚',first:'到药棚找周婶，核对药物的数量与用途。'}
 };
 const later=c=>!!c&&['fire','escape','refuge','mountain','ended','cultivation'].includes(c.stage);
 const departed=c=>!!c&&!['opening','days'].includes(c.stage);
 const evidence=c=>!!(c?.events?.['evidence-v2']||c?.evidenceReviewed);
 const seenQuest=q=>!!q&&q.stage&&q.stage!=='none';
 function phase(s){const c=s?.qiheChapter,chapter=window.QiheMilestones?.latest(s)||'江湖行卷';if(!c)return{chapter,date:'初到栖河'};if(['mountain','ended','cultivation'].includes(c.stage))return{chapter,date:'山居'};if(['refuge','escape','fire'].includes(c.stage))return{chapter,date:c.stage==='refuge'?'邻村接应':'离村途中'};return{chapter,date:({0:'第一日',2:'第一日傍晚',4:'第二日傍晚',5:'第三日',6:'第三日傍晚'})[c.halfDay]||'村中行程'}}
 function knowledge(s={}){
  const p=s.prologue||{},c=s.qiheChapter,q=p.outsiders?.quests||{},questions={...p.outsiders?.contacts?.questions,...c?.questions},g=p.arrival?.greeted||{},record=s.qiheCodex?.people||{};
  const met=Object.fromEntries(Object.keys(record).filter(id=>CAST[id]).map(id=>[id,true]));
  for(const name of Object.keys(g))if(g[name]&&nameId[name])met[nameId[name]]=true;
  if(p.arrival?.stage==='done'||p.relicSeen||c)met.ye=true;
  if(p.rested||c||p.errands?.bowls==='done')met.chen=true;
  // The completed first-chapter opening includes the drug merchant and Lu Heng.
  if(c&&c.stage!=='opening'){met.apothecary=true;met.luheng=true;}
  if(Object.values(p.errands||{}).some(v=>v!=='none'&&v!=='closed')||c)met.aunt=true;
  if(p.errands?.cloth==='collected'||p.errands?.cloth==='done')met.merchant=true;
  if(p.errands?.medicine==='delivered'||p.errands?.medicine==='done')met.elder=true;
  if(p.errands?.bowls==='done'||c?.events?.['xu-meeting']||c?.events?.steward||later(c))met.zhouyan=true;
  if(c?.granted||c?.choices?.transport||c?.choices?.practice||later(c))met.luheng=true;
  if(c?.events?.['c1-00b'])met.song=true; // 拒绝了也算见过（2026-10-21 起可拒绝）
  if(c?.events?.['fire-start']){met.wukui=true;met.retainer=true;met.procurement_aide=true;}
  if(c?.events?.['road-intro'])met.bandit=true;
  const xu=!!(c?.events?.['xu-meeting']||later(c)&&c?.events?.steward),three=!!(c?.events?.['three-meeting']||later(c)&&c?.events?.medicine);
  for(const [key,d]of Object.entries(questDef))if(seenQuest(q[key])||questions[d.owner+'-dispute']||(d.owner==='xulingyi'?xu:three))met[d.owner]=true;
  if(['checked','done'].includes(q.account?.stage))met.apothecary=true;
  if(['checked','witnessed','done'].includes(q.ledger?.stage))met.aunt=true;
  if(['witnessed','done'].includes(q.ledger?.stage))met.bailiff=true;
  if(['checked','done'].includes(q.letter?.stage))met.chen=true;
  const identity={};
  for(const [id]of Object.entries(CAST))identity[id]=!!(record[id]?.identity||!['xulingyi','censhuang','shenyanhui'].includes(id)||questions[id+'-dispute']||seenQuest(q[({xulingyi:'letter',censhuang:'account',shenyanhui:'ledger'})[id]])||(id==='xulingyi'?xu:three));
  return{met,identity,record,q,p,c,questions,xu,three};
 }
 const step=(title,detail,done=true)=>({title,detail,done});
 function tasks(s={},options={}){
  if(!s.prologue)return[];
  const p=s.prologue,c=s.qiheChapter,rows=[],k=knowledge(s),line=(options.mainLine||'').replace(/\s*·\s*J\s*[^·]*/g,'').trim();
  const add=r=>rows.push({...r,t:r.title,d:r.origin||'',done:r.status==='done',group:r.kind||'支线',giver:r.owner?CAST[r.owner]?.name:null});
  const prologueDone=!!(p.rested||c);
  (window.QiheMilestones?.list(s)||[]).forEach((m,i)=>add({id:'ev:'+i,title:m.t,kind:'江湖经历',status:'done',origin:m.d,objective:m.d,where:'',people:[],action:null,progress:[step(m.t,m.d)]}));
  if(!prologueDone)add({id:'main:prologue',title:'眼下',kind:'主线',status:prologueDone?'done':'active',origin:'初到栖河，在山村歇脚。帮忙与问话都是行路中相识的开始。',objective:prologueDone?'已在栖河度过第一夜，异乡的行路从这里开始。':line||'沿路下山，进入栖河村。',where:'栖河村',people:['ye','chen','aunt'],action:prologueDone?null:{type:'resume',label:'继续游玩'},progress:[...(p.arrival?.stage==='done'?[step('进入栖河村','与叶蘅相识，一同下山。')]:[]),...(p.relicSeen?[step('帮忙收好药箱','叶蘅自己保管旧物。')]:[]),step(prologueDone?'在陈伯客房过夜':'继续村中行程',prologueDone?'第一夜已过。':'准备好后收拾歇息。',prologueDone)]});
  if(c){
   const done=['ended','cultivation'].includes(c.stage),progress=[],ms=window.QiheChapter?.mainStep?.(c);
   if(c.stage!=='opening')progress.push(step('进村走访','在栖河自由走访。'));
   if(k.xu)progress.push(step('与徐令仪正式会面','叶蘅说自己从没托人保管什么医武谱。'));
   if(k.three)progress.push(step('与岑霜、沈雁回会面','叶蘅说自己从没答应交匣子、交药样。'));
   if(['escape','refuge','mountain','ended','cultivation'].includes(c.stage))progress.push(step('从村中撤离','随乡邻与药车离村。'));
   if(evidence(c))progress.push(step('对一对三张附页','陈伯拿出了原底单，三家各自认了错。'));
   if(done)progress.push(step('山居安顿','乡邻得到接应，赴山居暂住。'));
   else progress.push(step('当前行程',ms?ms.title+'（'+ms.where+'找'+ms.who+'）':line||'准备好后继续当前剧情。',false));
   if(!done)add({id:'main:qihe',title:'眼下',kind:'主线',status:done?'done':'active',origin:k.xu?'正道盟的徐令仪拿着委托上门，叶蘅却说自己从没托过人。村里来的人越来越多，说法也越来越乱。':'在栖河继续走访，照应乡邻，了解村里的日常与来人的消息。',objective:done?'已护送乡邻离村，在山居安身。':ms?ms.title+'：到'+ms.where+'找'+ms.who+'。':line||'在村中走访，准备好后继续主线。',where:ms?ms.where:phase(s).date,people:['ye',...(k.xu?['xulingyi']:[]),...(k.three?['censhuang','shenyanhui']:[])],action:done?null:ms?{type:'npc',id:ms.npc,label:'去找'+ms.who}:{type:'continue',label:'继续主线'},progress});
   if(c.stage==='cultivation')add({id:'main:cultivation',title:'眼下',kind:'主线',status:'active',origin:'在归云谷安顿下来，学习与日常往来从这里继续。',objective:line||'在山居继续当前行程。',people:['ye','zhouyan'],where:'归云谷',action:{type:'continue',label:'继续当前行程'},progress:[step('到达山居','已经安顿。'),step('当前行程',line||'按当前行程继续。',false)]});
  }
  // 2026-10-23 剧本二提议：周婶三件合成一条「替周婶跑一圈」，一条任务三步，进度从 errands 三个键推导（opening-errands-rework.md 0.1）
  {const e=p.errands||{},vals=['bowls','cloth','medicine'].map(k=>e[k]);
   if(vals.some(v=>v&&!['none','closed'].includes(v))){
    const sent=k=>['done','collected','delivered'].includes(e[k]),allSent=sent('bowls')&&sent('cloth')&&sent('medicine'),done=vals.every(v=>v==='done');
    const next=!sent('bowls')?['chen-door','村内东北 · 陈伯家门厅','把碗送到陈伯家门厅。']:!sent('cloth')?['inn-door','南村口 · 客栈','找客栈店家取布。']:!sent('medicine')?['elder','南村口 · 老人家','把药送到村口老人家门前，带回竹篮。']:['clinic-door','村内东侧 · 药棚','回药棚找周婶交差。'];
    add({id:'errand:round',title:'替周婶跑一圈',kind:'支线 · 周婶',status:done?'done':'active',owner:'aunt',origin:'周婶托你顺路跑一圈：陈伯家还碗、客栈取布、村南老人家送药并带回竹篮，办完回药棚交差。',objective:done?'三处都办完，已回药棚交差。':next[2],people:['aunt','chen','merchant','elder'],where:done?'栖河 · 帮过的忙':next[1],chapterNpc:done?null:next[0],action:done?null:{type:'npc',id:next[0],label:'标记地点'},
     progress:[step('陈伯家还碗','碗送到陈伯家门厅。',sent('bowls')),step('客栈取布','从店家手里取到布包。',sent('cloth')),step('村南送药','药送到老人家，带回竹篮。',sent('medicine')),step('回药棚交差','把布和竹篮交给周婶。',done)]});
   }}
  for(const [key,d]of Object.entries(questDef)){
   const q=k.q[key];if(!seenQuest(q)||(departed(c)||window.QiheOutsiders?.questOpen&&!QiheOutsiders.questOpen(key))&&q.stage!=='done')continue; // 2026-10-21 过了时限没办成的，和撤离后一样不再列出
   const done=q.stage==='done',checked=['checked','witnessed','done'].includes(q.stage),witnessed=['witnessed','done'].includes(q.stage);
   const target=q.stage==='accepted'?d.target:key==='ledger'&&q.stage==='checked'?'bailiff':d.owner;
   const location=target==='bailiff'?'东埠 · 现场差役':target===d.owner?d.owner==='xulingyi'?'南村口 · 联络院门前':d.owner==='shenyanhui'?'东埠 · 采办核货点':c?.halfDay>=4?'东埠 · 装卸路':'南村口 · 车道旁':d.place;
   const objective=done?d.summary:q.stage==='accepted'?d.first:key==='ledger'&&q.stage==='checked'?'到东埠找差役，核实验收签记。':'把核实口信带回'+CAST[d.owner].name+'。';
   let paper;
   if(key==='ledger')paper={id:'out:ledger',title:'采办药单',fields:checked?[['货药','两篓'],['病人药包','一篓']]:[['册载','三篓'],['东埠实见','两篓']],note:!checked?'数量待核 · 沈雁回出示':!witnessed?'用途已核 · 签记待核':'签记已核 · 保留未验注明',body:!checked?'收验册记三篓，东埠实见两篓。数量、用途与原始签押尚待核实。':!witnessed?'周婶说明：两篓货药，一篓是已分给病人的药包；她说无人查验，签字仍需向差役核实。':'差役说明“已验”栏没有签名，不能当成验收。两篓货药与一篓病人药包应分栏记录。'};
   else if(key==='letter')paper={id:'out:letter',title:'未落款的拜帖',fields:[['来件','联络院'],['受帖人','未填']],note:checked?'口信已核 · 陈伯提醒主人意愿':'来处待辨 · 徐令仪出示',body:checked?'陈伯提醒，登记与保管不能代替旧物主人同意。'+(done?'口信已带回徐令仪。':'口信尚待带回。'):'联络院递出的拜帖未填受帖人，徐令仪托萧白找陈伯辨认来处。'};
   else paper={id:'out:account',title:'旧货账条',fields:checked?[['旧罐','六只'],['货款','结清']]:[['来件','乌魁'],['买卖','待核']],note:checked?'账目已核 · 玉匣传讯另查':'药商账目待核',body:checked?'药商说六只旧药罐的钱早已结清。玉匣的传闻不是叶家答应交物的凭据。':'乌魁带来的旧货账尚待药商核对。收钱、卖货与玉匣传闻不能混为一事。'};
   add({id:'out:'+key,title:d.title,kind:'支线 · '+CAST[d.owner].name,status:done?'done':'active',owner:d.owner,origin:d.origin,objective,where:done?'栖河 · 帮过的忙':location,chapterNpc:done?null:target,action:done?null:{type:'npc',id:target,label:'标记地点'},people:[d.owner,...({letter:['chen'],account:['apothecary'],ledger:['aunt',...(witnessed?['bailiff']:[])]})[key]],paper,reward:done&&q.rewarded?d.reward:null,progress:[step('答应帮忙',key==='ledger'?'册载三篓，东埠实见两篓。':'已接下核实口信。'),step(checked?'已向当事人核实':'向当事人核实',checked?key==='ledger'?'周婶已说明药物用途。':key==='account'?'药商已说明旧罐买卖。':'陈伯已说明拜帖来处。':d.first,checked),...(key==='ledger'?[step(witnessed?'已核实现场签记':'核实现场签记',witnessed?'差役确认“已验”没有签名。':checked?'去东埠请差役核对签押。':'先问清是几篓、做什么用的，再看是谁签的字。',witnessed)]:[]),step(done?'口信已交回':'交回核实口信',done?d.summary:'带回原始说明，不替主人作主。',done)]});
  }
  const activities={clinic:['药棚帮忙','帮叶蘅处理普通药包与送药。',['ye'],'已照应药棚的事情。'],transport:['修车认路','帮陆衡照应药车与乡邻出入。',['luheng','chen'],'已经整备药车或护送老人。'],practice:['学习丙级《护路棍法》','向陆衡学习护路棍法第一层。',['luheng'],'已学横杆护身，收到练习棍与本人笔记。'],market:['集市帮忙','在集市照应普通家当与传话。',['merchant',...(c?.choices?.market==='rumor'?['apothecary']:[])],'已办过集市的事情。']};
  for(const [id,a]of Object.entries(activities))if(c?.choices?.[id]||(id==='practice'&&c?.granted))add({id:'activity:'+id,title:a[0],kind:'村中活动',status:'done',origin:a[1],objective:a[3],where:'栖河 · 活动记录',people:a[2],progress:[step('已完成',a[3])]});
  if(c&&['refuge','mountain','ended','cultivation'].includes(c.stage))add({id:'main:evidence',title:evidence(c)?'三张附页与第十七号底单':'三张附页对质',kind:'主线 · 对证',status:evidence(c)?'done':'active',origin:'安置伤者后，一同核对三方附页与叶家的原始记录。',objective:evidence(c)?'对质的结果：原底单上只有六只旧药罐，三张附页却分别写成交谱、还匣、交样。三家各自认了错，背后是谁还不知道。':'先安顿伤者，再把三张附页摊开来对一对。',where:'邻村接应院 · 核对点',people:['ye','zhouyan','chen','xulingyi','censhuang','shenyanhui'],action:{type:'evidence',label:evidence(c)?'查看对证记录':'对一对附页'},chapterEvidence:true,progress:[step('到达接应院','乡邻已得到接应。'),step(evidence(c)?'附页对过了':'核对原底单',evidence(c)?'原记录与三份附页已逐项对照。':'不以交出遗物或完成可选跑腿为条件。',evidence(c))]});
  return rows;
 }
 const mountainPeople={zhouyan:{actor:'zhou',name:'周砚',role:'归云谷掌门 · 萧白的师父',bio:'收萧白入门，从站桩、调息教起。练场上话少，饭桌上也有被师母堵得说不出话的时候。'},shimu:{actor:'shimu',name:'江采薇',role:'师母 · 谷中日常',bio:'管着厨房与谷里的日常，拜师那碗面给萧白多卧了一个蛋。说话爽快，记得每个人爱吃什么。'},yin:{actor:'yin',name:'殷红缨',role:'小师叔 · 归云谷门人',bio:'常年在外走动，回谷喜欢翻墙。教人听声与落脚时很利落，若谈到旧事，又是另一副神情。'},zhong:{actor:'zhong',name:'钟拙',role:'二师叔 · 木工与练场',bio:'木工做得好，也爱带人练腿。和师兄抬杠归抬杠，萧白要出门时，他早把行囊里缺的东西补齐了。'},fang:{actor:'fang',name:'方迟',role:'大师兄 · 在外历练',bio:'练功和办事都稳妥，愿意陪新师弟过招。下山负伤后回谷休养，仍惦记着没办完的事。'},dou:{actor:'dou',name:'卢小豆',role:'小师兄 · 归云谷弟子',bio:'初见时十四岁，十一岁入门。比萧白小三岁，却坚持早入门就得叫师兄。爱吃，也想下山证明自己；喂鹅时常被将军追着跑。'},man:{actor:'man',name:'周小满',role:'师父与师母的女儿',bio:'嘴快，心细，娘的生辰总记得。她想认药，也敢当着大人的面问那些没人肯先开口的问题。'},pei:{actor:'pei',name:'裴知古',role:'溪东书屋 · 裴家姑娘',bio:'住在溪东书屋，眼力好，读书认真；讲起旧书能忘了时辰。家中的残稿与父亲，是她一直放在心上的事。'}};
 function cultivationRelationship(s,name){if(!s.cultivation||!window.CultivationRelations?.profiles[name])return null;const r=CultivationRelations.inspect(s.cultivation,name);return {...r,recent:(s.cultivation.relations?.[r.id]?.interactions||[]).slice(-3).reverse().map(e=>({delta:e.delta,source:s.cultivation.history.find(h=>h.id===e.id)?.name||(e.kind==='letter'?'寄送近况信':e.kind==='gift'?'赠送'+(window.CultivationData?.resources[e.gift]||'物品'):'一起经历'),period:e.period}))};}
 function people(s={}){
  const k=knowledge(s),allTasks=tasks(s),out=[];
  for(const [id,base]of Object.entries(CAST)){
   if(!k.met[id])continue;
   const identity=k.identity[id],r=k.record[id],events=[],relations=[];
   let bio=base.bio||'',role=base.role,faction=base.faction;
   if(!identity){role='栖河相识的来客';faction='身份未记';bio='在栖河相识的来客，目前已记下姓名。';}
   else if(id==='xulingyi')bio='正道盟派来的文议执事，说话有条有理，习惯先信文书。这回是拿着一封委托，来封存叶家的医武谱。';
   else if(id==='censhuang')bio='归烬堂管对外事务的人，说话带笑，护短却也认账。这回是为一只“玉匣”来的。';
   else if(id==='shenyanhui')bio='受程巡检委办，核药名、数量与原始签记。她主张分清每项记录，不把未经核实的附页当作验收。';
   else if(id==='ye')bio='在村外与萧白相识，随后一同进入栖河。她照料药棚病人，村里的送药和收拾也常有她的身影。'+(k.p.relicSeen?'父亲留下的笔记和母亲的药箱由她自己保管。':'');
   if(id==='zhouyan'&&(k.xu||later(k.c)))bio='温行舟的旧友，听到叶家出让旧物的传闻后到栖河问讯。他来问人的消息，并不索取叶家的药箱。';
   events.push({phase:r?.firstPhase||'栖河相识',text:identity?'已记下'+base.name+'的身份与往来。':'与这位来客相识。'});
   if(id==='ye'&&k.p.relicSeen)events.push({phase:'初到栖河',text:'亲手收好父亲笔记和母亲药箱。'});
   if(id==='xulingyi'&&k.xu)events.push({phase:'第一日傍晚',text:'要把叶家的医武谱封存带回盟里，叶蘅当面拒绝了。'});
   if(['censhuang','shenyanhui'].includes(id)&&k.three)events.push({phase:'第二日傍晚',text:id==='censhuang'?'当面交涉玉匣，叶蘅否认曾答应交出。':'来查叶家的药，叶蘅说自己没答应交药样。'});
   if(k.c?.clashVersion&&['xulingyi','censhuang','shenyanhui'].includes(id))events.push({phase:'第三夜 · 侧口',text:({xulingyi:'与岑霜短暂交锋，以短剑出手并护住同伴；听见火警后停手，命护院让路。',censhuang:'为护住堂众，以短刀与徐令仪交手；听见火警后停手，命堂众退往侧门。',shenyanhui:'护送患者穿过窄口后发现烟火，叫停双方，转身组织救援。'})[id]});
   const own=({xulingyi:'letter',censhuang:'account',shenyanhui:'ledger'})[id],oq=k.q[own];
   if(own&&oq?.stage==='done')events.push({phase:'事情办完',text:questDef[own].summary});
   if(id==='chen'&&['checked','done'].includes(k.q.letter?.stage))events.push({phase:'拜帖口信',text:'提醒旧物有主人，登记与保管不能代替叶蘅同意。'});
   if(id==='aunt'&&['checked','witnessed','done'].includes(k.q.ledger?.stage))events.push({phase:'药单核实',text:'说明两篓是货药，一篓是分给病人的药包。'});
   if(id==='bailiff'&&['witnessed','done'].includes(k.q.ledger?.stage))events.push({phase:'现场签记',text:'确认“已验”栏没有签名，应分栏记药物用途。'});
   if(id==='luheng'&&k.c?.granted)events.push({phase:'护路棍法',text:'传授第一层横杆护身，赠送练习棍与本人笔记。'});
   if(id==='song'&&k.c?.events?.['c1-s2'])events.push({phase:'第三日',text:'问起装卸侧口；萧白此前未向他提过这个位置。'});
   if(evidence(k.c)&&['xulingyi','censhuang','shenyanhui'].includes(id))events.push({phase:'邻村对证',text:({xulingyi:'收回了封存的要求，回去查是谁转来的委托。',censhuang:'签赔偿清单、看管乌魁，回查堂内传讯。',shenyanhui:'撤销扣箱，记下查验限制，交程铎复核。'})[id]});
   if(id==='xulingyi'&&(k.xu||['checked','done'].includes(k.q.letter?.stage)))relations.push(['ye','旧物主人']);
   if(['xulingyi','chen'].includes(id)&&['checked','done'].includes(k.q.letter?.stage))relations.push([id==='chen'?'xulingyi':'chen',id==='chen'?'托你送拜帖的人':'拜帖收信人']);
   if(id==='shenyanhui'&&seenQuest(k.q.ledger))relations.push(['aunt','药棚核数人']);
   if(id==='aunt'&&['checked','witnessed','done'].includes(k.q.ledger?.stage))relations.push(['shenyanhui','托你核药单的人']);
   if(id==='censhuang'&&['checked','done'].includes(k.q.account?.stage))relations.push(['apothecary','旧货账见证人']);
   if(id==='ye'&&k.xu)relations.push(['xulingyi','归烬堂管事']);
   if(['ye','aunt'].includes(id)&&k.c)relations.push([id==='ye'?'aunt':'ye','药棚照料相关']);
   if(id==='luheng'&&k.c?.choices?.transport)relations.push(['chen','药车整备']);
   out.push({...base,id,role,faction,bio,identity,first:r?.firstPlace||'栖河（旧档未记录地点）',firstPhase:r?.firstPhase||'旧档相识记录',events,relations:relations.filter(([other])=>k.met[other]),tasks:allTasks.filter(t=>t.people?.includes(id)).map(t=>t.id)});
  }
  const cu=s.cultivation;
  if(cu){for(const[id,p]of Object.entries(mountainPeople)){const seen=cu.facts['met_'+p.actor]||(p.actor==='zhou'&&cu.joined)||cu.history?.some(h=>window.CultivationVisitors?.all().some(d=>d.id===h.action&&(d.actor===p.actor||(p.actor==='dou'&&d.id==='gy_noodles'))));if(!seen)continue;const old=out.find(x=>x.id===id),art=window.CultivationHousehold?.portraits[p.actor];const item={...(old||{}),id,portraitActor:p.actor,name:p.name,role:p.role,faction:p.actor==='pei'?'溪东书屋':'归云谷',bio:p.actor==='fang'&&!cu.facts.gy_brother_hurt_seen?'大师兄，练功和办事都稳妥，愿意陪新师弟过招。常在谷外历练，回来会问萧白功课。':p.actor==='pei'&&!(cu.facts.gn_letter_seen||cu.facts.gn_chests_seen)?'住在溪东书屋，读书认真；讲起旧书会忘了时辰。与萧白相识后，常把书里的疑处拿来一起想。':p.bio,art:art||old?.art,full:!!art,identity:true,first:p.actor==='pei'?'溪东书屋':'归云谷',events:[...(old?.events||[]),...cu.history.filter(h=>window.CultivationVisitors?.all().some(d=>d.id===h.action&&d.actor===p.actor)).map(h=>({phase:'第'+(Math.floor(h.period/60)+1)+'年'+(Math.floor(h.period/5)%12+1)+'月',text:h.name}))].slice(-10),relations:old?.relations||[],tasks:old?.tasks||[]};if(old)Object.assign(old,item);else out.push(item);}
   for(const p of out)p.affection=cultivationRelationship(s,p.name==='陆衡'?'陆衡':p.name);
  }
  return out;
 }
 function recordEncounter(who,text=''){
  if(typeof S==='undefined'||!S?.prologue)return false;
  const id=nameId[String(who||'').split(' · ')[0]];if(!id)return false;
  // Only a real dialogue call reaches this mutation; UI readers use pure snapshots.
  const store=S.qiheCodex||(S.qiheCodex={version:1,people:{}});store.people||={};
  let r=store.people[id],changed=false;
  if(!r){r=store.people[id]={firstScene:S.scene,firstPlace:typeof SC!=='undefined'?SC[S.scene]?.name||'栖河':'栖河',firstPhase:phase(S).date,identity:!['xulingyi','censhuang','shenyanhui'].includes(id)};changed=true;}
  const identifies=({xulingyi:/文议|正道盟|核办/,censhuang:/归烬堂|交涉/,shenyanhui:/委办|程巡检|跑商路/})[id];
  if(!r.identity&&identifies?.test(text)){r.identity=true;changed=true;}
  return changed;
 }
 window.QiheJournal={version:1,tasks,people,phase,knowledge,recordEncounter};
 // Preserve normal dialogue and its save/checkpoint flow, including later voice wrappers.
 if(typeof say==='function'){const previous=say;say=function(who,text,...rest){const result=previous.call(this,who,text,...rest);recordEncounter(who,text);return result};window.say=say;}
 if(typeof choose==='function'){const previous=choose;choose=function(who,text,...rest){const result=previous.call(this,who,text,...rest);recordEncounter(who);return result};window.choose=choose;}
})();
