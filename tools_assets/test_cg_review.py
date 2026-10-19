# -*- coding: utf-8 -*-
"""Counterfactual selection checks; never modify game scripts or production files."""
from pathlib import Path
import copy,json
from cg_review import selection_errors

root=Path(__file__).resolve().parents[1]
doc=json.loads((root/'docs/assets/production-assets.json').read_text())
source=(root/'js/qihe-fire-cinematic.js').read_text()
assert selection_errors(root,doc,source)==[]
# An old image remains valid and decodable, but its rejected status must block adoption.
wrong=source.replace('cg_qh_fire_ignition_v3','cg_qh_fire_ignition_v2')
errors=selection_errors(root,doc,wrong)
assert 'rejected CG selected by story cg_qh_fire_ignition_v2' in errors,errors
# Repointing the source to a previous image cannot inherit the new image's review evidence.
changed=copy.deepcopy(doc)
old=next(a for a in doc['assets'] if a['id']=='cg_qh_fire_ignition_v2')
new=next(a for a in changed['assets'] if a['id']=='cg_qh_fire_ignition_v3')
new['original_path']=old['original_path']
errors=selection_errors(root,changed,source)
assert 'CG source changed after visual review cg_qh_fire_ignition_v3' in errors,errors
print('PASS CG selection guard: current accepted / rejected historical / changed source')
