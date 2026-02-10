use crate::state::SystemState;

pub fn handle(state: &SystemState) -> String {
    format!("User: {}\nHost: tecnoter.io\nShell: ttsh-rust\nStatus: AUTHENTICATED\nProtocol: ENCRYPTED-WASM/1.0", state.current_user)
}
