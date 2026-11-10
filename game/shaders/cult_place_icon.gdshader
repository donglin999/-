// 培养模式地点图标（原版 .cu-place-icon）：mix-blend-mode:multiply + 径向遮罩 radial-gradient(closest-side,#000 58%,transparent 98%)
shader_type canvas_item;
render_mode blend_mul;
void fragment() {
	vec4 c = texture(TEXTURE, UV);
	float d = distance(UV, vec2(0.5)) / 0.5;
	float a = c.a * (1.0 - smoothstep(0.58, 0.98, d));
	COLOR = vec4(mix(vec3(1.0), c.rgb, a), 1.0);
}
