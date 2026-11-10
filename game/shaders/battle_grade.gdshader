// 场景环境色调（对应原版 bstage.js gradeWorld：globalCompositeOperation='soft-light'、globalAlpha=.8、fillStyle=cfg().tint）
// 顶点色 = tint（alpha 已乘 .8）；按 W3C soft-light 公式与屏幕底图混合。
shader_type canvas_item;
uniform sampler2D screen_tex : hint_screen_texture, filter_nearest;

float d_of(float b) { return b <= 0.25 ? ((16.0 * b - 12.0) * b + 4.0) * b : sqrt(b); }
float soft(float b, float s) {
	if (s <= 0.5) return b - (1.0 - 2.0 * s) * b * (1.0 - b);
	return b + (2.0 * s - 1.0) * (d_of(b) - b);
}

void fragment() {
	vec4 src = COLOR;
	vec3 bk = texture(screen_tex, SCREEN_UV).rgb;
	vec3 mixed = vec3(soft(bk.r, src.r), soft(bk.g, src.g), soft(bk.b, src.b));
	COLOR = vec4(mix(bk, mixed, src.a), 1.0);
}
