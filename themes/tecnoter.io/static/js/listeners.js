import { state, fs, resolvePath } from '/js/system.js';
import { input, output, print, getPS1, updatePrompt, suggestionElement } from '/js/ui.js';
import { renderHubContent, populateHubPosts } from '/js/fbui.js';

let run, man;

export function handleAutocomplete() {
  const val = input.value;
  const parts = val.split(" ");
  const isCommand = parts.length === 1;

  if (window.terminalSystem?.wasm) {
    const resp = window.terminalSystem.wasm.process_input(state, `_autocomplete ${val}`);
    if (resp && resp.lines && resp.lines[0]) {
      const matches = resp.lines[0].text ? resp.lines[0].text.split(" ").filter(Boolean) : [];
      applyMatches(matches, parts, isCommand);
    }
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
    input.style.width = Math.max(1, input.value.length) + "ch";
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
      input.style.width = Math.max(1, input.value.length) + "ch";
    } else if (state.tabCount >= 2) {
      print(`${getPS1()} ${input.value}`);
      print(matches.map(m => m.split("/").pop()).join("  "), "cmd-list");
      state.tabCount = 0;
    }
  }
}

// Global Engagement Listener (Top Level - always active)
document.addEventListener("click", () => {
  if (state.loginState === "UNINITIALIZED") {
    if (typeof window.terminalBoot === 'function') window.terminalBoot();
  }
  // Focus input if terminal is visible
  const input = document.getElementById("input");
  if (input && !window.getSelection().toString()) input.focus();
});

export function initListeners(handlers) {
  import('/js/commands.js').then(module => {
    run = module.run;
  });
  const { onLogout, onLogin } = handlers;

  function clearSuggestion() {
    if (suggestionElement) suggestionElement.textContent = "";
  }

  function triggerSuggestion() {
    if (!suggestionElement || state.loginState !== "PROMPT" || !input.value) {
      clearSuggestion();
      return;
    }
    if (window.terminalSystem?.wasm) {
      const resp = window.terminalSystem.wasm.process_input(state, `_suggest ${input.value}`);
      if (resp && resp.lines && resp.lines[0] && resp.lines[0].text) {
        const full = resp.lines[0].text;
        if (full.startsWith(input.value)) {
          suggestionElement.textContent = full.substring(input.value.length);
        } else {
          clearSuggestion();
        }
      } else {
        clearSuggestion();
      }
    }
  }

  function setSystemMode(mode) {
    state.systemMode = mode;
    sessionStorage.setItem('tecnoter_mode', mode);
    const terminal = document.getElementById('terminal');
    const hub = document.getElementById('low-tech-hub');
    const knobMode = document.getElementById('knob-mode');

    // If we are on a single post page and trying to engage terminal, 
    // we should redirect back to index with the hash so terminal can show the post.
    if (window.isInternalPage && mode === 'TERMINAL') {
        const slug = window.location.pathname.split('/').filter(Boolean).pop();
        window.location.href = `/#${slug}`;
        return;
    }

    if (mode === 'TERMINAL') {
      if(terminal) terminal.style.display = 'block';
      if(hub) hub.style.display = 'none';
      document.body.classList.add('mode-terminal');
      if (knobMode) {
        knobMode.classList.remove('mode-hub');
        knobMode.classList.add('mode-terminal');
        knobMode.classList.add('active');
      }
      
      // Trigger boot sequence if it hasn't finished or if re-engaging
      if (typeof window.terminalBoot === 'function' && state.loginState === "UNINITIALIZED") {
          window.terminalBoot();
      }
    } else {
      if(terminal) terminal.style.display = 'none';
      if(hub) hub.style.display = 'block';
      document.body.classList.remove('mode-terminal');
      if (knobMode) {
        knobMode.classList.remove('mode-terminal');
        knobMode.classList.add('mode-hub');
        knobMode.classList.remove('active');
      }
    }
  }

  function toggleMode() {
    const nextMode = state.systemMode === 'TERMINAL' ? 'HUB' : 'TERMINAL';
    setSystemMode(nextMode);
  }

  // LOGO HOME functionality
  const logoHome = document.getElementById('logo-home');
  const handleLogoHome = () => {
    if (window.isInternalPage) {
        window.location.href = "/";
        return;
    }
    setSystemMode('HUB');
  };
  logoHome?.addEventListener('click', handleLogoHome);
  logoHome?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleLogoHome();
    }
  });

  // Hardware knobs listeners
  const modeKnob = document.getElementById('group-mode') || document.getElementById('knob-mode');
  modeKnob?.addEventListener('click', toggleMode);
  
  // CHANNELS Knob functionality
  const channelsKnob = document.getElementById('group-channels') || document.getElementById('knob-channels');
  let currentChannelRotation = 0;
  channelsKnob?.addEventListener('click', () => {
    const knobEl = document.getElementById('knob-channels');
    currentChannelRotation = (currentChannelRotation + 45) % 360;
    if (knobEl) knobEl.style.transform = `rotate(${currentChannelRotation}deg)`;
    
    // Pick a "Channel" (Section) based on rotation
    const channelMap = {
        0: 'r',   // Posts
        45: 'b',  // Bulletins
        90: 'f',  // Files
        135: 's', // System
        180: 'u', // Users
        225: 'h', // Help
        270: 'm', // Menu
        315: 'ls' // Shell LS
    };

    const cmd = channelMap[currentChannelRotation];
    if (!cmd) return;

    if (state.loginState.startsWith("BBS")) {
        import('/js/bbs.js').then(m => m.handleBBSInput(cmd));
    } else if (state.loginState === "PROMPT") {
        const fullCmd = cmd === 'ls' ? 'ls' : `bbs ${cmd}`;
        run(fullCmd);
    }
  });

  // DEBUG Knob functionality
  const debugKnob = document.getElementById('group-debug') || document.getElementById('knob-debug');
  let currentDebugRotation = 0;
  debugKnob?.addEventListener('click', () => {
    const knobEl = document.getElementById('knob-debug');
    state.debugMode = !state.debugMode;
    currentDebugRotation = state.debugMode ? 45 : 0;
    if (knobEl) {
        knobEl.style.transform = `rotate(${currentDebugRotation}deg)`;
        knobEl.classList.toggle('active', state.debugMode);
    }
    print(`SYSTEM LOGS: ${state.debugMode ? "ENABLED" : "DISABLED"}`);
  });
  
  document.getElementById('revert-terminal')?.addEventListener('click', () => setSystemMode('TERMINAL'));

  setTimeout(() => setSystemMode(state.systemMode), 100);

  document.addEventListener("keydown", e => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      toggleMode();
    }
  });

  if (input) {
    input.addEventListener("input", () => {
      input.style.width = input.value.length + "ch";
      triggerSuggestion();
    });

    input.addEventListener("keydown", e => {
      const k = e.key.toLowerCase();
      const isBBS = state.loginState.startsWith("BBS");
      const isEmpty = input.value === "";

      if (state.loginState === "BBS_PAUSE") {
        e.preventDefault();
        state.loginState = "BBS_MAIN";
        import('/js/bbs.js').then(m => m.showBBSMainMenu());
        return;
      }

      if (isBBS && isEmpty && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const bbsKeys = ["q", "m", "n", "p", "h", "r", "w", "x", "a", "l", "e", "s", "u", "b", "f", "t"];
        if (bbsKeys.includes(k) && k.length === 1) {
          e.preventDefault();
          import('/js/bbs.js').then(m => m.handleBBSInput(k));
          return;
        }
      }

      if (e.key === "Escape") {
        e.preventDefault();
        input.value = "";
        input.style.width = "1ch";
        clearSuggestion();
        if (state.loginState.startsWith("BBS")) run("q");
      }

      if (e.ctrlKey) {
        if (k === "u") { e.preventDefault(); input.value = ""; input.style.width = "1ch"; clearSuggestion(); }
        else if (k === "c") { e.preventDefault(); clearSuggestion(); if (state.loginState === "PROMPT") print(`${getPS1()} ${input.value}^C`); else print("^C"); input.value = ""; input.style.width = "1ch"; }
        else if (k === "d") { e.preventDefault(); onLogout(); }
      }

      if (e.key === "Enter") {
        const val = input.value.trim();
        input.value = ""; 
        input.style.width = "1ch";
        clearSuggestion();
        if (state.loginState === "LOGIN") { onLogin(val); return; }
        if (isBBS || state.loginState === "PROMPT" || state.loginState === "PASSWORD") {
          if (state.loginState === "PROMPT" && val) {
            print(`${getPS1()} ${val}`);
            // Save to history
            state.history.push(val);
            if (state.history.length > 100) state.history.shift();
            state.histIndex = -1;
            localStorage.setItem('tecnoter_history', JSON.stringify(state.history));
          }
          run(val);
        }
      }

      if (state.loginState === "PROMPT") {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (state.history.length > 0) {
            if (state.histIndex === -1) state.histIndex = state.history.length - 1;
            else if (state.histIndex > 0) state.histIndex--;
            input.value = state.history[state.histIndex];
            input.style.width = Math.max(1, input.value.length) + "ch";
          }
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (state.histIndex !== -1) {
            if (state.histIndex < state.history.length - 1) {
              state.histIndex++;
              input.value = state.history[state.histIndex];
            } else {
              state.histIndex = -1;
              input.value = "";
            }
            input.style.width = Math.max(1, input.value.length) + "ch";
          }
        }
        if (e.key === "ArrowRight" || e.key === "Tab") {
          if (suggestionElement && suggestionElement.textContent) {
            e.preventDefault();
            input.value += suggestionElement.textContent;
            input.style.width = Math.max(1, input.value.length) + "ch";
            clearSuggestion();
            return;
          }
        }
      }
    });
  }
}
