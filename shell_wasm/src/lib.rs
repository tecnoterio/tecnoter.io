use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

pub mod state;
pub mod shell;
pub mod commands;
pub mod bbs;
pub mod terminal;
pub mod fs;
pub mod completer;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WasmLine {
    pub text: String,
    pub line_type: String, // e.g., "regular", "bbs-border", "bbs-title", "bbs-row", "bbs-footer"
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WasmResponse {
    pub lines: Vec<WasmLine>,
    pub state: state::SystemState,
    pub handled: bool,
}

#[wasm_bindgen]
pub fn process_input(js_state: JsValue, input: &str) -> JsValue {
    let state_res: Result<state::SystemState, _> = serde_wasm_bindgen::from_value(js_state);
    
    let state = match state_res {
        Ok(s) => s,
        Err(e) => {
            web_sys::console::error_1(&format!("WASM: Critical state deserialization failure: {}", e).into());
            state::SystemState::default()
        }
    };
    
    let result = shell::process_input(state, input);
    
    let response = WasmResponse {
        lines: result.lines,
        state: result.next_state,
        handled: result.handled,
    };

    serde_wasm_bindgen::to_value(&response).unwrap()
}
