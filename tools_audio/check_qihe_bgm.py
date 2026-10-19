"""Measure original candidates, export level-matched auditions, retain originals."""
import argparse,hashlib,json,re,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--version',choices=['v1','v2','v3','v4'],default='v2');p.add_argument('--cultivation',action='store_true');a=p.parse_args()
ROOT=Path(__file__).resolve().parents[1];out=ROOT/'art_sources'/((('qihe-cultivation-bgm-' if a.cultivation else 'qihe-bgm-')+a.version))
def cmd(args):return subprocess.run(args,capture_output=True,text=True,check=True)
def probe(p):return json.loads(cmd(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(p)]).stdout)
def measure(p,level):
 r=cmd(['ffmpeg','-hide_banner','-nostdin','-i',str(p),'-af',f'loudnorm=I={level}:TP=-1.5:LRA=9:print_format=json','-f','null','-'])
 return json.loads(re.findall(r'\{[\s\S]*?\}',r.stderr)[-1])
trims=json.loads((out/'sample-trims.json').read_text()) if (out/'sample-trims.json').exists() else {}
starts=json.loads((out/'sample-starts.json').read_text()) if (out/'sample-starts.json').exists() else {}
reports=[]
for track,level in ([('cultivation',-20)] if a.cultivation else [('daily',-20),('battle',-18)]):
 slug=f'bgm_qh_{track}_sample_{a.version}';src=out/(slug+'-original.mp3');dst=out/(slug+'.mp3')
 record=json.loads((out/(slug+'.json')).read_text());req=record['request'];expected=(req['music_length_ms'] if 'music_length_ms' in req else sum(c['duration_ms'] for c in req['composition_plan']['chunks']))/1000
 info=probe(src);m=measure(src,level)
 filt=f"loudnorm=I={level}:TP=-1.5:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
 trim_args=['-ss',str(starts[track])] if track in starts else []
 if track in trims:trim_args+=['-t',str(trims[track]-starts.get(track,0))]
 cmd(['ffmpeg','-hide_banner','-nostdin','-y','-i',str(src),'-af',filt,'-ar','44100','-ac','2','-codec:a','libmp3lame','-b:a','192k',*trim_args,str(dst)])
 final=probe(dst);levels=measure(dst,level);stream=final['streams'][0];seconds=float(final['format']['duration'])
 silence=cmd(['ffmpeg','-hide_banner','-nostdin','-i',str(dst),'-af','silencedetect=noise=-50dB:d=0.5','-f','null','-']).stderr
 gaps=re.findall(r'silence_duration: ([\d.]+)',silence)
 r={'track':track,'audition_trim_end_seconds':trims.get(track),'source_sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'output':str(dst.relative_to(ROOT)),'output_sha256':hashlib.sha256(dst.read_bytes()).hexdigest(),'duration_seconds':seconds,'sample_rate':stream['sample_rate'],'channels':stream['channels'],'codec':stream['codec_name'],'bit_rate':final['format']['bit_rate'],'original_levels':m,'audition_levels':levels,'silence_intervals_over_half_second':gaps,'technical_pass':abs(seconds-expected)<=2 and abs(float(levels['input_i'])-level)<=1 and float(levels['input_tp'])<=-1 and stream['channels']==2,'listening_review':'pending','tempo_and_motif_review':'pending','seamless_loop':'not a delivered loop; representative audition only'}
 r['audition_trim_start_seconds']=starts.get(track,0)
 reports.append(r)
 meta=out/(slug+'.json');record=json.loads(meta.read_text());record['audition']=r;meta.write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
 print(track,'duration',round(seconds,2),'LUFS',levels['input_i'],'dBTP',levels['input_tp'],'PASS',r['technical_pass'])
(out/'technical-review.json').write_text(json.dumps(reports,ensure_ascii=False,indent=2)+'\n')
assert all(r['technical_pass'] for r in reports)
assert len({r['source_sha256'] for r in reports})==len(reports)
