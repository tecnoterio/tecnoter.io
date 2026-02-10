use crate::state::SystemState;
use crate::fs;

fn format_date(date_str: &str) -> String {
    let parts: Vec<&str> = date_str.split('-').collect();
    if parts.len() < 3 { return date_str.to_string(); }
    
    let year = parts[0];
    let month = match parts[1] {
        "01" => "Jan", "02" => "Feb", "03" => "Mar", "04" => "Apr",
        "05" => "May", "06" => "Jun", "07" => "Jul", "08" => "Aug",
        "09" => "Sep", "10" => "Oct", "11" => "Nov", "12" => "Dec",
        _ => parts[1]
    };
    let day = parts[2];
    
    format!("{} {} {}", month, day, year)
}

pub fn handle(state: &SystemState, args: Vec<&str>) -> String {
    let mut long_format = false;
    let mut target_path = state.cwd.clone();

    for arg in &args {
        if *arg == "-l" {
            long_format = true;
        } else if !arg.starts_with('-') {
            target_path = fs::resolve_path(&state.cwd, arg);
        }
    }

    if let Some(contents) = fs::get_directory_contents(&target_path) {
        web_sys::console::log_1(&format!("ls: target_path={} found in logic", target_path).into());
        let mut files: Vec<String> = contents.iter().map(|&s| s.to_string()).collect();
        if files.is_empty() {
            if target_path == "/posts" {
                files = state.posts.iter().map(|p| p.slug.clone()).collect();
                web_sys::console::log_1(&format!("ls: populated {} posts", files.len()).into());
            } else if target_path == "/pages" {
                files = state.pages.iter().map(|p| p.slug.clone()).collect();
                web_sys::console::log_1(&format!("ls: populated {} pages", files.len()).into());
            } else if target_path == "/tags" {
                let mut tags: Vec<String> = state.posts.iter().flat_map(|p| p.tags.clone()).collect();
                tags.extend(state.pages.iter().flat_map(|p| p.tags.clone()));
                tags.sort();
                tags.dedup();
                files = tags;
            } else if target_path == "/categories" {
                let mut cats: Vec<String> = state.posts.iter().flat_map(|p| p.categories.clone()).collect();
                cats.extend(state.pages.iter().flat_map(|p| p.categories.clone()));
                cats.sort();
                cats.dedup();
                files = cats;
            } else if target_path.starts_with("/tags/") {
                let tag = &target_path[6..];
                files = state.posts.iter().filter(|p| p.tags.contains(&tag.to_string())).map(|p| p.slug.clone()).collect();
                files.extend(state.pages.iter().filter(|p| p.tags.contains(&tag.to_string())).map(|p| p.slug.clone()).collect::<Vec<_>>());
            } else if target_path.starts_with("/categories/") {
                let cat = &target_path[12..];
                files = state.posts.iter().filter(|p| p.categories.contains(&cat.to_string())).map(|p| p.slug.clone()).collect();
                files.extend(state.pages.iter().filter(|p| p.categories.contains(&cat.to_string())).map(|p| p.slug.clone()).collect::<Vec<_>>());
            }
        }

        if long_format {
            let mut output = String::new();
            for file in files {
                let mut extra = String::new();
                let (perm, size, date_raw) = if target_path == "/posts" || target_path.starts_with("/tags/") || target_path.starts_with("/categories/") {
                    if let Some(post) = state.posts.iter().find(|p| p.slug == file) {
                        if !post.tags.is_empty() { extra.push_str(&format!(" [{}]", post.tags.join(","))); }
                        ("-rw-r--r--", "1228", post.date.as_str())
                    } else if let Some(page) = state.pages.iter().find(|p| p.slug == file) {
                        if !page.tags.is_empty() { extra.push_str(&format!(" [{}]", page.tags.join(","))); }
                        ("-rw-r--r--", "1024", page.date.as_str())
                    } else {
                        ("-rw-r--r--", "1024", "2026-01-01")
                    }
                } else if target_path == "/pages" {
                    if let Some(page) = state.pages.iter().find(|p| p.slug == file) {
                        if !page.tags.is_empty() { extra.push_str(&format!(" [{}]", page.tags.join(","))); }
                        ("-rw-r--r--", "1024", page.date.as_str())
                    } else {
                        ("-rw-r--r--", "1024", "2026-01-01")
                    }
                } else if file == "posts" || file == "pages" || file == "tags" || file == "categories" || target_path == "/tags" || target_path == "/categories" {
                    ("drwxr-xr-x", "4096", "2026-01-01")
                } else {
                    ("-rw-r--r--", "1024", "2026-01-01")
                };
                
                let date_fmt = format_date(date_raw);
                output.push_str(&format!("{} tecnoter staff {:>5} {} {}{}\n", 
                    perm, size, date_fmt, file, extra));
            }
            return output.trim_end().to_string();
        } else {
            return files.join("  ");
        }
    }

    format!("ls: cannot access '{}': No such directory", target_path)
}
