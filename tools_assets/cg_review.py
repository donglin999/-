# -*- coding: utf-8 -*-
"""Validate active CG selection and review provenance, not visual quality."""
import json,hashlib,re
from PIL import Image

def selection_errors(root,doc,cg_source):
 errors=[]
 # A decodable historical image is not permission to put a rejected CG back in the story.
 # This checks selection and review provenance; it does not recognize anatomy or judge art.
 by_id={a['id']:a for a in doc['assets']}
 selected_cgs=re.findall(r"asset\s*:\s*['\"](cg_[^'\"]+)['\"]",cg_source)
 for cg_id in selected_cgs:
  row=by_id.get(cg_id)
  if not row:errors.append('selected CG not registered '+cg_id);continue
  if row.get('acceptance_status','').startswith(('retired','rejected')):errors.append('rejected CG selected by story '+cg_id)
  record=row.get('visual_acceptance_record')
  if record:
   try:
    review=json.loads((root/record).read_text())
    source_path=root/row['original_path']
    actual_source_sha=hashlib.sha256(source_path.read_bytes()).hexdigest()
    if review.get('asset_id')!=cg_id or review.get('accepted') is not True:errors.append('CG visual review not accepted '+cg_id)
    if review.get('source_sha256')!=actual_source_sha:errors.append('CG source changed after visual review '+cg_id)
    checks=review.get('checks',[])
    if not checks or any(c.get('result')!='pass' or not c.get('observed') for c in checks):errors.append('CG visual review incomplete '+cg_id)
    with Image.open(root/row['path']) as final,Image.open(source_path) as native:
     if final.size!=native.size or final.convert('RGBA').tobytes()!=native.convert('RGBA').tobytes():errors.append('CG differs from visually reviewed native source '+cg_id)
   except Exception as e:errors.append('invalid CG visual evidence '+cg_id+': '+str(e))
 return errors
