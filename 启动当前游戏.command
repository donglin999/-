#!/bin/zsh
TASK_GAME_ROOT="$(cd -- "$(dirname -- "$0")" && pwd)"
exec python3 "$TASK_GAME_ROOT/scripts/serve-current.py" --open
