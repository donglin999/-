"""Prepare restrained revisions from original portraits after the user's v4 correction."""
import json,re
from pathlib import Path
R=Path(__file__).resolve().parents[1]
OUT=R/'art_sources/story_atlas_portraits_v5'
manifest=json.loads((R/'art_sources/story_atlas_portraits_v4/manifest.json').read_text())
jobs=[]
body_path=OUT/'body-standard-jobs.json'
body_jobs={j['id']:j for j in json.loads(body_path.read_text())} if body_path.exists() else {}
policy_path=OUT/'selection-overrides.json'
policy=json.loads(policy_path.read_text())['characters'] if policy_path.exists() else {}
beauty_path=OUT/'beauty-redesign-jobs.json'
beauty_jobs={j['id']:j for j in json.loads(beauty_path.read_text())} if beauty_path.exists() else {}
full_path=OUT/'full-redesign-jobs.json'
full_jobs={j['id']:j for j in json.loads(full_path.read_text())} if full_path.exists() else {}
revision_jobs={}
for filename in ['attire-jobs.json', 'face-identity-jobs.json', 'new-character-jobs.json', 'costume-jobs.json']:
    revision_path=OUT/filename
    if revision_path.exists():
        revision_jobs.update({j['id']:j for j in json.loads(revision_path.read_text())})
known={j['id'] for j in manifest}
extras={j['id']:j['name'] for j in body_jobs.values()} | {'ye-heng':'叶蘅','su-zhi':'苏芷'}
extras.update({j['id']:j['name'] for j in revision_jobs.values() if j.get('new_character')})
manifest += [{'id':cid,'name':name} for cid,name in extras.items() if cid not in known]
for row in manifest:
    row={k:row[k] for k in ['id','name']}
    cid=row['id'];original=R/'review/story-atlas/portraits'/f'{cid}-v1.png'
    record=OUT/'records'/f'{cid}.json'
    if record.exists():
        current=json.loads(record.read_text())
        row.update(version=5,status=current['status'],promptFile=current.get('prompt_file'),references=current.get('references',[]),source=current.get('source'))
        jobs.append(row);continue
    selection=policy.get(cid,{}).get('selection','')
    if selection.startswith('restore_'):
        row.update(version=5,status='待恢复用户所选版本',action=selection,source=policy[cid]['selected_source']);jobs.append(row);continue
    if cid in revision_jobs:
        job=revision_jobs[cid]
        row.update(version=5,status='待生成新角色定妆' if job.get('new_character') else '待生成当前衣装／五官修订',promptFile=job['prompt_file'],references=job['references'],prompt=job['prompt']);jobs.append(row);continue
    if selection in ['beauty_redesign','full_redesign']:
        job=(full_jobs if selection=='full_redesign' else beauty_jobs)[cid]
        row.update(version=5,status='待生成整图重置' if selection=='full_redesign' else '待生成美感优先重设计',promptFile=job['prompt_file'],references=job['references'],prompt=job['prompt']);jobs.append(row);continue
    if cid in body_jobs:
        row.update(body_jobs[cid],version=5,status='待生成双图身材基准');jobs.append(row);continue
    refined=OUT/f'{cid}-refined.prompt.txt'
    if not original.exists() and refined.exists():
        row.update(version=5,status='待生成独立定妆',promptFile=refined.name,references=[],prompt=refined.read_text());jobs.append(row);continue
    old=(R/'art_sources/story_atlas_portraits_v1'/f'{cid}.prompt.txt').read_text()
    # Keep the original character, organization and plot stage; discard the old common instruction block.
    details=old.split('\n',1)[1].strip() or old.strip()
    if '模板单人选择' in details:
        details=re.sub(r'"模板单人选择"\s*:\s*"[^"]*"', '"模板单人选择": "本次仅画一位成年女性，年龄遵照职业模板；候诊乡民58岁，其余普通女性30至40岁。保留原职业衣装、实用道具与磨损程度。"',details)
    kind='在第一张原稿上仅做精细度和自然布料受力修正，保留原有成人脸、发型、身形、服装结构、衣袖、色彩、道具和姿态。' if original.exists() else '按照下面原始角色设定补齐此前缺失的参考立绘；参考图仅提供画风，不复制其面容、衣服、道具或背景。'
    if cid.startswith('ambient-') or cid=='guiyun-visitor':
        kind+='本次是成年女性职业变体；若原图为男性，仅调整成自然成年女性面容与体态，衣装与职业不变。'
    if cid=='liu-hanyan':
        kind+='保留24岁琵琶艺人的自持温婉，原有交领演出长衣仅以自然柔和裁剪呈现丰满体态，领线少量打开；长袖、长裙和琵琶保留。'
    if cid=='independent-npc-0':
        kind+='39岁掌事保留原有成熟脸、赤褐和米白长衣；领线可少量打开，丰满度自然，裙摆侧开仅小段露腿；保留长袖和工作仪态。'
    if cid in ['white-heron-npc-0','white-heron-npc-1','hechuan-npc-1','ambient-white-heron-2']:
        kind+='保留原设定52、38、41或58岁对应年龄；可在同一成年骨相上补自然眼纹、面部岁月感，不年轻化。'
    prompt='Use case: identity-preserve.\n小江湖原稿画风的小幅修订。'+kind+'\n严格沿用原有精细白描、淡彩水墨、水彩晕染、暖米白宣纸质感、低饱和柔和自然光；服饰配色以原稿为准，背景淡而疏朗。自然成人骨相和准确手指，衣料不透明；人物头顶至鞋完整入画、留出边距，竖幅2:3，原生1024×1536。单人情境立绘，无文字、UI、边框或水印。\n原始人设与剧情信息：\n'+details+'\n本轮范围：沿原稿做小幅修订；不换脸、不更换原发型、不提高全图饱和度、不重做服装为全新款式、不统一新增露肩、低领或高开衩。符合职业的动作和道具优先。'
    pf=OUT/f'{cid}.prompt.txt';pf.write_text(prompt+'\n')
    refs=[str(original)] if original.exists() else []
    row.update(version=5,status='待生成原稿微调',promptFile=pf.name,references=refs,prompt=prompt)
    jobs.append(row)
(OUT/'preparation-manifest.json').write_text(json.dumps([{k:v for k,v in j.items() if k!='prompt'} for j in jobs],ensure_ascii=False,indent=2)+'\n')
(OUT/'jobs.json').write_text(json.dumps(jobs,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'total':len(jobs),'pending':sum('prompt' in j for j in jobs),'ready':sum('prompt' not in j for j in jobs)},ensure_ascii=False))
