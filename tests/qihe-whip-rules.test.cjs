const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const R=require('../js/qihe-faction-clash-rules.js'),D=R.data;
const cat=JSON.parse(fs.readFileSync(path.join(root,'../xiaojianghu/docs/design/martial-review/catalog.json')));
test('new levels preserve four leader skills, eight actions and six survivors',()=>{const s=R.simulate();assert.equal(s.units.xu.lv,22);assert.equal(s.units.cen.lv,38);assert.equal(s.log.length,8);assert(Object.values(s.units).every(u=>u.hp>0));assert.equal(s.units.cen.mp,s.units.cen.mmp-20);assert.equal(s.log.filter(a=>a.actor==='cen'&&D.skills[a.skill]).length,2);assert.equal(s.units.guard_rear.clashBlunted,undefined)});
test('whip wrist hit weakens all hits of next action, then expires',()=>{
 const s=R.create(),t=s.units.guard_rear;t.hp=9999;s.units.cen.hp=9999;t.bp=3;
 R.impact(R.begin(s,{actor:'cen',skill:'cs_whip_s1',target:'guard_rear'}));
 const r=R.impact(R.begin(s,{actor:'guard_rear',skill:'attack',target:'cen',bp:2}));
 assert.equal(r.hits.length,3);assert(r.hits.every(h=>h.damage===Math.round((t.atk-s.units.cen.def*.5)*.9)));
 const next=R.impact(R.begin(s,{actor:'guard_rear',skill:'attack',target:'cen'}));assert(next.hits[0].damage>r.hits[0].damage);
});
test('miss adds no wrist effect; defend consumes its next-action duration',()=>{
 let s=R.create();R.impact(R.begin(s,{actor:'cen',skill:'cs_whip_s1',target:'xu'}),{hit:1,crit:1,status:0});assert.equal(s.units.xu.clashBlunted,undefined);
 R.impact(R.begin(s,{actor:'cen',skill:'cs_whip_s1',target:'xu'}));assert.equal(s.units.xu.clashBlunted,.1);
 R.impact(R.begin(s,{actor:'xu',skill:'defend',target:'xu'}));assert.equal(s.units.xu.clashBlunted,undefined);
});
test('sweep exposure consumes once or expires before caster next action',()=>{
 for(const consumed of [true,false]){const s=R.create();R.impact(R.begin(s,{actor:'cen',skill:'cs_whip_s2',target:'xu'}));assert.equal(s.units.cen.clashExposure,.1);
 if(consumed)R.impact(R.begin(s,{actor:'xu',skill:'attack',target:'cen'}));else R.begin(s,{actor:'cen',skill:'defend',target:'cen'});
 assert.equal(s.units.cen.clashExposure,undefined);assert.equal(s.units.cen.clashExposureUntil,undefined)}
});
test('exclusive whip ids keep public knife skills intact; mastery and BP do not multiply status strength',()=>{
 assert.equal(cat.skills.find(s=>s.id==='gj_s1').weapon,'刀');assert.equal(cat.skills.find(s=>s.id==='gj_s2').weapon,'刀');
 const s=R.create();s.units.cen.skLv.cs_whip_s1=10;assert.equal(R.cost(s.units.cen,'cs_whip_s1'),5);
 for(const id of ['cs_whip_s1','cs_whip_s2']){assert.equal(D.skills[id].system_id,'art_cs_whip_jia');for(const b of D.skills[id].combat.bp)assert.equal(b.effects[0].value,.1)}
});
