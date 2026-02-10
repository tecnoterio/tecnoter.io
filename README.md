# tecnoter.io

An immersive, retro-futuristic terminal emulator website powered by **Hugo** and **Rust (WebAssembly)**.

## Project Overview

This site is a hybrid between a high-fidelity terminal simulator and a modern static website. It features a custom shell kernel written in Rust that manages a virtual filesystem mapped directly from live Hugo content.

### Key Features
- 🖥️ **WASM Engine**: Core shell logic, command parsing, and filesystem state managed by Rust for speed and type safety.
- 📂 **Dynamic Hugo Bridge**: Virtual directories (`/posts`, `/pages`, `/tags`, `/categories`) are generated automatically from Markdown.
- ⚡ **On-Demand Loading**: Only metadata is loaded at startup; post/page content is fetched asynchronously via Rust internal networking.
- 📻 **Live BBS**: A functional Bulletin Board System module with live post filtering and dynamic menus.
- 🎨 **CRT Simulation**: CSS-driven authentic CRT effects including scanlines, bezel overlays, and screen flicker.
- 📱 **Progressive Fallback**: Clean, accessible "Low-Tech Hub" mode for users without JS or on mobile devices.

## Quick Start

### Prerequisites
- [Rust](https://www.rust-lang.org/) (wasm32-unknown-unknown target)
- [wasm-pack](https://rustwasm.github.io/wasm-pack/)
- [Hugo Extended](https://gohugo.io/) (v0.120+)

### Build & Run
```bash
# Clone the repository
git clone https://github.com/tecnoter/tecnoter.io

# Build the WASM core and start the Hugo server
make dev
```

## Documentation
Comprehensive technical and user documentation is available in the **[`docs/`](./docs/README.md)** directory.

- **[Architecture](./docs/architecture.md)**: Deep dive into the Engine vs Emulator separation.
- **[Commands Reference](./docs/commands.md)**: List of terminal commands and guide for developers.
- **[Development Guide](./docs/development.md)**: Environment setup and troubleshooting.
- **[Project Roadmap](./ROADMAP.md)**: Current status and future goals.

---
© 2026 tecnoter.io node 1 - System Online.
