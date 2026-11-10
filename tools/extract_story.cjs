// 把原版 js/story-data/*.js（ink 编译产物）抽成 Godot 可读的 JSON；只读原版目录
// 输出：game/data/story/<文件>.json（同一份 ink 的多个入口 knot 共用一个文件）与 index.json（knot → 文件）
const fs=require('fs'),path=require('path'),vm=require('vm');
const SRC=path.resolve(__dirname,'../../xiaojianghu-legacy-prologue/js/story-data');
const OUT=path.resolve(__dirname,'../game/data/story');fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(OUT,{recursive:true});
const ctx={};ctx.window=ctx;vm.createContext(ctx);
const index={},files=new Map();
for(const f of fs.readdirSync(SRC).filter(f=>f.endsWith('.js')).sort()){
  const before=new Set(Object.keys(ctx.STORY_DATA||{}));
  vm.runInContext(fs.readFileSync(path.join(SRC,f),'utf8'),ctx);
  const base=f.replace(/\.js$/,'');
  for(const k of Object.keys(ctx.STORY_DATA)){if(before.has(k))continue;const o=ctx.STORY_DATA[k];
    if(!files.has(o)){files.set(o,base);fs.writeFileSync(path.join(OUT,base+'.json'),JSON.stringify(o))}
    index[k]=files.get(o)}
}
fs.writeFileSync(path.join(OUT,'index.json'),JSON.stringify({knots:index,externals:ctx.STORY_EXTERNALS},null,1));
console.log('files',files.size,'knots',Object.keys(index).length,'externals',ctx.STORY_EXTERNALS.length);
