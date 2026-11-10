// 小江湖·中档：短锋相照（丙）。按 pixelfx 流程以 melee/thrust、melee/sword-slash 为参考自写。
// 0–150ms 手边风青气旋聚；150–330ms 一束青锋自手中刺出、先缓后骤；330ms 命中：长四芒星、交叉剑痕、火星与光池；
// 同时身后被援护的同伴前立起一道青色半月护弧（卸力）；之后全部冷却、碎光飘散，950ms 收尽。
// 局部坐标：原点＝徐令仪握剑手，x 负向朝左（目标在左），单位＝1 特效像素（游戏 640×360 空间）。
import { Particles, Lights, P, Rng, fit, sparkle, clamp, smooth, ease, TAU, WHITE } from "../../core/index.js";

export const meta = {
  name: "Short edge (xjh)", desc: "短锋相照：青锋刺出命中＋同伴身前护弧。",
  tags: ["melee", "thrust", "xjh"], size: [410, 160], origin: [275, 85], duration: 0.95, loop: false, fps: 30, bg: "ground",
  options: { palette: ["#0f3a2a", "#1f6a4c", "#3fae84", "#7fe3b5", "#c2f5dd", "#f2fff8", "#ffffff"], sparks: ["#f2fff8", "#c2f5dd", "#7fe3b5", "#3fae84"],
    tx: -235, ty: 12, ax: 98, ay: 25, shapes: true, seed: 4 },
};
const T0 = 0.15, HIT = 0.33;

function longStar(p, x, y, L, k, C) {
  if (L < 1) return;
  for (const [dx, dy, len] of [[-1, 0, L], [1, 0, L * 0.7], [0, -1, L * 0.42], [0, 1, L * 0.42]])
    for (let d = 1; d <= len; d += 0.5) { const u = d / len; p.dot(x + dx * d, y + dy * d, u < 0.3 ? WHITE : u < 0.65 ? C[5] : C[4], u < 0.7 ? 1 : 1 - (u - 0.7) / 0.35); }
  p.px(x, y, WHITE); p.glow(x, y, 6 + L * 1.3, C[4], 0.35 * k); p.glow(x, y, 3 + L * 0.4, WHITE, 0.3 * k);
}

export function create(o) {
  const C = fit(o.palette, 7), Rg = new Rng(o.seed), ps = new Particles({ rng: Rg, ground: () => 40, sparks: o.sparks }), lights = new Lights();
  const TX = o.tx, TY = o.ty, AX = o.ax, AY = o.ay;
  const path = (u) => [TX * u, TY * u];
  let t = 0, struck = false, guard = false;
  return {
    update(dt) {
      t += dt;
      // 起手：风青细流向手边旋聚
      if (t < T0 && Rg.chance(0.7)) { const a = Rg.range(0, TAU), r = Rg.range(10, 22); ps.spawn(P.STREAK, Math.cos(a) * r, Math.sin(a) * r * 0.7, -Math.cos(a) * 90, -Math.sin(a) * 60, 0.14, C[Rg.int(3, 5)], 1); }
      // 刺出：锋头沿途甩下碎光
      if (t > T0 && t < HIT) { const u = ease.inCubic(clamp((t - T0) / (HIT - T0))), [x, y] = path(u);
        for (let i = 0; i < 2; i++) ps.spawn(P.MOTE, x, y + Rg.range(-2, 2), Rg.range(10, 40), Rg.range(-25, 15), Rg.range(0.2, 0.45), C[Rg.int(3, 5)], 0.6); }
      if (!struck && t >= HIT) {
        struck = true;
        lights.add(TX, TY, 46, C[3], 0.7, 0.35); lights.add(TX, TY, 14, WHITE, 0.8, 0.08);
        for (let i = 0; i < 14; i++) { const a = Math.PI + Rg.range(-0.8, 0.8), sp = Rg.range(160, 380); ps.spawn(P.SPARK, TX, TY, Math.cos(a) * sp, Math.sin(a) * sp - 40, Rg.range(0.12, 0.32)); }
        for (let i = 0; i < 12; i++) { const a = Rg.range(0, TAU), sp = Rg.range(30, 90); ps.spawn(P.MOTE, TX, TY, Math.cos(a) * sp, Math.sin(a) * sp - 10, Rg.range(0.3, 0.6), C[Rg.int(4, 5)], 0.6); }
      }
      if (!guard && t >= HIT - 0.04) { guard = true; lights.add(AX - 10, AY, 34, C[3], 0.45, 0.45); }
      ps.update(dt); lights.update(dt);
    },
    draw(p) {
      // 手边蓄光
      if (t < HIT + 0.05) p.glow(0, 0, 10 + 8 * clamp(t / T0), C[4], 0.45 * (1 - smooth(HIT - 0.05, HIT + 0.05, t)));
      // 青锋：从手到锋头的一束，越近锋头越亮越粗；命中后整束回缩冷却
      const u = t < T0 ? 0 : ease.inCubic(clamp((t - T0) / (HIT - T0))), tail = smooth(HIT, HIT + 0.22, t);
      if (o.shapes && u > 0 && tail < 1) {
        // 实心锋身（逐像素）：离锋头越近越粗，白芯→浅青→青→深青；尾部收成一线、随时间冷却
        const L2 = TX * TX + TY * TY, Wm = 5.5 * (1 - tail * 0.5);
        p.shade(Math.min(0, TX) - 8, Math.min(0, TY) - 10, Math.max(0, TX) + 8, Math.max(0, TY) + 10, (x, y, out) => {
          const v = (x * TX + y * TY) / L2; if (v < tail || v > u) return;
          const near = (v - tail) / Math.max(0.01, u - tail), w = Wm * (0.18 + 0.82 * Math.pow(near, 1.8));
          const d = Math.abs(y - TY * v) ; if (d > w) return;
          const q = d / w, ci = q < 0.2 ? 6 : q < 0.45 ? 5 : q < 0.75 ? 4 : 3;
          out.c = C[clamp(ci - Math.round(tail * 3) - (near < 0.3 ? 1 : 0), 1, 6)]; out.a = 1; });
        const [hx, hy] = path(u); p.glowLine(path(Math.max(tail, u - 0.3))[0], path(Math.max(tail, u - 0.3))[1], hx, hy, 8, C[4], 0.45 * (1 - tail));
        if (t < HIT) longStar(p, hx, hy, 10, 1, C);
      }
      // 命中：长四芒星＋交叉剑痕
      const h = t - HIT;
      if (o.shapes && h >= 0 && h < 0.3) {
        const k = 1 - h / 0.3; longStar(p, TX, TY, 26 * ease.outBack(Math.min(1, h / 0.05)) * k, k, C);
        for (const s of [-1, 1]) { const L = 20 * ease.outExpo(Math.min(1, h / 0.06)); for (let d = -L; d <= L; d += 0.5) { const q = Math.abs(d) / 20; p.dot(TX + d * 0.8, TY + s * d * 0.6, q < 0.3 ? WHITE : C[5 - Math.min(3, Math.floor(h * 14))], k * (1 - q * 0.6)); } }
        if (h < 0.05) p.glow(TX, TY, 30, WHITE, 0.5);
      }
      // 援护护弧：同伴身前一道半月青弧，立起、停驻、碎散
      const g = t - (HIT - 0.04);
      if (o.shapes && g >= 0 && g < 0.55) {
        const up = ease.outBack(Math.min(1, g / 0.1)), k = 1 - smooth(0.3, 0.55, g), R0 = 40;
        for (let a = -1.25; a <= 1.25; a += 0.02) { const span = Math.abs(a) / 1.25; if (span > up) continue;
          const w = 7 * (1 - span * span) * k; for (let r = R0 - w; r <= R0; r += 0.35) { const q = (R0 - r) / Math.max(0.5, w);
            p.dot(AX - 4 - Math.cos(a) * r * 0.8, AY - 10 + Math.sin(a) * r * 1.05, q < 0.25 ? (g < 0.12 ? WHITE : C[5]) : q < 0.6 ? C[4] : C[3], k * (1 - span * 0.4)); } }
        p.glow(AX - 44, AY - 10, 30, C[3], 0.4 * k);
      }
      ps.draw(p); lights.draw(p);
    },
  };
}
