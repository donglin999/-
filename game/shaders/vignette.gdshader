shader_type canvas_item;
// 原版 core.js vignette：中心 (W/2,H/2)，半径 H*.35 → H*.95 由透明渐到 rgba(0,0,0,a)；探索 .18，其余 .55
uniform float strength = 0.18;
uniform vec4 tint = vec4(0.0);
void fragment() {
	vec2 p = UV * vec2(960.0, 540.0);
	float d = length(p - vec2(480.0, 270.0));
	float k = clamp((d - 540.0 * 0.35) / (540.0 * 0.6), 0.0, 1.0);
	vec4 v = vec4(0.0, 0.0, 0.0, strength * k);
	// 叠上场景色调（tint，非明亮模式才用）
	COLOR = vec4(mix(tint.rgb, v.rgb, v.a / max(0.0001, v.a + tint.a * (1.0 - v.a))), v.a + tint.a * (1.0 - v.a));
}
