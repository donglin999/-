# coding: utf-8
"""Build the per-line manuscript and runtime text overlay from the authored source."""
import argparse,json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT.parent/'xiaojianghu/docs/design/scripts/chapter-two-dialogue.json'
DOC=ROOT.parent/'xiaojianghu/docs/design/cultivation-rework-20261012/dialogue.md'
TARGET=ROOT/'js/qh-mode-cultivation-dialogue.js'
args=argparse.ArgumentParser();args.add_argument('--check',action='store_true');opts=args.parse_args();d=json.loads(SOURCE.read_text())
labels={'hero':'萧白','hero_short':'萧白·短发','hero_mid':'萧白·半长发','hero_long':'萧白·长发','zhou':'周砚','shimu':'江采薇','yin':'殷红缨','zhong':'钟拙','fang':'方迟','dou':'卢小豆','man':'周小满','pei':'裴知古','peishu':'裴先生','ye':'叶蘅','lu':'陆衡','title':'字幕卡','narrator':'旁白','goose':'将军','mo_songnian':'莫松年','meng_zhiwei':'孟知微','zhaochuan_courier':'照川信使','recipient':'收件人'}
def h(t):return str(t).replace('|','／').replace('\n','<br>')
def condition(row):
 contexts=[d['contextTable'][i] for i in row['contextIndices']]
 if len(contexts)==d['contextCount']:return '所有可达条件（仍须本场前置）'
 all_values=[x.split('／') for x in d['contextTable']];vals=[x.split('／') for x in contexts];parts=[]
 for i in range(5):
  v=list(dict.fromkeys(x[i] for x in vals));a=set(x[i] for x in all_values)
  if set(v)!=a:parts.append('、'.join(v))
 return '；'.join(parts) or '条件组合见机器源 contextIndices（'+str(len(contexts))+'/'+str(d['contextCount'])+'）'
text=['# 第二章逐句对白与演出设计稿','',f"2026-10-12 · 当前90场，{len(d['lines'])}条含条件差异的演出句；{d['editorialChanges']}条修订记录。另含{len(d['activities'])}项活动说明／结果与{len(d.get('correspondence',[]))}条往来文本。所有修订为本项目原创，不复制《侠客风云传》台词。",'', '[收益、传承与参考依据](README.md) · [机器编辑源](../scripts/chapter-two-dialogue.json)','', '这是逐句采用表。**保留**是保留具体生活对白，不是遗漏；**改写**同时列原句与采用句。条件来自384组实际引擎快照枚举，成年、所学拳剑步法、三种送药方式、陈伯伤情与关系差异没有混为一套。表情和演员表沿现行演出合同；未手工指定表情者按人物基础表情及当前剧情调度，不能推断为演员缺席。场景前置仍由原事件负责。','', '台词发言目的的第一层由句型和接话位置整理，本场意图是逐场编辑判断；正文是完整可审阅采用文本。新高阶武学授课仍列待实施，不夹入现有对白冒充已学。','', '## 场次索引','', '| 场次 | 时段（slot） | 地点 | 句数 |','| --- | --- | --- | --- |']
for sc in d['scenes']:text.append(f"| [{sc['name']}](#{sc['id']}) `{sc['id']}` | {sc['window'][0]}–{sc['window'][1]} | {h(sc['place'])}·{h(sc['time'])} | {sum(l['event']==sc['id'] for l in d['lines'])} |")
changes={}
for sc in d['scenes']:
 text+=['',f"<a id=\"{sc['id']}\"></a>",f"## {sc['name']} · {sc['id']}",'',sc['intent'],'',f"时段：{sc['window']}；地点：{sc['place']}／{sc['time']}；前置教学：{'、'.join(sc['requires']) or '已入谷'}；前置事实：{'、'.join(sc['factRequires']) or '依日历／地点'}；关系：{sc['relNeed'] or '无额外门槛'}；成年限定：{'是' if sc['adultOnly'] else '否'}。",'',f"结算：{sc['gain']} +{sc['amount']}，按[收益表](README.md)落到实际数值；关系以所选事件账本为准。{sc['staging']}",'']
 for l in [l for l in d['lines'] if l['event']==sc['id']]:
  text += [f"### {l['id']} · {l['phase']} · {labels.get(l['speaker'],l['speaker'])}",'',f"**采用（{l['decision']}）**：{l['text']}",'']
  if l['text']!=l['sourceText']:text += [f"原句：{l['sourceText']}",''];changes.setdefault(l['event'],{})[l['sourceText']]=l['text']
  text += [f"- 条件：{condition(l)}。",f"- 发言设计：{l['note']}",f"- 承接：{l['replyTo'] or '本段开场／转场后的第一句'}",f"- 演出：{l['place']}／{l['time']}；表情 {l['mood'] or '按人物基础态与本场调度'}；在场 {'、'.join(labels.get(a,a) for a in l['cast'])}。",'']
text+=['','## 活动入口、选项和结果旁白','', '这部分是界面说明，不让教师念成规章。首次授课的名称与实际招式ID见总方案；既有短剧情按原顺序继续，结果的数值改由真实结算解释。','']
for a in d['activities']:
 text += [f"### {a['id']} · {a['name']}",'',f"导师／来源：{a['teacher']}；地点：{a.get('place','原活动地点')}；基础收益：{a.get('gain')} +{a.get('amount',0)}（心情倍率另算；通信不发空泛进度）。",'',f"入口说明：{a.get('task','此入口依当前日程开放')}",'',f"结果旁白：{a.get('feedback','按实际结果结算')}",'']
 for i,c in enumerate(a['choice']):text.append(f"- 选项 {i+1}：{c}。目的：选择本次学习或互动方式，结果读取活动实际结算。")
 for phase,lines in [('intro',a['introLines'])]+[(k,v) for k,v in a['introByDelivery'].items()]:
  for i,l in enumerate(lines):text += [f"- `{a['id']}-{phase}-{i+1}` {labels.get(l['speaker'],l['speaker'])}：{l['text']}。承接本次具体课题，不代说系统数值；在场沿本活动定义。"]
 if a['resultLine']:text.append(f"- 收束台词：{a['resultLine']}。结果数值独立显示。")
 text.append('')
text+=['## 人物信件、收礼与回物逐句稿','', '信件由本人写或由明确署名的人带话。重复物品与关系上限由系统记录，人物不逐条读出算法。回物文案要与实际资源一致。','']
for l in d.get('correspondence',[]):
 text += [f"### {l['id']} · {l['name']} · {l['field']} {l.get('gift','')}",'',l['text'],'',f"发言目的：{'重复送同类物品时温和收住，不以抱怨惩罚玩家' if l['field']=='repeat' else '把信或礼物接回此人的当下生活；实际关系变化在人物页和结果区显示'}。"]
 if l['sourceText']!=l['text']:text+=['',f"原句：{l['sourceText']}"]
text+=['','## 直接入门与传艺界面对白','']
for l in d.get('ui',[]):text += [f"- `{l['id']}` {l['speaker']}：{l['text']}。{l['note']}"]
# Embed changed strings only. Authoritative full ledger stays in the design library.
config={'version':d['version'],'sceneCount':len(d['scenes']),'lineCount':len(d['lines']),'changes':changes,'activities':{a['id']:{k:a[k] for k in ['task','feedback'] if k in a} for a in d['activities']},'correspondence':d.get('correspondence',[]),'ui':{l['id']:l['text'] for l in d.get('ui',[])},'apprenticeship':[[l['engineSpeaker'],l['text']] for l in d.get('ui',[]) if l.get('group')=='apprenticeship']}
js='''/* Generated by tools_story/build_cultivation_dialogue.py; edit the authoring source. */
(function(root){'use strict';
const D=CONFIG;
function apply(id,x){const m=D.changes[id]||{},lines=ls=>ls.map(l=>({...l,text:m[l.text]??l.text}));return {...x,intro:lines(x.intro),closing:lines(x.closing),choices:x.choices.map(c=>({...c,lines:lines(c.lines)}))};}
function activities(data){for(const a of data.actions)if(D.activities[a.id])Object.assign(a,D.activities[a.id]);}
function relations(r){for(const l of D.correspondence){const p=r.profiles[l.name];if(!p)throw Error('Missing dialogue profile '+l.name);if(l.field==='gifts')p.gifts[l.gift]=l.text;else p[l.field]=l.text;}}
const api={...D,apply,activities,relations};if(typeof module==='object'&&module.exports)module.exports=api;else root.CultivationDialogue=api;
})(typeof globalThis!=='undefined'?globalThis:this);
'''.replace('CONFIG',json.dumps(config,ensure_ascii=False,separators=(',',':')))
expected={DOC:'\n'.join(text)+'\n',TARGET:js}
for file,body in expected.items():
 if opts.check:
  if not file.exists() or file.read_text()!=body:raise SystemExit('Out of date: '+str(file))
 else:file.write_text(body)
print(json.dumps({'status':'checked' if opts.check else 'built','scenes':len(d['scenes']),'lines':len(d['lines']),'editorial_records':d['editorialChanges'],'source_sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'doc_bytes':DOC.stat().st_size},ensure_ascii=False))
