import { state, fs, resolvePath, virtualFiles } from '/js/system.js';
import { print, updatePrompt, output, input } from '/js/ui.js';
import { handleBBSInput, enterBBS, showBBSMainMenu } from '/js/bbs.js';
import { showPost } from '/js/helpers.js';
import { ansi } from '/js/ansi.js';

export const man = {
  help: { desc: "Show available commands", usage: "help", history: "Standard tecnoter.io help facility." },
  ls: { desc: "List directory contents", usage: "ls [path]", history: "FileSystem navigation tool." },
  ansi: { desc: "Display random ANSI art", usage: "ansi", history: "Fetches historical .ans files." },
  whoami: { desc: "Display system user info", usage: "whoami", history: "Identifies cryptographic session owner." },
  who: { desc: "Show users currently online", usage: "who", history: "Real-time node monitoring." },
  stats: { desc: "Display system statistics", usage: "stats", history: "Hardware telemetry." },
  top: { desc: "System process monitor", usage: "top", history: "Real-time analytics." },
  uptime: { desc: "System availability timer", usage: "uptime", history: "Continuous operation timer." },
  cal: { desc: "Display current month calendar", usage: "cal", history: "Gregorian synchronization." },
  mail: { desc: "Send mail to another user", usage: "mail [username]", history: "Async messaging protocol." },
  matrix: { desc: "Experience the matrix", usage: "matrix", history: "Buffer stress test." },
  bbs: { desc: "Launch the BBS interface", usage: "bbs", history: "Primary interactive node center." },
  cat: { desc: "Show file content", usage: "cat [filename]", history: "Concatenate and print." },
  sl: { desc: "Steam Locomotive", usage: "sl", history: "Classic UNIX animation." },
  bounce: { desc: "Bouncing logo animation", usage: "bounce", history: "CRT beam sanity check." },
  flood: { desc: "Data stream simulation", usage: "flood", history: "I/O stress demonstration." },
  climate: { desc: "Weather station data", usage: "climate", history: "Exterior node telemetry." },
  fortune: { desc: "Random node wisdom", usage: "fortune", history: "UNIX fortune oracle." },
  cowsay: { desc: "Digital cow mascot", usage: "cowsay", history: "Legacy ASCII utility." }
};

export function run(line) {
  if (state.loginState === "MESSAGE") { handleMessageInput(line); return; }
  if (state.loginState === "MAIL") { handleMailInput(line); return; }

  const parts = line.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  const cmd = parts[0]?.toLowerCase();
  const args = parts.slice(1).map(a => a.replace(/"/g, ""));

  if (state.loginState.startsWith("BBS") && state.loginState !== "BBS_PAUSE") {
    if (handleBBSInput(line)) return;
  }

  if (!cmd) return;

  switch (cmd) {
    case "help":
      print("Available commands (type 'man [cmd]' for deep info):");
      const sortedCmds = Object.keys(man).sort();
      const printNext = (i) => {
        if (i < sortedCmds.length) {
          const c = sortedCmds[i];
          print(`  <span class="icon icon-${c}"></span><span class="cmd">${c.padEnd(10)}</span> - ${man[c].desc}`);
          setTimeout(() => printNext(i + 1), 20);
        }
      };
      printNext(0);
      break;
    case "man": showManPage(args[0]); break;
    case "ls":
      const targetDir = resolvePath(args[0] || "");
      if (fs[targetDir]) {
        const items = fs[targetDir];
        const outputLine = items.map(item => {
          const fullPath = (targetDir === "/" ? "" : targetDir) + "/" + item;
          if (fs[fullPath]) return `<span class="dir">${item}/</span>`;
          return `<span class="icon icon-${item}"></span><span>${item}</span>`;
        }).join("  ");
        print(outputLine || " ");
      } else {
        print(`ls: cannot access '${args[0]}': No such directory`);
      }
      break;
    case "cat":
      const catTarget = args[0] || "";
      if (virtualFiles[catTarget]) {
        const vf = virtualFiles[catTarget];
        print(`\nFILE: ${catTarget.toUpperCase()}`);
        print("-".repeat(20));
        print(vf.content);
        print("\n");
      } else {
        showPost(catTarget.replace(/^\/?posts\//, ""));
      }
      break;
    case "who": import('/js/bbs.js').then(m => m.showBBSUserList()); break;
    case "stats": import('/js/bbs.js').then(m => m.showBBSSystemStats()); break;
    case "bulletins": import('/js/bbs.js').then(m => m.showBBSBulletins()); break;
    case "files": import('/js/bbs.js').then(m => m.showBBSFileLibrary()); break;
    case "top": showTop(); break;
    case "uptime": showUptime(); break;
    case "cal": showCalendar(); break;
    case "whoami": print(`User: ${state.currentUser}\nHost: tecnoter.io\nAuth: SSH-RSA-2048`); break;
    case "matrix": matrix(); break;
    case "ansi": ansi(); break;
    case "bbs": enterBBS(); break;
    case "sl": sl(); break;
    case "bounce": bounce(); break;
    case "flood": flood(); break;
    case "climate": weather(); break;
    case "fortune": fortune(); break;
    case "cowsay": cowsay(); break;
    case "clear": output.innerHTML = ""; if(state.loginState.startsWith("BBS")) showBBSMainMenu(); break;
    case "mail": enterMailMode(args[0]); break;
    case "exit": print("Terminating session..."); setTimeout(() => { window.location.href = "about:blank"; }, 1000); break;
    default: if (cmd) print(`command not found: ${cmd}`);
  }
}

function showManPage(t) {
  if (!t || !man[t]) {
    print("Usage: man [command]. Try man node-1, man file-system, man network.");
    return;
  }
  const entry = man[t];
  output.innerHTML = "";
  print(`--- MANUAL PAGE: ${t.toUpperCase()} ---`, "bbs-title");
  print(`\nNAME\n    ${t} - ${entry.desc}`);
  print(`\nSYNOPSIS\n    ${entry.usage}`);
  print(`\nHISTORY\n    ${entry.history || "No historical logs found."}`);
  print("\nPress any key to return...");
  state.returnState = state.loginState.startsWith("BBS") ? "BBS_MAIN" : "PROMPT";
  state.loginState = "BBS_PAUSE";
}

function showTop() {
  print("\nPID  USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND", "ps1-symbol");
  print(" 001 root      20   0   12.4g   1.2g   0.4g S   0.5   2.1   0:42.13 tecnoter-relay");
  print(" 042 guest     20   0    2.5g   0.4g   0.1g R   4.2   0.8   0:05.12 matrix-calib");
  print("\nPress any key to return...");
  state.returnState = state.loginState.startsWith("BBS") ? "BBS_MAIN" : "PROMPT";
  state.loginState = "BBS_PAUSE";
}

function showUptime() {
  print(`\n ${new Date().toLocaleTimeString()} up 42 days, 13:07, 4 users, load average: 0.42, 0.38, 0.45\n`, "bbs-header");
  if (state.loginState.startsWith("BBS")) {
    print("Press any key to return...");
    state.returnState = "BBS_MAIN";
    state.loginState = "BBS_PAUSE";
  }
}

function showCalendar() {
  print("\n   Jan 2026\nSu Mo Tu We Th Fr Sa\n 1  2  3  4  5\n 6  7  8  9 10 11 12\n");
  if (state.loginState.startsWith("BBS")) {
    print("Press any key to return...");
    state.returnState = "BBS_MAIN";
    state.loginState = "BBS_PAUSE";
  }
}

export function matrix(fromBBS = false) {
  output.innerHTML = "";
  if (fromBBS) state.loginState = "BBS_PAUSE";
  let count = 0;
  const interval = setInterval(() => {
    let line = "";
    for (let i = 0; i < 80; i++) line += Math.floor(Math.random() * 10);
    print(line, "matrix-line");
    count++;
    if (count > 50 || (fromBBS && state.loginState !== "BBS_PAUSE")) { 
      clearInterval(interval); 
      if (fromBBS) { showBBSMainMenu(); state.loginState = "BBS_MAIN"; }
    }
  }, 50);
}

function fortune() {
  const fortunes = ["Success is a journey.", "Node 1 is active."];
  print(`\nFORTUNE: ${fortunes[Math.floor(Math.random() * fortunes.length)]}\n`);
  if (state.loginState.startsWith("BBS")) { state.returnState = "BBS_MAIN"; state.loginState = "BBS_PAUSE"; }
}

function cowsay() {
  print("<pre style='color: #5ff;'>  ^__^\n  (oo)\\_______\n  (__)\\       )\\/\\\n      ||----w |\n      ||     ||</pre>");
  if (state.loginState.startsWith("BBS")) { state.returnState = "BBS_MAIN"; state.loginState = "BBS_PAUSE"; }
}

function weather() {
  print("\nWEATHER: 24C | SUNNY\n");
  if (state.loginState.startsWith("BBS")) { state.returnState = "BBS_MAIN"; state.loginState = "BBS_PAUSE"; }
}

function sl() {
  print("<pre>      ====        ________\n  _D FE <  _______  |  |_|  |__\n |__  _|_|__| _ |_|__|      |\n   |_|      |_|      |_|______|</pre>");
  if (state.loginState.startsWith("BBS")) { state.returnState = "BBS_MAIN"; state.loginState = "BBS_PAUSE"; }
}

export function bounce() {
  output.innerHTML = "";
  let x = 0, y = 0, dx = 1, dy = 1;
  const logo = "[ TECNOTER ]";
  const interval = setInterval(() => {
    output.innerHTML = "\n".repeat(y) + " ".repeat(x) + logo;
    x += dx; y += dy;
    if (x > 40 || x < 0) dx = -dx;
    if (y > 15 || y < 0) dy = -dy;
    if (state.loginState !== "BBS_PAUSE") {
      clearInterval(interval);
      if (state.loginState.startsWith("BBS")) showBBSMainMenu();
    }
  }, 100);
  if (state.loginState.startsWith("BBS")) state.loginState = "BBS_PAUSE";
}

export function flood() {
  const interval = setInterval(() => {
    let line = "";
    for(let i=0; i<8; i++) line += Math.random().toString(16).substring(2, 10).toUpperCase() + " ";
    print(line, "matrix-line");
    if (state.loginState !== "BBS_PAUSE") {
      clearInterval(interval);
      if (state.loginState.startsWith("BBS")) showBBSMainMenu();
    }
  }, 50);
  if (state.loginState.startsWith("BBS")) { state.loginState = "BBS_PAUSE"; }
}

export function enterMailMode(recipient) {
  state.mailRecipient = recipient; state.loginState = "MAIL";
  updatePrompt();
}

function handleMailInput() { state.loginState = "PROMPT"; print("Mail sent."); }
function handleMessageInput() { state.loginState = "PROMPT"; print("Message sent."); }
