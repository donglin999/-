#!/usr/bin/env python3
"""Copy the single entry guard to local historical pages, or verify no drift."""
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT.parent / 'xiaojianghu'

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    source = (ROOT / 'js/runtime-entry.js').read_bytes()
    # 2026-10-20：文档库旧原型已整体归档，没有页面时不再需要守卫副本。
    targets = [LIBRARY / 'js/local-game-entry.js'] if (LIBRARY / 'index.html').is_file() else []
    # Existing local build snapshots can otherwise retain an unguarded entry.
    if (LIBRARY / 'dist/index.html').is_file():
        targets.append(LIBRARY / 'dist/js/local-game-entry.js')
    for target in targets:
        if args.check:
            if not target.is_file() or target.read_bytes() != source:
                raise SystemExit(f'入口守卫副本不同步：{target}')
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(source)
    print(f'入口守卫{"检查" if args.check else "同步"}通过：{len(targets)}份')

if __name__ == '__main__':
    main()
