"""Offline event calendar validation and bounded, joint scheduling.

No game imports or state writes. JSON output; nonzero exit on errors/unknown.
"""
import argparse
import copy
import hashlib
import json
from pathlib import Path


def validate(data):
    errors = []
    total = data['calendar']['months'] * len(data['calendar']['phases'])
    cap = data['calendar']['energyPerSlot']
    ids = [e.get('id') for e in data['events']]
    if len(ids) != len(set(ids)) or any(not x for x in ids):
        errors.append('duplicate/missing event id')
    known = set(ids)
    profiles = set(data['profiles'])
    for e in data['events']:
        label = str(e.get('id'))
        required = ['id', 'title', 'source', 'status', 'profiles', 'kind', 'window',
                    'duration', 'cost', 'hub', 'actors', 'requires', 'required', 'group']
        if any(k not in e for k in required):
            errors.append(label + ': missing event contract fields')
            continue
        if not e['profiles'] or set(e['profiles']) - profiles:
            errors.append(label + ': unknown/empty profiles')
        if e['kind'] not in ['block', 'action', 'plot', 'notice']:
            errors.append(label + ': unknown kind')
        if e['status'] not in ['draft', 'reviewed', 'accepted'] or not e['source'] or not e['title']:
            errors.append(label + ': missing source/title or invalid lifecycle status')
        a, b = e['window']
        if not all(isinstance(x, int) for x in [a, b, e['duration'], e['cost']]) or not 0 <= a <= b < total or e['duration'] < 1 or a + e['duration'] - 1 > b:
            errors.append(label + ': invalid window/duration')
        if e['kind'] == 'action' and (e['duration'] != 1 or not 0 < e['cost'] <= cap):
            errors.append(label + ': action needs one slot and valid energy')
        if e['kind'] == 'plot' and (e['duration'] != 1 or e['cost'] != 0):
            errors.append(label + ': plot needs one slot and zero energy')
        if e['kind'] in ['action', 'plot'] and 'hero' not in e['actors']:
            errors.append(label + ': player action must include hero')
        if e['kind'] in ['block', 'notice'] and e['cost'] != 0:
            errors.append(label + ': block/notice cannot also charge energy')
        if e['kind'] == 'notice' and e['actors']:
            errors.append(label + ': notice must not reserve physical actors')
        if e['hub'] not in data['hubs']:
            errors.append(label + ': unknown hub')
        if len(e['actors']) != len(set(e['actors'])) or any(x not in data['actors'] for x in e['actors']):
            errors.append(label + ': unknown/duplicate actor')
        for dep in e['requires']:
            if dep not in known:
                errors.append(label + ': unknown prerequisite ' + dep)
    by_id = {e['id']: e for e in data['events']}
    seen, visiting = set(), set()

    def visit(key):
        if key in visiting:
            errors.append('dependency cycle: ' + key)
            return
        if key in seen:
            return
        visiting.add(key)
        for dep in by_id[key].get('requires', []):
            if dep in by_id:
                visit(dep)
        visiting.remove(key)
        seen.add(key)
    for key in by_id:
        visit(key)
    for name, profile in data['profiles'].items():
        for actor in data['actors']:
            ranges = profile.get('presence', {}).get(actor, [])
            slots = [[] for _ in range(total)]
            for entry in ranges:
                a, b, hub = entry
                if not 0 <= a <= b < total or hub not in data['hubs']:
                    errors.append(name + ': invalid presence ' + actor)
                    continue
                for t in range(a, b + 1):
                    slots[t].append(hub)
            if any(len(x) != 1 for x in slots):
                errors.append(name + ': presence must cover each slot exactly once: ' + actor)
        for goal in profile.get('goals', []):
            if goal not in known or name not in by_id[goal]['profiles']:
                errors.append(name + ': unavailable goal ' + goal)
    return errors


def solve(data, profile_name, extra_goals=(), limit=100000):
    profile = data['profiles'][profile_name]
    events = {e['id']: e for e in data['events'] if profile_name in e['profiles']}
    selected = {e['id'] for e in events.values() if e['required']}
    selected.update(profile.get('goals', []))
    selected.update(extra_goals)
    missing = selected - events.keys()
    if missing:
        return {'status': 'fail', 'errors': ['unknown/unavailable goals: ' + ','.join(sorted(missing))]}
    pending = list(selected)
    while pending:
        for dep in events[pending.pop()]['requires']:
            if dep not in events:
                return {'status': 'fail', 'errors': ['prerequisite unavailable in profile: ' + dep]}
            if dep not in selected:
                selected.add(dep)
                pending.append(dep)
    order, todo = [], set(selected)
    while todo:
        ready = [events[k] for k in todo if not (set(events[k]['requires']) & todo)]
        if not ready:
            return {'status': 'fail', 'errors': ['dependency cycle']}
        e = min(ready, key=lambda e: (e['window'][1], 0 if e['kind'] == 'block' else 1, e['id']))
        order.append(e)
        todo.remove(e['id'])
    total = data['calendar']['months'] * len(data['calendar']['phases'])
    cap = data['calendar']['energyPerSlot']
    presence = {}
    for actor, ranges in profile['presence'].items():
        presence[actor] = {t: hub for a, b, hub in ranges for t in range(a, b + 1)}
    nodes, stopped, failures = 0, False, set()

    def search(i, placements, blocks, energy, groups):
        nonlocal nodes, stopped
        nodes += 1
        if nodes > limit:
            stopped = True
            return None
        if i == len(order):
            return placements
        e = order[i]
        if e['group'] and e['group'] in groups:
            failures.add(e['id'] + ': mutually exclusive goals in ' + e['group'])
            return None
        earliest = e['window'][0]
        for dep in e['requires']:
            p = placements[dep]
            earliest = max(earliest, p['start'] + (p['duration'] if events[dep]['kind'] == 'block' else 0))
        for start in range(earliest, e['window'][1] - e['duration'] + 2):
            span = range(start, start + e['duration'])
            if e['kind'] == 'block':
                # Whole-period player reservations exclude all charged activities.
                if 'hero' in e['actors'] and any(energy[t] or any('hero' in b['actors'] for b in blocks.get(t, [])) for t in span):
                    continue
                if any(set(e['actors']) & set(b['actors']) for t in span for b in blocks.get(t, [])):
                    continue
                # A later NPC reservation cannot invalidate already placed actions.
                if any(p['start'] in span and set(events[k]['actors']) & set(e['actors']) for k, p in placements.items() if events[k]['kind'] in ['action', 'plot']):
                    continue
            elif e['kind'] in ['action', 'plot']:
                if energy[start] + e['cost'] > cap:
                    continue
                if any(set(e['actors']) & set(b['actors']) for b in blocks.get(start, [])):
                    continue
                if any(presence[actor][start] != e['hub'] for actor in e['actors']):
                    continue
            # Blocks define travel/absence and override baseline; notices have no presence constraint.
            nxt_blocks = copy.deepcopy(blocks)
            nxt_energy = energy[:]
            if e['kind'] == 'block':
                for t in span:
                    nxt_blocks.setdefault(t, []).append(e)
            elif e['kind'] in ['action', 'plot']:
                nxt_energy[start] += e['cost']
            result = search(i + 1, {**placements, e['id']: {'start': start, 'duration': e['duration'], 'cost': e['cost']}}, nxt_blocks, nxt_energy, groups | ({e['group']} if e['group'] else set()))
            if result is not None:
                return result
            if stopped:
                return None
        failures.add(e['id'] + ': no placement fits window, prerequisites, energy and actor availability')
        return None
    answer = search(0, {}, {}, [0] * total, set())
    if answer is None:
        return {'status': 'unknown' if stopped else 'fail', 'nodes': nodes,
                'errors': ['search limit reached; no feasibility conclusion'] if stopped else sorted(failures)}
    blocked = {t for k, p in answer.items() if events[k]['kind'] == 'block' and 'hero' in events[k]['actors'] for t in range(p['start'], p['start'] + p['duration'])}
    actions = sum(p['cost'] for p in answer.values())
    return {'status': 'pass', 'nodes': nodes, 'placements': answer,
            'budget': {'totalSlots': total, 'playerBlockedSlots': len(blocked),
                       'freeSlots': total - len(blocked), 'freeEnergy': (total - len(blocked)) * cap,
                       'selectedActionEnergy': actions,
                       'remainingEnergy': (total - len(blocked)) * cap - actions}}


def check(data, limit=100000):
    errors = validate(data)
    if errors:
        return {'status': 'fail', 'errors': errors}
    profiles = {}
    for name in data['profiles']:
        base = solve(data, name, limit=limit)
        optional = {}
        for e in data['events']:
            if name in e['profiles'] and not e['required']:
                optional[e['id']] = solve(data, name, [e['id']], limit=limit)['status']
        profiles[name] = {'jointRequiredAndGoals': base, 'individualOptionalReachability': optional}
    fail = any(p['jointRequiredAndGoals']['status'] != 'pass' or any(x != 'pass' for x in p['individualOptionalReachability'].values()) for p in profiles.values())
    digest = hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return {'status': 'fail' if fail else 'pass', 'catalogVersion': data.get('version'),
            'catalogSha256': digest, 'planningStatus': data.get('status'),
            'scope': 'finite calendar, energy, prerequisite and actor-presence feasibility; not growth/random/runtime verification', 'profiles': profiles}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('catalog', type=Path)
    parser.add_argument('--limit', type=int, default=100000)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    result = check(json.loads(args.catalog.read_text()), args.limit)
    text = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text + '\n')
    print(text)
    raise SystemExit(result['status'] != 'pass')
