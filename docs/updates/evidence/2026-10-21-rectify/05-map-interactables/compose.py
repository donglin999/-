from PIL import Image
import json,sys
S='/private/tmp/claude-501/-Users-wuxiuxiang-project-luotuozhuan/cee2f540-8d09-4e39-a916-75d3855a0702/scratchpad'
R='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-legacy-prologue/'
pa=open(R+'js/production-assets.js').read()
import re
def path(key): return R+re.search('"'+key+'":"([^"]+)"',pa).group(1)
exp=json.load(open(S+'/exp.json'))
def compose(key):
  m=exp[key]; W,H=m['worldSize']
  im=Image.open(path(m['bg'])).convert('RGBA').resize((W,H),Image.NEAREST)
  if m.get('propImg'):
    P=Image.open(path(m['propImg'])).convert('RGBA'); k=m['propK']
    for q in sorted(m['props'],key=lambda q:q[6]):
      sx,sy,sw,sh,dx,dy=q[:6]
      c=P.crop((sx,sy,sx+sw,sy+sh)).resize((max(1,round(sw*k)),max(1,round(sh*k))),Image.NEAREST)
      im.alpha_composite(c,(round(dx),round(dy)))
  if m.get('fg'):
    im.alpha_composite(Image.open(path(m['fg'])).convert('RGBA').resize((W,H),Image.NEAREST))
  return im.convert('RGB')
if __name__=='__main__':
  for k in exp: compose(k).save(f'{S}/full_{k}.png')
