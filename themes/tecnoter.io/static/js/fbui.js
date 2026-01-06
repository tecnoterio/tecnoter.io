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
            // Fallback to searching in state.posts content if we had it, 
            // but usually we need to fetch the full content.
            renderHubContent("Error", "Could not load post content via uplink.");
        });
    };
    
    item.appendChild(date);
    item.appendChild(a);
    hubPosts.appendChild(item);
  });
}

// Global initialization for hub links
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('.hub-link');
        if (link && link.dataset.cmd) {
            e.preventDefault();
            const cmd = link.dataset.cmd;
            if (cmd.startsWith('cat ')) {
                const slug = cmd.replace('cat ', '');
                const page = state.pages.find(p => p.slug === slug);
                if (page) {
                    const cleanUrl = page.url.endsWith('/') ? page.url : page.url + "/";
                    fetch(cleanUrl + "index.json")
                        .then(r => r.json())
                        .then(data => renderHubContent(page.title, data.content))
                        .catch(() => renderHubContent("Error", "Could not load content area."));
                }
            } else if (cmd === 'bulletins') {
               populateHubPosts();
            }
            // Add other hub commands as needed
        }
    });
});

