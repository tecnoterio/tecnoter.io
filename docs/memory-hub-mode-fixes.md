# Hub Mode Fixes - Memory

## Key Issues Fixed

1. **Hub links not working**: Caused by timing issue where `state.pages` was empty when click handlers were attached (modules loaded before index.json fetch)

2. **Slug extraction bug**: `cmd.replace('cat ', '')` returned `"pages/services"` but `state.pages[i].slug` was just `"services"` - fixed to `path.split('/').pop()`

3. **Wrong redirect logic**: Redirect to `/#slug` happened for ALL internal pages - fixed to only apply to `/posts/` pages

4. **Wrong default mode**: Non-root pages incorrectly set to TERMINAL mode - fixed to use HUB mode for `/pages/` paths

5. **Forced TERMINAL mode**: Polling function always set `systemMode = 'TERMINAL'` - fixed to check if root page

## Theme Changes

- Renamed theme from `tecnoter.io` to `tecnoterio`
- Removed PaperMod and terminal themes (were unused third-party themes)
- Now only uses custom `tecnoterio` theme

## Hub Navigation CSS

To fix multi-column link display issues:

```css
.hub-main { 
  display: grid; 
  grid-template-columns: minmax(0, 1fr) 1.6fr; 
  gap: 40px; 
  max-width: 1400px;
  margin: 0 auto;
}

.hub-left { display: flex; flex-direction: column; }
.hub-nav { display: flex; flex-direction: column; gap: 20px; }
.nav-group { display: flex; flex-direction: column; gap: 5px; }
.nav-group h3 { margin: 5px 0; }

.hub-link, .retro-btn {
  display: block;
  padding: 10px 20px;
  /* ... */
}

#hub-posts-fallback, .hub-post-list { display: flex; flex-direction: column; }
.hub-footer-nav { display: flex; flex-direction: column; gap: 20px; }
```

## File Locations

- Layout: `themes/tecnoterio/layouts/partials/hub_frame.html`
- Terminal logic: `themes/tecnoterio/static/js/terminal.js`
- UI handlers: `themes/tecnoterio/static/js/fbui.js`
- Event listeners: `themes/tecnoterio/static/js/listeners.js`
- System state: `themes/tecnoterio/static/js/system.js`
- CSS: `themes/tecnoterio/static/css/terminal.css`
