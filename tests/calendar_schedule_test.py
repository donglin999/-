import copy
import importlib.util
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('schedule', ROOT / 'tools_calendar/check_schedule.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
CATALOG = json.loads((ROOT / 'docs/design/calendar/mountain-events.json').read_text())


class CalendarScheduleTests(unittest.TestCase):
    def setUp(self):
        self.data = copy.deepcopy(CATALOG)

    def event(self, key):
        return next(e for e in self.data['events'] if e['id'] == key)

    def fails(self):
        self.assertEqual(module.check(self.data)['status'], 'fail')

    def test_existing_budget_and_both_branches(self):
        result = module.check(self.data)
        self.assertEqual(result['status'], 'pass')
        for profile in result['profiles'].values():
            budget = profile['jointRequiredAndGoals']['budget']
            self.assertEqual((budget['playerBlockedSlots'], budget['freeSlots'], budget['freeEnergy']), (39, 141, 1692))

    def test_fixed_player_trip_overlap(self):
        self.event('spring_escort').update(window=[20, 20])
        self.fails()

    def test_activity_only_available_during_journey(self):
        self.event('first_ye_work').update(window=[20, 24])
        self.fails()

    def test_two_individually_reachable_events_cannot_both_fit(self):
        for key in ['first_zhou_talk', 'first_ye_work']:
            self.event(key).update(window=[2, 2], cost=7)
        self.data['profiles']['mountain_ye_stays']['goals'] = []
        for key in ['first_zhou_talk', 'first_ye_work']:
            self.assertEqual(module.solve(self.data, 'mountain_ye_stays', [key])['status'], 'pass')
        self.data['profiles']['mountain_ye_stays']['goals'] = ['first_zhou_talk', 'first_ye_work']
        self.assertEqual(module.solve(self.data, 'mountain_ye_stays')['status'], 'fail')

    def test_cycle(self):
        self.event('truth_a')['requires'] = ['truth_b']
        self.fails()

    def test_unknown_predecessor(self):
        self.event('truth_a')['requires'] = ['missing']
        self.fails()

    def test_predecessor_finishes_after_deadline(self):
        self.event('first_zhou_talk').update(window=[0, 2], requires=['spring_escort'])
        self.fails()

    def test_visitor_absent(self):
        self.event('lu_visit')['window'] = [0, 4]
        self.fails()

    def test_branch_specific_actor_location(self):
        # Incorrectly include the local follow-up in the study branch.
        self.event('ye_stay_followup')['profiles'].append('mountain_ye_studies')
        self.fails()

    def test_npc_exclusive_booking_even_without_player(self):
        e = copy.deepcopy(self.event('spring_escort'))
        e.update(id='lu_absence', window=[8, 11], duration=4, actors=['lu'], requires=[])
        self.data['events'].append(e)
        self.fails()

    def test_mutually_exclusive_goals(self):
        for key in ['first_zhou_talk', 'first_ye_work']:
            self.event(key)['group'] = 'one_choice'
        self.fails()

    def test_presence_overlap_and_missing_range(self):
        self.data['profiles']['mountain_ye_stays']['presence']['lu'].append([0, 0, 'mountain'])
        self.fails()
        self.data = copy.deepcopy(CATALOG)
        self.data['profiles']['mountain_ye_stays']['presence']['ye'] = [[0, 10, 'mountain']]
        self.fails()

    def test_search_limit_is_unknown_not_pass(self):
        result = module.solve(self.data, 'mountain_ye_stays', limit=1)
        self.assertEqual(result['status'], 'unknown')

    def test_duplicate_id_and_invalid_duration(self):
        self.data['events'].append(copy.deepcopy(self.data['events'][0]))
        self.fails()
        self.data = copy.deepcopy(CATALOG)
        self.event('first_ye_work')['duration'] = 2
        self.fails()

    def test_automatic_plot_has_no_energy_and_does_not_block_training(self):
        for key in ['lu_visit', 'zhou_after_escort', 'pre_departure_talk']:
            e = self.event(key)
            self.assertEqual((e['kind'], e['cost'], e['required']), ('plot', 0, True))
        result = module.solve(self.data, 'mountain_ye_stays')
        self.assertEqual(result['status'], 'pass')
        self.assertEqual(result['placements']['lu_visit']['cost'], 0)
        self.event('lu_visit')['cost'] = 4
        self.fails()

    def test_plot_checks_actor_presence_and_whole_period_reservations(self):
        self.event('lu_visit').update(window=[12, 12])
        self.fails()


if __name__ == '__main__':
    unittest.main()
