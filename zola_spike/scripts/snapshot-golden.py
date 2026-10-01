#!/usr/bin/env python3
"""Snapshot the Hugo build's JSON output as the parity golden file.

Only the JSON the terminal actually consumes is captured, not all of public/.
Run this while Hugo is still installed:

    hugo && python3 zola_spike/scripts/snapshot-golden.py

check-parity.py compares the Zola build against this directory, so the safety
net survives deleting Hugo.
"""

import pathlib
import shutil
import sys

SITE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
HUGO_PUBLIC = SITE / "public"
GOLDEN = SITE / "zola_spike" / "tests" / "golden"


def main() -> int:
    if not HUGO_PUBLIC.is_dir():
        print(f"error: {HUGO_PUBLIC} not found - run hugo first")
        return 1

    if GOLDEN.exists():
        shutil.rmtree(GOLDEN)
    GOLDEN.mkdir(parents=True)

    written = 0
    for src in sorted(HUGO_PUBLIC.rglob("*.json")):
        # wasm-pack metadata is not content; skip it.
        if "js" in src.relative_to(HUGO_PUBLIC).parts:
            continue
        dst = GOLDEN / src.relative_to(HUGO_PUBLIC)
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        written += 1

    print(f"snapshot: {written} files -> {GOLDEN}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
