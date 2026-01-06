# tecnoter.io Roadmap

## Completed ✅
- [x] Migrate core shell logic to Rust
- [x] Implement 2-column BBS layout
- [x] Fix AudioContext browser restrictions (Power-on gate)
- [x] Create modular command structure in Rust
- [x] Decouple HUB fallback visuals from Terminal
- [x] Integrated build system (Makefile + Watchers)
- [x] **Social Network Integration**: Automatic uplink opening for GitHub, Twitter, and Bluesky.
- [x] **Rust Core Extensions**: Implemented `ls -l`, `date`, and `motd` in the WASM shell.
- [x] **Unified Hardware UI**: Moved the monitor bezel & knobs to partials for consistency across all pages.
- [x] **Dynamic Hub Directory**: Fallback menu is now automatically generated from Hugo markdown pages.
- [x] **SEO & Social Support**: Integrated OpenGraph and Twitter Card internal templates.
- [x] **Persistent Mode**: Mode preference (Terminal/Hub) is now saved in `sessionStorage`.
- [x] **Command Documentation**: Created comprehensive `docs/commands.md` reference.

## Future 🚀
- [x] **Terminal History**: Persistent `localStorage` history with Up/Down arrow navigation.
- [x] **Live Clock Sync**: Real-time browser date integration via `js-sys`.
- [x] **Dynamic Hugo Bridge**: Terminal filesystem, BBS menus, and categories are now 100% driven by Hugo content.
- [x] **On-Demand Fetching**: Rust Kernel now fetches individual file content asynchronously using browser APIs.

## Future 🚀
- [ ] **Portfolio Section**: Dedicated `/projects/` section for technical case studies.
- [ ] **Real Mail/MSG**: Connect terminal communication commands to a real notification backend.
- [ ] **Amber/White Phosphor**: Add phosphor-alternating CSS themes.
- [ ] **Telnet/SSH Node**: Expose the Rust core as a real remote login node.
