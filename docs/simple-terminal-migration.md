# Simple Terminal Migration: xterm.js + Stateless WASM

## Goal

Replace custom ANSI parser with xterm.js. Keep WASM as pure command processor. Hugo unchanged for hub mode.

```
┌─────────────────────────────────────────────────────────────────┐
│  HUB MODE (unchanged)                                           │
│  - Hugo static HTML                                             │
│  - Zero WASM, minimal JS                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ index.json (build-time)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  TERMINAL MODE (upgraded)                                       │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │   xterm.js       │    │   App Shell (JS)                 │  │
│  │   - Terminal     │◄───│   - State: cwd, user, login      │  │
│  │   - FitAddon     │    │   - Boot/login flow              │  │
│  │   - WebLinks     │    │   - BBS menu                     │  │
│  │   - Search       │    │   - Theme switching              │  │
│  └────────┬─────────┘    └──────────────────────────────────┘  │
│           │                         ▲                            │
│      bytes│                         │ JSON                       │
│           ▼                         │                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  WASM: process_command(cmd, cwd, user) → WasmResponse    │   │
│  │  - Stateless, no PTY, no process table                   │   │
│  │  - Builtins: ls, cat, fortune, help, whoami, bbs, etc.   │   │
│  │  - Reads from embedded index.json (or passed as arg)     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: WASM Simplification (Rust)

### 1.1 New API

```rust
// shell_wasm/src/command.rs
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WasmCommandRequest {
    pub cmd: String,
    pub cwd: String,
    pub user: String,
    pub login_state: String,
    pub is_authenticated: bool,
    pub return_state: String,
    // Embedded data (from index.json at build time)
    pub posts: Vec<Post>,
    pub pages: Vec<Page>,
    pub fortunes: Vec<Fortune>,
    pub socials: Vec<Social>,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WasmCommandResponse {
    pub lines: Vec<WasmLine>,
    pub next_state: CommandState,
    pub handled: bool,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CommandState {
    pub cwd: String,
    pub user: String,
    pub login_state: String,
    pub is_authenticated: bool,
    pub return_state: String,
    // No posts/pages/fortunes - they're static
}

#[wasm_bindgen]
pub fn process_command(request: JsValue) -> JsValue {
    let req: WasmCommandRequest = serde_wasm_bindgen::from_value(request).unwrap();
    let resp = execute_command(req);
    serde_wasm_bindgen::to_value(&resp).unwrap()
}
```

### 1.2 Command Execution

```rust
// shell_wasm/src/command.rs
fn execute_command(req: WasmCommandRequest) -> WasmCommandResponse {
    let mut state = req.into_state();
    let parts: Vec<&str> = req.cmd.split_whitespace().collect();
    let cmd = parts.first().map(|s| s.to_lowercase()).unwrap_or_default();
    let args = &parts[1..];

    let (lines, next_state) = match cmd.as_str() {
        "ls" => commands::ls::handle(&state, args),
        "cat" => commands::cat::handle(&state, args),
        "fortune" => commands::fortune::handle(&state),
        "help" => commands::help::handle(&state),
        "whoami" => commands::whoami::handle(&state),
        "bbs" => commands::bbs::handle(&mut state),
        "login" => commands::login::handle(&mut state, args),
        "_boot" => commands::boot::handle(&mut state),
        "_login" => commands::login::internal(&mut state, args),
        // ... other commands
        "" => (vec![], state),
        _ => (vec![WasmLine::error(format!("command not found: {}", cmd))], state),
    };

    WasmCommandResponse {
        lines,
        next_state: next_state.into(),
        handled: true,
    }
}
```

### 1.3 Embed index.json at Build Time

```rust
// shell_wasm/src/command.rs
const INDEX_JSON: &str = include_str!("../../../public/index.json");

// Or pass from JS (smaller WASM):
// const request = { cmd, cwd, user, ..., posts: state.posts, ... }
```

### 1.4 Cargo.toml Updates

```toml
# Remove: web-sys (console only), wasm-bindgen-futures
# Keep: wasm-bindgen, serde, serde-wasm-bindgen, serde_json, js-sys
```

---

## Phase 2: xterm.js Terminal (JS)

### 2.1 Install

```bash
cd themes/tecnoter.io
npm init -y
npm install xterm @xterm/addon-fit @xterm/addon-web-links @xterm/addon-search
```

### 2.2 Terminal Module

```javascript
// themes/tecnoter.io/static/js/terminal-xterm.js
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import initWasm from './wasm/tecnoter_shell.js';

export class TerminalShell {
  constructor() {
    this.term = new Terminal({
      cursorBlink: true,
      fontFamily: '"IBM Plex Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.4,
      theme: this.getTheme(),
      convertEol: true,
      scrollback: 10000,
    });
    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);
    this.term.loadAddon(new WebLinksAddon());
    this.term.loadAddon(new SearchAddon());
    
    this.state = {
      cwd: '/',
      user: 'guest',
      loginState: 'UNINITIALIZED',
      isAuthenticated: false,
      returnState: 'PROMPT',
    };
    this.wasm = null;
    this.history = [];
    this.histIndex = -1;
  }

  async init() {
    const module = await initWasm();
    this.wasm = module;
    return this;
  }

  mount(element) {
    this.term.open(element);
    this.fitAddon.fit();
    window.addEventListener('resize', () => this.fitAddon.fit());

    this.term.onData(data => this.onInput(data));
    this.term.onKey(e => this.onKey(e));
    
    this.printPrompt();
  }

  onInput(data) {
    if (this.state.loginState === 'LOGIN' || this.state.loginState === 'PASSWORD') {
      this.inputBuffer += data;
      this.term.write(data);
      return;
    }
    this.inputBuffer += data;
    this.term.write(data);
  }

  onKey(e) {
    if (e.key === 'Enter') {
      this.executeCommand(this.inputBuffer.trim());
      this.inputBuffer = '';
    } else if (e.key === 'Backspace') {
      if (this.inputBuffer.length > 0) {
        this.inputBuffer = this.inputBuffer.slice(0, -1);
        this.term.write('\b \b');
      }
    } else if (e.key === 'ArrowUp') {
      this.historyNavigate(-1);
    } else if (e.key === 'ArrowDown') {
      this.historyNavigate(1);
    }
  }

  async executeCommand(cmd) {
    this.term.write('\r\n');
    this.history.push(cmd);
    this.histIndex = this.history.length;

    const request = {
      cmd,
      cwd: this.state.cwd,
      user: this.state.user,
      login_state: this.state.loginState,
      is_authenticated: this.state.isAuthenticated,
      return_state: this.state.returnState,
      posts: this.posts,      // from index.json
      pages: this.pages,
      fortunes: this.fortunes,
      socials: this.socials,
    };

    const response = this.wasm.process_command(request);
    
    for (const line of response.lines) {
      this.term.write(line.text + '\r\n');
    }
    
    // Sync state
    this.state.cwd = response.next_state.cwd;
    this.state.user = response.next_state.user;
    this.state.loginState = response.next_state.login_state;
    this.state.isAuthenticated = response.next_state.is_authenticated;
    this.state.returnState = response.next_state.return_state;

    // Handle login transitions
    if (this.state.loginState === 'PROMPT' && !this.booted) {
      this.booted = true;
      this.printMotd();
    }
    
    this.printPrompt();
  }

  printPrompt() {
    const ps1 = `${this.state.user}@tecnoter:${this.state.cwd}$ `;
    this.term.write('\r\n' + ps1);
  }

  getTheme() { /* amber/green/bw themes */ }
}
```

### 2.3 Boot Integration

```javascript
// themes/tecnoter.io/static/js/terminal.js (replace)
import { TerminalShell } from './terminal-xterm.js';

let terminal;

export async function initTerminal() {
  const res = await fetch('/index.json');
  const index = await res.json();
  
  terminal = new TerminalShell();
  terminal.posts = index.posts;
  terminal.pages = index.pages;
  terminal.fortunes = index.fortunes;
  terminal.socials = index.socials;
  
  await terminal.init();
  terminal.mount(document.getElementById('terminal'));
  
  // Auto-boot
  terminal.executeCommand('_boot');
}
```

---

## Phase 3: Migration Steps

| Step | Action | Files |
|------|--------|-------|
| 1 | Create new `command.rs` with stateless API | `shell_wasm/src/command.rs` |
| 2 | Move command handlers to use `CommandState` | `shell_wasm/src/commands/*.rs` |
| 3 | Update `lib.rs` to export `process_command` | `shell_wasm/src/lib.rs` |
| 4 | Remove `shell.rs`, `state.rs` (keep types), `terminal.rs` | Delete |
| 5 | Add xterm.js deps, create `terminal-xterm.js` | `themes/tecnoter.io/static/js/` |
| 6 | Replace `terminal.js` with thin wrapper | `themes/tecnoter.io/static/js/terminal.js` |
| 7 | Update `system.js` to load index.json for WASM | `themes/tecnoter.io/static/js/system.js` |
| 8 | Test both modes | - |
| 9 | Clean old code | Delete `commands.js`, `bbs.js`, `listeners.js` |

---

## Effort

| Task | Effort |
|------|--------|
| WASM stateless API | 1 day |
| xterm.js wrapper | 0.5 days |
| Command migration | 1 day |
| Integration + test | 1 day |
| **Total** | **~3.5 days** |

---

## What Stays Same

- **Hub mode**: Hugo HTML, zero changes
- **index.json**: Generated by Hugo, consumed by both modes
- **Login flow**: JS-driven, WASM just validates
- **BBS**: JS menu, WASM provides content via `get_post()`
- **Themes/colors**: JS-controlled

---

## Rollback

Keep old `process_input` export during transition:
```rust
#[wasm_bindgen]
pub fn process_input(js_state: JsValue, input: &str) -> JsValue {
    // Convert old state → new request → process_command → convert response
}
```
Feature flag: `window.USE_XTERM = true/false`