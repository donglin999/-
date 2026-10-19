#!/usr/bin/env python3
"""Compile an isolated design review; never writes runtime JS, saves or adopted scripts."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUTHOR = ROOT.parent / 'xiaojianghu/docs/design/pre-hangao-completion-20261013'
OUT = ROOT / 'review/pre-hangao-completion-20261013'
SOURCE = AUTHOR.parent / 'scripts/chapter-two-dialogue.json'
source = json.loads(SOURCE.read_text())
inventory = {s['id']: s for s in json.loads((OUT / 'existing-inventory.json').read_text())}
revisions = json.loads((AUTHOR / 'revisions.json').read_text())
revisions.update(json.loads((AUTHOR / 'continuity-patches.json').read_text()))
additions = json.loads((AUTHOR / 'additions.json').read_text())
short = json.loads((ROOT / 'review/cultivation-minimax-compare-20261012/short-rewrite/edited-lines.json').read_text())
names = {'hero':'萧白','hero_short':'萧白','hero_mid':'萧白','hero_long':'萧白','ye':'叶蘅','zhou':'周砚','zhong':'钟拙','shimu':'江采薇','yin':'殷红缨','fang':'方迟','dou':'卢小豆','man':'周小满','pei':'裴知古','peishu':'裴述','goose':'将军','lu':'陆衡','recipient':'接药人','mo_songnian':'莫松年','meng_zhiwei':'孟知微','zhaochuan_courier':'照川来客','title':'字幕','narrator':'旁白','stage':'动作'}

def hero_key(scene):
    return next((x for x in scene['cast'] if x.startswith('hero')), 'hero')

def normalize(beats, scene, phase):
    result=[]
    present=list(scene['cast'])
    if scene['id']=='gy_m02' and phase=='opening': present=[a for a in present if a!='zhou']
    if scene['id']=='hg_gate' and phase=='ending': present=[a for a in present if a!='yin']
    for i, raw in enumerate(beats):
        b = dict(speaker=raw[0], text=raw[1]) if isinstance(raw,list) else copy.deepcopy(raw)
        if b['speaker']=='hero': b['speaker']=hero_key(scene)
        if scene['id']=='gy_m02' and b['speaker']=='zhou' and 'zhou' not in present: present.append('zhou')
        b['id']=b.get('id',f"{scene['id']}:{phase}:{i+1}")
        b['text']=b['text'].replace('襄阳','汉皋')
        if b['speaker']=='goose' and 'goose' not in present: present.append('goose')
        b.setdefault('cast',list(present))
        result.append(b)
        if b['speaker']=='shimu' and '将军' in b['text'] and ('出去' in b['text'] or '回窝' in b['text']):
            present=[p for p in present if p!='goose']
    return result

scenes=[]
for original in source['scenes']:
    if original['window'][0]>=20: continue
    sid=original['id']; item=copy.deepcopy(original); item['status']='既有收录'
    item['requires']=inventory[sid]['requires'];item['skillRequires']=inventory[sid]['skillRequires'];item['auto']=inventory[sid]['auto'];item['fight']=inventory[sid]['fight']
    item['cost']=inventory[sid]['cost']
    item['effects']=['原事件结算沿现行版本；本预览不执行任何奖励或保存。']
    item['expiry']='沿原窗口与补看规则；候选不能替代正式迁移验证。'
    ls=[]
    for l in source['lines']:
        if l['event']!=sid: continue
        b={k:copy.deepcopy(l[k]) for k in ['id','speaker','text','cast','phase','mood','contextIndices']}
        if len(b['contextIndices'])==source['contextCount']: del b['contextIndices']
        ls.append(b)
    item['opening']=normalize([l for l in ls if l['phase']=='intro'],item,'opening')
    item['ending']=normalize([l for l in ls if l['phase']=='closing'],item,'ending')
    labels={b['id']:b['label'] for b in inventory[sid]['choices']}
    keys=list(dict.fromkeys(l['phase'].split(':',1)[1] for l in ls if l['phase'].startswith('choice:')))
    item['choices']=[dict(id=k,label=labels.get(k,k),lines=normalize([l for l in ls if l['phase']=='choice:'+k],item,k)) for k in keys]
    item['staging']=item.pop('staging','沿现行在场名单。')+' 逐句保留原演员名单；未说话不等于离场。'
    change=revisions.get(sid)
    if change:
        item['status']='候选修订';item['intent']=change.get('intent',item['intent']);item['staging']=change['staging']
        if change.get('cast'): item['cast']=change['cast']
        new=short[change['useShort']] if change.get('useShort') else change
        if 'opening' in new:
            item['opening']=normalize(new['opening'],item,'opening')
            item['ending']=normalize(new.get('ending',[]),item,'ending')
            choices=new.get('choices',new.get('branches',[]))
            item['choices']=[dict(id=b['id'],label=b['label'],when=b.get('when',{}),lines=normalize(b.get('lines',b.get('beats',[])),item,b['id'])) for b in choices]
        patches=change.get('textPatches',{})
        for b in item['opening']+item['ending']+[l for c in item['choices'] for l in c['lines']]:
            b['text']=patches.get(b['text'],b['text']).replace('襄阳','汉皋')
    scenes.append(item)

for raw in additions:
    item=copy.deepcopy(raw);item['status']='新增候选';item['auto']=True;item['fight']=False;item['skillRequires']=[]
    item['opening']=normalize(item['opening'],item,'opening');item['ending']=normalize(item.get('ending',[]),item,'ending')
    item['choices']=[dict(id=b['id'],label=b['label'],when=b.get('when',{}),lines=normalize(b['lines'],item,b['id'])) for b in item.get('choices',[])]
    scenes.append(item)

# Chronological review order; slot19 sequence deliberately replaces the old departure order.
priority={'gy_noodles':-10,'gy_prelude_tour':-9,'gy_prelude_stance':-8,'gy_prelude_xinfa':-7,'gy_prelude_hair':-6,'gn_depart':1,'gy_m08':2,'hg_farewell':3,'hg_road':1,'hg_gate':2}
scenes.sort(key=lambda s:(s['window'][0],priority.get(s['id'],0),s['id']))
manifest=json.loads((ROOT/'docs/assets/production-assets.json').read_text())['assets']
assets={a['id']:a['path'] for a in manifest}
actors={}
for key,name in names.items():
    if key in ['stage','title','narrator','recipient']:continue
    art='hero_long' if key=='hero' else key
    aid=f'cu_household-v1_{art}_normal_png'
    if aid not in assets:aid=f'cu_household-v1_{art}_png'
    if aid in assets:actors[key]=dict(name=name,asset_id=aid,url='../../'+assets[aid])
places={
 'kitchen':('厨房','cu_story-bg-v1_kitchen_png'),
 'training_ground':('练武场','cu_story-bg-v1_training_ground_png'),
 'courtyard':('谷中庭院','cu_bg_mountain_spring_v1'),
 'porch':('廊下','cu_visitors-v1_reception-porch_png'),
 '谷中接待廊':('接待廊','cu_visitors-v1_reception-porch_png'),
 'bookhouse':('溪东书屋','cu_neighbors-v1_bookhouse_png'),
 'bookhouse_inside':('半亩书屋内','cu_neighbors-v1_bookhouse_inside_png'),
 'study':('师门书房',None),'mountain_road':('入城山路',None),'hangao_gate':('汉皋南门外',None),
 'terraces':('梯田人家',None),'watermill':('水碓房',None),'bamboo_path':('竹径',None)
}
placeData={k:dict(name=n,asset_id=a,url='../../'+assets[a] if a in assets else None) for k,(n,a) in places.items()}
lessons=json.loads((AUTHOR/'lessons.json').read_text())
allbeats=[b for s in scenes for b in s['opening']+s['ending']+[l for c in s['choices'] for l in c['lines']]]
assert len(scenes)==46 and len({s['id'] for s in scenes})==46
for b in allbeats:
    assert b['speaker'] in names,(b['id'],b['speaker'])
    assert b['speaker'] in ['title','narrator','stage'] or b['speaker'] in b['cast'],(b['id'],b['speaker'],b['cast'])
    assert '襄阳' not in b['text'],b['id']
for p in list(actors.values())+list(placeData.values()):
    if p.get('asset_id'): assert (ROOT/assets[p['asset_id']]).exists()
payload=dict(version='PRE-HANGAO-DESIGN-20261013',status='draft_preview_only',source_sha256=hashlib.sha256(SOURCE.read_bytes()).hexdigest(),names=names,actors=actors,places=placeData,contexts=source['contextTable'],scenes=scenes,lessons=lessons)
(OUT/'data.json').write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':'))+'\n')
md=['# 汉皋入城前 · 全量逐句候选稿','', '本轮只作设计审阅；既有40场完整收录，新增6场。条件句互斥，选择分支不连续全播。角色/剧情状态可在[本地预览](http://127.0.0.1:8792/review/pre-hangao-completion-20261013/)切换。','', '[总方案](README.md) · [知古与交接](pei-and-handoff.md) · [演出](staging.md) · [接入](implementation.md)','']
for s in scenes:
    md += [f"## {s['name']} · {s['id']}",'',f"{s['status']}；slot {s['window']}；{s['place']}；剧情成本 {s['cost']}。",'',s['intent'],'',f"演出：{s['staging']}",'']
    phases=[('开场',s['opening'])]
    if s.get('letters'):
        phases.append(('信件',[dict(speaker='letter',text=l['text'],author=l['author']) for l in s['letters']]))
    phases += [(f"选择：{c['label']}",c['lines']) for c in s['choices']]+[('收束',s['ending'])]
    for title,beats in phases:
        if not beats:continue
        md += [f'### {title}','']
        for b in beats:
            condition=''
            if b.get('when'):condition='【'+json.dumps(b['when'],ensure_ascii=False)+'】'
            elif b.get('contextIndices'):condition='【既有条件分支；在预览按培养/送药/伤势筛选】'
            label=f"{b['author']}（署名信件）" if b['speaker']=='letter' else names[b['speaker']]
            md.append(f"- **{label}**{condition}：{b['text']}")
        md.append('')
    md += ['效果：'+'；'.join(s.get('effects',[])),'']
md+=['## 核心课程：首次、复习与进步','']
for lesson in lessons:
    md += [f"### {lesson['name']}",'',lesson['gate'],'']
    for key,label in [('first','首次'),('repeat','复习'),('milestone','进步')]:
        md.append(f'**{label}**')
        md += [f"- {names[a]}：{t}" for a,t in lesson[key]]+['']
(AUTHOR/'dialogue.md').write_text('\n'.join(md)+'\n')
# Keep the served documents reproducible from their authoritative design files.
(OUT/'documents').mkdir(exist_ok=True)
documents={}
for name in ['README','pei-and-handoff','staging','implementation','dialogue']:
    documents[name]=(AUTHOR/(name+'.md')).read_text()
    (OUT/'documents'/(name+'.md')).write_text(documents[name])
(OUT/'documents.json').write_text(json.dumps(documents,ensure_ascii=False)+'\n')
report=dict(status='pass',source_scenes=40,scenes=46,revised=sum(s['status']=='候选修订' for s in scenes),added=6,retained=sum(s['status']=='既有收录' for s in scenes),authored_blocks=len(allbeats),lessons=len(lessons),speaker_presence=True,city_name='汉皋',registered_asset_references=True,runtime_modified=False)
(OUT/'build-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
