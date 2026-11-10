shader_type canvas_item;
// 对话立绘：下沿渐隐（原版 CSS mask linear-gradient）、未发言压暗（brightness .72）、描边与落影（drop-shadow）
uniform float fade_start = 0.9;
uniform float fade_end = 1.0;
uniform float bright = 1.0;
uniform float outline = 1.0;   // 1 = 发言中（细描边），0 = 无描边
uniform vec2 px = vec2(0.001, 0.001);  // 一个屏幕像素在 UV 里的大小

void fragment() {
	vec4 c = texture(TEXTURE, UV);
	float a = c.a;
	// 细描边：周围 2px 内的最大 alpha
	float o = 0.0;
	if (outline > 0.5) {
		for (int i = 0; i < 8; i++) {
			float ang = float(i) * 0.785398;
			o = max(o, texture(TEXTURE, UV + vec2(cos(ang), sin(ang)) * px * 1.5).a);
		}
	}
	// 落影：向下 6px、模糊 14px（粗略 9 点）
	float sh = 0.0;
	for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++)
		sh += texture(TEXTURE, UV - vec2(0.0, 6.0) * px + vec2(float(i), float(j)) * px * 7.0).a;
	sh = sh / 9.0 * 0.75;
	vec3 col = c.rgb * bright;
	float under = max(o * 0.95, sh);
	vec4 res = vec4(mix(vec3(0.03, 0.02, 0.01), col, a), max(a, under * (1.0 - a) + a));
	float m = 1.0 - smoothstep(fade_start, fade_end, UV.y);
	res.a *= m;
	COLOR = res;
}
