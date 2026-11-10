// 战斗精灵着色（对应原版 bfx.js prep：灰化 saturation → 压暗 source-atop → 闪白 source-atop，均只作用于不透明像素）
shader_type canvas_item;
uniform float grey = 0.0;
uniform float dark = 0.0;
uniform vec4 dc : source_color = vec4(0.0, 0.0, 0.0, 1.0);
uniform float white = 0.0;
uniform vec4 wc : source_color = vec4(1.0);
// 迎光面受光（bfx.js rimFrame：左上边缘按 50% 混入受光色）；rim_on=0 关闭
uniform float rim_on = 0.0;
uniform vec4 rim : source_color = vec4(1.0);
uniform vec2 rim_step = vec2(0.0);

varying vec4 vcol;
void vertex() { vcol = COLOR; }

void fragment() {
	vec4 t = texture(TEXTURE, UV);
	vec3 c = t.rgb;
	if (rim_on > 0.5 && t.a > 0.5) {
		float na = texture(TEXTURE, UV + rim_step).a;
		if (na <= 0.5) c = mix(c, rim.rgb, 0.5);
	}
	if (grey > 0.0) {
		float l = dot(c, vec3(0.3, 0.59, 0.11));
		c = mix(c, vec3(l), grey);
	}
	if (dark > 0.0) c = mix(c, dc.rgb, dark);
	if (white > 0.0) c = mix(c, wc.rgb, min(1.0, white));
	COLOR = vec4(c, t.a) * vcol;
}
