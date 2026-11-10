# 对照原版与 Godot 的模拟存档：python3 diff.py <seed>
import json,sys
sd=sys.argv[1]
a=json.load(open('/tmp/cu_web_%s.json'%sd));b=json.load(open('/tmp/cu_godot_%s.json'%sd))
IGN={'completedAt','resolvedAt','startedAt'}
out=[]
def norm(x):
    if isinstance(x,float) and x==int(x): return int(x)
    return x
def walk(x,y,p):
    if len(out)>25: return
    if isinstance(x,dict) and isinstance(y,dict):
        for k in sorted(set(x)|set(y)):
            if k in IGN: continue
            if k not in x: out.append(('仅Godot',p+'.'+k,str(y[k])[:120])); continue
            if k not in y:
                if x[k] is None: continue
                out.append(('仅原版',p+'.'+k,str(x[k])[:120])); continue
            walk(x[k],y[k],p+'.'+k)
    elif isinstance(x,list) and isinstance(y,list):
        if len(x)!=len(y): out.append(('长度',p,'%d vs %d'%(len(x),len(y))))
        for i,(u,v) in enumerate(zip(x,y)): walk(u,v,p+'[%d]'%i)
    else:
        if norm(x)!=norm(y): out.append(('值',p,'%r vs %r'%(x,y)))
walk(a,b,'')
for o in out: print(*o)
print('差异数',len(out))
