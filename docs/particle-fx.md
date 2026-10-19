# 通用粒子特效驱动

状态：现行　最后核对：2026-10-19

现行实现：模拟与绘制（`js/particle-fx.js`，已随旧原型移入 _attic，不作参考）、四组预设（`js/particle-presets.js`，已随旧原型移入 _attic，不作参考）。当前重点是复用粒子能力，暂不制作复杂龙形。目标质感继续参考[用户视频](design/skill-vfx-reference.md)。

## 运行样例

项目根目录执行 `python3 tools_fx/serve_combat_av_review.py --port 8767`，打开[粒子评审页](http://127.0.0.1:8767/review/combat-av-v1/particles.html)。金色爆发、青色流光、紫色旋聚、金色落雨共用同一引擎；支持重播、清空、密度、半速、声音和辉光开关。

## 分层与接口

- `ParticleFX.Engine`：独立模拟，不依赖 DOM、角色、伤害或音频；`play` 返回实例 ID，`update(deltaMs)` 推进，`stop(id,{immediate})` 停发／立即清空指定实例，`reset()` 清空全部。`stats` 提供活跃、回收和超额丢弃数。
- `ParticleFX.CanvasRenderer`：像素主体与局部辉光分开合成，支持正常／加色混合、拖尾、颜色与透明度衰减。`draw(engine,ctx,{width,height,layer})` 可按 `back/front` 分层绘制。
- `ParticlePresets`：仅存技能配方；不直接操作人物和游戏状态。新技能优先组合配方，不往引擎添加招式名称判断。
- 战斗适配：`VFX.playParticles(preset,u,t,options)`、`VFX.stopParticles(id,options)`、`VFX.particleStats()`；使用已有 `BT` 时钟，顿帧时粒子暂停，`VFX.reset()` 自动清理。目前战斗适配统一前景合成；独立预览演示了角色前后分层。2026-10-01 已通过 `skill-polish.js` 在现有技能施法／命中时叠加强化层；原轮廓与战斗逻辑保留，详见[强化方案](design/skill-polish.md)。

```js
const id = VFX.playParticles('impact', attacker, target, {
  seed: 73,
  onEvent(event) {
    // 在这里接已有音效、受击表现；驱动本身不造成伤害。
    if (event.name === 'impact') handleImpactPresentation(event);
  }
});
// 中断招式或离开战斗：
VFX.stopParticles(id, {immediate: true});
```

`origin/target/ground/sky` 为命名锚点，可以是 `{x,y}` 或返回坐标的函数。战斗适配自动提供单位中心、目标中心、脚底及目标上方坐标，包含动作偏移。外部自定义坐标使用 640×360 特效坐标系。发射时读取位置，已发出的粒子保持世界空间运动。

## 配方字段

```js
{
  budget: 650, // 本次技能累计发射上限，多个发射器共用
  events: [{at: 380, name: 'impact', data: {sound: 'punch'}}],
  emitters: [{
    at: 380, burst: 120, // 一次爆发；持续发射用 duration、rate
    anchor: 'target', shape: 'point',
    speed: [50, 240], spread: Math.PI * 2,
    life: [200, 750], size: [1, 3], endSize: 0.2,
    acceleration: [0, 110], drag: 1.6, trail: 7,
    colors: ['#fff9da', '#ffb93f', '#82513c']
  }]
}
```

| 类别 | 字段与单位 |
| --- | --- |
| 时间 | `at/duration/life` 毫秒；`rate` 每秒粒子数；事件只触发一次 |
| 形状 | `point/ring/disc/line`；`radius` 半径，`aspect` 椭圆纵横比，`offset` 局部偏移；线形使用 `to` 锚点与 `jitter` |
| 初速 | `speed` 像素/秒、`angle/spread` 弧度；标量或二元随机范围 |
| 力场 | `acceleration` 像素/秒²、`attract/swirl` 径向／切向加速度、`forceAnchor` 力场中心，`drag` 每秒阻尼 |
| 外观 | `size/endSize` 像素、`colors` 寿命色阶、`fadeIn/fadeOut/alpha`、`trail` 历史点数量（最多16）、`glow/glowSize`、`blend:normal`、`layer:back/front` |

## 时间、性能与清理约定

固定 120Hz 模拟、带种子的随机数；同配置与输入时间在不同绘制帧率下保持一致。每次 `update` 最多接收250ms，超长停顿丢弃额外现实时间，避免恢复瞬间大量补发；技能内部事件随模拟时间触发，不能用独立墙钟替代。事件精度为一个模拟步长约8.33ms。

默认全局最多1800活跃粒子、24个效果，另有每行动总预算；超出丢弃并计数。粒子对象回收复用，不创建每粒子定时器。拖尾数组仍有轻量分配，尚未针对低端手机做性能验收。粒子是表现对象，不承担投射物碰撞和伤害结算。

验证：`node --test tests/particle-fx.test.cjs`，覆盖帧率一致、事件一次性、暂停、全局与行动预算、取消／重置、跟随锚点、配方不变及生命周期回收。浏览器验证四组样例、清空和绘制无异常。
