#!/usr/bin/env python3
"""Generate public/index.json from Zola content front matter.

Zola has no native multi-format output for the home page, so the terminal's
data feed is built here from the same Markdown source Zola renders.

Usage: python3 scripts/build-index-json.py [site_root]
"""

import json
import pathlib
import re
import sys
import tomllib

SITE = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
CONTENT = SITE / "content"
DATA = SITE / "data"
OUT = SITE / "public" / "index.json"

FM_RE = re.compile(r"^\+{3}\s*\n(.*?)\n\+{3}\s*", re.S)


def parse_front_matter(path: pathlib.Path) -> dict:
    text = path.read_text(encoding="utf-8")
    match = FM_RE.match(text)
    if not match:
        return {}
    block = match.group(1)
    try:
        return tomllib.loads(block)
    except tomllib.TOMLDecodeError:
        return parse_yaml_like(block)


def parse_yaml_like(block: str) -> dict:
    """Minimal parser for the flat key = value style used in this repo."""
    out: dict = {}
    for line in block.splitlines():
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        out[key.strip()] = parse_value(value.strip())
    return out


def parse_value(value: str):
    value = value.strip()
    if value.startswith("[") and value.endswith("]"):
        inner = value[1:-1].strip()
        if not inner:
            return []
        return [parse_value(part) for part in inner.split(",")]
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    if re.fullmatch(r"-?\d+", value):
        return int(value)
    if value in ("true", "false"):
        return value == "true"
    return value


def slug_for(front: dict, path: pathlib.Path) -> str:
    if front.get("slug"):
        return str(front["slug"])
    return path.stem


def collect(section: str) -> list:
    directory = CONTENT / section
    if not directory.is_dir():
        return []
    entries = []
    weights: list = []
    for path in sorted(directory.glob("*.md")):
        if path.name == "_index.md":
            continue
        front = parse_front_matter(path)
        if front.get("draft"):
            continue
        weights.append(front.get("weight", 0))
        entries.append(
            {
                "title": front.get("title", path.stem),
                "slug": slug_for(front, path),
                "url": f"/{section}/{slug_for(front, path)}/",
                "date": str(front.get("date", "0001-01-01"))[:10],
                "tags": front.get("tags", []),
                "categories": front.get("categories", []),
            }
        )
    if section == "posts":
        # Newest first; ties fall back to title, which is what Hugo produces.
        entries.sort(key=lambda item: item["title"])
        entries.sort(key=lambda item: item["date"], reverse=True)
    else:
        # Hugo orders pages by front-matter weight, then title.
        order = sorted(
            range(len(entries)),
            key=lambda i: (weights[i], entries[i]["title"]),
        )
        entries = [entries[i] for i in order]
    return entries


def load_toml(path: pathlib.Path) -> dict:
    if not path.is_file():
        return {}
    return tomllib.loads(path.read_text(encoding="utf-8"))


MD_LINK = re.compile(r"\[([^\]]*)\]\([^)]*\)")
MD_HEADER = re.compile(r"^\s{0,3}#{1,6}\s*", re.M)
MD_EMPH = re.compile(r"(\*{1,3}|_{1,3})(\S(?:.*?\S)?)\1", re.S)
MD_CODE = re.compile(r"`([^`]*)`")
MD_RULE = re.compile(r"^\s{0,3}([-*_]\s*){3,}$", re.M)
MD_LIST = re.compile(r"^\s*[-*+]\s+", re.M)
MD_QUOTE = re.compile(r"^\s*>\s?", re.M)
def strip_inline(text: str) -> str:
    """Remove Markdown inline and block markup, keeping only the words."""
    text = MD_RULE.sub(" ", text)
    text = MD_HEADER.sub("", text)
    text = MD_LIST.sub("", text)
    text = MD_QUOTE.sub("", text)
    text = MD_LINK.sub(r"\1", text)
    text = MD_CODE.sub(r"\1", text)
    text = MD_EMPH.sub(r"\2", text)
    # Table separator rows carry no content; the pipes are purely visual.
    text = re.sub(r"^\s*\|?[\s:\-|]+\|[\s:\-|]*$", " ", text, flags=re.M)
    return text.replace("|", " ")


def to_plain_text(body: str) -> str:
    """Render a Markdown body down to plain text.

    The terminal prints this straight into a <pre>, so table pipes and heading
    markers would show up as literal characters. The rules that matter, all
    matching Hugo's .Plain:

    * a heading and the paragraph beneath it form one line
    * a heading with no paragraph of its own merges into the next line
    * a paragraph immediately before a list stays on its own line
    * a paragraph following a list joins the list's line
    * a Markdown table collapses into a single space-joined line
    * two trailing spaces force a line break
    """
    lines_out: list[str] = []
    last_is_bare_heading = False
    last_was_list = False
    for block in re.split(r"\n\s*\n", body):
        body_lines = [line for line in block.splitlines() if line.strip()]
        is_list = bool(body_lines) and all(
            re.match(r"\s*[-*+]\s+", line) for line in body_lines
        )
        # A paragraph written directly above a list (no blank line) keeps its
        # own line, so peel it off before processing the parts.
        first_item = next(
            (i for i, line in enumerate(block.splitlines())
             if re.match(r"\s*[-*+]\s+", line)),
            None,
        )
        if first_item:
            lead = "\n".join(block.splitlines()[:first_item]).strip()
            if lead and not lead.startswith("#"):
                lines_out.append(" ".join(strip_inline(lead).split()))
                block = "\n".join(block.splitlines()[first_item:])

        for part in re.split(r"(?m)(?=^#{1,6}\s)", block):
            stripped = part.strip()
            if not stripped:
                continue
            # A Markdown hard break (two trailing spaces) ends the line early,
            # so split the part there before collapsing whitespace.
            segments = re.split(r"(?<=\S) {2,}$", part, flags=re.M)
            for index, segment in enumerate(segments):
                ended_by_break = index < len(segments) - 1
                seg = segment.strip()
                if not seg:
                    continue
                text = " ".join(strip_inline(seg).split())
                if re.match(r"#{1,6}\s", seg):
                    # A heading starts a line. If the previous line was a
                    # heading with no body, they merge into one.
                    if last_is_bare_heading:
                        lines_out[-1] = f"{lines_out[-1]} {text}"
                    else:
                        lines_out.append(text)
                    # A heading is only "complete" if it carries a paragraph. A
                    # heading whose body is a list still absorbs what follows.
                    rest = [ln for ln in seg.splitlines()[1:] if ln.strip()]
                    last_is_bare_heading = not rest or all(
                        re.match(r"\s*[-*+]\s+", ln) for ln in rest
                    )
                elif (last_is_bare_heading or last_was_list) and lines_out:
                    # A paragraph under a bare heading, or one following a
                    # list, joins the line above rather than starting a new one.
                    lines_out[-1] = f"{lines_out[-1]} {text}"
                    last_is_bare_heading = False
                else:
                    lines_out.append(text)
                    last_is_bare_heading = False
                # A hard break ends the line, so nothing merges into it.
                if ended_by_break:
                    last_is_bare_heading = False
                    last_was_list = False
        # A heading whose body is a list also absorbs the paragraph after it.
        heading_body = [line for line in block.splitlines()[1:] if line.strip()]
        last_was_list = is_list or (
            bool(heading_body) and all(re.match(r"\s*[-*+]\s+", line) for line in heading_body)
        )
    text = "\n".join(lines_out)

    # Hugo's .Plain passes HTML entities through, and its smartypants pass turns
    # a straight apostrophe between words into &rsquo;. Reproduce both, then
    # escape any bare ampersand the way HTML rendering would.
    text = re.sub(r"(?<=\w)'(?=\w)", "&rsquo;", text)
    return re.sub(r"&(?![A-Za-z]+;|#[0-9]+;)", "&amp;", text)


def body_of(path: pathlib.Path) -> str:
    """Return the page body as plain text, mirroring Hugo's .Plain."""
    text = path.read_text(encoding="utf-8")
    match = FM_RE.match(text)
    return to_plain_text(text[match.end():] if match else text)


def write_page_json(section: str) -> int:
    """Emit <section>/<slug>/index.json for each page.

    The terminal's `cat` command fetches this path to render content. Hugo
    produced it from layouts/_default/single.json; Zola has no per-page
    multi-format output, so it is generated here instead.
    """
    written = 0
    for path in sorted((CONTENT / section).glob("*.md")):
        if path.name == "_index.md":
            continue
        front = parse_front_matter(path)
        if front.get("draft"):
            continue
        slug = slug_for(front, path)
        target = SITE / "public" / section / slug / "index.json"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(
            json.dumps(
                {
                    "title": front.get("title", path.stem),
                    "slug": slug,
                    "date": str(front.get("date", "0001-01-01"))[:10],
                    "content": body_of(path),
                    "tags": front.get("tags", []),
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        written += 1
    return written


def main() -> int:
    config = load_toml(SITE / "zola.toml")
    extra = config.get("extra", {})

    system_info = extra.get("system_info", {})
    if isinstance(system_info, dict):
        system_info = {
            "uptime": system_info.get("uptime", "unknown"),
            "loadAverage": system_info.get("load_average", "0.00"),
            "motdSuggestion": system_info.get("motd_suggestion", "help"),
            "nodeName": system_info.get("node_name", "node"),
        }

    payload = {
        "posts": collect("posts"),
        "pages": collect("pages"),
        "socials": extra.get("socials", []),
        "fortunes": load_toml(DATA / "fortunes.toml").get("fortunes", []),
        "systemInfo": system_info,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    pages = write_page_json("pages") + write_page_json("posts")
    print(f"wrote {OUT} (+{pages} per-page index.json)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
