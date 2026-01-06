import { state, fs, resolvePath, wasm, syncState, processWithWasm } from '/js/system.js';
import { print, updatePrompt, output, input } from '/js/ui.js';
import { handleBBSInput, enterBBS } from '/js/bbs.js';
import { ansi } from '/js/ansi.js';

export const man = {
  help: { desc: "Show available commands", usage: "help" },
  ls: { desc: "List directory contents", usage: "ls [path]" },
  ansi: { desc: "Display random ANSI art", usage: "ansi" },
  whoami: { desc: "Display system user info", usage: "whoami" },
  stats: { desc: "Display system statistics", usage: "stats" },
  uptime: { desc: "System availability timer", usage: "uptime" },
  bbs: { desc: "Launch the BBS interface", usage: "bbs" },
  cat: { desc: "Show file content", usage: "cat [filename]" },
  mail: { desc: "Send mail to another user", usage: "mail [username]" },
  matrix: { desc: "Experience the matrix", usage: "matrix" },
  fortune: { desc: "Random node wisdom", usage: "fortune" },
  cowsay: { desc: "Digital cow mascot", usage: "cowsay" }
};

/**
 * showContent
 * Fetches and displays content from Hugo-generated JSON
 */
export function showContent(slug) {
  if (!slug) return print("missing content name");
  
  // Search both posts and pages
  const contentItem = state.posts.find(p => p.slug === slug) || 
                      state.pages.find(p => p.slug === slug);
                      
  if (!contentItem) return print("content not found: " + slug);
  
  const url = contentItem.url.endsWith('/') ? contentItem.url + "index.json" : contentItem.url + "/index.json";
  
  fetch(url)
    .then(r => r.json())
    .then(data => {
      print(`# ${contentItem.title}`);
      print("");
      print(data.content || data.body || "No content available.");
    })
    .catch(err => {
      print("Error loading content: " + err);
    });
}

export function run(line) {
  // Try Wasm first
  if (processWithWasm(line)) return;

  // JS Fallbacks 
  const parts = line.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  const cmd = parts[0]?.toLowerCase();

  if (!cmd) return;

  switch (cmd) {
    case "matrix": matrix(); break;
    case "ansi": ansi(); break;
    case "bbs": enterBBS(); break;
    default: if (cmd) print(`command not found: ${cmd}`);
  }
}

export function matrix(mode = "binary", fromBBS = false) {
  if (output) output.innerHTML = "";
  if (fromBBS) state.loginState = "BBS_PAUSE";
  
  const charSets = {
    binary: "01",
    ascii: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$#@%&",
    hex: "0123456789ABCDEF",
    tecnoter: "░▒▓█"
  };
  
  const chars = charSets[mode] || charSets.binary;
  
  let count = 0;
  const interval = setInterval(() => {
    let line = "";
    for (let i = 0; i < 80; i++) {
      line += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    print(line, "matrix-line");
    count++;
    if (count > 50 || (fromBBS && state.loginState !== "BBS_PAUSE")) { 
      clearInterval(interval); 
      if (fromBBS) handleBBSInput("m");
    }
  }, 50);
}

// Instruction Handler
window.addEventListener('internal-instruction', (e) => {
    const instruction = e.detail;
    if (instruction.startsWith("_FETCH_CONTENT_")) {
        const slug = instruction.replace("_FETCH_CONTENT_", "");
        showContent(slug);
    } else if (instruction.startsWith("_FETCH_POST_")) {
        const slug = instruction.replace("_FETCH_POST_", "");
        showContent(slug);
    } else if (instruction.startsWith("_MATRIX_")) {
        const mode = instruction.replace("_MATRIX_", "");
        matrix(mode);
    } else if (instruction === "matrix") {
        matrix();
    } else if (instruction === "ansi") {
        ansi();
    } else if (instruction.startsWith("_OPEN_URL_")) {
        const url = instruction.replace("_OPEN_URL_", "");
        window.open(url, '_blank');
    } else if (instruction === "_GET_CLOCK") {
        print(new Date().toString());
    } else if (instruction === "_GET_FORTUNE") {
        const fortunes = window.siteFortunes || [];
        const f = fortunes[Math.floor(Math.random() * fortunes.length)];
        print("\nNODE WISDOM: " + (f || "Uplink silent."));
    } else if (instruction === "exit") {
        print("Terminating session..."); 
        setTimeout(() => { window.location.href = "about:blank"; }, 1000);
    }
});
