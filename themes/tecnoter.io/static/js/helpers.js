// Self-contained helper module with no circular dependencies
import { state } from './system.js';
import { print } from './ui.js';

// Create a standalone post display function
export function showPost(slug) {
  if (!slug) return print("missing post name");
  const post = state.posts.find(p => p.slug === slug);
  if (!post) return print("post not found");
  
  const url = post.url.endsWith('/') ? post.url + "index.json" : post.url + "/index.json";
  
  fetch(url)
    .then(r => r.json())
    .then(p => {
      print(`# ${post.title}`);
      print("");
      print(p.content);
    })
    .catch(err => {
      print("Error loading content: " + err);
    });
}

// Export other common functions that might cause circular dependencies