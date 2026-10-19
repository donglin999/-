import unittest,json,tempfile,sys,copy
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools_scene'))
from map_preflight import check,file_hash
from PIL import Image

class PreventRegression(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.base=Path(self.tmp.name);self.intent=self.base/'intent.json';self.approval=self.base/'approval.json'
  self.board={'worldSize':[1000,800],'objects':[{'id':'wall','asset':'wall_h','visualRect':[0,0,200,60],'footprintRect':[0,40,200,60],'baseline':60},{'id':'house1','asset':'house','visualRect':[200,0,500,200],'footprintRect':[210,100,490,200],'baseline':200},{'id':'house2','asset':'house','visualRect':[600,0,900,200],'footprintRect':[610,100,890,200],'baseline':200}],'wallRuns':[{'id':'front','objectIds':['wall']}],'wallOpenings':[],'wallConnections':[]}
  self.measure={o['id']:{'visibleSize':[o['visualRect'][2]-o['visualRect'][0],o['visualRect'][3]-o['visualRect'][1]],'visibleRect':o['visualRect'],'sourceSha256':'approved-source','sourceVisibleSize':[o['visualRect'][2]-o['visualRect'][0],o['visualRect'][3]-o['visualRect'][1]]} for o in self.board['objects']}
  self.contract={k:copy.deepcopy(self.board[k]) for k in ['worldSize','wallRuns','wallOpenings','wallConnections']};self.contract.update(structuralAssets=['house','wall_h'],structures=[dict(o,**self.measure[o['id']]) for o in self.board['objects']],boundarySegments=[{'id':'front','from':[0,50],'to':[199,50],'radius':0,'objectIds':['wall']}],buildings=[{'id':id,'role':'home','sizeReason':'standard','doorSourceRect':[0,0,50,110]} for id in ['house1','house2']],scaleGroups=[{'id':'same-house','objectIds':['house1','house2'],'tolerancePx':1}]);self.intent.write_text(json.dumps(self.contract));(self.base/'reference.png').write_bytes(b'approved evidence');self.approval.write_text(json.dumps({'status':'accepted','reviewer':'independent','intentSha256':file_hash(self.intent),'evidence':{'reference.png':file_hash(self.base/'reference.png')}}))
 def tearDown(self):self.tmp.cleanup()
 def run_check(self):return check(self.board,self.intent,self.measure,self.approval,{'wall':Image.new('RGBA',(200,60),(100,100,100,255))})
 def test_reference_passes(self):self.assertEqual(self.run_check()['status'],'pass')
 def test_delete_wall_and_requirement_together_rejected(self):
  self.board['objects']=self.board['objects'][1:];self.board['wallRuns']=[];self.assertEqual(self.run_check()['status'],'fail')
 def test_gap_registered_after_generation_rejected(self):
  self.board['wallOpenings']=[{'id':'excuse','purpose':'new gap'}];self.assertEqual(self.run_check()['status'],'fail')
 def test_actual_shrink_even_with_same_container_rejected(self):
  self.measure['house2']['visibleSize']=[264,176];self.assertEqual(self.run_check()['status'],'fail')
 def test_source_swap_rejected(self):
  self.measure['house2']['sourceSha256']='changed';self.assertEqual(self.run_check()['status'],'fail')
 def test_rewrite_intent_revokes_approval(self):
  self.contract['structures']=self.contract['structures'][1:];self.intent.write_text(json.dumps(self.contract));self.assertIn('design intent not independently approved at current hash',self.run_check()['errors'])
 def test_visible_joint_hole_rejected_with_unchanged_bounds(self):
  self.contract['boundaryProbes']=[{'id':'wall-joint','point':[100,50],'radius':1,'objectIds':['wall']}]
  self.intent.write_text(json.dumps(self.contract));a=json.loads(self.approval.read_text());a['intentSha256']=file_hash(self.intent);self.approval.write_text(json.dumps(a))
  tile=Image.new('RGBA',(200,60),(100,100,100,255));tile.paste((0,0,0,0),(98,48,103,53))
  result=check(self.board,self.intent,self.measure,self.approval,{'wall':tile});self.assertIn('wall-joint: expected visible structural joint absent',result['errors'])
 def approve_contract(self):
  self.intent.write_text(json.dumps(self.contract));a=json.loads(self.approval.read_text());a['intentSha256']=file_hash(self.intent);self.approval.write_text(json.dumps(a))
 def test_continuous_boundary_catches_hole_away_from_joints(self):
  self.contract['boundarySegments']=[{'id':'front','from':[0,50],'to':[199,50],'radius':0,'objectIds':['wall']}];self.approve_contract()
  tile=Image.new('RGBA',(200,60),(100,100,100,255));tile.paste((0,0,0,0),(80,0,100,60))
  result=check(self.board,self.intent,self.measure,self.approval,{'wall':tile});self.assertTrue(any('front:80:' in e for e in result['errors']))
 def test_low_door_rejected_even_approved_building_box(self):
  self.contract['buildings']=[{'id':'house1','role':'home','sizeReason':'standard','doorSourceRect':[0,0,50,70]}];self.measure['house1']['sourceVisibleSize']=[300,200];self.approve_contract()
  self.assertIn('house1: door height below adult plus 8px headroom',self.run_check()['errors'])
 def test_modified_approval_evidence_rejected(self):
  (self.base/'reference.png').write_bytes(b'changed');self.assertEqual(self.run_check()['status'],'fail')
 def test_missing_approval_rejected(self):
  self.approval.unlink();self.assertEqual(self.run_check()['status'],'fail')

if __name__=='__main__':unittest.main()
