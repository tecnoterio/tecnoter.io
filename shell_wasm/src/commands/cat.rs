use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;
use web_sys::{Request, RequestInit, RequestMode, Response};
use serde::Deserialize;
use crate::state::SystemState;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = ["window", "terminalUI"])]
    fn print(text: &str, line_type: &str);
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct HugoContent {
    pub title: String,
    pub content: String,
}

pub fn handle(state: &SystemState, args: Vec<&str>) -> String {
    if args.is_empty() {
        return "Usage: cat [filename]".to_string();
    }

    let input_path = args[0];
    let resolved_path = crate::fs::resolve_path(&state.cwd, input_path);
    
    // Determine the search key (the name of the file without leading slashes or dir prefixes)
    // We try to be permissive: "bio", "/pages/bio", "pages/bio" should all work.
    let search_slug = resolved_path.split('/').last().unwrap_or(input_path);

    // Search both pages and posts for a matching slug
    let target_item = state.pages.iter().find(|p| p.slug == search_slug || p.slug == input_path)
        .map(|p| (p.title.clone(), p.url.clone()))
        .or_else(|| {
            state.posts.iter().find(|p| p.slug == search_slug || p.slug == input_path)
                .map(|p| (p.title.clone(), p.url.clone()))
        });

    if let Some((title, item_url)) = target_item {
        let url = if item_url.ends_with('/') {
            format!("{}index.json", item_url)
        } else {
            format!("{}/index.json", item_url)
        };
        
        let display_title: String = title.clone();
        let debug_mode = state.debug_mode;

        spawn_local(async move {
            let opts = RequestInit::new();
            opts.set_method("GET");
            opts.set_mode(RequestMode::Cors);

            let window = web_sys::window().unwrap();
            if debug_mode {
                web_sys::console::log_1(&format!("cat: fetching {}", url).into());
            }
            
            let request = match Request::new_with_str_and_init(&url, &opts) {
                Ok(r) => r,
                Err(_) => {
                    print("cat: invalid request sequence", "regular");
                    return;
                }
            };
            
            let resp_value = match wasm_bindgen_futures::JsFuture::from(window.fetch_with_request(&request)).await {
                Ok(v) => v,
                Err(_) => {
                    print(&format!("cat: network error fetching {}", url), "regular");
                    return;
                }
            };

            let resp: Response = resp_value.dyn_into().unwrap();
            if !resp.ok() {
                web_sys::console::error_1(&format!("cat: error {} loading {}", resp.status(), url).into());
                print(&format!("cat: error {} loading {}", resp.status(), url), "regular");
                return;
            }

            let text_vec = wasm_bindgen_futures::JsFuture::from(resp.text().unwrap()).await;
            let text = text_vec.unwrap_or_default().as_string().unwrap_or_default();
            
            match serde_json::from_str::<HugoContent>(&text) {
                Ok(hugo) => {
                    print(&format!("\n# {}\n", hugo.title), "regular");
                    print(&hugo.content, "regular");
                },
                Err(e) => {
                    if debug_mode {
                        web_sys::console::error_1(&format!("cat: JSON parse error: {}", e).into());
                    }
                    // Fallback: print raw body if it looks like plain text
                    print(&text, "regular");
                }
            }
        });

        return format!("Reading {}...", display_title);
    }

    format!("cat: {}: No such file or directory", input_path)
}
