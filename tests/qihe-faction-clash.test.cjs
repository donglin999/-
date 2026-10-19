const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const R=require('../js/qihe-faction-clash-rules.js'),D=R.data;
test('scene uses responsible public/private contracts and two five-level Jia arts',()=>{
 const dir=path.join(__dirname,'../../xiaojianghu/docs/design/martial-review');const skills=[...JSON.parse(fs.readFileSync(path.join(dir,'catalog.json'))).skills,...JSON.parse(fs.readFileSync(path.join(dir,'cen-whip.json'))).skills];
 for(const[id,s]of Object.entries(D.skills))assert.deepEqual(s.combat,skills.find(x=>x.id===id).combat);
 for(const[actor,art,id]of [['xu','art_am_jia','am_s3'],['cen','art_cs_whip_jia','cs_whip_s2']]){assert.equal(D.arts[art].grade,'甲');assert.equal(D.arts[art].skill_ids.length,2);assert.equal(D.profiles[actor].artLevels[art],5);assert.equal(D.skills[id].art_unlock_level,5);assert.equal(D.skills[id].combat.target,'all_foes')}
});
test('exactly two skills per leader, two real group attacks, all six survive without hp floors',()=>{
 const s=R.simulate();assert.equal(Object.keys(s.units).length,6);assert.equal(s.log.length,8);
 for(const actor of ['xu','cen'])assert.equal(s.log.filter(a=>a.actor===actor&&D.skills[a.skill]).length,2);
 assert.equal(s.units.xu.mp,s.units.xu.mmp-18);assert.equal(s.units.cen.mp,s.units.cen.mmp-20);
 for(const id of ['am_s3','cs_whip_s2']){const a=s.log.find(x=>x.skill===id);assert.equal(a.hits.length,3);assert.equal(new Set(a.hits.map(h=>h.target)).size,3);assert(a.hits.every(h=>h.damage>0))}
 assert(Object.values(s.units).every(u=>u.hp>1));assert.equal(s.log.find(x=>x.actor==='guard_rear').bp,1);assert.equal(s.log.find(x=>x.actor==='guard_rear').hits.length,2);
 const lethal=R.create();lethal.units.xu.atk=10000;R.impact(R.begin(lethal,{actor:'xu',skill:'am_s3',target:'cen'}));assert(['cen','wu','adept'].every(k=>lethal.units[k].hp===0));
});
test('AoE charges MP/BP/action once, excludes allies/dead, and resolves independently per enemy',()=>{
 const s=R.create(),u=s.units.xu;u.bp=3;s.units.wu.hp=0;const before={mp:u.mp,bp:u.bp,ally:s.units.guard_front.hp};const a=R.begin(s,{actor:'xu',skill:'am_s3',target:'cen',bp:2});
 assert.deepEqual(a.record.targets,['cen','adept']);assert.equal(u.mp,before.mp-14);assert.equal(u.bp,before.bp-2);assert.equal(u.actionN,1);
 R.impact(a,t=>({hit:t.key==='cen'?1:0,crit:1,status:1}));assert.equal(s.units.cen.hp,s.units.cen.mhp);assert.equal(s.units.cen.clashFollow,undefined);assert(s.units.adept.hp<s.units.adept.mhp);assert.equal(s.units.adept.clashFollow.value,.25);assert.equal(s.units.guard_front.hp,before.ally);assert.equal(s.units.wu.hp,0);assert.throws(()=>R.impact(a),/重复/);
});
test('group power is per target, one shield maximum per target, no multiplication by target count',()=>{
 const a=R.create(),b=R.create();b.units.wu.hp=0;b.units.adept.hp=0;
 const x=R.impact(R.begin(a,{actor:'xu',skill:'am_s3',target:'cen'}));const y=R.impact(R.begin(b,{actor:'xu',skill:'am_s3',target:'cen'}));assert.equal(x.hits.find(h=>h.target==='cen').damage,y.hits[0].damage);
 for(const key of ['cen','wu','adept'])assert.equal(a.units[key].shield,3);
});
test('grade-Jia second moves reject level four and invalid targets without spending resources',()=>{
 for(const[actor,id,art,target]of [['xu','am_s3','art_am_jia','cen'],['cen','cs_whip_s2','art_cs_whip_jia','xu']]){const s=R.create(),u=s.units[actor];u.artLv[art]=4;const before=JSON.stringify(u);assert.throws(()=>R.begin(s,{actor,skill:id,target}),/重数/);assert.equal(JSON.stringify(u),before)}
 const s=R.create(),u=s.units.xu,before=u.mp;assert.throws(()=>R.begin(s,{actor:'xu',skill:'am_s3',target:'guard_front'}),/同伴/);assert.equal(u.mp,before);u.mp=0;assert.throws(()=>R.begin(s,{actor:'xu',skill:'am_s3',target:'cen'}),/内力/);
});
test('follow marks apply once to another ally action, to all BP hits, separately per target',()=>{
 const s=R.create();for(const u of Object.values(s.units))u.hp=10000;R.impact(R.begin(s,{actor:'xu',skill:'am_s3',target:'cen'}));
 const mark=s.units.cen.clashFollow;R.impact(R.begin(s,{actor:'xu',skill:'attack',target:'cen'}));assert.equal(s.units.cen.clashFollow,mark);
 const r=R.impact(R.begin(s,{actor:'guard_rear',skill:'attack',target:'cen',bp:1}));assert.equal(r.hits.length,2);assert.equal(r.hits[0].damage,r.hits[1].damage);assert.equal(r.effects.filter(e=>e.kind==='followUsed').length,1);assert.equal(s.units.cen.clashFollow,undefined);assert(s.units.wu.clashFollow&&s.units.adept.clashFollow);
 const plain=R.impact(R.begin(s,{actor:'guard_rear',skill:'attack',target:'cen'}));assert(plain.hits[0].damage<r.hits[0].damage);
 s.round=3;R.begin(s,{actor:'wu',skill:'defend',target:'wu'});assert.equal(s.units.wu.clashFollow,undefined);assert.equal(s.units.adept.clashFollow,undefined);
});
test('existing unload, support cooldown and MP protections still work',()=>{
 const s=R.create();R.impact(R.begin(s,D.sequence[0]));const reduced=R.impact(R.begin(s,D.sequence[1]));const normal=R.impact(R.begin(s,D.sequence[1]));assert(reduced.hits[0].damage<normal.hits[0].damage);assert.equal(s.units.guard_front.clashUnload,undefined);
 assert.throws(()=>R.begin(s,{actor:'xu',skill:'am_s2',target:'xu'}));R.impact(R.begin(s,{actor:'xu',skill:'am_s2',target:'guard_rear'}));assert.equal(s.units.guard_rear.bp,3);assert.throws(()=>R.begin(s,{actor:'xu',skill:'am_s2',target:'guard_front'}),/冷却/);
});
test('deterministic scene does not mutate source roster; all four leader skills run their own dedicated VFX',()=>{
 const before=JSON.stringify(D);assert.deepEqual(R.simulate(),R.simulate());assert.equal(JSON.stringify(D),before);
 // 2026-10-18：am_s3、cs_whip_s1/2 改播用户评审通过的 v2 素材版特效（*_v2）。
 for(const [id,fx] of [['am_s1','am_s1'],['am_s3','am_s3_v2'],['cs_whip_s1','cs_whip_s1_v2'],['cs_whip_s2','cs_whip_s2_v2']]){assert.equal(D.presentation[id].fxId,fx);assert.equal(D.presentation[id].fxStatus,'ready')}
});
