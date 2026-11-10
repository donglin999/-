// 培养模式心情头像遮罩（原版 qh-mode-cultivation.css .cu-mood-face 的 mask）：
// 上 60.6% 全显示（头发可探出圆环），下部只显示以 (50%,60.6%) 为圆心、半径 radius 的圆内（肩膀收在环里）。
shader_type canvas_item;
uniform float radius = 0.371;
// fragment 里的 COLOR 已乘过贴图，再乘会压暗；顶点色从 vertex 传进来
varying vec4 vcol;
void vertex() { vcol = COLOR; }
void fragment() {
	vec4 c = texture(TEXTURE, UV);
	float keep = 1.0;
	if (UV.y > 0.606) {
		float d = distance(UV, vec2(0.5, 0.606));
		keep = 1.0 - smoothstep(radius - 0.004, radius + 0.004, d);
	}
	COLOR = vec4(c.rgb, c.a * keep) * vcol;
}
