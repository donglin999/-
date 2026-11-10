#!/bin/zsh
# 其余六人按 A 法各出两张（并行）
cd /Users/wuxiuxiang/project/luotuozhuan/xiaojianghu
T=../xiaojianghu-godot/docs/review/menu-figure-trial-v1
for k in hero-village hero-modern hero-guiyun ye suzhi censhuang; do for n in 1 2; do
  python3 tools_common/imggen.py --prompt-file $T/$k-A.txt --out $T/raw/$k-A$n.png --ref $T/refs/$k-placed.png --ref $T/refs/ref-page-bg.png --size 1280x1072 --background opaque > $T/raw/$k-A$n.log 2>&1 &
done; done
wait; echo done
