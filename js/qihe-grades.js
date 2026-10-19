'use strict';
// 本版本品阶登记，见 docs/design/qihe-map/expansion/grade-balance.md。
// 不改存档 q 数字，不用价格/内力自动推断功法品阶。
(()=>{
 const skills={丁:['fist','jingxin','bite','lick','peck','blade','coil','palm_m','staff','sniff'],丙:['fuhu','liuye','shuaibei','bianfa','lianhua','ghost','fanjiang','jinzhen','huichun','baicao','dingshen','qh_hulu_staff'],乙:['guafeng']};
 const inner={丁:['tuna'],丙:['yq_shi','gb_shi','lm_bo','th_zuo','yy_xin','yy_zhen'],乙:['yq_xin','gb_xin','lm_xin','th_xin','bx_xin','bx_du']};
 for(const[grade,ids]of Object.entries(skills))for(const id of ids)if(SKILLS[id])SKILLS[id].grade=grade;
 for(const[grade,ids]of Object.entries(inner))for(const id of ids)if(XINFA[id])XINFA[id].grade=grade;
// 清理旧网格战斗措辞，不改现有 ID 或正式图标。
 Object.assign(SKILLS.fuhu,{desc:'单体两段拳击，兼具阳性内劲；每段命中弱点均可削盾。BP增加段数。'});
 Object.assign(SKILLS.liuye,{desc:'柳叶般的剑势扫向全体敌人，需装备剑；BP提高本次伤害。'});
 Object.assign(SKILLS.bianfa,{desc:'棍劲带鞭影扫向全体敌人；BP提高本次伤害。'});
 Object.assign(SKILLS.lianhua,{desc:'单体毒性掌击；目标存活时中毒3次行动，每次损失气血上限的6%。'});
 Object.assign(SKILLS.guafeng,{desc:'风雷腿势扫向全体敌人；BP提高本次伤害。'});
})();
