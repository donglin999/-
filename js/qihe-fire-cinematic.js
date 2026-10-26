'use strict';
(()=>{
 if(!isQiheEntry())return;
 const shots=Object.freeze({cen:{asset:'cg_qh_cen_night_20261014',label:'岑霜用折扇截住乌魁伸来的手腕，无直接肢体接触',maxLines:1},shen:{asset:'cg_qh_shen_night_20261014',label:'沈雁回左手扶一名老人、右手持落地长棍沿门外撤离',maxLines:1},xu:{asset:'cg_qh_xu_responsibility_v1',label:'徐令仪在院中提笔署名，撤回限制并记下本人责任',maxLines:2},ignition:{asset:'cg_qh_ignition_night_20261014',label:'浅陶油灯落上晾布，燃着的灯芯接触布边',maxLines:1},evacuation:{asset:'cg_qh_evacuation_night_20261014',label:'叶蘅带药箱沿西路离开，萧白落后半步回望',maxLines:2},relics:{asset:'cg_qh_relics_lining_v1',label:'拆开的药箱夹层里只有一张药签和一个方形空压痕，旁边摊着父亲的笔记',maxLines:2},rope:{asset:'cg_qh_backhill_rope_v4_20261026',label:'后山倒木的断木刺上挂着一截扯断的细红绳，一头是燎黑的死结，周围无人',maxLines:1}});
 async function play(id,rows){const shot=shots[id];if(!shot)throw new Error('Unknown CG shot: '+id);if(rows.length>shot.maxLines)throw new Error('CG台词超出分镜预算: '+id);const dlg=$('dlg'),old=dlg.style.zIndex,wasCinematic=document.body.classList.contains('qh-cinematic');let el;
 try{if(!shot.asset){for(const [who,text]of rows)await say(who,text);return;}const im=new Image();im.src=assetImagePath(shot.asset);await im.decode();el=document.createElement('section');el.id='qh-fire-cg';el.className='qh-fire-cg';el.dataset.shot=id;el.setAttribute('role','img');el.setAttribute('aria-label',shot.label);im.alt='';el.appendChild(im);$('game').appendChild(el);document.body.classList.add('qh-cinematic');dlg.style.zIndex='65';dlg.classList.add('qh-cg-dialogue');keys={};player.path=null;for(const [who,text]of rows)await say(who,text);
 }catch(e){if(!el){toast('火灾画面暂未加载，继续剧情。',2400);for(const [who,text]of rows)await say(who,text);}else throw e;
 }finally{el?.remove();dlg.classList.remove('qh-cg-dialogue');dlg.style.zIndex=old;if(!wasCinematic)document.body.classList.remove('qh-cinematic');}}
 window.QiheFireCinematic={play,shots};
})();
