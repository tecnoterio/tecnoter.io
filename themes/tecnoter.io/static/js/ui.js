import { state } from './system.js';

export const output = document.getElementById("output");
export const input = document.getElementById("input");
export const promptElement = document.getElementById("prompt");

export function print(line = "", type = "") {
  const p = document.createElement("div");
  if (type) p.classList.add(type);
  p.innerHTML = line;
  output.appendChild(p);
  
  const terminalElement = document.getElementById("terminal");
  if (terminalElement) {
    // Scroll the entire terminal container to the bottom
    terminalElement.scrollTop = terminalElement.scrollHeight;
    
    // Ensure the new element is definitely in view after rendering
    requestAnimationFrame(() => {
      terminalElement.scrollTop = terminalElement.scrollHeight;
    });
  }
  
  return p;
}

export function getPS1() {
  return `<span class="ps1-user">${state.currentUser}</span><span class="ps1-at">@</span><span class="ps1-host">tecnoter.io</span><span class="ps1-colon">:</span><span class="ps1-path">${state.cwd}</span><span class="ps1-symbol">$</span>`;
}

export function updatePrompt() {
  if (state.loginState === "PROMPT") {
    promptElement.innerHTML = getPS1();
  } else if (state.loginState === "LOGIN") {
    promptElement.innerHTML = "tecnoter login: ";
  } else if (state.loginState === "PASSWORD") {
    promptElement.innerHTML = "Password: ";
  } else if (state.loginState === "BBS") {
    promptElement.innerHTML = `<span class="bbs-prompt">BBS Selection (1-${state.posts.length}, Q to Quit, M for Menu):</span> `;
  } else if (state.loginState === "MESSAGE") {
    promptElement.innerHTML = `<span class="sysop-prompt">Message to Admin:</span> `;
  } else if (state.loginState === "MAIL") {
    promptElement.innerHTML = `<span class="sysop-prompt">Mail to ${state.mailRecipient}:</span> `;
  } else {
    promptElement.innerHTML = "";
  }
}
