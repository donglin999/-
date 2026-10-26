#!/usr/bin/env bash
# 经 302 Enterprise 路由器用 codex exec 跑一个子任务（模型为 Claude 5.5），规则见 R-子任务-02 与 docs/router-subtasks.md。
# 用法：xiaojianghu/tools_common/codex-router.sh [-m 模型] [-r] [-w 工作区] [-l 日志名] "任务说明" [-- 其他codex参数]
#   -m  模型，默认 claude-opus-5-5；小任务可用 claude-sonnet-5-5 / claude-haiku-5-5
#   -r  只读：read-only 沙箱，不写文件
#   -w  可写范围：all（默认，luotuozhuan 根目录，两个工作区都能写）/ docs（xiaojianghu）/ game（xiaojianghu-legacy-prologue）
#   -l  日志名，事件流与最终回复写入 luotuozhuan/.router-tasks/<日志名>.jsonl / .txt
#   任务说明为 "-" 时从标准输入读取
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
TOP="$(cd "$HERE/../.." && pwd)"
# 密钥与生图共用 tools_por/.env（R-生图-03）；只取本脚本要的那一行
KEY_FILE="${LUOTUO_KEYS_ENV:-$HERE/../tools_por/.env}"
MODEL="claude-opus-5-5"
SANDBOX="workspace-write"
WORKDIR="$TOP"
LOG_NAME="$(date +%Y%m%d-%H%M%S)-$$"

while getopts "m:rw:l:" opt; do
  case "$opt" in
    m) MODEL="$OPTARG" ;;
    r) SANDBOX="read-only" ;;
    w) case "$OPTARG" in
         all) WORKDIR="$TOP" ;;
         docs) WORKDIR="$TOP/xiaojianghu" ;;
         game) WORKDIR="$TOP/xiaojianghu-legacy-prologue" ;;
         *) echo "-w 只能是 all / docs / game" >&2; exit 2 ;;
       esac ;;
    l) LOG_NAME="$OPTARG" ;;
    *) echo "未知参数" >&2; exit 2 ;;
  esac
done
shift $((OPTIND - 1))
[ $# -ge 1 ] || { echo "缺少任务说明" >&2; exit 2; }
PROMPT="$1"; shift
[ "${1:-}" = "--" ] && shift
[ "$PROMPT" = "-" ] && PROMPT="$(cat)"

if [ -z "${ENTERPRISE_API_KEY:-}" ]; then
  [ -f "$KEY_FILE" ] || { echo "找不到密钥文件：$KEY_FILE" >&2; exit 3; }
  [ "$(stat -f '%Lp' "$KEY_FILE" 2>/dev/null || stat -c '%a' "$KEY_FILE")" = "600" ] || { echo "密钥文件权限应为0600" >&2; exit 3; }
  ENTERPRISE_API_KEY="$(sed -n 's/^ENTERPRISE_API_KEY=//p' "$KEY_FILE" | head -1 | tr -d "\"'")"
  [ -n "$ENTERPRISE_API_KEY" ] || { echo "密钥文件里没有 ENTERPRISE_API_KEY：$KEY_FILE" >&2; exit 3; }
fi
export ENTERPRISE_API_KEY

# 日志放在两个工作区之外，不进 git
LOG_DIR="$TOP/.router-tasks"
mkdir -p "$LOG_DIR"
# 忽略 ~/.codex/config.toml（不改用户全局模型、MCP与插件），路由配置全部由 -c 给出
codex exec --ignore-user-config --skip-git-repo-check --ephemeral \
  -C "$WORKDIR" -s "$SANDBOX" -m "$MODEL" \
  -c model_provider='"enterprise"' \
  -c 'model_providers.enterprise={name="302 Enterprise",base_url="https://model-router.zleap.com/v1",env_key="ENTERPRISE_API_KEY",wire_api="responses"}' \
  -c approval_policy='"never"' \
  --disable apps --json -o "$LOG_DIR/$LOG_NAME.txt" "$@" "$PROMPT" < /dev/null \
  > "$LOG_DIR/$LOG_NAME.jsonl" || STATUS=$?
STATUS="${STATUS:-0}"
echo "[$([ "$STATUS" = 0 ] && echo ok || echo "error $STATUS")] 日志 .router-tasks/$LOG_NAME.jsonl"
cat "$LOG_DIR/$LOG_NAME.txt" 2>/dev/null || tail -5 "$LOG_DIR/$LOG_NAME.jsonl"
exit $STATUS
