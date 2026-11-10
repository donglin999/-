// 小江湖·高档：明约合锋（甲，领队群攻）。按 pixelfx 流程以 melee/sword-slash（月牙锋面）、impacts/crit-hit 为参考自写。
// 0–260ms 剑身凝金白锋芒、四周微压暗；260–520ms 一面有共同起点的扇形锋面横展到三名目标：前层绛青开线、后层金白接锋；
// 520ms 三目标同帧命中：交叉剑痕＋金白作用点＋火星与光池；520–1000ms 锋面碎散冷却，命中处各留一枚小金白缺口；1250ms 收尽。
import { Particles, Lights, P, Rng, fit, sparkle, clamp, smooth, ease, TAU, WHITE, hex } from "../../core/index.js";

export const meta = {
  name: "Fan edge (xjh)", desc: "明约合锋：绛青＋金白扇形锋面横展，三目标同帧命中。",
  tags: ["melee", "aoe", "slash", "xjh"], size: [440, 250], origin: [396, 135], duration: 1.25, loop: false, fps: 30, bg: "ground",
  options: { palette: ["#1a0c1e", "#3a1a3a", "#2c5a78", "#4f9ab8", "#a8dcec", "#f0fbff", "#ffffff"],
    gold: ["#2e1608", "#7a4218", "#c47a26", "#eeb64e", "#ffe39a", "#fffbea", "#ffffff"], sparks: ["#fffbea", "#ffe39a", "#eeb64e", "#c47a26"],
    targets: [[-162, 2], [-235, 12], [-325, 39]], shapes: true, seed: 7 },
};
const GATHER = 0.26, OPEN = 0.52;

export function create(o) {
  const C = fit(o.palette, 7), G = fit(o.gold, 7), Rg = new Rng(o.seed), ps = new Particles({ rng: Rg, ground: () => 60, sparks: o.sparks }), lights = new Lights();
  const TG = o.targets.map(([x, y]) => ({ x, y, a: Math.atan2(y, x), r: Math.hypot(x, y) }));
  const aMin = Math.min(...TG.map((q) => q.a)) - 0.12, aMax = Math.max(...TG.map((q) => q.a)) + 0.12, Rmax = Math.max(...TG.map((q) => q.r)) + 14;
  let t = 0, struck = false;
  // 角度从中线向两边展开：开线层先到、接锋层晚 60ms
  const reach = (tt, lag) => ease.outExpo(clamp((tt - GATHER - lag) / (OPEN - GATHER)));
  return {
    update(dt) {
      t += dt;
      if (t < GATHER && Rg.chance(0.8)) { const x = Rg.range(-2, 26), y = Rg.range(-3, 3); ps.spawn(P.STREAK, x + Rg.range(-14, 14), y + Rg.range(-14, 14), 0, 0, 0.12, G[Rg.int(4, 6)], 1); }
      if (t > GATHER && t < OPEN + 0.05) for (let i = 0; i < 3; i++) { const a = Rg.range(aMin, aMax), r = Rmax * reach(t, 0) * Rg.range(0.5, 1);
        ps.spawn(P.MOTE, Math.cos(a) * r, Math.sin(a) * r, Math.cos(a) * Rg.range(10, 50), Math.sin(a) * Rg.range(10, 50) - 10, Rg.range(0.25, 0.5), Rg.chance(0.5) ? C[Rg.int(4, 5)] : G[Rg.int(4, 5)], 0.6); }
      if (!struck && t >= OPEN) { struck = true;
        for (const q of TG) { lights.add(q.x, q.y, 40, G[4], 0.65, 0.35); lights.add(q.x, q.y, 12, WHITE, 0.8, 0.08);
          for (let i = 0; i < 10; i++) { const a = q.a + Rg.range(-0.9, 0.9), sp = Rg.range(150, 340); ps.spawn(P.SPARK, q.x, q.y, Math.cos(a) * sp, Math.sin(a) * sp - 50, Rg.range(0.12, 0.3)); }
          for (let i = 0; i < 6; i++) { const a = Rg.range(0, TAU), sp = Rg.range(20, 70); ps.spawn(P.MOTE, q.x, q.y, Math.cos(a) * sp, Math.sin(a) * sp - 10, Rg.range(0.35, 0.7), G[Rg.int(4, 5)], 0.6); } } }
      ps.update(dt); lights.update(dt);
    },
    drawBack(p) {
      // 起手：剑身金白凝聚（剑沿 x 负方向）
      if (t < OPEN) { const k = clamp(t / GATHER), f = 1 - smooth(GATHER, OPEN, t);
        for (let x = 0; x > -28 * k; x -= 0.5) p.dot(x, 0, x > -4 ? WHITE : G[5], f);
        p.glow(-10, 0, 16 + 10 * k, G[4], 0.4 * f); }
    },
    draw(p) {
      // 扇形锋面：两层（后层金白接锋、前层绛青开线），每层是由中心放射的锋线＋前沿月牙弧
      const fade = 1 - smooth(OPEN + 0.08, 1.0, t);
      if (o.shapes && t > GATHER && fade > 0) for (const [lag, R, lw] of [[0.06, G, 0], [0, C, 1]]) {
        const k = reach(t, lag); if (k <= 0) continue;
        const Rf = Rmax * k;
        // 锋面：极坐标逐像素。锋线随半径微弯（像剑扫过的弧光），粗细不一；前沿是两头收尖的月牙
        const span = (aMax - aMin) / 2 + 0.22, mid = (aMax + aMin) / 2, cool = clamp((t - OPEN) / 0.45);
        p.shade(-Rmax - 8, -Rmax * 0.8, 8, Rmax * 0.8, (x, y, out) => {
          const r = Math.hypot(x, y); if (r > Rf + 1 || r < 8) return;
          let a = Math.atan2(y, x) - mid; a = Math.atan2(Math.sin(a), Math.cos(a)); const sN = a / span; if (Math.abs(sN) > 1) return;
          const edge = Rf - r, th = (lw ? 3.2 : 4.6) * (1 - sN * sN) * (0.6 + 0.4 * k);
          if (edge < th) { const q = edge / Math.max(0.6, th); out.c = R[clamp((q < 0.35 ? 6 : q < 0.7 ? 5 : 4) - Math.round(cool * 3), 1, 6)]; out.a = fade; return; }
          const bend = sN * 0.22 * (r / Rmax), ph = (sN + bend) * (lw ? 2.6 : 2.2) + lw * 0.5, fr = ph - Math.floor(ph), ri = Math.floor(ph);
          const wid = 0.07 + 0.07 * (((ri + 9) * 7919) % 5) / 4, dr = Math.abs(fr - 0.5);
          if (dr > wid) { if (!lw && (r / Rf) > 0.3) { out.c = 0; out.l = R[4]; out.k = 0.14 * fade * (1 - cool); } return; } const along = r / Rf; if (along < 0.15 + 0.2 * ((ri * 31) % 3) / 2) return;
          const q = dr / wid; out.c = R[clamp((q < 0.4 ? (along > 0.75 ? 5 : 4) : 3) - Math.round(cool * 2), 1, 6)]; out.a = fade * (along < 0.3 ? clamp((along - 0.15) / 0.15) : 1); });
        for (let a = mid - span * 0.9; a <= mid + span * 0.9; a += 0.04) p.glow(Math.cos(a) * Rf, Math.sin(a) * Rf, 9, R[4], 0.16 * fade);
      }
      // 命中：交叉剑痕＋金白作用点
      const h = t - OPEN;
      if (o.shapes && h >= 0 && h < 0.35) { const k = 1 - h / 0.35;
        for (const q of TG) {
          for (const s of [-1, 1]) { const L = 16 * ease.outExpo(Math.min(1, h / 0.05)); for (let d = -L; d <= L; d += 0.4) { const u = Math.abs(d) / 16; for (const off of [0, 1]) p.dot(q.x + d * 0.75 + off * 0.5, q.y + s * d * 0.65, u < 0.35 ? WHITE : off ? C[4] : G[5], k * (1 - u * 0.5)); } }
          sparkle(p, q.x, q.y, 12 * ease.outBack(Math.min(1, h / 0.05)) * k, G[5], G[3], 0.7 * k);
          if (h < 0.05) p.glow(q.x, q.y, 26, WHITE, 0.5); } }
      // 接应缺口：命中处留一枚小金白缺口，缓缓淡去
      if (o.shapes && h > 0.2 && t < 1.2) { const k = 1 - smooth(0.9, 1.2, t);
        for (const q of TG) { const cx = q.x + 2, cy = q.y - 10; for (let a = 0.5; a < TAU - 0.5; a += 0.08) p.dot(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4, a < 1 || a > TAU - 1 ? WHITE : G[4], k); p.glow(cx, cy, 8, G[4], 0.25 * k); } }
      ps.draw(p); lights.draw(p);
    },
  };
}
