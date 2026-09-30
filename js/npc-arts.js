'use strict';
// 江湖手段：内容配置、资格、结果及成长。场景动作在 npc-gestures.js。
const NPC_ARTS={
  inquire:{name:'打探',verb:'听',desc:'问询并核实消息，记录人物见闻。',source:'包打听'},
  persuade:{name:'劝说',verb:'言',desc:'按明确理由交涉，取得一次帮助或改善关系。',source:'包打听'},
  steal:{name:'窃取',verb:'手',desc:'偷取可见持物；失手会惊动对方，需要道歉赔偿。',source:'行脚客许青的空囊练习'},
  inspect:{name:'辨识',verb:'察',desc:'观察衣着、器物和人物状态，记录可核对的细节。',source:'城南铁铺伙计'},
  spar:{name:'切磋',verb:'武',desc:'对方同意后单人过招，不致死、不发掉落。',source:'铁匠'}
};
const NPC_ART_LEVEL=['不会','入门','熟练','专精'];
const NPC_ART_XP=[0,0,6,18];
const NPCArts={
  pending:false,
  ensure(){S.npcArts=S.npcArts||{};S.npcArtLearning=S.npcArtLearning||{};S.npcArtPractice=S.npcArtPractice||{};
    S.npcArtProgress=S.npcArtProgress||{};S.npcArtRecords=S.npcArtRecords||{};S.npcArtNotes=S.npcArtNotes||{};S.npcArtRelations=S.npcArtRelations||{};return S.npcArts},
  level(id){this.ensure();return clamp(Math.floor(Number(S.npcArts[id])||0),0,3)},
  learn(id,n,spec){this.ensure();if(!NPC_ARTS[id]||this.level(id)||!spec?.teach?.includes(id))return false;
    S.npcArts[id]=1;S.npcArtProgress[id]=0;S.npcArtLearning[id]={teacher:n.name,location:S.scene};save();toast('生活技能 · '+NPC_ARTS[id].name+'入门');return true},
  key(n){return S.scene+':'+n.id},
  rec(n){this.ensure();return S.npcArtRecords[this.key(n)]||(S.npcArtRecords[this.key(n)]={done:{},taken:{},attempts:{},alert:0})},
  award(id,n,tag){if(!this.level(id))return false;const r=this.rec(n),k=id+':'+tag;if(r.done[k])return false;r.done[k]=1;
    S.npcArtProgress[id]=(S.npcArtProgress[id]||0)+1;return true},
  realCount(id){this.ensure();return Object.values(S.npcArtRecords).reduce((sum,r)=>sum+Object.keys(r.done||{}).filter(k=>k.startsWith(id+':')).length,0)},
  practiceState(id){this.ensure();return S.npcArtPractice[id]||(S.npcArtPractice[id]={counts:{},questions:{},credited:{}})},
  practiceCap(id){return this.level(id)===1?6:12},
  examWhy(id){const lv=this.level(id);if(!lv)return '先接受基础指导';if(lv>=3)return '已专精';
    const xp=S.npcArtProgress[id]||0,need=NPC_ART_XP[lv+1],real=this.realCount(id);
    return xp<need?'熟练度不足 '+xp+'/'+need:real<lv?'独立应用不足 '+real+'/'+lv:''},
  lesson(id,exam=false){const lv=this.level(id),ps=this.practiceState(id),bank=lv===1?NPC_ART_LESSONS[id]:exam?NPC_ART_ADVANCED[id]:NPC_ART_LESSONS[id].concat(NPC_ART_ADVANCED[id]);
    ps.credited=ps.credited||{};let index=((ps.questions[lv]||0)+(exam?3:0))%bank.length;
    if(!exam)for(let i=0;i<bank.length&&ps.credited[lv+':'+index];i++)index=(index+1)%bank.length;
    return{index,q:bank[index]}
  },
  async exercise(id,n,spec,exam=false){if(!spec.teach?.includes(id)||!this.level(id))return;
    const lv=this.level(id),ps=this.practiceState(id),count=ps.counts[lv]||0;
    if(lv>=3){toast('已专精，可继续在江湖应用');return}if(this.rec(n).alert){toast('先解除警觉再请教');return}
    if(exam&&this.examWhy(id)){toast(this.examWhy(id));return}if(!exam&&count>=this.practiceCap(id)){toast('本阶段指导练习已完成；请独立应用或接受考核');return}
    const {index,q}=this.lesson(id,exam);
    const selected=await choose(n.name,(exam?'晋级考核':'指导练习')+' · '+q[0],q[1].concat('暂不练习'),n.sp);
    if(selected<0||selected>=q[1].length)return;
    ps.questions[lv]=(ps.questions[lv]||0)+1;
    await this.gesture(id,n);const correct=selected===q[2];await this.gesture(id,n,correct?'success':'fail');
    if(correct){if(exam){S.npcArts[id]=lv+1;toast(NPC_ARTS[id].name+' · '+NPC_ART_LEVEL[lv+1])}
      else{ps.credited[lv+':'+index]=1;ps.counts[lv]=count+1;S.npcArtProgress[id]=(S.npcArtProgress[id]||0)+1}}
    save();await say(n.name,(correct?(exam?'考核通过，进入下一阶段。':'这一回练习有效，熟练度 +1。'):'这回没有练对，不增加熟练度。')+q[3],n.sp)
  },
  note(n,id,text){S.npcArtNotes[this.key(n)+':'+id]={npc:n.name,art:id,text};this.award(id,n,'note')},
  relation(n,delta){const k=this.key(n);S.npcArtRelations[k]=clamp((S.npcArtRelations[k]||0)+delta,-5,5)},
  spec(n){if(!n?.id||!n.sp||n.show&&!n.show())return null;
    const key=S.scene+':'+n.id;
    const configs={
      'street:gossip':{inquire:'包打听收消息也看证据。传闻不能代替物证，要分别核实。',inspect:'他的消息纸按渡口、市集分叠；听来的事和亲眼所见分开放。',persuade:{reason:'先说明救人来意，请他把可公开的线索讲清。',text:'包打听答应帮你区分传闻与见闻；重要案情仍可通过原有对话核对。'},teach:['inquire','persuade']},
      'street:oldman':{inquire:'说书老伯善认人，也熟悉街市常客；请他讲清楚什么时候亲眼看到。',inspect:'老伯的醒木边缘磨圆，说明常年说书。判断证言应问他是否亲眼所见。',persuade:{reason:'尊重他的见闻，请他为自己亲眼所见的事情作证。',text:'老伯答应有需要时说明见闻；你仍需把证言与物证相互核对。'}},
      'street:lady':{inquire:'柳三娘经营茶棚，知道谁来歇脚；茶碗归谁、谁碰过，应分别问清。',inspect:'三娘围裙上有茶水印，手边常备擦碗布，摊位一直有人照看。',persuade:{reason:'保证不拿传闻冒充证据，请她帮忙保管物件。',text:'三娘愿意帮你看顾物件；案中的茶碗仍通过原有对话取得。'}},
      'street:smith':{inquire:'铁匠按兵器和护具用途配料，木剑适合练习，铁剑对臂力有要求。',inspect:'铁匠的护腕有磨损，夹钳与锤柄的握持处都很光滑。',persuade:{reason:'说明练武用途，请他给一次练习用短打的优惠。',offer:'cloth',price:16,text:'铁匠愿以十六两卖你一件练习用粗布短打。'},stock:[{item:'cloth',difficulty:2}],spar:{sp:'c_smith',lv:2,str:4,con:5,agi:3,wil:3,wis:3},teach:['spar']},
      'street:slice_herbalist':{inquire:'伙计只见过药包封绳，没见到送药的人，不能从封绳推定制药者。',inspect:'药包按用途分放，封口系绳完好；检查药包时不要擅自拆封或服药。',persuade:{reason:'说明外出救治需要，请他少收一次药钱。',offer:'pill',price:16,text:'伙计愿以十六两提供一瓶金创药。'},stock:[{item:'pill',difficulty:2}],teach:['inspect']},
      'gate:soldier':{inquire:'南门军士负责查验来路与兵器，合法入城仍须按关口规定办理。',inspect:'军士的兵器和腰牌齐整；这是履职人员，不适合拿偷取来路凭证当玩笑。',spar:{sp:'c_soldier',lv:2,str:4,con:4,agi:4,wil:3,wis:3},when:()=>!!S.flags.gate_ok},
      'temple_out:monk':{inquire:'老僧过招看的是根骨与收势，练习前先问清是否点到为止。',inspect:'老僧重心平稳，脚步很轻，试探时不宜一味猛攻。',spar:{sp:'c_monk',lv:3,str:3,con:6,agi:3,wil:5,wis:4},when:()=>!!S.flags.spar},
      'alley:beggar':{inquire:'吴长老讲究打稳根基，拳脚、棍势都要顾着收手和脚步。',inspect:'他衣衫旧，掌指却有练武留下的茧；衣着不能直接判断身手。',spar:{sp:'c_beggar',lv:3,str:5,con:5,agi:5,wil:3,wis:4}},
      'ferry:boatman':{inquire:'过渡前要看风、水流和船绳，消息来自哪个岸头也要核清。',inspect:'船夫的手茧集中在握篙处，缆绳湿痕可看出近期是否靠过岸。'},
      'crossing:boatman':{inquire:'江面上的见闻需要记清方向和时间，不能混淆两岸。',inspect:'船上空间窄，听船夫指挥更安全。'}
    };
    const spec=n.id==='arts_trainer'?{trainer:true,teach:['steal'],inquire:'许青走过不少地方，先看人、后问事，记消息时总要留来源。',inspect:'他把空练习囊与随身钱袋分挂两侧，示范只用空囊。',}:configs[key];
    return spec&&(!spec.when||spec.when())?spec:null;
  },
  chance(id,n,spec,item){const lv=this.level(id);const stat=id==='steal'?'agi':'wis';const st=S.st;
    return clamp(62+lv*8+((st[stat]||3)-3)*4+(S.npcArtRelations[this.key(n)]||0)*3-(item?.difficulty||1)*8,15,95)},
  why(id,n,spec){if(!this.level(id))return '尚未学会 · '+NPC_ARTS[id].source;
    const r=this.rec(n);if(r.alert&&id!=='inspect')return '对方已警觉 · 先道歉赔偿';
    if((id==='inquire'||id==='inspect')&&r.done[id+':note'])return '已记入见闻';
    if(id==='persuade'&&r.done['persuade:success'])return '本次帮助已取得';
    if(id==='steal'&&!spec.practice&&!(spec.stock||[]).some(i=>!r.taken[i.item]))return '没有可取的持物';
    if(id==='spar'&&S.hp<=1)return '气血过低 · 先恢复';return ''},
  ids(spec){return Object.keys(NPC_ARTS).filter(id=>id==='steal'?!!(spec.stock?.length||spec.practice):id==='spar'?!!spec.spar:!!spec[id])},
  async gesture(id,n,outcome){if(window.NPCGesture)await NPCGesture.play(id,n,outcome)},
  async perform(id,n,spec,item){if(this.pending)return;const why=this.why(id,n,spec);if(why){toast(why);return}
    this.pending=true;const state=S,scene=cur,fields=['hp','mp','silver','moral','bag','npcArts','npcArtProgress','npcArtRecords','npcArtNotes','npcArtRelations'],snapshot=JSON.parse(JSON.stringify(Object.fromEntries(fields.map(k=>[k,S[k]]))));try{await this.gesture(id,n);if(S!==state||cur!==scene)return;
      const r=this.rec(n);
      if(id==='inquire'||id==='inspect'){this.note(n,id,spec[id]);await this.gesture(id,n,'success');await say(n.name,spec[id],n.sp)}
      else if(id==='steal'){
        if(spec.practice){this.award(id,n,'practice');await this.gesture(id,n,'success');await say(n.name,'只取了练习空囊。我看清你的动作了，收手时记得不碰到旁人。',n.sp)}
        else{item=item||(spec.stock||[]).find(i=>!r.taken[i.item]);if(!item||r.taken[item.item])return;
          const p=this.chance(id,n,spec,item);r.attempts.steal=(r.attempts.steal||0)+1;
          if(Math.random()*100<p){r.taken[item.item]=1;S.bag[item.item]=(S.bag[item.item]||0)+1;this.award(id,n,'take:'+item.item);this.relation(n,-1);S.moral=(S.moral||0)-2;
            await this.gesture(id,n,'success');await say('',`取得 ${ITEMS[item.item].name}。未经允许取物，品德 −2。`)}
          else{r.alert=1;this.relation(n,-2);S.moral=(S.moral||0)-3;await this.gesture(id,n,'fail');await say(n.name,'手往哪儿伸？这回我看见了。先把这事说明白。',n.sp)}
        }
      }else if(id==='persuade'){
        const ps=spec.persuade;if(ps.offer&&S.silver<ps.price){toast('银两不足，需要 '+ps.price+' 两');return}
        if(Math.random()*100<this.chance(id,n,spec)){
          if(ps.offer){S.silver-=ps.price;S.bag[ps.offer]=(S.bag[ps.offer]||0)+1}
          this.relation(n,1);this.award(id,n,'success');await this.gesture(id,n,'success');await say(n.name,ps.text,n.sp)
        }else{this.relation(n,-1);r.alert=1;await this.gesture(id,n,'fail');await say(n.name,'这话我暂且不信。容我缓一缓，再说吧。',n.sp)}
      }else if(id==='spar'){
        const f=spec.spar,hp=S.hp,mp=S.mp;
        try{const result=await battle({solo:true,noLose:true,noFlee:true,spar:true,foes:[{name:n.name,sp:f.sp,lv:f.lv,st:{str:f.str,con:f.con,agi:f.agi,wil:f.wil,wis:f.wis},skills:{fist:1},exp:0,silver:0,drops:{},shield:2,weak:['拳','剑','刀'],hpMul:.38}]});
          if(result==='win')this.award(id,n,'win');await this.gesture(id,n,result==='win'?'success':'fail');await say(n.name,result==='win'?'收势不错。点到为止，练功还需扎实。':'到这里吧，先歇口气，把脚步练稳。',n.sp)
        }finally{S.hp=hp;S.mp=mp;hud()}
      }
      save();hud();
    }catch(e){if(S===state){Object.assign(S,snapshot);save();hud()}console.error('江湖手段中止：',e);toast('这次行动未完成，请重试');}
    finally{this.pending=false;if(window.NPCGesture)NPCGesture.clear()}
  },
  async menu(n,spec,original){let open=true;while(open&&mode==='scene'){
      const picked=await this.present(n,spec);if(!picked||picked.id==='leave')return;
      if(picked.id==='original'){await original.call(n,n);return}
      if(picked.id==='book'){await this.book();continue}
      if(picked.id==='teach'){const id=picked.art;
        await this.gesture(id,n);this.learn(id,n,spec);await say(n.name,id==='steal'?'先练空囊。我教你辨手法与收手，真取旁人物件会有代价。':'先记住起手与收势，遇人问清楚，做事留个回头的余地。',n.sp);continue}
      if(picked.id==='practice'||picked.id==='exam'){await this.exercise(picked.art,n,spec,picked.id==='exam');continue}
      if(picked.id==='repair'){
        const consent=await choose(n.name,'赔礼花费十两，解除警觉；已取持物和成果不会恢复。',['赔礼','取消'],n.sp);if(consent!==0)continue;if(S.silver<10){toast('赔偿需要十两，可先告辞或使用原有对话');continue}
        await this.gesture('persuade',n);S.silver-=10;this.rec(n).alert=0;this.relation(n,1);save();await say(n.name,'这回事就这样吧。以后先问清楚。',n.sp);continue}
      const id=picked.id;if(this.why(id,n,spec)){toast(this.why(id,n,spec));continue}
      if(id==='steal'&&!spec.practice){
        const stock=(spec.stock||[]).filter(i=>!this.rec(n).taken[i.item]);const c=await choose(n.name,'可取持物：选中后会再次说明风险。',[...stock.map(i=>`${ITEMS[i.item].name} · 成功率 ${this.chance(id,n,spec,i)}%`),'返回'],n.sp);if(c<0||c>=stock.length)continue;
        const item=stock[c],p=this.chance(id,n,spec,item);
        const confirm=await choose('萧白',`窃取 ${ITEMS[item.item].name}：成功率 ${p}%。成功品德 −2；失手品德 −3、对方警觉，需十两赔偿后恢复手段。此物也可通过原有买卖获取。`,['动手','取消'],'c_hero');
        if(confirm!==0)continue;await this.perform(id,n,spec,item)
      }else if(id==='spar'){
        const c=await choose(n.name,`对方同意点到为止（境界 ${spec.spar.lv}）。单人切磋，结束恢复入场气血与内力；使用药品仍消耗，不发经验、银两或掉落。再次战胜同一人不重复增加切磋熟练。`,['抱拳切磋','取消'],n.sp);if(c===0)await this.perform(id,n,spec)
      }else if(id==='persuade'){
        const p=spec.persuade;const c=await choose(n.name,`${p.reason}${p.offer?` 成功花费 ${p.price} 两，获得 ${ITEMS[p.offer].name}。`:''}成功率 ${this.chance(id,n,spec)}%；失败关系 −1、暂时警觉，可花十两赔礼恢复。`,['说明来意','返回'],n.sp);if(c===0)await this.perform(id,n,spec)
      }else await this.perform(id,n,spec);
    }
  },
  present(n,spec){return npcArtsOverlay(n,spec)},
  book(){return npcArtsBook()}
};
// 等级入口统一；不再依赖样例模块直接 Number() 的宽松解释。
npcArtLevel=id=>NPCArts.level(id);

{const original=interact;interact=async function(target){
  if(busy||dlgBusy||mode!=='scene')return original.call(this,target);
  const n=target||nearest()?.o,spec=NPCArts.spec(n);if(!spec)return original.call(this,target);
  const proxy=Object.create(n);proxy.act=async()=>NPCArts.menu(n,spec,n.act);
  try{return await original.call(this,proxy)}catch(e){console.error('生活技能交互中止：',e);toast('交互未完成，可重新尝试')}finally{NPCArts.pending=false;window.NPCGesture?.clear()}
}}
// 只新增人物，不改建筑和主线。原型两种评审入口都可以学习。
SC.street.npcs.push({id:'arts_trainer',name:'行脚客许青',sp:'c_villager',x:22.5,y:34.2,dir:'d',verb:'请教',
  async act(n){await say(n.name,'行脚江湖，识人问事都要讲方法。先问来意，过招先抱拳，取物先分清借与偷。',n.sp)}});

// 襄阳关卡临时授予，正式开局仍需师承；只补缺失项，不覆盖已成长存档。
{const start=reviewStart;reviewStart=function(){start.apply(this,arguments);if(location.hash!=='#xiangyang')return;
  NPCArts.ensure();for(const id of Object.keys(NPC_ARTS))if(!NPCArts.level(id)){S.npcArts[id]=1;S.npcArtLearning[id]={teacher:'襄阳关卡临时授予',location:'street'}}save()}}
