#!/bin/zsh
# 五位人物朝左立绘：每张一个独立请求，28 个请求同时发出；失败自动重试 2 次。只出图到 out/。
cd -- "$(dirname -- "$0")/../../.." || exit 1   # luotuozhuan 根目录
P=xiaojianghu-legacy-prologue/art_sources/facing-left-cast-20261021
one(){ local s=$1 ref=xiaojianghu-legacy-prologue/$2 i
  for i in 1 2 3; do
    python3 xiaojianghu/tools_common/imggen.py --prompt-file $P/prompts/$s.txt --out $P/out/$s.png --ref $ref --size 1024x1536 --opaque-fix >> $P/out/$s.log 2>&1 && { echo "完成 $s（第 $i 次）"; return 0; }
    echo "重试 $s（第 $i 次失败）"; sleep $((i*15))
  done; echo "失败 $s（看 out/$s.log）"; }
while read s ref; do one $s $ref & done < $P/jobs.txt
wait; echo "全部结束：$(ls $P/out/*.png 2>/dev/null | wc -l | tr -d ' ') 张"
