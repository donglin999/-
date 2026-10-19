"""Merge authored battle cues without changing dialogue, auditions or bindings."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
EVENTS={'turn','attack','hurt','down','support'}
def sync():
    path=ROOT/'tools_audio/voice_lines.json';catalog=json.loads(path.read_text())
    authored=json.loads((ROOT/'tools_audio/battle_voice_lines.json').read_text())['lines']
    chars={c['id']:c for c in catalog['characters']};old={l['id']:l for l in catalog['lines']}
    assert len({l['id'] for l in authored})==len(authored)
    for l in authored:
        assert l['character_id'] in chars and l['battle_event'] in EVENTS and l['kind']=='battle'
        assert l['id'].startswith('battle.'+l['character_id']+'.')
        prev=old.get(l['id'])
        if prev and any(prev.get(k)!=l.get(k) for k in ('text','emotion_api','delivery_notes')):
            l['revision']=max(l['revision'],prev.get('revision',1)+1)
        elif prev:l['revision']=prev.get('revision',1)
        chars[l['character_id']]['battle_voice_enabled']=True
    managed={l['id']:l for l in authored}
    catalog['lines']=[managed.get(l['id'],l) for l in catalog['lines']]+[l for l in authored if l['id'] not in old]
    path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'battle_lines':len(authored),'characters':len({l['character_id'] for l in authored})}))
if __name__=='__main__':sync()
