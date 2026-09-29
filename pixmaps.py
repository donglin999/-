# 地图像素化管线：raw2/m_*.png(1280x720) → 640x360 像素格 · 调色板量化 · 1px 边缘加深 → assets/m_*.webp（无损）
# 引擎以 imageSmoothing=false 放大到 1920x1080 世界（每源像素 = 3 世界像素，与角色 44px×3 网格同密度）
import sys,glob,os
from PIL import Image,ImageFilter,ImageEnhance,ImageChops
WARM={'m_street':(1.04,1.0,.92)}
KM={'m_street'}  # k-means 精修调色板：保住伞/布幌/灯笼等小面积饱和色
NC={'m_street':64}
N=int(os.environ.get('NCOL',56)); SAT=float(os.environ.get('SAT',.88))
for f in sorted(glob.glob('raw2/m_*.png')):
    k=os.path.basename(f)[:-4]
    if len(sys.argv)>1 and k not in sys.argv[1:]: continue
    im=Image.open(f).convert('RGB')
    s=im.resize((640,360),Image.BOX)
    # 逐图调色（如 m_street 原图偏青，拉回与其它地图一致的暖灰）：WARM[k]=(r,g,b) 乘性系数
    if k in WARM:
        r,g_,b=s.split(); m=WARM[k]; s=Image.merge('RGB',(r.point(lambda v:min(255,int(v*m[0]))),g_.point(lambda v:min(255,int(v*m[1]))),b.point(lambda v:min(255,int(v*m[2])))))
    s=ImageEnhance.Color(s).enhance(SAT)
    s=ImageEnhance.Contrast(s).enhance(1.06)
    # 1px 边缘加深：亮度梯度大处压暗（像素描边感）
    L=s.convert('L'); e=L.filter(ImageFilter.FIND_EDGES).point(lambda v:0 if v<40 else min(255,(v-40)*2))
    dark=ImageChops.multiply(s,Image.new('RGB',s.size,(150,140,130)))
    s=Image.composite(dark,s,e.point(lambda v:int(v*.55)))
    q=s.quantize(colors=NC.get(k,N) if k!='m_world' else 72,method=Image.MEDIANCUT,kmeans=4 if k in KM else 0,dither=Image.NONE).convert('RGB')
    q.save(f'assets/{k}.webp',lossless=True,quality=100,method=6)
    print(k,os.path.getsize(f'assets/{k}.webp'))
