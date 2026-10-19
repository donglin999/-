'use strict';
// 归云谷小师叔殷红缨：可入队、可结缘同伴的正式素材注册（来源 art_sources/guiyun-household-20261007）。
(()=>{
 if(!isQiheEntry())return;
 const key='gy_yinhongying',states=['happy','sad','angry','surprise','tease'];
 CHARS.push(key);ASSETS.push('s_'+key);ART.sheet[key]=[180,282];ART.frames[key]=4;ART.scale[key]=.85;
 ART.motionAnchor||={};ART.motionAnchor[key]={body:246,foot:264};
 PORTS.push(key);DIALOGUE_LEADS.add(key);EXPR[key]=states;ASSETS.push('p_'+key,...states.map(s=>'p_'+key+'_'+s));
 // 小师叔：剑法与回岚步身法传人；数值高于入门同伴，但不超过主线强者。
 // 萧白入谷“两月满”后的长发归云水墨对白立绘：对白、江湖菜单与队伍页随存档切换，第一章的短发立绘不变。
 const heroKey='gy_hero_long',heroStates=['firm','smile','surprise','worry','hurt'];
 PORTS.push(heroKey);DIALOGUE_LEADS.add(heroKey);EXPR[heroKey]=heroStates;ASSETS.push('p_'+heroKey,...heroStates.map(s=>'p_'+heroKey+'_'+s));
 window.GuiyunHero={longHair:()=>!!S?.cultivation?.facts?.gy_hair_long,key:heroKey};
 const ds=OpeningCharacters.dialogueSprite;OpeningCharacters.dialogueSprite=function(who,text,sp){const r=ds.call(this,who,text,sp);return window.GuiyunHero.longHair()&&/^c_opening_hero_(village|modern)/.test(r||'')?r.replace(/^c_opening_hero_(village|modern)/,'c_'+heroKey):r;};
 // 2026-10-10 对练小人（90 格像素，静态四向；来源 art_sources/guiyun-spar-sprites-20261010）：切磋与实战的对手；殷红缨的场景/战斗小人同步换成这一版。
 const spar=[{"key":"gy_fangchi","file":"s_npc_gy_fangchi_20261010","cell":[96,116],"scale":0.905434},{"key":"gy_luxiaodou","file":"s_npc_gy_luxiaodou_20261010","cell":[96,116],"scale":0.860162},{"key":"gy_zhongzhuo","file":"s_npc_gy_zhongzhuo_20261010","cell":[96,116],"scale":0.923543},{"key":"gy_yinhongying","file":"s_npc_gy_yinhongying_20261010","cell":[96,116],"scale":0.905434}];
 ART.sheetFile=ART.sheetFile||{};ART.idle=ART.idle||{};
 for(const r of spar){const k=r.key;if(!CHARS.includes(k))CHARS.push(k);if(!ASSETS.includes('s_'+k))ASSETS.push('s_'+k);ART.sheetFile['s_'+k]=r.file;ART.sheetFile['s_'+k+'_bright']=r.file;ART.sheet[k]=r.cell;ART.frames[k]=1;ART.scale[k]=r.scale;ART.motionAnchor[k]={body:90,foot:108};ART.idle[k]={frames:1,cell:r.cell,file:r.file,bright:r.file,order:[0],ms:[1000],identity_id:'guiyun-spar-'+k+'-20261010'};}
 PARTY_DEF.yinhongying={name:'殷红缨',art:[key],por:[key],st:{str:6,con:4,agi:8,wil:5,wis:5},skills:['liuye'],atkType:'剑',atkName:'软剑'};
})();
