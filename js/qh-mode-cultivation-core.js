/* 无 DOM 的养成状态机；活动扣费、恢复和结算只经过这里。 */
(function(root){
'use strict';
const D=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-data.js'):root.CultivationData;
const V=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-visitors.js'):root.CultivationVisitors;
const R=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-relations.js'):root.CultivationRelations;
const PH=typeof module==='object'&&module.exports?require('./qh-pre-hangao'):root.PreHangao;
const PEI=typeof module==='object'&&module.exports?require('./pei-companion'):root.PeiCompanion;
const copy=x=>JSON.parse(JSON.stringify(x));
function nominalCost(a){const n=a.costOverride??D.categories.find(c=>c.id===a.category)?.cost;if(!Number.isInteger(n)||n<1||n>D.energyPerPeriod)throw Error('活动费用配置不正确。');return n;}
// 第二章培养的体力（2026-10-11 用户确认恢复）：每个时段 12 点。修习、生产、学艺、打杂、通信按栏目计；
// 剧情（自动开场的、闲逛或串门遇到的、来客）不耗体力；去哪里闲逛、串门也不耗体力（没事就是纯逛，2026-10-08 的规则不变）。
function actionCost(a){if(!a)return 0;if(a.strollPlace)return 0;if(a.once||a.auto||a.visitor||a.household||a.id==='QH01')return 0;return nominalCost(a);}
// CH2-BALANCE-2：五档心情指数1～5参与学习效率；行动开始时确定，结算后再改变心情。
// 练功（基本功、招式）和杂活磨心情，生产、写信、出去走走提心情；每个时段结束按剩余体力回一点。（2026-10-12 用户：练招是降心情的）
const B=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-balance.js'):root.CultivationBalance;
const MOOD_STATES=B.moods;
const moodState=s=>B.mood(s);
const MOOD_DELTA={basic:-5,chores:-7,skill:-4,production:4,arts:2,mail:4,stroll:4};
const clampMood=v=>Math.max(0,Math.min(100,v));
const period=s=>(s.month-1)*5+s.phase;
const initial=()=>({version:1,preHangao:{version:1},balanceVersion:2,martialXp:{},economyVersion:D.economyVersion,route:'mountain',month:1,phase:0,energy:D.energyPerPeriod,mood:60,mode:'home',joined:false,learned:{},progress:{},resources:{grain:2,cloth:2,herb:0,food:0,pouch:0},facts:{},quotas:{},history:[],letters:[],pending:null,summary:null,sequence:0,relations:{},selection:{category:'basic',action:'B03'},journey:null,screen:'hub'});
// 读档先迁移后校验（2026-10-16 审查 P0）：宽松校验接受不大于当前的经济版本（缺省即第 1 版），迁移后再按 strict 校验。
// 各经济版本当时的每期体力上限；未登记的旧版本按当前上限计。
const ENERGY_CAP={1:10};
const economyOf=v=>v===undefined?1:v;
const knownEconomy=v=>v===undefined||Number.isInteger(v)&&v>=1&&v<=D.economyVersion;
const energyCap=v=>economyOf(v)===D.economyVersion?D.energyPerPeriod:ENERGY_CAP[economyOf(v)]??D.energyPerPeriod;
function validate(s,options={}){if(!s||s.version!==1||!knownEconomy(s.economyVersion)||options.strict&&!s.pending&&s.economyVersion!==D.economyVersion||s.route!=='mountain'||!Number.isInteger(s.month)||s.month<1||s.month>36||!Number.isInteger(s.phase)||s.phase<0||s.phase>4||!Number.isInteger(s.energy)||s.energy<0||s.energy>energyCap(s.economyVersion)||!['home','story','journey_ready','journey','complete'].includes(s.mode))throw Error('养成存档格式不正确。');
const dict=x=>x&&typeof x==='object'&&!Array.isArray(x),fail=()=>{throw Error('养成存档字段不完整。');};
if(!Number.isInteger(s.mood)||s.mood<0||s.mood>100||typeof s.joined!=='boolean'||!Number.isInteger(s.sequence)||s.sequence<0||!['hub','world'].includes(s.screen))fail();
for(const k of ['learned','progress','resources','facts','quotas','selection'])if(!dict(s[k]))fail();
for(const k of ['history','letters'])if(!Array.isArray(s[k]))fail();
if(!D.categories.some(c=>c.id===s.selection.category)||s.selection.action!==null&&!D.actions.some(a=>a.id===s.selection.action))fail();
for(const k of Object.keys(D.resources))if(!Number.isInteger(s.resources[k])||s.resources[k]<0)fail();
if(s.dialogue!=null&&(!dict(s.dialogue)||!['weapon-offer','delivery'].includes(s.dialogue.id)||s.dialogue.id==='weapon-offer'&&(!Number.isInteger(s.dialogue.period)||s.dialogue.period<0||s.dialogue.period>179)))fail();
if(s.relations!==undefined){if(!dict(s.relations))fail();for(const[id,r]of Object.entries(s.relations)){if(!Object.values(R.profiles).some(p=>p.id===id)||!dict(r)||!Number.isInteger(r.score)||r.score<0||r.score>100||!Array.isArray(r.interactions)||typeof r.returnOffered!=='boolean')fail();}}
if(s.pending){const p=s.pending;if(!dict(p)||!knownEconomy(p.economyVersion)||!D.actions.some(a=>a.id===p.action)||!['choice','ready','result'].includes(p.stage)||!Number.isInteger(p.period)||p.period<0||p.period>179||p.stage==='result'&&!dict(p.result))fail();if(p.animation&&(!dict(p.animation)||!Number.isFinite(p.animation.startedAt)||p.animation.startedAt<0||p.animation.duration!==2000||typeof p.animation.done!=='boolean'))fail();if(p.story!==undefined&&(p.story!==true||!D.actions.find(a=>a.id===p.action).once||![0,1].includes(p.storyStep)||p.storyLine!==undefined&&(!Number.isInteger(p.storyLine)||p.storyLine<0||p.storyLine>9)||p.animation))fail();}
if(s.pending && D.actions.find(a=>a.id===s.pending.action)?.visitor && !s.pending.visitor)fail();
if(s.pending?.visitor){if(!D.actions.find(a=>a.id===s.pending.action)?.visitor||!s.pending.story)fail();V.validate(s.pending);}
if(s.mode==='journey'){const j=s.journey;if(!dict(j)||j.month!==s.month||j.returnMonth!==s.month+1||j.returnRoute!==s.route||!Array.isArray(j.visited)||j.visited.some(id=>!['gate','street','alley','ferry'].includes(id)))fail();}
if(s.mode==='complete'&&(s.month!==36||s.phase!==4||s.energy!==0))fail();return s;}
// Keep paid legacy activity/result snapshots intact. The difference is granted
// only after closing; the marker also prevents reloads from granting it again.
function migrateEconomy(s){if(s.economyVersion===D.economyVersion||s.pending)return false;const free=s.mode==='home'&&!D.journeyMonths.includes(s.month)&&!(s.month===3&&s.phase===2);if(free)s.energy=Math.min(D.energyPerPeriod,s.energy+Math.max(0,D.energyPerPeriod-energyCap(s.economyVersion)));s.economyVersion=D.economyVersion;return free;}
const restore=s=>{const restored=validate(copy(s));if(!s.preHangao&&s.month>=5)restored.preHangao={version:1,legacyFirstCity:true};migrateEconomy(restored);validate(restored,{strict:true});G.ensure(restored,D.actions);return restored;};
// 读档校验失败时的修复：只修能确定安全的字段，其余仍交给 restore 判定。返回 {state,repairs,error}；state 为 null 表示修不了。
// 进行中活动指向已删除的动作时只清除该活动，不退回体力（退不退属于数值规则，待用户确认）。
function recover(raw){try{return {state:restore(raw),repairs:[],error:null};}catch(first){
 const dict=x=>x&&typeof x==='object'&&!Array.isArray(x),repairs=[];let s;try{s=copy(raw);}catch(e){return {state:null,repairs,error:first.message};}
 if(!dict(s))return {state:null,repairs,error:first.message};
 const sel=s.selection;if(!dict(sel)||!D.categories.some(c=>c.id===sel.category)||sel.action!==null&&!D.actions.some(a=>a.id===sel.action)){s.selection=initial().selection;repairs.push('培养栏目选择已失效，已重置为默认');}
 if(dict(s.relations)){const ids=new Set(Object.values(R.profiles).map(p=>p.id));for(const id of Object.keys(s.relations))if(!ids.has(id)){delete s.relations[id];repairs.push('已删除失效的关系人物：'+id);}}
 if(dict(s.journey)&&Array.isArray(s.journey.visited)){const ok=s.journey.visited.filter(id=>['gate','street','alley','ferry'].includes(id));if(ok.length!==s.journey.visited.length){repairs.push('已去掉历练中失效的地点：'+s.journey.visited.filter(id=>!ok.includes(id)).join('、'));s.journey.visited=ok;if(s.journey.place&&!ok.includes(s.journey.place))s.journey.place=null;}}
 if(s.pending&&(!dict(s.pending)||!D.actions.some(a=>a.id===s.pending.action))){repairs.push('进行中的活动'+(dict(s.pending)&&s.pending.action?'（'+s.pending.action+'）':'')+'已失效，已清除（未退回体力）');s.pending=null;}
 if(!repairs.length)return {state:null,repairs,error:first.message};
 try{return {state:restore(s),repairs,error:first.message};}catch(e){return {state:null,repairs,error:e.message};}}}
const hasActivityInPeriod=(s,id,slot=period(s))=>s.history.some(h=>h.period===slot&&h.action===id);
// Derived from paid history, never add the same permanent bonus on reload.
const G=typeof module==='object'&&module.exports?require('./qh-mode-cultivation-growth.js'):root.CultivationGrowth;
function growth(s){return G.growth(s,D.actions);}
function syncNotices(s){for(const n of D.notices||[]){if(n.slot>period(s)||s.facts[n.id])continue;if(n.id==='escort_return'&&!s.facts.first_delivery)continue;s.facts[n.id]={period:n.slot};s.letters.push({id:'notice-'+n.id,recipient:'谷中消息',theme:'日程',due:n.slot,read:!!n.silent,body:n.text});}}
function reconcileWorld(world){PEI.sync(world);const s=world.cultivation;if(!s)return;const g=growth(s);world.skills||={};
 G.reconcile(world,D.actions);
 // 殷红缨在“代师出行”同行或除夕后正式入队；队伍满员时只进名册，不挤掉现有同伴。
 if(s.facts.gy_yin_recruit){world.qiheRoster||={version:1,members:['hero',...(world.party||[])],availability:{},revision:0,commands:[]};if(!world.qiheRoster.members.includes('yinhongying'))world.qiheRoster.members.push('yinhongying');world.party||=[];if(!world.party.includes('yinhongying')&&world.party.length<3&&!s.facts.gy_yin_party_offered){world.party.push('yinhongying');}s.facts.gy_yin_party_offered||=true;}
 if(V.household?.routes)world.qiheRoutes=V.household.routes(s); // 入队／if 线／基础事实汇总，供大地图章节读取
 if(g.martial.breathing){const x=world.xinfa||={known:[],lv:{},prog:{},main:null,subs:[]};x.known||=[];x.lv||={};if(!x.known.includes('tuna'))x.known.push('tuna');x.lv.tuna=Math.max(x.lv.tuna||0,g.martial.breathing.level);if(!x.main)x.main='tuna';}
}
function syncMode(s){s.screen='hub';s.economyVersion=D.economyVersion;if(D.journeyMonths.includes(s.month)){s.mode='journey_ready';s.energy=0;}else if(s.month===3&&s.phase===2){s.mode='story';s.energy=0;}else{s.mode='home';s.energy=D.energyPerPeriod;}s.quotas={};syncNotices(s);}
function join(s){if(s.mode!=='home'||s.pending)throw Error('当前不能拜师。');s.joined=true;s.facts.joined=true;syncNotices(s);return s;}
// 只列当前已有互动内容的人物；陆衡已在开篇相识，通信不要求当面来访。
function giftRecipients(s){return D.giftRecipients.filter(n=>(n.id!=='zhou'||s.joined)&&(n.id!=='ye'||s.month<=12)&&(n.id!=='neighbor'||period(s)>=2)&&(n.id!=='shimu'||s.facts.gy_noodles_seen)&&(n.id!=='yin'||s.facts.gy_night_return_seen)&&(n.id!=='pei'||s.facts.met_pei||s.facts.gn_lamp_seen)&&(n.id!=='zhong'||s.facts.gy_prelude_tour_seen||s.facts.gy_noodles_seen)&&(n.id!=='fang'||s.facts.gy_fang_back_seen)&&(n.id!=='dou'||s.facts.gy_noodles_seen)&&(n.id!=='man'||s.facts.gy_noodles_seen));}
// 寄信沿用当前已开放的往来对象，不创建未认识或没有互动内容的人物。
// 2026-10-20 用户同意：书信只寄给不在谷里的人（陆衡、邻村乡邻、溪东裴家、下山在外的方迟）；同住的人只能送礼、当面说。
function letterRecipients(s){return giftRecipients(s).filter(n=>['lu','neighbor','pei'].includes(n.id)||(n.id==='fang'&&s.facts.gy_fang_leaves_seen&&!s.facts.gy_brother_hurt_seen));}
function contactReason(s,id,recipient){if(recipient===undefined)return '';if(!(id==='C01'?letterRecipients(s):giftRecipients(s)).some(n=>n.name===recipient))return'尚未认识或不能投递给这位收件人。';const sent=s.history.some(h=>h.period===period(s)&&h.action===id&&(h.recipient||s.letters.find(l=>l.id===h.id)?.recipient||'陆衡')===recipient);return sent?`${recipient}本期已${id==='C01'?'收到一封近况信':'收到一份礼物'}，下期再${id==='C01'?'寄信':'赠送'}。`:'';}
function availability(s,a,options={}){if(a?.id==='C02'&&options.gift){if(!['food','herb','pouch'].includes(options.gift))return'此物品不能投递。';a={...a,inputs:{[options.gift]:1}};}if(!a)return'没有这个培养项目。';if(s.pending)return'请先完成或关闭当前活动结果。';if(s.mode!=='home'&&!(a.storyMode&&a.storyMode===s.mode))return s.mode==='complete'?'三年培养已结束。':'本期用于行程，不能领取据点体力。';if(a.locked)return a.locked;const balanceGate=B.gate(s,a);if(balanceGate)return balanceGate;
 if(['sword','fist'].includes(a.learn)&&!s.learned[a.learn]&&s.learned[a.learn==='sword'?'fist':'sword'])return'先练好已学的基础功法；交叉修习需要另一次传艺，目前尚未开放。';
 for(const k of a.requires||[]){if(k==='joined'&&!s.joined)return'先与周砚正式拜师，再接受武学指导。';if(k==='ye'&&s.month>12)return'叶蘅第二年的学习日程尚待剧情编排。';if(k==='lu'&&!(s.month===2&&s.phase>=3||s.month===3&&s.phase<=1))return'陆衡尚未到谷；来访窗口为二月下旬至三月上旬。';if(k==='village_visit'&&period(s)<2)return'一月中旬收到乡邻近况后开放读信。';if(!['joined','ye','lu','village_visit'].includes(k)&&!s.learned[k])return'尚未受过前置指导，请查看学艺或基本功课程。';}
 if(a.window&&(period(s)<a.window[0]||period(s)>a.window[1]&&!(a.main&&s.month<=5)))return'此邀约的可参与窗口已注明，当前不在窗口内。';for(const key of a.factRequires||[])if(!s.facts[key])return a.factHint||'先完成相关行程或收到邀请。';
 if(V.household?.gate){const why=V.household.gate(s,a);if(why)return why;}
 if(a.adultOnly&&s.month<13)return'萧白满十八岁（第二年正月初一）后才会出现。';
 if(a.relNeed&&(s.relations?.[a.relNeed.id]?.score||0)<a.relNeed.min)return'与'+(a.bottleneck||a.heart||a.teacher)+'的关系还不够。';
 if(a.once&&s.facts[a.once])return'这段经历已完成，不能重复触发。';if(a.quota&&(s.quotas[a.id]||a.id==='W04'&&hasActivityInPeriod(s,a.id)))return a.quotaMessage||'本期可采份额已用完；下期再来。';if(a.mail&&period(s)>=179)return'三年修习即将收束，本期没有下一期投递窗口。';if(a.mail){const why=contactReason(s,a.id,options.recipient);if(why)return why;}for(const[k,n]of Object.entries(a.inputs||{}))if((s.resources[k]||0)<n)return'缺少'+D.resources[k]+' '+(n-(s.resources[k]||0))+'份。';const c=actionCost(a);if(s.energy<c)return'还差'+(c-s.energy)+'点体力。';return'';}
function start(s,id,options={}){G.ensure(s,D.actions);const a=D.actions.find(a=>a.id===id);if(a?.mail)options={...options,recipient:options.recipient??'陆衡'};const why=availability(s,a,options);if(why)throw Error(why);if(options.story&&!a.once)throw Error('此项目不是独立剧情。');if(a.mail&&!['近况','问候乡邻','外出准备'].includes(options.theme))throw Error('请选择信件主题。');const cost=actionCost(a);
 const inputs=a.id==='C02'&&options.gift?{[options.gift]:1}:a.inputs||{};s.energy-=cost;for(const[k,n]of Object.entries(inputs))s.resources[k]-=n;
 const needsChoice=!options.directResult&&!!a.choice&&(!a.learn||!s.learned[a.learn]);s.pending={id:'cultivation-'+(++s.sequence),economyVersion:D.economyVersion,action:id,period:period(s),cost,energyBefore:s.energy+cost,moodBefore:s.mood,balanceVersion:B.version,stage:needsChoice?'choice':'ready',theme:options.theme||null,recipient:options.recipient||null,gift:options.gift||null,inputs,result:null};if(options.story||a.visitor){s.pending.story=true;s.pending.storyStep=0;}if(a.visitor)s.pending.visitor=V.init(s,id);s.selection={category:a.category,action:id};if(options.animate)beginAnimation(s,options.now);return s.pending;}
// 闲逛按地点（2026-10-08）：剧情与地点＋时间绑定。到某地闲逛时，若该地点此刻有未完成、条件已满足的支线就开场；
// 多件同时可遇按确定性随机抽一件（快到期的权重高，读档重来结果不变）；没有就是纯逛，什么也不触发、不扣体力。
const SC=()=>typeof module==='object'&&module.exports?require('./qh-mode-cultivation-scenes.js'):root.CultivationScenes;
const placeOf=a=>SC()?SC().placeKey(a.place):a.place;
// 每个时段闲逛最多遇一段（2026-10-08 用户定）：本时段已遇过就只剩纯逛。
// 谷中人家（串门）与门派里的闲逛分开计：各自每个时段最多遇一段。书屋内的剧情从“溪东书屋”进。
const NEIGHBOR={bookhouse:1,bookhouse_inside:1,terraces:1,watermill:1},doorOf=k=>k==='bookhouse_inside'?'bookhouse':k,metKey=k=>NEIGHBOR[k]?'visit_met':'stroll_met';
function strollPool(s,place){const key=SC()?SC().placeKey(place):place;if(s.facts[metKey(key)]===period(s))return [];return D.actions.filter(a=>a.category==='stroll'&&a.once&&!a.auto&&!a.hidden&&!a.strollPlace&&doorOf(placeOf(a))===key&&!availability(s,a));}
function strollPick(s,place){const pool=strollPool(s,place);if(!pool.length)return null;const now=period(s),w=pool.map(a=>a.window&&a.window[1]-now<=5?3:1);let h=2166136261;for(const ch of now+'|'+place+'|'+s.sequence+'|'+s.history.length){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}let r=h%w.reduce((x,y)=>x+y,0);for(let i=0;i<pool.length;i++){if(r<w[i])return pool[i];r-=w[i];}return pool[0];}
function stroll(s,id){const a=D.actions.find(a=>a.id===id);if(!a?.strollPlace)throw Error('没有这个闲逛地点。');if(s.pending)throw Error('请先完成或关闭当前活动结果。');if(s.mode!=='home')throw Error('本期用于行程，不能闲逛。');if(!s.joined)throw Error('先与周砚正式拜师。');const pick=strollPick(s,a.place);if(pick){start(s,pick.id,{story:true});s.facts[metKey(SC()?SC().placeKey(a.place):a.place)]=period(s);return {story:pick.id};}s.selection={category:'stroll',action:id};return {story:null,text:a.idle};}
function beginAnimation(s,now=Date.now()){if(!s.pending||s.pending.story||s.pending.stage==='result')return false;if(!Number.isFinite(now)||now<0)throw Error('动作时间不正确。');s.pending.animation||={startedAt:now,duration:2000,done:false};return s.pending.animation;}
function finishAnimation(s,now=Date.now()){const a=s.pending?.animation;if(!a)return true;if(a.done)return true;if(now-a.startedAt<a.duration)return false;a.done=true;return true;}
function resolve(s,choice,options={}){const p=s.pending;if(!p)return null;if(p.stage==='result')return p.result;if(p.animation&&!p.animation.done)throw Error('请等待本次动作完成。');const a=D.actions.find(a=>a.id===p.action),before=growth(s),relationsBefore=Object.fromEntries(Object.entries(s.relations||{}).map(([k,v])=>[k,v.score]));if(a.visitor){V.validate(p);if(p.visitor.phase!=='commit')throw Error('请先完成来访对白与选择。');choice=p.visitor.selected;}if(!a.visitor&&p.stage==='choice'&&!options.directResult&&(!Number.isInteger(choice)||choice<0||choice>=a.choice.length))throw Error('请先作出本课选择。');const first=a.learn&&!s.learned[a.learn];if(first){s.learned[a.learn]={source:a.id,period:p.period};if(['sword','fist'].includes(a.learn))s.facts.gy_martial_major||={path:a.learn,source:a.id,period:p.period};}const gainMultiplier=1,fg=a.fight&&a.visitor?V.household.fightGain(s,a,V.selectedKey(s,p)):null,learning=p.legacyBalance?{...B.preview(s,a,!!first,fg),key:a.legacyGain||a.gain,gain:Math.round(((fg?.amount??a.legacyAmount)||0)*(a.fixedGain?1:s.mood>=75?1.15:s.mood>=45?1:s.mood>=20?.9:.75))*(B.legacyScale[a.legacyGain||a.gain]||1),xp:first?0:25}:B.preview(s,a,!!first,fg),gainKey=learning.key,gain=learning.gain;s.progress=G.counters(s,D.actions);if(gainKey&&gain)s.progress[gainKey]=(s.progress[gainKey]||0)+gain;if(learning.artId)B.addXp(s,learning.artId,learning.xp);const outputs={...(a.outputs||{})};if(a.id==='P02')outputs.food+=growth(s).craft.food;if(a.id==='P03')outputs.pouch+=growth(s).craft.pouch;for(const[k,n]of Object.entries(outputs))s.resources[k]=(s.resources[k]||0)+n;if(a.once)s.facts[a.once]={period:p.period,choice};if(a.visitor)V.effects(s,p);if(a.quota)s.quotas[a.id]=true;
 if(a.mail){p.recipient||='陆衡';const event=R.record(s,p);p.relationship=event;s.letters.push({id:p.id,theme:p.theme,recipient:p.recipient,author:event.author,gift:p.gift||null,due:p.period+1,read:false,body:event.body,returnItems:event.returns,returnClaimed:false});}
 s.mood=clampMood(s.mood+(PH.data.scenes.some(x=>x.id===a.id&&x.status==='新增候选')?0:MOOD_DELTA[a.category]||0));p.stage='result';p.resolvedAt=Date.now();p.result={id:p.id,name:a.name,feedback:a.id==='C02'?`给${p.recipient}的${D.resources[p.gift||'food']}已交给捎物人，下一期查看回复。`:a.feedback,relationship:p.relationship||null,recipient:a.mail?p.recipient||'陆衡':null,gift:a.id==='C02'?p.gift||'food':null,gain,gainName:D.progressNames[gainKey],first:!!first,cost:p.cost,energyBefore:p.energyBefore,energyAfter:s.energy,moodBefore:p.moodBefore??s.mood,moodAfter:s.mood,moodMultiplier:gainMultiplier,learning,outputs,choice:choice??null};s.history.push({id:p.id,balanceVersion:B.version,artXp:learning.xp,artId:learning.artId,action:a.id,name:a.name,period:p.period,cost:p.cost,freePractice:p.cost===0,nominalCost:nominalCost(a),gain,gainKey,skillId:G.courses[a.learn]?.skillId||null,systemId:G.courses[a.learn]?.systemId||null,choice:choice??null,...(a.mail?{recipient:p.recipient||'陆衡',gift:p.gift||null}:{})});const after=growth(s);p.result.training={before,after};p.result.gainKey=gainKey;p.result.effectChanges=G.outcome(before,after);p.result.nextEffect=G.hints(s,gainKey,D.actions)+(learning.artId?'；'+B.courseHint(s,a):'');p.result.relationshipChanges=Object.entries(s.relations||{}).filter(([k,v])=>v.score!==(relationsBefore[k]||0)||v.interactions?.some(e=>e.id===p.id)).map(([k,v])=>({id:k,name:Object.keys(R.profiles).find(n=>R.profiles[n].id===k),before:relationsBefore[k]||0,after:v.score,delta:v.score-(relationsBefore[k]||0),reason:v.interactions?.find(e=>e.id===p.id)?.reason||'',stage:R.inspect(s,Object.keys(R.profiles).find(n=>R.profiles[n].id===k)).stage}));p.result.courseBeat=a.beats?.[first?0:Math.min(1,a.beats.length-1)]||null;p.result.lesson=PH.lesson(s,a,!!first,before,after);return p.result;}
function readLetter(s,id){if(s.pending)throw Error('请先结束当前活动。');const l=s.letters.find(x=>x.id===id);if(!l)throw Error('没有这封来信。');if(l.due>period(s))throw Error('来信尚未送达。');if(!l.returnClaimed){for(const[k,n]of Object.entries(l.returnItems||{})){if(!Object.hasOwn(D.resources,k)||!Number.isInteger(n)||n<1)throw Error('回物记录不正确。');}for(const[k,n]of Object.entries(l.returnItems||{}))s.resources[k]=(s.resources[k]||0)+n;l.returnClaimed=true;}l.read=true;return l;}
function relationship(s,name){return R.inspect(s,name);}
function giftPreview(s,name,gift){return R.record(copy(s),{id:'gift-preview',action:'C02',period:period(s),recipient:name,gift});}
// 占整期的剧情（首季护送）收尾后推进到下一时段；赴城转场收尾后正式出发。
function closeResult(s){if(!s.pending||s.pending.stage!=='result')return false;const a=D.actions.find(x=>x.id===s.pending.action);s.pending=null;migrateEconomy(s);
 if(a?.storyMode==='story'&&s.mode==='story'){s.history.push({id:'story-delivery',name:'首次同行送药',period:period(s),cost:0,gain:0});s.phase++;syncMode(s);}
 else if(a?.storyMode==='journey_ready'&&s.mode==='journey_ready'&&a.id!=='hg_road')depart(s);
 return true;}
function advance(s){const waiting=PH.advanceGate(s,D.actions,availability);if(waiting)throw Error(waiting);if(s.pending)throw Error('请先结束当前活动。');if(s.mode!=='home')throw Error('请先完成本期行程。');const old=s.month,remaining=s.energy;s.mood=clampMood(s.mood+(remaining>=6?6:remaining>=3?3:remaining>0?1:0));if(s.phase===4){s.summary={month:old,entries:s.history.filter(h=>Math.floor(h.period/5)+1===old),remaining};if(s.month===36){s.mode='complete';s.energy=0;return s;}s.month++;s.phase=0;}else s.phase++;syncMode(s);return s;}
function completeStory(s,choice){if(s.mode!=='story'||s.pending)throw Error('当前不是送药行程。');if(!['协同行路','请陆衡指导'].includes(choice))throw Error('请选择行路方式。');s.facts.first_delivery={choice,month:s.month,method:choice==='协同行路'?(s.learned.footwork?'guided_footwork':'assisted_carry'):'asked_for_guidance',training:growth(s)};s.history.push({id:'story-delivery',name:'首次同行送药',period:period(s),cost:0,gain:0});s.phase++;syncMode(s);return s;}
function depart(s){if(s.mode!=='journey_ready'||s.pending)throw Error('当前不能出发。');s.mode='journey';s.energy=0;s.journey={month:s.month,returnMonth:s.month+1,returnRoute:s.route,visited:[],place:null,...(s.month===5&&s.facts['hg.pre.gate_handoff']?{kind:'hangao_gate'}:{})};return s;}
function visit(s,id){if(s.mode!=='journey'||!['gate','street','alley','ferry'].includes(id))throw Error('当前地点不可前往。');if(!s.journey.visited.includes(id))s.journey.visited.push(id);s.journey.place=id;s.screen='world';return s;}
function returnJourney(s){if(s.mode!=='journey')throw Error('当前没有历练。');s.facts['journey_'+s.month]={visited:[...s.journey.visited],returnRoute:s.journey.returnRoute};s.history.push({id:'journey-'+s.month,name:'整月历练',period:(s.month-1)*5,cost:0,gain:0});s.month++;s.phase=0;s.journey=null;syncMode(s);return s;}
function dueStory(s){if(!['home','story','journey_ready'].includes(s.mode)||s.pending||s.summary||!s.joined||!V.household)return null;return V.household.due(s,availability);}
function visitorNext(s){if(!s.pending?.visitor||s.pending.stage==='result')return null;return V.next(s.pending)?resolve(s,s.pending.visitor.selected):null;}
function visitorChoose(s,index){if(!s.pending?.visitor||s.pending.stage==='result')throw Error('当前没有可选择的来访剧情。');V.choose(s.pending,index);}
const API={moodState,MOOD_STATES,strollPool,strollPick,stroll,giftPreview,readLetter,relationship,actionCost,contactReason,hasActivityInPeriod,visitorNext,visitorChoose,dueStory,initial,restore,recover,validate,period,growth,syncNotices,reconcileWorld,join,giftRecipients,letterRecipients,availability,start,beginAnimation,finishAnimation,resolve,closeResult,advance,completeStory,depart,visit,returnJourney,syncMode};if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationCore=API;
})(typeof globalThis!=='undefined'?globalThis:this);
