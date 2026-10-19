"""Run: python3 tests/voice-backend.test.py"""
import importlib.util, io, json, tempfile, threading, time, unittest
from unittest.mock import patch
from pathlib import Path
SPEC = importlib.util.spec_from_file_location('voice_server', Path(__file__).resolve().parents[1] / 'tools_audio/voice_server.py')
module = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(module)


class SpeechProviderTests(unittest.TestCase):
    def test_emotion_is_sent_without_changing_voice_or_text(self):
        requests = []
        def capture(req):
            requests.append(json.loads(req.data))
            return dict(base_resp=dict(status_code=0), data=dict(audio='010203'))
        with patch.object(module, 'api_key', return_value='test-only'), patch.object(module, 'request_speech', side_effect=capture):
            for emotion in ('calm', 'angry'):
                module.synthesize(dict(text='别动。', emotion_api=emotion), dict(voice_id='fixed', pitch=0, speed=1), 'minimax')
        self.assertEqual([r['voice_setting']['emotion'] for r in requests], ['calm', 'angry'])
        self.assertEqual([r['voice_setting']['voice_id'] for r in requests], ['fixed', 'fixed'])
        self.assertEqual([r['text'] for r in requests], ['别动。', '别动。'])
        with self.assertRaises(module.APIError):
            module.synthesize(dict(text='别动。', emotion_api='whisper'), {}, 'minimax')

    def test_villain_effects_and_emotion_are_sent(self):
        binding = module.candidates()['chief']['cands'][0]
        with patch.object(module, 'api_key', return_value='test-only'), patch.object(module, 'request_speech', return_value=dict(data=dict(audio='01'))) as request:
            module.synthesize(dict(text='站住。', emotion_api='calm'), binding, 'minimax')
        body = json.loads(request.call_args.args[0].data)
        self.assertEqual(body['voice_modify'], binding['voice_modify'])
        self.assertEqual(body['voice_setting']['emotion'], 'angry')
        self.assertEqual(body['text'], '站住。')
        self.assertNotIn('sound_effects', body['voice_modify'])
        with self.assertRaises(module.APIError):
            module.synthesize(dict(text='站住。'), {**binding, 'voice_modify': {'pitch': 101}}, 'minimax')

    def test_villain_candidates_offer_two_styles_and_eight_bases(self):
        for cid in ('liu', 'langli', 'chief', 'pipi'):
            rows = module.candidates()[cid]['cands'][:8]
            self.assertEqual(len({c['voice_id'] for c in rows}), 8)
            self.assertEqual({c['style'] for c in rows}, {'凶狠', '阴险'})
            self.assertEqual(len({c['slug'] for c in rows}), 8)

    def test_elderly_request_does_not_treat_youth_complaint_as_positive(self):
        char={**module.candidates()['beggar'],'voice_mode':'single'}
        prompt='多来几个老头声音，这些都太青年了'
        rows=module.expansion_plan(prompt,3,char,char['cands'])
        self.assertEqual({c['style'] for c in rows},{'年长'})
        self.assertTrue(all(c['voice_id'] in ('Chinese (Mandarin)_Humorous_Elder','Chinese (Mandarin)_Kind-hearted_Elder') for c in rows))
        self.assertTrue(all(c['prompt']==prompt for c in rows))
        self.assertTrue(all(c['speed']<1 for c in rows))
        female_char={**module.candidates()['ye'],'voice_mode':'full'}
        rows=module.expansion_plan('老爷爷的声音，不要年轻男声',2,female_char,female_char['cands'])
        self.assertTrue(all('Elder' in c['voice_id'] for c in rows))

    def test_full_character_expansion_preserves_each_lines_emotion(self):
        char={**module.candidates()['ye'], 'voice_mode':'full'}
        rows=module.expansion_plan('清亮温柔的少女',2,char,char['cands'])
        self.assertTrue(all('emotion_api_override' not in c for c in rows))
        self.assertTrue(all('female' in c['voice_id'].lower() or any(w in c['voice_id'] for w in ('Girl','Miss','Woman','Women','xuejie','yujie')) for c in rows))

    def test_voice_design_forwards_full_prompt_and_keeps_remote_id(self):
        with patch.object(module, 'api_key', return_value='test-only'), patch.object(module, 'request_speech', return_value=dict(voice_id='xjh-test', base_resp=dict(status_code=0))) as request:
            self.assertEqual(module.design_voice('低声阴险，普通话清晰', '站住。', 'xjh-test'), 'xjh-test')
        body = json.loads(request.call_args.args[0].data)
        self.assertEqual(body, dict(prompt='低声阴险，普通话清晰', preview_text='站住。', voice_id='xjh-test'))
        with patch.object(module, 'api_key', return_value='test-only'), patch.object(module, 'request_speech', return_value=dict(base_resp=dict(status_code=1008))) as request:
            with self.assertRaisesRegex(RuntimeError, '1008'):
                module.design_voice('阴险', '站住。', 'xjh-test')
            self.assertEqual(request.call_count, 1, 'design does not retry potentially billed requests')

    def test_plan_error_preserves_reason_and_redacts_key(self):
        payload = dict(base_resp=dict(status_code=2061, status_msg='model not on token plan; Bearer sk-private-key'))
        with patch.object(module, 'api_key', return_value='sk-private-key'), patch.object(module, 'request_speech', return_value=payload) as request:
            with self.assertRaises(RuntimeError) as exc:
                module.design_voice('稳健男声', '先坐。', 'xjh-test')
            self.assertIn('Token Plan', str(exc.exception))
            self.assertIn('不表示剩余额度耗尽', str(exc.exception))
            self.assertIn('model not on token plan', str(exc.exception))
            self.assertNotIn('sk-private-key', str(exc.exception))
            self.assertEqual(request.call_count, 1)

    def test_all_production_lines_and_auditions_have_explicit_emotion(self):
        catalog = json.loads((module.ROOT / 'tools_audio/voice_lines.json').read_text())
        auditions = json.loads((module.ROOT / 'tools_audio/voice_auditions.json').read_text())
        rows = catalog['lines'] + [l for group in auditions['characters'].values() for l in group]
        for line in rows:
            self.assertIn(line['emotion_api'], module.EMOTIONS)
            self.assertTrue(line['emotion'])
            self.assertTrue(line['delivery_notes'])
        modes = {c['id']:c.get('voice_mode','full') for c in catalog['characters']}
        for cid, group in auditions['characters'].items():
            self.assertGreaterEqual(len({line['emotion_api'] for line in group}), 1 if modes.get(cid)=='single' else 2)

    def invoke(self, codes, repetitions=1):
        clock = [100.0]
        sleeps = []
        payloads = [io.StringIO(json.dumps(dict(base_resp=dict(status_code=code), data=dict(audio='010203')))) for code in codes]
        def sleep(seconds):
            sleeps.append(seconds)
            clock[0] += seconds
        module._next_request_at = 0.0
        with patch.object(module, 'api_key', return_value='test-only'), patch.object(module.urllib.request, 'urlopen', side_effect=payloads) as request, patch.object(module.time, 'sleep', side_effect=sleep), patch.object(module.time, 'monotonic', side_effect=lambda: clock[0]):
            for _ in range(repetitions):
                module.synthesize(dict(text='测试'), dict(voice_id='fake', pitch=0, speed=1), 'minimax')
        return request.call_count, sleeps

    def test_two_second_request_pacing(self):
        count, sleeps = self.invoke([0, 0], repetitions=2)
        self.assertEqual(count, 2)
        self.assertEqual(sleeps, [2.0])

    def test_rate_limit_codes_retry_with_twenty_second_backoff(self):
        count, sleeps = self.invoke([1002, 1039, 0])
        self.assertEqual(count, 3)
        self.assertEqual(sleeps, [20.0, 20.0])

    def test_retry_is_bounded_and_other_errors_are_immediate(self):
        with self.assertRaisesRegex(RuntimeError, '1002'):
            self.invoke([1002] * 4)
        with patch.object(module, 'request_speech', return_value=dict(base_resp=dict(status_code=2042))) as request, patch.object(module, 'api_key', return_value='test-only'), patch.object(module.time, 'sleep') as sleep:
            with self.assertRaisesRegex(RuntimeError, '2042'):
                module.synthesize(dict(text='测试'), dict(voice_id='fake',pitch=0,speed=1), 'minimax')
            request.assert_called_once()
            sleep.assert_not_called()

class VoiceBackendTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.catalog = self.root / 'lines.json'
        self.lines = [dict(id='line.ye', character_id='ye', text='按住他的手。', revision=1, status='active'), dict(id='line.su', character_id='suzhi', text='别松。', revision=1, status='active')]
        self.write_catalog()
        self.store = module.VoiceStore(self.root / 'state', self.catalog)
    def tearDown(self):
        self.temp.cleanup()
    def write_catalog(self):
        self.catalog.write_text(json.dumps(dict(characters=[dict(id='ye',name='叶蘅'),dict(id='suzhi',name='苏芷')], lines=self.lines)))
    def wait(self, job):
        for _ in range(300):
            with self.store.lock:
                found = next(j for j in self.store.data['jobs'] if j['id'] == job['id'])
                if found['status'] not in ('queued', 'running'):
                    return dict(found)
            time.sleep(.01)
        self.fail('job timed out')
    def test_confirmation_exclusivity_and_persistence(self):
        with self.assertRaises(module.APIError):
            self.store.bind('ye','danya',False)
        self.assertEqual(self.store.data['jobs'], [])
        job = self.store.bind('ye','danya',True)['job']
        self.assertEqual(self.wait(job)['status'],'completed')
        with self.assertRaises(module.APIError) as exc:
            self.store.bind('suzhi','danya',True)
        self.assertEqual(exc.exception.code,409)
        loaded=module.VoiceStore(self.root/'state',self.catalog)
        self.assertEqual(loaded.data['bindings']['ye']['voice_id'],'danya_xuejie')
        self.assertEqual(loaded.state()['lines'][0]['status'],'mock_ready')

    def test_current_casting_roster_and_samples_cannot_enter_production(self):
        catalog=json.loads((module.ROOT/'tools_audio/voice_lines.json').read_text())
        atlas=json.loads((module.ROOT/'docs/design/story-atlas.json').read_text())
        expected={c['id'] for c in atlas['characters'] if c['type']=='companion'}
        companions=[c for c in catalog['characters'] if c.get('atlas_character_id')]
        self.assertEqual({c['atlas_character_id'] for c in companions},expected)
        self.assertEqual(len(companions),18)
        self.assertNotIn('hero',{c['id'] for c in catalog['characters']})
        sample_rows=[l for l in catalog['lines'] if l.get('sync_group')=='current_casting']
        self.assertEqual(len(sample_rows),108)
        self.assertTrue(all(l['voice_enabled'] is False for l in sample_rows))
        store=module.VoiceStore(self.root/'casting-state',provider='mock')
        self.assertEqual(len([l for l in store.state()['lines'] if l['status']=='casting_only']),108)
        result=store.bind('pei-zhigu','sync_1',True)
        expected_ids={l['id'] for l in catalog['lines'] if l['character_id']=='pei-zhigu' and l.get('voice_enabled',True) and l.get('status','active')=='active'}
        self.assertEqual(self.wait_store(store,result['job'])['total'],len(expected_ids))
        self.assertEqual(set(store.data['records']),expected_ids,'only authored production cues, never state examples')
        self.assertEqual(len(store.preview_indices('pei-zhigu')),3)

    def test_battle_cues_do_not_expand_single_npc_dialogue(self):
        cue={**self.lines[0], 'id':'dialogue.lady', 'character_id':'lady'}
        battle={**cue, 'id':'battle.lady.hurt.01', 'kind':'battle', 'battle_event':'hurt'}
        char=dict(id='lady',voice_mode='single',single_line_id=cue['id'],battle_voice_enabled=True)
        self.catalog.write_text(json.dumps(dict(characters=[char],lines=[cue,battle])))
        self.assertEqual(len(self.store.read_catalog()[1]),2)
        char['battle_voice_enabled']=False
        self.catalog.write_text(json.dumps(dict(characters=[char],lines=[cue,battle])))
        with self.assertRaises(module.APIError):self.store.read_catalog()
        char['battle_voice_enabled']=True
        second={**cue,'id':'extra-dialogue'}
        self.catalog.write_text(json.dumps(dict(characters=[char],lines=[cue,battle,second])))
        with self.assertRaises(module.APIError):self.store.read_catalog()

    def wait_store(self,store,job):
        for _ in range(300):
            with store.lock:
                found=next(j for j in store.data['jobs'] if j['id']==job['id'])
                if found['status'] not in ('queued','running'):return dict(found)
            time.sleep(.01)
        self.fail('job timed out')

    def test_new_female_role_expansion_uses_its_gender(self):
        char={**module.candidates()['pei-zhigu'],'voice_mode':'full'}
        rows=module.expansion_plan('清亮自然，舒缓语速',2,char,char['cands'])
        self.assertTrue(all('female' in c['voice_id'].lower() or any(w in c['voice_id'] for w in ('Girl','Miss','Woman','Women','xuejie','yujie')) for c in rows))
        self.assertTrue(all('emotion_api_override' not in c for c in rows))

    def test_reload_adds_idle_role_while_busy_role_keeps_its_samples(self):
        self.store.data['jobs'].append(dict(id='busy',character_id='ye',type='preview',status='running'))
        previous=self.store.chars['ye']
        definitions=module.candidates();definitions['ye']['lines']=[('新句子','新状态')]
        self.store.chars.pop('pei-zhigu')
        self.store.definition_stamp=('outdated',)
        with patch.object(module,'candidates',return_value=definitions):self.store.reload_definitions()
        self.assertIs(self.store.chars['ye'],previous)
        self.assertEqual(self.store.chars['pei-zhigu']['name'],'裴知古')

    def test_casting_reload_preserves_bindings_and_does_not_generate(self):
        self.wait(self.store.bind('ye','danya',True)['job'])
        bindings=json.loads(json.dumps(self.store.data['bindings']))
        defs=module.candidates();defs['ye']['persona']='新的人设描述'
        self.store.definition_stamp=('outdated',)
        with patch.object(module,'candidates',return_value=defs),patch.object(self.store,'generate') as generation:
            self.assertEqual(self.store.state()['characters'][0]['persona'],'新的人设描述')
            generation.assert_not_called()
        self.assertEqual(self.store.data['bindings'],bindings)

    def test_one_service_owns_persistent_generation_state(self):
        first = module.acquire_service_lock(self.root / 'service-state')
        try:
            with self.assertRaisesRegex(RuntimeError, '已经运行'):
                module.acquire_service_lock(self.root / 'service-state')
        finally:
            first.close()
        resumed = module.acquire_service_lock(self.root / 'service-state')
        resumed.close()
    def test_incremental_changes_and_provider_isolation(self):
        self.wait(self.store.bind('ye','danya',True)['job'])
        self.assertEqual(self.wait(self.store.enqueue('ye'))['total'],0)
        self.lines[0]['text']='按住他的肩。'
        self.lines.append(dict(id='line.new',character_id='ye',text='别乱动。',revision=1))
        self.write_catalog()
        self.assertEqual(self.store.state()['lines'][0]['status'],'stale')
        self.assertEqual(self.wait(self.store.enqueue('ye'))['total'],2)
        real=module.VoiceStore(self.root/'state',self.catalog,provider='minimax')
        self.assertNotEqual(real.state()['lines'][0]['status'],'ready')
    def test_failure_retry_and_duplicate_task(self):
        gate=threading.Event()
        def fail(*args):
            gate.wait(2)
            raise RuntimeError('secret-sensitive-payload')
        self.store.generate=fail
        job=self.store.bind('ye','danya',True)['job']
        with self.assertRaises(module.APIError):
            self.store.enqueue('ye')
        gate.set()
        self.assertEqual(self.wait(job)['failed'],1)
        self.assertNotIn('secret',self.store.state()['lines'][0]['error'])
        self.store.generate=module.synthesize
        self.assertEqual(self.wait(self.store.enqueue('ye','retry'))['status'],'completed')
    def test_parallel_claim_allows_one_owner(self):
        barrier=threading.Barrier(2)
        results=[]
        def claim(cid):
            barrier.wait()
            try:
                result=self.store.bind(cid,'danya',True)
                results.append(result)
            except module.APIError as exc:
                results.append(exc.code)
        threads=[threading.Thread(target=claim,args=(cid,)) for cid in ('ye','suzhi')]
        for thread in threads: thread.start()
        for thread in threads: thread.join()
        self.assertEqual(sum(isinstance(r,dict) for r in results),1)
        self.assertIn(409,results)
        self.wait(next(r['job'] for r in results if isinstance(r,dict)))
    def test_pitch_variant_does_not_bypass_unique_voice(self):
        self.lines=[dict(id='a',character_id='zhou',text='谢谢。'),dict(id='b',character_id='oldman',text='听我说。')]
        self.catalog.write_text(json.dumps(dict(characters=[dict(id='zhou',name='老周'),dict(id='oldman',name='老伯')],lines=self.lines)))
        self.wait(self.store.bind('zhou','elder',True)['job'])
        with self.assertRaises(module.APIError) as exc:
            self.store.bind('oldman','elder_slow',True)
        self.assertEqual(exc.exception.code,409)
    def test_emotion_and_binding_changes_invalidate(self):
        self.wait(self.store.bind('ye','danya',True)['job'])
        self.lines[0]['emotion']='焦急'
        self.write_catalog()
        self.assertEqual(self.store.state()['lines'][0]['status'],'stale')
        self.assertEqual(self.wait(self.store.enqueue('ye'))['total'],1)
        self.lines[0]['emotion_api']='angry'
        self.write_catalog()
        self.assertEqual(self.store.state()['lines'][0]['status'],'stale')
        self.assertEqual(self.wait(self.store.enqueue('ye'))['total'],1)
        self.assertEqual(self.wait(self.store.bind('ye','shaonv',True)['job'])['total'],1)
    def test_interrupted_job_survives_restart(self):
        self.store.data['bindings']['ye']=dict(self.store.chars['ye']['cands'][0])
        self.store.data['jobs'].append(dict(id='restart-test',character_id='ye',status='running'))
        self.store.save()
        restored=module.VoiceStore(self.root/'state',self.catalog)
        self.assertEqual(restored.data['jobs'][0]['status'],'interrupted')
        self.assertIn('ye',restored.data['bindings'])

    def test_auto_previews_incremental_restart_and_fingerprint(self):
        # Explicitly test mock automatic scheduling in temp storage; CLI mock does not auto-start.
        self.catalog.write_text(json.dumps(dict(characters=[dict(id='ye',name='叶蘅')],lines=self.lines)))
        self.store.chars['ye']['cands']=self.store.chars['ye']['cands'][:2]
        calls=[]
        def counted(line,binding,provider):
            calls.append(line['id'])
            return module.synthesize(line,binding,'mock')
        self.store.generate=counted
        self.store.start_auto_previews()
        self.store.auto_thread.join(5)
        self.assertFalse(self.store.auto_thread.is_alive())
        self.assertEqual(len(calls),6)
        self.assertEqual(self.store.auto_preview['completed'],2)
        self.store.start_auto_previews()
        self.store.auto_thread.join(5)
        self.assertEqual(len(calls),6)
        self.store.data['previews'].pop('ye/danya/0')
        self.store.save()
        resumed=module.VoiceStore(self.root/'state',self.catalog,generate=counted)
        resumed.chars['ye']['cands']=resumed.chars['ye']['cands'][:2]
        resumed.start_auto_previews()
        resumed.auto_thread.join(5)
        self.assertEqual(len(calls),6)
        resumed.chars['ye']['lines'][1]=('改过的试听句。','调查')
        resumed.start_auto_previews()
        resumed.auto_thread.join(5)
        self.assertEqual(len(calls),8)
        self.assertTrue(all(c['preview_available'] for c in resumed.state()['characters'][0]['cands']))
    def test_binding_can_queue_while_audition_runs(self):
        gate=threading.Event()
        def delayed(line,binding,provider):
            gate.wait(2)
            return module.synthesize(line,binding,'mock')
        self.store.generate=delayed
        preview=self.store.preview('ye','danya')
        lines=self.store.bind('ye','danya',True)['job']
        gate.set()
        self.assertEqual(self.wait(preview)['status'],'completed')
        self.assertEqual(self.wait(lines)['status'],'completed')

    def test_preview_does_not_bind(self):
        job=self.store.preview('ye','shaonv')
        self.assertEqual(self.wait(job)['status'],'completed')
        self.assertFalse(self.store.data['bindings'])
        cand=next(c for c in self.store.state()['characters'][0]['cands'] if c['slug']=='shaonv')
        self.assertTrue(cand['preview_available'])
        self.assertTrue(cand['preview_is_mock'])

    def test_legacy_preview_without_explicit_emotion_is_stale(self):
        real = module.VoiceStore(self.root/'state', self.catalog, provider='minimax')
        candidate = real.chars['suzhi']['cands'][0]
        self.assertIsNone(real.preview_current('suzhi', candidate, 0))
        line = real.preview_line('ye', 'danya', 0)
        first = real.fingerprint(line, real.chars['ye']['cands'][0])
        line['emotion_api'] = 'angry'
        self.assertNotEqual(first, real.fingerprint(line, real.chars['ye']['cands'][0]))

    def test_new_catalog_requires_emotion_before_generation(self):
        self.catalog.write_text(json.dumps(dict(schema_version=2, characters=[dict(id='ye')], lines=self.lines)))
        with self.assertRaises(module.APIError):
            self.store.preview('ye', 'danya')
        self.assertEqual(self.store.data['jobs'], [])

        self.write_catalog()
        with self.assertRaises(module.APIError):
            self.store.preview('monk', 'elder')
        self.assertEqual(self.store.data['jobs'], [])

    def test_single_npc_limits_previews_and_adopts_selected_audio(self):
        cue = self.store.preview_line('lady', 'antie', 2)
        cue.update(id='one.lady', character_id='lady', voice_enabled=True)
        text_only = dict(id='text.lady', character_id='lady', text='完整剧情保留文字', voice_enabled=False)
        char = dict(id='lady', name='柳三娘', voice_mode='single', single_preview_index=2, single_line_id=cue['id'])
        self.catalog.write_text(json.dumps(dict(characters=[char], lines=[cue, text_only])))
        calls = []
        def counted(line, binding, provider):
            calls.append(line['id'])
            return module.synthesize(line, binding, provider)
        self.store.generate = counted
        preview = self.wait(self.store.preview('lady', 'antie'))
        self.assertEqual(preview['total'], 1)
        exposed = self.store.state()['characters'][0]
        self.assertEqual(len(exposed['lines']), 1)
        self.assertIn('/2?', exposed['cands'][0]['preview_urls'][0])
        formal = self.wait(self.store.bind('lady', 'antie', True)['job'])
        self.assertEqual(formal['total'], 0, 'adopting audition must not request paid synthesis again')
        self.assertEqual(len(calls), 1)
        self.assertTrue(self.store.data['records'][cue['id']]['adopted_from_preview'])
        self.assertEqual(len(self.store.state()['lines']), 1)
        confirmed = dict(self.store.data['bindings']['lady'])
        self.store.data['records'].pop(cue['id'])
        self.assertEqual(self.wait(self.store.enqueue('lady'))['total'], 0)
        self.assertEqual(len(calls), 1, 'already confirmed NPC also reuses audition after policy migration')
        self.assertEqual(self.store.data['bindings']['lady'], confirmed)
        text_only['voice_enabled'] = True
        self.catalog.write_text(json.dumps(dict(characters=[char], lines=[cue, text_only])))
        with self.assertRaises(module.APIError):
            self.store.enqueue('lady')

    def test_villain_confirmation_reuses_effected_audition(self):
        cid, slug = 'chief', 'villain_sinister_exec'
        cue = self.store.preview_line(cid, slug, 0)
        cue.update(id='one.chief', character_id=cid)
        char = dict(id=cid, voice_mode='single', single_preview_index=0, single_line_id=cue['id'])
        self.catalog.write_text(json.dumps(dict(characters=[char], lines=[cue])))
        self.assertEqual(self.wait(self.store.preview(cid, slug))['total'], 1)
        self.assertEqual(self.wait(self.store.bind(cid, slug, True)['job'])['total'], 0)
        self.assertTrue(self.store.data['records'][cue['id']]['adopted_from_preview'])
        exposed = self.store.state()['lines'][0]
        self.assertEqual(exposed['emotion_api'], 'calm')
        binding = self.store.data['bindings'][cid]
        first = self.store.fingerprint(cue, binding)
        changed = {**binding, 'voice_modify': {**binding['voice_modify'], 'intensity': 99}}
        self.assertNotEqual(first, self.store.fingerprint(cue, changed))
        self.assertNotEqual(first, self.store.fingerprint(cue, {**binding, 'emotion_api_override': 'angry'}))

    def expansion_catalog(self, cid='chief'):
        cue = self.store.preview_line(cid, '', 0)
        cue.update(id='one.'+cid, character_id=cid)
        self.catalog.write_text(json.dumps(dict(characters=[dict(id=cid, voice_mode='single', single_preview_index=0, single_line_id=cue['id'])], lines=[cue])))

    def test_prompt_expansion_is_persistent_idempotent_and_preserves_bindings(self):
        self.expansion_catalog()
        before = dict(self.store.data['bindings'])
        job = self.store.expand('chief', '凶狠阴险，低沉慢语', 3, 'tune', 'request-expand-1')
        self.assertEqual(self.wait(job)['status'], 'completed')
        self.assertEqual(self.wait(job)['total'], 3)
        self.assertEqual(self.store.data['bindings'], before)
        self.assertEqual(self.store.expand('chief', '凶狠阴险，低沉慢语', 3, 'tune', 'request-expand-1')['id'], job['id'])
        self.assertEqual(len(self.store.data['user_candidates']['chief']), 3)
        with self.assertRaises(module.APIError):
            self.store.expand('chief', '年轻清亮', 3, 'tune', 'request-expand-1')
        first = self.store.data['user_candidates']['chief'][0]
        confirmed = self.wait(self.store.bind('chief', first['slug'], True)['job'])
        self.assertEqual(confirmed['total'], 0)
        loaded = module.VoiceStore(self.root/'state', self.catalog)
        self.assertTrue(next(c for c in loaded.state()['characters'][0]['cands'] if c['slug']==first['slug'])['preview_available'])
        second = self.store.expand('chief', '凶狠阴险，低沉慢语', 3, 'tune', 'request-expand-2')
        self.wait(second)
        rows = self.store.data['user_candidates']['chief']
        soundkeys = [json.dumps([c['voice_id'],c['pitch'],c['speed'],c['voice_modify']], sort_keys=True) for c in rows]
        self.assertEqual(len(soundkeys),len(set(soundkeys)))

    def test_bad_expansion_requests_do_not_create_jobs_or_candidates(self):
        self.expansion_catalog()
        for prompt, count, mode, cid in [('完全自由的诗歌',3,'tune','chief'),('凶狠',7,'tune','chief'),('凶狠',True,'tune','chief'),('凶狠',2,'bad','chief'),('凶狠',2,'tune','absent')]:
            with self.assertRaises(module.APIError):
                self.store.expand(cid,prompt,count,mode,'request-invalid')
        self.assertEqual(self.store.data['jobs'],[])
        self.assertEqual(self.store.data['user_candidates'],{})

    def test_failed_new_audition_retries_same_voice_without_expanding_again(self):
        self.expansion_catalog()
        self.store.generate=lambda *args: (_ for _ in ()).throw(RuntimeError('failure'))
        job=self.store.expand('chief','低沉凶狠',1,'tune','request-retry-1')
        self.assertEqual(self.wait(job)['failed'],1)
        row=self.store.data['user_candidates']['chief'][0]
        exposed=next(c for c in self.store.state()['characters'][0]['cands'] if c['slug']==row['slug'])
        self.assertEqual(exposed['preview_status'],'failed')
        self.store.generate=module.synthesize
        self.assertEqual(self.wait(self.store.preview('chief',row['slug']))['status'],'completed')
        self.assertEqual(len(self.store.data['user_candidates']['chief']),1)

    def test_partial_design_failure_keeps_voice_and_can_complete_audition(self):
        self.expansion_catalog()
        real=module.VoiceStore(self.root/'partial-design',self.catalog,provider='minimax',generate=lambda *args:(b'test-audio','.mp3'))
        failure=RuntimeError('MiniMax 音色设计失败（错误码 2061）：当前 Token Plan 不支持此次模型或能力。')
        with patch.object(module,'design_voice',side_effect=[None,failure]) as design:
            job=self.wait_other(real,real.expand('chief','稳健低沉',2,'design','partial-design-job'))
            self.assertEqual(job['status'],'failed')
            self.assertEqual(design.call_count,2)
            self.assertIn('Token Plan',job['error'])
            rows=real.data['user_candidates']['chief']
            self.assertEqual(len(rows),1)
            voice_id=rows[0]['voice_id']
            self.assertEqual(self.wait_other(real,real.preview('chief',rows[0]['slug']))['status'],'completed')
            self.assertEqual(design.call_count,2,'audition recovery must not create another voice')
            self.assertEqual(rows[0]['voice_id'],voice_id)
            self.assertEqual(real.data['bindings'],{})

    def test_failed_synthesis_job_shows_actual_provider_reason(self):
        real=module.VoiceStore(self.root/'provider-error',self.catalog,provider='minimax')
        payload=dict(base_resp=dict(status_code=2061,status_msg='model not on plan'))
        with patch.object(module,'api_key',return_value='test-only'),patch.object(module,'request_speech',return_value=payload):
            job=self.wait_other(real,real.preview('ye','danya'))
        self.assertEqual(job['status'],'failed')
        self.assertIn('2061',job['error'])
        self.assertIn('model not on plan',job['error'])

    def test_design_expansion_creates_candidates_and_reports_provider_failure(self):
        self.expansion_catalog()
        job=self.store.expand('chief','很凶狠的反派',2,'design','request-design-1')
        self.assertEqual(self.wait(job)['status'],'completed')
        rows=self.store.data['user_candidates']['chief']
        self.assertEqual(len({c['voice_id'] for c in rows}),2)
        self.assertTrue(all(c['generation_mode']=='design' for c in rows))
        real=module.VoiceStore(self.root/'failed-design',self.catalog,provider='minimax')
        with patch.object(module,'design_voice',side_effect=RuntimeError('MiniMax 音色设计不可用（错误码 1008）')):
            failure=self.wait_other(real,real.expand('chief','低沉凶狠',1,'design','request-design-fail'))
        self.assertEqual(failure['status'],'failed')
        self.assertIn('1008',failure['error'])
        self.assertEqual(real.data['user_candidates']['chief'],[])

    def wait_other(self,store,job):
        for _ in range(300):
            with store.lock:
                found=next(j for j in store.data['jobs'] if j['id']==job['id'])
                if found['status'] not in ('queued','running'):
                    return dict(found)
            time.sleep(.01)
        self.fail('job timed out')

    def test_single_npcs_can_share_and_report_every_user(self):
        chars, lines = [], []
        for cid in ('zhou', 'oldman', 'beggar'):
            cue = self.store.preview_line(cid, 'elder', 0)
            cue.update(id='one.'+cid, character_id=cid)
            chars.append(dict(id=cid, voice_mode='single', single_line_id=cue['id'], single_preview_index=0))
            lines.append(cue)
        self.catalog.write_text(json.dumps(dict(characters=chars, lines=lines)))
        for cid in ('zhou', 'oldman', 'beggar'):
            self.wait(self.store.bind(cid, 'elder', True)['job'])
        for char in self.store.state()['characters']:
            cand = next(c for c in char['cands'] if c['slug']=='elder')
            self.assertEqual(cand['used_by'], ['zhou','oldman','beggar'])
            self.assertFalse(cand['voice_locked'])

    def test_npc_sharing_with_main_voice_is_order_independent(self):
        cue = self.store.preview_line('lady', 'extra_danya', 2)
        cue.update(id='one.lady', character_id='lady')
        self.catalog.write_text(json.dumps(dict(characters=[dict(id='ye'),dict(id='suzhi'),dict(id='lady',voice_mode='single',single_preview_index=2,single_line_id=cue['id'])], lines=self.lines+[cue])))
        self.wait(self.store.bind('lady','extra_danya',True)['job'])
        self.wait(self.store.bind('ye','danya',True)['job'])
        self.wait(self.store.bind('lady','extra_danya',True)['job'])
        with self.assertRaises(module.APIError):
            self.store.bind('suzhi','danya',True)

if __name__=='__main__':
    unittest.main()
