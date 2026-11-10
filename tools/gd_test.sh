#!/bin/bash
# GdUnit4 自动测试（2026-11-05 起）：无头运行，不弹窗；测试写在 game/test/*_test.gd。
# 用法：tools/gd_test.sh            跑全部
#       tools/gd_test.sh -a res://test/story_runtime_test.gd   只跑一个文件
# 退出码：0 全过；非 0 有失败（GdUnit 自己的退出码：100 失败、101 警告）。
# 4.7.2 无头模式有“失败仍退出 0”的报告，所以这里另外从输出里数失败，有失败就强制非 0。
cd "$(dirname "$0")/../game" || exit 2
LOG=$(mktemp -t gdtest)
[ $# -eq 0 ] && set -- -a res://test
godot --headless --path . -s -d --remote-debug tcp://127.0.0.1:0 res://addons/gdUnit4/bin/GdUnitCmdTool.gd --ignoreHeadlessMode -rd "$PWD/../.gdunit-reports" -rc 3 "$@" 2>&1 | tee "$LOG" | grep -vE '^\s*$'
code=${PIPESTATUS[0]}
godot --headless --path . --quiet -s res://addons/gdUnit4/bin/GdUnitCopyLog.gd > /dev/null 2>&1
# 只看 GdUnit 的总计行“Overall Summary: N test cases | E errors | F failures …”（去掉颜色码）
sum=$(sed 's/\x1b\[[0-9;]*m//g' "$LOG" | grep 'Overall Summary')
fails=$(echo "$sum" | sed -nE 's/.*\| *([0-9]+) errors \| *([0-9]+) failures.*/\1 \2/p' | awk '{print $1+$2}')
[ -z "$sum" ] && { echo "【gd_test】没找到总计行，测试可能没跑起来"; [ "$code" -eq 0 ] && code=2; }
fails=${fails:-0}
rm -f "$LOG"
if [ "$code" -eq 0 ] && [ "$fails" -gt 0 ]; then echo "【gd_test】GdUnit 退出 0，但输出里有 $fails 处失败，按失败处理"; code=1; fi
echo "【gd_test】退出码 $code"
exit $code
