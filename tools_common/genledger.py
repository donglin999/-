"""生成账本：记录每次生图、视频调用（只追加，一行一个事件，同一 run 的事件按 run 合并）。

用法：
  python3 genledger.py                     # 按 类型／源／模型／状态 汇总
  python3 genledger.py --day 2026-10-30    # 只看某一天
  python3 genledger.py --last 20           # 列最近 20 次调用
  python3 genledger.py --find <哈希前缀>    # 按产物或参考图的 sha256 反查是哪次调用

代码里：
  run = genledger.start('image', source=..., model_requested=..., prompt=..., refs=[...], params={...})
  run.event('submitted', task_id=...)      # 可选：异步任务拿到任务号时先记一笔
  run.finish('succeeded', out=路径, meta={...})  # 或 run.fail(异常)

说明：
- 调用前先记 started，进程中途被杀时账上也有一笔；汇报里显示为 unfinished。
- 费用不换算：接口返回的 usage 原样记下，价格变动时不会把账记错。
- model_requested 只是请求的模型，不等于实际生成的模型（R-生图-02）。
- 不记密钥；报错和接口返回里的 Bearer、sk- 串会抹掉，链接去掉查询串（里面常带签名）。
- 记账出错只打提醒，不影响已经付费的产物。
- GEN_LEDGER_PATH 可改账本位置（测试用）。
"""
import argparse, collections, datetime, fcntl, hashlib, json, os, re, struct, sys, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))  # luotuozhuan，两个工作区的上一级
DEFAULT_PATH = os.path.join(HERE, 'gen-ledger.jsonl')
SECRET = re.compile(r'Bearer\s+[A-Za-z0-9._\-]+|\bsk-[A-Za-z0-9._\-]{16,}')  # 长度限制：别误伤提示词里的 sk-xx 短词
URL = re.compile(r'(https?://[^\s"\'?]+)\?[^\s"\']*')


def ledger_path():
    return os.environ.get('GEN_LEDGER_PATH') or DEFAULT_PATH


def clean(v):
    """递归抹掉密钥和链接里的查询串。"""
    if isinstance(v, str):
        return URL.sub(r'\1', SECRET.sub('[已抹去]', v))
    if isinstance(v, dict):
        return {k: clean(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)):
        return [clean(x) for x in v]
    return v


def rel(path):
    """路径记成相对 luotuozhuan，换电脑后还能对上；工程外的保留绝对路径。"""
    p = os.path.abspath(path)
    return os.path.relpath(p, ROOT) if p.startswith(ROOT + os.sep) else p


def file_info(path):
    """路径、sha256、字节数，PNG 再记实际宽高。文件不存在时只记路径。"""
    info = {'path': rel(path)}
    try:
        with open(path, 'rb') as f:
            data = f.read()
    except OSError:
        return info
    info['sha256'] = hashlib.sha256(data).hexdigest()
    info['bytes'] = len(data)
    if data[:8] == b'\x89PNG\r\n\x1a\n' and len(data) >= 24:
        info['width'], info['height'] = struct.unpack('>II', data[16:24])
    return info


def append(rec):
    line = json.dumps(clean(rec), ensure_ascii=False, default=str) + '\n'
    path = ledger_path()
    try:
        fd = os.open(path, os.O_WRONLY | os.O_APPEND | os.O_CREAT, 0o644)
        try:
            fcntl.flock(fd, fcntl.LOCK_EX)  # 多进程并行出图时不串行
            os.write(fd, line.encode('utf-8'))
        finally:
            os.close(fd)
    except Exception as e:
        print(f'[genledger] 记账失败（产物不受影响）：{e}', file=sys.stderr)


class Run:
    def __init__(self, run_id):
        self.id = run_id

    def event(self, status, **fields):
        append({'run': self.id, 'time': datetime.datetime.now().isoformat(timespec='seconds'), 'status': status, **fields})

    def finish(self, status='succeeded', out=None, **fields):
        try:
            if out:
                fields['out'] = file_info(out)
        except Exception as e:
            print(f'[genledger] 读产物失败：{e}', file=sys.stderr)
        self.event(status, **fields)

    def fail(self, err, status='failed'):
        self.event(status, error=str(err)[:500])


def start(kind, prompt=None, prompt_file=None, refs=(), **fields):
    """调用接口前调用。kind 是 image 或 video。"""
    run = Run(uuid.uuid4().hex[:12])
    try:
        if prompt_file:
            fields['prompt_file'] = rel(prompt_file)
        fields['refs'] = [file_info(r) for r in refs]
    except Exception as e:
        print(f'[genledger] 读参考图失败：{e}', file=sys.stderr)
    run.event('started', kind=kind, prompt=prompt, **fields)
    return run


def load():
    """读账本并按 run 合并；后写的字段盖先写的。坏行跳过并提醒。"""
    runs = collections.OrderedDict()
    try:
        with open(ledger_path(), encoding='utf-8') as f:
            lines = f.read().splitlines()
    except FileNotFoundError:
        return []
    for i, line in enumerate(lines, 1):
        try:
            r = json.loads(line)
            run = runs.setdefault(r['run'], {'started_at': r.get('time')})
        except (ValueError, KeyError, TypeError):
            print(f'[genledger] 第 {i} 行读不了，已跳过', file=sys.stderr)
            continue
        run.update(r)
    return [dict(r, status='unfinished') if r['status'] in ('started', 'submitted') else r for r in runs.values()]


def main():
    ap = argparse.ArgumentParser(description='生成账本查询')
    ap.add_argument('--day', help='只看某一天，如 2026-10-30')
    ap.add_argument('--last', type=int, help='列最近 N 次调用')
    ap.add_argument('--find', help='按 sha256 前缀反查调用')
    a = ap.parse_args()
    runs = load()
    if a.day:
        runs = [r for r in runs if (r.get('started_at') or '').startswith(a.day)]
    if a.find:
        runs = [r for r in runs if any(f.get('sha256', '').startswith(a.find) for f in [r.get('out') or {}] + (r.get('refs') or []))]
    if a.find or a.last:
        for r in runs[-a.last:] if a.last else runs:
            out = r.get('out') or {}
            print(r.get('started_at'), r['run'], r.get('kind'), r.get('source'), r['status'], out.get('path', ''), (out.get('sha256') or '')[:12], r.get('error', ''))
        return
    counts = collections.Counter((r.get('kind'), r.get('source'), r.get('model_requested'), r['status']) for r in runs)
    print(f'共 {len(runs)} 次调用（费用未换算，用量见各条 usage）')
    for (kind, source, model, status), n in sorted(counts.items(), key=lambda x: str(x[0])):
        print(f'{n:5d}  {kind} | {source} | {model} | {status}')


if __name__ == '__main__':
    main()
