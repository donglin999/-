// 交锋特效辉光层贴回（原版 wuxia-fx.js drawFrontInto：o.filter='blur(8px)'，imageSmoothingEnabled=true，'lighter' 画 1/4 分辨率的 gC）。
// 辉光层是黑底叠加画出来的（等价于 canvas 预乘透明），这里按输出像素位置对周围格子做高斯加权，
// 相当于“线性放大后再模糊 σ 个输出像素”。sigma 以辉光格为单位：8px ÷ (960/640 × 镜头缩放 × GS 4)。
shader_type canvas_item;
render_mode blend_add;
uniform sampler2D glow_tex : filter_nearest;
uniform float sigma = 1.333;

void fragment() {
	vec2 size = vec2(textureSize(glow_tex, 0));
	vec2 p = UV * size - 0.5;
	vec2 base = floor(p);
	// 双线性放大本身约等于再加 1/6 格² 的方差
	float s2 = sigma * sigma + 0.1667;
	int r = int(clamp(ceil(sqrt(s2) * 2.6), 1.0, 6.0));
	vec3 acc = vec3(0.0);
	float wsum = 0.0;
	for (int j = -r; j <= r + 1; j++) {
		for (int i = -r; i <= r + 1; i++) {
			vec2 q = base + vec2(float(i), float(j));
			vec2 d = q - p;
			float w = exp(-dot(d, d) / (2.0 * s2));
			wsum += w;
			if (q.x < 0.0 || q.y < 0.0 || q.x >= size.x || q.y >= size.y) continue;
			acc += texelFetch(glow_tex, ivec2(q), 0).rgb * w;
		}
	}
	COLOR = vec4(acc / wsum, 1.0);
}
