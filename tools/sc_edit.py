# sc.json 编辑小工具：可走格读写、按世界坐标判断、平移一块不可走格
import json, base64, numpy as np
P='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-godot/game/data/runtime/sc.json'
TS=40
def load(): return json.load(open(P))
def save(sc): json.dump(sc,open(P,'w'),ensure_ascii=False,separators=(',',':'))
def bits(v):
    m=v['mask']; n=m['w']*m['h']
    return np.unpackbits(np.frombuffer(base64.b64decode(m['d']),np.uint8))[:n].reshape(m['h'],m['w']).copy()
def put(v,b):
    m=v['mask']; n=m['w']*m['h']; f=np.zeros(((n+7)//8)*8,np.uint8); f[:n]=b.ravel()
    m['d']=base64.b64encode(np.packbits(f).tobytes()).decode()
def ms(v): return (v.get('gw') or 48)*TS/v['mask']['w']
def walk(v,x,y,b=None):
    b=bits(v) if b is None else b; s=ms(v); c,r=int(x/s),int(y/s)
    return bool(b[r,c]) if 0<=r<b.shape[0] and 0<=c<b.shape[1] else False
def stand(v,tx,ty):
    b=bits(v); x,y=tx*TS,ty*TS
    return all(walk(v,x+dx,y+dy,b) for dx,dy in [(0,0),(-7,0),(7,0),(0,3),(0,-5)])
def shift(v,x0,y0,x1,y1,dx,dy):
    """把世界坐标框里的不可走格平移 dx,dy（原处补成可走）"""
    b=bits(v); s=ms(v)
    c0,r0,c1,r1=int(x0/s),int(y0/s),int(x1/s),int(y1/s)
    blk=(b[r0:r1,c0:c1]==0).copy()
    b[r0:r1,c0:c1][blk]=1
    oc,orr=int(round(dx/s)),int(round(dy/s))
    sub=b[r0+orr:r1+orr,c0+oc:c1+oc]; sub[blk]=0
    put(v,b)
