# tecnoter.io

An immersive, retro-futuristic terminal emulator website powered by **Zola** and **Rust (WebAssembly)**.

## Project Overview

This site is a hybrid between a high-fidelity terminal simulator and a modern static website. It features a custom shell kernel written in Rust that manages a virtual filesystem mapped directly from the site's Markdown content.

### Key Features
- 🖥️ **WASM Engine**: Core shell logic, command parsing, and filesystem state managed by Rust for speed and type safety.
- 📂 **Dynamic Content Bridge**: Virtual directories (`/posts`, `/pages`, `/tags`, `/categories`) are generated automatically from Markdown.
- ⚡ **On-Demand Loading**: Only metadata is loaded at startup; post/page content is fetched asynchronously via Rust internal networking.
- 📻 **Live BBS**: A functional Bulletin Board System module with live post filtering and dynamic menus.
- 🎨 **CRT Simulation**: CSS-driven authentic CRT effects including scanlines, bezel overlays, and screen flicker.
- 📱 **Progressive Fallback**: Clean, accessible "Low-Tech Hub" mode for users without JS or on mobile devices.

## Quick Start

### Prerequisites
- [Rust](https://www.rust-lang.org/) (wasm32-unknown-unknown target)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)
- [Zola](https://www.getzola.org/) (v0.23+)
- [Python](https://www.python.org/) 3.11+ (build scripts)

### Build & Run
```bash
# Clone the repository
git clone https://github.com/tecnoter/tecnoter.io

# Build the WASM core and start the dev server
make dev
```

## Deployment

The site is published to a `gh-pages` branch: pushes to `main` go to the site
root, and each pull request gets a `/pr-<n>/` subfolder that is removed when the
PR closes.

> **Before the first deploy:** set **Settings → Pages → Source** to *Deploy from
> a branch* (`gh-pages`, `/ (root)`). With it on "GitHub Actions" the workflow
> reports success and the site never updates.

See **[docs/deployment.md](./docs/deployment.md)**.

## Documentation
Comprehensive technical and user documentation is available in the **[`docs/`](./docs/README.md)** directory.

- **[Architecture](./docs/architecture.md)**: Deep dive into the Engine vs Emulator separation.
- **[Commands Reference](./docs/commands.md)**: List of terminal commands and guide for developers.
- **[Development Notes](./docs/development.md)**: Historical bug investigations (pre-dates the Zola migration).
- **[Hugo to Zola](./docs/hugo-to-zola-migration.md)**: What Tera and Hugo disagree about, and the traps in porting.
- **[Project Roadmap](./ROADMAP.md)**: Current status and future goals.

---
© 2026 tecnoter.io node 1 - System Online.
