import { state } from '/js/system.js';
// v4 - Refactored for dynamic Hugo content

/**
 * Fallback UI (FBUI) Logic
 * Handles rendering for the Low-Tech Hub mode
 */

export function renderHubContent(title, content) {
  const hubRight = document.querySelector('.hub-right');
  if (!hubRight) return;
  
  hubRight.innerHTML = `
    <h3>${title.toUpperCase()}</h3>
    <div class="hub-article-content">
      ${content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '<br>').join('')}
    </div>
    <div class="hub-footer-nav" style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
        <button class="hub-back" id="hub-back">« BACK TO INDEX</button>
    </div>
  `;

  document.getElementById('hub-back').onclick = () => populateHubPosts();
}

export function populateHubPosts() {
  const hubRight = document.querySelector('.hub-right');
  if (!hubRight) return;

  hubRight.innerHTML = `
    <h3>LATEST LOGS / POSTS</h3>
    <div id="hub-posts" class="hub-post-list"></div>
    <div class="hub-footer-nav" style="margin-top: 30px; border-top: 1px solid #333; padding-top: 20px;">
        <button class="hub-back" id="hub-back" style="display:none;">« BACK TO INDEX</button>
    </div>
  `;

  const hubPosts = document.getElementById('hub-posts');
  if (state.posts.length === 0) {
    hubPosts.innerHTML = "<p>No posts found.</p>";
    return;
  }
  
  state.posts.forEach(post => {
    const item = document.createElement('div');
    item.className = 'hub-post-item';
    
    const date = document.createElement('span');
    date.className = 'hub-post-date';
    date.textContent = `[${post.date}]`;
    
    const a = document.createElement('a');
    a.className = 'hub-post-link';
    a.href = 'javascript:void(0)';
    a.innerHTML = post.title;
    a.onclick = (e) => {
      e.preventDefault();
      const cleanUrl = post.url.endsWith('/') ? post.url : post.url + "/";
      fetch(cleanUrl + "index.json")
        .then(r => r.json())
        .then(data => renderHubContent(post.title, data.content))
        .catch(e => {
            renderHubContent("Error", "Could not load post content via uplink.");
        });
    };
    
    item.appendChild(date);
    item.appendChild(a);
    hubPosts.appendChild(item);
  });
}

// Global initialization for hub links
function initHubLinks() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachHubListeners);
    } else {
        attachHubListeners();
    }
    
    function attachHubListeners() {
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('.hub-link');
            if (link && link.dataset.cmd) {
                const cmd = link.dataset.cmd;
                if (cmd.startsWith('cat ')) {
                    // Extract the page slug from command (e.g., "cat pages/services" -> "services")
                    const path = cmd.replace('cat ', '');  // "pages/services"
                    const slug = path.split('/').pop();    // "services"
                    const page = state.pages.find(p => p.slug === slug);
                    if (page) {
                        e.preventDefault();
                        const cleanUrl = page.url.endsWith('/') ? page.url : page.url + "/";
                        fetch(cleanUrl + "index.json")
                            .then(r => r.json())
                            .then(data => renderHubContent(page.title, data.content))
                            .catch(() => renderHubContent("Error", "Could not load content area."));
                    }
                    // If page not found, allow default navigation (fallback to static page)
                } else if (cmd === 'bulletins') {
                    e.preventDefault();
                   populateHubPosts();
                }
                // If unknown cmd, allow default navigation
            }
            
            // Handle hub post links (static posts)
            const postLink = e.target.closest('.hub-post-link');
            if (postLink && postLink.href && postLink.href !== 'javascript:void(0)') {
                const url = postLink.href;
                const slug = url.split('/').filter(Boolean).pop();
                const page = state.pages.find(p => p.slug === slug);
                if (page) {
                    e.preventDefault();
                    fetch(url + "index.json")
                        .then(r => r.json())
                        .then(data => renderHubContent(postLink.textContent.trim(), data.content))
                        .catch(() => renderHubContent("Error", "Could not load post content via uplink."));
                } else {
                    // If page not found in state, show error but allow fallback
                    e.preventDefault();
                    renderHubContent("Error", "Post content not available. Please check your uplink connection.");
                }
            }
        });
    }
}

// Initialize immediately
initHubLinks();
