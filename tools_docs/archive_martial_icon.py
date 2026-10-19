#!/usr/bin/env python3
"""Archive a built-in imagegen result without altering its pixels; safe to resume by ID."""
import argparse, hashlib, json, shutil
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'art_sources/martial_icons_full_v1'
def main():
 p=argparse.ArgumentParser();p.add_argument('id');p.add_argument('source');args=p.parse_args()
 queue=json.loads((OUT/'prompts.json').read_text());row=next(r for r in queue if r['id']==args.id)
 dest=OUT/(row['icon_id']+'-v1.png');receipt=OUT/(args.id+'.json')
 src=Path(args.source);sha=hashlib.sha256(src.read_bytes()).hexdigest()
 if dest.exists() and hashlib.sha256(dest.read_bytes()).hexdigest()!=sha:raise SystemExit('Refusing to overwrite a different existing image')
 if not dest.exists():shutil.copy2(src,dest)
 with Image.open(dest) as im:
  if im.mode!='RGBA':raise SystemExit('Expected RGBA')
  w,h=im.size;a=im.getchannel('A');bbox=a.point(lambda v:255 if v>16 else 0).getbbox();hist=a.histogram()
  if not bbox or not hist[0]:raise SystemExit('Empty image or no transparent background')
  margins=[bbox[0],bbox[1],w-bbox[2],h-bbox[3]]
 row.update(status='generated_pending_visual_review',path=str(dest.relative_to(ROOT)),source_file=str(src),sha256=sha,size=[w,h],mode='RGBA',alpha_zero_ratio=round(hist[0]/(w*h),4),visible_bbox_alpha_gt16=list(bbox),margin_pixels=margins,technical_review={'has_alpha':True,'resolution_at_least_512':min(w,h)>=512,'visible_margin_8_percent':min(margins)>=min(w,h)*.08},model_returned=None)
 receipt.write_text(json.dumps(row,ensure_ascii=False,indent=2)+'\n')
 print(json.dumps({'id':args.id,'size':[w,h],'archived':True,'margin_pass':row['technical_review']['visible_margin_8_percent']},ensure_ascii=False))
if __name__=='__main__':main()
