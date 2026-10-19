#!/usr/bin/env python3
"""Local documentation library. Sources stay in place; reviews are revision-bound."""
import argparse
import hashlib
import json
import mimetypes
import os
from pathlib import Path
import re
import threading
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
CATEGORIES = [
    ('story', '世界与剧情', '世界观、章节、对白与故事时间线'),
    ('cast', '门派与人物', '门派风格、角色经历与同伴关系'),
    ('systems', '玩法实现与交互', '养成界面、事件系统与交互接入'),
    ('martial', '战斗与数值开发', '数值标定、战斗推演与装备素材设计'),
    ('maps', '地图开发', '空间规范、碰撞、生成与地图制作'),
    ('art', '美术与特效制作', '资产规范、提示词、动画与特效实现'),
    ('audio', '语音与音频', '角色选音、情绪、配音与音效'),
    ('dev', '架构、测试与交付', '代码架构、接入、整改与验收记录'),
    ('records', '素材与验收记录', '各轮素材制作说明和评审记录'),
    ('archive', '历史归档', '明确归档或已被替代的方案'),
]
WIKI_CATEGORIES = [
    ('wiki_world', '世界与主线', '世界格局、故事框架与终局伏笔'),
    ('wiki_cast', '人物与同伴', '身份、性格、经历与角色发展路线'),
    ('wiki_factions', '门派与势力', '各派传承、立场、风格与师承'),
    ('wiki_story', '章节与事件', '完整对白、剧情时间线与人物事件'),
    ('wiki_systems', '玩法与关系', '三年养成、招募、结缘与生活规则'),
    ('wiki_martial', '武学与装备', '门派招式、心法修习、装备与人物打法'),
    ('wiki_places', '城镇与地点', '江湖地点、生活场景与当地故事'),
]
WIKI_SECTIONS = json.loads((Path(__file__).with_name('wiki-sections.json')).read_text())
WIKI_PATHS = {f'docs/design/{stem}.md': section for section, stems in WIKI_SECTIONS.items() for stem in stems}


def classification(path, superseded):
    """Wiki membership is explicit; production, research and machine data stay in dev."""
    old_category = category(path, superseded)
    if old_category == 'archive':
        return 'dev', 'archive'
    if path in WIKI_PATHS:
        return 'wiki', WIKI_PATHS[path]
    if path.startswith('docs/design/factions/') and path.endswith('.md'):
        return 'wiki', 'wiki_factions'
    if path.startswith('docs/design/companions/') and path.endswith('.md'):
        if not any(part in Path(path).stem for part in ('assets', 'costume')):
            return 'wiki', 'wiki_story' if path.endswith('-story.md') else 'wiki_cast'
    if path.endswith(('.json', '.csv')):
        return 'dev', 'data'
    if 'research' in path or path.endswith(('cultivation-reference.md', 'martial-review/references.md')):
        return 'dev', 'research'
    return 'dev', old_category if old_category not in ('cast', 'story') else 'dev'


def now():
    return datetime.now(timezone.utc).isoformat()


def plain(text):
    text = re.sub(r'<!--.*?-->', '', text, flags=re.S)
    text = re.sub(r'!?\[([^\]]+)\]\([^)]*\)', r'\1', text)
    return re.sub(r'\s+', ' ', re.sub(r'[#*`>|]', '', text)).strip()


def category(path, superseded):
    name = Path(path).stem
    if '/archive/' in path or path in superseded:
        return 'archive'
    if path.startswith(('art_sources/', 'review/')):
        return 'records'
    if path.startswith('docs/design/martial-review/') or name == 'growth-combat':
        return 'martial'
    if path.startswith('docs/design/companions/') or path.startswith('docs/design/factions/') or name.startswith(('companion', 'faction', 'cast', 'romance', 'ye-routes', 'protagonist-sect', 'ambient-npc')):
        return 'cast'
    if name.startswith(('voice', 'xiangyang-voice')) or 'audio' in name:
        return 'audio'
    if not path.startswith('docs/design/'):
        return 'dev'
    if name.startswith(('cultivation', 'mountain-cultivation', 'life', 'npc-', 'party-', 'pets', 'exploration-', 'wilderness-', 'world-map-', 'event-scheduling')) or '/calendar/' in path:
        return 'systems'
    if any(s in name for s in ('portrait', 'appearance', 'expression', 'visual', 'vfx', 'sword-', 'slash-', 'skill-polish', 'skill-gallery', 'combat-av', 'art-prompt', 'assets', 'character-', 'icons', 'presentation', 'dialogue-staging', 'role-assets', 'performance')) or name.endswith('-art'):
        return 'art'
    if any(s in name for s in ('map-', 'scene', 'spatial', 'layout', 'environment', 'elevation', 'ground-', 'fortress')) or name in ('xiangyang-city', 'xiangyang-alley', 'chapter1-village', 'chapter1-mountain', 'prologue-village'):
        return 'maps'
    if any(s in name for s in ('acceptance', 'delivery', 'implementation', 'verification', 'audit', 'test')):
        return 'dev'
    return 'story'


class Library:
    def __init__(self, root, state_dir):
        self.root, self.state_dir = root.resolve(), state_dir.resolve()
        self.lock = threading.RLock()
        self.cache = {}

    def candidates(self):
        paths = list(self.root.glob('*.md'))
        for folder in ('docs', 'art_sources', 'review'):
            paths.extend((self.root / folder).rglob('*.md'))
        for ext in ('*.json', '*.csv'):
            paths.extend((self.root / 'docs').rglob(ext))
        return sorted({p for p in paths if p.is_file() and not p.is_symlink()
                       and p.resolve().is_relative_to(self.root)
                       and not any(part.startswith('.') for part in p.relative_to(self.root).parts)})

    def catalog(self):
        with self.lock:
            superseded = set()
            manifest = self.root / 'docs/design/map-document-status.json'
            if manifest.exists():
                try:
                    superseded = {d['path'] for d in json.loads(manifest.read_text())['documents'] if d['status'] == 'superseded'}
                except (ValueError, KeyError):
                    pass
            docs = []
            for p in self.candidates():
                rel = p.relative_to(self.root).as_posix()
                st = p.stat()
                stamp = (st.st_mtime_ns, st.st_size)
                cached = self.cache.get(rel)
                if cached and cached[0] == stamp:
                    item = dict(cached[1])
                else:
                    body = p.read_text(encoding='utf-8', errors='replace')
                    heading = re.search(r'^#\s+(.+)$', body, re.M)
                    title = plain(heading[1]) if heading else p.name
                    desc = plain(re.sub(r'^#\s+.+\n', '', body, count=1))[:180]
                    item = dict(path=rel, title=title, summary=desc, text=body,
                                kind=p.suffix[1:], modified=datetime.fromtimestamp(st.st_mtime, timezone.utc).isoformat(),
                                revision=hashlib.sha256(body.encode()).hexdigest(), size=st.st_size)
                    self.cache[rel] = (stamp, dict(item))
                item['space'], item['category'] = classification(rel, superseded)
                item['scope'] = ('游戏设定' if item['space'] == 'wiki' else
                                 '历史文档' if item['category'] == 'archive' else
                                 '机器数据' if item['category'] == 'data' else
                                 '制作记录' if rel.startswith(('review/', 'art_sources/')) else '开发资料')
                docs.append(item)
            return docs

    def document(self, path):
        return next((d for d in self.catalog() if d['path'] == path), None)

    def reviews(self):
        file = self.state_dir / 'reviews.json'
        if not file.exists():
            return {'schema': 1, 'documents': {}}
        data = json.loads(file.read_text())
        if data.get('schema') != 1 or not isinstance(data.get('documents'), dict):
            raise ValueError('评审记录格式不正确，请从备份恢复。')
        return data

    def save_review(self, payload):
        with self.lock:
            doc = self.document(payload.get('path'))
            if not doc:
                return 404, {'error': '文档已移走或不在索引内，请刷新目录。'}
            if payload.get('revision') != doc['revision']:
                return 409, {'error': '原文已更新，评审尚未保存。请先重载原文后再提交。'}
            data = self.reviews()
            old = data['documents'].get(doc['path'], {'version': 0, 'history': [], 'comments': []})
            if payload.get('version') != old['version']:
                return 409, {'error': '另一页面刚更新了评审，尚未覆盖。请刷新评审状态后再提交。'}
            status, comment = payload.get('status'), payload.get('comment', '')
            if status not in ('pending', 'changes', 'approved') or not isinstance(comment, str) or len(comment) > 10000:
                return 400, {'error': '评审状态不合法或意见超过 10000 字。'}
            entry = {'status': status, 'revision': doc['revision'], 'at': now(), 'comment': comment.strip()}
            old['history'].append(entry)
            if comment.strip():
                old['comments'].append(entry.copy())
            old.update(status=status, revision=doc['revision'], updated=entry['at'], version=old['version'] + 1)
            data['documents'][doc['path']] = old
            self.state_dir.mkdir(parents=True, exist_ok=True)
            file = self.state_dir / 'reviews.json'
            # Last good state is retained; replace is atomic within the same filesystem.
            if file.exists():
                backup = self.state_dir / 'reviews.backup.json.tmp'
                backup.write_bytes(file.read_bytes())
                os.replace(backup, self.state_dir / 'reviews.backup.json')
            temporary = self.state_dir / 'reviews.json.tmp'
            with temporary.open('w') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                f.write('\n'); f.flush(); os.fsync(f.fileno())
            os.replace(temporary, file)
            return 200, old


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, request, client_address, server):
        super().__init__(request, client_address, server, directory=str(server.library.root))

    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def reply(self, status, data, download=False):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        if download:
            self.send_header('Content-Disposition', 'attachment; filename="xiaojianghu-reviews.json"')
        self.end_headers()
        self.wfile.write(body)

    def allowed_host(self):
        host = self.headers.get('Host', '')
        return host in (f'127.0.0.1:{self.server.server_port}', f'localhost:{self.server.server_port}')

    def do_GET(self):
        if not self.allowed_host():
            return self.reply(403, {'error': '只接受本机访问。'})
        url = urlsplit(self.path)
        library = self.server.library
        try:
            if url.path == '/api/docs':
                return self.reply(200, {'documents': library.catalog(), 'categories': [(*c, 'wiki') for c in WIKI_CATEGORIES] + [(*c, 'dev') for c in CATEGORIES if c[0] not in ('story', 'cast')] + [('research', '调研与决策', '市场参考、方案比较与设计依据', 'dev'), ('data', '机器数据', '结构化配置、清单与计算结果', 'dev')], 'scanned': now()})
            if url.path == '/api/reviews':
                return self.reply(200, library.reviews())
            if url.path == '/api/export':
                data = library.reviews()
                data['exported'] = now()
                data['current_revisions'] = {d['path']: d['revision'] for d in library.catalog()}
                return self.reply(200, data, download=True)
            if url.path.startswith('/api/'):
                return self.reply(404, {'error': '接口不存在。'})
            if url.path == '/':
                self.send_response(302); self.send_header('Location', '/review/docs/'); self.end_headers(); return
            return super().do_GET()
        except (OSError, ValueError) as exc:
            return self.reply(500, {'error': '读取文档或评审记录失败，请检查终端日志。'})

    def do_POST(self):
        # No cookies/auth are needed: loopback-only and strict same-origin JSON writes.
        origin = self.headers.get('Origin')
        if not self.allowed_host() or origin != 'http://' + self.headers.get('Host', ''):
            return self.reply(403, {'error': '评审只能从本机文档网站提交。'})
        if self.path != '/api/review':
            return self.reply(404, {'error': '接口不存在。'})
        if self.headers.get_content_type() != 'application/json':
            return self.reply(415, {'error': '请使用 JSON 请求。'})
        try:
            size = int(self.headers.get('Content-Length', '0'))
            if not 0 < size <= 100000:
                return self.reply(413, {'error': '提交内容过大或为空。'})
            payload = json.loads(self.rfile.read(size))
            if not isinstance(payload, dict):
                return self.reply(400, {'error': '请求格式不正确。'})
            code, result = self.server.library.save_review(payload)
            return self.reply(code, result)
        except (ValueError, TypeError):
            return self.reply(400, {'error': '请求或评审记录格式不正确；未覆盖原记录。'})
        except OSError:
            return self.reply(500, {'error': '保存失败，请检查磁盘权限；意见仍保留在输入框中。'})

    def send_head(self):
        path = unquote(urlsplit(self.path).path).lstrip('/')
        target = (self.server.library.root / path).resolve()
        parts = Path(path).parts
        allowed = parts and (parts[0] in ('docs', 'review', 'art_sources', 'assets', 'js') or path in ('index.html', 'cultivation-minigames.html', 'tools_docs/server.py') or (len(parts) == 1 and path.endswith('.md')))
        if not allowed or any(p.startswith('.') for p in parts) or not target.is_relative_to(self.server.library.root):
            self.send_error(404); return None
        if target.is_dir() and not (target / 'index.html').is_file():
            self.send_error(404); return None
        return super().send_head()

    def log_message(self, fmt, *args):
        if '200' not in str(args):
            super().log_message(fmt, *args)


def make_server(root=ROOT, state_dir=None, port=8794):
    server = ThreadingHTTPServer(('127.0.0.1', port), Handler)
    server.library = Library(Path(root), Path(state_dir) if state_dir else Path(root) / '.doc-review')
    return server


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8794)
    parser.add_argument('--state-dir', type=Path, help='Optional isolated review storage for testing')
    args = parser.parse_args()
    server = make_server(state_dir=args.state_dir, port=args.port)
    print(f'小江湖文档书阁：http://127.0.0.1:{server.server_port}/review/docs/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
