use crate::state::SystemState;
use crate::fs;

pub struct CdResult {
    pub message: String,
    pub new_path: String,
}

pub fn handle(state: &SystemState, args: Vec<&str>) -> CdResult {
    if args.is_empty() {
        return CdResult { message: String::new(), new_path: "/".to_string() };
    }

    let target = fs::resolve_path(&state.cwd, args[0]);

    if fs::get_directory_contents(&target).is_some() {
        CdResult { message: String::new(), new_path: target }
    } else {
        CdResult { message: format!("cd: no such directory: {}", args[0]), new_path: state.cwd.clone() }
    }
}
