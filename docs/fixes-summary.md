# Hub Mode Fixes - Summary

- [completed] Restore retro button styles to Tecnoter.io site

## Main Issue Investigated and Fixed

**Problem:** Hub page links were not working when hub mode was enabled. Users clicking hub links would navigate away but the terminal would open instead of showing the content in hub mode.

**Root Causes Found:**
1. **Timing Issue:** `state.pages` was empty when the click handler was attached because modules loaded before `index.json` was fetched
2. **Incorrect Slug Extraction:** `cmd.replace('cat ', '')` returned `"pages/services"` but `state.pages[i].slug` was just `"services"`
3. **Wrong Redirect Logic:** Redirect to `/#slug` happened for ALL internal pages, not just posts
4. **Wrong Default Mode:** Non-root pages were incorrectly set to TERMINAL mode instead of HUB mode
5. **Forced TERMINAL Mode:** Polling function always set `systemMode = 'TERMINAL'` regardless of page

**Fixes Applied:**
1. Reordered `terminal.js` to fetch `index.json` BEFORE loading modules
2. Fixed slug extraction in `fbui.js`: `path.split('/').pop()` 
3. Only call `e.preventDefault()` if page is found in `state.pages`
4. Added `isRootPage` check in `hardware.html` to only show terminal on `/`
5. Fixed redirect to only apply to `/posts/` pages, not `/pages/`
6. Fixed polling function to set HUB mode for non-root pages

## Files Modified and Committed

**Committed (6 commits):**
1. `themes/tecnoter.io/static/js/fbui.js` - Slug extraction, e.preventDefault fix
2. `themes/tecnoter.io/static/js/listeners.js` - Redirect fix for posts only
3. `themes/tecnoter.io/static/js/terminal.js` - Loading order fix
4. `themes/tecnoter.io/static/js/system.js` - Added `getIsInternal()` helper
5. `themes/tecnoter.io/layouts/partials/hardware.html` - Root page detection, mode setting
6. `themes/tecnoter.io/layouts/partials/hub_frame.html` - Hub links with data-cmd
7. `themes/tecnoter.io/static/css/terminal.css` - Retro button and control styles
8. `docs/development.md` - Bug analysis documentation
9. `content/pages/services.md` - New content page
10. `content/pages/team.md` - Deleted
11. `themes/tecnoter.io/layouts/index.html` - Minor layout change
12. `themes/tecnoter.io/static/assets/tt_logo_hor.svg` - SVG update

**Remaining to Commit:**
- `themes/terminal` - Submodule (can be ignored)

**Untracked Files (not for commit):**
- `.hugo_build.lock`, `archetypes/`, `data/`, `layouts.custom.backup/`, `public/`
- `shell_wasm/target/`, `static/`

## Server Running
- Server is running at `http://localhost:1313/`
- Hot-reload enabled for static files
- WASM rebuilt successfully

## Known Behavior After Fixes
- `/` (root): Shows TERMINAL mode by default
- `/pages/bio/`, `/pages/services/`, etc.: Shows HUB mode by default, shows content in hub layout
- `/posts/hello-world/`: Can be shown in TERMINAL mode via hash navigation (e.g., `/#hello-world`)
- No unwanted redirects from hub pages
- Hub page links work correctly with AJAX fetch when state is populated, fallback to static pages when not

## Commands Used
- `make build-wasm` - Build WASM
- `make serve` - Start Hugo server
- `git commit` - Commit changes with descriptive messages
