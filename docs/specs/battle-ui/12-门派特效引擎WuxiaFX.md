# 12 门派特效引擎 WuxiaFX（faction-fx）

源文件：`js/faction-fx/wuxia-fx.js`（675 行，类 `WuxiaFX`、`add`/`addV4`/`kitDef`/`tinted`），`js/faction-fx/fx-am.js`、`fx-gj.js`、`fx-qihe-clash-v2.js`（用 `WuxiaFX.define` 注册）。
定位：**只负责表现**，不结算伤害、不播声音（`fx.quiet=true`）；伤害、音效、震屏合并由交锋层（13 节）负责。

## 12.1 坐标与图层
- 常量：`W=640,H=360,GS=4,TAU=2π,ANG=48`。特效像素空间 640×360，整数放大到舞台。
- overlay 模式（战斗中用 `new WuxiaFX(null,{overlay:true})`）：四周留白 `M={x:200,y:120}`，所以画布实际是 (640+400)×(360+240)。每帧先 `clearRect`，再 `setTransform(1,0,0,1,M.x,M.y)`。
- 图层：`back`（人物后）、`front`（人物前）、`ui`（数字/标签），外加辉光层 `g`，尺寸是 1/GS。辉光层用 `blur(8px)`，合成方式 `lighter`。
- 贴入战斗画布：`drawBackInto(ctx,960,540)` / `drawFrontInto(ctx,960,540)`。闪白 alpha 乘 0.6，压暗(tint) alpha 减半。
- 抖动：8×8 Bayer 表 `B8`（值为 `(v+.5)/64`），用 `dth(x,y)=B8[(x&7)+((y&7)<<3)]` 做像素级半透明阈值。
- 随机数：`rng(seed)`，mulberry32 变体；`play(name,seed)` 决定种子，所以同一个种子每次演出完全相同。

## 12.2 色带 RAMP（六阶：0 描边暗 → 3 主色 → 5 白芯）
| 键 | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| jade | #0c2e2e | #175450 | #2f8f7a | #58c9a4 | #a6f0d2 | #effff8 |
| sky | #121f3c | #24497a | #3f7fbf | #78bfe8 | #c2eaff | #ffffff |
| gold | #2e1608 | #7a4218 | #c47a26 | #eeb64e | #ffe39a | #fffbea |
| mist | #3d4f5c | #6c8494 | #9db4c2 | #cddde5 | #eef6f8 | #ffffff |
| dust | #221e1c | #3e3832 | #5e564c | #857a6c | #b0a492 | #d6cbb8 |
| red | #3a0c10 | #7a1e22 | #b8352e | #e05a4a | #f59a7a | #ffd0c0 |
| white | #40506a | #8a9ab8 | #c8d4ea | #e8f0fa | #f8fbff | #ffffff |
| fire | #5a1606 | #9a2c14 | #d8482a | #ff6a3d | #ffb08a | #fff0e6 |
| frost | #0e2a44 | #1e4f78 | #4c94c8 | #8fd8ff | #ccefff | #ffffff |
| thunder | #3a1a5a | #6a3a8a | #c79a3a | #ffe25a | #fff0a8 | #fffbe8 |
| wind | #0f3a2a | #1f6a4c | #3fae84 | #7fe3b5 | #c2f5dd | #f2fff8 |
| sun | #5a3200 | #8a5410 | #d89a32 | #ffc35a | #ffe3a6 | #fffbea |
| yin | #24184a | #43307a | #7a62c8 | #b79cff | #dccfff | #f6f2ff |
| heal | #0e3a22 | #1f6a40 | #46b070 | #7fe0a0 | #c4f4d4 | #f2fff6 |
| plain | #3a2a1a | #6a5638 | #b8a888 | #fff3e0 | #fffaf0 | #ffffff |

由 `fx-qihe-clash-v2.js` 追加：`jiangqing` #1a0c1e,#3a1a3a,#2c5a78,#4f9ab8,#a8dcec,#f0fbff；`inkp` #0d0612,#24102c,#43204d,#6a3a76,#a675b0,#e2cbe6；`darkred` #160305,#3a0a10,#62161f,#8c2733,#b85660,#e2a4a6；`copper` #24100a,#552a14,#86481f,#b9733a,#e2a866,#f7dcb2。
墨色 `INK`：#05070c,#0d1220,#182036,#253150,#3a4a6e,#6b7ea6,#b9c8e6。

## 12.3 缓动与工具（`WuxiaFX.lib` 导出）
- `clamp(v,0,1)`；`lerp(a,b,k)`；`win(t,a,b)=clamp((t-a)/(b-a))`（时间窗 0→1，**所有时间轴都用它**）。
- `out3=1-(1-k)^3`；`inout`：k<.5 时为 `4k³`，否则 `1-(-2k+2)³/2`；`back=1+2.7(k-1)³+1.7(k-1)²`；`accel=.07k+.93k^3.6`（前段慢，末段骤然加速）。
- `quad(p0,p1,p2)` 返回 `k→[x,y,ang]` 的二次贝塞尔路径；`fly(fx,layer,id,path,k,{sc,echo=2,gap=.06})` 带残影，残影 alpha 为 `.38/i`。
- `strike(fx,x,y,ang,{ramp,L=40,w=4,power,num,hit=90,shake=2,flash})`：剑痕 + 光爆半径 `9+P*5`，`hit('white',hit*.6)`，加 shake 和可选闪白（`RAMP[ramp][4]`，140ms）。粒子：streak `20P` 道（速度 90+220√P，drag 3.2）、像素 `16P` 个、碎片 `6P` 片、星芒 `ceil(2.5P)` 颗。
- `hurt(fx,x,y,num,ramp,{sc=.9,status,shake=2,hit=90})`：系数 `K=1+.15*bp`，伤害数字 `round(num*(1+.25*bp))` 画在 y-40；有状态时在 y-58 显示标签，存活 1000ms。
- `drawHits`：光爆显示 160ms；剑痕长度在 45ms 内伸满，按 4px 取整；split 型在 120ms 后向两侧分开（速度 .06px/ms），前 90ms 额外画一条辉光线，宽 w*3。`ripple` 涟漪：ring 半径 `8+rx*out3(k)`。
- 数字：5×7 像素字 DIG/PLUS，分三遍画（描边 #0a0610 → R[1] 阴影 → R[5]/R[4]/R[3] 主体），上浮 `out3·22`，k>.72 后开始淡出。

## 12.4 实例 API（`WuxiaFX` 类）
- `static load(base)`：读取 `base+'manifest.json'`，`{id:{w,h,blend,…}}`，生成 `IMG[id]={img,w,h,add}`（add 由 blend 决定，加法混合用 `lighter`）。
- `play(name,seed,{bp})`：粒子预算 = `budget×(1+.2bp)`；`spawn(o)` 超出预算就丢弃并 `dropped++`。粒子默认值：`life:500,kind:'px',layer:'front',add:true,ramp:'gold',size:1`。
- `update(dt)`：阻力按 `v*=exp(-drag·s)`；`shakeAmt` 每毫秒减 0.03。
- `img(layer,id,x,y,{a,add,rot,sx,sy,ax=.5,ay=.5,clip})`：坐标取整后平移；`clip:[c0,c1]` 是横向显隐比例（裁剪矩形 `-w*ax+c0*w`，宽 `(c1-c0)*w`，高 `h+4`）。**放大**：技能有 `boost` 且素材 id（`@` 之前的部分）不在 `noBoost` 里时，sx、sy 都乘 boost。
- `pop(id,x,y,{life=400,delay,sc:[s0,s1],a:[a0,a1],vx,vy,rot,spin,flip,ease=out3})`：短时素材实例。
- `once(key,cond,fn)` 只触发一次；`flash(col,a,ms)`；`gdot(x,y,r,col,a)` 在辉光层画径向渐变点（半径 r/GS）；`fx.tint=[col,a]` 整屏压暗。
- `fx.A.hand/foot/target/ground`、`fx.targets()`、`fx.allies()`：由宿主写入（见 13.2）。`chest(fx)=targets()[0]`，`mid(T)` 取均值。

## 12.5 招式定义格式
`{grade,name,dur,budget,ramp,lead,hitAt,side?:'ally',group?,boost?,noBoost?,leadAura?,init(fx),update(fx,t,dt),draw(fx,t)}`。`add` 对应 v2 剑法套，`addV4`/`WuxiaFX.define` 对应 `set:'v4'`。`WuxiaFX.assetDirs` 登记各门派素材包。
