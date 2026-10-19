"""Generate review candidates only. Explicit credentials; no music-to-SFX fallback."""
import argparse, datetime, hashlib, http.client, json, os, re, urllib.error, urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('track',choices=['daily','battle','cultivation']);p.add_argument('--env-file',type=Path);p.add_argument('--version',choices=['v1','v2','v3','v4','v5'],default='v2');p.add_argument('--seconds',type=int,default=60);p.add_argument('--output-format',choices=['mp3_44100_192','mp3_48000_320'],default='mp3_44100_192');a=p.parse_args()
if not 30<=a.seconds<=120:raise SystemExit('Audition length must be 30–120 seconds')
key=os.environ.get('elevenlabs_APIKEY') or os.environ.get('ELEVENLABS_API_KEY')
if not key and a.env_file:
 for line in a.env_file.read_text().splitlines():
  if '=' not in line or line.lstrip().startswith('#'):continue
  k,v=line.split('=',1)
  if k.strip().removeprefix('export ') in ['elevenlabs_APIKEY','ELEVENLABS_API_KEY']:key=v.strip().strip('\"\'')
if not key:raise SystemExit('Missing ElevenLabs credential')
batch=('qihe-cultivation-bgm-' if a.track=='cultivation' else 'qihe-bgm-')+a.version
out=ROOT/'art_sources'/batch;out.mkdir(exist_ok=True)
slug='bgm_qh_'+a.track+'_sample_'+a.version;dest=out/(slug+'-original.mp3')
if dest.exists():raise SystemExit('Candidate already exists; refusing overwrite')
source=(ROOT/'docs/design/qihe-map/expansion/bgm-production.md').read_text()
prompts=re.findall(r'^> (Original instrumental.+)$',source,re.M)
prompt=prompts[a.track=='battle']
prompt=prompt.replace('A flowing two-minute gameplay cue','A flowing forty-second representative gameplay excerpt')
prompt=prompt.replace('Preserve the supplied original four-note motif G4 A4 D5 B4 when reference input is available, with spacious phrasing.', 'Use a simple original four-note melodic idea G4 A4 D5 B4 with spacious phrasing. No reference audio is supplied.')
prompt=prompt.replace('retaining the supplied motif G4 A4 D5 B4 when reference input is available, reshaped', 'using the original motif idea G4 A4 D5 B4, reshaped')
prompt += ' This is a 40-second style audition: introduce the full main texture within the first two seconds, include a melodic answer and a thinner breathing phrase, then return to the main texture. Do not spend the sample on an extended introduction. Do not fade into silence at the end.'
plan_path=out/'composition-plan.json'
if not plan_path.exists() and (a.version in ['v2','v3'] or a.track=='cultivation'):prompt=(out/(a.track+'-prompt.txt')).read_text().strip()
body={'prompt':prompt,'music_length_ms':a.seconds*1000,'model_id':'music_v2_5','force_instrumental':True}
if plan_path.exists():
 plan=json.loads(plan_path.read_text())
 if sum(c['duration_ms'] for c in plan['chunks'])!=a.seconds*1000:raise SystemExit('Plan duration does not match --seconds')
 body={'composition_plan':plan,'model_id':'music_v2_5'}
record={'status':'requested','provider':'ElevenLabs','endpoint':'https://api.elevenlabs.io/v1/music','requested_model':body['model_id'],'returned_model':None,'request':body,'output_format':a.output_format,'reference_audio':None,'motif_validation':'v1 shared-note constraint removed for v2; emotional contrast takes priority' if a.version=='v2' else 'pending; textual motif request does not prove shared melody','created_at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
if a.track=='cultivation':record['motif_validation']='Original cultivation theme requested; no shared motif or reference recording supplied'
refs=[c['conditioning_ref'] for c in body.get('composition_plan',{}).get('chunks',[]) if c.get('conditioning_ref')]
if refs:
 record['reference_audio']={'conditioning_refs':refs,'analysis_record':str((out/'reference-extraction.json').relative_to(ROOT))}
 record['motif_validation']='User-provided audio conditioning at low strength; original melody requested; similarity requires listening review'
record['selection_status']='candidate_pending_listening'
meta=out/(slug+'.json');meta.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
req=urllib.request.Request(record['endpoint']+'?output_format='+a.output_format,json.dumps(body).encode(),{'xi-api-key':key,'Content-Type':'application/json'})
try:
 with urllib.request.urlopen(req,timeout=300) as r:
  record['content_type']=r.headers.get('content-type');record['song_id']=r.headers.get('song-id');record['request_id']=r.headers.get('request-id')
  try:content=r.read()
  except http.client.IncompleteRead as e:
   partial=out/(slug+'-incomplete.mp3');partial.write_bytes(e.partial);record['partial_bytes']=len(e.partial);record['partial_file']=str(partial.relative_to(ROOT));raise
 if len(content)<10000:raise ValueError('Unexpectedly small audio payload')
 dest.write_bytes(content);record.update(status='generated_candidate',output=str(dest.relative_to(ROOT)),bytes=len(content),sha256=hashlib.sha256(content).hexdigest())
except urllib.error.HTTPError as e:
 raw=e.read().decode(errors='replace').replace(key,'[redacted]');record.update(status='failed',http_status=e.code,error=raw[:1500]);print('Generation failed:',e.code,raw[:700])
except Exception as e:
 record.update(status='outcome_unconfirmed',error=str(e).replace(key,'[redacted]'));print('Generation outcome unconfirmed:',type(e).__name__)
finally:meta.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
if record['status']!='generated_candidate':raise SystemExit(1)
print(json.dumps({'status':record['status'],'file':record['output'],'bytes':record['bytes']}))
