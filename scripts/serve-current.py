#!/usr/bin/env python3
"""Serve the adopted workspace at a fixed origin, independent of shell cwd."""
import argparse
import hashlib
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.error import URLError
from urllib.request import ProxyHandler, build_opener
import webbrowser

ROOT = Path(__file__).resolve().parents[1]
PORT = 8792
URL = f'http://127.0.0.1:{PORT}/'
RUNTIME_ID = 'qihe-current'

def identity():
    index = (ROOT / 'index.html').read_text()
    if '<meta name="xjh-runtime" content="qihe-current">' not in index:
        raise ValueError('游戏首页缺少当前版本身份；拒绝启动。')
    data = json.loads((ROOT / 'docs/assets/production-assets.json').read_text())
    # Bind identity to the actual registered runtime map, not the folder name alone.
    entry = next(a for a in data['assets'] if a['id'] == 'm_qh_central')
    asset = ROOT / entry['path']
    digest = hashlib.sha256(asset.read_bytes()).hexdigest()
    if digest != entry['sha256']:
        raise ValueError('当前中央图与正式登记不一致；拒绝启动。')
    return dict(runtime_id=RUNTIME_ID, workspace=ROOT.name, canonical_url=URL,
                map_id=entry['id'], map_sha256=digest)

def probe():
    try:
        opener = build_opener(ProxyHandler({}))
        with opener.open(URL + '__runtime.json', timeout=2) as response:
            return json.load(response)
    except (OSError, ValueError, URLError):
        return None

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-XJH-Runtime', RUNTIME_ID)
        super().end_headers()

    def do_GET(self):
        if self.path.split('?', 1)[0] == '/__runtime.json':
            # Approved assets can change while this process keeps serving the same root.
            # Recheck the file against the register; a boot-time hash becomes stale.
            try:
                current = identity()
            except (OSError, ValueError, KeyError, StopIteration) as exc:
                self.send_error(503, 'Runtime registry verification failed')
                return
            body = json.dumps(current, ensure_ascii=False).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--open', action='store_true', help='核验后打开游戏首页')
    parser.add_argument('--check', action='store_true', help='只核对已运行的固定入口')
    args = parser.parse_args()
    expected = identity()
    if args.check:
        actual = probe()
        if actual != expected:
            raise SystemExit('8792未运行当前版本或身份/地图不符；不能作为游戏入口。')
        print(json.dumps(actual, ensure_ascii=False))
        return
    try:
        server = ThreadingHTTPServer(('127.0.0.1', PORT), partial(Handler, directory=str(ROOT)))
    except OSError as exc:
        if probe() != expected:
            raise SystemExit(f'8792被其他服务占用，拒绝打开错误版本（不会另选端口）：{exc}')
        print(f'当前游戏已运行：{URL}', flush=True)
        if args.open:
            webbrowser.open(URL)
        return
    server.runtime_identity = expected
    print(f'栖河试玩 · 四向地图版：{URL}\n工作区：{ROOT}', flush=True)
    if args.open:
        webbrowser.open(URL)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
