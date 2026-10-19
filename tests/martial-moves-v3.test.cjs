const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const ROOT=path.resolve(__dirname,'..'),catalog=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/design/martial-review/catalog.json'))),skills=catalog.skills,by=Object.fromEntries(skills.map(r=>[r.id,r]));const model=require('../js/martial-move-model.js');
test('all 64 moves have distinct names, one owner, numeric BP contracts and authentic generated icons',()=>{
 assert.equal(skills.length,64);assert.equal(new Set(skills.map(r=>r.name)).size,64);
 const systems=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/design/martial-review/martial-systems.json'))).systems,owners=systems.flatMap(s=>s.skill_ids);assert.equal(owners.length,64);assert.equal(new Set(owners).size,64);
 for(const r of skills){const c=r.combat;assert(r.naming.meaning&&r.naming.basis);assert(c.mp>=0&&c.action_cost===1);assert.equal(c.bp.length,4);assert.equal(c.hit_weights.length,c.base_hits);if(c.base_hits)assert(Math.abs(c.hit_weights.reduce((a,b)=>a+b,0)-1)<.00001);assert(r.production_icon.source_tool.includes('image_gen'));assert(Math.min(...r.production_icon.margins)>=64);assert.equal(r.production_icon.size.join('x'),'512x512');for(const [name,hash] of [[r.production_icon.path,r.production_icon.sha256],[r.production_icon.source,r.production_icon.source_sha256]])assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT,name))).digest('hex'),hash);for(const b of c.bp)assert(Number.isFinite(b.total_power)&&Number.isInteger(b.shield_cap));}
});
test('multihit BP distributes power rather than copying full damage and shields require real weakness',()=>{
 const a={attack:40};for(const r of skills.filter(r=>r.boost_mode==='hits')){const zero=model.estimate(r,a,{defense:18},{bp:0}),three=model.estimate(r,a,{defense:18},{bp:3});assert.equal(zero.damage,three.damage,r.id);assert.equal(three.hits.length,zero.hits.length+3,r.id);assert.equal(three.shield_used,0);}
 const broke=model.estimate(by.gy_s2,a,{defense:18,shield:1,matches_weakness:true},{bp:0});assert.equal(broke.hits[0].broken_before,false);assert.equal(broke.hits[1].broken_before,true);
});
test('ultimate power cannot double boost, healing clamps, no healing on damage-only skills',()=>{
 for(const r of skills.filter(r=>r.profile==='X')){for(let bp=0;bp<3;bp++)assert.equal(model.estimate(r,{}, {},{bp}).available,false);assert.equal(r.combat.bp[3].total_power,r.combat.total_power);assert.equal(r.combat.mp,24);assert.equal(r.combat.ultimate_lock_next_self_actions,1);}
 assert.equal(model.estimate(by.bh_s2,{wisdom:99,max_mp:999},{max_hp:100,hp:100},{bp:3}).heal,0);assert.equal(model.estimate(by.bh_s2,{wisdom:99,max_mp:999},{max_hp:100,hp:0},{bp:3}).heal,35);assert.equal(model.estimate(by.gy_s1,{},{}).heal,0);
});
test('all stages, levels and BP bands produce finite results; immutable foundation costs stay 3/0',()=>{
 assert.equal(by.gy_s1.combat.mp,3);assert.equal(by.gy_p1.combat.mp,0);
 const anchors=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/design/martial-review/balance/budget.json'))).anchors;
 for(const r of skills)for(const a of anchors)for(const level of [1,r.combat.max_level])for(let bp=0;bp<4;bp++){const v=model.estimate(r,{attack:a.attack,wisdom:6,max_mp:a.mp},{defense:a.enemy_defense,max_hp:a.hp,hp:0},{level,bp});assert(Number.isFinite(v.damage)&&Number.isFinite(v.heal));assert(v.damage>=0&&v.heal>=0);}
 assert.throws(()=>model.estimate(by.gy_s1,{}, {},{level:4}));assert.throws(()=>model.estimate(by.gy_s2,{}, {},{bp:4}));
});
