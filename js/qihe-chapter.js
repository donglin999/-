'use strict';
// Free exploration; explicit story milestones → evacuation → cultivation.
(()=>{
 if(!isQiheEntry())return;
 ASSETS.push(window.BART?.wolf?.file||'b_wolf','b_bandit');
 // 2026-10-08 宋先生素材（art_sources/qh-song-disguise-20261008）：站姿四向、坐姿、对话立绘三态、后山道具、谢礼图标。
 CHARS.push('qh_song_story','qh_song_seated');ASSETS.push('s_qh_song_story','s_qh_song_seated','p_qh_song_story','p_qh_song_story_firm','p_qh_song_story_worry','r_qh_song_basket_v1','r_qh_song_bundle_v1');
 for(const k of ['qh_song_story','qh_song_seated']){ART.sheet[k]=[60,141];ART.frames[k]=4;ART.scale[k]=.868478}
 (ART.motionAnchor||={}).qh_song_seated={body:123,foot:135};   // 坐姿按站姿身高基准缩放，像素密度与站姿一致
 PORTS.push('qh_song_story');DIALOGUE_LEADS.add('qh_song_story');EXPR.qh_song_story=['firm','worry'];
 {const prev=OpeningCharacters.dialogueSprite;OpeningCharacters.dialogueSprite=function(who,text,sp){if(who!=='宋先生')return prev.call(this,who,text,sp);const mood=sp?.split(':')[1]||(/走不走|侧口|动手了没有|站在哪|谁先伸手/.test(text||'')?'firm':/疑你|他也来了|当然好|今晚……|没签……/.test(text||'')?'worry':'');return 'c_qh_song_story'+(mood?':'+mood:'')}}
 {const prevIco=mnIco,cells={qh_song_coat:0,qh_song_abacus:1};mnIco=function(k,sz=30){if(!(k in cells))return prevIco(k,sz);return`<span class="jm-blot jm-pxi" style="width:${sz}px;height:${sz}px;background-image:url(${assetImagePath('i_qh_song_gifts_v1')});background-size:200% 100%;background-position:${cells[k]*100}% 0%" aria-hidden="true"></span>`};window.mnIco=mnIco}
 const savePoint=()=>QihePrologue.checkpoint(),go=(...a)=>QiheExpansion.go(...a);
 const spriteOf=name=>name==='陈伯'&&['refuge','mountain','ended','cultivation'].includes(S.qiheChapter?.stage)?'c_qh_chen_rest_story':castSprites[name];
 const participants=rows=>{const names=[...new Set(rows.map(r=>r[0].split(' · ')[0]).filter(w=>w==='萧白'||castSprites[w]))];return names.length?[{who:S.name||'萧白',sp:'c_hero',slot:'left'},...names.filter(w=>w!=='萧白').map(w=>({who:w,sp:spriteOf(w)}))]:[]};
 const line=(w,t)=>DialogueStage.withCast({id:'qh-line',cast:participants([[w,t]])},()=>say(w,t));
 const ask=(w,t,opts)=>DialogueStage.withCast({id:'qh-choice',cast:participants([[w,t]])},()=>choose(w,t,opts));
 const castSprites={帮众:'c_qh_bandit',采办随从:'c_opening_procurement_aide',差役:'c_opening_bailiff',叶蘅:'c_ye',周砚:'c_opening_zhouyan',陆衡:'c_opening_luheng',周婶:'c_opening_aunt',陈伯:'c_opening_chen',药商:'c_opening_apothecary',管事:'c_opening_steward',护院:'c_opening_retainer',乌魁:'c_opening_wukui',采办使:'c_opening_procurement',店家:'c_qh_merchant',村口老人:'c_qh_oldman',宋先生:'c_qh_song_story',...QiheRepresentatives.sprites};
 function placeCast(names){const sc=cur,original=sc.npcs,cast=[...new Set(names.filter(n=>castSprites[n]))].slice(0,5),others=original.filter(n=>!n.sp),placed=[];
  // Temporary static blocking. At most five supporting figures plus the player.
  const offsets=[[-110,-25],[110,-30],[-190,70],[180,75],[0,-125],[-80,110],[90,120],[-210,-100],[210,-90]];
  for(const name of cast){const old=original.find(n=>n.name===name&&(!n.show||n.show()));let pos=old&&Math.hypot(old.x*TS-player.x,old.y*TS-player.y)<250?[old.x*TS,old.y*TS]:null;
   if(!pos)for(const[dx,dy]of offsets){const a=[player.x+dx,player.y+dy];if(standOk(...a)&&placed.every(n=>Math.hypot(n.x*TS-a[0],n.y*TS-a[1])>55)){pos=a;break}}
   if(pos)placed.push({id:'staged-'+name,name,sp:name==='宋先生'&&old?old.sp:spriteOf(name),x:pos[0]/TS,y:pos[1]/TS,dir:pos[0]<player.x?'r':'l',fixed:true,idle:false,cast:true,act:async()=>{}});   // cast：剧情临时站位，引擎按 OCCLUSION.actors.cast 处理被挡半透明（js/scene.js）
  }
  sc.npcs=[...others,...placed];sc._npcs=npcsOf(sc);return()=>{sc.npcs=original;sc._npcs=npcsOf(sc)}}
 async function sayAll(rows){const restore=placeCast(rows.map(r=>r[0].split(' · ')[0]));
  try{await DialogueStage.withCast({id:'qh-scene',cast:participants(rows)},async()=>{for(const[w,t,sp]of rows)await say(w,t,sp)})}finally{restore()}
 }
 // 2026-10-19 风起主线批次：本文件的剧情台词已迁入 ink（story/01-开始/风起-*.ink，声明见 story/_共用/externals-风起主线.ink）。
 // 这里只留流程（事件顺序、存档、战斗、奖励）和游戏函数；台词、顺序、条件以剧本为准，不要在 JS 里再写台词。
 // 台词按段攒起来交给 sayAll（站位规则不变）；遇到选项、动作（fq_*）或剧本结束时先演完；插画里的台词交给 QiheFireCinematic.play。
 // 返回剧本里 fq_answer() 交回的值（选项结果，不写存档）。
 const moodCache={};
 function moodsOf(knot){if(moodCache[knot])return moodCache[knot];const m={},src=JSON.stringify(window.STORY_DATA?.[knot]||{});for(const x of src.matchAll(/"\^id:([^" ]+) ?","\/#","#","\^mood:([^" ]+)/g))m[x[1]]=x[2];return moodCache[knot]=m}
 const spriteWithMood=(who,mood)=>mood&&castSprites[who]?castSprites[who]+':'+mood:undefined;
 async function play(knot,externals={},vars={}){
  let buf=[],cgShot=null,cgRows=[],answer=null,promptId=null;const prevChoose=window.choose,moods=moodsOf(knot),declared=JSON.stringify(window.STORY_DATA?.[knot]||{});
  vars=Object.fromEntries(Object.entries(vars).filter(([k])=>declared.includes('"VAR=":"'+k+'"')));   // 只传本剧本文件声明过的参数
  const flush=async()=>{if(!buf.length)return;const rows=buf;buf=[];await sayAll(rows)};
  const base={fq_beat:()=>{},
   fq_go_area:(key,anchor)=>go(key,anchor||'entry'),
   fq_go_local:(place,anchor)=>anchor?QihePrologue.goLocal(place,anchor):QihePrologue.goLocal(place),
   fq_cg_begin:shot=>{cgShot=shot;cgRows=[]},
   fq_cg_end:async()=>{const shot=cgShot,rows=cgRows;cgShot=null;cgRows=[];await QiheFireCinematic.play(shot,rows)},
   checkpoint:()=>savePoint()};
  const ext={fq_answer:v=>{answer=v},mark:id=>{promptId=id}};
  for(const[k,fn]of Object.entries({...base,...externals}))ext[k]=async(...a)=>{await flush();return fn(...a)};
  window.choose=async function(w,t,opts,sp){await flush();const mood=moods[promptId];promptId=null;return DialogueStage.withCast({id:'qh-choice',cast:participants([[w,t]])},()=>prevChoose.call(this,w,t,opts,sp||spriteWithMood(w,mood)))};
  try{
   await StoryRuntime.play(knot,{vars,externals:ext,line:(id,who,text,{mood}={})=>{(cgShot?cgRows:buf).push([who,text,spriteWithMood(who,mood)])}});
   await flush();return answer;
  }finally{window.choose=prevChoose}
 }
 const initial=()=>({version:2,storyRevision:2,stage:'opening',halfDay:0,choices:{},events:{},consent:{},questions:{...S?.prologue?.outsiders?.contacts?.questions},coreOwner:'叶蘅',coreIntact:true,chenCare:null,roadResult:null,granted:false});
 const state=()=>{const p=S.qiheChapter||(S.qiheChapter=initial());p.events||={};p.questions||={};p.choices||={};return p};let running=false;
 const representativeContext=(p=state())=>({p,sayAll,line,ask,evidence:evidenceBody,strangerGift:(...a)=>strangerGift(...a),ownsStrangerGifts:()=>['qh_song_coat','qh_song_abacus'].filter(owns).map(id=>ITEMS[id].name)});
 // 2026-10-19：主线开始前的村中交谈也走 guarded，这里只读 S.qiheChapter，不再用 state() 顺手建出主线状态（否则跟谁说句话主线就算“开始”了）。
 // 剧情出错不再静默无限重放（2026-10-16 审查 P0）：记录连续失败次数、写日志并提示玩家；进度停在出错前的断点。
 // 连续失败后是否允许跳过、跳过按什么结果继续，待用户确认，这里只提示不跳过。
 function storyFailed(e){const p=S.qiheChapter||{},key=p.pendingEvent||p.stage||'主线开始前',count=(p.storyError?.key===key?p.storyError.count:0)+1;p.storyError={key,count,message:String(e?.message||e),at:new Date().toISOString()};console.error('主线剧情出错：',key,'连续第'+count+'次',e);toast(`剧情续接出错（${key}，连续第 ${count} 次）：${p.storyError.message}。进度停在出错前，可稍后重试；反复出现请反馈。`,6000)}
 async function guarded(fn){if(running)return;running=true;busy=true;keys={};player.path=null;const token=DialogueStage.begin({id:'qh-chapter',cast:[]});try{const result=await fn();const p=S.qiheChapter;if(p?.storyError&&p.storyError.key!==(p.pendingEvent||p.stage))delete p.storyError;return result}catch(e){storyFailed(e)}finally{DialogueStage.end(token);running=false;busy=false;dlgBusy=false;keys={};$('dlg').hidden=true;savePoint();QiheExpansion.refresh()}}
 SKILLS.qh_hulu_staff={name:'横杆护身',grade:'丙',kind:'棍',key:'str',req:{str:3},needWeapon:'棍',shape:'single',mp:3,pow:1.1,desc:'护路棍法第一式。单体棍击，弱点削盾1；至下次本人行动前减伤15%。BP只提高本次伤害。'};BSK.qh_hulu_staff={t:'棍'};FXDEF.qh_hulu_staff={tier:1,cls:'dmg',hit:'棍'};
 ITEMS.qh_practice_staff={name:'练习棍',q:0,weapon:{kind:'棍',atk:1},desc:'陆衡教学赠送的普通木棍。'};
 ITEMS.qh_staff_notes={name:'护路棍法笔记',key:1,desc:'萧白亲记，丙级功法第一层，陆衡指正。'};
 function grantLesson(){const p=state();if(p.granted)return false;S.skills||={};S.skills.qh_hulu_staff=Math.max(1,S.skills.qh_hulu_staff||0);S.bag||={};S.bag.qh_practice_staff=(S.bag.qh_practice_staff||0)+1;S.bag.qh_staff_notes=(S.bag.qh_staff_notes||0)+1;if(!S.weapon){S.weapon='qh_practice_staff';S.bag.qh_practice_staff--;}p.granted=true;p.skillSource='陆衡·栖河西田埂';savePoint();return true}
 const STARTER_STOCK=['club','cloth','needles','charm','knife','mianjia'];
 function equipmentWrite(change){const before=JSON.parse(JSON.stringify(S));try{change();if(S.qiheRoster)S.qiheRoster.revision=(S.qiheRoster.revision||0)+1;persistState(S);return {ok:true}}catch(e){S=before;return {ok:false,reason:'保存失败，未改变装备或铜钱：'+e.message}}}
 function grantStarterEquipment(){const p=state();if(p.stage!=='days')return [];const rows=[['arrival','cloth',true],['transport','club',!!p.choices?.transport],['clinic','needles',!!p.choices?.clinic]].filter(([key,,eligible])=>eligible&&!p.equipmentRewards?.[key]);if(!rows.length)return [];const gained=[];const result=equipmentWrite(()=>{p.equipmentRewards||={};S.bag||={};for(const[key,id]of rows){const owned=(S.bag[id]||0)>0||S.weapon===id||S.armor===id||S.acc===id||Object.values(S.mates||{}).some(m=>Object.values(m.equip||{}).includes(id));if(!owned){S.bag[id]=(S.bag[id]||0)+1;gained.push(id)}p.equipmentRewards[key]={item:id,status:owned?'already-owned':'granted'};}});if(!result.ok){toast(result.reason,2200);return []}return gained}
 function purchaseEquipment(id){if(state().stage!=='days'||!STARTER_STOCK.includes(id))return {ok:false,reason:'当前无法购买此装备'};const price=ITEMS[id]?.price;if(!Number.isFinite(price)||price<=0)return {ok:false,reason:'价格暂不可用'};if((S.silver||0)<price)return {ok:false,reason:'铜钱不足，需要 '+price+' 文'};return equipmentWrite(()=>{S.silver-=price;S.bag||={};S.bag[id]=(S.bag[id]||0)+1})}
 async function equipmentShop(){const rows=STARTER_STOCK.map(id=>`${ITEMS[id].name} · ${ITEMS[id].price} 文`);const n=await ask('店家',`都是行路能用的普通家当。你身上有 ${S.silver||0} 文；看清兵器和根基要求，再决定。`,[...rows,'先不买']);const id=STARTER_STOCK[n];if(!id)return;const it=ITEMS[id];if(await ask('店家',`${it.name}：${it.desc}\n花 ${it.price} 文买一件？`,['买一件','再看看'])!==0)return;const result=purchaseEquipment(id);await line('店家',result.ok?'收好了。买来先放包裹，合不合身、使不使得动，还要你自己挑。':result.reason);if(result.ok)await line('获得',`${it.name} ×1 · 花费 ${it.price} 文。江湖→装备，双击穿戴。`)}
 const learned=()=>!!S.skills?.qh_hulu_staff;
 // 2026-10-21 用户评审：删去“整理旧屋”“村口问讯”（选项不影响任何事，内容与收药箱、徐令仪上门重复），剧本归档在 luotuozhuan/_attic/2026-10-21-opening-trim/。
 // 2026-10-21 用户：“任务也是有时限的，不然就永远挂在那里了”。第四项是时限：halfDay 小于它才能做（../xiaojianghu/docs/design/opening-state.md 2a 节）。
 const activities=[['clinic','药棚帮忙','central',4],['transport','修车认路','west',4],['practice','学习丙级《护路棍法》','west',4],['market','集市帮忙','south',5]];
 const DEADLINE_LABELS={2:'第一天傍晚前',4:'第二天傍晚前',5:'第三天收拾药箱前'};
 const activityOpen=id=>{const p=S?.qiheChapter,a=activities.find(x=>x[0]===id);return !!p&&p.stage==='days'&&!!a&&(p.halfDay||0)<a[3]};
 const activityDeadline=id=>DEADLINE_LABELS[activities.find(x=>x[0]===id)?.[3]]||'';
 // 2026-10-08 乔装账房「宋先生」（../xiaojianghu/docs/design/opening-pei-disguise.md）。三场后山对话不推进 halfDay。
 // 2026-10-21 用户改定：整条线是可选剧情、可以拒绝；不挡主线、不补播。后两段只以“答应过”为门槛，不以前一段为前置。
 const STRANGER=[['c1-00b',0],['c1-s1',2],['c1-s2',4]];
 const strangerAccepted=(p=S?.qiheChapter)=>['accepted','asked_first'].includes(p?.records?.stranger_deal);
 const records=()=>state().records||(state().records={});
 function strangerPending(){const p=S?.qiheChapter;if(!p||p.stage!=='days')return null;const e=p.events||{};const row=STRANGER.find(([id,h])=>p.halfDay===h&&!e[id]&&(id==='c1-00b'||strangerAccepted(p)));return row?row[0]:null}
 function strangerVisible(){const p=S?.qiheChapter;if(!p||p.stage!=='days'||p.halfDay>=5)return false;const e=p.events||{};if(e['c1-s2'])return false;return p.halfDay===0||strangerAccepted(p)}
 // 周砚第二、三日改在西田埂，避免与宋先生同场。
 function zhouAtWest(){const p=S?.qiheChapter;return !!p&&p.stage==='days'&&[2,4].includes(p.halfDay)}
 // 宋先生的谢礼（opening-pei-disguise.md「奖励」节）：每份只发一次，记 records.stranger_gifts；介绍只写可见外观。
 ITEMS.qh_song_coat={name:'青绫行衣',desc:'护具。青色细绫面、絮了里子的行路长衣，跑账人常穿，厚实挡风。衣襟内有一段细密的回纹缝记。',armor:12,fx:{mhp:20},price:120,q:2};
 ITEMS.qh_song_abacus={name:'乌木算珠',desc:'佩饰。一串磨得油亮的乌木算珠，正中一颗青玉珠。',acc:1,fx:{wil:1,wis:1,mmp:15},price:90,q:2};
 const owns=id=>(S.bag?.[id]||0)>0||[S.weapon,S.armor,S.acc].includes(id)||Object.values(S.mates||{}).some(m=>Object.values(m.equip||{}).includes(id));
 async function strangerGift(key,exp,items={}){const r=records(),gifts=r.stranger_gifts||(r.stranger_gifts={});if(gifts[key])return [];
  S.bag||={};for(const[id,n]of Object.entries(items))S.bag[id]=(S.bag[id]||0)+n;
  S.exp=(S.exp||0)+exp;const lvl=settleCharacterLevels(S);
  gifts[key]={exp,items:{...items},levels:lvl};savePoint();
  const got=Object.entries(items).map(([id,n])=>ITEMS[id].name+' ×'+n);await line('获得',[...got,S.lv>=CHARACTER_LEVEL_CAP?'已满级':'修为 +'+exp].join(' · ')+(got.length?' · 江湖→装备／行囊查看':''));
  for(const l of lvl)await line('','境界突破 · 第 '+l+' 层 · 属性点 +3');return lvl}
 // 三段对话不推进 halfDay，不补播。谢礼：c1-00b 金疮药×2＋30；c1-s1 青绫行衣＋40（只说大概 30）；c1-s2 乌木算珠＋50。
 const SONG_KNOTS={'c1-00b':'fq_song_basket','c1-s1':'fq_song_report','c1-s2':'fq_song_departure'};
 const SONG_GIFTS={'c1-00b':[30,{pill:2}],'c1-s1':[null,{qh_song_coat:1}],'c1-s2':[50,{qh_song_abacus:1}]};
 function songGift(key){const[exp,items]=SONG_GIFTS[key];return strangerGift(key,exp??(records().stranger_report==='partial'?30:40),items)}
 async function strangerScene(id){const p=state();
  await play(SONG_KNOTS[id],{fq_song_gift:songGift});
  p.events[id]=true;savePoint();QiheExpansion.refresh();
 }
 async function strangerTalk(){const pending=strangerPending();if(pending)return strangerScene(pending);if(!strangerVisible())return;
  return play('fq_song_idle',{},{first_day:state().halfDay===0,declined:records().stranger_deal==='declined'});}
 async function packingBody(){await QihePrologue.goLocal('ye_house');await play('fq_packing')}
 async function backhillRope(){await play('fq_rope',{},{told:!!state().records?.told_about_stranger})}
 async function beginBody(){const p=state();if(p.stage!=='opening')return resumeBody();
  await play('fq_morning',{
   fq_days_begin:()=>{p.stage='days'},
   fq_starter_gear:async()=>{const starter=grantStarterEquipment();if(starter.length)await line('获得',starter.map(id=>ITEMS[id].name+' ×1').join('、')+' · 江湖→装备，双击穿戴。');S.party||=[];if(!S.party.includes('ye')&&S.party.length<3)S.party.push('ye');if(S.qiheRoster&&!S.qiheRoster.members.includes('ye'))S.qiheRoster.members.push('ye');savePoint()}});
  await line('','可以在村里自由走动、帮忙和问话。主线的下一步写在左上角行程里；想学武，去西田埂找陆衡。')}
 async function begin(){return guarded(beginBody)}
 async function activity(id){return guarded(()=>activityBody(id))}
 const ACTIVITY_KNOTS={practice:'fq_act_practice',transport:'fq_act_transport',clinic:'fq_act_clinic',market:'fq_act_market'};
 async function lessonBattle(){while(await storyBattle('lesson')!=='win'){if(await play('fq_lesson_retry')==='stop')break}}
 async function activityBody(id){const p=state();if(p.stage!=='days')return play('fq_act_busy');if(p.choices[id])return play('fq_act_done');const a=activities.find(x=>x[0]===id);if(!a)return;if(!activityOpen(id))return play('fq_act_late');
  if(await ask('行程',a[1]+'。'+(id==='practice'?'陆衡会传授第一层，赠送练习棍与本人笔记。':''),['现在开始','再想想'])!==0)return;
  await play(ACTIVITY_KNOTS[id],{fq_lesson_battle:lessonBattle,fq_grant_lesson:()=>{grantLesson()}});
  if(id==='practice')await line('','已学：丙级《护路棍法》第一层 · 横杆护身。守路战及后续招式培养可使用。');
  const rewards=grantStarterEquipment();if(rewards.includes('club')){await play('fq_gift_club');await line('获得','枣木短棍 ×1 · 可替换练习棍，仍可施展横杆护身。')}if(rewards.includes('needles')){await play('fq_gift_needles');await line('获得','铜针囊 ×1 · 装备页切换人物，再双击穿戴。')}savePoint();await line('行程','这件事办完了。');
 }
 // ── 主线任务推进（2026-10-17 试玩反馈：剧情不能靠主角睡觉推进）。
 // 2026-10-21 用户：不再先找人、选【主线】再确认。走进当前主线的地点（scene）就弹“进入下一时段”，选“再等等”后本时段不再自动弹；
 // 找对应的人说话，她先说一句（剧本 fq_main_<to>，不带选项）再弹确认。确认框不列没做完的事，只有离村那步提醒回不了村。
 const MAIN_STEPS=[
  {to:2,npc:'ye',who:'叶蘅',title:'去药棚见来客',where:'村中药棚（周婶那里）',scene:'prologue_clinic_interior'},
  {to:4,npc:'ye',who:'叶蘅',title:'陪叶蘅去东埠送药',where:'东埠装卸路',scene:'qh_east'},
  {to:5,npc:'ye',who:'叶蘅',title:'回叶家收拾药箱',where:'村西北 · 叶家',scene:'prologue_ye_house'},
  {to:6,npc:'luheng',who:'陆衡',title:'傍晚随药车离村',where:'西田埂',scene:'qh_west'}];
 function mainStep(p=S?.qiheChapter){if(p?.stage!=='days')return null;
  return MAIN_STEPS.find(m=>m.to>(p.halfDay||0))||null}
 async function mainOffer(m){const p=state();
  if(await ask('主线','进入下一时段：'+m.title+'。'+(m.to===6?'离村后就不能再回村里了。':''),['开始','再等等'])!==0){p.mainDismissed=p.halfDay;savePoint();return false}
  delete p.mainDismissed;p.halfDay=m.to;savePoint();await advanceEvents();return true}
 // 走进主线地点：剧情演出途中换场（running）不弹；本时段选过“再等等”也不再自动弹。
 async function arrive(id){const p=S?.qiheChapter;if(running||!p||p.stage!=='days'||p.mainDismissed===p.halfDay)return;const m=mainStep(p);if(m?.scene!==id)return;return guarded(()=>mainOffer(m))}
 for(const id of new Set(MAIN_STEPS.map(m=>m.scene))){const sc=SC[id];if(!sc)continue;const old=sc.enter;sc.enter=async(...a)=>{if(old)await old(...a);await arrive(id)}}
 async function rest(){return guarded(async()=>{const p=state();if(p.pendingEvent)return resumeBody();if(p.stage==='mountain')return mountainEnd();if(p.stage==='ended')return cultivationBegin();if(p.stage==='cultivation')return QiheCultivationBridge.enter();if(p.stage==='days'){const m=mainStep(p);if(m){await play('fq_rest_hint',{},{title:m.title,where:m.where,who:m.who});window.QiheNavigation?.trackNpc?.(m.npc)}return}return resumeBody()})}
 async function event(id,fn){if(state().events[id])return;state().pendingEvent=id;savePoint();await fn();state().events[id]=true;delete state().pendingEvent;savePoint()}
 async function advanceEvents(){const p=state();if(p.halfDay>=2)await event('xu-meeting',async()=>{await QihePrologue.goLocal('village','clinic');await QiheRepresentatives.pressure(representativeContext());p.events.steward=true;});
  if(p.halfDay>=4)await event('three-meeting',async()=>{await go('east','loading');await QiheRepresentatives.medicine(representativeContext());S.prologue.wolf_cause_testimony_heard=true;S.prologue.wolf_testimony_source='陆衡转述北坡车夫见闻';p.events.medicine=true;});
  if(p.halfDay>=5)await event('packing',async()=>{await QihePrologue.goLocal('ye_house');await packingBody()});
  if(p.halfDay>=6){p.stage='fire';savePoint();return fireBody()}await line('行程','可以继续在村里走动。主线的下一步写在左上角行程里。')
 }
 async function fireBody(){const p=state();await go('east','loading');await event('fire-start',async()=>{
  // A completed clash has its own checkpoint. Old saves with an already visible fire
  // do not rewind to a duel in a burning courtyard.
  if(!p.fireLit&&!p.clashVersion){
   await sayAll(QiheRepresentatives.rows.fireDemand);await sayAll(QiheRepresentatives.rows.fireCollision);
   await play('fq_fire_before',{},{told_departure:!!p.records?.stranger_told_departure});
   await QiheFactionClash.play();p.clashVersion=QiheClashData.runtimeCheckpoint||1;savePoint();
  }
  if(!p.fireLit){await play('fq_fire_ignition');p.fireLit=true;QiheExpansion.syncFire();savePoint()}
  await QiheRepresentatives.rescueOrders(representativeContext());
 });
  if(!p.rescue){await play('fq_rescue_choice');savePoint()}
  await event('rescue',async()=>{await play('fq_rescue');p.chenCare=p.rescue==='chen'?'擦伤已照护':'腿伤待照护';p.supplies=(p.choices.transport==='cart'?2:0)+(p.rescue==='cart'?2:0)+(p.choices.market==='help'?1:0)});
  await event('fire-evacuation-cg',()=>play('fq_evacuation'));p.stage='escape';savePoint();return escapeBody();
 }
 async function escapeBody(){const p=state();await go('west','guard');await event('road-intro',()=>play('fq_road_intro',{},{clash:!!p.clashVersion,learned:learned()}));
  while(p.roadResult!=='win'){const result=await storyBattle('road');if(result==='win'){p.roadResult='win';savePoint();break}if(await play('fq_road_retry')==='stop')return}
  p.stage='refuge';savePoint();await go('refuge');await event('arrival',()=>play('fq_refuge_arrival'))
 }
 async function evidenceBody(){const p=state();if(p.events['evidence-v2'])return;
  if(p.stage!=='refuge')return play('fq_evidence_wait');
  await event('evidence-v2',async()=>{await go('refuge','zhouyan');await QiheRepresentatives.evidence(representativeContext());});p.storyRevision=2;savePoint();
 }
 async function evidence(){return guarded(async()=>{const p=state();if(p.stage==='refuge'&&!p.events['evidence-v2'])return evidenceBody();
  await line('栖河对证记录','三张附页：都引第十七号单，都约第三夜戌时、装卸侧口。一张写交谱，一张写还匣，一张写交样。');await line('栖河对证记录','陈伯的底单：旧药罐六只，别无他物。');await line('栖河对证记录',p.records?.told_about_stranger?'萧白说出了后山的宋姓账房，沈雁回要去找他问。是谁拼的消息，还不知道。':'是谁拼的消息，还不知道。');p.evidenceReviewed=true;savePoint();});}
 async function routes(){return guarded(routesBody)}
 async function routesBody(){const p=state();if(!['refuge','mountain'].includes(p.stage))return;if(p.stage==='refuge')await evidenceBody();
  if(await play('fq_routes')!=='go')return;
  p.consent={xiao:true,ye:true};p.route='mountain';savePoint();await event('farewell-v2',()=>play('fq_farewell'));p.stage='mountain';savePoint();await mountainEnd()
 }
 // 2026-10-07 归云谷地图弃用（docs/design/qihe-map/expansion/training.md）：章末不切地图，以归云谷庭院为背景演出，随后自动拜师进入培养。
 // 2026-10-23 整改第 15 项：庭院背景只当场景卡（qh-backdrop），不当 CG，立绘照常显示；原先借用 qh-cinematic 把周砚等人的立绘都藏掉了。
 async function courtyard(fn){const dlg=$('dlg'),old=dlg.style.zIndex,wasBackdrop=document.body.classList.contains('qh-backdrop');let el;try{const im=new Image();im.src='assets/production/cultivation/bg_mountain_spring_v1.png';try{await im.decode()}catch(e){}el=document.createElement('section');el.className='qh-fire-cg';el.dataset.shot='guiyun-courtyard';el.setAttribute('role','img');el.setAttribute('aria-label','归云谷庭院');im.alt='';el.appendChild(im);$('game').appendChild(el);document.body.classList.add('qh-backdrop');dlg.style.zIndex='65';keys={};player.path=null;return await fn()}finally{el?.remove();dlg.style.zIndex=old;if(!wasBackdrop)document.body.classList.remove('qh-backdrop')}}
 async function mountainEnd(){const p=state();if(p.stage==='mountain'){if(strangerAccepted(p))await event('backhill-rope',backhillRope);await courtyard(async()=>{await event('settle',()=>play('fq_settle'));await event('meal',()=>play('fq_meal',{},{learned:learned()}));p.stage='ended';p.chapter2Ready=true;savePoint();await line('','江湖经历记下一笔：山居安身。进度已保存。')})}return cultivationBegin()}
 async function storyBattle(kind){const snapshot=JSON.parse(JSON.stringify(S)),previousMode=mode;let result='fail';try{
  await QiheChapterBattleArt.preload(kind);
  const lesson=PrologueStoryBattle.makeLesson();lesson.guidance=false;
  const baseAllies=lesson.allies;lesson.allies=()=>{const a=baseAllies(),h=a[0];h.art='hero_village';h.por='opening_hero_village';h.hp=h.mhp;h.mp=h.mmp;h.skills=learned()||kind==='lesson'?['qh_hulu_staff']:[];h.skLv={qh_hulu_staff:S.skills?.qh_hulu_staff||1};h.atkName=kind==='lesson'?'练习棍':'木棍';if(kind==='lesson')return[h];const lu=statUnit({name:'陆衡',lv:2,st:{str:5,con:6,agi:4,wil:5,wis:4}},'ally');Object.assign(lu,{art:'qh_luheng_v1',por:'opening_luheng',hp:lu.mhp,mp:lu.mmp,skills:['qh_hulu_staff'],skLv:{qh_hulu_staff:1},atkType:'棍',atkName:'护路棍',dodge:0,crit:0,block:0});return[h,lu]};
  const menu=lesson.onMenu;lesson.onMenu=(u,title,rows,selected)=>{menu(u,title,rows,selected);if(lesson.guide)lesson.guide.hidden=true};lesson.mount=()=>{};lesson.show=step=>{lesson.uiStep=step};lesson.onTarget=()=>{};
  const enemy=kind==='lesson'?{name:'陆衡 · 收力对练',sp:'c_qh_luheng_v1',lv:1,st:{str:3,con:3,agi:2,wil:2,wis:2},skills:{staff:1},hpMul:.45,atkMul:.22,shield:2,weak:['棍'],h:170}:{name:'拦路帮众',sp:'c_qh_raider_front_v1',lv:1,st:{str:4,con:4,agi:3,wil:2,wis:2},skills:{blade:1},hpMul:.7,atkMul:.5,shield:2,weak:['棍','暗器'],h:150};
  result=await battle({storyLesson:lesson,allowAuto:kind==='road',solo:true,noLose:true,noFlee:true,bg:QiheChapterBattleArt.backgrounds[kind],foes:kind==='lesson'?[enemy]:[enemy,{...enemy,sp:'c_qh_raider_rear_v1',name:'拦路帮众·后侧'}]});return result;
 }finally{PrologueStoryBattle.restore(S,snapshot);mode=previousMode;keys={};try{hud()}finally{PrologueStoryBattle.restore(S,snapshot);save()}}}
 async function interact(id){if(window.QiheOutsiders?.handles(id)&&QiheOutsiders.available())return QiheOutsiders.talk(id);return guarded(async()=>{const p=S.qiheChapter;
  if(id==='bandit')return play('fq_bandit',{},{late:p?.halfDay>=4});
  if(id==='aide')return play('fq_aide');
  if(QiheRepresentatives.names[id]&&QiheOutsiders.available())return QiheRepresentatives.interact(id,representativeContext(p||QiheOutsiders.contactState()));
  if(!p){await play(id==='luheng'?'fq_late_lu':'fq_late_merchant');return}
  if(p.stage==='opening')return beginBody();if(['fire','escape'].includes(p.stage))return resumeBody();
  if(['ended','cultivation'].includes(p.stage)&&['zhouyan','cultivate','meal'].includes(id))return p.stage==='ended'?cultivationBegin():QiheCultivationBridge.enter();
  if(p.stage==='mountain'&&id==='meal')return mountainEnd();
  if(QiheRepresentatives.names[id])return QiheRepresentatives.interact(id,representativeContext());
  if(id==='stranger'||id==='stranger-basket')return strangerTalk();
  if(p.stage==='refuge'){if(id==='evidence'){if(!p.events['evidence-v2'])return evidenceBody();return line('对证记录','原底单只有六只旧药罐。三张附页引同一张单子，约同一个时辰、同一个口子；写附页的人，'+(p.records?.told_about_stranger?'沈雁回要去后山找那位宋姓账房问。':'还没查出来。'));}if(id==='zhouyan')return routesBody();if(id==='ye')return play('fq_refuge_ye',{},{chen_ok:p.chenCare==='擦伤已照护',evidence_done:!!p.events['evidence-v2']});
   return play(({aunt:'fq_refuge_aunt',chen:'fq_refuge_chen',luheng:'fq_refuge_luheng'})[id]||'fq_refuge_other')}
  if(p.stage==='days'){
   const m=mainStep(p);
   if(m&&m.npc===id){await play('fq_main_'+m.to);if(await mainOffer(m))return;const rel=id==='ye'?'clinic':'practice';if(activityOpen(rel)&&!p.choices[rel])return activityBody(rel);return}
   const activityMap={luheng:'practice',lesson:'practice',cart:'transport',apothecary:'market'};if(activityMap[id])return activityBody(activityMap[id]);
   if(id==='innkeeper'){const n=await play('fq_inn');return n==='shop'?equipmentShop():n==='help'?activityBody('market'):undefined;}if(id==='zhouyan')return play('fq_zhou_idle',{},{shen_open:p.halfDay>=2,met_zhou:!!p.events['xu-meeting']});if(id==='ye')return activityBody('clinic');
   return play(id==='wukui'?'fq_wukui':id==='steward'?'fq_steward':'fq_procurement')}
  if(id==='ye')return play('fq_ye_settled');
  return play('fq_tonight')})}
 // Chapter handoff adopts the reviewed cultivation UI snapshot.
 async function cultivationBegin(){const p=state();if(p.stage==='cultivation')return QiheCultivationBridge.enter();await courtyard(()=>event('apprenticeship',()=>sayAll(window.CultivationDialogue.apprenticeship)));p.stage='cultivation';S.chapter=Math.max(2,S.chapter||1);S.sect='guiyun';savePoint();QiheCultivationBridge.enter()}
 CultivationData.progressNames.qh_staff='护路棍法熟练';CultivationData.actions.push({id:'QH01',category:'skill',name:'护路棍法 · 已学招式练习',teacher:'本人笔记',place:'院内',task:'照着陆衡指正的笔记练起手、回收与护身。',requires:['qh_hulu_staff','joined'],gain:'qh_staff',amount:8,feedback:'按陆衡教的次序练过起手与收势。招式熟练增加，尚未自动升层。'});
 function applyCultivationReward(){const pending=S.qiheCultivation?.pending;if(!pending||pending.stage!=='result'||pending.martialApplied)return;if(pending.action==='QH01'&&learned()){mnEnsure();mnProfGain('hero','qh_hulu_staff',pending.result.gain||0)}pending.martialApplied=true}
 async function resumeBody(){const p=state();if(p.stage==='opening')return beginBody();if(p.stage==='days'){grantStarterEquipment();return advanceEvents();}if(p.stage==='fire')return fireBody();if(p.stage==='escape')return escapeBody();if(p.stage==='refuge'){await go('refuge');await evidenceBody();return routesBody()}if(p.stage==='mountain')return mountainEnd();if(p.stage==='ended')return cultivationBegin();if(p.stage==='cultivation')return QiheCultivationBridge.enter();
  // 无法识别的阶段：回到合法阶段再续接，不让断点停在死路上。
  const back=p.halfDay>0||Object.keys(p.events||{}).length?'days':'opening';console.error('未知的主线阶段：',p.stage,'→',back);toast(`主线进度阶段「${p.stage}」无法识别，已回到${back==='days'?'自由探索':'开场'}。`,4000);p.stage=back;savePoint();return resumeBody()}
 function restoreScene(){QiheExpansion.syncFire();if(!S.qiheChapter)return;state();const gained=grantStarterEquipment();if(gained.length)toast('补领初始装备：'+gained.map(id=>ITEMS[id].name).join('、')+' · 装备页双击穿戴',3600);cur.dark=null;if(['fire','escape'].includes(state().stage))toast('行程中可继续撤离片段。',2400);if(!standOk(player.x,player.y)){const p=cur.start;player.x=p[0]*TS;player.y=p[1]*TS;snapCam()}if(['mountain','ended'].includes(state().stage))setTimeout(()=>QiheChapter.resume(),400)}
 async function menu(){if(!busy&&!dlgBusy&&$('panel').hidden)QiheJianghuUI.open('quest')}
 const oldJournal=QihePrologue.journal;QihePrologue.journal=async()=>{if(!S.qiheChapter&&!window.QiheOutsiders?.available())return oldJournal();if(busy||dlgBusy||!$('panel').hidden)return;await menu()};
 const prevQuest=questLine;questLine=function(){const p=S?.qiheChapter;if(!p)return prevQuest();const m=mainStep(p);return p.stage==='days'?(m?'主线 · '+m.title+' · '+m.where+'找'+m.who:'自由探索 · J 查看任务'):p.stage==='refuge'?(p.events?.['evidence-v2']?'对证已记 · 与周砚商量去处':'安置伤者后 · 核对三份来件'):p.stage==='ended'?'J 继续上山':p.stage==='cultivation'?'自由练习与交谈':'J 继续当前剧情'};window.questLine=questLine;
 window.QiheChapter={mainStep,MAIN_STEPS,grantStarterEquipment,purchaseEquipment,starterStock:STARTER_STOCK.slice(),activities,initial,state,applyCultivationReward,begin,rest,activity,interact,routes,evidence,menu,grantLesson,learned,storyBattle,restoreScene,strangerPending,strangerVisible,strangerAccepted,activityOpen,activityDeadline,zhouAtWest,resume:()=>guarded(resumeBody),get running(){return running}};
})();
