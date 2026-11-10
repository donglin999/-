#!/usr/bin/env python3
"""离线生成每个场景的 A* 规划网格（对应原版 scene.js navOf）：有 mask 时格边 NS=8（preciseNav）或 16，否则 40；
格中心 standOk（脚底五点）为真才可走。preciseNav 场景另要求格中心四向 ±1 像素也可站（对应 pathLineOk 的 1 像素余量），
相邻格中心连线逐 2 像素检查 standOk，结果按 8 个方向写成边掩码，运行时用 AStarGrid2D 时据此封边。
输出 game/data/runtime/nav.json：{场景:{NS,nw,nh,ok:base64(每格1字节: bit0 可走, bit1..8 八方向边可通)}}"""
import json, base64, math, os, numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); GAME = os.path.join(HERE, '../game')
sc = json.load(open(os.path.join(GAME, 'data/runtime/sc.json')))
TS = 40
NB8 = [(1,0),(-1,0),(0,1),(0,-1),(1,1),(1,-1),(-1,1),(-1,-1)]
out = {}
for sid, s in sc.items():
    gw, gh = s.get('gw') or 48, s.get('gh') or 27
    WW, WH = gw*TS, gh*TS
    m = s.get('mask')
    if m:
        raw = base64.b64decode(m['d']); bits = np.unpackbits(np.frombuffer(raw, np.uint8))[:m['w']*m['h']].reshape(m['h'], m['w'])
        ms = WW / m['w']
        def pt(x, y):
            c = np.floor(x/ms).astype(int); r = np.floor(y/ms).astype(int)
            okb = (c>=0)&(r>=0)&(c<m['w'])&(r<m['h'])
            res = np.zeros(np.shape(x), bool); res[okb] = bits[r[okb], c[okb]] == 1; return res
    else:
        grid = np.zeros((math.ceil(gh), math.ceil(gw)), bool)
        for R in s.get('walk') or []:
            grid[int(R[1]):int(R[3])+1, int(R[0]):int(R[2])+1] = True
        for R in s.get('block') or []:
            grid[int(R[1]):int(R[3])+1, int(R[0]):int(R[2])+1] = False
        def pt(x, y):
            c = np.floor(x/TS).astype(int); r = np.floor(y/TS).astype(int)
            okb = (c>=0)&(r>=0)&(c<grid.shape[1])&(r<grid.shape[0])&(c<gw)&(r<gh)
            res = np.zeros(np.shape(x), bool); res[okb] = grid[r[okb], c[okb]]; return res
    half = s.get('footX') or 7
    def stand(x, y):
        return pt(x,y)&pt(x-half,y)&pt(x+half,y)&pt(x,y+3)&pt(x,y-5)
    precise = bool(s.get('preciseNav'))
    NS = (8 if precise else 16) if m else TS
    nw, nh = math.ceil(WW/NS), math.ceil(WH/NS)
    cy, cx = np.mgrid[0:nh, 0:nw]
    X = cx*NS+NS/2; Y = cy*NS+NS/2
    ok = stand(X, Y)
    clear = ok.copy()
    if s.get('previewKey'):
        clear = ok & stand(X-1,Y) & stand(X+1,Y) & stand(X,Y-1) & stand(X,Y+1)
    code = ok.astype(np.uint16)
    if precise:
        for bi,(dc,dr) in enumerate(NB8):
            n = 4 if not (dc and dr) else 6  # 相邻格中心距 8 或 11.3，每 2 像素一采样
            good = ok.copy()
            for i in range(1, n+1):
                t = i/n
                xs, ys = X+dc*NS*t, Y+dr*NS*t
                good &= stand(xs, ys)
                if s.get('previewKey'):
                    good &= stand(xs-1,ys)&stand(xs+1,ys)&stand(xs,ys-1)&stand(xs,ys+1)
            code |= (good.astype(np.uint16) << (bi+1))
    else:
        code |= np.uint16(0x1FE) * ok
    out[sid] = {'NS': NS, 'nw': nw, 'nh': nh, 'precise': precise, 'ok': base64.b64encode(code.astype('<u2').tobytes()).decode()}
    print(sid, NS, nw, nh, int(ok.sum()))
json.dump(out, open(os.path.join(GAME, 'data/runtime/nav.json'), 'w'))
