import sys,os
from PIL import Image, ImageDraw
d=sys.argv[1]; idx=[int(x) for x in sys.argv[2].split(',')]; w=int(sys.argv[3]) if len(sys.argv)>3 else 480
ims=[Image.open(os.path.join(d,'%03d.png'%i)) for i in idx]
h=int(ims[0].height*w/ims[0].width); cols=min(4,len(ims))
W=Image.new('RGB',(cols*w,((len(ims)+cols-1)//cols)*h)); D=ImageDraw.Draw(W)
for j,(i,im) in enumerate(zip(idx,ims)):
  W.paste(im.resize((w,h)),((j%cols)*w,(j//cols)*h)); D.text(((j%cols)*w+4,(j//cols)*h+4),str(i),fill=(255,255,0))
W.save(sys.argv[4] if len(sys.argv)>4 else d+'_strip.png')
