# WASM as TTY Kernel - Migration Plan

## Vision

Replace custom terminal emulation with **WASM = PTY kernel** + **xterm.js = terminal emulator**.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (JS)                             │
│  ┌──────────────────┐    ┌──────────────────────────────────┐  │
│  │   xterm.js       │    │   App Shell (minimal)            │  │
│  │   - Terminal     │◄───│   - Boot sequence                │  │
│  │   - FitAddon     │    │   - Login flow                   │  │
│  │   - WebLinks     │    │   - BBS menu (optional)          │  │
│  │   - Search       │    │   - Theme/color switching        │  │
│  │   - Unicode11    │    │   - Persistence (sessionStorage) │  │
│  └────────┬─────────┘    └──────────────────────────────────┘  │
│           │                         ▲                            │
│     bytes │                         │ bytes                      │
│           ▼                         │                            │
│  ┌──────────────────┐               │                            │
│  │  WASM Module     │───────────────┘                            │
│  │  (TTY Kernel)    │    stdin/stdout/stderr + PTY API           │
│  │                  │                                             │
│  │  - PTY manager   │                                             │
│  │  - Process table │                                             │
│  │  - VFS (memfs)   │                                             │
│  │  - Builtins      │                                             │
│  │  - Syscalls      │                                             │
│  └──────────────────┘                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: WASM TTY Kernel (Rust)

### 1.1 Core Types

```rust
// shell_wasm/src/tty/types.rs
pub struct PtyId(pub u32);
pub struct Fd(pub u32);

pub enum PtyEvent {
    Output(PtyId, Vec<u8>),      // Child → terminal
    Exit(PtyId, i32),            // Process exited
    Resize(PtyId, Winsize),      // Terminal → kernel
}

pub struct Winsize {
    pub rows: u16,
    pub cols: u16,
    pub xpixel: u16,
    pub ypixel: u16,
}

pub struct Process {
    pub pid: PtyId,
    pub cmd: String,
    pub args: Vec<String>,
    pub env: HashMap<String, String>,
    pub cwd: String,
    pub stdin: Fd,
    pub stdout: Fd,
    pub stderr: Fd,
}
```

### 1.2 Kernel API (exports to JS)

```rust
// shell_wasm/src/tty/kernel.rs
#[wasm_bindgen]
pub struct TtyKernel {
    ptys: HashMap<PtyId, Pty>,
    next_pid: u32,
    vfs: Arc<MemFs>,
}

#[wasm_bindgen]
impl TtyKernel {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self { ... }

    // PTY lifecycle
    pub fn spawn(&mut self, cmd: &str, args: Vec<String>, cwd: &str, env: JsValue) -> PtyId { ... }
    pub fn kill(&mut self, pid: PtyId, sig: i32) -> Result<(), JsValue> { ... }
    pub fn wait(&mut self, pid: PtyId) -> Result<i32, JsValue> { ... }

    // I/O
    pub fn write_stdin(&mut self, pid: PtyId, data: &[u8]) -> Result<usize, JsValue> { ... }
    pub fn read_stdout(&mut self, pid: PtyId, buf: &mut [u8]) -> Result<usize, JsValue> { ... }
    pub fn read_stderr(&mut self, pid: PtyId, buf: &mut [u8]) -> Result<usize, JsValue> { ... }

    // Terminal control
    pub fn resize(&mut self, pid: PtyId, cols: u16, rows: u16) { ... }
    pub fn set_winsize(&mut self, pid: PtyId, ws: Winsize) { ... }

    // Event pump (call from JS animation frame)
    pub fn poll_events(&mut self) -> JsValue { ... }  // Returns array of PtyEvent

    // VFS access
    pub fn fs_read(&self, path: &str) -> Result<Vec<u8>, JsValue> { ... }
    pub fn fs_write(&mut self, path: &str, data: &[u8]) -> Result<(), JsValue> { ... }
    pub fn fs_list(&self, path: &str) -> Result<Vec<DirEntry>, JsValue> { ... }
    pub fn fs_stat(&self, path: &str) -> Result<Stat, JsValue> { ... }

    // Builtins (optional, for speed)
    pub fn builtin_ls(&self, args: Vec<String>) -> String { ... }
    pub fn builtin_cat(&self, args: Vec<String>) -> String { ... }
    // ... etc
}
```

### 1.3 Built-in Commands as Processes

```rust
// shell_wasm/src/tty/builtins.rs
pub fn spawn_builtin(kernel: &mut TtyKernel, name: &str, args: Vec<String>) -> PtyId {
    match name {
        "ls" => kernel.spawn_builtin(Box::new(LsBuiltin { args })),
        "cat" => kernel.spawn_builtin(Box::new(CatBuiltin { args })),
        "fortune" => kernel.spawn_builtin(Box::new(FortuneBuiltin)),
        "help" => kernel.spawn_builtin(Box::new(HelpBuiltin)),
        _ => return Err("not a builtin"),
    }
}

trait Builtin: Send {
    fn run(&mut self, kernel: &TtyKernel, stdout: &mut dyn Write, stderr: &mut dyn Write) -> i32;
    fn stdin(&mut self, data: &[u8]);  // for interactive builtins
}
```

### 1.4 Memory Filesystem (memfs)

```rust
// shell_wasm/src/tty/vfs.rs
use std::collections::HashMap;

pub struct MemFs {
    root: DirEntry,
}

pub enum DirEntry {
    File { content: Vec<u8>, mode: u32 },
    Dir { children: HashMap<String, DirEntry>, mode: u32 },
    Symlink { target: String },
}

// Pre-populated from Hugo's index.json at boot
impl MemFs {
    pub fn from_index_json(json: &str) -> Self { ... }
    pub fn read(&self, path: &str) -> Result<Vec<u8>> { ... }
    pub fn write(&mut self, path: &str, data: &[u8]) -> Result<()> { ... }
    pub fn list(&self, path: &str) -> Result<Vec<String>> { ... }
}
```

### 1.5 Dependencies to Add

```toml
# shell_wasm/Cargo.toml
[dependencies]
wasm-bindgen = "0.2"
serde = { version = "1.0", features = ["derive"] }
serde-wasm-bindgen = "0.6"
serde_json = "1.0"
js-sys = "0.3"
web-sys = { version = "0.3", features = ["console"] }
# New:
hashbrown = "0.14"     # faster HashMap for no_std compat
smallvec = "1.13"      # inline vec for small args
bitflags = "2.5"       # for file modes
```

---

## Phase 2: JS Terminal Shell (xterm.js)

### 2.1 Install

```bash
# In theme directory
npm init -y
npm install xterm @xterm/addon-fit @xterm/addon-web-links @xterm/addon-search @xterm/addon-unicode11
```

### 2.2 Terminal Wrapper

```javascript
// themes/tecnoter.io/static/js/terminal-xterm.js
import { Terminal } from 'xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { SearchAddon } from '@xterm/addon-search';
import { Unicode11Addon } from '@xterm/addon-unicode11';

export class WasmTerminal {
  constructor(kernel) {
    this.kernel = kernel;
    this.term = new Terminal({
      cursorBlink: true,
      fontFamily: '"IBM Plex Mono", "Fira Code", monospace',
      fontSize: 14,
      lineHeight: 1.4,
      letterSpacing: 0,
      theme: {
        background: '#0a0a0a',
        foreground: '#cccccc',
        cursor: '#ffb000',
        selection: 'rgba(255, 176, 0, 0.3)',
        black: '#1a1a1a',
        red: '#ff3333',
        green: '#00cc66',
        yellow: '#ffb000',
        blue: '#3399ff',
        magenta: '#cc66ff',
        cyan: '#00cccc',
        white: '#ffffff',
        brightBlack: '#444444',
        brightRed: '#ff6666',
        brightGreen: '#33ff99',
        brightYellow: '#ffcc33',
        brightBlue: '#66ccff',
        brightMagenta: '#ff99ff',
        brightCyan: '#33ffff',
        brightWhite: '#ffffff',
      },
      convertEol: true,
      scrollback: 10000,
      allowProposedApi: true,
    });

    this.fitAddon = new FitAddon();
    this.term.loadAddon(this.fitAddon);
    this.term.loadAddon(new WebLinksAddon());
    this.term.loadAddon(new SearchAddon());
    this.term.loadAddon(new Unicode11Addon());

    this.currentPty = null;
    this.outputBuffer = new Uint8Array(65536);
    this.stdinBuffer = [];
  }

  mount(element) {
    this.term.open(element);
    this.fitAddon.fit();
    window.addEventListener('resize', () => this.fitAddon.fit());

    // Input → WASM stdin
    this.term.onData(data => this.onInput(data));

    // Resize → WASM
    this.term.onResize(({ cols, rows }) => {
      if (this.currentPty) this.kernel.resize(this.currentPty, cols, rows);
    });

    // Start event pump
    this.pumpEvents();
  }

  onInput(data) {
    if (this.currentPty) {
      const encoder = new TextEncoder();
      this.kernel.write_stdin(this.currentPty, encoder.encode(data));
    }
  }

  async pumpEvents() {
    while (true) {
      await new Promise(r => requestAnimationFrame(r));
      const events = this.kernel.poll_events();
      for (const evt of events) {
        this.handleEvent(evt);
      }
    }
  }

  handleEvent(evt) {
    switch (evt.type) {
      case 'output':
        this.term.write(new TextDecoder().decode(evt.data));
        break;
      case 'exit':
        this.onExit(evt.pid, evt.code);
        break;
      case 'resize':
        // handled by fitAddon
        break;
    }
  }

  spawn(cmd, args = [], env = {}) {
    this.currentPty = this.kernel.spawn(cmd, args, state.cwd, env);
    return this.currentPty;
  }
}
```

### 2.3 Boot Sequence Integration

```javascript
// themes/tecnoter.io/static/js/boot.js
import { WasmTerminal } from './terminal-xterm.js';
import initWasm from './wasm/tecnoter_shell.js';

let kernel, terminal;

export async function boot() {
  // 1. Initialize WASM
  await initWasm();
  kernel = new window.TecnoterTtyKernel();  // exported from WASM

  // 2. Load index.json → populate VFS
  const res = await fetch('/index.json');
  const index = await res.json();
  kernel.fs_write('/.index.json', new TextEncoder().encode(JSON.stringify(index)));

  // 3. Mount terminal
  terminal = new WasmTerminal(kernel);
  terminal.mount(document.getElementById('terminal'));

  // 4. Run boot process (built-in _boot command)
  const bootPty = kernel.spawn('_boot', [], '/', {});
  terminal.currentPty = bootPty;

  // 5. After boot, start login
  kernel.spawn('_start_login', [], '/', {});
}
```

---

## Phase 3: Migration Strategy

### 3.1 Incremental Steps

| Step | Action | Risk |
|------|--------|------|
| 1 | Add `TtyKernel` struct alongside existing `process_input` | Low |
| 2 | Implement memfs + builtins (ls, cat, fortune, help) | Medium |
| 3 | Add xterm.js, create `WasmTerminal` wrapper | Low |
| 4 | Run both terminals side-by-side (feature flag) | Low |
| 5 | Migrate login flow to PTY-based | Medium |
| 6 | Migrate BBS to PTY app (separate process) | Medium |
| 7 | Remove old `terminal.js`, `commands.js`, `shell.rs` | High |
| 8 | Remove custom ANSI parsing from JS | Low |

### 3.2 Compatibility Layer

Keep `process_input` working during transition:

```rust
// shell_wasm/src/lib.rs - keep for backwards compat
#[wasm_bindgen]
pub fn process_input(js_state: JsValue, input: &str) -> JsValue {
  // Delegate to new kernel
  let mut kernel = KERNEL.lock().unwrap();
  let pid = kernel.spawn("_compat", vec![input], "/", JsValue::NULL);
  kernel.write_stdin(pid, input.as_bytes());
  kernel.write_stdin(pid, b"\n");
  
  // Collect output (blocking - only for compat)
  let mut out = Vec::new();
  loop {
    let events = kernel.poll_events();
    for evt in events {
      if let PtyEvent::Output(p, data) = evt { out.extend(data); }
      if let PtyEvent::Exit(p, code) if p == pid => {
        return serialize_compat_response(out);
      }
    }
  }
}
```

---

## Phase 4: Advanced Features (Post-Migration)

### 4.1 Session Persistence

```javascript
// Serialize xterm state + WASM kernel state
function saveSession() {
  return {
    term: terminal.term.buffer.active.serialize(),
    kernel: kernel.export_state(),  // custom WASM fn
    scrollback: terminal.term.buffer.active.getLines(0, 10000).map(l => l.translateToString()),
  };
}

function restoreSession(data) {
  terminal.term.buffer.active.deserialize(data.term);
  kernel.import_state(data.kernel);
}
```

### 4.2 Multi-Session (Tabs)

```javascript
// Each tab = separate PTY + xterm instance
class TabManager {
  tabs = [];
  
  newTab() {
    const term = new WasmTerminal(kernel);
    const pid = kernel.spawn('shell', [], '/', {});
    term.currentPty = pid;
    this.tabs.push({ term, pid });
  }
}
```

### 4.3 WebAssembly Component Model (Future)

- Split kernel into `wasi:cli/stdin`, `wasi:cli/stdout`, `wasi:filesystem`
- Run on WASI-compatible runtimes (Wasmtime, Wasmer, Cloudflare Workers)
- Enable server-side terminal sessions

---

## Effort Estimate

| Component | Lines | Effort |
|-----------|-------|--------|
| TtyKernel + PTY manager | ~400 | 2 days |
| Memfs + VFS | ~200 | 1 day |
| Builtins (ls, cat, help, fortune, etc.) | ~300 | 1 day |
| xterm.js wrapper | ~150 | 0.5 days |
| Boot/login integration | ~200 | 1 day |
| BBS as separate PTY app | ~300 | 1 day |
| Testing + cleanup | ~200 | 1 day |
| **Total** | **~1750** | **~7.5 days** |

---

## Dual-Mode Architecture (Critical Constraint)

The site has **two simultaneous modes** sharing the same WASM kernel:

### Hub Mode (Normal HTML)
- Hugo-rendered pages: `/posts/*`, `/pages/*`, `/`
- Static HTML + minimal JS for interactivity
- Content sourced from `index.json` at build time
- WASM role: **Data provider** - exposes `get_content(slug)`, `search(query)`, `list_posts()` via JS API

### Terminal Mode (CRT)
- xterm.js full-screen terminal
- Interactive commands: `ls`, `cat`, `bbs`, `fortune`, `whoami`, etc.
- WASM role: **Process kernel** - spawns PTY processes, manages stdin/stdout/stderr

### Shared Kernel Design

```rust
// shell_wasm/src/kernel.rs
#[wasm_bindgen]
pub struct TecnoterKernel {
    // Terminal mode
    tty: TtyKernel,
    
    // Hub mode - preloaded at boot
    content_index: ContentIndex,  // posts, pages, socials, fortunes
}

#[wasm_bindgen]
impl TecnoterKernel {
    // === Terminal mode API ===
    pub fn spawn(&mut self, ...) -> PtyId { ... }
    pub fn write_stdin(&mut self, ...) { ... }
    pub fn poll_events(&mut self) -> JsValue { ... }
    pub fn resize(&mut self, ...) { ... }
    
    // === Hub mode API (sync, no PTY) ===
    pub fn get_post(&self, slug: &str) -> JsValue { ... }
    pub fn get_page(&self, slug: &str) -> JsValue { ... }
    pub fn list_posts(&self) -> JsValue { ... }
    pub fn list_pages(&self) -> JsValue { ... }
    pub fn get_fortune(&self) -> JsValue { ... }
    pub fn get_socials(&self) -> JsValue { ... }
    pub fn search(&self, query: &str) -> JsValue { ... }
}
```

### JS Integration

```javascript
// themes/tecnoter.io/static/js/system.js
export async function initWasm() {
  const module = await import('/js/wasm/tecnoter_shell.js');
  await module.default();
  window.kernel = new module.TecnoterKernel();
  
  // Hub mode: preload content index
  const index = await fetch('/index.json').then(r => r.json());
  window.kernel.hub_load_index(JSON.stringify(index));
  
  return module;
}

// Hub mode usage (no terminal)
export function showContent(slug) {
  const post = window.kernel.get_post(slug);  // sync, instant
  if (post) renderHubArticle(post);
}

// Terminal mode usage
export function runCommand(line) {
  const pid = window.kernel.spawn('sh', ['-c', line], state.cwd, {});
  terminal.attachPty(pid);
}
```

### Mode Switching

| Trigger | Hub → Terminal | Terminal → Hub |
|---------|----------------|----------------|
| UI | Click "RE-ENGAGE CRT TERMINAL" | Click "SECURE PLAIN-TEXT HUB" |
| State | `sessionStorage.setItem('mode', 'TERMINAL')` | `sessionStorage.setItem('mode', 'HUB')` |
| Kernel | `kernel.spawn('login', ...)` | `kernel.kill_all_ptys()` |
| Content | Uses `kernel.get_post()` for `cat` | Preloaded in `kernel.content_index` |

### Boot Flow (Both Modes)

```mermaid
graph TD
    A[Page Load] --> B{mode from sessionStorage}
    B -->|TERMINAL| C[boot() → spawn _boot → spawn login]
    B -->|HUB| D[Render Hugo HTML]
    B -->|NONE| E[Default: TERMINAL on /, HUB on subpages]
    C --> F[WASM Kernel Ready]
    D --> F
    F --> G[kernel.hub_load_index(index.json)]
    G --> H[Both modes share kernel instance]
```

---

## Decision Points

1. **Sync vs async I/O**: WASM is single-threaded. Use asyncify (wasm-opt --asyncify) or explicit event pump?
2. **Builtins vs external processes**: Keep simple commands as builtins for speed; spawn WASM modules for complex ones?
3. **WASI preview 1 vs 2**: Target WASI 0.2 (component model) for future portability?
4. **Terminal size**: xterm.js ~200KB gzipped. Acceptable?

---

## Rollback Plan

If migration fails:
- Keep old `process_input` exported
- Feature flag `window.USE_XTERM = false`
- Old terminal.js still works unchanged
- No data loss (state format compatible)

---

## Next Steps

1. **Prototype**: Create `shell_wasm/src/tty/` with minimal kernel + 1 builtin (echo)
2. **Benchmark**: Measure WASM size increase (target < 500KB gzipped)
3. **Spike**: xterm.js + WASM event loop integration
4. **Decide**: Go/no-go based on prototype