# 2026-10-16 人物动作与多武器设计收尾

## 请求与范围

承接用户对主角过于像NPC、身体需适配正式剑及多武器的意见；先纠正偏离文档的手绘风格，再按获批像素方向完成本轮动作和入城前角色工作。范围是归云主角、卢小豆、方迟、钟拙、周砚、裴知古；剧情止于汉皋南门，城内按后续计划；周砚先不配音。

工作区xiaojianghu-legacy-prologue，启动器与`--check`确认8792 / qihe-current / m_qh_central。核对文档：AI导入、当前工作区AGENTS、素材登记与弃用清单、战斗精灵规格、主角多武器负责页、人物动作合同、小豆、入城前接入合同、普攻接触/功法原位表现边界。

## 制作、采用与行为

- 主角五类武器、六套外观共96帧：钢剑、木剑、拳掌、刀、棍、暗器，每套16帧。待机、移步、两种普通出手、原位施放/防御、受击、破势、倒地、胜利完整映射。钢剑/木剑外形与节奏分开；刀、棍、拳、暗器各自全身发力。
- 五位人物112帧：小豆32、方迟16、钟拙20、周砚24、知古20。年龄与身体比例区分；有教习叫停与四项知古原位辅助手势。NPC第二攻击表为备用普通出手，当前功法不借此恢复近身接触。
- 六套主角提供身体/武器区域/握持遮挡三层，共18张PNG图集与96帧元数据。使用已有image_gen去武器补全源，固定相机登记；棍跪姿遮罩扩大以清掉孤立杆端。96帧可见RGBA重合检查通过。运行用烘焙WebP，编辑源不是完整分肢骨骼人偶。
- 短发6、半长发6、长发8，共20个无固定兵器培养对白状态；既有Q版保持，避免缺剑或钢剑装备仍背木剑。
- 真装备决定动作包；借剑返还不误删后来获得的兵器，拳掌施放临时选空手身体并在错误后恢复。没有把直接状态选择冒充连续入鞘/拔剑动画。未制作的枪形制不再静默套棍包。
- 实际BP决定结算次数，暗器释放后飞行180ms才结算，倒地取消剩余攻击。当前功法原位短施放；无新增功法或自行生成新特效。
- 完成教学叫停/收招、知古加入与见闻、书册辅助行动边界；修正零攻击倍率被`||`覆盖、辅助技能目标预览空值崩溃、战斗生活技能按钮遮挡自动按钮等问题。
- 叶蘅36、知古43，共79条有效新对白；纯省略号的0.001469秒文件退出运行登记，80个原始文件全留。周砚未绑定音色。语音校验包含解码/时长与运行行为，未声称逐句人工完整听审。

正式图与登记：production-assets.json、production-assets.md、production-assets.js、运行引用和批次adoption一致。三批manifest记录实际尺寸、SHA、参考与完整提示词。请求模型gpt-image-2.5；内置工具未披露实际后端。20261013非像素手绘稿仍撤回，初版体态不符/动作差异不足的源不采用，原件保留。

## 可检查的交付

[动作总览](http://127.0.0.1:8792/review/character-completion-20261014/)有113条动作映射、逐帧名称/时长、接触/释放点、镜像、暂停、分层开关、素材下载和独立实机链接。旧hero-multiweapon-design-20261013入口转到完成页，像素校准旧页保留为pixel-calibration-history.html。

- [主角批次](../../art_sources/hero-multiweapon-production-20261014/README.md)
- [人物与语音批次](../../art_sources/guiyun-battle-finish-20261014/README.md)
- [无剑对白批次](../../art_sources/hero-unarmed-dialogue-20261014/README.md)
- [主角设计负责页](../../../xiaojianghu/docs/design/combat-characters/xiaobai-multiweapon.md)
- [完整编辑源ZIP](../../art_sources/hero-multiweapon-production-20261014/hero-layered-source.zip)

## 验证与证据

| 验证 | 结果 / 边界 |
|---|---|
| Node战斗/剧情回归 | 33/33通过；hero-multiweapon、pre-hangao、dou-sword、hero-staff、battle-auto、battle-error、guiyun-performance、character-growth、shared-insight、pei-battle-bridge。日志在人物批次regression-output-20261016.txt |
| 旧棍测试校正 | 初次32/33，唯一失败是旧测试仍要求功法身体三接触；依据10月14日现行原位边界修正，普攻三触点断言保留。复跑33/33 |
| 语音导出 | Python增量导出4/4；dialogue voice运行校验通过；79条ffprobe有效 |
| 像素和编辑源 | 11图集208帧，32色上限、硬alpha、精确3倍；18图层与96帧逐像素重合，ZIP无损；20张对白尺寸/alpha通过。evidence/integrity.json |
| 逐项原生UI | 11个外观的113条动作选择、逐帧卡数量与时序全部匹配；390/1280/1920无横向溢出，三个发型6/6/8。evidence/action-ui.json与layout-portraits.json |
| 装备实战 | 六种装备均有真实浏览器胜负/接触/投射记录；本次又从正式钢剑入口选招并完成对练，控制台无错误，steel-win.png |
| 当前功法边界 | 真实UI选试锋探路，施放开始至收势62次采样均在[700,430]，cast/idle，无dashTo/hopBack等调用；MP105→102，目标真实掉血。选单时前探30px在起势前回到本位，不计为技能冲刺。native-sword-skill.json |
| 教学与辅助 | attack→叫停→guard得steady，HP/MP/经验/装备恢复、师父存活；指瑕消耗4MP、只揭示剑弱点、不扣血不削盾。人物批次browser/teacher-training.json、pei-cast.json |
| 剧情与读档 | 无外功/休息路线真实UI走到五月南门，六场新增各一次，知古真实加入并记录一次见闻；刷新阶段/事件/见闻保持。browser/pre-gate-ui.json、gate-reload.json等 |
| 正式登记 | python3 tools_assets/check_production.py通过，1091项、errors空；启动器身份核验通过 |

浏览器证据和函数测试分开：本轮没有将全部剧情支线逐条实机跑完，也没有全量游玩城内及六月返谷。兼容性与更多路线由函数/状态检查覆盖。姿势共享的cast/guard不重复算独立帧；未来重刀、长枪、软剑与高阶复杂功法身体动作不在208帧完成数量里。

本轮范围本地完成；未Git add/commit/push，未线上发布。未接触远端只读测试环境。
