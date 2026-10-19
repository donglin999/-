"""Split the transparent generated atlas; preserve source alpha and pixel detail."""
from pathlib import Path
import json
from PIL import Image
P=Path(__file__).resolve().parents[1]/'art_sources/prologue_village_v2';im=Image.open(P/'prop-kit.png').convert('RGBA')
boxes={'wall_h':[0,180,535,420],'wall_v':[540,0,740,480],'table':[780,110,1254,450],'bench':[0,480,540,795],'basket':[540,480,905,800],'barrel':[915,450,1254,805],'box':[0,840,405,1254],'laundry':[405,805,900,1254],'herbs':[900,805,1254,1254]}
for name,box in boxes.items():
 cut=im.crop(box);bound=cut.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox();assert bound,name;cut=cut.crop(bound);cut.save(P/(name+'.png'))
(P/'kit-crops.json').write_text(json.dumps({'source':'prop-kit.png','sourceSize':list(im.size),'rectangles':boxes},indent=2)+'\n')
