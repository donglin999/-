#!/usr/bin/env python3
"""生成账本离线测试：假接口跑 imggen.py 和 3 份视频脚本，不发任何计费请求。"""
import base64, io, json, os, runpy, shutil, struct, sys, tempfile, threading, unittest, zlib
import urllib.error, urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer
from unittest import mock

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, 'tools_common')
ART = os.path.join(os.path.dirname(ROOT), 'xiaojianghu-legacy-prologue', 'art_sources')
VGEN = ['hero-motion-video-20261021/tools/vgen2.py', 'censhuang-motion-video-20261021/tools/vgen2.py', 'ye-motion-video-20261028/tools/vgen.py']
sys.path.insert(0, TOOLS)
import genledger, imggen  # noqa: E402

FAKE_KEY = 'sk-fakekeyfortestingonly0123456789'
SIGNED = 'https://oss.example.com/v.mp4?Signature=secretsig'


def png(w=3, h=2):
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d))
    raw = b''.join(b'\0' + b'\0\0\0\0' * w for _ in range(h))
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw)) + chunk(b'IEND', b'')


class FakeApi(BaseHTTPRequestHandler):
    mode = 'ok'

    def do_POST(self):
        self.rfile.read(int(self.headers.get('Content-Length', 0)))
        if FakeApi.mode == 'quota_first' and FAKE_KEY in self.headers.get('Authorization', ''):
            return self.reply(402, {'error': 'insufficient balance'})
        if FakeApi.mode == 'error':
            return self.reply(500, {'error': 'boom Bearer ' + FAKE_KEY})
        self.reply(200, {'data': [{'b64_json': base64.b64encode(png()).decode()}], 'usage': {'total_tokens': 7}})

    def reply(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


class Base(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, self.tmp)
        self.ledger = os.path.join(self.tmp, 'ledger.jsonl')
        p = mock.patch.dict(os.environ, {'GEN_LEDGER_PATH': self.ledger})
        p.start()
        self.addCleanup(p.stop)

    def path(self, name, data=b''):
        p = os.path.join(self.tmp, name)
        with open(p, 'wb') as f:
            f.write(data)
        return p

    def text(self):
        return open(self.ledger, encoding='utf-8').read() if os.path.exists(self.ledger) else ''


class ImageTest(Base):
    def setUp(self):
        super().setUp()
        self.srv = HTTPServer(('127.0.0.1', 0), FakeApi)
        threading.Thread(target=self.srv.serve_forever, daemon=True).start()
        self.addCleanup(self.srv.server_close)
        self.addCleanup(self.srv.shutdown)
        FakeApi.mode = 'ok'
        self.reg = {'current': 'fake', 'history': [], 'sources': {'fake': {
            'kind': 'openai_compat', 'label': '假接口', 'base_url': f'http://127.0.0.1:{self.srv.server_port}/v1',
            'model': 'fake-model', 'key_env': 'FAKE_KEY', 'key_env_backup': 'FAKE_KEY_BACKUP'}}}

    def gen(self, *extra):
        prompt = self.path('p.txt', 'Model: gpt-image-2.5\n一张图'.encode())
        out = os.path.join(self.tmp, 'out.png')
        argv = ['imggen', '--prompt-file', prompt, '--out', out, *extra]
        env = {'FAKE_KEY': FAKE_KEY, 'FAKE_KEY_BACKUP': 'sk-backupkeyfortesting0123456789'}
        with mock.patch.object(imggen, 'load_reg', return_value=self.reg), mock.patch.object(sys, 'argv', argv), \
                mock.patch.dict(os.environ, env), mock.patch('sys.stdout', io.StringIO()), mock.patch('sys.stderr', io.StringIO()):
            imggen.main()
        return out

    def test_success_records_everything(self):
        ref = self.path('ref.png', png(5, 5))
        out = self.gen('--ref', ref)
        r = genledger.load()[-1]
        self.assertEqual(r['status'], 'succeeded')
        self.assertEqual(r['kind'], 'image')
        self.assertEqual(r['source'], 'fake')
        self.assertEqual(r['model_requested'], 'fake-model')
        self.assertIn('一张图', r['prompt'])
        self.assertEqual((r['out']['width'], r['out']['height']), (3, 2))
        self.assertEqual(r['meta']['usage'], {'total_tokens': 7})
        self.assertEqual(r['meta']['key_env'], 'FAKE_KEY')
        self.assertEqual(r['params']['size'], '1024x1536')
        self.assertEqual(r['refs'][0]['width'], 5)
        self.assertTrue(os.path.exists(out))

    def test_backup_key_is_named_not_leaked(self):
        FakeApi.mode = 'quota_first'
        self.gen()
        r = genledger.load()[-1]
        self.assertEqual(r['status'], 'succeeded')
        self.assertEqual(r['meta']['key_env'], 'FAKE_KEY_BACKUP')
        self.assertNotIn('backupkeyfortesting', self.text())
        self.assertNotIn(FAKE_KEY, self.text())

    def test_failure_is_recorded_and_redacted(self):
        FakeApi.mode = 'error'
        with self.assertRaises(SystemExit):
            self.gen()
        r = genledger.load()[-1]
        self.assertEqual(r['status'], 'failed')
        self.assertIn('HTTP 500', r['error'])
        self.assertNotIn(FAKE_KEY, self.text())

    def test_ledger_failure_keeps_output(self):
        with mock.patch.dict(os.environ, {'GEN_LEDGER_PATH': os.path.join(self.tmp, '不存在的目录', 'x.jsonl')}):
            out = self.gen()
        self.assertTrue(os.path.exists(out))


class VideoTest(Base):
    def run_vgen(self, rel, responses):
        """把脚本抄到临时目录再跑，结果 json 不落进真实批次；真实 .env 只读进内存，urlopen 已被替换。"""
        batch = os.path.join(self.tmp, 'batch')
        shutil.rmtree(batch, ignore_errors=True)
        os.makedirs(batch + '/tools')
        os.makedirs(batch + '/video')
        script = shutil.copy(os.path.join(ART, rel), batch + '/tools/')
        ff, pf = self.path('ff.png', png()), self.path('prompt.txt', '镜头不动'.encode())
        seen, queue = [], list(responses)

        def fake(req, timeout=0):
            seen.append(req.get_header('Authorization'))
            item = queue.pop(0)
            if isinstance(item, Exception):
                raise item
            return io.BytesIO(json.dumps(item).encode())

        code = 0
        with mock.patch('urllib.request.urlopen', fake), mock.patch('time.sleep'), mock.patch.object(sys, 'argv', [script, 'clip', ff, pf]), \
                mock.patch('sys.stdout', io.StringIO()):
            try:
                runpy.run_path(script, run_name='__main__')
            except SystemExit as e:
                code = e.code
        self.assertTrue(seen)
        self.assertTrue(all(s.startswith('Bearer ') for s in seen))
        self.assertNotIn(seen[0].split(' ', 1)[1], self.text())
        return code

    def test_all_copies_record_success(self):
        for rel in VGEN:
            with self.subTest(rel), mock.patch.dict(os.environ, {'GEN_LEDGER_PATH': self.path(os.path.basename(os.path.dirname(os.path.dirname(rel))) + '.jsonl')}):
                self.run_vgen(rel, [{'output': {'task_id': 'T1'}},
                                    {'output': {'task_status': 'SUCCEEDED', 'video_url': SIGNED}, 'usage': {'duration': 5}}])
                r = genledger.load()[-1]
                self.assertEqual(r['status'], 'succeeded')
                self.assertEqual(r['kind'], 'video')
                self.assertEqual(r['task_id'], 'T1')
                self.assertEqual(r['usage'], {'duration': 5})
                self.assertEqual(r['video_url'], 'https://oss.example.com/v.mp4')
                self.assertEqual(r['params']['duration'], 5)
                self.assertEqual(r['refs'][0]['width'], 3)
                self.assertTrue(r['out']['sha256'])

    def test_all_copies_record_submit_failure(self):
        for rel in VGEN:
            with self.subTest(rel), mock.patch.dict(os.environ, {'GEN_LEDGER_PATH': self.path(os.path.basename(os.path.dirname(os.path.dirname(rel))) + '-f.jsonl')}):
                code = self.run_vgen(rel, [{'http_error': 400}])
                self.assertEqual(code, 1)
                self.assertEqual(genledger.load()[-1]['status'], 'failed')

    def test_crash_while_polling_leaves_unfinished_with_task_id(self):
        with self.assertRaises(urllib.error.URLError):
            self.run_vgen(VGEN[2], [{'output': {'task_id': 'T2'}}, urllib.error.URLError('断网')])
        r = genledger.load()[-1]
        self.assertEqual(r['status'], 'unfinished')
        self.assertEqual(r['task_id'], 'T2')


class LedgerTest(Base):
    def test_redaction_spares_ordinary_words(self):
        self.assertEqual(genledger.clean('task-abc mask-area risk-free sk-short'), 'task-abc mask-area risk-free sk-short')
        self.assertNotIn('abcdefghijklmnopqrst', genledger.clean('key sk-abcdefghijklmnopqrst end'))

    def test_bad_line_is_skipped(self):
        genledger.start('image', source='a').finish()
        with open(self.ledger, 'a', encoding='utf-8') as f:
            f.write('{半行\n')
        with mock.patch('sys.stderr', io.StringIO()):
            self.assertEqual(len(genledger.load()), 1)

    def test_parallel_appends_stay_whole(self):
        def work():
            for _ in range(50):
                genledger.start('image', prompt='字' * 2000).finish()
        ts = [threading.Thread(target=work) for _ in range(8)]
        [t.start() for t in ts]
        [t.join() for t in ts]
        self.assertEqual(len(genledger.load()), 400)

    def test_find_by_output_hash(self):
        out = self.path('o.png', png())
        genledger.start('image', source='a').finish(out=out)
        sha = genledger.load()[-1]['out']['sha256']
        buf = io.StringIO()
        with mock.patch.object(sys, 'argv', ['genledger', '--find', sha[:10]]), mock.patch('sys.stdout', buf):
            genledger.main()
        self.assertIn('o.png', buf.getvalue())


if __name__ == '__main__':
    unittest.main()
