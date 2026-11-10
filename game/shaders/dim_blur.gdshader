shader_type canvas_item;
// 对话时背景虚化（原版 #cv filter: blur(.32cqw) brightness(.72) saturate(.85)，过渡 .22s）
uniform sampler2D screen_tex : hint_screen_texture, filter_linear_mipmap;
uniform float amount = 0.0;    // 0..1 过渡
uniform float radius_px = 4.1;
void fragment() {
	vec2 ps = SCREEN_PIXEL_SIZE * radius_px * amount;
	vec3 acc = vec3(0.0); float wsum = 0.0;
	for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) {
		float w = exp(-float(i*i + j*j) / 4.5);
		acc += texture(screen_tex, SCREEN_UV + vec2(float(i), float(j)) * ps * 0.5).rgb * w; wsum += w;
	}
	vec3 c = acc / wsum;
	float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
	vec3 dimmed = mix(vec3(l), c, 0.85) * 0.72;
	COLOR = vec4(mix(texture(screen_tex, SCREEN_UV).rgb, dimmed, amount), 1.0);
}
