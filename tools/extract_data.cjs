// 把原版纯数据脚本（window.X = {...}）抽成 JSON，供 Godot 读取；只读原版目录。
// 用法：node tools/extract_data.cjs
const fs=require('fs'),path=require('path'),vm=require('vm');
const SRC=path.resolve(__dirname,'../../xiaojianghu-legacy-prologue/js');
const OUT=path.resolve(__dirname,'../game/data/js');fs.mkdirSync(OUT,{recursive:true});
const FILES=['qihe-map-data.js','qihe-rooms-data.js','qihe-expansion-data.js','qihe-npc-items.js','qihe-npc-data.js','qh-pre-hangao-data.js','art.js','item-icons-v4.js','production-assets.js','menu-icons.js','qihe-staging-data.js','qihe-steal-data.js','qihe-faction-clash-data.js','qihe-cultivation-data.js','qh-mode-cultivation-data.js','qh-mode-cultivation-motion-data.js','hero-multiweapon-art-data.js','qihe-jianghu-data.js'];
for(const f of FILES){const ctx={console};ctx.window=ctx;ctx.document={addEventListener(){},querySelector(){return null},createElement(){return {style:{},setAttribute(){},appendChild(){}}},head:{appendChild(){}}};vm.createContext(ctx);
 const before=new Set(Object.keys(ctx));
 try{vm.runInContext(fs.readFileSync(path.join(SRC,f),'utf8'),ctx,{filename:f})}catch(e){console.log('跳过',f,e.message);continue}
 const out={};for(const k of Object.keys(ctx))if(!before.has(k)){try{out[k]=JSON.parse(JSON.stringify(ctx[k]))}catch(e){out[k]='不可序列化'}}
 fs.writeFileSync(path.join(OUT,f.replace(/\.js$/,'.json')),JSON.stringify(out));console.log(f,Object.keys(out).join(','));}
