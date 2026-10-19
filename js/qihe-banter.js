/* 闲话与交情。规则见文档库 bond-banter.md；实现说明见 relationships.md“闲话与交情”一节。
   闲话只在汉皋城和大地图自由模式里出现（这两处尚未做，本文件先提供规则与数据，由它们接入）；培养模式不用。
   交情是同伴与同伴之间的，独立于萧白与各人的关系，只靠一起打过的仗增长。 */
(function(root){'use strict';
const node=typeof module==='object'&&module.exports;
// 队伍键 → 名字；只收可入队人物。REL：萧白与她的关系档案键（培养存档里的）。
const NAMES={hero:'萧白',ye:'叶蘅',yinhongying:'殷红缨'},REL={ye:'ye',yinhongying:'yin'};
const STAGES=[{at:0,name:'生分'},{at:6,name:'相熟'},{at:18,name:'知己'}];
const pairKey=(a,b)=>[a,b].sort().join('|');
// 一起打完一场（赢或输都算；逃跑、单人战、教学战不算），在场的同伴两两各记一场。
function fought(world,opt={},result){if(!world||opt.solo||opt.tutorial||opt.storyLesson||result==='flee')return 0;const who=(world.party||[]).filter(k=>NAMES[k]);world.kinship||={};let n=0;
 for(let i=0;i<who.length;i++)for(let j=i+1;j<who.length;j++){const k=pairKey(who[i],who[j]);world.kinship[k]=(world.kinship[k]||0)+1;n++;}return n;}
function kinship(world,a,b){const battles=world?.kinship?.[pairKey(a,b)]||0;let stage=0;STAGES.forEach((s,i)=>{if(battles>=s.at)stage=i;});return {battles,stage,name:STAGES[stage].name,next:STAGES[stage+1]?.at??null};}
const relation=(world,id)=>world?.cultivation?.relations?.[REL[id]]?.score||0;
const L=(who,text,mood)=>({speaker:who,text,mood});
// venues：能出现的地方（hangao 汉皋城、worldmap 大地图自由模式）。
// kin：两位同伴的交情要到第几阶段；rel：萧白与她的关系值要到多少；fact：还要先发生过哪件事（培养存档里的事实）；adult：萧白满十八岁之后。
const list=[
 {id:'yy_herb_wine',pair:['ye','yinhongying'],venues:['worldmap'],kin:1,title:'药和酒',lines:[
  L('yinhongying','丫头，你那药囊里有没有能下酒的？','fun'),
  L('ye','有。黄连。','normal'),
  L('yinhongying','……你学坏了。','surprise'),
  L('ye','跟您同路打了这么多场，总得学点什么。','smile'),
  L('yinhongying','行。下回我受伤，你下手轻点就算报答了。','smile')]},
 {id:'yy_pharmacy',pair:['ye','yinhongying'],venues:['hangao'],kin:1,title:'汉皋的药铺',lines:[
  L('ye','这家铺子的当归比谷里贵三成。','serious'),
  L('yinhongying','城里什么都贵。你要多少，我去讲价。','normal'),
  L('ye','您会讲价？','surprise'),
  L('yinhongying','我往柜台上一靠，他们自己就降了。','fun'),
  L('ye','……那不叫讲价。我自己来。','normal')]},
 {id:'yy_hand',pair:['ye','yinhongying'],venues:['worldmap'],kin:1,fact:'gy_yin_past_seen',title:'那只手',lines:[
  L('ye','方才那一场，您右手用了全力。','serious'),
  L('yinhongying','看出来了？','normal'),
  L('ye','回去要敷药。还有——那场寿宴的事，他同我说了一半。','normal'),
  L('yinhongying','另一半你想听，就自己来问我。别从他嘴里听。','serious'),
  L('ye','好。等您手好了，我来问。','smile')]},
 {id:'yy_way_home',pair:['ye','yinhongying'],venues:['worldmap'],kin:2,title:'回谷的路',lines:[
  L('yinhongying','从这儿往西北走四天，就是谷口。','normal'),
  L('ye','您记得真清楚。','normal'),
  L('yinhongying','走的时候记的。那时候想的是“记清楚了，往后好绕开”。','sad'),
  L('ye','现在呢？','normal'),
  L('yinhongying','现在是你问我，我才发现自己还记着。……过年一道回去。','smile'),
  L('ye','嗯。我跟师母说过了，两个人的碗都留着。','smile')]},
 {id:'hy_city_patient',pair:['hero','ye'],venues:['hangao'],rel:50,title:'城里的病人',lines:[
  L('ye','方才巷口那个咳嗽的人，你看见没有？','serious'),
  L('hero','看见了。你想过去。','normal'),
  L('ye','想。可他没叫大夫，我不能上去就把脉。','worry'),
  L('hero','那我去买他摊上的东西，你在旁边问两句。','smile'),
  L('ye','……你现在比我会找由头了。走。','smile')]},
 {id:'hy_roadside',pair:['hero','ye'],venues:['worldmap'],rel:50,title:'路边的草',lines:[
  L('hero','这个我认得。紫苏。','smile'),
  L('ye','那是野苏。叶子背面不紫。','normal'),
  L('hero','……差一点。','sad'),
  L('ye','差一点也是认得了一半。去年你连叶子和草都分不清。','smile'),
  L('hero','这算夸我？','smile'),
  L('ye','算。','smile')]},
 {id:'hn_tavern',pair:['hero','yinhongying'],venues:['hangao'],rel:50,title:'酒肆',lines:[
  L('yinhongying','这家的酒我十年前喝过。进去坐坐。','smile'),
  L('hero','师母交代过，不许你带我喝酒。','serious'),
  L('yinhongying','她交代的是谷里。这儿是汉皋。','fun'),
  L('hero','……那我喝茶，替你数着。','normal'),
  L('yinhongying','数到三就拦我。我说的是三壶。','fun')]},
 {id:'hn_back_to_back',pair:['hero','yinhongying'],venues:['worldmap'],rel:80,adult:true,title:'背后',lines:[
  L('yinhongying','方才你一直站在我右手边。','normal'),
  L('hero','你右手握不实。那边该有个人。','serious'),
  L('yinhongying','……谁教你的？','surprise'),
  L('hero','没人教。看了一年，自己看出来的。','smile'),
  L('yinhongying','看这么仔细。往后那边就归你了，别让给别人。','smile')]},
];
const byId=new Map(list.map(b=>[b.id,b]));
const here=(world,p)=>p==='hero'||(world.party||[]).includes(p);
// 为什么现在不出现（空字符串＝可以出现）。人不在队里、交情或关系没到、那件事没发生，都不出现。
function blocked(world,b,venue){if(!b.venues.includes(venue))return'地方不对';if(!b.pair.every(p=>here(world,p)))return'人不在';
 if(world.banter?.offered?.[b.id]!==undefined)return'已出现过';
 if(b.kin!==undefined&&kinship(world,b.pair[0],b.pair[1]).stage<b.kin)return'交情未到';
 if(b.rel!==undefined&&relation(world,b.pair.find(p=>p!=='hero'))<b.rel)return'关系未到';
 if(b.fact&&!world.cultivation?.facts?.[b.fact])return'事情还没发生';
 if(b.adult&&(world.cultivation?.month||0)<13)return'萧白未满十八';return'';}
// 某处现在该提示的一条：没有就不显示任何东西。提示过的不重复提示，留在闲话册里。
function due(world,venue){if(!world)return null;return list.find(b=>!blocked(world,b,venue))||null;}
function offer(world,b){world.banter||={offered:{},seen:{}};if(world.banter.offered[b.id]===undefined)world.banter.offered[b.id]=Object.keys(world.banter.offered).length+1;return b;}
function finish(world,id){if(!byId.has(id))throw Error('没有这条闲话。');if(world.banter?.offered?.[id]===undefined)throw Error('这条闲话还没出现过。');world.banter.seen[id]=true;return true;}
function book(world){const st=world?.banter||{};return Object.keys(st.offered||{}).filter(id=>byId.has(id)).sort((a,b)=>st.offered[a]-st.offered[b]).map(id=>{const b=byId.get(id);return {id,title:b.title,names:b.pair.map(p=>NAMES[p]),read:!!st.seen?.[id]};});}
function script(id){const b=byId.get(id);return b?{id,title:b.title,cast:b.pair,lines:b.lines}:null;}
function prompt(b){const [a,c]=b.pair;return a==='hero'?`${NAMES[c]}有话跟你说`:`${NAMES[a]}和${NAMES[c]}在说话`;}
const API={list,NAMES,STAGES,fought,kinship,relation,blocked,due,offer,finish,book,script,prompt};
if(node)module.exports=API;else{root.QiheBanter=API;
 // 战斗结束时记交情：包一层现有的 battle，不改它的行为和返回值。
 if(typeof root.battle==='function'&&!root.battle.__banter){const base=root.battle;const wrapped=async function(opt){const r=await base.apply(this,arguments);try{fought(typeof S!=='undefined'?S:null,opt,r);}catch(e){console.error(e);}return r;};wrapped.__banter=true;root.battle=wrapped;}}
})(typeof window!=='undefined'?window:globalThis);
