"""批量生图驱动（工作流 I）：把多个角色的 定妆图 / 动作网格 放进同一个 ≤3 并发的队列（账号级上限约 3 个任务）。
用法（仓库根目录）：
  python3 tools_fx/rig/batch.py model bandit chief monk ...        # 定妆图（已存在则跳过，--force 重生成）
  python3 tools_fx/rig/batch.py grid bandit:atk,base,move wolf:atk,base ...
环境变量 GEN_WORKERS（默认 3）。
"""
import os, sys, time
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import genframes as G  # noqa: E402


class A: tag = ''


def main():
    cmd, items = sys.argv[1], [x for x in sys.argv[2:] if not x.startswith('--')]
    force = '--force' in sys.argv
    key, base = G.load_env()
    jobs = []
    if cmd == 'model':
        for c in items:
            if os.path.exists(f'raw_anim/{c}/model.png') and not force: print('跳过', c); continue
            jobs.append((G.cmd_model, (c, A, key, base)))
    else:
        for it in items:
            c, gs = it.split(':')
            for g in gs.split(','):
                jobs.append((G.run_grid, (c, g, key, base)))
    t = time.time()
    with ThreadPoolExecutor(max_workers=int(os.environ.get('GEN_WORKERS', 3))) as ex:
        futs = []
        for i, (f, a) in enumerate(jobs):
            futs.append(ex.submit(f, *a)); time.sleep(2)
        ok = 0
        for fu in futs:
            try: fu.result(); ok += 1
            except Exception as e: print('失败', e, flush=True)
    print(f'完成 {ok}/{len(jobs)}，{time.time() - t:.0f}s', flush=True)


if __name__ == '__main__':
    main()
