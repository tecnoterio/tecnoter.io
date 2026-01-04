// Setup debug mode detection
const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.has('debug') || window.location.hash.includes('debug');

// Add debug flag to be accessible throughout the application
window.DEBUG_MODE = isDebugMode;

// Setup objects for module context
const state = {
  cwd: "/",
  currentUser: "guest",
  loginState: "BOOT", // BOOT, LOGIN, PASSWORD, PROMPT, MESSAGE
  posts: [],
  history: [],
  histIndex: -1,
  tabCount: 0,
  loginTimeout: null,
  loginTicker: null,
  currentPostIndex: -1,
  mailRecipient: null,
  returnState: "PROMPT",
  systemMode: "TERMINAL" // TERMINAL or HUB
};

const VALID_USERS = ["guest", "bbs", "admin"];

const fs = {
  "/": ["posts", "bio", "skills", "contact", "vision", "services", "team"],
  "/posts": []
};

// Virtual file contents for company pages
const virtualFiles = {
  "bio": {
    icon: "briefcase",
    title: "Company Biography",
    content: "Tecnoter.io was founded in 2024 with a single mission: to provide high-performance infrastructure and minimalist engineering for the modern web. We believe in speed, security, and retro-functional design."
  },
  "skills": {
    icon: "code",
    title: "Technical Deck",
    content: "Our expertise spans across: System Architecture, High-Availability Cloud Infrastructure, Hugo/Static Site Engineering, and Low-Level Performance Optimization."
  },
  "contact": {
    icon: "envelope",
    title: "Contact Protocol",
    content: "Primary Node: monitor.tecnoter.io\nEmail: contact@tecnoter.io\nSecure Comms: PGP-Key ID [REDACTED]"
  },
  "vision": {
    icon: "eye",
    title: "Corporate Vision",
    content: "To bridge the gap between the tactile history of computing and the scalable future of the decentralized web."
  },
  "services": {
    icon: "server",
    title: "Our Services",
    content: "1. 24/7 Managed Nodes\n2. Real-time Monitoring Systems\n3. High-Performance Static Deployments\n4. Legacy System Integration"
  },
  "team": {
    icon: "users",
    title: "The Crew",
    content: "SysOp Alpha: Lead Architect\nAdmin Beta: Network Specialist\nGuest Node: Exploration Protocol Activated"
  }
};

function resolvePath(path) {
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

  // If mobile or no CSS filter support, default to HUB mode
  if (!hasCSSFilters || !isLargeScreen || isTouchDevice) {
    state.systemMode = "HUB";
    return false;
  }
  
  state.systemMode = "TERMINAL";
  return true;
}

// Export for module context
export { state, VALID_USERS, fs, resolvePath, virtualFiles };

// Also make available globally for non-module context
window.terminalSystem = { state, VALID_USERS, fs, resolvePath, virtualFiles };
