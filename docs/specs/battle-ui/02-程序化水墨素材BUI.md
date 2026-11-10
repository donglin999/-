# 02 程序化水墨素材（BUI 工具库）

源：`js/bui.js` 顶部 IIFE `window.BUI`。所有 UI 底图都在离屏 canvas 程序化生成、按参数 memo 缓存（`cache: Map`，键为类型前缀+参数 JSON），DOM 侧用 `toDataURL()` 当 CSS 背景。Godot 建议：同参数生成一次 `ImageTexture` 缓存；或离线烘焙成 PNG（参数固定，seed 固定，结果确定）。

## 常量
- `PR=2`：生成像素密度（逻辑尺寸×2）。`canvasL(w,h,pr)` 返回物理 `w*pr × h*pr`，记 `lw/lh` 为逻辑尺寸，绘制时按逻辑尺寸画。
- 颜色：`INK='#0d0806'` `PAPER='#eadcbc'` `CINNABAR='#b3261e'`。
- 字体：`FB="Ma Shan Zheng","ZCOOL XiaoWei","Noto Serif SC",serif`（主毛笔）；`FC="Zhi Mang Xing",…`（大字草书）；`FS="Noto Serif SC","Songti SC",serif`；CSS `--serif:"Noto Serif SC","Songti SC","STSong",serif`。
- 字体加载：`injectFonts()` 注入 Google Fonts（Ma Shan Zheng / Zhi Mang Xing / Liu Jian Mao Cao）；加载后 `fgen++` 并清除含 `§` 的缓存键（画布文字随字体到位重绘）。Godot：直接打包这三套 TTF，无需此机制。
- 颜色工具：`mix(a,b,t)` 线性插值；`lt(c,t=.45)`=与白混；`dk(c,t=.45)`=与黑混；`lum`=0.299R+0.587G+0.114B。

## 噪声
- `hs(x,y,s)` 整数哈希→[0,1]：`h=(x*374761393+y*668265263+s*1442695041)|0; h=imul(h^(h>>>13),1274126177); ((h^(h>>>16))>>>0)/4294967295`。
- `vn` 值噪声（smoothstep 插值）；`fbm=vn*.6+vn(×2.1,s+7)*.28+vn(×4.3,s+13)*.12`；`strSeed(s)`：h=7，h=(h*31+code)%100003。

## 笔毛模型 `inkA(s,n,t,hw,S,dry,len)`
s=沿笔长坐标，n=离中线距离，t=进度0..1，hw=半宽。v=|n|/hw；边缘 e=1+(fbm(s*.25,n*.25,S+3)-.5)*.34，t>.6 时 e+=(vn(s*.03,n*.5,S+9)-.5)*.9*(t-.6)；v≥e 返回0；a=min(1,(e-v)*hw/1.1)；飞白 st=.6vn(s*.02/len,n*.7,S+11)+.4vn(s*.065/len,n*1.5,S+17)，dz=dry*(smooth(.35,1,t)*1.1+smooth(.45,1.05,v)*.65)，a*=clamp((st-dz*.9)*9+.15)；返回 a*(.78+.22*vn(s*.05,n*.12,S+5))。

## `swash(w,h,o)` 墨迹横扫（最常用）
参数默认：seed=1,col=INK,a=.92,dry=.45,head=.07,tail=.4,tip=.7,thick=.84,wave=.08,tilt=0,len=1,rev(起笔在右)。逐列 t：head 段 p=.35+.65√(1-(1-q)²)；tail 段 p=1-q²·tip；中段1；p*=1+(vn(t*5,.5,S)-.5)*.22；半宽 hw=max(.5,h*thick/2*p)；中线 cy=h/2+(vn(t*2.2,4.5,S)-.5)*2h*wave+tilt*h*(t-.5)。像素 alpha=255·A·inkA。`halo` 参数：先画一层 seed+100、col=halo、a=haloA(默认.3)、thick+.14(≤.99)、dry+.15、tail+.06(≤.6) 的底笔，再叠主笔。

## 其他生成器
- `enso(sz,o)` 圆相：th=sz*.085，R=sz/2-th*.75，起角 a0=-2.2rad，跨度 span=5.85rad，dry=.5；粗细 t<.06 渐入、t>.55 收至 28%。
- `paper(w,h,o)` 宣纸：底色默认 `#e8dab8`，v=(fbm(.035)-.5)*26+(纤维噪声-.5)*12-边缘暗化((E-e)²/E*1.4, E=12)-随机斑点18；G×.95、B×.8。
- `rod(w,h)` 卷轴木轴：中段渐变 #24140a→#6e4220→#a8703a→#6a3e1c→#1a0e06；两端铜钮宽 h*1.2，渐变 #3a260c→#e6c67e→#b08a40→#3a2408，圆角 h*.35。
- `seal(t,w,h,o)` 朱印：底色 col(默认 CINNABAR)，四角抖动 ±min(w,h)*.03；字色 `#f7ecd6`，字体 FB；竖排(h>w*1.25)/单字(字号 min(w,h)*.8)/双字竖叠/横排；`frame` 画阳文框；最后边缘<1.4px 处噪声>.62 及随机>.86 的像素 alpha×.25（剥落）。
- `blot(ch,col,sz,o)` 墨点字徽：36 点不规则圆（半径抖 ±7%），径向渐变 lt(col,.18)→col(.7)→dk(col,.3)，描边 `rgba(12,7,4,.85)` 宽 max(.8,sz*.05)；字号 sz*.68，字色按亮度 >.5 用 #1a0f08 否则 #f6ead2；`dim` 叠 `rgba(40,34,28,.6)`。
- `coin(state,sz)` 铜钱(蓄势点)：off=[#3b2e22,#231a12,边#5c4a36]，on=[#e6b060,#9a6020,#ffe0a0]，use=[#fff4c0,#f0b030,#ffffff]；外圈+内圈 R*.74+方孔 R*.36；非 off 画 4 个 1.2px 小点。
- `pointer(col,sz,dir)` 笔触三角箭头，dir d/r/l，描边 1.2 `rgba(10,6,4,.9)`。
- `text(s,col,size,o)` 画布毛笔字：描边宽 max(3,size*.16)，先画阴影 `rgba(8,4,2,.55)` 偏移(size*.05,size*.08)，再 strokeStyle=o.edge(默认 #140905)，填充竖向渐变 lt(col,.35)→col(.55)→dk(col,.18)；缓存 >400 条清空。

## 头像裁切 `face(u,sz)`
- 立绘键：我方用 `porKey(u)`（表情差分），敌方 `p_<art>` 存在则用；裁切中心表 `FACE`：hero[.61,.2] hero_hurt[.62,.2] hero_smile[.6,.195] suzhi[.53,.2] bandit[.56,.155] chief[.55,.17] lady[.58,.16] monk[.52,.14] beggar[.58,.18] soldier[.52,.18] boatman[.57,.12] oldman[.56,.15] smith[.52,.17] gossip[.47,.19]；其他自动找肤色像素（R>150,R>G+8,G>B+5,R-B>35）。正方形边长 = 立绘高×0.235。底色 #efe4cc，高质量平滑缩放。
- 无立绘：`BART[art].faceCrop` 优先；否则第0帧不透明包围盒，人形取头顶 30% 身高正方形，兽类（dog|wolf|snake|rooster）取 min(H*.7,宽)；底色 #2a211a。
