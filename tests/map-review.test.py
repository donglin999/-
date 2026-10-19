import importlib.util, unittest, tempfile, json
from pathlib import Path
from PIL import Image

spec=importlib.util.spec_from_file_location('map_review',Path(__file__).resolve().parents[1]/'tools_scene/map_review.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
def board(w,h,n=0,a=0):return {'worldSize':[w,h],'objects':[{'id':str(i),'visualRect':[600,350,750,650]} for i in range(n)],'anchors':{str(i):[620,400] for i in range(a)},'surfaces':[]}
class ReviewCoverage(unittest.TestCase):
 def test_tier_escalates_on_area_edge_density_and_height(self):
  self.assertEqual(m.tier(board(1120,800,5,6)),'small');self.assertEqual(m.tier(board(1920,1200,37,27)),'medium');self.assertEqual(m.tier(board(4096,3072)),'large')
  self.assertEqual(m.tier(board(5000,100)),'large');self.assertEqual(m.tier(board(800,600,90)),'large')
  b=board(800,600);b['surfaces']=[{'id':'bridge'}];self.assertEqual(m.tier(b),'medium')
  b['surfaces']=[{'id':'ground','height':0}];self.assertEqual(m.tier(b),'small')
  b['surfaces']=[{'id':'platform','height':12}];self.assertEqual(m.tier(b),'medium')
 def test_leaf_coverage_has_no_slivers_and_crossing_object_is_not_lost(self):
  p=m.describe(board(1920,1200,1));self.assertEqual(len(p['zones']),9);self.assertEqual(len(p['seams']),12)
  self.assertEqual(sum((z['core'][2]-z['core'][0])*(z['core'][3]-z['core'][1]) for z in p['zones']),1920*1200)
  self.assertGreater(sum('0' in z['objects'] for z in p['zones']),1)
  self.assertTrue(any('0' in s['objects'] for s in p['seams']))
 def test_large_has_districts_and_every_leaf_is_owned(self):
  p=m.describe(board(4096,3072));self.assertTrue(p['districts']);self.assertEqual({z['id'] for z in p['zones']},{z for d in p['districts'] for z in d['zones']})
 def test_missing_stale_or_deleted_evidence_blocks_acceptance(self):
  p=m.describe(board(800,600,1));p['inputDigest']='new'
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);(root/'view.png').touch();(root/'play.png').touch()
   row={'inputDigest':'new','status':'pass','reviewer':'independent','visualEvidence':['view.png'],'runtimeEvidence':['play.png'],'unresolvedFindings':[]};l={'zones':{'whole':row}}
   self.assertEqual(m.gate(p,l,root)['status'],'accepted');row['inputDigest']='old';self.assertEqual(m.gate(p,l,root)['status'],'pending')
   row['inputDigest']='new';(root/'play.png').unlink();self.assertEqual(m.gate(p,l,root)['status'],'pending')
 def test_changed_art_archives_old_evidence_and_revokes_acceptance(self):
  with tempfile.TemporaryDirectory() as tmp:
   root=Path(tmp);bp=root/'board.json';bg=root/'assembled.png';mask=root/'mask.png';out=root/'review'
   bp.write_text(json.dumps(board(800,600,1)));Image.new('RGB',(800,600),'green').save(bg);Image.new('L',(800,600),255).save(mask)
   first=m.build(bp,bg,mask,out);row={'inputDigest':first['inputDigest'],'status':'pass','reviewer':'tester','visualEvidence':[str(out/'zones-whole.png')],'runtimeEvidence':[str(bg)],'unresolvedFindings':[]}
   (out/'review-ledger.json').write_text(json.dumps({'zones':{'whole':row}}));self.assertEqual(m.build(bp,bg,mask,out)['gate']['status'],'accepted')
   Image.new('RGB',(800,600),'brown').save(bg);second=m.build(bp,bg,mask,out);self.assertEqual(second['gate']['status'],'pending')
   old=out/'previous'/first['inputDigest'][:16]/'zones-whole.png';self.assertTrue(old.is_file());self.assertNotEqual(old.read_bytes(),(out/'zones-whole.png').read_bytes())
 def test_functional_area_change_invalidates_evidence_but_review_status_does_not(self):
  with tempfile.TemporaryDirectory() as tmp:
   p=Path(tmp)/'im.png';Image.new('RGB',(800,600),'green').save(p);b=board(800,600);old=m.digest(b,p,p)
   b['artReviewStatus']='accepted';b['runtimeAcceptanceStatus']='accepted';self.assertEqual(m.digest(b,p,p),old)
   b['reviewAreas']=[{'id':'courtyard','rect':[0,0,400,500]}];self.assertNotEqual(m.digest(b,p,p),old)
if __name__=='__main__':unittest.main()
