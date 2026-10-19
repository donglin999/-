"""Decode adopted cues; report technical gates separately from performance listening."""
from pathlib import Path
import json,subprocess,hashlib,numpy as np
ROOT=Path(__file__).resolve().parents[1];batch=ROOT/'art_sources/battle-voice-20261006'
manifest=json.loads((batch/'export.json').read_text());results=[]
for r in manifest['clips']:
 p=ROOT/r['url'];info=json.loads(subprocess.check_output(['/opt/homebrew/bin/ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));stream=info['streams'][0]
 pcm=np.frombuffer(subprocess.check_output(['/opt/homebrew/bin/ffmpeg','-v','error','-i',str(p),'-f','f32le','-acodec','pcm_f32le','-']),dtype='<f4');a=np.abs(pcm);sr=int(stream['sample_rate']);duration=len(pcm)/sr;peak=float(a.max());active=np.flatnonzero(a>10**(-45/20));leading=float(active[0]/sr) if len(active) else duration;trailing=float((len(pcm)-1-active[-1])/sr) if len(active) else duration
 errors=[]
 if stream['channels']!=1 or sr!=32000:errors.append('format')
 if not .15<=duration<=3.5:errors.append('duration')
 if len(active)==0 or float(np.sqrt(np.mean(pcm**2)))<.001:errors.append('silent')
 if peak>=1:errors.append('clipping')
 if hashlib.sha256(p.read_bytes()).hexdigest()!=r['sha256']:errors.append('hash')
 target_max={'turn':1.8,'attack':1.5,'hurt':1.2,'down':2.4,'support':1.8}[r['event']]
 results.append(dict(id=r['id'],duration=round(duration,3),sample_rate=sr,channels=stream['channels'],peak_db=round(float(20*np.log10(max(peak,1e-9))),2),leading_silence=round(leading,3),trailing_silence=round(trailing,3),active_duration=round(duration-leading-trailing,3),target_max=target_max,target_review=duration>target_max,errors=errors))
report=dict(clips=len(results),technical_failures=[r for r in results if r['errors']],timing_review=[r['id'] for r in results if r['target_review']],listening_acceptance='not claimed; audition page provided',results=results)
(batch/'technical-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='results'},ensure_ascii=False));raise SystemExit(bool(report['technical_failures']))
