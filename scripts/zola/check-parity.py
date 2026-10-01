#!/usr/bin/env python3
"""Regression check: generated JSON must match the recorded reference.

The reference is `tests/golden/`, a committed snapshot of the site's JSON
output. It was seeded from the Hugo build before Hugo was removed, so it still
records how the terminal's `cat` output was formatted at the time of the port.

Two modes:

    python3 scripts/check-parity.py            # compare (fails on drift)
    python3 scripts/check-parity.py --update   # accept current output as new baseline

Use --update after an *intentional* content edit, otherwise `make build` fails
until the new baseline is accepted.
"""

import json
import os
import pathlib
import shutil
import sys

SITE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith("-") else ".").resolve()
UPDATE = "--update" in sys.argv
GOLDEN = SITE / "tests" / "golden"

failures: list[str] = []

# PR previews prefix every URL with the subfolder they are published under.
# Strip it before comparing, so the check verifies content and formatting
# rather than the deployment path.
BASE = os.environ.get("TECNOTER_BASE", "").rstrip("/")


def strip_base(value):
    if isinstance(value, str):
        return value.replace(BASE, "", 1) if BASE else value
    if isinstance(value, list):
        return [strip_base(item) for item in value]
    if isinstance(value, dict):
        return {key: strip_base(item) for key, item in value.items()}
    return value


def load(path: pathlib.Path):
    return json.loads(path.read_text(encoding="utf-8"))


def check_index() -> None:
    ours, theirs = SITE / "public" / "index.json", GOLDEN / "index.json"
    if not theirs.is_file():
        print(f"skip: {theirs} not found")
        return
    a, b = strip_base(load(ours)), load(theirs)
    for key in ("posts", "pages", "fortunes", "socials"):
        if json.dumps(a.get(key), sort_keys=True) != json.dumps(b.get(key), sort_keys=True):
            failures.append(f"index.json: '{key}' differs from golden")


def check_pages() -> None:
    """Compare every page both sides have, and flag pages only we generate."""
    for section in ("pages", "posts"):
        ours_dir, theirs_dir = SITE / "public" / section, GOLDEN / section
        for page in sorted(ours_dir.glob("*/index.json")):
            theirs = theirs_dir / page.parent.name / "index.json"
            if not theirs.is_file():
                failures.append(f"{section}/{page.parent.name}/index.json: not in golden")
                continue
            a, b = load(page), load(theirs)
            for key in ("title", "slug", "date", "tags", "content"):
                if str(a.get(key, "")).strip() != str(b.get(key, "")).strip():
                    failures.append(f"{section}/{page.parent.name}/index.json: '{key}' differs")
        for theirs in sorted(theirs_dir.glob("*/index.json")):
            if not (ours_dir / theirs.parent.name / "index.json").is_file():
                failures.append(f"{section}/{theirs.parent.name}/index.json: missing from build")


def rebase() -> int:
    """Accept the current build output as the new baseline."""
    source = SITE / "public"
    if GOLDEN.exists():
        shutil.rmtree(GOLDEN)
    written = 0
    for src in sorted(source.rglob("*.json")):
        if "js" in src.relative_to(source).parts:
            continue
        dst = GOLDEN / src.relative_to(source)
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src, dst)
        written += 1
    print(f"baseline updated: {written} files -> {GOLDEN}")
    return 0


def main() -> int:
    if not (SITE / "public").is_dir():
        print(f"error: {SITE / 'public'} not found - build first")
        return 1
    if UPDATE:
        return rebase()
    if not GOLDEN.is_dir():
        print(f"error: golden dir not found at {GOLDEN}")
        return 1
    check_index()
    check_pages()
    if failures:
        print("PARITY FAILURES:")
        for line in failures:
            print(f"  - {line}")
        print("\nIf this content change is intentional, accept it with:")
        print("  python3 scripts/check-parity.py --update")
        return 1
    print("parity OK: generated JSON matches the recorded reference")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
