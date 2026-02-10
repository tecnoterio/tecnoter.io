use crate::state::SystemState;
use js_sys::Date;

pub fn handle(_state: &SystemState) -> String {
    let d = Date::new_0();
    d.to_string().as_string().unwrap_or_else(|| "Error getting date".to_string())
}
