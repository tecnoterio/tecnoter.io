# Changelog - tecnoter.io

All notable changes to this project documented here. Based on git history from 2023-12-15 to 2026-02-19.

---

## [Unreleased] - 2026-07-03 (Current Development)

### Fixed
- **WASM Fortune deserialization**: Fixed type mismatch where JSON fortunes were objects `{"text":"..."}` but Rust expected `Vec<String>`. Added `Fortune` struct with `text` field.
- **WASM build pipeline**: Updated `make build-wasm` to use wasm-pack targeting web output.

### Documentation
- Added `CLAUDE.md` - AI assistant context for the repository
- Updated `AGENTS.md` - Codebase patterns and WASM fix documentation
- Added `docs/simple-terminal-migration.md` - Plan for xterm.js + stateless WASM
- Added `docs/wasm-tty-migration.md` - Full PTY kernel migration plan (archived)
- Added `.gitignore` for build artifacts (public/, target/, wasm output)

---

## 2026-02-19

### Changed
- **Content**: Text updates on all pages, removed `who.md` page

---

## 2026-02-10 (Major Release - Hugo Bootstrap & Hub Mode)

### Added
- **Hub Mode**: Complete static site mode with Hugo-generated HTML pages
  - Company pages: Bio, Skills, Contact, Vision, Services, Stats
  - Blog posts with tags/categories
  - Social links (GitHub, Bluesky)
  - Fortune cookie wisdom display
- **Theme**: Custom `tecnoterio` theme (renamed from `tecnoter.io`)
  - Removed PaperMod and legacy terminal themes
  - Amber/green/BW color modes with CRT aesthetics
  - Hardware control panel UI (mode, channels, debug, color knobs)
  - Responsive hub layout with navigation sidebar
- **Content Structure**:
  - Posts: hello-world, node-architecture, test
  - Pages: bio, skills, contact, vision, services, stats, who (later removed)
  - Data files: fortunes.toml, site_content.toml
- **GitHub Actions**: Complete CI/CD pipeline
  - PR builds only (no deploy)
  - Main branch deploys to GitHub Pages
  - Rust WASM builds before Hugo
  - wasm-pack action for WASM compilation
- **Development Tools**:
  - `make dev` - Runs Hugo + cargo watch for live reload
  - `make build-wasm` - Compiles Rust to WASM via wasm-pack
  - `make serve` - Hugo server with debug logging
  - Auto-opens browser on `make dev`

### Fixed
- **Hugo Build Errors**: Multiple fixes for Hugo 0.120+ compatibility
- **CSS Layout**: Hub navigation forced to single column, link display as block, width limits
- **Fortune Rendering**: Fixed hub_frame.html fortune display
- **Hugo Shuffle Issue**: Deterministic build output
- **Mode Detection**: Hub vs Terminal mode switching logic
- **Hub Links**: Navigation and mode detection fixes

### Changed
- **Theme Rename**: `tecnoter.io` → `tecnoterio` (directory name)
- **Config**: Updated `hugo.toml` and `hub_frame.html`
- **Company Info**: Mission statement rewrite, company info updates
- **Services Page**: Added services, removed team page

### Documentation
- `docs/hub-mode-fixes.md` - Summary of hub mode CSS/JS fixes
- `docs/architecture.md` - System architecture documentation

---

## 2026-01-23

### Added
- **Amber Color Theme**: Initial amber CRT color scheme
- **Dev UX**: Browser auto-open on `make dev`

---

## 2026-01-14 to 2026-01-06

### Development (WIP)
- **Hugo Bootstrap**: Initial Hugo setup with docs
- **Terminal Handler**: Early JS terminal implementation
- **Theming**: CRT aesthetics, better terminal handler
- **Documentation**: Early architecture docs

---

## 2023-12-15 (Project Genesis)

### Added
- **Initial Commit**: Jekyll bootstrap (pre-Hugo)
- **Jekyll GitHub Pages**: Workflow for GitHub Pages deployment
- **SVG Assets**: Logo and inline SVG library
- **Gem Config**: Ruby/Jekyll configuration
- **Merge**: Main branch initialization

---

## Release Timeline Summary

| Date | Version | Focus |
|------|---------|-------|
| 2023-12-15 | 0.0.1 | Jekyll bootstrap |
| 2026-01-04 | 0.1.0 | Hugo migration, JS terminal draft |
| 2026-01-06 | 0.2.0 | Theming, terminal improvements |
| 2026-01-23 | 0.3.0 | Amber theme, dev tooling |
| 2026-02-10 | 1.0.0 | **Hub Mode launch**, Hugo bootstrap, CI/CD, custom theme |
| 2026-02-19 | 1.1.0 | Content updates, page cleanup |
| 2026-07-03 | 1.2.0-dev | WASM fix, migration planning, docs |

---

## Technical Debt / Known Issues

1. **WASM/JS Terminal**: Custom ANSI parser, should migrate to xterm.js (see `docs/simple-terminal-migration.md`)
2. **Dual Mode Complexity**: Hub and Terminal share WASM but have different needs
3. **Build Pipeline**: WASM must be copied to `public/js/wasm/` manually after `make build-wasm`
4. **State Serialization**: Fortune type mismatch fixed, but other types may drift

---

## Migration Plans (Planned)

- **Phase 1** (Simple): xterm.js + stateless WASM command processor (~3.5 days)
- **Phase 2** (Full): WASM as PTY kernel with process management (~7.5 days)
- Both documented in `docs/simple-terminal-migration.md` and `docs/wasm-tty-migration.md`
