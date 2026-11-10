"""302.AI 声音入口试样：Suno 作曲、MiniMax 作曲、Gemini 语音、MiniMax 语音。只出候选，不接进游戏。

用法（密钥从 xiaojianghu/tools_por/.env 读 AI302_API_KEY，额度不足时换 AI302_API_KEY_BACKUP；不打印密钥）：
  python3 try302_audio.py suno    --prompt-file p.txt --out 目录/名字前缀 [--mv chirp-crow]
  python3 try302_audio.py mmmusic --prompt-file p.txt --lyrics-file l.txt --out x.mp3 [--model music-2.5+]
  python3 try302_audio.py gemini  --text "台词" --voice Kore --out x.wav [--model gemini-3.8-flash-tts]
  python3 try302_audio.py mmtts   --text "台词" --voice male-qn-jingying --out x.mp3 [--model speech-2.8-hd] [--emotion happy]
  python3 try302_audio.py sfx     --text "英文描述" --seconds 22 --out x.mp3      # 302 转接的 ElevenLabs 音效
（2026-11-02 实测：gemini-2.5-flash-preview-tts 在 302 回“上游密钥无效”，用 gemini-3.8-flash-tts；ElevenLabs 直连密钥 401。）
每次调用记进 tools_common/gen-ledger.jsonl。
默认都用各家最好的模型（用户 2026-11-02 定）：Suno v5（chirp-crow）、MiniMax music-2.5+、Gemini 3.8 flash TTS、MiniMax speech-2.8-hd、ElevenLabs eleven_text_to_sound_v2。
"""
import argparse, base64, json, os, struct, sys, time, urllib.error, urllib.request
from pathlib import Path
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent / 'tools_common'))
import genledger

BASES = ['https://api.302.ai', 'https://api.302ai.cn']  # 海外域名偶尔握手失败（2026-11-02 实测），失败就换国内域名

def keys():
    env = {}
    for line in (HERE.parent / 'tools_por' / '.env').read_text().splitlines():
        if '=' in line and not line.lstrip().startswith('#'):
            k, v = line.split('=', 1); env[k.strip()] = v.strip().strip('"\'')
    return [(n, env[n]) for n in ('AI302_API_KEY', 'AI302_API_KEY_BACKUP') if env.get(n)]

def call(method, path, body=None, timeout=600):
    last = None
    for base in BASES:
        try:
            return call_at(base, method, path, body, timeout)
        except urllib.error.URLError as e:
            if isinstance(e, urllib.error.HTTPError): raise
            last = e
    raise last

def call_at(base, method, path, body, timeout):
    last = None
    for name, key in keys():
        req = urllib.request.Request(base + path, json.dumps(body).encode() if body is not None else None,
                                     {'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json', 'Accept': 'application/json'}, method=method)
        try:
            return json.loads(urllib.request.urlopen(req, timeout=timeout).read()), name
        except urllib.error.HTTPError as e:
            msg = e.read().decode('utf-8', 'replace')[:300]
            last = RuntimeError(f'HTTP {e.code}: {msg}')
            if e.code in (401, 402) or '余额' in msg or '额度' in msg or 'quota' in msg.lower():
                continue
            raise last
    raise last

def download(url, out):
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(urllib.request.urlopen(url, timeout=300).read())

def wav_from_pcm(pcm, out, rate=24000):
    out.parent.mkdir(parents=True, exist_ok=True)
    head = b'RIFF' + struct.pack('<I', 36 + len(pcm)) + b'WAVEfmt ' + struct.pack('<IHHIIHH', 16, 1, 1, rate, rate * 2, 2, 16) + b'data' + struct.pack('<I', len(pcm))
    out.write_bytes(head + pcm)

def suno(a):
    prompt = Path(a.prompt_file).read_text().strip()
    run = genledger.start('audio', source='302ai-suno', model_requested=a.mv, prompt=prompt, params={'make_instrumental': True})
    try:
        d, key = call('POST', '/suno/submit/music', {'gpt_description_prompt': prompt, 'mv': a.mv, 'make_instrumental': True})
        task = d.get('data') if isinstance(d.get('data'), str) else (d.get('data') or {}).get('task_id') or d.get('task_id')
        if not task: raise RuntimeError('没拿到任务号：' + json.dumps(d, ensure_ascii=False)[:300])
        run.event('submitted', task_id=task)
        for _ in range(120):
            time.sleep(10)
            r, _ = call('GET', f'/suno/fetch/{task}')
            data = r.get('data') or {}
            status = str(data.get('status', '')).upper()
            clips = data.get('data') or []
            if status in ('SUCCESS', 'COMPLETE') and clips and all(c.get('audio_url') for c in clips):
                outs = []
                for i, c in enumerate(clips):
                    out = Path(f'{a.out}-{i + 1}.mp3'); download(c['audio_url'], out); outs.append(str(out))
                    print('ok', out, c.get('metadata', {}).get('duration'), c.get('model_name'))
                run.finish('succeeded', out=outs[0], meta={'outs': outs, 'key_env': key, 'models': [c.get('model_name') for c in clips]})
                return
            if status in ('FAILURE', 'FAILED'): raise RuntimeError('Suno 失败：' + json.dumps(r, ensure_ascii=False)[:300])
        raise RuntimeError('Suno 等待超时，任务号 ' + task)
    except Exception as e:
        run.fail(e); raise

def mmmusic(a):
    prompt = Path(a.prompt_file).read_text().strip(); lyrics = Path(a.lyrics_file).read_text().strip()
    run = genledger.start('audio', source='302ai-minimax-music', model_requested=a.model, prompt=prompt, params={'lyrics': lyrics})
    try:
        d, key = call('POST', '/minimaxi/v1/music_generation', {'model': a.model, 'prompt': prompt, 'lyrics': lyrics, 'output_format': 'url',
                     'audio_setting': {'sample_rate': 44100, 'bitrate': 256000, 'format': 'mp3'}})
        url = (d.get('data') or {}).get('audio_url') or (d.get('data') or {}).get('audio')
        if not url: raise RuntimeError('没拿到音频：' + json.dumps(d, ensure_ascii=False)[:300])
        download(url, Path(a.out)); print('ok', a.out)
        run.finish('succeeded', out=a.out, meta={'key_env': key, 'extra': d.get('extra_info')})
    except Exception as e:
        run.fail(e); raise

def gemini(a):
    run = genledger.start('audio', source='302ai-gemini-tts', model_requested=a.model, prompt=a.text, params={'voice': a.voice})
    try:
        body = {'contents': [{'parts': [{'text': a.text}]}], 'model': a.model,
                'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': a.voice}}}}}
        d, key = call('POST', f'/google/v1/models/{a.model}?response_format=data', body)
        part = d['candidates'][0]['content']['parts'][0]['inlineData']
        rate = int((part.get('mimeType', '').split('rate=') + ['24000'])[1].split(';')[0])
        wav_from_pcm(base64.b64decode(part['data']), Path(a.out), rate); print('ok', a.out)
        run.finish('succeeded', out=a.out, meta={'key_env': key, 'usage': d.get('usageMetadata')})
    except Exception as e:
        run.fail(e); raise

def mmtts(a):
    run = genledger.start('audio', source='302ai-minimax-tts', model_requested=a.model, prompt=a.text, params={'voice': a.voice, 'emotion': a.emotion})
    try:
        vs = {'voice_id': a.voice, 'speed': 1, 'vol': 1, 'pitch': 0}
        if a.emotion: vs['emotion'] = a.emotion
        d, key = call('POST', '/minimaxi/v1/t2a_v2', {'model': a.model, 'text': a.text, 'voice_setting': vs, 'language_boost': 'Chinese',
                     'audio_setting': {'sample_rate': 32000, 'bitrate': 128000, 'format': 'mp3', 'channel': 1}, 'output_format': 'url'})
        if (d.get('base_resp') or {}).get('status_code'): raise RuntimeError(json.dumps(d['base_resp'], ensure_ascii=False))
        download(d['data']['audio'], Path(a.out)); print('ok', a.out)
        run.finish('succeeded', out=a.out, meta={'key_env': key, 'extra': d.get('extra_info')})
    except Exception as e:
        run.fail(e); raise

def sfx(a):
    run = genledger.start('audio', source='302ai-elevenlabs-sfx', model_requested='eleven_text_to_sound_v2', prompt=a.text, params={'duration_seconds': a.seconds})
    try:
        d, key = call('POST', '/elevenlabs/sound-generation', {'text': a.text, 'duration_seconds': a.seconds, 'prompt_influence': a.influence, 'model_id': 'eleven_text_to_sound_v2'})
        if not d.get('url'): raise RuntimeError('没拿到音频：' + json.dumps(d, ensure_ascii=False)[:300])
        download(d['url'], Path(a.out)); print('ok', a.out)
        run.finish('succeeded', out=a.out, meta={'key_env': key})
    except Exception as e:
        run.fail(e); raise

p = argparse.ArgumentParser(); s = p.add_subparsers(dest='cmd', required=True)
x = s.add_parser('sfx'); x.add_argument('--text', required=True); x.add_argument('--seconds', type=float, default=5); x.add_argument('--influence', type=float, default=0.5); x.add_argument('--out', required=True); x.set_defaults(f=sfx)
x = s.add_parser('suno'); x.add_argument('--prompt-file', required=True); x.add_argument('--out', required=True); x.add_argument('--mv', default='chirp-crow'); x.set_defaults(f=suno)
x = s.add_parser('mmmusic'); x.add_argument('--prompt-file', required=True); x.add_argument('--lyrics-file', required=True); x.add_argument('--out', required=True); x.add_argument('--model', default='music-2.5+'); x.set_defaults(f=mmmusic)
x = s.add_parser('gemini'); x.add_argument('--text', required=True); x.add_argument('--voice', default='Kore'); x.add_argument('--out', required=True); x.add_argument('--model', default='gemini-3.8-flash-tts'); x.set_defaults(f=gemini)
x = s.add_parser('mmtts'); x.add_argument('--text', required=True); x.add_argument('--voice', required=True); x.add_argument('--out', required=True); x.add_argument('--model', default='speech-2.8-hd'); x.add_argument('--emotion'); x.set_defaults(f=mmtts)
a = p.parse_args(); a.f(a)
