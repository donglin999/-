#!/usr/bin/env python3
"""Check the four-part design contracts. Read-only except an explicit --out report."""
import argparse
import copy
import itertools
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESIGN = ROOT / 'docs/design'


def validate(atlas, companions, regions, design=DESIGN):
    errors = []
    def check(ok, message):
        if not ok:
            errors.append(message)

    people = atlas['characters']
    roster = {x['id'] for x in people if x['type'] == 'companion'}
    entries = companions['characters']
    check(len(entries) == len(roster) == 19, '同伴人数不等于现行19人')
    check({x['id'] for x in entries} == roster, '逐人设计与图谱名册不一致')
    check(len({x['id'] for x in entries}) == len(entries), '逐人设计存在重复ID')
    check(sum(x['gender'] == '女' for x in people if x['id'] in roster) == 15,
          '可入队女性人数不符')
    fields = ['identityAction', 'relations', 'recruitment', 'fallback', 'endStance', 'personalGameplay']
    for c in entries:
        check(all(c.get(k) for k in fields), f"{c['id']}缺少人物职责或玩法字段")
        check(set(c.get('fourPartArc', {})) == {'opening', 'cultivation', 'travel', 'end'},
              f"{c['id']}四部分人物弧不完整")
        check((design / c['source']).is_file(), f"人物负责页不存在：{c['source']}")
    phases = {x['id']: x['order'] for x in atlas['phases']}
    factions = {x['id'] for x in atlas['factions']}
    for c in people:
        check(c['faction'] in factions, f"{c['id']}组织登记不存在")
        order = [phases.get(e['phase'], -1) for e in c.get('events', [])]
        check(-1 not in order and order == sorted(order), f"{c['id']}事件阶段无效或倒序")
        check((design / c['source']).is_file(), f"人物来源缺失：{c['source']}")

    scenes = {x['id']: x for x in regions['scenes']}
    locations = {x['id'] for x in regions['locations']}
    loops = {x['id'] for x in regions['loops']}
    nodes = {x['id']: x for x in regions['nodes']}
    routes = {x['id']: x for x in regions['finalRoutes']}
    check(len(scenes) == len(regions['scenes']), '地图ID重复')
    check(len(nodes) == len(regions['nodes']), '主线节点ID重复')
    check(regions['parts'] == ['开始', '培养', '游历', '终局'], '四部分不符合已确认口径')
    check(regions['time']['globalDayNightCycle'] is False and
          regions['time']['travelTimeCost'] == 0 and regions['time']['cityActionCost'] == 0,
          '城市与游历引入未确认的计时')
    graph = {s: set() for s in scenes}
    for scene in scenes.values():
        check(scene['locationId'] in locations, f"地图地点未知：{scene['id']}")
        check(scene.get('runtimeSceneId') is None, f"设计地图冒充运行场景：{scene['id']}")
    for edge in regions['connections']:
        a, b = edge['fromScene'], edge['toScene']
        check(a in scenes and b in scenes, f'连接指向未知地图：{a}→{b}')
        if a in scenes and b in scenes:
            graph[a].add(b)
            if edge.get('bidirectional'):
                graph[b].add(a)
    starts = set(regions['worldEntryScenes'])
    check(starts <= set(scenes), '世界入口指向未知地图')
    def reachable(seed):
        seen = set(seed)
        queue = list(seed)
        while queue:
            for nxt in graph.get(queue.pop(), ()):
                if nxt not in seen:
                    seen.add(nxt)
                    queue.append(nxt)
        return seen
    check(set(scenes) <= reachable(starts), '存在无法从世界入口到达的地图')
    check(all(reachable({s}) & starts for s in scenes), '存在没有返回世界入口路径的地图')
    counts = Counter(x['kind'] for x in scenes.values())
    budget = regions['budget']
    check(len(scenes) <= budget['totalNewMapsMax'], '地图超过当前制作上限')
    check(counts['outdoor'] == budget['newOutdoorMaps'] and counts['indoor'] == budget['newIndoorMaps'],
          '室内外地图数与预算不符')

    def refs(requirements):
        result = set(requirements.get('all', []) + requirements.get('any', []))
        result.update(requirements.get('atLeast', {}).get('of', []))
        for nested in requirements.get('bySelectedRoute', {}).values():
            result.update(refs(nested))
        return result
    deps = {k: refs(n.get('requires', {})) for k, n in nodes.items()}
    for nid, n in nodes.items():
        check(deps[nid] <= set(nodes), f'{nid}前置引用未知节点')
        check(set(n.get('sceneIds', [])) <= set(scenes), f'{nid}引用未知地图')
        check(set(n.get('loops', [])) <= loops, f'{nid}引用未知玩法')
        cast = n.get('castPolicy', {})
        check(cast.get('onsiteOnly') is True and bool(cast.get('absentFallback')),
              f'{nid}缺少本人在场或缺席替代合同')
        check(not cast.get('requiredCompanions'), f'{nid}把指定招募角色设为必需')
    visiting, visited = set(), set()
    def visit(nid):
        if nid in visiting:
            errors.append(f'节点依赖成环：{nid}')
            return
        if nid in visited or nid not in nodes:
            return
        visiting.add(nid)
        for dep in deps[nid]:
            visit(dep)
        visiting.remove(nid)
        visited.add(nid)
    for nid in nodes:
        visit(nid)

    def eligible(req, done, route):
        if not set(req.get('all', [])) <= done:
            return False
        if req.get('any') and not done.intersection(req['any']):
            return False
        threshold = req.get('atLeast')
        if threshold and len(done.intersection(threshold['of'])) < threshold['count']:
            return False
        if req.get('routeEquals') and req['routeEquals'] != route:
            return False
        if req.get('requiredPreparationCount', 0) > len(routes[route].get('preparations', [])):
            return False
        nested = req.get('bySelectedRoute', {}).get(route)
        return not nested or eligible(nested, done, route)

    paths = []
    for pair in itertools.combinations(['NORTH', 'RIVER', 'SECT'], 2):
        excluded = ({'NORTH', 'RIVER', 'SECT'} - set(pair)).pop()
        for route, contract in routes.items():
            check(all(x.get('publicTask') for x in contract.get('preparations', [])),
                  f'{route}缺少公开筹备任务')
            check(set(contract.get('scenes', [])) <= set(scenes), f'{route}引用未知地图')
            done = set()
            for _ in range(len(nodes) + 1):
                previous = set(done)
                for nid, n in nodes.items():
                    if nid.startswith('TRV-' + excluded + '-'):
                        continue
                    if nid.startswith('END-COURT-') and route != 'END-ACT-COURT':
                        continue
                    if eligible(n.get('requires', {}), done, route):
                        done.add(nid)
                if done == previous:
                    break
            passed = route in done and 'END-RESOLVE' in done and 'TRV-' + excluded + '-DONE' not in done
            check(passed, f'{pair}→{route}无指定同伴的结构路径不可达')
            paths.append({'regions': pair, 'route': route, 'passed': passed})
    variants = routes.get('END-ACT-GUIJIN', {}).get('variants', [])
    check(len(variants) == 2 and len({x.get('opponent') for x in variants}) == 2,
          '归烬自主与扩张未区分对手')
    return {'status': 'pass' if not errors else 'fail', 'errors': errors,
            'companions': len(roster), 'characters': len(people), 'maps': len(scenes),
            'nodes': len(nodes), 'loops': len(loops), 'publicPaths': paths,
            'scope': '静态设计结构核对；假定培养外部前提和公开筹备已完成，不是游戏执行或数值验证'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path)
    parser.add_argument('--self-check', action='store_true', help='Check that invalid references and cycles fail in memory.')
    args = parser.parse_args()
    atlas = json.loads((DESIGN / 'story-atlas.json').read_text())
    folder = DESIGN / 'story-rework-20261016'
    companions = json.loads((folder / 'companion-atlas-delta.json').read_text())
    regions = json.loads((folder / 'regions.json').read_text())
    report = validate(atlas, companions, regions)
    if args.self_check:
        broken_map = copy.deepcopy(regions)
        broken_map['connections'][0]['toScene'] = 'missing-scene'
        broken_cycle = copy.deepcopy(regions)
        broken_cycle['nodes'][0]['requires'] = {'all': ['TRV-CLOSE']}
        report['negativeCases'] = {
            'missing_scene_rejected': validate(atlas, companions, broken_map)['status'] == 'fail',
            'dependency_cycle_rejected': validate(atlas, companions, broken_cycle)['status'] == 'fail',
        }
        if not all(report['negativeCases'].values()):
            report['errors'].append('反例检查未拦截无效合同')
            report['status'] = 'fail'
    if args.out:
        args.out.mkdir(parents=True, exist_ok=True)
        (args.out / 'story-design.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(report, ensure_ascii=False))
    return 0 if report['status'] == 'pass' else 1


if __name__ == '__main__':
    raise SystemExit(main())
