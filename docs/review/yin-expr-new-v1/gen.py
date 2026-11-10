#!/usr/bin/env python3
"""殷红缨五个对话表情：以 11-09 选定的新立绘 1 为参考图做表情差分（并行，失败重试两次）。
用法：python3 gen.py [表情 ...]"""
import os, sys, subprocess
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '../../../../xiaojianghu'))
REF = os.path.abspath(os.path.join(HERE, '../yin-portrait-new-v1/raw/new1.png'))
E = {
    'angry': '生气：柳眉竖起、眼神凌厉、嘴唇抿紧（不要咬牙、不要冒汗），扛剑的手收紧握住剑鞘，身体微微前倾，像要护着身后的人。',
    'happy': '开怀：仰头爽朗大笑，眼睛笑弯，一手扶着肩上的剑鞘。',
    'sad': '难过：眉头微蹙、目光低垂，收起戏谑，一手放下来轻按腰间的朱红酒葫芦，另一只手腕仍搭在剑鞘上。',
    'surprise': '吃惊：眼睛睁大、红唇微张，上身微微后仰，挑起一边眉毛。',
    'tease': '逗弄：半眯眼、嘴角坏笑、眨一只眼，一只手从剑鞘上抬起、伸出一根食指像在逗弄对方，带一点醉意的妩媚；另一只手腕仍搭在剑鞘上。',
}
TPL = """Model: gpt-image-2.6（使用 gpt-image-2.6 生图模型）
对参考图1做表情差分编辑。参考图1是本游戏角色殷红缨的定稿全身立绘。保持完全相同的人物、脸、发型、服装、配饰、身材、画风、全身构图、人物在画面里的位置和大小、扛剑站姿与双腿双脚的位置；只改变表情和与情绪协调的手部、上半身小动作：
{v}
两条腿保持参考图1的样子：都完整、结构正确、各穿一只长靴落地。双手各五指。
画风：国风工笔线描＋淡彩，和参考图1一致；纯色透明背景，只画人物，全身完整入画，竖版 2:3。
性感但得体，不裸露隐私部位。不要文字、印章、边框、水印，不要背景景物。
"""

def run(k):
    p = os.path.join(HERE, k + '.txt'); open(p, 'w').write(TPL.format(v=E[k]))
    out = os.path.join(HERE, 'raw', k + '.png'); log = os.path.join(HERE, 'raw', k + '.log')
    for _ in range(3):
        with open(log, 'w') as f:
            r = subprocess.run(['python3', 'tools_common/imggen.py', '--prompt-file', p, '--out', out, '--ref', REF,
                                '--size', '1024x1536', '--background', 'transparent', '--opaque-fix'], cwd=ROOT, stdout=f, stderr=f)
        if r.returncode == 0 and os.path.exists(out) and os.path.getsize(out) > 0:
            return k + ' 成功'
    return k + ' 失败'

if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'raw'), exist_ok=True)
    ks = sys.argv[1:] or list(E)
    with ThreadPoolExecutor(len(ks)) as ex:
        for r in ex.map(run, ks): print(r)
