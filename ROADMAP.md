# tecnoter.io Roadmap

## Completed

### Terminal (Rust/WASM)
- [x] Core shell logic migrated to Rust, compiled to WebAssembly
- [x] Modular command structure — one file per command
- [x] `ls -l`, `date`, `motd`, `fortune` and the rest implemented in the kernel
- [x] Terminal filesystem, BBS menus and categories driven by the site's content
- [x] On-demand content fetching via `spawn_local`, keeping the UI responsive
- [x] Command history in `localStorage` with Up/Down navigation
- [x] Live clock sync through `js-sys`
- [x] 2-column BBS layout
- [x] AudioContext gated behind a power-on interaction, satisfying browser policy

### Site
- [x] Dual-mode behaviour: interactive CRT terminal and plain static pages
- [x] Unified hardware UI — bezel and knobs in shared partials
- [x] Hub directory generated from the site's Markdown
- [x] Persistent Terminal/Hub mode preference in `sessionStorage`
- [x] Amber / green / black-and-white themes, with a no-JS fallback
- [x] OpenGraph and Twitter Card metadata
- [x] `docs/commands.md` reference

### Build
- [x] **Zola replaces Hugo** — one language across the terminal and the site
- [x] Per-page `index.json` generated, so `cat` can read any page
- [x] Taxonomy pages (`/tags/*`, `/categories/*`) match the previous URL set
- [x] JSON parity gate in `make build`, against a committed reference
- [x] Content and data each exist once, at the repository root
- [x] CI builds WASM then Zola, gates on the parity check, and uploads the
      artifact. Verified green on PR #6 (run 36931838407).

## Next

- [ ] **Verify the deploy job.** The CI *build* is green on GitHub, but
      `deploy` is gated on a push to `main` and has never run. First attempt
      happens when this branch merges. If it fails, check that Pages source is
      set to *GitHub Actions* in repository settings.
- [ ] **PR previews.** Publish each pull request so it can be tested before
      merging, and drop it on merge. See the note below.
- [ ] **Browser parity check.** The Zola site has never been compared against
      Hugo in a real browser. The generated HTML is verified; the rendering is
      not.

## Later

- [ ] **Relative asset paths.** Prerequisite for subfolder PR previews.
- [ ] **Portfolio section** at `/projects/` for technical case studies
- [ ] **Real mail and message commands**, backed by a notification service
- [ ] **Phosphor themes** — alternating amber/white
- [ ] **Telnet/SSH node** — expose the Rust core as a real remote login

## Note on PR previews

GitHub Pages serves one site, so per-PR previews mean deploying into a
subfolder on a `gh-pages` branch. The site cannot do that yet: every asset
reference, the `index.json` fetch, and the URLs baked into that file are
root-absolute, so a build placed at `/pr-123/` resolves everything against the
site root and renders unstyled.

The paths have to become relative first. The Rust side needs no change — `cat`
derives its URL from `index.json`, so prefixing that one field covers it, and
`bbs.js` and `commands.js` along with it. Templates need roughly two dozen
references updated, and `static/js/terminal.js` has one hardcoded fetch.

This also means choosing a Pages deployment model. The current workflow uses
`actions/deploy-pages` (source: GitHub Actions); subfolder previews need a
`gh-pages` branch instead. Those are mutually exclusive, so the workflow has to
be rewritten rather than extended — worth doing only after the current deploy
is known to work.
