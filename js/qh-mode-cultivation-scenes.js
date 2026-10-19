/* 培养模式剧情场景总表：剧情只声明「地点 place + 时间 time」，背景图、地点牌、夜间人物压暗都从这里解析。
   师门剧情、系统自动剧情、主线、来客、闲逛与普通活动共用同一批背景；新增背景只改这张表。
   地点缺某个时间的图时退回白天图（time 仍按剧情声明记录）；庭院白天按季节取图。 */
(function(root){'use strict';
const DIR='assets/production/cultivation/';
const TIMES={day:'白天',dusk:'傍晚',night:'夜'};
const PLACES={
 courtyard:{name:'归云谷 · 庭院',alt:'归云谷庭院与山水',bg:{day:'season',night:'story-bg-v1/night_courtyard.png'},aliases:['院内','谷中院内','谷中住处','溪边','庭院']},
 training_ground:{name:'归云谷 · 练武场',alt:'归云谷练武场',bg:{day:'story-bg-v1/training_ground.png'},aliases:['练武场']},
 herb_garden:{name:'归云谷 · 药圃',alt:'归云谷药圃',bg:{day:'story-bg-v1/herb_garden.png'},aliases:['药圃','药圃边']},
 study:{name:'归云谷 · 书房',alt:'周砚的书房',bg:{day:'story-bg-v1/study.png',night:'story-bg-v1/night_study.png'},aliases:['书房','书案']},
 kitchen:{name:'归云谷 · 厨房',alt:'归云谷厨房',bg:{day:'story-bg-v1/kitchen.png',night:'story-bg-v1/night_kitchen.png'},aliases:['厨房']},
 porch:{name:'归云谷 · 廊下',alt:'归云谷廊下',bg:{day:'visitors-v1/reception-porch.png'},aliases:['廊下']},
 reception:{name:'归云谷 · 接待廊',alt:'归云谷接待廊',bg:{day:'visitors-v1/reception-porch.png'},aliases:['谷中接待廊','接待廊']},
 bamboo_path:{name:'近山竹径',alt:'谷外近山的竹径',bg:{day:'story-bg-v1/bamboo_path.png',night:'story-bg-v1/night_bamboo_path.png'},aliases:['竹径','近山竹径']},
 mountain_road:{name:'山间近路',alt:'雨后山间近路',bg:{day:'story-bg-v1/road_after_rain.png'},aliases:['山间近路']},
 xiangyang_road:{name:'汉皋城外',alt:'通往汉皋的官道，远处是城墙',bg:{day:'story-bg-v1/xiangyang_road.png'},aliases:['襄阳城外','汉皋城外']},
 // 谷中人家（2026-10-11）：院墙之外、山谷之内。
 bookhouse:{name:'溪东 · 半亩书屋',alt:'溪东裴家的半亩书屋',bg:{day:'neighbors-v1/bookhouse.png',night:'neighbors-v1/bookhouse_night.png'},aliases:['半亩书屋','溪东']},
 bookhouse_inside:{name:'半亩书屋 · 屋内',alt:'半亩书屋里的书架与书案',bg:{day:'neighbors-v1/bookhouse_inside.png'},aliases:['书屋内']},
 terraces:{name:'谷口 · 梯田人家',alt:'谷口的梯田与两户佃农的屋子',bg:{day:'neighbors-v1/terraces.png'},aliases:['梯田','谷口']},
 watermill:{name:'溪上 · 水碓房',alt:'溪上的水碓房',bg:{day:'neighbors-v1/watermill.png'},aliases:['水碓房','水碓']},
 market_town:{name:'山下集市',alt:'山下集市',bg:{day:'story-bg-v1/market_town.png'},aliases:['山下集市','集市']}
};
PLACES.hangao_gate={name:'汉皋 · 南门外',alt:'汉皋南城门与城外草市',bg:{day:'pre-hangao/hangao_gate.png'},aliases:['汉皋南门外']};
const ALIAS={};for(const[k,p]of Object.entries(PLACES)){ALIAS[k]=k;for(const a of p.aliases)ALIAS[a]=k;}
// 地点键或中文地名 → 地点键；对不上的地名归到庭院。
function placeKey(place){return ALIAS[place]||'courtyard';}
function known(place){return !!ALIAS[place];}
// 解析一个场景 {place,time}：返回背景图、alt、地点牌文字（地点名＋非白天时的时间）、实际用到的时间段。
function resolve(scene,season){const key=placeKey(scene?.place),p=PLACES[key],time=TIMES[scene?.time]?scene.time:'day',use=p.bg[time]?time:'day',file=p.bg[use];
 return {place:key,time,shown:use,src:file==='season'?`${DIR}bg_mountain_${season||'spring'}_v1.png`:DIR+file,alt:use==='night'?'夜里的'+p.alt:p.alt,name:p.name,timeName:time==='day'?'':TIMES[time]};}
// 剧情句子的场景沿用：句子写了 place/time 就换，没写就接上一句。
function carry(prev,line){return {place:line.place!==undefined?line.place:prev.place,time:line.time!==undefined?line.time:prev.time};}
const API={TIMES,PLACES,placeKey,known,resolve,carry};
if(typeof module==='object'&&module.exports)module.exports=API;else root.CultivationScenes=API;
})(typeof globalThis!=='undefined'?globalThis:this);
