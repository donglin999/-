// 临时评审脚本：人物随身物品里的运行时 id 是否都在 ITEMS 里登记（偷到/易到后行囊能否显示）
const path=require('path');const {boot}=require(path.resolve(__dirname,'../../../../../tools_scene/qihe/harness.cjs'));
(async()=>{const {run}=await boot();
 console.log(run(`(()=>{const out=[];for(const[id,p]of Object.entries(QIHE_NPC_DATA.PEOPLE))for(const it of p.bag||[])if(it.id&&!ITEMS[it.id])out.push(id+':'+it.n+'('+it.id+')');return out.join(' ')||'全部已登记'})()`));
 process.exit(0)})().catch(e=>{console.error(e);process.exit(1)});
