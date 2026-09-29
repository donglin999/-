"""FlatRouter 生图共享客户端（异步接口）。

为什么用异步：同步接口 /images/generations、/images/edits 的长连接会在约 421s 被网关强制断开，
高质量图经常超时断连。异步接口提交即返回 202，再轮询任务状态，单任务最长 30 分钟。

接口（https://flatrouter.com/docs/images）：
  提交  POST {base}/images/generations/async   JSON
        POST {base}/images/edits/async         multipart：model/prompt/size/quality/...，`image`（单图）或重复 `image[]`（多图），可选 `mask`
        → 202 {task_id, poll_url: "/v1/images/tasks/<id>", status: "processing"}
  轮询  GET  {root}{poll_url}（同一 Bearer 密钥），每 3–5s（尊重 Retry-After）；status: processing / completed / failed
  结果  completed 时没有 b64_json，从 `image_url` 或 `result.data[].url` 下载；
        下载必须带浏览器 User-Agent（图床在 Cloudflare 后，Python-urllib 默认 UA 会被 1010 拒绝）。结果保留 24 小时。
  限制  账号级并发约 3 个任务，超出报 "Concurrency limit exceeded" → 本模块自动退避后重新提交（不计入失败次数）。
  模型  gpt-image-2.5-sunburst（默认，快）、gpt-image-2.5-flare；密钥无 gpt-image-2 权限（403）。

密钥：环境变量或 tools_por/.env 的 FLATROUTER_API_KEY / FLATROUTER_BASE_URL（勿提交）。

用法（把 tools_common 加入 sys.path 后 `import flatimg`）：
    r = flatimg.generate('一只红苹果', model='gpt-image-2.5-sunburst', size='1024x1024', quality='low')
    open('a.png', 'wb').write(r.png); print(r.meta)          # meta: task_id / model / seconds / attempts / url / usage ...
    r = flatimg.edit(['ref.png'], '把表情改成微笑', size='1024x1536', quality='high')
    r = flatimg.edit([('a.png', a_bytes), 'b.png'], '...')    # 多图 → image[]
    # 手动两段式：
    t = flatimg.submit_generate(prompt, **params); r = flatimg.wait(t)
    # 批量并发（≤3，账号上限）：
    res = flatimg.run_many([dict(prompt=p1, size='1024x1024'), dict(images=['r.png'], prompt=p2)],
                           on_done=lambda i, job, r, err: ...)   # res[i] 为 Result 或 Exception

所有函数失败时抛 FlatImgError（.status 为 HTTP 状态码或 None，.fatal 表示请求本身有误、重试无意义）。
日志打印到 stdout，前缀 [flatimg]；设环境变量 FLATIMG_QUIET=1 关闭。
"""
import base64, json, os, sys, threading, time, urllib.error, urllib.request, uuid
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field

HERE = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(HERE, '..', 'tools_por', '.env')
DEFAULT_BASE = 'https://api.flatrouter.com/v1'
DEFAULT_MODEL = 'gpt-image-2.5-sunburst'
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/126.0 Safari/537.36')

MAX_INFLIGHT = int(os.environ.get('FLATIMG_MAX_INFLIGHT', '3'))  # 本进程同时在跑的任务上限（账号上限约 3）
ATTEMPTS = 2              # 同一请求最多尝试次数（提交失败 / 任务 failed / 超时 / 下载失败）
SUBMIT_TIMEOUT = 120      # 提交（含上传参考图）超时
POLL_TIMEOUT = 60
TASK_TIMEOUT = 1800       # 单任务最长 30 分钟（服务端上限）
POLL_EVERY = 4
CONCURRENCY_WAIT = 900    # 并发超限时最多累计退避 15 分钟
FATAL = (400, 401, 403, 404, 413, 422)

_inflight = threading.BoundedSemaphore(MAX_INFLIGHT)
_log_lock = threading.Lock()


class FlatImgError(RuntimeError):
    def __init__(self, msg, status=None, fatal=False):
        super().__init__(msg)
        self.status, self.fatal = status, fatal


@dataclass
class Task:
    """已提交的异步任务。"""
    task_id: str
    poll_url: str
    kind: str                 # 'generate' | 'edit'
    model: str
    submitted: float          # time.time()
    immediate: bytes = None   # 服务端直接同步返回图片时的数据（少见）


@dataclass
class Result:
    """生成结果：png 为图片字节；meta 含 task_id / model / kind / seconds（总耗时，含排队与重试）/
    attempts / url / usage / errors（此前失败的尝试）。"""
    png: bytes
    meta: dict = field(default_factory=dict)


def log(*a):
    if os.environ.get('FLATIMG_QUIET'): return
    with _log_lock:
        print(time.strftime('%H:%M:%S'), '[flatimg]', *a, flush=True)


# ---------------------------------------------------------------- 配置
_cfg = None


def load_env():
    """返回 (key, base)。环境变量优先，其次 tools_por/.env。base 形如 https://api.flatrouter.com/v1（无尾斜杠）。"""
    global _cfg
    if _cfg: return _cfg
    env = {}
    if os.path.exists(ENV_PATH):
        for line in open(ENV_PATH):
            if '=' in line and not line.lstrip().startswith('#'):
                k, v = line.strip().split('=', 1)
                env[k.strip()] = v.strip()
    key = os.environ.get('FLATROUTER_API_KEY') or env.get('FLATROUTER_API_KEY')
    base = os.environ.get('FLATROUTER_BASE_URL') or env.get('FLATROUTER_BASE_URL') or DEFAULT_BASE
    if not key: sys.exit('缺少 FLATROUTER_API_KEY（tools_por/.env）')
    _cfg = (key, base.rstrip('/'))
    return _cfg


def _root(base):
    return base.split('/v1')[0] if '/v1' in base else base


# ---------------------------------------------------------------- 提交
def _norm_params(params):
    p = dict(params)
    p.setdefault('model', DEFAULT_MODEL)
    p.setdefault('response_format', 'b64_json')  # 异步完成时仍只给 URL；同步直返时可拿到 b64
    return {k: v for k, v in p.items() if v is not None}


def _read_image(img, i):
    """img: 路径 / bytes / (文件名, bytes) → (文件名, bytes)"""
    if isinstance(img, (bytes, bytearray)): return f'image{i}.png', bytes(img)
    if isinstance(img, (tuple, list)): return str(img[0]), bytes(img[1])
    return os.path.basename(img), open(img, 'rb').read()


def _multipart(fields, files):
    bd = '----flatimg' + uuid.uuid4().hex
    parts = []
    for k, v in fields.items():
        parts.append(f'--{bd}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
    for name, fn, data in files:
        ct = 'image/webp' if fn.lower().endswith('.webp') else 'image/jpeg' if fn.lower().endswith(('.jpg', '.jpeg')) else 'image/png'
        parts.append(f'--{bd}\r\nContent-Disposition: form-data; name="{name}"; filename="{fn}"\r\n'
                     f'Content-Type: {ct}\r\n\r\n'.encode() + data + b'\r\n')
    parts.append(f'--{bd}--\r\n'.encode())
    return b''.join(parts), 'multipart/form-data; boundary=' + bd


def _http_error(e, what):
    try: body = e.read().decode(errors='replace')[:400]
    except Exception: body = ''
    return FlatImgError(f'{what} HTTP {e.code}: {body}', status=e.code,
                        fatal=e.code in FATAL and 'concurrency' not in body.lower())


def _is_concurrency(err):
    s = str(err).lower()
    return 'concurrency limit' in s or 'concurrent' in s or err.status == 429


def _submit(kind, build):
    """build() → (url, body, content_type, model)。并发超限自动退避重交。"""
    key, base = load_env()
    waited, backoff = 0, 10
    while True:
        url, body, ctype, model = build(base)
        req = urllib.request.Request(url, data=body, method='POST',
                                     headers={'Authorization': 'Bearer ' + key, 'Content-Type': ctype, 'User-Agent': UA})
        try:
            with urllib.request.urlopen(req, timeout=SUBMIT_TIMEOUT) as r:
                sub = json.load(r)
        except urllib.error.HTTPError as e:
            err = _http_error(e, '提交')
            if _is_concurrency(err) and waited < CONCURRENCY_WAIT:
                ra = e.headers.get('Retry-After') if e.headers else None
                d = int(ra) if ra and ra.isdigit() else backoff
                log(f'账号并发已满，{d}s 后重交（已等 {waited}s）')
                time.sleep(d); waited += d; backoff = min(60, backoff + 10)
                continue
            raise err
        except FlatImgError:
            raise
        except Exception as e:
            raise FlatImgError(f'提交失败: {e!r}'[:300])
        if sub.get('data'):                     # 服务端直接同步返回
            item = sub['data'][0]
            if item.get('b64_json'):
                return Task('', '', kind, model, time.time(), immediate=base64.b64decode(item['b64_json']))
        tid = sub.get('task_id') or sub.get('id')
        if not tid: raise FlatImgError(f'提交返回无 task_id: {json.dumps(sub, ensure_ascii=False)[:300]}')
        t = Task(tid, sub.get('poll_url') or f'/v1/images/tasks/{tid}', kind, model, time.time())
        log(f'提交 {kind} {model} → {tid}')
        return t


def submit_generate(prompt, **params):
    """提交文字生图任务，返回 Task。params 原样透传（model/size/quality/background/output_format/n ...）。"""
    p = _norm_params(params); p['prompt'] = prompt
    return _submit('generate', lambda base: (base + '/images/generations/async', json.dumps(p).encode(),
                                             'application/json', p['model']))


def submit_edit(images, prompt, mask=None, **params):
    """提交图生图/编辑任务，返回 Task。images: 单个或列表，每项为路径 / bytes / (文件名, bytes)；
    1 张用 `image` 字段，多张用重复的 `image[]`。mask 同样接受路径/bytes。其余 params 以表单字段透传。"""
    if isinstance(images, (str, bytes, bytearray)) or (
            isinstance(images, tuple) and len(images) == 2 and isinstance(images[1], (bytes, bytearray))):
        images = [images]            # 单张：路径 / bytes / (文件名, bytes)
    imgs = [_read_image(im, i) for i, im in enumerate(images)]
    p = _norm_params(params); p['prompt'] = prompt
    fname = 'image[]' if len(imgs) > 1 else 'image'
    files = [(fname, fn, data) for fn, data in imgs]
    if mask is not None:
        fn, data = _read_image(mask, 0); files.append(('mask', fn, data))
    fields = {k: str(v) for k, v in p.items()}
    body, ctype = _multipart(fields, files)
    return _submit('edit', lambda base: (base + '/images/edits/async', body, ctype, p['model']))


# ---------------------------------------------------------------- 轮询与下载
def _download(url):
    key, base = load_env()
    if url.startswith('/'): url = _root(base) + url
    last = None
    for i in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=120) as r:
                return r.read()
        except Exception as e:
            last = e; log(f'下载出错 {e!r}'[:160]); time.sleep(5 * (i + 1))
    raise FlatImgError(f'下载失败 {url}: {last!r}'[:300])


def wait(task, timeout=TASK_TIMEOUT):
    """轮询 Task 直到完成，返回 Result（meta 中 seconds 为提交到下载完成的耗时）。失败/超时抛 FlatImgError。"""
    if task.immediate is not None:
        return Result(task.immediate, dict(task_id=None, model=task.model, kind=task.kind,
                                           seconds=round(time.time() - task.submitted, 1)))
    key, base = load_env()
    url = _root(base) + task.poll_url
    delay, errs = POLL_EVERY, 0
    while time.time() - task.submitted < timeout:
        time.sleep(delay)
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'Authorization': 'Bearer ' + key, 'User-Agent': UA}),
                                        timeout=POLL_TIMEOUT) as r:
                d = json.load(r)
                ra = r.headers.get('Retry-After')
            delay = min(15, max(3, int(ra))) if ra and ra.isdigit() else POLL_EVERY
            errs = 0
        except urllib.error.HTTPError as e:
            err = _http_error(e, '轮询')
            errs += 1
            if e.code in (401, 403, 404) or errs > 10: raise err
            log(f'{task.task_id} {err}'[:200]); delay = 10; continue
        except Exception as e:
            errs += 1
            if errs > 20: raise FlatImgError(f'轮询持续失败: {e!r}'[:300])
            log(f'{task.task_id} 轮询出错 {e!r}'[:160]); delay = 8; continue
        st = d.get('status')
        if st in ('processing', 'queued', 'pending', 'in_progress', 'running'): continue
        res = d.get('result') or {}
        item = (res.get('data') or [{}])[0]
        meta = dict(task_id=task.task_id, model=task.model, kind=task.kind, usage=res.get('usage'))
        if st == 'completed':
            if item.get('b64_json'):
                png = base64.b64decode(item['b64_json'])
            else:
                img_url = d.get('image_url') or item.get('url')
                if not img_url: raise FlatImgError(f'任务 {task.task_id} 完成但无图片 URL: {json.dumps(d, ensure_ascii=False)[:300]}')
                meta['url'] = img_url
                png = _download(img_url)
            meta['seconds'] = round(time.time() - task.submitted, 1)
            return Result(png, meta)
        err = d.get('error')
        etype = (err or {}).get('type', '') if isinstance(err, dict) else ''
        raise FlatImgError(f'任务 {task.task_id} {st}: {json.dumps(err, ensure_ascii=False)[:300]}',
                           fatal=etype in ('permission_error', 'invalid_request_error', 'authentication_error'))
    raise FlatImgError(f'任务 {task.task_id} 超时（{timeout}s）')


# ---------------------------------------------------------------- 一步式 + 重试
def _run(submit, label, attempts=ATTEMPTS):
    errors = []
    t0 = time.time()
    for i in range(attempts):
        with _inflight:                    # 进程内并发 ≤ MAX_INFLIGHT
            try:
                r = wait(submit())
                r.meta.update(attempts=i + 1, seconds=round(time.time() - t0, 1), errors=errors)
                log(f'完成 {label} {r.meta["task_id"]} {r.meta["seconds"]:.0f}s {len(r.png) // 1024}KB')
                return r
            except FlatImgError as e:
                errors.append(str(e)[:300])
                log(f'失败 {label} 第{i + 1}次: {e}'[:300])
                if e.fatal: break
        if i + 1 < attempts: time.sleep(10)
    raise FlatImgError(f'{label} 生成失败: ' + ' | '.join(errors), fatal=True)


def generate(prompt, attempts=ATTEMPTS, **params):
    """文字生图（提交 + 轮询 + 下载，失败最多重试到 attempts 次）→ Result。"""
    return _run(lambda: submit_generate(prompt, **params), f'generate[{params.get("model", DEFAULT_MODEL)}]', attempts)


def edit(images, prompt, attempts=ATTEMPTS, mask=None, **params):
    """图片编辑/参考图生成（images 同 submit_edit）→ Result。"""
    return _run(lambda: submit_edit(images, prompt, mask=mask, **params), f'edit[{params.get("model", DEFAULT_MODEL)}]', attempts)


def run_many(jobs, max_workers=MAX_INFLIGHT, on_done=None):
    """并发执行一批任务（线程池 ≤ max_workers，且受进程内 MAX_INFLIGHT 限制）。
    jobs: 字典列表，每项 {'prompt': str, 'images': [...]（有则走 edit，否则 generate）, 'mask', 'attempts', 其余为接口参数}；
          以 '_' 开头的键（如 '_name'）只供调用方识别，不发送。
    on_done(i, job, result, err): 每个任务结束时调用（串行加锁，可安全写文件）；result/err 二者其一为 None。
    返回与 jobs 同序的列表，元素为 Result 或 Exception。"""
    out = [None] * len(jobs)
    lock = threading.Lock()

    def one(job):
        kw = {k: v for k, v in job.items() if not k.startswith('_')}
        prompt = kw.pop('prompt')
        if kw.get('images') is not None:
            return edit(kw.pop('images'), prompt, **kw)
        kw.pop('images', None)
        return generate(prompt, **kw)

    with ThreadPoolExecutor(max_workers=max(1, min(max_workers, MAX_INFLIGHT))) as ex:
        futs = {ex.submit(one, j): i for i, j in enumerate(jobs)}
        for f in as_completed(futs):
            i = futs[f]
            try: r, e = f.result(), None
            except Exception as ex_:
                r, e = None, ex_
            out[i] = r if e is None else e
            if on_done:
                with lock: on_done(i, jobs[i], r, e)
    return out
