import { state, fs, resolvePath } from '/js/system.js';
import { input, output, print, getPS1, updatePrompt } from '/js/ui.js';
// Import man separately to avoid circular dependency
let run, man;

export function handleAutocomplete() {
  const val = input.value;
  const parts = val.split(" ");
  const lastWord = parts[parts.length - 1];
  const isCommand = parts.length === 1;

  if (isCommand) {
    const matches = Object.keys(man).filter(c => c.startsWith(lastWord));
    applyMatches(matches, parts, true);
  } else {
    let dirPath = state.cwd;
    let searchWord = lastWord;
    let pathPrefix = "";

    if (lastWord.includes("/")) {
      pathPrefix = lastWord.substring(0, lastWord.lastIndexOf("/") + 1);
      dirPath = resolvePath(pathPrefix);
      searchWord = lastWord.split("/").pop();
    }

    const pool = fs[dirPath] || [];
    const matches = pool.filter(f => f.startsWith(searchWord)).map(f => pathPrefix + f);
    applyMatches(matches, parts, false);
  }
}

function applyMatches(matches, parts, isCommand) {
  const originalLastWord = parts[parts.length - 1];
  if (matches.length === 0) {
    state.tabCount = 0;
  } else if (matches.length === 1) {
    const fullPath = resolvePath(matches[0]);
    const isDir = fs[fullPath];
    parts[parts.length - 1] = matches[0];
    input.value = parts.join(" ") + (isDir ? "/" : " ");
    state.tabCount = 0;
  } else {
    state.tabCount++;
    let prefix = matches[0];
    for (let i = 1; i < matches.length; i++) {
        while (!matches[i].startsWith(prefix)) {
            prefix = prefix.substring(0, prefix.length - 1);
        }
    }
    
    if (prefix.length > originalLastWord.length) {
      parts[parts.length - 1] = prefix;
      input.value = parts.join(" ");
    } else if (state.tabCount >= 2) {
      print(`${getPS1()} ${input.value}`);
      print(matches.map(m => m.split("/").pop()).join("  "), "cmd-list");
      state.tabCount = 0;
    }
  }
}

export function initListeners(handlers) {
  // Import dynamically to avoid circular dependency
  import('./commands.js').then(module => {
    run = module.run;
    man = module.man;
  });
  const { onLogout, onLogin } = handlers;

  // SYSTEM MODE TOGGLE LOGIC
  function setSystemMode(mode) {
    state.systemMode = mode;
    const terminal = document.getElementById('terminal');
    const hub = document.getElementById('low-tech-hub');
    const body = document.body;
    const knobTerminal = document.getElementById('knob-terminal');
    const knobHub = document.getElementById('knob-hub');

    if (mode === 'TERMINAL') {
      terminal.style.display = 'block';
      hub.style.display = 'none';
      body.classList.add('mode-terminal');
      knobTerminal.classList.add('active');
      knobHub.classList.remove('active');
    } else {
      terminal.style.display = 'none';
      hub.style.display = 'block';
      body.classList.remove('mode-terminal');
      knobTerminal.classList.remove('active');
      knobHub.classList.add('active');
      
      // Populate hub posts if in hub mode
      populateHubPosts();
    }
  }

  function populateHubPosts() {
    const hubPosts = document.getElementById('hub-posts');
    if (!hubPosts || state.posts.length === 0) return;
    
    hubPosts.innerHTML = "";
    state.posts.forEach(post => {
      const a = document.createElement('a');
      a.className = 'hub-link';
      a.href = 'javascript:void(0)';
      a.innerHTML = post.title;
      a.onclick = () => {
        setSystemMode('TERMINAL');
        import('/js/bbs.js').then(m => m.showBBSPost(post.slug));
      };
      hubPosts.appendChild(a);
    });
  }

  // Initial mode setup
  setTimeout(() => setSystemMode(state.systemMode), 100);

  // Hardware knobs listeners
  document.getElementById('knob-terminal')?.addEventListener('click', () => setSystemMode('TERMINAL'));
  document.getElementById('knob-hub')?.addEventListener('click', () => setSystemMode('HUB'));
  document.getElementById('revert-terminal')?.addEventListener('click', () => setSystemMode('TERMINAL'));

  // Hub link listeners for corporate data
  document.querySelectorAll('.hub-link[data-cmd]').forEach(link => {
    link.addEventListener('click', () => {
      const cmd = link.getAttribute('data-cmd');
      setSystemMode('TERMINAL');
      run(cmd);
    });
  });

  document.addEventListener("click", () => {
    if (!window.getSelection().toString()) {
      input.focus();
    }
  });

  input.addEventListener("input", () => {
    // Dynamic width to keep the custom block cursor tight
    input.style.width = Math.max(1, input.value.length) + "ch";
  });

  input.addEventListener("keydown", e => {
    const k = e.key.toLowerCase();
    const isBBS = state.loginState.startsWith("BBS");
    const isEmpty = input.value === "";

    if (state.loginState === "BBS_PAUSE") {
      e.preventDefault();
      state.loginState = "BBS_MAIN";
      import('./bbs.js').then(m => m.showBBSMainMenu());
      return;
    }

    // Single-key hotkeys for BBS mode
    if (isBBS && isEmpty && !e.ctrlKey && !e.altKey && !e.metaKey) {
      // Numerical keys handled by Enter, or instantly if we want. Let's keep it consistent.
      // We only intercept specific command characters.
      const bbsKeys = ["q", "m", "n", "p", "h", "r", "w", "x", "a", "l", "e", "s", "u", "b", "f", "t"];
      if (bbsKeys.includes(k) && k.length === 1) { // Ensure it's a single char, not 'ArrowUp' etc
        e.preventDefault();
        import('./bbs.js').then(m => m.handleBBSInput(k));
        return;
      }
    }

    if (e.key !== "Tab") {
      state.tabCount = 0;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      input.value = "";
      if (state.loginState.startsWith("BBS")) run("q");
      if (state.loginState === "MESSAGE" || state.loginState === "MAIL") run(""); // Cancel
    }

    if (e.ctrlKey) {
      const k = e.key.toLowerCase();
      if (k === "u") { e.preventDefault(); input.value = ""; }
      else if (k === "l") { e.preventDefault(); output.innerHTML = ""; if (state.loginState.startsWith("BBS")) run("m"); }
      else if (k === "c") { e.preventDefault(); if (state.loginState.startsWith("BBS")) run("q"); else if (state.loginState === "PROMPT") print(`${getPS1()} ${input.value}^C`); else print("^C"); input.value = ""; }
      else if (k === "w") { e.preventDefault(); const w = input.value.trimEnd().split(" "); w.pop(); input.value = w.join(" ") + (w.length > 0 ? " " : ""); }
      else if (k === "a") { e.preventDefault(); input.setSelectionRange(0, 0); }
      else if (k === "e") { e.preventDefault(); input.setSelectionRange(input.value.length, input.value.length); }
      else if (k === "d") { e.preventDefault(); onLogout(); }
    }

    if (e.key === "Enter") {
      const val = input.value.trim();
      input.value = ""; 
      input.style.width = "1ch"; // Reset width
      
      const terminalElement = document.getElementById("terminal");
      if (terminalElement) {
        requestAnimationFrame(() => {
          terminalElement.scrollTop = terminalElement.scrollHeight;
        });
      }
      
      if (state.loginState === "LOGIN") {
        onLogin(val);
        return;
      }

      if (state.loginState === "MESSAGE" || state.loginState === "MAIL" || state.loginState.startsWith("BBS") || state.loginState === "PROMPT") {
        if (state.loginState === "PROMPT") {
          if (!val) { print(getPS1()); return; }
          print(`${getPS1()} ${val}`);
        } else if (state.loginState.startsWith("BBS")) {
          print(`<span class="bbs-prompt">BBS Selection:</span> ${val}`);
        } else if (state.loginState === "MESSAGE") {
          print(`<span class="sysop-prompt">Message:</span> ${val}`);
        } else if (state.loginState === "MAIL") {
          print(`<span class="sysop-prompt">Mail:</span> ${val}`);
        }
        state.history.push(val);
        state.histIndex = state.history.length;
        run(val);
      }
    }

    if (state.loginState === "PROMPT") {
      if (e.key === "ArrowUp") { e.preventDefault(); state.histIndex = Math.max(0, state.histIndex - 1); input.value = state.history[state.histIndex] || ""; }
      if (e.key === "ArrowDown") { e.preventDefault(); state.histIndex = Math.min(state.history.length, state.histIndex + 1); input.value = state.history[state.histIndex] || ""; }
      if (e.key === "Tab") { e.preventDefault(); handleAutocomplete(); }
    }
  });
}
