pub fn handle() -> String {
    let help_text = vec![
        "Available commands (type 'man [cmd]' for deep info):",
        "  help       - Show available commands",
        "  ls [-l]    - List directory contents",
        "  cd [path]  - Change directory",
        "  cat [file] - Show file content",
        "  whoami     - Display system user info",
        "  bbs        - Launch the BBS interface",
        "  stats      - Display system statistics",
        "  uptime     - System availability timer",
        "  fortune    - Random node wisdom",
        "  cowsay     - Digital mascot ASCII art",
        "  weather    - Simulated weather report",
        "  top        - Display system processes",
        "  who        - List online users",
        "  social     - Social media connections",
        "  curl [url] - Download content from URL",
        "  date       - Show system date",
        "  clear      - Clear terminal screen",
        "  exit       - Terminate session",
    ];
    help_text.join("\n")
}
