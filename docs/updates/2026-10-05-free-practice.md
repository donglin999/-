# 当前阶段自由培养

用户确认：现阶段暂不考虑体力，避免可交互内容过少。

## 当前规则与实现

- 工作区`xiaojianghu-legacy-prologue`，正式本地入口8792 / `#qihe-map`。
- 先更新[培养现阶段调整](../design/qihe-map/expansion/training.md)，同步[实施记录](../design/qihe-map/expansion/implementation.md)。核对项目协作规则、设计目录、正式素材清单与上轮三次鼠标验收记录。
- 山居首期基本功、已学棍法、医案与扫院取消体力门槛及扣除；可以重复确认，正常获得成长并保存结算历史。取消不结算。
- 菜单、HUD和结果移除体力数字，不再弹出耗尽体力后的完成提示。旧0体力存档无需重开或重置，即可继续。
- `CultivationCore`以调用选项`waiveEnergy`实现0成本；当前章节显式传入，其他未使用此选项的调用仍走原成本规则。前置指导、材料和一次性奖励检查保持各自规则。
- `index.html`更新实际修改的两个脚本版本参数；无素材采用、替换或弃用。完整后续月份仍未开放，本次不增加月份剧情。

## 验证

- `node tools_scene/qihe/verify_chapter.cjs`：all-rest、all-activities、mixed、旧耗尽存档连续4次培养、中断剧情恢复全部通过。这是VM状态测试，战斗结果由测试替身提供，不冒充新的鼠标全流程验收。
- 核心专项：0体力默认调用仍提示不足，显式自由培养可结算0成本；普通调用10体力仍扣5，均通过。
- `node --check js/qihe-chapter.js`通过。
- 实际鼠标浏览器：`localhost:8792`的上轮测试存档，初始energy=0、历史3条；连续两次基本功后历史5条，新增成本均0，无未关闭pending。医案取消后仍5条、操作锁释放。刷新后菜单可再次打开，界面无体力数字，采集error日志为空。用户常用`127.0.0.1:8792`存档未操作。
- [自由培养截图](evidence/2026-10-05-three-runs/free-practice.png)。上轮三次流程的原快照仍保留，作为调整前证据。
- `python3 tools_assets/check_production.py`：pass，317项，错误0。

## 状态

本地完成并验证；本轮未Git提交、未推送、未线上部署。下一轮玩法平衡需按现行自由培养规则核对，不应擅自恢复体力限制。
