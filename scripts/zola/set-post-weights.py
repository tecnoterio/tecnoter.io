#!/usr/bin/env python3
"""Derive each post's `weight` from its date, so newest sorts first.

The section is configured with `sort_by = "weight"`. This Zola version
supports neither `sort_reverse` nor a `-date` prefix on `sort_by`, so the
ordering has to live somewhere. A weight is the only option that is also
reviewable: a wrong order is visible in a diff of the front matter.

Weight is a descending date offset: newest date -> lowest number. Add
`--check` to verify without writing, which is what CI should do.

Usage:
    python3 scripts/zola/set-post-weights.py [--check]
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import date
from pathlib import Path

POSTS = Path(__file__).resolve().parents[2] / "content" / "posts"

WEIGHT_LINE = re.compile(r"^weight = -?\d+$")
DATE_LINE = re.compile(r"^date = (\d{4})-(\d{2})-(\d{2})$")

# Any date after the newest post yields a smaller offset. 29991231 is a
# constant upper bound rather than a moving "today", so re-running this on a
# post dated in the future does not renumber the existing ones.
CEILING = date(2999, 12, 31)


def weight_for(day: date) -> int:
    return (CEILING - day).days


def posts() -> list[Path]:
    return sorted(p for p in POSTS.glob("*.md") if p.name != "_index.md")


def read_date(path: Path) -> date | None:
    for line in path.read_text(encoding="utf-8").splitlines()[:20]:
        match = DATE_LINE.match(line.strip())
        if match:
            return date(*(int(g) for g in match.groups()))
    return None


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="report, do not write")
    args = parser.parse_args()

    changed: list[str] = []
    missing: list[str] = []

    for path in posts():
        day = read_date(path)
        if day is None:
            missing.append(path.name)
            continue
        want = f"weight = {weight_for(day)}"

        lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
        front_matter_end = next(
            (i for i, l in enumerate(lines) if i and l.strip() == "+++"), None
        )
        if front_matter_end is None:
            missing.append(path.name)
            continue

        out, updated = [], False
        for i, line in enumerate(lines):
            if i < front_matter_end and WEIGHT_LINE.match(line.strip()):
                if line.strip() != want:
                    updated = True
                out.append(f"{want}\n")
            elif i < front_matter_end and line.strip().startswith("sort_by"):
                out.append(line)
            else:
                out.append(line)

        # A post with no weight yet gets one on the line after its date.
        if not any(WEIGHT_LINE.match(l.strip()) for l in out[:front_matter_end]):
            expanded, inserted = [], False
            for line in out[:front_matter_end]:
                expanded.append(line)
                if DATE_LINE.match(line.strip()) and not inserted:
                    expanded.append(f"{want}\n")
                    inserted = True
            if not inserted:
                # No date line in front matter: put the weight after the title.
                expanded = [
                    f"{want}\n" if l.startswith("title") else l
                    for l in expanded
                ]
            out = expanded + out[front_matter_end:]
            updated = True

        if updated:
            changed.append(path.name)
            if not args.check:
                path.write_text("".join(out), encoding="utf-8")

    if missing:
        print("no date in front matter, skipped:")
        for name in missing:
            print(f"  {name}")
    if changed:
        verb = "would change" if args.check else "updated"
        print(f"{verb} {len(changed)} post(s):")
        for name in changed:
            print(f"  {name}")
    else:
        print("all post weights already correct")

    return 1 if (args.check and changed) else 0


if __name__ == "__main__":
    sys.exit(main())
