"""工作流 G：武侠化战斗 UI 纹理生图（FlatRouter / gpt-image-2.5-sunburst），无文字素材。
用法（仓库根目录）：python3 tools_fx/ui_gen.py [名字 ...]   → raw_battle/G/<名字>.png，参数记入 raw_battle/G/params.json
走 tools_common/flatimg.py 异步接口（≤3 并发，失败自动重试）。之后运行 tools_fx/ui_post.py 生成 assets/ui_*.webp。
"""
import json, os, sys, time
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools_common'))
import flatimg  # FlatRouter 异步生图客户端

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
OUT = os.path.join(ROOT, 'raw_battle', 'G')
PARAMS = dict(model='gpt-image-2.5-sunburst', size='1536x1024', quality='high', background='opaque', output_format='png', n=1)
NO = "画面中绝对不要出现任何文字、汉字、字母、印章、落款、签名、水印、边框。纯白色 #FFFFFF 平整背景，无纸张纹理、无阴影。"
JOBS = {
    'strokes': ("一张素材图：从上到下整齐排列 4 条互相分开的水平中国书法大笔刷墨迹横扫笔触，纯黑色浓墨，"
                "每条笔触几乎横跨整个画面宽度、高度约为画面的八分之一，左端起笔饱满圆润、右端收笔逐渐变细并散开成干笔飞白丝缕，"
                "笔触上下边缘粗糙不规则，内部有明显的干笔飞白（白色细丝状空隙），像用大号羊毫在宣纸上一笔扫过。"
                "4 条笔触形态各不相同，彼此之间留足白色间隔，不重叠、不相连。" + NO),
    'splash': ("一张素材图：一大块竖直方向的中国水墨泼墨笔触，纯黑色浓墨，从上往下一笔刷下，宽约画面宽度的三分之一，"
               "高度几乎占满画面，边缘带干笔飞白丝缕和少量墨点飞溅，位于画面水平居中。" + NO),
}

def main():
    flatimg.load_env()
    os.makedirs(OUT, exist_ok=True)
    pj = os.path.join(OUT, 'params.json')
    log = json.load(open(pj)) if os.path.exists(pj) else {}
    jobs = []
    for name in (sys.argv[1:] or list(JOBS)):
        dst = os.path.join(OUT, name + '.png')
        if os.path.exists(dst): print('skip', name); continue
        print('gen', name, flush=True)
        jobs.append(dict(PARAMS, prompt=JOBS[name], _name=name, _dst=dst))

    def done(i, job, r, err):
        name = job['_name']
        if err: print('fail', name, err, flush=True); return
        open(job['_dst'], 'wb').write(r.png); print('ok', name, round(r.meta['seconds']), 's', r.meta['task_id'], flush=True)
        log[name] = dict(PARAMS, prompt=JOBS[name]); json.dump(log, open(pj, 'w'), ensure_ascii=False, indent=1)

    if jobs: flatimg.run_many(jobs, on_done=done)

if __name__ == '__main__':
    main()
