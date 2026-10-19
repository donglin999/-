# 战斗语音台本与后台扩充

用户要求先设计再沿已确认音色补齐战斗短句。核对voice-current-cast、voice-runtime、voice-backend、voice-emotion及game-voice-casting技能；共享后台制作，运行接入8792分支。

新增battle-voice设计、逐句台本与独立JSON：25人200句。已确认10人80句完成；未确认15人120句等待选音。原有16个绑定未改变；制作期间后台新增柳含烟确认，自动生成8句后入本批，未替用户绑定。全部原有对白和108条选音示例保留。

后台允许明确登记的参战NPC独立拥有battle语句，其普通识别对白仍限一句。新增no-auto-previews参数可只开制作队列，不生成无关试听。两页新增战斗筛选/事件名；单句页修正文案，确认框说明额外战斗数量。普通equip_voices排除战斗，export_battle_voices显式指定运行目录并只收有效真实已确认成品。

验证：后台39项、普通导出3项、战斗导出2项通过。80条音频技术检查通过；独眼阎罗一条攻击初版削波后修订2补录；7条超过表演时长目标但低于硬上限，听感待复核。旧voice-admin脚本缺失本机临时Playwright依赖，未声称通过；CUA实测筛选8条战斗成品和试听。完整运行证据在../xiaojianghu-legacy-prologue/art_sources/battle-voice-20261006，运行更新记录在该工作区docs/updates同名文件。

本地完成，未Git提交/推送/线上发布。没有复制密钥或后台私密状态进素材包。
