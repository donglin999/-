extends RefCounted
## WuxiaFX 工具函数（原版 js/faction-fx/wuxia-fx.js 文件头部：B8/dth/clamp/lerp/win/out3/inout/back/accel/rng/hash）。
## 全部为静态函数，常量照抄原版。32 位整数运算按 JS 的 Math.imul / >>> 语义模拟（无符号 32 位表示）。

const MASK := 0xFFFFFFFF
## 8×8 Bayer 抖动表（原版 B8 的原始序号，取用时换算为 (v+.5)/64）
const B8_RAW := [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21]

## 原版 dth(x,y)=B8[(x&7)+((y&7)<<3)]
static func dth(x: int, y: int) -> float:
	return (B8_RAW[(x & 7) + ((y & 7) << 3)] + 0.5) / 64.0

static func clamp01(v: float, a := 0.0, b := 1.0) -> float: return maxf(a, minf(b, v))
static func lerp_(a: float, b: float, k: float) -> float: return a + (b - a) * k
## win(t,a,b)=clamp((t-a)/(b-a))
static func win(t: float, a: float, b: float) -> float: return clamp01((t - a) / (b - a))
static func out3(k: float) -> float: return 1.0 - pow(1.0 - clamp01(k), 3)
static func inout(k: float) -> float:
	k = clamp01(k)
	return 4 * k * k * k if k < 0.5 else 1.0 - pow(-2 * k + 2, 3) / 2.0
static func back(k: float) -> float:
	k = clamp01(k)
	return 1 + 2.7 * pow(k - 1, 3) + 1.7 * pow(k - 1, 2)
## accel：前段缓收、末段骤然提速
static func accel(k: float) -> float:
	k = clamp01(k)
	return 0.07 * k + 0.93 * pow(k, 3.6)

## Math.imul（结果取无符号 32 位）；拆半乘，避免 64 位溢出
static func imul(a: int, b: int) -> int:
	a &= MASK; b &= MASK
	return ((a * (b & 0xFFFF)) + (((a * (b >> 16)) & 0xFFFF) << 16)) & MASK

## 原版 hash(a,b)：返回 [0,1)
static func hash2(a: int, b: int) -> float:
	var h := (imul(a & MASK, 374761393) + imul(b & MASK, 668265263)) & MASK
	h = imul(h ^ (h >> 13), 1274126177)
	return float((h ^ (h >> 16)) & MASK) / 4294967296.0

## 原版 rng(seed)：mulberry32；返回无参 Callable，每次调用给出 [0,1)
static func rng(seed: int) -> Callable:
	var st := [seed & MASK]
	if st[0] == 0: st[0] = 1
	return func() -> float:
		st[0] = (st[0] + 0x6D2B79F5) & MASK
		var s: int = st[0]
		var t := imul(s ^ (s >> 15), 1 | s)
		t = (((t + imul(t ^ (t >> 7), 61 | t)) & MASK) ^ t) & MASK
		return float((t ^ (t >> 14)) & MASK) / 4294967296.0

## JS Math.round（.5 向正无穷取整）
static func jround(v: float) -> int: return int(floor(v + 0.5))
