# Tecnoter Documentation

Welcome to the **tecnoter.io** documentation. This project is a hybrid website using **Zola** for static content and **Rust (WebAssembly)** for an immersive retro terminal experience.

## Document Directory

- **[Usage & Compatibility](./usage.md)**: User guide, system requirements, and fallback mode information.
- **[Architecture](./architecture.md)**: Technical overview of the dual-engine system, data bridge, and filesystem logic.
- **[Commands](./commands.md)**: User guide for terminal commands and developer guide for adding new ones.
- **[Deployment](./deployment.md)**: How the site is published, pull request previews, and the settings check.
- **[Development](./development.md)**: Historical bug investigations, pre-dating the Zola migration.
- **[Hugo to Zola](./hugo-to-zola-migration.md)**: What Tera and Hugo disagree about, and the traps in porting between them.
- **[Roadmap](../ROADMAP.md)**: Project status and future goals.

## Core Philosophy

1.  **Logic Separation**: Rust handles the "Kernel" (logic, filesystem, state). JavaScript handles the "Emulator" (I/O, rendering, sound).
2.  **Progressive Enhancement**: The site serves a high-fidelity terminal to desktop users, while falling back to a clean SEO-friendly "Hub" for mobile and non-JS clients.
3.  **Dynamic Bridge**: Unlike static terminal clones, this system is 100% driven by real Markdown content fetched on-demand.
