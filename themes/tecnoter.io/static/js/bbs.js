import { state } from '/js/system.js';
import { print, updatePrompt, output } from '/js/ui.js';

const BBS_WIDTH = 80;

/* -------------------------
   ANSI BOX HELPERS
-------------------------- */

function getBorder(type) {
    const chars = {
        top: ['╔', '═', '╗'],
        mid: ['╠', '═', '╣'],
        bot: ['╚', '═', '╝'],
        sep: ['╟', '─', '╢']
    };
    const c = chars[type];
    return c[0] + c[1].repeat(BBS_WIDTH - 2) + c[2];
}

function getLine(text, align = "left") {
    const plainText = text.replace(/<[^>]*>/g, "");
    const contentWidth = BBS_WIDTH - 4; 
    
    let line = "";
    if (align === "center") {
        const totalPadding = contentWidth - plainText.length;
        const padLeft = Math.max(0, Math.floor(totalPadding / 2));
        const padRight = Math.max(0, totalPadding - padLeft);
        line = " ".repeat(padLeft) + text + " ".repeat(padRight);
    } else {
        line = text + " ".repeat(Math.max(0, contentWidth - plainText.length));
    }
    
    return `║ ${line} ║`;
}

/* -------------------------
   BBS LOGIC
-------------------------- */

export function handleBBSInput(line) {
  const cmd = line.trim().toLowerCase();
  
  if (!cmd) {
    if (state.loginState === "BBS_MAIN") showBBSMainMenu();
    else if (state.loginState === "BBS_POSTS") showBBSPostList();
    else showBBSMainMenu();
    return true;
  }

  if (cmd === 'q') {
    exitBBS();
    return true;
  }
  
  if (cmd === 'm') {
    showBBSMainMenu();
    return true;
  }

  if (cmd === 'help' || cmd === '?' || cmd === 'h') {
    showBBSHelp();
    return true;
  }

  if (state.loginState === "BBS_MAIN") {
    if (cmd === 'r') {
      showBBSPostList();
      return true;
    }
    if (cmd === 'w') {
      handleBBSInput('whoami');
      return true;
    }
    if (cmd === 'x') {
      handleBBSInput('matrix');
      return true;
    }
    if (cmd === 'a') {
      handleBBSInput('ansi');
      return true;
    }
    if (cmd === 'e') {
      print("\nRecipient address: ");
      state.loginState = "BBS_MAIL_PROMPT";
      return true;
    }
    if (cmd === 's') {
      showBBSSystemStats();
      return true;
    }
    if (cmd === 'u') {
      showBBSUserList();
      return true;
    }
    if (cmd === 'b') {
      showBBSBulletins();
      return true;
    }
    if (cmd === 'f') {
      showBBSFileLibrary();
      return true;
    }
    if (cmd === '1') { handleBBSInput('fortune'); return true; }
    if (cmd === '2') { handleBBSInput('cowsay'); return true; }
    if (cmd === '3') { handleBBSInput('weather'); return true; }
    if (cmd === '4') { handleBBSInput('matrix'); return true; }
    if (cmd === '5') { handleBBSInput('ansi'); return true; }
    if (cmd === '6') { handleBBSInput('climate'); return true; }
  }

  if (state.loginState === "BBS_MAIL_PROMPT") {
    import('/js/commands.js').then(m => m.enterMailMode(line.trim()));
    return true;
  }

  if (state.loginState === "BBS_POSTS" || state.loginState === "BBS_READ") {
    if (cmd === 'l') {
      showBBSPostList();
      return true;
    }
    if (cmd === 'n') {
      showNextPost();
      return true;
    }
    if (cmd === 'p') {
      showPreviousPost();
      return true;
    }
  }

  if (cmd === 'whoami') {
    output.innerHTML = "";
    print(`User: ${state.currentUser}`); 
    print("Host: tecnoter.io"); 
    print("Shell: ttsh (Tecnoter Shell)");
    print("\nPress any key to return...");
    state.returnState = state.loginState.startsWith("BBS") ? "BBS_MAIN" : "PROMPT";
    state.loginState = "BBS_PAUSE";
    return true;
  }

  if (cmd === 'matrix') {
    import('/js/commands.js').then(m => m.matrix(true));
    return true;
  }

  if (cmd === 'ansi') {
    output.innerHTML = "";
    import('/js/ansi.js').then(m => m.ansi());
    print("\nPress any key to return...");
    state.returnState = state.loginState.startsWith("BBS") ? "BBS_MAIN" : "PROMPT";
    state.loginState = "BBS_PAUSE";
    return true;
  }

  // Check for numeric ID selection
  if (state.loginState === "BBS_POSTS" || state.loginState === "BBS_MAIN") {
    const index = parseInt(cmd) - 1;
    if (!isNaN(index) && index >= 0 && index < state.posts.length && /^\d+$/.test(cmd)) {
      showBBSPost(state.posts[index].slug);
      return true;
    }
  }

  return false;
}

export function enterBBS() {
  output.innerHTML = "";
  showBBSMainMenu();
  updatePrompt();
  setupBBSClicks();
}

let clicksInitialized = false;

// Setup click event delegation for BBS UI elements
export function setupBBSClicks() {
  if (clicksInitialized) return;
  // Use event delegation to handle clicks on the entire output area
  output.addEventListener('click', (e) => {
    if (!state.loginState.includes('BBS')) return;
    
    // Find closest clickable item
    const clickable = e.target.closest('.clickable-item');
    if (!clickable) return;
    
    // Get command from data attribute
    const cmd = clickable.getAttribute('data-cmd');
    
    // Handle post ID clicks
    const postId = clickable.getAttribute('data-post-id');
    
    if (postId) {
      // Execute command silently without adding to history
      showBBSPost(state.posts[parseInt(postId)-1].slug);
    } else if (cmd === 'read') {
      // Just visual feedback for the read command without action
      input.focus();
    } else if (cmd) {
      // Run the command
      handleBBSInput(cmd);
    }
    
    // Prevent default link behavior
    e.preventDefault();
  });
  clicksInitialized = true;
}

export function exitBBS() {
  if (state.currentUser === "bbs") {
      window.dispatchEvent(new CustomEvent('terminal-logout'));
  } else {
      state.loginState = "PROMPT";
      print("\nReturned to system shell.");
      updatePrompt();
  }
}

export function showBBSPost(slug) {
  if (!slug) return print("missing post name");
  const index = state.posts.findIndex(p => p.slug === slug);
  if (index === -1) return print("post not found");
  
  state.loginState = "BBS_READ";
  state.currentPostIndex = index;
  const post = state.posts[index];
  
  const url = post.url.endsWith('/') ? post.url + "index.json" : post.url + "/index.json";
  
  fetch(url)
    .then(r => r.json())
    .then(p => {
      output.innerHTML = "";
      print(getBorder('top'), "bbs-border");
      print(getLine(` READING: ${post.title.toUpperCase()} `, "center"), "bbs-title");
      print(getBorder('mid'), "bbs-border");
      
      const maxContentWidth = BBS_WIDTH - 8;
      const paragraphs = p.content.split("\n");
      
      paragraphs.forEach(para => {
        if (!para.trim()) {
           print(getLine(" "), "bbs-row");
           return;
        }
        
        const words = para.split(" ");
        let currentLine = "";
        words.forEach(word => {
            if ((currentLine + word).length < maxContentWidth) {
                currentLine += word + " ";
            } else {
                print(getLine("  " + currentLine.trim()), "bbs-row");
                currentLine = word + " ";
            }
        });
        if (currentLine) print(getLine("  " + currentLine.trim()), "bbs-row");
      });

      print(getBorder('mid'), "bbs-border");
      print(getLine("<span class=\"clickable-item\" data-cmd=\"p\">[P]rev</span>, <span class=\"clickable-item\" data-cmd=\"n\">[N]ext</span>, <span class=\"clickable-item\" data-cmd=\"l\">[L]ist</span>, <span class=\"clickable-item\" data-cmd=\"m\">[M]enu</span>, <span class=\"clickable-item\" data-cmd=\"q\">[Q]uit</span>", "center"), "bbs-footer");
      print(getBorder('bot'), "bbs-border");
      
      print("\nPress any key to return to list or use hotkeys...");
      state.returnState = "BBS_POSTS";
      state.loginState = "BBS_PAUSE";
    })
    .catch(err => {
      print("Error loading content: " + err);
      setTimeout(showBBSPostList, 2000);
    });
}

export function showBBSPostList() {
  state.loginState = "BBS_POSTS";
  output.innerHTML = ""; 
  
  print(getBorder('top'), "bbs-border");
  print(getLine(" SELECT A POST TO READ ", "center"), "bbs-title");
  print(getBorder('mid'), "bbs-border");
  print(getLine(" ID  │ DATE       │ TITLE"), "bbs-header");
  print(getBorder('sep'), "bbs-border");
  
  state.posts.forEach((p, i) => {
    const id = (i + 1).toString().padStart(2, ' ');
    const date = p.date || "2026-01-03";
    const title = (p.title || "").substring(0, BBS_WIDTH - 25);
    // Fixed column alignment by ensuring consistent spacing
    const row = `<span class="bbs-id clickable-item" data-post-id="${i+1}">${id}</span>   │ ${date} │ ${title}`;
    print(getLine(row), "bbs-row");
  });
  
  print(getBorder('mid'), "bbs-border");
  const cmds = `COMMANDS: <span class="clickable-item" data-cmd="read">(1-${state.posts.length})</span> Read, <span class="clickable-item" data-cmd="m">[M]ain Menu</span>, <span class="clickable-item" data-cmd="q">[Q]uit</span>`;
  print(getLine(cmds, "center"), "bbs-footer");
  print(getBorder('bot'), "bbs-border");
}

export function showBBSMainMenu() {
  state.loginState = "BBS_MAIN";
  output.innerHTML = ""; 
  
  const cow = [
    "  ^__^",
    "  (oo)\\_______",
    "  (__)\\       )\\/\\",
    "      ||----w |",
    "      ||     ||"
  ];

  const art = [
    " ████████╗███████╗ ██████╗███╗   ██╗ ██████╗",
    " ╚══██╔══╝██╔════╝██╔════╝████╗  ██║██╔═══██╗",
    "    ██║   █████╗  ██║     ██╔██╗ ██║██║   ██║",
    "    ██║   ██╔══╝  ██║     ██║╚██╗██║██║   ██║",
    "    ██║   ███████╗╚██████╗██║ ╚████║╚██████╔╝",
    "    ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═══╝ ╚═════╝"
  ];

  print(getBorder('top'), "bbs-border");
  
  // Print Logo and Cow side-by-side with fixed spacing
  art.forEach((line, i) => {
    const cowLine = cow[i] || "";
    // Clean up trailing spaces and combine
    const combined = line.padEnd(45, " ") + cowLine;
    print(getLine(combined, "center"), "bbs-title");
  });

  print(getLine(" "), "bbs-title");
  print(getLine("--- tecnoter.io Bulletin Board System v1.0.3 ---", "center"), "bbs-header");
  print(getBorder('mid'), "bbs-border");
  
  const menuOptions = [
    { key: "R", desc: "Read Posts / Post List", icon: "posts" },
    { key: "B", desc: "Bulletins & News", icon: "bulletins" },
    { key: "F", desc: "File Library", icon: "files" },
    { key: "S", desc: "System Statistics", icon: "stats" },
    { key: "U", desc: "User List (Who's Online)", icon: "who" },
    { key: "E", desc: "Send Electronic Mail", icon: "mail" },
    { key: "W", desc: "Who am I? (Session Info)", icon: "whoami" },
    { key: "1", desc: "Get a random tech fortune", cmd: "fortune", icon: "fortune" },
    { key: "2", desc: "Make the digital cow speak", cmd: "cowsay", icon: "cowsay" },
    { key: "3", desc: "Simulated weather report", cmd: "weather", icon: "weather" },
    { key: "4", desc: "Enter the Matrix", cmd: "matrix", icon: "matrix" },
    { key: "5", desc: "Random ANSI artwork", cmd: "ansi", icon: "ansi" },
    { key: "6", desc: "Detailed climate report", cmd: "climate", icon: "climate" },
    { key: "Q", desc: "Quit to System Shell", icon: "exit" }
  ];

  menuOptions.forEach(opt => {
    const cmdVal = opt.cmd || opt.key.toLowerCase();
    const iconSpan = opt.icon ? `<span class="icon icon-${opt.icon}"></span>` : "";
    const line = `<span class="bbs-id clickable-item" data-cmd="${cmdVal}">[${opt.key}]</span> ${iconSpan}${opt.desc}`;
    print(getLine(line), "bbs-row");
  });
  
  print(getBorder('mid'), "bbs-border");
  const cmds = `COMMANDS: <span class="clickable-item" data-cmd="r">[R]ead</span>, <span class="clickable-item" data-cmd="b">[B]ulletins</span>, <span class="clickable-item" data-cmd="f">[F]iles</span>, <span class="clickable-item" data-cmd="q">[Q]uit</span>`;
  print(getLine(cmds, "center"), "bbs-footer");
  print(getBorder('bot'), "bbs-border");
}

export function showBBSSystemStats() {
  output.innerHTML = "";
  print(getBorder('top'), "bbs-border");
  print(getLine(" SYSTEM STATISTICS ", "center"), "bbs-title");
  print(getBorder('mid'), "bbs-border");
  print(getLine("Node Name: tecnoter.io node 1"));
  print(getLine("Software: TT-BBS v2.0.26-LNX"));
  print(getLine("System Uptime: 42 days, 13 hours, 07 minutes"));
  print(getLine("Total Calls: 84,291"));
  print(getLine("Total Users: 1,024"));
  print(getLine("Active Nodes: 4"));
  print(getLine("Current Load: 0.42 0.38 0.45"));
  print(getBorder('mid'), "bbs-border");
  print(getLine("Press any key to return...", "center"), "bbs-footer");
  print(getBorder('bot'), "bbs-border");
  state.returnState = state.loginState.startsWith("BBS") ? "BBS_MAIN" : "PROMPT";
  state.loginState = "BBS_PAUSE";
}

export function showBBSUserList() {
  output.innerHTML = "";
  print(getBorder('top'), "bbs-border");
  print(getLine(" CURRENTLY ONLINE USERS ", "center"), "bbs-title");
  print(getBorder('mid'), "bbs-border");
  print(getLine(" NODE │ USERNAME     │ LOCATION       │ ACTION"));
  print(getBorder('sep'), "bbs-border");
  print(getLine("  01  │ guest        │ Local          │ Reading Bulletins"));
  print(getLine("  02  │ sysop        │ Remote         │ Maintenance"));
  print(getLine("  03  │ wizard       │ Unknown        │ matrix"));
  print(getLine("  04  │ cyber_pioneer│ Seattle, WA    │ Composing Mail"));
  print(getBorder('mid'), "bbs-border");
  print(getLine("Press any key to return...", "center"), "bbs-footer");
  print(getBorder('bot'), "bbs-border");
  state.returnState = state.loginState.startsWith("BBS") ? "BBS_MAIN" : "PROMPT";
  state.loginState = "BBS_PAUSE";
}

export function showBBSBulletins() {
  output.innerHTML = "";
  print(getBorder('top'), "bbs-border");
  print(getLine(" SYSTEM BULLETINS ", "center"), "bbs-title");
  print(getBorder('mid'), "bbs-border");
  print(getLine(" 1. 2026-01-01: Welcome to the New Year on tecnoter.io!"));
  print(getLine(" 2. 2026-01-02: System memory upgraded to 128GB."));
  print(getLine(" 3. 2026-01-03: New ANSI art collection added."));
  print(getLine(" 4. 2026-01-03: Mail routing issues resolved."));
  print(getBorder('mid'), "bbs-border");
  print(getLine("Press any key to return...", "center"), "bbs-footer");
  print(getBorder('bot'), "bbs-border");
  state.returnState = state.loginState.startsWith("BBS") ? "BBS_MAIN" : "PROMPT";
  state.loginState = "BBS_PAUSE";
}

export function showBBSFileLibrary() {
  output.innerHTML = "";
  print(getBorder('top'), "bbs-border");
  print(getLine(" FILE LIBRARY CATEGORIES ", "center"), "bbs-title");
  print(getBorder('mid'), "bbs-border");
  print(getLine(" [1] System Utilities & Drivers"));
  print(getLine(" [2] ANSI/ASCII Art Collections"));
  print(getLine(" [3] Telecommunications Software"));
  print(getLine(" [4] Retro Game Demos"));
  print(getLine(" [5] Text Files & G-Files"));
  print(getBorder('mid'), "bbs-border");
  print(getLine("Press any key to return...", "center"), "bbs-footer");
  print(getBorder('bot'), "bbs-border");
  state.returnState = state.loginState.startsWith("BBS") ? "BBS_MAIN" : "PROMPT";
  state.loginState = "BBS_PAUSE";
}

export function showNextPost() {
  const next = (state.currentPostIndex + 1) % state.posts.length;
  showBBSPost(state.posts[next].slug);
}

export function showPreviousPost() {
  const prev = (state.currentPostIndex - 1 + state.posts.length) % state.posts.length;
  showBBSPost(state.posts[prev].slug);
}

function showBBSHelp() {
  print("\n" + getBorder('top'), "bbs-border");
  print(getLine("--- BBS COMMAND LIST ---", "center"), "bbs-header");
  print(getBorder('sep'), "bbs-border");
  print(getLine("<span class=\"clickable-item\" data-cmd=\"1\">1-99</span> : Select a post by its ID"));
  print(getLine("<span class=\"clickable-item\" data-cmd=\"n\">N</span>    : Read next post"));
  print(getLine("<span class=\"clickable-item\" data-cmd=\"p\">P</span>    : Read previous post"));
  print(getLine("<span class=\"clickable-item\" data-cmd=\"m\">M</span>    : Refresh/Show the main post menu"));
  print(getLine("<span class=\"clickable-item\" data-cmd=\"q\">Q</span>    : Exit BBS and return to system prompt"));
  print(getLine("<span class=\"clickable-item\" data-cmd=\"h\">H</span> / <span class=\"clickable-item\" data-cmd=\"?\">?</span> : Show this help message"));
  print(getLine("--- System commands work here too! ---"), "bbs-footer");
  print(getBorder('bot'), "bbs-border");
}
