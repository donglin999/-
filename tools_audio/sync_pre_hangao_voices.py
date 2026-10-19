"""Append authored current pre-city dialogue; never select or replace voice bindings."""
from pathlib import Path
import hashlib,json,re
ROOT=Path(__file__).resolve().parents[1]
source=json.loads((ROOT/'docs/design/scripts/chapter-two-dialogue.json').read_text())['preHangao']
p=ROOT/'tools_audio/voice_lines.json';catalog=json.loads(p.read_text());known={c['id'] for c in catalog['characters']}
actors={'ye':'ye','pei':'pei-zhigu','zhou':'zhouyan','lu':'lu-heng'}
def spoken(text):
    return bool(re.search(r'[\u4e00-\u9fffA-Za-z0-9]',text)) and not text.startswith(('（','('))
rows={}
for scene in source['scenes']:
    beats=scene['opening']+scene['ending']+[l for c in scene['choices'] for l in c['lines']]
    for l in beats:
        cid=actors.get(l['speaker'])
        if not cid or cid not in known or not spoken(l['text']):continue
        key='prehg.'+cid+'.'+hashlib.sha256(l['text'].encode()).hexdigest()[:14]
        rows[key]=dict(id=key,character_id=cid,text=l['text'],kind='dialogue',type='dialogue',emotion='平常接话',emotion_api='calm',delivery_notes='自然短句，不朗读系统提示或舞台动作。',
            scene=scene['id'],source=dict(file='docs/design/scripts/chapter-two-dialogue.json',event=scene['id'],selector=l.get('id')),priority='current_script',status='active',revision=1,voice_enabled=True,sync_group='pre_hangao_20261013')
for lesson in source['lessons']:
    for stage in ['first','repeat','milestone']:
        for actor,text in lesson[stage]:
            cid=actors.get(actor)
            if not cid or cid not in known or not spoken(text):continue
            key='prehg.'+cid+'.'+hashlib.sha256(text.encode()).hexdigest()[:14]
            rows[key]=dict(id=key,character_id=cid,text=text,kind='dialogue',type='dialogue',emotion='平常接话',emotion_api='calm',delivery_notes='自然短句，不朗读系统提示。',scene=lesson['id'],source=dict(file='docs/design/scripts/chapter-two-dialogue.json',event=lesson['id'],selector=stage),priority='current_script',status='active',revision=1,voice_enabled=True,sync_group='pre_hangao_20261013')
for row in catalog['lines']:
    if row.get('sync_group')=='pre_hangao_20261013' and not spoken(row.get('text','')):
        row['voice_enabled']=False;row['voice_disabled_reason']='标点或舞台停顿保留字幕，不合成语音'
existing={r['id']:r for r in catalog['lines']}
for key,row in rows.items():
    if key in existing:catalog['lines'][catalog['lines'].index(existing[key])]=row
    else:catalog['lines'].append(row)
p.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'authored_lines':len(rows),'actors':{c:sum(r['character_id']==c for r in rows.values()) for c in set(actors.values())},'binding_changed':False},ensure_ascii=False))
