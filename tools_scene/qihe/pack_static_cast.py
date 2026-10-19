from pathlib import Path
from PIL import Image
import sys,json,shutil,os
R=Path(__file__).resolve().parents[2];os.chdir(R);sys.path.insert(0,str(R/'tools_fx/rig'))
import explore as E,qrig as Q
E.RAW='art_sources/qihe-initial-motion';base=R/E.RAW;js=[]
for c,f in [('merchant','exec-7ebb33f6-6f71-4c14-b2e9-34e8d96da935.png'),('oldman','exec-e6fefd04-f877-4f39-ab27-f9a9ebd14cb7.png')]:
 k='qh_'+c;Q.BODIES[k]=Q.QBody(hem=9,ponytail=False);p=base/k;p.mkdir(exist_ok=True);shutil.copy(base/(c+'-guide.png'),p/'model_guide.png');shutil.copy('/Users/wuxiuxiang/.codex/generated_images/01a0f11e-a6c7-7941-8197-4087ab0c885b/'+f,p/'model_0.png');shutil.copy(base/'qh_hero_initial/cells.json',p/'cells.json');a=E.model_art(k);report={};sheet=Image.new('RGBA',(768,648))
 for i,d in enumerate('dlru'):
  m=E.metrics(k,a[d],'stand',d,0);report[d]=dict(metrics=m,bad=E.judge(m));im=Image.fromarray(a[d]).resize((192,162),Image.Resampling.NEAREST)
  for j in range(4):sheet.paste(im,(j*192,i*162))
 sheet.save(R/'assets'/('s_'+k+'.webp'),lossless=True);(p/'qa.json').write_text(json.dumps(report,indent=2));print(k,{d:r['bad']for d,r in report.items()});js.append(f"CHARS.push('{k}');ASSETS.push('s_{k}');ART.sheet.{k}=[192,162];ART.frames.{k}=4;ART.scale.{k}=1;")
(R/'js/qihe-static-art.js').write_text("if(isQiheEntry()){\n"+'\n'.join(js)+'\n}\n')
