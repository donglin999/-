"""把精灵表处理结果同步进 js/bart.js 的自动区：
  raw_battle/D/sheets.json + raw_battle/E/foe_sheets.json（foe_battle.py：敌人 + 大黄，E 的覆盖 D 的）→ //@@FOES … //@@END
  raw_battle/E/sheets.json（party_sprite.py：主角 / 苏芷）→ //@@PARTY … //@@PEND
  raw_battle/I/sheets.json（帧动画管线 tools_fx/rig，工作流 I：敌人 + 大黄）→ //@@FOES 区内完整条目（覆盖 D/E 的 foe() 行）
所有条目 h = cell[1]（每美术像素 3 画布像素，整数倍）。
用法：python3 tools_fx/bart_sync.py
"""
import json, os, re

p = 'js/bart.js'
s = open(p).read()

js = json.load(open('raw_battle/D/sheets.json'))
if os.path.exists('raw_battle/E/foe_sheets.json'): js.update(json.load(open('raw_battle/E/foe_sheets.json')))
pi = json.load(open('raw_battle/I/sheets.json')) if os.path.exists('raw_battle/I/sheets.json') else {}


def full_entry(k, v, ind='  '):
    anim = ',\n'.join(f"{ind}  {a}:{json.dumps(d, separators=(',', ':'))}" for a, d in v['anim'].items())
    anim = re.sub(r'"(\w+)":', r'\1:', anim)
    return (f"{ind}// {k}：身高 {v['body']}px，单元 {v['px'][0]}×{v['px'][1]} 美术像素（帧动画管线）\n"
            f"{ind}B.{k}={{file:'{v['file']}',cell:[{v['cell'][0]},{v['cell'][1]}],cols:{v['cols']},facing:'{v['facing']}',h:{v['cell'][1]},"
            f"tier:'{v['tier']}',anim:{{\n{anim}}}}};")


lines = []
for k, v in pi.items():
    lines.append(full_entry(k, v))
for k, v in js.items():
    if k in pi: continue
    if v['facing'] != 'r' and k != 'dog': continue
    lines.append(f"  B.{k}=foe('{v['file']}',[{v['px'][0]},{v['px'][1]}],'{v['tier']}'{',' + json.dumps(dict(facing=v['facing'])) if v['facing'] != 'r' else ''});   // 身高 {v['body']}px")
s = re.sub(r'  //@@FOES.*?  //@@END', lambda m: '  //@@FOES\n' + '\n'.join(lines) + '\n  //@@END', s, flags=re.S)
print('\n'.join(lines))

if os.path.exists('raw_battle/E/sheets.json'):
    pe = json.load(open('raw_battle/E/sheets.json'))
    pl = []
    for k, v in pe.items():
        anim = ',\n'.join(f"    {a}:{json.dumps(d, separators=(',', ':'))}" for a, d in v['anim'].items())
        anim = re.sub(r'"(\w+)":', r'\1:', anim)
        pl.append(f"  // {k}：身高 {v['body']}px，单元 {v['px'][0]}×{v['px'][1]} 美术像素\n"
                  f"  B.{k}={{file:'{v['file']}',cell:[{v['cell'][0]},{v['cell'][1]}],cols:{v['cols']},facing:'l',h:{v['cell'][1]},tier:'party',anim:{{\n{anim}}}}};")
    old = re.search(r'  //@@PARTY\n(.*?)  //@@PEND', s, flags=re.S).group(1)
    keep = [l for l in old.splitlines() if re.match(r'  B\.(\w+)=', l) and re.match(r'  B\.(\w+)=', l).group(1) not in pe]   # 还没重做的角色保留旧条目
    s = re.sub(r'  //@@PARTY.*?  //@@PEND', lambda m: '  //@@PARTY\n' + '\n'.join(pl + keep) + '\n  //@@PEND', s, flags=re.S)
    print('\n'.join(pl))
open(p, 'w').write(s)
