use crate::state::SystemState;
use crate::WasmLine;

const BBS_WIDTH: usize = 80;

fn get_border(t: &str) -> String {
    let chars = match t {
        "top" => ('╔', '═', '╗'),
        "mid" => ('╠', '═', '╣'),
        "bot" => ('╚', '═', '╝'),
        "sep" => ('╟', '─', '╢'),
        _ => ('╟', '─', '╢'),
    };
    let border = chars.1.to_string().repeat(BBS_WIDTH - 2);
    format!("{}{}{}", chars.0, border, chars.2)
}

fn get_line(text: &str, align: &str) -> String {
    let content_width = BBS_WIDTH - 4;
    let text_len = text.chars().count();
    
    let line = if align == "center" {
        let total_padding = if content_width > text_len { content_width - text_len } else { 0 };
        let pad_left = total_padding / 2;
        let pad_right = total_padding - pad_left;
        format!("{}{}{}", " ".repeat(pad_left), text, " ".repeat(pad_right))
    } else {
        format!("{}{}", text, " ".repeat(if content_width > text_len { content_width - text_len } else { 0 }))
    };

    format!("║ {} ║", line)
}

fn wrap(text: String, line_type: &str) -> WasmLine {
    WasmLine { text, line_type: line_type.to_string() }
}

pub fn render_main_menu(state: &SystemState) -> Vec<WasmLine> {
    let mut out = Vec::new();
    out.push(wrap(get_border("top"), "bbs-border"));
    
    // TECNOTER.IO ANSI LOGO
    let logo = [
        " ████████╗███████╗ ██████╗███╗   ██╗ ██████╗ ████████╗███████╗██████╗      ██╗ ██████╗ ",
        " ╚══██╔══╝██╔════╝██╔════╝████╗  ██║██╔═══██╗╚══██╔══╝██╔════╝██╔══██╗     ╚═╝██╔═══██╗",
        "    ██║   █████╗  ██║     ██╔██╗ ██║██║   ██║   ██║   █████╗  ██████╔╝     ██╗██║   ██║ ",
        "    ██║   ██╔══╝  ██║     ██║╚██╗██║██║   ██║   ██║   ██╔══╝  ██╔══██╗     ██║██║   ██║ ",
        "    ██║   ███████╗╚██████╗██║ ╚████║╚██████╔╝   ██║   ███████╗██║  ██║  ██╗██║╚██████╔╝",
        "    ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═╝  ╚═╝╚═╝ ╚═════╝ ",
    ];

    for line in logo {
        out.push(wrap(get_line(line, "center"), "bbs-title"));
    }

    out.push(wrap(get_line("--- tecnoter.io Bulletin Board System ---", "center"), "bbs-header"));
    out.push(wrap(get_border("mid"), "bbs-border"));
    
    out.push(wrap(get_line(" AVAILABLE MODULES ", "center"), "bbs-header"));
    out.push(wrap(get_border("sep"), "bbs-border"));

    // Dynamic Pages Menu and Options
    let mut options = vec![
        ("[R]ead Posts".to_string(), "bbs-row-r".to_string(), "[C]ategories".to_string(), "bbs-row-c".to_string()),
    ];

    // Add pages in pairs
    let page_count = state.pages.len();
    for i in (0..page_count).step_by(2) {
        let p1 = &state.pages[i];
        let label1 = format!("[{}] {}", i + 1, p1.title);
        let action1 = format!("bbs-page-{}", p1.slug);
        
        if i + 1 < page_count {
            let p2 = &state.pages[i + 1];
            let label2 = format!("[{}] {}", i + 2, p2.title);
            let action2 = format!("bbs-page-{}", p2.slug);
            options.push((label1, action1, label2, action2));
        } else {
            options.push((label1, action1, "".to_string(), "".to_string()));
        }
    }
    
    options.push(("[S]ystem Stats".to_string(), "bbs-row-s".to_string(), "[Q]uit Shell".to_string(), "bbs-row-q".to_string()));

    for (t1, type1, t2, type2) in options {
        let row = if !t2.is_empty() {
             format!("{:<34} │ {:<34}", t1, t2)
        } else {
             format!("{:<34} │", t1)
        };
        out.push(wrap(get_line(&row, "left"), &format!("bbs-multi-row-{}__{}", type1, type2)));
    }

    out.push(wrap(get_border("mid"), "bbs-border"));
    out.push(wrap(get_line("COMMANDS: [R]ead, [C]ategories, [Q]uit, [1-N] Pages", "center"), "bbs-footer"));
    out.push(wrap(get_border("bot"), "bbs-border"));
    out
}

pub fn render_post_list(state: &SystemState) -> Vec<WasmLine> {
    let mut out = Vec::new();
    out.push(wrap(get_border("top"), "bbs-border"));
    
    let title = if state.cwd.starts_with("/categories/") {
        format!(" CHANNEL: CATEGORY - {} ", &state.cwd[12..].to_uppercase())
    } else if state.cwd.starts_with("/tags/") {
        format!(" CHANNEL: TAG - {} ", &state.cwd[6..].to_uppercase())
    } else {
        " CHANNEL 1: ALL POSTS ".to_string()
    };

    out.push(wrap(get_line(&title, "center"), "bbs-title"));
    out.push(wrap(get_border("mid"), "bbs-border"));
    
    let filtered_posts: Vec<_> = if state.cwd.starts_with("/categories/") {
        let cat = &state.cwd[12..];
        state.posts.iter().filter(|p| p.categories.contains(&cat.to_string())).collect()
    } else if state.cwd.starts_with("/tags/") {
        let tag = &state.cwd[6..];
        state.posts.iter().filter(|p| p.tags.contains(&tag.to_string())).collect()
    } else {
        state.posts.iter().collect()
    };

    if filtered_posts.is_empty() {
        out.push(wrap(get_line("No posts found in this area.", "center"), "regular"));
    } else {
        let half = (filtered_posts.len() + 1) / 2;
        for i in 0..half {
            let p1 = filtered_posts[i];
            let id1 = i + 1;
            let title1 = if p1.title.len() > 18 { format!("{}...", &p1.title[0..15]) } else { p1.title.clone() };
            let col1 = format!("{:2} {:8} {:18}", id1, p1.date, title1);

            let mut row = col1;

            if i + half < filtered_posts.len() {
                let p2 = filtered_posts[i + half];
                let id2 = i + half + 1;
                let title2 = if p2.title.len() > 18 { format!("{}...", &p2.title[0..15]) } else { p2.title.clone() };
                let col2 = format!("{:2} {:8} {:18}", id2, p2.date, title2);
                row = format!("{}  │  {}", row, col2);
            }

            out.push(wrap(get_line(&row, "left"), &format!("bbs-posts-row-{}", i)));
        }
    }

    out.push(wrap(get_border("mid"), "bbs-border"));
    out.push(wrap(get_line("COMMANDS: [M]ain Menu, [Q]uit, [C]ategories, [ID] to Read", "center"), "bbs-footer"));
    out.push(wrap(get_border("bot"), "bbs-border"));
    out
}

pub fn render_system_stats(state: &crate::state::SystemState) -> Vec<WasmLine> {
    let mut out = Vec::new();
    out.push(wrap(get_border("top"), "bbs-border"));
    out.push(wrap(get_line(" CHANNEL 4: SYSTEM STATISTICS ", "center"), "bbs-title"));
    out.push(wrap(get_border("mid"), "bbs-border"));
    out.push(wrap(get_line(&format!("Node Name: {}", state.system_info.node_name), "left"), "regular"));
    out.push(wrap(get_line(&format!("Software: TT-BBS v{} (Rust-Core)", state.version), "left"), "regular"));
    out.push(wrap(get_line(&format!("System Uptime: {}", state.system_info.uptime), "left"), "regular"));
    out.push(wrap(get_line("Total Calls: 84,291", "left"), "regular"));
    out.push(wrap(get_line("Total Users: 1,024", "left"), "regular"));
    out.push(wrap(get_line("Active Nodes: 4", "left"), "regular"));
    out.push(wrap(get_line(&format!("Current Load: {}", state.system_info.load_average), "left"), "regular"));
    out.push(wrap(get_border("mid"), "bbs-border"));
    out.push(wrap(get_line("Press any key to return...", "center"), "bbs-footer"));
    out.push(wrap(get_border("bot"), "bbs-border"));
    out
}

pub fn render_user_list() -> Vec<WasmLine> {
    let mut out = Vec::new();
    out.push(wrap(get_border("top"), "bbs-border"));
    out.push(wrap(get_line(" CHANNEL 5: CURRENTLY ONLINE USERS ", "center"), "bbs-title"));
    out.push(wrap(get_border("mid"), "bbs-border"));
    out.push(wrap(get_line(" NODE │ USERNAME     │ LOCATION       │ ACTION", "left"), "bbs-header"));
    out.push(wrap(get_border("sep"), "bbs-border"));
    out.push(wrap(get_line("  01  │ guest        │ Local          │ Reading Bulletins", "left"), "regular"));
    out.push(wrap(get_line("  02  │ sysop        │ Remote         │ Maintenance", "left"), "regular"));
    out.push(wrap(get_line("  03  │ wizard       │ Unknown        │ matrix", "left"), "regular"));
    out.push(wrap(get_line("  04  │ cyber_pioneer│ Seattle, WA    │ Composing Mail", "left"), "regular"));
    out.push(wrap(get_border("mid"), "bbs-border"));
    out.push(wrap(get_line("Press any key to return...", "center"), "bbs-footer"));
    out.push(wrap(get_border("bot"), "bbs-border"));
    out
}

pub fn render_bulletins() -> Vec<WasmLine> {
    let mut out = Vec::new();
    out.push(wrap(get_border("top"), "bbs-border"));
    out.push(wrap(get_line(" CHANNEL 2: SYSTEM BULLETINS ", "center"), "bbs-title"));
    out.push(wrap(get_border("mid"), "bbs-border"));
    out.push(wrap(get_line(" 1. 2026-01-01: Welcome to the New Year on tecnoter.io!", "left"), "regular"));
    out.push(wrap(get_line(" 2. 2026-01-02: System memory upgraded to 128GB.", "left"), "regular"));
    out.push(wrap(get_line(" 3. 2026-01-03: New ANSI art collection added.", "left"), "regular"));
    out.push(wrap(get_line(" 4. 2026-01-03: Mail routing issues resolved.", "left"), "regular"));
    out.push(wrap(get_border("mid"), "bbs-border"));
    out.push(wrap(get_line("Press any key to return...", "center"), "bbs-footer"));
    out.push(wrap(get_border("bot"), "bbs-border"));
    out
}

pub fn render_category_list(state: &SystemState) -> Vec<WasmLine> {
    let mut out = Vec::new();
    out.push(wrap(get_border("top"), "bbs-border"));
    out.push(wrap(get_line(" CHANNEL 3: MESSAGE AREAS (CATEGORIES) ", "center"), "bbs-title"));
    out.push(wrap(get_border("mid"), "bbs-border"));
    
    let mut cats: Vec<String> = state.posts.iter().flat_map(|p| p.categories.clone()).collect();
    cats.sort();
    cats.dedup();

    if cats.is_empty() {
        out.push(wrap(get_line("No categories found.", "center"), "regular"));
    } else {
        for (i, cat) in cats.iter().enumerate() {
            let label = format!("[{:2}] {}", i + 1, cat);
            out.push(wrap(get_line(&label, "left"), &format!("bbs-cat-row-{}", i)));
        }
    }

    out.push(wrap(get_border("mid"), "bbs-border"));
    out.push(wrap(get_line("COMMANDS: [M]ain Menu, [Q]uit, [ID] to Join Area", "center"), "bbs-footer"));
    out.push(wrap(get_border("bot"), "bbs-border"));
    out
}

pub fn render_help() -> Vec<WasmLine> {
    let mut out = Vec::new();
    out.push(wrap(get_border("top"), "bbs-border"));
    out.push(wrap(get_line("--- BBS COMMAND LIST ---", "center"), "bbs-header"));
    out.push(wrap(get_border("sep"), "bbs-border"));
    out.push(wrap(get_line("1-99 : Select a post by its ID", "left"), "regular"));
    out.push(wrap(get_line("N    : Read next post", "left"), "regular"));
    out.push(wrap(get_line("P    : Read previous post", "left"), "regular"));
    out.push(wrap(get_line("M    : Refresh/Show the main post menu", "left"), "regular"));
    out.push(wrap(get_line("Q    : Exit BBS and return to system prompt", "left"), "regular"));
    out.push(wrap(get_line("H / ? : Show this help message", "left"), "regular"));
    out.push(wrap(get_line("--- System commands work here too! ---", "center"), "bbs-footer"));
    out.push(wrap(get_border("bot"), "bbs-border"));
    out
}
