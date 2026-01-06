import { state, fs, VALID_USERS, syncState, initWasm, wasm } from '/js/system.js';

/* -------------------------
   SESSIONS & LOGOUT
-------------------------- */

let audioCtx = null;
let input, output, print, getPS1, updatePrompt, initUIElements, run, initListeners;

async function beep(freq = 800, duration = 150) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), duration);
  } catch (e) {
    console.warn("Audio playback failed:", e);
  }
}

function logout() {
  state.loginState = "UNINITIALIZED";
  state.currentUser = "guest";
  state.cwd = "/";
  if (updatePrompt) updatePrompt();
  if (output) output.innerHTML = "";
  if (print) print("Session terminated. Logging out...");
  setTimeout(boot, 1000);
}

/* -------------------------
   BOOT SEQUENCE
-------------------------- */
async function boot() {
  state.loginState = "BOOT";
  if (updatePrompt) updatePrompt();
  if (input) input.disabled = true;
  
  if (audioCtx && audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  beep(800, 150);

  const currentWasm = window.terminalSystem?.wasm || wasm;

  if (currentWasm) {
    const response = currentWasm.process_input(state, "_boot");
    if (response && response.handled) {
      const hasHash = !!window.location.hash;
      const delay = hasHash ? 50 : 150;

      for (const lineObj of response.lines) {
        if (print) print(lineObj.text, lineObj.lineType);
        await new Promise(resolve => setTimeout(resolve, Math.random() * delay + (delay/2)));
      }
      
      if (response.state) {
        syncState(response.state);
        if (updatePrompt) updatePrompt();
      }
    }
  } else {
    if (print) {
        print("SYSTEM CORE: ASYNC LOADING...", "bbs-footer");
        await new Promise(r => setTimeout(r, 1000));
        print("TECNOTER.IO(TM) V2.0 (JS-FALLBACK)");
        print("WARNING: WASM CORE OFFLINE");
        print("");
    }
  }

  startLoginProcess();
}

async function simulateTyping(text) {
  if (!input) return;
  input.value = "";
  const body = document.body;
  
  for (let i = 0; i < text.length; i++) {
    input.value += text[i];
    input.dispatchEvent(new Event('input'));
    
    if (Math.random() > 0.8) {
      body.classList.add('glitch');
      setTimeout(() => body.classList.remove('glitch'), 50);
    }
    
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  }
  await new Promise(resolve => setTimeout(resolve, 500));
}

function startLoginProcess() {
  state.loginState = "LOGIN";
  if (updatePrompt) updatePrompt();
  if (input) {
    input.disabled = false;
    input.focus();
  }
  
  const indicator = print ? print("", "auto-login-indicator") : null;
  if (!indicator) return;

  let timeLeft = 10;

  const updateIndicator = () => {
    const barWidth = 20;
    const filled = Math.round((10 - timeLeft) / 10 * barWidth);
    const bar = "[" + "=".repeat(filled) + ">" + " ".repeat(barWidth - filled) + "]";
    indicator.innerHTML = `Auto-login as 'guest' in ${timeLeft}s ${bar} <span class="skip-btn" id="skip-login">[Login Now]</span> <span class="skip-btn bbs-btn" id="bbs-login">[Enter BBS]</span>`;
    
    const skipBtn = document.getElementById('skip-login');
    if (skipBtn) {
        skipBtn.onclick = async () => {
          if (state.loginTicker) clearInterval(state.loginTicker);
          document.querySelectorAll(".auto-login-indicator").forEach(i => i.remove());
          await simulateTyping("guest");
          handleLogin('guest');
        };
    }
    
    const bbsBtn = document.getElementById('bbs-login');
    if (bbsBtn) {
        bbsBtn.onclick = async () => {
          if (state.loginTicker) clearInterval(state.loginTicker);
          document.querySelectorAll(".auto-login-indicator").forEach(i => i.remove());
          await simulateTyping("bbs");
          handleLogin('bbs');
        };
    }
  };

  updateIndicator();

  state.loginTicker = setInterval(async () => {
    timeLeft--;
    updateIndicator();
    if (timeLeft <= 0) {
      clearInterval(state.loginTicker);
      document.querySelectorAll(".auto-login-indicator").forEach(i => i.remove());
      await simulateTyping("guest");
      handleLogin("guest");
    }
  }, 1000);
}

async function handleLogin(user) {
  if (state.loginTicker) clearInterval(state.loginTicker);
  document.querySelectorAll(".auto-login-indicator").forEach(i => i.remove());
  
  const username = (user || "").toLowerCase().trim();

  if (state.loginState === "LOGIN") {
    if (!username) return;
    state.loginState = "AUTHENTICATING";
    if (updatePrompt) updatePrompt();
    if (input) input.value = "";

    const currentWasm = window.terminalSystem?.wasm || wasm;
    if (currentWasm) {
      const response = currentWasm.process_input(state, `_login ${username}`);
      if (response && response.handled) {
        for (const lineObj of response.lines) {
          if (print) print(lineObj.text, lineObj.lineType);
        }

        if (response.state) {
          syncState(response.state);

          if (state.loginState === "LOGIN") {
             if (updatePrompt) updatePrompt();
             setTimeout(startLoginProcess, 1000);
          } else if (state.loginState === "PASSWORD") {
             if (updatePrompt) updatePrompt();
             await new Promise(resolve => setTimeout(resolve, 800));
          } else if (state.loginState === "PROMPT" || state.loginState === "BBS_MAIN") {
             // Success - finishLogin or enterBBS will update prompt after their MOTD
             if (state.loginState === "BBS_MAIN") {
                import('/js/bbs.js').then(m => m.enterBBS());
             } else {
                finishLogin();
             }
          }
        }
      }
    } else {
        state.currentUser = username;
        finishLogin();
    }
  }
}

function finishLogin() {
  state.loginState = "PROMPT";
  
  if (input) {
    input.value = "";
    input.disabled = false;
    input.focus();
    input.dispatchEvent(new Event('input'));
  }

  // Use WASM MOTD
  import('/js/commands.js').then(m => {
      m.run("motd");
      
      const hash = (window.location.hash || "").substring(1);
      // Don't cat bio if it's already in the motd
      if (hash && hash !== "bio") {
        handleHash();
      }
      if (updatePrompt) updatePrompt();
  });
}

function handleHash() {
  const hash = window.location.hash.substring(1);
  if (hash) {
    import('/js/commands.js').then(m => {
        if (print) print(`${getPS1()} cat ${hash}`);
        m.run(`cat ${hash}`);
    });
  }
}

window.addEventListener("hashchange", () => {
  if (state.loginState === "PROMPT") handleHash();
});

window.addEventListener("terminal-logout", () => {
  logout();
});

/* -------------------------
   INIT
-------------------------- */

function initTerminal() {
  setInterval(() => {
    const rand = Math.random();
    const body = document.body;
    if (rand < 0.01) {
      body.classList.add('strong-flicker');
      setTimeout(() => body.classList.remove('strong-flicker'), 500 + Math.random() * 1000);
    }
  }, 10000);

  // Dynamic imports inside init function to break early circular dependency chains
  Promise.all([
    import('/js/ui.js'),
    import('/js/commands.js'),
    import('/js/listeners.js')
  ]).then(([uiModule, commandsModule, listenersModule]) => {
    // Capture from UI
    initUIElements = uiModule.initUIElements;
    print = uiModule.print;
    updatePrompt = uiModule.updatePrompt;
    getPS1 = uiModule.getPS1;
    
    // Capture from Commands
    run = commandsModule.run;
    
    // Capture from Listeners
    initListeners = listenersModule.initListeners;

    // Initialize UI
    if (!initUIElements()) {
       console.warn("UI elements not found during initTerminal");
    }
    
    // Sync references
    input = uiModule.input;
    output = uiModule.output;

    fetch("/index.json")
      .then(r => r.json())
      .then(data => {
        state.posts = data.posts || [];
        state.pages = data.pages || [];
        state.socials = data.socials || window.siteSocial || [];
        state.fortunes = data.fortunes || window.siteFortunes || [];
        state.systemInfo = data.systemInfo || state.systemInfo;
        state.systemInfo.currentDate = new Date().toDateString();
        
        // Update virtual fs for completions if needed
        fs["/posts"] = state.posts.map(p => p.slug);
        fs["/pages"] = state.pages.map(p => p.slug);
        
        const allTags = [...new Set([...state.posts.flatMap(p => p.tags || []), ...state.pages.flatMap(p => p.tags || [])])];
        const allCats = [...new Set([...state.posts.flatMap(p => p.categories || []), ...state.pages.flatMap(p => p.categories || [])])];
        
        fs["/tags"] = allTags;
        fs["/categories"] = allCats;
        fs["/"] = ["posts", "pages", "tags", "categories", ...state.pages.map(p => p.slug)];
        
        allTags.forEach(tag => {
            fs[`/tags/${tag}`] = [
                ...state.posts.filter(p => p.tags?.includes(tag)).map(p => p.slug),
                ...state.pages.filter(p => p.tags?.includes(tag)).map(p => p.slug)
            ];
        });
        
        allCats.forEach(cat => {
            fs[`/categories/${cat}`] = [
                ...state.posts.filter(p => p.categories?.includes(cat)).map(p => p.slug),
                ...state.pages.filter(p => p.categories?.includes(cat)).map(p => p.slug)
            ];
        });
        
        initListeners({ onLogout: logout, onLogin: handleLogin });
        
        // Only auto-boot on the index page if in terminal mode
        if (state.systemMode === 'TERMINAL' && !window.isInternalPage) {
            boot();
        } else {
            // In HUB mode or internal page, just ready the gateway
            print("KERNEL LOADED (JS-WASM GATEWAY ONLINE)", "bbs-footer");
        }
      })
      .catch((err) => {
        console.error("Error loading system content:", err);
        initListeners({ onLogout: logout, onLogin: handleLogin });
        if (state.systemMode === 'TERMINAL') boot();
      });
  }).catch(err => {
    console.error("Module loading sequence failed:", err);
  });
}

window.terminalBoot = boot;
// Start everything
initWasm().then(() => {
    // Proactive sync of uplink lamp after wasm load
    setTimeout(() => {
      if (window.terminalUI?.updateUplinkStatus) {
          window.terminalUI.updateUplinkStatus();
      }
    }, 100);
    initTerminal();
}).catch(err => {
    console.error("Critical System Error:", err);
});
