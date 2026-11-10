#!/bin/bash
# 并发 3，失败重试 2 次：./run.sh queue.txt
B="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$B/../../../.." && pwd)"
cd "$ROOT/xiaojianghu"
one(){ k=$1; for t in 1 2 3; do [ -s $B/raw/$k.png ] && return; python3 tools_common/imggen.py --prompt-file $B/prompts/$k.txt --out $B/raw/$k.png --ref $B/refs/${k}_concept.png --ref $B/refs/${k}_crop.png --size 1024x1024 > $B/raw/$k.log 2>&1; done; }
export -f one; export B
cat $B/$1 | xargs -P 3 -I{} bash -c 'one {}'
echo done
