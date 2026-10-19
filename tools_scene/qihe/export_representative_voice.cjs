// Export the actual new narrative module, with stable text-bound IDs.
// This is a pending production plan, not a voice binding or generation job.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),sources=['story/01-开始/三方-*.ink（经 docs/story-lines.csv）'];
const names=new Set(['徐令仪','岑霜','沈雁回','叶蘅','周砚','陆衡','陈伯','乌魁','护院','采办随从','药商','周婶','差役']);
// 2026-10-19：三方台词已迁入 ink 剧本（story/01-开始/三方-*.ink），改读构建导出的逐句总表 docs/story-lines.csv
const rows=[],seen=new Set();
const parseCsv=t=>t.replace(/^\ufeff/,'').split('\n').slice(1).filter(Boolean).map(l=>{const c=[];let cur='',q=false;for(let i=0;i<l.length;i++){const ch=l[i];if(q){if(ch==='"'&&l[i+1]==='"'){cur+='"';i++}else if(ch==='"')q=false;else cur+=ch}else if(ch==='"')q=true;else if(ch===','){c.push(cur);cur=''}else cur+=ch}c.push(cur);return c});
const csv=parseCsv(fs.readFileSync(path.join(root,'docs/story-lines.csv'),'utf8'));
for(const [lineId,,file,,speaker,,text] of csv){
 if(!/^01-开始\/三方-/.test(file)||!names.has(speaker))continue;
 const source='story/'+file,key=speaker+'\n'+text;if(seen.has(key))continue;seen.add(key);
 const priority=/执事徐令仪|归烬堂岑霜|沈雁回，受|没有委托|没.*同意|收剑|手收|停下|开路|署名|第十七|旧药罐六只|原医者|赔偿|先救/.test(text)?'P1':'P2';
 const delivery=/收剑|手收|停下|开路|不许|松手/.test(text)?'短促命令':/署名|我核错|记我|赔偿/.test(text)?'克制认责':/没.*同意|没有委托|不许碰/.test(text)?'明确拒绝':/第十七|附页|原医者|底单/.test(text)?'冷静核对':'按身份自然交谈';
 rows.push({id:'QH-REP-'+crypto.createHash('sha256').update(key).digest('hex').slice(0,12),speaker,text,source,line:lineId,priority,delivery,status:'pending_voice',audio:null});
}
const dir=path.join(root,'docs/design/qihe-map/scripts');fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'representatives-voice-plan.json'),JSON.stringify({date:'2026-10-10',scope:'当前8792三方主线、提前接洽与三件支线的实际固定台词；不含旁白／萧白，不代表整章全部语音',generated:false,old_audio_reuse:false,rows},null,2)+'\n');
fs.writeFileSync(path.join(dir,'representatives-voice-plan.md'),[
 '# 三位主事人实际台词与拟配音','',
 '2026-10-10。由当前8792实际加载的qihe-representatives.js与qihe-outsiders.js导出，按姓名与正文生成稳定ID。包括三方主线、提前接洽及改由主事人交接的三件支线；旁白、萧白不配音。第一夜转述与山居的其余文字仍由各自剧本维护，本表不是全章语音覆盖报告。','',
 'P1优先身份、下令、拒绝、关键证据和署名承担责任；P2为补充交谈。口吻是制作建议。所有条目均待生成，未绑定音色、未提交选音后台任务；已改正文和说话人的旧音频不可套用。','',
 `[机器清单](representatives-voice-plan.json) · [接入合同](../three-representatives.md) · [运行源码](../../../../js/qihe-representatives.js)`,'',
 '| ID | 角色 | 优先 | 口吻 | 实际台词 |','| --- | --- | --- | --- | --- |',
 ...rows.map(r=>`| ${r.id} | ${r.speaker} | ${r.priority} | ${r.delivery} | ${r.text.replace(/\n/g,'<br>').replace(/\|/g,'\\|')} |`),'',
 '更新运行正文后重新执行node tools_scene/qihe/export_representative_voice.cjs；全文变更会产生新ID。绑定音色与增量生成另走选音后台，不能把本表pending状态写为已有可播音频。',''
].join('\n'));
console.log(JSON.stringify({lines:rows.length,P1:rows.filter(r=>r.priority==='P1').length,P2:rows.filter(r=>r.priority==='P2').length,generated:false}));
