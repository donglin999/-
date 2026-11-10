shader_type canvas_item;
render_mode blend_premul_alpha;
uniform int n = 0;
uniform vec3 lights[16];
uniform vec4 colors[16];
uniform bool dark_on = false;
uniform vec4 dark = vec4(0.0, 0.0, 0.0, 0.5);
uniform vec3 hero = vec3(0.0, 0.0, 90.0);
// 径向挖洞：0 → 1，.45 → .55，1 → 0（原版 createRadialGradient 三个色标）
float hole(vec2 p, vec3 l) {
	float d = length(p - l.xy) / max(1.0, l.z);
	if (d >= 1.0) return 0.0;
	if (d < 0.45) return mix(1.0, 0.55, d / 0.45);
	return mix(0.55, 0.0, (d - 0.45) / 0.55);
}
float glow(vec2 p, vec3 l) {
	float d = length(p - l.xy) / max(1.0, l.z);
	if (d >= 1.0) return 0.0;
	if (d < 0.35) return mix(0.30, 0.12, d / 0.35);
	return mix(0.12, 0.0, (d - 0.35) / 0.65);
}
void fragment() {
	vec2 p = FRAGCOORD.xy / SCREEN_PIXEL_SIZE.x * SCREEN_PIXEL_SIZE.x;
	p = UV * vec2(960.0, 540.0);
	float a = 0.0;
	vec3 add = vec3(0.0);
	if (dark_on) {
		float keep = 1.0;
		for (int i = 0; i < 16; i++) { if (i >= n) break; vec3 l = lights[i]; l.z *= 1.25; keep *= 1.0 - hole(p, l); }
		keep *= 1.0 - hole(p, hero);
		a = dark.a * keep;
	}
	for (int i = 0; i < 16; i++) { if (i >= n) break; add += colors[i].rgb * glow(p, lights[i]); }
	// 预乘：暗色按 a 盖住，暖光相加
	COLOR = vec4(dark.rgb * a + add, a);
}
