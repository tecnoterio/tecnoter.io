use crate::state::SystemState;

pub fn handle(state: &SystemState) -> String {
    format!("up {}, 4 users, load average: {}", state.system_info.uptime, state.system_info.load_average)
}
