'use strict';
// 界面等比缩放（2026-10-17 试玩反馈：大屏界面变小、小屏界面变大）。
// 做法同 Unity CanvasScaler「随屏幕尺寸缩放」：以游戏区宽 1280 为设计基准，界面层统一 zoom = 实际宽 / 1280。
// 画布 #cv、载入层、黑场与培养模式界面（自身已按 cqw 比例排版）不参与，见 index.html 的 #game>:not(...) 规则。
(()=>{
 const BASE=1280,MIN=.62,MAX=2.4,game=document.getElementById('game');if(!game)return;
 const apply=()=>{const w=game.getBoundingClientRect().width;if(!w)return;const z=Math.min(MAX,Math.max(MIN,w/BASE));game.style.setProperty('--ui-zoom',z.toFixed(4));};
 apply();if(window.ResizeObserver)new ResizeObserver(apply).observe(game);else addEventListener('resize',apply);
 window.UIScale={get zoom(){return parseFloat(getComputedStyle(game).getPropertyValue('--ui-zoom'))||1},base:BASE};
})();
