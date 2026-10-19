"""Sync current casting and selected opening script lines, without synthesis or binding writes."""
import argparse, hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIO = ROOT / 'tools_audio'
ALIASES = {'ye-heng': 'ye', 'su-zhi': 'suzhi'}
EMOTIONS = {'neutral': 'calm', 'happy': 'happy', 'sad': 'sad', 'angry': 'angry', 'surprise': 'surprised'}
OPENING_IDS = [
    'P-01-04','P-01-09','P-01-14','P-04-10','P-05-07',
    'C1-01-07','C1-04-03','C1-05-02','C1-06-09','C1-08-28','C1-08-29','C1-12-15',
    'C1-01-09','C1-01-11','C1-04-10','C1-04-19','C1-08-18','C1-08-20','C1-08-22','C1-12-02',
    'C1-00-11','C1-00-16','C1-A4-A01','C1-A4-B01','C1-05-A02','C1-05-B02','C1-06-02','C1-11-20',
    'P-03-05','P-03-06','P-03-11','P-03-15','C1-05-A05','C1-05-A11','C1-09-03','C1-09-08','C1-09-09',
    'C1-02-09','C1-02-13','C1-02-18','C1-04-11','C1-04-13','C1-08-14',
    'C1-02-02','C1-02-06','C1-04-02','C1-04-15','C1-04-16','C1-04-18','C1-08-06','C1-08-08','C1-08-10',
    'C1-00-03','C1-00-05','C1-01-04','C1-01-06','C1-01-14','C1-02-12','C1-02-16',
]

def load(path):
    return json.loads(path.read_text())

def opening_scripts():
    rows = {}
    for filename in ['prologue-arrival.md', 'prologue-village.md']:
        scene = ''
        path = ROOT / 'docs/design' / filename
        for line in path.read_text().splitlines():
            heading = re.match(r'^## (P-[\w]+)', line)
            if heading:
                scene = heading[1]
            match = re.match(r'^- ([A-Z]*\d+) ([^：]+)：[“"](.*)[”"]$', line)
            if match:
                rows[scene+'-'+match[1]] = dict(speaker=re.sub(r'（.*?）', '', match[2]), text=match[3], file='docs/design/'+filename, event=scene)
    path = ROOT / 'js/chapter1-data.js'
    data = json.loads(path.read_text().split('=', 1)[1].strip().rstrip(';'))
    for scene, spec in data.items():
        for line in spec['lines']:
            if line['speaker']:
                rows[scene+'-'+line['tag']] = dict(speaker=line['speaker'], text=line['text'], file='js/chapter1-data.js', event=scene)
    return rows

def sync(check=False):
    catalog = load(AUDIO / 'voice_lines.json')
    auditions = load(AUDIO / 'voice_auditions.json')
    casting = load(AUDIO / 'voice_casting.json')
    atlas = load(ROOT / 'docs/design/story-atlas.json')
    art = load(ROOT / 'art_sources/companion_dialogue_states_20261004/manifest.json')
    art_by_id = {c['character_id']: c for c in art['characters']}
    profiles = {c['id']: c for c in casting['characters']}
    oldchars = {c['id']: c for c in catalog['characters']}
    chars, draft = [], []
    companion_count = sum(person['type']=='companion' for person in atlas['characters'])
    for person in atlas['characters']:
        if person['type'] != 'companion':
            continue
        aid = person['id']; cid = ALIASES.get(aid, aid)
        profile = profiles[cid]
        neutral = next(j for j in art_by_id[aid]['jobs'] if j['key'] == 'neutral')
        portrait_url = '/'+neutral['runtime_file']+'?rev='+neutral['export']['sha256'][:12]
        chars.append({**oldchars.get(cid, {}), 'id': cid, 'name': person['name'], 'atlas_character_id': aid,
                      'group': '可加入同伴', 'voice_mode': 'full', 'gender': person['gender'], 'age': person['age'],
                      'persona': profile['persona'], 'voice_direction': profile['voice_direction'],
                      'source_document': 'docs/design/'+person['source'], 'portrait_url': portrait_url})
        for job in art_by_id[aid]['jobs']:
            key = job['key']; emotion_api = EMOTIONS.get(key, 'calm')
            row = dict(id='casting.'+cid+'.'+key, character_id=cid, text=job['sample_line'],
                       type='casting', kind='casting', emotion=job['label'], emotion_api=emotion_api,
                       delivery_notes=profile['voice_direction']+'；本状态：'+job['label']+'。不朗读动作说明。',
                       portrait=job['runtime_file'], por=job['runtime_file'], state_key=key,
                       scene='dialogue_state_preview', source={'file': 'docs/design/companion-performance/'+aid+'.md', 'event': job['id'], 'selector': job['sample_line']},
                       priority='casting', status='active', revision=1, voice_enabled=False,
                       sync_group='current_casting', planned_reason='对白状态试听示例，未采用为游戏剧情台词')
            draft.append(row)
        # Existing samples and confirmed bindings stay stable; new companions get three contrasting samples.
        if cid not in ALIASES.values():
            auditions['characters'][cid] = [{k:r[k] for k in ['text','emotion','emotion_api','delivery_notes','revision']} for r in draft[-6:] if r['state_key'] in ['neutral','happy','angry']]
    for profile in casting['characters']:
        if profile['id'] in {c['id'] for c in chars}:
            continue
        chars.append({**oldchars.get(profile['id'], {}), **{k:profile[k] for k in ['id','name','group','voice_mode','gender','age','persona','voice_direction','por','age_basis']}})
        auditions['characters'][profile['id']] = profile['auditions']
    newids = {c['id'] for c in chars}
    chars.extend(c for c in catalog['characters'] if c['id'] not in newids)
    name_to_id = {c['name']: c['id'] for c in chars}
    scripts = opening_scripts()
    selected = []
    for key in OPENING_IDS:
        if key not in scripts:
            raise ValueError('剧情台词 ID 不存在：'+key)
        original = scripts[key]
        cid = name_to_id.get(original['speaker'])
        if not cid or original['speaker'] in ['萧白', '']:
            raise ValueError('未登记配音角色：'+key+' '+original['speaker'])
        if original['event'] in ['C1-04','C1-05','C1-06']:
            emotion, api, notes = '紧急但清楚', 'angry' if cid == 'wukui' else 'calm', '短促投声，不持续尖叫，保留人物声线和吐字。'
        elif key in ['P-04-10']:
            emotion, api, notes = '思亲低落', 'sad', '停顿后轻落，情绪收住，不强加哭腔。'
        else:
            emotion, api, notes = '坚定日常', 'calm', '按完整原文自然停顿，保持身份与当前事件的分寸。'
        direction = profiles[cid]['voice_direction'] if cid in profiles else ''
        selected.append(dict(id='opening.'+key, character_id=cid, text=original['text'], type='dialogue', kind='dialogue',
                             emotion=emotion, emotion_api=api, delivery_notes=direction+'；'+notes, scene=original['event'],
                             source={'file': original['file'], 'event': original['event'], 'selector': original['text'], 'line_id': key},
                             priority='core', status='active', revision=1, voice_enabled=True, playback='once_per_event', sync_group='opening_key_lines'))
    for char in chars:
        if char['id'] not in profiles or char.get('voice_mode') != 'single':
            continue
        rows = [l for l in selected if l['character_id'] == char['id']]
        if not rows:
            raise ValueError('新 NPC 没有关键语句：'+char['id'])
        char.update(single_line_id=rows[0]['id'], single_preview_index=0)
        for row in rows:
            row['voice_enabled'] = row is rows[0]
    oldrows = {l['id']:l for l in catalog['lines']}
    managed = {r['id']:r for r in draft+selected}
    for rid, row in managed.items():
        old = oldrows.get(rid)
        if old:
            changed = any(old.get(k) != row.get(k) for k in ['text','emotion','emotion_api','delivery_notes','voice_enabled'])
            row['revision'] = old.get('revision',1)+int(changed)
    for old in catalog['lines']:
        if old.get('sync_group') in ['current_casting','opening_key_lines'] and old['id'] not in managed:
            old.update(status='retired', voice_enabled=False)
    catalog['lines'] = [managed.get(l['id'],l) for l in catalog['lines']]+[r for rid,r in managed.items() if rid not in oldrows]
    catalog['characters'] = chars
    # Ordinary new NPCs keep exactly one production sentence and one audition.
    for char in chars:
        if char['id'] not in profiles or char.get('voice_mode') != 'single':
            continue
        rows = [l for l in catalog['lines'] if l['character_id'] == char['id'] and l['id'] in managed and l['voice_enabled']]
        if not rows:
            raise ValueError('新 NPC 没有关键语句：'+char['id'])
        choice = rows[0]
        auditions['characters'][char['id']] = [{k:choice[k] for k in ['text','emotion','emotion_api','delivery_notes','revision']}]
    source_files=['docs/design/story-atlas.json','art_sources/companion_dialogue_states_20261004/manifest.json','docs/design/opening-state.md']
    catalog['catalog_sync'] = dict(version='current_casting_20261005', companion_count=companion_count, casting_only_count=len(draft), opening_selected_count=len(selected), sources=source_files, source_sha256={f:hashlib.sha256((ROOT/f).read_bytes()).hexdigest() for f in source_files}, binding_policy='preserve_existing_confirmed_bindings')
    outputs = {AUDIO/'voice_lines.json':catalog,AUDIO/'voice_auditions.json':auditions}
    changed=[]
    for path, data in outputs.items():
        text=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
        if path.read_text()!=text:
            changed.append(str(path.relative_to(ROOT)))
            if not check:path.write_text(text)
    return dict(changed=changed,check=check,characters=len(chars),companions=companion_count,casting_only=len(draft),opening_key_lines=len(selected))

if __name__ == '__main__':
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--check',action='store_true');args=parser.parse_args()
    print(json.dumps(sync(args.check),ensure_ascii=False))
