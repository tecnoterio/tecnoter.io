use crate::state::SystemState;
use crate::fs;

pub fn get_completions(state: &SystemState, input: &str) -> Vec<String> {
    let parts: Vec<&str> = input.split_whitespace().collect();
    
    // 1. Command completion (only if we have 1 part and no trailing space)
    if parts.len() == 1 && !input.ends_with(' ') {
        let cmd_prefix = parts[0].to_lowercase();
        let commands = vec!["help", "ls", "whoami", "fortune", "cowsay", "uptime", "weather", "bbs", "cat", "mail", "msg", "message", "clear", "matrix", "ansi", "exit", "man", "top", "who", "ping", "social", "date", "motd", "curl"];
        return commands.into_iter()
            .filter(|c| c.starts_with(&cmd_prefix))
            .map(|c| c.to_string())
            .collect();
    }

    // 2. Path completion (for cat, ls, or cd)
    if parts.len() >= 1 && (parts[0] == "ls" || parts[0] == "cat" || parts[0] == "cd") {
        let last_word = if input.ends_with(' ') { "" } else { parts.last().unwrap_or(&"") };
        
        let mut search_dir = state.cwd.clone();
        let mut prefix = last_word.to_string();

        if last_word.contains('/') {
            let last_slash_idx = last_word.rfind('/').unwrap();
            let dir_part = &last_word[..last_slash_idx + 1];
            prefix = last_word[last_slash_idx + 1..].to_string();
            search_dir = fs::resolve_path(&state.cwd, dir_part);
        }

        if let Some(contents) = fs::get_directory_contents(&search_dir) {
            let last_slash_idx = last_word.rfind('/');
            let path_prefix = match last_slash_idx {
                Some(idx) => &last_word[..idx + 1],
                None => ""
            };

            let mut matches: Vec<String> = contents.into_iter()
                .filter(|s| s.starts_with(&prefix))
                .map(|s| format!("{}{}", path_prefix, s))
                .collect();

            // Special case for our dynamic contents in state
            if matches.is_empty() {
                if search_dir == "/posts" {
                    matches = state.posts.iter().filter(|p| p.slug.starts_with(&prefix)).map(|p| format!("{}{}", path_prefix, p.slug)).collect();
                } else if search_dir == "/pages" {
                    matches = state.pages.iter().filter(|p| p.slug.starts_with(&prefix)).map(|p| format!("{}{}", path_prefix, p.slug)).collect();
                } else if search_dir == "/tags" {
                    let tags: Vec<String> = state.posts.iter().flat_map(|p| p.tags.clone()).collect();
                    matches = tags.into_iter().filter(|t| t.starts_with(&prefix)).map(|t| format!("{}{}", path_prefix, t)).collect();
                    matches.sort();
                    matches.dedup();
                } else if search_dir == "/categories" {
                    let cats: Vec<String> = state.posts.iter().flat_map(|p| p.categories.clone()).collect();
                    matches = cats.into_iter().filter(|t| t.starts_with(&prefix)).map(|t| format!("{}{}", path_prefix, t)).collect();
                    matches.sort();
                    matches.dedup();
                }
            }

            return matches;
        }
    }

    vec![]
}
