# System Architecture

## Kernel vs. Emulator (The Clean Separation)

Tecnoter.io is built on a rigid separation of concerns to ensure performance and logical purity.

### 1. The Engine (Rust Kernel)
- **Source**: `shell_wasm/src/`
- **Ownership**: Filesystem logic, command parsing, state management, and external data retrieval.
- **Independence**: The Kernel is now "Pure Rust." It performs its own networking (`fetch`) and time-keeping via `web-sys` and `js-sys`.
- **Output**: Generates a stream of `WasmLine` objects with semantic types (e.g., `regular`, `bbs-title`, `internalInstruction`).

### 2. The Emulator (JavaScript Display Driver)
- **Source**: `themes/tecnoter.io/static/js/`
- **Ownership**: Pixel-perfect CRT rendering, sound synthesis, and hardware-to-software event handling.
- **Direct Bridge**: JS exposes a global registry `window.terminalUI` containing primitive I/O functions (like `print()`) which the Rust Kernel calls directly via `extern "C"`.

## The Hybrid Filesystem (On-Demand Loading)

To handle massive Hugo sites efficiently, we use a **Metadata-Catalog** architecture:

1.  **Boot Catalog**: At startup, the Browser fetches a lean `index.json`. This contains ONLY file names, paths, and dates. This is injected into the Rust `SystemState`.
2.  **Virtual Tree**: Rust maps the catalog into `/posts`, `/pages`, `/tags`, and `/categories`.
3.  **WASM-Driven Fetch**: When a file is accessed (via `cat` or BBS), Rust initiates a native asynchronous background request to the specific page's data. 
4.  **Zero-Jank Execution**: By using `spawn_local`, these network requests run in the background, keeping the terminal responsive and the cursor blinking even during slow network conditions.

## Visual Overlay System

The monitor effect is achieved via a **Physical Layering** strategy:
- **Display Layer (`#terminal`)**: The raw CRT text.
- **Glass Layer (`.crt-overlay`)**: Handles rounded corners, radial gradients (glare), and scanline rolling.
- **Bezel Layer (`body::after`)**: A solid plastic frame that masks the edge of the glass.
- **Hardware Dashboard (`.hardware-controls`)**: Interactive modules positioned on the bezel with a high `z-index` (200) to ensure click-transparency issues are avoided.
