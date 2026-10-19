#!/bin/bash
# 特效截图自查：渲染某招某一时刻的一帧（带背景和角色），输出 PNG。
# 用法：tools_fx/fx_shot.sh 招式id 毫秒 输出.png [目标数，群体招填 3]
set -e
BASE="${FX_BASE:-http://127.0.0.1:8797}"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --no-first-run --hide-scrollbars --user-data-dir="$(mktemp -d -t fxchrome)" \
  --window-size=1280,720 --virtual-time-budget=20000 --screenshot="$3" "$BASE/review/combat-av-v1/fxmetrics.html?shot=$1&t=$2&group=${4:-0}" 2>/dev/null
echo "已保存 $3"
