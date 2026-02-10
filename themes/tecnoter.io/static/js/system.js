// Setup debug mode detection
const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.has('debug') || window.location.hash.includes('debug');

// Add debug flag to be accessible throughout the application
window.DEBUG_MODE = isDebugMode;

// Setup objects for module context
const savedMode = sessionStorage.getItem('tecnoter_mode');
const defaultHistory = [
  "help",
  "ls -l /pages",
  "cat bio",
  "whoami",
  "date",
  "fortune",
  "bbs",
  "curl https://jsonplaceholder.typicode.com/posts/1"
];
const savedHistory = JSON.parse(localStorage.getItem('tecnoter_history') || JSON.stringify(defaultHistory));

window.getSystemDate = () => {
  return new Date().toString();
};

export const state = {
  cwd: "/",
  currentUser: "guest",
  loginState: "UNINITIALIZED", // BOOT, LOGIN, PASSWORD, PROMPT, MESSAGE
  posts: [],
  pages: [],
  socials: [],
  fortunes: [],
  systemInfo: {
    uptime: "unknown",
    loadAverage: "0.00, 0.00, 0.00",
    motdSuggestion: "Type 'help' to see available commands.",
    nodeName: "tecnoter.io",
    currentDate: ""
  },
  version: "2.0.26-LNX",
  history: savedHistory,
  histIndex: -1,
  tabCount: 0,
  loginTimeout: null,
  loginTicker: null,
  currentPostIndex: -1,
  mailRecipient: null,
  returnState: "PROMPT",
  systemMode: savedMode || (getIsInternal() ? "HUB" : "TERMINAL"), // Persistence > Context > Default
  booted: false,
  isAuthenticated: false,
  debugMode: false
};

export const VALID_USERS = ["guest", "bbs", "admin"];

export const fs = {};
export const virtualFiles = {}; // Added back as legacy empty object to prevent SyntaxErrors in cached browser sessions

export function resolvePath(path) {
  if (!path || path === ".") return state.cwd;
  if (path === "/") return "/";
  if (path === "..") return "/"; 
  let target = path.startsWith("/") ? path : (state.cwd === "/" ? "/" + path : state.cwd + "/" + path);
  target = target.replace(/\/+/g, "/");
  if (target.length > 1 && target.endsWith("/")) target = target.slice(0, -1);
  return target;
}

// AUTO-TEST FOR SYSTEM CAPABILITIES
export function checkCompatibility() {
  const hasCSSFilters = CSS.supports('filter', 'blur(1px)');
  const isLargeScreen = window.innerWidth > 600;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  
  console.log('checkCompatibility: hasCSSFilters=', hasCSSFilters, 'isLargeScreen=', isLargeScreen, 'isTouchDevice=', isTouchDevice);

  // If mobile or no CSS filter support, default to HUB mode
  if (!hasCSSFilters || !isLargeScreen || isTouchDevice) {
    state.systemMode = "HUB";
    return false;
  }
  
  state.systemMode = "TERMINAL";
  return true;
}

// Helper function to determine if we're on an internal page (like /posts/)
function getIsInternal() {
  const hashPath = window.location.hash.substring(1);
  return window.location.pathname.includes('/posts/') || (window.location.pathname.length > 1 && window.location.pathname !== "/") || (hashPath !== '' && hashPath !== 'index');
}

// Wasm integration
export let wasm = null;

export async function initWasm() {
  try {
    const module = await import('/js/wasm/tecnoter_shell.js');
    // Call default to initialize WASM, which sets the internal wasm variable
    await module.default();
    // Use the exports directly - process_input is the main function
    wasm = module;
    console.log("Wasm Shell initialized");
  } catch (e) {
    console.error("Wasm initialization failed:", e);
  }
}

export function syncState(newState) {
  if (!newState) return;
  Object.keys(newState).forEach(key => {
    state[key] = newState[key];
  });
}

export function processWithWasm(line) {
  if (!wasm) return false;
  
  if (state.systemInfo) {
    state.systemInfo.currentDate = new Date().toDateString();
  }
  const result = wasm.process_input(state, line);
  if (result && result.handled) {
     const { print, updatePrompt, output } = window.terminalUI || {};
     
     if (result.lines && result.lines.length > 0) {
        result.lines.forEach(lineObj => {
          if (window.DEBUG_MODE) console.log("WASM Line:", lineObj);
          if (lineObj.lineType === "clearScreen") {
            if (output) output.innerHTML = "";
            return;
          }
          
          if (lineObj.lineType === "internalInstruction") {
            window.dispatchEvent(new CustomEvent('internal-instruction', { detail: lineObj.text }));
            return;
          }

          if (print) print(lineObj.text, lineObj.lineType);
        });
     }
     syncState(result.state);
     if (window.terminalUI?.updateUplinkStatus) window.terminalUI.updateUplinkStatus();
     if (updatePrompt) updatePrompt();
     return true;
  }
  return false;
}

// Also make available globally for non-module context and debugging
window.terminalSystem = { 
  state, 
  VALID_USERS, 
  fs, 
  resolvePath, 
  initWasm,
  syncState,
  processWithWasm,
  get wasm() { return wasm; },
  ping: () => {
    if (!wasm) return "WASM not initialized";
    try {
      const res = wasm.process_input(state, "ping");
      return res?.lines?.[0]?.text || "No response from WASM";
    } catch (e) {
      return "WASM Error: " + e.message;
    }
  }
};
