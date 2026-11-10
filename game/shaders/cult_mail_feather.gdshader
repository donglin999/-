// 培养模式邮箱遮罩（原版 -mail.css mask-image 两道线性渐变取交集 + filter:saturate）
// 缺省值是立绘 .cu-mail-portrait：左右 10%、上下 2%，saturate(.85)；插图 .cu-mail-illustration：左 6%、右 14%、上下 8%，saturate(.7)
shader_type canvas_item;
uniform float left = 0.10;
uniform float right = 0.10;
uniform float top = 0.02;
uniform float bottom = 0.02;
uniform float sat = 0.85;
// object-fit:cover 的裁切：在原图里取 [crop_pos, crop_pos+crop_size]
uniform vec2 crop_pos = vec2(0.0);
uniform vec2 crop_size = vec2(1.0);
// fragment 里的 COLOR 已乘过贴图，再乘会把图压暗；顶点色（modulate）从 vertex 传进来
varying vec4 vcol;
void vertex() { vcol = COLOR; }
void fragment() {
	vec4 c = texture(TEXTURE, crop_pos + UV * crop_size);
	float fx = clamp(UV.x / left, 0.0, 1.0) * clamp((1.0 - UV.x) / right, 0.0, 1.0);
	float fy = clamp(UV.y / top, 0.0, 1.0) * clamp((1.0 - UV.y) / bottom, 0.0, 1.0);
	float g = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
	COLOR = vec4(mix(vec3(g), c.rgb, sat), c.a * fx * fy) * vcol;
}
