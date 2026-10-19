#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Read-only checks for the fullflow story design, not a gameplay simulation."""
import argparse
import copy
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESIGN = ROOT / 'docs/design'
FOLDER = DESIGN / 'fullflow-story-20261016'


def check_flow(flow, atlas, catalog):
    errors = []
    def require(value, message):
        if not value:
            errors.append(message)
    nodes = {x['id']: x for x in flow['nodes']}
    main = [x for x in nodes.values() if x['kind'] == 'main']
    require(len(nodes) == len(flow['nodes']), 'Duplicate flow ID')
    require(Counter(n['part'] for n in main) == {1: 6, 2: 10, 3: 10, 4: 8}, 'Four-part event counts differ')
    require(flow['parts'] == ['开始', '培养', '游历', '终局'], 'Wrong four-part definition')
    require(flow['status'] == 'design_not_runtime', 'Design contract mislabeled as runtime')
    operations = flow['operations']
    require(len(operations) == 102, 'Expected 78 original rows plus 8 city subscenes and 16 vignettes; parents counted separately')
    require(sum(k.startswith(('LIFE-', 'SIDE-')) for k in operations) == 41, 'Optional operation count differs')
    for n in nodes.values():
        require(all(n.get(k) for k in ['title', 'location', 'story', 'player', 'nextReason']), n['id'] + ' lacks narrative fields')
        require(n['id'] in operations, n['id'] + ' lacks implementation row')
        if n['kind'] == 'main' and n['id'] in operations:
            require(operations[n['id']]['title'] == n['id'] + ' ' + n['title'], n['id'] + ' title drift')
        req = n['requires']
        refs = req.get('all', []) + req.get('any', []) + n['next']
        require(all(x in nodes for x in refs), n['id'] + ' references unknown node')
        require(not any(x.startswith(('LIFE-', 'SIDE-')) for x in refs), n['id'] + ' requires optional quest')
    for key, row in operations.items():
        require(all(row.get(k) for k in ['title', 'player', 'implementation', 'recovery']), key + ' lacks gameplay or recovery')

    visited, pending = set(), set()
    def visit(key):
        if key in pending:
            errors.append('Cycle at ' + key)
            return
        if key in visited or key not in nodes:
            return
        pending.add(key)
        for nxt in nodes[key]['next']:
            visit(nxt)
        pending.remove(key)
        visited.add(key)
    visit(flow['start'])
    require(set(nodes) <= visited, 'Unreachable node in authored graph')
    routes = []
    for selected in ['N-01', 'N-02', 'N-03']:
        done = set()
        for _ in range(len(nodes) + 1):
            previous = set(done)
            for key, n in nodes.items():
                r = n['requires']
                if r.get('selectedAction', selected) != selected:
                    continue
                if not set(r.get('all', [])) <= done:
                    continue
                if r.get('any') and not done.intersection(r['any']):
                    continue
                done.add(key)
            if done == previous:
                break
        valid = flow['end'] in done and done.intersection({'N-01', 'N-02', 'N-03'}) == {selected}
        require(valid, selected + ' cannot independently reach epilogue')
        routes.append({'selected': selected, 'reachesEpilogue': valid, 'optionalRequired': False})
    for choice in flow['choices']:
        require(choice['node'] in nodes and all(n in nodes for n in choice['laterNodes']), 'Choice references missing node')
        require(len(choice['values']) >= 2 and bool(choice['contract']), 'Choice lacks differentiated continuation')

    existing = {e['id'] for e in catalog['events']}
    for binding in flow['calendarBindings']:
        require(set(binding['existingEvents']) <= existing, binding['node'] + ' uses nonexistent calendar reservation')
        require(binding['registration'] == 'windows_in_catalog_actors_partial', 'Partial actor schedule falsely marked complete')
        windows = {e['id']: e.get('window') for e in catalog['events']}
        require(binding['existingWindows'] == [windows[x] for x in binding['existingEvents']], 'Calendar snapshot drift: '+binding['node'])
    people = atlas['characters']
    require(len({x['id'] for x in people}) == len(people), 'Duplicate actor ID')
    require(sum(x['type'] == 'companion' for x in people) == 19, 'Recruitment roster changed unexpectedly')
    new_ids = {'a-qi', 'yao-an', 'yan-wangshan', 'tao-zhaohai', 'chang-xiu', 'liang-shouzhuo', 'he-suniang'}
    by = {x['id']: x for x in people}
    require(new_ids <= set(by), 'New story actors missing registry')
    require(all(by[x]['type'] != 'companion' for x in new_ids if x in by), 'Story NPC became unplanned recruit')
    phases = {x['id']: x['order'] for x in atlas['phases']}
    for actor in people:
        seq = [phases.get(e['phase'], -1) for e in actor.get('events', [])]
        require(-1 not in seq and seq == sorted(seq), actor['id'] + ' has invalid stage order')
        require((DESIGN / actor['source']).is_file(), actor['id'] + ' owner missing')
    extras = flow.get('extraScenes', [])
    require(len(extras) == 24 and len({n['id'] for n in extras}) == 24, 'Extra scene count or ID duplication')
    city = [n for n in extras if n['kind'] == 'city_scene']
    mini = [n for n in extras if n['kind'] == 'vignette']
    require([n['id'] for n in city] == ['HG2-%02d' % n for n in range(1,9)], 'City internal reading order differs')
    require([n['id'] for n in mini] == ['MINI-%02d' % n for n in range(1,17)], 'Vignette IDs differ')
    require(Counter(n['part'] for n in mini) == {2:6,3:8,4:2}, 'Short stories concentrated or missing')
    for n in extras:
        require(all(n.get(k) for k in ['title','time','location','actors','story','player','nextReason']), n['id']+' lacks scene contract')
        require(n['anchor'] in nodes and n['part'] == nodes.get(n['anchor'],{}).get('part'), n['id']+' has unknown/wrong insertion phase')
        require(n['id'] in operations, n['id']+' lacks operations')
        if n['kind'] == 'city_scene':
            require(n['anchor'] == 'P2-05', n['id']+' is not inside year-two city package')
    reservation = {e['id']:e for e in catalog['events']}
    require(reservation['journey_m16']['window'] == [60,64], 'Year-two January city date lost')
    require(reservation['journey_m5']['window'] == [20,24], 'First year May outing lost')
    require(reservation['old_visitor']['window'] == [65,79], 'Visitor overlaps city travel')
    for key in ['ye_stay_followup','ye_study_mail']:
        require(reservation[key]['window'] == [65,69], 'Ye followup overlaps city travel')
    weights = flow.get('companionWeights', [])
    require({w['id'] for w in weights} == {p['id'] for p in people if p['type']=='companion'} and len(weights)==19, 'Weight table roster drift')
    caps = dict(E=6,A=4,C=4,B=3,R=3)
    for w in weights:
        for stage in ['before','after']:
            evidence, counts = w[stage+'Evidence'], w[stage+'Counts']
            require(all(len(set(evidence[k])) == counts[k] for k in caps), w['id']+' '+stage+' count/evidence mismatch')
            require(all(set(evidence[k]) <= set(evidence['E']) for k in ['A','C','R']), w['id']+' unsupported agency/outcome/closure evidence')
            require(5*sum(min(counts[k],caps[k]) for k in caps)==w[stage], w['id']+' score formula differs')
        require(set(w['newScenes']) <= {n['id'] for n in mini}, w['id']+' unknown new vignette')
        require(set(w['afterEvidence']['E']) - set(w['beforeEvidence']['E']) == set(w['newScenes']), w['id']+' score includes unrelated new evidence')
    return {'passed': not errors, 'errors': errors, 'mainEvents': len(main), 'endingActions': len(routes),
            'operationRows': len(operations), 'originalOptionalEvents': 41, 'newVignettes': len(mini), 'citySubscenes': len(city), 'scoredCompanions': len(weights), 'vignetteParts': dict(Counter(n['part'] for n in mini)), 'routes': routes,
            'companions': 19, 'namedCharacters': len(people), 'newNonRecruitActors': len(new_ids),
            'scope': '离线流程/引用/登记检查；不是运行游戏、资源完成、演员联合排期或平衡验收'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path)
    args = parser.parse_args()
    flow = json.loads((FOLDER / 'flow.json').read_text())
    atlas = json.loads((DESIGN / 'story-atlas.json').read_text())
    catalog = json.loads((DESIGN / 'calendar/mountain-events.json').read_text())
    result = check_flow(flow, atlas, catalog)
    bad = copy.deepcopy(flow)
    bad['nodes'][0]['next'] = ['NOT-A-NODE']
    cycle = copy.deepcopy(flow)
    cycle['nodes'][-1]['next'] = [flow['start']]
    wrong_date = copy.deepcopy(catalog)
    next(e for e in wrong_date['events'] if e['id']=='journey_m16')['window']=[75,79]
    inflated = copy.deepcopy(flow)
    inflated['companionWeights'][0]['after'] += 5
    result['negativeCases'] = {
        'late_city_date_rejected': not check_flow(flow, atlas, wrong_date)['passed'],
        'inflated_character_score_rejected': not check_flow(inflated, atlas, catalog)['passed'],
        'unknown_node_rejected': not check_flow(bad, atlas, catalog)['passed'],
        'cycle_rejected': not check_flow(cycle, atlas, catalog)['passed'],
    }
    if not all(result['negativeCases'].values()):
        result['passed'] = False
        result['errors'].append('Invalid fixture accepted')
    missing = []
    for p in FOLDER.glob('*.md'):
        for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', p.read_text()):
            if target.startswith(('http:', 'https:', '#')):
                continue
            local = target.split('#')[0].strip('<>')
            if local and not (p.parent / local).exists():
                missing.append({'file': p.name, 'target': target})
    result['missingLinks'] = missing
    if missing:
        result['passed'] = False
    if args.out:
        args.out.mkdir(parents=True, exist_ok=True)
        (args.out / 'fullflow-check.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps(result, ensure_ascii=False))
    return 0 if result['passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
