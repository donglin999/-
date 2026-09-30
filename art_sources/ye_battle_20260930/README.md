# 叶蘅战斗动作表来源

生成日期：2026-09-30。所有原图由 Codex 内置 imagegen 生成，无项目生图接口调用。`model.png` 以 `assets/p_ye.webp` 为身份参考，以苏芷战斗帧为像素风格参考。其余四张网格以 `model.png` 为身份参考，均指定左向全身六头身、米白短袍、灰色内衫与裙、浅色束发带、棕色斜挎针囊，纯品红背景，禁止文字、额外人物和场景。

第二轮独立验收指出 1280 画面下脸、衣领被细黑纹淹没。`base.png`、`attack.png`、`move.png`、`down.png` 是内置 imagegen 对首稿的定向编辑成品；编辑时保持网格与动作，要求扩大连续浅肤色脸块、明显眼点和脸颊高光、发束/脸/浅带分层、亮色短袍与灰色 V 领分层，并删除微小黑色交叉纹。首稿留在本机忽略目录 `raw_anim/ye_v1/` 作过程对照，不参与打包。

| 原图 | 布局和动作 | 原始生成提示词的核心约束 |
| --- | --- | --- |
| `model.png` | 单人定妆 | Ye Heng; realistic six-head proportions; left-facing side profile; cream-and-gray short robe; tied hair with pale ribbon; cross-body herbal satchel; isolated crisp pixel-art full body. |
| `base.png` | 2×2：guard、hurt、cast、win | Four full-body images of the same Ye Heng, same scale and costume, equal cells; flat `#FF00FF` background; no glow, text or terrain. |
| `attack.png` | 2×2：wind、strike、follow、back | Rearward needle preparation; forward needle throw; low follow-through; guard recovery. Same face, proportions, ribbon, satchel and palette across four cells. |
| `move.png` | 2×2：dash0、dash1、chamber、thrust | Two running stride phases, needle withdrawal at waist, low needle lunge. Left-facing side profile, complete legs, same scale and sharpness. |
| `down.png` | 1×2：kneel、dead | One weak kneel and one horizontal prone defeat pose. Same identity, complete body, flat `#FF00FF` background. |

Each sheet requested clean dark one-art-pixel outlines, a limited cream/gray/brown palette, upper-left light, crisp 16-bit pixel clusters, and no painterly blur or chibi proportions. The project-local packing script `tools_fx/ye_battle/pack.py` keys out magenta, aligns each pose to the shared foot baseline, quantizes a shared 32-color clothing palette, then preserves the source face's five lighting levels plus an eye pixel after reduction so the final 1× face remains readable without becoming a flat skin block. The finished sheet has 38 opaque RGB colors. It generates six one-pixel motion variants and packs a lossless 3× WebP sheet. Run `python3 tools_fx/ye_battle/pack.py` from the game root to rebuild `assets/b_ye.webp` and `review/battle_ye/{compare,all20}.png`.

The 20-frame sheet includes fourteen distinct generated poses and six derived breathing/lean variants. The generated poses are not hand-corrected per joint; animation timing follows the existing party action contract.

最终验收表：单元 396×210、20 帧、3×硬像素、二值 alpha；站姿脚底在单元最后一行 y=209，与主角、苏芷动作表对齐。2026-09-30 第四轮独立验收通过的 `assets/b_ye.webp` SHA256 为 `45acd205682c3608e2c1abed006cc9afc7d7ccd570417d5706371ca44633aacc`。
