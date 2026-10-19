const assert=require('node:assert/strict'),fs=require('node:fs');
const {boot}=require('./harness.cjs');
(async()=>{const h=await boot(),{run,c}=h,checks=[];function check(name,f){f();checks.push(name)}
run("S=newState();S.chapter=1;S.qiheChapter=QiheChapter.initial();S.qiheChapter.stage='days';S.prologue={arrival:{borrowed:true}};S.skills.qh_hulu_staff=1;mnEnsure()");
check('every current skill and inner has an explicit grade',()=>assert.equal(run('Object.values(SKILLS).concat(Object.values(XINFA)).every(x=>["丁","丙","乙","甲","绝"].includes(x.grade))'),true));
check('full skill VFX audit has zero warnings',()=>assert.equal(run('VFX.audit().length'),0));
check('first chapter quality visible without save migration',()=>{assert.equal(run('mnQ("cloth")[0]'),'丁级');assert.equal(run('mnQ("mianjia")[0]'),'丙级');assert.equal(run('ITEMS.mianjia.q'),1)});
check('complete guard skill stays 丙 and is distinct from basic attack',()=>{assert.equal(run('SKILLS.qh_hulu_staff.grade'),'丙');assert.equal(run('VFX.budget("qh_hulu_staff",3,0).T.name'),'T1 入门');assert.equal(run('VFX.budget("_atk",0,0).T.name'),'T0 普攻')});
check('MP and grade caps clamp even accidental higher definition',()=>{run('FXDEF.qh_hulu_staff.tier=3');assert.equal(run('VFX.budget("qh_hulu_staff",3,3).T.name'),'T1 入门');run('FXDEF.qh_hulu_staff.tier=1')});
check('all skills stay within grade/MP bounds at every BP',()=>{for(const k of run('Object.keys(SKILLS)'))for(let bp=0;bp<=3;bp++){const v=run(`VFX.budget(${JSON.stringify(k)},SKILLS[${JSON.stringify(k)}].mp,${bp})`);assert.ok(v.s<=1);assert.ok(v.parts<=v.T.parts)}});
check('system break keeps its independent T3 budget',()=>assert.equal(run('VFX.budget("_break",0,0).T.name'),'T3 绝学'));
check('new guard cast and music hit execute on real Canvas',()=>{run('B={shake:0,units:[],allies:[],foes:[],bpUse:0,round:1};const gu={x:720,y:430,side:"ally",buffs:{}},gt={x:300,y:430,side:"foe",buffs:{}};VFX.reset();VFX.cast(gu,"qh_hulu_staff",[gt],0);VFX.hit(gu,gt,"音律",null,0);VFX.draw();VFX.reset();B=null')});
check('music has own palette and battle color',()=>{assert.equal(run('!!VFX.PAL["音律"]&&!!WCOL["音律"]'),true)});
check('enemy skill omitted by previous BSK audit now registered',()=>assert.equal(run('FXDEF.fanjiang.tier'),2));
check('buff text and BP preview match actual base duration',()=>{assert.match(run('SKILLS.dingshen.desc'),/持续2回合/);assert.equal(run('QiheUIModel.skillEffects({skLv:{}},"dingshen",0).duration'),2);assert.equal(run('QiheUIModel.skillEffects({skLv:{}},"dingshen",3).duration'),5)});
const slots={cloth:'armor',club:'weapon',qh_practice_staff:'weapon',needles:'weapon',charm:'acc',knife:'weapon',mianjia:'armor',vest:'armor',jade:'acc',iron:'weapon',rusty:'weapon',wood:'weapon'};
const base=run('derived()'),equipment=[];for(const[id,slot]of Object.entries(slots)){run(`S.weapon=S.armor=S.acc=null;S[${JSON.stringify(slot)}]=${JSON.stringify(id)}`);const d=run('derived()');equipment.push({id,name:run(`ITEMS[${JSON.stringify(id)}].name`),grade:run(`mnQ(${JSON.stringify(id)})[0]`),price:run(`ITEMS[${JSON.stringify(id)}].price||null`),requirements:run(`ITEMS[${JSON.stringify(id)}].req||{}`),delta:Object.fromEntries(['mhp','mmp','atk','def','crit'].map(k=>[k,d[k]-base[k]]))});}
run("S.weapon='club';S.armor='cloth';S.acc='charm';S.hp=null;S.mp=null");const set=run('derived()');
check('starter full set actual derived values',()=>assert.deepEqual(JSON.parse(JSON.stringify({hp:set.mhp,mp:set.mmp,atk:set.atk,def:set.def})),{hp:114,mp:79,atk:24,def:15}));
check('model and battle-derived stats agree',()=>{const view=c.QiheUIModel.view('hero').derived;for(const k of ['mhp','mmp','atk','def','crit'])assert.equal(view[k],set[k])});
const foe=run('mkFoe({name:"拦路帮众",lv:1,st:{str:4,con:4,agi:3,wil:2,wis:2},hpMul:.7,atkMul:.5,shield:2,weak:["棍","暗器"]},0)');
const balance={base,starterSet:set,equipment,foe:{hp:foe.hp,atk:foe.atk,def:foe.def,shield:foe.shield},heroSingleNoCrit:{bare:Math.round(base.atk-foe.def*.5),clubWeak:Math.round((set.atk-foe.def*.5)*1.25),guardWeak:Math.round((set.atk*1.1-foe.def*.5)*1.25)},foeSingleNoCrit:{bare:Math.round(foe.atk-base.def*.5),cloth:Math.round(foe.atk-(base.def+4)*.5),fullSet:Math.round(foe.atk-set.def*.5)}};
check('starter gear lowers but does not erase road damage',()=>assert.ok(balance.foeSingleNoCrit.fullSet>=1&&balance.foeSingleNoCrit.fullSet<balance.foeSingleNoCrit.bare));
fs.mkdirSync(h.root+'/docs/updates/evidence/2026-10-06-grade-balance',{recursive:true});fs.writeFileSync(h.root+'/docs/updates/evidence/2026-10-06-grade-balance/audit.json',JSON.stringify({kind:'real engine VM; no browser or statistical playthrough claim',passed:checks.length,checks,balance},null,2)+'\n');console.log(JSON.stringify({passed:checks.length,checks,balance},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
