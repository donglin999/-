import unittest,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools_scene'))
from check_concept_layout import check

class EarlyRoadChecks(unittest.TestCase):
 def test_clear_corridor(self):
  b={'worldSize':[200,200],'roads':[{'id':'path','width':60,'points':[[20,100],[180,100]]}],'objects':[{'id':'house','role':'building','footprintRect':[80,10,120,60]}]};self.assertEqual(check(b)['status'],'pass')
 def test_edge_intrusion_even_clear_centerline(self):
  b={'worldSize':[200,200],'roads':[{'id':'path','width':60,'points':[[20,100],[180,100]]}],'objects':[{'id':'house','role':'building','footprintRect':[80,110,120,160]}]};self.assertEqual(check(b)['errors'][0]['object'],'house')
 def test_round_corner_not_just_segments(self):
  b={'worldSize':[200,200],'roads':[{'id':'path','width':60,'points':[[20,100],[100,100],[100,20]]}],'objects':[{'id':'tree','role':'tree','footprintRect':[115,115,120,120]}]};self.assertEqual(check(b)['status'],'fail')
 def test_unowned_prop_blocks_design(self):
  b={'worldSize':[200,200],'roads':[],'objects':[{'id':'box','role':'prop','footprintRect':[0,0,20,20],'purpose':'fill blank'}]};self.assertEqual(check(b)['status'],'fail')
 def test_door_access_even_without_road_obstruction(self):
  b={'worldSize':[200,200],'roads':[],'doors':[{'id':'entry','approachEnvelope':[50,50,120,120]}],'objects':[{'id':'barrel','role':'prop','groupId':'inn','owner':'innkeeper','purpose':'water','footprintRect':[115,80,140,110]}]};self.assertEqual(check(b)['errors'][0]['area'],'entry')
 def test_nonmember_blocks_working_pad(self):
  b={'worldSize':[200,200],'roads':[],'workPads':[{'id':'work','rect':[20,20,180,180],'members':['wagon']}],'objects':[{'id':'wagon','role':'prop','groupId':'workshop','owner':'smith','purpose':'repair','footprintRect':[40,40,100,100]},{'id':'tree','role':'tree','footprintRect':[120,120,140,140]}]};self.assertEqual(check(b)['errors'][0]['object'],'tree')
if __name__=='__main__':unittest.main()
