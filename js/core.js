'use strict';
/* 小江湖 · 襄阳风云 —— 第一章
   纯 Web 实现：Canvas2D 场景/战斗 + DOM 界面。剧情脚本用 async/await 书写。 */

// ───────────────────────── 资源 ─────────────────────────
const IMG = {};
const CHARS=['hero','monk','soldier','gossip','oldman','smith','lady','beggar','boatman','bandit','chief','villager','child','merchant','dog','rooster','snake','wolf','suzhi','ye','liu','zhou','langli'];
const PORTS=['hero','monk','soldier','gossip','oldman','smith','lady','beggar','boatman','bandit','chief','suzhi','ye','liu','zhou','langli'];
// 新加入、美术可能尚未就绪的角色/立绘：走可选加载（缺文件静默，不画粉块）
const OPT_CHARS=['suzhi'],OPT_PORTS=['suzhi'];
// 立绘表情差分 p_{角色}_{表情}.webp：对话 sp 写作 'c_suzhi:shy'，缺图时回退基础立绘（后台加载，不阻塞进度条）
const EXPR={hero:['smile','angry','surprise','think','hurt','battle'],suzhi:['smile','shy','angry','worry','surprise','battle'],ye:['smile','shy','angry','worry','surprise','battle','hurt']};
function loadExpr(){for(const c in EXPR)for(const e of EXPR[c])loadOpt(`p_${c}_${e}`,`p_${c}_${e}`);loadOpt('s_hero_battle','s_hero_battle')}  // 附带主角战斗动作表
// 探索地图：v2 场景为程序排布底图 m_*_v2 + 素材图集 m_*_v2_props（tools_scene/build_scene.py）；旧街市 m_street/_fg/_bright 已不再加载
const ASSETS=['bg_title','m_world','m_street_v2','m_street_v2_props','m_alley_v2','m_alley_v2_props','m_ferry_v2','m_ferry_v2_props',
  'm_temple_v2','m_temple_v2_props','m_temple_out_v2','m_temple_out_v2_props','m_gate_v2','m_gate_v2_props','m_bgate_v2','m_bgate_v2_props','m_cave_v2','m_cave_v2_props',
  ...CHARS.filter(c=>!OPT_CHARS.includes(c)).map(c=>'s_'+c),...PORTS.filter(p=>!OPT_PORTS.includes(p)).map(p=>'p_'+p)];
// 评审明亮模式：index.html#streetbright —— 载入 *_bright 变体（缺失则回落常规资源），并关闭角色压暗调色/夜色
const BRIGHT=true; // 已定稿：明亮画风（B 方案：原布局提亮）
// 可选行走表：ART.walk[char] = N | {n|frames, cell|size:[w,h], order|seq:[..], file, bright, stride}；表为 4 行(d,l,r,u) × N 列
function walkSpec(c,kind='walk'){const a=window.ART&&ART[kind]&&ART[kind][c];if(!a)return null;const o=typeof a==='number'?{n:a}:Array.isArray(a)?{order:a}:a,df='s_'+c+'_'+kind;
  return{n:o.n||o.frames||0,cell:o.cell||o.size||null,order:o.order||o.seq||null,file:o.file||df,bright:o.bright||((o.file||df)+'_bright'),stride:o.stride||0,ms:o.ms||null}}
// 跑步表 ART.run 同格式，切为 r_{char}_{dir}_{i}，登记 RUN[char]
const WALK={},RUN={},IDLE={};   // IDLE：待机表 ART.idle → i_{char}_{dir}_{i}，按 ms 逐帧计时播放
function cut(sh,x,y,w,h){const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(sh,x,y,w,h,0,0,w,h);c.complete=true;c.naturalWidth=w;c.naturalHeight=h;return c}
// 精灵表切片：把 s_{char} 按 4×4 切成独立画布，登记为 c_{char}_{dir}_{i} 与 c_{char}_{dir}（=站立帧）
function sliceSheets(){for(const c of CHARS){const sh=IMG['s_'+c],m=ART.sheet&&ART.sheet[c];if(!sh||!sh.naturalWidth||!m)continue;const[cw,ch]=m;
  'dlru'.split('').forEach((d,r)=>{for(let i=0;i<4;i++){const cv2=cut(sh,i*cw,r*ch,cw,ch);IMG[`c_${c}_${d}_${i}`]=cv2;if(!i)IMG[`c_${c}_${d}`]=cv2}})}
  // 行走表：切成 w_{char}_{dir}_{i}，WALK[char]={n,order,stride}
  for(const[kind,pre,REG]of[['walk','w',WALK],['run','r',RUN],['idle','i',IDLE]])for(const c of CHARS){const sp=walkSpec(c,kind),sh=sp&&(IMG[pre+'_'+c]);if(!ok(sh))continue;
    const ch=sp.cell?sp.cell[1]:sh.naturalHeight/4,n=sp.n||Math.round(sh.naturalWidth/(sp.cell?sp.cell[0]:ch*.62))||1,cw=sp.cell?sp.cell[0]:Math.floor(sh.naturalWidth/n);
    if(!(n>0&&cw>0&&ch>0))continue;
    'dlru'.split('').forEach((d,r)=>{for(let i=0;i<n;i++)IMG[`${pre}_${c}_${d}_${i}`]=cut(sh,i*cw,r*ch,cw,ch)});
    REG[c]={n,order:(sp.order&&sp.order.length?sp.order:[...Array(n).keys()]).filter(i=>i>=0&&i<n),stride:sp.stride,ms:sp.ms}}}
// 可选资源：404/解码失败静默忽略
function loadOpt(key,file){return new Promise(res=>{const i=new Image();i.onload=()=>{IMG[key]=i;res(true)};i.onerror=()=>res(false);i.src=`assets/${file}.webp`})}
// 明亮版街市前景：用常规前景层的 alpha 作蒙版，从明亮底图里抠出同形状的屋檐/灯笼
function brightFg(){const fg=IMG.m_street_fg,bm=IMG.m_street;if(!ok(fg)||!ok(bm))return;const w=fg.naturalWidth,h=fg.naturalHeight,c=document.createElement('canvas');c.width=w;c.height=h;
  const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(bm,0,0,w,h);x.globalCompositeOperation='destination-in';x.drawImage(fg,0,0,w,h);c.complete=true;c.naturalWidth=w;c.naturalHeight=h;IMG.m_street_fg=c}
// 明亮变体清单：ART.bright 优先，否则为本轮评审出的六个角色（避免对不存在的文件发请求）
const BRIGHT_CHARS=CHARS;
function loadAll(onProg){loadExpr();let n=0;const walks=CHARS.filter(c=>walkSpec(c)),runs=CHARS.filter(c=>walkSpec(c,'run')),idles=CHARS.filter(c=>walkSpec(c,'idle')),tot=ASSETS.length+walks.length+runs.length+idles.length+OPT_CHARS.length+OPT_PORTS.length+(BRIGHT?BRIGHT_CHARS.length:0),tick=()=>{n++;onProg(Math.min(1,n/tot))};
  const base=ASSETS.map(k=>new Promise(res=>{const i=new Image();i.onload=i.onerror=()=>{tick();res()};i.src=`assets/${k}.webp`;IMG[k]=i}));
  const opt=walks.map(c=>{const sp=walkSpec(c);return(BRIGHT?loadOpt('w_'+c,sp.bright).then(o=>o||loadOpt('w_'+c,sp.file)):loadOpt('w_'+c,sp.file)).then(tick)});
  opt.push(...runs.map(c=>{const sp=walkSpec(c,'run');return(BRIGHT?loadOpt('r_'+c,sp.bright).then(o=>o||loadOpt('r_'+c,sp.file)):loadOpt('r_'+c,sp.file)).then(tick)}),
    ...idles.map(c=>{const sp=walkSpec(c,'idle');return(BRIGHT?loadOpt('i_'+c,sp.bright).then(o=>o||loadOpt('i_'+c,sp.file)):loadOpt('i_'+c,sp.file)).then(tick)}),
    ...OPT_CHARS.map(c=>loadOpt('s_'+c,'s_'+c).then(tick)),...OPT_PORTS.map(p=>loadOpt('p_'+p,'p_'+p).then(tick)));
  const br=BRIGHT?[...BRIGHT_CHARS.map(c=>loadOpt('s_'+c+'_bright','s_'+c+'_bright').then(tick))]:[];
  return Promise.all([...base,...opt,...br]).then(()=>{
    if(BRIGHT){for(const c of CHARS)if(ok(IMG['s_'+c+'_bright']))IMG['s_'+c]=IMG['s_'+c+'_bright']}
    sliceSheets()})}
const ok=img=>img&&img.complete&&img.naturalWidth>0;

// ───────────────────────── 工具 ─────────────────────────
const $=id=>document.getElementById(id);
const cv=$("cv");let g=cv.getContext("2d");
const W=960,H=540,GROUND=470;
// 画布按实际显示分辨率渲染：逻辑坐标仍为 960×540，每帧 fitCanvas() 设置基础缩放 PXS（像素画默认最近邻，文字按真实分辨率栅格化）。
// 需要"重置变换"的代码请用 g.setTransform(PXS,0,0,PXS,0,0)，不要用单位矩阵。
let PXS=1;
function fitCanvas(){const r=cv.getBoundingClientRect(),d=window.devicePixelRatio||1,w=Math.max(1,Math.round(r.width*d));PXS=w/W;const h=Math.max(1,Math.round(H*PXS));
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}g.setTransform(PXS,0,0,PXS,0,0);g.imageSmoothingEnabled=false}
const rnd=(a,b)=>a+Math.random()*(b-a);
const ri=(a,b)=>Math.floor(rnd(a,b+1));
const chance=p=>Math.random()*100<p;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// ───────────────────────── 数据 ─────────────────────────
const ORIGINS={
  orphan:{name:'庙中孤儿',desc:'自幼被老僧收养于羊太傅庙，心性沉静。',bonus:{wil:2,wis:1},skill:'jingxin',silver:40},
  beggar:{name:'落魄小乞',desc:'流落襄阳街头，身形灵动，最会躲闪。',bonus:{agi:2,con:1},skill:'shuaibei',silver:28},
  shepherd:{name:'放羊娃',desc:'山野里长大，力气大、筋骨壮。',bonus:{str:2,con:1},skill:'bianfa',silver:34}};
const STATN={str:'臂力',con:'根骨',agi:'身法',wil:'定力',wis:'悟性'};
const STATD={str:'影响攻击力',con:'影响气血与防御',agi:'影响出手顺序、闪避与移动',wil:'影响内力与防御',wis:'影响暴击与武学领悟'};
// 武学：pow 倍率，range 攻击距离(曼哈顿)，shape 范围，combo 连击率
const SKILLS={
  fist:{name:'粗浅拳脚',kind:'拳',mp:0,pow:1.0,range:1,shape:'single',combo:10,desc:'人人都会的三招两式。'},
  fuhu:{name:'伏虎拳',kind:'拳',mp:6,pow:1.35,range:1,shape:'single',combo:60,desc:'拳势连绵，连击率高。'},
  liuye:{name:'柳叶剑法',kind:'剑',mp:8,pow:1.5,range:2,shape:'line',combo:20,desc:'剑出如柳，可穿透一排两人。',needWeapon:'剑'},
  jingxin:{name:'静心诀',kind:'内',mp:10,pow:0,range:0,shape:'self',heal:0.3,desc:'孤儿专属：调息回复三成气血。'},
  shuaibei:{name:'乞儿摔碑手',kind:'掌',mp:7,pow:1.25,range:1,shape:'single',combo:35,stun:30,desc:'小乞专属：有几率令敌人眩晕一回合。'},
  bianfa:{name:'牧羊鞭法',kind:'鞭',mp:7,pow:1.1,range:2,shape:'cross',combo:15,desc:'放羊娃专属：鞭梢横扫十字范围。'},
  lianhua:{name:'莲花落',kind:'掌',mp:9,pow:1.45,range:1,shape:'single',combo:45,bleed:1,desc:'丐帮入门掌法，伤敌流血。'},
  guafeng:{name:'刮风脚',kind:'腿',mp:12,pow:1.7,range:1,shape:'arc',combo:10,desc:'红冠将军身上悟出的腿法，扫击前方三格。'},
  // 敌人/队友招式
  bite:{name:'撕咬',kind:'咬',mp:0,pow:1.0,range:1,shape:'single',combo:30},
  lick:{name:'舔舐',kind:'内',mp:8,pow:0,range:1,shape:'ally',heal:0.25,desc:'大黄狗为同伴疗伤。'},
  peck:{name:'铁喙连啄',kind:'啄',mp:0,pow:1.1,range:1,shape:'single',combo:70},
  blade:{name:'劈砍',kind:'刀',mp:0,pow:1.0,range:1,shape:'single',combo:10},
  ghost:{name:'鬼头斩',kind:'刀',mp:10,pow:1.6,range:1,shape:'arc',combo:0},
  coil:{name:'缠绞',kind:'缠',mp:0,pow:1.2,range:1,shape:'single',combo:0,stun:25},
  palm_m:{name:'罗汉掌',kind:'掌',mp:0,pow:0.8,range:1,shape:'single',combo:0},
  staff:{name:'拨草棍',kind:'棍',mp:0,pow:1.1,range:2,shape:'single',combo:25}};
// 价格与开局银两：见 docs/design/06-物品装备与经济.md §7（W4 经济调整）；扩充物品在 js/menu.js
const ITEMS={
  bun:{name:'羊肉馒头',desc:'香气扑鼻，回复 40 气血。狗子最爱。',heal:40,price:6},
  pill:{name:'金创药',desc:'回复 120 气血。',heal:120,price:20},
  wine:{name:'竹叶青',desc:'回复 40 内力。',mp:40,price:20},
  shovel:{name:'铁铲',desc:'可在闪光处挖掘。',key:1,price:15},
  book:{name:'武学残页',desc:'使用后令一门武学升一级。',book:1},
  gall:{name:'蟒蛇胆',desc:'服下永久增加 30 内力上限。',gall:1},
  token:{name:'黑风令',desc:'黑风寨的通行令牌。',key:1},
  wood:{name:'桃木剑',desc:'剑类兵器，攻击 +6。',weapon:{kind:'剑',atk:6},price:24},
  iron:{name:'精铁剑',desc:'剑类兵器，攻击 +14。',weapon:{kind:'剑',atk:14},price:80},
  rusty:{name:'井底锈剑',desc:'剑类兵器，攻击 +10，暴击 +5%。',weapon:{kind:'剑',atk:10,crit:5}},
  cloth:{name:'粗布短打',desc:'防御 +4。',armor:4,price:20},
  vest:{name:'牛皮软甲',desc:'防御 +10。',armor:10,price:70}};

// ───────────────────────── 存档状态 ─────────────────────────
let S=null;
function newState(){return{name:'无名',origin:'orphan',lv:1,exp:0,pts:0,
  st:{str:3,con:3,agi:3,wil:3,wis:3},moral:10,hp:1,mp:1,silver:0,atkBonus:0,mpBonus:0,
  skills:{fist:1},weapon:null,armor:null,bag:{bun:2},party:[],pet:null,pets:{},flags:{},scene:'temple',x:480,unlocked:{temple:1}}}
const hasFlag=f=>!!S.flags[f];const setFlag=(f,v=1)=>{S.flags[f]=v};
// 直达评审入口使用会话档，不覆盖同一浏览器中的正式游玩存档。
const isReviewEntry=()=>['#street','#streetbright','#xiangyang'].includes(location.hash);
function save(){try{(isReviewEntry()?sessionStorage:localStorage).setItem(isReviewEntry()?'xjh.review.save':'xjh.save',JSON.stringify(S))}catch(e){}}
function loadSave(){try{const s=(isReviewEntry()?sessionStorage:localStorage).getItem(isReviewEntry()?'xjh.review.save':'xjh.save');return s?JSON.parse(s):null}catch(e){return null}}

// 派生属性
function derived(u=S){const s=u.st,w=u.weapon?ITEMS[u.weapon].weapon:null,a=u.armor?ITEMS[u.armor].armor:0;
  return{mhp:60+s.con*14+u.lv*12,mmp:30+s.wil*7+s.wis*2+u.lv*5+(u.mpBonus||0),atk:8+s.str*3+u.lv*2+(w?w.atk:0)+(u.atkBonus||0),
    def:s.con+s.wil*2+a,spd:s.agi,crit:5+s.wis*2+(w&&w.crit||0),dodge:Math.round(s.agi*1.5),move:2+Math.floor(s.agi/5)}}
const DOG={name:'大黄',sp:'c_dog',lv:1,st:{str:4,con:5,agi:6,wil:3,wis:2},skills:{bite:1,lick:1},scale:.55};

// ───────────────────────── 画面基础 ─────────────────────────
let fadeEl=$('fade');
async function fade(fn){fadeEl.classList.add('on');await wait(460);await fn();await wait(60);fadeEl.classList.remove('on');await wait(300)}
function placeName(t){const p=$('place');p.textContent=t;p.classList.add('on');setTimeout(()=>p.classList.remove('on'),2200)}
// 提示只负责显示，不占用剧情脚本的等待时间；连续获得物品/新目标时按顺序播放。
const toastQueue=[];
let toastShowing=false;
function showNextToast(){
  if(!toastQueue.length){toastShowing=false;return}
  toastShowing=true;
  const [t,ms]=toastQueue.shift(),e=$('toast');
  e.textContent=t;e.classList.add('on');
  setTimeout(()=>{
    e.classList.remove('on');
    setTimeout(showNextToast,180);
  },ms);
}
function toast(t,ms=1400){
  toastQueue.push([String(t),Math.max(0,Number(ms)||0)]);
  if(!toastShowing)showNextToast();
  return Promise.resolve(); // 兼容现有 await toast(...)，不让 interact 的 busy 等待提示消失。
}
function drawBg(key){if(ok(IMG[key]))g.drawImage(IMG[key],0,0,W,H);else{g.fillStyle='#1d1812';g.fillRect(0,0,W,H)}}
// 精灵：图像已抠底、底部即脚底；h 为显示高度
function drawSprite(key,x,y,h,flip=false,opts={}){const im=IMG[key];if(!ok(im)){if(OPT_CHARS.includes(String(key).replace(/^[cs]_/,'')))return 0;g.fillStyle='#b88';g.fillRect(x-20,y-h,40,h);return}
  const w=h*im.naturalWidth/im.naturalHeight;
  g.save();g.globalAlpha=opts.alpha??1;
  g.fillStyle='rgba(0,0,0,.38)';g.beginPath();g.ellipse(x,y-2,w*.36,h*.045,0,0,7);g.fill();
  g.translate(x,y);if(flip)g.scale(-1,1);
  const sy=opts.breath?1+Math.sin(opts.breath)*.012:1;g.scale(1,sy);
  if(opts.flash){g.filter='brightness(2.2)'}
  g.drawImage(im,-w/2,-h,w,h);g.restore();return w}
function vignette(tint){const v=g.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.95);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,BRIGHT&&mode==='scene'?'rgba(0,0,0,.18)':'rgba(0,0,0,.55)');if(BRIGHT&&mode==='scene')tint=null;g.fillStyle=v;g.fillRect(0,0,W,H);
  if(tint){g.fillStyle=tint;g.fillRect(0,0,W,H)}}
