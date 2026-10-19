"""Isolated persistence, conflicts, indexing and HTTP boundary tests."""
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest
import urllib.request
import urllib.error

SOURCE = Path(__file__).resolve().parents[1] / 'tools_docs/server.py'
spec = importlib.util.spec_from_file_location('document_library', SOURCE)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class LibraryTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        (self.root/'docs/design').mkdir(parents=True)
        (self.root/'docs/design/test.md').write_text('# 测试角色\n\n剧情正文。')
        (self.root/'docs/design/data.json').write_text('{"design": true}')
        (self.root/'docs/.private.md').write_text('not indexed')
        (self.root/'.env').write_text('not public')
        self.server = module.make_server(self.root, self.root/'.state', 0)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f'http://127.0.0.1:{self.server.server_port}'
        self.opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        self.lib = self.server.library

    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.thread.join(); self.tmp.cleanup()

    def request(self, path, data=None, origin=True):
        headers = {'Content-Type':'application/json'}
        if origin:
            headers['Origin'] = self.base
        req = urllib.request.Request(self.base+path, headers=headers,
                                     data=json.dumps(data).encode() if data is not None else None)
        try:
            with self.opener.open(req) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as e:
            return e.code, e.read()

    def payload(self):
        return dict(path='docs/design/test.md', revision=self.lib.document('docs/design/test.md')['revision'],
                    version=0, status='changes', comment='人物动机需要补充。')

    def test_index_live_add_change_delete_and_data(self):
        docs = self.lib.catalog()
        self.assertEqual(len(docs), 2)
        before = self.payload()['revision']
        (self.root/'docs/design/test.md').write_text('# 新标题\n\n新剧情。')
        self.assertNotEqual(before, self.payload()['revision'])
        self.assertEqual(self.lib.document('docs/design/test.md')['title'], '新标题')
        (self.root/'docs/new.md').write_text('# 新文档')
        self.assertEqual(len(self.lib.catalog()), 3)
        (self.root/'docs/new.md').unlink()
        self.assertEqual(len(self.lib.catalog()), 2)

    def test_review_survives_new_instance_and_export(self):
        code, body = self.request('/api/review', self.payload())
        self.assertEqual(code, 200)
        new = module.Library(self.root, self.root/'.state')
        review = new.reviews()['documents']['docs/design/test.md']
        self.assertEqual(review['comments'][0]['comment'], '人物动机需要补充。')
        self.assertEqual(review['status'], 'changes')
        code, exported = self.request('/api/export')
        self.assertEqual(code, 200)
        self.assertIn('current_revisions', json.loads(exported))

    def test_old_document_and_concurrent_review_are_rejected(self):
        stale = self.payload()
        (self.root/'docs/design/test.md').write_text('# Updated\nchanged')
        self.assertEqual(self.request('/api/review', stale)[0], 409)
        current = self.payload()
        self.assertEqual(self.request('/api/review', current)[0], 200)
        self.assertEqual(self.request('/api/review', current)[0], 409)
        self.assertEqual(len(self.lib.reviews()['documents'][current['path']]['history']), 1)

    def test_new_revision_keeps_old_comments_and_backup(self):
        first = self.payload(); self.request('/api/review', first)
        (self.root/'docs/design/test.md').write_text('# Updated\nchanged')
        second = self.payload(); second.update(version=1, status='approved', comment='已补充动机。')
        self.assertEqual(self.request('/api/review', second)[0], 200)
        review = self.lib.reviews()['documents'][second['path']]
        self.assertEqual(len(review['comments']), 2)
        self.assertNotEqual(review['comments'][0]['revision'], review['revision'])
        backup = json.loads((self.root/'.state/reviews.backup.json').read_text())
        self.assertEqual(backup['documents'][second['path']]['version'], 1)

    def test_origin_path_traversal_and_bad_payload(self):
        self.assertEqual(self.request('/api/review', self.payload(), origin=False)[0], 403)
        for path in ('/.env', '/docs/../.env', '/docs/%2e%2e/.env', '/.state/reviews.json'):
            self.assertEqual(self.request(path)[0], 404)
        payload = self.payload(); payload['path'] = '../outside.md'
        self.assertEqual(self.request('/api/review', payload)[0], 404)
        payload = self.payload(); payload['status'] = 'unknown'
        self.assertEqual(self.request('/api/review', payload)[0], 400)

    def test_corrupt_storage_never_silently_overwritten(self):
        self.lib.state_dir.mkdir()
        file = self.lib.state_dir/'reviews.json'; file.write_text('broken')
        self.assertEqual(self.request('/api/review', self.payload())[0], 400)
        self.assertEqual(file.read_text(), 'broken')

    def test_superseded_manifest_is_not_assumed_from_body(self):
        (self.root/'docs/design/map-document-status.json').write_text(json.dumps({'documents':[{'path':'docs/design/test.md','status':'superseded'}]}))
        self.assertEqual(self.lib.document('docs/design/test.md')['category'], 'archive')
        self.assertEqual(self.lib.document('docs/design/data.json')['category'], 'data')

    def test_wiki_and_development_are_separate(self):
        classify = lambda p: module.classification(p, set())
        for p in ('docs/design/companions/ye-heng.md', 'docs/design/ye-routes.md', 'docs/design/factions/white-heron.md', 'docs/design/cultivation.md', 'docs/design/martial-review/hearts.md'):
            self.assertEqual(classify(p)[0], 'wiki', p)
        for p in ('docs/design/companions/qin-feiyuan-assets.md', 'docs/design/ye-expression-prompts.md', 'docs/design/cultivation-implementation.md', 'docs/design/martial-review/balance/formula.md', 'docs/design/martial-review/catalog.json', 'docs/testing.md', 'review/story-atlas/VERIFICATION.md'):
            self.assertEqual(classify(p)[0], 'dev', p)
        self.assertEqual(module.classification('docs/design/world.md', {'docs/design/world.md'}), ('dev', 'archive'))


if __name__ == '__main__':
    unittest.main()
