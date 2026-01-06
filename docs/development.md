# Development & Operations

## Build System

The project uses a `Makefile` to orchestrate Hugo and Rust.

- **`make dev`**: Starts parallel watchers for both. Auto-rebuilds WASM and auto-reloads the browser on Hugo changes.
- **`make build-wasm`**: Compiles the Rust core into WASM using `wasm-pack`.
- **`make clean`**: Deletes all compiled WASM artifacts and Rust target files.

## Environment Setup

1.  **Rust**: Install `rustup` and the `wasm32-unknown-unknown` target.
2.  **Tools**: Install `wasm-pack` and `wasm-bindgen-cli`.
3.  **Hugo**: Requires the Extended version.

## Troubleshooting

### Caching Issues
If you see outdated output (like old placeholders):
1.  Run `make clean`.
2.  Run `make build-wasm`.
3.  Force refresh the browser (**Shift + F5**).

### Audio Failures
The "Power On" beep is blocked until the first click. The "READY" button is mandatory for sound synthesis.

### CSS Conflicts
The terminal bezel is a **Master Overlay**. If things look square, ensure `.crt-overlay` has a higher `z-index` than the content container.
