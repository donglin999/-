// 小江湖·低档：木杵钝击。按 pixelfx 流程从 impacts/blunt-hit 改出（尺寸按本作人物 60px 高放大 1.4 倍，方向朝左）。
// The clods and the dust are adapted from Sprite Fusion's open-source explosion via pixelfx blunt-hit, MIT.
import { Bits, Lights, Particles, P, B, Rng, fit, clamp, ease, TAU, WHITE, mix, hex } from "../../core/index.js";
import { stone, rock, rockShape } from "../impacts/_lib.js";

export const meta = {
  name: "Staff hit (xjh)", desc: "木杵打中：白热团块一闪，墨色楔形朝受力方向外刺后收回，压扁的尘环扩散，木屑土块落地。",
  tags: ["impact", "hit", "blunt", "xjh"], size: [150, 96], origin: [86, 80], duration: 0.6, loop: false, fps: 30, bg: "ground",
  options: { palette: ["#1d1620", "#4a3a3c", "#7d6a66", "#b09c90", "#dccab4", "#f6ead2", "#ffffff"], warm: "#ffc98a", dust: "#c9a477", clod: "#6e5a5a", height: 26, k: 1.4, dir: -1, shapes: true, seed: 9 },
};
const lump = (r, a, ph) => r * (1 + 0.15 * Math.sin(5 * a + ph) + 0.08 * Math.sin(9 * a + ph * 2.3));

export function create(o) {
  const C = fit(o.palette, 7), R = new Rng(o.seed), K = o.k, D = o.dir, X = 0, Y = -o.height, PH = R.range(0, TAU), floor = () => 0;
  const WARM = hex(o.warm), DUST = hex(o.dust), st = stone(o.clod);
  const lights = new Lights(), bits = new Bits({ ground: floor }), ps = new Particles({ rng: R, ground: floor });
  lights.add(X, Y, 48 * K, WARM, 0.55, 0.32); lights.add(X, Y, 16 * K, WHITE, 0.6, 0.07);
  // 楔形偏向受力方向（朝左）：受力一侧更长更多
  const wedges = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * TAU + R.range(-0.2, 0.2), fwd = Math.max(0, Math.cos(a) * D);
    return { a, len: R.range(6, 13) * K * (0.7 + 0.8 * fwd), w: R.range(3.2, 5) * K, r0: R.range(12, 15) * K, t0: R.range(0.01, 0.035), out: R.range(0.035, 0.055), back: R.range(0.08, 0.12) }; });
  const puffs = Array.from({ length: 18 }, (_, i) => { const a = (i / 26) * TAU + R.range(-0.12, 0.12), side = Math.abs(Math.cos(a)), v = R.range(40, 130) * K * (0.6 + 0.5 * side);
    return { x: X + Math.cos(a) * 9 * K, y: Y + Math.sin(a) * 6 * K, vx: Math.cos(a) * v + D * 20, vy: Math.sin(a) * v * 0.5, r: R.range(2.0, 4.4) * K * (0.75 + 0.35 * side), life: R.range(0.25, 0.42), t0: R.range(0.03, 0.08), lift: R.range(4, 14) }; });
  for (const q of puffs) q.max = q.life;
  for (let i = 0; i < 5; i++) { const s = R.chance(0.7) ? D : -D, a = -Math.PI / 2 + s * R.range(0.5, 1.3), v = R.range(70, 140);
    bits.add({ kind: B.CHUNK, x: X + s * R.range(4, 8), y: Y + R.range(-3, 3), vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 1, drag: 0.6, bounce: 0.28, life: R.range(0.45, 0.6), a: R.range(0, TAU), va: s * R.range(8, 16), s: R.chance(0.4) ? 2 : 1, pts: rockShape(R) }); }
  // 打击方向的火星/木屑
  for (let i = 0; i < 9; i++) { const a = (D < 0 ? Math.PI : 0) + R.range(-0.7, 0.7), sp = R.range(120, 260); ps.spawn(P.SPARK, X, Y, Math.cos(a) * sp, Math.sin(a) * sp - 40, R.range(0.12, 0.3), undefined, 1, 0.02); }
  let t = 0;
  return {
    update(dt) { t += dt;
      for (const q of puffs) { if (t < q.t0) continue; q.life -= dt; q.vx -= q.vx * 4.5 * dt; q.vy -= q.vy * 4.5 * dt + q.lift * dt; q.x += q.vx * dt; q.y += q.vy * dt; }
      bits.update(dt); ps.update(dt); lights.update(dt); },
    draw(p) {
      if (o.shapes) for (const q of puffs) { const k = q.life / q.max; if (t < q.t0 || k <= 0) continue;
        const r = q.r * (0.7 + (1 - k) * 0.85), a = Math.pow(k, 1.25) * Math.min(1, (t - q.t0) / 0.03), c = mix(DUST, WARM, clamp(1 - (t - 0.03) / 0.25) * 0.55);
        p.disc(q.x, q.y, r, c, (d) => 0.58 * a * (1 - d * d * 0.75)); p.disc(q.x - r * 0.22, q.y - r * 0.32, r * 0.58, mix(c, WHITE, 0.55), (d) => 0.48 * a * (1 - d * d)); }
      for (const b of bits.list) rock(p, b, st);
      if (o.shapes && t < 0.058) { const f = t < 0.025 ? 0 : 1, R0 = (f ? 13.5 : 11.5) * K;
        p.shade(X - R0 * 1.4, Y - R0 * 1.4, X + R0 * 1.4, Y + R0 * 1.4, (x, y) => { const dx = x - X, dy = (y - Y) * (f ? 1.25 : 1.1), d = Math.hypot(dx, dy), ro = lump(R0, Math.atan2(dy, dx), PH + f * 0.6);
          if (d > ro) return; const q = d / ro; return f === 0 ? (q < 0.55 ? WHITE : q < 0.86 ? C[5] : C[4]) : q < 0.3 ? WHITE : q < 0.72 ? C[5] : q < 0.9 ? C[4] : C[3]; }); }
      if (o.shapes) for (const w of wedges) { const u = t - w.t0; if (u < 0 || u > w.out + w.back) continue;
        const s = u < w.out ? ease.outCubic(u / w.out) : 1 - ease.inQuad((u - w.out) / w.back), L = w.len * s; if (L < 1.5) continue;
        const ca = Math.cos(w.a), sa = Math.sin(w.a), r0 = w.r0 + 2 * s, hw = (w.w * (0.6 + 0.4 * s)) / 2;
        const tip = [X + ca * r0, Y + sa * r0], end = [X + ca * (r0 + L), Y + sa * (r0 + L)], n = [-sa * hw, ca * hw];
        const wedge = (g) => [[tip[0] - ca * g, tip[1] - sa * g], [end[0] + n[0] * (1 + g * 0.45) + ca * g, end[1] + n[1] * (1 + g * 0.45) + sa * g], [end[0] - n[0] * (1 + g * 0.45) + ca * g, end[1] - n[1] * (1 + g * 0.45) + sa * g]];
        p.poly(wedge(1), C[1]); p.poly(wedge(0), u < w.out + 0.02 ? WHITE : C[5]); }
      const pop = Math.exp(-t / 0.06); if (pop > 0.02) p.glow(X, Y, 28 * K, WARM, 0.5 * pop);
      ps.draw(p); lights.draw(p);
    },
  };
}
