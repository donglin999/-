"""统一生图入口：按 imgsources.json 的 current（或 --source 指定）调度不同的生图源。

用法：
  python3 imggen.py --prompt-file p.txt --out xu.png [--size 1024x1536] [--quality high]
                    [--ref a.png --ref b.png] [--source 302ai-sunburst] [--opaque-fix]
                    [--background transparent|opaque|auto]
  python3 imggen.py --list                 # 列出所有源与当前源
  python3 imggen.py --use <源id>           # 切换当前源（只改 current，记 history，不删旧源）

说明：
- 提示词必须带一行 `Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）`（项目约定）；本脚本不改写提示词。
- 透明背景：openai_compat / flatrouter 默认传 background=transparent；openai_compat 可用 --background opaque|auto 改传（纯黑底发光素材用 opaque，2026-10-18 加，默认不变）；codex 需在提示词里写 transparent_background: true。
- --opaque-fix：把 alpha≥250 的像素补成 255（302 出图人物 alpha 最高 254）。
- 密钥从环境变量或 tools_por/.env 读取（key_env 字段；有 key_env_backup 的源，主密钥额度不足时自动换备用），不要写进仓库。
"""
import argparse, base64, datetime, json, os, subprocess, sys, tempfile, time, urllib.error, urllib.request, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
REG = os.path.join(HERE, 'imgsources.json')
ENV_PATH = os.path.join(HERE, '..', 'tools_por', '.env')


def load_reg():
    with open(REG, encoding='utf-8') as f:
        return json.load(f)


def save_reg(reg):
    with open(REG, 'w', encoding='utf-8') as f:
        json.dump(reg, f, ensure_ascii=False, indent=2)
        f.write('\n')


def key_of(name):
    if os.environ.get(name):
        return os.environ[name].strip()
    if os.path.exists(ENV_PATH):
        for line in open(ENV_PATH, encoding='utf-8'):
            if line.startswith(name + '='):
                return line.split('=', 1)[1].strip()
    sys.exit(f'缺少密钥 {name}：请设环境变量或写入 tools_por/.env')


# 额度不足的报错：HTTP 402，或报错内容里带这些字样
QUOTA_WORDS = ('insufficient', 'quota', 'balance', '余额', '额度')


def is_quota_error(code, text):
    return code == 402 or any(w in text.lower() for w in QUOTA_WORDS)


def openai_compat(src, prompt, out, size, quality, refs, background='transparent'):
    keys = [key_of(src['key_env'])]
    # 有备用密钥（key_env_backup）的源，主密钥额度不足时换备用的再试一次
    if src.get('key_env_backup'):
        keys.append(key_of(src['key_env_backup']))
    for i, key in enumerate(keys):
        try:
            return openai_compat_once(src, key, prompt, out, size, quality, refs, background)
        except urllib.error.HTTPError as e:
            text = e.read()[:600].decode('utf-8', 'ignore')
            if i + 1 < len(keys) and is_quota_error(e.code, text):
                print(f'主密钥额度不足（HTTP {e.code}），改用备用密钥 {src["key_env_backup"]}', file=sys.stderr)
                continue
            sys.exit(f'HTTP {e.code}：{text}')


def openai_compat_once(src, key, prompt, out, size, quality, refs, background):
    base = src['base_url'].rstrip('/')
    if refs:
        bnd = uuid.uuid4().hex
        parts = []
        fields = {'model': src['model'], 'prompt': prompt, 'size': size, 'quality': quality, 'background': background, 'n': '1'}
        for k, v in fields.items():
            parts.append(f'--{bnd}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode())
        for r in refs:
            parts.append(f'--{bnd}\r\nContent-Disposition: form-data; name="image[]"; filename="{os.path.basename(r)}"\r\nContent-Type: image/png\r\n\r\n'.encode() + open(r, 'rb').read() + b'\r\n')
        parts.append(f'--{bnd}--\r\n'.encode())
        req = urllib.request.Request(base + '/images/edits', data=b''.join(parts), headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'multipart/form-data; boundary=' + bnd})
    else:
        body = {'model': src['model'], 'prompt': prompt, 'size': size, 'quality': quality, 'background': background, 'n': 1}
        req = urllib.request.Request(base + '/images/generations', data=json.dumps(body).encode(), headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    t = time.time()
    raw = urllib.request.urlopen(req, timeout=600).read()
    j = json.loads(raw)
    d = j['data'][0]
    if d.get('b64_json'):
        png = base64.b64decode(d['b64_json'])
    else:
        png = urllib.request.urlopen(urllib.request.Request(d['url'], headers={'User-Agent': 'Mozilla/5.0'}), timeout=120).read()
    open(out, 'wb').write(png)
    return {'seconds': round(time.time() - t), 'usage': j.get('usage'), 'size': j.get('size')}


def flatrouter(src, prompt, out, size, quality, refs):
    sys.path.insert(0, HERE)
    import flatimg
    r = flatimg.edit(refs, prompt, model=src['model'], size=size, quality=quality) if refs else flatimg.generate(prompt, model=src['model'], size=size, quality=quality)
    open(out, 'wb').write(r.png)
    return r.meta


def codex(src, prompt, out, size, quality, refs):
    work = os.path.dirname(os.path.abspath(out)) or '.'
    name = os.path.basename(out)
    text = prompt.rstrip() + f'\n生成后把生成的 PNG 复制到当前目录，文件名 {name}，然后结束。\n'
    cmd = ['codex', 'exec', '--skip-git-repo-check', '--enable', 'image_generation', '-s', 'workspace-write', '-C', work]
    for r in refs:
        cmd += ['-i', os.path.abspath(r)]
    cmd.append('-')
    t = time.time()
    p = subprocess.run(cmd, input=text.encode(), capture_output=True)
    if not os.path.exists(out):
        sys.exit('codex 未产出文件：\n' + p.stdout.decode('utf-8', 'ignore')[-800:] + p.stderr.decode('utf-8', 'ignore')[-800:])
    return {'seconds': round(time.time() - t)}


KINDS = {'openai_compat': openai_compat, 'flatrouter': flatrouter, 'codex': codex}


def opaque_fix(path):
    from PIL import Image
    import numpy as np
    im = Image.open(path).convert('RGBA')
    a = np.array(im)
    a[:, :, 3][a[:, :, 3] >= 250] = 255
    Image.fromarray(a).save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--prompt-file'); ap.add_argument('--out')
    ap.add_argument('--size', default='1024x1536'); ap.add_argument('--quality', default='high')
    ap.add_argument('--ref', action='append', default=[]); ap.add_argument('--source')
    ap.add_argument('--opaque-fix', action='store_true')
    ap.add_argument('--background', choices=['transparent', 'opaque', 'auto'], default='transparent', help='仅 openai_compat 源生效；默认 transparent（向后兼容）')
    ap.add_argument('--list', action='store_true'); ap.add_argument('--use')
    a = ap.parse_args()
    reg = load_reg()
    if a.list:
        for k, v in reg['sources'].items():
            print(('* ' if k == reg['current'] else '  ') + k, '|', v['label'], '|', v.get('model', ''), '| 加入', v.get('added', ''))
        return
    if a.use:
        if a.use not in reg['sources']:
            sys.exit('未登记的源：' + a.use)
        reg['current'] = a.use
        reg['history'].append({'date': datetime.date.today().isoformat(), 'current': a.use, 'by': '用户', 'note': '切换'})
        save_reg(reg); print('当前源 →', a.use); return
    if not (a.prompt_file and a.out):
        ap.error('需要 --prompt-file 和 --out')
    sid = a.source or reg['current']
    src = reg['sources'][sid]
    prompt = open(a.prompt_file, encoding='utf-8').read()
    if 'gpt-image-2.5' not in prompt:
        print('[imggen] 提醒：提示词缺少 “Model: gpt-image-2.5（使用 gpt-image-2.5 生图模型）” 这一行', file=sys.stderr)
    extra = {'background': a.background} if src['kind'] == 'openai_compat' else {}
    meta = KINDS[src['kind']](src, prompt, a.out, a.size, a.quality, a.ref, **extra)
    if a.opaque_fix:
        opaque_fix(a.out)
    print(json.dumps({'source': sid, 'out': a.out, **extra, **(meta or {})}, ensure_ascii=False, default=str))


if __name__ == '__main__':
    main()
