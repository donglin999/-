'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const C=require('../js/qh-mode-cultivation-core'),G=require('../js/qh-mode-cultivation-growth'),D=require('../js/qh-mode-cultivation-data'),V=require('../js/qh-mode-cultivation-visitors'),R=require('../js/qh-mode-cultivation-relations');
const PH=require('../js/qh-pre-hangao');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'../../xiaojianghu/docs/design/scripts/chapter-two-dialogue.json')));
const ready=()=>{const s=C.initial();C.join(s);s.learned.stance={source:'B03',period:0};s.month=6;return s;};
function action(s,id){C.start(s,id);return C.resolve(s,0,{directResult:true});}
// The old numerical assertions were superseded by CH2-BALANCE-2. Keep the
// authored dialogue/cast audit here; current growth and migration have their own tests.
const s=ready();s.mood=50;s.progress.observation=170;const r=action(s,'B06');assert.equal(s.progress.observation,230);assert.equal(r.gain,60);assert.equal(C.resolve(s,0),r);
const breath=ready();action(breath,'B01');const w={cultivation:breath,skills:{fist:1}};C.reconcileWorld(w);assert.deepEqual(w.xinfa.known,['tuna']);assert.equal(w.xinfa.lv.tuna,1);
let contexts=0,verified=0;const missing=[];
for(const adult of [false,true])for(const score of [0,100])for(const injury of ['light','rest','unknown'])for(const delivery of [null,'guided_footwork','assisted_carry','asked_for_guidance'])for(let skills=0;skills<8;skills++){
 const ci=contexts++,c={adult,rel:{yin:score,ye:score,pei:score,shimu:score},yinScore:score,major:skills&2?'sword':'fist',footwork:!!(skills&4),fist:!!(skills&1),sword:!!(skills&2),delivery,learned:{fist:!!(skills&1),sword:!!(skills&2),footwork:!!(skills&4)},opening:{chen_injury:injury},first_delivery:{method:delivery},facts:{}};
 for(const d of V.all()){const x=V.script(d.id,c);for(const[phase,ls]of [['intro',x.intro],...x.choices.map(ch=>['choice:'+ch.key,ch.lines]),['closing',x.closing]])for(const[index,l]of ls.entries()){
  if(PH.has(d.id)){const authored=source.preHangao.scenes.find(s=>s.id===d.id);const allowed=[...authored.opening,...authored.ending,...authored.choices.flatMap(c=>c.lines),...(authored.productionChoices||[]).flatMap(c=>c.lines),...(authored.letters||[])].map(b=>b.text);assert.ok(allowed.includes(l.text),d.id+' unauthored line');assert.ok(['title','narrator'].includes(l.speaker)||(l.cast||d.cast).includes(l.speaker));verified++;continue;}
  const expected=source.lines.find(r=>r.event===d.id&&r.phase===phase&&r.index===index&&r.speaker===l.speaker&&r.contextIndices.includes(ci));
  if(!expected)missing.push({id:d.id,phase,index});else assert.equal(l.text,expected.text,expected.id);
  assert.ok(['title','narrator'].includes(l.speaker)||(l.cast||d.cast).includes(l.speaker),d.id+' absent speaker');assert.ok(!l.text.includes('归云心法'));verified++;
 }}
}
assert.deepEqual(missing,[]);assert.equal(contexts,384);for(const l of source.correspondence)assert.equal(l.field==='gifts'?R.profiles[l.name].gifts[l.gift]:R.profiles[l.name][l.field],l.text);
const report={status:'pass',scenes:V.all().length,contexts,verified_lines:verified,authored_lines:source.lines.length,checks:['CH2-BALANCE-2 actual result and idempotence','inner teaching required','all authored conditional dialogue and speaker presence','all correspondence applied']};
const out=path.join(__dirname,'../review/cultivation-rework-20261012');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'core-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
