'use strict';
// Normal battle with optional guidance, no scripted flee/drive action.
window.PrologueDog={async play(){if(!window.PrologueStoryBattle)throw Error('序章战斗模块未载入');return PrologueStoryBattle.play()}};
