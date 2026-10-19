'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const H=require('../js/qh-mode-cultivation-household.js'),V=require('../js/qh-mode-cultivation-visitors.js');
global.CultivationHousehold=H;const Q=require('../js/qh-mode-cultivation-story.js');
let contexts=0,lines=0,branches=0;const misses=[];
for(const adult of [false,true])for(const score of [0,100])for(const injury of ['light','rest','unknown'])for(const delivery of [null,'guided_footwork','assisted_carry','asked_for_guidance'])for(let skills=0;skills<8;skills++){
 contexts++;const c={adult,rel:{yin:score,ye:score,pei:score,shimu:score},yinScore:score,major:skills&2?'sword':'fist',footwork:!!(skills&4),fist:!!(skills&1),sword:!!(skills&2),delivery,learned:{fist:!!(skills&1),sword:!!(skills&2),footwork:!!(skills&4)},opening:{chen_injury:injury},first_delivery:{method:delivery},facts:{}};
 for(const d of V.all()){
  const x=V.script(d.id,c);branches+=x.choices.length;
  for(const l of [...x.intro,...x.closing,...x.choices.flatMap(ch=>ch.lines)]){
   lines++;const cast=l.cast||d.cast;
   if(!['title','narrator'].includes(l.speaker)&&!cast.includes(l.speaker))misses.push({id:d.id,speaker:l.speaker,cast,text:l.text});
   assert.equal(new Set(cast).size,cast.length,d.id+' duplicate actor');
   for(const k of cast){assert.ok(Q.labels[k]&&Q.portraits[k],d.id+' unknown '+k);assert.ok(fs.existsSync(path.join(__dirname,'..',Q.portraits[k])),k+' missing portrait');}
   const display=Q.composition(cast,l.speaker,d.actor);assert.ok(display.foreground.length<=3);
   if(!['title','narrator'].includes(l.speaker))assert.ok(display.foreground.includes(l.speaker),d.id+' speaker not foreground');
   assert.deepEqual([...display.foreground,...display.roster].sort(),[...cast].sort(),d.id+' losing or adding cast');
  }
 }
}
assert.deepEqual(misses,[]);
const c={rel:{yin:100,ye:100},adult:true,footwork:true,learned:{},facts:{},opening:{},first_delivery:{}};
const x=id=>H.script(id,c);
assert.deepEqual(x('gy_prelude_stance').intro.at(-1).cast,['hero_mid','ye']);
assert.deepEqual(x('gy_prelude_stance').closing.at(-1).cast,['zhong','hero_mid']);
assert.ok(!x('gy_night_return').intro[2].cast.includes('yin'));
assert.ok(x('gy_night_return').intro[3].cast.includes('yin'));
assert.ok(!x('gy_night_return').intro[6].cast.includes('ye'));
assert.ok(x('gy_night_return').intro[7].cast.includes('ye'));
assert.ok(x('gy_brother_hurt').intro[5].cast.includes('zhou'));
assert.ok(x('gy_dou_runaway').intro[4].cast.includes('yin'));
assert.deepEqual(x('gy_mid_autumn').choices.find(ch=>ch.key==='moon_ye').lines.at(-1).cast,['hero','ye']);
assert.deepEqual(x('gy_brother_hurt').choices.find(ch=>ch.key==='night_watch').lines.at(-1).cast,['hero','fang']);
assert.deepEqual(x('gn_lamp').intro[1].cast,['hero']);
assert.ok(!x('gs_goose_missing').intro[0].cast.includes('goose'));
assert.ok(x('gs_goose_missing').choices.find(ch=>ch.key==='track').lines.at(-1).cast.includes('goose'));
assert.equal(x('gy_man_herbs').closing[0].place,'herb_garden');
const p={action:'gy_m02',visitor:{version:1,phase:'intro',cursor:0,selected:null,context:{...c,footwork:true,fist:false,sword:false,delivery:null}}};
while(p.visitor.phase!=='commit'){const l=V.current(p);if(!['title','narrator'].includes(l.speaker))assert.ok(l.cast.includes(l.speaker));if(p.visitor.phase==='choice')V.choose(p,0);else V.next(p);}
assert.ok(!V.current(p).text.includes('必要的消息'));
const out={status:'pass',stories:V.all().length,contexts,lines,branches,cast_misses:misses,notes:'All authored casts checked before renderer fallback; delayed entries, private cuts and all skill/delivery/age/relationship variants included.'};
fs.writeFileSync(path.join(__dirname,'../review/guiyun-performance-fix-20261012/cast-audit.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out));
