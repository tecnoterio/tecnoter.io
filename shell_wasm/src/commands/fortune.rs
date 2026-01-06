use crate::state::SystemState;
use js_sys::Math;

pub fn handle(state: &SystemState) -> String {
    if state.fortunes.is_empty() {
        return "Uplink silent (no fortunes loaded).".to_string();
    }

    let idx = (Math::random() * state.fortunes.len() as f64).floor() as usize;
    let fortune = state.fortunes.get(idx).cloned().unwrap_or_else(|| "Uplink silent.".to_string());
    
    format!("\nNODE WISDOM: {}", fortune)
}
