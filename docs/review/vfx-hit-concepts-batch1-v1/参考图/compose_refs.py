# 第一批参考图：把游戏里实际播放的出手帧和受击帧摆进后山战斗背景（只做生图参考，不进游戏）
from PIL import Image, ImageOps
A='/Users/wuxiuxiang/project/luotuozhuan/xiaojianghu-godot/game/assets/'; P=A+'production/battle/'
O='/private/tmp/claude-501/-Users-wuxiuxiang-project-luotuozhuan/75541e27-7ea2-4a8f-bdc0-107daa4d6024/scratchpad/b1/'
K=4.0; GROUND=800
def cell(f,cw,ch,cols,i,flip):
    im=Image.open(f).convert('RGBA'); c=im.crop(((i%cols)*cw,(i//cols)*ch,(i%cols)*cw+cw,(i//cols)*ch+ch))
    return ImageOps.mirror(c) if flip else c
def bg():
    b=Image.open(P+'bb_prologue_backhill_v1.webp').convert('RGBA'); w,h=b.size
    s=max(1536/w,1024/h); b=b.resize((int(w*s)+1,int(h*s)+1),Image.LANCZOS); return b.crop((0,0,1536,1024))
SP={'hero':(None,480,324,16,105,(240,304)),'bandit':(A+'b_bandit.webp',360,204,18,105,None),
    'rooster':(A+'b_rooster.webp',204,156,14,72,None),'snake':(A+'b_snake.webp',402,219,14,99,None)}
def put(img,who,f,i,flip,feet_x,file=None):
    fn,cw,ch,cols,units,anc=SP[who]; c=cell(file or fn,cw,ch,cols,i,flip)
    b0=cell(file or fn,cw,ch,cols,0,flip).getbbox(); s=units*K/(b0[3]-b0[1])     # 按站姿可见高度对齐战斗显示高度
    bb=c.getbbox()
    c=c.resize((int(cw*s),int(ch*s)),Image.NEAREST); bb=c.getbbox()
    cx=(b0[0]+b0[2])*s//2 if anc is None else int((cw-anc[0] if flip else anc[0])*s)
    img.alpha_composite(c,(int(feet_x-cx),int(GROUND-bb[3]))); return s
def hero(kind): return P+f'b_gy_hero_{kind}_hd_20261017.webp'
jobs={
 'fist':  [('bandit',12,True,1000,None),('hero',6,True,640,hero('fist'))],
 'sword': [('bandit',12,True,1040,None),('hero',6,True,640,hero('sword_steel'))],
 'needle':[('bandit',12,True,1150,None),('hero',6,True,520,hero('needle'))],
 'rooster':[('hero',12,True,560,hero('fist')),('rooster',7,True,880,None)],
 'snake': [('hero',12,True,520,hero('fist')),('snake',7,True,920,None)],
}
wind={'fist':('hero',5,True,640,hero('fist')),'sword':('hero',5,True,640,hero('sword_steel')),'needle':('hero',5,True,520,hero('needle')),
      'rooster':('rooster',6,True,880,None),'snake':('snake',6,True,920,None)}
for k,L in jobs.items():
    for tag,lst in (('ref',L),('windup',[x if x[0]!=wind[k][0] else wind[k] for x in L])):
        im=bg()
        for who,i,flip,fx,file in lst:
            if tag=='windup' and who!=wind[k][0]: i=0   # 前一帧时被打的一方还是站姿
            put(im,who,file and file or None,i,flip,fx,file) if False else put(im,who,None,i,flip,fx,file) if who!='hero' else put(im,who,None,i,flip,fx,file)
        im.convert('RGB').save(O+f'{k}_{tag}.png')
print('ok')
