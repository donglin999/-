# 立绘 alpha 边缘清理：去低 alpha 杂点 → 边缘像素颜色用内部颜色外扩替换(去深褐底色晕边) → 裁切并缩放到 ≤480x640
# 用法：portrait_clean.py <in.png|webp> <out.webp>
import sys,numpy as np
from PIL import Image,ImageFilter
def clean(src,dst):
    im=Image.open(src).convert('RGBA');a=np.array(im).astype(float);al=a[...,3]
    al[al<70]=0;al=np.clip((al-70)*255/(235-70),0,255)
    # 最大连通主体外的碎屑：用 alpha 模糊后阈值保守处理
    solid=(al>=250)
    rgb=Image.fromarray(np.where(solid[...,None],a[...,:3],0).astype('uint8'))
    msk=Image.fromarray((solid*255).astype('uint8'))
    fill=np.array(rgb).astype(float);m=np.array(msk).astype(float)/255
    for r in (2,4,8,16):   # 内部颜色向外扩散
        bl=np.array(rgb.filter(ImageFilter.GaussianBlur(r))).astype(float);bm=np.array(msk.filter(ImageFilter.GaussianBlur(r))).astype(float)[...,None]/255
        est=bl/np.maximum(bm,1e-3);use=(m<.5)
        fill[use]=est[use];m=np.maximum(m,(bm[...,0]>0.05)*1.0)
    semi=(al>0)&~solid
    a[...,:3][semi]=fill[semi]*0.85+a[...,:3][semi]*0.15
    a[...,3]=al;out=Image.fromarray(a.clip(0,255).astype('uint8'));out=out.crop(out.getbbox())
    s=min(480/out.width,640/out.height,1);out=out.resize((round(out.width*s),round(out.height*s)),Image.LANCZOS)
    out.save(dst,quality=88);print(dst,out.size)
if __name__=='__main__':clean(sys.argv[1],sys.argv[2])
