#!/bin/bash
B="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(cd "$B/../../../.." && pwd)"
cd "$ROOT/xiaojianghu"
one(){ k=$1; for t in 1 2 3; do [ -s $B/raw/$k.png ] && return; python3 tools_common/imggen.py --prompt-file $B/prompts/$k.txt --out $B/raw/$k.png --ref $B/ref-menu-bg.png --size 1024x1024 --background opaque > $B/raw/$k.log 2>&1; done; }
export -f one; export B
cat $B/$1 | xargs -P 4 -I{} bash -c 'one {}'
echo done
