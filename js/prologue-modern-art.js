'use strict';
/* PI-2026-10-04.2: fixed modern opening costume; deliberately no walk/run registration. */
(()=>{
 const modern={file:'s_opening_hero_modern',cell:[72,141],cols:4,rows:'dlru',motion:'fixed',footY:138};
 const wilddog={file:'s_prologue_wilddog_v1',cell:[144,102],cols:1,rows:1,facing:'r',motion:'fixed',footY:96};
 const battle={"file":"b_hero_modern_hd_20261017","cell":[480,324],"cols":16,"px":[240,162],"body":94,"h":324,"tier":"party","facing":"l","anchor":[240,304],"anim":{"idle":{"f":[0,1,0],"ms":[380,420,380],"loop":true},"dash":{"f":[2,3],"ms":[90,120]},"atk":{"f":[4,5,6,7],"ms":[150,70,170,130],"hit":1},"atk2":{"f":[8,9,10],"ms":[80,70,150],"hit":1},"hurt":{"f":[12],"ms":320},"cast":{"f":[11],"ms":[520]},"brk":{"f":[13],"ms":[840],"loop":true},"dead":{"f":[12,13,14],"ms":[140,160,400]},"win":{"f":[15],"ms":[920]}},"frames":["guard","guard-breath","dash-a","dash-b","wind","strike","follow","back","chamber","jab","recover","block","hurt","kneel","dead","win"],"pixelScale":2,"horizontal_safety_padding":3};
 BART.hero_modern=battle;
 const meta=window.OPENING_CHARACTER_ART;
 if(meta){
  meta.sprites.hero_modern=modern;
  meta.battle.hero_modern=battle;
  meta.avatars.hero_modern='a_opening_hero_modern';
 }
 ART.sheet.opening_hero_modern=modern.cell;
 ART.frames.opening_hero_modern=4;
 ART.scale.opening_hero_modern=1;
 if(!CHARS.includes('opening_hero_modern'))CHARS.push('opening_hero_modern');
 const assets=[modern.file,wilddog.file,battle.file,'a_opening_hero_modern','p_opening_hero_modern',
  'p_opening_hero_modern_guard',...['smile','worry','firm','surprise','hurt'].map(e=>'p_opening_hero_modern_'+e)];
 for(const key of assets)if(!ASSETS.includes(key))ASSETS.push(key);
 window.PROLOGUE_MODERN_ART={contract:'PI-2026-10-04.2',modern,wilddog,battle,walk:false};
})();
