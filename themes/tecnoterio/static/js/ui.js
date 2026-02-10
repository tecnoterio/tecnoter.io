import { state } from '/js/system.js';

export let output, input, promptElement, suggestionElement;

export function initUIElements() {
  output = document.getElementById("output");
  input = document.getElementById("input");
  promptElement = document.getElementById("prompt");
  suggestionElement = document.getElementById("suggestion");
  
  if (output && input) {
    updatePrompt();
    return true;
  }
  return false;
}

// Initial attempt
initUIElements();

function initCheck() {
  if (!output || !input) {
    return initUIElements();
  }
  return true;
}

export function print(line = "", type = "") {
  if (!initCheck()) return null;
  
  const p = document.createElement("div");
  if (type) p.classList.add(type);
  p.innerHTML = line;
  output.appendChild(p);
  
  const terminalElement = document.getElementById("terminal");
  if (terminalElement) {
    terminalElement.scrollTop = terminalElement.scrollHeight;
  }
  
  return p;
}

export function getPS1() {
  return `<span class="ps1-user">${state.currentUser}</span><span class="ps1-at">@</span><span class="ps1-host">tecnoter.io</span><span class="ps1-colon">:</span><span class="ps1-path">${state.cwd}</span><span class="ps1-symbol">$</span>`;
}

export function updatePrompt() {
  if (!initCheck()) return;
  
  if (state.loginState === "PROMPT") {
    promptElement.innerHTML = getPS1();
  } else if (state.loginState === "LOGIN") {
    promptElement.innerHTML = "tecnoter login: ";
  } else if (state.loginState === "PASSWORD") {
    promptElement.innerHTML = "Password: ";
  } else if (state.loginState.startsWith("BBS")) {
    promptElement.innerHTML = `<span class="bbs-prompt">BBS Selection (1-${state.posts.length || 0}, Q to Quit, M for Menu):</span> `;
  } else if (state.loginState === "MESSAGE") {
    promptElement.innerHTML = `<span class="sysop-prompt">Message to Admin:</span> `;
  } else if (state.loginState === "MAIL") {
    promptElement.innerHTML = `<span class="sysop-prompt">Mail to ${state.mailRecipient}:</span> `;
  } else if (state.loginState === "UNINITIALIZED") {
    promptElement.innerHTML = `<span class="bbs-title">READY. CLICK TO ENGAGE.</span>`;
  } else {
    promptElement.innerHTML = "";
  }
}

export function updateUplinkStatus() {
  const wasmInstance = window.terminalSystem?.wasm;
  const lamp = document.getElementById('lamp-uplink');
  if (lamp) {
    if (wasmInstance) {
      lamp.classList.add('online');
    } else {
      lamp.classList.remove('online');
    }
  }
}

// Global registration to break circular dependencies
window.terminalUI = { print, updatePrompt, initUIElements, updateUplinkStatus, get output() { return output; }, get input() { return input; } };
