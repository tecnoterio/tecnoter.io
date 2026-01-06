use wasm_bindgen::prelude::*;
use wasm_bindgen_futures::spawn_local;
use web_sys::{Request, RequestInit, RequestMode, Response};
use crate::state::SystemState;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = ["window", "terminalUI"])]
    fn print(text: &str, line_type: &str);
}

pub fn handle(_state: &SystemState, args: Vec<&str>) -> String {
    if args.is_empty() {
        return "Usage: curl [url]".to_string();
    }

    let url = args[0].to_string();
    let debug_mode = _state.debug_mode;
    
    // We launch an async task in the background
    spawn_local(async move {
        if debug_mode {
            web_sys::console::log_1(&format!("curl: fetching {}", url).into());
        }
        print(&format!("fetching {}...", url), "regular");
        
        let opts = RequestInit::new();
        opts.set_method("GET");
        opts.set_mode(RequestMode::Cors);

        let request = match Request::new_with_str_and_init(&url, &opts) {
            Ok(r) => r,
            Err(_) => {
                print("curl: invalid URL", "regular");
                return;
            }
        };

        let window = web_sys::window().unwrap();
        let resp_value = match wasm_bindgen_futures::JsFuture::from(window.fetch_with_request(&request)).await {
            Ok(v) => v,
            Err(_) => {
                print("curl: network error (CORS?)", "regular");
                return;
            }
        };

        let resp: Response = resp_value.dyn_into().unwrap();
        
        if !resp.ok() {
            web_sys::console::error_1(&format!("curl: error {} fetching {}", resp.status(), url).into());
            print(&format!("curl: error {}", resp.status()), "regular");
            return;
        }

        let text = match wasm_bindgen_futures::JsFuture::from(resp.text().unwrap()).await {
            Ok(t) => t.as_string().unwrap_or_default(),
            Err(_) => {
                print("curl: failed to parse response", "regular");
                return;
            }
        };

        // Clip long output
        let display_text = if text.len() > 2000 {
            format!("{}... [TRUNCATED]", &text[0..2000])
        } else {
            text
        };

        print(&display_text, "regular");
    });

    // Return immediately to the shell so the terminal isn't blocked
    "Establishing uplink...".to_string()
}
