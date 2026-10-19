"""Local voice casting and generation queue; stdlib only. CLI defaults to MiniMax and prepares missing auditions on startup."""
import argparse, ast, fcntl, hashlib, io, json, os, re, threading, time, uuid, wave
import urllib.request, urllib.error
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
MODEL = 'speech-2.8-hd'
EMOTIONS = {'happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'calm'}
SYNTHESIS_VERSION = 2
REQUEST_INTERVAL = 2.0
RATE_LIMIT_BACKOFF = 20.0
RATE_LIMIT_RETRIES = 3
_request_lock = threading.Lock()
_next_request_at = 0.0


def acquire_service_lock(state_dir):
    """Keep one writer and paid generation queue per persistent state directory."""
    directory = Path(state_dir)
    directory.mkdir(parents=True, exist_ok=True)
    handle = (directory / 'service.lock').open('a+')
    try:
        fcntl.flock(handle.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        handle.close()
        raise RuntimeError('语音制作后台已经运行，请打开已有页面，避免重复生成') from None
    return handle


def request_speech(req):
    """Account-wide pacing inside this process, without logging request data."""
    global _next_request_at
    with _request_lock:
        delay = _next_request_at - time.monotonic()
        if delay > 0:
            time.sleep(delay)
        try:
            with urllib.request.urlopen(req, timeout=180) as response:
                return json.load(response)
        except urllib.error.HTTPError as exc:
            try:
                payload = json.load(exc)
                if isinstance(payload, dict) and isinstance(payload.get('base_resp'), dict):
                    return payload
            except Exception:
                pass
            raise RuntimeError('语音服务 HTTP 错误 ' + str(exc.code) + '，请检查账户接口权限') from None
        except Exception:
            raise RuntimeError('语音服务网络请求失败，请检查网络和账户配置') from None
        finally:
            _next_request_at = time.monotonic() + REQUEST_INTERVAL

class APIError(Exception):
    def __init__(self, message, code=400):
        super().__init__(message)
        self.code = code


def provider_error(payload, operation):
    response = payload.get('base_resp', {})
    code = response.get('status_code')
    message = str(response.get('status_msg') or '').strip()
    # Keep the useful provider reason without reflecting an echoed credential.
    try:
        message = message.replace(api_key(), '[密钥已隐藏]')
    except RuntimeError:
        pass
    message = re.sub(r'(?i)\bBearer\s+\S+', 'Bearer [密钥已隐藏]', message)
    message = re.sub(r'\bsk-[A-Za-z0-9_-]+', '[密钥已隐藏]', message)
    message = ' '.join(message.split())[:500]
    reason = {
        2061: '当前 Token Plan 不支持此次模型或能力；这是套餐范围限制，不表示剩余额度耗尽。',
        1008: '接口返回账户余额不足，请核对本次 API 使用的账户与计费方式。',
        1004: '接口认证失败，请检查本地 API 密钥。',
        2013: '接口参数无效，请依据接口说明检查参数。',
    }.get(code, '请依据接口说明检查本次请求。')
    return RuntimeError(f'MiniMax {operation}失败（错误码 {code}）：{reason}' + (f' 接口说明：{message}' if message else ''))


def candidates():
    # Read definitions without importing the old script (import would generate paid audio).
    tree = ast.parse((ROOT / 'tools_audio/gen_voice_pick.py').read_text())
    env = {'V': lambda slug, vid, name, pitch=0, speed=1.: dict(slug=slug, voice_id=vid, name=name, pitch=pitch, speed=speed)}
    for node in tree.body:
        if isinstance(node, ast.Assign) and any(isinstance(t, ast.Name) and t.id in {'M', 'F_YOUNG', 'OLD', 'ROUGH', 'CHARS'} for t in node.targets):
            exec(compile(ast.Module(body=[node], type_ignores=[]), '<candidate-definitions>', 'exec'), env)
    result = {c['id']: c for c in env['CHARS'] if c['id'] != 'hero'}
    result['ye'] = dict(id='ye', name='叶蘅', por='p_ye', group='同伴', persona='清亮利落的年轻少女', lines=[('按住他的手，别让他乱动。', '救治'), ('这瓶药的来路，总得问清楚。', '调查'), ('别怕，有我们在。', '温柔')], cands=env['F_YOUNG'])
    result['zhou'] = dict(id='zhou', name='老周', por='p_zhou', group='襄阳', persona='病中气短虚弱的中年挑夫', lines=[('多谢……多谢两位姑娘。', '醒来'), ('我的担子……还在街上呢。', '牵挂'), ('咳……能给我一口水么？', '虚弱')], cands=env['ROUGH'] + env['OLD'])
    extra = [
        ('pipi', '歪帽泼皮', env['ROUGH'], [('小子，这书匣你也想拿？', '轻佻'), ('别打了，我交，我交！', '慌张'), ('嘿，识相些就好。', '得意')]),
        ('merchant', '盐商', env['ROUGH'], [('我的货还在船上！', '焦急'), ('多谢少侠，救了我这一船货。', '感激'), ('这回总算能安心回家了。', '释然')]),
        ('water_neighbor', '汲水妇人', result['lady']['cands'], [('井水不急，慢慢来。', '平和'), ('那人往巷子里去了。', '指路'), ('哎哟，可别再闹出人命了。', '担忧')]),
        ('trainer', '城防营教头', env['ROUGH'], [('下盘站稳，再出手。', '指点'), ('不错，这身手练过。', '认可'), ('收招，今日到此为止。', '果断')]),
    ]
    for cid, name, pool, lines in extra:
        result[cid] = dict(id=cid, name=name, group='襄阳', lines=lines, cands=pool)
    # Broaden actual voices, retaining original candidate IDs and saved auditions.
    male = env['OLD'] + env['ROUGH'] + next(c['cands'] for c in env['CHARS'] if c['id'] == 'hero') + result['gossip']['cands']
    female = env['F_YOUNG'] + result['lady']['cands']
    for cid, char in result.items():
        if cid in ('ye', 'suzhi', 'monk'):
            continue
        pool = female if cid in ('lady', 'water_neighbor') else male
        target = 15 if cid in ('lady', 'water_neighbor') else 12
        known = {c['voice_id'] for c in char['cands']}
        char['cands'] = list(char['cands'])
        for cand in pool:
            if len(known) >= target:
                break
            if cand['voice_id'] in known:
                continue
            char['cands'].append({**cand, 'slug': 'extra_' + cand['slug']})
            known.add(cand['voice_id'])
    villains = json.loads((ROOT / 'tools_audio/voice_villains.json').read_text())
    for cid in villains['roles']:
        result[cid]['cands'] = villains['candidates'] + result[cid]['cands']
    casting_file = ROOT / 'tools_audio/voice_casting.json'
    if casting_file.is_file():
        casting = json.loads(casting_file.read_text())
        auditions = json.loads((ROOT / 'tools_audio/voice_auditions.json').read_text())['characters']
        for char in casting['characters']:
            cid = char['id']
            if char.get('preserve_existing_candidates') and cid in result:
                result[cid].update({k:char[k] for k in ('gender','preview_priority')})
                continue
            result[cid] = {**char, 'lines': [(l['text'],l['emotion']) for l in auditions[cid]]}
    return result


def expansion_plan(prompt, count, char, previous):
    """Keyword-guided system voice tuning, explicitly distinct from Voice Design."""
    original_prompt = prompt
    prompt = re.sub(r'(?:太|不要|不想要|别用|不是|不喜欢|不需要|避免|避开|别再)(?:很|太|过于)?(?:年轻|青年|少年|少女|稚嫩|凶狠|阴险|温柔|低沉|明亮|清亮|快速|年长|苍老|老头|老人)(?:声音|音色|声|了)?', '', prompt)
    aged_male = any(w in prompt for w in ('老头', '老爷爷', '老伯', '大爷', '爷爷', '老汉', '老翁'))
    aged_female = any(w in prompt for w in ('老太', '老奶奶', '奶奶', '婆婆', '老妪'))
    aged = aged_male or aged_female or any(w in prompt for w in ('苍老', '老人', '老者', '老年', '年迈', '高龄', '白发'))
    fierce = any(w in prompt for w in ('凶', '狠', '暴', '悍', '霸道', '强势', '粗犷', '威猛'))
    sinister = any(w in prompt for w in ('阴', '险', '狡', '冷', '腹黑', '毒', '威胁'))
    gentle = any(w in prompt for w in ('温', '柔', '亲切', '治愈', '甜', '灵动', '清秀'))
    old = aged or any(w in prompt for w in ('年长', '成熟', '中年'))
    young = any(w in prompt for w in ('年轻', '青年', '少年', '少女', '稚嫩', '清亮'))
    deep = any(w in prompt for w in ('低沉', '浑厚', '磁性', '沙哑', '厚重'))
    bright = any(w in prompt for w in ('明亮', '清脆', '尖', '清亮', '轻快', '灵动'))
    fast = any(w in prompt for w in ('快速', '快些', '轻快', '急促'))
    slow = any(w in prompt for w in ('慢', '舒缓', '克制', '低声'))
    if not any((fierce, sinister, gentle, old, young, deep, bright, fast, slow)):
        raise APIError('系统调校暂未识别声音方向，请加入凶狠、阴险、温柔、年轻、年长、低沉、清亮或语速描述；完整自由描述可选择 AI 设计。')
    allchars = candidates()
    female = not aged_male and (aged_female or '女' in prompt or ('男' not in prompt and (char.get('gender') == '女' or char['id'] in ('ye', 'suzhi', 'lady', 'water_neighbor'))))
    pool = allchars['ye' if female else 'liu']['cands'] + allchars['lady' if female else 'chief']['cands']
    if aged and not female:
        # Elderly requests use elderly base voices; lowering a young voice is insufficient.
        pool = [dict(voice_id='Chinese (Mandarin)_Humorous_Elder', name='诙谐老者'),
                dict(voice_id='Chinese (Mandarin)_Kind-hearted_Elder', name='慈祥老者')]
    unique = {c['voice_id']: c for c in pool}
    if old:
        preferred = ['Mature_Woman', 'chengshu', 'Wise_Women'] if female else ['Humorous_Elder', 'Reliable_Executive', 'Radio_Host', 'Male_Announcer']
    elif young:
        preferred = ['Girl', 'shaonv', 'xuejie'] if female else ['Young', 'qingse', 'jingying', 'xiongzhang', 'badao']
    elif sinister:
        preferred = ['yujie', 'Mature_Woman', 'Wise_Women'] if female else ['xiongzhang', 'jingying', 'Reliable_Executive', 'Radio_Host']
    else:
        preferred = ['Girl', 'shaonv'] if female else ['badao', 'Stubborn', 'Unrestrained', 'Male_Announcer', 'Robot_Armor']
    pool = sorted(unique.values(), key=lambda c: not any(w in c['voice_id'] for w in preferred))
    style = '凶狠阴险' if fierce and sinister else '凶狠' if fierce else '阴险' if sinister else '温柔' if gentle else '年长' if old else '年轻' if young else '低沉' if deep else '清亮' if bright else '语速'
    emotion = 'angry' if fierce and not sinister else 'disgusted' if sinister and not gentle else 'happy' if gentle and bright else 'calm'
    def sound_key(c):
        return json.dumps([c['voice_id'], c['pitch'], c['speed'], c.get('emotion_api_override'), c.get('voice_modify')], sort_keys=True)
    used = {sound_key(c) for c in previous}
    output = []
    for attempt in range(200):
        base = pool[attempt % len(pool)]
        variation = attempt // len(pool)
        modifier = dict(pitch=(-25 if deep else 10 if bright else -15 if sinister or fierce else 0) + variation * 3,
                        intensity=(-40 if fierce else 20 if gentle else -5) + variation * 2,
                        timbre=(-20 if deep or fierce else 15 if bright else -5) + variation * 3)
        cand = dict(slug='custom_' + uuid.uuid4().hex[:16], voice_id=base['voice_id'],
                    name=style + (' · ' + base['name'] if aged and not female else '') + ' · 自选 ' + str(len(previous) + len(output) + 1), style=style,
                    pitch=-2 if deep or sinister else -1 if aged else 1 if bright else 0,
                    speed=round((.88 if slow or sinister else .92 if aged else 1.08 if fast else 1.) + variation * .01, 2),
                    emotion_api_override=emotion, voice_modify=modifier, generation_mode='tune', prompt=original_prompt)
        if char.get('voice_mode', 'full') != 'single':
            cand.pop('emotion_api_override')
        key = sound_key(cand)
        if key in used:
            continue
        used.add(key); output.append(cand)
        if len(output) == count:
            return output
    raise APIError('当前方向的调校候选已经较多，请更换描述或使用 AI 设计。')


def design_voice(prompt, text, voice_id):
    body = dict(prompt=prompt, preview_text=text, voice_id=voice_id)
    req = urllib.request.Request('https://api.minimaxi.com/v1/voice_design', json.dumps(body).encode(),
                                {'Authorization': 'Bearer ' + api_key(), 'Content-Type': 'application/json'})
    # No automatic retry: a timeout may already have created a billed remote voice.
    payload = request_speech(req)
    code = payload.get('base_resp', {}).get('status_code', 0)
    if code:
        raise provider_error(payload, '音色设计')
    if payload.get('voice_id') != voice_id:
        raise RuntimeError('MiniMax 未返回请求的自定义音色 ID，请检查账户音色列表后再试。')
    return voice_id


def api_key():
    value = os.environ.get('MiniMax_APIKEY') or os.environ.get('MINIMAX_API_KEY')
    if value:
        return value
    file = ROOT / '.env'
    if file.exists():
        for line in file.read_text().splitlines():
            if line.startswith('MiniMax_APIKEY='):
                return line.split('=', 1)[1].strip().strip('\"\'')
    raise RuntimeError('缺少 MiniMax_APIKEY 环境变量或本地 .env 配置')


def synthesize(line, binding, provider):
    emotion = binding.get('emotion_api_override', line.get('emotion_api', 'calm'))
    if emotion not in EMOTIONS:
        raise APIError('情绪参数不受当前模型支持')
    if provider == 'mock':
        # Silent WAV deliberately cannot be mistaken for a usable voice recording.
        data = io.BytesIO()
        with wave.open(data, 'wb') as wav:
            wav.setparams((1, 2, 16000, 0, 'NONE', 'not compressed'))
            wav.writeframes(b'\0\0' * 8000)
        return data.getvalue(), '.wav'
    body = {'model': MODEL, 'text': line['text'], 'stream': False, 'output_format': 'hex',
            'voice_setting': {k: binding[k] for k in ('voice_id', 'pitch', 'speed')},
            'audio_setting': {'sample_rate': 32000, 'bitrate': 128000, 'format': 'mp3', 'channel': 1}}
    body['voice_setting']['vol'] = 1
    body['voice_setting']['emotion'] = emotion
    if binding.get('voice_modify'):
        modifiers = binding['voice_modify']
        if any(k not in {'pitch', 'intensity', 'timbre'} or type(v) is not int or not -100 <= v <= 100 for k, v in modifiers.items()):
            raise APIError('声音效果参数无效')
        body['voice_modify'] = dict(modifiers)
    req = urllib.request.Request('https://api.minimaxi.com/v1/t2a_v2', json.dumps(body).encode(),
                                 {'Authorization': 'Bearer ' + api_key(), 'Content-Type': 'application/json'})
    for attempt in range(RATE_LIMIT_RETRIES + 1):
        payload = request_speech(req)
        code = payload.get('base_resp', {}).get('status_code', 0)
        if code in (1002, 1039) and attempt < RATE_LIMIT_RETRIES:
            time.sleep(RATE_LIMIT_BACKOFF)
            continue
        if code:
            raise provider_error(payload, '语音合成')
        break
    audio = payload.get('data', {}).get('audio')
    if not audio:
        raise RuntimeError('语音服务未返回音频')
    return bytes.fromhex(audio), '.mp3'


class VoiceStore:
    def __init__(self, state_dir=None, catalog=None, provider='mock', generate=None):
        self.dir = Path(state_dir or ROOT / 'tools_audio/.voice_state')
        self.dir.mkdir(parents=True, exist_ok=True)
        self.catalog = Path(catalog or ROOT / 'tools_audio/voice_lines.json')
        self.provider = provider
        self.generate = generate or synthesize
        self.lock = threading.RLock()
        self.worker = threading.Lock()
        self.data_file = self.dir / 'state.json'
        self.data = json.loads(self.data_file.read_text()) if self.data_file.exists() else {'bindings': {}, 'records': {}, 'jobs': []}
        for job in self.data['jobs']:
            if job['status'] in ('queued', 'running'):
                job.update(status='interrupted', error='服务重启中断，请点击补全或重试')
        self.save()
        self.chars = candidates()
        self.data.setdefault('user_candidates', {})
        for cid, rows in self.data['user_candidates'].items():
            if cid in self.chars:
                self.chars[cid]['cands'] = rows + self.chars[cid]['cands']
        self.data.setdefault('previews', {})
        self.auto_preview = dict(status='idle', total=0, completed=0, failed=0, current=None, error=None)
        self.auto_thread = None
        self.definition_stamp = self._definition_stamp()
        self.audition_cache = json.loads((ROOT / 'tools_audio/voice_auditions.json').read_text())

    def _definition_stamp(self):
        return tuple((p.name, p.stat().st_mtime_ns) for p in [ROOT/'tools_audio/gen_voice_pick.py',ROOT/'tools_audio/voice_casting.json',ROOT/'tools_audio/voice_auditions.json'] if p.is_file())

    def reload_definitions(self):
        """Reload declarative casting without a second state writer or changing bindings."""
        with self.lock:
            stamp = self._definition_stamp()
            if stamp == self.definition_stamp:
                return
            # A newly added role must be readable even while another role is generating.
            # Freeze only the busy roles, so their queued text and sample indices stay stable.
            busy = {j['character_id'] for j in self.data['jobs'] if j['status'] in ('queued','running')}
            chars = candidates()
            auditions = json.loads((ROOT / 'tools_audio/voice_auditions.json').read_text())
            for cid, rows in self.data.get('user_candidates', {}).items():
                if cid in chars:
                    chars[cid]['cands'] = rows + chars[cid]['cands']
            for cid in busy:
                if cid in self.chars:
                    chars[cid] = self.chars[cid]
                    auditions['characters'][cid] = self.audition_cache['characters'][cid]
            self.chars = chars
            if not busy:
                self.definition_stamp = stamp
            self.audition_cache = auditions

    def save(self):
        temp = self.data_file.with_suffix('.tmp')
        temp.write_text(json.dumps(self.data, ensure_ascii=False, indent=2))
        os.replace(temp, self.data_file)

    def read_catalog(self):
        value = json.loads(self.catalog.read_text())
        lines = [line for line in value['lines'] if line.get('status', 'active') == 'active' and line.get('voice_enabled', True)]
        ids = [line['id'] for line in lines]
        if len(ids) != len(set(ids)):
            raise APIError('台词清单包含重复 ID')
        if value.get('schema_version', 1) >= 2:
            if any(l.get('emotion_api') not in EMOTIONS or not l.get('emotion') or not l.get('delivery_notes') for l in lines):
                raise APIError('台词须填写中文情绪、有效 emotion_api 与演出说明')
        for char in value['characters']:
            if char.get('voice_mode') == 'single':
                battle = [l for l in lines if l['character_id'] == char['id'] and l.get('kind') == 'battle']
                if battle and (not char.get('battle_voice_enabled') or any(l.get('battle_event') not in {'turn','attack','hurt','down','support'} for l in battle)):
                    raise APIError('战斗语音须明确登记角色与有效事件')
                enabled = [l for l in lines if l['character_id'] == char['id'] and l.get('kind') != 'battle']
                if len(enabled) != 1 or enabled[0]['id'] != char.get('single_line_id'):
                    raise APIError('单句 NPC 只能启用指定的一条配音')
        return value, lines

    def preview_indices(self, cid):
        catalog, _ = self.read_catalog()
        char = next((c for c in catalog['characters'] if c['id'] == cid), {})
        if char.get('voice_mode') == 'single':
            index = char.get('single_preview_index', 0)
            if not isinstance(index, int) or not 0 <= index < len(self.chars[cid]['lines']):
                raise APIError('单句试听索引无效')
            return [index]
        return list(range(len(self.chars[cid]['lines'])))

    def fingerprint(self, line, binding):
        value = dict(text=line['text'], revision=line.get('revision', 1), emotion=line.get('emotion'), emotion_api=line.get('emotion_api', 'calm'), delivery_notes=line.get('delivery_notes'), synthesis_version=SYNTHESIS_VERSION, binding=binding, model=MODEL, provider=self.provider)
        return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False).encode()).hexdigest()

    def record_current(self, line, binding):
        record = self.data['records'].get(line['id'], {})
        return bool(record.get('hash') == self.fingerprint(line, binding) and record.get('status') == 'ready' and (self.dir / record.get('file', '')).is_file())

    def preview_line(self, cid, slug, index):
        text, tag = self.chars[cid]['lines'][index]
        direction = self.audition_cache['characters'][cid][index]
        if direction['emotion_api'] not in EMOTIONS:
            raise APIError('试听情绪参数不受当前模型支持')
        return dict(direction, id=cid + '/' + slug + '/' + str(index), text=text, emotion=tag)

    def preview_current(self, cid, cand, index):
        line = self.preview_line(cid, cand['slug'], index)
        record = self.data['previews'].get(line['id'], {})
        if (record.get('hash') == self.fingerprint(line, cand) and record.get('status') == 'ready'
                and record.get('provider') == self.provider and (self.dir / record.get('file', '')).is_file()):
            return '/api/preview/' + line['id'] + '?v=' + record['hash']
        # Existing real samples are accepted only if the saved manifest describes the
        # same model, voice settings and exact sample text. Altered sample text is stale.
        manifest = ROOT / 'assets/audio/voice_pick/manifest.js'
        preview = ROOT / 'assets/audio/voice_pick' / cid / (cand['slug'] + '_' + str(index) + '.mp3')
        if preview.is_file() and manifest.is_file():
            try:
                legacy = json.loads(manifest.read_text().split('=', 1)[1].strip().rstrip(';'))
                char = next(c for c in legacy['chars'] if c['id'] == cid)
                old = next(c for c in char['cands'] if c['slug'] == cand['slug'])
                if (legacy.get('synthesis_version') == SYNTHESIS_VERSION
                        and char['lines'][index].get('emotion_api') == line['emotion_api']
                        and legacy['model'] == MODEL and char['lines'][index]['text'] == line['text']
                        and all(old.get(k) == cand.get(k) for k in ('voice_id', 'speed', 'pitch'))):
                    return '/assets/audio/voice_pick/' + cid + '/' + cand['slug'] + '_' + str(index) + '.mp3'
            except (ValueError, KeyError, IndexError, StopIteration):
                pass
        return None

    def start_auto_previews(self):
        """Explicit entry point; CLI invokes it for real production startup only."""
        with self.lock:
            if self.auto_thread and self.auto_thread.is_alive():
                return self.auto_preview
            self.reload_definitions()
            catalog, _ = self.read_catalog()
            pairs = [(c['id'], cand['slug']) for c in catalog['characters'] for cand in self.chars.get(c['id'], {}).get('cands', [])]
            pairs.sort(key=lambda pair:self.chars[pair[0]].get('preview_priority',4))
            self.auto_preview = dict(status='running', total=len(pairs), completed=0, failed=0, current=None, error=None)
            self.auto_thread = threading.Thread(target=self._auto_previews, args=(pairs,), daemon=True)
            self.auto_thread.start()
            return self.auto_preview

    def _auto_previews(self, pairs):
        try:
            for cid, slug in pairs:
                with self.lock:
                    self.auto_preview['current'] = dict(character_id=cid, candidate_slug=slug)
                    cand = next(c for c in self.chars[cid]['cands'] if c['slug'] == slug)
                    if all(self.preview_current(cid, cand, i) for i in self.preview_indices(cid)):
                        self.auto_preview['completed'] += 1
                        continue
                # A user action may occupy this character; wait, preserving their task.
                while True:
                    with self.lock:
                        busy = self.active_job(cid)
                    if not busy:
                        break
                    time.sleep(.1)
                try:
                    job = self.preview(cid, slug)
                except APIError:
                    with self.lock:
                        self.auto_preview['completed'] += 1
                        self.auto_preview['failed'] += 1
                    continue
                while True:
                    with self.lock:
                        current = next(j for j in self.data['jobs'] if j['id'] == job['id'])
                        done = current['status'] not in ('queued', 'running')
                    if done:
                        break
                    time.sleep(.1)
                with self.lock:
                    self.auto_preview['completed'] += 1
                    self.auto_preview['failed'] += int(current['status'] != 'completed')
            with self.lock:
                self.auto_preview.update(status='failed' if self.auto_preview['failed'] else 'completed', current=None)
        except Exception:
            with self.lock:
                self.auto_preview.update(status='failed', error='自动试听队列失败，请检查台词清单后重启服务', current=None)

    def state(self):
        with self.lock:
            self.reload_definitions()
            catalog, lines = self.read_catalog()
            characters = []
            for raw in catalog['characters']:
                base = self.chars.get(raw['id'], {})
                char = {**base, **raw}
                char['por'] = raw.get('por', raw.get('portrait', base.get('por', '')))
                if not (ROOT / 'assets' / (char['por'] + '.webp')).is_file():
                    char['por'] = ''
                indices = self.preview_indices(raw['id'])
                char['lines'] = [{**self.preview_line(raw['id'], '', i), 'tag': base['lines'][i][1]} for i in indices]
                char['cands'] = []
                for cand in base.get('cands', []):
                    users = [cid for cid, b in self.data['bindings'].items() if b['voice_id'] == cand['voice_id']]
                    owner = next((cid for cid in users if cid != raw['id']), None)
                    modes = {c['id']: c.get('voice_mode', 'full') for c in catalog['characters']}
                    locked = modes[raw['id']] != 'single' and any(cid != raw['id'] and modes.get(cid, 'full') != 'single' for cid in users)
                    urls = [self.preview_current(raw['id'], cand, i) for i in indices]
                    active = next((j for j in reversed(self.data['jobs']) if j.get('type') in ('preview', 'expansion') and j['character_id'] == raw['id'] and (j.get('candidate_slug') == cand['slug'] or cand['slug'] in j.get('candidate_slugs', []))), {})
                    complete = bool(urls) and all(urls)
                    preview_status = 'ready' if complete else active.get('status', 'missing')
                    if not complete and preview_status == 'completed':
                        preview_status = 'stale'
                    char['cands'].append({**cand, 'occupied_by': owner, 'used_by': users, 'voice_locked': locked, 'preview_urls': urls,
                                          'preview_status': preview_status, 'preview_error': active.get('error'),
                                          'preview_is_mock': self.provider == 'mock' and any(u and u.startswith('/api/preview/') for u in urls),
                                          'preview_available': complete,
                                          'preview_ready_count': sum(bool(url) for url in urls),
                                          'preview_total': len(urls)})
                characters.append(char)
            enriched = []
            for line in lines:
                binding = self.data['bindings'].get(line['character_id'])
                record = self.data['records'].get(line['id'], {})
                ready = binding and self.record_current(line, binding)
                status = ('mock_ready' if self.provider == 'mock' else 'ready') if ready else ('unbound' if not binding else 'stale' if record.get('status') == 'ready' else record.get('status', 'missing'))
                enriched.append({**line, 'emotion_api': binding.get('emotion_api_override', line.get('emotion_api')) if binding else line.get('emotion_api'), 'synthesis_status': status, 'status': status, 'audio_url': '/api/audio/' + line['id'] + '?v=' + record['hash'] if ready else None, 'error': record.get('error'), 'mock': self.provider == 'mock'})
            enriched.extend({**l,'status':'casting_only','synthesis_status':'casting_only','audio_url':None,'mock':False} for l in catalog['lines'] if l.get('sync_group')=='current_casting' and l.get('status')=='active' and not l.get('voice_enabled',True))
            return dict(mode='mock' if self.provider == 'mock' else 'real', provider=self.provider, model=MODEL, characters=characters, bindings=self.data['bindings'], lines=enriched, jobs=self.data['jobs'], auto_preview=dict(self.auto_preview),catalog_sync=catalog.get('catalog_sync'))

    def active_job(self, cid, kind=None):
        return any(j['character_id'] == cid and j['status'] in ('queued', 'running') and (kind is None or j.get('type') == kind) for j in self.data['jobs'])

    def adopt_single_preview(self, char, binding, lines):
        if char.get('voice_mode') != 'single':
            return
        cid = char['id']
        line = next(l for l in lines if l['id'] == char['single_line_id'])
        if self.record_current(line, binding):
            return
        slug = binding.get('candidate_slug', binding.get('slug'))
        cand = next((c for c in self.chars[cid]['cands'] if c['slug'] == slug), None)
        if not cand or any(cand[k] != binding[k] for k in ('voice_id', 'pitch', 'speed')) or any(cand.get(k) != binding.get(k) for k in ('voice_modify', 'emotion_api_override')):
            return
        index = self.preview_indices(cid)[0]
        preview = self.data['previews'].get(self.preview_line(cid, slug, index)['id'], {})
        if (preview.get('status') == 'ready' and preview.get('hash') == self.fingerprint(line, cand)
                and (self.dir / preview.get('file', '')).is_file()):
            self.data['records'][line['id']] = {**preview, 'hash': self.fingerprint(line, binding), 'adopted_from_preview': True}

    def bind(self, cid, slug, confirm):
        if confirm is not True:
            raise APIError('必须明确确认音色')
        with self.lock:
            catalog, _ = self.read_catalog()
            if cid not in {c['id'] for c in catalog['characters']}:
                raise APIError('未知角色')
            if self.active_job(cid, 'lines'):
                raise APIError('角色正在生成，请任务结束后再调整音色', 409)
            cand = next((c for c in self.chars.get(cid, {}).get('cands', []) if c['slug'] == slug), None)
            if not cand:
                raise APIError('未知音色候选')
            modes = {c['id']: c.get('voice_mode', 'full') for c in catalog['characters']}
            if modes[cid] != 'single' and any(k != cid and b['voice_id'] == cand['voice_id'] and modes.get(k, 'full') != 'single' for k, b in self.data['bindings'].items()):
                raise APIError('该音色已绑定另一主要角色', 409)
            self.data['bindings'][cid] = {**cand, 'candidate_slug': slug}
            self.save()
            job = self.enqueue(cid)
            return {'binding': self.data['bindings'][cid], 'job': job}

    def enqueue(self, cid, mode='missing'):
        if mode not in ('missing', 'retry'):
            raise APIError('未知任务模式')
        with self.lock:
            binding = self.data['bindings'].get(cid)
            if not binding:
                raise APIError('请先确认角色音色')
            if self.active_job(cid, 'lines'):
                raise APIError('该角色已有任务在执行', 409)
            catalog, lines = self.read_catalog()
            char = next(c for c in catalog['characters'] if c['id'] == cid)
            self.adopt_single_preview(char, binding, lines)
            selected = [dict(l) for l in lines if l['character_id'] == cid and not self.record_current(l, binding)]
            if mode == 'retry':
                selected = [l for l in selected if self.data['records'].get(l['id'], {}).get('status') == 'failed']
            job = dict(id=uuid.uuid4().hex, character_id=cid, status='queued', mode=mode, total=len(selected), completed=0, failed=0, error=None, created_at=time.time(), mock=self.provider == 'mock', type='lines')
            self.data['jobs'].append(job)
            self.save()
            threading.Thread(target=self.run_job, args=(job, selected, dict(binding)), daemon=True).start()
            return dict(job)

    def preview(self, cid, slug):
        with self.lock:
            catalog, _ = self.read_catalog()
            if cid not in {c['id'] for c in catalog['characters']}:
                raise APIError('未知或未启用角色')
            base = self.chars.get(cid, {})
            cand = next((c for c in base.get('cands', []) if c['slug'] == slug), None)
            if not cand:
                raise APIError('未知角色或音色候选')
            if self.active_job(cid):
                raise APIError('该角色已有任务在执行', 409)
            lines = [self.preview_line(cid, slug, i) for i in self.preview_indices(cid) if not self.preview_current(cid, cand, i)]
            job = dict(id=uuid.uuid4().hex, character_id=cid, candidate_slug=slug, type='preview', status='queued', total=len(lines), completed=0, failed=0, error=None, created_at=time.time(), mock=self.provider == 'mock')
            self.data['jobs'].append(job)
            self.save()
            threading.Thread(target=self.run_job, args=(job, lines, dict(cand)), daemon=True).start()
            return dict(job)

    def expand(self, cid, prompt, count=3, mode='tune', request_id=None):
        if not isinstance(prompt, str) or not 2 <= len(prompt.strip()) <= 500:
            raise APIError('声音描述须为 2–500 个字')
        prompt = prompt.strip()
        if type(count) is not int or not 1 <= count <= 6 or mode not in ('tune', 'design'):
            raise APIError('每次生成 1–6 个候选，模式须为系统调校或 AI 设计')
        if not isinstance(request_id, str) or not 8 <= len(request_id) <= 80 or not all(c.isalnum() or c in '-_' for c in request_id):
            raise APIError('缺少有效请求 ID')
        with self.lock:
            existing = next((j for j in self.data['jobs'] if j.get('request_id') == request_id), None)
            if existing:
                if (existing['character_id'], existing['prompt'], existing['count'], existing['generation_mode']) != (cid, prompt, count, mode):
                    raise APIError('请求 ID 已用于其他描述', 409)
                return dict(existing)
            catalog, _ = self.read_catalog()
            if cid not in {c['id'] for c in catalog['characters']}:
                raise APIError('未知或未启用角色')
            if self.active_job(cid):
                raise APIError('本角色已有任务，请完成后再增加候选', 409)
            char = next(c for c in catalog['characters'] if c['id'] == cid)
            rows = expansion_plan(prompt, count, {**self.chars[cid], **char}, self.chars[cid]['cands']) if mode == 'tune' else []
            indices = self.preview_indices(cid)
            if mode == 'design' and any(len(self.preview_line(cid, '', i)['text']) > 500 for i in indices):
                raise APIError('AI 设计试听句不能超过 500 字')
            job = dict(id=uuid.uuid4().hex, request_id=request_id, character_id=cid, type='expansion',
                       generation_mode=mode, prompt=prompt, count=count, candidate_slugs=[c['slug'] for c in rows],
                       status='queued', phase='waiting', total=count * len(indices), completed=0, failed=0,
                       created_at=time.time(), error=None, mock=self.provider == 'mock')
            self.data['user_candidates'].setdefault(cid, [])[:0] = rows
            self.chars[cid]['cands'][:0] = rows
            self.data['jobs'].append(job)
            self.save()
            threading.Thread(target=self.run_expansion, args=(job, rows), daemon=True).start()
            return dict(job)

    def run_expansion(self, job, rows):
        with self.worker:
            cid = job['character_id']
            try:
                with self.lock:
                    job.update(status='running', phase='design' if job['generation_mode'] == 'design' else 'auditions')
                    self.save()
                if job['generation_mode'] == 'design':
                    for n in range(job['count']):
                        vid = 'xjh-' + uuid.uuid4().hex
                        description = job['prompt'] + '。普通话清晰自然，用于武侠角色' + self.chars[cid]['name'] + '。本次候选 ' + str(n + 1) + '，保持描述方向并有自然的声线差异。'
                        if self.provider != 'mock':
                            design_voice(description, self.preview_line(cid, '', self.preview_indices(cid)[0])['text'], vid)
                        cand = dict(slug='custom_' + uuid.uuid4().hex[:16], voice_id=vid,
                                    name='AI 设计 · ' + self.chars[cid]['name'] + ' ' + str(n + 1), pitch=0, speed=1.,
                                    generation_mode='design', prompt=job['prompt'])
                        rows.append(cand)
                        with self.lock:
                            self.data['user_candidates'].setdefault(cid, []).insert(0, cand)
                            self.chars[cid]['cands'].insert(0, cand)
                            job['candidate_slugs'].append(cand['slug']); self.save()
                items = [(self.preview_line(cid, c['slug'], i), c) for c in rows for i in self.preview_indices(cid)]
                with self.lock:
                    job['phase'] = 'auditions'; self.save()
                self._run_job(job, items, None)
            except Exception as exc:
                with self.lock:
                    job.update(status='failed', error=str(exc) if isinstance(exc, RuntimeError) else '扩充失败，请检查描述与本地配置', finished_at=time.time())
                    self.save()
                # Preserve any successfully designed voices; their auditions can be retried per card.

    def run_job(self, job, lines, binding):
        # Serialize account requests; other characters remain visibly queued.
        with self.worker:
            self._run_job(job, lines, binding)

    def _run_job(self, job, lines, binding):
        with self.lock:
            job['status'] = 'running'
            self.save()
        for item in lines:
            line, current_binding = item if binding is None else (item, binding)
            fingerprint = self.fingerprint(line, current_binding)
            try:
                suffix = '.wav' if self.provider == 'mock' else '.mp3'
                filename = 'audio/' + fingerprint + suffix
                path = self.dir / filename
                # Recover a complete atomic audio write after a state-save crash.
                if not path.is_file() or not path.stat().st_size:
                    blob, actual_suffix = self.generate(line, current_binding, self.provider)
                    if actual_suffix != suffix:
                        raise RuntimeError('生成音频格式不符合 provider')
                    path.parent.mkdir(exist_ok=True)
                    temp = path.with_suffix(suffix + '.tmp')
                    temp.write_bytes(blob)
                    os.replace(temp, path)
                record = dict(status='ready', hash=fingerprint, file=filename, provider=self.provider, generated_at=time.time())
            except Exception as exc:
                # Our provider errors are sanitized; never expose arbitrary provider payloads.
                record = dict(status='failed', hash=fingerprint, error=str(exc) if self.generate is synthesize else '生成失败，请重试')
            with self.lock:
                target = 'previews' if job.get('type') in ('preview', 'expansion') else 'records'
                self.data[target][line['id']] = record
                job['completed'] += 1
                if record['status'] == 'failed':
                    job['failed'] += 1
                    job['error'] = record['error']
                self.save()
        with self.lock:
            job.update(status='failed' if job['failed'] else 'completed', finished_at=time.time(), error=job.get('error') if job['failed'] else None)
            self.save()


class Handler(BaseHTTPRequestHandler):
    def send_json(self, data, code=200):
        blob = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(blob)))
        self.end_headers()
        self.wfile.write(blob)

    def do_GET(self):
        path = unquote(urlsplit(self.path).path)
        try:
            if path == '/api/state':
                return self.send_json(self.server.store.state())
            if path.startswith('/api/jobs/'):
                job = next((j for j in self.server.store.data['jobs'] if j['id'] == path.rsplit('/', 1)[-1]), None)
                if not job:
                    raise APIError('任务不存在', 404)
                return self.send_json(job)
            if path.startswith('/api/preview/'):
                key = path[len('/api/preview/'):]
                record = self.server.store.data['previews'].get(key, {})
                try:
                    cid, slug, index = key.split('/')
                    cand = next(c for c in self.server.store.chars[cid]['cands'] if c['slug'] == slug)
                    current = self.server.store.preview_current(cid, cand, int(index))
                    valid = bool(int(index) in self.server.store.preview_indices(cid) and current and urlsplit(current).path == '/api/preview/' + key)
                except (ValueError, KeyError, StopIteration, IndexError):
                    valid = False
                if not valid:
                    raise APIError('候选试听尚未生成', 404)
                file = self.server.store.dir / record['file']
            elif path.startswith('/api/audio/'):
                line_id = path[len('/api/audio/'):]
                line = next((l for l in self.server.store.state()['lines'] if l['id'] == line_id), None)
                if not line or line['status'] not in ('ready', 'mock_ready'):
                    raise APIError('音频尚未生成或已过期', 404)
                file = self.server.store.dir / self.server.store.data['records'][line_id]['file']
            else:
                if path == '/':
                    path = '/review/voice_pick.html'
                if not (path.startswith('/assets/') or path in ('/review/voice_pick.html', '/review/voice_npc.html', '/review/voice_pick.css', '/review/voice_pick.js')):
                    raise APIError('页面不存在', 404)
                file = (ROOT / path.lstrip('/')).resolve()
                if ROOT not in file.parents or not file.is_file():
                    raise APIError('文件不存在', 404)
            import mimetypes
            blob = file.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', mimetypes.guess_type(str(file))[0] or 'application/octet-stream')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(blob)))
            self.end_headers()
            self.wfile.write(blob)
        except APIError as exc:
            self.send_json({'error': str(exc)}, exc.code)
        except Exception:
            self.send_json({'error': '读取失败，请检查台词清单与本地状态'}, 500)

    def do_POST(self):
        try:
            # No cross-origin mutations. Also protects loopback APIs from external pages.
            origin = self.headers.get('Origin')
            host = self.headers.get('Host', '')
            if host.split(':')[0] not in ('localhost', '127.0.0.1') or (origin and urlsplit(origin).netloc != host):
                raise APIError('仅允许本地同源管理操作', 403)
            size = int(self.headers.get('Content-Length', 0))
            if not 0 < size <= 65536:
                raise APIError('请求大小无效')
            data = json.loads(self.rfile.read(size))
            if self.path == '/api/bind':
                result = self.server.store.bind(data.get('character_id'), data.get('candidate_slug'), data.get('confirm'))
            elif self.path == '/api/previews':
                result = {'job': self.server.store.preview(data.get('character_id'), data.get('candidate_slug'))}
            elif self.path == '/api/candidates/expand':
                result = {'job': self.server.store.expand(data.get('character_id'), data.get('prompt'), data.get('count', 3), data.get('mode', 'tune'), data.get('request_id'))}
            elif self.path == '/api/jobs':
                result = {'job': self.server.store.enqueue(data.get('character_id'), data.get('mode', 'missing'))}
            elif self.path == '/api/catalog/refresh':
                self.server.store.reload_definitions()
                result = {'auto_preview': self.server.store.start_auto_previews(), 'catalog_sync': self.server.store.state().get('catalog_sync')}
            else:
                raise APIError('接口不存在', 404)
            self.send_json(result, 202)
        except APIError as exc:
            self.send_json({'error': str(exc)}, exc.code)
        except Exception:
            self.send_json({'error': '请求无效或本地状态无法保存'}, 400)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--provider', choices=['mock', 'minimax'], default='minimax')
    parser.add_argument('--no-auto-previews', action='store_true', help='仅运行制作队列，不自动补候选试听')
    args = parser.parse_args()
    try:
        service_lock = acquire_service_lock(ROOT / 'tools_audio/.voice_state')
        server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
        if args.provider == 'minimax':
            api_key()  # Fail before scheduling if local credentials are missing.
        server.store = VoiceStore(provider=args.provider)
        if args.provider == 'minimax' and not args.no_auto_previews:
            server.store.start_auto_previews()
        print(f'http://127.0.0.1:{args.port}/review/voice_pick.html provider={args.provider}', flush=True)
        server.serve_forever()
    except (OSError, RuntimeError) as exc:
        parser.exit(1, str(exc) + '\n')

if __name__ == '__main__':
    main()
