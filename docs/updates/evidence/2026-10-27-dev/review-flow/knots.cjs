// 临时评审脚本：核对 JS 里调用的剧本名在 index.html 加载的编译物里是否存在
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'../../../../..');
const html=fs.readFileSync(root+'/index.html','utf8');
const loaded=[...html.matchAll(/js\/story-data\/([\w]+)\.js/g)].map(m=>m[1]);
const defined={};for(const f of fs.readdirSync(root+'/js/story-data')){const s=fs.readFileSync(root+'/js/story-data/'+f,'utf8');for(const m of s.matchAll(/STORY_DATA\["([^"]+)"\]/g))defined[m[1]]=f.replace('.js','')}
const files=['qihe-lamp-watcher','qihe-town','qihe-aqi','qihe-steal','qihe-steal-data','qihe-gift','qihe-representatives','qihe-chapter','qihe-npc-ui','qihe-npc-core'];
for(const f of files){const s=fs.readFileSync(root+'/js/'+f+'.js','utf8');const used=new Set();
 for(const m of s.matchAll(/play\('([\w]+)'/g))used.add(m[1]);for(const m of s.matchAll(/'((?:qh|fq|ye)_[\w]+)'/g))if(!/^qh_(rope|tinder|sewing_kit|candy|fried_rice|old_hat|flat_stone|shouzhu|xinhuo|copper|dry_branch|river_reed|wild_herb|song|practice|staff|guiyun|dragonfly|merchant|compass|escort|grain|lesson)/.test(m[1]))used.add(m[1]);
 for(const k of used){const file=defined[k];if(!file)console.log(f,'未定义',k);else if(!loaded.includes(file))console.log(f,'定义在未加载文件',k,file)}}
// 动态拼接的：qh_riddle_*、ye_steal_*、qh_gift_line、qh_trade_line
for(const id of ['gao','zhong','ka','na','si','cha','pang','nai','lv','ming','hao','zao','she','tun','fen','yan','qing','chuang','last'])if(!defined['qh_riddle_'+id])console.log('谜题缺',id);else if(!loaded.includes(defined['qh_riddle_'+id]))console.log('谜题未加载',id,defined['qh_riddle_'+id]);
console.log('ye_steal*:',Object.keys(defined).filter(k=>/steal|caught/.test(k)).map(k=>k+'@'+defined[k]+(loaded.includes(defined[k])?'':'(未加载)')).join(' '));
console.log('gift/trade:',['qh_gift_line','qh_trade_line'].map(k=>k+'@'+(defined[k]||'无')).join(' '));
