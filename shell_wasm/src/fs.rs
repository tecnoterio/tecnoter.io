pub fn get_directory_contents(path: &str) -> Option<Vec<&'static str>> {
    web_sys::console::log_1(&format!("fs: get_directory_contents input='{}'", path).into());
    match path {
        "/" => Some(vec!["posts", "pages", "tags", "categories"]),
        "/posts" | "/pages" | "/tags" | "/categories" => Some(vec![]),
        p if p.starts_with("/tags/") || p.starts_with("/categories/") => Some(vec![]),
        _ => None,
    }
}

pub fn resolve_path(current_cwd: &str, path: &str) -> String {
    if path.starts_with('/') {
        return path.to_string();
    }
    if path == ".." {
        return "/".to_string();
    }
    if path == "." || path.is_empty() {
        return current_cwd.to_string();
    }
    
    let mut new_path = if current_cwd == "/" {
        format!("/{}", path)
    } else {
        format!("{}/{}", current_cwd, path)
    };

    if new_path.ends_with('/') && new_path.len() > 1 {
        new_path.pop();
    }
    new_path
}
