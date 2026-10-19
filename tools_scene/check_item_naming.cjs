/* Current naming contract gate. Run before new item generation or integration. */
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
function validate(contract,catalog,manifest){
 const errors=[],fields=['meaning','basis','design_anchor','lore_text','status'];
 const named=(rows,scope)=>{const names=new Set();for(const x of rows){if(!x.name||names.has(x.name))errors.push(scope+': missing/duplicate name '+x.name);names.add(x.name)}};
 named(Object.values(contract.items),'runtime');named(catalog.equipment,'proposal');named(Object.values(contract.resources).map(name=>({name})),'resource');
 const current=manifest.entries.filter(x=>x.kind==='item');
 const ids=new Set(current.map(x=>x.id));
 if(ids.size!==current.length)errors.push('duplicate icon item IDs');
 for(const [id,x]of Object.entries(contract.items)){
  if(!x.description?.trim()||!x.naming?.meaning?.trim())errors.push(id+': missing description/meaning');
  const art=current.find(a=>a.id===id);if(!art||art.name!==x.name)errors.push(id+': icon name mismatch');
  if(contract.high_grade_naming_policy.grades.includes(x.grade))for(const f of fields)if(!x.naming?.[f]?.trim())errors.push(id+': missing '+f);
 }
 for(const x of current)if(!contract.items[x.id])errors.push(x.id+': icon has no current item');
 for(const id of Object.keys(contract.resources))if(!contract.resource_descriptions[id]?.trim())errors.push(id+': missing resource description');
 for(const x of catalog.equipment){
  for(const f of fields)if(!x.naming?.[f]?.trim())errors.push(x.id+': missing '+f);
  if(x.naming?.basis!==x.obtain)errors.push(x.id+': obtain/naming basis mismatch');
  if(!x.prompt.includes('对象：'+x.name+'，'))errors.push(x.id+': prompt/name mismatch');
  if(contract.high_grade_naming_policy.grades.includes(x.grade)&&x.asset_status!=='not_generated'&&x.naming?.status==='design_proposal_pending_story_review')errors.push(x.id+': high grade production requires story review');
 }
 return errors;
}
module.exports={validate};
if(require.main===module){const contract=read('docs/design/item-names.json'),catalog=read('docs/design/martial-review/catalog.json'),manifest=read('tools_scene/xiangyang_icons_v3_manifest.json');const errors=validate(contract,catalog,manifest);if(errors.length){console.error(errors.join('\n'));process.exitCode=1}else console.log(`PASS: ${Object.keys(contract.items).length} formal items, ${Object.keys(contract.resources).length} resources, ${catalog.equipment.length} equipment proposals; names, descriptions, icon mappings and high-grade meanings valid.`)}
