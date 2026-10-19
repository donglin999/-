/* 特效量化（2026-10-11）：在评审页 review/combat-av-v1/kitfx.html 里逐帧跑每个特效，统计可比较的指标。
 * 用法（浏览器控制台或自动化）：await import('/tools_fx/fx_metrics.js') 之后 await FxMetrics.run()，结果在 FxMetrics.rows。
 * 口径：单体目标、蓄势 0、随机种子 7、步长 16ms；覆盖率每 32ms 采一次，取 front+back 两层不透明像素占 640×360 舞台的比例。
 * 指标：dur 时长；beats 节拍（once 事件数）；assets 素材种类；imgDraw 素材绘制次数；pops 短时素材实例数；
 *       parts 粒子总数；peak 同屏粒子峰值；kinds 粒子种类；covPeak 覆盖峰值；covMean 全程平均覆盖；active 有画面的时长；
 *       shake 最大震屏；flash 闪白强度合计；zoom 最大推镜幅度；tint 最大压暗；prims 运行时光带、线、辉光等原语调用数。
 */
(() => {
  const W = 640, H = 360;
  function measure(fx, id) {
    const m = { id, beats: 0, assets: new Set(), imgDraw: 0, pops: 0, kinds: new Set(), shake: 0, flash: 0, zoom: 0, tint: 0, prims: 0, covPeak: 0, covSum: 0, covN: 0, active: 0 };
    const orig = {};
    const wrap = (k, f) => { orig[k] = fx[k]; fx[k] = function (...a) { f(...a); return orig[k].apply(this, a) } };
    wrap('img', (l, i, x, y, o = {}) => { if ((o.a ?? 1) > .01) { m.assets.add(String(i).split('@')[0]); m.imgDraw++ } });
    wrap('pop', () => { m.pops++ });
    wrap('spawn', o => { m.kinds.add((o && o.kind) || 'px') });
    wrap('shake', n => { m.shake = Math.max(m.shake, n) });
    wrap('flash', (c, a) => { m.flash += a });
    wrap('once', (k, cond) => { if (cond && !fx.fired.has(k)) m.beats++ });
    for (const k of ['beam', 'gline', 'line']) wrap(k, () => { m.prims++ });
    fx.group = 0; fx.play(id, 7, { bp: 0 });
    const sk = fx.skill, M = fx.M;
    let n = 0;
    for (let t = 0; t < sk.dur; t += 16) {
      fx.update(16); fx.render();
      if (fx.zoom) m.zoom = Math.max(m.zoom, Math.abs(fx.zoom.s - 1));
      if (fx.tint) m.tint = Math.max(m.tint, fx.tint[1]);
      if (n++ % 2 === 0) {
        let c = 0;
        const a = fx.cx.front.getImageData(M.x, M.y, W, H).data, b = fx.cx.back.getImageData(M.x, M.y, W, H).data;
        for (let i = 3; i < a.length; i += 16) if (a[i] > 24 || b[i] > 24) c++;   // 每 4 像素采 1 个
        const cov = c / (W * H / 4);
        m.covPeak = Math.max(m.covPeak, cov); m.covSum += cov; m.covN++;
        if (cov > .004) m.active += 32;
      }
    }
    for (const k in orig) fx[k] = orig[k];
    return { id, name: sk.name, grade: sk.grade, set: sk.set, dur: sk.dur, beats: m.beats, assets: m.assets.size, imgDraw: m.imgDraw, pops: m.pops, parts: fx.used, peak: fx.peak, dropped: fx.dropped,
      kinds: m.kinds.size, covPeak: +(m.covPeak * 100).toFixed(2), covMean: +(m.covSum / Math.max(1, m.covN) * 100).toFixed(2), active: m.active,
      shake: m.shake, flash: +m.flash.toFixed(2), zoom: +m.zoom.toFixed(3), tint: +m.tint.toFixed(2), prims: m.prims };
  }
  window.FxMetrics = {
    rows: [], done: false,
    async run(ids) {
      const fx = window.SkillReview.fx; this.rows = []; this.done = false;
      ids = ids || Object.keys(window.WuxiaSkills);
      for (const id of ids) { try { this.rows.push(measure(fx, id)) } catch (e) { this.rows.push({ id, error: String(e) }) } await new Promise(r => setTimeout(r, 0)) }
      this.done = true; return this.rows.length;
    }
  };
})();
