'use strict';
// Explicitly adopted sources; never replace the current map or player motion family.
(()=>{
 if(!isQiheEntry())return;
 const states={qh_xulingyi_story:['happy','sad','angry','surprise','awkward'],qh_censhuang_story:['happy','sad','angry','surprise','tease'],qh_shenyanhui_story:['happy','sad','angry','surprise','skeptical']};
 for(const key of [...Object.keys(states),'qh_chen_rest_story']){
  CHARS.push(key);ASSETS.push('s_'+key);ART.sheet[key]=[180,282];ART.frames[key]=4;ART.scale[key]=1;
  ART.motionAnchor||={};ART.motionAnchor[key]={body:246,foot:264};
 }
 // The seated figure occupies a smaller body height while retaining a grounded stool.
 ART.motionAnchor.qh_chen_rest_story={body:246,foot:264};ART.scale.qh_chen_rest_story=.78;
 for(const[key,list]of Object.entries(states)){PORTS.push(key);DIALOGUE_LEADS.add(key);EXPR[key]=list;ASSETS.push('p_'+key,...list.map(s=>'p_'+key+'_'+s));}
 const original=OpeningCharacters.dialogueSprite;
 const keysByName={徐令仪:'qh_xulingyi_story',岑霜:'qh_censhuang_story',沈雁回:'qh_shenyanhui_story'};
 OpeningCharacters.dialogueSprite=function(who,text,sp){
  const key=keysByName[who];if(!key||!OpeningCharacters.active())return original(who,text,sp);
  const explicit=sp?.split(':')[1];let mood=explicit||'neutral';
  if(text&&!explicit){
   if(/署名|我仍|我让|我核错|记我|限制.*记录|赔偿/.test(text))mood=key.includes('xulingyi')?'awkward':key.includes('shenyanhui')?'skeptical':'sad';
   else if(/收剑|不许|松手|停下|手收|先救|扣箱.*停/.test(text))mood='angry';
   else if(/附页|第十七|同一|转件|核实|验讫/.test(text))mood=key.includes('shenyanhui')?'skeptical':'neutral';
   else if(/伤者|伤处|病人|别逞强/.test(text))mood='sad';
  }
  return 'c_'+key+(mood==='neutral'?'':':'+mood);
 };
})();
