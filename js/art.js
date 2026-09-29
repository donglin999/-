// 美术清单（由美术管线 process_walk.py 维护）：每个角色每个方向的行走帧数与相对身高
// frames[char]=N 表示存在 assets/c_{char}_{dir}_{0..N-1}.webp（0 为站立帧，1..3 为行走循环：迈左脚/过渡/迈右脚）；未列出则只有 c_{char}_{dir}.webp
// scale[char] 为相对主角的身高倍率（主角=1）
window.ART={frames:{},scale:{
  hero:1,monk:1.05,soldier:1.05,gossip:0.95,oldman:0.95,smith:1.12,lady:0.97,beggar:0.95,boatman:1.02,
  bandit:1.02,chief:1.15,villager:1,child:0.75,merchant:1,dog:0.6,rooster:0.5,snake:0.8,wolf:0.7,suzhi:0.98}};
['hero','monk','soldier','gossip','oldman','smith','lady','beggar','boatman','bandit','chief','villager','child','merchant','dog','rooster','snake','wolf','suzhi'].forEach(function(c){window.ART.frames[c]=4;});
// 精灵表：assets/s_{char}.webp，4 行(d,l,r,u) × 4 列(帧 0..3)，单元格 [宽,高]
ART.sheet={"hero": [90, 141], "monk": [96, 141], "soldier": [99, 141], "gossip": [96, 141], "oldman": [114, 141], "smith": [105, 141], "lady": [75, 141], "beggar": [93, 141], "boatman": [111, 141], "bandit": [87, 141], "chief": [144, 141], "villager": [90, 141], "child": [78, 141], "merchant": [114, 141], "dog": [138, 141], "rooster": [99, 141], "snake": [159, 141], "wolf": [129, 141], "suzhi": [72, 141]};

// 道具图标：assets/i_icons.webp 图集，ART.icons[key]=[x,y,w,h]（96x96，32px像素x3，请用 imageSmoothingEnabled=false 绘制）
ART.icons={"bun": [0, 0, 96, 96], "pill": [96, 0, 96, 96], "wine": [192, 0, 96, 96], "shovel": [288, 0, 96, 96], "book": [384, 0, 96, 96], "gall": [480, 0, 96, 96], "token": [0, 96, 96, 96], "wood": [96, 96, 96, 96], "iron": [192, 96, 96, 96], "rusty": [288, 96, 96, 96], "cloth": [384, 96, 96, 96], "vest": [480, 96, 96, 96], "k_quan": [0, 192, 96, 96], "k_zhang": [96, 192, 96, 96], "k_bian": [192, 192, 96, 96], "k_tui": [288, 192, 96, 96], "k_nei": [384, 192, 96, 96], "k_jian": [480, 192, 96, 96]};
//@@EXPLORE 由 tools_fx/rig/explore.py build 生成（工作流 K：Q 版白模帧动画管线，docs/anim-pipeline.md §6），勿手改
// 行走 12 帧（接触-下沉-过渡-腾起 ×2，单腿支撑 56%）；奔跑 10 帧（支撑 36% + 两次腾空）；4 行 d,l,r,u；脚底基线在单元底边上 3 像素（×3），与 s_{c} 一致
// stride：每帧前进 stride×身高（世界像素）；walk .13 → 常速约 17fps、1.4 步态周期/秒；run .17 → 约 22fps、2.2 周期/秒（fps 字段仅供参考，帧按距离推进）
ART.walk={hero:{frames:12,cell:[78, 141],rows:'dlru',file:'s_hero_walk',bright:'s_hero_walk_bright',order:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],stride:0.175,fps:17},
  suzhi:{frames:12,cell:[72, 141],rows:'dlru',file:'s_suzhi_walk',bright:'s_suzhi_walk_bright',order:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],stride:0.175,fps:17},
  dog:{frames:12,cell:[138, 141],rows:'dlru',file:'s_dog_walk',bright:'s_dog_walk_bright',order:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],stride:0.17,fps:30}};
ART.run={hero:{frames:10,cell:[90, 141],rows:'dlru',file:'s_hero_run',bright:'s_hero_run_bright',order:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],stride:0.23,fps:21},
  suzhi:{frames:10,cell:[90, 141],rows:'dlru',file:'s_suzhi_run',bright:'s_suzhi_run_bright',order:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],stride:0.23,fps:21},
  dog:{frames:10,cell:[138, 141],rows:'dlru',file:'s_dog_run',bright:'s_dog_run_bright',order:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],stride:0.29,fps:30}};
// 待机 6 帧（站姿派生：呼吸上提 1px + 衣摆 1px；ms 为逐帧毫秒）。运行时尚未读取：需 core.js walkSpec/sliceSheets 支持 kind='idle' 与 drawChar 静止时播放，见 docs/anim-pipeline.md §6.6
ART.idle={hero:{frames:6,cell:[90, 141],rows:'dlru',file:'s_hero_idle',bright:'s_hero_idle_bright',order:[0,1,2,3,4,5],ms:[420, 180, 380, 200, 260, 200]},
  suzhi:{frames:6,cell:[72, 141],rows:'dlru',file:'s_suzhi_idle',bright:'s_suzhi_idle_bright',order:[0,1,2,3,4,5],ms:[420, 180, 380, 200, 260, 200]},
  dog:{frames:6,cell:[138, 141],rows:'dlru',file:'s_dog_idle',bright:'s_dog_idle_bright',order:[0,1,2,3,4,5],ms:[170, 130, 210, 130, 200, 150]}};
// 大黄（工作流 K2，Q 版四足骨骼）：walk 12 帧快步（对角步，duty .58）；run 10 帧半跳跑（两后腿蹬出→伸展腾空→两前腿着地→收拢腾空）；idle 6 帧（摇尾/呼吸/耳动，站姿派生）；r 行 = l 行镜像；脚底基线在单元底边上 5 像素（×3）
//@@END
