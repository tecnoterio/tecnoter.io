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

- [ ] **Verify the deploy job.** The CI *build* is green on GitHub, but no
      deploy has run: `deploy-production` is gated on a push to `main`, and the
      `gh-pages` branch model has never been exercised. First attempt happens
      when this branch merges. See [deployment](docs/deployment.md) for the
      settings check.
- [ ] **Browser parity check.** The Zola site has never been compared against
      Hugo in a real browser. The generated HTML is verified; the rendering is
      not.

## Later

- [ ] **Portfolio section** at `/projects/` for technical case studies
- [ ] **Real mail and message commands**, backed by a notification service
- [ ] **Phosphor themes** — alternating amber/white
- [ ] **Telnet/SSH node** — expose the Rust core as a real remote login

## Note on deployment

Publishing changed from `actions/deploy-pages` to a `gh-pages` branch, because
per-PR subfolders need a branch and Pages serves one location. **Repository
settings must have Pages source set to "Deploy from a branch" (gh-pages /
root).** With it on "GitHub Actions" the deploy will appear to succeed and
nothing will update.

A preview for pull request 42 lands at:

    https://tecnoterio.github.io/tecnoter.io/pr-42/
