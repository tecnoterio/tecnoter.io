import { state, wasm, syncState, processWithWasm } from '/js/system.js';
import { print, updatePrompt, output, input } from '/js/ui.js';

const BBS_WIDTH = 80;

export function handleBBSInput(line) {
  return processWithWasm(line);
}

export function enterBBS() {
  processWithWasm("bbs");
  setupBBSClicks();
  if (input) {
    input.disabled = false;
    input.focus();
  }
}

let clicksInitialized = false;

export function setupBBSClicks() {
  if (clicksInitialized) return;
  const out = document.getElementById('output');
  if (!out) return;
  
  out.addEventListener('click', (e) => {
    if (!state.loginState.includes('BBS')) return;
    const clickable = e.target.closest('.clickable-item');
    if (!clickable) return;
    
    const cmd = clickable.getAttribute('data-cmd');
    const postId = clickable.getAttribute('data-post-id');
    
    if (postId) {
      showBBSPost(state.posts[parseInt(postId)-1].slug);
    } else if (cmd) {
      handleBBSInput(cmd);
    }
    e.preventDefault();
  });
  clicksInitialized = true;
}

export function showBBSPost(slug) {
  if (!slug) return print("missing post name");
  const index = state.posts.findIndex(p => p.slug === slug);
  if (index === -1) return print("post not found");
  
  const post = state.posts[index];
  const url = post.url.endsWith('/') ? post.url + "index.json" : post.url + "/index.json";
  
  fetch(url)
    .then(r => r.json())
    .then(p => {
      if (output) output.innerHTML = "";
      processWithWasm(`_read_internal ${slug}`);
      print(p.content);
      print("\nPress any key to return...");
    })
    .catch(err => {
      print("Error loading content: " + err);
    });
}

export function showBBSMainMenu() {
    processWithWasm("m");
}
