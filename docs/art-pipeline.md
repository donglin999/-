# 美术管线

## 当前出图接口约定

襄阳体验章节本轮按用户最新决定使用 Codex 内置 `image_gen` 直接生成；全部采用稿、身份参考、提示词和后处理记录在[襄阳生图记录](design/xiangyang-art-prompts.md)。此前 `tools_common/flatimg.py` 是旧素材和接口对照稿的制作路径，历史来源按各自记录保留，不倒写成同一模型。后续其他章节的出图接口按该章节用户要求确定。

美术资源有不同批次：早期整图与角色素材使用 HY-Image-V3.0；当前街市单体管线 `tools_scene/gen_props.py` 使用 `tools_common/flatimg.py`，模型与参数以该脚本的 `PARAMS` 为准，再经本仓库的 Python（Pillow + numpy，部分用 scipy）脚本抠图、像素化、切帧、排布和打包。运行时读取 `assets/` 下的 webp。**所有脚本都以仓库根目录为工作目录运行**（路径写死为相对路径）。襄阳的设定与审图标准见[城设定](design/xiangyang-city.md)、[素材规范](design/xiangyang-art.md)；本页描述技术管线。

江湖菜单专用图标 v2 单独使用精细手绘管线，规范见[江湖图标](design/jianghu-icons.md)。`tools_scene/menu_icons_v2_manifest.json` 逐件列出 65 个物品、招式、心法的主体描述；`tools_scene/gen_menu_icons_v2.py` 经现有 FlatRouter 异步接口生成缺失的高分辨率原稿，保存在本地忽略目录 `raw_menu_icons/` 并记录参数；`tools_scene/build_menu_icons_v2.py` 对不透明白底图执行透明化、平滑缩小并打包为 `assets/i_jianghu.webp`，同步生成 `js/menu-icons.js` 坐标。构建器遇到缺图会直接失败，不会混入旧的像素图标。游戏旧图集 `assets/i_icons.webp` 仍供其他既有用途使用。

## 1. 资源格式与命名

| 命名 | 尺寸 | 用途 | 生成 |
|---|---|---|---|
| `m_{scene}.webp` | 640×360（现存 `m_world` 为 1280×720） | 场景地图，运行时最近邻绘制到 1920×1080 世界；`m_world` 为大地图，拉伸到画布 960×540 | `pixmaps.py`（注意：重跑会把 `m_world` 也输出为 640×360） |
| `m_{scene}_v2.webp` | 源像素 = 世界/3（街市 880×520、偏巷/渡口 800×440、南门 800×480、庙外/寨门/山洞 720×400、庙内 640×360） | **v2 程序排布地图**（第一章全部 8 个探索场景）：程序化地面 + 投影 + 全部单体素材已烘焙；运行时绘制到 `WW×WH` 世界 | `tools_scene/build_scene.py`（见 §场景管线 v2） |
| `m_{scene}_v2_props.webp` | 宽 1024 的图集 | v2 地图的单体素材图集（建筑/树/摊位…），运行时按底边 y 与角色深度排序重画（屋檐/树冠遮挡），条目在 `SC.{scene}.props` | 同上 |
| `m_street.webp` `m_street_bright.webp` `m_street_fg.webp` `m_alley.webp` `m_ferry.webp` | 640×360 | 旧版街市 / 偏巷 / 渡口地图，**运行时已不再加载**，保留作前后对比（`review/scene_v2/street_before.png`） | `pixmaps.py` / `pix_bright.py` / `street_layers.py` |
| `s_{char}.webp` | 4 列 × 4 行 | 角色精灵表：行 `d,l,r,u`，列 = 帧 0..3（0 站立，1 迈步 A，2 过渡，3 迈步 B）；单元格尺寸在 `ART.sheet[char]=[w,h]`（高均为 141 = 47 像素 ×3） | `pack.py`（苏芷：`tools_bright/suzhi_sheet.py`） |
| `s_{char}_bright.webp` | 同上 | 明亮风格版本，`BRIGHT` 时替换 `s_{char}` | `tools_bright/bright_sprites.py` |
| `s_{c}_walk(_bright).webp` | 12 列 × 4 行 | 主角/苏芷 12 帧行走表（工作流 K，Q 版白模帧动画管线；hero 单元 78×141、suzhi 72×141），`ART.walk[c]` | `tools_fx/rig/explore.py build`（见 `anim-pipeline.md` §6；旧 8 帧手工表备份在 `raw_anim/explore_old/`） |
| `s_{c}_run(_bright).webp` | 10 列 × 4 行 | 10 帧奔跑表（hero 90×141、suzhi 90×141），`ART.run[c]` | 同上 |
| `s_{c}_idle(_bright).webp` | 6 列 × 4 行 | 6 帧待机（站姿派生呼吸/衣摆；hero 90×141、suzhi 72×141），`ART.idle[c]`（运行时尚未读取，见 `anim-pipeline.md` §6.6） | 同上 |
| `p_{char}.webp` | ≤480×640 | 对话/战斗立绘（`PORTS` 列表 + suzhi），v2 国画白描淡彩风 | `tools_por/gen_por.py` → `tools_por/post_por.py`（见 §立绘 v2；v1 厚涂版备份在 `assets/review/p_v1/`） |
| `i_icons.webp` | 576×288 | 道具/武学图标图集，每格 96×96（32 像素 ×3），`ART.icons[key]=[x,y,w,h]` | `icons.py` |
| `bg_{place}.webp` | 960×540 | 战斗背景：`bg_temple bg_temple_out bg_gate bg_street bg_alley bg_ferry bg_bandit_gate bg_bandit_cave`；`bg_title` 为标题画面 | `process.py` |
| `c_{char}_{dir}(_{i}).webp` | — | 旧的单帧文件（`export.py`/`process_walk.py` 的中间产物），**运行时不再加载**；运行时 `sliceSheets()` 在内存中切出同名画布 | — |
| `sp_*.webp` `td_*.webp` `bg_map.webp` | — | 早期版本的立绘/俯视图/地图，运行时未引用 | `process.py` |
| `assets/review/` | — | 评审素材：明亮化与补五官之前的原表 `s_*.webp`、立绘原图 `p_orig/`、苏芷立绘候选 `p_suzhi_alt_{37,58,74}.webp`、街市新布局试稿 `m_street_gen{1,2}.webp` | — |

### 运行时切片后的 `IMG` 键

- `c_{char}_{d}_{i}`（i=0..3）与 `c_{char}_{d}`（=第 0 帧）：由 `s_{char}` 切出。
- `w_{char}_{d}_{i}` / `r_{char}_{d}_{i}`：由 walk / run 表切出，登记于 `WALK[char]` / `RUN[char]`。

### `js/art.js` 中的 `ART`

```js
ART.frames[char]=4                 // 每方向帧数
ART.scale[char]                    // 相对主角身高（主角=1），影响探索与战斗显示高度
ART.sheet[char]=[w,h]              // s_{char} 单元格；pack.py 自动回写
ART.icons[key]=[x,y,w,h]           // i_icons 图集；icons.py 自动回写
// hero / suzhi：//@@EXPLORE … //@@END 区由 tools_fx/rig/explore.py build 回写（同时回写 ART.sheet.hero/suzhi）
ART.walk[c]={frames:12,cell:[w,141],rows:'dlru',file:'s_hero_walk',bright:'s_hero_walk_bright',order:[0..11],stride:.13,fps:17}
ART.run[c] ={frames:10,cell:[w,141],rows:'dlru',file:'s_hero_run', bright:'s_hero_run_bright', order:[0..9], stride:.17,fps:21}
ART.idle[c]={frames:6, cell:[w,141],rows:'dlru',file:'s_hero_idle',bright:'s_hero_idle_bright',order:[0..5],ms:[...]}   // 待运行时支持
```

`walkSpec()` 还接受简写：`ART.walk[c]=N` 或 `[order...]`，以及 `n|frames`、`cell|size`、`order|seq`、`stride`（步幅系数，缺省 walk .16 / run .24 × 身高）。`fps` 字段当前未被读取（帧按走过的距离推进）。主角/苏芷的 `s_{c}(_bright).webp`（4×4）也由 `explore.py build` 输出：列 0 = 待机基帧（站立），列 1..3 = 新行走表的帧 0/3/6，单元 hero 90×141、suzhi 72×141；脚底基线在单元底边上 3 像素（与行走/奔跑表一致）。

### 像素密度约定

角色像素化为 44（后续补边后 47）像素高 ×3 最近邻放大；地图 640×360 ×3 到世界。故角色与地图的像素网格同密度。绘制像素图时一律 `imageSmoothingEnabled=false`。

## 2. 早期出图：HY-Image

本节记录旧批次出图方法，不适用于当前 `tools_scene/gen_props.py` 的街市单体。新单体的提示词、参考图和参数记录见该脚本及[襄阳素材规范](design/xiangyang-art.md)。

客户端：`/home/user/juesheng/tools/hy_image.py`（仓库外，参数实测见 `/home/user/juesheng/tools/HY_API_参数实测.md`）。

```bash
export HY_IMAGE_KEY=...        # 勿提交
python3 /home/user/juesheng/tools/hy_image.py gen "提示词" out.png --seed 101 --size 1280x720
python3 /home/user/juesheng/tools/hy_image.py batch j_chars.json raw2     # {文件名: 提示词} → raw2/文件名.png
python3 /home/user/juesheng/tools/hy_image.py query <job_id>
```

- 异步 submit → poll → download；**账号同时只能有 1 个任务**，batch 串行执行，不要并行开多个进程。
- 实测有效参数只有 `logo_add`（默认 0，关水印）、`seed`、`resolution`（`--size WxH` 转 `"W:H"`，合法档：1024:1024 / 768:1024 / 1024:768 / 720:1280 / 1280:720）。`--negative`/size 类字段被网关忽略。
- 其他选项：`--width N`（缩放，0=原图）、`--crop`（裁底去水印兜底）、`--jpg`、`--no-logo-off`、`--extra '{json}'`。

### 任务文件（仓库根目录）

| 文件 | 键 | 输出目录（按脚本读取位置） |
|---|---|---|
| `j_chars.json` | `c_*` 18 个角色四方向行走图（白底，正/左/右/背横排） | `raw2/` |
| `j_fix.json` | `c_bandit c_child c_gossip c_villager c_lady …` 重出 | `raw3/`（采用后需放入 `raw2/` 供 `split.py` 读取） |
| `j_maps.json` | `m_*` 场景地图（1280×720） | `raw2/` |
| `j_por.json` | `p_*` 立绘 | `raw2/` |
| `jobs_bg.json` | `bg_*` 战斗/标题背景 | `raw/` |
| `jobs_sp.json` / `jobs_td.json` / `jobs_map.json` | 旧版 `sp_*` / `td_*` / `bg_map` | `raw/` |
| `raw_street/gen.sh` | 街市地图 4 个候选 `c1..c4.png`（seed 101–104） | `raw_street/` |
| `raw_icons/sheet1.png` `sheet2.png` | 图标网格图 | — |

苏芷的 `raw2/c_suzhi.png` 不在 `j_chars.json` 中，单独出图。`gen*.log` 为历次批量出图日志。

## 3. 处理脚本

### 根目录

| 脚本 | 输入 → 输出 | 说明 |
|---|---|---|
| `process.py` | `raw/*.png` → `assets/*.webp` | `bg_*`/`td_*` 缩放到 960×540；其他（`sp_*`）白底洪泛去背、裁切、缩放到 360 高。已存在的输出跳过 |
| `split.py` | `raw2/c_*.png` → `frames/c_{k}_{i}.png` | 洪泛去白底 → 按列投影切出每个小人（合并 <14px 间隙，丢弃 <25px 宽的碎片）→ 统一 132 高 |
| `export.py` | `frames/` + `framemap.json` → `assets/c_{k}_{d,l,r,u}.webp` | `framemap.json`：`char:[正面帧, 侧面帧, 背面帧, 侧面帧是否朝右]`，另一侧由镜像得到 |
| `process_walk.py` | `assets/c_{k}_{d}.webp` → `assets/c_{k}_{d}_{0..3}.webp`（并覆盖 `c_{k}_{d}`） | 像素化到 44 高、24 色量化、硬 alpha、饱和度统一（`SAT` 表压艳色）、深色描边；按物种生成 4 帧步态（`human`/`quad` 狗狼/`bird` 鸡/`snake`）；×3 最近邻。**会覆盖输入，重跑前先 `python3 export.py`** |
| `process_walk_r1.py` | 同上 | 第一版行走管线，已被 `process_walk.py` 取代 |
| `pack.py` | `assets/c_{c}_{d}_{i}.webp` → `assets/s_{c}.webp`，回写 `ART.sheet` | 脚底对齐、水平居中。**`CH` 列表不含 `suzhi`，重跑会从 `ART.sheet` 中删掉 suzhi 条目，需手工补回** |
| `pixmaps.py [m_key…]` | `raw2/m_*.png` → `assets/m_*.webp` | 640×360 BOX 缩小、逐图调色（`WARM`）、饱和 `SAT`（env，默认 .88）、对比、1px 边缘加深、调色板量化（env `NCOL` 默认 56，`m_street` 64 色 + kmeans，`m_world` 72 色） |
| `street_layers.py [--fg]`（**已废弃**：街市改为 v2 程序排布，见 §场景管线 v2） | `assets/m_street.webp` → `raw_street/street_layers.js`（mask + fgp）、`raw_street/dbg_walk.png`；`--fg` 时另存 `assets/m_street_fg.webp` | 在源图坐标（640×360）手写 `WALK` 多边形、`BLOCK` 障碍、`FG` 前景块（`r` 矩形 / `e` 椭圆 / `p` 多边形 / `c` 按灯笼红色抠取；底边 9999=永远在上）。mask 240×135（每位 8 世界像素）。**输出需手工贴入 `js/story.js` 末尾的 `SC.street.mask=…` / `SC.street.fgp=…`**（「由 street_layers.py 生成，勿手改」处） |
| `icons.py` | `raw_icons/sheet1.png` `sheet2.png` → `assets/i_icons.webp`，回写 `ART.icons` | 手工网格坐标裁切、去白底、保留大连通块、32px 像素化 + 描边、×3；6 列图集 |
| `portrait.py` | `raw2/p_*.png` → `assets/p_*.webp` | 以左上角像素为背景色洪泛去背、裁切、缩放至 ≤480×640 |

### `tools_bright/`（明亮风格与动画）

| 脚本 | 用法 | 说明 |
|---|---|---|
| `face.py` | `face.py <src.webp> <dst.webp> [cols=4]` | 44px 像素化抹掉了五官：在肤色脸部补双眼+眉+嘴（d 行）/单眼（l/r 行，朝离发髻远的一侧）；动物（dog/rooster/snake/wolf）跳过；白皙肤色有回退判据 |
| `sidewalk.py` | `sidewalk.py assets/s_x.webp …`（原地修改） | 从侧面站立帧（列 0）拆出双腿，重建 l/r 行帧 1..3（远腿压暗） |
| `bright_sprites.py` | `bright_sprites.py [char…]` | `assets/review/s_{k}.webp` → `assets/s_{k}_bright.webp`：gamma 提亮、饱和回升、暖光，保留深色描边。**不带参数只处理 6 个角色**（hero lady smith villager child soldier） |
| `walk.py` | `walk.py [char=hero]` | 8 帧手工步态：`assets/review/s_{c}.webp` → `assets/s_{c}_walk.webp`；`assets/s_{c}_bright.webp` → `assets/s_{c}_walk_bright.webp`（单元宽 +12px） |
| `run.py` | `run.py [char=hero]` | 复用 walk.py 的 `frame()`，改为步幅 ±5、抬脚 4、前倾、腾空上浮：`assets/s_{c}.webp` → `s_{c}_run.webp`；`s_{c}_bright` → `s_{c}_run_bright`（单元宽 +30px） |
| `suzhi_sheet.py` | `suzhi_sheet.py` | 苏芷：`raw2/c_suzhi.png` → `split` → `process_walk.pix/human` → `assets/review/s_suzhi.webp`。脚本注释写的后续步骤（face → `assets/s_suzhi.webp`、bright_sprites、sidewalk）**脚本内未实现，需手工执行**，并手工在 `ART.sheet` 写入 suzhi 单元格 |
| `pix_bright.py` | `pix_bright.py <src.png> <dst.webp> [relight=1]` | 明亮地图：重打光（提影/曝光/暖阳/增饱和）+ pixmaps 同款像素化（64 色 kmeans，边缘加深减弱） |
| `portrait_clean.py` | `portrait_clean.py <in> <out.webp>` | 立绘 alpha 边缘清理：去低 alpha 杂点、边缘颜色用内部颜色外扩替换（去深褐晕边）、裁切缩放 ≤480×640 |
| `lrcheck.py` | `lrcheck.py` | 生成 `review/lr_check.png`：每张 `s_*` 的 l/r 行首帧放大并排，用于肉眼检查左右是否颠倒 |
| `lrauto.py` | `lrauto.py` | 按头部肤色质心自动判断 l/r 行朝向，输出疑似 `SWAP?` 的表 |
| `swaplr.py` | `swaplr.py <sheet.webp…>` | 原地交换表的第 1(l)/2(r) 行 |
| `review.py` | `review.py` | 生成 `review/bright_compare.png`（A/B/C/D 四方案对比）、`review/walk_frames.png`、`review/walk_hero.gif` |

### rembg

本仓库的脚本**均未使用 rembg**（去背全部是洪泛法）；环境中也未安装 rembg。姊妹项目 `/home/user/juesheng/tools/process-sprites.py` 使用 rembg（`pip install rembg`，可 `REMBG_MODEL=birefnet-general`）。若重出的角色/立绘底色不纯白、洪泛去背吃掉浅色衣物，可先用 rembg 抠图得到透明 PNG，再进入本管线（`split.py` 的白色洪泛对透明底无副作用）。

## 4. 完整重建顺序

```bash
cd /home/user/xiaojianghu
# 0) 出图（串行；HY_IMAGE_KEY 已设置）
python3 /home/user/juesheng/tools/hy_image.py batch j_chars.json raw2
python3 /home/user/juesheng/tools/hy_image.py batch j_maps.json  raw2
python3 /home/user/juesheng/tools/hy_image.py batch j_por.json   raw2
python3 /home/user/juesheng/tools/hy_image.py batch jobs_bg.json raw

# 1) 背景 / 地图 / 立绘 / 图标
python3 process.py                         # raw/bg_* → assets/bg_*
python3 pixmaps.py                         # raw2/m_* → assets/m_*
python3 tools_bright/pix_bright.py raw2/m_street.png assets/m_street_bright.webp
python3 street_layers.py --fg              # 然后把 raw_street/street_layers.js 贴进 story.js 末尾
python3 portrait.py                        # raw2/p_* → assets/p_*（原图备份在 assets/review/p_orig/）
for c in hero monk soldier gossip oldman smith lady beggar boatman bandit chief; do
  python3 tools_bright/portrait_clean.py assets/review/p_orig/p_$c.webp assets/p_$c.webp; done
cp assets/review/p_suzhi_alt_37.webp assets/p_suzhi.webp   # 苏芷：选定的候选图（当前为 37）
python3 icons.py

# 2) 角色表
python3 split.py                           # raw2/c_* → frames/
python3 export.py                          # frames/ + framemap.json → assets/c_*_{d,l,r,u}
python3 process_walk.py                    # → assets/c_*_{d}_{0..3}
python3 pack.py                            # → assets/s_*.webp + ART.sheet（随后补回 suzhi 条目）
python3 tools_bright/suzhi_sheet.py        # → assets/review/s_suzhi.webp
cp assets/s_{hero,monk,…}.webp assets/review/   # 未补五官的原表作为后续脚本输入
for f in assets/review/s_*.webp; do python3 tools_bright/face.py $f assets/$(basename $f); done
python3 tools_bright/sidewalk.py assets/s_*.webp   # 按需：侧面双腿
python3 tools_bright/bright_sprites.py hero monk soldier gossip oldman smith lady beggar boatman bandit chief villager child merchant dog rooster snake wolf suzhi
# 主角/苏芷的 s_{c}、走/跑/待机表：工作流 K 管线（会覆盖上面几步对 hero/suzhi 的产物）
python3 tools_fx/rig/explore.py build hero suzhi   # 需先有 raw_anim/explore/<c>/ 的定妆图、条带与 qa.json（见 anim-pipeline.md §6.6）
python3 tools_bright/lrcheck.py            # 检查 review/lr_check.png；必要时 swaplr.py
```

> 上述顺序是根据各脚本的输入/输出路径推断的；`face.py`/`sidewalk.py` 在历史上是逐个角色手工运行的，是否对每张表都执行过无记录。walk/run 表修改后需手工核对 `ART.walk/ART.run` 的 `cell`（脚本会打印单元尺寸）。

## 5. 已知美术问题

| 问题 | 说明 |
|---|---|
| 说书老伯（oldman）脸部 | 像素化后五官不清，`face.py` 补点效果不理想 |
| 奔跑侧视图 | （已解决）主角/苏芷的走/跑改由工作流 K 的 Q 版白模管线生成，`walk.py`/`run.py` 仅用于其他角色 |
| 探索滑步 | 探索移动速度（每秒约 2.2 个身高）远超 Q 版腿长能支撑的步幅，侧视仍有滑步；取舍见 `anim-pipeline.md` §6.4 |
| 商人（merchant）左右 | l/r 行朝向疑似颠倒（`lrauto.py` / `lrcheck.py` 检查，`swaplr.py` 修正后需重生成 `_bright`） |
| 苏芷立绘 | 当前 `p_suzhi.webp` 与候选 37 相同；候选 37/58/74 在 `assets/review/` 待定 |
| 旧版 5 图（庙/庙外/城门/寨门/山洞） | 仍是早期整图像素化版本（无明亮版、无前景遮挡层）；2026-09 已补精确碰撞 mask（`tools_scene/masks.py`）。按 v2 管线重建前，柱子/树干等「挡在角色前面的东西」只能靠把其后方设为不可走来避免穿模 |
| v2 素材 | 生图模型画的是正立面偏俯视（建筑前立面 + 屋顶），与角色一样是「3/4 俯视的约定」；同一图里不同素材的像素密度略有差异（按目标宽度缩放）。`paifang`（牌坊）、`bridge`（石拱桥）、`pawnshop` 招牌带「当」字 已生成但当前布局未用或仅作点缀 |


## 立绘 v2（gpt-image-2.5 统一生成）

v1 厚涂立绘 AI 感重、构图不一，已全部替换。新管线：

- **生成**：`python3 tools_por/gen_por.py [角色...]` → `raw_por/p_*.png`。走 FlatRouter 异步生图（`tools_common/flatimg.py`，见下文「FlatRouter 生图客户端」；默认 ≤3 并发，`-j N` 调整），密钥在 `tools_por/.env`（`FLATROUTER_API_KEY` / `FLATROUTER_BASE_URL`，勿外传）。所有角色共用 `PARAMS` + `STYLE`，只替换 `CHARS[k]` 的角色描述；每次生成的完整参数与提示词记录在 `raw_por/params.json`。已存在的输出跳过，`--force` 覆盖。
- **统一参数**：`gpt-image-2.5-sunburst`、`1024x1536`、`quality=high`、`background=opaque`、`png`。flare 画风相近但慢约 2.5 倍。该模型的 `background=transparent` 不生效，会画出假透明棋盘格，所以用纯白底。
- **画风**：国画工笔白描 + 淡彩平涂（矿物色、墨线顿挫），明确禁止厚涂/轮廓光/CG 光泽；构图为腰部以上 3/4 侧身、左右留白、手臂不裁切。
- **后处理**：`python3 tools_por/post_por.py [角色...]` → `assets/p_*.webp`。从上/左/右边缘洪泛近白像素去背（墨线闭合，不会吃白衣），另把大面积、纯白、无起伏的封闭留白（臂弯等）判为背景；边缘 3px 按与白混合反推 alpha 并反预乘去白晕；裁切缩放到 ≤480×640。
- **新增角色**：在 `CHARS` 里加一行描述，依次跑两个脚本即可。

### FlatRouter 生图客户端（`tools_common/flatimg.py`，异步接口）

所有 FlatRouter 生图脚本统一经此模块调用：`tools_por/gen_por.py`（立绘 + 表情差分）、`tools_fx/gen_battle_bg.py`（战斗背景）、`tools_fx/gen_battle_sprites.py`（旧敌人网格图）、`tools_fx/ui_gen.py`（水墨纹理）。`tools_fx/rig/genframes.py` 另有一份等价的异步实现。

- **不要再用同步接口**：`/images/generations`、`/images/edits` 的长连接在约 421s 被网关强制断开，高质量图大量断连重试。改用异步：`POST {base}/images/generations/async`（JSON）或 `/images/edits/async`（multipart，单图 `image`、多图重复 `image[]`、可选 `mask`）→ 202 `{task_id, poll_url}` → 每 3–5s `GET https://api.flatrouter.com{poll_url}`（尊重 Retry-After）直到 `completed` / `failed`，单任务最长 30 分钟。
- **下载**：完成时没有 `b64_json`，从 `image_url`（或 `result.data[].url`）下载，结果保留 24 小时；下载**必须带浏览器 User-Agent**，否则 Cloudflare 返回 1010。
- **并发**：账号级同时约 3 个任务，超出报 `Concurrency limit exceeded`；客户端进程内限 3 个在跑任务（`FLATIMG_MAX_INFLIGHT`），超限时自动退避重交（不计失败）。注意：多个脚本/工作流同时跑时共享这 3 个名额。
- **重试**：同一请求最多 2 次（任务 failed、超时、网络错误）；400/401/403/413/422 不重试。批量脚本单张失败不中断，末尾汇总。
- **模型**：`gpt-image-2.5-sunburst`（默认）、`gpt-image-2.5-flare`；密钥无 `gpt-image-2` 权限（403）。
- **API**：`generate(prompt, **params)`、`edit(images, prompt, **params)` → `Result(png, meta)`（meta：task_id / model / seconds / attempts / url / usage）；两段式 `submit_generate` / `submit_edit` + `wait(task)`；批量 `run_many(jobs, max_workers=3, on_done=...)`。详见模块 docstring。
- **实测（2026-09-28，sunburst，1024² low）**：generations 26s、edits 单图 39s、edits 多图 `image[]`（2 张）23s，三个并发提交总 39s；立绘差分（1024×1536 high edits）58s。注意 1024² 请求实际返回 1254×1254，后处理不要假设输出尺寸等于请求尺寸。

### 表情差分（男女主）

- **生成**：`python3 tools_por/gen_por.py hero:all suzhi:all`（或单张 `suzhi_shy`）。以 `raw_por/p_{角色}.png` 为参考图走 edits（异步 `/images/edits/async`），提示词 = `VARIANT_BASE`（锁定同脸同装同构图）+ 表情/手势描述 + 原 STYLE 与角色描述；清单在 `gen_por.py` 的 `VARIANTS`。输出 `raw_por/p_{角色}_{表情}.png`，再 `post_por.py` 转 `assets/p_{角色}_{表情}.webp`。
- **清单**：hero = smile / angry / surprise / think / hurt / battle；suzhi = smile / shy / angry / worry / surprise / battle。叶蘅 = smile / shy / angry / worry / surprise / battle / hurt，采用内置生图及[独立提示词](design/ye-expression-prompts.md)，不走此处的 FlatRouter `VARIANTS`。新增运行时表情均需在 `js/core.js` 的 `EXPR` 登记。
- **运行时**：`EXPR` 中的差分在 `loadAll()` 开头后台加载，不计入进度条。对话 `say/choose` 的 `sp` 写作 `'c_suzhi:shy'`（story.js 里用 `SE('shy')` / `HE('think')`），缺图回退基础立绘；同一说话人仅换表情时不重播入场动画。战斗卡片 `porKey()`：默认 `battle`，气血 <30% 换 `hurt`（无则 `worry`）。
- 苏芷 v2 基准图重做过（药囊改为宽布背带斜挎、贴腰胯承重），旧基准原图在 `raw_por/suzhi_v1/`。


## 场景管线 v2（`tools_scene/`，2026-09）

「程序定结构、生图给外观」（与 [anim-pipeline.md](anim-pipeline.md) 同一原则）：建筑、树、摊位、杂物用生图模型**单独**生成为素材，程序按布局表拼成底图，并由素材的「占地」自动算出**精确碰撞 mask**；地面（石板、泥地、草地、水面、木栈桥、院墙）全部程序绘制。整图生成的地图碰撞只能手标、总有「走到屋顶/墙里」的漏网之处，且改布局就得重画——这是改用拼装的原因。

| 脚本 | 用法 | 说明 |
|---|---|---|
| `gen_props.py` | `python3 tools_scene/gen_props.py [key…] [--force] [--noref]` | 生成 `PROPS` 表里的素材 → `raw_scene/props/<key>.png`（参数/提示词记录在 `params.json`）。走 `tools_common/flatimg.py` edits 接口，**以 `raw_scene/style_ref.png`（旧街市明亮地图裁切 ×3）为风格参考**，统一 3/4 俯视、黛瓦白墙、左上暖光、像素描边；品红 `#FF00FF` 纯色底（模型的透明底不可靠）。`sheet_*` 为多物件表（1536×1024，一张出 6–12 个小物件，保证彼此画风一致）。实测 sunburst 单张 30–60s，≤3 并发 |
| `cut_props.py` | `python3 tools_scene/cut_props.py [key…]` | 品红抠图（边缘连通的品红 + 任意大小的纯品红洞 → 透明；2px 内品红晕去色；物件内部偏紫的残留晕 → 透明）→ 去碎块 → 裁切，保持原分辨率 → `raw_scene/cut/<key>.png`；`sheet_*` 按连通块拆成 `<key>_<i>.png`（行优先编号，`<key>_index.png` 是编号预览） |
| `build_scene.py` | `python3 tools_scene/build_scene.py [street alley ferry]` | 按场景函数里的布局生成：`assets/m_<id>_v2.webp`（底图）、`assets/m_<id>_v2_props.webp`（图集）、`js/story.js` 末尾 `// <scene:<id>>` 数据块（gw/gh/bg/propImg/propK/mask/props，**自动替换，勿手改**）、`review/scene_v2/<id>_layout_dbg.png`（×2 调试图：绿=可走，红=占地，黄线=排序底边，青点=锚点，蓝框=出口）、`raw_scene/<id>_anchors.json`（布局里命名的锚点格坐标，供 story.js 摆 NPC/出口） |
| `masks.py` | `python3 tools_scene/masks.py [scene…]` | **已退役**（2026-09 S1 五图改为程序排布；重跑会往 story.js 追加旧 mask 块，勿用）。原用途：旧版 640×360 地图（庙/庙外/城门/寨门/山洞）的精确 mask：手标可走多边形 `walk`、障碍 `block`（矩形/椭圆/多边形）、出口保留区 `keep`；自动封掉画面外沿 6px → `// <mask:<id>>` 数据块 + `review/scene_v2/mask_<id>.png` |
| `contact.py` | `python3 tools_scene/contact.py out.png a.png b.png …` | 素材预览拼图 |

### 布局表（`build_scene.py` 的场景函数）

- 坐标一律是**源像素**（世界 = ×3，格 = 世界/40）；地图宽高须为 40 的倍数（街市 880×520 = 66×39 格）。
- 地面：`S.rect/region(poly, mat)` 设材质（1 石板、2 广场大石板、3 水面、4 草地、5 木栈桥、6 土路；缺省泥地）→ `S.paint_ground()` 程序铺装（石板逐块随机色、上沿受光下沿阴影、裂纹苔草；石板与泥地交界自动加路缘；水面横向波带 + 高光；泥地石子/杂色），之后可 `S.backwall()`（矮院墙）、`S.pier()`（木栈桥）、`S.tufts()`（草丛）。
- **编排先看设计**：新场景先查[势力与世界](design/world.md)、[生活与外出](design/life.md)及[表现规范](design/presentation.md)；场景函数仍须写明功能分区、动线、物件来由与出入方向。
- 素材：`S.place(key, x, base, width, fp=…, sort=…, crop=…, flip=…, shadow=…, cx=…, weather=…)`（`weather` 0~1 做旧：去饱和 + 压暗，用于兵火废宅）：`base` 为素材底边 y（触地线）；`width` 为目标宽度（源像素，决定像素密度：主角约 31 源像素高、门洞约 35–45）。缩小用预乘 alpha 的 BOX（避免品红渗色）+ 每素材 40 色量化 + 硬 alpha。
  - `fp` 占地（不可走）：`band:D` 触地列 × 底部 D 高（D≤1 为比例，建筑取 0.5–0.62）、`cols:D` 只挡各触地段（柱脚/架子腿）、`trunk` 树干小椭圆、`solid` 每列从素材顶到最低像素（城墙/残墙）、`rect:x0,y0,x1,y1`（素材局部比例，`rect:0,0,1,1` = 整块，用于靠墙/靠水、背后不该钻进去的亭子/草屋）、`none`，可用 `|` 组合。
  - **小型家具**（`sheet_props/stalls/alley/war`、码头杂物）用 `band` 时占地自动向下多留 `FURN_MARGIN`=2 源像素（6 世界像素），桌凳/摊架建议直接 `rect:0,0.1~0.3,1,1.05` 盖住整个触地面；NPC 站位离家具 ≥10px（audit 检查）。
  - `sort`：缺省 = 底边；门楼这类两侧马道坡脚比正面墙脚低的素材，`sort` 取「正面墙脚 − 底边」（城门楼 `gt['sort']=gy-base`），否则站在门洞前的人会被整座门楼盖住（"被吞"）；`'flat'` = 永远在人物之下且不进运行时图集（远景、船、地席）；数值 = 底边偏移（戏台 -24：台面上的说书人画在台子前）。
  - `shadow`：`drop`（下半部右下偏移投影）、`small`、`tree`（树冠椭圆影）、`none`。
- 可走区 = `walk_rect/walk_poly` 并集 − 全部占地 − `block_rect` + `force_rect`（强制可走）。**门洞/院门不要做成可走**：3/4 视角里拱券是素材图像的一部分，人走进去必然被整张素材盖住；要穿门就把门做成地图边上的出口（走出淡出，见 architecture.md §5），或像街市北门那样封住并用军士/拒马说明原因。
- **不会挡住走路的人**是布局约束，脚本不自动检查：街面以南的东西（院墙后杂物、南排屋顶）顶端不能伸进街面；中排建筑高度 ≤ 与北巷的间距。放高物件前先看调试图的黄线。

### 已生成的素材（`raw_scene/props/`）

建筑：`shop_a`（两层商铺）`shop_b`（杂货铺）`inn`（酒楼）`smithy`（铁匠铺）`medicine`（药铺）`cloth_shop`（布庄）`pawnshop`（当铺）`teahouse`（茶棚）`storystage`（说书台 + 条凳，布局里裁成台子与单条凳）`gate_tower`（城门楼 + 马道，左右两端平直墙段裁出来交替镜像平铺成整段城墙）`residence`（民居）`court_gate`（院门 + 白墙）`hut`（草屋）`hut_b`（破瓦房）`ruin_wall`（残墙）`paifang`（牌坊，未用）`bridge`（石拱桥，未用）`sampan`（乌篷船）`junk`（货船）。
物件表：`sheet_trees`（垂柳/槐/小树/桃/竹/灌木）`sheet_stalls`（菜/果/布/包子/糖葫芦/陶器摊）`sheet_props`（井/水缸/木桶/货箱/推车/长凳/桌凳/石狮/灯笼柱/草垛/竹筐/拴马石）`sheet_alley`（鸡舍/柴垛/土地庙/石磨/晾衣架/破车/竹篱/瓦砾/腌菜缸/晒菜席）`sheet_river`（芦苇×2/系船桩/晒网架/麻袋/货箱/缆绳/倒扣小船/渡口旗/垂柳）`sheet_war`（2026-09 v3：大/小拒马、砖垛、木料堆、榜文告示牌、挑夫货担、兵器架、沙袋）。
**S1（2026-09，旧 5 图重建）**：`temple_wall`（殿内北墙）`temple_shrine`（神龛羊祜坐像 + 供桌）`temple_hall`（庙正殿外观）`gate_south`（南门城楼 + 城墙外侧）`moat_bridge`（吊桥）`bandit_gate`（寨门 + 两望楼）`palisade`（木寨墙）`cave_wall`（山洞北壁）；物件表 `sheet_temple`（殿柱/吊锅篝火/草铺/矮几/蒲团/旧木箱/柴垛/水缸/碎瓦断椽/铜香鼎）`sheet_mount`（松/柏/断碑/药炉/石香炉/石灯/山石×2/枯树/石墙/菜畦/晾药架）`sheet_gate`（哨棚/军旗/盐车/栅栏/里程碑/挑箱/茶棚/饮马槽）`sheet_bandit`（火盆/草棚/酒坛/兽皮架/警示牌/松/大石/砍柴墩/柴堆/枪架）`sheet_cave`（虎皮交椅高台/火盆/长桌/长凳/兵器架/酒坛/账桌/赃物箱笼+山川图（同一连通块，用 `crop` 上下裁开）/草铺/钟乳石/铁箍旧箱）。
  - `gen_props.py` 的 `PROPS` 可带 `setting`（`temple`/`mountain`/`bandit`/`cave`）替换 STYLE/SHEET 里写死的"城市街市"设定句；光向、像素风、品红底不变。夜景一律由运行时 `dark/lights` 实现，素材画白昼光。
  - 工作流 F（渡江）：`build_scene.py crossing ferry_e`；新增地面材质 11 江滩湿泥；`S.clear_mat` 让该材质处底图透明（渡船场景只烘焙船，江面由运行时 `SC.crossing.under()` 画在底图之下并卷动，`js/scene.js` 支持 `sc.under(t,dt)` 与 `sc.noFollow`）；`crossing` 另出运行时贴图 `m_crossing_far.webp`（远岸条带/快船/江面波纹，横向无缝），坐标写进 `<scene:crossing>` 块的 `SC.crossing.far`；渡船 `BOAT_W=260` 三个场景共用。
  - `build_scene.py` 新增：地面材质 7 洞内岩地、8 殿内方砖、9 岩体/暗处、10 墙顶；`S.rock_rim()` 岩脚；`place(..., h=)` 非等比缩放（柱身、吊桥）；`pillar()` 柱础等比 + 柱身拉伸。
  - 场景可写 `mapIn`（大地图入场落点，`scene.js goScene` 替换 NODES 的 at）与 `intro`（开场运镜，`scene.js snapCam/updateCam`）。

### 新增 / 修改一个 v2 场景

1. 缺素材就在 `gen_props.py` 的 `PROPS` 加一行描述 → `gen_props.py key` → `cut_props.py key`（表格类看 `_index.png` 确认编号）。
2. 在 `build_scene.py` 写/改场景函数（地面 → 素材 → 可走区 → `S.exits`/`S.anchor`），跑 `build_scene.py <id>`，看 `review/scene_v3/<id>_layout_dbg.png`。
3. `js/story.js` 里该场景：`bg:'m_<id>_v2'`、`gw/gh`、`start/startDir`、NPC/出口/路人坐标（用 anchors.json 的格坐标）；出口写明 `dir`（与相邻场景方向一致，02 §3）；**改版时把 `mapv` 加 1 并写 `migrate(x,y,旧版本)`**（旧存档坐标换算，见 architecture.md §5）；`js/core.js` 的 `ASSETS` 加 `m_<id>_v2`、`m_<id>_v2_props`。
4. `node tools_scene/audit.cjs review/scene_v4/audit <id>` 复查（见 testing.md §2），`node tools_scene/exit_frames.cjs review/scene_v3/exits <id>` 看出口切换连续帧。
