/* Authored shared-resource economy; every grant requires a completed game fact. */
(function(root){'use strict';
const events={rescue:[80,'栖河救援'],'evidence-v2':[80,'邻村对证'],settle:[40,'归云谷安顿'],apprenticeship:[100,'正式拜师']};
function rewards(s){const rows=[];for(const [key,name] of [['bowls','送碗'],['cloth','备布'],['medicine','送药']])if(s.prologue?.errands?.[key]==='done')rows.push({id:'errand:'+key,amount:20,name});
 for(const [key,[amount,name]]of Object.entries(events))if(s.qiheChapter?.events?.[key]===true)rows.push({id:'story:'+key,amount,name});
 const c=s.cultivation;if(c&&Number.isInteger(c.month)){const complete=c.mode==='complete'?36:Math.max(0,Math.min(35,c.month-1));const worked=new Set((c.history||[]).filter(h=>Number.isInteger(h.period)&&h.period>=0&&h.period<180).map(h=>Math.floor(h.period/5)+1));
  for(let m=1;m<=complete;m++)if(worked.has(m))rows.push({id:'month:'+m,amount:m<=12?80:m<=24?120:180,name:`修习第${m}月`});
  for(let y=1;y<=3;y++)if(complete>=y*12&&Array.from({length:12},(_,i)=>(y-1)*12+i+1).every(m=>worked.has(m)))rows.push({id:'year:'+y,amount:y*300,name:`第${y}年修习回顾`});}
 return rows;
}
function state(s){if(!s.jianghuInsight)s.jianghuInsight={version:1,balance:0,earned:0,spent:0,receipts:{},ledger:[]};const p=s.jianghuInsight;
 if(p.version!==1||!['balance','earned','spent'].every(k=>Number.isSafeInteger(p[k])&&p[k]>=0)||p.balance!==p.earned-p.spent||!p.receipts||typeof p.receipts!=='object'||Array.isArray(p.receipts)||!Array.isArray(p.ledger))throw Error('历练记录无法读取，原存档已保留');return p;}
function sync(s){const p=state(s),grants=[];for(const row of rewards(s))if(!Object.hasOwn(p.receipts,row.id)){p.receipts[row.id]=row.amount;p.balance+=row.amount;p.earned+=row.amount;p.ledger.push({...row,kind:'gain'});grants.push(row)}p.ledger=p.ledger.slice(-100);return grants;}
function debit(s,amount,detail){const p=state(s);if(!Number.isSafeInteger(amount)||amount<1||amount>p.balance)throw Error('历练不足或消耗不正确');p.balance-=amount;p.spent+=amount;p.ledger.push({kind:'spend',amount,...detail});p.ledger=p.ledger.slice(-100);}
function levelNeed(lv,exp=0){if(lv>=100)return 0;return Math.max(0,50*(100*99-lv*(lv-1))-exp);}
function levelQuote(lv,exp,balance,request){if(!Number.isSafeInteger(request)||request<1)throw Error('请输入正整数历练');const cost=Math.min(request,balance,levelNeed(lv,exp));if(!cost)throw Error(lv>=100?'已满级':'历练不足');let after=lv,remaining=exp+cost;while(after<100&&remaining>=after*100){remaining-=after*100;after++}if(after===100)remaining=0;return{cost,before:lv,after,exp:remaining,points:(after-lv)*3};}
const api={events,rewards,state,sync,debit,levelNeed,levelQuote};if(typeof module==='object'&&module.exports)module.exports=api;else root.SharedInsightPool=api;
})(typeof globalThis!=='undefined'?globalThis:this);
