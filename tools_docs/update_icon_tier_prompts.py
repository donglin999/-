#!/usr/bin/env python3
"""Build future skill/heart prompts; never calls generation or edits original receipts."""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / 'docs/design/martial-review'


def expected(row, policy):
    budget = policy['grades'][row['grade']]
    category = ('招式形成的气劲与技法意象，不画摆放兵器、实体肢体或修习人' if row['kind'] == 'skill'
                else '内息组织与修习意象，不画书卷、器具或打坐人')
    prompt = (
        f"对象：{row['name']}，固定{row['grade']}级。主体类别：{category}。\n"
        "精细手绘二维南宋武侠墨彩图标，自然细墨边、水粉笔触、清楚主轮廓；低阶同样精细清晰。"
        "参考 art_sources/xiangyang_icons_v3/style-approved.png 的笔触与意象语言，"
        "仅借用本档及以下的装饰密度，不复制高阶格子的金线、气场或光核。"
        "单件正方形、真实透明PNG RGBA，原稿至少512×512；主体最长边约画框70—80%，"
        "生产512帧四边至少48px透明安全边；48px仍可辨识。无文字、数字、边框、底板、水印，不做摄影、3D或粗像素。\n"
        f"原有语义：{row['visual']}。\n"
        f"品阶标准 {policy['version']}：{budget['prompt']}\n"
        f"数量解释：{policy['counting_rule']}\n"
        f"本件构图：{policy['sample_overrides'].get(row['id'], row['visual'])}\n"
        "颜色服务于门派与用途，等级色只辅助，医疗不强改紫红。明暗塑造与外发光区分。"
        "保留必要技法语义，删减超预算的附加装饰；不增加设定外的龙、法阵或召唤物，不使用通用换色旋涡。\n"
        f"禁止：{budget['negative']}；裁切主体、过曝光球、粒子噪点、文字残片、现代符号、棋盘格假透明。"
    )
    return {
        'prompt': prompt,
        'negative_prompt': budget['negative'] + '、裁切主体、过曝光球、噪点、文字残片、现代符号、重复物件、厚重外框、棋盘格假透明、模糊低阶、用低透明度掩盖过满结构。',
        'prompt_revision': policy['version'],
        'icon_tier_policy_ref': 'icon-tiers.md',
        'visual_budget': {k: budget[k] for k in ('structure_layers_max', 'decorative_groups_max')},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    policy = json.loads((DIRECTORY / 'icon-tier-policy.json').read_text())
    file = DIRECTORY / 'catalog.json'
    catalog = json.loads(file.read_text())
    changed = []
    for row in catalog['skills'] + catalog['hearts']:
        fields = expected(row, policy)
        if any(row.get(k) != v for k, v in fields.items()):
            changed.append(row['id'])
        if not args.check:
            row.update(fields)
    if args.check:
        print(json.dumps({'result': 'out_of_sync' if changed else 'pass', 'checked': 82, 'out_of_sync': changed}, ensure_ascii=False))
        raise SystemExit(bool(changed))
    catalog['icon_prompt_revision'] = policy['version']
    file.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'updated': len(changed), 'generated_images': 0, 'equipment_unchanged': True}))


if __name__ == '__main__':
    main()
