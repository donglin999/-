// 智能托管：只读取公开战况；通过原指令提交入口出招。
const BattleAuto={
  choose(u){
    const allies=aliveOf('ally'),foes=aliveOf('foe');if(!foes.length)return null;
    const usable=(u.skills||[]).filter(k=>SKILLS[k]&&u.mp>=(SKILLS[k].mp||0)&&!(SKILLS[k].needWeapon&&u.isHero&&u.atkType!==SKILLS[k].needWeapon));
    const maxBP=Math.min(3,u.bp||0),choices=[];
    // 救急优先；只治疗存活角色，不消耗背包药品。
    for(const k of usable){const sk=SKILLS[k],bi=BSK[k]||{};if(!sk.heal)continue;
      const groups=bi.tgt==='self'?[[u]]:bi.tgt==='allies'?[allies]:allies.map(t=>[t]);
      for(const targets of groups)for(let bp=0;bp<=maxBP;bp++){
        const emergency=targets.some(t=>t.hp/t.mhp<.45);if(!emergency)continue;
        const amount=sk.heal*(1+.15*((u.skLv?.[k]||1)-1))*(1+bp*.5);
        const gain=targets.reduce((n,t)=>n+Math.min(t.mhp-t.hp,t.mhp*amount)*(t.hp/t.mhp<.3?2:1),0);
        choices.push({kind:'skill',skill:k,targets,bp,score:1000+gain-bp*20-(sk.mp||0)*2,reason:'救急治疗'});
      }
    }
    if(choices.length)return choices.sort((a,b)=>b.score-a.score)[0];
    for(const k of [null,...usable]){const sk=k?SKILLS[k]:null,bi=k?(BSK[k]||{}):{};if(sk&&(sk.heal||bi.buff))continue;
      const groups=bi.tgt==='foes'?[foes]:foes.map(t=>[t]);
      for(const targets of groups)for(let bp=0;bp<=maxBP;bp++){
        const v=k?skillPv(u,k,bp):{t:u.atkType,pow:1,hits:1+bp};if(!v)continue;
        let score=0,breaking=false;
        for(const t of targets){const damage=estDmg(u,t,v)*v.hits;
          score+=Math.min(t.hp,damage);if(damage>=t.hp)score+=50;
          const known=hitsWeak(t,v);if(known&&!t.broken){const shields=Math.min(t.shield,v.hits);score+=shields*22;
            if(v.hits>=t.shield){score+=85+(t.charging||t.intent?.charge?60:0);breaking=true}}
          if(bi.reveal&&t.known.size<t.weak.length)score+=18;
        }
        // 为破势、收尾或破势期间爆发投入 BP，其余时候积攒。
        score-=bp*(targets.some(t=>t.broken)?10:breaking?25:32)+(sk?.mp||0)*2;
        choices.push({kind:k?'skill':'attack',skill:k,targets,bp,score,reason:breaking?'弱点破势':targets.some(t=>t.broken)?'破势追击':targets.length>1?'群攻压制':'集中攻击'});
      }
    }
    return choices.sort((a,b)=>b.score-a.score)[0]||null;
  },
  sync(){const btn=$('bt-auto');if(!btn)return;btn.hidden=!B||B.round<1||B.ended;
    btn.setAttribute('aria-pressed',String(!!B?.auto));btn.classList.toggle('on',!!B?.auto);
    btn.textContent=B?.auto?'暂停自动 · 手动接管':'智能自动战斗';
  },
  toggle(){if(!B||B.ended||B.round<1)return;B.auto=!B.auto;
    if(B.auto)B.autoPending?.();else{clearTimeout(B.autoTimer);B.autoTimer=null}this.sync();
  },
  bind(u,submit,onError){const state=B;state.autoPending=()=>{clearTimeout(state.autoTimer);
      state.autoTimer=setTimeout(()=>{state.autoTimer=null;if(B!==state||!state.auto||state.ended||state.cur!==u||state.autoPending!==request)return;
        try{const action=this.choose(u);if(action){hint('自动 · '+action.reason);submit(action)}}catch(e){this.clear();onError(e)}},450)};
    const request=state.autoPending;this.sync();if(state.auto)request();
  },
  clear(){if(!B)return;clearTimeout(B.autoTimer);B.autoTimer=null;B.autoPending=null},
  finish(){if(!B)return;this.clear();B.auto=false;B.ended=true;this.sync()}
};
{const original=battleDom;battleDom=function(){const el=original();if(!$('bt-auto')){
  const btn=document.createElement('button');btn.id='bt-auto';btn.type='button';btn.hidden=true;
  btn.title='优先救急治疗、已知弱点破势和残血收尾；自动选择武学与蓄势，不使用背包药品、不逃跑。暂停后下一次行动由你操作。';
  btn.onpointerdown=e=>e.stopPropagation();btn.onclick=e=>{e.stopPropagation();BattleAuto.toggle()};el.appendChild(btn);
  const st=document.createElement('style');st.textContent=`#bt-auto{position:absolute;right:44px;bottom:18px;pointer-events:auto;min-width:150px;padding:9px 16px;color:#e9d8b4;border:1px solid #967746;background:linear-gradient(135deg,rgba(30,23,16,.96),rgba(8,8,12,.92));box-shadow:inset 0 0 0 2px #30281d,0 3px 12px #0008;font:16px var(--serif);letter-spacing:.08em;cursor:pointer}#bt-auto:hover{border-color:#eac582;color:#ffe5ad}#bt-auto.on{color:#ffe1a0;border-color:#d9ac57;background:linear-gradient(135deg,#50351deb,#1c1714f5)}#bt-auto:focus-visible{outline:2px solid #ffe1a0;outline-offset:3px}#bt-auto[hidden]{display:none}`;document.head.appendChild(st)}return el}}
