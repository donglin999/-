#!/bin/zsh
# 意象版：八人各出两张（并行，失败自动重试两次）
cd /Users/wuxiuxiang/project/luotuozhuan/xiaojianghu
T=../xiaojianghu-godot/docs/review/menu-figure-trial-v1
typeset -A R; R=(yinhongying yin)
gen() { local k=$1 n=$2 r=${R[$1]:-$1}
  for try in 1 2 3; do
    python3 tools_common/imggen.py --prompt-file $T/$k-I.txt --out $T/raw/$k-I$n.png --ref $T/refs/$r-placed.png --ref $T/refs/ref-page-bg.png --size 1280x1072 --background opaque > $T/raw/$k-I$n.log 2>&1 && [ -s $T/raw/$k-I$n.png ] && return 0
  done; echo "失败 $k-I$n"; }
for k in hero-village hero-modern hero-guiyun ye suzhi yinhongying peizhigu censhuang; do for n in 1 2; do gen $k $n & done; done
wait; echo 全部结束
