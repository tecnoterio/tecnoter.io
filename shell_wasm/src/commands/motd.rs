use crate::state::SystemState;

/// Handles the 'motd' (Message of the Day) command.
/// Dynamically constructs a welcome message including the user's name and company biography.
pub fn handle(state: &SystemState) -> String {
    let date_str = &state.system_info.current_date;

    format!(
        "SYSTEM SHELL READY\n\
         Authentication successful.\n\
         Last login: {} from 127.0.0.1\n\n\
         Welcome to tecnoter.io, {}!\n\n\
         [ SUGGESTION: {} ]\n\n\
         Type 'cat bio' to read the company biology.\n\
         Type 'help' to see available commands. Use Ctrl+D or 'logout' to exit.\n",
        date_str, state.current_user, state.system_info.motd_suggestion
    )
}
