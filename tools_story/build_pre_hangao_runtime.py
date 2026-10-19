"""Compile adopted pre-city scripts from the single dialogue authoring source."""
import json
from pathlib import Path
R=Path(__file__).resolve().parents[1]
source=R.parent/'xiaojianghu/docs/design/scripts/chapter-two-dialogue.json'
d=json.loads(source.read_text())
if 'preHangao' not in d:
    review=json.loads((R/'review/pre-hangao-completion-20261013/data.json').read_text())
    d['preHangao']={'version':'PRE-HANGAO-RUNTIME-1','adoption':'user_authorized_2026-10-13',
        'scenes':[s for s in review['scenes'] if s['status']!='既有收录'],
        'contexts':review['contexts'],'lessons':review['lessons']}
    source.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
config=d['preHangao']
(R/'js/qh-pre-hangao-data.js').write_text("/* Generated from chapter-two-dialogue.json preHangao; not the review page. */\n(function(r){const d="+json.dumps(config,ensure_ascii=False,separators=(',',':'))+";if(typeof module==='object'&&module.exports)module.exports=d;else r.PreHangaoData=d;})(globalThis);\n")
print(json.dumps({'compiled':len(config['scenes']),'lessons':len(config['lessons'])}))
