'use strict';
// 代码驱动探索原帧的局部姿态，人物身份、脚点、像素密度保持不变。
const NPC_GESTURE_MS={inquire:760,persuade:850,steal:900,inspect:900,spar:820,success:380,fail:360};
const NPCGesture={state:null,
  clear(){this.state=null},
  async play(id,n,outcome){const scene=cur,hero=player,start=performance.now(),duration=NPC_GESTURE_MS[outcome||id]||700;
    const token={id,n,outcome,start,duration,scene,hero};this.state=token;bubbles.length=0;
    hero.path=null;hero.goal=null;hero.vx=hero.vy=0;hero.walk=0;hero.moving=false;hero.running=false;
    hero.dir=faceTo(n.x*TS-hero.x,n.y*TS-hero.y);
    window.__audio?.sfx('arts_'+(outcome||id),.7);
    try{await wait(duration)}finally{if(this.state===token)this.clear()}
  },
  draw(original,sp,x,y,dir,walk,t,opts){const a=this.state;
    if(!a||a.scene!==cur||a.hero!==player||mode!=='scene'||spKey(sp)!=='hero'||x!==player.x||y!==player.y){original(sp,x,y,dir,walk,t,opts);return}
    const k=clamp((performance.now()-a.start)/a.duration,0,1),p=Math.sin(Math.PI*k),h=opts.h||charH('hero'),side=dir==='r'?1:dir==='l'?-1:0;
    // 脚、腿和影子使用原脚点；仅上半身在髋部弯腰/倾听，避免整个人腾空或滑动。
    const split=y-h*.38,tilt=a.outcome?(a.outcome==='fail'?-1:1)*p*.025:
      a.id==='inspect'||a.id==='steal'?p*.11:a.id==='spar'?p*.07:p*.035;
    g.save();g.beginPath();g.rect(x-h,split,h*2,h);g.clip();original(sp,x,y,dir,0,t,{...opts,moving:false,running:false});g.restore();
    g.save();g.beginPath();g.rect(x-h*1.2,y-h*1.3,h*2.4,split-(y-h*1.3));g.clip();
    g.translate(x,split);g.transform(1,0,(side||.25)*tilt,1,0,p*(a.id==='inspect'?h*.035:0));g.translate(-x,-split);
    original(sp,x,y,dir,0,t,{...opts,moving:false,running:false});g.restore();
    if(!a.outcome){
      // 连接肩、肘、腕的像素袖/手，不复用孤立的手掌图；步幅/身高均与探索原帧一致。
      const reach=a.id==='steal'?p*h*.23:a.id==='persuade'?p*h*.19:a.id==='inspect'?p*h*.08:a.id==='spar'?-p*h*.08:p*h*.04;
      const unit=2*h/92,snap=v=>Math.round(v/unit)*unit;
      const shoulder={x:x+(side||1)*h*.12,y:y-h*.58},wrist={x:shoulder.x+(side||1)*reach,y:shoulder.y+p*h*(a.id==='inquire'?-.20:a.id==='steal'?.10:a.id==='inspect'?.08:a.id==='spar'?.04:-.03)};
      const elbow={x:(shoulder.x+wrist.x)/2,y:shoulder.y+h*.07};
      g.save();g.lineCap='square';g.lineJoin='miter';g.strokeStyle='#30292d';g.lineWidth=unit*4;g.beginPath();g.moveTo(snap(shoulder.x),snap(shoulder.y));g.lineTo(snap(elbow.x),snap(elbow.y));g.lineTo(snap(wrist.x),snap(wrist.y));g.stroke();
      g.strokeStyle='#57454b';g.lineWidth=unit*2;g.stroke();g.fillStyle='#bfa08a';g.fillRect(snap(wrist.x)-unit,snap(wrist.y)-unit,unit*2,unit*2);
      if(a.id==='spar'){g.fillStyle='#a18b72';g.fillRect(snap(wrist.x)-unit*2,snap(wrist.y),unit*2,unit*2)}
      if(a.id==='inspect'){g.fillStyle='#d4c196';g.fillRect(snap(wrist.x),snap(wrist.y)+unit*2,unit*4,unit*3);g.fillStyle='#6f6045';g.fillRect(snap(wrist.x)+unit,snap(wrist.y)+unit*3,unit*2,unit)}
      g.restore();
    }
    // 图标仅提示行动；动作主体由上述角色姿态表达，结局字印有自己色彩。
    g.save();g.globalAlpha=Math.min(1,p*2);g.font='16px var(--serif),serif';g.textAlign='center';g.fillStyle=a.outcome==='fail'?'#e8a48b':'#f0d59c';g.strokeStyle='#17110d';g.lineWidth=3;
    const title=a.outcome?(a.outcome==='success'?'成':'止'):NPC_ARTS[a.id].name;
    g.strokeText(title,x,y-h-10);g.fillText(title,x,y-h-10);g.restore();
  }
};
{const original=drawChar;drawChar=function(sp,x,y,dir='d',walk=0,t=0,opts={}){NPCGesture.draw(original,sp,x,y,dir,walk,t,opts)}}

// 动作期间收起闲聊气泡，避免与动作提示重叠。
{const original=npcIdleFx;npcIdleFx=function(){if(!NPCGesture.state)return original.apply(this,arguments)}}
