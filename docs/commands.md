# Commands Reference

## User Commands

This document lists all available commands in the tecnoter.io terminal.

### File & Directory
| Command | Description | Implementation |
|:---|:---|:---|
| `ls [path] [-l]` | List files in `/posts`, `/pages`, `/tags`, `/categories` | Native Rust Filesystem |
| `cat [file]` | Read file content (Async Fetch from Rust) | browser::fetch (Rust) |
| `cd [path]` | Change current virtual directory | State Manipulation (Rust) |

### Networking & Interaction
| Command | Description | Implementation |
|:---|:---|:---|
| `curl [url]` | Fetch and display a URL | Direct `web-sys` Request |
| `social [name]` | Open site social links in a new tab | window.open (via code) |
| `date` | Show real-time system clock | `js-sys::Date` (Rust) |

### System & Utilities
| Command | Description |
|:---|:---|
| `help` | Show available commands |
| `whoami` | Show current login identity |
| `fortune` | Random technical wisdom (`js-sys` randomness) |
| `stats` / `top` | Show node metrics (from `hugo.toml`) |
| `clear` | Clear terminal screen |
| `exit` | Terminate session |

---

## Technical Note: Command Execution
Commands are parsed by the Rust Core. When an external API (like a Clock or Fetch) is required, the command logic inside `shell_wasm/src/commands/` handles the call directly using WebAssembly system bindings. JavaScript is used exclusively as a display driver for the resulting text streams.
