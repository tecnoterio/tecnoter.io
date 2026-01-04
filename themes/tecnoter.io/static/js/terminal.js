// Try importing from modules, with fallback to global scope
let state, fs, VALID_USERS, input, output, print, getPS1, updatePrompt, run, initListeners;

try {
  // Import from modules if available
  import('/js/system.js').then(systemModule => {
    state = systemModule.state;
    fs = systemModule.fs;
    VALID_USERS = systemModule.VALID_USERS;
    
    // Auto-test for system default mode
    systemModule.checkCompatibility();
    
    import('/js/ui.js').then(uiModule => {
      input = uiModule.input;
      output = uiModule.output;
      print = uiModule.print;
      getPS1 = uiModule.getPS1;
      updatePrompt = uiModule.updatePrompt;
      
      initTerminal();
    }).catch(err => {
      console.error("UI module error:", err);
    });
  }).catch(err => {
    console.error("System module error:", err);
  });
} catch (e) {
  // Fallback to global objects
  if (window.terminalSystem) {
    state = window.terminalSystem.state;
    fs = window.terminalSystem.fs;
    VALID_USERS = window.terminalSystem.VALID_USERS;
  }
  
  if (window.terminalUI) {
    input = window.terminalUI.input;
    output = window.terminalUI.output;
    print = window.terminalUI.print;
    getPS1 = window.terminalUI.getPS1;
    updatePrompt = window.terminalUI.updatePrompt;
  }
  
  document.addEventListener('DOMContentLoaded', initTerminal);
}

/* -------------------------
   SESSIONS & LOGOUT
-------------------------- */

function logout() {
  state.loginState = "BOOT";
  state.currentUser = "guest";
  state.cwd = "/";
  updatePrompt();
  output.innerHTML = "";
  print("Session terminated. Logging out...");
  setTimeout(boot, 1000);
}

/* -------------------------
   BOOT SEQUENCE
-------------------------- */
async function boot() {
  state.loginState = "BOOT";
  updatePrompt();
  input.disabled = true;
  
  // Retro boot beep
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => oscillator.stop(), 150);
  } catch(e) {}

  const bootMessages = [
    "TECNOTER.IO(TM) CORE SYSTEM",
    "",
    "LOADING SYSTEM MODULES...",
    "NET_STACK: TCP/IP v6 READY",
    "SSH_DAEMON: LISTENING ON PORT 22",
    "HTTP_DAEMON: READY",
    "",
    "CONNECTING TO TECNOTER NETWORK...",
    "CARRIER 14400 / ARQ / V.32bis",
    "CONNECT 14400/REL - CD 1",
    "PROTOCOL: LAP-M",
    "COMPRESSION: V.42bis",
    "",
    "*** WELCOME TO THE TECNOTER.IO NODE ***",
    ""
  ];

  const hasHash = !!window.location.hash;
  const delay = hasHash ? 50 : 150; // Slower line simulation

  for (const msg of bootMessages) {
    print(msg);
    await new Promise(resolve => setTimeout(resolve, Math.random() * delay + (delay/2)));
  }

  startLoginProcess();
}

async function simulateTyping(text) {
  input.value = "";
  const body = document.body;
  
  for (let i = 0; i < text.length; i++) {
    input.value += text[i];
    
    // Trigger input event for dynamic width and cursor positioning
    input.dispatchEvent(new Event('input'));
    
    // Add random glitch effect during typing
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
  updatePrompt();
  input.disabled = false;
  input.focus();
  
  const indicator = print("", "auto-login-indicator");
  let timeLeft = 10;

  const updateIndicator = () => {
    const barWidth = 20;
    const filled = Math.round((10 - timeLeft) / 10 * barWidth);
    const bar = "[" + "=".repeat(filled) + ">" + " ".repeat(barWidth - filled) + "]";
    indicator.innerHTML = `Auto-login as 'guest' in ${timeLeft}s ${bar} <span class="skip-btn" id="skip-login">[Login Now]</span> <span class="skip-btn bbs-btn" id="bbs-login">[Enter BBS]</span>`;
    
    const skipBtn = document.getElementById('skip-login');
    if (skipBtn) {
        skipBtn.onclick = async () => {
          if (state.loginState === "LOGIN") {
            if (state.loginTicker) clearInterval(state.loginTicker);
            document.querySelectorAll(".auto-login-indicator").forEach(i => i.remove());
            await simulateTyping("guest");
            handleLogin('guest');
          }
        };
    }
    
    const bbsBtn = document.getElementById('bbs-login');
    if (bbsBtn) {
        bbsBtn.onclick = async () => {
          if (state.loginState === "LOGIN") {
            if (state.loginTicker) clearInterval(state.loginTicker);
            document.querySelectorAll(".auto-login-indicator").forEach(i => i.remove());
            await simulateTyping("bbs");
            handleLogin('bbs');
          }
        };
    }
  };

  updateIndicator();

  state.loginTicker = setInterval(async () => {
    timeLeft--;
    updateIndicator();
    if (timeLeft <= 0) {
      clearInterval(state.loginTicker);
      if (state.loginState === "LOGIN") {
        document.querySelectorAll(".auto-login-indicator").forEach(i => i.remove());
        await simulateTyping("guest");
        handleLogin("guest");
      }
    }
  }, 1000);
}

function isValidUser(user) {
  return VALID_USERS.includes(user.toLowerCase());
}

async function handleLogin(user) {
  if (state.loginTicker) clearInterval(state.loginTicker);
  const indicators = document.querySelectorAll(".auto-login-indicator");
  indicators.forEach(i => i.remove());
  
  const username = (user || "").toLowerCase().trim();

  if (state.loginState === "LOGIN") {
    if (!username) return;
    
    // Visually confirm the username
    print(username);
    
    // IMMEDIATELY clear the input to prevent accidental command execution
    input.value = "";

    if (!isValidUser(username)) {
      print("Login incorrect.");
      setTimeout(startLoginProcess, 1000);
      return;
    }

    state.currentUser = username;
    
    // For BBS or guest user, skip password
    if (username === "bbs" || username === "guest") {
      print("\n--- ACCESS GRANTED ---");
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Clear screen for a fresh shell/bbs start
      output.innerHTML = "";
      
      if (username === "bbs") {
        run("bbs");
      } else {
        finishLogin();
      }
      return;
    }
    
    // For other users, normal password flow
    state.loginState = "PASSWORD";
    updatePrompt();
    input.value = "";
    
    await new Promise(resolve => setTimeout(resolve, 800));
    print("********");
    finishLogin();
  }
}

function finishLogin() {
  state.loginState = "PROMPT";
  updatePrompt();
  print("Authentication successful.");
  print("Last login: " + new Date().toDateString() + " from 127.0.0.1");
  print("");
  
  const hasHash = !!window.location.hash;
  if (hasHash) {
    handleHash();
  } else {
    print(`Welcome to tecnoter.io BBS, ${state.currentUser}!`);
    print("Type 'help' to see available commands. Use Ctrl+D or 'logout' to exit.");
    print("");
  }
}

function handleHash() {
  const hash = window.location.hash.substring(1);
  if (hash) {
    print(`${getPS1()} cat ${hash}`);
    run(`cat ${hash}`);
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

// Initialize terminal with debugging
function initTerminal() {
  // Rare hardware "failure" artifacts
  setInterval(() => {
    const rand = Math.random();
    const body = document.body;
    
    if (rand < 0.01) { // 1% chance for strong flicker
      body.classList.add('strong-flicker');
      setTimeout(() => body.classList.remove('strong-flicker'), 500 + Math.random() * 1000);
    } else if (rand < 0.015) { // 0.5% chance for screen flash
      const flash = document.createElement('div');
      flash.classList.add('screen-flash');
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 200);
    }
  }, 10000);

  try {
    // Load commands module
    import('/js/commands.js').then(commandsModule => {
      run = commandsModule.run;
      
      // Load listeners module
      import('/js/listeners.js').then(listenersModule => {
        initListeners = listenersModule.initListeners;
        
        // Then fetch posts and initialize
        fetch("/posts/index.json")
          .then(r => r.json())
          .then(data => {
            state.posts = data;
            fs["/posts"] = state.posts.map(p => p.slug);
            
            initListeners({
              onLogout: logout,
              onLogin: handleLogin
            });
            
            boot();
          })
          .catch((err) => {
            console.error("Error loading posts:", err);
            
            print("Error loading system core.");
            initListeners({
              onLogout: logout,
              onLogin: handleLogin
            });
            boot();
          });
      }).catch(err => {
        console.error("Failed to load listeners module:", err);
      });
    }).catch(err => {
      console.error("Failed to load commands module:", err);
    });
  } catch (err) {
    console.error("Critical error during initialization:", err);
  }
}
