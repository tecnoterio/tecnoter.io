# Development Notes

## Bug Fixes and Investigations

### Hub Links Not Working - Final Investigation

**Date:** 2/9/2026

**Issue:** Hub page links were not working when hub mode was enabled.

**Previous Session (Interrupted):**
User reported that hub page links were not working. Investigation showed fbui.js had `initHubLinks()` that registered click handlers for `.hub-link` and `.hub-post-link` elements. The module loads but the event listener wasn't being registered properly due to timing issues.

**Root Cause Analysis:**

The issue had THREE problems:

**Problem 1: Timing (state.pages empty)**
In `/themes/tecnoter.io/static/js/terminal.js`, modules were loaded via `Promise.all()` BEFORE the `fetch("/index.json")` completed. This meant:
1. `initListeners()` was called → attached click handler from fbui.js
2. Click handler tried `state.pages.find()` → returned `undefined` (empty array)
3. `e.preventDefault()` was called → blocked navigation
4. Nothing happened because state was empty

**Problem 2: Incorrect slug extraction**
In `/themes/tecnoter.io/static/js/fbui.js` line 87, the code did:
```javascript
const slug = cmd.replace('cat ', '');  // "cat pages/services" -> "pages/services"
const page = state.pages.find(p => p.slug === slug);  // "services" != "pages/services" → null!
```

But `state.pages[i].slug` is just `"services"`, not `"pages/services"`. So the find() always returned null.

**Problem 3: Incorrect e.preventDefault() logic**
The fbui.js click handler called `e.preventDefault()` BEFORE checking if `state.pages.find()` returned a page. This blocked navigation even when the page wasn't found.

**The Fixes Applied:**

**Fix 1: Reordered loading order in terminal.js**
```javascript
// NEW ORDER (fixed):
fetch("/index.json").then(data => {
  state.pages = data.pages || [];
  state.posts = data.posts || [];
  // ... fully populate state BEFORE modules load ...
  
  // Now load modules with state already ready
  Promise.all([ui, commands, listeners]).then(() => {
    initListeners({ onLogout: logout, onLogin: handleLogin });
  });
});
```

**Fix 2: Corrected slug extraction in fbui.js**
```javascript
// Extract the page slug from command (e.g., "cat pages/services" -> "services")
const path = cmd.replace('cat ', '');  // "pages/services"
const slug = path.split('/').pop();    // "services"
const page = state.pages.find(p => p.slug === slug);  // Now finds correctly!
```

**Fix 3: Only call `e.preventDefault()` if page found**
```javascript
if (cmd.startsWith('cat ')) {
    const slug = path.split('/').pop();
    const page = state.pages.find(p => p.slug === slug);
    if (page) {
        e.preventDefault();  // Only call if we can handle it
        fetch(...)...
    }
    // If page not found, allow default navigation (fallback to static page)
}
```

**Result:**
Hub links now work correctly:
- Clicking a hub link loads the page content via AJAX (when state is populated)
- If state is empty or page not found, fallback to static Hugo page navigation
- Hub pages at `/pages/*/` show the hub layout with full content
- Terminal only activates when explicitly switched to

### Hub Not Working on Subpages - Root Page Mode Detection

**Date:** 2/10/2026

**Issue:** User reported that all pages were redirecting to `/#page` and opening the terminal, instead of showing in hub mode.

**Root Cause Analysis:**

The issue had THREE contributing factors:

**Factor 1: Wrong index page detection**
The code used `isIndexPage = currentHash === '' || currentHash === 'index'` which would match any page without a hash (including `/pages/bio/`), not just the root page `/`.

**Factor 2: Incorrect redirect logic**
The redirect to `/#${slug}` was happening for ALL internal pages, not just posts. This meant `/pages/bio/` would redirect to `/#bio`.

**Factor 3: Terminal mode forced on all pages**
The polling function in hardware.html always set `window.terminalSystem.state.systemMode = 'TERMINAL'`, regardless of which page was loaded.

**The Fixes Applied:**

**Fix 1: Corrected root page detection in hardware.html**
```javascript
// OLD (wrong):
const currentHash = window.location.hash.substring(1);
const isIndexPage = currentHash === '' || currentHash === 'index';

// NEW (correct):
const currentHash = window.location.hash.substring(1);
const isIndexPage = currentHash === '' || currentHash === 'index';
const isRootPage = window.location.pathname === '/' || window.location.pathname === '';
```

**Fix 2: Fixed redirect to only apply to posts**
```javascript
// OLD (wrong):
if (window.isInternalPage && mode === 'TERMINAL') {
    const slug = window.location.pathname.split('/').filter(Boolean).pop();
    window.location.href = `/#${slug}`;
    return;
}

// NEW (correct):
if (window.isInternalPage && mode === 'TERMINAL' && window.location.pathname.includes('/posts/')) {
    const slug = window.location.pathname.split('/').filter(Boolean).pop();
    window.location.href = `/#${slug}`;
    return;
}
```

**Fix 3: Fixed polling function to set correct mode**
```javascript
// OLD (always TERMINAL):
if (window.terminalSystem?.state) {
    window.terminalSystem.state.systemMode = 'TERMINAL';
}

// NEW (check root page):
if (window.terminalSystem?.state) {
    if (isRootPage) {
        window.terminalSystem.state.systemMode = 'TERMINAL';
    } else {
        window.terminalSystem.state.systemMode = 'HUB';
    }
}
```

**Result:**
- `/` (root page): Shows in TERMINAL mode by default
- `/pages/bio/`, `/pages/services/`, etc.: Shows in HUB mode by default
- `/posts/hello-world/`: Can be shown in TERMINAL mode via hash navigation
- No unwanted redirects from hub pages
- Hub page links work correctly and show content in hub layout
