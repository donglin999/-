'use strict';
// Cloudflare Pages: deploy only browser runtime files, never local notes or credentials.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
// Validate documentation and canonical assets before changing build output.
// 规则登记表与文档冲突检查（R-文档-02，2026-10-19）：规则未经批准、现行文档里有已废止旧说法、新增死链，都不发布
const docs = require('node:child_process').spawnSync('python3', [path.join(root, '..', 'xiaojianghu', 'tools_docs', 'check_docs.py')], { cwd: root, stdio: 'inherit' });
if (docs.error || docs.status !== 0) { console.error('文档冲突检查失败，构建已停止。'); process.exit(1); }
const check = require('node:child_process').spawnSync('python3', ['tools_assets/check_production.py'], { cwd: root, stdio: 'inherit' });
if (check.error || check.status !== 0) { console.error('素材与文档核对失败，构建已停止。'); process.exit(1); }

// ink 剧本：先编译并跑全部检查（迁移方案 §4.4、§8），不通过就不发布
const ink = require('node:child_process').spawnSync('node', ['tools_story/build_ink.cjs'], { cwd: root, stdio: 'inherit' });
if (ink.error || ink.status !== 0) { console.error('ink 剧本检查失败，构建已停止。'); process.exit(1); }

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
// ── 评审工具与发布包分开（2026-10-19）────────────────────────────────
// 评审/测试入口只供本机 8792 使用：发布包不带评审专用脚本，并在页面最早阶段删掉评审/测试查询参数，
// 线上玩家加任何后缀都只会进入正常栖河试玩。源码 index.html 与 js/ 不变，本地评审照常可用。
// 新增评审脚本或 URL 开关时，同步登记到下面两张表（docs/updates/2026-10-19-deprecated-entries.md 有清单）。
const REVIEW_SCRIPTS = ['qihe-ui-review.js', 'qihe-story-review.js', 'qihe-battle-review.js', 'hero-multiweapon-review.js', 'qihe-chapter-presentation-review.js', 'qihe-relationship-review.js', 'qihe-hero-motion-review.js'];
const REVIEW_PARAMS = ['battleReview', 'storyReview', 'uiReview', 'chapterPresentationReview', 'relationshipReview', 'martialCapacity', 'poseReview', 'holdReview', 'tail', 'weapon', 'uitheme', 'debug',
  'pixel90', 'pixel90roam', 'pixel90mask', 'heroRun', 'heroWalk', 'runVariant', 'heroMotion', 'heroReview', 'runtimePrototype', 'openingPrototype', 'openingReview', 'cultivationReview'];
{
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  for (const name of REVIEW_SCRIPTS) {
    const tag = new RegExp(`<script src="js/${name.replace(/[.]/g, '[.]')}(?:\\?[^"]*)?"></script>`, 'g');
    if (!tag.test(html)) { console.error('发布包分离：index.html 中找不到评审脚本 ' + name + '，请同步 REVIEW_SCRIPTS。'); process.exit(1); }
    html = html.replace(tag, '');
  }
  const guard = `<script>/* 发布包专用（scripts/build-pages.cjs 注入）：评审与测试参数在线上一律失效 */(()=>{try{const u=new URL(location.href);let c=false;for(const k of ${JSON.stringify(REVIEW_PARAMS)})if(u.searchParams.has(k)){u.searchParams.delete(k);c=true}if(c)history.replaceState(null,'',u.href)}catch(e){}window.XJH_RELEASE=true})()</script>`;
  const anchor = '<script src="js/runtime-entry.js';
  if (!html.includes(anchor)) { console.error('发布包分离：找不到入口守卫脚本位置。'); process.exit(1); }
  html = html.replace(anchor, guard + '\n' + anchor);
  fs.writeFileSync(path.join(out, 'index.html'), html);
}
// Cloudflare 缓存规则（_headers）与超出单文件 25MB 上限的音频处理
if (fs.existsSync(path.join(root, '_headers'))) fs.copyFileSync(path.join(root, '_headers'), path.join(out, '_headers'));
fs.cpSync(path.join(root, 'js'), path.join(out, 'js'), { recursive: true, filter: source => !REVIEW_SCRIPTS.includes(path.basename(source)) });
fs.cpSync(path.join(root, 'assets'), path.join(out, 'assets'), {
  recursive: true,
  filter: source => !source.split(path.sep).some(part => part === 'review' || part === 'voice_pick' || part === 'node_modules') && path.basename(source) !== '.DS_Store',
});
// Cloudflare Pages 单文件上限 25MiB：超限的 wav 在 dist 里转成 16 位 44.1kHz（源素材不动；需要 macOS afconvert）
for (const dir of [path.join(out, 'assets')]) {
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
  for (const f of walk(dir)) {
    if (fs.statSync(f).size <= 24.5 * 1024 * 1024) continue;
    if (!f.endsWith('.wav')) { console.error('超过 25MB 的文件无法上传：' + f); process.exit(1); }
    const tmp = f + '.tmp.wav';
    const r = require('node:child_process').spawnSync('afconvert', ['-f', 'WAVE', '-d', 'LEI16@44100', f, tmp], { stdio: 'inherit' });
    if (r.status !== 0) { console.error('音频转码失败：' + f); process.exit(1); }
    fs.renameSync(tmp, f); console.log('已在发布包内压缩超限音频：' + path.relative(out, f));
  }
}
// 地图在发布包里转有损 webp（质量 92，透明层保真）：源图是无损的，村中心一张 10MB，线上要下 20 秒以上，换场时会黑屏。
// 只处理 assets/production/maps 下超过 1MB 的 webp；变小才替换；没有 cwebp 时跳过（源素材不动）。
{
  const maps = path.join(out, 'assets', 'production', 'maps');
  const cp = require('node:child_process');
  const has = cp.spawnSync('cwebp', ['-version']).status === 0;
  if (!has) console.warn('未找到 cwebp，地图不压缩。');
  else if (fs.existsSync(maps)) {
    let before = 0, after = 0, n = 0;
    for (const f of fs.readdirSync(maps).filter(f => f.endsWith('.webp')).map(f => path.join(maps, f))) {
      const size = fs.statSync(f).size; if (size <= 1024 * 1024) continue;
      const tmp = f + '.q92.webp';
      const r = cp.spawnSync('cwebp', ['-quiet', '-q', '92', '-m', '6', '-sharp_yuv', '-alpha_q', '100', f, '-o', tmp]);
      if (r.status === 0 && fs.statSync(tmp).size < size) { before += size; after += fs.statSync(tmp).size; fs.renameSync(tmp, f); n++; } else fs.rmSync(tmp, { force: true });
    }
    console.log(`地图压缩 ${n} 张：${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB`);
  }
}
console.log(`Cloudflare Pages output: ${out}`);
