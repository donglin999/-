'use strict';
// 战斗精灵表规格与数据（battle v2 工作流 D 建立，v3 起由工作流 E 维护），格式见 docs/battle-v2.md §2.1，规格见 docs/battle-sprite-spec.md
// 所有表：assets/b_{char}.webp，1 行 N 帧，美术像素 ×3 最近邻；脚底贴单元底边、角色（按脚部锚点）水平居中。
// h = cell[1] 是源表高度；运行时按待机可见身体高度归一，实际像素颗粒须在战斗镜头复核。
// 动作条目：f 帧序号；ms 每帧毫秒（数字或逐帧数组）；loop 循环；hit 命中帧在 f 中的序号（出招伤害对齐）。
// 自动区由 tools_fx/bart_sync.py 从 raw_battle/{D,E}/sheets.json 生成，勿手改。
window.BART=window.BART||{};
(function(B){
  // 敌方统一 14 帧（foe_battle.py）：0-3 待机 4 冲刺 5 蓄 6 击 7 送 8 收 9 受击 10 运功 11-12 破势 13 倒地
  const FOE_ANIM=()=>({
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4],ms:200},
    atk:{f:[5,6,7,8],ms:[140,70,160,120],hit:1},
    atk2:{f:[5,6,7],ms:[70,60,130],hit:1},
    hurt:{f:[9],ms:320},
    cast:{f:[10],ms:420},
    brk:{f:[11,12],ms:[420,420],loop:true},
    dead:{f:[9,11,13],ms:[140,160,400]}});
  const foe=(file,px,tier,extra)=>Object.assign({file,cell:[px[0]*3,px[1]*3],cols:14,facing:'r',h:px[1]*3,tier,anim:FOE_ANIM()},extra||{});

  // ── 我方（party_sprite.py 生成，统一 18 帧，表内朝左）──
  // 0-3 待机 4-5 冲刺 6 蓄 7 出 8 斩/送 9 收 10 受击 11-12 运功 13-14 破势跪地 15 倒地 16-17 胜利
  //@@PARTY
  // hero：身高 64px，单元 132×70 美术像素
  B.hero={file:'b_hero',cell:[396,210],cols:20,facing:'l',h:210,tier:'party',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,9],ms:[150,70,170,130],hit:1},
    atk2:{f:[10,11,9],ms:[80,70,150],hit:1},
    hurt:{f:[12],ms:320},
    cast:{f:[13,14],ms:[260,260]},
    brk:{f:[15,16],ms:[420,420],loop:true},
    dead:{f:[12,15,17],ms:[140,160,400]},
    win:{f:[18,19,18],ms:[240,280,400]}}};
  // suzhi：身高 62px，单元 82×70 美术像素
  B.suzhi={file:'b_suzhi',cell:[246,210],cols:20,facing:'l',h:210,tier:'party',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,9],ms:[150,70,170,130],hit:1},
    atk2:{f:[10,11,9],ms:[80,70,150],hit:1},
    hurt:{f:[12],ms:320},
    cast:{f:[13,14],ms:[260,260]},
    brk:{f:[15,16],ms:[420,420],loop:true},
    dead:{f:[12,15,17],ms:[140,160,400]},
    win:{f:[18,19,18],ms:[240,280,400]}}};
  //@@PEND
  // 大黄 b_dog：四足骨骼帧动画（表内朝左），条目见下方自动同步区

  // ── 敌方 + 大黄（battle v4 工作流 I：帧动画管线 tools_fx/rig 生成完整条目，数值见 raw_battle/I/sheets.json；
  //    未重做的角色才回退 foe()：v2 流程 14 帧，px=[单元宽,单元高] 美术像素，见 raw_battle/D/sheets.json） ──
  //@@FOES
  // bandit：身高 62px，单元 120×68 美术像素（帧动画管线）
  B.bandit={file:'b_bandit',cell:[360,204],cols:18,facing:'r',h:204,tier:'minion',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,9],ms:[160,70,170,130],hit:1},
    atk2:{f:[10,11,9],ms:[90,70,150],hit:1},
    hurt:{f:[12],ms:320},
    cast:{f:[13,14],ms:[260,260]},
    brk:{f:[15,16],ms:[420,420],loop:true},
    dead:{f:[12,15,17],ms:[140,160,400]}}};
  // monk：身高 58px，单元 62×59 美术像素（帧动画管线）
  B.monk={file:'b_monk',cell:[186,177],cols:18,facing:'r',h:177,tier:'minion',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,9],ms:[160,70,170,130],hit:1},
    atk2:{f:[10,11,9],ms:[90,70,150],hit:1},
    hurt:{f:[12],ms:320},
    cast:{f:[13,14],ms:[260,260]},
    brk:{f:[15,16],ms:[420,420],loop:true},
    dead:{f:[12,15,17],ms:[140,160,400]}}};
  // wolf：身高 36px，单元 74×48 美术像素（帧动画管线）
  B.wolf={file:'b_wolf',cell:[222,144],cols:14,facing:'r',h:144,tier:'minion',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,0],ms:[150,90,170,130],hit:2},
    atk2:{f:[6,8,0],ms:[90,150,130],hit:1},
    hurt:{f:[9],ms:320},
    cast:{f:[6,10],ms:[260,260]},
    brk:{f:[11,12],ms:[420,420],loop:true},
    dead:{f:[9,11,13],ms:[140,160,400]}}};
  // dog：身高 30px，单元 60×37 美术像素（帧动画管线）
  B.dog={file:'b_dog',cell:[180,111],cols:14,facing:'l',h:111,tier:'party',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,0],ms:[150,90,170,130],hit:2},
    atk2:{f:[6,8,0],ms:[90,150,130],hit:1},
    hurt:{f:[9],ms:320},
    cast:{f:[6,10],ms:[260,260]},
    brk:{f:[11,12],ms:[420,420],loop:true},
    dead:{f:[9,11,13],ms:[140,160,400]}}};
  // rooster：身高 50px，单元 68×52 美术像素（帧动画管线）
  B.rooster={file:'b_rooster',cell:[204,156],cols:14,facing:'r',h:156,tier:'elite',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,0],ms:[180,80,200],hit:1},
    atk2:{f:[6,8,0],ms:[120,80,200],hit:1},
    hurt:{f:[9],ms:320},
    cast:{f:[6,10],ms:[260,260]},
    brk:{f:[11,12],ms:[420,420],loop:true},
    dead:{f:[9,11,13],ms:[140,160,400]}}};
  // chief：身高 104px，单元 184×122 美术像素（帧动画管线）
  B.chief={file:'b_chief',cell:[552,366],cols:18,facing:'r',h:366,tier:'boss',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,9],ms:[160,70,170,130],hit:1},
    atk2:{f:[10,11,9],ms:[90,70,150],hit:1},
    hurt:{f:[12],ms:320},
    cast:{f:[13,14],ms:[260,260]},
    brk:{f:[15,16],ms:[420,420],loop:true},
    dead:{f:[12,15,17],ms:[140,160,400]}}};
  // beggar：身高 60px，单元 132×63 美术像素（帧动画管线）
  B.beggar={file:'b_beggar',cell:[396,189],cols:18,facing:'r',h:189,tier:'elite',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,9],ms:[160,70,170,130],hit:1},
    atk2:{f:[10,11,9],ms:[90,70,150],hit:1},
    hurt:{f:[12],ms:320},
    cast:{f:[13,14],ms:[260,260]},
    brk:{f:[15,16],ms:[420,420],loop:true},
    dead:{f:[12,15,17],ms:[140,160,400]}}};
  // snake：身高 71px，单元 134×73 美术像素（帧动画管线）
  B.snake={file:'b_snake',cell:[402,219],cols:14,facing:'r',h:219,tier:'elite',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[220,200,240,200,220,260],loop:true},
    dash:{f:[4,5],ms:[100,120]},
    atk:{f:[6,7,0],ms:[200,90,220],hit:1},
    atk2:{f:[6,8,0],ms:[140,200,220],hit:1},
    hurt:{f:[9],ms:320},
    cast:{f:[6,10],ms:[260,260]},
    brk:{f:[11,12],ms:[420,420],loop:true},
    dead:{f:[9,11,13],ms:[140,160,400]}}};
  //@@END
  // 叶蘅：独立战斗造型与 20 帧动作，按我方同一身体高度和像素网格绘制。
  B.ye={file:'b_ye',cell:[396,210],cols:20,facing:'l',h:210,tier:'party',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,9],ms:[150,70,170,130],hit:1},
    atk2:{f:[10,11,9],ms:[80,70,150],hit:1},
    hurt:{f:[12],ms:320},
    cast:{f:[13,14],ms:[260,260]},
    brk:{f:[15,16],ms:[420,420],loop:true},
    dead:{f:[12,15,17],ms:[140,160,400]},
    win:{f:[18,19,18],ms:[240,280,400]}}};
  // 守军：同战斗管线的 18 帧动作表；放在自动同步区外，避免旧 sheets.json 覆盖。
  B.soldier={file:'b_soldier',cell:[408,270],cols:18,facing:'r',h:270,tier:'minion',anim:{
    idle:{f:[0,1,2,1,0,3],ms:[200,180,220,180,200,240],loop:true},
    dash:{f:[4,5],ms:[90,120]},
    atk:{f:[6,7,8,9],ms:[160,70,170,130],hit:1},
    atk2:{f:[10,11,9],ms:[90,70,150],hit:1},
    hurt:{f:[12],ms:320},
    cast:{f:[13,14],ms:[260,260]},
    brk:{f:[15,16],ms:[420,420],loop:true},
    dead:{f:[12,15,17],ms:[140,160,400]}}};
})(window.BART);
