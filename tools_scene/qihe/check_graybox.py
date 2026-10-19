from pathlib import Path
from PIL import Image,ImageDraw
from collections import deque
import json
r=Path(__file__).resolve().parents[2]/'art_sources/qihe-expansion-v1';layout=json.loads((r/'layout.json').read_text());report=[]
for key,s in layout.items():
 w,h=s['world'];m=Image.new('1',(w,h));d=ImageDraw.Draw(m);d.rectangle((55,55,w-55,h-55),fill=1)
 for name,(x,y)in s['doors'].items():
  edge=(0,y)if name=='west'else(w,y)if name=='east'else(x,0)if name=='north'else(x,h);d.line([edge,(x,y),(w//2,h//2)],fill=1,width=130)
 for _,(x,y,ow,oh),_ in s['objects']:d.rectangle((x,y,x+ow,y+oh),fill=0)
 def clear(x,y):return all(0<=xx<w and 0<=yy<h and m.getpixel((xx,yy)) for xx,yy in [(x,y),(x-14,y),(x+14,y),(x,y-5),(x,y+3)])
 pts={**s['doors'],**s['actors']};start=next(iter(s['doors'].values()));start=tuple(round(v/8)*8 for v in start);q=deque([start]);seen={start}
 while q:
  x,y=q.popleft()
  for xx,yy in [(x+8,y),(x-8,y),(x,y+8),(x,y-8)]:
   if (xx,yy)not in seen and clear(xx,yy):seen.add((xx,yy));q.append((xx,yy))
 for name,(x,y)in pts.items():report.append(dict(scene=key,anchor=name,clear=bool(clear(x,y)),reachable=any((xx,yy)in seen for xx in range(round(x/8)*8-8,round(x/8)*8+9,8)for yy in range(round(y/8)*8-8,round(y/8)*8+9,8))))
(r/'graybox-checks.json').write_text(json.dumps(dict(scope='original authored graybox only; image-reviewed layout has separate engine tests',checks=report,pass_=all(x['clear']and x['reachable']for x in report)),indent=2));print(len(report),[x for x in report if not(x['clear']and x['reachable'])])
