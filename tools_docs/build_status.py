#!/usr/bin/env python3
"""异常状态 v1：把施加异常与解除层级写进招式合同（catalog.json 与 lineage-v3-moves.json）。

规则见 docs/design/status-effects.md。幂等：先删掉旧的 apply_status 效果再写入。
需在 complete_martial_moves_v3.py、build_martial_lineage_v3.py、build_elements.py 之后运行。
每个 BP 档的 apply_status 写明 chance（含 BP 每档 +10%）与 stacks。
"""
from pathlib import Path
import json
import attack_expansion_data as EXP   # 攻击招式扩充 v1：施加异常见该文件 STATUS

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / 'docs/design/martial-review'
STATUSES = ['中毒', '流血', '内伤', '封穴', '眩晕', '目眩', '心乱', '惊惧', '迟滞']
# 招式 → [(异常, 基础率, 层数, 是否每段判定)]
APPLY = {
    'gy_p3': [('内伤', .60, 1, False)], 'gy_p5a': [('眩晕', .35, 1, False)], 'gy_s5b': [('惊惧', .30, 1, False)],
    'bh_s1': [('封穴', .35, 1, False)], 'bh_s5a': [('封穴', .50, 1, False)],
    'zc_s2': [('流血', .25, 1, True)], 'zc_s3': [('目眩', .40, 1, False)], 'zc_s5a': [('目眩', .40, 1, False)],
    'hc_s3': [('内伤', .60, 1, False)], 'hc_s4b': [('内伤', .60, 2, False)], 'hc_s5a': [('眩晕', .40, 1, False)], 'hc_s5': [('惊惧', .50, 1, False)],
    'sf_s2': [('目眩', .35, 1, False)], 'sf_s5a': [('心乱', .15, 1, True)],
    'gj_s1': [('流血', .50, 1, False)], 'gj_s3': [('流血', .40, 1, True)], 'gj_s4': [('惊惧', .30, 1, False)], 'gj_s5a': [('中毒', .70, 2, False)],
    'pj_s3': [('封穴', .30, 1, False)], 'pj_s4b': [('封穴', .40, 1, False)],
    'hui_q2': [('心乱', .15, 1, True)], 'hui_q3': [('封穴', .35, 1, False)], 'hui_q4b': [('心乱', .40, 1, False)], 'hui_q5a': [('心乱', .25, 1, False)], 'hui_q5': [('封穴', .50, 1, False)],
    'hui_d2': [('迟滞', .40, 1, False)], 'hui_d3': [('惊惧', .25, 1, False)], 'hui_d5b': [('迟滞', .50, 1, False), ('惊惧', .30, 1, False)], 'hui_d5': [('惊惧', 1.0, 1, False)],
    'yh_n2': [('封穴', .35, 1, False)], 'yl_s1': [('流血', .30, 1, True)], 'rq_s1': [('目眩', .35, 1, False)],
}
APPLY.update(EXP.STATUS)
# 解除层级：low 只解中毒、流血、目眩、迟滞；mid 可解任意一项；all 全部
CLEANSE_TIER = {'hui_q4a': 'mid', 'bh_s0': 'low', 'bh_s3': 'mid', 'bh_s4b': 'mid', 'bh_s5b': 'all', 'sf_s5b': 'mid', 'pj_s4': 'low', 'qx_s2': 'low'}


# 防御强化（2026-10-08 用户确认）：不能单独施放，选“防御”时自动附带效果
DEFEND_ENHANCE = {'gy_p2', 'sf_s1', 'gy_s4b', 'zc_s4b'}   # 回灰护影保护同伴，2026-10-08 退回普通主动招


def main():
    done = set()
    for f, key in [('catalog.json', 'skills'), ('lineage-v3-moves.json', 'moves')]:
        p = DOC / f
        d = json.loads(p.read_text())
        for m in d[key]:
            c = m['combat']
            c['effects'] = [e for e in c['effects'] if e['type'] != 'apply_status']
            for b in c['bp']:
                b['effects'] = [e for e in b['effects'] if e['type'] != 'apply_status']
            for st, base, stacks, per_hit in APPLY.get(m['id'], []):
                assert st in STATUSES
                c['effects'].append({'type': 'apply_status', 'status': st, 'chance': base, 'stacks': stacks, 'per_hit': per_hit})
                for b in c['bp']:
                    if b.get('available', True):
                        b['effects'].append({'type': 'apply_status', 'status': st, 'chance': round(min(1, base + .1 * b['spent']), 2), 'stacks': stacks, 'per_hit': per_hit})
                done.add(m['id'])
            tier = CLEANSE_TIER.get(m['id'])
            m['cleanse_tier'] = tier
            m['usage'] = 'defend_enhance' if m['id'] in DEFEND_ENHANCE else 'active'
            m['statuses'] = [a[0] for a in APPLY.get(m['id'], [])]
        p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    missing = set(APPLY) - done
    assert not missing, missing
    print(json.dumps({'施加异常的招式': len(done), '解除招式': len(CLEANSE_TIER)}, ensure_ascii=False))


if __name__ == '__main__':
    main()
