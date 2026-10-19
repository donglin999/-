#!/usr/bin/env python3
"""Build the standalone walkthrough from flows.json. No game state is read or written."""
import json
from pathlib import Path
p = Path(__file__).resolve().parent
data = json.loads((p / 'flows.json').read_text())
payload = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
template = (p / 'preview.template.html').read_text()
(p / 'preview.html').write_text(template.replace('__FLOW_DATA__', payload))
print('Built preview.html:', len(data['flows']), 'flows,', sum(len(f['steps']) for f in data['flows']), 'steps')
