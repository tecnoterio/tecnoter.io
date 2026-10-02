#!/usr/bin/env python3
"""Check external links in content and templates.

Every reference in a post was verified when it was written. Links rot, and a
dead reference inside a post about rigour undercuts the post, so the archive
is only worth keeping if something checks it.

Network failures are reported separately from hard failures: a site that
blocks a HEAD request is not a broken link, and treating it as one would make
this gate useless. Set --strict to fail on those too.

Usage:
    python3 scripts/zola/check-links.py [--strict] [--timeout N]
"""

from __future__ import annotations

import argparse
import re
import socket
import sys
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

SITE = Path(__file__).resolve().parents[2]

SOURCES = [SITE / "content", SITE / "templates", SITE / "data"]

MARKDOWN_LINK = re.compile(r"\[[^\]]*\]\((https?://[^)\s]+)\)")
BARE_URL = re.compile(r"(?<![\"'(=])(https?://[^\s)\"'>]+)")

USER_AGENT = "tecnoter.io link checker (+https://tecnoter.io)"

# Transient or host-specific problems. Not a broken link.
SOFT_STATUS = {403, 405, 406, 409, 418, 429, 500, 502, 503, 504}


def collect() -> dict[str, set[str]]:
    """Map every external URL to the files that reference it."""
    found: dict[str, set[str]] = {}
    for source in SOURCES:
        for path in sorted(source.rglob("*")):
            if not path.is_file() or path.suffix in {".png", ".jpg", ".svg", ".wasm"}:
                continue
            try:
                text = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, OSError):
                continue
            urls = set(MARKDOWN_LINK.findall(text)) | set(BARE_URL.findall(text))
            for url in urls:
                found.setdefault(url.rstrip(".,)"), set()).add(str(path.relative_to(SITE)))
    return found


def check(url: str, timeout: float) -> tuple[str, str, str]:
    """Return (url, status, detail). status is ok, soft, dead, or error."""
    request = urllib.request.Request(
        url, method="GET", headers={"User-Agent": USER_AGENT, "Range": "bytes=0-2047"}
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return url, "ok", str(response.status)
    except urllib.error.HTTPError as exc:
        if exc.code in SOFT_STATUS:
            return url, "soft", f"HTTP {exc.code}"
        return url, "dead", f"HTTP {exc.code}"
    except urllib.error.URLError as exc:
        reason = exc.reason
        # A TLS handshake or read that times out is almost always rate limiting
        # or a slow host, not a missing page. Treating it as dead would make
        # this gate fail for reasons that have nothing to do with the links.
        if isinstance(reason, (TimeoutError, socket.timeout)):
            return url, "soft", "handshake timed out"
        if isinstance(reason, socket.gaierror):
            return url, "soft", f"DNS: {reason}"
        return url, "dead", f"{type(reason).__name__}: {reason}"
    except Exception as exc:  # noqa: BLE001 - a checker must not crash on one URL
        return url, "error", f"{type(exc).__name__}: {exc}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true", help="fail on soft failures too")
    parser.add_argument("--timeout", type=float, default=15.0)
    args = parser.parse_args()

    found = collect()
    if not found:
        print("no external links found")
        return 0

    print(f"checking {len(found)} external links with {args.timeout:g}s timeout\n")
    with ThreadPoolExecutor(max_workers=16) as pool:
        results = list(pool.map(lambda item: check(item[0], args.timeout), found.items()))

    dead = [r for r in results if r[1] == "dead"]
    soft = [r for r in results if r[1] in ("soft", "error")]
    ok = [r for r in results if r[1] == "ok"]

    for url, _, detail in sorted(dead):
        print(f"DEAD  {url}\n        {detail}")
        for source in sorted(found[url]):
            print(f"        referenced by {source}")
    for url, kind, detail in sorted(soft):
        print(f"{'SOFT' if kind == 'soft' else 'ERR '} {url}\n        {detail}")

    print(f"\n{len(ok)} ok, {len(dead)} dead, {len(soft)} soft")

    if dead:
        print("\nDead links. Fix them or remove the reference.")
        return 1
    if soft and args.strict:
        print("\nSoft failures and --strict was given.")
        return 1
    if soft:
        print("Soft failures (blocked or transient) did not fail the check.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
