#!/bin/bash
# 后台跑 Godot（截图、对照、自测用），不打扰桌面：
# - 2026-11-05 起窗口一律开在 BetterDisplay 的虚拟屏 QingheTest 上（用户要求：测试放到虚拟屏上，不要放到实际屏幕）；
#   每次先确认虚拟屏已连接（没连就接上），按名字现查它在桌面坐标里的位置；找不到虚拟屏就报错退出，绝不退回到实际屏幕；
# - macOS `open -g` 启动，不把程序切到前台；临时写 game/override.cfg：窗口不可聚焦（no_focus），跑完（含中断）立即删掉；
# - 无头模式（--headless）不渲染画面，截图会是空的，所以要真窗口，只是放在虚拟屏上。
# 多张截图请用一次批量：tools/gd_bg.sh --resolution 1280x720 -- --shots=<清单.json>（见 game/scripts/tests/shots.gd），整批只启动一次。
# 用法：tools/gd_bg.sh [Godot 参数…] -- [游戏参数…]；print 与报错打到标准输出，跑完才返回。
VSCREEN=${GD_VSCREEN:-QingheTest}
BD=/Applications/BetterDisplay.app/Contents/MacOS/BetterDisplay
# 虚拟屏在 macOS 屏幕列表里的序号（Godot 在 macOS 上按同一顺序编号屏幕）
screen_idx() {
  osascript -l JavaScript -e 'ObjC.import("AppKit"); function run(a){var s=$.NSScreen.screens;
    for (var i=0;i<s.count;i++){if (ObjC.unwrap(s.objectAtIndex(i).localizedName)==a[0]) return String(i)} return ""}' "$VSCREEN"
}
IDX=$(screen_idx)
if [ -z "$IDX" ] && [ -x "$BD" ]; then
  "$BD" set -name="$VSCREEN" -connected=on >/dev/null 2>&1; sleep 3; IDX=$(screen_idx)
fi
VSIZE=$(osascript -l JavaScript -e 'ObjC.import("AppKit"); function run(a){var s=$.NSScreen.screens;
    for (var i=0;i<s.count;i++){var x=s.objectAtIndex(i); if (ObjC.unwrap(x.localizedName)==a[0]) return Math.round(x.frame.size.width*x.backingScaleFactor)+"x"+Math.round(x.frame.size.height*x.backingScaleFactor)} return ""}' "$VSCREEN")
if [ -z "$IDX" ]; then
  echo "【gd_bg】找不到虚拟屏 $VSCREEN（BetterDisplay 里建一块同名虚拟屏并连上），为了不占用实际屏幕，这次不跑。" >&2
  exit 3
fi
APP=$(readlink -f "$(command -v godot || echo /opt/homebrew/bin/godot)" | sed 's#/Contents/MacOS/.*##')
DIR=$(cd "$(dirname "$0")/../game" && pwd)
LOG=$(mktemp -t gdbg)
OV="$DIR/override.cfg"
cleanup() { rm -f "$OV" "$LOG"; }
trap cleanup EXIT INT TERM
cat > "$OV" <<'CFG'
[display]

window/size/no_focus=true
window/size/initial_position_type=3
CFG
echo "window/size/initial_screen=$IDX" >> "$OV"
printf '\n[selftest]\n\nexpect_screen=%s\nexpect_screen_size=\"%s\"\n' "$IDX" "$VSIZE" >> "$OV"
open -g -n -W -a "$APP" --stdout "$LOG" --stderr "$LOG" --args --path "$DIR" --screen "$IDX" "$@"
cat "$LOG"
