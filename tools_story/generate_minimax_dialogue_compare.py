#!/usr/bin/env python3
"""Explicit, single paid MiniMax request for the dialogue comparison. No automatic retries."""
import datetime
import argparse
import hashlib
import json
import os
from pathlib import Path
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'review/cultivation-minimax-compare-20261012'


def main():
    global OUT
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, default=OUT)
    args = parser.parse_args()
    OUT = args.output_dir.resolve()
    if (OUT / 'generation.json').exists():
        raise SystemExit('An attempt is already recorded; archive and review it before another paid request.')
    key = os.environ.get('MiniMax_APIKEY') or os.environ.get('MINIMAX_API_KEY')
    if not key:
        for line in (ROOT.parent / 'xiaojianghu/.env').read_text().splitlines():
            if line.startswith('MiniMax_APIKEY='):
                key = line.split('=', 1)[1].strip().strip('\"\'')
    if not key:
        raise SystemExit('Missing MiniMax credential')
    body = (OUT / 'request.json').read_bytes()
    request = json.loads(body)
    url = 'https://api.minimax.cn/v1/chat/completions'
    meta = dict(requested_model=request['model'], endpoint=url,
                request_sha256=hashlib.sha256(body).hexdigest(),
                started_at=datetime.datetime.now(datetime.timezone.utc).isoformat(), post_editing=False)
    req = urllib.request.Request(url, body, {'Authorization': 'Bearer ' + key,
                                            'Content-Type': 'application/json'})
    started = time.monotonic()
    parts = []
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            for line in response:
                line = line.decode().strip()
                if not line.startswith('data:'):
                    continue
                data = line[5:].strip()
                if data == '[DONE]':
                    break
                chunk = json.loads(data)
                if chunk.get('error') or chunk.get('base_resp', {}).get('status_code', 0):
                    raise RuntimeError(json.dumps(chunk.get('error') or chunk.get('base_resp')))
                if chunk.get('model'):
                    meta['returned_model'] = chunk['model']
                if chunk.get('id'):
                    meta['response_id'] = chunk['id']
                if chunk.get('usage'):
                    meta['usage'] = chunk['usage']
                for choice in chunk.get('choices', []):
                    if choice.get('finish_reason'):
                        meta['finish_reason'] = choice['finish_reason']
                    text = choice.get('delta', {}).get('content')
                    if text:
                        parts.append(text)
    except urllib.error.HTTPError as exc:
        meta['error'] = dict(http_status=exc.code, message=exc.read().decode()[:800].replace(key, '[REDACTED]'))
    except Exception as exc:
        meta['error'] = str(exc).replace(key, '[REDACTED]')[:800]
    text = ''.join(parts)
    # M3 may place a tagged thinking block in content on this compatibility endpoint.
    # Keep only the final answer in the review files, never expose the reasoning block.
    if '</think>' in text:
        text = text.split('</think>', 1)[1].strip()
        meta['transport_normalization'] = 'Removed separate <think> block; final answer unchanged'
    (OUT / 'minimax-original.txt').write_text(text)
    meta['elapsed_seconds'] = round(time.monotonic() - started, 2)
    meta['output_sha256'] = hashlib.sha256(text.encode()).hexdigest()
    meta['output_characters'] = len(text)
    if 'usage' not in meta:
        meta['usage'] = None
        meta['usage_note'] = 'Streaming response did not provide usage; not estimated.'
    (OUT / 'generation.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(meta, ensure_ascii=False), flush=True)
    if meta.get('error') or meta.get('finish_reason') != 'stop' or not text:
        raise SystemExit(1)
    raw = text.strip()
    if raw.startswith('```'):
        raw = raw.split('\n', 1)[1].rsplit('```', 1)[0].strip()
    result = json.loads(raw)
    (OUT / 'minimax.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()
