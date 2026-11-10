# 开发方法总结（给别的游戏参考）

状态：现行　最后核对：2026-11-01

## 需求原话

“帮我总结一下整个游戏的一些开发思路和 skills 、文案审核、图片动作生成等等，然后上传一下到这个仓库 https://github.com/donglin999/gameArchitecture.git，你先总结一下给我看看先，我需要在别的游戏里面参考类似的开发思路，不用重新造轮子”。

## 改了什么

- 新增 [开发方法总结](../dev-methods-summary.md)：按“解决什么问题、怎么做、换游戏要改什么”组织，分通用和专属，末尾附拟上传清单。
- 没有改规则、代码、素材和剧本，也没碰场景重画的改动。

## 核对过的文件

规则登记表、导入引导、3 个 skill、剧情规范与反例库、`story_lint.py`、演员法与逻辑初筛脚本、`build_ink.cjs`、剧情迁移方案第 8 节、`check_story_hooks.cjs`、美术与动作管线、`imggen.py`、生图源登记、特效流程、后期脚本、两份动作更新记录、11-01 场景排查记录、地图规范、评审台流程和两个检查脚本、`check_production.py`、`verify_scene_reach.cjs`、发布构建脚本、子任务分流。

## 验证

- `gh repo view` 只读查询目标仓库：空仓库、私有、无默认分支。
- 对 30 个候选文件扫描密钥、邮箱、本机路径、人物名，只统计不输出内容：密钥 0、邮箱 0、本机路径 1（已列为改写成模板）。
- `check_docs.py` 结果见改动清单对应条目。

## 未做与待拍板

- 未上传，也没 clone：等用户看过总结点头。脱敏副本在点头后才做，届时还要在副本上重新扫描。

## 第二轮：定旧路线（2026-11-01）

用户：“把你这两个问题确定了，按照现在用的路线替换了旧的，不要上传舍弃的旧信息”。

- 规则（用户本轮批准）：R-剧情-01 默认模型改成 302 的 claude-opus-5-5；新增 R-动作-01，按动作快慢选做法，废止白模动作管线。Q 版静态立绘的姿态白模不受影响。
- 新写 `docs/anim-pipeline.md`（现行做法）；两个工作区的旧管线移到各自 `docs/archive/anim-pipeline-rig.md`；栖河那份 `anim-pipeline.md` 改成指向正文的短页。
- `battle-sprite-spec.md`（两份）、`art-pipeline.md`（两份）、`battle-assets.md`、`pets.md`、`cultivation-q-pose-diversity.md`、`character-walk-quality.md` 改了说明或链接。
- 总结删掉白模、旧模型、旧生图源的内容；上传清单补上动作脚本，并把舍弃的内容列入不传。
- 判断依据：10-23 的对比记录（普攻、快招用整组生图，慢动作用视频）和用户当时“复杂技能弃用”的答复。
- 没改：`tools_fx/rig/` 脚本还留在原处；`story-writing.md` 第六节“用 codex 起草时”和 `minimax_draft.py` 没动。

## 第三轮：上传（2026-11-01）

用户：“确认上传”。

- 推送到 donglin999/gameArchitecture 的 main，提交 541902d，33 个文件，仓库仍是私有。作者邮箱用 GitHub 的 noreply 地址。
- 上传的是临时目录里的脱敏副本：路径改配置，删人物名、地名、本机路径、旧服务商分支；三个 skill 有两个重写成通用版。`story_lint.py` 改成只读逐句总表，`check_prop_holes.py` 改读 json；验证脚本重写成模板。
- 推送前扫描密钥、邮箱、本机路径、人物名、地名、旧内容，命中 0（`codex-router.sh` 里的 `codex exec` 是现用工具，排除）。
- 试跑：`check_docs.py`（含未批准时失败）、`story_lint.py`、两个评审脚本（空数据）、`imggen.py --list`、素材检查模板通过。没实际跑：调模型、生图、视频的部分，`build_ink.cjs`，后期脚本，走通检查模板。README 写明了。
- 游戏仓库本身未提交、未发布。
