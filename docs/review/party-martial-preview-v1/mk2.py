# -*- coding: utf-8 -*-
"""第二版：功法分内功、外功、轻功三类（用户 11-09：“功法分三种，外功内功轻功”）。写提示词并并行出图。"""
import os, subprocess
from concurrent.futures import ThreadPoolExecutor
D = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(D, '../../../../xiaojianghu'))
COMMON = open(os.path.join(D, 'common.txt'), encoding='utf-8').read().split('【右边面板的内容，层级从上到下】')[0]
BODY = """【右边面板的内容，层级从上到下】功法分三类：内功、外功、轻功，各一个小标题，次序固定。
1. 小标题「内功」：两行。“主修 出岫心经 丙 · 第二重”，“辅修 观岚诀 乙 · 第一重”。每行左边一个小图标，品级字放在朱红细框小方印里。
2. 小标题「外功」：功法在上一层、招式在下一层。三门功法，每门一行：小图标、功法名、品级小方印、“第 n 层”、一条很细的古铜熟练进度条：
   试锋剑法 丁 第三层；拨云剑法 丙 第二层；守拙拳法 丁 第三层。
3. 小标题「轻功」：一门功法一行，格式同外功：回岚身法 丙 第一层。
{LAYOUT}
4. 小标题「状态」：放在面板最下面一小块。两枚状态：增益「休整充足」，减益「轻伤」。{STATUS}
所有文字逐字照上面写的抄，不要改字、不要加错别字，不要添加上面没写的人名、地名和数值。不要英文、不要乱码。
"""
LAY = {
 'A': """   【A 版：展开式列表】外功里“拨云剑法”这一行是选中状态（淡古铜底、左边一条朱红细竖线、行尾向下的小三角），它下面缩进一格展开它的招式：一张小招式卡“拨云回锋 丙 · 耗内力 4”；其余功法收起（行尾向右的小三角）。
   鼠标正停在“拨云回锋”上，旁边浮出一个小说明框（深一点的旧纸底、细墨线框、带指向招式的小尖角），内容逐字如下：
   “拨云回锋　丙　剑
   两记轻剑一去一回，重在试探与拆盾。
   单体两段剑伤 · 耗内力 4 · 威力 1.08
   功法加成：拨云剑法第十层，本功法招式内力 −1”""",
 'B': """   【B 版：页签加左右两栏】内功一块照上面写。外功和轻功合在一块里，顶上两个小页签“外功”“轻功”，“外功”页签选中（朱红下划线），“轻功”页签未选中、褐灰字；页签下分左右两栏：左栏窄，竖排外功三门功法名字行，选中的“拨云剑法”是淡古铜底加左侧朱红细竖线；右栏是选中功法的招式卡“拨云回锋 丙”，卡上一行小字“单体两段 · 耗内力 4”，卡下一行褐灰小字“第十层：本功法招式内力 −1（未达成）”。（这一版轻功的内容藏在“轻功”页签里，画面上看不到回岚身法这一行，这是对的。）
   鼠标正停在“拨云回锋”招式卡上，旁边浮出一个小说明框（深一点的旧纸底、细墨线框、带小尖角），内容逐字如下：
   “拨云回锋　丙　剑
   两记轻剑一去一回，重在试探与拆盾。
   单体两段剑伤 · 耗内力 4 · 威力 1.08”""",
}
ST = {
 'A': '增益签黛青细框、浅青底、左边向上的小三角，下一行小字“防御 ×1.1 · 下一场战后消退”；减益签朱红细框、浅红底、左边向下的小三角，下一行小字“气血上限 ×0.85 · 治疗后解除”。两枚签左右并排。增益的名字是“休整充足”四个字，第一个字是“休息”的“休”。',
 'B': '两枚状态做成一排圆形小图标加名字：增益「休整充足」黛青圆圈、右上角小“▲”；减益「轻伤」朱红圆圈、右上角小“▼”；名字分别是黛青字和朱红字；下方一行褐灰小字“悬停看来源与恢复方式”。“休整充足”第一个字是“休息”的“休”。',
}

def run(j):
    v, n = j
    p = os.path.join(D, 'prompt2_%s.txt' % v)
    if n == 1:
        open(p, 'w', encoding='utf-8').write(COMMON + BODY.replace('{LAYOUT}', LAY[v]).replace('{STATUS}', ST[v]))
    out = os.path.join(D, 'raw', '%s%d_v2.png' % (v, n + 2))
    for _ in range(3):
        r = subprocess.run(['python3', 'tools_common/imggen.py', '--prompt-file', p, '--out', out, '--ref', os.path.join(D, 'ref/now_party.png'),
                            '--size', '1824x1024', '--background', 'opaque'], cwd=ROOT, stdout=open(out[:-4] + '.log', 'w'), stderr=subprocess.STDOUT)
        if r.returncode == 0 and os.path.exists(out): return '%s%d 成功' % (v, n + 2)
    return '%s%d 失败' % (v, n + 2)

if __name__ == '__main__':
    for v in 'AB': run((v, 1)) if False else None
    jobs = [(v, 1) for v in 'AB']
    with ThreadPoolExecutor(2) as ex:
        for r in ex.map(run, jobs): print(r)
    with ThreadPoolExecutor(2) as ex:
        for r in ex.map(run, [(v, 2) for v in 'AB']): print(r)
