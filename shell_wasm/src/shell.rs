use crate::state::SystemState;
use crate::commands;
use crate::bbs;
use crate::WasmLine;

pub struct ProcessResult {
    pub lines: Vec<WasmLine>,
    pub next_state: SystemState,
    pub handled: bool,
}

impl ProcessResult {
    pub fn simple(text: String, next_state: SystemState) -> Self {
        Self {
            lines: vec![WasmLine { text, line_type: "regular".to_string() }],
            next_state,
            handled: true,
        }
    }
}

pub fn process_input(mut state: SystemState, input: &str) -> ProcessResult {
    let cmd_parts: Vec<&str> = input.split_whitespace().collect();
    
    // If in BBS_PAUSE, any input returns to BBS_MAIN or PROMPT
    if state.login_state == "BBS_PAUSE" {
        state.login_state = state.return_state.clone();
        if state.login_state == "BBS_MAIN" {
            return ProcessResult { lines: bbs::render_main_menu(&state), next_state: state, handled: true };
        }
        if state.login_state == "BBS_POSTS" {
            return ProcessResult { lines: bbs::render_post_list(&state), next_state: state, handled: true };
        }
        return ProcessResult { lines: vec![], next_state: state, handled: true };
    }

    if state.login_state == "PASSWORD" {
        // Simple fixed password for demo
        if input == "admin" || input == "password" || input == "tecnoter" {
            state.is_authenticated = true;
            state.login_state = "PROMPT".to_string();
            return ProcessResult {
                lines: vec![
                    WasmLine { text: "********".to_string(), line_type: "regular".to_string() },
                    WasmLine { text: "Authentication successful.".to_string(), line_type: "regular".to_string() },
                ],
                next_state: state,
                handled: true,
            };
        } else {
            state.login_state = "LOGIN".to_string();
            return ProcessResult {
                lines: vec![
                    WasmLine { text: "********".to_string(), line_type: "regular".to_string() },
                    WasmLine { text: "Login incorrect.".to_string(), line_type: "regular".to_string() },
                ],
                next_state: state,
                handled: true,
            };
        }
    }

    if state.login_state == "MAIL" {
        state.login_state = "PROMPT".to_string();
        state.mail_recipient = None;
        return ProcessResult::simple("Mail sent.".to_string(), state);
    }

    if state.login_state == "MESSAGE" {
        state.login_state = "PROMPT".to_string();
        return ProcessResult::simple("Message sent.".to_string(), state);
    }

    if cmd_parts.is_empty() {
        return ProcessResult {
            lines: vec![],
            next_state: state,
            handled: false,
        };
    }

    let cmd = cmd_parts[0].to_lowercase();

    // Internal commands
    if cmd.starts_with('_') {
        match cmd.as_str() {
            "_boot" => {
                state.login_state = "BOOT".to_string();
                return ProcessResult {
                    lines: vec![
                        WasmLine { text: "TECNOTER.IO(TM) CORE SYSTEM".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "LOADING SYSTEM MODULES...".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "NET_STACK: TCP/IP v6 READY".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "SSH_DAEMON: LISTENING ON PORT 22".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "HTTP_DAEMON: READY".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "CONNECTING TO TECNOTER NETWORK...".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "CARRIER 14400 / ARQ / V.32bis".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "CONNECT 14400/REL - CD 1".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "PROTOCOL: LAP-M".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "COMPRESSION: V.42bis".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "*** WELCOME TO THE TECNOTER.IO NODE ***".to_string(), line_type: "regular".to_string() },
                        WasmLine { text: "".to_string(), line_type: "regular".to_string() },
                    ],
                    next_state: state,
                    handled: true,
                };
            },
            "_start_login" => {
                state.login_state = "LOGIN".to_string();
                return ProcessResult {
                    lines: vec![],
                    next_state: state,
                    handled: true,
                };
            },
            "_login" => {
                let username = if cmd_parts.len() > 1 { cmd_parts[1].to_lowercase() } else { "".to_string() };
                if username == "guest" || username == "bbs" || username == "admin" {
                    state.current_user = username.clone();
                    if username == "admin" {
                         state.login_state = "PASSWORD".to_string();
                    } else if username == "bbs" {
                         state.is_authenticated = true;
                         state.login_state = "BBS_MAIN".to_string();
                    } else {
                         state.is_authenticated = true;
                         state.login_state = "PROMPT".to_string();
                    }
                    return ProcessResult {
                        lines: vec![
                            WasmLine { text: "\n--- ACCESS GRANTED ---".to_string(), line_type: "regular".to_string() },
                        ],
                        next_state: state,
                        handled: true,
                    };
                } else {
                    return ProcessResult {
                        lines: vec![
                            WasmLine { text: "Login incorrect.".to_string(), line_type: "regular".to_string() },
                        ],
                        next_state: state,
                        handled: true,
                    };
                }
            },
            "_read_internal" => {
                let slug = if cmd_parts.len() > 1 { cmd_parts[1] } else { "" };
                let mut lines = vec![];
                if let Some(post) = state.posts.iter().find(|p| p.slug == slug) {
                    lines.push(WasmLine { text: format!("Reading: {}", post.title.to_uppercase()), line_type: "bbs-title".to_string() });
                    lines.push(WasmLine { text: "-".repeat(40), line_type: "bbs-border".to_string() });
                }
                return ProcessResult {
                    lines,
                    next_state: state,
                    handled: true,
                };
            },
            "_suggest" => {
                let text = input.strip_prefix("_suggest ").unwrap_or("");
                if text.is_empty() {
                    return ProcessResult { lines: vec![], next_state: state, handled: true };
                }

                let mut suggestion = String::new();
                let commands = vec!["help", "ls", "whoami", "fortune", "cowsay", "uptime", "weather", "bbs", "cat", "mail", "msg", "message", "clear", "matrix", "ansi", "exit", "man", "top", "who", "ping", "social", "date", "motd", "curl", "cd"];
                
                // 1. Check commands
                for cmd in commands {
                    if cmd.starts_with(text) && cmd != text {
                        suggestion = cmd.to_string();
                        break;
                    }
                }

                // 2. Check files if it's "cat " or "ls "
                if suggestion.is_empty() {
                    if text.starts_with("cat ") || text.starts_with("ls ") {
                        let parts: Vec<&str> = text.split_whitespace().collect();
                        if parts.len() == 2 || (parts.len() == 1 && text.ends_with(' ')) {
                            let prefix = if parts.len() == 2 { parts[1] } else { "" };
                            let dir = crate::fs::get_directory_contents(&state.cwd).unwrap_or_default();
                            for entry in dir {
                                if entry.starts_with(prefix) {
                                    suggestion = format!("{} {}", parts[0], entry);
                                    break;
                                }
                            }
                            // Also check posts if in /posts or target starts with posts/
                            if suggestion.is_empty() {
                                for post in &state.posts {
                                    if post.slug.starts_with(prefix) {
                                        suggestion = format!("{} {}", parts[0], post.slug);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                return ProcessResult {
                    lines: vec![WasmLine { text: suggestion, line_type: "suggestion".to_string() }],
                    next_state: state,
                    handled: true,
                };
            },
            "_autocomplete" => {
                let text = input.strip_prefix("_autocomplete ").unwrap_or("");
                let matches = crate::completer::get_completions(&state, text);

                return ProcessResult {
                    lines: vec![WasmLine { text: matches.join(" "), line_type: "autocomplete-list".to_string() }],
                    next_state: state,
                    handled: true,
                };
            },
            _ => {}
        }
    }

    // BBS State Overrides
    if state.login_state.starts_with("BBS") {
         // Check for numeric choice first
         if let Ok(num) = cmd.parse::<usize>() {
            if num > 0 {
                if state.login_state == "BBS_MAIN" {
                    if num <= state.pages.len() {
                        let slug = &state.pages[num - 1].slug;
                        let output = commands::cat::handle(&state, vec![slug]);
                        state.return_state = "BBS_MAIN".to_string();
                        state.login_state = "BBS_PAUSE".to_string();
                        return ProcessResult::simple(output, state);
                    }
                } else if state.login_state == "BBS_POSTS" {
                    let filtered_posts: Vec<_> = if state.cwd.starts_with("/categories/") {
                        let cat = &state.cwd[12..];
                        state.posts.iter().filter(|p| p.categories.contains(&cat.to_string())).collect()
                    } else if state.cwd.starts_with("/tags/") {
                        let tag = &state.cwd[6..];
                        state.posts.iter().filter(|p| p.tags.contains(&tag.to_string())).collect()
                    } else {
                        state.posts.iter().collect()
                    };

                    if num <= filtered_posts.len() {
                        let post = filtered_posts[num - 1];
                        let output = commands::cat::handle(&state, vec![&post.slug]);
                        state.return_state = "BBS_MAIN".to_string();
                        state.login_state = "BBS_PAUSE".to_string();
                        return ProcessResult::simple(output, state);
                    }
                } else if state.login_state == "BBS_CATEGORIES" {
                    let mut cats: Vec<String> = state.posts.iter().flat_map(|p| p.categories.clone()).collect();
                    cats.sort();
                    cats.dedup();
                    if num <= cats.len() {
                        state.cwd = format!("/categories/{}", cats[num - 1]);
                        state.login_state = "BBS_POSTS".to_string();
                        return ProcessResult { lines: bbs::render_post_list(&state), next_state: state, handled: true };
                    }
                }
            }
         }

         match cmd.as_str() {
            "q" => {
                state.login_state = "PROMPT".to_string();
                return ProcessResult::simple("Returned to system shell.".to_string(), state);
            },
            "m" => {
                state.login_state = "BBS_MAIN".to_string();
                return ProcessResult { lines: bbs::render_main_menu(&state), next_state: state, handled: true };
            },
            "r" | "l" => {
                state.login_state = "BBS_POSTS".to_string();
                return ProcessResult { lines: bbs::render_post_list(&state), next_state: state, handled: true };
            },
            "s" => {
                state.return_state = "BBS_MAIN".to_string();
                state.login_state = "BBS_PAUSE".to_string();
                return ProcessResult { lines: bbs::render_system_stats(&state), next_state: state, handled: true };
            },
            "c" => {
                state.login_state = "BBS_CATEGORIES".to_string();
                return ProcessResult { lines: bbs::render_category_list(&state), next_state: state, handled: true };
            },
            "u" => {
                state.return_state = "BBS_MAIN".to_string();
                state.login_state = "BBS_PAUSE".to_string();
                return ProcessResult { lines: bbs::render_user_list(), next_state: state, handled: true };
            },
            "?" | "h" | "help" => {
                return ProcessResult { lines: bbs::render_help(), next_state: state, handled: true };
            },
            _ => {}
         }
    }

    // Standard Shell Commands (also work in BBS sometimes)
    match cmd.as_str() {
        "ping" => {
            ProcessResult::simple("PONG (WASM Core Online)".to_string(), state)
        },
        "help" => ProcessResult::simple(commands::help::handle(), state),
        "curl" => ProcessResult::simple(commands::curl::handle(&state, cmd_parts[1..].to_vec()), state),
        "ls" => ProcessResult::simple(commands::ls::handle(&state, cmd_parts[1..].to_vec()), state),
        "cd" => {
            let res = commands::cd::handle(&state, cmd_parts[1..].to_vec());
            state.cwd = res.new_path;
            ProcessResult::simple(res.message, state)
        },
        "whoami" => ProcessResult::simple(commands::whoami::handle(&state), state),
        "fortune" => {
            if state.login_state.starts_with("BBS") {
                state.return_state = "BBS_MAIN".to_string();
                state.login_state = "BBS_PAUSE".to_string();
            }
            ProcessResult::simple(commands::fortune::handle(&state), state)
        },
        "cowsay" => {
            if state.login_state.starts_with("BBS") {
                state.return_state = "BBS_MAIN".to_string();
                state.login_state = "BBS_PAUSE".to_string();
            }
            ProcessResult::simple(commands::cowsay::handle(), state)
        },
        "uptime" => {
            if state.login_state.starts_with("BBS") {
                state.return_state = "BBS_MAIN".to_string();
                state.login_state = "BBS_PAUSE".to_string();
            }
            ProcessResult::simple(commands::uptime::handle(&state), state)
        },
        "weather" | "climate" => {
            if state.login_state.starts_with("BBS") {
                state.return_state = "BBS_MAIN".to_string();
                state.login_state = "BBS_PAUSE".to_string();
            }
            ProcessResult::simple(commands::weather::handle(), state)
        },
        "bbs" => {
            if cmd_parts.len() > 1 {
                let sub_cmd = cmd_parts[1].to_lowercase();
                match sub_cmd.as_str() {
                    "r" | "l" => {
                        state.login_state = "BBS_POSTS".to_string();
                        return ProcessResult { lines: bbs::render_post_list(&state), next_state: state, handled: true };
                    },
                    "c" => {
                        state.login_state = "BBS_CATEGORIES".to_string();
                        return ProcessResult { lines: bbs::render_category_list(&state), next_state: state, handled: true };
                    },
                    "s" => {
                        state.return_state = "BBS_MAIN".to_string();
                        state.login_state = "BBS_PAUSE".to_string();
                        return ProcessResult { lines: bbs::render_system_stats(&state), next_state: state, handled: true };
                    },
                    "u" => {
                        state.return_state = "BBS_MAIN".to_string();
                        state.login_state = "BBS_PAUSE".to_string();
                        return ProcessResult { lines: bbs::render_user_list(), next_state: state, handled: true };
                    },
                    _ => {
                        state.login_state = "BBS_MAIN".to_string();
                        return ProcessResult { lines: bbs::render_main_menu(&state), next_state: state, handled: true };
                    }
                }
            }
            state.login_state = "BBS_MAIN".to_string();
            return ProcessResult { lines: bbs::render_main_menu(&state), next_state: state, handled: true };
        },
        "cat" => ProcessResult::simple(commands::cat::handle(&state, cmd_parts[1..].to_vec()), state),
        "mail" => {
            if cmd_parts.len() < 2 {
                return ProcessResult::simple("Usage: mail [username]".to_string(), state);
            }
            state.mail_recipient = Some(cmd_parts[1].to_string());
            state.login_state = "MAIL".to_string();
            ProcessResult {
                lines: vec![],
                next_state: state,
                handled: true,
            }
        },
        "msg" | "message" => {
            state.login_state = "MESSAGE".to_string();
            ProcessResult {
                lines: vec![],
                next_state: state,
                handled: true,
            }
        },
        "clear" => {
            ProcessResult {
                lines: vec![WasmLine { text: "".to_string(), line_type: "clearScreen".to_string() }],
                next_state: state,
                handled: true,
            }
        },
        "matrix" => {
            let mode = if cmd_parts.len() > 1 { cmd_parts[1] } else { "binary" };
            ProcessResult {
                lines: vec![WasmLine { text: format!("_MATRIX_{}", mode), line_type: "internalInstruction".to_string() }],
                next_state: state,
                handled: true,
            }
        },
        "ansi" => {
            ProcessResult {
                lines: vec![WasmLine { text: "ansi".to_string(), line_type: "internalInstruction".to_string() }],
                next_state: state,
                handled: true,
            }
        },
        "exit" => {
            ProcessResult {
                lines: vec![WasmLine { text: "exit".to_string(), line_type: "internalInstruction".to_string() }],
                next_state: state,
                handled: true,
            }
        },
        "man" => ProcessResult::simple(commands::man::handle(cmd_parts[1..].to_vec()), state),
        "top" => ProcessResult::simple(commands::top::handle(&state), state),
        "who" => ProcessResult::simple(commands::who::handle(&state), state),
        "date" => ProcessResult::simple(commands::date::handle(&state), state),
        "motd" => ProcessResult::simple(commands::motd::handle(&state), state),
        "social" => {
            let output = commands::social::handle(&state, cmd_parts[1..].to_vec());
            if output.starts_with("_OPEN_URL_") {
                let url = output.replace("_OPEN_URL_", "");
                return ProcessResult {
                    lines: vec![
                        WasmLine { text: format!("Opening uplink to {}...", url), line_type: "regular".to_string() },
                        WasmLine { text: output, line_type: "internalInstruction".to_string() }
                    ],
                    next_state: state,
                    handled: true,
                };
            }
            ProcessResult::simple(output, state)
        },
        _ => ProcessResult {
            lines: vec![],
            next_state: state,
            handled: false,
        }
    }
}
