# Tecnoter Documentation

Welcome to the **tecnoter.io** documentation. This project is a hybrid website using **Hugo** for static content and **Rust (WebAssembly)** for an immersive retro terminal experience.

## Document Directory

- **[Usage & Compatibility](./usage.md)**: User guide, system requirements, and fallback mode information.
- **[Architecture](./architecture.md)**: Technical overview of the dual-engine system, data bridge, and filesystem logic.
- **[Commands](./commands.md)**: User guide for terminal commands and developer guide for adding new ones.
- **[Development](./development.md)**: Build instructions, environment setup, and troubleshooting.
- **[Roadmap](../ROADMAP.md)**: Project status and future goals.

## Core Philosophy

1.  **Logic Separation**: Rust handles the "Kernel" (logic, filesystem, state). JavaScript handles the "Emulator" (I/O, rendering, sound).
2.  **Progressive Enhancement**: The site serves a high-fidelity terminal to desktop users, while falling back to a clean SEO-friendly "Hub" for mobile and non-JS clients.
3.  **Dynamic Bridge**: Unlike static terminal clones, this system is 100% driven by real Hugo content fetched on-demand.
