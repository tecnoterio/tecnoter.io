use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct Post {
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub slug: String,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub date: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub categories: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub slug: String,
    #[serde(default)]
    pub url: String,
    #[serde(default)]
    pub date: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub categories: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Social {
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub url: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfo {
    #[serde(default)]
    pub uptime: String,
    #[serde(default, alias = "loadAverage")]
    pub load_average: String,
    #[serde(default, alias = "motdSuggestion")]
    pub motd_suggestion: String,
    #[serde(default, alias = "nodeName")]
    pub node_name: String,
    #[serde(default, alias = "currentDate")]
    pub current_date: String,
    #[serde(default)]
    pub bio: String,
}

impl Default for SystemInfo {
    fn default() -> Self {
        Self {
            uptime: "unknown".to_string(),
            load_average: "0.00".to_string(),
            motd_suggestion: "help".to_string(),
            node_name: "node".to_string(),
            current_date: "".to_string(),
            bio: "".to_string(),
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SystemState {
    pub cwd: String,
    pub current_user: String,
    pub login_state: String,
    #[serde(default)]
    pub posts: Vec<Post>,
    #[serde(default)]
    pub pages: Vec<Page>,
    #[serde(default)]
    pub socials: Vec<Social>,
    #[serde(default)]
    pub fortunes: Vec<String>,
    #[serde(default)]
    pub system_info: SystemInfo,
    pub version: String,
    pub return_state: String,
    #[serde(default)]
    pub booted: bool,
    #[serde(default)]
    pub is_authenticated: bool,
    #[serde(default)]
    pub debug_mode: bool,
    pub mail_recipient: Option<String>,
}

impl Default for SystemState {
    fn default() -> Self {
        Self {
            cwd: "/".to_string(),
            current_user: "guest".to_string(),
            login_state: "UNINITIALIZED".to_string(),
            posts: Vec::new(),
            pages: Vec::new(),
            socials: Vec::new(),
            fortunes: Vec::new(),
            system_info: SystemInfo::default(),
            version: "2.0.26-LNX".to_string(),
            return_state: "PROMPT".to_string(),
            booted: false,
            is_authenticated: false,
            debug_mode: false,
            mail_recipient: None,
        }
    }
}
