'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Hero=require('../js/hero-multiweapon');
const arts=JSON.parse(fs.readFileSync('art_sources/hero-multiweapon-production-20261014/battle-art.json'));
const items={wood:{name:'桃木剑',weapon:{kind:'剑'}},guiyun_wood_loan:{name:'桃木剑（归云谷借用）',weapon:{kind:'剑'}},iron:{name:'精铁剑',weapon:{kind:'剑'}},club:{weapon:{kind:'棍'}},knife:{weapon:{kind:'刀'}},needles:{weapon:{kind:'暗器'}},gloves:{weapon:{kind:'拳'}}};
test('equipment and loan material choose the body, independent of learned route',()=>{
 for(const [weapon,family]of [[null,'fist'],['wood','sword_wood'],['guiyun_wood_loan','sword_wood'],['iron','sword_steel'],['club','staff'],['knife','dao'],['needles','needle'],['gloves','fist']]){
  assert.equal(Hero.familyFor(weapon,items),family);assert.equal(Hero.artFor({weapon,cultivation:{learned:{sword:true}}},items),'gy_hero_'+family);
 }
 assert.equal(Hero.familyFor('iron',items,'拳'),'fist');assert.equal(Hero.inStage({}),false);assert.equal(Hero.inStage({cultivation:{facts:{gy_hair_long:true}}}),true);
 assert.equal(Hero.familyFor('spear',{spear:{weapon:{kind:'枪'}}}),null,'unproduced spear form cannot silently use a wooden staff');
});
test('all equipment families contain complete actual frame mappings and one resolve cue',()=>{
 assert.equal(Object.keys(arts).length,6);
 for(const a of Object.values(arts)){
  assert.equal(a.cols,16);
  for(const state of ['idle','dash','atk','atk2','cast','hurt','brk','dead','win']){const s=a.anim[state];assert(s?.f.length,state);assert(s.f.every(i=>i>=0&&i<a.cols));assert.equal(s.f.length,s.ms.length);}
  assert.notDeepEqual(a.anim.atk.f,a.anim.atk2.f);
  for(const action of ['atk','atk2']){const s=a.anim[action];if(a.weaponFamily==='needle')assert(s.projectile.flightMs>0);else assert.equal(s.contacts.filter(c=>c.resolve).length,1);}
 }
});
function engine(art){let clock=0;const impacts=[],flights=[];const context={console,document:{createElement:()=>({getContext:()=>({})})},BART:arts,IMG:Object.fromEntries(Object.values(arts).map(a=>[a.file,{}])),ok:()=>true,
 BT:{now:()=>clock},performance:{now:()=>clock},VFX:{btWait:async ms=>{assert(ms>=0);clock+=ms},overlay(){},touch(){},hit(u,t){impacts.push({time:clock,age:clock-u.anim.t0,action:u.anim.k,hp:t.hp})},cast:async()=>{},needleFlight(hand,t,ms){flights.push({time:clock,ms,hand})},needleImpact(t){impacts.push({time:clock,hp:t.hp})}},
 unitH:()=>105,battleBodyBounds:()=>({height:192,bottom:300}),bsfx(){},floatTxt(){},showName(){},renderCards(){},wait:async()=>{},chance:()=>false,rnd:(a,b)=>(a+b)/2,B:{shake:0,parts:[],round:1},SKILLS:{},BSK:{},strike(u,t){t.hp-=10;t.shield--;}};
 context.window=context;const c=vm.createContext(context);vm.runInContext(fs.readFileSync('js/bfx.js','utf8')+'\nglobalThis.engine=BFXI;',c);
 const u={art,x:640,y:350,side:'ally',isHero:true,hp:120,mhp:120,id:1,atkType:'剑',atkName:'试用',atk:10,buffs:{},mp:40,skLv:{}};
 const t={x:320,y:350,side:'foe',hp:100,shield:8,def:0,id:2,buffs:{},weak:[],known:new Set()};c.u=u;c.t=t;return{c,u,t,impacts,flights};
}
test('real BFX sequence resolves 1+BP times, at contact or after projectile travel',async()=>{
 for(const art of Object.keys(arts)){
  const {c,u,t,impacts,flights}=engine(art);await vm.runInContext('doAttack(u,t,2)',c);
  assert.equal(t.hp,70,art);assert.equal(t.shield,5,art);assert.equal(impacts.length,3,art);
  if(art.endsWith('needle')){assert.equal(flights.length,3);for(let i=0;i<3;i++)assert.equal(impacts[i].time-flights[i].time,180);}
  else for(const hit of impacts){const s=arts[art].anim[hit.action];assert.equal(hit.age,s.ms.slice(0,s.hit).reduce((a,b)=>a+b,0),art);}
 }
});
test('killing contact cancels remaining BP attacks without extra damage',async()=>{
 const {c,t,impacts}=engine('gy_hero_sword_steel');t.hp=10;await vm.runInContext('doAttack(u,t,3)',c);assert.equal(t.hp,0);assert.equal(impacts.length,1);assert.equal(t.shield,7);
});
test('unarmed skill switches body and restores equipped sword even if action fails',async()=>{
 const seen=[];const c={console,HeroMultiweaponArtData:arts,isQiheEntry:()=>true,BART:{},BATTLE_ADULT:new Set(),BATTLE_ADULT_RATIO:{},ASSETS:[],S:{weapon:'iron',cultivation:{facts:{gy_hair_long:true}}},ITEMS:items,IMG:{},ok:()=>true,loadOpt:async()=>{},SKILLS:{punch:{kind:'拳'}},mkHero:()=>({isHero:true,art:'hero_village'}),battle:async o=>o,doSkill:async u=>{seen.push(u.art);throw Error('fixture failure');}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('js/hero-multiweapon.js','utf8'),c);
 const u=c.mkHero();assert.equal(u.art,'gy_hero_sword_steel');await assert.rejects(c.doSkill(u,'punch',[],0),/fixture failure/);assert.deepEqual(seen,['gy_hero_fist']);assert.equal(u.art,'gy_hero_sword_steel');assert.equal(c.S.weapon,'iron');
 const options=await c.battle({guiyunHero:true,solo:true});assert.equal(options.heroArt,'gy_hero_sword_steel');
});
test('new long-hair dialogue states use weapon-free files and explicit mood aliases',()=>{
 const H=require('../js/qh-mode-cultivation-household');
 for(const mood of ['normal','smile','serious','worry','surprise','hurt','sad','sleep','angry','awkward','laugh']){const path=H.portraitFor('hero_long',mood);assert(path.includes('hero-empty/'));assert(fs.existsSync(path),path);}
 assert.notEqual(H.portraitFor('hero_long','normal'),H.portraitFor('hero_long','serious'));
});
